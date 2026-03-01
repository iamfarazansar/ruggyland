import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { createProductInquiryWorkflow } from "../../../workflows/create-product-inquiry"
import { CreateProductInquirySchema } from "./middlewares"

type WorkflowInput = {
  product_id?: string
  product_handle?: string
  product_title: string
  name: string
  email: string
  phone?: string
  message: string
}

export async function POST(
  req: MedusaRequest<CreateProductInquirySchema>,
  res: MedusaResponse
) {
  const { product_id, product_handle, product_title, name, email, phone, message } =
    req.validatedBody

  const { result } = await createProductInquiryWorkflow(req.scope).run({
    input: {
      product_id,
      product_handle,
      product_title: product_title as string,
      name: name as string,
      email: email as string,
      phone,
      message: message as string,
    } satisfies WorkflowInput,
  })

  return res.status(201).json({ inquiry: result })
}
