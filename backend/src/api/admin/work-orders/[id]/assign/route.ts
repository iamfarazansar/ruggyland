import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import ManufacturingService from "../../../../../modules/manufacturing/service";
import { MANUFACTURING_MODULE } from "../../../../../modules/manufacturing";

/**
 * POST /admin/work-orders/:id/assign
 * Assign a work order to an artisan
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const manufacturingService: ManufacturingService =
    req.scope.resolve(MANUFACTURING_MODULE);

  const { id } = req.params;
  const { artisan_id } = req.body as { artisan_id: string };

  if (!artisan_id) {
    res.status(400).json({ message: "artisan_id is required" });
    return;
  }

  // Verify artisan exists
  const artisan = await manufacturingService.retrieveArtisan(artisan_id);

  if (!artisan) {
    res.status(404).json({ message: "Artisan not found" });
    return;
  }

  if (!artisan.active) {
    res.status(400).json({ message: "Artisan is not active" });
    return;
  }

  // Update work order
  const workOrder = await manufacturingService.updateWorkOrders({ id }, {
    assigned_to: artisan_id,
  });

  res.json({ work_order: workOrder, artisan });
}
