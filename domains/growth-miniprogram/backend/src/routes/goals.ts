import { Router, Request, Response } from "express";

const router = Router();

// LifeGoal
router.get("/life", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});
router.post("/life", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});
router.put("/life/:id", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});
router.patch("/life/:id/status", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});

// YearlyGoal
router.get("/yearly", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});
router.post("/yearly", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});
router.put("/yearly/:id", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});
router.patch("/yearly/:id/status", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});
router.patch("/yearly/:id/progress", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});

export default router;
