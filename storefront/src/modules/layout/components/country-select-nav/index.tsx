"use client"

import { useRef } from "react"
import { useToggleState } from "@medusajs/ui"
import CountrySelect from "@modules/layout/components/country-select"
import { HttpTypes } from "@medusajs/types"

type Props = {
  regions: HttpTypes.StoreRegion[]
}

export default function CountrySelectNav({ regions }: Props) {
  const countryToggleState = useToggleState()
  const touchActive = useRef(false)

  return (
    <div
      className="flex items-center whitespace-nowrap"
      onTouchStart={() => { touchActive.current = true }}
      onTouchEnd={() => { setTimeout(() => { touchActive.current = false }, 500) }}
      onMouseEnter={() => { if (!touchActive.current) countryToggleState.open() }}
      onMouseLeave={() => { if (!touchActive.current) countryToggleState.close() }}
    >
      <CountrySelect toggleState={countryToggleState} regions={regions} />
    </div>
  )
}
