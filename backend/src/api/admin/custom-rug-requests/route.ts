import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { CUSTOM_RUG_MODULE } from "../../../modules/custom-rug";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const svc = req.scope.resolve(CUSTOM_RUG_MODULE) as any;

  const limit = Number((req.query as any)?.limit ?? 50);
  const offset = Number((req.query as any)?.offset ?? 0);

  // If you have listAndCountCustomRugRequests:
  const [requests, count] = await svc.listAndCountCustomRugRequests(
    {},
    { take: limit, skip: offset, order: { created_at: "DESC" } }
  );

  return res.json({ requests, count, limit, offset });
}
