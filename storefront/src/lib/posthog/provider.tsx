"use client"

import posthog from "posthog-js"
import { PostHogProvider as PHProvider } from "posthog-js/react"
import { useEffect } from "react"
import { useCookieConsent } from "@lib/context/cookie-consent"

export default function PostHogProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { categories } = useCookieConsent()

  useEffect(() => {
    if (typeof window === "undefined" || !process.env.NEXT_PUBLIC_POSTHOG_KEY)
      return

    if (categories.analytics) {
      if (!posthog.__loaded) {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
          api_host: "/ingest",
          ui_host: "https://us.posthog.com",
          capture_pageview: false,
          capture_pageleave: true,
        })
      } else {
        posthog.opt_in_capturing()
      }
    } else if (!categories.analytics && posthog.__loaded) {
      posthog.opt_out_capturing()
    }
  }, [categories.analytics])

  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    return <>{children}</>
  }

  return <PHProvider client={posthog}>{children}</PHProvider>
}
