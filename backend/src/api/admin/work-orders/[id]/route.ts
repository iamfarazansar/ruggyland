import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import ManufacturingService from "../../../../modules/manufacturing/service";
import { MANUFACTURING_MODULE } from "../../../../modules/manufacturing";

/**
 * GET /admin/work-orders/:id
 * Get a single work order with stages and media
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const manufacturingService: ManufacturingService =
    req.scope.resolve(MANUFACTURING_MODULE);

  const { id } = req.params;

  const workOrder = await manufacturingService.retrieveWorkOrder(id);

  if (!workOrder) {
    res.status(404).json({ message: "Work order not found" });
    return;
  }

  // Get stages for this work order
  const stages = await manufacturingService.listWorkOrderStages({
    work_order_id: id,
  });

  // Get media for this work order
  const media = await manufacturingService.listWorkOrderMedias({
    work_order_id: id,
  });

  res.json({
    work_order: {
      ...workOrder,
      stages,
      media,
    },
  });
}

/**
 * PATCH /admin/work-orders/:id
 * Update a work order
 */
export async function PATCH(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const manufacturingService: ManufacturingService =
    req.scope.resolve(MANUFACTURING_MODULE);

  const { id } = req.params;
  const updates = req.body as {
    title?: string;
    size?: string;
    priority?: string;
    assigned_to?: string;
    due_date?: string;
    notes?: string;
    status?: string;
  };

  const workOrder = await manufacturingService.updateWorkOrders(
    { id },
    {
      ...updates,
      due_date: updates.due_date ? new Date(updates.due_date) : undefined,
    },
  );

  res.json({ work_order: workOrder });
}

/**
 * DELETE /admin/work-orders/:id
 * Delete a work order
 */
export async function DELETE(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const manufacturingService: ManufacturingService =
    req.scope.resolve(MANUFACTURING_MODULE);

  const { id } = req.params;

  await manufacturingService.deleteWorkOrders(id);

  res.status(204).send();
}
