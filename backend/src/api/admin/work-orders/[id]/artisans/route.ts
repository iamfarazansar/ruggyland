import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import ManufacturingService from "../../../../../modules/manufacturing/service";
import { MANUFACTURING_MODULE } from "../../../../../modules/manufacturing";

/**
 * GET /admin/work-orders/:id/artisans
 * List assigned artisans for a work order
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const manufacturingService: ManufacturingService =
    req.scope.resolve(MANUFACTURING_MODULE);

  const { id } = req.params;

  try {
    const assignments = await manufacturingService.listWorkOrderArtisans({
      work_order_id: id,
    });

    // Enrich with artisan details
    const enrichedAssignments = await Promise.all(
      assignments.map(async (assignment: any) => {
        try {
          const artisan = await manufacturingService.retrieveArtisan(
            assignment.artisan_id,
          );
          return {
            ...assignment,
            artisan_name: artisan?.name || "Unknown",
            artisan_role: artisan?.role,
          };
        } catch {
          return { ...assignment, artisan_name: "Unknown" };
        }
      }),
    );

    // Calculate total labor cost
    const totalLaborCost = enrichedAssignments.reduce(
      (sum: number, a: any) => sum + (a.labor_cost || 0),
      0,
    );

    res.json({
      artisans: enrichedAssignments,
      total_labor_cost: totalLaborCost,
      count: enrichedAssignments.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /admin/work-orders/:id/artisans
 * Assign an artisan to a work order with custom labor cost
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const manufacturingService: ManufacturingService =
    req.scope.resolve(MANUFACTURING_MODULE);

  const { id: workOrderId } = req.params;
  const { artisan_id, role, labor_cost, notes } = req.body as {
    artisan_id: string;
    role?: string;
    labor_cost: number;
    notes?: string;
  };

  if (!artisan_id || labor_cost === undefined) {
    res.status(400).json({
      error: "artisan_id and labor_cost are required",
    });
    return;
  }

  try {
    // Check if artisan exists
    const artisan = await manufacturingService.retrieveArtisan(artisan_id);
    if (!artisan) {
      res.status(404).json({ error: "Artisan not found" });
      return;
    }

    // Create assignment
    const assignment = await manufacturingService.createWorkOrderArtisans({
      work_order_id: workOrderId,
      artisan_id,
      role: role || artisan.role,
      labor_cost,
      notes,
      status: "assigned",
    });

    res.status(201).json({
      assignment: {
        ...assignment,
        artisan_name: artisan.name,
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}

/**
 * DELETE /admin/work-orders/:id/artisans/:assignmentId
 * Remove artisan assignment - handled by separate route
 */
