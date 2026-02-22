import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { Modules } from "@medusajs/framework/utils"

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const { id } = req.params
  const query = req.scope.resolve("query")
  const pricingModule = req.scope.resolve(Modules.PRICING)

  try {
    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "handle",
        "description",
        "status",
        "thumbnail",
        "variants.*",
        "variants.prices.*",
      ],
      filters: { id },
    })

    if (!products || products.length === 0) {
      return res.status(404).json({ message: "Product not found" })
    }

    const product = products[0]

    // Collect all price IDs to fetch their rules
    const allPriceIds: string[] = []
    product.variants?.forEach((variant: any) => {
      variant.prices?.forEach((price: any) => {
        if (price.id) {
          allPriceIds.push(price.id)
        }
      })
    })

    // Fetch price rules for all prices to get region_id associations
    let priceRulesMap = new Map<string, Record<string, string>>()
    let regionIds = new Set<string>()

    if (allPriceIds.length > 0) {
      const priceRules = await pricingModule.listPriceRules(
        { price_id: allPriceIds },
        { take: 1000 }
      )

      // Build a map: price_id -> { region_id: string }
      for (const rule of priceRules) {
        const priceId = rule.price_id
        if (rule.attribute === "region_id") {
          if (!priceRulesMap.has(priceId)) {
            priceRulesMap.set(priceId, {})
          }
          priceRulesMap.get(priceId)![rule.attribute] = rule.value
          regionIds.add(rule.value)
        }
      }
    }

    // Fetch regions to get region names
    let regionsMap = new Map<string, any>()
    if (regionIds.size > 0) {
      const { data: regions } = await query.graph({
        entity: "region",
        fields: ["id", "name", "currency_code"],
        filters: { id: Array.from(regionIds) },
      })

      regions.forEach((region: any) => {
        regionsMap.set(region.id, region)
      })
    }

    // Build price contexts (currency + region combinations)
    const priceContextsSet = new Set<string>()
    const priceContexts: Array<{
      key: string
      currency_code: string
      region_id?: string
      region_name?: string
    }> = []

    product.variants?.forEach((variant: any) => {
      variant.prices?.forEach((price: any) => {
        const rules = priceRulesMap.get(price.id) || {}
        const regionId = rules.region_id
        const region = regionId ? regionsMap.get(regionId) : null

        // Create a unique key for this price context
        const key = regionId
          ? `${price.currency_code}|${regionId}`
          : `${price.currency_code}|base`

        if (!priceContextsSet.has(key)) {
          priceContextsSet.add(key)
          priceContexts.push({
            key,
            currency_code: price.currency_code,
            region_id: regionId,
            region_name: region?.name,
          })
        }
      })
    })

    // Sort price contexts: base prices first, then by currency and region
    priceContexts.sort((a, b) => {
      if (!a.region_id && b.region_id) return -1
      if (a.region_id && !b.region_id) return 1
      const currCompare = a.currency_code.localeCompare(b.currency_code)
      if (currCompare !== 0) return currCompare
      return (a.region_name || "").localeCompare(b.region_name || "")
    })

    // Enhance variant prices with region information
    const enhancedVariants = product.variants?.map((variant: any) => ({
      ...variant,
      prices: variant.prices?.map((price: any) => {
        const rules = priceRulesMap.get(price.id) || {}
        const regionId = rules.region_id
        const region = regionId ? regionsMap.get(regionId) : null

        return {
          ...price,
          region_id: regionId,
          region_name: region?.name,
          context_key: regionId
            ? `${price.currency_code}|${regionId}`
            : `${price.currency_code}|base`,
        }
      }),
    }))

    return res.json({
      product: {
        id: product.id,
        title: product.title,
        handle: product.handle,
        description: product.description,
        status: product.status,
        thumbnail: product.thumbnail,
      },
      variants: enhancedVariants || [],
      priceContexts,
    })
  } catch (error) {
    console.error("Error fetching product variants pricing:", error)
    return res.status(500).json({
      message: "Failed to fetch product details",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
