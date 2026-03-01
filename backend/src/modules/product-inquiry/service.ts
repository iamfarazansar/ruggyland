import { MedusaService } from "@medusajs/framework/utils"
import { ProductInquiry } from "./models/product-inquiry"

class ProductInquiryModuleService extends MedusaService({
  ProductInquiry,
}) {}

export default ProductInquiryModuleService
