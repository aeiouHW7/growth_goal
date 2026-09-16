#!/usr/bin/env node
/**
 * 把自聊区（text/post/OCR 图片/文件/视频）按天合并进「每天碎碎念.md」
 * 与复盘机器人内容并存，两个来源分节展示。只记录，不分析。
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";

const WORK = "D:/AI-ACE/growth_goal/.claude/skills/daily-review-digest/work";
const MD_PATH =
  "D:\\AI-ACE\\AI-Coding-Engine\\domains\\knowledge-base\\knowledge-vault\\1. 原生笔记\\每天碎碎念.md";
const DEFAULT_HEADER = `# 每天碎碎念

> 复盘机器人 + 自聊区 双来源 · 按天记录（复盘内容附 AI 分析）· 由 daily-review-digest 技能维护`;

// 敏感信息检测：证照 / 金融凭证类内容整体剔除
// 覆盖：身份证、证照、银行/证券账户、密码验证码。故意不匹配泛化的"信用卡/银行卡"字样，以免误伤行情数据与 App 设置截图
const SENSITIVE_RE =
  /\d{17}[\dXx]|居民身份证|身份证号|受益所有人|股东持股|统一社会信用代码|营业执照|借记卡|银行卡号|信用卡号|开户行|法人代表|资金账号|证券账号|一码通|同花顺|券商|密码|验证码|账户余额/;
const REDACTED = "[含敏感信息，已剔除]"; // 中性标记：不含关键词，避免自命中
const removedEntries = [];

// 输出级脱敏：对**整个 md**（含复盘碎碎念原文）做值级清洗 + 第三人匿名
// 入口级 SENSITIVE_RE 只作用于自聊区，这里兜底覆盖全文
const SANITIZE_RULES = [
  [/\d{17}[\dXx]/g, "[已脱敏]"],
  [/资金账号\s*[:：]?\s*[A-Z]?\d{6,}/g, "[已脱敏]"],
  [/证券账号\s*[:：]?\s*[A-Z]?\d{6,}/g, "[已脱敏]"],
  [/一码通账号\s*[:：]?\s*[A-Z]?\d{6,}/g, "[已脱敏]"],
  [/同花顺\s*[:：]?\s*\d{6,}/g, "[已脱敏]"],
  [/[A-Za-z]{2,}\d{4,}[@!#$%^&*][A-Za-z0-9]*/g, "[已脱敏]"],
  [/\byangyy\d*\b/gi, "[已脱敏]"],
  [/\b\d{12,}\b/g, "[已脱敏]"],
  [/广东省广州市天河区小新塘\s*10\s*栋/g, "[已脱敏]"],
  [/吉林省延吉市公园街园香十组/g, "[已脱敏]"],
  [/刘美含/g, "[伴侣]"],
  [/@lmh/g, "[伴侣]"],
  [/(?<![A-Za-z])lmh(?![A-Za-z])/gi, "[伴侣]"],
];
function anonymize(text) {
  let out = text;
  for (const [re, repl] of SANITIZE_RULES) out = out.replace(re, repl);
  return out;
}

