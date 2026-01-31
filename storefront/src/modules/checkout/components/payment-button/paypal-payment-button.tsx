"use client"

import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js"
import { placeOrder } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import React, { useState } from "react"

type PayPalPaymentButtonProps = {
  cart: HttpTypes.StoreCart
  notReady: boolean
  "data-testid"?: string
}

type MessageType = "error" | "info"

const PayPalPaymentButton: React.FC<PayPalPaymentButtonProps> = ({
  cart,
  notReady,
  "data-testid": dataTestId,
}) => {
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: MessageType } | null>(null)

  const setErrorMessage = (text: string) => setMessage({ text, type: "error" })
  const setInfoMessage = (text: string) => setMessage({ text, type: "info" })
  const [{ isResolved }] = usePayPalScriptReducer()

  const paymentSession = cart.payment_collection?.payment_sessions?.find(
    (s) => s.status === "pending"
  )

  // TODO: add function handlers
  const onPaymentCompleted = async () => {
    await placeOrder()
      .catch((err) => {
        setErrorMessage(err.message)
      })
      .finally(() => {
        setSubmitting(false)
      })
  }

  // Get PayPal order ID from payment session data
  // The Medusa PayPal provider should create a PayPal order during initialization
  // and store the order ID in the payment session data
  const getPayPalOrderId = (): string | null => {
    if (!paymentSession?.data) {
      return null
    }

    // Try different possible keys where the order ID might be stored
    return (
      (paymentSession.data.order_id as string) ||
      (paymentSession.data.orderId as string) ||
      (paymentSession.data.id as string) ||
      null
    )
  }

  const createOrder = async () => {
    setSubmitting(true)
    setMessage(null)

    try {
      if (!paymentSession) {
        throw new Error("Payment session not found")
      }

      // Check if Medusa server already created a PayPal order
      const existingOrderId = getPayPalOrderId()

      if (existingOrderId) {
        // Medusa already created the order, use that order ID
        return existingOrderId
      }

      // If no order ID exists, we need to create one
      // This might happen if the PayPal provider doesn't create orders during initialization
      // In this case, we'll need to create the order via PayPal API
      // For now, throw an error - the backend should handle order creation
      throw new Error(
        "PayPal order not found. Please ensure the payment session is properly initialized."
      )
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to create PayPal order")
      setSubmitting(false)
      throw error
    }
  }

  const onApprove = async (_data: { orderID: string }) => {
    try {
      setSubmitting(true)
      setMessage(null)

      // After PayPal approval, place the order
      // The Medusa server will handle the payment authorization
      await onPaymentCompleted()
    } catch (error: any) {
      setErrorMessage(error.message || "Failed to process PayPal payment")
      setSubmitting(false)
    }
  }

  const onError = (err: Record<string, unknown>) => {
    setErrorMessage(
      (err.message as string) || "An error occurred with PayPal payment"
    )
    setSubmitting(false)
  }

  const onCancel = () => {
    setSubmitting(false)
    setInfoMessage("No worries! Click the button when you're ready to complete your purchase.")
  }

  // TODO: add a return statement
  // If PayPal SDK is not ready, show a loading button
  if (!isResolved) {
    return (
      <>
        <Button
          disabled={true}
          size="large"
          isLoading={true}
          data-testid={dataTestId}
        >
          Loading PayPal...
        </Button>
        {message && (
          <div
            className={`pt-2 text-small-regular ${
              message.type === "error" ? "text-rose-500" : "text-ui-fg-muted"
            }`}
            data-testid="paypal-payment-message"
          >
            <span>{message.text}</span>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <div className="mb-4">
        <PayPalButtons
          createOrder={createOrder}
          onApprove={onApprove}
          onError={onError}
          onCancel={onCancel}
          style={{
            layout: "horizontal",
            color: "black",
            shape: "rect",
            label: "buynow",
          }}
          disabled={notReady || submitting}
        />
      </div>
      {message && (
        <div
          className={`pt-2 text-small-regular ${
            message.type === "error" ? "text-rose-500" : "text-ui-fg-muted"
          }`}
          data-testid="paypal-payment-message"
        >
          <span>{message.text}</span>
        </div>
      )}
    </>
  )
}

export default PayPalPaymentButton
