import { prisma } from "../index";

export class ProgressService {
  async overview(userId: string) {
    const [lifeGoals, yearlyGoals, monthlyPlans, dailyReviews] = await Promise.all([
      prisma.lifeGoal.findMany({ where: { userId }, orderBy: { sortOrder: "asc" } }),
      prisma.yearlyGoal.findMany({ where: { userId }, orderBy: { year: "desc" } }),
      prisma.monthlyPlan.findMany({ where: { userId }, orderBy: [{ year: "desc" }, { month: "desc" }] }),
      prisma.dailyReview.findMany({ where: { userId }, orderBy: { date: "desc" }, take: 30 }),
    ]);

    const total = lifeGoals.length + yearlyGoals.length + monthlyPlans.length;
    const completed =
      lifeGoals.filter((g) => g.status === "COMPLETED").length +
      yearlyGoals.filter((g) => g.status === "COMPLETED").length +
      monthlyPlans.filter((g) => g.status === "COMPLETED").length;

    return {
      lifeGoals: lifeGoals.map((g) => ({ id: g.id, title: g.title, status: g.status, sortOrder: g.sortOrder })),
      yearlyGoals: yearlyGoals.map((g) => ({ id: g.id, title: g.title, year: g.year, status: g.status, targetValue: g.targetValue, currentValue: g.currentValue })),
      monthlyPlans: monthlyPlans.map((g) => ({ id: g.id, title: g.title, year: g.year, month: g.month, status: g.status, targetValue: g.targetValue, currentValue: g.currentValue })),
      stats: { total, completed, completionRate: total > 0 ? Math.round((completed / total) * 100) : 0 },
      recentReviews: dailyReviews.map((r) => ({ id: r.id, date: r.date, status: r.status })),
    };
  }

  async goalChain(userId: string, goalId: string) {
    // Try LifeGoal first, then YearlyGoal
    const lifeGoal = await prisma.lifeGoal.findFirst({ where: { id: goalId, userId } });
    if (lifeGoal) {
      const yearly = await prisma.yearlyGoal.findMany({ where: { lifeGoalId: goalId }, orderBy: { year: "desc" } });
      const monthly = await prisma.monthlyPlan.findMany({ where: { yearlyGoalId: { in: yearly.map((y) => y.id) } }, orderBy: [{ year: "desc" }, { month: "desc" }] });
      return { goal: lifeGoal, children: { yearlyGoals: yearly.map((y) => ({ ...y, monthlyPlans: monthly.filter((m) => m.yearlyGoalId === y.id) })) } };
    }

    const yearlyGoal = await prisma.yearlyGoal.findFirst({ where: { id: goalId, userId } });
    if (yearlyGoal) {
      const monthly = await prisma.monthlyPlan.findMany({ where: { yearlyGoalId: goalId }, orderBy: [{ year: "desc" }, { month: "desc" }] });
      return { goal: yearlyGoal, children: { monthlyPlans: monthly } };
    }

    throw Object.assign(new Error("目标不存在"), { status: 404, code: "NOT_FOUND" });
  }

  async calendar(userId: string, year: number, month: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const [dailyPlans, dailyReviews] = await Promise.all([
      prisma.dailyPlan.findMany({
        where: { userId, date: { gte: startDate, lte: endDate } },
        orderBy: { date: "asc" },
      }),
      prisma.dailyReview.findMany({
        where: { userId, date: { gte: startDate, lte: endDate } },
        include: { aiAnalyses: { include: { feedbacks: true }, orderBy: { createdAt: "desc" }, take: 1 } },
        orderBy: { date: "asc" },
      }),
    ]);

    const daysInMonth = endDate.getDate();
    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const plans = dailyPlans.filter((p) => p.date.toISOString().slice(0, 10) === dateStr);
      const review = dailyReviews.find((r) => r.date.toISOString().slice(0, 10) === dateStr);
      const analysis = review?.aiAnalyses[0];
      const feedback = analysis?.feedbacks[0];

      days.push({
        date: dateStr,
        dayOfWeek: new Date(year, month - 1, d).getDay(),
        planCount: plans.length,
        completedPlans: plans.filter((p) => p.status === "COMPLETED").length,
        hasReview: !!review,
        reviewStatus: review?.status || null,
        analysisScore: feedback?.userScore || null,
      });
    }

    return { year, month, days };
  }
}
