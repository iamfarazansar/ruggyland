import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http"
import { updateVariantPricesWorkflow } from "../../../../../../../workflows/update-variant-prices"
import { UpdateVariantPricesSchema } from "./middlewares"

export async function POST(
  req: MedusaRequest<UpdateVariantPricesSchema>,
  res: MedusaResponse
) {
  const { variantId } = req.params
  const { prices } = req.validatedBody

  try {
    const { result } = await updateVariantPricesWorkflow(req.scope).run({
      input: {
        variant_id: variantId,
        prices: prices as Array<{ id: string; amount: number }>,
      },
    })

    return res.json({
      success: true,
      variant_id: result.variant_id,
      updated_count: result.updated_count,
    })
  } catch (error) {
    console.error("Error updating variant prices:", error)
    return res.status(500).json({
      message: "Failed to update variant prices",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
