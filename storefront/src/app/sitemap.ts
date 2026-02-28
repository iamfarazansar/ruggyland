import { MetadataRoute } from "next"
import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getBaseURL } from "@lib/util/env"
import { REGIONS } from "@lib/seo/hreflang"

// Refresh sitemap every 24 hours
export const revalidate = 86400

const REGION_CODES = REGIONS.map((r) => r.countryCode)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseURL()

  // Static pages — one entry per region
  const staticPages: MetadataRoute.Sitemap = REGION_CODES.flatMap((region) => [
    {
      url: `${baseUrl}/${region}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: region === "us" ? 1.0 : 0.8,
    },
    {
      url: `${baseUrl}/${region}/store`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
  ])

  // Fetch all products
  let productPages: MetadataRoute.Sitemap = []
  try {
    const { products } = await sdk.client.fetch<{
      products: HttpTypes.StoreProduct[]
    }>("/store/products", {
      query: { limit: 1000, fields: "handle,updated_at" },
      next: { revalidate: 86400 },
    })

    productPages = REGION_CODES.flatMap((region) =>
      products.map((product) => ({
        url: `${baseUrl}/${region}/products/${product.handle}`,
        lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: region === "us" ? 0.8 : 0.6,
      }))
    )
  } catch (error) {
    console.error("Failed to fetch products for sitemap:", error)
  }

  // Fetch all categories
  let categoryPages: MetadataRoute.Sitemap = []
  try {
    const { product_categories } = await sdk.client.fetch<{
      product_categories: HttpTypes.StoreProductCategory[]
    }>("/store/product-categories", {
      query: { limit: 100, fields: "handle,updated_at" },
      next: { revalidate: 86400 },
    })

    categoryPages = REGION_CODES.flatMap((region) =>
      product_categories.map((category) => ({
        url: `${baseUrl}/${region}/categories/${category.handle}`,
        lastModified: category.updated_at ? new Date(category.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: region === "us" ? 0.7 : 0.5,
      }))
    )
  } catch (error) {
    console.error("Failed to fetch categories for sitemap:", error)
  }

  // Fetch all collections
  let collectionPages: MetadataRoute.Sitemap = []
  try {
    const { collections } = await sdk.client.fetch<{
      collections: HttpTypes.StoreCollection[]
    }>("/store/collections", {
      query: { limit: 100, fields: "handle,updated_at" },
      next: { revalidate: 86400 },
    })

    collectionPages = REGION_CODES.flatMap((region) =>
      collections.map((collection) => ({
        url: `${baseUrl}/${region}/collections/${collection.handle}`,
        lastModified: collection.updated_at ? new Date(collection.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: region === "us" ? 0.7 : 0.5,
      }))
    )
  } catch (error) {
    console.error("Failed to fetch collections for sitemap:", error)
  }

  return [...staticPages, ...productPages, ...categoryPages, ...collectionPages]
}
