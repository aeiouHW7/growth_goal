import * as readline from "readline";

const API_BASE = "http://localhost:3001/api";

// ─── Colored output ───
const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};
function color(c: string, s: string) { return `${c}${s}${C.reset}`; }

// ─── Readline helper ───
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
function ask(prompt: string): Promise<string> {
  return new Promise((resolve) => rl.question(color(C.cyan, prompt), resolve));
}
async function askRequired(prompt: string, field: string): Promise<string> {
  while (true) {
    const v = (await ask(prompt)).trim();
    if (v) return v;
    console.log(color(C.red, `  ${field} 不能为空`));
  }
}
async function askOptional(prompt: string): Promise<string | undefined> {
  const v = (await ask(prompt)).trim();
  return v || undefined;
}
async function askNumber(prompt: string, field: string): Promise<number> {
  while (true) {
    const v = (await ask(prompt)).trim();
    const n = Number(v);
    if (!isNaN(n)) return n;
    console.log(color(C.red, `  ${field} 必须是数字`));
  }
}
async function askSelect(prompt: string, options: string[], field: string): Promise<string> {
  while (true) {
    console.log(color(C.gray, prompt));
    options.forEach((o, i) => console.log(`  ${color(C.cyan, String(i + 1))}. ${o}`));
    const v = (await ask(`${color(C.yellow, "请输入编号 [1-" + options.length + "]")}: `)).trim();
    const idx = parseInt(v) - 1;
    if (idx >= 0 && idx < options.length) return options[idx];
    console.log(color(C.red, `  请输入 1-${options.length} 之间的数字`));
  }
}

