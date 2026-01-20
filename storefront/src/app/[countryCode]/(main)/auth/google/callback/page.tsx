"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useParams } from "next/navigation"
import { validateGoogleCallback } from "@lib/data/customer"

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams()
  const params = useParams()
  const countryCode = params.countryCode as string

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get("code")
      const state = searchParams.get("state")

      if (!code || !state) {
        setError("Missing authentication parameters")
        setLoading(false)
        return
      }

      try {
        console.log("Validating Google callback...")
        const result = await validateGoogleCallback(code, state)
        console.log("Callback result:", result)

        if (result.success) {
          // Single-step flow complete - go directly to account page
          window.location.href = `/${countryCode}/account`
        } else {
          setError(result.error || "Authentication failed")
          setLoading(false)
        }
      } catch (err: any) {
        console.error("Callback error:", err)
        setError(err.message || "An error occurred")
        setLoading(false)
      }
    }

    handleCallback()
  }, [searchParams, countryCode])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-8 h-8 border-4 border-gray-300 border-t-gray-800 rounded-full animate-spin"></div>
        <p className="text-gray-600">Completing sign in with Google...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="text-red-500 text-lg">⚠️ Authentication Error</div>
        <p className="text-gray-600">{error}</p>
        <a
          href={`/${countryCode}/account`}
          className="text-blue-600 underline hover:text-blue-800"
        >
          Return to login
        </a>
      </div>
    )
  }

  return null
}
