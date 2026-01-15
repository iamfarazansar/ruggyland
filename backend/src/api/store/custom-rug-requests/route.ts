import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { z } from "zod";

import {
  createCustomRugRequestWorkflow,
  type CreateCustomRugRequestInput,
} from "../../../workflows/create-custom-rug-request";

// ✅ Zod schema used by validateAndTransformBody middleware
export const CustomRugRequestSchema = z.object({
  client_request_id: z.string().optional(),

  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),

  width: z.number(),
  height: z.number(),
  unit: z.enum(["in", "cm", "ft"]),
  shape: z.enum(["rectangle", "round", "oval", "custom"]),

  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  currency: z.string().default("USD"),

  notes: z.string().optional(),
  referenceImages: z.array(z.string()).optional(),
});

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  // validatedBody is typed as unknown in Medusa, so cast it to your workflow input type
  const input = req.validatedBody as CreateCustomRugRequestInput;

  const { result } = await createCustomRugRequestWorkflow(req.scope).run({
    input,
  });

  return res.status(201).json({
    id: result.id,
    status: result.status,
  });
}
