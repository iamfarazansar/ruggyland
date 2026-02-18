"use client"

import React, { useMemo } from "react"
import ReactCountryFlag from "react-country-flag"
import { clx } from "@medusajs/ui"
import { ChevronUpMini } from "@medusajs/icons"
import { useParams, usePathname } from "next/navigation"
import { updateRegion } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import type { StateType } from "@lib/hooks/use-toggle-state"

const CURRENCY_SYMBOLS: Record<string, string> = {
  usd: "$",
  eur: "€",
  inr: "₹",
  gbp: "£",
}

type RegionOption = {
  regionId: string
  regionName: string
  currencyCode: string
  currencySymbol: string
  representativeCountry: string
  countries: string[]
}

type Props = {
  toggleState: StateType
  regions: HttpTypes.StoreRegion[]
}

export default function CountrySelectFooter({ toggleState, regions }: Props) {
  const { countryCode } = useParams<{ countryCode: string }>()
  const pathname = usePathname()

  const { state, open, close } = toggleState

  const options = useMemo<RegionOption[]>(() => {
    return (
      regions?.map((r) => {
        const code = r.currency_code?.toLowerCase() ?? "usd"
        const countries = r.countries?.map((c) => c.iso_2) ?? []
        return {
          regionId: r.id,
          regionName: r.name ?? "Region",
          currencyCode: code,
          currencySymbol: CURRENCY_SYMBOLS[code] ?? code.toUpperCase(),
          representativeCountry: countries[0] ?? "us",
          countries,
        }
      }) ?? []
    )
  }, [regions])

  const selected = useMemo(() => {
    if (!countryCode || !options.length) return null
    return options.find((o) => o.countries.includes(countryCode)) ?? null
  }, [options, countryCode])

  const currentPath = useMemo(() => {
    if (!countryCode) return "/"
    const after = pathname.split(`/${countryCode}`)[1]
    return after?.length ? after : "/"
  }, [pathname, countryCode])

  const handleChange = (option: RegionOption) => {
    updateRegion(option.representativeCountry, currentPath)
    close()
  }

  if (!selected) return null

  return (
    <div className="relative inline-flex">
      {/* Button */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          state ? close() : open()
        }}
        className="
          flex items-center gap-2
          px-4 py-2
          rounded-full
          bg-white/[0.1]
          hover:bg-white/[0.2]
          transition
          focus:outline-none
          text-white
        "
      >
        <span className="flex items-center gap-2 text-sm font-medium min-w-0">
          <ReactCountryFlag
            svg
            style={{ width: 18, height: 18 }}
            countryCode={selected.representativeCountry}
          />
          <span className="max-w-[200px] truncate">
            {selected.regionName} ({selected.currencySymbol})
          </span>
        </span>

        <ChevronUpMini
          className={clx(
            "transition-transform duration-150 text-white/70",
            state ? "rotate-180" : ""
          )}
        />
      </button>

      {/* Dropdown - opens upward */}
      {state && (
        <div
          className="
            absolute bottom-full left-0
            z-[900]
            pb-2
          "
          onMouseEnter={open}
          onMouseLeave={close}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="
              w-fit
              min-w-[200px]
              max-w-[260px]
              overflow-y-auto
              bg-neutral-900
              border border-white/10
              text-small-regular
              text-white
              no-scrollbar
              rounded-lg
              shadow-lg
              focus:outline-none
            "
          >
            {options.map((o) => (
              <button
                key={o.regionId}
                type="button"
                onClick={() => handleChange(o)}
                className={clx(
                  "w-full text-left py-2.5 px-3 hover:bg-white/10 cursor-pointer flex items-center gap-x-2 transition",
                  o.regionId === selected.regionId && "bg-white/5"
                )}
              >
                <ReactCountryFlag
                  svg
                  style={{ width: "18px", height: "18px" }}
                  countryCode={o.representativeCountry}
                />
                <span className="truncate text-sm">
                  {o.regionName} ({o.currencySymbol})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
