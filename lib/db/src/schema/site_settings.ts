import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const siteSettingsTable = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  heroVideoUrl: text("hero_video_url"),
  heroVideoEnabled: boolean("hero_video_enabled").notNull().default(false),
  heroFallbackImageUrl: text("hero_fallback_image_url"),
  whatsappUrl: text("whatsapp_url"),
  contactEmail: text("contact_email"),
  linkedinUrl: text("linkedin_url"),
  ctaPrimaryLabel: text("cta_primary_label").notNull().default("Quero automatizar minha operação"),
  ctaSecondaryLabel: text("cta_secondary_label").notNull().default("Ver projetos"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettingsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;
export type SiteSettings = typeof siteSettingsTable.$inferSelect;
