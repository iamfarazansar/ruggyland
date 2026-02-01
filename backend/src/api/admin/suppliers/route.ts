import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import RawMaterialsService from "../../../modules/raw_materials/service";
import { RAW_MATERIALS_MODULE } from "../../../modules/raw_materials";

// GET /admin/suppliers - List all suppliers
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const rawMaterialsService: RawMaterialsService =
    req.scope.resolve(RAW_MATERIALS_MODULE);

  try {
    const { is_active } = req.query;

    const filters: Record<string, any> = {};
    if (is_active !== undefined) filters.is_active = is_active === "true";

    const suppliers = await rawMaterialsService.listSuppliers(filters);

    res.json({
      suppliers,
      count: suppliers.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// POST /admin/suppliers - Create a supplier
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const rawMaterialsService: RawMaterialsService =
    req.scope.resolve(RAW_MATERIALS_MODULE);

  try {
    const supplier = await rawMaterialsService.createSuppliers(req.body);

    res.status(201).json({ supplier });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
