import { Request, Response, NextFunction } from "express";
import { Prisma } from "@prisma/client";

export interface AppError {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2025") {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "资源不存在" } });
      return;
    }
    res.status(400).json({ error: { code: "DATABASE_ERROR", message: err.message } });
    return;
  }

  const status = (err as AppError).status || 500;
  const code = (err as AppError).code || "INTERNAL_ERROR";
  const message = err.message || "服务器内部错误";

  res.status(status).json({
    error: { code, message, details: (err as AppError).details || undefined },
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    error: { code: "NOT_FOUND", message: "资源不存在" },
  });
}
