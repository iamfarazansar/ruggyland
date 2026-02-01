import { model } from "@medusajs/framework/utils";

/**
 * Supplier model - Vendors for raw materials
 */
export const Supplier = model.define("supplier", {
  id: model.id().primaryKey(),

  // Basic info
  name: model.text(),
  contact_person: model.text().nullable(),
  email: model.text().nullable(),
  phone: model.text().nullable(),

  // Address
  address: model.text().nullable(),
  city: model.text().nullable(),
  country: model.text().nullable(),

  // Notes
  notes: model.text().nullable(),

  // Status
  is_active: model.boolean().default(true),

  // Metadata
  metadata: model.json().nullable(),
});
