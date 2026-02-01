import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import RawMaterialsService from "../../../../../modules/raw_materials/service";
import { RAW_MATERIALS_MODULE } from "../../../../../modules/raw_materials";

/**
 * GET /admin/work-orders/:id/materials
 * Get all materials consumed by this work order
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const rawMaterialsService: RawMaterialsService =
    req.scope.resolve(RAW_MATERIALS_MODULE);

  const { id } = req.params;

  // Get all stock movements for this work order
  const movements = await rawMaterialsService.listStockMovements({
    work_order_id: id,
    type: "out",
  });

  // Get material details for each movement
  const materialsWithDetails = await Promise.all(
    movements.map(async (movement: any) => {
      const material = await rawMaterialsService.retrieveMaterial(
        movement.material_id,
      );
      return {
        id: movement.id,
        material_id: movement.material_id,
        material_name: material?.name || "Unknown",
        material_sku: material?.sku,
        material_unit: material?.unit,
        quantity: movement.quantity,
        cost_per_unit: material?.cost_per_unit || 0,
        total_cost: movement.quantity * (material?.cost_per_unit || 0),
        notes: movement.notes,
        created_at: movement.created_at,
      };
    }),
  );

  // Calculate totals
  const totalCost = materialsWithDetails.reduce(
    (sum, m) => sum + m.total_cost,
    0,
  );

  res.json({
    materials: materialsWithDetails,
    total_cost: totalCost,
    count: materialsWithDetails.length,
  });
}

/**
 * POST /admin/work-orders/:id/materials
 * Record material consumption for this work order
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const rawMaterialsService: RawMaterialsService =
    req.scope.resolve(RAW_MATERIALS_MODULE);

  const { id: workOrderId } = req.params;
  const { material_id, quantity, notes } = req.body as {
    material_id: string;
    quantity: number;
    notes?: string;
  };

  // Validate input
  if (!material_id || !quantity || quantity <= 0) {
    res.status(400).json({
      error: "material_id and positive quantity are required",
    });
    return;
  }

  try {
    // Use the adjustStock method to record consumption and update inventory
    const result = await rawMaterialsService.adjustStock(
      material_id,
      quantity,
      "out",
      {
        reason: "work_order_consumption",
        notes: notes || `Consumed for work order`,
        work_order_id: workOrderId,
      },
    );

    // Get material details for response
    const material = await rawMaterialsService.retrieveMaterial(material_id);

    res.status(201).json({
      consumption: {
        id: result.movement.id,
        material_id,
        material_name: material?.name,
        quantity,
        cost_per_unit: material?.cost_per_unit || 0,
        total_cost: quantity * (material?.cost_per_unit || 0),
        notes,
        work_order_id: workOrderId,
        stock_after: result.movement.stock_after,
      },
    });
  } catch (err: any) {
    res.status(400).json({
      error: err.message || "Failed to record material consumption",
    });
  }
}