// ─── HTTP helpers ───
async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`);
  const json = await res.json();
  if (json.error) throw { ...json.error, status: res.status };
  return json.data;
}
async function apiPost(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json.error) throw { ...json.error, status: res.status };
  return json.data;
}
async function apiPut(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json.error) throw { ...json.error, status: res.status };
  return json.data;
}
async function apiPatch(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (json.error) throw { ...json.error, status: res.status };
  return json.data;
}

// ─── Pretty print helpers ───
function title(text: string) {
  console.log(`\n${color(C.bold + C.blue, "═══════════════════════════════════════")}`);
  console.log(`  ${color(C.bold + C.cyan, text)}`);
  console.log(`${color(C.bold + C.blue, "═══════════════════════════════════════")}\n`);
}
function divider() {
  console.log(color(C.gray, "────────────────────────────────────────"));
}
function statusBadge(s: string) {
  const m: Record<string, string> = {
    ACTIVE: color(C.green, "● 进行中"),
    COMPLETED: color(C.blue, "● 已完成"),
    ABANDONED: color(C.red, "● 已放弃"),
    ARCHIVED: color(C.gray, "● 已归档"),
    SUSPENDED: color(C.yellow, "● 已暂停"),
    PENDING: color(C.gray, "● 待开始"),
    IN_PROGRESS: color(C.green, "● 进行中"),
    PARTIAL: color(C.yellow, "● 部分完成"),
    FAILED: color(C.red, "● 失败"),
    CANCELLED: color(C.gray, "● 已取消"),
    INPUTTING: color(C.yellow, "● 输入中"),
    ANALYZING: color(C.magenta, "● 分析中"),
    SKIPPED: color(C.gray, "● 已跳过"),
  };
  return m[s] || s;
}
function formatDate(d: string) {
  return d ? d.slice(0, 10) : "-";
}
function progressBar(current: string | null, target: string, width = 20) {
  const cur = parseFloat(current || "0");
  const tgt = parseFloat(target);
  if (!tgt || isNaN(cur)) return color(C.gray, `[${current || "?"}/${target}]`);
  const pct = Math.min(cur / tgt, 1);
  const filled = Math.round(pct * width);
  const bar = "█".repeat(filled) + "░".repeat(width - filled);
  const pctLabel = `${Math.round(pct * 100)}%`;
  const barColor = pct >= 1 ? C.green : pct >= 0.5 ? C.yellow : C.red;
  return `${color(barColor, bar)} ${pctLabel} (${current || "0"}/${target})`;
}

// ─── Menu ───
function showMenu() {
  console.log(`\n${color(C.bold + C.blue, "  ╔═══════════════════════════════╗")}`);
  console.log(`${color(C.bold + C.blue, "  ║")}   ${color(C.bold + C.cyan, "Growth 目标管理系统")}     ${color(C.bold + C.blue, "║")}`);
  console.log(`${color(C.bold + C.blue, "  ╚═══════════════════════════════╝")}`);
  console.log(`  ${color(C.green, "1")}. 查看/设置用户信息`);
  console.log(`  ${color(C.green, "2")}. 管理目标`);
  console.log(`  ${color(C.green, "3")}. 管理计划`);
  console.log(`  ${color(C.green, "4")}. 写每日复盘`);
  console.log(`  ${color(C.green, "5")}. 查看进度总览`);
  console.log(`  ${color(C.green, "6")}. 周/月复盘检查`);
  console.log(`  ${color(C.green, "0")}. 退出\n`);
}

// ─── Feature implementations ───

// 1. User Profile
async function manageUser() {
  title("用户信息管理");
  let user: any;
  try {
    user = await apiGet("/user");
    console.log(`  当前用户: ${color(C.bold, user.nickname || "未设置昵称")}`);
    console.log(`  职业: ${user.occupation} | 行业: ${user.industry}`);
    console.log(`  年龄: ${user.age}`);
    console.log(`  工作日可用: ${user.weekdayAvailableHours}h | 周末可用: ${user.weekendAvailableHours}h`);
    console.log(`  目标领域: ${user.goalDomains?.join(", ") || "未设置"}`);
    const yes = await ask(color(C.yellow, "\n是否修改信息? (y/n): "));
    if (yes.toLowerCase() !== "y") return;
  } catch {
    console.log(color(C.yellow, "  未找到用户信息，开始创建新用户...\n"));
  }

  const age = await askNumber("  年龄: ", "年龄");
  const occupation = await askRequired("  职业: ", "职业");
  const industry = await askRequired("  行业: ", "行业");
  const wdHours = await askNumber("  工作日可用时间(小时): ", "可用时间");
  const weHours = await askNumber("  周末可用时间(小时): ", "可用时间");
  const nickname = await askOptional("  昵称(可选): ");
  const domains = await askOptional("  目标领域(逗号分隔，如: 财务,健康,学习): ");
  const goalDomains = domains ? domains.split(/[,，]/).map(s => s.trim()).filter(Boolean) : [];

  const body: any = { age, occupation, industry, weekdayAvailableHours: wdHours, weekendAvailableHours: weHours };
  if (nickname) body.nickname = nickname;
  if (goalDomains.length) body.goalDomains = goalDomains;

  try {
    if (user) {
      await apiPut("/user", body);
      console.log(color(C.green, "  ✓ 用户信息已更新"));
    } else {
      await apiPost("/user", body);
      console.log(color(C.green, "  ✓ 用户已创建"));
    }
  } catch (e: any) {
    console.log(color(C.red, `  ✗ 操作失败: ${e.message || JSON.stringify(e)}`));
  }
}

// 2. Manage Goals
async function manageGoals() {
  while (true) {
    title("目标管理");
    console.log(`  ${color(C.green, "1")}. 人生目标`);
    console.log(`  ${color(C.green, "2")}. 年度目标`);
    console.log(`  ${color(C.green, "0")}. 返回主菜单`);
    const v = (await ask(color(C.yellow, "请选择 [0-2]: "))).trim();
    if (v === "0") break;
    if (v === "1") await manageLifeGoals();
    if (v === "2") await manageYearlyGoals();
  }
}

async function manageLifeGoals() {
  while (true) {
    title("人生目标");
    const goals = await apiGet("/goals/life");
    if (goals.length) {
      console.log(`  共 ${color(C.bold, String(goals.length))} 个人生目标:\n`);
      goals.forEach((g: any, i: number) => {
        console.log(`  ${color(C.cyan, `${i + 1}.`)} ${color(C.bold, g.title)}`);
        if (g.description) console.log(`     描述: ${g.description}`);
        if (g.timeHorizon) console.log(`     时间跨度: ${g.timeHorizon}`);
        console.log(`     状态: ${statusBadge(g.status)}`);
        divider();
      });
    } else {
      console.log(color(C.yellow, "  暂无人生目标\n"));
    }

    console.log(`  ${color(C.green, "1")}. 创建`);
    console.log(`  ${color(C.green, "2")}. 修改状态`);
    console.log(`  ${color(C.green, "0")}. 返回`);
    const v = (await ask(color(C.yellow, "请选择 [0-2]: "))).trim();
    if (v === "0") break;

    if (v === "1") {
      const title = await askRequired("  目标标题: ", "标题");
      const desc = await askOptional("  描述(可选): ");
      const horizon = await askOptional("  时间跨度(可选，如: 10年): ");
      try {
        const g = await apiPost("/goals/life", { title, description: desc, timeHorizon: horizon });
        console.log(color(C.green, `  ✓ 人生目标已创建 (ID: ${g.id.slice(0, 8)}...)`));
      } catch (e: any) {
        console.log(color(C.red, `  ✗ 创建失败: ${e.message || JSON.stringify(e)}`));
      }
    }
    if (v === "2" && goals.length) {
      const idx = parseInt(await askNumber("  选择目标编号: ", "编号") as any) - 1;
      if (idx >= 0 && idx < goals.length) {
        const status = await askSelect("  选择新状态:", ["ACTIVE", "COMPLETED", "ABANDONED", "SUSPENDED"], "状态");
        try {
          await apiPatch(`/goals/life/${goals[idx].id}/status`, { status });
          console.log(color(C.green, `  ✓ 状态已更新为 ${status}`));
        } catch (e: any) {
          console.log(color(C.red, `  ✗ 状态更新失败: ${e.message || JSON.stringify(e)}`));
        }
      }
    }
  }
}

async function manageYearlyGoals() {
  while (true) {
    title("年度目标");
    const year = await askOptional(`  筛选年份(可选，如 ${new Date().getFullYear()}): `);
    const query = year ? `?year=${year}` : "";
    let goals: any[] = [];
    try { goals = await apiGet(`/goals/yearly${query}`); } catch {}
    if (goals.length) {
      console.log(`  共 ${color(C.bold, String(goals.length))} 个年度目标:\n`);
      goals.forEach((g: any, i: number) => {
        console.log(`  ${color(C.cyan, `${i + 1}.`)} ${color(C.bold, g.title)} (${g.year})`);
        console.log(`     进度: ${progressBar(g.currentValue, g.targetValue)}`);
        console.log(`     状态: ${statusBadge(g.status)}`);
        divider();
      });
    } else {
      console.log(color(C.yellow, `  暂无${year ? " " + year : ""}年度目标\n`));
    }

    console.log(`  ${color(C.green, "1")}. 创建`);
    console.log(`  ${color(C.green, "2")}. 更新进度`);
    console.log(`  ${color(C.green, "3")}. 修改状态`);
    console.log(`  ${color(C.green, "0")}. 返回`);
    const v = (await ask(color(C.yellow, "请选择 [0-3]: "))).trim();
    if (v === "0") break;

    if (v === "1") {
      const title = await askRequired("  目标标题: ", "标题");
      const y = await askNumber(`  年份(如 ${new Date().getFullYear()}): `, "年份");
      const metricType = await askSelect("  度量类型:", ["NUMERIC", "DURATION", "FREQUENCY", "PERCENTAGE", "STAGE"], "度量类型");
      const targetValue = await askRequired(`  目标值(如 "500000 元"): `, "目标值");
      const startValue = await askOptional("  起始值(可选): ");
      const desc = await askOptional("  描述(可选): ");
      try {
        const g = await apiPost("/goals/yearly", { title, year: y, metricType, targetValue, description: desc, startValue });
        console.log(color(C.green, `  ✓ 年度目标已创建 (ID: ${g.id.slice(0, 8)}...)`));
      } catch (e: any) {
        console.log(color(C.red, `  ✗ 创建失败: ${e.message || JSON.stringify(e)}`));
      }
    }
    if ((v === "2" || v === "3") && goals.length) {
      const idx = parseInt(await askNumber("  选择目标编号: ", "编号") as any) - 1;
      if (idx >= 0 && idx < goals.length) {
        if (v === "2") {
          const cv = await askRequired(`  当前值 (当前: ${goals[idx].currentValue || "无"}): `, "当前值");
          try {
            await apiPatch(`/goals/yearly/${goals[idx].id}/progress`, { currentValue: cv });
            console.log(color(C.green, "  ✓ 进度已更新"));
          } catch (e: any) {
            console.log(color(C.red, `  ✗ 更新失败: ${e.message || JSON.stringify(e)}`));
          }
        } else {
          const status = await askSelect("  选择新状态:", ["ACTIVE", "COMPLETED", "ABANDONED", "SUSPENDED"], "状态");
          try {
            await apiPatch(`/goals/yearly/${goals[idx].id}/status`, { status });
            console.log(color(C.green, `  ✓ 状态已更新为 ${status}`));
          } catch (e: any) {
            console.log(color(C.red, `  ✗ 状态更新失败: ${e.message || JSON.stringify(e)}`));
          }
        }
      }
    }
  }
}

// 3. Manage Plans
async function managePlans() {
  while (true) {
    title("计划管理");
    console.log(`  ${color(C.green, "1")}. 月度计划`);
    console.log(`  ${color(C.green, "2")}. 日计划`);
    console.log(`  ${color(C.green, "0")}. 返回主菜单`);
    const v = (await ask(color(C.yellow, "请选择 [0-2]: "))).trim();
    if (v === "0") break;
    if (v === "1") await manageMonthlyPlans();
    if (v === "2") await manageDailyPlans();
  }
}

async function manageMonthlyPlans() {
  while (true) {
    title("月度计划");
    const year = await askOptional(`  年份(可选，如 ${new Date().getFullYear()}): `);
    const month = await askOptional("  月份(可选，如 6): ");
    let query = "?";
    if (year) query += `year=${year}&`;
    if (month) query += `month=${month}&`;
    let plans: any[] = [];
    try { plans = await apiGet(`/plans/monthly${query}`); } catch {}
    if (plans.length) {
      console.log(`  共 ${color(C.bold, String(plans.length))} 个月度计划:\n`);
      plans.forEach((p: any, i: number) => {
        console.log(`  ${color(C.cyan, `${i + 1}.`)} ${color(C.bold, p.title)}`);
        console.log(`     月份: ${p.year}-${String(p.month).padStart(2, "0")}`);
        console.log(`     进度: ${progressBar(p.currentValue, p.targetValue)}`);
        console.log(`     状态: ${statusBadge(p.status)}`);
        divider();
      });
    } else {
      console.log(color(C.yellow, `  暂无月度计划\n`));
    }

    console.log(`  ${color(C.green, "1")}. 创建`);
    console.log(`  ${color(C.green, "2")}. 更新进度`);
    console.log(`  ${color(C.green, "3")}. 修改状态`);
    console.log(`  ${color(C.green, "0")}. 返回`);
    const v = (await ask(color(C.yellow, "请选择 [0-3]: "))).trim();
    if (v === "0") break;

    if (v === "1") {
      const title = await askRequired("  计划标题: ", "标题");
      const y = await askNumber("  年份: ", "年份");
      const m = await askNumber("  月份(1-12): ", "月份");
      const metricType = await askSelect("  度量类型:", ["NUMERIC", "DURATION", "FREQUENCY", "PERCENTAGE", "STAGE"], "度量类型");
      const targetValue = await askRequired(`  目标值(如 "150000 元"): `, "目标值");
      try {
        const p = await apiPost("/plans/monthly", { title, year: y, month: m, metricType, targetValue });
        console.log(color(C.green, `  ✓ 月度计划已创建 (ID: ${p.id.slice(0, 8)}...)`));
      } catch (e: any) {
        console.log(color(C.red, `  ✗ 创建失败: ${e.message || JSON.stringify(e)}`));
      }
    }
    if ((v === "2" || v === "3") && plans.length) {
      const idx = parseInt(await askNumber("  选择计划编号: ", "编号") as any) - 1;
      if (idx >= 0 && idx < plans.length) {
        if (v === "2") {
          const cv = await askRequired(`  当前值 (当前: ${plans[idx].currentValue || "无"}): `, "当前值");
          try { await apiPatch(`/plans/monthly/${plans[idx].id}/progress`, { currentValue: cv }); console.log(color(C.green, "  ✓ 进度已更新")); }
          catch (e: any) { console.log(color(C.red, `  ✗ 更新失败: ${e.message || JSON.stringify(e)}`)); }
        } else {
          const status = await askSelect("  选择新状态:", ["ACTIVE", "COMPLETED", "ABANDONED", "SUSPENDED"], "状态");
          try { await apiPatch(`/plans/monthly/${plans[idx].id}/status`, { status }); console.log(color(C.green, `  ✓ 状态已更新`)); }
          catch (e: any) { console.log(color(C.red, `  ✗ 更新失败: ${e.message || JSON.stringify(e)}`)); }
        }
      }
    }
  }
}

async function manageDailyPlans() {
  while (true) {
    title("日计划");
    const date = await askOptional("  日期(可选，如 2026-06-15): ");
    const query = date ? `?date=${date}` : "";
    let plans: any[] = [];
    try { plans = await apiGet(`/plans/daily${query}`); } catch {}
    if (plans.length) {
      console.log(`  共 ${color(C.bold, String(plans.length))} 个日计划:\n`);
      plans.forEach((p: any, i: number) => {
        console.log(`  ${color(C.cyan, `${i + 1}.`)} ${color(C.bold, p.title)}`);
        console.log(`     日期: ${formatDate(p.date)}`);
        console.log(`     目标: ${p.targetValue} | 当前: ${p.currentValue || "-"}`);
        console.log(`     状态: ${statusBadge(p.status)}`);
        divider();
      });
    } else {
      console.log(color(C.yellow, `  暂无日计划\n`));
    }

    console.log(`  ${color(C.green, "1")}. 创建`);
    console.log(`  ${color(C.green, "2")}. 修改状态`);
    console.log(`  ${color(C.green, "0")}. 返回`);
    const v = (await ask(color(C.yellow, "请选择 [0-2]: "))).trim();
    if (v === "0") break;

    if (v === "1") {
      const title = await askRequired("  任务标题: ", "标题");
      const d = await askRequired("  日期(如 2026-06-15): ", "日期");
      const metricType = await askSelect("  度量类型:", ["NUMERIC", "DURATION", "FREQUENCY", "PERCENTAGE", "STAGE"], "度量类型");
      const targetValue = await askRequired(`  目标值(如 "1 份"): `, "目标值");
      try {
        const p = await apiPost("/plans/daily", { title, date: d, metricType, targetValue });
        console.log(color(C.green, `  ✓ 日计划已创建 (ID: ${p.id.slice(0, 8)}...)`));
      } catch (e: any) {
        console.log(color(C.red, `  ✗ 创建失败: ${e.message || JSON.stringify(e)}`));
      }
    }
    if (v === "2" && plans.length) {
      const idx = parseInt(await askNumber("  选择计划编号: ", "编号") as any) - 1;
      if (idx >= 0 && idx < plans.length) {
        const status = await askSelect("  选择新状态:", ["PENDING", "IN_PROGRESS", "COMPLETED", "PARTIAL", "FAILED", "CANCELLED"], "状态");
        try { await apiPatch(`/plans/daily/${plans[idx].id}/status`, { status }); console.log(color(C.green, "  ✓ 状态已更新")); }
        catch (e: any) { console.log(color(C.red, `  ✗ 状态更新失败: ${e.message || JSON.stringify(e)}`)); }
      }
    }
  }
}

// 4. Daily Review
async function writeDailyReview() {
  title("写每日复盘");
  const date = await askOptional(`  日期 (默认今天 ${new Date().toISOString().slice(0, 10)}): `) || new Date().toISOString().slice(0, 10);
  console.log(color(C.gray, "  请描述你今天的情况，可以包括: 完成了什么、没完成什么、遇到的障碍、情绪状态等\n"));

  const rawInput = await askRequired("  复盘内容: ", "复盘内容");

  try {
    const review: any = await apiPost("/reviews/daily", { date, rawInput });
    console.log(color(C.green, `  ✓ 复盘已提交 (ID: ${review.id.slice(0, 8)}...)`));
    divider();

    // Optionally add structured fields
    const addDetails = (await ask(color(C.yellow, "  是否补充结构化字段? (y/n): "))).toLowerCase() === "y";
    if (addDetails) {
      const completed = await askOptional("  完成了什么: ");
      const notCompleted = await askOptional("  未完成什么: ");
      const obstacles = await askOptional("  遇到的障碍: ");
      const emotion = await askOptional("  情绪状态: ");
      const mindset = await askOptional("  心得备注: ");
      const body: any = {};
      if (completed) body.completed = completed;
      if (notCompleted) body.notCompleted = notCompleted;
      if (obstacles) body.obstacles = obstacles;
      if (emotion) body.emotionState = emotion;
      if (mindset) body.mindsetNote = mindset;
      if (Object.keys(body).length) {
        await apiPut(`/reviews/daily/${review.id}`, body);
        console.log(color(C.green, "  ✓ 结构化字段已更新"));
      }
    }

    // Follow-up questions (max 2)
    const addFU = (await ask(color(C.yellow, "  是否添加追问? (y/n): "))).toLowerCase() === "y";
    if (addFU) {
      for (let i = 0; i < 2; i++) {
        const q = await askRequired(` 追问 ${i + 1}/2 问题: `, "问题");
        const a = await askRequired(` 回答 ${i + 1}/2: `, "回答");
        try {
          await apiPost(`/reviews/daily/${review.id}/followup`, { question: q, answer: a });
          console.log(color(C.green, "  ✓ 追问已添加"));
        } catch (e: any) {
          console.log(color(C.red, `  ✗ 添加失败: ${e.message || JSON.stringify(e)}`));
          break;
        }
        if (i === 0) {
          const cont = (await ask(color(C.yellow, "  再添加一条追问? (y/n): "))).toLowerCase() !== "y";
          if (cont) break;
        }
      }
    }

    // Generate AI analysis
    const genAnalysis = (await ask(color(C.yellow, "  是否生成 AI 分析? (y/n): "))).toLowerCase() === "y";
    if (genAnalysis) {
      console.log(color(C.gray, "  请输入分析数据(或跳过让 AI 后续处理)..."));
      const structuredReport = {
        completionSummary: {
          completed: [(await askOptional("  完成了什么: ")) || rawInput.slice(0, 20)],
          notCompleted: [],
          completionRate: "50%",
        },
        deviationAnalysis: { onTrack: [], behind: [], riskLevel: "低" },
        executionDiagnosis: { issues: [], rootCause: "", pattern: "" },
        adjustmentSuggestions: { planChanges: [], executionOptimization: [] },
        externalPerspective: { trendInsights: [], directionCheck: "方向正确", newOpportunities: [], risks: [] },
      };
      try {
        const analysis: any = await apiPost("/analysis/generate", {
          dailyReviewId: review.id,
          analysisType: "DAILY",
          structuredReport,
        });
        console.log(color(C.green, `  ✓ AI 分析已生成 (ID: ${analysis.id.slice(0, 8)}...)`));

        // Score feedback
        const score = await askNumber("  给本次分析评分 (0-100): ", "评分");
        const reason = score >= 80 ? await askOptional("  优秀原因(可选): ") : score < 60 ? await askOptional("  改进建议(可选): ") : undefined;
        try {
          const fb: any = await apiPost(`/analysis/${analysis.id}/feedback`, {
            userScore: score,
            excellentReason: score >= 80 ? reason : undefined,
            failReason: score < 60 ? reason : undefined,
          });
          if (fb.successCases?.length) console.log(color(C.green, `  🌟 优秀模式已记录!`));
          if (fb.reflections?.length) console.log(color(C.yellow, `  💡 改进建议已记录`));
          console.log(color(C.green, `  ✓ 评分已提交 (${score}分)`));
        } catch (e: any) {
          console.log(color(C.red, `  ✗ 评分提交失败: ${e.message || JSON.stringify(e)}`));
        }
      } catch (e: any) {
        console.log(color(C.red, `  ✗ AI 分析生成失败: ${e.message || JSON.stringify(e)}`));
      }
    }

    console.log(color(C.green, `\n  ✅ ${date} 复盘完成!`));
  } catch (e: any) {
    console.log(color(C.red, `  ✗ 提交失败: ${e.message || JSON.stringify(e)}`));
  }
}

// 5. Progress Overview
async function viewProgress() {
  title("进度总览");
  try {
    const data: any = await apiGet("/progress/overview");
    console.log(`  ${color(C.bold + C.cyan, "人生目标:")} ${data.lifeGoals?.length || 0} 个`);
    data.lifeGoals?.forEach((g: any) => {
      console.log(`    ${statusBadge(g.status)} ${color(C.bold, g.title)}`);
    });
    console.log();

    console.log(`  ${color(C.bold + C.cyan, "年度目标:")} ${data.yearlyGoals?.length || 0} 个`);
    data.yearlyGoals?.forEach((g: any) => {
      console.log(`    ${statusBadge(g.status)} ${color(C.bold, g.title)} (${g.year})`);
      if (g.targetValue) console.log(`      进度: ${progressBar(g.currentValue, g.targetValue)}`);
    });
    console.log();

    console.log(`  ${color(C.bold + C.cyan, "月度计划:")} ${data.monthlyPlans?.length || 0} 个`);
    data.monthlyPlans?.forEach((p: any) => {
      console.log(`    ${statusBadge(p.status)} ${color(C.bold, p.title)}`);
      if (p.targetValue) console.log(`      进度: ${progressBar(p.currentValue, p.targetValue)}`);
    });
    console.log();

    // Stats
    const s = data.stats || {};
    const rateColor = s.completionRate >= 0.7 ? C.green : s.completionRate >= 0.3 ? C.yellow : C.red;
    console.log(`  ${color(C.bold + C.cyan, "统计:")}`);
    console.log(`    总数: ${s.total || 0} | 已完成: ${s.completed || 0} | 完成率: ${color(rateColor, `${Math.round((s.completionRate || 0) * 100)}%`)}`);
    console.log();

    // Recent reviews
    if (data.recentReviews?.length) {
      console.log(`  ${color(C.bold + C.cyan, "近期复盘:")}`);
      data.recentReviews.forEach((r: any) => {
        console.log(`    ${formatDate(r.date)} ${statusBadge(r.status)}`);
      });
    }
  } catch (e: any) {
    console.log(color(C.red, `  ✗ 获取数据失败: ${e.message || JSON.stringify(e)}`));
  }
}

// 6. Weekly/Monthly review check
async function reviewCheck() {
  title("周/月复盘检查");
  console.log(`  ${color(C.green, "1")}. 周复盘检查`);
  console.log(`  ${color(C.green, "2")}. 月复盘检查`);
  console.log(`  ${color(C.green, "0")}. 返回`);

  const v = (await ask(color(C.yellow, "请选择 [0-2]: "))).trim();
  if (v === "0") return;

  if (v === "1") {
    const year = await askNumber(`  年份 (如 ${new Date().getFullYear()}): `, "年份");
    const week = await askNumber("  周数 (1-53): ", "周数");
    try {
      const result: any = await apiGet(`/reviews/weekly/check?year=${year}&week=${week}`);
      if (result.needsTrigger) {
        console.log(color(C.yellow, "  ⚠ 该周尚无复盘"));
        const create = (await ask(color(C.yellow, "  是否创建周复盘? (y/n): "))).toLowerCase() === "y";
        if (create) {
          const rawInput = await askRequired("  本周总结: ", "总结");
          const summary = await askOptional("  简要概括(可选): ");
          const ws = await askRequired("  周开始日期(如 2026-06-15): ", "开始日期");
          const we = await askRequired("  周结束日期(如 2026-06-21): ", "结束日期");
          try {
            await apiPost("/reviews/weekly", { weekStart: ws, weekEnd: we, year, week, rawInput, summary });
            console.log(color(C.green, "  ✓ 周复盘已创建"));
          } catch (e: any) {
            console.log(color(C.red, `  ✗ 创建失败: ${e.message || JSON.stringify(e)}`));
          }
        }
      } else {
        console.log(color(C.green, "  ✓ 该周已有复盘"));
      }
    } catch (e: any) {
      console.log(color(C.red, `  ✗ 检查失败: ${e.message || JSON.stringify(e)}`));
    }
  }

  if (v === "2") {
    const year = await askNumber(`  年份 (如 ${new Date().getFullYear()}): `, "年份");
    const month = await askNumber("  月份 (1-12): ", "月份");
    try {
      const result: any = await apiGet(`/reviews/monthly/check?year=${year}&month=${month}`);
      if (result.needsTrigger) {
        console.log(color(C.yellow, "  ⚠ 该月尚无复盘"));
        const create = (await ask(color(C.yellow, "  是否创建月复盘? (y/n): "))).toLowerCase() === "y";
        if (create) {
          const rawInput = await askRequired("  本月总结: ", "总结");
          const summary = await askOptional("  简要概括(可选): ");
          try {
            await apiPost("/reviews/monthly", { year, month, rawInput, summary });
            console.log(color(C.green, "  ✓ 月复盘已创建"));
          } catch (e: any) {
            console.log(color(C.red, `  ✗ 创建失败: ${e.message || JSON.stringify(e)}`));
          }
        }
      } else {
        console.log(color(C.green, "  ✓ 该月已有复盘"));
      }
    } catch (e: any) {
      console.log(color(C.red, `  ✗ 检查失败: ${e.message || JSON.stringify(e)}`));
    }
  }
}

// ─── Main ───
async function main() {
  console.log(`\n${color(C.bold + C.blue, "  Growth 目标管理系统 CLI")} ${color(C.gray, "v0.1")}`);
  console.log(color(C.gray, "  后端: " + API_BASE));

  while (true) {
    showMenu();
    const v = (await ask(color(C.yellow, "  请选择 [0-6]: "))).trim();
    switch (v) {
      case "1": await manageUser(); break;
      case "2": await manageGoals(); break;
      case "3": await managePlans(); break;
      case "4": await writeDailyReview(); break;
      case "5": await viewProgress(); break;
      case "6": await reviewCheck(); break;
      case "0":
        console.log(`\n${color(C.green, "  再见! 👋")}\n`);
        rl.close();
        return;
      default:
        console.log(color(C.red, "  无效选项，请重新输入"));
    }
  }
}

main().catch((e) => {
  console.error(color(C.red, `\n  ❌ 发生错误: ${e.message || e}`));
  rl.close();
});
