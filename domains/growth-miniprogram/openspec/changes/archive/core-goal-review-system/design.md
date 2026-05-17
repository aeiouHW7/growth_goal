---
version: "0.1.0"
change: "core-goal-review-system"
design_status: draft
---

# Design: core-goal-review-system

## 1. Directory Structure

```
growth-miniprogram/
├── docker-compose.yml          # PostgreSQL 15-alpine (port 5434)
├── domain.yaml                 # Project config
├── CLAUDE.md                   # AI collaboration instructions
├── backend/
│   ├── .env                    # DATABASE_URL, PORT
│   ├── package.json
│   ├── tsconfig.json
│   ├── prisma/
│   │   ├── schema.prisma       # 12 models
│   │   └── seed.ts             # Dev seed data
│   └── src/
│       ├── index.ts            # Entry: Express app bootstrap
│       ├── config/
│       │   └── index.ts        # Env config loader
│       ├── routes/
│       │   ├── user.ts
│       │   ├── goals.ts        # LifeGoal + YearlyGoal
│       │   ├── plans.ts        # MonthlyPlan + DailyPlan
│       │   ├── reviews.ts      # Daily/Weekly/Monthly review
│       │   ├── analysis.ts     # AIAnalysis + feedback
│       │   └── progress.ts     # Dashboard/progress overview
│       ├── controllers/
│       │   ├── user.controller.ts
│       │   ├── goal.controller.ts
│       │   ├── plan.controller.ts
│       │   ├── review.controller.ts
│       │   ├── analysis.controller.ts
│       │   └── progress.controller.ts
│       ├── services/
│       │   ├── goal.service.ts
│       │   ├── plan.service.ts
│       │   ├── review.service.ts
│       │   ├── analysis.service.ts
│       │   └── progress.service.ts
│       ├── middleware/
│       │   ├── error-handler.ts
│       │   └── validate.ts
│       ├── prompts/
│       │   ├── system.prompt.ts
│       │   ├── goal-setup.prompt.ts
│       │   ├── daily-review.prompt.ts
│       │   └── weekly-review.prompt.ts
│       ├── utils/
│       │   ├── metric-validator.ts
│       │   └── date-utils.ts
│       └── types/
│           └── index.ts
├── frontend/                   # Phase 2: Taro web dashboard
└── docs/
    └── wiki/
        ├── index.md
        └── patterns.md
```

## 2. Module Architecture

```
┌─────────────────────────────────────────────────┐
│                  Claude 终端                      │
│  (System Prompt + HTTP Tool → REST API)          │
└──────────────────┬──────────────────────────────┘
                   │ HTTP
┌──────────────────▼──────────────────────────────┐
│              Express Router                       │
│  ┌────────┬────────┬────────┬────────┬────────┐  │
│  │ Goals  │ Plans  │Reviews │Analys. │Progress│  │
│  └───┬────┴───┬────┴───┬────┴───┬────┴───┬────┘  │
│      │        │        │        │        │        │
│  ┌───▼────────▼────────▼────────▼────────▼────┐  │
│  │            Services Layer                    │  │
│  │  (Business logic, validation, composition)   │  │
│  └───┬────────┬────────┬────────┬────────┬────┘  │
│      │        │        │        │        │        │
│  ┌───▼────────▼────────▼────────▼────────▼────┐  │
│  │            Prisma Client                    │  │
│  │         (PostgreSQL via Prisma)             │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

## 3. Data Flow: 每日复盘

```
用户: "今天复盘"
  │
  ├─→ GET /api/plans/daily?date=today          ← 读取今日计划
  ├─→ GET /api/user                             ← 读取用户画像
  ├─→ 用户发送碎碎念文本
  │
  ├─→ POST /api/reviews/daily { rawInput }      ← 保存原始复盘
  │
  ├─→ (AI 判断信息是否充分)
  │    ├─ 不足 → 追问（最多 2 次）
  │    │         └→ POST /api/reviews/daily/:id/followup
  │    └─ 充分 → 继续
  │
  ├─→ POST /api/analysis/generate               ← AI 生成四层分析
  │    ├─ structuredReport: {
  │    │     completionSummary,
  │    │     deviationAnalysis,
  │    │     executionDiagnosis,
  │    │     adjustmentSuggestions,
  │    │     externalPerspective
  │    │   }
  │    └─ narrativeReport: "Markdown 可读报告"
  │
  ├─→ 用户打分 POST /api/analysis/:id/feedback
  │    ├─ score < 60 → POST AIReflection
  │    └─ score ≥ 80 → POST AISuccessCase
  │
  └─→ 完成
```

## 4. Error Handling

统一错误响应格式：

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "用户年龄为必填项",
    "details": [{ "field": "age", "reason": "required" }]
  }
}
```

错误码表：

| HTTP | Code | Description |
|------|------|-------------|
| 400 | VALIDATION_ERROR | 输入校验失败 |
| 404 | NOT_FOUND | 资源不存在 |
| 409 | STATUS_TRANSITION_INVALID | 状态转移不允许 |
| 500 | INTERNAL_ERROR | 服务器内部错误 |

## 5. Metric Validation

```typescript
// 度量类型验证规则
const metricValidators: Record<MetricType, (value: string) => boolean> = {
  NUMERIC: v => /^\d+(\.\d+)?(\s+\S+)?$/.test(v),        // "50000 元"
  DURATION: v => /^\d+min$/.test(v),                       // "120min"
  FREQUENCY: v => /^\d+\/\d+(\s+\S+)?$/.test(v),          // "2/4 次"
  PERCENTAGE: v => /^\d+%$/.test(v),                       // "65%"
  STAGE: v => /.+→.+/.test(v),                              // "A2→B1"
}
```

## 6. State Machine Overview

```
LifeGoal/YearlyGoal:
  ACTIVE → COMPLETED (用户标记完成)
  ACTIVE → ABANDONED (用户放弃)
  ACTIVE → ARCHIVED (长期无复盘，系统自动)
  COMPLETED/ABANDONED → ACTIVE (重新激活)

DailyPlan:
  PENDING → IN_PROGRESS (开始执行)
  IN_PROGRESS → COMPLETED (完成)
  IN_PROGRESS → PARTIAL (部分完成)
  IN_PROGRESS → FAILED (未完成)
  PENDING → CANCELLED (计划调整)

DailyReview:
  INPUTTING → ANALYZING (提交碎碎念)
  ANALYZING → INPUTTING (AI 追问)
  ANALYZING → COMPLETED (信息充分，完成)
  COMPLETED → INPUTTING (用户重开)
```

## 7. Prompt System Design

Prompts 按职责分三层：

1. **System Prompt**: 基础角色定义 + 核心规则（系统启动时加载）
2. **Flow Prompt**: 各交互流程的步骤引导（按需加载）
3. **Analysis Prompt**: AI 分析的具体要求（分析时加载）

Prompt 文件导出纯文本模板,带`{{placeholder}}`插值：

```typescript
// src/prompts/daily-review.prompt.ts
export const DAILY_REVIEW_PROMPT = `
## 每日复盘流程

今日计划：
{{dailyPlans}}

用户画像：
{{userProfile}}

用户输入：
{{rawInput}}

请按以下步骤：
1. 从用户输入中提取：完成了什么、没完成什么、遇到了什么阻碍、情绪状态
2. 检查信息完整性，如有缺失最多追问 2 次
3. 生成四层分析报告
4. 要求用户评分 (0-100)
`;
```
