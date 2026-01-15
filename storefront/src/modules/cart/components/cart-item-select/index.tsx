"use client"

import { clx } from "@medusajs/ui"
import React from "react"

type CartItemSelectProps = {
  value: number
  onChange: (value: number) => void
  max?: number
  disabled?: boolean
  className?: string
}

export default function CartItemSelect({
  value,
  onChange,
  max = 10,
  disabled,
  className,
}: CartItemSelectProps) {
  const decDisabled = disabled || value <= 1
  const incDisabled = disabled || value >= max

  return (
    <div
      className={clx(
        "flex items-center overflow-hidden rounded-full border border-ui-border-base bg-ui-bg-subtle",
        className
      )}
    >
      {/* - */}
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={decDisabled}
        className="h-10 w-11 flex items-center justify-center text-ui-fg-base hover:bg-black/[0.04] disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        −
      </button>

      {/* number */}
      <div className="h-10 w-12 flex items-center justify-center bg-white text-sm font-semibold text-ui-fg-base border-x border-ui-border-base">
        {value}
      </div>

      {/* + */}
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={incDisabled}
        className="h-10 w-11 flex items-center justify-center text-ui-fg-base hover:bg-black/[0.04] disabled:opacity-40"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  )
}
