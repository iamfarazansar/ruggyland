import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import RawMaterialsService from "../../../modules/raw_materials/service";
import { RAW_MATERIALS_MODULE } from "../../../modules/raw_materials";

/**
 * GET /admin/purchase-orders
 * List all purchase orders
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const rawMaterialsService: RawMaterialsService =
    req.scope.resolve(RAW_MATERIALS_MODULE);

  try {
    const { status, supplier_id } = req.query;

    const filters: Record<string, any> = {};
    if (status) filters.status = status;
    if (supplier_id) filters.supplier_id = supplier_id;

    const purchaseOrders =
      await rawMaterialsService.listPurchaseOrders(filters);

    // Enrich with supplier names
    const enrichedPOs = await Promise.all(
      purchaseOrders.map(async (po: any) => {
        try {
          const supplier = await rawMaterialsService.retrieveSupplier(
            po.supplier_id,
          );
          return {
            ...po,
            supplier_name: supplier?.name || "Unknown",
          };
        } catch {
          return { ...po, supplier_name: "Unknown" };
        }
      }),
    );

    res.json({
      purchase_orders: enrichedPOs,
      count: enrichedPOs.length,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * POST /admin/purchase-orders
 * Create a new purchase order
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const rawMaterialsService: RawMaterialsService =
    req.scope.resolve(RAW_MATERIALS_MODULE);

  try {
    const { supplier_id, expected_date, notes, items } = req.body as {
      supplier_id: string;
      expected_date?: string;
      notes?: string;
      items: Array<{
        material_id: string;
        quantity_ordered: number;
        unit_price: number;
      }>;
    };

    if (!supplier_id || !items || items.length === 0) {
      res.status(400).json({
        error: "supplier_id and at least one item are required",
      });
      return;
    }

    // Calculate subtotal
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity_ordered * item.unit_price,
      0,
    );

    // Create the purchase order
    const purchaseOrder = await rawMaterialsService.createPurchaseOrders({
      supplier_id,
      status: "draft",
      expected_date: expected_date ? new Date(expected_date) : null,
      notes,
      subtotal,
    });

    // Create line items
    const createdItems = await Promise.all(
      items.map((item) =>
        rawMaterialsService.createPurchaseOrderItems({
          purchase_order_id: purchaseOrder.id,
          material_id: item.material_id,
          quantity_ordered: item.quantity_ordered,
          quantity_received: 0,
          unit_price: item.unit_price,
        }),
      ),
    );

    res.status(201).json({
      purchase_order: {
        ...purchaseOrder,
        items: createdItems,
      },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
}
