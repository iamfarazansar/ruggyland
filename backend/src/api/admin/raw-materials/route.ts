import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import RawMaterialsService from "../../../modules/raw_materials/service";
import { RAW_MATERIALS_MODULE } from "../../../modules/raw_materials";

// GET /admin/raw-materials - List all materials
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const rawMaterialsService: RawMaterialsService =
    req.scope.resolve(RAW_MATERIALS_MODULE);

  try {
    const { category, is_active, supplier_id } = req.query;

    const filters: Record<string, any> = {};
    if (category) filters.category = category;
    if (is_active !== undefined) filters.is_active = is_active === "true";
    if (supplier_id) filters.supplier_id = supplier_id;

    const materials = await rawMaterialsService.listMaterials(filters);

    res.json({
      materials,
      count: materials.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// POST /admin/raw-materials - Create a material
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const rawMaterialsService: RawMaterialsService =
    req.scope.resolve(RAW_MATERIALS_MODULE);

  try {
    const material = await rawMaterialsService.createMaterials(req.body);

    res.status(201).json({ material });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
