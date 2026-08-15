import { Router } from "express";
import { GoalController } from "../controllers/goal.controller";

const router = Router();
const c = new GoalController();

// LifeGoal
router.get("/life", c.listLifeGoals.bind(c));
router.post("/life", c.createLifeGoal.bind(c));
router.put("/life/:id", c.updateLifeGoal.bind(c));
router.patch("/life/:id/status", c.updateLifeGoalStatus.bind(c));
router.delete("/life/:id", c.deleteLifeGoal.bind(c));

// YearlyGoal
router.get("/yearly", c.listYearlyGoals.bind(c));
router.get("/yearly/:id/children", c.listYearlyGoalChildren.bind(c));
router.post("/yearly", c.createYearlyGoal.bind(c));
router.put("/yearly/:id", c.updateYearlyGoal.bind(c));
router.patch("/yearly/:id/status", c.updateYearlyGoalStatus.bind(c));
router.patch("/yearly/:id/progress", c.updateYearlyGoalProgress.bind(c));
router.delete("/yearly/:id", c.deleteYearlyGoal.bind(c));

// AI 目标拆解
router.post("/ai-suggest/yearly", c.aiSuggestYearly.bind(c));
router.post("/ai-suggest/yearly/confirm", c.confirmYearlyGoals.bind(c));

export default router;
