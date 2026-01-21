import { model } from "@medusajs/framework/utils";

/**
 * WorkOrderStage model - Timeline history for each work order
 * Tracks when each stage started, completed, and by whom
 */
export const WorkOrderStage = model.define("work_order_stage", {
  id: model.id().primaryKey(),

  // Parent work order
  work_order_id: model.text(),

  // Stage info
  stage: model.text(), // e.g., "tufting", "washing", etc.
  status: model.text().default("pending"), // pending, active, completed, skipped

  // Timeline
  started_at: model.dateTime().nullable(),
  completed_at: model.dateTime().nullable(),

  // Assignment for this stage
  assigned_to: model.text().nullable(), // artisan_id

  // Notes specific to this stage
  notes: model.text().nullable(),

  // Quality metrics (optional)
  quality_score: model.number().nullable(),
  issues: model.json().nullable(), // Array of issues found

  // Metadata
  metadata: model.json().nullable(),
});
