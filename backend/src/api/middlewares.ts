import {
  defineMiddlewares,
  validateAndTransformBody,
} from "@medusajs/framework/http";

import { CustomRugRequestSchema } from "./store/custom-rug-requests/route";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/custom-rug-requests",
      method: "POST",
      middlewares: [validateAndTransformBody(CustomRugRequestSchema)],
    },
    {
      matcher: "/store/custom-rug-uploads",
      method: "POST",
      middlewares: [upload.array("files")], // field name must be "files"
    },
  ],
});
