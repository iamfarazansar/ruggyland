import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import RawMaterialsService from "../../../../../modules/raw_materials/service";
import { RAW_MATERIALS_MODULE } from "../../../../../modules/raw_materials";

interface AdjustStockBody {
  quantity: number;
  type: "in" | "out" | "adjust";
  reason?: string;
  notes?: string;
  work_order_id?: string;
  created_by?: string;
}

// POST /admin/raw-materials/:id/adjust - Adjust stock
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const rawMaterialsService: RawMaterialsService =
    req.scope.resolve(RAW_MATERIALS_MODULE);
  const { id } = req.params;
  const { quantity, type, reason, notes, work_order_id, created_by } =
    req.body as AdjustStockBody;

  try {
    if (!quantity || !type) {
      res.status(400).json({ error: "quantity and type are required" });
      return;
    }

    if (!["in", "out", "adjust"].includes(type)) {
      res.status(400).json({ error: "type must be 'in', 'out', or 'adjust'" });
      return;
    }

    const result = await rawMaterialsService.adjustStock(id, quantity, type, {
      reason,
      notes,
      work_order_id,
      created_by,
    });

    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
