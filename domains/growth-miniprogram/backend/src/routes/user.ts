import { Router, Request, Response } from "express";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});

router.post("/", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});

router.put("/", (_req: Request, res: Response) => {
  res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
});

export default router;
