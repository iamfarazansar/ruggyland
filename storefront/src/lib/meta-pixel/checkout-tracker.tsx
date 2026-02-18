"use client"

import { useEffect } from "react"
import { trackMetaInitiateCheckout } from "./events"

export default function MetaCheckoutTracker({
  cart,
}: {
  cart: {
    id: string
    items?: any[]
    total?: number
    currency_code?: string
  }
}) {
  useEffect(() => {
    trackMetaInitiateCheckout(cart)
  }, [cart.id])

  return null
}
