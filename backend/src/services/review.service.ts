import { ReviewStatus, Prisma } from "@prisma/client";
import { prisma } from "../prisma";
import { validateDateString } from "../utils/date-validator";

const REVIEW_STATUS_TRANSITIONS: Record<ReviewStatus, ReviewStatus[]> = {
  INPUTTING: [ReviewStatus.ANALYZING],
  ANALYZING: [ReviewStatus.COMPLETED, ReviewStatus.INPUTTING],
  COMPLETED: [ReviewStatus.INPUTTING],
  SKIPPED: [],
};

function validateTransition(current: ReviewStatus, next: ReviewStatus): void {
  const allowed = REVIEW_STATUS_TRANSITIONS[current];
  if (!allowed || !allowed.includes(next)) {
    throw Object.assign(
      new Error(`不允许的状态转移: ${current} → ${next}`),
      { status: 409, code: "STATUS_TRANSITION_INVALID" }
    );
  }
}

export class ReviewService {
  // DailyReview
  async getByDate(userId: string, date: string) {
    return prisma.dailyReview.findFirst({
      where: { userId, date: validateDateString(date) },
      include: { aiAnalyses: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
  }

  async listDaily(userId: string, from?: string, to?: string) {
    const where: any = { userId };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = validateDateString(from);
      if (to) where.date.lte = validateDateString(to);
    }
    return prisma.dailyReview.findMany({ where, orderBy: { date: "desc" } });
  }

  async createDaily(userId: string, date: string, rawInput: string) {
    const existing = await prisma.dailyReview.findFirst({
      where: { userId, date: validateDateString(date) },
    });
    if (existing) {
      throw Object.assign(new Error("该日期已有复盘记录"), { status: 409, code: "REVIEW_ALREADY_EXISTS" });
    }
    return prisma.dailyReview.create({
      data: { userId, date: validateDateString(date), rawInput, status: ReviewStatus.ANALYZING },
    });
  }

  async updateDaily(id: string, data: {
    rawInput?: string; completed?: string; notCompleted?: string;
    obstacles?: string; emotionState?: string; mindsetNote?: string;
    energyRate?: number;
  }) {
    return prisma.dailyReview.update({ where: { id }, data });
  }

  async updateDailyStatus(id: string, status: ReviewStatus) {
    const review = await prisma.dailyReview.findUniqueOrThrow({ where: { id } });
    validateTransition(review.status as ReviewStatus, status);
    return prisma.dailyReview.update({ where: { id }, data: { status } });
  }

  async addFollowUp(id: string, question: string, answer: string) {
    const review = await prisma.dailyReview.findUniqueOrThrow({ where: { id } });
    const log = ((review.followUpLog as Array<{ question: string; answer?: string }>) || []) as any;

    if (log.length >= 2) {
      throw Object.assign(new Error("追问次数已达上限（最多 2 次）"), {
        status: 400, code: "FOLLOWUP_LIMIT_EXCEEDED",
      });
    }

    log.push({ question, answer });
    return prisma.dailyReview.update({
      where: { id },
      data: { followUpLog: log as any },
    });
  }

  // WeeklyReview
  async getWeekly(userId: string, year: number, week: number) {
    return prisma.weeklyReview.findFirst({
      where: { userId, year, week },
      include: { aiAnalyses: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
  }

  async createWeekly(data: {
    userId: string; weekStart: string; weekEnd: string; year: number;
    week: number; rawInput?: string; summary?: string;
  }) {
    return prisma.weeklyReview.create({ data: { ...data, weekStart: validateDateString(data.weekStart), weekEnd: validateDateString(data.weekEnd) } });
  }

  async updateWeekly(id: string, data: { rawInput?: string; summary?: string; missingDays?: Prisma.InputJsonValue }) {
    return prisma.weeklyReview.update({ where: { id }, data });
  }

  async checkWeekly(userId: string, year: number, week: number) {
    // Check if weekly review exists for this week
    const existing = await prisma.weeklyReview.findFirst({ where: { userId, year, week } });
    return { needsTrigger: !existing };
  }

  // MonthlyReview
  async getMonthly(userId: string, year: number, month: number) {
    return prisma.monthlyReview.findFirst({
      where: { userId, year, month },
      include: { aiAnalyses: { orderBy: { createdAt: "desc" }, take: 1 } },
    });
  }

  async createMonthly(data: {
    userId: string; month: number; year: number; rawInput?: string; summary?: string;
  }) {
    return prisma.monthlyReview.create({ data });
  }

  async updateMonthly(id: string, data: { rawInput?: string; summary?: string; missingDays?: Prisma.InputJsonValue }) {
    return prisma.monthlyReview.update({ where: { id }, data });
  }

  async checkMonthly(userId: string, year: number, month: number) {
    const existing = await prisma.monthlyReview.findFirst({ where: { userId, year, month } });
    return { needsTrigger: !existing };
  }
}
