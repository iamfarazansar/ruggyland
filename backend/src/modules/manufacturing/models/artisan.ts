import { model } from "@medusajs/framework/utils";

/**
 * Artisan model - Workers who handle manufacturing stages
 */
export const Artisan = model.define("artisan", {
  id: model.id().primaryKey(),

  // Basic info
  name: model.text(),
  email: model.text().nullable(),
  phone: model.text().nullable(),

  // Role/specialty
  role: model.text().nullable(), // e.g., "tufter", "finisher", "qc_inspector"
  specialties: model.json().nullable(), // Array of stages they can handle

  // Status
  active: model.boolean().default(true),

  // Performance metrics (optional)
  completed_orders: model.number().default(0),
  average_rating: model.number().nullable(),

  // Metadata
  metadata: model.json().nullable(),
});
