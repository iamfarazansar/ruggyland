import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Modules } from "@medusajs/framework/utils";

interface Base64UploadInput {
  file: string; // base64 encoded file content
  filename: string;
  mimeType: string;
  storySlug: string; // Slug of the story for folder organization
  imageType: "thumbnail" | "step"; // Whether it's main thumbnail or step image
  stepIndex?: number; // Optional step index for step images
}

/**
 * POST /admin/rug-stories/upload
 * Upload an image for a rug story to S3
 * Stores in stories/[slug]/ directory structure
 */
export async function POST(req: MedusaRequest, res: MedusaResponse) {
  try {
    const input = req.body as Base64UploadInput;

    if (!input.file || !input.filename) {
      return res.status(400).json({ error: "File and filename are required" });
    }

    if (!input.storySlug) {
      return res.status(400).json({ error: "storySlug is required" });
    }

    // Decode base64 to buffer
    const fileBuffer = Buffer.from(input.file, "base64");

    // Get the file module service
    const fileModuleService = req.scope.resolve(Modules.FILE) as any;

    // Sanitize the slug and filename
    const sanitizedSlug = input.storySlug
      .replace(/[^a-zA-Z0-9-]/g, "-")
      .toLowerCase();
    const timestamp = Date.now();
    const sanitizedFilename = input.filename.replace(/[^a-zA-Z0-9.-]/g, "_");

    // Build storage path: stories/[slug]/[type]-[timestamp]-[filename]
    let storagePath: string;
    if (input.imageType === "thumbnail") {
      storagePath = `stories/${sanitizedSlug}/thumbnail-${timestamp}-${sanitizedFilename}`;
    } else {
      const stepPrefix =
        input.stepIndex !== undefined ? `step-${input.stepIndex}` : "step";
      storagePath = `stories/${sanitizedSlug}/${stepPrefix}-${timestamp}-${sanitizedFilename}`;
    }

    // Upload to S3 using Medusa's file service
    const uploadedFiles = await fileModuleService.createFiles([
      {
        filename: storagePath,
        mimeType: input.mimeType || "image/jpeg",
        content: fileBuffer,
        access: "public", // Publicly accessible
      },
    ]);

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(500).json({ error: "File upload failed" });
    }

    return res.json({
      file: {
        id: uploadedFiles[0].id,
        url: uploadedFiles[0].url,
        filename: sanitizedFilename,
        mimeType: input.mimeType,
        size: fileBuffer.length,
        path: storagePath,
      },
    });
  } catch (error: any) {
    console.error("Rug story upload error:", error);
    return res.status(500).json({ error: error.message || "Upload failed" });
  }
}
