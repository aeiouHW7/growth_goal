import { Router, Request, Response } from "express";

const router = Router();

router.get("/overview", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});
router.get("/goal/:goalId", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});
router.get("/calendar", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});

export default router;
