import { PrismaClient, GoalStatus, PlanStatus, ReviewStatus, AnalysisType } from "@prisma/client";
import { execSync } from "child_process";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

async function main() {
  // ⚠️ SAFETY GUARD: seed 脚本会清空所有数据！
  const args = process.argv.slice(2);
  if (!args.includes("--force")) {
    console.error("安全拦截：seed 脚本会清空所有现有数据");
    console.error("   Usage: npx tsx prisma/seed.ts --force");
    process.exit(1);
  }

  const existingUserCount = await prisma.user.count();
  if (existingUserCount > 0) {
    if (!args.includes("--confirm-wipe")) {
      console.error(`数据库中已有 ${existingUserCount} 个用户和关联数据。`);
      console.error("   如果确定要清空重建，请运行: npx tsx prisma/seed.ts --force --confirm-wipe");
      process.exit(1);
    }
    // Auto-backup before wipe
    console.log("正在备份数据库...");
    const backupDir = join(__dirname, "../backups");
    if (!existsSync(backupDir)) mkdirSync(backupDir, { recursive: true });
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
    const filename = `growth-${timestamp}-preseed.sql`;
    const filepath = join(backupDir, filename);
    try {
      execSync(
        `docker exec growth-miniprogram-db pg_dump -U growthuser -d growth-miniprogram --no-owner --no-acl -f - > "${filepath.replace(/\\/g, "/")}"`,
        { stdio: "pipe", timeout: 30000, shell: true }
      );
      console.log(`已自动备份到: backend/backups/${filename}`);
    } catch (e) {
      console.error("备份失败，继续执行 seed:", e instanceof Error ? e.message : e);
    }
  }
  // Clean existing data
  await prisma.aISuccessCase.deleteMany();
  await prisma.aIReflection.deleteMany();
  await prisma.aIAnalysisFeedback.deleteMany();
  await prisma.aIAnalysis.deleteMany();
  await prisma.monthlyReview.deleteMany();
  await prisma.weeklyReview.deleteMany();
  await prisma.dailyReview.deleteMany();
  await prisma.dailyPlan.deleteMany();
  await prisma.monthlyPlan.deleteMany();
  await prisma.yearlyGoal.deleteMany();
  await prisma.lifeGoal.deleteMany();
  await prisma.user.deleteMany();

  // Create user
  const user = await prisma.user.create({
    data: {
      age: 28,
      occupation: "软件工程师",
      industry: "科技",
      weekdayAvailableHours: 4,
      weekdayTimeBlocks: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }],
      weekendAvailableHours: 8,
      weekendTimeBlocks: [{ start: "10:00", end: "12:00" }, { start: "14:00", end: "17:00" }],
      goalDomains: ["财务", "健康", "学习"],
    },
  });

  // Life goal
  const lifeGoal = await prisma.lifeGoal.create({
    data: {
      userId: user.id,
      title: "实现财务自由",
      description: "通过被动收入覆盖生活支出，不再依赖工资收入",
      timeHorizon: "10年",
      sortOrder: 1,
    },
  });

  // Yearly goal
  const yearlyGoal = await prisma.yearlyGoal.create({
    data: {
      userId: user.id,
      lifeGoalId: lifeGoal.id,
      title: "年收入达到50万",
      year: 2026,
      metricType: "NUMERIC",
      targetValue: "500000 元",
      startValue: "300000 元",
      currentValue: "120000 元",
    },
  });

  // Monthly plan
  const monthlyPlan = await prisma.monthlyPlan.create({
    data: {
      userId: user.id,
      yearlyGoalId: yearlyGoal.id,
      title: "Q2 冲刺：季度收入15万",
      month: 6,
      year: 2026,
      metricType: "NUMERIC",
      targetValue: "150000 元",
      currentValue: "50000 元",
    },
  });

  // Daily plans
  const dailyPlan = await prisma.dailyPlan.create({
    data: {
      userId: user.id,
      monthlyPlanId: monthlyPlan.id,
      title: "完成项目提案初稿",
      date: new Date("2026-06-15"),
      metricType: "NUMERIC",
      targetValue: "1 份",
      currentValue: "1 份",
      status: PlanStatus.COMPLETED,
    },
  });

  // Daily review
  const dailyReview = await prisma.dailyReview.create({
    data: {
      userId: user.id,
      date: new Date("2026-06-15"),
      rawInput: "今天完成了项目提案的初稿，但是觉得效率不够高，上午被会议占用了很多时间。下午专注写了两个小时，进度还行。",
      completed: "完成项目提案初稿",
      notCompleted: "",
      obstacles: "上午会议过多，打断思路",
      emotionState: "中性偏积极",
      mindsetNote: "意识到时间块管理的重要性",
      status: ReviewStatus.COMPLETED,
      followUpLog: [
        { question: "今天开会占用了多少时间？", answer: "大约2个小时" },
        { question: "有什么方式可以减少会议干扰？", answer: "可以把会议安排在下午" },
      ],
    },
  });

  // AI Analysis with feedback score >= 80
  const analysis = await prisma.aIAnalysis.create({
    data: {
      dailyReviewId: dailyReview.id,
      analysisType: AnalysisType.DAILY,
      structuredReport: {
        completionSummary: { completed: ["项目提案初稿"], notCompleted: [], completionRate: "80%" },
        deviationAnalysis: { onTrack: ["项目进度"], behind: [], riskLevel: "低" },
        executionDiagnosis: { issues: ["会议过多"], rootCause: "时间管理", pattern: "上午效率低" },
        adjustmentSuggestions: { planChanges: [], executionOptimization: ["将会议安排在下午"] },
        externalPerspective: { trendInsights: ["远程办公趋势下时间管理工具需求增长"], directionCheck: "方向正确", newOpportunities: [], risks: [] },
      },
      narrativeReport: "今日完成项目提案初稿，主要阻碍是会议占用上午时间。建议将会议安排在下午，上午保留给深度工作。",
    },
  });

  // Feedback: success case (score 85)
  const feedback = await prisma.aIAnalysisFeedback.create({
    data: {
      aiAnalysisId: analysis.id,
      userScore: 85,
      isPass: true,
      isExcellent: true,
      excellentReason: "分析准确识别了会议干扰问题，外部视角有洞察",
    },
  });

  await prisma.aISuccessCase.create({
    data: {
      feedbackId: feedback.id,
      excellentPattern: "准确识别用户时间管理问题，结合远程办公趋势给出建议",
      replicableCondition: "当用户反馈时间管理问题时，复用此分析模式",
    },
  });

  console.log("Seed data created successfully");
  console.log(`  User: ${user.id}`);
  console.log(`  LifeGoal: ${lifeGoal.id}`);
  console.log(`  YearlyGoal: ${yearlyGoal.id}`);
  console.log(`  MonthlyPlan: ${monthlyPlan.id}`);
  console.log(`  DailyPlan: ${dailyPlan.id}`);
  console.log(`  DailyReview: ${dailyReview.id}`);
  console.log(`  AIAnalysis: ${analysis.id}`);
  console.log(`  SuccessCase: created`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
