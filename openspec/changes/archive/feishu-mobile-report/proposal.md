# 飞书手机端报告 — 提案

## Why（问题陈述）

用户每天碎碎念 + 看报告需开电脑（Web/CLI），非常麻烦。项目已有飞书 Bridge（复盘分析主入口），但**未运行**且能力有限：复盘后只发摘要卡片，**无法手机看进度/周期总结**。

可量化：当前每日复盘 + 报告查看 100% 依赖电脑；目标飞书端覆盖 ≥80%。

## PRD / 原型

**跳过**：变更核心是 **Bridge 交互扩展**（飞书指令/卡片/定时提醒），**无 Web 页面、无新 UI 布局**，无需 PRD 与原型。

---

## Design Overview

复用现有能力：
- 周/月分析生成 API 已就绪（`POST /api/analysis/run/:reviewId`，支持 WEEKLY/MONTHLY）
- 进度数据 API 已就绪（`/api/progress/overview`、`/api/goals/yearly`、`/api/progress/calendar`）
- Bridge 已有 `sendFeishu` / `sendFeishuCard` / `fetch(method, path, body)` / 指令分发

### 变更点（全部在 `bridge/auto-processor.cjs`）

**1. 复盘后详细多卡片**（Grill Q4=B）
- 现有卡片扩展为多张：洞察 / 完成情况 / 偏差+Fogg / 偏误 / 能力评分 / 建议
- 每张卡片用 `sendFeishuCard` 分开发送

**2. 新增「进度」指令**
- 用户发"进度" → 调 `/api/progress/overview` + `/api/goals/yearly`（进行中）→ 进度卡片（年度目标进度条 + 本月计划 + 最近复盘摘要）

**3. 周期总结提醒 + 启动**（Grill Q1/Q2）
- Bridge 加定时调度（`setInterval` 每分钟检查）
  - **周日 21:00** → 发提醒卡片"该做周总结了，回复「开始」"
  - **每月最后一天 21:00** → 发提醒卡片"该做月总结了，回复「开始」"
- 用户回复"开始" → Bridge 检查本周/本月复盘：
  - 创建周/月复盘（`POST /api/reviews/weekly|monthly`）→ 调 `/api/analysis/run/:reviewId` → 发分析卡片
  - 周期内无日复盘 → 提示"数据不足"不生成

**4. 新增「详情」指令**
- 复盘分析卡片后，用户发"详情" → 调 `/api/analysis/:id` → 完整结构化报告多卡片展开

### 架构决策（来自 Grill）

| 决策 | 结论 |
|------|------|
| 入口 | 飞书机器人（复用 Bridge），不做小程序/H5 |
| 报告形式 | 飞书消息卡片（详细多卡片）|
| 周期提醒 | 周日晚 + 月末提醒，回复「开始」启动 |
| 进度查看 | 「进度」指令按需查询 |

<!--
## Dialectical Analysis（辩证分析）

**多路径对比**
- 报告展示：A 摘要卡片（简洁）vs B 详细多卡片（信息全）→ 用户选 B，手机可读完整分析。
- 周期提醒：A 定时主动推送 vs B 仅指令查询 → 用户选 A（需提醒），周/月末推送。
- 启动方式：A 回复「开始」启动 vs B 自动生成 → 选 A，用户主导防数据未齐。

**风险对冲**
- 定时提醒依赖 Bridge 常驻运行 → 用 PM2 保活；提醒失败记录日志。
- 周期无数据时生成空分析 → Guard：无日复盘提示"数据不足"不生成。
- 飞书凭证失效 → 启动时明确报错提示重配。
-->

## Scoping and Materialization（范围界定）

**做**：
- Bridge 复盘后详细多卡片
- 「进度」「详情」指令
- 周期总结提醒（周日/月末）+ 「开始」启动
- 飞书应用配置（lark-cli 登录）+ 启动指南

**不做**：
- 不做微信小程序 / H5 移动端
- 不改 Web 前端
- 不改后端实体/API（复用现有）
- 不做定时推送进度（仅周期提醒）

**修改文件**：`bridge/auto-processor.cjs`（主要）、`README.md` 或 `docs/wiki`（启动/配置指南）
