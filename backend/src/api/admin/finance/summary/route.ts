import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

/**
 * GET /admin/finance/summary - Get financial summary
 * Returns aggregated finance data: revenue, expenses, profit, unpaid amounts, etc.
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const financeService = req.scope.resolve("finance") as any;
    const rawMaterialsService = req.scope.resolve("raw_materials") as any;
    const manufacturingService = req.scope.resolve("manufacturing") as any;
    const query = req.scope.resolve("query");

    // Parse date range
    const { start_date, end_date } = req.query as {
      start_date?: string;
      end_date?: string;
    };

    const startDate = start_date ? new Date(start_date) : undefined;
    const endDate = end_date ? new Date(end_date) : undefined;

    // Get revenue from orders using Medusa Query
    // For INR orders: use order.total
    // For foreign currency orders: use metadata.received_amount_inr if set, else order.total
    let totalRevenue = 0;
    let orderCount = 0;
    let foreignCurrencyOrders = 0;
    let ordersWithReceivedAmount = 0;

    try {
      const { data: orders } = await query.graph({
        entity: "order",
        fields: [
          "id",
          "total",
          "status",
          "created_at",
          "currency_code",
          "metadata",
        ],
        filters: {
          status: { $in: ["completed", "pending", "archived"] },
        },
      });

      orders?.forEach((order: any) => {
        // Filter by date if provided
        if (startDate && new Date(order.created_at) < startDate) return;
        if (endDate && new Date(order.created_at) > endDate) return;

        let revenueAmount = order.total || 0;

        // For non-INR orders, check if received_amount_inr is set
        if (
          order.currency_code &&
          order.currency_code.toLowerCase() !== "inr"
        ) {
          foreignCurrencyOrders++;
          if (order.metadata?.received_amount_inr) {
            revenueAmount = order.metadata.received_amount_inr;
            ordersWithReceivedAmount++;
          }
        }

        totalRevenue += revenueAmount;
        orderCount++;
      });
    } catch (err) {
      console.error("Error fetching orders:", err);
    }

    // Get expenses by category from expense table
    const expensesByCategory = await financeService.getExpensesByCategory(
      startDate,
      endDate,
    );
    const manualExpenses = Object.values(expensesByCategory).reduce(
      (sum: number, val: any) => sum + val,
      0,
    );

    // Get unpaid expenses
    const unpaidExpenses = await financeService.getUnpaidExpenses();
    const totalUnpaidExpenses = unpaidExpenses.reduce(
      (sum: number, e: any) => sum + (e.amount || 0),
      0,
    );

    // Get ALL purchase orders to calculate paid and unpaid
    const allPurchaseOrders = await rawMaterialsService.listPurchaseOrders({});
    const unpaidPurchaseOrders = allPurchaseOrders.filter(
      (po: any) => po.paid_status !== "paid",
    );
    const paidPurchaseOrders = allPurchaseOrders.filter(
      (po: any) => po.paid_status === "paid",
    );
    const totalUnpaidPO = unpaidPurchaseOrders.reduce(
      (sum: number, po: any) => sum + (po.subtotal || 0),
      0,
    );
    const totalPaidPO = paidPurchaseOrders.reduce(
      (sum: number, po: any) => sum + (po.subtotal || 0),
      0,
    );

    // Get ALL artisan labor to calculate paid and unpaid
    const allArtisanAssignments =
      await manufacturingService.listWorkOrderArtisans({});
    const unpaidArtisans = allArtisanAssignments.filter(
      (a: any) => a.paid_status !== "paid",
    );
    const paidArtisans = allArtisanAssignments.filter(
      (a: any) => a.paid_status === "paid",
    );
    const totalUnpaidLabor = unpaidArtisans.reduce(
      (sum: number, a: any) => sum + (a.labor_cost || 0),
      0,
    );
    const totalPaidLabor = paidArtisans.reduce(
      (sum: number, a: any) => sum + (a.labor_cost || 0),
      0,
    );

    // Total expenses = manual expenses + paid POs + paid artisan labor
    const totalExpenses = manualExpenses + totalPaidPO + totalPaidLabor;

    // Calculate profit (Revenue - all expenses incurred)
    const grossProfit = totalRevenue - totalExpenses;
    const profitMargin =
      totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;

    return res.json({
      summary: {
        total_revenue: totalRevenue,
        order_count: orderCount,
        total_expenses: totalExpenses,
        manual_expenses: manualExpenses,
        paid_po_expenses: totalPaidPO,
        paid_labor_expenses: totalPaidLabor,
        gross_profit: grossProfit,
        profit_margin: profitMargin,
        expenses_by_category: expensesByCategory,
        unpaid_expenses: totalUnpaidExpenses,
        unpaid_purchase_orders: totalUnpaidPO,
        unpaid_labor: totalUnpaidLabor,
        total_unpaid: totalUnpaidExpenses + totalUnpaidPO + totalUnpaidLabor,
      },
      unpaid_purchase_orders: unpaidPurchaseOrders.slice(0, 10),
      unpaid_artisan_payments: unpaidArtisans.slice(0, 10),
      unpaid_expenses_list: unpaidExpenses.slice(0, 10),
    });
  } catch (error) {
    console.error("Error getting finance summary:", error);
    return res.status(500).json({ error: "Failed to get finance summary" });
  }
}
