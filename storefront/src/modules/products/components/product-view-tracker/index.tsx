"use client"

import { trackProductViewed } from "@lib/posthog/events"
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
  }, [product.id])

  return null
}
