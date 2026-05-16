import { Router } from "express";
import { PlanController } from "../controllers/plan.controller";

const router = Router();
const c = new PlanController();

// MonthlyPlan
router.get("/monthly", c.listMonthlyPlans.bind(c));
router.post("/monthly", c.createMonthlyPlan.bind(c));
router.put("/monthly/:id", c.updateMonthlyPlan.bind(c));
router.patch("/monthly/:id/status", c.updateMonthlyPlanStatus.bind(c));
router.patch("/monthly/:id/progress", c.updateMonthlyPlanProgress.bind(c));

// DailyPlan
router.get("/daily", c.listDailyPlans.bind(c));
router.post("/daily", c.createDailyPlan.bind(c));
router.put("/daily/:id", c.updateDailyPlan.bind(c));
router.patch("/daily/:id/status", c.updateDailyPlanStatus.bind(c));

export default router;
