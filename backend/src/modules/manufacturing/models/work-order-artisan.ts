import { model } from "@medusajs/framework/utils";

/**
 * WorkOrderArtisan model - Assignment of artisans to work orders with labor costs
 */
export const WorkOrderArtisan = model.define("work_order_artisan", {
  id: model.id().primaryKey(),

  // Links
  work_order_id: model.text(),
  artisan_id: model.text(),

  // Role for this work order (e.g., tufting, finishing, qc)
  role: model.text().nullable(),

  // Custom labor cost for this rug (based on complexity)
  labor_cost: model.number().default(0),

  // Payment tracking
  paid_status: model.text().default("unpaid"), // unpaid, paid
  paid_at: model.dateTime().nullable(),

  // Notes (e.g., special instructions, complexity notes)
  notes: model.text().nullable(),

  // Status
  status: model.text().default("assigned"), // assigned, in_progress, completed

  // Dates
  started_at: model.dateTime().nullable(),
  completed_at: model.dateTime().nullable(),

  // Metadata
  metadata: model.json().nullable(),
});
