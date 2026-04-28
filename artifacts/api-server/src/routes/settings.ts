import { Router, Request, Response } from "express";
import { db, siteSettingsTable } from "@workspace/db";
import { requireAuth } from "../middlewares/requireAuth";

const router = Router();

function mapSettings(s: typeof siteSettingsTable.$inferSelect) {
  return {
    id: s.id,
    heroVideoUrl: s.heroVideoUrl,
    heroVideoEnabled: s.heroVideoEnabled,
    heroFallbackImageUrl: s.heroFallbackImageUrl,
    whatsappUrl: s.whatsappUrl,
    contactEmail: s.contactEmail,
    linkedinUrl: s.linkedinUrl,
    ctaPrimaryLabel: s.ctaPrimaryLabel,
    ctaSecondaryLabel: s.ctaSecondaryLabel,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

router.get("/", async (_req: Request, res: Response) => {
  const rows = await db.select().from(siteSettingsTable).limit(1);
  if (!rows[0]) {
    const [created] = await db.insert(siteSettingsTable).values({}).returning();
    res.json(mapSettings(created));
    return;
  }
  res.json(mapSettings(rows[0]));
});

router.put("/", requireAuth, async (req: Request, res: Response) => {
  const rows = await db.select().from(siteSettingsTable).limit(1);
  const body = req.body as {
    heroVideoUrl?: string | null;
    heroVideoEnabled?: boolean;
    heroFallbackImageUrl?: string | null;
    whatsappUrl?: string | null;
    contactEmail?: string | null;
    linkedinUrl?: string | null;
    ctaPrimaryLabel?: string;
    ctaSecondaryLabel?: string;
  };

  if (!rows[0]) {
    const [created] = await db.insert(siteSettingsTable).values({
      heroVideoUrl: body.heroVideoUrl ?? null,
      heroVideoEnabled: body.heroVideoEnabled ?? false,
      heroFallbackImageUrl: body.heroFallbackImageUrl ?? null,
      whatsappUrl: body.whatsappUrl ?? null,
      contactEmail: body.contactEmail ?? null,
      linkedinUrl: body.linkedinUrl ?? null,
      ctaPrimaryLabel: body.ctaPrimaryLabel ?? "Quero automatizar minha operação",
      ctaSecondaryLabel: body.ctaSecondaryLabel ?? "Ver projetos",
    }).returning();
    res.json(mapSettings(created));
    return;
  }

  const [updated] = await db
    .update(siteSettingsTable)
    .set({
      heroVideoUrl: body.heroVideoUrl !== undefined ? body.heroVideoUrl : rows[0].heroVideoUrl,
      heroVideoEnabled: body.heroVideoEnabled !== undefined ? body.heroVideoEnabled : rows[0].heroVideoEnabled,
      heroFallbackImageUrl: body.heroFallbackImageUrl !== undefined ? body.heroFallbackImageUrl : rows[0].heroFallbackImageUrl,
      whatsappUrl: body.whatsappUrl !== undefined ? body.whatsappUrl : rows[0].whatsappUrl,
      contactEmail: body.contactEmail !== undefined ? body.contactEmail : rows[0].contactEmail,
      linkedinUrl: body.linkedinUrl !== undefined ? body.linkedinUrl : rows[0].linkedinUrl,
      ctaPrimaryLabel: body.ctaPrimaryLabel ?? rows[0].ctaPrimaryLabel,
      ctaSecondaryLabel: body.ctaSecondaryLabel ?? rows[0].ctaSecondaryLabel,
      updatedAt: new Date(),
    })
    .returning();

  res.json(mapSettings(updated));
});

export default router;
