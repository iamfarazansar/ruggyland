import { model } from "@medusajs/framework/utils";

export const CustomRugRequest = model.define("custom_rug_request", {
  id: model.id().primaryKey(),

  // optional idempotency key (we'll enforce uniqueness in Postgres via index)
  client_request_id: model.text().nullable(),

  name: model.text(),
  email: model.text(),
  phone: model.text().nullable(),

  width: model.number(),
  height: model.number(),
  unit: model.text(),
  shape: model.text(),

  budgetMin: model.number().nullable(),
  budgetMax: model.number().nullable(),
  currency: model.text().default("USD"),

  notes: model.text().nullable(),
  referenceImages: model.json().nullable(),

  status: model.text().default("new"),
});
