#!/usr/bin/env node
/**
 * daily-review-digest · 碎碎念记录 + 分析
 *
 * 流程（严格先记录、再分析）：
 *   1. 拉取飞书复盘机器人碎碎念
 *   2. 按天整理（合并同日多条，过滤非文本）
 *   3. 去重（对比 md 已有日期）
 *   4. 记录：新日期原文先写入 md
 *   5. 分析：逐日调后端分析，把精简分析小节追加到对应日期下
 *
 * 用法:
 *   node sync.mjs [--no-analyze] [--limit 50]
 *
 * 约束：本机在 Windows 上，lark-cli 用 shell 调起（不经过 Claude Bash 工具，不会泄漏 mintty）。
 */
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";

const CHAT_ID = "oc_b139aa2e604688ec6566c812dbff09b9";
const MD_PATH =
  "D:\\AI-ACE\\AI-Coding-Engine\\domains\\knowledge-base\\knowledge-vault\\1. 原生笔记\\每天碎碎念.md";
const API = "http://localhost:3001";

const DEFAULT_HEADER = `# 每天碎碎念

> 从飞书复盘机器人同步 · 按天记录 + AI 分析小节 · 由 daily-review-digest 技能维护`;

const args = process.argv.slice(2);
const NO_ANALYZE = args.includes("--no-analyze");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(...a);

// ---------- md 解析 / 渲染 ----------
function parseMd(content) {
  if (!content || !content.trim()) return { header: DEFAULT_HEADER, days: new Map() };
  const parts = content.split(/^## (\d{4}-\d{2}-\d{2})\s*$/m);
  const header = parts[0].trim() || DEFAULT_HEADER;
  const days = new Map();
  for (let i = 1; i < parts.length; i += 2) {
    const date = parts[i];
    const body = (parts[i + 1] ?? "").replace(/\n?---\s*$/m, "");
    const idx = body.indexOf("> **AI 分析**");
    const raw = (idx >= 0 ? body.slice(0, idx) : body).trim();
    const analysis = idx >= 0 ? body.slice(idx).trim() : null;
    days.set(date, { raw, analysis });
  }
  return { header, days };
}

function render(header, days) {
  let out = header.trimEnd() + "\n\n";
  for (const date of [...days.keys()].sort()) {
    const { raw, analysis } = days.get(date);
    out += `## ${date}\n\n${raw}\n\n`;
    if (analysis) out += analysis + "\n\n";
    out += "---\n\n";
  }
  return out;
}

// ---------- 1. 拉取 ----------
function larkListPage(pageToken) {
  const cmd =
    `lark-cli im +chat-messages-list --chat-id ${CHAT_ID} --as user --page-size 50 --order desc` +
    (pageToken ? ` --page-token "${pageToken}"` : "");
  let out;
  try {
    out = execSync(cmd, { encoding: "utf-8", maxBuffer: 64 * 1024 * 1024 });
  } catch (e) {
    const stderr = (e.stderr || "").toString();
    if (stderr.includes("token_missing") || stderr.includes("need_user_authorization")) {
      throw new Error("飞书未授权/授权过期 → 请先运行: lark-cli auth login");
    }
    throw new Error(`lark-cli 调用失败: ${stderr.slice(0, 300) || e.message}`);
  }
  let json;
  try {
    json = JSON.parse(out.slice(out.indexOf("{")));
  } catch {
    throw new Error(`无法解析 lark-cli 输出: ${out.slice(0, 200)}`);
  }
  if (!json.ok) {
    if (json.error?.subtype === "token_missing") throw new Error("飞书未授权/授权过期 → 请先运行: lark-cli auth login");
    throw new Error(`lark-cli 返回错误: ${json.error?.message || JSON.stringify(json.error)}`);
  }
  return json.data;
}

/** 翻页拉取全部历史消息（直到 has_more=false） */
function pullMessages() {
  const all = [];
  let token = "";
  for (let page = 0; page < 100; page++) {
    const d = larkListPage(token);
    all.push(...(d.messages || []));
    log(`   第 ${page + 1} 页：+${(d.messages || []).length} 条（累计 ${all.length}/${d.total ?? "?"}）`);
    if (!d.has_more || !d.page_token) break;
    token = d.page_token;
  }
  return all;
}

// ---------- 2. 按天整理 ----------
function groupByDay(messages) {
  const map = new Map();
  for (const m of messages) {
    if (m.msg_type !== "text") continue; // 跳过图片/卡片等
    const date = (m.create_time || "").slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    if (!map.has(date)) map.set(date, []);
    map.get(date).push(m);
  }
  const result = new Map();
  for (const [date, msgs] of map) {
    msgs.sort((a, b) => a.create_time.localeCompare(b.create_time));
    result.set(date, msgs.map((m) => (m.content || "").trim()).join("\n\n").trim());
  }
  return result;
}

// ---------- 5. 分析 ----------
async function ensureReview(date, rawInput) {
  try {
    const res = await fetch(`${API}/api/reviews/daily`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date, rawInput }),
    });
    return res.status === 201 || res.status === 409 ? "ok" : `http_${res.status}`;
  } catch (e) {
    return "backend_down";
  }
}

