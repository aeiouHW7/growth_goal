import { prisma } from "../prisma";

export class LifeArchiveService {
  /** 获取完整人生档案 */
  async get(userId: string) {
    return prisma.lifeArchive.findUnique({ where: { userId } });
  }

  /** 获取 AI 摘要 */
  async getSummary(userId: string): Promise<string | null> {
    const archive = await prisma.lifeArchive.findUnique({ where: { userId } });
    return archive?.summary ?? null;
  }

  /** 创建/覆盖完整档案 */
  async upsert(userId: string, data: {
    layerCore?: Record<string, unknown>;
    layerResources?: Record<string, unknown>;
    layerBehavior?: Record<string, unknown>;
    layerFuture?: Record<string, unknown>;
  }) {
    // 如果是首次创建且 User 表有历史数据，自动迁移
    const existing = await prisma.lifeArchive.findUnique({ where: { userId } });
    if (!existing) {
      await this.migrateFromUser(userId);
    }

    return prisma.lifeArchive.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }

  // ─── 分层更新 ───

  /** 更新第一层：恒定核心 */
  async updateLayerCore(userId: string, layerCore: Record<string, unknown>) {
    return prisma.lifeArchive.upsert({
      where: { userId },
      create: { userId, layerCore },
      update: { layerCore },
    });
  }

  /** 更新第二层：能力与资源 */
  async updateLayerResources(userId: string, layerResources: Record<string, unknown>) {
    return prisma.lifeArchive.upsert({
      where: { userId },
      create: { userId, layerResources },
      update: { layerResources },
    });
  }

  /** 更新第四层：未来蓝图 */
  async updateLayerFuture(userId: string, layerFuture: Record<string, unknown>) {
    return prisma.lifeArchive.upsert({
      where: { userId },
      create: { userId, layerFuture },
      update: { layerFuture },
    });
  }

  // ─── AI 写回接口 ───

  /** 更新能量精力（带版本保留） */
  async updateEnergy(userId: string, data: { energyDescription: string }) {
    const archive = await prisma.lifeArchive.findUnique({ where: { userId } });
    const current = (archive?.layerResources as Record<string, unknown>) || {};

    return prisma.lifeArchive.upsert({
      where: { userId },
      create: {
        userId,
        layerResources: {
          energy: {
            ...data,
            previousEnergyDescription: null,
            lastAssessedAt: new Date().toISOString().slice(0, 10),
          },
        },
      },
      update: {
        layerResources: {
          ...current,
          energy: {
            ...data,
            previousEnergyDescription: (current.energy as Record<string, unknown>)?.energyDescription || null,
            lastAssessedAt: new Date().toISOString().slice(0, 10),
          },
        },
      },
    });
  }

  /** 更新健康基础（带版本保留） */
  async updateHealth(userId: string, data: {
    physicalHealth?: string;
    mentalState?: string;
    exerciseRoutine?: string;
    addictiveHabits?: string;
  }) {
    const archive = await prisma.lifeArchive.findUnique({ where: { userId } });
    const current = ((archive?.layerResources as Record<string, unknown>)?.health as Record<string, unknown>) || {};

    const health = {
      ...current,
      ...data,
      previousPhysicalHealth: data.physicalHealth ? (current.physicalHealth || null) : undefined,
      previousMentalState: data.mentalState ? (current.mentalState || null) : undefined,
      previousExerciseRoutine: data.exerciseRoutine ? (current.exerciseRoutine || null) : undefined,
    };
    // De-duplicate: if previous* matches current value, skip versioning
    if (health.previousPhysicalHealth === data.physicalHealth) delete health.previousPhysicalHealth;
    if (health.previousMentalState === data.mentalState) delete health.previousMentalState;
    if (health.previousExerciseRoutine === data.exerciseRoutine) delete health.previousExerciseRoutine;

    const resources = (archive?.layerResources as Record<string, unknown>) || {};
    return prisma.lifeArchive.upsert({
      where: { userId },
      create: { userId, layerResources: { ...resources, health } },
      update: { layerResources: { ...resources, health } },
    });
  }

  /** 更新第三层：历史行为数据（AI 自动提取，无需确认） */
  async updateBehavior(userId: string, data: {
    successPatterns?: unknown[];
    failurePatterns?: unknown[];
    productivityPatterns?: Record<string, unknown>;
    decisionMistakes?: unknown[];
  }) {
    const archive = await prisma.lifeArchive.findUnique({ where: { userId } });
    const current = (archive?.layerBehavior as Record<string, unknown>) || {};

    // Merge: append new patterns, de-duplicate by description
    const merge = <T extends { description?: string }>(existing: T[] | undefined, incoming: T[] | undefined): T[] => {
      if (!incoming || incoming.length === 0) return existing || [];
      if (!existing) return incoming;
      const merged = [...existing];
      for (const item of incoming) {
        const dup = merged.find((e) => e.description === item.description);
        if (!dup) merged.push(item);
      }
      return merged;
    };

    const merged: Record<string, unknown> = {};
    if (data.successPatterns) merged.successPatterns = merge(current.successPatterns as any[], data.successPatterns as any[]);
    if (data.failurePatterns) merged.failurePatterns = merge(current.failurePatterns as any[], data.failurePatterns as any[]);
    if (data.productivityPatterns) merged.productivityPatterns = { ...(current.productivityPatterns as object || {}), ...data.productivityPatterns };
    if (data.decisionMistakes) merged.decisionMistakes = merge(current.decisionMistakes as any[], data.decisionMistakes as any[]);

    return prisma.lifeArchive.upsert({
      where: { userId },
      create: { userId, layerBehavior: merged },
      update: { layerBehavior: merged },
    });
  }

