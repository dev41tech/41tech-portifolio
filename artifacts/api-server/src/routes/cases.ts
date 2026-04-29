import { Router, Request, Response } from "express";
import { db, casesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateCaseBody, ListCasesQueryParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

function mapCase(c: typeof casesTable.$inferSelect) {
  return {
    id: c.id,
    title: c.title,
    slug: c.slug,
    clientSegment: c.clientSegment,
    problem: c.problem,
    solution: c.solution,
    result: c.result,
    metricsSummary: c.metricsSummary,
    coverImageUrl: c.coverImageUrl,
    videoUrl: c.videoUrl,
    galleryImages: c.galleryImages,
    relatedUrl: c.relatedUrl,
    isPublic: c.isPublic,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

router.get("/", async (req: Request, res: Response) => {
  const parsed = ListCasesQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  const rows = await db.select().from(casesTable).orderBy(casesTable.createdAt);
  const cases = rows.map(mapCase);
  const filtered = params.public_only ? cases.filter((c) => c.isPublic) : cases;
  res.json(filtered);
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  const parsed = CreateCaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.issues });
    return;
  }

  const data = parsed.data;
  const [c] = await db.insert(casesTable).values({
    title: data.title,
    slug: data.slug,
    clientSegment: data.clientSegment ?? null,
    problem: data.problem,
    solution: data.solution,
    result: data.result,
    metricsSummary: data.metricsSummary ?? null,
    coverImageUrl: (data as any).coverImageUrl ?? null,
    videoUrl: (data as any).videoUrl ?? null,
    galleryImages: (data as any).galleryImages ?? null,
    relatedUrl: (data as any).relatedUrl ?? null,
    isPublic: data.isPublic,
  }).returning();

  res.status(201).json(mapCase(c));
});

router.get("/:slug", async (req: Request, res: Response) => {
  const slug = String(req.params.slug);
  const rows = await db.select().from(casesTable).where(eq(casesTable.slug, slug)).limit(1);
  const c = rows[0];

  if (!c) {
    res.status(404).json({ error: "Case não encontrado" });
    return;
  }

  res.json(mapCase(c));
});

router.put("/:slug", requireAuth, async (req: Request, res: Response) => {
  const slug = String(req.params.slug);
  const parsed = CreateCaseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.issues });
    return;
  }

  const data = parsed.data;
  const [c] = await db.update(casesTable)
    .set({
      title: data.title,
      slug: data.slug,
      clientSegment: data.clientSegment ?? null,
      problem: data.problem,
      solution: data.solution,
      result: data.result,
      metricsSummary: data.metricsSummary ?? null,
      coverImageUrl: (data as any).coverImageUrl ?? null,
      videoUrl: (data as any).videoUrl ?? null,
      galleryImages: (data as any).galleryImages ?? null,
      relatedUrl: (data as any).relatedUrl ?? null,
      isPublic: data.isPublic,
      updatedAt: new Date(),
    })
    .where(eq(casesTable.slug, slug))
    .returning();

  if (!c) {
    res.status(404).json({ error: "Case não encontrado" });
    return;
  }

  res.json(mapCase(c));
});

router.delete("/:slug", requireAuth, async (req: Request, res: Response) => {
  const slug = String(req.params.slug);
  await db.delete(casesTable).where(eq(casesTable.slug, slug));
  res.json({ success: true });
});

export default router;
