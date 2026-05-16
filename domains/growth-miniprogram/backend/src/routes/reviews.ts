import { Router, Request, Response } from "express";

const router = Router();

// DailyReview
router.get("/daily", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});
router.post("/daily", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});
router.put("/daily/:id", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});
router.post("/daily/:id/followup", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});
router.get("/daily/:date", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});

// WeeklyReview
router.get("/weekly", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});
router.post("/weekly", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});
router.put("/weekly/:id", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});
router.get("/weekly/check", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});
router.get("/weekly/:year/:week", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});

// MonthlyReview
router.get("/monthly", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});
router.post("/monthly", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});
router.put("/monthly/:id", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});
router.get("/monthly/check", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});
router.get("/monthly/:year/:month", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});

export default router;
