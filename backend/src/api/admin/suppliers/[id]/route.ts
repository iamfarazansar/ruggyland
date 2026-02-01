import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import RawMaterialsService from "../../../../modules/raw_materials/service";
import { RAW_MATERIALS_MODULE } from "../../../../modules/raw_materials";

// GET /admin/suppliers/:id
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const rawMaterialsService: RawMaterialsService =
    req.scope.resolve(RAW_MATERIALS_MODULE);
  const { id } = req.params;

  try {
    const supplier = await rawMaterialsService.retrieveSupplier(id);
    if (!supplier) {
      res.status(404).json({ error: "Supplier not found" });
      return;
    }
    res.json({ supplier });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

// PUT /admin/suppliers/:id
export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const rawMaterialsService: RawMaterialsService =
    req.scope.resolve(RAW_MATERIALS_MODULE);
  const { id } = req.params;

  try {
    const body = req.body as Record<string, unknown>;
    const supplier = await rawMaterialsService.updateSuppliers({
      id,
      ...body,
    });
    res.json({ supplier });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

// DELETE /admin/suppliers/:id
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const rawMaterialsService: RawMaterialsService =
    req.scope.resolve(RAW_MATERIALS_MODULE);
  const { id } = req.params;

  try {
    await rawMaterialsService.deleteSuppliers(id);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}
