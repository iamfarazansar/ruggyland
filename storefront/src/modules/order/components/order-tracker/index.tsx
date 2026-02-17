"use client"

import { trackOrderCompleted } from "@lib/posthog/events"
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
  }, [order.id])

  return null
}
