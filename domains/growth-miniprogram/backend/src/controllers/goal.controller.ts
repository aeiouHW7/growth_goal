import { Request, Response, NextFunction } from "express";
import { GoalService } from "../services/goal.service";
import { UserService } from "../services/user.service";

const id = (r: Request) => r.params.id as string;

const goalService = new GoalService();
const userService = new UserService();

async function getUserId(): Promise<string> {
  const user = await userService.get();
  if (!user) throw Object.assign(new Error("请先创建用户"), { status: 400, code: "USER_NOT_FOUND" });
  return user.id;
}

export class GoalController {
  // LifeGoal
  async listLifeGoals(_req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const goals = await goalService.listLifeGoals(userId);
      res.json({ data: goals });
    } catch (err) { next(err); }
  }

  async createLifeGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const { title, description, timeHorizon, sortOrder } = req.body;
      if (!title) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "title 为必填项" } });
        return;
      }
      const goal = await goalService.createLifeGoal({ userId, title, description, timeHorizon, sortOrder });
      res.status(201).json({ data: goal });
    } catch (err) { next(err); }
  }

  async updateLifeGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const goal = await goalService.updateLifeGoal(id(req), req.body);
      res.json({ data: goal });
    } catch (err) { next(err); }
  }

  async updateLifeGoalStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const goal = await goalService.updateLifeGoalStatus(id(req), req.body.status);
      res.json({ data: goal });
    } catch (err) { next(err); }
  }

  // YearlyGoal
  async listYearlyGoals(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const { lifeGoalId, year } = req.query;
      const goals = await goalService.listYearlyGoals(userId, {
        lifeGoalId: lifeGoalId as string | undefined,
        year: year ? parseInt(year as string, 10) : undefined,
      });
      res.json({ data: goals });
    } catch (err) { next(err); }
  }

  async createYearlyGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const { lifeGoalId, title, description, year, metricType, targetValue, startValue } = req.body;
      if (!title || !year || !metricType || !targetValue) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "title/year/metricType/targetValue 为必填项" } });
        return;
      }
      const goal = await goalService.createYearlyGoal({ userId, lifeGoalId, title, description, year, metricType, targetValue, startValue });
      res.status(201).json({ data: goal });
    } catch (err) { next(err); }
  }

  async updateYearlyGoal(req: Request, res: Response, next: NextFunction) {
    try {
      const goal = await goalService.updateYearlyGoal(id(req), req.body);
      res.json({ data: goal });
    } catch (err) { next(err); }
  }

  async updateYearlyGoalStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const goal = await goalService.updateYearlyGoalStatus(id(req), req.body.status);
      res.json({ data: goal });
    } catch (err) { next(err); }
  }

  async updateYearlyGoalProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const goal = await goalService.updateYearlyGoalProgress(id(req), req.body.currentValue);
      res.json({ data: goal });
    } catch (err) { next(err); }
  }
}
