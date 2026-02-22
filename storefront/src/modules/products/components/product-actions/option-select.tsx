import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"
import React from "react"

type OptionSelectProps = {
  option: HttpTypes.StoreProductOption
  current: string | undefined
  updateOption: (title: string, value: string) => void
  title: string
  disabled: boolean
  "data-testid"?: string
  availableValues?: string[] // Filter to only show these values
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
  availableValues,
}) => {
  // Sort size options by numeric dimensions (e.g., "2x3 ft" -> 2*3 = 6)
  const sortBySize = (values: string[]) => {
    return [...values].sort((a, b) => {
      // Push "Sample" sizes to the end
      const aIsSample = a.toLowerCase().includes("sample")
      const bIsSample = b.toLowerCase().includes("sample")
      if (aIsSample && !bIsSample) return 1
      if (!aIsSample && bIsSample) return -1

      const parseSize = (val: string) => {
        const match = val.match(/(\d+\.?\d*)\s*[x×]\s*(\d+\.?\d*)/i)
        if (match) {
          return parseFloat(match[1]) * parseFloat(match[2])
        }
        return 0
      }
      return parseSize(a) - parseSize(b)
    })
  }

  const rawOptions = (option.values ?? []).map((v) => v.value)

  // Filter by available values if provided
  const filteredByAvailability = availableValues
    ? rawOptions.filter((v) => availableValues.includes(v))
    : rawOptions

  const sortedOptions =
    option.title?.toLowerCase() === "size"
      ? sortBySize(filteredByAvailability)
      : filteredByAvailability

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm">Select {title}</span>
      <div className="flex flex-wrap gap-2" data-testid={dataTestId}>
        {sortedOptions.map((v) => {
          return (
            <button
              onClick={() => updateOption(option.id, v)}
              key={v}
              className={clx(
                "border-ui-border-base bg-ui-bg-subtle border text-small-regular h-10 rounded-rounded px-4 py-2 whitespace-nowrap",
                {
                  "border-black": v === current,
                  "hover:shadow-elevation-card-rest transition-shadow ease-in-out duration-150":
                    v !== current,
                }
              )}
              disabled={disabled}
              data-testid="option-button"
            >
              {v}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default OptionSelect
