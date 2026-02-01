import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import RawMaterialsService from "../../../modules/raw_materials/service";
import { RAW_MATERIALS_MODULE } from "../../../modules/raw_materials";

// GET /admin/stock-movements - List all stock movements
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const rawMaterialsService: RawMaterialsService =
    req.scope.resolve(RAW_MATERIALS_MODULE);

  try {
    const { material_id, type, work_order_id, limit = 50 } = req.query;

    const filters: Record<string, any> = {};
    if (material_id) filters.material_id = material_id;
    if (type) filters.type = type;
    if (work_order_id) filters.work_order_id = work_order_id;

    const movements = await rawMaterialsService.listStockMovements(filters, {
      order: { created_at: "DESC" },
      take: Number(limit),
    });

    res.json({
      movements,
      count: movements.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
