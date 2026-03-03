"use server"

import { updateCart } from "./cart"

export async function syncMetaCookiesToCart(
  fbc: string | null,
  fbp: string | null
) {
  if (!fbc && !fbp) return
  try {
    await updateCart({
      metadata: {
        ...(fbc && { fbc }),
        ...(fbp && { fbp }),
      },
    })
  } catch {
    // Non-critical — fail silently
  }
}
