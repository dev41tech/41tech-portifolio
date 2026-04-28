import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const technologiesTable = pgTable("technologies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  iconUrl: text("icon_url"),
  category: text("category"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertTechnologySchema = createInsertSchema(technologiesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertTechnology = z.infer<typeof insertTechnologySchema>;
export type Technology = typeof technologiesTable.$inferSelect;
