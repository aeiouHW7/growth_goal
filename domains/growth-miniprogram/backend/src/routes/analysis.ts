import { Router, Request, Response } from "express";

const router = Router();

router.post("/generate", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});
router.get("/:id", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});
router.post("/:id/feedback", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});

export default router;
