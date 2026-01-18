import { Suspense } from "react"

import { listRegions } from "@lib/data/regions"
import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import CountrySelectNav from "@modules/layout/components/country-select-nav"
import Link from "next/link"
import NavShell from "../nav-shell"
import { BsPerson } from "react-icons/bs"
import { listCategories } from "@lib/data/categories"
import CategoriesDropdown from "@modules/layout/components/categories-dropdown"
import NavMobile from "../nav-mobile"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  const productCategories = await listCategories()

  // ✅ Match: Home | All Rugs | Categories ▾ | Custom Rug | Contact
  const NAV_LINKS = [
    { name: "Home", href: "/" },
    { name: "All Rugs", href: "/store" }, // <-- change if your all-products page is different
    { name: "Custom Rug", href: "/custom-rug" }, // <-- change to your custom page route
    { name: "Contact", href: "/contact-us" },
  ]

  return (
    <NavShell>
      <div className="content-container h-full flex items-center justify-between relative">
        {/* LEFT: Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/">
            <img
              src="/logo.svg"
              alt="RuggyLand"
              className="w-[40px] md:w-[60px]"
            />
          </Link>
        </div>

        {/* CENTER NAV */}
        <div className="hidden tablet:flex items-center gap-4 small:gap-5 medium:gap-6 large:gap-8 font-medium text-black text-sm small:text-base">
          {/* Home */}
          <LocalizedClientLink
            href={NAV_LINKS[0].href}
            className="font-medium hover:text-ui-fg-base transition whitespace-nowrap"
          >
            {NAV_LINKS[0].name}
          </LocalizedClientLink>

          {/* All Rugs */}
          <LocalizedClientLink
            href={NAV_LINKS[1].href}
            className="font-medium hover:text-ui-fg-base transition whitespace-nowrap"
          >
            {NAV_LINKS[1].name}
          </LocalizedClientLink>

          {/* Categories dropdown */}
          <CategoriesDropdown categories={productCategories} />

          {/* Custom Rug */}
          <LocalizedClientLink
            href={NAV_LINKS[2].href}
            className="font-medium hover:text-ui-fg-base transition whitespace-nowrap"
          >
            {NAV_LINKS[2].name}
          </LocalizedClientLink>

          {/* Contact */}
          <LocalizedClientLink
            href={NAV_LINKS[3].href}
            className="font-medium hover:text-ui-fg-base transition whitespace-nowrap"
          >
            {NAV_LINKS[3].name}
          </LocalizedClientLink>
        </div>

        {/* RIGHT: Country + Account + Cart + Mobile */}
        <div className="flex items-center gap-2 md:gap-4">
          <CountrySelectNav regions={regions} />

          <div className="small:flex items-center">
            <LocalizedClientLink
              className="w-8 md:w-12 h-8 md:h-12 rounded-full flex justify-center items-center hover:bg-black/[0.05] cursor-pointer transition"
              href="/account"
            >
              <BsPerson className="text-[19px] md:text-[24px]" />
            </LocalizedClientLink>
          </div>

          <Suspense
            fallback={
              <LocalizedClientLink
                className="hover:text-ui-fg-base flex gap-2"
                href="/cart"
              >
                Cart (0)
              </LocalizedClientLink>
            }
          >
            <CartButton />
          </Suspense>

          <div className="tablet:hidden">
            <NavMobile categories={productCategories} />
          </div>
        </div>
      </div>
    </NavShell>
  )
}
