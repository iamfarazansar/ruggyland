import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import RawMaterialsService from "../../../../modules/raw_materials/service";
import { RAW_MATERIALS_MODULE } from "../../../../modules/raw_materials";

// GET /admin/raw-materials/low-stock - Get materials below min stock level
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const rawMaterialsService: RawMaterialsService =
    req.scope.resolve(RAW_MATERIALS_MODULE);

  try {
    const materials = await rawMaterialsService.getLowStockMaterials();

    res.json({
      materials,
      count: materials.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
