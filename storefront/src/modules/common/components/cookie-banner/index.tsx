"use client"

import { useState, useEffect } from "react"
import { useCookieConsent, CookieCategories } from "@lib/context/cookie-consent"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

// Countries where cookie consent is NOT required — auto-accept
const SKIP_CONSENT_COUNTRIES = ["in", "us"]

export default function CookieBanner() {
  const { loaded, status, acceptAll, rejectAll, savePreferences } =
    useCookieConsent()
  const [showDetails, setShowDetails] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [marketing, setMarketing] = useState(true)

  // Auto-accept cookies for countries that don't require consent
  useEffect(() => {
    if (!loaded || status !== "undecided") return
    const countryCode = window.location.pathname.split("/")[1]?.toLowerCase()
    if (SKIP_CONSENT_COUNTRIES.includes(countryCode)) {
      acceptAll()
    }
  }, [loaded, status, acceptAll])

  if (!loaded || status !== "undecided") return null

  const handleSave = () => {
    savePreferences({ analytics, marketing })
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6 pointer-events-none">
      <div className="mx-auto max-w-lg pointer-events-auto rounded-2xl bg-white shadow-[0_4px_30px_rgba(0,0,0,0.15)] border border-gray-200 p-5 sm:p-6">
        <p className="text-sm text-ui-fg-subtle leading-relaxed">
          We use cookies to improve your experience. You can choose which types
          to allow. See our{" "}
          <LocalizedClientLink
            href="/privacy-policy"
            className="underline font-medium text-ui-fg-base"
          >
            Privacy Policy
          </LocalizedClientLink>{" "}
          for details.
        </p>

        {/* Category toggles */}
        {showDetails && (
          <div className="mt-4 space-y-3">
            {/* Essential - always on */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ui-fg-base">Essential</p>
                <p className="text-xs text-ui-fg-muted">
                  Required for cart, checkout & login
                </p>
              </div>
              <span className="text-xs text-ui-fg-muted font-medium px-2 py-1 bg-gray-100 rounded">
                Always on
              </span>
            </div>

            {/* Analytics */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ui-fg-base">Analytics</p>
                <p className="text-xs text-ui-fg-muted">
                  Helps us understand how you use the site
                </p>
              </div>
              <button
                onClick={() => setAnalytics((v) => !v)}
                className={`relative w-10 h-6 rounded-full transition-colors ${
                  analytics ? "bg-ui-fg-base" : "bg-gray-300"
                }`}
                aria-label="Toggle analytics cookies"
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    analytics ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Marketing */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-ui-fg-base">Marketing</p>
                <p className="text-xs text-ui-fg-muted">
                  Used for ad targeting & retargeting
                </p>
              </div>
              <button
                onClick={() => setMarketing((v) => !v)}
                className={`relative w-10 h-6 rounded-full transition-colors ${
                  marketing ? "bg-ui-fg-base" : "bg-gray-300"
                }`}
                aria-label="Toggle marketing cookies"
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                    marketing ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3 mt-4">
          {!showDetails ? (
            <>
              <button
                onClick={rejectAll}
                className="flex-1 h-10 rounded-xl border border-gray-300 text-sm font-semibold text-ui-fg-base hover:bg-gray-50 transition-colors"
              >
                Decline All
              </button>
              <button
                onClick={() => setShowDetails(true)}
                className="flex-1 h-10 rounded-xl border border-gray-300 text-sm font-semibold text-ui-fg-base hover:bg-gray-50 transition-colors"
              >
                Customize
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 h-10 rounded-xl bg-ui-fg-base text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Accept All
              </button>
            </>
          ) : (
            <>
              <button
                onClick={rejectAll}
                className="flex-1 h-10 rounded-xl border border-gray-300 text-sm font-semibold text-ui-fg-base hover:bg-gray-50 transition-colors"
              >
                Decline All
              </button>
              <button
                onClick={handleSave}
                className="flex-1 h-10 rounded-xl bg-ui-fg-base text-white text-sm font-semibold hover:bg-gray-800 transition-colors"
              >
                Save Preferences
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
