import { model } from "@medusajs/framework/utils";

/**
 * Manufacturing stages enum
 */
export const MANUFACTURING_STAGES = [
  "design_approved",
  "yarn_planning",
  "tufting",
  "trimming",
  "washing",
  "drying",
  "finishing",
  "qc",
  "packing",
  "ready_to_ship",
] as const;

export type ManufacturingStage = (typeof MANUFACTURING_STAGES)[number];

/**
 * Work Order statuses
 */
export const WORK_ORDER_STATUSES = [
  "pending",
  "in_progress",
  "on_hold",
  "completed",
  "cancelled",
] as const;

export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number];

/**
 * Priority levels
 */
export const PRIORITY_LEVELS = ["low", "normal", "high", "urgent"] as const;

export type PriorityLevel = (typeof PRIORITY_LEVELS)[number];

/**
 * WorkOrder model - One per rug (order item)
 */
export const WorkOrder = model.define("work_order", {
  id: model.id().primaryKey(),

  // Link to Medusa order and order item
  order_id: model.text(),
  order_item_id: model.text(),

  // Rug details (denormalized for quick access)
  title: model.text(),
  size: model.text().nullable(), // e.g., "5x7 ft"
  sku: model.text().nullable(),

  // Production tracking
  current_stage: model.text().default("design_approved"),
  status: model.text().default("pending"),
  priority: model.text().default("normal"),

  // Assignment
  assigned_to: model.text().nullable(), // artisan_id

  // Dates
  due_date: model.dateTime().nullable(),
  started_at: model.dateTime().nullable(),
  completed_at: model.dateTime().nullable(),

  // Notes
  notes: model.text().nullable(),

  // Metadata
  metadata: model.json().nullable(),
});
