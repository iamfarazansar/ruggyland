import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { createPriceListsWorkflow } from "@medusajs/medusa/core-flows";
import { Modules } from "@medusajs/framework/utils";

interface ApplySaleInput {
  product_ids: string[];
  discount_percentage: number;
  price_list_title?: string;
  inflate_base_prices?: boolean;
}

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const {
    product_ids,
    discount_percentage,
    price_list_title,
    inflate_base_prices = true,
  } = req.body as ApplySaleInput;

  // Validate input
  if (!product_ids || product_ids.length === 0) {
    return res
      .status(400)
      .json({ error: "At least one product must be selected" });
  }
  if (
    !discount_percentage ||
    discount_percentage <= 0 ||
    discount_percentage >= 100
  ) {
    return res.status(400).json({ error: "Discount must be between 1 and 99" });
  }

  try {
    const query = req.scope.resolve("query");
    const pricingModule = req.scope.resolve(Modules.PRICING);

    // Step 1: Fetch current prices for selected products
    const { data: products } = await query.graph({
      entity: "product",
      fields: [
        "id",
        "title",
        "variants.id",
        "variants.title",
        "variants.prices.id",
        "variants.prices.amount",
        "variants.prices.currency_code",
        "variants.prices.price_list_id",
        "variants.prices.price_set_id",
      ],
      filters: {
        id: product_ids,
      },
    });

    console.log("=== APPLY SALE DEBUG ===");
    console.log("Products fetched:", products?.length);
    console.log("Inflate base prices:", inflate_base_prices);

    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ error: "No products found for the given IDs" });
    }

    // Collect all price IDs to fetch their rules
    const allPriceIds: string[] = [];
    for (const product of products) {
      if (!product.variants?.length) continue;
      for (const variant of product.variants as any[]) {
        if (!variant.prices?.length) continue;
        for (const price of variant.prices) {
          if (!price.price_list_id) {
            allPriceIds.push(price.id);
          }
        }
      }
    }

    // Fetch price rules for all base prices to get region_id associations
    console.log("Fetching price rules for", allPriceIds.length, "prices");
    const priceRules = await pricingModule.listPriceRules(
      { price_id: allPriceIds },
      { take: 1000 },
    );
    console.log("Price rules fetched:", priceRules.length);

    // Build a map: price_id -> { region_id: string }
    const priceRulesMap = new Map<string, Record<string, string>>();
    for (const rule of priceRules) {
      const priceId = rule.price_id;
      if (rule.attribute === "region_id") {
        if (!priceRulesMap.has(priceId)) {
          priceRulesMap.set(priceId, {});
        }
        priceRulesMap.get(priceId)![rule.attribute] = rule.value;
      }
    }

    // Step 2: Collect prices and calculate amounts
    const priceRestoreData: Array<{
      price_id: string;
      original_amount: number;
      currency_code: string;
    }> = [];
    const priceListPrices: Array<{
      amount: number;
      currency_code: string;
      variant_id: string;
      rules?: Record<string, string>;
    }> = [];

    const priceUpdates: Array<{
      id: string;
      amount: number;
    }> = [];

    let totalVariantsProcessed = 0;
    let totalPricesProcessed = 0;

    for (const product of products) {
      console.log(`Product ${product.id}: ${product.title}`);
      if (!product.variants?.length) continue;

      for (const variant of product.variants as any[]) {
        console.log(`  Variant ${variant.id}: ${variant.title}`);

        if (!variant.prices?.length) continue;

        const basePrices = variant.prices.filter((p: any) => !p.price_list_id);
        console.log(`  Base prices count: ${basePrices.length}`);

        if (basePrices.length === 0) continue;

        for (const price of basePrices) {
          const currentAmount = price.amount;
          const regionRules = priceRulesMap.get(price.id) || {};
          totalPricesProcessed++;

          if (inflate_base_prices) {
            const newBaseAmount = Math.round(
              currentAmount / (1 - discount_percentage / 100),
            );

            console.log(
              `    Price ${price.id} (${price.currency_code}): ${currentAmount} -> ${newBaseAmount}`,
            );

            // Store for reset - THIS IS CRITICAL
            priceRestoreData.push({
              price_id: price.id,
              original_amount: currentAmount,
              currency_code: price.currency_code,
            });

            priceUpdates.push({
              id: price.id,
              amount: newBaseAmount,
            });

            const priceListEntry: any = {
              amount: currentAmount,
              currency_code: price.currency_code,
              variant_id: variant.id,
            };

            if (Object.keys(regionRules).length > 0) {
              priceListEntry.rules = regionRules;
            }

            priceListPrices.push(priceListEntry);
          } else {
            const saleAmount = Math.round(
              currentAmount * (1 - discount_percentage / 100),
            );

            console.log(
              `    Price ${price.id} (${price.currency_code}): ${currentAmount} -> sale ${saleAmount}`,
            );

            const priceListEntry: any = {
              amount: saleAmount,
              currency_code: price.currency_code,
              variant_id: variant.id,
            };

            if (Object.keys(regionRules).length > 0) {
              priceListEntry.rules = regionRules;
            }

            priceListPrices.push(priceListEntry);
          }
        }

        totalVariantsProcessed++;
      }
    }

    console.log(`Total prices to process: ${totalPricesProcessed}`);
    console.log("=== RESTORE DATA ===");
    console.log(JSON.stringify(priceRestoreData, null, 2));

    if (totalPricesProcessed === 0) {
      return res
        .status(400)
        .json({ error: "No prices found to update in selected products" });
    }

    // Step 3: Update base prices if inflating
    if (inflate_base_prices && priceUpdates.length > 0) {
      console.log("Updating prices via Pricing Module...");
      await (pricingModule as any).updatePrices(priceUpdates);
      console.log("Prices updated successfully!");
    }

    // Step 4: Create price list
    const title =
      price_list_title ||
      `Sale ${discount_percentage}% OFF - ${new Date().toLocaleDateString("en-IN")}`;

    // Encode restore data in description for reliability (metadata may not be supported)
    const restoreDataJson = inflate_base_prices
      ? JSON.stringify(priceRestoreData)
      : "";
    const description = inflate_base_prices
      ? `Auto-generated ${discount_percentage}% sale with inflated base prices. RESTORE_DATA:${restoreDataJson}`
      : `Auto-generated ${discount_percentage}% sale (no base price inflation).`;

    console.log("Creating price list...");

    const { result: priceListResult } = await createPriceListsWorkflow(
      req.scope,
    ).run({
      input: {
        price_lists_data: [
          {
            title,
            name: title,
            description,
            status: "active",
            type: "sale",
            prices: priceListPrices,
          } as any,
        ],
      },
    });

    const createdPriceList = priceListResult?.[0];
    console.log("Price list created:", createdPriceList?.id);

    // Step 5: Update the price list with metadata (since workflow may not support it)
    if (createdPriceList?.id) {
      try {
        await (pricingModule as any).updatePriceLists([
          {
            id: createdPriceList.id,
            metadata: {
              is_inflated: inflate_base_prices,
              discount_percentage,
              restore_data: inflate_base_prices ? priceRestoreData : null,
            },
          },
        ]);
        console.log("Price list metadata updated!");
      } catch (metaErr: any) {
        console.log(
          "Failed to update metadata (may not be supported):",
          metaErr.message,
        );
      }
    }

    console.log("=== APPLY SALE COMPLETE ===");

    return res.json({
      success: true,
      message: inflate_base_prices
        ? `Sale pricing applied to ${totalVariantsProcessed} variants (${totalPricesProcessed} prices) with base price inflation`
        : `Sale pricing applied to ${totalVariantsProcessed} variants (${totalPricesProcessed} prices) without base price inflation`,
      discount_percentage,
      inflate_base_prices,
      variants_updated: totalVariantsProcessed,
      prices_updated: totalPricesProcessed,
      price_list: createdPriceList || null,
    });
  } catch (error: any) {
    console.error("Apply sale error:", error);
    return res.status(500).json({
      error: "Failed to apply sale",
      details: error?.message || "Unknown error",
    });
  }
}
