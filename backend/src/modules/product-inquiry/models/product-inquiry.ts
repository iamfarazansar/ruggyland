import { model } from "@medusajs/framework/utils"

export const ProductInquiry = model.define("product_inquiry", {
  id: model.id().primaryKey(),
  product_id: model.text().nullable(),
  product_handle: model.text().nullable(),
  product_title: model.text(),
  name: model.text(),
  email: model.text(),
  phone: model.text().nullable(),
  message: model.text(),
  status: model.text().default("new"),
})
