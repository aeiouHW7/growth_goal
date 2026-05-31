import { Router } from "express";
import { AnalysisController } from "../controllers/analysis.controller";

const router = Router();
const c = new AnalysisController();

router.post("/generate", c.generate.bind(c));
router.get("/suggestions", c.suggestions.bind(c));
router.get("/patterns", c.getPatterns.bind(c));
router.get("/patterns/recurring", c.getRecurringPatterns.bind(c));
router.post("/patterns/track", c.trackPatterns.bind(c));
router.get("/biases", c.getBiases.bind(c));
router.post("/biases/log", c.logBiasesFromAnalysis.bind(c));
router.get("/capabilities", c.getCapabilities.bind(c));
router.post("/signal-score", c.signalScore.bind(c));
router.post("/capability", c.recordCapability.bind(c));
router.post("/capabilities/log", c.logCapabilitiesFromAnalysis.bind(c));
router.get("/:id", c.getById.bind(c));
router.post("/:id/feedback", c.submitFeedback.bind(c));

export default router;
