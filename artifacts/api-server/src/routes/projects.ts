import { Router, Request, Response } from "express";
import { db, projectsTable, projectTechnologiesTable, technologiesTable, projectOwnersTable, teamMembersTable } from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
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
  try {
    const slug = String(req.params.slug);
    const rows = await db.select().from(projectsTable).where(eq(projectsTable.slug, slug)).limit(1);
    const project = rows[0];

    if (!project) {
      res.status(404).json({ error: "Projeto não encontrado" });
      return;
    }

    const techs = await getProjectTechnologies(project.id);
    res.json(techs);
  } catch (err) {
    console.error("[GET project technologies] error:", err);
    res.status(500).json({ error: "Erro interno ao buscar tecnologias do projeto" });
  }
});

router.put("/:slug/technologies", requireAuth, async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);
    console.error("[PUT project technologies] slug:", slug);
    console.error("[PUT project technologies] body:", JSON.stringify(req.body));

    // Validate body
    const rawIds = req.body?.technologyIds;
    if (!Array.isArray(rawIds)) {
      res.status(400).json({ error: "technologyIds deve ser um array" });
      return;
    }

    // Normalize: accept number or numeric string, deduplicate
    const normalizedIds: number[] = [
      ...new Set(
        rawIds
          .map((id: unknown) => Number(id))
          .filter((n: number) => Number.isInteger(n) && n > 0)
      ),
    ];
    console.error("[PUT project technologies] normalizedIds:", normalizedIds);

    // Find project
    const projectRows = await db.select().from(projectsTable).where(eq(projectsTable.slug, slug)).limit(1);
    const project = projectRows[0];
    console.error("[PUT project technologies] project:", project ? { id: project.id, slug: project.slug } : null);

    if (!project) {
      res.status(404).json({ error: "Projeto não encontrado" });
      return;
    }

    // Clear all tech links when empty array
    if (normalizedIds.length === 0) {
      await db.delete(projectTechnologiesTable).where(eq(projectTechnologiesTable.projectId, project.id));
      res.json({ success: true, technologyIds: [] });
      return;
    }

    // Validate all IDs exist in technologies table
    const existingTechRows = await db
      .select({ id: technologiesTable.id })
      .from(technologiesTable)
      .where(inArray(technologiesTable.id, normalizedIds));
    const existingIds = new Set(existingTechRows.map((r) => r.id));
    const invalidIds = normalizedIds.filter((id) => !existingIds.has(id));
    console.error("[PUT project technologies] existingIds:", [...existingIds], "invalidIds:", invalidIds);

    if (invalidIds.length > 0) {
      res.status(400).json({ error: "Tecnologias inválidas", invalidIds });
      return;
    }

    // Delete existing links then insert new ones
    await db.delete(projectTechnologiesTable).where(eq(projectTechnologiesTable.projectId, project.id));
    await db.insert(projectTechnologiesTable).values(
      normalizedIds.map((technologyId) => ({ projectId: project.id, technologyId }))
    );

    res.json({ success: true, technologyIds: normalizedIds });
  } catch (err) {
    console.error("[PUT project technologies] error:", err);
    res.status(500).json({ error: "Erro interno ao salvar tecnologias do projeto" });
  }
});

// ---------------------------------------------------------------------------
// Project Owners (N:N with team_members)
// ---------------------------------------------------------------------------

async function getProjectOwners(projectId: number) {
  const rows = await db
    .select({ member: teamMembersTable })
    .from(projectOwnersTable)
    .innerJoin(teamMembersTable, eq(projectOwnersTable.teamMemberId, teamMembersTable.id))
    .where(eq(projectOwnersTable.projectId, projectId))
    .orderBy(teamMembersTable.sortOrder);
  return rows.map((r) => ({
    id: r.member.id,
    name: r.member.name,
    roleTitle: r.member.roleTitle,
    avatarUrl: r.member.avatarUrl,
    linkedinUrl: r.member.linkedinUrl,
    githubUrl: r.member.githubUrl,
    portfolioUrl: r.member.portfolioUrl,
  }));
}

router.get("/:slug/owners", async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);
    const rows = await db.select().from(projectsTable).where(eq(projectsTable.slug, slug)).limit(1);
    const project = rows[0];

    if (!project) {
      res.status(404).json({ error: "Projeto não encontrado" });
      return;
    }

    res.json(await getProjectOwners(project.id));
  } catch (err) {
    console.error("[GET project owners] error:", err);
    res.status(500).json({ error: "Erro interno ao buscar responsáveis do projeto" });
  }
});

router.put("/:slug/owners", requireAuth, async (req: Request, res: Response) => {
  try {
    const slug = String(req.params.slug);
    console.error("[PUT project owners] slug:", slug, "body:", JSON.stringify(req.body));

    const rawIds = req.body?.teamMemberIds;
    if (!Array.isArray(rawIds)) {
      res.status(400).json({ error: "teamMemberIds deve ser um array" });
      return;
    }

    const normalizedIds: number[] = [
      ...new Set(
        rawIds
          .map((id: unknown) => Number(id))
          .filter((n: number) => Number.isInteger(n) && n > 0)
      ),
    ];

    const projectRows = await db.select().from(projectsTable).where(eq(projectsTable.slug, slug)).limit(1);
    const project = projectRows[0];

    if (!project) {
      res.status(404).json({ error: "Projeto não encontrado" });
      return;
    }

    if (normalizedIds.length === 0) {
      await db.delete(projectOwnersTable).where(eq(projectOwnersTable.projectId, project.id));
      res.json({ success: true, teamMemberIds: [] });
      return;
    }

    const existingMemberRows = await db
      .select({ id: teamMembersTable.id })
      .from(teamMembersTable)
      .where(inArray(teamMembersTable.id, normalizedIds));
    const existingIds = new Set(existingMemberRows.map((r) => r.id));
    const invalidIds = normalizedIds.filter((id) => !existingIds.has(id));

    if (invalidIds.length > 0) {
      res.status(400).json({ error: "Membros inválidos", invalidIds });
      return;
    }

    await db.delete(projectOwnersTable).where(eq(projectOwnersTable.projectId, project.id));
    await db.insert(projectOwnersTable).values(
      normalizedIds.map((teamMemberId) => ({ projectId: project.id, teamMemberId }))
    );

    res.json({ success: true, teamMemberIds: normalizedIds });
  } catch (err) {
    console.error("[PUT project owners] error:", err);
    res.status(500).json({ error: "Erro interno ao salvar responsáveis do projeto" });
  }
});

// ---------------------------------------------------------------------------

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
