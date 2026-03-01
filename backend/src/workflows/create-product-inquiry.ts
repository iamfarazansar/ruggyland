import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk"
import { createProductInquiryStep } from "./steps/create-product-inquiry"

type Input = {
  product_id?: string
  product_handle?: string
  product_title: string
  name: string
  email: string
  phone?: string
  message: string
}

export const createProductInquiryWorkflow = createWorkflow(
  "create-product-inquiry",
  function (input: Input) {
    const inquiry = createProductInquiryStep(input)
    return new WorkflowResponse(inquiry)
  }
)
