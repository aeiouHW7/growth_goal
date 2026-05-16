import { GoalStatus, MetricType } from "@prisma/client";
import { prisma } from "../prisma";
import { validateMetric } from "../utils/metric-validator";

const GOAL_STATUS_TRANSITIONS: Record<GoalStatus, GoalStatus[]> = {
  ACTIVE: [GoalStatus.COMPLETED, GoalStatus.ABANDONED, GoalStatus.ARCHIVED],
  COMPLETED: [GoalStatus.ACTIVE],
  ABANDONED: [GoalStatus.ACTIVE],
  ARCHIVED: [],
  SUSPENDED: [GoalStatus.ACTIVE],
};

function validateStatusTransition(current: GoalStatus, next: GoalStatus): void {
  const allowed = GOAL_STATUS_TRANSITIONS[current];
  if (!allowed || !allowed.includes(next)) {
    throw Object.assign(
      new Error(`不允许的状态转移: ${current} → ${next}`),
      { status: 409, code: "STATUS_TRANSITION_INVALID" }
    );
  }
}

export class GoalService {
  // LifeGoal
  async listLifeGoals(userId: string) {
    return prisma.lifeGoal.findMany({ where: { userId }, orderBy: { sortOrder: "asc" } });
  }

  async createLifeGoal(data: { userId: string; title: string; description?: string; timeHorizon?: string; sortOrder?: number }) {
    return prisma.lifeGoal.create({ data });
  }

  async updateLifeGoal(id: string, data: { title?: string; description?: string; timeHorizon?: string; sortOrder?: number }) {
    return prisma.lifeGoal.update({ where: { id }, data });
  }

  async updateLifeGoalStatus(id: string, status: GoalStatus) {
    const goal = await prisma.lifeGoal.findUniqueOrThrow({ where: { id } });
    validateStatusTransition(goal.status, status);
    return prisma.lifeGoal.update({
      where: { id },
      data: { status, completedAt: status === GoalStatus.COMPLETED ? new Date() : undefined },
    });
  }

  // YearlyGoal
  async listYearlyGoals(userId: string, filters?: { lifeGoalId?: string; year?: number }) {
    return prisma.yearlyGoal.findMany({ where: { userId, ...filters }, orderBy: { year: "desc" } });
  }

  async createYearlyGoal(data: {
    userId: string; lifeGoalId?: string; title: string; description?: string;
    year: number; metricType: MetricType; targetValue: string; startValue?: string;
  }) {
    validateMetric(data.metricType, data.targetValue);
    return prisma.yearlyGoal.create({ data });
  }

  async updateYearlyGoal(id: string, data: { title?: string; description?: string; targetValue?: string; startValue?: string }) {
    return prisma.yearlyGoal.update({ where: { id }, data });
  }

  async updateYearlyGoalStatus(id: string, status: GoalStatus) {
    const goal = await prisma.yearlyGoal.findUniqueOrThrow({ where: { id } });
    validateStatusTransition(goal.status, status);
    return prisma.yearlyGoal.update({
      where: { id },
      data: { status, completedAt: status === GoalStatus.COMPLETED ? new Date() : undefined },
    });
  }

  async updateYearlyGoalProgress(id: string, currentValue: string) {
    return prisma.yearlyGoal.update({ where: { id }, data: { currentValue } });
  }
}
