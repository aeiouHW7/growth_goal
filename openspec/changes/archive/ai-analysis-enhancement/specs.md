# AI 分析增强 — 验收规格

> 每个 Capability 至少包含一个 Edge Case（边缘案例）场景。

---

## Capability 1：AI 目标/计划建议确认（模块 A）

### Requirement: 年/月 AI 建议生成与确认

总览页与计划页提供 AI 建议入口；生成时注入 LifeArchive 摘要；确认后批量创建 ACTIVE 目标/计划。

#### Scenario: 生成年度建议并确认
- **GIVEN** 用户已填写 LifeArchive（含第四层愿景与摘要）
- **WHEN** 用户在总览页点击「AI 建议年度目标」
- **THEN** 系统调用 `POST /api/goals/ai-suggest/yearly`，请求含 LifeArchive.summary；弹窗展示建议列表（标题/度量类型/目标值/AI 依据）

#### Scenario: 修改后确认
- **WHEN** 用户对某条建议点击「修改」并编辑标题/目标值后确认
- **THEN** 弹窗标记「已修改」，确认后该条按修改值写入

#### Scenario: 全部接受写入
- **WHEN** 用户点击「全部接受」
- **THEN** 系统调用 confirm 端点批量创建，status=ACTIVE，成功横幅显示"已创建 N 个目标"，刷新目标列表

#### Scenario: Edge Case — 档案为空
- **GIVEN** LifeArchive 未填写（无愿景）
- **WHEN** 用户点击 AI 建议
- **THEN** 前端捕获 `VISION_REQUIRED`，弹窗显示空状态"暂无可推荐目标，请先完善人生档案"+「填写人生档案」CTA

#### Scenario: Edge Case — 生成超时
- **GIVEN** 调 Claude 超时（120s）
- **WHEN** 用户点击 AI 建议
- **THEN** 弹窗显示"AI 生成超时，请重试"+ 重试按钮；重试后进入加载态并成功渲染

---

## Capability 2：周/月复盘 AI 分析生成（模块 B1）

### Requirement: 周/月复盘分析生成

周/月复盘创建后可生成 AI 分析（聚合周期内日复盘 + 计划进度），生成时注入 LifeArchive 摘要。

#### Scenario: 生成周复盘分析
- **GIVEN** 本周有 ≥1 条日复盘数据
- **WHEN** 用户触发周复盘分析（CLI 或 `POST /api/analysis/run/:reviewId` type=WEEKLY）
- **THEN** 系统聚合周期数据生成结构化报告，写 `AIAnalysis(analysisType=WEEKLY)` 关联周复盘；前端周视图报告面板展示该分析

#### Scenario: 生成月复盘分析
- **GIVEN** 本月有 ≥1 条日复盘数据
- **WHEN** 用户触发月复盘分析（type=MONTHLY）
- **THEN** 系统生成月级结构化报告关联月复盘；前端月视图报告面板展示，不再降级

#### Scenario: Edge Case — 周期内无日复盘
- **GIVEN** 周/月周期内 0 条日复盘
- **WHEN** 用户触发分析
- **THEN** 后端拒绝生成并返回明确错误；前端显示"暂无可分析数据"（不崩、不静默）

#### Scenario: Edge Case — 非本期月份
- **GIVEN** 前端切到无数据月份（如 2026-05）
- **WHEN** 查看月视图/右栏
- **THEN** 前端显示「该月暂无数据」占位，不抛错

---

## Capability 3：低分反思注入复盘分析（模块 B3）

### Requirement: 反思注入

复盘分析（日/周/月）生成时，把最近 5 条 AIReflection（低分反馈反思）注入 Prompt。

#### Scenario: 反思进入分析上下文
- **GIVEN** 存在最近 5 条以内的 AIReflection
- **WHEN** 任一日/周/月复盘分析运行
- **THEN** Prompt 追加"用户近期反馈"段（含反思内容），分析参考这些反馈

#### Scenario: Edge Case — 无反思
- **GIVEN** 无任何 AIReflection
- **WHEN** 复盘分析运行
- **THEN** 不注入反思段，分析正常生成（不报错）

#### Scenario: Edge Case — 反思不进入拆解建议
- **GIVEN** 存在 AIReflection
- **WHEN** 生成年/月 AI 建议（模块 A）
- **THEN** 拆解建议 Prompt 不含反思段（反思仅限复盘分析）

---

## Capability 4：AI 分析反馈评分 UI（模块 B2）

### Requirement: 前端反馈评分

报告面板底部提供评分区，用户可对 AI 分析评分并提交到反馈闭环。

#### Scenario: 提交评分
- **GIVEN** 用户查看一份 AI 分析报告（日/周/月）
- **WHEN** 用户拖动滑条评分（0-100）并可选填亮点/不足后提交
- **THEN** 系统调用 `POST /analysis/:id/feedback`；前端切换「已评分 ✓」态并禁用，展示分数语义（<60 注入反思 / ≥80 成功案例）

#### Scenario: Edge Case — 重复评分
- **GIVEN** 用户已对该分析评分
- **WHEN** 再次尝试评分
- **THEN** 前端按钮禁用/提示"已评分"；后端返回 409（已有反馈则拒绝）

#### Scenario: Edge Case — 未评分提交
- **GIVEN** 评分输入为空或 0
- **WHEN** 点击提交
- **THEN** 前端阻止提交并提示"请先评分"；评分需在 0-100

---

## Capability 5：日计划 Web 输入（模块 C）

### Requirement: 日计划创建与状态管理

计划页日视图可创建任务、勾选完成、软删。

#### Scenario: 创建任务
- **GIVEN** 用户在日视图
- **WHEN** 输入标题 + 度量类型 + 目标值（>0）点击添加
- **THEN** 调用 `POST /api/plans/daily` 创建（status=PENDING），列表刷新、当日进度条更新

#### Scenario: 勾选完成
- **WHEN** 用户勾选某任务
- **THEN** 调用 `PATCH /api/plans/daily/:id/status` 置 COMPLETED，进度条更新；再点回退 PENDING

#### Scenario: Edge Case — 软删与完成态保护
- **WHEN** 用户删除任务
- **THEN** 调用 status=CANCELLED 软删；COMPLETED 状态任务无删除按钮（不可删）

#### Scenario: Edge Case — 校验失败
- **GIVEN** 标题为空或目标值 ≤0
- **WHEN** 点击添加
- **THEN** 前端内联报错"请输入任务标题 / 目标值需大于 0"，不提交

---

## Capability 6：总览 LifeArchive 摘要卡片（模块 D）

### Requirement: 总览摘要卡片

总览页展示 LifeArchive 摘要，三态处理。

#### Scenario: 摘要已生成
- **GIVEN** LifeArchive 有 summary
- **WHEN** 打开总览页
- **THEN** 顶部卡片展示摘要（人格/技能/愿景等）+「编辑档案 →」

#### Scenario: Edge Case — 档案为空
- **GIVEN** LifeArchive 未填写
- **WHEN** 打开总览页
- **THEN** 卡片显示"填写档案 →"CTA，点击跳转档案 Tab

#### Scenario: Edge Case — 摘要缺失但档案已填
- **GIVEN** 档案已填但 summary 为 null
- **WHEN** 打开总览页
- **THEN** 卡片显示"摘要生成中"骨架 + 刷新按钮；点击刷新调 `POST /life-archive/summary/refresh`
