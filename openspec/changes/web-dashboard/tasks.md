# Web Dashboard 重做 - 任务列表

估算: 14 小时
依赖链: T1 → T2 → T3 → T4 → T5 → T6
并行: T7

---

### T1: 项目清理 + 浅色主题框架

**文件:** `frontend/src/styles/theme.css`, `frontend/src/index.css`, `frontend/src/App.tsx`, `frontend/src/pages/OverviewPage.tsx`, `frontend/src/pages/GoalsPage.tsx`, `frontend/src/pages/PlansPage.tsx`

- 删除旧的 pages/ 目录文件（Overview, Calendar, Goals, Reviews）
- 创建 `styles/theme.css` 含浅色主题 CSS 变量
- 创建 `styles/app.css` 含布局样式
- 重建 `App.tsx` 含 TabBar (总览 | 目标链 | 计划) + 页面状态切换
- 创建三个页面组件壳子 (OverviewPage, GoalsPage, PlansPage)
- 创建 `pages/` 目录放置页面组件
- 验证: 页面加载显示导航栏，三标签可切换，无报错

---

### T2: 总览页组件

**文件:**
- `frontend/src/components/UserPopover.tsx`
- `frontend/src/pages/OverviewPage.tsx`
- `frontend/src/styles/overview.css`

- 右上角用户信息 hover 弹出 (UserPopover)
- 人生总目标卡片: 标题 + 时间跨度 + 描述
- 进行中的年度目标列表: 调用 `GET /api/goals/yearly?year=`，过滤 status=进行中
- 每项显示: 颜色圆点 + 标题 + 进度百分比 + 进度条
- AI 改进建议区: 调用聚合分析 API，彩色竖线区分类型
- 当月目标完成进度: 标题显示当前月份，每个目标显示当月进度值 + 进度条
- 验证: 总览页展示完整的用户、目标、建议、进度信息

---

### T3: 目标树组件 (GoalTree)

**文件:** `frontend/src/components/GoalTree.tsx`, `frontend/src/pages/GoalsPage.tsx`, `frontend/src/styles/goal-tree.css`

- 实现可折叠递归 GoalNode 组件
- 调用 `GET /api/goals/life` + `GET /api/progress/goal/{id}` 获取数据
- 3 层深度: LifeGoal → YearlyGoal → MonthlyPlan
- 每层显示: 标题 + 状态标签 + 进度条 + 进度值
- 筛选栏: 全部 | 进行中 | 已完成，点击过滤显示
- 已完成目标: 整体置灰 (opacity 0.45)
- 验证: "目标链" 标签页显示目标层级树，筛选过滤正常

---

### T4: 周期选择器 (PeriodSelector)

**文件:** `frontend/src/components/PeriodSelector.tsx`, `frontend/src/styles/calendar.css`

- 年份下拉选择器 (select)
- 月份下拉选择器 (select)
- 维度切换按钮组: 年 | 月 | 周 | 日
- 选中态: 紫色文字 + 浅紫背景
- 验证: 点击切换维度和选择年月均正常

---

### T5: 月视图 + 日历网格 (CalendarGrid)

**文件:** `frontend/src/components/CalendarGrid.tsx`, `frontend/src/styles/calendar.css`

- 7 列日历网格，正确计算每月第一天偏移
- 调用 `GET /api/progress/calendar?year=&month=`
- 颜色编码圆点: 绿(>=80分) 黄(>=60分) 红(<60分) 灰(有复盘无评分)
- 每格显示: 日期数字 + 颜色圆点
- 图例 + 今日高亮 (蓝色边框)
- 验证: 月视图显示正确的颜色编码日历

---

### T6: 三面板系统 + 周/日/年视图

**文件:**
- `frontend/src/components/PlanPanel.tsx`
- `frontend/src/components/EvalPanel.tsx`
- `frontend/src/components/ReportPanel.tsx`
- `frontend/src/components/WeekTimeline.tsx`
- `frontend/src/components/DayTimeline.tsx`
- `frontend/src/components/YearGrid.tsx`
- `frontend/src/pages/PlansPage.tsx`
- `frontend/src/styles/panels.css`

- 实现三面板切换 TabBar (计划 | 评估 | 报告)
- 计划面板: 当前周期计划列表 + 进度
- 评估面板: 评级 + 完成率 + AI 评分
- 报告面板: 四个区块 (完成/偏差/诊断/视角)
- 根据当前周期类型从不同 API 获取数据
- 周视图: 每日汇总行 + 进度条 + 评级圆点
- 日视图: 时间线 + 当日计划 + 复盘详情
- 年视图: 12 月网格 + 每月评级 + 完成率
- 验证: 四种周期视图均可正常切换和显示，三面板切换正确

---

### T7: 空状态 + 错误处理 + 加载状态

**文件:** `frontend/src/components/EmptyState.tsx`

- 无数据时显示空状态页面 (引导文案 + CTA)
- API 失败时显示错误 + 重试按钮
- 加载中状态
- 验证: 清空数据库后显示空状态，有数据后正常
