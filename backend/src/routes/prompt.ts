import { Router } from "express";
import { ANALYSIS_REQUIREMENTS } from "../prompts/daily-review.prompt";

const router = Router();

/** GET /api/prompt/daily-review — 获取每日复盘分析指令 */
router.get("/daily-review", (_req, res) => {
  res.json({ data: ANALYSIS_REQUIREMENTS });
});

export default router;
