# Web Dashboard 技术设计

## 目录结构

```
frontend/src/
├── api.ts                    # API 客户端 + 类型定义 (保留)
├── main.tsx                  # 入口 (保留)
├── App.tsx                   # 主应用: NavBar + 页面切换
├── components/
│   ├── Card.tsx              # 通用卡片
│   ├── ProgressBar.tsx       # 进度条 (保留)
│   ├── StatusBadge.tsx       # 状态标签 (保留)
│   ├── GoalTree.tsx          # 目标层级树组件
│   ├── PeriodSelector.tsx    # 年/月/周/日 切换器
│   ├── CalendarGrid.tsx      # 月日历网格 (颜色编码)
│   ├── YearGrid.tsx          # 年度12月网格
│   ├── WeekTimeline.tsx      # 周视图时间线
│   ├── DayTimeline.tsx       # 日视图时间线
│   ├── PlanPanel.tsx         # 计划面板
│   ├── EvalPanel.tsx         # 评估面板
│   ├── ReportPanel.tsx       # 报告面板
│   ├── UserPopover.tsx       # 右上角用户信息 hover
│   └── EmptyState.tsx        # 空状态
├── pages/
│   ├── OverviewPage.tsx      # 总览页
│   ├── GoalsPage.tsx         # 目标链页
│   └── PlansPage.tsx         # 计划页
└── styles/
    ├── theme.css             # CSS 变量 (浅色主题)
    ├── app.css               # App 布局样式
    ├── goal-tree.css         # 目标树样式
    ├── calendar.css          # 日历网格样式
    └── panels.css            # 三面板样式
```

## 组件树

```
App
├── NavBar (总览 | 目标链 | 计划)
├── OverviewPage (active 时渲染)
│   ├── UserPopover (右上角 hover)
│   ├── Card → LifeGoal
│   ├── Card → ActiveYearlyGoals[]
│   │   └── GoalItem (颜色圆点 + 标题 + 进度)
│   ├── Card → AISuggestions[]
│   │   └── SuggestionItem (彩色竖线)
│   └── Card → MonthlyProgress[]
│       └── GoalProgress (名称 + 进度值 + 进度条)
├── GoalsPage (active 时渲染)
│   ├── FilterBar (全部/进行中/已完成)
│   └── GoalTree
│       └── GoalNode (递归)
│           ├── LifeGoal (depth=0)
│           ├── YearlyGoal (depth=1)
│           └── MonthlyPlan (depth=2)
└── PlansPage (active 时渲染)
    ├── PeriodSelector
    │   ├── YearPicker (select)
    │   ├── MonthPicker (select)
    │   └── DimTabs (年 | 月 | 周 | 日)
    └── PeriodView (双栏)
        ├── LeftColumn
        │   ├── [日] DayTimeline
        │   ├── [周] WeekTimeline
        │   ├── [月] CalendarGrid
        │   └── [年] YearGrid
        └── RightColumn
            ├── TabBar (计划 | 评估 | 报告)
            ├── PlanPanel
            ├── EvalPanel
            └── ReportPanel
```

## 浅色主题 CSS 变量

```css
:root {
  --bg: #f5f5f7;
  --bg-card: #ffffff;
  --bg-hover: #f9fafb;
  --bg-accent: #eef2ff;
  --text: #111827;
  --text-dim: #6b7280;
  --text-muted: #9ca3af;
  --border: #e5e7eb;
  --accent: #6366f1;
  --success: #22c55e;
  --warning: #eab308;
  --error: #ef4444;
  --grayed: #9ca3af;
  --radius: 12px;
}
```

## 颜色编码规则

| 状态 | 颜色 | 条件 |
|------|------|------|
| 优秀 | `--success` (#22c55e) | analysisScore >= 80 |
| 良好 | `--warning` (#eab308) | analysisScore >= 60 或 hasReview |
| 差 | `--error` (#ef4444) | analysisScore < 60 |
| 缺卡 | `--grayed` (#9ca3af) | hasReview && no analysisScore |
| 无数据 | 透明 | 无复盘无计划 |
| 今日 | 蓝色边框 (#6366f1) | 当天日期 |

## API 数据对接

### 总览页
- 用户信息: `GET /api/user/`
- 人生目标: `GET /api/goals/life`
- 年度目标: `GET /api/goals/yearly?year=current`
- AI 建议: `GET /api/analysis/suggestions` (聚合日/周/月复盘分析)
- 当月进度: `GET /api/progress/overview` + `GET /api/plans/monthly?year=&month=`

### 日视图
- 计划: `GET /api/plans/daily?date=YYYY-MM-DD`
- 复盘+分析: `GET /api/reviews/daily/YYYY-MM-DD`

### 周视图
- 周检查: `GET /api/reviews/weekly/check?year=&week=`
- 周详情: `GET /api/reviews/weekly/{year}/{week}`
- 日计划(本周): 客户端计算日期范围后调用 daily

### 月视图
- 日历: `GET /api/progress/calendar?year=&month=`
- 月度计划: `GET /api/plans/monthly?year=&month=`
- 月复盘: `GET /api/reviews/monthly/{year}/{month}`

### 年视图
- 年度目标: `GET /api/goals/yearly?year=`
- 月度计划(全年): `GET /api/plans/monthly?year=` (不加 month 参数)

## 状态管理

每个页面独立管理其数据，用 `useState` + `useEffect` 在页面切换时 fetch。

```typescript
const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'plans'>('overview');
// 每个页面根据自身需求管理数据
```

## 错误处理

- API 失败: 面板显示 "数据加载失败" + 重试按钮
- 空数据: 面板显示空状态，引导用户使用 CLI
- 边界情况: 未来日期显示 "暂无数据" 而不是错误
