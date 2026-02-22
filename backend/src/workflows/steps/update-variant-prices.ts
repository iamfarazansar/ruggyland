import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

type UpdateVariantPricesInput = {
  variant_id: string
  prices: Array<{
    id?: string  // Optional - undefined for new prices
    currency_code: string
    region_id?: string
    amount: number
  }>
}

export const updateVariantPricesStep = createStep(
  "update-variant-prices",
  async (input: UpdateVariantPricesInput, { container }) => {
    const pricingModule = container.resolve(Modules.PRICING)

    // Separate prices into creates and updates
    const pricesToCreate = input.prices.filter((p) => !p.id)
    const pricesToUpdate = input.prices.filter((p) => p.id)

    // Fetch current prices for rollback (for updates only)
    const oldPricesMap = new Map<string, number>()
    if (pricesToUpdate.length > 0) {
      const priceIds = pricesToUpdate.map((p) => p.id!)
      const currentPrices = await pricingModule.listPrices(
        { id: priceIds },
        { take: 1000 }
      )

      currentPrices.forEach((price: any) => {
        oldPricesMap.set(price.id, price.amount)
      })
    }

    const createdPriceIds: string[] = []

    // Create new prices
    if (pricesToCreate.length > 0) {
      const newPrices = await (pricingModule as any).createPrices(
        pricesToCreate.map((p) => ({
          variant_id: input.variant_id,
          currency_code: p.currency_code,
          amount: p.amount,
        }))
      )

      // Create price rules for regional prices
      const priceRulesToCreate: any[] = []
      newPrices.forEach((newPrice: any, index: number) => {
        createdPriceIds.push(newPrice.id)
        const originalPrice = pricesToCreate[index]
        if (originalPrice.region_id) {
          priceRulesToCreate.push({
            price_id: newPrice.id,
            attribute: "region_id",
            value: originalPrice.region_id,
          })
        }
      })

      if (priceRulesToCreate.length > 0) {
        await (pricingModule as any).createPriceRules(priceRulesToCreate)
      }
    }

    // Update existing prices
    if (pricesToUpdate.length > 0) {
      const priceUpdates = pricesToUpdate.map((p) => ({
        id: p.id!,
        amount: p.amount,
      }))

      await (pricingModule as any).updatePrices(priceUpdates)
    }

    return new StepResponse(
      {
        variant_id: input.variant_id,
        created_count: pricesToCreate.length,
        updated_count: pricesToUpdate.length,
      },
      {
        createdPriceIds,
        priceUpdates: pricesToUpdate.map((pu) => ({
          id: pu.id!,
          old_amount: oldPricesMap.get(pu.id!) || 0,
        })),
      }
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData) return

    const pricingModule = container.resolve(Modules.PRICING)

    // Rollback: delete created prices
    if (compensationData.createdPriceIds && compensationData.createdPriceIds.length > 0) {
      await (pricingModule as any).deletePrices(compensationData.createdPriceIds)
    }

    // Rollback: restore old prices
    if (compensationData.priceUpdates && compensationData.priceUpdates.length > 0) {
      const rollbackUpdates = compensationData.priceUpdates.map((pu: any) => ({
        id: pu.id,
        amount: pu.old_amount,
      }))

      await (pricingModule as any).updatePrices(rollbackUpdates)
    }
  }
)
