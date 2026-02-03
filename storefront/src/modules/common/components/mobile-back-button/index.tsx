"use client"

import { useRouter } from "next/navigation"
import { BsArrowLeft } from "react-icons/bs"

export default function MobileBackButton() {
  const router = useRouter()

  return (
    <button
      onClick={() => router.back()}
      className="md:hidden flex items-center gap-2 text-sm text-ui-fg-base hover:text-ui-fg-subtle transition-colors mb-4"
      aria-label="Go back"
    >
      <BsArrowLeft size={18} />
      <span>Back</span>
    </button>
  )
}
