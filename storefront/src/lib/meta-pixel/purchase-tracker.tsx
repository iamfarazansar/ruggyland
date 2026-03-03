"use client"

import { useEffect } from "react"
import { HttpTypes } from "@medusajs/types"
import { trackMetaPurchase } from "./events"

export default function MetaPurchaseTracker({
  order,
}: {
  order: HttpTypes.StoreOrder
}) {
  useEffect(() => {
    const storageKey = `meta_purchase_tracked_${order.id}`
    if (sessionStorage.getItem(storageKey)) return
    sessionStorage.setItem(storageKey, "1")
    trackMetaPurchase({
      id: order.id,
      total: order.total ?? 0,
      currency_code: order.currency_code,
      items: order.items,
    })
  }, [order.id])

  return null
}
