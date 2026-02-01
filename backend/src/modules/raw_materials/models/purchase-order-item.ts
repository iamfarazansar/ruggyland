import { model } from "@medusajs/framework/utils";

/**
 * PurchaseOrderItem model - Line items in a purchase order
 */
export const PurchaseOrderItem = model.define("purchase_order_item", {
  id: model.id().primaryKey(),

  // Parent PO
  purchase_order_id: model.text(),

  // Material being ordered
  material_id: model.text(),

  // Quantities
  quantity_ordered: model.number().default(0),
  quantity_received: model.number().default(0),

  // Pricing
  unit_price: model.number().default(0),

  // Notes
  notes: model.text().nullable(),

  // Metadata
  metadata: model.json().nullable(),
});
