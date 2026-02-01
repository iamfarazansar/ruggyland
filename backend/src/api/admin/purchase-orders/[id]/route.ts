import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import RawMaterialsService from "../../../../modules/raw_materials/service";
import { RAW_MATERIALS_MODULE } from "../../../../modules/raw_materials";

/**
 * GET /admin/purchase-orders/:id
 * Get a single purchase order with items
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const rawMaterialsService: RawMaterialsService =
    req.scope.resolve(RAW_MATERIALS_MODULE);

  const { id } = req.params;

  try {
    const purchaseOrder = await rawMaterialsService.retrievePurchaseOrder(id);

    if (!purchaseOrder) {
      res.status(404).json({ error: "Purchase order not found" });
      return;
    }

    // Get items
    const items = await rawMaterialsService.listPurchaseOrderItems({
      purchase_order_id: id,
    });

    // Enrich items with material names
    const enrichedItems = await Promise.all(
      items.map(async (item: any) => {
        try {
          const material = await rawMaterialsService.retrieveMaterial(
            item.material_id,
          );
          return {
            ...item,
            material_name: material?.name || "Unknown",
            material_sku: material?.sku,
            material_unit: material?.unit,
          };
        } catch {
          return { ...item, material_name: "Unknown" };
        }
      }),
    );

    // Get supplier
    let supplier_name = "Unknown";
    try {
      const supplier = await rawMaterialsService.retrieveSupplier(
        purchaseOrder.supplier_id,
      );
      supplier_name = supplier?.name || "Unknown";
    } catch {}

    res.json({
      purchase_order: {
        ...purchaseOrder,
        supplier_name,
        items: enrichedItems,
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * PUT /admin/purchase-orders/:id
 * Update a purchase order (status, dates, notes, payment)
 */
export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const rawMaterialsService: RawMaterialsService =
    req.scope.resolve(RAW_MATERIALS_MODULE);

  const { id } = req.params;
  const {
    status,
    expected_date,
    notes,
    order_date,
    paid_status,
    paid_at,
    paid_amount,
  } = req.body as {
    status?: string;
    expected_date?: string;
    notes?: string;
    order_date?: string;
    paid_status?: string;
    paid_at?: string;
    paid_amount?: number;
  };

  try {
    const updates: any = { id };
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (expected_date) updates.expected_date = new Date(expected_date);
    if (order_date) updates.order_date = new Date(order_date);

    // Payment tracking
    if (paid_status) updates.paid_status = paid_status;
    if (paid_at) updates.paid_at = new Date(paid_at);
    if (paid_amount !== undefined) updates.paid_amount = paid_amount;

    // Auto-set paid_at when marking as fully paid
    if (paid_status === "paid" && !paid_at) {
      updates.paid_at = new Date();
    }

    // If marking as ordered, set order_date if not provided
    if (status === "ordered" && !order_date) {
      updates.order_date = new Date();
    }

    const purchaseOrder =
      await rawMaterialsService.updatePurchaseOrders(updates);

    res.json({ purchase_order: purchaseOrder });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * DELETE /admin/purchase-orders/:id
 * Delete a draft purchase order
 */
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const rawMaterialsService: RawMaterialsService =
    req.scope.resolve(RAW_MATERIALS_MODULE);

  const { id } = req.params;

  try {
    // Check if PO is draft
    const po = await rawMaterialsService.retrievePurchaseOrder(id);
    if (!po) {
      res.status(404).json({ error: "Purchase order not found" });
      return;
    }

    if (po.status !== "draft") {
      res.status(400).json({
        error: "Only draft purchase orders can be deleted",
      });
      return;
    }

    // Delete items first
    const items = await rawMaterialsService.listPurchaseOrderItems({
      purchase_order_id: id,
    });

    for (const item of items) {
      await rawMaterialsService.deletePurchaseOrderItems(item.id);
    }

    // Delete the PO
    await rawMaterialsService.deletePurchaseOrders(id);

    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
