import { Module } from "@medusajs/framework/utils"
import ProductInquiryModuleService from "./service"

export const PRODUCT_INQUIRY_MODULE = "productInquiry"

export default Module(PRODUCT_INQUIRY_MODULE, {
  service: ProductInquiryModuleService,
})
