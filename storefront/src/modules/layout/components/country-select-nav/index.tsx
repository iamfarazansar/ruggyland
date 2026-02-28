"use client"

import { useToggleState } from "@medusajs/ui"
import CountrySelect from "@modules/layout/components/country-select"
import { HttpTypes } from "@medusajs/types"

type Props = {
  regions: HttpTypes.StoreRegion[]
}

export default function CountrySelectNav({ regions }: Props) {
  const countryToggleState = useToggleState()

  return (
    <div
      className="flex items-center whitespace-nowrap"
      onPointerEnter={(e) => e.pointerType === "mouse" && countryToggleState.open()}
      onPointerLeave={(e) => e.pointerType === "mouse" && countryToggleState.close()}
    >
      <CountrySelect toggleState={countryToggleState} regions={regions} />
    </div>
  )
}
