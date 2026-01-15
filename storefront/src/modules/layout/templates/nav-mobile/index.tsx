"use client"

import { useState } from "react"
import { BiMenuAltRight } from "react-icons/bi"
import { VscChromeClose } from "react-icons/vsc"
import MenuMobile from "@modules/layout/components/menu-mobile"

export default function NavMobile({ categories }: { categories: any[] }) {
  const [mobileMenu, setMobileMenu] = useState(false)

  return (
    <div className="md:hidden relative">
      <button
        type="button"
        className="w-10 h-10 rounded-full flex justify-center items-center hover:bg-black/[0.05] transition"
        onClick={() => setMobileMenu((v) => !v)}
        aria-label={mobileMenu ? "Close menu" : "Open menu"}
      >
        {mobileMenu ? (
          <VscChromeClose className="text-[18px]" />
        ) : (
          <BiMenuAltRight className="text-[22px]" />
        )}
      </button>

      {mobileMenu && (
        <MenuMobile categories={categories} setMobileMenu={setMobileMenu} />
      )}
    </div>
  )
}
