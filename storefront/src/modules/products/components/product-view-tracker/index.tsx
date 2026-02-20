"use client"

import { trackProductViewed } from "@lib/posthog/events"
import { trackMetaViewContent } from "@lib/meta-pixel/events"
import { HttpTypes } from "@medusajs/types"
import { useEffect } from "react"

export default function ProductViewTracker({
  product,
}: {
  product: HttpTypes.StoreProduct
}) {
  useEffect(() => {
    trackProductViewed(product)
    trackMetaViewContent(product)
  }, [product.id])

  return null
}
