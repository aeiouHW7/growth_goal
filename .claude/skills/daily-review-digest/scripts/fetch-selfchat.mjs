#!/usr/bin/env node
/**
 * 抓取自聊区全部消息 + 下载图片资源
 * 输出: selfchat-messages.json（消息元数据）+ lark-im-resources/（图片）
 */
import { execSync } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";

const CHAT_ID = "oc_4d4fba46291ef6552fd05dfdda388dc6";
const OUT_DIR = "D:/AI-ACE/growth_goal/.claude/skills/daily-review-digest/work";
const OUT = `${OUT_DIR}/selfchat-messages.json`;
const RES_DIR = "D:/AI-ACE/growth_goal/lark-im-resources";

mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(RES_DIR, { recursive: true });

const NO_DOWNLOAD = process.argv.includes("--no-download"); // 图片已下载时用于只刷新消息 JSON

function larkPage(token) {
  const cmd =
    `lark-cli im +chat-messages-list --chat-id ${CHAT_ID} --as user --page-size 50 --order desc --no-reactions` +
    (NO_DOWNLOAD ? "" : " --download-resources") +
    (token ? ` --page-token "${token}"` : "");
  const out = execSync(cmd, {
    encoding: "utf-8",
    maxBuffer: 256 * 1024 * 1024,
    stdio: ["pipe", "pipe", "pipe"],
  });
  return JSON.parse(out.slice(out.indexOf("{"))).data;
}

const all = [];
let token = "";
for (let i = 0; i < 100; i++) {
  const d = larkPage(token);
  all.push(...(d.messages || []));
  console.log(`第 ${i + 1} 页：+${(d.messages || []).length}（累计 ${all.length}）`);
  if (!d.has_more || !d.page_token) break;
  token = d.page_token;
}

// 精简单条消息，只留需要的字段
const slim = all.map((m) => ({
  date: (m.create_time || "").slice(0, 10),
  time: m.create_time,
  type: m.msg_type,
  content: m.content,
  msg_id: m.message_id,
}));

writeFileSync(OUT, JSON.stringify(slim, null, 2), "utf-8");
const byType = {};
for (const m of slim) byType[m.type] = (byType[m.type] || 0) + 1;
console.log(`\n总消息 ${slim.length}，类型: ${JSON.stringify(byType)}`);
console.log(`已写入: ${OUT}`);
