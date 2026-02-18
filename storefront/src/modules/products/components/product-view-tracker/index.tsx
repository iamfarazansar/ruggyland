"use client"

import { trackProductViewed } from "@lib/posthog/events"
import { trackMetaViewContent } from "@lib/meta-pixel/events"
import { useEffect } from "react"

export default function ProductViewTracker({
  product,
}: {
  product: {
    id: string
    title?: string
    handle?: string
    thumbnail?: string | null
  }
}) {
  useEffect(() => {
    trackProductViewed(product)
    trackMetaViewContent(product)
  }, [product.id])

  return null
}
