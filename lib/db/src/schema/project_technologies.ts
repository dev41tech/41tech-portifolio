import { pgTable, serial, integer, timestamp, unique } from "drizzle-orm/pg-core";
import { projectsTable } from "./projects";
import { technologiesTable } from "./technologies";

export const projectTechnologiesTable = pgTable("project_technologies", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  technologyId: integer("technology_id")
    .notNull()
    .references(() => technologiesTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  unique().on(t.projectId, t.technologyId),
]);
