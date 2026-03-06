import { MetadataRoute } from "next"
import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getBaseURL } from "@lib/util/env"
import { INDEXED_REGIONS } from "@lib/seo/hreflang"

// Refresh sitemap every 24 hours
export const revalidate = 86400

const REGION_CODES = INDEXED_REGIONS

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseURL()

  // Static pages — one entry per region
  const staticPaths = [
    "", // homepage
    "/store",
    "/about-us",
    "/contact-us",
    "/sustainability",
    "/custom-rugs",
    "/privacy-policy",
    "/terms-of-service",
    "/cancellation-refund-policy",
    "/shipping-return-policy",
    "/payment-options",
  ]

  const staticPages: MetadataRoute.Sitemap = REGION_CODES.flatMap((region) =>
    staticPaths.map((path) => ({
      url: `${baseUrl}/${region}${path}`,
      lastModified: new Date(),
      changeFrequency: (path === "" || path === "/store"
        ? "daily"
        : "monthly") as "daily" | "monthly",
      priority:
        path === ""
          ? region === "us"
            ? 1.0
            : 0.8
          : path === "/store"
          ? 0.9
          : 0.4,
    }))
  )

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
        lastModified: product.updated_at
          ? new Date(product.updated_at)
          : new Date(),
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
        lastModified: category.updated_at
          ? new Date(category.updated_at)
          : new Date(),
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
        lastModified: collection.updated_at
          ? new Date(collection.updated_at)
          : new Date(),
        changeFrequency: "weekly" as const,
        priority: region === "us" ? 0.7 : 0.5,
      }))
    )
  } catch (error) {
    console.error("Failed to fetch collections for sitemap:", error)
  }

  return [...staticPages, ...productPages, ...categoryPages, ...collectionPages]
}
