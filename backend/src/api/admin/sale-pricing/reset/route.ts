import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { deletePriceListsWorkflow } from "@medusajs/medusa/core-flows";
import { Modules } from "@medusajs/framework/utils";

interface ResetSaleInput {
  price_list_id: string;
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { price_list_id } = req.body as ResetSaleInput;

  if (!price_list_id) {
    return res.status(400).json({ error: "price_list_id is required" });
  }

  try {
    const pricingModule = req.scope.resolve(Modules.PRICING);

    // Get the price list with metadata using listPriceLists with filter
    const priceLists = await pricingModule.listPriceLists(
      { id: [price_list_id] },
      {
        take: 1,
        select: ["id", "title", "description", "status", "type", "metadata"],
      },
    );

    if (!priceLists || priceLists.length === 0) {
      return res.status(404).json({ error: "Price list not found" });
    }

    const priceList = priceLists[0] as any;

    console.log("=== RESET DEBUG ===");
    console.log("Price list:", priceList.title);
    console.log("Raw price list object keys:", Object.keys(priceList));
    console.log("Metadata from priceList:", priceList.metadata);
    console.log("Description:", priceList.description);

    // Get metadata - check both direct property and potential nested structure
    let metadata = priceList.metadata || {};
    console.log("Final metadata:", JSON.stringify(metadata, null, 2));

    // Determine if inflated from metadata or description
    let isInflated = metadata.is_inflated === true;
    let restoreData: Array<{
      price_id: string;
      original_amount: number;
      currency_code: string;
    }> | null = null;

    // Check for restore data in metadata first
    if (metadata?.restore_data && Array.isArray(metadata.restore_data)) {
      restoreData = metadata.restore_data;
      isInflated = true;
      console.log("Using restore data from metadata");
    }

    // Fallback: check description for legacy format
    if (!restoreData && priceList.description) {
      const description = priceList.description;

      // Check for RESTORE_DATA in description (legacy format)
      const restoreDataMatch = description.match(/RESTORE_DATA:(.+)$/);
      if (restoreDataMatch) {
        try {
          restoreData = JSON.parse(restoreDataMatch[1]);
          isInflated = true;
          console.log("Using restore data from description (legacy)");
        } catch (e) {
          console.log("Failed to parse restore data from description:", e);
        }
      }

      // Also check for "inflated" keyword
      if (!isInflated && description.includes("inflated")) {
        isInflated = true;
      }
    }

    console.log("Is inflated:", isInflated);
    console.log("Restore data found:", restoreData?.length || 0, "items");

    let pricesReset = 0;

    // Only restore prices if we have restore data
    if (isInflated && restoreData && restoreData.length > 0) {
      console.log("Restore data:", JSON.stringify(restoreData, null, 2));

      // Create price updates based on the restore data
      const priceUpdates: Array<{ id: string; amount: number }> = [];

      for (const item of restoreData) {
        console.log(
          `Restoring price ${item.price_id} (${item.currency_code}) to ${item.original_amount}`,
        );
        priceUpdates.push({
          id: item.price_id,
          amount: item.original_amount,
        });
      }

      // Update prices directly using Pricing Module
      if (priceUpdates.length > 0) {
        console.log("Updating prices via Pricing Module...");
        console.log("Price updates:", JSON.stringify(priceUpdates, null, 2));
        await (pricingModule as any).updatePrices(priceUpdates);
        console.log("Prices updated successfully!");
        pricesReset = priceUpdates.length;
      }
    } else if (isInflated) {
      console.log("Sale marked as inflated but no restore data found");
    } else {
      console.log("Sale was not inflated, skipping price restoration");
    }

    // Delete the price list
    await deletePriceListsWorkflow(req.scope).run({
      input: {
        ids: [price_list_id],
      },
    });

    console.log("=== RESET COMPLETE ===");

    const message =
      pricesReset > 0
        ? `Reset ${pricesReset} prices and deleted price list "${priceList.title}"`
        : `Deleted price list "${priceList.title}" (no price restoration needed)`;

    return res.json({
      success: true,
      message,
      was_inflated: isInflated,
      prices_reset: pricesReset,
      deleted_price_list_id: price_list_id,
    });
  } catch (error: any) {
    console.error("Reset prices error:", error);
    return res.status(500).json({
      error: "Failed to reset prices",
      details: error?.message || "Unknown error",
    });
  }
}
