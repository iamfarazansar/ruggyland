import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";
import { UpdateVariantPricesSchema } from "./middlewares";

export async function POST(
  req: MedusaRequest<UpdateVariantPricesSchema>,
  res: MedusaResponse,
) {
  const { prices } = req.validatedBody;

  try {
    const pricingModule = req.scope.resolve(Modules.PRICING);

    // Separate into updates (has id) and creates (no id)
    const pricesToUpdate = (prices || []).filter((p: any) => p.id);
    const pricesToCreate = (prices || []).filter((p: any) => !p.id);

    let updatedCount = 0;
    let createdCount = 0;

    // Update existing prices - same pattern as sale-pricing
    if (pricesToUpdate.length > 0) {
      const priceUpdates = pricesToUpdate.map((p: any) => ({
        id: p.id,
        amount: p.amount,
      }));

      await (pricingModule as any).updatePrices(priceUpdates);
      updatedCount = pricesToUpdate.length;
    }

    // For new prices, we skip creation here since it requires price_set_id
    // The user should create new prices via the Medusa Admin panel
    createdCount = 0;

    return res.json({
      success: true,
      updated_count: updatedCount,
      created_count: createdCount,
    });
  } catch (error) {
    console.error("Error updating variant prices:", error);
    return res.status(500).json({
      message: "Failed to update variant prices",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
