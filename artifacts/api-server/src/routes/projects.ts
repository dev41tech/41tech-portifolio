import { Router, Request, Response } from "express";
import { db, projectsTable, projectTechnologiesTable, technologiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateProjectBody, ListProjectsQueryParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

function mapProject(p: typeof projectsTable.$inferSelect) {
  return {
    id: p.id,
    title: p.title,
    slug: p.slug,
    shortDescription: p.shortDescription,
    fullDescription: p.fullDescription,
    problem: p.problem,
    solution: p.solution,
    result: p.result,
    previewType: p.previewType,
    previewUrl: p.previewUrl,
    previewAlt: p.previewAlt,
    coverImageUrl: p.coverImageUrl,
    thumbnailUrl: p.thumbnailUrl,
    galleryImages: p.galleryImages,
    category: p.category,
    metricsSummary: p.metricsSummary,
    demoUrl: p.demoUrl,
    repositoryUrl: p.repositoryUrl,
    status: p.status,
    featured: p.featured,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

async function getProjectTechnologies(projectId: number) {
  const rows = await db
    .select({ tech: technologiesTable })
    .from(projectTechnologiesTable)
    .innerJoin(technologiesTable, eq(projectTechnologiesTable.technologyId, technologiesTable.id))
    .where(eq(projectTechnologiesTable.projectId, projectId));
  return rows.map((r) => ({
    id: r.tech.id,
    name: r.tech.name,
    iconUrl: r.tech.iconUrl,
    category: r.tech.category,
    createdAt: r.tech.createdAt.toISOString(),
    updatedAt: r.tech.updatedAt.toISOString(),
  }));
}

router.get("/", async (req: Request, res: Response) => {
  const parsed = ListProjectsQueryParams.safeParse(req.query);
  const params = parsed.success ? parsed.data : {};

  const rows = await db.select().from(projectsTable).orderBy(projectsTable.createdAt);
  const projects = rows.map(mapProject);

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
    previewType: data.previewType ?? null,
    previewUrl: data.previewUrl ?? null,
    previewAlt: data.previewAlt ?? null,
    coverImageUrl: data.coverImageUrl ?? null,
    thumbnailUrl: data.thumbnailUrl ?? null,
    galleryImages: data.galleryImages ?? null,
    category: data.category ?? null,
    metricsSummary: data.metricsSummary ?? null,
    demoUrl: data.demoUrl ?? null,
    repositoryUrl: data.repositoryUrl ?? null,
    status: data.status,
    featured: data.featured,
  }).returning();

  res.status(201).json(mapProject(project));
});

router.get("/:slug/technologies", async (req: Request, res: Response) => {
  const slug = String(req.params.slug);
  const rows = await db.select().from(projectsTable).where(eq(projectsTable.slug, slug)).limit(1);
  const project = rows[0];

  if (!project) {
    res.status(404).json({ error: "Projeto não encontrado" });
    return;
  }

  res.json(await getProjectTechnologies(project.id));
});

router.put("/:slug/technologies", requireAuth, async (req: Request, res: Response) => {
  const slug = String(req.params.slug);
  const rows = await db.select().from(projectsTable).where(eq(projectsTable.slug, slug)).limit(1);
  const project = rows[0];

  if (!project) {
    res.status(404).json({ error: "Projeto não encontrado" });
    return;
  }

  const { technologyIds } = req.body;
  if (!Array.isArray(technologyIds)) {
    res.status(400).json({ error: "technologyIds deve ser um array" });
    return;
  }

  const validIds: number[] = technologyIds.filter(
    (id: unknown) => typeof id === "number" && Number.isInteger(id) && id > 0
  );

  await db.delete(projectTechnologiesTable).where(eq(projectTechnologiesTable.projectId, project.id));

  if (validIds.length > 0) {
    await db.insert(projectTechnologiesTable).values(
      validIds.map((technologyId) => ({ projectId: project.id, technologyId }))
    );
  }

  res.json(await getProjectTechnologies(project.id));
});

router.get("/:slug", async (req: Request, res: Response) => {
  const slug = String(req.params.slug);
  const rows = await db.select().from(projectsTable).where(eq(projectsTable.slug, slug)).limit(1);
  const project = rows[0];

  if (!project) {
    res.status(404).json({ error: "Projeto não encontrado" });
    return;
  }

  res.json(mapProject(project));
});

router.put("/:slug", requireAuth, async (req: Request, res: Response) => {
  const slug = String(req.params.slug);
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
      previewType: data.previewType ?? null,
      previewUrl: data.previewUrl ?? null,
      previewAlt: data.previewAlt ?? null,
      coverImageUrl: data.coverImageUrl ?? null,
      thumbnailUrl: data.thumbnailUrl ?? null,
      galleryImages: data.galleryImages ?? null,
      category: data.category ?? null,
      metricsSummary: data.metricsSummary ?? null,
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

  res.json(mapProject(project));
});

router.delete("/:slug", requireAuth, async (req: Request, res: Response) => {
  const slug = String(req.params.slug);
  await db.delete(projectsTable).where(eq(projectsTable.slug, slug));
  res.json({ success: true });
});

export default router;
