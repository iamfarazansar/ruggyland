"use client"

import React, { useMemo, useState } from "react"
import Link from "next/link"
import { BsChevronDown } from "react-icons/bs"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Category = {
  id: string
  name: string
  handle: string
  parent_category?: any
  category_children?: Category[]
}

type NavItem = { id: number; name: string; url: string; target?: string }

export default function MenuMobile({
  setMobileMenu,
  categories,
}: {
  setMobileMenu: (value: boolean) => void
  categories: Category[]
}) {
  const [showCatMenu, setShowCatMenu] = useState(false)

  const topLevelCats = useMemo(
    () => (categories || []).filter((c) => !c.parent_category),
    [categories]
  )

  const links: NavItem[] = [
    { id: 1, name: "Home", url: "/" },
    { id: 2, name: "About", url: "/about-us" },
    { id: 4, name: "Contact", url: "/contact-us" },
    {
      id: 5,
      name: "Customize",
      url: "https://docs.google.com/forms/d/e/1FAIpQLSfso28FwvN_7_X5uOWVF9okRYqCGhnEUP6TmaGEMB6X2woZtg/viewform?usp=sf_link",
      target: "_blank",
    },
  ]

  return (
    <ul
      className="  fixed left-0 right-0
    top-[50px] md:top-[80px]
    w-screen
    max-h-[calc(100vh-50px)] md:max-h-[calc(100vh-80px)]
    overflow-y-auto
    bg-white
    border-t
    text-black
    z-[9999]
    md:hidden
    font-bold"
    >
      {/* Normal links */}
      {links.map((item) => (
        <li key={item.id} onClick={() => setMobileMenu(false)}>
          <Link target={item.target || ""} href={item.url}>
            <div className="py-5 px-5 border-b cursor-pointer hover:bg-gray-200">
              {item.name}
            </div>
          </Link>
        </li>
      ))}

      {/* Categories accordion */}
      <li
        className="cursor-pointer py-5 px-5 border-b flex flex-col hover:bg-gray-200"
        onClick={() => setShowCatMenu((v) => !v)}
      >
        <div className="flex justify-between items-center">
          Categories
          <BsChevronDown
            size={14}
            className={
              showCatMenu
                ? "rotate-180 transition-transform"
                : "transition-transform"
            }
          />
        </div>

        {showCatMenu && (
          <div
            className="bg-black/[0.05] -mx-5 mt-4 -mb-5"
            onClick={(e) => e.stopPropagation()}
          >
            {topLevelCats.map((cat) => (
              <div key={cat.id} className="border-t">
                {/* Parent category */}
                <LocalizedClientLink
                  href={`/categories/${cat.handle}`}
                  className="block py-4 px-8 hover:bg-gray-200"
                  onClick={() => setMobileMenu(false)}
                >
                  {cat.name}
                </LocalizedClientLink>

                {/* Children */}
                {cat.category_children?.length ? (
                  <div className="pb-2">
                    {cat.category_children.map((child) => (
                      <LocalizedClientLink
                        key={child.id}
                        href={`/categories/${child.handle}`}
                        className="block py-3 pl-12 pr-8 text-sm font-semibold hover:bg-gray-200"
                        onClick={() => setMobileMenu(false)}
                      >
                        {child.name}
                      </LocalizedClientLink>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </li>
    </ul>
  )
}
