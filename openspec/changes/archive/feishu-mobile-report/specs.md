# 飞书手机端报告 — 验收规格

> 每个 Capability 至少包含一个 Edge Case（边缘案例）场景。

---

## Capability 1：复盘后详细多卡片

### Requirement: 复盘分析以多卡片完整展示

手机飞书发复盘后，Bridge 分析完成，分多张卡片展示完整结构化报告（洞察/完成/偏差/Fogg/偏误/能力/建议）。

#### Scenario: 复盘后收到多卡片
- **GIVEN** 用户在飞书发复盘内容
- **WHEN** Bridge 分析完成
- **THEN** 依次发送多张卡片：💡洞察 → ✅完成 → 📊偏差+Fogg → 🧠偏误 → 📈能力 → 💪建议

#### Scenario: Edge Case — 分析失败
- **GIVEN** Claude 调用失败或复盘状态异常
- **WHEN** Bridge 处理
- **THEN** 发送单张错误卡片（不发送半套分析），复盘状态可重试

#### Scenario: Edge Case — 部分维度缺失
- **GIVEN** 分析报告中某维度为空（如无偏误）
- **WHEN** 渲染卡片
- **THEN** 该维度卡片显示"暂无"，不省略整张卡（保持结构稳定）

---

## Capability 2：「进度」指令

### Requirement: 飞书查目标进度

用户发"进度"→ 返回进度卡片（进行中年度目标 + 本月计划 + 最近复盘摘要）。

#### Scenario: 查询进度
- **GIVEN** 用户在飞书发"进度"
- **WHEN** Bridge 调 `/api/progress/overview` + `/api/goals/yearly`
- **THEN** 返回卡片：进行中年度目标（标题+百分比）、本月计划进度、最近复盘日期摘要

#### Scenario: Edge Case — 无进行中目标
- **GIVEN** 无 ACTIVE 年度目标
- **WHEN** 查进度
- **THEN** 卡片提示"暂无进行中目标，可用 AI 建议创建"

#### Scenario: Edge Case — 后端不可达
- **GIVEN** 后端服务未运行
- **WHEN** 查进度
- **THEN** 返回"服务未启动，请先 /start"错误卡片

---

## Capability 3：周期总结提醒 + 启动

### Requirement: 周/月末提醒 + 回复「开始」启动

周日晚提醒周总结、月末提醒月总结；回复「开始」聚合生成周期分析。

#### Scenario: 周日提醒周总结
- **GIVEN** 当前为周日 21:00
- **WHEN** Bridge 定时检查
- **THEN** 发送提醒卡片"该做周总结了，回复「开始」"

#### Scenario: 月末提醒月总结
- **GIVEN** 当前为每月最后一天 21:00
- **WHEN** Bridge 定时检查
- **THEN** 发送提醒卡片"该做月总结了，回复「开始」"

#### Scenario: 回复「开始」启动
- **GIVEN** 用户回复「开始」
- **WHEN** Bridge 检查本周/月复盘，创建周/月复盘并调 `/api/analysis/run/:reviewId`
- **THEN** 生成周期分析并发送多卡片

#### Scenario: Edge Case — 周期内无日复盘
- **GIVEN** 本周/月无任何日复盘
- **WHEN** 回复「开始」
- **THEN** 提示"本周/月复盘数据不足，无法生成总结"，不创建空分析

#### Scenario: Edge Case — 重复提醒
- **GIVEN** 同一周/月已提醒过
- **WHEN** 定时检查再次触发
- **THEN** 不重复提醒（记录已提醒标记，或提醒周期内仅一次）

---

## Capability 4：「详情」指令

### Requirement: 展开完整分析报告

复盘卡片后发"详情"→ 展开完整结构化报告。

#### Scenario: 查看详情
- **GIVEN** 用户发"详情"
- **WHEN** Bridge 调 `/api/analysis/:id`（最近一次分析）
- **THEN** 发送完整结构化报告（多卡片/长消息展开各维度）

#### Scenario: Edge Case — 无历史分析
- **GIVEN** 无任何已生成分析
- **WHEN** 发"详情"
- **THEN** 提示"暂无分析记录，先完成一次复盘"
