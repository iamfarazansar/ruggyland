"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import {
  getAuthHeaders,
  getCacheOptions,
  getCacheTag,
  getCartId,
  removeAuthToken,
  removeCartId,
  setAuthToken,
} from "./cookies"

export const retrieveCustomer =
  async (): Promise<HttpTypes.StoreCustomer | null> => {
    const authHeaders = await getAuthHeaders()

    if (!authHeaders) return null

    const headers = {
      ...authHeaders,
    }

    const next = {
      ...(await getCacheOptions("customers")),
    }

    return await sdk.client
      .fetch<{ customer: HttpTypes.StoreCustomer }>(`/store/customers/me`, {
        method: "GET",
        query: {
          fields: "*orders",
        },
        headers,
        next,
        cache: "force-cache",
      })
      .then(({ customer }) => customer)
      .catch(() => null)
  }

export const updateCustomer = async (body: HttpTypes.StoreUpdateCustomer) => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  const updateRes = await sdk.store.customer
    .update(body, {}, headers)
    .then(({ customer }) => customer)
    .catch(medusaError)

  const cacheTag = await getCacheTag("customers")
  revalidateTag(cacheTag)

  return updateRes
}

export async function signup(_currentState: unknown, formData: FormData) {
  const password = formData.get("password") as string
  const customerForm = {
    email: formData.get("email") as string,
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    phone: formData.get("phone") as string,
  }

  try {
    const token = await sdk.auth.register("customer", "emailpass", {
      email: customerForm.email,
      password: password,
    })

    await setAuthToken(token as string)

    const headers = {
      ...(await getAuthHeaders()),
    }

    const { customer: createdCustomer } = await sdk.store.customer.create(
      customerForm,
      {},
      headers
    )

    const loginToken = await sdk.auth.login("customer", "emailpass", {
      email: customerForm.email,
      password,
    })

    await setAuthToken(loginToken as string)

    const customerCacheTag = await getCacheTag("customers")
    revalidateTag(customerCacheTag)

    await transferCart()

    return createdCustomer
  } catch (error: any) {
    return error.toString()
  }
}

export async function login(_currentState: unknown, formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    await sdk.auth
      .login("customer", "emailpass", { email, password })
      .then(async (token) => {
        await setAuthToken(token as string)
        const customerCacheTag = await getCacheTag("customers")
        revalidateTag(customerCacheTag)
      })
  } catch (error: any) {
    return error.toString()
  }

  try {
    await transferCart()
  } catch (error: any) {
    return error.toString()
  }
}

export async function signout(countryCode: string) {
  await sdk.auth.logout()

  await removeAuthToken()

  const customerCacheTag = await getCacheTag("customers")
  revalidateTag(customerCacheTag)

  await removeCartId()

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)

  redirect(`/${countryCode}/account`)
}

export async function transferCart() {
  const cartId = await getCartId()

  if (!cartId) {
    return
  }

  const headers = await getAuthHeaders()

  await sdk.store.cart.transferCart(cartId, {}, headers)

  const cartCacheTag = await getCacheTag("carts")
  revalidateTag(cartCacheTag)
}

