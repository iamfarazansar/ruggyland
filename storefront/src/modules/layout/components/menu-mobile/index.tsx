"use client"

import React, { useMemo, useState, useRef, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { BsChevronDown, BsChevronRight } from "react-icons/bs"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

type Category = {
  id: string
  name: string
  handle: string
  parent_category?: any
  category_children?: Category[]
  metadata?: Record<string, unknown>
}

type NavItem = { id: number; name: string; url: string; target?: string }

// Map category handles to their thumbnail images
const categoryImages: Record<string, string> = {
  "anime-rugs": "/discover/anime.jpg",
  "hand-knotted-rugs": "/discover/hand-knotted-rugs.jpg",
  "botanical-rugs": "/discover/botanical-rugs.png",
  abstract: "/discover/abstract.png",
}

export default function MenuMobile({
  setMobileMenu,
  categories,
  toggleButtonRef,
  isOpen,
}: {
  setMobileMenu: (value: boolean) => void
  categories: Category[]
  toggleButtonRef?: React.RefObject<HTMLButtonElement | null>
  isOpen: boolean
}) {
  const [showCatMenu, setShowCatMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when tapping anywhere outside the menu card (and not on toggle button)
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node

      // Ignore clicks on the toggle button (let the button handle its own toggle)
      if (toggleButtonRef?.current?.contains(target)) {
        return
      }

      if (menuRef.current && !menuRef.current.contains(target)) {
        setMobileMenu(false)
      }
    }

    // Add listeners
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
    }
  }, [isOpen, setMobileMenu, toggleButtonRef])

  const topLevelCats = useMemo(
    () => (categories || []).filter((c) => !c.parent_category),
    [categories]
  )

  // Match desktop nav: Home | All Rugs | Categories ▾ | Custom Rug | Contact
  const links: NavItem[] = [
    { id: 1, name: "Home", url: "/" },
    { id: 2, name: "All Rugs", url: "/store" },
    { id: 3, name: "Custom Rug", url: "/custom-rug" },
    { id: 4, name: "Contact", url: "/contact-us" },
  ]

  return (
    <div
      className={`fixed left-0 right-0 top-[50px] md:top-[80px] w-screen z-[9999] md:hidden grid transition-all duration-300 ease-out ${
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}
    >
      <div className="overflow-hidden">
        <ul className="max-h-[calc(100vh-50px)] md:max-h-[calc(100vh-80px)] overflow-y-auto text-black font-bold">
          {/* Unified menu card */}
          <li className="px-5 py-4">
            <div
              ref={menuRef}
              className="rounded-2xl bg-gray-50 shadow-[0_4px_20px_rgba(0,0,0,0.12)] overflow-hidden"
            >
              {/* Navigation links */}
              {links.map((item, index) => (
                <div key={item.id} onClick={() => setMobileMenu(false)}>
                  <Link target={item.target || ""} href={item.url}>
                    <div
                      className={`py-4 px-5 cursor-pointer hover:bg-gray-100 bg-white ${
                        index > 0 ? "border-t border-gray-200" : ""
                      }`}
                    >
                      {item.name}
                    </div>
                  </Link>
                </div>
              ))}

              {/* Categories accordion header - opens on tap only */}
              <div
                className="flex justify-between items-center py-4 px-5 cursor-pointer border-t border-gray-200 bg-white hover:bg-gray-100"
                onClick={() => setShowCatMenu((v) => !v)}
              >
                <span>Categories</span>
                <BsChevronDown
                  size={14}
                  className={
                    showCatMenu
                      ? "rotate-180 transition-transform duration-200"
                      : "transition-transform duration-200"
                  }
                />
              </div>

              {/* Category items with slide transition */}
              <div
                className={`grid transition-all duration-300 ease-out ${
                  showCatMenu ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div
                  className="overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {topLevelCats.map((cat) => {
                    const imgSrc =
                      (cat.metadata?.discover_image as string) ||
                      categoryImages[cat.handle ?? ""] ||
                      "/discover/default.jpg"

                    return (
                      <LocalizedClientLink
                        key={cat.id}
                        href={`/categories/${cat.handle}`}
                        className="flex items-center justify-between py-3 px-5 border-t border-gray-200 bg-white hover:bg-gray-100"
                        onClick={() => setMobileMenu(false)}
                      >
                        <div className="flex items-center gap-3">
                          {/* Category thumbnail */}
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                            <Image
                              src={imgSrc}
                              alt={cat.name}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-base font-semibold">
                            {cat.name}
                          </span>
                        </div>
                        <BsChevronRight size={14} className="text-gray-400" />
                      </LocalizedClientLink>
                    )
                  })}
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
}
