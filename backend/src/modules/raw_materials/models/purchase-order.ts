import { model } from "@medusajs/framework/utils";

/**
 * Purchase Order statuses
 */
export const PO_STATUSES = [
  "draft", // Being created, not yet ordered
  "ordered", // Sent to supplier
  "partial", // Some items received
  "received", // All items received
  "cancelled", // Order cancelled
] as const;

export type POStatus = (typeof PO_STATUSES)[number];

/**
 * PurchaseOrder model - Orders to suppliers for materials
 */
export const PurchaseOrder = model.define("purchase_order", {
  id: model.id().primaryKey(),

  // Supplier
  supplier_id: model.text(),

  // Status
  status: model.text().default("draft"),

  // Dates
  order_date: model.dateTime().nullable(),
  expected_date: model.dateTime().nullable(),
  received_date: model.dateTime().nullable(),

  // Totals (calculated from items)
  subtotal: model.number().default(0),

  // Payment tracking
  paid_status: model.text().default("unpaid"), // unpaid, partial, paid
  paid_at: model.dateTime().nullable(),
  paid_amount: model.number().default(0),

  // Notes
  notes: model.text().nullable(),

  // Metadata
  metadata: model.json().nullable(),
});
