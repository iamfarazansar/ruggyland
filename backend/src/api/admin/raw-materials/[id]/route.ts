import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import RawMaterialsService from "../../../../modules/raw_materials/service";
import { RAW_MATERIALS_MODULE } from "../../../../modules/raw_materials";

// GET /admin/raw-materials/:id
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const rawMaterialsService: RawMaterialsService =
    req.scope.resolve(RAW_MATERIALS_MODULE);
  const { id } = req.params;

  try {
    const material = await rawMaterialsService.retrieveMaterial(id);
    if (!material) {
      res.status(404).json({ error: "Material not found" });
      return;
    }
    res.json({ material });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// PUT /admin/raw-materials/:id
export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const rawMaterialsService: RawMaterialsService =
    req.scope.resolve(RAW_MATERIALS_MODULE);
  const { id } = req.params;

  try {
    const body = req.body as Record<string, unknown>;
    const material = await rawMaterialsService.updateMaterials({
      id,
      ...body,
    });
    res.json({ material });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

// DELETE /admin/raw-materials/:id
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const rawMaterialsService: RawMaterialsService =
    req.scope.resolve(RAW_MATERIALS_MODULE);
  const { id } = req.params;

  try {
    await rawMaterialsService.deleteMaterials(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
