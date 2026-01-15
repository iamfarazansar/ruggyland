import {
  createStep,
  createWorkflow,
  StepResponse,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import { CUSTOM_RUG_MODULE } from "../modules/custom-rug";

export type CreateCustomRugRequestInput = {
  client_request_id?: string;

  name: string;
  email: string;
  phone?: string;

  width: number;
  height: number;
  unit: "in" | "cm" | "ft";
  shape: "rectangle" | "round" | "oval" | "custom";

  budgetMin?: number;
  budgetMax?: number;
  currency: string;

  notes?: string;
  referenceImages?: string[];
};

const createCustomRugRequestStep = createStep(
  "create-custom-rug-request",
  async (input: CreateCustomRugRequestInput, { container }) => {
    const svc = container.resolve(CUSTOM_RUG_MODULE) as any;

    const created = await svc.createCustomRugRequests({
      ...input,
      status: "new",
    });

    return new StepResponse(created, created.id);
  },
  async (id: string, { container }) => {
    const svc = container.resolve(CUSTOM_RUG_MODULE) as any;
    await svc.deleteCustomRugRequests(id);
  }
);

export const createCustomRugRequestWorkflow = createWorkflow(
  "create-custom-rug-request-workflow",
  (input: CreateCustomRugRequestInput) => {
    const created = createCustomRugRequestStep(input);
    return new WorkflowResponse(created);
  }
);
