"use client"

import { useEffect } from "react"
import { identifyCustomer } from "./events"

type Props = {
  customer: {
    id: string
    email: string
    first_name?: string | null
    last_name?: string | null
  } | null
}

export default function PostHogIdentify({ customer }: Props) {
  useEffect(() => {
    if (customer) {
      identifyCustomer(customer)
    }
  }, [customer])

  return null
}
