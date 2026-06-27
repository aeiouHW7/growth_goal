import { prisma } from "../src/prisma";
import * as fs from "fs";
import * as path from "path";

const BACKUP_DIR = path.resolve(__dirname, "../backups");

async function main() {
  // Find the latest backup
  const files = fs.readdirSync(BACKUP_DIR)
    .filter((f) => f.endsWith("-backup.json"))
    .sort()
    .reverse();

  if (files.length === 0) {
    console.error("No backup files found in", BACKUP_DIR);
    process.exit(1);
  }

  const latest = files[0];
  const filePath = path.join(BACKUP_DIR, latest);
  console.log(`Restoring from: ${filePath}`);

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  await prisma.$transaction(async (tx) => {
    // Delete in reverse dependency order
    await tx.analysisSession.deleteMany();
    await tx.capabilityScore.deleteMany();
    await tx.cognitiveBiasLog.deleteMany();
    await tx.behaviorPattern.deleteMany();
    await tx.aISuccessCase.deleteMany();
    await tx.aIReflection.deleteMany();
    await tx.aIAnalysisFeedback.deleteMany();
    await tx.aIAnalysis.deleteMany();
    await tx.dailyReview.deleteMany();
    await tx.weeklyReview.deleteMany();
    await tx.monthlyReview.deleteMany();
    await tx.dailyPlan.deleteMany();
    await tx.monthlyPlan.deleteMany();
    await tx.yearlyGoal.deleteMany();
    await tx.lifeGoal.deleteMany();
    await tx.user.deleteMany();

    // Insert in dependency order
    for (const row of data.users) await tx.user.create({ data: row });
    for (const row of data.lifeGoals) await tx.lifeGoal.create({ data: row });
    for (const row of data.yearlyGoals) await tx.yearlyGoal.create({ data: row });
    for (const row of data.monthlyPlans) await tx.monthlyPlan.create({ data: row });
    for (const row of data.dailyPlans) await tx.dailyPlan.create({ data: row });
    for (const row of data.dailyReviews) await tx.dailyReview.create({ data: row });
    for (const row of data.weeklyReviews) await tx.weeklyReview.create({ data: row });
    for (const row of data.monthlyReviews) await tx.monthlyReview.create({ data: row });
    for (const row of data.aiAnalyses) await tx.aIAnalysis.create({ data: row });
    for (const row of data.aiAnalysisFeedbacks) await tx.aIAnalysisFeedback.create({ data: row });
    for (const row of data.aiReflections) await tx.aIReflection.create({ data: row });
    for (const row of data.aiSuccessCases) await tx.aISuccessCase.create({ data: row });
    for (const row of data.behaviorPatterns) await tx.behaviorPattern.create({ data: row });
    for (const row of data.cognitiveBiasLogs) await tx.cognitiveBiasLog.create({ data: row });
    for (const row of data.capabilityScores) await tx.capabilityScore.create({ data: row });
    for (const row of data.analysisSessions) await tx.analysisSession.create({ data: row });
  });

  console.log(`Restored: ${data.users.length} users, ${data.dailyReviews.length} reviews, ${data.behaviorPatterns.length} patterns`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
