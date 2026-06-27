import { prisma } from "../src/prisma";
import * as fs from "fs";
import * as path from "path";

const BACKUP_DIR = path.resolve(__dirname, "../backups");

async function main() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filePath = path.join(BACKUP_DIR, `growth-${timestamp}-backup.json`);

  const data = await prisma.$transaction(async (tx) => {
    const [users, lifeGoals, yearlyGoals, monthlyPlans, dailyPlans,
      dailyReviews, weeklyReviews, monthlyReviews,
      aiAnalyses, feedbacks, reflections, successCases,
      patterns, biasLogs, capabilityScores, sessions] = await Promise.all([
      tx.user.findMany({ orderBy: [{ createdAt: "asc" }] }),
      tx.lifeGoal.findMany({ orderBy: [{ createdAt: "asc" }] }),
      tx.yearlyGoal.findMany({ orderBy: [{ createdAt: "asc" }] }),
      tx.monthlyPlan.findMany({ orderBy: [{ createdAt: "asc" }] }),
      tx.dailyPlan.findMany({ orderBy: [{ date: "asc" }] }),
      tx.dailyReview.findMany({ orderBy: [{ date: "asc" }] }),
      tx.weeklyReview.findMany({ orderBy: [{ year: "asc" }, { week: "asc" }] }),
      tx.monthlyReview.findMany({ orderBy: [{ year: "asc" }, { month: "asc" }] }),
      tx.aIAnalysis.findMany({ orderBy: [{ createdAt: "asc" }] }),
      tx.aIAnalysisFeedback.findMany({ orderBy: [{ createdAt: "asc" }] }),
      tx.aIReflection.findMany({ orderBy: [{ createdAt: "asc" }] }),
      tx.aISuccessCase.findMany({ orderBy: [{ createdAt: "asc" }] }),
      tx.behaviorPattern.findMany({ orderBy: [{ firstDetected: "asc" }] }),
      tx.cognitiveBiasLog.findMany({ orderBy: [{ createdAt: "asc" }] }),
      tx.capabilityScore.findMany({ orderBy: [{ createdAt: "asc" }] }),
      tx.analysisSession.findMany({ orderBy: [{ startedAt: "asc" }] }),
    ]);

    return {
      meta: { backedUpAt: new Date().toISOString(), version: "1.0" },
      users, lifeGoals, yearlyGoals, monthlyPlans, dailyPlans,
      dailyReviews, weeklyReviews, monthlyReviews,
      aiAnalyses, aiAnalysisFeedbacks: feedbacks,
      aiReflections: reflections, aiSuccessCases: successCases,
      behaviorPatterns: patterns,
      cognitiveBiasLogs: biasLogs,
      capabilityScores: capabilityScores,
      analysisSessions: sessions,
    };
  });

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
  console.log(`Backup saved: ${filePath}`);
  console.log(`Records: ${data.users.length} users, ${data.dailyReviews.length} reviews, ${data.aiAnalyses.length} analyses, ${data.behaviorPatterns.length} patterns, ${data.aiAnalysisFeedbacks.length} feedbacks`);

  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
