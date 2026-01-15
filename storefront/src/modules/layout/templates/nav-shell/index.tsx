"use client"

import { useEffect, useState } from "react"

type Props = {
  children: React.ReactNode
}

export default function NavShell({ children }: Props) {
  const [show, setShow] = useState("translate-y-0")
  const [lastScrollY, setLastScrollY] = useState(0)

  const controlNavbar = () => {
    const y = window.scrollY

    if (y > 200) {
      if (y > lastScrollY) {
        setShow("-translate-y-[80px]")
      } else {
        setShow("shadow-sm")
      }
    } else {
      setShow("translate-y-0")
    }

    setLastScrollY(y)
  }

  useEffect(() => {
    window.addEventListener("scroll", controlNavbar)
    return () => window.removeEventListener("scroll", controlNavbar)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastScrollY])

  return (
    <header
      className={`w-full h-[50px] md:h-[80px] bg-white flex items-center justify-between z-50 sticky top-0 transition-transform duration-300 ${show} border-b border-ui-border-base`}
      style={{ marginTop: "2px" }}
    >
      {children}
    </header>
  )
}
