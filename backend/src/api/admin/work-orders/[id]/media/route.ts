import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import ManufacturingService from "../../../../../modules/manufacturing/service";
import { MANUFACTURING_MODULE } from "../../../../../modules/manufacturing";

/**
 * GET /admin/work-orders/:id/media
 * Get all media for a work order, grouped by category
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const manufacturingService: ManufacturingService =
    req.scope.resolve(MANUFACTURING_MODULE);

  const { id } = req.params;
  const { category } = req.query as { category?: string };

  const filters: any = { work_order_id: id };
  if (category) {
    filters.category = category;
  }

  const media = await manufacturingService.listWorkOrderMedias(filters);

  // Group by category
  const grouped = {
    cad: media.filter((m: any) => m.category === "cad"),
    reference: media.filter(
      (m: any) => m.category === "reference" || !m.category,
    ),
    progress: media.filter((m: any) => m.category === "progress"),
    qc: media.filter((m: any) => m.category === "qc"),
  };

  res.json({
    media,
    grouped,
    count: media.length,
  });
}

/**
 * POST /admin/work-orders/:id/media
 * Add media (photo/CAD file) to a work order
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
    category = "reference", // cad, reference, progress, qc
    uploaded_by,
  } = req.body as {
    url: string;
    caption?: string;
    stage_id?: string;
    type?: string;
    category?: string;
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
    category,
    uploaded_by,
    uploaded_at: new Date(),
  });

  res.status(201).json({ media });
}
