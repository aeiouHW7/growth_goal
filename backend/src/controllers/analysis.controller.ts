import { Request, Response, NextFunction } from "express";
import { AnalysisService } from "../services/analysis.service";
import { UserService } from "../services/user.service";
import { SignalDepthService } from "../services/signal-depth.service";
import { PatternService } from "../services/pattern.service";
import { BiasDetectionService } from "../services/bias-detection.service";
import { CapabilityService } from "../services/capability.service";
import type { StructuredReport } from "../types/structured-report";

const analysisService = new AnalysisService();
const userService = new UserService();
const signalDepth = new SignalDepthService();
const patternService = new PatternService();
const biasDetection = new BiasDetectionService();
const capabilityService = new CapabilityService();

async function getUserId(): Promise<string> {
  const user = await userService.get();
  if (!user) throw Object.assign(new Error("请先创建用户"), { status: 400, code: "USER_NOT_FOUND" });
  return user.id;
}

function pv(req: Request, key: string): string { return req.params[key] as string; }

export class AnalysisController {
  async generate(req: Request, res: Response, next: NextFunction) {
    try {
      const { dailyReviewId, weeklyReviewId, monthlyReviewId, analysisType, structuredReport, narrativeReport } = req.body;
      if (!analysisType || !structuredReport) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "analysisType/structuredReport 为必填项" } });
        return;
      }

      // 每日复盘指标（可选，有则校验）
      if (analysisType === "DAILY") {
        const report = structuredReport as StructuredReport;
        if (report.energyRate != null && (report.energyRate < 1 || report.energyRate > 100)) {
          res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "energyRate 必须在 1-100 之间" } });
          return;
        }
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

  async suggestions(_req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const data = await analysisService.getSuggestions(userId);
      res.json({ data });
    } catch (err) { next(err); }
  }

  // ===== self-growth-analyst 引擎端点 =====

  /** GET /api/analysis/patterns — 当前活跃模式/反复障碍列表 */
  async getPatterns(_req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const data = await patternService.getActivePatterns(userId);
      res.json({ data });
    } catch (err) { next(err); }
  }

  /** GET /api/analysis/patterns/recurring — 反复障碍（频率≥3） */
  async getRecurringPatterns(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const minFreq = req.query.minFrequency ? parseInt(req.query.minFrequency as string, 10) : 3;
      const data = await patternService.getRecurringIssues(userId, minFreq);
      res.json({ data });
    } catch (err) { next(err); }
  }

  /** POST /api/analysis/patterns/track — 从分析结果追踪障碍模式 */
  async trackPatterns(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const { structuredReport } = req.body;
      if (!structuredReport) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "structuredReport 为必填项" } });
        return;
      }
      const data = await patternService.trackIssuesFromAnalysis(userId, structuredReport);
      res.status(201).json({ data });
    } catch (err) { next(err); }
  }

  /** GET /api/analysis/biases — 偏误历史 */
  async getBiases(_req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const data = await biasDetection.getBiasHistory(userId);
      res.json({ data });
    } catch (err) { next(err); }
  }

  /** POST /api/analysis/biases/log — 从 AI 分析结果写入偏误日志 */
  async logBiasesFromAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const { dailyReviewId, structuredReport } = req.body;
      if (!structuredReport) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "structuredReport 为必填项" } });
        return;
      }
      const data = await biasDetection.logFromAnalysis(userId, dailyReviewId || null, structuredReport);
      res.status(201).json({ data });
    } catch (err) { next(err); }
  }

  /** GET /api/analysis/capabilities — 能力评分趋势 */
  async getCapabilities(_req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const data = await capabilityService.getLatestScores(userId);
      res.json({ data });
    } catch (err) { next(err); }
  }

  /** POST /api/analysis/signal-score — 信号厚度评分 */
  async signalScore(req: Request, res: Response, next: NextFunction) {
    try {
      const { input } = req.body;
      if (!input) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "input 为必填项" } });
        return;
      }
      const result = signalDepth.score(input);
      res.json({ data: result });
    } catch (err) { next(err); }
  }

  /** POST /api/analysis/capability — 记录能力评分 */
  async recordCapability(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const { dimension, score, evidence } = req.body;
      if (!dimension || score === undefined) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "dimension/score 为必填项" } });
        return;
      }
      const delta = await capabilityService.getDelta(userId, dimension, score);
      const record = await capabilityService.recordScore(userId, dimension, score, evidence);
      res.status(201).json({ data: { record, delta } });
    } catch (err) { next(err); }
  }

  /** POST /api/analysis/capabilities/log — 从 AI 分析结果批量写入能力评分 */
  async logCapabilitiesFromAnalysis(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const { structuredReport } = req.body;
      if (!structuredReport) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "structuredReport 为必填项" } });
        return;
      }
      const deltas = structuredReport.capabilityDeltas as Array<{ dimension: string; score: number; evidence: string }> | undefined;
      if (!deltas || !Array.isArray(deltas) || deltas.length === 0) {
        res.status(200).json({ data: [] });
        return;
      }
      const data = await capabilityService.logFromAnalysis(userId, deltas);
      res.status(201).json({ data });
    } catch (err) { next(err); }
  }
}
