import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import ManufacturingService from "../../../../../modules/manufacturing/service";
import { MANUFACTURING_MODULE } from "../../../../../modules/manufacturing";

/**
 * POST /admin/work-orders/:id/media
 * Add media (photo) to a work order
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const manufacturingService: ManufacturingService =
    req.scope.resolve(MANUFACTURING_MODULE);

  const { id } = req.params;
  const {
    url,
    caption,
    stage_id,
    type = "image",
    uploaded_by,
  } = req.body as {
    url: string;
    caption?: string;
    stage_id?: string;
    type?: string;
    uploaded_by?: string;
  };

  if (!url) {
    res.status(400).json({ message: "url is required" });
    return;
  }

  // Verify work order exists
  const workOrder = await manufacturingService.retrieveWorkOrder(id);

  if (!workOrder) {
    res.status(404).json({ message: "Work order not found" });
    return;
  }

  const media = await manufacturingService.createWorkOrderMedias({
    work_order_id: id,
    url,
    caption,
    stage_id,
    type,
    uploaded_by,
    uploaded_at: new Date(),
  });

  res.status(201).json({ media });
}

/**
 * GET /admin/work-orders/:id/media
 * Get all media for a work order
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const manufacturingService: ManufacturingService =
    req.scope.resolve(MANUFACTURING_MODULE);

  const { id } = req.params;

  const media = await manufacturingService.listWorkOrderMedias({
    work_order_id: id,
  });

  res.json({ media });
}
