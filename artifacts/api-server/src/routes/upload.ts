import { Router, Request, Response } from "express";
import path from "path";
import { randomUUID } from "crypto";
import fs from "fs";
import { requireAuth } from "../middlewares/requireAuth";

const ALLOWED_FOLDERS = new Set(["technologies", "team", "projects", "cases"]);

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const EXT_BY_MIME: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
};

const MAX_SIZE_BY_FOLDER: Record<string, number> = {
  technologies: 2 * 1024 * 1024,
  team: 2 * 1024 * 1024,
  projects: 5 * 1024 * 1024,
  cases: 5 * 1024 * 1024,
};

const UPLOADS_BASE = process.env.UPLOADS_DIR ?? path.join(process.cwd(), "uploads");

const router = Router();

/**
 * POST /api/upload/:folder
 * Body: raw binary image
 * Headers:
 *   Content-Type: image/png | image/jpeg | image/webp | image/gif | image/svg+xml
 *   X-Filename: original-filename.png  (optional, used to determine extension)
 */
router.post("/:folder", requireAuth, (req: Request, res: Response) => {
  const folder = String(req.params.folder);

  if (!ALLOWED_FOLDERS.has(folder)) {
    res.status(400).json({ error: "Pasta não permitida" });
    return;
  }

  const contentType = (req.headers["content-type"] ?? "").split(";")[0].trim();
  if (!ALLOWED_MIME_TYPES.has(contentType)) {
    res.status(415).json({ error: `Tipo de arquivo não permitido: ${contentType}` });
    return;
  }

  const originalname = String(req.headers["x-filename"] ?? `upload${EXT_BY_MIME[contentType] ?? ""}`);
  const extFromName = path.extname(originalname).toLowerCase().replace(/[^.a-z0-9]/g, "");
  const ext = extFromName || (EXT_BY_MIME[contentType] ?? "");
  const filename = `${randomUUID()}${ext}`;

  const uploadDir = path.join(UPLOADS_BASE, folder);
  try {
    fs.mkdirSync(uploadDir, { recursive: true });
  } catch {
    res.status(500).json({ error: "Erro ao criar diretório de upload" });
    return;
  }

  const maxSize = MAX_SIZE_BY_FOLDER[folder] ?? 5 * 1024 * 1024;
  const chunks: Buffer[] = [];
  let totalSize = 0;
  let aborted = false;

  req.on("data", (chunk: Buffer) => {
    if (aborted) return;
    totalSize += chunk.length;
    if (totalSize > maxSize) {
      aborted = true;
      req.destroy();
      res.status(413).json({ error: "Arquivo muito grande para esta categoria" });
      return;
    }
    chunks.push(chunk);
  });

  req.on("error", () => {
    if (!res.headersSent) {
      res.status(400).json({ error: "Erro ao receber arquivo" });
    }
  });

  req.on("end", () => {
    if (aborted || res.headersSent) return;

    if (chunks.length === 0) {
      res.status(400).json({ error: "Nenhum arquivo enviado" });
      return;
    }

    const buffer = Buffer.concat(chunks);
    const filepath = path.join(uploadDir, filename);

    fs.writeFile(filepath, buffer, (err) => {
      if (err) {
        res.status(500).json({ error: "Erro ao salvar arquivo" });
        return;
      }
      res.json({ url: `/uploads/${folder}/${filename}` });
    });
  });
});

export default router;
