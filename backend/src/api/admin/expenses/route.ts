import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

/**
 * GET /admin/expenses - List all expenses
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const financeService = req.scope.resolve("finance") as any;

    // Parse query params for filtering
    const {
      category,
      paid_status,
      start_date,
      end_date,
      limit = 50,
      offset = 0,
    } = req.query as {
      category?: string;
      paid_status?: string;
      start_date?: string;
      end_date?: string;
      limit?: number;
      offset?: number;
    };

    const filters: any = {};
    if (category) filters.category = category;
    if (paid_status) filters.paid_status = paid_status;

    // Date range filter
    if (start_date || end_date) {
      filters.expense_date = {};
      if (start_date) filters.expense_date.$gte = new Date(start_date);
      if (end_date) filters.expense_date.$lte = new Date(end_date);
    }

    const expenses = await financeService.listExpenses(filters, {
      skip: Number(offset),
      take: Number(limit),
      order: { expense_date: "DESC" },
    });

    const count = await financeService.listExpenses(filters);

    // Calculate totals
    const totalAmount = expenses.reduce(
      (sum: number, e: any) => sum + (e.amount || 0),
      0,
    );
    const unpaidAmount = expenses
      .filter((e: any) => e.paid_status === "unpaid")
      .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

    return res.json({
      expenses,
      count: count.length,
      limit: Number(limit),
      offset: Number(offset),
      total_amount: totalAmount,
      unpaid_amount: unpaidAmount,
    });
  } catch (error) {
    console.error("Error listing expenses:", error);
    return res.status(500).json({ error: "Failed to list expenses" });
  }
}

/**
 * POST /admin/expenses - Create a new expense
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const financeService = req.scope.resolve("finance") as any;

    const {
      category,
      amount,
      currency = "INR",
      title,
      description,
      work_order_id,
      purchase_order_id,
      artisan_id,
      paid_status = "unpaid",
      expense_date,
      vendor,
      reference_number,
      metadata,
    } = req.body as {
      category: string;
      amount: number;
      currency?: string;
      title: string;
      description?: string;
      work_order_id?: string;
      purchase_order_id?: string;
      artisan_id?: string;
      paid_status?: string;
      expense_date: string;
      vendor?: string;
      reference_number?: string;
      metadata?: Record<string, any>;
    };

    // Validation
    if (!category || !amount || !title || !expense_date) {
      return res.status(400).json({
        error: "category, amount, title, and expense_date are required",
      });
    }

    const expense = await financeService.createExpenses({
      category,
      amount,
      currency,
      title,
      description,
      work_order_id,
      purchase_order_id,
      artisan_id,
      paid_status,
      expense_date: new Date(expense_date),
      vendor,
      reference_number,
      metadata,
    });

    return res.status(201).json({ expense });
  } catch (error) {
    console.error("Error creating expense:", error);
    return res.status(500).json({ error: "Failed to create expense" });
  }
}
