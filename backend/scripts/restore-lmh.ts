/**
 * 安全恢复脚本：从备份 JSON 恢复数据到 SQLite
 * - 使用 upsert 而非 deleteMany（不删除现有数据）
 * - 先自动备份当前数据库
 * - 逐条插入/覆盖，不影响无关记录
 */
import { prisma } from "../src/prisma";
import { readFileSync, copyFileSync, existsSync } from "fs";
import { join } from "path";

const BACKUP_DIR = join(__dirname, "../backups");

// 获取最新的 JSON 备份文件
function findLatestBackup(): string {
  const files = require("fs").readdirSync(BACKUP_DIR)
    .filter((f: string) => f.endsWith(".json") && f.startsWith("growth-"))
    .sort()
    .reverse();
  if (files.length === 0) throw new Error("No JSON backup found in " + BACKUP_DIR);
  return join(BACKUP_DIR, files[0]);
}

function fixArrays(rows: any[], fields: string[]) {
  return rows.map((r: any) => {
    const o = { ...r };
    for (const f of fields) {
      if (Array.isArray(o[f])) o[f] = JSON.stringify(o[f]);
    }
    return o;
  });
}

async function main() {
  // 第一步：自动备份当前数据库
  const DB_PATH = join(__dirname, "../prisma/dev.db");
  if (existsSync(DB_PATH)) {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const backupPath = join(BACKUP_DIR, `pre-restore-${ts}.db`);
    copyFileSync(DB_PATH, backupPath);
    console.log(`✅ 已自动备份当前数据库 → ${backupPath}`);
  }

  // 第二步：加载备份数据
  const filePath = findLatestBackup();
  console.log(`📂 使用备份文件: ${filePath}`);
  const data = JSON.parse(readFileSync(filePath, "utf-8"));

  const users = fixArrays(data.users, ["goalDomains"]);
  const patterns = fixArrays(data.behaviorPatterns || [], ["keywords"]);

  // 定义表及数据（按外键依赖顺序）
  const tables: Array<{ name: string; rows: any[]; key: string }> = [
    { name: "user", rows: users, key: "id" },
    { name: "lifeGoal", rows: data.lifeGoals || [], key: "id" },
    { name: "yearlyGoal", rows: data.yearlyGoals || [], key: "id" },
    { name: "monthlyPlan", rows: data.monthlyPlans || [], key: "id" },
    { name: "dailyPlan", rows: data.dailyPlans || [], key: "id" },
    { name: "dailyReview", rows: data.dailyReviews || [], key: "id" },
    { name: "weeklyReview", rows: data.weeklyReviews || [], key: "id" },
    { name: "monthlyReview", rows: data.monthlyReviews || [], key: "id" },
    { name: "aIAnalysis", rows: data.aiAnalyses || [], key: "id" },
    { name: "aIAnalysisFeedback", rows: data.aiAnalysisFeedbacks || [], key: "id" },
    { name: "aIReflection", rows: data.aiReflections || [], key: "id" },
    { name: "aISuccessCase", rows: data.aiSuccessCases || [], key: "id" },
    { name: "behaviorPattern", rows: patterns, key: "id" },
    { name: "cognitiveBiasLog", rows: data.cognitiveBiasLogs || [], key: "id" },
    { name: "capabilityScore", rows: data.capabilityScores || [], key: "id" },
    { name: "analysisSession", rows: data.analysisSessions || [], key: "id" },
  ];

  // 第三步：逐条 upsert（不删除现有数据）
  let total = 0;
  for (const { name, rows, key } of tables) {
    if (rows.length === 0) continue;
    const model = (prisma as any)[name];
    if (!model) { console.warn(`  ⚠️  模型 ${name} 不存在，跳过`); continue; }

    let count = 0;
    for (const row of rows) {
      try {
        await model.upsert({
          where: { [key]: row[key as keyof typeof row] },
          update: row as any,
          create: row as any,
        });
        count++;
      } catch (err: any) {
        console.warn(`  ⚠️  ${name} ${row[key]} 失败: ${err.message?.slice(0, 80)}`);
      }
    }
    console.log(`  ${name}: ${count}/${rows.length} 条恢复`);
    total += count;
  }

  console.log(`\n✅ 恢复完成: ${total} 条记录`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
