import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { PRODUCT_INQUIRY_MODULE } from "../../../modules/product-inquiry"
import ProductInquiryModuleService from "../../../modules/product-inquiry/service"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const inquiryService = req.scope.resolve<ProductInquiryModuleService>(
    PRODUCT_INQUIRY_MODULE
  )

  const limit = Number(req.query.limit ?? 50)
  const offset = Number(req.query.offset ?? 0)
  const product_id = req.query.product_id as string | undefined

  const filters: Record<string, unknown> = {}
  if (product_id) filters.product_id = product_id

  const [inquiries, count] = await inquiryService.listAndCountProductInquiries(
    filters,
    { take: limit, skip: offset, order: { created_at: "DESC" } }
  )

  return res.json({ inquiries, count, limit, offset })
}
