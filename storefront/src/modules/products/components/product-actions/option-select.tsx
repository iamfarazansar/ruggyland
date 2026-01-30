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
}

const OptionSelect: React.FC<OptionSelectProps> = ({
  option,
  current,
  updateOption,
  title,
  "data-testid": dataTestId,
  disabled,
}) => {
  // Sort size options by numeric dimensions (e.g., "2x3 ft" -> 2*3 = 6)
  const sortBySize = (values: string[]) => {
    return [...values].sort((a, b) => {
      const parseSize = (val: string) => {
        const match = val.match(/(\d+)\s*[x×]\s*(\d+)/i)
        if (match) {
          return parseInt(match[1]) * parseInt(match[2])
        }
        return 0
      }
      return parseSize(a) - parseSize(b)
    })
  }

  const rawOptions = (option.values ?? []).map((v) => v.value)
  const filteredOptions =
    option.title?.toLowerCase() === "size" ? sortBySize(rawOptions) : rawOptions

  return (
    <div className="flex flex-col gap-y-3">
      <span className="text-sm">Select {title}</span>
      <div className="flex flex-wrap gap-2" data-testid={dataTestId}>
        {filteredOptions.map((v) => {
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
