import { GoalStatus, MetricType, Prisma } from "@prisma/client";
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

  /** 硬删除人生目标（无子级，直接删；不存在抛 P2025 → 404） */
  async deleteLifeGoal(id: string) {
    await prisma.lifeGoal.delete({ where: { id } });
    return { deleted: 1 };
  }

  // YearlyGoal

  /** 收集指定目标的所有后代目标 id（含间接后代，BFS）。用于级联删除与环检测。 */
  private async collectDescendantGoalIds(tx: Prisma.TransactionClient, parentId: string): Promise<string[]> {
    const result: string[] = [];
    const queue = [parentId];
    while (queue.length > 0) {
      const cur = queue.shift()!;
      const direct = await tx.yearlyGoal.findMany({ where: { parentId: cur }, select: { id: true } });
      for (const g of direct) {
        result.push(g.id);
        queue.push(g.id);
      }
    }
    return result;
  }

  /**
   * 校验 parentId 是否可作为 goalId 的父目标：
   * 存在、属于同一用户、非自身、不形成环（不能把目标设为其子目标的父）。
   */
  private async validateParentYearlyGoal(goalId: string, parentId: string) {
    if (parentId === goalId) {
      throw Object.assign(new Error("不能把目标设为自己的子目标"), { status: 409, code: "PARENT_CYCLE" });
    }
    const [goal, parent] = await Promise.all([
      prisma.yearlyGoal.findUnique({ where: { id: goalId }, select: { userId: true } }),
      prisma.yearlyGoal.findUnique({ where: { id: parentId }, select: { userId: true } }),
    ]);
    if (!parent) throw Object.assign(new Error("父目标不存在"), { status: 404, code: "PARENT_NOT_FOUND" });
    if (!goal || parent.userId !== goal.userId) {
      throw Object.assign(new Error("父目标不属于当前用户"), { status: 403, code: "PARENT_FORBIDDEN" });
    }
    // 环检测：从 parent 逐级向上，若经过 goalId 则成环
    const ancestors = await this.collectDescendantGoalIds(prisma, goalId);
    if (ancestors.includes(parentId)) {
      throw Object.assign(new Error("不能把目标设为其子目标的子目标（会形成循环）"), { status: 409, code: "PARENT_CYCLE" });
    }
  }

  async listYearlyGoals(userId: string, filters?: { lifeGoalId?: string; year?: number; parentId?: string | null }) {
    const where: Prisma.YearlyGoalWhereInput = { userId };
    if (filters?.lifeGoalId !== undefined) where.lifeGoalId = filters.lifeGoalId;
    if (filters?.year !== undefined) where.year = filters.year;
    if (filters !== undefined && "parentId" in filters) where.parentId = filters.parentId ?? null;
    return prisma.yearlyGoal.findMany({ where, orderBy: [{ year: "asc" }, { createdAt: "asc" }] });
  }

  async createYearlyGoal(data: {
    userId: string; lifeGoalId?: string; parentId?: string; title: string; description?: string;
    year: number; metricType: MetricType; targetValue: string; startValue?: string;
  }) {
    validateMetric(data.metricType, data.targetValue);
    const { parentId, ...rest } = data;
    const createData: Prisma.YearlyGoalUncheckedCreateInput = { ...rest };
    if (parentId) {
      // 创建时自身尚无 id，仅校验父目标存在且同用户
      const parent = await prisma.yearlyGoal.findUnique({ where: { id: parentId }, select: { userId: true } });
      if (!parent) throw Object.assign(new Error("父目标不存在"), { status: 404, code: "PARENT_NOT_FOUND" });
      if (parent.userId !== data.userId) {
        throw Object.assign(new Error("父目标不属于当前用户"), { status: 403, code: "PARENT_FORBIDDEN" });
      }
      createData.parentId = parentId;
    }
    return prisma.yearlyGoal.create({ data: createData });
  }

  async updateYearlyGoal(id: string, data: { title?: string; description?: string; targetValue?: string; startValue?: string; parentId?: string | null }) {
    const { parentId, ...rest } = data;
    const updateData: Prisma.YearlyGoalUpdateInput = { ...rest };
    if ("parentId" in data && parentId !== undefined) {
      if (parentId === null || parentId === "") {
        updateData.parent = { disconnect: true };
      } else {
        await this.validateParentYearlyGoal(id, parentId);
        updateData.parent = { connect: { id: parentId } };
      }
    }
    return prisma.yearlyGoal.update({ where: { id }, data: updateData });
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

  /**
   * 硬删除年度目标（级联删其子目标（任意深度）→ MonthlyPlan → DailyPlan，事务原子）。
   * 不存在时 tx.yearlyGoal.deleteMany 计数为 0 → 抛 NOT_FOUND → 404。
   */
  async deleteYearlyGoal(id: string) {
    return prisma.$transaction(async (tx) => {
      const descendantIds = await this.collectDescendantGoalIds(tx, id);
      const allGoalIds = [id, ...descendantIds];
      const monthly = await tx.monthlyPlan.findMany({ where: { yearlyGoalId: { in: allGoalIds } }, select: { id: true } });
      const daily = await tx.dailyPlan.deleteMany({ where: { monthlyPlanId: { in: monthly.map((m) => m.id) } } });
      const monthlyDeleted = await tx.monthlyPlan.deleteMany({ where: { yearlyGoalId: { in: allGoalIds } } });
      const goalDeleted = await tx.yearlyGoal.deleteMany({ where: { id: { in: allGoalIds } } });
      if (goalDeleted.count === 0) {
        throw Object.assign(new Error("目标不存在"), { status: 404, code: "NOT_FOUND" });
      }
      return { deleted: daily.count + monthlyDeleted.count + goalDeleted.count };
    });
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
        failurePatterns: (behavior?.failurePatterns ?? []) as Array<{ goalDescription: string; frequency: number }>,
      },
      summary: archive.summary || undefined,
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
