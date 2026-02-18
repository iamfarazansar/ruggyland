"use client"

import { trackOrderCompleted } from "@lib/posthog/events"
import { trackMetaPurchase } from "@lib/meta-pixel/events"
import { useEffect } from "react"

export default function OrderTracker({
  order,
}: {
  order: {
    id: string
    total?: number
    currency_code?: string
    items?: any[]
  }
}) {
  useEffect(() => {
    trackOrderCompleted(order)
    trackMetaPurchase(order)
  }, [order.id])

  return null
}
