"use client"

import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import React, { useState, useCallback, useEffect } from "react"
import { sdk } from "@lib/config"

declare global {
  interface Window {
    Razorpay: any
  }
}

type RazorpayPaymentButtonProps = {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}

type MessageType = "error" | "info"

const RazorpayPaymentButton: React.FC<RazorpayPaymentButtonProps> = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: MessageType } | null>(null)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  const setErrorMessage = (text: string) => setMessage({ text, type: "error" })
  const setInfoMessage = (text: string) => setMessage({ text, type: "info" })

  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  // Load Razorpay script
  useEffect(() => {
    if (typeof window !== "undefined" && !window.Razorpay) {
      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      script.onload = () => setRazorpayLoaded(true)
      script.onerror = () => setErrorMessage("Failed to load Razorpay")
      document.body.appendChild(script)
    } else if (window.Razorpay) {
      setRazorpayLoaded(true)
    }
  }, [])

  const onPaymentCompleted = async () => {
    try {
      await placeOrder()
    } catch (err: any) {
      // NEXT_REDIRECT is not an error - it's how Next.js handles redirects
      if (err?.message === "NEXT_REDIRECT" || err?.digest?.startsWith("NEXT_REDIRECT")) {
        // This is expected - the redirect will happen automatically
        return
      }
      setErrorMessage(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handlePayment = useCallback(async () => {
    if (!paymentSession?.data) {
      setErrorMessage("Payment session not initialized")
      return
    }

    if (!window.Razorpay) {
      setErrorMessage("Razorpay not loaded")
      return
    }

    setSubmitting(true)
    setMessage(null)

    try {
      const razorpayOrderId = paymentSession.data.razorpay_order_id as string
      const keyId = (paymentSession.data.key_id as string) || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID

      if (!razorpayOrderId) {
        throw new Error("Razorpay order ID not found")
      }

      if (!keyId) {
        throw new Error("Razorpay key ID not configured")
      }

      const options = {
        key: keyId,
        amount: String(paymentSession.data.amount || 0),
        currency: (paymentSession.data.currency as string)?.toUpperCase() || "INR",
        name: "RuggyLand",
        description: "Order Payment",
        order_id: razorpayOrderId,
        handler: async (response: {
          razorpay_order_id: string
          razorpay_payment_id: string
          razorpay_signature: string
        }) => {
          try {
            // Merge existing session data with Razorpay payment response
            const updateData = {
              ...(paymentSession.data || {}),
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }

            // Update the payment session with Razorpay response
            await sdk.store.payment.initiatePaymentSession(
              cart,
              {
                provider_id: paymentSession.provider_id,
                data: updateData,
              }
            )

            // Complete the order
            await onPaymentCompleted()
          } catch (err: any) {
            setErrorMessage(err.message || "Failed to complete payment")
            setSubmitting(false)
          }
        },
        prefill: {
          name: `${cart.shipping_address?.first_name || ""} ${cart.shipping_address?.last_name || ""}`.trim(),
          email: cart.email || "",
          contact: cart.shipping_address?.phone || "",
        },
        notes: {
          session_id: paymentSession.id,
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: () => {
            setSubmitting(false)
            setInfoMessage("No worries! Click the button when you're ready to complete your purchase.")
          },
        },
      }

      const razorpayInstance = new window.Razorpay(options)

      razorpayInstance.on("payment.failed", (response: any) => {
        setErrorMessage(
          response.error?.description || "Payment failed. Please try again."
        )
        setSubmitting(false)
      })

      razorpayInstance.open()
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to initialize payment")
      setSubmitting(false)
    }
  }, [cart, paymentSession])

  return (
    <>
      <Button
        onClick={handlePayment}
        disabled={notReady || submitting || !razorpayLoaded || !paymentSession?.data?.razorpay_order_id}
        size="large"
        isLoading={submitting}
        data-testid={dataTestId}
        className="w-full"
      >
        {submitting ? "Processing..." : "Pay with Razorpay"}
      </Button>
{message && (
        <div
          className={`pt-2 text-small-regular ${
            message.type === "error" ? "text-rose-500" : "text-ui-fg-muted"
          }`}
          data-testid="razorpay-payment-message"
        >
          <span>{message.text}</span>
        </div>
      )}
    </>
  )
}

export default RazorpayPaymentButton
