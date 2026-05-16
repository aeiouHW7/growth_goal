import { AnalysisType, Prisma } from "@prisma/client";
import { prisma } from "../prisma";

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
}
