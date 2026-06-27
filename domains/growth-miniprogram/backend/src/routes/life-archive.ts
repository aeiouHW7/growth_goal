import { Router } from "express";
import { LifeArchiveController } from "../controllers/life-archive.controller";

const router = Router();
const c = new LifeArchiveController();

router.get("/", c.get.bind(c));
router.put("/", c.upsert.bind(c));
router.patch("/layer-core", c.updateLayerCore.bind(c));
router.patch("/layer-resources", c.updateLayerResources.bind(c));
router.patch("/layer-future", c.updateLayerFuture.bind(c));
router.post("/energy", c.updateEnergy.bind(c));
router.post("/health", c.updateHealth.bind(c));
router.post("/behavior", c.updateBehavior.bind(c));
router.get("/summary", c.getSummary.bind(c));
router.post("/summary/refresh", c.refreshSummary.bind(c));

export default router;
