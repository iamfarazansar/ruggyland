import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import ManufacturingService from "../../../../../modules/manufacturing/service";
import { MANUFACTURING_MODULE } from "../../../../../modules/manufacturing";
import { Modules } from "@medusajs/framework/utils";

/**
 * POST /admin/work-orders/from-order/:orderId
 * Auto-create work orders for each item in an order
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const manufacturingService: ManufacturingService =
    req.scope.resolve(MANUFACTURING_MODULE);

  const orderService = req.scope.resolve(Modules.ORDER);

  const { orderId } = req.params;
  const { priority = "normal" } = req.body as { priority?: string };

  try {
    // Get the order with items - use simpler relations to avoid MikroORM issues
    const order = await orderService.retrieveOrder(orderId, {
      relations: ["items"],
    });

    if (!order) {
      res.status(404).json({ message: "Order not found" });
      return;
    }

    // Check if work orders already exist for this order
    const existingWorkOrders = await manufacturingService.listWorkOrders({
      order_id: orderId,
    });

    if (existingWorkOrders.length > 0) {
      res.status(400).json({
        message: "Work orders already exist for this order",
        existing_count: existingWorkOrders.length,
        work_orders: existingWorkOrders,
      });
      return;
    }

    // Create a work order for each item
    const workOrders = [];

    for (const item of order.items as any[]) {
      const title = item.title || item.product_title || "Rug";
      const sku = item.variant_sku || null;

      // Extract size from variant title if available (e.g., "5x7 ft")
      let size = null;
      if (item.variant_title) {
        size = item.variant_title;
      }

      // Create work order for each quantity
      for (let i = 0; i < item.quantity; i++) {
        const workOrder = await manufacturingService.createWorkOrders({
          order_id: orderId,
          order_item_id: item.id,
          title:
            item.quantity > 1 ? `${title} (${i + 1}/${item.quantity})` : title,
          size,
          sku,
          thumbnail: item.thumbnail || null, // Store product thumbnail
          priority,
          current_stage: "design_approved",
          status: "pending",
        });

        // Create initial stage record
        await manufacturingService.createWorkOrderStages({
          work_order_id: workOrder.id,
          stage: "design_approved",
          status: "active",
          started_at: new Date(),
        });

        workOrders.push(workOrder);
      }
    }

    res.status(201).json({
      message: `Created ${workOrders.length} work order(s) from order`,
      order_id: orderId,
      work_orders: workOrders,
    });
  } catch (error: any) {
    console.error("Error creating work orders from order:", error);
    res.status(500).json({
      message: error.message || "Failed to create work orders",
      error: error.toString(),
    });
  }
}
