import { Request, Response, NextFunction } from "express";
import { ProgressService } from "../services/progress.service";
import { UserService } from "../services/user.service";

const progressService = new ProgressService();
const userService = new UserService();

function pv(req: Request, key: string): string { return req.params[key] as string; }

async function getUserId(): Promise<string> {
  const user = await userService.get();
  if (!user) throw Object.assign(new Error("请先创建用户"), { status: 400, code: "USER_NOT_FOUND" });
  return user.id;
}

export class ProgressController {
  async overview(_req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const data = await progressService.overview(userId);
      res.json({ data });
    } catch (err) { next(err); }
  }

  async goalChain(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const data = await progressService.goalChain(userId, pv(req, "goalId"));
      res.json({ data });
    } catch (err) { next(err); }
  }

  async calendar(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const year = parseInt(req.query.year as string, 10) || new Date().getFullYear();
      const month = parseInt(req.query.month as string, 10) || (new Date().getMonth() + 1);
      const data = await progressService.calendar(userId, year, month);
      res.json({ data });
    } catch (err) { next(err); }
  }
}
