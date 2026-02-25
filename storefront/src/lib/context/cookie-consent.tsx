"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

export type CookieCategories = {
  analytics: boolean
  marketing: boolean
}

type ConsentStatus = "undecided" | "decided"

type CookieConsentContextType = {
  loaded: boolean
  status: ConsentStatus
  categories: CookieCategories
  savePreferences: (categories: CookieCategories) => void
  acceptAll: () => void
  rejectAll: () => void
  resetConsent: () => void
}

const CookieConsentContext = createContext<CookieConsentContextType>({
  loaded: false,
  status: "undecided",
  categories: { analytics: false, marketing: false },
  savePreferences: () => {},
  acceptAll: () => {},
  rejectAll: () => {},
  resetConsent: () => {},
})

const STORAGE_KEY = "cookie_consent_v2"

const DEFAULT_OFF: CookieCategories = { analytics: false, marketing: false }
const ALL_ON: CookieCategories = { analytics: true, marketing: true }

export function CookieConsentProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [loaded, setLoaded] = useState(false)
  const [status, setStatus] = useState<ConsentStatus>("undecided")
  const [categories, setCategories] = useState<CookieCategories>(DEFAULT_OFF)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as CookieCategories
        setCategories(parsed)
        setStatus("decided")
      }
    } catch {}
    setLoaded(true)
  }, [])

  const persist = (cats: CookieCategories) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cats))
    setCategories(cats)
    setStatus("decided")
  }

  const savePreferences = (cats: CookieCategories) => persist(cats)
  const acceptAll = () => persist(ALL_ON)
  const rejectAll = () => persist(DEFAULT_OFF)

  const resetConsent = () => {
    localStorage.removeItem(STORAGE_KEY)
    setCategories(DEFAULT_OFF)
    setStatus("undecided")
  }

  return (
    <CookieConsentContext.Provider
      value={{
        loaded,
        status,
        categories,
        savePreferences,
        acceptAll,
        rejectAll,
        resetConsent,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  )
}

export function useCookieConsent() {
  return useContext(CookieConsentContext)
}
