import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework/http";
import { z } from "@medusajs/framework/zod";
import type { NextFunction } from "express";
import multer from "multer";

import { CustomRugRequestSchema } from "./store/custom-rug-requests/route";

// ==============================
// Upload config
// ==============================
const MAX_FILES = 3;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: MAX_FILES,
    fileSize: MAX_FILE_SIZE, // 5MB per file
  },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Only JPG, PNG, WEBP images are allowed"));
    }
    cb(null, true);
  },
});

// ==============================
// Optional: Simple rate limiter (per IP)
// ==============================
const hits = new Map<string, { count: number; ts: number }>();

function rateLimit(max = 10, windowMs = 60_000) {
  return (req: MedusaRequest, res: MedusaResponse, next: NextFunction) => {
    const ip =
      (req.headers["cf-connecting-ip"] as string) ||
      ((req.headers["x-forwarded-for"] as string)?.split(",")[0] ?? "") ||
      (req as any).ip ||
      "unknown";

    const now = Date.now();
    const entry = hits.get(ip) || { count: 0, ts: now };

    if (now - entry.ts > windowMs) {
      entry.count = 0;
      entry.ts = now;
    }

    entry.count++;
    hits.set(ip, entry);

    if (entry.count > max) {
      return res
        .status(429)
        .json({ message: "Too many uploads. Please try again later." });
    }

    next();
  };
}

// ==============================
// Multer wrapper (proper errors)
// ==============================
function uploadMw(req: MedusaRequest, res: MedusaResponse, next: NextFunction) {
  upload.array("files", MAX_FILES)(req as any, res as any, (err: any) => {
    if (!err) return next();

    // Multer built-in errors
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(413)
          .json({ message: `Each file must be <= ${MAX_FILE_SIZE_MB}MB` });
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return res
          .status(400)
          .json({ message: `Maximum ${MAX_FILES} images allowed` });
      }
      return res.status(400).json({ message: err.message });
    }

    // Custom errors (fileFilter etc.)
    return res.status(400).json({ message: err.message || "Upload failed" });
  });
}

// ==============================
// Medusa middlewares
// ==============================
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
      middlewares: [
        rateLimit(10, 60_000), // ✅ optional anti-spam (10 req/min per IP)
        uploadMw, // ✅ multer with limits + filters + clean errors
      ],
    },
    {
      // Large file uploads via base64 JSON
      matcher: "/admin/product-uploads",
      method: "POST",
      bodyParser: {
        sizeLimit: 50 * 1024 * 1024, // 50MB limit
      },
    },
    {
      // Product feed for Meta/Google
      matcher: "/product-feed",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(
          z.object({
            currency_code: z.string(),
            country_code: z.string(),
          }),
          {},
        ),
      ],
    },
    // Rug Stories - public endpoints (no API key required)
    {
      matcher: "/store/rug-stories",
      method: "GET",
      additionalDataValidator: false,
    },
    {
      matcher: "/store/rug-stories/*",
      method: "GET",
      additionalDataValidator: false,
    },
    // Rug Stories - admin upload endpoint with large file support
    {
      matcher: "/admin/rug-stories/upload",
      method: "POST",
      bodyParser: {
        sizeLimit: 50 * 1024 * 1024, // 50MB limit for base64 images
      },
    },
  ],
});
