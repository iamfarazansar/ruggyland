"use client"

import React, { useMemo } from "react"
import ReactCountryFlag from "react-country-flag"
import { clx } from "@medusajs/ui"
import { ArrowRightMini } from "@medusajs/icons"
import { useParams, usePathname } from "next/navigation"
import { updateRegion } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { BsTruck } from "react-icons/bs"
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

function RegionFlag({ option, size = 16 }: { option: RegionOption; size?: number }) {
  if (option.regionName.toLowerCase().includes("rest of world")) {
    return <span style={{ fontSize: size, lineHeight: 1 }}>🌍</span>
  }
  return (
    <ReactCountryFlag
      svg
      style={{ width: size, height: size }}
      countryCode={option.representativeCountry}
    />
  )
}

export default function CountrySelect({ toggleState, regions }: Props) {
  const { countryCode } = useParams<{ countryCode: string }>()
  const pathname = usePathname()

  const { state, open, close } = toggleState

  const options = useMemo<RegionOption[]>(() => {
    return (
      regions?.map((r) => {
        const code = r.currency_code?.toLowerCase() ?? "usd"
        const countries = (r.countries?.map((c) => c.iso_2).filter(Boolean) as string[]) ?? []
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
          px-3 py-2
          rounded-full
          hover:bg-black/[0.05]
          transition
          focus:outline-none
        "
      >
        <BsTruck className="text-[18px]" />

        <span className="flex items-center gap-2 text-sm font-medium min-w-0">
          <RegionFlag option={selected} size={16} />

          {/* Mobile = short label */}
          <span className="md:hidden">
            {selected.currencySymbol}
          </span>

          {/* Desktop = full label */}
          <span className="hidden md:inline max-w-[180px] truncate">
            {selected.regionName} ({selected.currencySymbol})
          </span>
        </span>

        <ArrowRightMini
          className={clx(
            "transition-transform duration-150",
            state ? "rotate-90" : ""
          )}
        />
      </button>

      {/* Dropdown */}
      {state && (
        <div
          className="
            absolute top-full left-0
            md:right-0 md:left-auto
            z-[900]
            pt-2
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
              bg-white
              drop-shadow-md
              text-small-regular
              text-black
              no-scrollbar
              rounded-rounded
              focus:outline-none
            "
          >
            {options.map((o) => (
              <button
                key={o.regionId}
                type="button"
                onClick={() => handleChange(o)}
                className={clx(
                  "w-full text-left py-2.5 px-3 hover:bg-gray-200 cursor-pointer flex items-center gap-x-2",
                  o.regionId === selected.regionId && "bg-gray-100"
                )}
              >
                <RegionFlag option={o} size={16} />
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
