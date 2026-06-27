import { AnalysisType, Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { bigramJaccard } from "../utils/string-sim";

export class AnalysisService {
  async generate(data: {
    dailyReviewId?: string;
    weeklyReviewId?: string;
    monthlyReviewId?: string;
    analysisType: AnalysisType;
    structuredReport: Prisma.InputJsonValue;
    narrativeReport?: string;
  }) {
    return prisma.aIAnalysis.create({ data, include: { feedbacks: true } });
  }

  async getById(id: string) {
    return prisma.aIAnalysis.findUnique({
      where: { id },
      include: { feedbacks: { include: { reflections: true, successCases: true } } },
    });
  }

  async submitFeedback(data: {
    aiAnalysisId: string;
    userScore: number;
    excellentReason?: string;
    failReason?: string;
  }) {
    if (data.userScore < 0 || data.userScore > 100) {
      throw Object.assign(new Error("评分必须在 0-100 之间"), {
        status: 400, code: "VALIDATION_ERROR",
      });
    }

    const isPass = data.userScore >= 60;
    const isExcellent = data.userScore >= 80;

    const feedback = await prisma.aIAnalysisFeedback.create({
      data: {
        aiAnalysisId: data.aiAnalysisId,
        userScore: data.userScore,
        isPass,
        isExcellent,
        excellentReason: data.excellentReason,
        failReason: data.failReason,
      },
    });

    // Auto-create Reflection or SuccessCase
    if (!isPass && data.failReason) {
      await prisma.aIReflection.create({
        data: {
          feedbackId: feedback.id,
          issueDescription: data.failReason,
          improvementDirection: `根据用户反馈优化分析: ${data.failReason}`,
        },
      });
    }

    if (isExcellent && data.excellentReason) {
      await prisma.aISuccessCase.create({
        data: {
          feedbackId: feedback.id,
          excellentPattern: data.excellentReason,
          replicableCondition: "当类似场景出现时，复用本次分析模式",
        },
      });
    }

    return prisma.aIAnalysisFeedback.findUnique({
      where: { id: feedback.id },
      include: { reflections: true, successCases: true },
    });
  }

  /**
   * 对两条建议消息去重判断（中文/短文本语义相似度）
   * - 短串是长串的子串 → 重复
   * - 共享字符比例 > 70% → 重复
   */
  private isDuplicate(a: string, b: string): boolean {
    return bigramJaccard(a, b) > 0.6;
  }

  async getSuggestions(userId: string) {
    const [recentAnalyses, reflections, successCases] = await Promise.all([
      prisma.aIAnalysis.findMany({
        where: {
          OR: [
            { dailyReview: { userId } },
            { weeklyReview: { userId } },
            { monthlyReview: { userId } },
          ],
        },
        orderBy: { createdAt: "desc" },
        take: 7,
      }),
      prisma.aIReflection.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.aISuccessCase.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    if (recentAnalyses.length === 0 && reflections.length === 0 && successCases.length === 0) {
      return [];
    }

    // 最新一次分析的 suggestions 是 AI 已清理过期项后的版本，作为唯一主源
    // 旧分析的 suggestions 不补充——AI 已在最新分析中判断哪些建议仍有效
    const latestAnalysis = recentAnalyses[0];

    const raw: Array<{
      type: "positive" | "warning" | "critical";
      message: string;
      priority: number;
    }> = [];

    // Step 1: 最新分析的 suggestions（priority 3）
    const latestReport = latestAnalysis?.structuredReport as any;
    if (latestReport && Array.isArray(latestReport.suggestions)) {
      for (const s of latestReport.suggestions) {
        if (s.message) {
          raw.push({ type: s.type || "warning", message: s.message, priority: 3 });
        }
      }
    }

    // Step 2: 最新分析没有 suggestions 时，fallback 到 executionDiagnosis（priority 2）
    if (raw.length === 0 && latestReport) {
      if (latestReport.executionDiagnosis) {
        const msg = typeof latestReport.executionDiagnosis === "object"
          ? (latestReport.executionDiagnosis.rootCause || JSON.stringify(latestReport.executionDiagnosis))
          : latestReport.executionDiagnosis;
        raw.push({ type: "critical", message: String(msg).slice(0, 200), priority: 2 });
      }
      if (latestReport.deviationAnalysis) {
        raw.push({ type: "warning", message: String(latestReport.deviationAnalysis).slice(0, 200), priority: 2 });
      }
    }

    // Step 3: Reflections — 来自用户反馈的改进点（priority 2）
    for (const ref of reflections) {
      const inExisting = raw.some((r) => this.isDuplicate(r.message, ref.issueDescription));
      if (!inExisting) {
        raw.push({ type: "warning", message: ref.issueDescription, priority: 2 });
      }
    }

    // Step 4: Success cases — 来自用户确认的成功模式（priority 2）
    for (const sc of successCases) {
      const inExisting = raw.some((r) => this.isDuplicate(r.message, sc.excellentPattern));
      if (!inExisting) {
        raw.push({ type: "positive", message: sc.excellentPattern, priority: 2 });
      }
    }

    // Deduplicate within raw (safety net)
    const typeRank = { critical: 3, warning: 2, positive: 1 };
    const deduped: typeof raw = [];
    for (const item of raw) {
      const existing = deduped.find((d) => this.isDuplicate(d.message, item.message));
      if (existing) {
        if (item.priority > existing.priority) existing.priority = item.priority;
        if (typeRank[item.type] > typeRank[existing.type]) existing.type = item.type;
      } else {
        deduped.push({ ...item });
      }
    }

    deduped.sort((a, b) => {
      const t = typeRank[b.type] - typeRank[a.type];
      if (t !== 0) return t;
      return b.priority - a.priority;
    });

    return deduped.slice(0, 8).map(({ type, message }) => ({ type, message }));
  }
}
