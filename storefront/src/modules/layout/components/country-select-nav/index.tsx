"use client"

import { clx, useToggleState } from "@medusajs/ui"
import { ArrowRightMini } from "@medusajs/icons"
import CountrySelect from "@modules/layout/components/country-select"
import { HttpTypes } from "@medusajs/types"

type Props = {
  regions: HttpTypes.StoreRegion[]
}

export default function CountrySelectNav({ regions }: Props) {
  const countryToggleState = useToggleState()

  return (
    <div
      className="flex items-center gap-x-2 focus:outline-none whitespace-nowrap"
      onMouseEnter={countryToggleState.open}
      onMouseLeave={countryToggleState.close}
    >
      <CountrySelect toggleState={countryToggleState} regions={regions} />
      {/* <ArrowRightMini
        className={clx(
          "transition-transform duration-150",
          countryToggleState.state ? "rotate-90" : ""
        )}
      /> */}
    </div>
  )
}
