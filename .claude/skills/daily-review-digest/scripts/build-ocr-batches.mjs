#!/usr/bin/env node
/**
 * 构建 OCR 批次：把已下载的图片按 图片key→消息日期 映射，分批输出
 */
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from "node:fs";

const WORK = "D:/AI-ACE/growth_goal/.claude/skills/daily-review-digest/work";
const RES = "D:/AI-ACE/growth_goal/lark-im-resources";
const BATCH_SIZE = 25;

mkdirSync(WORK, { recursive: true });

const msgs = JSON.parse(readFileSync(`${WORK}/selfchat-messages.json`, "utf-8"));
const files = readdirSync(RES);
const fileSet = new Set(files);

const items = [];
let missing = 0;
for (const m of msgs) {
  const match = String(m.content).match(/img_v3_[A-Za-z0-9_-]+/);
  if (!match) continue;
  const key = match[0];
  const f = files.find((fn) => fn.startsWith(key));
  if (f) items.push({ file: `${RES}/${f}`, key, date: m.date, time: m.time });
  else missing++;
}

const batches = [];
for (let i = 0; i < items.length; i += BATCH_SIZE) batches.push(items.slice(i, i + BATCH_SIZE));

writeFileSync(`${WORK}/ocr-items.json`, JSON.stringify(items, null, 2), "utf-8");
for (let b = 0; b < batches.length; b++) {
  writeFileSync(`${WORK}/ocr-batch-${b + 1}.json`, JSON.stringify(batches[b], null, 2), "utf-8");
}

console.log(`图片消息 ${items.length} 条，缺失文件 ${missing}，分为 ${batches.length} 批`);
console.log(`批次文件: ${WORK}/ocr-batch-1.json ... ocr-batch-${batches.length}.json`);
