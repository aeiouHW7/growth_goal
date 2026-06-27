---
version: "0.1.0"
change: "core-goal-review-system"
spec_version: "1.0"
---

# Specs: core-goal-review-system

## 1. Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum GoalStatus {
  ACTIVE
  COMPLETED
  ABANDONED
  ARCHIVED
  SUSPENDED
}

enum PlanStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  PARTIAL
  FAILED
  CANCELLED
}

enum ReviewStatus {
  INPUTTING
  ANALYZING
  COMPLETED
  SKIPPED
}

enum AnalysisType {
  DAILY
  WEEKLY
  MONTHLY
}

enum MetricType {
  NUMERIC
  DURATION
  FREQUENCY
  PERCENTAGE
  STAGE
}

model User {
  id                   String   @id @default(uuid())
  nickname             String?
  age                  Int
  occupation           String
  industry             String
  city                 String?
  weekdayAvailableHours Float
  weekdayTimeBlocks    Json?
  weekendAvailableHours Float
  weekendTimeBlocks    Json?
  goalDomains          String[]
  pastExperience       String?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  lifeGoals    LifeGoal[]
  yearlyGoals  YearlyGoal[]
  monthlyPlans MonthlyPlan[]
  dailyPlans   DailyPlan[]
  dailyReviews DailyReview[]
}

model LifeGoal {
  id          String     @id @default(uuid())
  userId      String
  title       String
  description String?
  timeHorizon String?
  status      GoalStatus @default(ACTIVE)
  sortOrder   Int?
  completedAt DateTime?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  user        User        @relation(fields: [userId], references: [id])
  yearlyGoals YearlyGoal[]
}

model YearlyGoal {
  id           String     @id @default(uuid())
  userId       String
  lifeGoalId   String?
  title        String
  description  String?
  year         Int
  metricType   MetricType
  targetValue  String
  currentValue String?
  startValue   String?
  status       GoalStatus @default(ACTIVE)
  completedAt  DateTime?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  user         User         @relation(fields: [userId], references: [id])
  lifeGoal     LifeGoal?    @relation(fields: [lifeGoalId], references: [id])
  monthlyPlans MonthlyPlan[]
}

model MonthlyPlan {
  id           String       @id @default(uuid())
  userId       String
  yearlyGoalId String?
  title        String
  description  String?
  month        Int          // 1-12
  year         Int
  metricType   MetricType
  targetValue  String
  currentValue String?
  startValue   String?
  status       GoalStatus   @default(ACTIVE)
  completedAt  DateTime?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt

  user        User        @relation(fields: [userId], references: [id])
  yearlyGoal  YearlyGoal? @relation(fields: [yearlyGoalId], references: [id])
  dailyPlans  DailyPlan[]
}

model DailyPlan {
  id            String     @id @default(uuid())
  userId        String
  monthlyPlanId String?
  title         String
  description   String?
  date          DateTime   @db(date)
  metricType    MetricType
  targetValue   String
  currentValue  String?
  status        PlanStatus @default(PENDING)
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt

  user        User         @relation(fields: [userId], references: [id])
  monthlyPlan MonthlyPlan? @relation(fields: [monthlyPlanId], references: [id])
}

model DailyReview {
  id            String       @id @default(uuid())
  userId        String
  date          DateTime     @db(date)
  rawInput      String
  completed     String?
  notCompleted  String?
  obstacles     String?
  emotionState  String?
  mindsetNote   String?
  followUpLog   Json?        // AI 追问记录 [{question, answer}]
  status        ReviewStatus @default(INPUTTING)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  user        User         @relation(fields: [userId], references: [id])
  aiAnalyses  AIAnalysis[]
}

model WeeklyReview {
  id            String       @id @default(uuid())
  userId        String
  weekStart     DateTime     @db(date)
  weekEnd       DateTime     @db(date)
  year          Int
  week          Int          // ISO week number
  rawInput      String?
  summary       String?
  missingDays   Json?        // [{date, reason}]
  status        ReviewStatus @default(INPUTTING)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  user        User         @relation(fields: [userId], references: [id])
  aiAnalyses  AIAnalysis[]
}

