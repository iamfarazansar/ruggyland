import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { PRODUCT_INQUIRY_MODULE } from "../../modules/product-inquiry"
import ProductInquiryModuleService from "../../modules/product-inquiry/service"

type Input = {
  product_id?: string
  product_handle?: string
  product_title: string
  name: string
  email: string
  phone?: string
  message: string
}

export const createProductInquiryStep = createStep(
  "create-product-inquiry",
  async (input: Input, { container }) => {
    const inquiryService = container.resolve<ProductInquiryModuleService>(
      PRODUCT_INQUIRY_MODULE
    )

    const inquiry = await inquiryService.createProductInquiries(input)

    return new StepResponse(inquiry, inquiry.id)
  },
  async (id: string, { container }) => {
    const inquiryService = container.resolve<ProductInquiryModuleService>(
      PRODUCT_INQUIRY_MODULE
    )
    await inquiryService.deleteProductInquiries(id)
  }
)
