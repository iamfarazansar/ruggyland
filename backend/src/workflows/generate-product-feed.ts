import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { getProductFeedItemsStep } from "./steps/get-product-feed-items";
import { buildProductFeedXmlStep } from "./steps/build-product-feed-xml";

export type GenerateProductFeedInput = {
  currency_code: string;
  country_code: string;
};

export const generateProductFeedWorkflow = createWorkflow(
  "generate-product-feed-workflow",
  (input: GenerateProductFeedInput) => {
    const { items: feedItems } = getProductFeedItemsStep(input);
    const xml = buildProductFeedXmlStep({ items: feedItems });
    return new WorkflowResponse(xml);
  },
);
