import { createWorkflow, WorkflowResponse } from "@medusajs/framework/workflows-sdk"
import { updateVariantPricesStep } from "./steps/update-variant-prices"

type UpdateVariantPricesWorkflowInput = {
  variant_id: string
  prices: Array<{
    id: string
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
