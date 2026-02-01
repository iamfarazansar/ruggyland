import { model } from "@medusajs/framework/utils";

/**
 * Material categories
 */
export const MATERIAL_CATEGORIES = [
  "yarn",
  "backing",
  "supplies",
  "tools",
  "chemicals",
] as const;

export type MaterialCategory = (typeof MATERIAL_CATEGORIES)[number];

/**
 * Units of measurement
 */
export const MATERIAL_UNITS = [
  "kg",
  "meters",
  "pieces",
  "liters",
  "rolls",
] as const;

export type MaterialUnit = (typeof MATERIAL_UNITS)[number];

/**
 * Material model - Raw materials inventory
 */
export const Material = model.define("material", {
  id: model.id().primaryKey(),

  // Basic info
  name: model.text(),
  sku: model.text().nullable(),
  description: model.text().nullable(),

  // Category and unit
  category: model.text(), // yarn, backing, supplies, tools, chemicals
  unit: model.text(), // kg, meters, pieces, liters, rolls

  // Stock levels
  current_stock: model.number().default(0),
  min_stock_level: model.number().default(0), // Alert threshold

  // Cost
  cost_per_unit: model.number().default(0),

  // For yarn specifically
  color: model.text().nullable(),
  weight_type: model.text().nullable(), // fine, medium, bulky

  // Supplier link
  supplier_id: model.text().nullable(),

  // Status
  is_active: model.boolean().default(true),

  // Metadata
  metadata: model.json().nullable(),
});
