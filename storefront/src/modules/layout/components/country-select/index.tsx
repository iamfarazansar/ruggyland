"use client"

import {
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react"
import { Fragment, useEffect, useMemo, useState } from "react"
import ReactCountryFlag from "react-country-flag"
import { clx, useToggleState } from "@medusajs/ui"
import { ArrowRightMini } from "@medusajs/icons"
import { StateType } from "@lib/hooks/use-toggle-state"
import { useParams, usePathname } from "next/navigation"
import { updateRegion } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { BsChevronDown, BsTruck } from "react-icons/bs"

type CountryOption = {
  country: string
  region: string
  label: string
}

type CountrySelectProps = {
  toggleState: StateType
  regions: HttpTypes.StoreRegion[]
}

const CountrySelect = ({ toggleState, regions }: CountrySelectProps) => {
  const [current, setCurrent] = useState<
    | { country: string | undefined; region: string; label: string | undefined }
    | undefined
  >(undefined)

  const { countryCode } = useParams()
  const currentPath = usePathname().split(`/${countryCode}`)[1]

  const { state, close } = toggleState

  const options = useMemo(() => {
    return regions
      ?.map((r) => {
        return r.countries?.map((c) => ({
          country: c.iso_2,
          region: r.id,
          label: c.display_name,
        }))
      })
      .flat()
      .sort((a, b) => (a?.label ?? "").localeCompare(b?.label ?? ""))
  }, [regions])

  useEffect(() => {
    if (countryCode) {
      const option = options?.find((o) => o?.country === countryCode)
      setCurrent(option)
    }
  }, [options, countryCode])

  const handleChange = (option: CountryOption) => {
    updateRegion(option.country, currentPath)
    close()
  }
  const countryToggleState = useToggleState()
  return (
    <div
      onMouseEnter={countryToggleState.open}
      onMouseLeave={countryToggleState.close}
    >
      <Listbox
        as="span"
        onChange={handleChange}
        defaultValue={
          countryCode
            ? options?.find((o) => o?.country === countryCode)
            : undefined
        }
        className="focus:outline-none"
      >
        <ListboxButton
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

          <span className="flex items-center gap-2 text-sm font-medium">
            <ReactCountryFlag
              svg
              style={{ width: 16, height: 16 }}
              countryCode={current?.country ?? ""}
            />
            {current?.label}
          </span>

          <ArrowRightMini
            className={clx(
              "transition-transform duration-150",
              countryToggleState.state ? "rotate-90" : ""
            )}
          />
        </ListboxButton>

        <div className="flex relative w-full min-w-[180px]">
          <Transition
            show={state}
            as={Fragment}
            leave="transition ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <ListboxOptions
              className="
    absolute
    top-full
    mt-2
    left-0
    xsmall:left-auto
    xsmall:right-0
    max-h-[442px]
    overflow-y-scroll
    z-[900]
    bg-white
    drop-shadow-md
    text-small-regular
    uppercase
    text-black
    no-scrollbar
    rounded-rounded
    w-full
    focus:outline-none
  "
              static
            >
              {options?.map((o, index) => {
                return (
                  <ListboxOption
                    key={index}
                    value={o}
                    className="py-2 hover:bg-gray-200 px-3 cursor-pointer flex items-center gap-x-2"
                  >
                    {/* @ts-ignore */}
                    <ReactCountryFlag
                      svg
                      style={{
                        width: "16px",
                        height: "16px",
                      }}
                      countryCode={o?.country ?? ""}
                    />{" "}
                    {o?.label}
                  </ListboxOption>
                )
              })}
            </ListboxOptions>
          </Transition>
        </div>
      </Listbox>
    </div>
  )
}

export default CountrySelect
