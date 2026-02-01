import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import RawMaterialsService from "../../../../../modules/raw_materials/service";
import { RAW_MATERIALS_MODULE } from "../../../../../modules/raw_materials";

/**
 * POST /admin/purchase-orders/:id/receive
 * Receive items from a purchase order and update inventory
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const rawMaterialsService: RawMaterialsService =
    req.scope.resolve(RAW_MATERIALS_MODULE);

  const { id } = req.params;
  const { items } = req.body as {
    items?: Array<{
      item_id: string;
      quantity_received: number;
    }>;
  };

  try {
    // Get the purchase order
    const purchaseOrder = await rawMaterialsService.retrievePurchaseOrder(id);
    if (!purchaseOrder) {
      res.status(404).json({ error: "Purchase order not found" });
      return;
    }

    if (purchaseOrder.status === "received") {
      res.status(400).json({ error: "Purchase order already fully received" });
      return;
    }

    if (purchaseOrder.status === "cancelled") {
      res
        .status(400)
        .json({ error: "Cannot receive cancelled purchase order" });
      return;
    }

    // Get all PO items
    const poItems = await rawMaterialsService.listPurchaseOrderItems({
      purchase_order_id: id,
    });

    // If no specific items provided, receive all remaining
    const receivingItems =
      items ||
      poItems.map((item: any) => ({
        item_id: item.id,
        quantity_received: item.quantity_ordered - item.quantity_received,
      }));

    // Process each item
    for (const receiving of receivingItems) {
      const poItem = poItems.find((item: any) => item.id === receiving.item_id);
      if (!poItem) continue;

      const qtyToReceive = receiving.quantity_received;
      if (qtyToReceive <= 0) continue;

      // Update inventory (add stock)
      await rawMaterialsService.adjustStock(
        poItem.material_id,
        qtyToReceive,
        "in",
        {
          reason: "purchase_order",
          notes: `Received from PO ${id}`,
        },
      );

      // Update item received quantity
      const newQtyReceived = (poItem.quantity_received || 0) + qtyToReceive;
      await rawMaterialsService.updatePurchaseOrderItems({
        id: poItem.id,
        quantity_received: newQtyReceived,
      });
    }

    // Check if all items are fully received
    const updatedItems = await rawMaterialsService.listPurchaseOrderItems({
      purchase_order_id: id,
    });

    const allReceived = updatedItems.every(
      (item: any) => item.quantity_received >= item.quantity_ordered,
    );
    const someReceived = updatedItems.some(
      (item: any) => item.quantity_received > 0,
    );

    // Update PO status
    let newStatus = purchaseOrder.status;
    if (allReceived) {
      newStatus = "received";
      await rawMaterialsService.updatePurchaseOrders({
        id,
        status: "received",
        received_date: new Date(),
      });
    } else if (someReceived && purchaseOrder.status !== "partial") {
      newStatus = "partial";
      await rawMaterialsService.updatePurchaseOrders({
        id,
        status: "partial",
      });
    }

    res.json({
      message: allReceived
        ? "Purchase order fully received"
        : "Items received successfully",
      status: newStatus,
      items_received: receivingItems.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
