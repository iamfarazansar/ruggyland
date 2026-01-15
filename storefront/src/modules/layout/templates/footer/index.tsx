"use client"
import Link from "next/link"
import { FaFacebookF, FaTwitter, FaYoutube, FaInstagram } from "react-icons/fa"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Wrapper from "../wrapper"

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-14 pb-3">
      <Wrapper className="flex justify-between flex-col md:flex-row gap-[50px] md:gap-0 md:flex-wrap">
        {/* LEFT START */}
        <div className="flex gap-[50px] md:gap-[75px] lg:gap-[100px] flex-col md:flex-row">
          {/* MENU START */}
          <div className="flex flex-col gap-3 shrink-0">
            {/* <div className="font-oswald font-medium uppercase text-sm cursor-pointer">
              Find a store
            </div> */}
            <Link
              href="https://docs.google.com/forms/d/e/1FAIpQLScy8V3hSE3u9VKusz6ZXzXVgjJgLxGb50Rb2r2ILrYLVHK5ig/viewform?usp=sf_link"
              target="_blank"
            >
              <div className="font-oswald font-medium uppercase text-sm cursor-pointer">
                become a partner
              </div>
            </Link>
            <Link
              href="https://docs.google.com/forms/d/e/1FAIpQLSdpIE3WIRG9FSZ3AYUFKSU5IymBCL36thacXBsX50BNtt5k4A/viewform?usp=sf_link"
              target="_blank"
            >
              <div className="font-oswald font-medium uppercase text-sm cursor-pointer">
                send us feedback
              </div>
            </Link>
            {/* <div className="font-oswald font-medium uppercase text-sm cursor-pointer">
              student discount
            </div> */}
          </div>
          {/* MENU END */}

          {/* NORMAL MENU START */}
          <div className="flex gap-[50px] md:gap-[75px] lg:gap-[100px] shrink-0">
            {/* MENU START */}
            <div className="flex flex-col gap-3">
              <div className="font-oswald font-medium uppercase text-sm">
                get help
              </div>
              {/* <div className="text-sm text-white/[0.5] hover:text-white cursor-pointer">
                Order Status
              </div> */}
              {/* <div className="text-sm text-white/[0.5] hover:text-white cursor-pointer">
                Delivery
              </div> */}
              {/* <div className="text-sm text-white/[0.5] hover:text-white cursor-pointer">
                Returns
              </div> */}
              <LocalizedClientLink href="/payment-options">
                <div className="text-sm text-white/[0.5] hover:text-white cursor-pointer">
                  Payment Options
                </div>
              </LocalizedClientLink>
              <LocalizedClientLink href="/contact-us">
                <div className="text-sm text-white/[0.5] hover:text-white cursor-pointer">
                  Contact Us
                </div>
              </LocalizedClientLink>
            </div>
            {/* MENU END */}

            {/* MENU START */}
            <div className="flex flex-col gap-3">
              <div className="font-oswald font-medium uppercase text-sm">
                About RuggyLand
              </div>

              <LocalizedClientLink href="/about-us">
                <div className="text-sm text-white/50 hover:text-white cursor-pointer">
                  About Us
                </div>
              </LocalizedClientLink>
              {/* <div className="text-sm text-white/[0.5] hover:text-white cursor-pointer">
                Careers
              </div> */}
              {/* <div className="text-sm text-white/[0.5] hover:text-white cursor-pointer">
                Investors
              </div> */}
              <LocalizedClientLink href="/sustainability">
                <div className="text-sm text-white/[0.5] hover:text-white cursor-pointer">
                  Sustainability
                </div>
              </LocalizedClientLink>
            </div>
            {/* MENU END */}
          </div>
          {/* NORMAL MENU END */}
        </div>
        {/* LEFT END */}

        {/* RIGHT START */}
        <div className="flex gap-4 justify-center md:justify-start">
          <div
            onClick={() =>
              window.open(
                "https://www.facebook.com/ruggyland?mibextid=ZbWKwL",
                "_blank"
              )
            }
            className="w-10 h-10 rounded-full bg-white/[0.25] flex items-center justify-center text-black hover:bg-white/[0.5] cursor-pointer"
          >
            <FaFacebookF size={20} />
          </div>

          <div
            onClick={() =>
              window.open("https://twitter.com/RuggyLand", "_blank")
            }
            className="w-10 h-10 rounded-full bg-white/[0.25] flex items-center justify-center text-black hover:bg-white/[0.5] cursor-pointer"
          >
            <FaTwitter size={20} />
          </div>

          <div
            onClick={() =>
              window.open(
                "https://www.youtube.com/@ruggylandshorts8823",
                "_blank"
              )
            }
            className="w-10 h-10 rounded-full bg-white/[0.25] flex items-center justify-center text-black hover:bg-white/[0.5] cursor-pointer"
          >
            <FaYoutube size={20} />
          </div>
          <div
            onClick={() =>
              window.open("https://www.instagram.com/ruggyland/", "_blank")
            }
            className="w-10 h-10 rounded-full bg-white/[0.25] flex items-center justify-center text-black hover:bg-white/[0.5] cursor-pointer"
          >
            <FaInstagram size={20} />
          </div>
        </div>
        {/* RIGHT END */}
      </Wrapper>
      <Wrapper className="flex justify-between mt-10 flex-col md:flex-row gap-[10px] md:gap-0">
        {/* LEFT START */}
        <div className="text-[12px] text-white/[0.5] hover:text-white cursor-pointer text-center md:text-left">
          © {new Date().getFullYear()} RuggyLand, All Rights Reserved
        </div>
        {/* LEFT END */}

        {/* RIGHT START */}
        <div className="flex gap-2 md:gap-5 text-center md:text-left flex-wrap justify-center">
          <LocalizedClientLink href="/terms-of-service">
            <div className="text-[12px] text-white/[0.5] hover:text-white cursor-pointer">
              Terms of Service
            </div>
          </LocalizedClientLink>
          <LocalizedClientLink href="/privacy-policy">
            <div className="text-[12px] text-white/[0.5] hover:text-white cursor-pointer">
              Privacy Policy
            </div>
          </LocalizedClientLink>
          <LocalizedClientLink href="/cancellation-refund-policy">
            <div className="text-[12px] text-white/[0.5] hover:text-white cursor-pointer">
              Cancellation & Refund Policy
            </div>
          </LocalizedClientLink>
          <LocalizedClientLink href="/shipping-return-policy">
            <div className="text-[12px] text-white/[0.5] hover:text-white cursor-pointer">
              Shipping & Return Policy
            </div>
          </LocalizedClientLink>
        </div>
        {/* <div className="min-w-[316px] flex xsmall:justify-end">
          <CountrySelect />
        </div> */}
        {/* RIGHT END */}
      </Wrapper>
    </footer>
  )
}

export default Footer
