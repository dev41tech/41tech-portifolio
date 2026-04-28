import { Router, Request, Response } from "express";
import { db, teamMembersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateTeamMemberBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const rows = await db.select().from(teamMembersTable)
    .where(eq(teamMembersTable.isActive, true))
    .orderBy(teamMembersTable.sortOrder);

  res.json(rows.map((m) => ({
    id: m.id,
    name: m.name,
    roleTitle: m.roleTitle,
    bio: m.bio,
    avatarUrl: m.avatarUrl,
    linkedinUrl: m.linkedinUrl,
    githubUrl: m.githubUrl,
    sortOrder: m.sortOrder,
    isActive: m.isActive,
    skills: m.skills ?? [],
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  })));
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  const parsed = CreateTeamMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.issues });
    return;
  }

  const data = parsed.data;
  const [member] = await db.insert(teamMembersTable).values({
    name: data.name,
    roleTitle: data.roleTitle,
    bio: data.bio ?? null,
    avatarUrl: data.avatarUrl ?? null,
    linkedinUrl: data.linkedinUrl ?? null,
    githubUrl: data.githubUrl ?? null,
    sortOrder: data.sortOrder,
    isActive: data.isActive,
    skills: data.skills,
  }).returning();

  res.status(201).json({
    ...member,
    skills: member.skills ?? [],
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
  });
});

router.get("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }

  const rows = await db.select().from(teamMembersTable).where(eq(teamMembersTable.id, id)).limit(1);
  const member = rows[0];

  if (!member) {
    res.status(404).json({ error: "Membro não encontrado" });
    return;
  }

  res.json({
    ...member,
    skills: member.skills ?? [],
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
  });
});

router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }

  const parsed = CreateTeamMemberBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.issues });
    return;
  }

  const data = parsed.data;
  const [member] = await db.update(teamMembersTable)
    .set({
      name: data.name,
      roleTitle: data.roleTitle,
      bio: data.bio ?? null,
      avatarUrl: data.avatarUrl ?? null,
      linkedinUrl: data.linkedinUrl ?? null,
      githubUrl: data.githubUrl ?? null,
      sortOrder: data.sortOrder,
      isActive: data.isActive,
      skills: data.skills,
      updatedAt: new Date(),
    })
    .where(eq(teamMembersTable.id, id))
    .returning();

  if (!member) {
    res.status(404).json({ error: "Membro não encontrado" });
    return;
  }

  res.json({
    ...member,
    skills: member.skills ?? [],
    createdAt: member.createdAt.toISOString(),
    updatedAt: member.updatedAt.toISOString(),
  });
});

router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }
  await db.delete(teamMembersTable).where(eq(teamMembersTable.id, id));
  res.json({ success: true });
});

export default router;
