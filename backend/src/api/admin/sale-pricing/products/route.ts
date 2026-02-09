import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve("query")

  const { data: products } = await query.graph({
    entity: "product",
    fields: [
      "id",
      "title",
      "handle",
      "thumbnail",
      "status",
      "variants.id",
      "variants.title",
      "variants.sku",
      "variants.prices.id",
      "variants.prices.amount",
      "variants.prices.currency_code",
    ],
    filters: {
      status: "published",
    },
  })

  return res.json({
    products: products || [],
    count: products?.length || 0,
  })
}
