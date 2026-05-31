import { GoalStatus, PlanStatus, MetricType } from "@prisma/client";
import { prisma } from "../prisma";
import { validateMetric } from "../utils/metric-validator";
import { validateDateString } from "../utils/date-validator";

const GOAL_STATUS_TRANSITIONS: Record<GoalStatus, GoalStatus[]> = {
  ACTIVE: [GoalStatus.COMPLETED, GoalStatus.ABANDONED, GoalStatus.ARCHIVED],
  COMPLETED: [GoalStatus.ACTIVE],
  ABANDONED: [GoalStatus.ACTIVE],
  ARCHIVED: [],
  SUSPENDED: [GoalStatus.ACTIVE],
};

const PLAN_STATUS_TRANSITIONS: Record<PlanStatus, PlanStatus[]> = {
  PENDING: [PlanStatus.IN_PROGRESS, PlanStatus.CANCELLED],
  IN_PROGRESS: [PlanStatus.COMPLETED, PlanStatus.PARTIAL, PlanStatus.FAILED],
  COMPLETED: [],
  PARTIAL: [],
  FAILED: [],
  CANCELLED: [],
};

function validateGoalTransition(current: GoalStatus, next: GoalStatus): void {
  const allowed = GOAL_STATUS_TRANSITIONS[current];
  if (!allowed || !allowed.includes(next)) {
    throw Object.assign(
      new Error(`不允许的状态转移: ${current} → ${next}`),
      { status: 409, code: "STATUS_TRANSITION_INVALID" }
    );
  }
}

function validatePlanTransition(current: PlanStatus, next: PlanStatus): void {
  const allowed = PLAN_STATUS_TRANSITIONS[current];
  if (!allowed || !allowed.includes(next)) {
    throw Object.assign(
      new Error(`不允许的状态转移: ${current} → ${next}`),
      { status: 409, code: "STATUS_TRANSITION_INVALID" }
    );
  }
}

export class PlanService {
  // MonthlyPlan
  async listMonthlyPlans(userId: string, filters?: { yearlyGoalId?: string; year?: number; month?: number }) {
    return prisma.monthlyPlan.findMany({ where: { userId, ...filters }, orderBy: [{ year: "asc" }, { month: "asc" }] });
  }

  async createMonthlyPlan(data: {
    userId: string; yearlyGoalId?: string; title: string; description?: string;
    month: number; year: number; metricType: MetricType; targetValue: string; startValue?: string;
  }) {
    validateMetric(data.metricType, data.targetValue);
    return prisma.monthlyPlan.create({ data });
  }

  async updateMonthlyPlan(id: string, data: { title?: string; description?: string; targetValue?: string }) {
    return prisma.monthlyPlan.update({ where: { id }, data });
  }

  async updateMonthlyPlanStatus(id: string, status: GoalStatus) {
    const plan = await prisma.monthlyPlan.findUniqueOrThrow({ where: { id } });
    validateGoalTransition(plan.status as GoalStatus, status);
    return prisma.monthlyPlan.update({
      where: { id },
      data: { status, completedAt: status === GoalStatus.COMPLETED ? new Date() : undefined },
    });
  }

  async updateMonthlyPlanProgress(id: string, currentValue: string) {
    return prisma.monthlyPlan.update({ where: { id }, data: { currentValue } });
  }

  // DailyPlan
  async listDailyPlans(userId: string, filters?: { monthlyPlanId?: string; date?: string }) {
    const where: any = { userId };
    if (filters?.monthlyPlanId) where.monthlyPlanId = filters.monthlyPlanId;
    if (filters?.date) where.date = validateDateString(filters.date);
    return prisma.dailyPlan.findMany({ where, orderBy: { date: "asc" } });
  }

  async createDailyPlan(data: {
    userId: string; monthlyPlanId?: string; title: string; description?: string;
    date: string; metricType: MetricType; targetValue: string;
  }) {
    validateMetric(data.metricType, data.targetValue);
    return prisma.dailyPlan.create({ data: { ...data, date: validateDateString(data.date) } });
  }

  async updateDailyPlan(id: string, data: { title?: string; description?: string; targetValue?: string; currentValue?: string }) {
    return prisma.dailyPlan.update({ where: { id }, data });
  }

  async updateDailyPlanStatus(id: string, status: PlanStatus) {
    const plan = await prisma.dailyPlan.findUniqueOrThrow({ where: { id } });
    validatePlanTransition(plan.status, status);
    return prisma.dailyPlan.update({ where: { id }, data: { status } });
  }
}
