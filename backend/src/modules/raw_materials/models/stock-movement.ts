import { model } from "@medusajs/framework/utils";

/**
 * Movement types
 */
export const MOVEMENT_TYPES = [
  "in", // Stock added (purchase, return)
  "out", // Stock consumed (production, waste)
  "adjust", // Manual adjustment (inventory count correction)
] as const;

export type MovementType = (typeof MOVEMENT_TYPES)[number];

/**
 * StockMovement model - Track all inventory changes
 */
export const StockMovement = model.define("stock_movement", {
  id: model.id().primaryKey(),

  // Link to material
  material_id: model.text(),

  // Movement details
  type: model.text(), // in, out, adjust
  quantity: model.number(),

  // Reason/notes
  reason: model.text().nullable(), // e.g., "purchase", "work_order_consumption", "damaged"
  notes: model.text().nullable(),

  // Link to work order (if consumed for production)
  work_order_id: model.text().nullable(),

  // Who made the change
  created_by: model.text().nullable(),

  // Stock levels at time of movement
  stock_before: model.number().default(0),
  stock_after: model.number().default(0),

  // Metadata
  metadata: model.json().nullable(),
});