model MonthlyReview {
  id            String       @id @default(uuid())
  userId        String
  month         Int          // 1-12
  year          Int
  rawInput      String?
  summary       String?
  missingDays   Json?
  status        ReviewStatus @default(INPUTTING)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt

  user        User         @relation(fields: [userId], references: [id])
  aiAnalyses  AIAnalysis[]
}

model AIAnalysis {
  id               String       @id @default(uuid())
  reviewId         String
  analysisType     AnalysisType
  structuredReport Json         // { completionSummary, deviationAnalysis, executionDiagnosis, adjustmentSuggestions, externalPerspective }
  narrativeReport  String?      // Natural language version
  createdAt        DateTime     @default(now())

  reviewDaily   DailyReview?   @relation(fields: [reviewId], references: [id])
  reviewWeekly  WeeklyReview?  @relation(fields: [reviewId], references: [id])
  reviewMonthly MonthlyReview? @relation(fields: [reviewId], references: [id])
  feedbacks     AIAnalysisFeedback[]
}

model AIAnalysisFeedback {
  id               String   @id @default(uuid())
  aiAnalysisId     String
  userScore        Int      // 0-100
  isPass           Boolean  // score >= 60
  isExcellent      Boolean  // score >= 80
  excellentReason  String?
  failReason       String?
  createdAt        DateTime @default(now())

  aiAnalysis  AIAnalysis     @relation(fields: [aiAnalysisId], references: [id])
  reflections AIReflection[]
  successCases AISuccessCase[]
}

model AIReflection {
  id                   String   @id @default(uuid())
  feedbackId           String
  issueDescription     String
  improvementDirection String
  isApplied            Boolean  @default(false)
  createdAt            DateTime @default(now())

  feedback AIAnalysisFeedback @relation(fields: [feedbackId], references: [id])
}

model AISuccessCase {
  id                   String   @id @default(uuid())
  feedbackId           String
  excellentPattern     String
  replicableCondition  String?
  createdAt            DateTime @default(now())

  feedback AIAnalysisFeedback @relation(fields: [feedbackId], references: [id])
}
```

## 2. REST API Endpoints

### 2.1 User

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/user | 获取当前用户信息 |
| PUT | /api/user | 更新用户画像 |
| POST | /api/user | 初始化用户 |

### 2.2 LifeGoal

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/goals/life | 获取所有人生目标 |
| POST | /api/goals/life | 创建人生目标 |
| PUT | /api/goals/life/:id | 更新人生目标 |
| PATCH | /api/goals/life/:id/status | 变更状态（完成/放弃/激活） |

### 2.3 YearlyGoal

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/goals/yearly | 获取年度目标（支持 ?lifeGoalId= & ?year= 过滤） |
| POST | /api/goals/yearly | 创建年度目标 |
| PUT | /api/goals/yearly/:id | 更新 |
| PATCH | /api/goals/yearly/:id/status | 变更状态 |
| PATCH | /api/goals/yearly/:id/progress | 更新当前进度 currentValue |

### 2.4 MonthlyPlan

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/plans/monthly | 获取月度计划（?yearlyGoalId= & ?year=&month=） |
| POST | /api/plans/monthly | 创建 |
| PUT | /api/plans/monthly/:id | 更新 |
| PATCH | /api/plans/monthly/:id/status | 变更状态 |
| PATCH | /api/plans/monthly/:id/progress | 更新进度 |

### 2.5 DailyPlan

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/plans/daily | 获取日计划（?date= & ?monthlyPlanId=） |
| POST | /api/plans/daily | 创建 |
| PUT | /api/plans/daily/:id | 更新 |
| PATCH | /api/plans/daily/:id/status | 变更状态 |

### 2.6 DailyReview

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/reviews/daily/:date | 获取某日复盘 |
| POST | /api/reviews/daily | 创建复盘（rawInput） |
| PUT | /api/reviews/daily/:id | 更新复盘 |
| POST | /api/reviews/daily/:id/followup | 提交追问回答 |
| GET | /api/reviews/daily | 列表（?from=&to=） |

### 2.7 WeeklyReview

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/reviews/weekly/:year/:week | 获取某周复盘 |
| POST | /api/reviews/weekly | AI 创建周复盘 |
| PUT | /api/reviews/weekly/:id | 用户补充 |
| GET | /api/reviews/weekly/check | AI 检测是否需要触发周复盘 |

### 2.8 MonthlyReview

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/reviews/monthly/:year/:month | 获取某月复盘 |
| POST | /api/reviews/monthly | AI 创建月复盘 |
| PUT | /api/reviews/monthly/:id | 用户补充 |
| GET | /api/reviews/monthly/check | AI 检测是否需要触发月复盘 |

### 2.9 AIAnalysis

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/analysis/generate | AI 生成分析报告 |
| GET | /api/analysis/:id | 获取分析报告 |
| POST | /api/analysis/:id/feedback | 用户评分反馈 |

### 2.10 Progress & Dashboard

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/progress/overview | 所有目标进度概览（含完成率） |
| GET | /api/progress/goal/:goalId | 单个目标完整拆解链 |
| GET | /api/progress/calendar?year=&month= | 月度日历完成情况 |

## 3. Claude Prompt Templates

### 3.1 系统提示词 (System Prompt)

```
你是一个个人目标管理与复盘助手（growth-miniprogram）。
你通过 REST API 操作数据，API 基础路径为 {BASE_URL}/api。