  // ─── 摘要 ───

  /** 重生成 AI 摘要 */
  async refreshSummary(userId: string): Promise<string> {
    const archive = await prisma.lifeArchive.findUnique({ where: { userId } });
    if (!archive) throw Object.assign(new Error("人生档案不存在"), { status: 404, code: "NOT_FOUND" });

    const core = archive.layerCore as Record<string, any> | null;
    const resources = archive.layerResources as Record<string, any> | null;
    const behavior = archive.layerBehavior as Record<string, any> | null;
    const future = archive.layerFuture as Record<string, any> | null;

    const parts: string[] = [];

    // 人格
    if (core?.personality?.mbti) parts.push(`人格类型: ${core.personality.mbti}`);
    if (core?.personality?.gallup?.length) parts.push(`优势: ${core.personality.gallup.join(", ")}`);

    // 能力
    const skills = resources?.skills;
    if (Array.isArray(skills) && skills.length > 0) {
      parts.push(`核心技能: ${skills.map((s: any) => `${s.skillName}(${s.level})`).join("、")}`);
    }

    // 时间
    if (resources?.fixedExpenditure) parts.push(`固定支出: ${resources.fixedExpenditure}`);

    // 能量
    if (resources?.energy?.energyDescription) parts.push(`精力模式: ${resources.energy.energyDescription}`);

    // 行为模式（高频）
    if (behavior?.failurePatterns?.length) {
      const top = behavior.failurePatterns.slice(0, 3);
      parts.push(`反复障碍: ${top.map((f: any) => f.goalDescription).join("、")}`);
    }
    if (behavior?.decisionMistakes?.length) {
      parts.push(`历史决策反思: ${behavior.decisionMistakes.length} 条记录`);
    }

    // 愿景
    if (future?.vision?.years10) parts.push(`10年愿景: ${future.vision.years10.slice(0, 80)}`);
    if (future?.vision?.year1) parts.push(`1年目标: ${future.vision.year1.slice(0, 80)}`);

    const summary = parts.length > 0 ? parts.join("\n") : "人生档案尚未完善，请逐步填写各层数据。";

    await prisma.lifeArchive.update({ where: { userId }, data: { summary } });
    return summary;
  }

  // ─── User 表迁移 ───

  /** 从 User 表迁移已有数据到 LifeArchive */
  async migrateFromUser(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    const layerResources: Record<string, unknown> = {};
    const layerBehavior: Record<string, unknown> = {};
    const layerFuture: Record<string, unknown> = {};

    // 职业 → 核心能力
    if (user.occupation || user.industry) {
      layerResources.skills = [{
        skillName: user.industry || user.occupation || "",
        level: "熟练",
        yearsOfExperience: 0,
        description: `${user.occupation || ""} / ${user.industry || ""}`,
      }];
    }

    // 时间
    if (user.weekdayAvailableHours != null || user.weekendAvailableHours != null) {
      const timeDesc = [];
      if (user.weekdayAvailableHours != null) timeDesc.push(`工作日可支配: ${user.weekdayAvailableHours}h`);
      if (user.weekendAvailableHours != null) timeDesc.push(`周末可支配: ${user.weekendAvailableHours}h`);
      layerResources.weekdayAvailableHours = user.weekdayAvailableHours;
      layerResources.weekdayTimeBlocks = user.weekdayTimeBlocks;
      layerResources.weekendAvailableHours = user.weekendAvailableHours;
      layerResources.weekendTimeBlocks = user.weekendTimeBlocks;
      layerResources.fixedExpenditure = timeDesc.join("，");
    }

    // 目标领域 → 愿景
    if (user.goalDomains?.length) {
      layerFuture.vision = {
        years10: `在 ${user.goalDomains.join("、")} 领域取得成就`,
        years3: "",
        year1: "",
      };
    }

    // 过往经历 → 行为基线
    if (user.pastExperience) {
      layerBehavior.pastExperience = user.pastExperience;
    }

    const data: Record<string, unknown> = {};
    if (Object.keys(layerResources).length) data.layerResources = layerResources;
    if (Object.keys(layerBehavior).length) data.layerBehavior = layerBehavior;
    if (Object.keys(layerFuture).length) data.layerFuture = layerFuture;

    if (Object.keys(data).length === 0) return;

    await prisma.lifeArchive.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });
  }
}
