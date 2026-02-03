import { MetadataRoute } from "next"
import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { getBaseURL } from "@lib/util/env"

// Refresh sitemap every 24 hours
export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseURL()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/store`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ]

  // Fetch all products
  let productPages: MetadataRoute.Sitemap = []
  try {
    const { products } = await sdk.client.fetch<{
      products: HttpTypes.StoreProduct[]
    }>("/store/products", {
      query: {
        limit: 1000,
        fields: "handle,updated_at",
      },
      next: {
        revalidate: 86400,
      },
    })

    productPages = products.map((product) => ({
      url: `${baseUrl}/products/${product.handle}`,
      lastModified: product.updated_at
        ? new Date(product.updated_at)
        : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error("Failed to fetch products for sitemap:", error)
  }

  // Fetch all categories
  let categoryPages: MetadataRoute.Sitemap = []
  try {
    const { product_categories } = await sdk.client.fetch<{
      product_categories: HttpTypes.StoreProductCategory[]
    }>("/store/product-categories", {
      query: {
        limit: 100,
        fields: "handle,updated_at",
      },
      next: {
        revalidate: 86400,
      },
    })

    categoryPages = product_categories.map((category) => ({
      url: `${baseUrl}/categories/${category.handle}`,
      lastModified: category.updated_at
        ? new Date(category.updated_at)
        : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error("Failed to fetch categories for sitemap:", error)
  }

  // Fetch all collections
  let collectionPages: MetadataRoute.Sitemap = []
  try {
    const { collections } = await sdk.client.fetch<{
      collections: HttpTypes.StoreCollection[]
    }>("/store/collections", {
      query: {
        limit: 100,
        fields: "handle,updated_at",
      },
      next: {
        revalidate: 86400,
      },
    })

    collectionPages = collections.map((collection) => ({
      url: `${baseUrl}/collections/${collection.handle}`,
      lastModified: collection.updated_at
        ? new Date(collection.updated_at)
        : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error("Failed to fetch collections for sitemap:", error)
  }

  return [...staticPages, ...productPages, ...categoryPages, ...collectionPages]
}
