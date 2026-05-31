# Web Dashboard 完整重做

## 问题陈述

当前前端实现与原型设计存在根本性差异。原型设计的核心是一个以**周期（年/月/周/日）**为组织线索的看板系统，每个周期视图包含日历/内容区 + 三面板（计划/评估/报告）。而当前实现是四个独立页面（总览/日历/目标链/复盘），缺少了周期切换、面板系统和合理的布局。

## 方案概述

按原型设计重做整个前端，改为：
1. **三标签导航**：总览 | 目标链 | 计划
2. **浅色主题**
3. **总览页**：右上角用户信息（hover 展示）、人生总目标、进行中的年度目标、AI 改进建议、当月目标完成进度
4. **目标链页**：目标层级树，可筛选全部/进行中/已完成，已完成置灰
5. **计划页**：年/月选择器 + 年/月/周/日维度切换 + 左栏日历/内容 + 右栏三面板（计划/评估/报告）
6. **空状态引导**

## 架构决策

| 决策 | 选项 | 选择理由 |
|------|------|---------|
| 主题 | 浅色 | 用户指定 |
| 路由方案 | useState 页面切换 | 页面少，无需 router |
| 状态管理 | React useState/useEffect | 不需要全局状态 |
| 样式方案 | CSS Modules | 隔离组件样式 |
| HTTP 客户端 | fetch + api.ts | 已有，足够用 |
| 图表 | 无外部依赖 | 用纯 CSS 实现进度条和统计 |
| 周期视图 | 4 个独立组件 | 按年/月/周/日切换渲染 |

## 页面结构

```
App
├── NavBar (总览 | 目标链 | 计划)
├── OverviewPage
│   ├── UserInfo (右上角 hover)
│   ├── LifeGoalCard
│   ├── ActiveYearlyGoals (不含已完成)
│   ├── AISuggestions
│   └── MonthlyProgress (当月每个目标进度)
├── GoalsPage
│   ├── FilterBar (全部/进行中/已完成)
│   └── GoalTree (递归)
│       ├── LifeGoal
│       ├── YearlyGoal
│       └── MonthlyPlan
└── PlansPage
    ├── PeriodSelector (年/月选择器 + 年/月/周/日维度切换)
    └── PeriodContent (双栏布局)
        ├── Left Column
        │   ├── 日: DayTimeline
        │   ├── 周: WeekTimeline
        │   ├── 月: CalendarGrid
        │   └── 年: YearGrid
        └── Right Column (三面板)
            ├── PlanPanel
            ├── EvalPanel
            └── ReportPanel
```

## 数据流

```
CLI → API → PostgreSQL → api.ts (前端) → PeriodContent 组件
                                            ├── Left: Calendar/View
                                            └── Right: 计划/评估/报告 面板
```

每个周期视图从 API 获取：
- 日: `/api/plans/daily?date=` + `/api/reviews/daily/{date}`
- 周: `/api/reviews/weekly/check` + plans filtered by date range
- 月: `/api/progress/calendar?year=&month=` + `/api/plans/monthly`
- 年: `/api/goals/yearly` + aggregated calendar data

## 风险与缓解

| 风险 | 缓解措施 |
|------|---------|
| 周/年视图 API 数据不足 | 前端做客户端聚合，从现有数据推算 |
| 大量目标渲染性能 | 虚拟化列表，懒加载目标树深层节点 |
