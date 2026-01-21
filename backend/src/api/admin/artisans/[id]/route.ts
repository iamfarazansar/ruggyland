import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import ManufacturingService from "../../../../modules/manufacturing/service";
import { MANUFACTURING_MODULE } from "../../../../modules/manufacturing";

/**
 * GET /admin/artisans/:id
 * Get a single artisan with their work orders
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const manufacturingService: ManufacturingService =
    req.scope.resolve(MANUFACTURING_MODULE);

  const { id } = req.params;

  const artisan = await manufacturingService.retrieveArtisan(id);

  if (!artisan) {
    res.status(404).json({ message: "Artisan not found" });
    return;
  }

  // Get work orders assigned to this artisan
  const workOrders = await manufacturingService.listWorkOrders({
    assigned_to: id,
  });

  res.json({
    artisan: {
      ...artisan,
      work_orders: workOrders,
    },
  });
}

/**
 * PATCH /admin/artisans/:id
 * Update an artisan
 */
export async function PATCH(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const manufacturingService: ManufacturingService =
    req.scope.resolve(MANUFACTURING_MODULE);

  const { id } = req.params;
  const updates = req.body as {
    name?: string;
    email?: string;
    phone?: string;
    role?: string;
    specialties?: string[];
    active?: boolean;
  };

  const artisan = await manufacturingService.updateArtisans({ id }, updates);

  res.json({ artisan });
}

/**
 * DELETE /admin/artisans/:id
 * Delete an artisan (soft delete - set inactive)
 */
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const manufacturingService: ManufacturingService =
    req.scope.resolve(MANUFACTURING_MODULE);

  const { id } = req.params;

  // Soft delete - just deactivate
  await manufacturingService.updateArtisans({ id }, { active: false });

  res.status(204).send();
}
