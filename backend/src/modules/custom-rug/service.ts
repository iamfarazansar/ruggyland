import { MedusaService } from "@medusajs/framework/utils";
import { CustomRugRequest } from "./models/custom-rug-request";

class CustomRugService extends MedusaService({
  CustomRugRequest,
}) {}

export default CustomRugService;
