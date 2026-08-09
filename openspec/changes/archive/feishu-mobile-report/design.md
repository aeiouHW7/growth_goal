# 飞书手机端报告 — 技术设计

## 1. 变更文件

主要：`bridge/auto-processor.cjs`（Bridge 是 CommonJS，非 TS）。
辅助：README 或 `docs/wiki/`（启动/配置指南）。

## 2. 指令分发扩展

Bridge 现有消息处理（分析非命令文本 → 复盘）。新增指令分支：

```
用户消息
├── "进度"        → handleProgress()    （Capability 2）
├── "开始"        → handleStartSummary()（Capability 3）
├── "详情"        → handleDetail()      （Capability 4）
├── /start /stop /services → 现有管理命令
└── 其他文本      → 复盘流程（现有 + 详细多卡片）
```

## 3. 复盘后详细多卡片（Capability 1）

现有 `sendFeishuCard(payload)` 支持 markdown 卡片。复盘分析完成后，分维度发送多张卡片：

```js
function sendAnalysisCards(report) {
  sendFeishuCard({ title: '💡 洞察', md: formatInsight(report.insight) });
  sendFeishuCard({ title: '✅ 完成', md: formatCompletion(report.completionSummary) });
  sendFeishuCard({ title: '📊 偏差 + Fogg', md: formatDeviation(report) });
  sendFeishuCard({ title: '🧠 认知偏误', md: formatBiases(report.detectedBiases) });
  sendFeishuCard({ title: '📈 能力评分', md: formatCapabilities(report.capabilityDeltas) });
  sendFeishuCard({ title: '💪 建议', md: formatSuggestions(report.suggestions) });
}
```

空维度显示"暂无"（保持结构稳定）。

## 4. 「进度」指令（Capability 2）

```js
async function handleProgress() {
  const overview = await fetch('GET', '/api/progress/overview');
  const yearly = await fetch('GET', '/api/goals/yearly?year=' + new Date().getFullYear());
  const active = (yearly || []).filter(g => g.status === 'ACTIVE');
  const md = formatProgress(active, overview);
  sendFeishuCard({ title: '📈 目标进度', md });
}
```

卡片内容：进行中年度目标（标题 + 百分比进度条）、本月计划进度、最近复盘日期。

## 5. 周期总结提醒 + 启动（Capability 3）

**定时调度**（Bridge 无现有调度，新增 `setInterval` 每分钟检查）：

```js
setInterval(checkPeriodicReminder, 60 * 1000);

function checkPeriodicReminder() {
  const now = new Date();
  const h = now.getHours(), m = now.getMinutes();
  if (h !== 21 || m !== 0) return;               // 21:00
  if (now.getDay() === 0) {                       // 周日 → 周总结
    if (!remindedThisWeek) {
      sendFeishu('⏰ 该做周总结了！回复「开始」启动');
      remindedThisWeek = true;
    }
  }
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  if (now.getDate() === lastDay) {               // 月末 → 月总结
    if (!remindedThisMonth) {
      sendFeishu('⏰ 该做月总结了！回复「开始」启动');
      remindedThisMonth = true;
    }
  }
}
```

`remindedThisWeek/Month` 在进入新周期时重置（记录当前 ISO 周/月，变化则重置）。

**「开始」启动**：

```js
async function handleStartSummary() {
  // 判断当前是周总结还是月总结（周日晚后 / 月末）
  const isMonth = isLastDayOfMonth();
  if (isMonth) {
    const m = await fetch('POST', '/api/reviews/monthly', { year, month, rawInput: '月末总结' });
    if (!m.data) { sendFeishu('本月复盘数据不足，无法生成总结'); return; }
    await fetch('POST', `/api/analysis/run/${m.data.id}`);
  } else {
    // 周总结：创建周复盘 → run
    const w = await fetch('POST', '/api/reviews/weekly', { weekStart, weekEnd, year, week, rawInput: '周总结' });
    ...
  }
  sendFeishu('✅ 总结生成中，完成后推送分析卡片');
}
```

> 周期无日复盘 → 创建复盘失败或 run 返回错误 → 提示"数据不足"。

## 6. 「详情」指令（Capability 4）

```js
async function handleDetail() {
  const analysis = await fetch('GET', '/api/analysis/latest');  // 或跟踪最近 analysisId
  sendAnalysisCards(analysis.structuredReport);
}
```

Bridge 在分析后记录 `lastAnalysisId`，详情用它查询 `/api/analysis/:id`。

## 7. 飞书配置与启动

- `.env` 配置 `LARK_CLI_PATH` + 飞书应用凭证（已有，用户确认）
- 启动：`lark-cli login`（飞书应用授权）→ `node bridge/auto-processor.cjs`（PM2 保活）
- 启动指南写入 README/docs/wiki

## 测试策略

- Bridge 是 .cjs 无单测框架 —— 用**手动/集成验证**（真实飞书发消息测指令）
- 调度逻辑可抽纯函数测（`shouldRemind()`：周日/月末判定）
- 后端 API 已测（progress/analysis/run），Bridge 侧验证指令接线
