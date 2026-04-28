import { Router, Request, Response } from "express";
import { db, projectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateProjectBody, ListProjectsQueryParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const parsed = ListProjectsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  let query = db.select().from(projectsTable).$dynamic();

  const conditions: Parameters<typeof query.where>[0][] = [];
  if (params.featured !== undefined) {
    conditions.push(eq(projectsTable.featured, params.featured));
  }
  if (params.status !== undefined) {
    conditions.push(eq(projectsTable.status, params.status));
  }

  const rows = await db.select().from(projectsTable)
    .where(conditions.length > 0 ? conditions[0] : undefined)
    .orderBy(projectsTable.createdAt);

  const projects = rows.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    shortDescription: p.shortDescription,
    fullDescription: p.fullDescription,
    problem: p.problem,
    solution: p.solution,
    result: p.result,
    coverImageUrl: p.coverImageUrl,
    demoUrl: p.demoUrl,
    repositoryUrl: p.repositoryUrl,
    status: p.status,
    featured: p.featured,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  // Apply featured filter in JS if needed (workaround for dynamic conditions)
  const filtered = params.featured !== undefined
    ? projects.filter((p) => p.featured === params.featured)
    : projects;

  res.json(filtered);
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.issues });
    return;
  }

  const data = parsed.data;
  const [project] = await db.insert(projectsTable).values({
    title: data.title,
    slug: data.slug,
    shortDescription: data.shortDescription,
    fullDescription: data.fullDescription ?? null,
    problem: data.problem ?? null,
    solution: data.solution ?? null,
    result: data.result ?? null,
    coverImageUrl: data.coverImageUrl ?? null,
    demoUrl: data.demoUrl ?? null,
    repositoryUrl: data.repositoryUrl ?? null,
    status: data.status,
    featured: data.featured,
  }).returning();

  res.status(201).json({
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  });
});

router.get("/:slug", async (req: Request, res: Response) => {
  const { slug } = req.params;
  const rows = await db.select().from(projectsTable).where(eq(projectsTable.slug, slug)).limit(1);
  const project = rows[0];

  if (!project) {
    res.status(404).json({ error: "Projeto não encontrado" });
    return;
  }

  res.json({
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  });
});

router.put("/:slug", requireAuth, async (req: Request, res: Response) => {
  const { slug } = req.params;
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.issues });
    return;
  }

  const data = parsed.data;
  const [project] = await db.update(projectsTable)
    .set({
      title: data.title,
      slug: data.slug,
      shortDescription: data.shortDescription,
      fullDescription: data.fullDescription ?? null,
      problem: data.problem ?? null,
      solution: data.solution ?? null,
      result: data.result ?? null,
      coverImageUrl: data.coverImageUrl ?? null,
      demoUrl: data.demoUrl ?? null,
      repositoryUrl: data.repositoryUrl ?? null,
      status: data.status,
      featured: data.featured,
      updatedAt: new Date(),
    })
    .where(eq(projectsTable.slug, slug))
    .returning();

  if (!project) {
    res.status(404).json({ error: "Projeto não encontrado" });
    return;
  }

  res.json({
    ...project,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  });
});

router.delete("/:slug", requireAuth, async (req: Request, res: Response) => {
  const { slug } = req.params;
  await db.delete(projectsTable).where(eq(projectsTable.slug, slug));
  res.json({ success: true });
});

export default router;
