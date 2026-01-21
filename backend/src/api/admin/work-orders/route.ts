import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import ManufacturingService from "../../../modules/manufacturing/service";
import { MANUFACTURING_MODULE } from "../../../modules/manufacturing";

/**
 * GET /admin/work-orders
 * List all work orders with optional filters
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const manufacturingService: ManufacturingService =
    req.scope.resolve(MANUFACTURING_MODULE);

  const {
    status,
    stage,
    priority,
    order_id,
    assigned_to,
    limit = 50,
    offset = 0,
  } = req.query as {
    status?: string;
    stage?: string;
    priority?: string;
    order_id?: string;
    assigned_to?: string;
    limit?: number;
    offset?: number;
  };

  // Build filters
  const filters: Record<string, any> = {};
  if (status) filters.status = status;
  if (stage) filters.current_stage = stage;
  if (priority) filters.priority = priority;
  if (order_id) filters.order_id = order_id;
  if (assigned_to) filters.assigned_to = assigned_to;

  const workOrders = await manufacturingService.listWorkOrders(filters, {
    skip: Number(offset),
    take: Number(limit),
    order: { created_at: "DESC" },
  });

  const count = await manufacturingService.listWorkOrders(filters, {
    select: ["id"],
  });

  res.json({
    work_orders: workOrders,
    count: count.length,
    offset: Number(offset),
    limit: Number(limit),
  });
}

/**
 * POST /admin/work-orders
 * Create a new work order manually
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const manufacturingService: ManufacturingService =
    req.scope.resolve(MANUFACTURING_MODULE);

  const {
    order_id,
    order_item_id,
    title,
    size,
    sku,
    priority = "normal",
    assigned_to,
    due_date,
    notes,
  } = req.body as {
    order_id: string;
    order_item_id: string;
    title: string;
    size?: string;
    sku?: string;
    priority?: string;
    assigned_to?: string;
    due_date?: string;
    notes?: string;
  };

  if (!order_id || !order_item_id || !title) {
    res.status(400).json({
      message: "order_id, order_item_id, and title are required",
    });
    return;
  }

  const workOrder = await manufacturingService.createWorkOrders({
    order_id,
    order_item_id,
    title,
    size,
    sku,
    priority,
    assigned_to,
    due_date: due_date ? new Date(due_date) : null,
    notes,
    current_stage: "design_approved",
    status: "pending",
  });

  res.status(201).json({ work_order: workOrder });
}