// ---------- 解析现有 md ----------
function parseMd(content) {
  const days = new Map();
  if (!content || !content.trim()) return { header: DEFAULT_HEADER, days };
  const parts = content.split(/^## (\d{4}-\d{2}-\d{2})\s*$/m);
  for (let i = 1; i < parts.length; i += 2) {
    const date = parts[i];
    let body = (parts[i + 1] ?? "").replace(/\n?---\s*$/m, "");
    // 1. 先切出「自聊区」小节（每次重建，旧内容直接丢弃）
    let selfchat = null;
    const scIdx = body.indexOf("### 自聊区");
    if (scIdx >= 0) {
      selfchat = body.slice(scIdx).replace(/^### 自聊区\s*/, "").trim();
      body = body.slice(0, scIdx);
    }
    // 2. 再切出「AI 分析」
    let analysis = null;
    const aiIdx = body.indexOf("> **AI 分析**");
    if (aiIdx >= 0) {
      analysis = body.slice(aiIdx).trim();
      body = body.slice(0, aiIdx);
    }
    // 3. 剩余即碎碎念原文
    const raw = body.trim().replace(/^### 碎碎念\s*/, "").trim();
    days.set(date, { raw, analysis, selfchat });
  }
  return { header: DEFAULT_HEADER, days };
}

// ---------- 解析 OCR 结果 ----------
function parseOcr() {
  const map = new Map();
  const files = readdirSync(WORK).filter((f) => /^ocr-result-\d+\.md$/.test(f));
  for (const f of files) {
    const content = readFileSync(`${WORK}/${f}`, "utf-8");
    const parts = content.split(/^## (img_v3_\S+)\s*$/m);
    for (let i = 1; i < parts.length; i += 2) {
      const key = parts[i];
      const body = parts[i + 1] ?? "";
      const idx = body.indexOf("- 转录:");
      let text = idx >= 0 ? body.slice(idx + 6) : body;
      map.set(key, text.replace(/^\n+/, "").trimEnd());
    }
  }
  return map;
}

// ---------- 工具 ----------
function stripHtml(s) {
  return String(s)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
function extractPost(content) {
  try {
    const j = JSON.parse(content);
    const parts = [];
    const walk = (n) => {
      if (Array.isArray(n)) return n.forEach(walk);
      if (n && typeof n === "object") {
        if (typeof n.text === "string") parts.push(n.text);
        if (n.tag === "a" && n.href) parts.push(`(${n.href})`);
        ["content", "title", "elements"].forEach((k) => n[k] && walk(n[k]));
      }
      return undefined;
    };
    walk(j);
    return parts.join("").trim();
  } catch {
    return stripHtml(content);
  }
}
function nameOf(content) {
  const m = String(content).match(/name="([^"]+)"/);
  return m ? m[1] : null;
}

// ---------- 自聊区按天聚合 ----------
function buildSelfchat(ocrMap) {
  const msgs = JSON.parse(readFileSync(`${WORK}/selfchat-messages.json`, "utf-8"));
  const byDay = new Map();
  for (const m of msgs) {
    const d = m.date;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) continue;
    if (!byDay.has(d)) byDay.set(d, []);
    let text = "";
    switch (m.type) {
      case "text":
        text = stripHtml(m.content);
        if (/exceeded the retention period/.test(text)) text = "[原消息已被飞书删除]";
        break;
      case "post":
        text = extractPost(m.content);
        break;
      case "image": {
        const key = String(m.content).match(/img_v3_[A-Za-z0-9_-]+/)?.[0];
        const t = key ? ocrMap.get(key) : null;
        text = t ? `【图片转文字】\n${t}` : `[图片，未识别到内容]`;
        break;
      }
      case "file": {
        const n = nameOf(m.content);
        text = `[文件附件: ${n || "未知"}]`;
        break;
      }
      case "media": {
        const n = nameOf(m.content);
        text = `[视频: ${n || "未知"}]`;
        break;
      }
      default:
        continue; // system 等跳过
    }
    if (text) {
      if (SENSITIVE_RE.test(text)) {
        removedEntries.push(`${d} ${m.time.slice(11, 16)} [${m.type}]`);
        text = REDACTED;
      }
      byDay.get(d).push({ time: m.time.slice(11, 16), text });
    }
  }
  return byDay;
}

// ---------- 渲染 ----------
function render(header, days) {
  let out = header.trimEnd() + "\n\n";
  for (const date of [...days.keys()].sort()) {
    const { raw, analysis, selfchat } = days.get(date);
    out += `## ${date}\n\n`;
    if (raw) out += `### 碎碎念\n\n${raw}\n\n`;
    if (analysis) out += analysis + "\n\n";
    if (selfchat) out += `### 自聊区\n\n${selfchat}\n\n`;
    out += "---\n\n";
  }
  return out;
}

// ---------- main ----------
const existing = existsSync(MD_PATH) ? readFileSync(MD_PATH, "utf-8") : "";
const { header, days } = parseMd(existing);
const ocrMap = parseOcr();
console.log(`OCR 条目: ${ocrMap.size}`);
const selfchatByDay = buildSelfchat(ocrMap);

let mergedDays = 0;
for (const [date, items] of selfchatByDay) {
  items.sort((a, b) => (a.time || "").localeCompare(b.time || "")); // 同日按时间升序
  const body = items.map((it) => (it.time ? `[${it.time}] ${it.text}` : it.text)).join("\n\n");
  if (!days.has(date)) days.set(date, { raw: "", analysis: null, selfchat: null });
  days.get(date).selfchat = body;
  mergedDays++;
}

writeFileSync(MD_PATH, anonymize(render(header, days)), "utf-8");
console.log(`自聊区覆盖 ${selfchatByDay.size} 天，合并后 md 共 ${days.size} 天`);
console.log(`已剔除敏感条目 ${removedEntries.length} 条:`);
removedEntries.forEach((r) => console.log(`  - ${r}`));
console.log(`已写入: ${MD_PATH}`);
