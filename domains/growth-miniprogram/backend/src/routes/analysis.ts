import { Router } from "express";
import { AnalysisController } from "../controllers/analysis.controller";

const router = Router();
const c = new AnalysisController();

router.post("/generate", c.generate.bind(c));
router.get("/:id", c.getById.bind(c));
router.post("/:id/feedback", c.submitFeedback.bind(c));

export default router;
