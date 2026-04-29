import { Router, Request, Response } from "express";
import { db, technologiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateTechnologyBody } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

router.get("/", async (_req: Request, res: Response) => {
  const rows = await db.select().from(technologiesTable).orderBy(technologiesTable.name);
  res.json(rows.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  })));
});

router.post("/", requireAuth, async (req: Request, res: Response) => {
  const parsed = CreateTechnologyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.issues });
    return;
  }

  const data = parsed.data;
  const [tech] = await db.insert(technologiesTable).values({
    name: data.name,
    iconUrl: data.iconUrl ?? null,
    category: data.category ?? null,
  }).returning();

  res.status(201).json({
    ...tech,
    createdAt: tech.createdAt.toISOString(),
    updatedAt: tech.updatedAt.toISOString(),
  });
});

router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }

  const parsed = CreateTechnologyBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos", details: parsed.error.issues });
    return;
  }

  const data = parsed.data;
  const [tech] = await db.update(technologiesTable)
    .set({
      name: data.name,
      iconUrl: data.iconUrl ?? null,
      category: data.category ?? null,
      updatedAt: new Date(),
    })
    .where(eq(technologiesTable.id, id))
    .returning();

  if (!tech) {
    res.status(404).json({ error: "Tecnologia não encontrada" });
    return;
  }

  res.json({
    ...tech,
    createdAt: tech.createdAt.toISOString(),
    updatedAt: tech.updatedAt.toISOString(),
  });
});

router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const id = parseInt(String(req.params.id));
  if (isNaN(id)) {
    res.status(400).json({ error: "ID inválido" });
    return;
  }
  await db.delete(technologiesTable).where(eq(technologiesTable.id, id));
  res.json({ success: true });
});

export default router;
