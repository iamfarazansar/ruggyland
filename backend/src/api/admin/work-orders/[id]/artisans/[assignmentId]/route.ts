import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import ManufacturingService from "../../../../../../modules/manufacturing/service";
import { MANUFACTURING_MODULE } from "../../../../../../modules/manufacturing";

/**
 * DELETE /admin/work-orders/:id/artisans/:assignmentId
 * Remove an artisan assignment from a work order
 */
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const manufacturingService: ManufacturingService =
    req.scope.resolve(MANUFACTURING_MODULE);

  const { assignmentId } = req.params;

  try {
    await manufacturingService.deleteWorkOrderArtisans(assignmentId);
    res.status(204).send();
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * PUT /admin/work-orders/:id/artisans/:assignmentId
 * Update artisan assignment (e.g., update labor cost, mark completed, mark paid)
 */
export async function PUT(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const manufacturingService: ManufacturingService =
    req.scope.resolve(MANUFACTURING_MODULE);

  const { assignmentId } = req.params;
  const {
    labor_cost,
    status,
    notes,
    started_at,
    completed_at,
    paid_status,
    paid_at,
  } = req.body as {
    labor_cost?: number;
    status?: string;
    notes?: string;
    started_at?: string;
    completed_at?: string;
    paid_status?: string;
    paid_at?: string;
  };

  try {
    const updates: any = { id: assignmentId };
    if (labor_cost !== undefined) updates.labor_cost = labor_cost;
    if (status) updates.status = status;
    if (notes !== undefined) updates.notes = notes;
    if (started_at) updates.started_at = new Date(started_at);
    if (completed_at) updates.completed_at = new Date(completed_at);
    if (paid_status) updates.paid_status = paid_status;
    if (paid_status === "paid" && !paid_at) {
      updates.paid_at = new Date();
    } else if (paid_at) {
      updates.paid_at = new Date(paid_at);
    }

    const assignment =
      await manufacturingService.updateWorkOrderArtisans(updates);

    res.json({ assignment });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