【核心能力】
1. 目标管理：帮助用户设定/查看/更新目标（人生→年→月→日）
2. 每日复盘：接收用户碎碎念，结构化提取，追问缺失信息
3. AI 分析：四层分析模型（完成总结/偏差诊断/执行分析/外部视角）
4. 周/月复盘：自动聚合，搜索时事趋势

【交互规则】
- 每次复盘最多追问 2 次，第 3 次仍不足则标注 [部分信息缺失]
- AI 只能建议，不能直接修改用户计划
- 每次分析输出后，要求用户打分 (0-100)
- <60：记录反思 ≥80：记录优秀案例

【API 调用方式】
使用 HTTP 工具调用 REST API。
```

### 3.2 目标设定 Prompt

```
用户意图：设定目标
流程：
1. 询问目标层级（人生目标/年度/月度/日）
2. 引导用户按结构输入：标题 + 描述 + 度量方式
3. 检查度量完整性（NUMERIC/DURATION/FREQUENCY/PERCENTAGE/STAGE）
4. 如有上级目标，自动关联
5. 确认后调用 POST /api/goals/* 保存
```

### 3.3 每日复盘 Prompt

```
用户意图：每日复盘
流程：
1. 读取今日 DailyPlan（GET /api/plans/daily?date=today）
2. 读取用户画像（精力分配、工作时间段）
3. 接收用户自由碎碎念
4. 结构化提取：完成/未完成/问题阻碍/情绪/心态
5. 如信息不足 → 追问（最多 2 次）
6. 调用 POST /api/analysis/generate 生成四层分析
7. 调用 POST /api/analysis/:id/feedback 收集评分
```

### 3.4 周/月复盘 Prompt

```
用户意图：周/月复盘
流程：
1. 检查日期是否为周末/月末
2. 读取周期内所有 DailyReview
3. 如有缺失天数 → 询问原因
4. 聚合数据 → 搜索外部时事趋势
5. 生成完整周期分析报告
6. 用户补充细节
7. 用户评分
```

## 4. Validation Rules

| Field | Rule |
|-------|------|
| userScore | 0-100, integer |
| followUpLog | Max 2 entries per review |
| metricType targetValue | Must match metricType format |
| weeklyReview.week | ISO 8601 week number (1-53) |
| monthlyReview.month | 1-12 |
| dailyPlan.date | Cannot be in the future when status COMPLETED |
| goalStatus transitions | See state machines in PRD |
