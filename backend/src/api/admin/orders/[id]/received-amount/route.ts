import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";

/**
 * GET /admin/orders/:id/received-amount
 * Get the received INR amount for a foreign currency order
 */
export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    const query = req.scope.resolve("query");

    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "metadata", "currency_code", "total"],
      filters: { id },
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const order = orders[0];
    const receivedAmountInr = order.metadata?.received_amount_inr || null;

    return res.json({
      order_id: id,
      currency_code: order.currency_code,
      original_total: order.total,
      received_amount_inr: receivedAmountInr,
    });
  } catch (error: any) {
    console.error("Error getting received amount:", error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * POST /admin/orders/:id/received-amount
 * Set the received INR amount for a foreign currency order
 * Body: { received_amount_inr: number }
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const { id } = req.params;
    const { received_amount_inr } = req.body as { received_amount_inr: number };

    if (received_amount_inr === undefined || received_amount_inr === null) {
      return res.status(400).json({ error: "received_amount_inr is required" });
    }

    const query = req.scope.resolve("query");
    const orderModuleService = req.scope.resolve("order");

    // First get the current order to merge metadata
    const { data: orders } = await query.graph({
      entity: "order",
      fields: ["id", "metadata"],
      filters: { id },
    });

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    const existingMetadata = orders[0].metadata || {};

    // Update order metadata with received_amount_inr
    await orderModuleService.updateOrders(id, {
      metadata: {
        ...existingMetadata,
        received_amount_inr: received_amount_inr,
        received_amount_updated_at: new Date().toISOString(),
      },
    });

    return res.json({
      success: true,
      order_id: id,
      received_amount_inr: received_amount_inr,
    });
  } catch (error: any) {
    console.error("Error setting received amount:", error);
    return res.status(500).json({ error: error.message });
  }
}
