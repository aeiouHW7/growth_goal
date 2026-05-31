import { prisma } from "../prisma";

// 20 维能力框架（来源：self-growth-analyst capability_framework.md）
export const CAPABILITY_DIMENSIONS = [
  "cognition",       // 认知
  "execution",       // 执行
  "communication",   // 沟通
  "influence",       // 影响力
  "strategy",        // 策略
  "risk_management", // 风控
  "leadership",      // 领导力
  "learning",        // 学习
  "self_awareness",  // 自我认知
  "emotional_quota", // 情绪商数
  "social",          // 社交
  "negotiation",     // 谈判
  "decision",        // 决策
  "creativity",      // 创造力
  "business_acumen", // 商业敏锐
  "resource_integration", // 资源整合
  "political_wisdom", // 政治智慧
  "time_management", // 时间管理
  "psychological",   // 心理韧性
] as const;

export type CapabilityDimension = typeof CAPABILITY_DIMENSIONS[number];

export class CapabilityService {
  /**
   * 记录能力评分
   */
  async recordScore(userId: string, dimension: string, score: number, evidence?: string, source = "daily_review") {
    return prisma.capabilityScore.create({
      data: { userId, dimension, score, evidence, source },
    });
  }

  /**
   * 获取最新评分（每个维度取最新一条）
   */
  async getLatestScores(userId: string) {
    const scores = await prisma.capabilityScore.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // 每个维度取最新一条
    const latest = new Map<string, { score: number; evidence: string | null; createdAt: Date }>();
    for (const s of scores) {
      if (!latest.has(s.dimension)) {
        latest.set(s.dimension, { score: s.score, evidence: s.evidence, createdAt: s.createdAt });
      }
    }

    return Array.from(latest.entries()).map(([dimension, data]) => ({
      dimension,
      score: data.score,
      evidence: data.evidence,
      lastUpdated: data.createdAt.toISOString(),
    }));
  }

  /**
   * 获取维度的评分趋势
   */
  async getDimensionTrend(userId: string, dimension: string, days = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return prisma.capabilityScore.findMany({
      where: { userId, dimension, createdAt: { gte: since } },
      orderBy: { createdAt: "asc" },
    });
  }

  /**
   * 计算与上次评分的变化
   */
  async getDelta(userId: string, dimension: string, newScore: number): Promise<{ delta: number; previousScore?: number }> {
    const last = await prisma.capabilityScore.findFirst({
      where: { userId, dimension },
      orderBy: { createdAt: "desc" },
    });

    if (!last) return { delta: 0 };
    return { delta: Number((newScore - last.score).toFixed(1)), previousScore: last.score };
  }

  /**
   * 从 AI 分析结果（capabilityDeltas）批量写入 CapabilityScore 表
   * 每条包含 dimension + score（绝对值）+ evidence
   */
  async logFromAnalysis(userId: string, deltas: Array<{ dimension: string; score: number; evidence: string }>) {
    const results: Array<{ dimension: string; delta: number; previousScore?: number; score: number; evidence: string }> = [];

    for (const item of deltas) {
      if (!item.dimension || item.score === undefined || item.score < 0 || item.score > 10) continue;
      const { delta, previousScore } = await this.getDelta(userId, item.dimension, item.score);
      await prisma.capabilityScore.create({
        data: { userId, dimension: item.dimension, score: item.score, evidence: item.evidence || null },
      });
      results.push({ dimension: item.dimension, delta, previousScore, score: item.score, evidence: item.evidence });
    }

    return results;
  }
}
