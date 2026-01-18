"use client"

import { useMemo, useState } from "react"
import { BsChevronDown } from "react-icons/bs"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Category = {
  id: string
  name: string
  handle: string
  parent_category?: any
  category_children?: Category[]
}

export default function CategoriesDropdown({
  categories,
}: {
  categories: Category[]
}) {
  const [open, setOpen] = useState(false)

  const topLevel = useMemo(
    () => (categories || []).filter((c) => !c.parent_category),
    [categories]
  )

  return (
    <div
      className="relative hidden tablet:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Trigger */}
      <button
        type="button"
        className="flex items-center gap-2 hover:text-ui-fg-base focus:outline-none whitespace-nowrap"
      >
        Categories
        <BsChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute left-0 top-full
            min-w-[260px]
            bg-white
            border
            shadow-lg
            rounded-md
            z-[60]
            overflow-hidden
          "
        >
          <ul className="flex flex-col ">
            {topLevel.slice(0, 10).map((c) => (
              <li key={c.id}>
                <LocalizedClientLink
                  href={`/categories/${c.handle}`}
                  className="block w-full px-3 py-2 hover:bg-gray-200 transition"
                  onClick={() => setOpen(false)}
                >
                  {c.name}
                </LocalizedClientLink>

                {c.category_children?.length ? (
                  <ul>
                    {c.category_children.slice(0, 10).map((child) => (
                      <li key={child.id}>
                        <LocalizedClientLink
                          href={`/categories/${child.handle}`}
                          className="block w-full pl-6 pr-3 py-2 text-sm hover:bg-gray-200 transition"
                          onClick={() => setOpen(false)}
                        >
                          {child.name}
                        </LocalizedClientLink>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
