import { pgTable, serial, integer, text, timestamp, unique } from "drizzle-orm/pg-core";
import { projectsTable } from "./projects";
import { teamMembersTable } from "./team_members";

export const projectOwnersTable = pgTable("project_owners", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  teamMemberId: integer("team_member_id")
    .notNull()
    .references(() => teamMembersTable.id, { onDelete: "cascade" }),
  roleInProject: text("role_in_project"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  unique("unique_project_owner").on(t.projectId, t.teamMemberId),
]);
