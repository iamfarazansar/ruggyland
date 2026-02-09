import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  try {
    const pricingModule = req.scope.resolve(Modules.PRICING);

    // Fetch all price lists with select to include metadata
    const priceLists = await pricingModule.listPriceLists(
      {},
      {
        take: 100,
        select: [
          "id",
          "title",
          "description",
          "status",
          "type",
          "created_at",
          "updated_at",
          "metadata",
        ],
      },
    );

    console.log("=== PRICE LISTS DEBUG ===");
    console.log("Total price lists:", priceLists.length);

    // Map to include all relevant fields + detect inflation from description for backward compatibility
    const result = priceLists.map((pl: any) => {
      console.log(`Price list ${pl.id}: metadata=`, pl.metadata);

      // Check metadata first, then fall back to parsing description for legacy price lists
      let isInflated = false;
      let discountPercentage: number | null = null;

      if (pl.metadata?.is_inflated !== undefined) {
        isInflated = pl.metadata.is_inflated === true;
        discountPercentage = pl.metadata.discount_percentage || null;
      } else if (pl.description) {
        // Legacy: check if description contains "inflated" keyword or RESTORE_DATA
        if (
          pl.description.includes("RESTORE_DATA:") ||
          pl.description.includes("inflated")
        ) {
          isInflated = true;
        }
        // Try to parse discount from description
        const match = pl.description.match(/(\d+)%/);
        if (match) {
          discountPercentage = parseInt(match[1], 10);
        }
      }

      return {
        id: pl.id,
        title: pl.title,
        description: pl.description,
        status: pl.status,
        type: pl.type,
        created_at: pl.created_at,
        updated_at: pl.updated_at,
        metadata: {
          is_inflated: isInflated,
          discount_percentage: discountPercentage,
          restore_data: pl.metadata?.restore_data || null,
          ...pl.metadata,
        },
      };
    });

    return res.json({
      price_lists: result,
      count: result.length,
    });
  } catch (error: any) {
    console.error("List price lists error:", error);
    return res.status(500).json({
      error: "Failed to fetch price lists",
      details: error?.message || "Unknown error",
    });
  }
}
