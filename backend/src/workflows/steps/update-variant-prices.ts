import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { Modules } from "@medusajs/framework/utils"

type UpdateVariantPricesInput = {
  variant_id: string
  prices: Array<{
    id: string
    amount: number
  }>
}

export const updateVariantPricesStep = createStep(
  "update-variant-prices",
  async (input: UpdateVariantPricesInput, { container }) => {
    const pricingModule = container.resolve(Modules.PRICING)

    // Fetch current prices for rollback (keyed by price ID)
    const priceIds = input.prices.map((p) => p.id)
    const currentPrices = await pricingModule.listPrices(
      { id: priceIds },
      { take: 1000 }
    )

    const oldPricesMap = new Map<string, number>()
    currentPrices.forEach((price: any) => {
      oldPricesMap.set(price.id, price.amount)
    })

    // Update prices with new amounts
    const priceUpdates = input.prices.map((p) => ({
      id: p.id,
      amount: p.amount,
    }))

    if (priceUpdates.length > 0) {
      await (pricingModule as any).updatePrices(priceUpdates)
    }

    return new StepResponse(
      { variant_id: input.variant_id, updated_count: priceUpdates.length },
      {
        priceUpdates: priceUpdates.map((pu) => ({
          id: pu.id,
          old_amount: oldPricesMap.get(pu.id) || 0,
        })),
      }
    )
  },
  async (compensationData, { container }) => {
    if (!compensationData || !compensationData.priceUpdates) return

    const pricingModule = container.resolve(Modules.PRICING)

    // Rollback: restore old prices
    const rollbackUpdates = compensationData.priceUpdates.map((pu: any) => ({
      id: pu.id,
      amount: pu.old_amount,
    }))

    if (rollbackUpdates.length > 0) {
      await (pricingModule as any).updatePrices(rollbackUpdates)
    }
  }
)
