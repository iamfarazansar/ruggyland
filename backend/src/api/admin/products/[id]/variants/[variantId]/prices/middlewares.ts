import { MiddlewareRoute, validateAndTransformBody } from "@medusajs/framework"
import { z } from "@medusajs/framework/zod"

export const UpdateVariantPricesSchema = z.object({
  prices: z.array(
    z.object({
      id: z.string().optional(),  // Optional for new prices
      currency_code: z.string(),
      region_id: z.string().optional(),
      amount: z.number().int().min(0),
    })
  ),
})

export type UpdateVariantPricesSchema = z.infer<typeof UpdateVariantPricesSchema>

export const updateVariantPricesMiddlewares: MiddlewareRoute[] = [
  {
    matcher: "/admin/products/:id/variants/:variantId/prices",
    method: "POST",
    middlewares: [validateAndTransformBody(UpdateVariantPricesSchema)],
  },
]
