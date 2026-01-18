"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useCallback, useState, useRef, useEffect } from "react"
import { BsChevronDown } from "react-icons/bs"

export type SortOptions = "price_asc" | "price_desc" | "created_at"

type RefinementListProps = {
  sortBy: SortOptions
  search?: boolean
  "data-testid"?: string
}

const sortOptions = [
  { value: "created_at", label: "Latest Arrivals" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
]

const RefinementList = ({
  sortBy,
  "data-testid": dataTestId,
}: RefinementListProps) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("touchstart", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [open])

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)
      return params.toString()
    },
    [searchParams]
  )

  const setQueryParams = (name: string, value: string) => {
    const query = createQueryString(name, value)
    router.push(`${pathname}?${query}`)
  }

  const currentLabel =
    sortOptions.find((o) => o.value === sortBy)?.label || "Latest Arrivals"

  return (
    <div
      className="flex items-center py-3 mb-4"
      data-testid={dataTestId}
    >
      {/* Sort Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 h-10 px-4 rounded-full border border-ui-border-base bg-ui-bg-base text-sm font-medium text-ui-fg-base hover:bg-ui-bg-subtle transition"
        >
          <span className="text-ui-fg-subtle">Sort:</span>
          <span>{currentLabel}</span>
          <BsChevronDown
            size={12}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </button>

        {open && (
          <div className="absolute left-0 top-full mt-1 min-w-[180px] bg-white border border-ui-border-base rounded-lg shadow-lg z-50 overflow-hidden">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setQueryParams("sortBy", option.value)
                  setOpen(false)
                }}
                className={`block w-full text-left px-4 py-2.5 text-sm transition ${
                  sortBy === option.value
                    ? "bg-ui-bg-subtle font-medium text-ui-fg-base"
                    : "text-ui-fg-subtle hover:bg-ui-bg-subtle hover:text-ui-fg-base"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RefinementList
