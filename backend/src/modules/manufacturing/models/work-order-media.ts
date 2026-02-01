import { model } from "@medusajs/framework/utils";

/**
 * WorkOrderMedia model - Photos and files attached to work orders
 * Can be linked to specific stages or general work order files
 */
export const WorkOrderMedia = model.define("work_order_media", {
  id: model.id().primaryKey(),

  // Parent work order
  work_order_id: model.text(),

  // Optional stage association
  stage_id: model.text().nullable(), // work_order_stage_id

  // Media info
  url: model.text(), // S3/MinIO URL
  type: model.text().default("image"), // image, video, file
  category: model.text().default("reference"), // cad, reference, progress, qc
  caption: model.text().nullable(),

  // Upload info
  uploaded_by: model.text().nullable(), // user_id or artisan_id
  uploaded_at: model.dateTime().nullable(),

  // Metadata
  metadata: model.json().nullable(),
});
