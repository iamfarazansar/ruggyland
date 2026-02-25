"use client"

import { useCookieConsent } from "@lib/context/cookie-consent"

export default function CookieSettingsButton() {
  const { resetConsent } = useCookieConsent()

  return (
    <button
      onClick={resetConsent}
      className="text-[12px] text-white/[0.5] hover:text-white cursor-pointer"
    >
      Cookie Settings
    </button>
  )
}
