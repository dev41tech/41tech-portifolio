import { Router, Request, Response } from "express";
import { db, casesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateCaseBody, ListCasesQueryParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const parsed = ListCasesQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  const rows = await db.select().from(casesTable).orderBy(casesTable.createdAt);

  const cases = rows.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    clientSegment: c.clientSegment,
    problem: c.problem,
    solution: c.solution,
    result: c.result,
    metricsSummary: c.metricsSummary,
    isPublic: c.isPublic,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

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
    isPublic: data.isPublic,
  }).returning();

  res.status(201).json({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  });
});

router.get("/:slug", async (req: Request, res: Response) => {
  const slug = String(req.params.slug);
  const rows = await db.select().from(casesTable).where(eq(casesTable.slug, slug)).limit(1);
  const c = rows[0];

  if (!c) {
    res.status(404).json({ error: "Case não encontrado" });
    return;
  }

  res.json({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  });
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
      isPublic: data.isPublic,
      updatedAt: new Date(),
    })
    .where(eq(casesTable.slug, slug))
    .returning();

  if (!c) {
    res.status(404).json({ error: "Case não encontrado" });
    return;
  }

  res.json({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  });
});

router.delete("/:slug", requireAuth, async (req: Request, res: Response) => {
  const slug = String(req.params.slug);
  await db.delete(casesTable).where(eq(casesTable.slug, slug));
  res.json({ success: true });
});

export default router;
