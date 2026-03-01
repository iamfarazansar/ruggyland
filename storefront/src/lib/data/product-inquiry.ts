"use server"

import { sdk } from "@lib/config"

export type ProductInquiryPayload = {
  product_id?: string
  product_handle?: string
  product_title: string
  name: string
  email: string
  phone?: string
  message: string
}

export const submitProductInquiry = async (
  payload: ProductInquiryPayload
): Promise<{ inquiry: { id: string } }> => {
  return await sdk.client.fetch<{ inquiry: { id: string } }>(
    `/store/product-inquiries`,
    {
      method: "POST",
      body: payload,
    }
  )
}
