import { prisma } from "../prisma";
import { bigramJaccard } from "../utils/string-sim";

export interface DetectedPattern {
  pattern: string;
  dimension?: string;
  frequency: number;
  firstDetected?: string;
}

const SIMILARITY_THRESHOLD = 0.45;

export class PatternService {
  /** 超过此天数未更新的模式自动 inactive */
  private readonly PATTERN_DECAY_DAYS = 14;

  /**
   * 将超过 N 天未更新的模式标记为 inactive
   */
  async decayOldPatterns(userId: string, maxAgeDays = this.PATTERN_DECAY_DAYS): Promise<number> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - maxAgeDays);

    const result = await prisma.behaviorPattern.updateMany({
      where: { userId, active: true, lastDetected: { lt: cutoff } },
      data: { active: false },
    });
    return result.count;
  }

  /**
   * 从 AI 分析结果中提取反复出现的障碍，追踪到 BehaviorPattern 表
   * 来源：executionDiagnosis.issues、foggDiagnosis
   */
  async trackIssuesFromAnalysis(userId: string, structuredReport: Record<string, any>): Promise<DetectedPattern[]> {
    // 先衰减过期模式，保持活跃列表干净
    await this.decayOldPatterns(userId);

    const issues: string[] = [];

    // 从执行诊断中提取 issue
    const diag = structuredReport.executionDiagnosis;
    if (diag?.issues && Array.isArray(diag.issues)) {
      issues.push(...diag.issues);
    }
    // 从 rootCause 提取
    if (diag?.rootCause && typeof diag.rootCause === "string" && diag.rootCause.length > 4) {
      issues.push(diag.rootCause);
    }
    // 从 Fogg 诊断提取
    const fogg = structuredReport.foggDiagnosis;
    if (fogg?.detail && typeof fogg.detail === "string" && fogg.detail.length > 4) {
      issues.push(fogg.detail);
    }

    if (issues.length === 0) return [];

    const results: DetectedPattern[] = [];

    // 获取所有已有模式用于相似度匹配
    const existingPatterns = await prisma.behaviorPattern.findMany({
      where: { userId, active: true },
      select: { id: true, pattern: true },
    });

    for (const issue of issues) {
      if (!issue || issue.trim().length < 4) continue;

      // 用 bigram Jaccard 匹配已有模式
      let matched = existingPatterns.find(p => bigramJaccard(issue, p.pattern) >= SIMILARITY_THRESHOLD);

      if (matched) {
        await prisma.behaviorPattern.update({
          where: { id: matched.id },
          data: {
            lastDetected: new Date(),
            frequency: { increment: 1 },
          },
        });
      } else {
        const created = await prisma.behaviorPattern.create({
          data: {
            userId,
            pattern: issue.trim().slice(0, 200),
            dimension: this.inferDimension(issue),
            firstDetected: new Date(),
            lastDetected: new Date(),
            frequency: 1,
          },
        });
        matched = created;
      }

      // 获取最新频率
      const updated = await prisma.behaviorPattern.findUnique({ where: { id: matched.id } });
      if (updated) {
        results.push({
          pattern: updated.pattern,
          dimension: updated.dimension ?? undefined,
          frequency: updated.frequency,
          firstDetected: updated.firstDetected.toISOString(),
        });
      }
    }

    return results.sort((a, b) => b.frequency - a.frequency);
  }

  /** 从 issue 文本推断所属维度 */
  private inferDimension(issue: string): string {
    if (/运动|健身|跑步|体态|训练|面拉|划船|睡|熬夜|失眠|早起|健康/i.test(issue)) return "health";
    if (/情绪|焦虑|压力|心态|动力|拖延|没劲/i.test(issue)) return "self_awareness";
    return "execution";
  }

  /** 获取达到阈值的反复障碍（默认 3 次及以上） */
  async getRecurringIssues(userId: string, minFrequency = 3): Promise<DetectedPattern[]> {
    await this.decayOldPatterns(userId);
    const patterns = await prisma.behaviorPattern.findMany({
      where: { userId, active: true, frequency: { gte: minFrequency } },
      orderBy: { frequency: "desc" },
      take: 10,
    });
    return patterns.map((p) => ({
      pattern: p.pattern,
      dimension: p.dimension ?? undefined,
      frequency: p.frequency,
      firstDetected: p.firstDetected.toISOString(),
    }));
  }

  /** 获取所有活跃模式（给 context 用） */
  async getActivePatterns(userId: string): Promise<DetectedPattern[]> {
    await this.decayOldPatterns(userId);
    const patterns = await prisma.behaviorPattern.findMany({
      where: { userId, active: true },
      orderBy: { frequency: "desc" },
      take: 20,
    });
    return patterns.map((p) => ({
      pattern: p.pattern,
      dimension: p.dimension ?? undefined,
      frequency: p.frequency,
      firstDetected: p.firstDetected.toISOString(),
    }));
  }
}
