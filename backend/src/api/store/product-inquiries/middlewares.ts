import { MiddlewareRoute, validateAndTransformBody } from "@medusajs/framework"
import { z } from "@medusajs/framework/zod"

export const CreateProductInquirySchema = z.object({
  product_id: z.string().optional(),
  product_handle: z.string().optional(),
  product_title: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(1),
})

export type CreateProductInquirySchema = z.infer<
  typeof CreateProductInquirySchema
>

export const productInquiryStoreMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/store/product-inquiries",
    method: "POST",
    middlewares: [validateAndTransformBody(CreateProductInquirySchema)],
  },
]
