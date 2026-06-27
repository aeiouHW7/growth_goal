import { Request, Response, NextFunction } from "express";
import { PlanService } from "../services/plan.service";
import { UserService } from "../services/user.service";

const planService = new PlanService();
const userService = new UserService();

function id(req: Request): string {
  return req.params.id as string;
}

async function getUserId(): Promise<string> {
  const user = await userService.get();
  if (!user) throw Object.assign(new Error("请先创建用户"), { status: 400, code: "USER_NOT_FOUND" });
  return user.id;
}

export class PlanController {
  // MonthlyPlan
  async listMonthlyPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const { yearlyGoalId, year, month } = req.query;
      const plans = await planService.listMonthlyPlans(userId, {
        yearlyGoalId: yearlyGoalId as string | undefined,
        year: year ? parseInt(year as string, 10) : undefined,
        month: month ? parseInt(month as string, 10) : undefined,
      });
      res.json({ data: plans });
    } catch (err) { next(err); }
  }

  async createMonthlyPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const { yearlyGoalId, title, description, month, year, metricType, targetValue, startValue } = req.body;
      if (!title || !month || !year || !metricType || !targetValue) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "title/month/year/metricType/targetValue 为必填项" } });
        return;
      }
      const plan = await planService.createMonthlyPlan({ userId, yearlyGoalId, title, description, month, year, metricType, targetValue, startValue });
      res.status(201).json({ data: plan });
    } catch (err) { next(err); }
  }

  async updateMonthlyPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await planService.updateMonthlyPlan(id(req), req.body);
      res.json({ data: plan });
    } catch (err) { next(err); }
  }

  async updateMonthlyPlanStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await planService.updateMonthlyPlanStatus(id(req), req.body.status);
      res.json({ data: plan });
    } catch (err) { next(err); }
  }

  async updateMonthlyPlanProgress(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await planService.updateMonthlyPlanProgress(id(req), req.body.currentValue);
      res.json({ data: plan });
    } catch (err) { next(err); }
  }

  // DailyPlan
  async listDailyPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const { monthlyPlanId, date } = req.query;
      const plans = await planService.listDailyPlans(userId, {
        monthlyPlanId: monthlyPlanId as string | undefined,
        date: date as string | undefined,
      });
      res.json({ data: plans });
    } catch (err) { next(err); }
  }

  async createDailyPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const { monthlyPlanId, title, description, date, metricType, targetValue } = req.body;
      if (!title || !date || !metricType || !targetValue) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "title/date/metricType/targetValue 为必填项" } });
        return;
      }
      const plan = await planService.createDailyPlan({ userId, monthlyPlanId, title, description, date, metricType, targetValue });
      res.status(201).json({ data: plan });
    } catch (err) { next(err); }
  }

  async updateDailyPlan(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await planService.updateDailyPlan(id(req), req.body);
      res.json({ data: plan });
    } catch (err) { next(err); }
  }

  async updateDailyPlanStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const plan = await planService.updateDailyPlanStatus(id(req), req.body.status);
      res.json({ data: plan });
    } catch (err) { next(err); }
  }

  // ─── AI 月度计划拆解 ───

  async aiSuggestMonthly(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const { yearlyGoalId } = req.body;
      if (!yearlyGoalId) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "yearlyGoalId 为必填项" } });
        return;
      }
      const data = await planService.aiSuggestMonthly(userId, yearlyGoalId);
      res.json({ data });
    } catch (err) { next(err); }
  }

  async confirmMonthlyPlans(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const { plans } = req.body;
      if (!plans || !Array.isArray(plans) || plans.length === 0) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "plans 为非空数组" } });
        return;
      }
      const created = await planService.confirmMonthlyPlans(userId, plans);
      res.status(201).json({ data: created });
    } catch (err) { next(err); }
  }
}
