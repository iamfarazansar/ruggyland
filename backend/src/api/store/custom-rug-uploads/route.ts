import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { uploadFilesWorkflow } from "@medusajs/medusa/core-flows";

type MulterFile = {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
};

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  // multer adds req.files at runtime, so we cast for TS
  const files = ((req as any).files || []) as MulterFile[];

  if (!files.length) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  const { result } = await uploadFilesWorkflow(req.scope).run({
    input: {
      files: files.map((f) => ({
        filename: f.originalname,
        mimeType: f.mimetype,
        content: f.buffer.toString("base64"), // ✅ prevents corruption
        access: "public",
      })),
    },
  });

  return res.status(200).json({
    files: (result as any[]).map((r) => ({ id: r.id, url: r.url })),
  });
}
