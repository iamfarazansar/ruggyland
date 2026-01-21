import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import ManufacturingService from "../../../../../modules/manufacturing/service";
import {
  MANUFACTURING_MODULE,
  MANUFACTURING_STAGES,
} from "../../../../../modules/manufacturing";

/**
 * GET /admin/work-orders/:id/stages
 * Get all stages for a work order
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const manufacturingService: ManufacturingService =
    req.scope.resolve(MANUFACTURING_MODULE);

  const { id } = req.params;

  const stages = await manufacturingService.listWorkOrderStages({
    work_order_id: id,
  });

  res.json({ stages, available_stages: MANUFACTURING_STAGES });
}

/**
 * POST /admin/work-orders/:id/stages/next
 * Move work order to next stage
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const manufacturingService: ManufacturingService =
    req.scope.resolve(MANUFACTURING_MODULE);

  const { id } = req.params;
  const { notes, assigned_to } = req.body as {
    notes?: string;
    assigned_to?: string;
  };

  // Get current work order
  const workOrder = await manufacturingService.retrieveWorkOrder(id);

  if (!workOrder) {
    res.status(404).json({ message: "Work order not found" });
    return;
  }

  // Get next stage
  const nextStage = manufacturingService.getNextStage(workOrder.current_stage);

  if (!nextStage) {
    res.status(400).json({
      message: "Work order is already at the final stage",
      current_stage: workOrder.current_stage,
    });
    return;
  }

  // Complete the current stage
  const currentStageRecords = await manufacturingService.listWorkOrderStages({
    work_order_id: id,
    stage: workOrder.current_stage,
    status: "active",
  });

  if (currentStageRecords.length > 0) {
    await manufacturingService.updateWorkOrderStages(
      { id: currentStageRecords[0].id },
      {
        status: "completed",
        completed_at: new Date(),
      },
    );
  }

  // Create new stage record
  await manufacturingService.createWorkOrderStages({
    work_order_id: id,
    stage: nextStage,
    status: "active",
    started_at: new Date(),
    assigned_to,
    notes,
  });

  // Update work order
  const updatedWorkOrder = await manufacturingService.updateWorkOrders(
    { id },
    {
      current_stage: nextStage,
      status: "in_progress",
      ...(nextStage === "ready_to_ship" && {
        status: "completed",
        completed_at: new Date(),
      }),
    },
  );

  res.json({
    work_order: updatedWorkOrder,
    previous_stage: workOrder.current_stage,
    current_stage: nextStage,
  });
}
