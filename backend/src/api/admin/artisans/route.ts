import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import ManufacturingService from "../../../modules/manufacturing/service";
import { MANUFACTURING_MODULE } from "../../../modules/manufacturing";

/**
 * GET /admin/artisans
 * List all artisans
 */
export async function GET(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const manufacturingService: ManufacturingService =
    req.scope.resolve(MANUFACTURING_MODULE);

  const { active, role } = req.query as {
    active?: string;
    role?: string;
  };

  const filters: Record<string, any> = {};
  if (active !== undefined) filters.active = active === "true";
  if (role) filters.role = role;

  const artisans = await manufacturingService.listArtisans(filters);

  res.setHeader("Cache-Control", "no-store");
  res.json({ artisans });
}

/**
 * POST /admin/artisans
 * Create a new artisan
 */
export async function POST(
  req: MedusaRequest,
  res: MedusaResponse,
): Promise<void> {
  const manufacturingService: ManufacturingService =
    req.scope.resolve(MANUFACTURING_MODULE);

  const { name, email, phone, role, specialties } = req.body as {
    name: string;
    email?: string;
    phone?: string;
    role?: string;
    specialties?: string[];
  };

  if (!name) {
    res.status(400).json({ message: "name is required" });
    return;
  }

  const artisan = await manufacturingService.createArtisans({
    name,
    email,
    phone,
    role,
    specialties: specialties as any,
    active: true,
  });

  res.status(201).json({ artisan });
}
