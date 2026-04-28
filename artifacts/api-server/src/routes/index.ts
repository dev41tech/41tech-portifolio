import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import projectsRouter from "./projects";
import teamRouter from "./team";
import casesRouter from "./cases";
import technologiesRouter from "./technologies";
import statsRouter from "./stats";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/auth", authRouter);
router.use("/projects", projectsRouter);
router.use("/team", teamRouter);
router.use("/cases", casesRouter);
router.use("/technologies", technologiesRouter);
router.use("/stats", statsRouter);
router.use("/settings", settingsRouter);

export default router;
