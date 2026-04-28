import { Router, Request, Response } from "express";
import { db, projectsTable, teamMembersTable, casesTable, technologiesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

const router = Router();

router.get("/summary", async (_req: Request, res: Response) => {
  const [projectCount] = await db.select({ count: sql<number>`count(*)::int` }).from(projectsTable);
  const [featuredCount] = await db.select({ count: sql<number>`count(*)::int` }).from(projectsTable).where(eq(projectsTable.featured, true));
  const [teamCount] = await db.select({ count: sql<number>`count(*)::int` }).from(teamMembersTable).where(eq(teamMembersTable.isActive, true));
  const [caseCount] = await db.select({ count: sql<number>`count(*)::int` }).from(casesTable);
  const [techCount] = await db.select({ count: sql<number>`count(*)::int` }).from(technologiesTable);

  res.json({
    totalProjects: projectCount?.count ?? 0,
    featuredProjects: featuredCount?.count ?? 0,
    totalTeamMembers: teamCount?.count ?? 0,
    totalCases: caseCount?.count ?? 0,
    totalTechnologies: techCount?.count ?? 0,
  });
});

export default router;
