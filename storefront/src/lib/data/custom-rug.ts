"use server"

import { sdk } from "@lib/config"

export type CustomRugRequestResponse = {
  id: string
  status?: string
}

export type CustomRugRequestPayload = {
  client_request_id?: string

  name: string
  email: string
  phone?: string

  width: number
  height: number
  unit: "in" | "cm" | "ft"
  shape: "rectangle" | "round" | "oval" | "custom"

  budgetMin?: number
  budgetMax?: number
  currency: string

  notes?: string
  referenceImages?: string[]
}

export const submitCustomRugRequest = async (
  payload: CustomRugRequestPayload
): Promise<CustomRugRequestResponse> => {
  // ✅ strongly typed response
  return await sdk.client.fetch<CustomRugRequestResponse>(
    `/store/custom-rug-requests`,
    {
      method: "POST",
      body: payload,
    }
  )
}
