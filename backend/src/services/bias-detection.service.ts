import { prisma } from "../prisma";

export interface DetectedBias {
  type: string;
  triggerPhrase: string;
  evidence: string;
}

// 偏误词典（来源：self-growth-analyst cognitive_biases_lexicon.md）
const BIAS_LEXICON: Array<{
  type: string;
  triggers: RegExp[];
  label: string;
}> = [
  { type: "plan_fallacy", triggers: [/半小时就好/, /肯定能做完/, /很快搞定/, /马上就好/, /一会儿就/], label: "计划谬误" },
  { type: "self_serving", triggers: [/还行/, /差不多/, /还可以/, /就那样/], label: "自我美化" },
  { type: "external_blame", triggers: [/都怪/, /要不是.*就/, /运气不好/, /对方太/], label: "基本归因错误" },
  { type: "confirmation", triggers: [/你看.*也/, /果然/, /我就知道/], label: "确认偏误" },
  { type: "loss_aversion", triggers: [/万一失败了/, /不想放弃/, /万一.*怎么办/], label: "损失厌恶" },
  { type: "status_quo", triggers: [/算了就这样/, /反正习惯了/, /懒得改/], label: "现状偏差" },
  { type: "cluster_illusion", triggers: [/一直这样/, /每次都/, /总是/, /从来都/], label: "聚类错觉" },
];

export class BiasDetectionService {
  /**
   * 检测输入中的认知偏误
   */
  detect(input: string): DetectedBias[] {
    const results: DetectedBias[] = [];

    for (const bias of BIAS_LEXICON) {
      for (const trigger of bias.triggers) {
        const match = input.match(trigger);
        if (match) {
          // 取匹配位置附近的原文（前后20字）
          const idx = match.index ?? 0;
          const start = Math.max(0, idx - 10);
          const end = Math.min(input.length, idx + match[0].length + 20);
          const evidence = (start > 0 ? "..." : "") + input.slice(start, end) + (end < input.length ? "..." : "");

          results.push({ type: bias.type, triggerPhrase: match[0], evidence });
          break; // 每种偏误只记一条
        }
      }
    }

    return results;
  }

  /**
   * 记录偏误到数据库
   */
  async logBiases(userId: string, dailyReviewId: string, biases: DetectedBias[]) {
    for (const bias of biases) {
      await prisma.cognitiveBiasLog.create({
        data: {
          userId,
          dailyReviewId,
          biasType: bias.type,
          triggerPhrase: bias.triggerPhrase,
          evidence: bias.evidence,
        },
      });
    }
  }

  /**
   * 从 AI 分析结果（structuredReport.detectedBiases）写入 CognitiveBiasLog 表
   */
  async logFromAnalysis(userId: string, dailyReviewId: string | null, report: Record<string, any>) {
    const biases = report.detectedBiases as DetectedBias[] | undefined;
    if (!biases || !Array.isArray(biases) || biases.length === 0) return [];
    await this.logBiases(userId, dailyReviewId || "", biases);
    return biases;
  }

  async getBiasHistory(userId: string, limit = 20) {
    return prisma.cognitiveBiasLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }
}
