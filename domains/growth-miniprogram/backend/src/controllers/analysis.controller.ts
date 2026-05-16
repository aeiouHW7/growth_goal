import { Request, Response, NextFunction } from "express";
import { AnalysisService } from "../services/analysis.service";

const analysisService = new AnalysisService();

function pv(req: Request, key: string): string { return req.params[key] as string; }

export class AnalysisController {
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const { dailyReviewId, weeklyReviewId, monthlyReviewId, analysisType, structuredReport, narrativeReport } = req.body;
      if (!analysisType || !structuredReport) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "analysisType/structuredReport 为必填项" } });
        return;
      }
      const analysis = await analysisService.generate({ dailyReviewId, weeklyReviewId, monthlyReviewId, analysisType, structuredReport, narrativeReport });
      res.status(201).json({ data: analysis });
    } catch (err) { next(err); }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const analysis = await analysisService.getById(pv(req, "id"));
      res.json({ data: analysis });
    } catch (err) { next(err); }
  }

  async submitFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const { userScore, excellentReason, failReason } = req.body;
      if (userScore === undefined) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "userScore 为必填项" } });
        return;
      }
      const feedback = await analysisService.submitFeedback({
        aiAnalysisId: pv(req, "id"),
        userScore,
        excellentReason,
        failReason,
      });
      res.status(201).json({ data: feedback });
    } catch (err) { next(err); }
  }
}
