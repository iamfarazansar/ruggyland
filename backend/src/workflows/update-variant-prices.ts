import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updateVariantPricesStep } from "./steps/update-variant-prices"

type UpdateVariantPricesWorkflowInput = {
  variant_id: string
  prices: Array<{
    id?: string  // Optional - undefined for new prices
    currency_code: string
    region_id?: string
    amount: number
  }>
}

export const updateVariantPricesWorkflow = createWorkflow(
  "update-variant-prices",
  function (input: UpdateVariantPricesWorkflowInput) {
    const result = updateVariantPricesStep(input)

    return new WorkflowResponse(result)
  }
)