export const addCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const isDefaultBilling = (currentState.isDefaultBilling as boolean) || false
  const isDefaultShipping = (currentState.isDefaultShipping as boolean) || false

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
    phone: formData.get("phone") as string,
    is_default_billing: isDefaultBilling,
    is_default_shipping: isDefaultShipping,
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .createAddress(address, {}, headers)
    .then(async ({ customer }) => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const deleteCustomerAddress = async (
  addressId: string
): Promise<void> => {
  const headers = {
    ...(await getAuthHeaders()),
  }

  await sdk.store.customer
    .deleteAddress(addressId, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

export const updateCustomerAddress = async (
  currentState: Record<string, unknown>,
  formData: FormData
): Promise<any> => {
  const addressId =
    (currentState.addressId as string) || (formData.get("addressId") as string)

  if (!addressId) {
    return { success: false, error: "Address ID is required" }
  }

  const address = {
    first_name: formData.get("first_name") as string,
    last_name: formData.get("last_name") as string,
    company: formData.get("company") as string,
    address_1: formData.get("address_1") as string,
    address_2: formData.get("address_2") as string,
    city: formData.get("city") as string,
    postal_code: formData.get("postal_code") as string,
    province: formData.get("province") as string,
    country_code: formData.get("country_code") as string,
  } as HttpTypes.StoreUpdateCustomerAddress

  const phone = formData.get("phone") as string

  if (phone) {
    address.phone = phone
  }

  const headers = {
    ...(await getAuthHeaders()),
  }

  return sdk.store.customer
    .updateAddress(addressId, address, {}, headers)
    .then(async () => {
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true, error: null }
    })
    .catch((err) => {
      return { success: false, error: err.toString() }
    })
}

// ============ Google OAuth Functions ============

/**
 * Initiates Google OAuth login flow
 * Returns the Google authorization URL to redirect to
 */
export async function loginWithGoogle(): Promise<{
  location?: string
  error?: string
}> {
  try {
    const result = await sdk.auth.login("customer", "google", {})

    // If result has a location, return it for redirect
    if (typeof result === "object" && result !== null && "location" in result) {
      return { location: (result as { location: string }).location }
    }

    // If result is a token string, user is already authenticated
    if (typeof result === "string") {
      await setAuthToken(result)
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return {}
    }

    return { error: "Unexpected response from Google login" }
  } catch (error: any) {
    return { error: error.toString() }
  }
}

/**
 * Validates the Google OAuth callback and handles account linking
 * If a customer with the same email exists, it links the Google identity
 * Otherwise, creates a new customer
 */
export async function validateGoogleCallback(
  code: string,
  state: string
): Promise<{ success: boolean; error?: string; needsReauth?: boolean }> {
  try {
    console.log("[Google Auth] Validating callback...")

    // Validate callback with Medusa
    const token = await sdk.auth.callback("customer", "google", { code, state })

    console.log(
      "[Google Auth] Token received:",
      token ? "yes" : "no",
      typeof token
    )

    if (!token || typeof token !== "string") {
      console.log("[Google Auth] Invalid token response")
      return { success: false, error: "Failed to validate Google callback" }
    }

    await setAuthToken(token)
    console.log("[Google Auth] Token saved to cookies")

    // Decode the token to get user info
    const { decodeToken } = await import("react-jwt")
    const decoded = decodeToken<{
      actor_id?: string
      email?: string
      app_metadata?: { customer_id?: string }
      user_metadata?: {
        email?: string
        name?: string
        given_name?: string
        family_name?: string
      }
    }>(token)

    console.log("[Google Auth] Decoded token:", JSON.stringify(decoded))

    // Email can be in decoded.email OR decoded.user_metadata.email
    const email = decoded?.email || decoded?.user_metadata?.email
    const customerId = decoded?.app_metadata?.customer_id
    const actorId = decoded?.actor_id

    console.log(
      "[Google Auth] Extracted: email=",
      email,
      "customerId=",
      customerId,
      "actorId=",
      actorId
    )

    // Check if customer is linked (actor_id has value and is not empty)
    if (actorId && actorId !== "") {
      console.log("[Google Auth] Customer already linked, proceeding...")
      await transferCart()
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)
      return { success: true }
    }

    // If actor_id is empty, we need to create/link customer
    if (email) {
      console.log("[Google Auth] Creating new customer for:", email)

      // Extract name from Google OAuth user_metadata
      const firstName =
        decoded?.user_metadata?.given_name ||
        decoded?.user_metadata?.name?.split(" ")[0] ||
        ""
      const lastName =
        decoded?.user_metadata?.family_name ||
        decoded?.user_metadata?.name?.split(" ").slice(1).join(" ") ||
        ""

      console.log("[Google Auth] User name:", firstName, lastName)

      try {
        const headers = await getAuthHeaders()
        await sdk.store.customer.create(
          {
            email,
            first_name: firstName,
            last_name: lastName,
          },
          {},
          headers
        )
        console.log("[Google Auth] Customer created successfully")

        // CRITICAL: Immediate Server-Side Refresh (from GitHub issue #14251)
        // We manually pass the initialToken in headers because cookies aren't fully set yet.
        // This exchanges the Identity Token for a full Customer Token immediately.
        console.log("[Google Auth] Refreshing token server-side...")
        const refreshedToken = await sdk.auth.refresh({
          Authorization: `Bearer ${token}`,
        })

        if (refreshedToken && typeof refreshedToken === "string") {
          await setAuthToken(refreshedToken)
          console.log(
            "[Google Auth] Refreshed token saved - single-step flow complete!"
          )
        } else {
          console.log(
            "[Google Auth] Refresh didn't return token, keeping original"
          )
        }
      } catch (createError: any) {
        console.log(
          "[Google Auth] Customer creation error (may already exist):",
          createError.message
        )
        // If customer already exists, still try to refresh the token
        try {
          const refreshedToken = await sdk.auth.refresh({
            Authorization: `Bearer ${token}`,
          })
          if (refreshedToken && typeof refreshedToken === "string") {
            await setAuthToken(refreshedToken)
          }
        } catch (refreshError) {
          console.log("[Google Auth] Token refresh failed:", refreshError)
        }
      }

      // Transfer cart and invalidate cache
      await transferCart()
      const customerCacheTag = await getCacheTag("customers")
      revalidateTag(customerCacheTag)

      // Single-step flow complete - no more needsReauth!
      return { success: true }
    } else {
      console.log("[Google Auth] No email found in token!")
      return { success: false, error: "No email found in Google account" }
    }
  } catch (error: any) {
    console.error("[Google Auth] Error:", error)
    return { success: false, error: error.toString() }
  }
}
