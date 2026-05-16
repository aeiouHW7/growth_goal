import { Router } from "express";
import { ReviewController } from "../controllers/review.controller";

const router = Router();
const c = new ReviewController();

// DailyReview — order: static paths first, param paths after
router.get("/daily", c.listDaily.bind(c));
router.post("/daily", c.createDaily.bind(c));
router.put("/daily/:id", c.updateDaily.bind(c));
router.post("/daily/:id/followup", c.addFollowUp.bind(c));
router.get("/daily/:date", c.getByDate.bind(c));

// WeeklyReview — check before param routes
router.get("/weekly", c.listWeekly.bind(c));
router.get("/weekly/check", c.checkWeekly.bind(c));
router.post("/weekly", c.createWeekly.bind(c));
router.put("/weekly/:id", c.updateWeekly.bind(c));
router.get("/weekly/:year/:week", c.getWeekly.bind(c));

// MonthlyReview
router.get("/monthly", c.listMonthly.bind(c));
router.get("/monthly/check", c.checkMonthly.bind(c));
router.post("/monthly", c.createMonthly.bind(c));
router.put("/monthly/:id", c.updateMonthly.bind(c));
router.get("/monthly/:year/:month", c.getMonthly.bind(c));

export default router;
