import { Request, Response, NextFunction } from "express";
import { LifeArchiveService } from "../services/life-archive.service";
import { UserService } from "../services/user.service";

const lifeArchiveService = new LifeArchiveService();
const userService = new UserService();

async function getUserId(): Promise<string> {
  const user = await userService.get();
  if (!user) throw Object.assign(new Error("请先创建用户"), { status: 400, code: "USER_NOT_FOUND" });
  return user.id;
}

export class LifeArchiveController {
  /** GET /api/life-archive — 获取完整档案 */
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const archive = await lifeArchiveService.get(userId);
      res.json({ data: archive });
    } catch (err) { next(err); }
  }

  /** PUT /api/life-archive — 全量更新 */
  async upsert(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const { layerCore, layerResources, layerBehavior, layerFuture } = req.body;
      const archive = await lifeArchiveService.upsert(userId, { layerCore, layerResources, layerBehavior, layerFuture });
      res.json({ data: archive });
    } catch (err) { next(err); }
  }

  /** PATCH /api/life-archive/layer-core — 更新第一层 */
  async updateLayerCore(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const { personality } = req.body;
      if (!personality) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "personality 为必填项" } });
        return;
      }
      const archive = await lifeArchiveService.updateLayerCore(userId, { personality });
      res.json({ data: archive });
    } catch (err) { next(err); }
  }

  /** PATCH /api/life-archive/layer-resources — 更新第二层 */
  async updateLayerResources(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const archive = await lifeArchiveService.updateLayerResources(userId, req.body);
      res.json({ data: archive });
    } catch (err) { next(err); }
  }

  /** PATCH /api/life-archive/layer-future — 更新第四层 */
  async updateLayerFuture(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const { vision, goalSource, outcomeRange, roleModels } = req.body;
      if (!vision && !goalSource && !outcomeRange && !roleModels) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "至少需要一个模块的数据" } });
        return;
      }
      const archive = await lifeArchiveService.updateLayerFuture(userId, { vision, goalSource, outcomeRange, roleModels });
      res.json({ data: archive });
    } catch (err) { next(err); }
  }

  /** POST /api/life-archive/energy — AI 写入能量精力 */
  async updateEnergy(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const { energyDescription } = req.body;
      if (!energyDescription) {
        res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "energyDescription 为必填项" } });
        return;
      }
      const archive = await lifeArchiveService.updateEnergy(userId, { energyDescription });
      res.json({ data: archive });
    } catch (err) { next(err); }
  }

  /** POST /api/life-archive/health — AI 写入健康基础 */
  async updateHealth(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const archive = await lifeArchiveService.updateHealth(userId, req.body);
      res.json({ data: archive });
    } catch (err) { next(err); }
  }

  /** POST /api/life-archive/behavior — AI 写入历史行为（自动） */
  async updateBehavior(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const { successPatterns, failurePatterns, productivityPatterns, decisionMistakes } = req.body;
      const archive = await lifeArchiveService.updateBehavior(userId, { successPatterns, failurePatterns, productivityPatterns, decisionMistakes });
      res.json({ data: archive });
    } catch (err) { next(err); }
  }

  /** GET /api/life-archive/summary — 获取摘要 */
  async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const summary = await lifeArchiveService.getSummary(userId);
      res.json({ data: { summary } });
    } catch (err) { next(err); }
  }

  /** POST /api/life-archive/summary/refresh — 刷新摘要 */
  async refreshSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = await getUserId();
      const summary = await lifeArchiveService.refreshSummary(userId);
      res.json({ data: { summary } });
    } catch (err) { next(err); }
  }
}
