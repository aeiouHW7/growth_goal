/**
 * sync-calendar.ts — 将今日计划同步到 Mac 日历 (AppleScript)
 *
 * 用法:
 *   npx tsx backend/scripts/sync-calendar.ts              ← 同步今天的计划
 *   npx tsx backend/scripts/sync-calendar.ts 2026-06-28   ← 指定日期
 *
 * 原理:
 *   1. 从本地 API 获取指定日期的每日计划
 *   2. 通过 osascript (AppleScript) 写入 Calendar.app
 *   3. 在 "Growth" 日历下创建/更新事件
 *   4. 每次同步会清空该日期 Growth 日历的旧事件再重建
 */

const API_BASE = "http://localhost:3001/api";
const CALENDAR_NAME = "Growth";

interface DailyPlan {
  id: string;
  title: string;
  description?: string;
  date: string;
  metricType: string;
  targetValue: string;
  currentValue?: string;
  status: string;
}

function getTargetDate(): string {
  const arg = process.argv[2];
  if (arg) return arg;
  return new Date().toISOString().slice(0, 10);
}

function escapeAppleScript(str: string): string {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");
}

function generateAppleScript(plans: DailyPlan[], dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);

  // 用 set 各字段的方式避开 AppleScript date 字符串解析的语言依赖
  // （中文 macOS date "..." 格式与英文不同）
  const eventLines = plans.map((plan) => {
    const summary = escapeAppleScript(plan.title);
    const target = escapeAppleScript(plan.targetValue);
    const current = plan.currentValue ? escapeAppleScript(plan.currentValue) : "-";
    const status = escapeAppleScript(plan.status);
    const desc = `Target: ${target} | Current: ${current} | Status: ${status} | PlanID: ${plan.id}`;
    return `      make new event with properties {summary:"${summary}", description:"${desc}", start date:targetDate, end date:targetDate + 2 * hours}`;
  });

  return `
on createEvents()
  -- 用字段设置规避语言依赖
  set targetDate to current date
  set year of targetDate to ${y}
  set month of targetDate to ${m}
  set day of targetDate to ${d}
  set hours of targetDate to 0
  set minutes of targetDate to 0
  set seconds of targetDate to 0

  tell application "Calendar"
    -- 创建 "Growth" 日历（如不存在）
    if not (exists calendar "${CALENDAR_NAME}") then
      make new calendar with properties {name:"${CALENDAR_NAME}"}
    end if

    tell calendar "${CALENDAR_NAME}"
      -- 清空该日期的旧事件
      set oldEvents to (every event whose start date ≥ targetDate and start date < targetDate + 86400)
      repeat with ev in oldEvents
        delete ev
      end repeat
    end tell

    -- 创建新事件
    tell calendar "${CALENDAR_NAME}"
${eventLines.join("\n")}
    end tell
  end tell
end createEvents

on run
  try
    createEvents()
    log "OK"
  on error errMsg
    log "ERROR: " & errMsg
  end try
end run
`;
}

async function main() {
  const dateStr = getTargetDate();
  console.log(`📅 同步计划到 Mac 日历 (${dateStr})...`);

  // 1. 从 API 获取今日计划
  let plans: DailyPlan[] = [];
  try {
    const res = await fetch(`${API_BASE}/plans/daily?date=${dateStr}`);
    if (!res.ok) throw new Error(`API 返回 ${res.status}`);
    plans = await res.json();
    // API 返回 { data: [...] }，也可能直接返回数组
    plans = (plans as any).data ?? plans;
  } catch (err) {
    console.error("  ❌ 无法获取计划:", err instanceof Error ? err.message : err);
    console.error("  💡 请确认后端已启动 (cd backend && npm run dev)");
    process.exit(1);
  }

  if (plans.length === 0) {
    console.log("  ℹ️  今日暂无计划，跳过同步");
    return;
  }

  console.log(`  📋 找到 ${plans.length} 个计划:`);
  for (const plan of plans) {
    console.log(`     - ${plan.title} [${plan.status}]`);
  }

  // 2. 生成并执行 AppleScript
  const appleScript = generateAppleScript(plans, dateStr);

  // 使用临时文件传递（避免 shell 转义问题）
  const fs = await import("fs");
  const path = await import("path");
  const tmpFile = path.join(require("os").tmpdir(), `growth-sync-${Date.now()}.applescript`);
  fs.writeFileSync(tmpFile, appleScript, "utf-8");

  const { execSync } = await import("child_process");
  try {
    const output = execSync(`osascript "${tmpFile}" 2>&1`, {
      encoding: "utf-8",
      timeout: 15000,
    });
    if (output.includes("ERROR")) {
      console.error("  ❌ AppleScript 执行失败:", output.trim());
      console.error("");
      console.error("  💡 首次使用需要授予 Calendar 权限：");
      console.error("     1. 系统会弹出「终端」想要访问「日历」的对话框");
      console.error("     2. 点击「好」或「允许」");
      console.error("     3. 再次运行此命令即可");
      console.error("     如果没弹出对话框：系统设置 → 隐私与安全性 → 日历 → 允许终端");
      process.exit(1);
    }
    console.log(`  ✅ 已写入 Mac 日历 (日历名: ${CALENDAR_NAME})`);
  } catch (err) {
    console.error("  ❌ AppleScript 执行失败:", err instanceof Error ? err.message : err);
    console.error("");
    console.error("  💡 首次使用需要授予 Calendar 权限：");
    console.error("     1. 运行后系统会弹出「终端」想要访问「日历」的对话框（后台可能不弹）");
    console.error("     2. 点击「好」允许后，再次运行即可");
    console.error("     3. 也可以手动去：系统设置 → 隐私与安全性 → 日历 → 给终端打勾");
    process.exit(1);
  } finally {
    // 清理临时文件
    try { fs.unlinkSync(tmpFile); } catch {}
  }
}

main();