async function waitForAnalysis(date, maxTries = 45) {
  for (let i = 0; i < maxTries; i++) {
    try {
      const r = await (await fetch(`${API}/api/reviews/daily/${date}`)).json();
      const a = r.data?.aiAnalyses?.[0];
      if (a) return a.structuredReport;
    } catch { /* 后端未起，继续等 */ }
    await sleep(8000);
  }
  return null;
}

function buildAnalysisSection(rep) {
  if (!rep) return null;
  const cs = rep.completionSummary || {};
  const head = `> **AI 分析** ｜ 精力 ${rep.energyRate ?? "-"} · 信号 ${rep.signalScore ?? "-"} · 完成率 ${cs.completionRate ?? "-"}`;
  const lines = [head];
  if (rep.insight?.pattern) lines.push(`> **洞察**：${rep.insight.pattern}`);
  const missing = [rep.foggDiagnosis?.missing ? `缺${rep.foggDiagnosis.missing}` : "", rep.insight?.missing || ""].filter(Boolean).join(" · ");
  if (missing) lines.push(`> **缺什么**：${missing}`);
  const sugs = (rep.suggestions || []).slice(0, 3);
  if (sugs.length) {
    lines.push(`> **建议**：`);
    for (const s of sugs) lines.push(`> - [${s.type}] ${s.message}`);
  }
  return lines.join("\n");
}

// ---------- 主流程 ----------
async function main() {
  log("① 拉取飞书碎碎念 ...");
  const messages = pullMessages();
  const byDay = groupByDay(messages);
  log(`   拉到 ${messages.length} 条消息，按天整理出 ${byDay.size} 天`);

  const existing = existsSync(MD_PATH) ? readFileSync(MD_PATH, "utf-8") : "";
  const { header, days } = parseMd(existing);

  // 去重：只取 md 中还没有的日期
  const newDates = [...byDay.keys()].filter((d) => !days.has(d)).sort();
  log(`② 去重：md 已有 ${days.size} 天，新增 ${newDates.length} 天 → ${newDates.join(", ") || "（无）"}`);

  if (newDates.length === 0) {
    log("没有新日期需要记录。");
  } else {
    // ③ 先记录原文
    for (const d of newDates) days.set(d, { raw: byDay.get(d), analysis: null });
    writeFileSync(MD_PATH, render(header, days), "utf-8");
    log(`③ 已记录原文（${newDates.length} 天）→ ${MD_PATH}`);
  }

  if (NO_ANALYZE) {
    log("--no-analyze：跳过分析。");
    return;
  }

  // ④ 再分析：对缺分析小节的日期补上
  const pending = [...days.keys()].filter((d) => !days.get(d).analysis).sort();
  log(`④ 待分析 ${pending.length} 天: ${pending.join(", ") || "（无）"}`);
  for (const date of pending) {
    const day = days.get(date);
    const status = await ensureReview(date, day.raw);
    if (status === "backend_down") {
      log(`   ✗ ${date}: 后端未启动，跳过分析`);
      continue;
    }
    const rep = await waitForAnalysis(date);
    if (!rep) { log(`   ✗ ${date}: 分析超时/失败`); continue; }
    const section = buildAnalysisSection(rep);
    if (section) {
      day.analysis = section;
      writeFileSync(MD_PATH, render(header, days), "utf-8");
      log(`   ✓ ${date}: 分析已追加`);
    }
  }
  log("完成。");
}

main().catch((e) => { console.error("FATAL:", e); process.exit(1); });
