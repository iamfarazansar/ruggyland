import { model } from "@medusajs/framework/utils";

/**
 * Expense categories
 */
export const EXPENSE_CATEGORIES = [
  "materials",
  "labor",
  "overhead",
  "shipping",
  "utilities",
  "equipment",
  "other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

/**
 * Expense model - Track all business expenses
 */
export const Expense = model.define("expense", {
  id: model.id().primaryKey(),

  // Category
  category: model.text(), // materials, labor, overhead, shipping, utilities, equipment, other

  // Amount
  amount: model.number().default(0),
  currency: model.text().default("INR"),

  // Description
  title: model.text(),
  description: model.text().nullable(),

  // Links (optional - for tracking related entities)
  work_order_id: model.text().nullable(),
  purchase_order_id: model.text().nullable(),
  artisan_id: model.text().nullable(),

  // Payment status
  paid_status: model.text().default("unpaid"), // unpaid, paid
  paid_at: model.dateTime().nullable(),

  // Expense date (when the expense occurred)
  expense_date: model.dateTime(),

  // Vendor/payee
  vendor: model.text().nullable(),

  // Receipt/invoice reference
  reference_number: model.text().nullable(),

  // Created by
  created_by: model.text().nullable(),

  // Metadata
  metadata: model.json().nullable(),
});
