import { GoalStatus, MetricType } from "@prisma/client";
import { prisma } from "../prisma";
import { validateMetric } from "../utils/metric-validator";
import { LifeArchiveService } from "./life-archive.service";
import { buildGoalDecomposePrompt, type GoalDecomposeContext } from "../prompts/goal-decompose.prompt";
import { callClaude } from "../utils/claude";

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
    return prisma.yearlyGoal.findMany({ where: { userId, ...filters }, orderBy: { year: "asc" } });
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

  // ─── AI 目标拆解 ───

  /** AI 建议年度目标 */
  async aiSuggestYearly(userId: string): Promise<{
    goals: Array<{
      title: string; description?: string; year: number;
      metricType: string; targetValue: string; startValue?: string;
    }>;
    reasoning?: string;
  }> {
    const lifeArchiveService = new LifeArchiveService();
    const archive = await lifeArchiveService.get(userId);
    if (!archive) throw Object.assign(new Error("请先填写人生档案"), { status: 400, code: "ARCHIVE_NOT_FOUND" });

    const future = archive.layerFuture as Record<string, any> | null;
    const resources = archive.layerResources as Record<string, any> | null;
    const behavior = archive.layerBehavior as Record<string, any> | null;
    const core = archive.layerCore as Record<string, any> | null;

    // Validate: layerFuture must have vision
    if (!future?.vision?.years10) {
      throw Object.assign(
        new Error("请先在人生档案中填写第四层「未来蓝图」"),
        { status: 400, code: "VISION_REQUIRED" },
      );
    }

    const ctx: GoalDecomposeContext = {
      vision: {
        years10: future.vision.years10 || "",
        years3: future.vision.years3 || "",
        year1: future.vision.year1 || "",
      },
      goalSource: future.goalSource || null,
      outcomeRange: future.outcomeRange || null,
      roleModels: future.roleModels || null,
      skills: resources?.skills || null,
      timeResources: {
        weekdayHours: (resources?.weekdayAvailableHours as number) ?? null,
        weekendHours: (resources?.weekendAvailableHours as number) ?? null,
        fixedExpenditure: (resources?.fixedExpenditure as string) || null,
      },
      energy: resources?.energy as GoalDecomposeContext["energy"],
      behaviorPatterns: {
        failurePatterns: (behavior?.failurePatterns as GoalDecomposeContext["behaviorPatterns"]["failurePatterns"]) || [],
      },
    };

    const prompt = buildGoalDecomposePrompt(ctx);

    try {
      const result = await callClaude<{
        goals: Array<{
          title: string; description?: string;
          metricType: string; targetValue: string; startValue?: string;
        }>;
        reasoning?: string;
      }>({ prompt });

      const currentYear = new Date().getFullYear();
      return {
        goals: (result.goals || []).map((g) => ({
          ...g,
          year: currentYear + 1, // AI 建议面向下一年
        })),
        reasoning: result.reasoning,
      };
    } catch (err: any) {
      // Fallback: if Claude CLI unavailable, return error guidance
      throw Object.assign(
        new Error(`AI 目标拆解失败: ${err.message}`),
        { status: 503, code: "AI_SERVICE_UNAVAILABLE" },
      );
    }
  }

  /** 确认 AI 建议的年度目标（批量写入 YearlyGoal） */
  async confirmYearlyGoals(
    userId: string,
    goals: Array<{
      title: string; description?: string; year: number;
      metricType: MetricType; targetValue: string; startValue?: string;
    }>,
  ) {
    const created = [];
    for (const goal of goals) {
      validateMetric(goal.metricType, goal.targetValue);
      const g = await prisma.yearlyGoal.create({
        data: {
          userId,
          title: goal.title,
          description: goal.description,
          year: goal.year,
          metricType: goal.metricType,
          targetValue: goal.targetValue,
          startValue: goal.startValue,
          status: GoalStatus.ACTIVE,
        },
      });
      created.push(g);
    }
    return created;
  }
}
