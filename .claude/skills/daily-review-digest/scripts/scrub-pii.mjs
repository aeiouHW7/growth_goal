#!/usr/bin/env node
/**
 * 清除 work/ 中间文件里的个人隐私（身份证号/手机号/住址/伴侣姓名）
 * 用法: node scrub-pii.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const WORK = "D:/AI-ACE/growth_goal/.claude/skills/daily-review-digest/work";

/** 对 JSON 文件做「字符串值内」脱敏，避免破坏 JSON 转义 */
function scrubJson(text) {
  const data = JSON.parse(text);
  let hits = 0;
  const walk = (node) => {
    if (Array.isArray(node)) return node.forEach(walk);
    if (node && typeof node === "object") {
      for (const k of Object.keys(node)) {
        const v = node[k];
        if (typeof v === "string") {
          let s = v;
          for (const [re, repl] of RULES) {
            const m = s.match(re);
            if (m) { hits += m.length; s = s.replace(re, repl); }
          }
          node[k] = s;
        } else walk(v);
      }
    }
    return undefined;
  };
  walk(data);
  return { text: JSON.stringify(data, null, 2), hits };
}

// 标记统一用中性词 "[已脱敏]"，**不含任何敏感关键词**，避免被下一轮过滤再次命中
const RULES = [
  [/\[[^\[\]]*已脱敏\]/g, "[已脱敏]"], // 归一化旧标记
  [/\d{17}[\dXx]/g, "[已脱敏]"],
  [/1[3-9]\d{9}/g, "[已脱敏]"],
  [/广东省广州市天河区小新塘\s*10\s*栋/g, "[已脱敏]"],
  [/吉林省延吉市公园街园香十组/g, "[已脱敏]"],
  // 金融账号 / 密码
  [/资金账号\s*[:：]?\s*[A-Z]?\d{6,}/g, "[已脱敏]"],
  [/证券账号\s*[:：]?\s*[A-Z]?\d{6,}/g, "[已脱敏]"],
  [/一码通账号\s*[:：]?\s*[A-Z]?\d{6,}/g, "[已脱敏]"],
  [/同花顺\s*[:：]?\s*\d{6,}/g, "[已脱敏]"],
  [/[A-Za-z]{2,}\d{4,}[@!#$%^&*][A-Za-z0-9]*/g, "[已脱敏]"],
  [/\byangyy\d*\b/gi, "[已脱敏]"],
  [/\b\d{12,}\b/g, "[已脱敏]"],
  // 第三人
  [/刘美含/g, "[伴侣]"],
  [/@lmh/g, "[伴侣]"],
  [/(?<![A-Za-z])lmh(?![A-Za-z])/gi, "[伴侣]"],
];

const files = readdirSync(WORK).filter((f) => /\.(md|json|txt)$/.test(f));
let totalHits = 0;
const report = [];

for (const f of files) {
  const p = `${WORK}/${f}`;
  const raw = readFileSync(p, "utf-8");
  let text, hits;
  if (f.endsWith(".json")) {
    try {
      ({ text, hits } = scrubJson(raw));
    } catch (e) {
      report.push(`${f}: ⚠️ JSON 解析失败，跳过（${e.message}）`);
      continue;
    }
  } else {
    text = raw;
    hits = 0;
    for (const [re, repl] of RULES) {
      const m = text.match(re);
      if (m) { hits += m.length; text = text.replace(re, repl); }
    }
  }
  if (hits > 0) {
    writeFileSync(p, text, "utf-8");
    report.push(`${f}: ${hits} 处`);
    totalHits += hits;
  }
}

console.log(`已脱敏文件 ${report.length} 个，共 ${totalHits} 处：`);
report.forEach((r) => console.log(`  - ${r}`));
