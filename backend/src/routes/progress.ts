import { Router } from "express";
import { ProgressController } from "../controllers/progress.controller";

const router = Router();
const c = new ProgressController();

router.get("/overview", c.overview.bind(c));
router.get("/goal/:goalId", c.goalChain.bind(c));
router.get("/calendar", c.calendar.bind(c));

export default router;
