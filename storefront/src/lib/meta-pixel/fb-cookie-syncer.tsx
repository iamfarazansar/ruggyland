"use client"

import { useEffect } from "react"
import { syncMetaCookiesToCart } from "@lib/data/meta-cookies"

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"))
  return match ? decodeURIComponent(match[2]) : null
}

export default function MetaFbCookieSyncer() {
  useEffect(() => {
    const fbc = getCookie("_fbc")
    const fbp = getCookie("_fbp")
    if (fbc || fbp) {
      syncMetaCookiesToCart(fbc, fbp)
    }
  }, [])

  return null
}
