"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import Modal from "@modules/common/components/modal"
import { Button } from "@medusajs/ui"
import { BsChatDots } from "react-icons/bs"
import { submitProductInquiry } from "@lib/data/product-inquiry"

type Props = {
  product: HttpTypes.StoreProduct
}

type FormState = "idle" | "sending" | "success" | "error"

export default function AskAboutProduct({ product }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [formState, setFormState] = useState<FormState>("idle")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormState("sending")

    try {
      await submitProductInquiry({
        product_id: product.id,
        product_handle: product.handle ?? undefined,
        product_title: product.title ?? "Product",
        name,
        email,
        phone: phone || undefined,
        message,
      })
      setFormState("success")
    } catch {
      setFormState("error")
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => {
      setFormState("idle")
      setName("")
      setEmail("")
      setPhone("")
      setMessage("")
    }, 300)
  }

  const inputClass =
    "w-full rounded-lg border border-ui-border-base bg-white px-3 py-2.5 text-sm text-ui-fg-base placeholder:text-ui-fg-muted focus:outline-none focus:ring-2 focus:ring-ui-border-interactive"

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 text-sm text-ui-fg-subtle hover:text-ui-fg-base transition-colors w-fit mt-1"
      >
        <BsChatDots className="text-[15px]" />
        Ask about this product
      </button>

      <Modal isOpen={isOpen} close={handleClose} size="small">
        <Modal.Title>
          <span className="text-base font-semibold">Have a question?</span>
        </Modal.Title>

        <Modal.Body>
          {formState === "success" ? (
            <div className="w-full py-6 text-center">
              <p className="text-ui-fg-base font-medium">Message sent!</p>
              <p className="text-sm text-ui-fg-subtle mt-1">
                We&apos;ll get back to you shortly.
              </p>
              <Button
                variant="secondary"
                size="small"
                className="mt-4"
                onClick={handleClose}
              >
                Close
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="w-full flex flex-col gap-3 pt-3"
            >
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-ui-fg-subtle font-medium">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    className={inputClass}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Your name"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs text-ui-fg-subtle font-medium">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    className={inputClass}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-ui-fg-subtle font-medium">
                  Phone
                </label>
                <input
                  type="tel"
                  className={inputClass}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 8900"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs text-ui-fg-subtle font-medium">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  className={`${inputClass} resize-none`}
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  placeholder="What would you like to know?"
                />
              </div>

              {formState === "error" && (
                <p className="text-xs text-red-500">
                  Something went wrong. Please try again.
                </p>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full mt-1"
                isLoading={formState === "sending"}
                disabled={formState === "sending"}
              >
                Send message
              </Button>
            </form>
          )}
        </Modal.Body>
      </Modal>
    </>
  )
}
