import { Request, Response, NextFunction } from "express";
import { ReviewService } from "../services/review.service";
import { UserService } from "../services/user.service";

const reviewService = new ReviewService();
const userService = new UserService();

function pv(req: Request, key: string): string { return req.params[key] as string; }

async function getUserId(): Promise<string> {
  const user = await userService.get();
  if (!user) throw Object.assign(new Error("请先创建用户"), { status: 400, code: "USER_NOT_FOUND" });
  return user.id;
}

export class ReviewController {
  // DailyReview
  async getByDate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const review = await reviewService.getByDate(userId, pv(req, "date"));
      res.json({ data: review });
    } catch (err) { next(err); }
  }

  async listDaily(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const { from, to } = req.query;
      const reviews = await reviewService.listDaily(userId, from as string | undefined, to as string | undefined);
      res.json({ data: reviews });
    } catch (err) { next(err); }
  }

  async createDaily(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const { date, rawInput } = req.body;
      if (!date || !rawInput) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "date/rawInput 为必填项" } });
        return;
      }
      const review = await reviewService.createDaily(userId, date, rawInput);
      res.status(201).json({ data: review });
    } catch (err) { next(err); }
  }

  async updateDaily(req: Request, res: Response, next: NextFunction) {
    try {
      const review = await reviewService.updateDaily(pv(req, "id"), req.body);
      res.json({ data: review });
    } catch (err) { next(err); }
  }

  async addFollowUp(req: Request, res: Response, next: NextFunction) {
    try {
      const { question, answer } = req.body;
      if (!question || !answer) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "question/answer 为必填项" } });
        return;
      }
      const review = await reviewService.addFollowUp(pv(req, "id"), question, answer);
      res.json({ data: review });
    } catch (err) { next(err); }
  }

  // WeeklyReview
  async getWeekly(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const year = parseInt(pv(req, "year"), 10);
      const week = parseInt(pv(req, "week"), 10);
      const review = await reviewService.getWeekly(userId, year, week);
      res.json({ data: review });
    } catch (err) { next(err); }
  }

  async createWeekly(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const { weekStart, weekEnd, year, week, rawInput, summary } = req.body;
      if (!weekStart || !weekEnd || !year || !week) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "weekStart/weekEnd/year/week 为必填项" } });
        return;
      }
      const review = await reviewService.createWeekly({ userId, weekStart, weekEnd, year, week, rawInput, summary });
      res.status(201).json({ data: review });
    } catch (err) { next(err); }
  }

  async updateWeekly(req: Request, res: Response, next: NextFunction) {
    try {
      const review = await reviewService.updateWeekly(pv(req, "id"), req.body);
      res.json({ data: review });
    } catch (err) { next(err); }
  }

  async checkWeekly(req: Request, res: Response, next: NextFunction) {
    try {
      const year = parseInt(req.query.year as string, 10);
      const week = parseInt(req.query.week as string, 10);
      const result = await reviewService.checkWeekly(year, week);
      res.json({ data: result });
    } catch (err) { next(err); }
  }

  async listWeekly(_req: Request, res: Response) {
    res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
  }

  // MonthlyReview
  async getMonthly(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const year = parseInt(pv(req, "year"), 10);
      const month = parseInt(pv(req, "month"), 10);
      const review = await reviewService.getMonthly(userId, year, month);
      res.json({ data: review });
    } catch (err) { next(err); }
  }

  async createMonthly(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const { month, year, rawInput, summary } = req.body;
      if (!month || !year) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "month/year 为必填项" } });
        return;
      }
      const review = await reviewService.createMonthly({ userId, month, year, rawInput, summary });
      res.status(201).json({ data: review });
    } catch (err) { next(err); }
  }

  async updateMonthly(req: Request, res: Response, next: NextFunction) {
    try {
      const review = await reviewService.updateMonthly(pv(req, "id"), req.body);
      res.json({ data: review });
    } catch (err) { next(err); }
  }

  async checkMonthly(req: Request, res: Response, next: NextFunction) {
    try {
      const year = parseInt(req.query.year as string, 10);
      const month = parseInt(req.query.month as string, 10);
      const result = await reviewService.checkMonthly(year, month);
      res.json({ data: result });
    } catch (err) { next(err); }
  }

  async listMonthly(_req: Request, res: Response) {
    res.status(501).json({ error: { code: "NOT_IMPLEMENTED", message: "待实现" } });
  }
}
