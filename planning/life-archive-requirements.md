# LifeArchive + AI 目标拆解 — 需求说明书 v0.1

> 状态：定稿 | 作者：ACE 协作 | 日期：2026-06-14

---

## 1. 概述

### 1.1 本次上线范围

```
模块一：人生档案 LifeArchive（长期记忆层）
├── 第一层 恒定核心    →  MBTI / 大五人格 / 盖洛普
├── 第二层 能力与资源   →  技能 / 时间 / 能量 / 财务 / 支持系统 / 健康
├── 第三层 历史行为     →  成功规律 / 失败模式 / 情绪生产力 / 决策失误
└── 第四层 未来蓝图     →  多尺度愿景 / 目标来源 / 结果区间 / 榜样反例

模块二：复盘 AI 分析流程改造
├── 分析前：加载 LifeArchive 摘要 → 注入 Prompt（含人格特征）
├── 分析后：回写 layerBehavior（自动）
│                        + layerResources 能量/健康（用户确认）
└── 摘要机制：LifeArchive 更新后自动生成摘要

模块三：AI 辅助目标拆解
└── 第四层愿景 → AI 建议年度目标 → 用户确认
                → AI 建议月度计划 → 用户确认
                → AI 建议日计划 → 用户确认

模块四：基础改造
├── User 表字段合并到 LifeArchive
└── AI 提示词工程（第一层人格特征 + summary 融入分析 Prompt）
```

### 1.2 产品定位

LifeArchive 是「AI 人生教练」系统的**长期记忆层**。它记录用户不变的底层特质、当前的能力资源现状、历史行为规律和未来愿景。AI 每次分析前加载该档案的摘要，确保建议不偏离用户真实情况。

AI 目标拆解是**规划引擎**，基于 LifeArchive 的用户画像和愿景，自动生成可执行的年度/月度/日计划，用户确认后写入现有目标体系。

### 1.3 核心原则

1. **分层存储**：数据按稳定程度分为四层，每层写入频率不同
2. **写读分离**：部分数据仅用户可写、AI 只读；部分数据 AI 可辅助分析和写入
3. **渐进积累**：首次录入基线，后续持续补充修正
4. **版本保留**：数据库保留上一版本内容，应用只使用最新值

---

### 1.4 功能架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     Web 前端（React）                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐ │
│  │ 总览页    │ │ 人生档案  │ │ 目标拆解  │ │ 复盘展示       │ │
│  │ LifeArc   │ │ 四层表单  │ │ AI 建议   │ │ 分析报告       │ │
│  │ 卡片展示  │ │ MBTI/能力 │ │ 确认/修改 │ │ StructuredRpt  │ │
│  │           │ │ 健康/未来 │ │          │ │                │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘ │
└─────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Backend API（Express）                      │
│  ┌────────────┐ ┌────────────┐ ┌──────────┐ ┌────────────┐ │
│  │ LifeArchive│ │ 复盘服务    │ │ 目标服务  │ │ 分析服务    │ │
│  │ CRUD       │ │ 改造版     │ │ AI 拆解   │ │ 行为提取    │ │
│  │ 摘要生成   │ │ 含LifeArc  │ │ 建议/确认 │ │ 摘要刷新    │ │
│  └────────────┘ └────────────┘ └──────────┘ └────────────┘ │
└─────────────────────────────────────────────────────────────┘
         │              │              │              │
         ▼              ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据持久层                               │
│  ┌──────────────────┐  ┌──────────────────────────────────┐ │
│  │  LifeArchive 表   │  │  现有业务表                      │ │
│  │  ┌──────────────┐│  │  User / LifeGoal / YearlyGoal   │ │
│  │  │ layerCore    ││  │  MonthlyPlan / DailyPlan         │ │
│  │  │ layerResourc ││  │  DailyReview / WeeklyReview     │ │
│  │  │ layerBehavio ││  │  AIAnalysis / BehaviorPattern   │ │
│  │  │ layerFuture  ││  │  CognitiveBiasLog / Capability  │ │
│  │  │ summary      ││  └──────────────────────────────────┘ │
│  │  └──────────────┘│                                        │
│  └──────────────────┘                                        │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                     AI 分析引擎                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐ │
│  │ 复盘分析  │ │ 目标拆解  │ │ 行为提取  │ │ 摘要生成       │ │
│  │ (Bridge) │ │ (API)    │ │ (自动)   │ │ (自动触发)     │ │
│  │ (CLI)    │ │          │ │          │ │                │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 1.5 系统架构图

```
┌──────────────┐    ┌──────────────────┐    ┌──────────────────┐
│  飞书 IM      │    │  Web 浏览器       │    │  终端             │
│  (消息入口)   │    │  localhost:3002  │    │  npx tsx cli     │
└──────┬───────┘    └────────┬─────────┘    └────────┬─────────┘
       │                     │                       │
       ▼                     │                       │
┌──────────────┐             │                       │
│  Bridge      │             │                       │
│ auto-proces  │             │                       │
│ sor.cjs      │             │                       │
│  ─ 监听消息  │             │                       │
│  ─ 调用API   │             │                       │
│  ─ 调用Claude│             │                       │
│  ─ 回写结果  │             │                       │
└──────┬───────┘             │                       │
       │                     │                       │
       └──────────┬──────────┘───────────────────────┘
                  │
                  ▼
         ┌────────────────────────────────────┐
         │     Express API (localhost:3001)    │
         │                                    │
         │  ┌──────────┐  ┌────────────────┐  │
         │  │ 现有路由  │  │  新增路由       │  │
         │  │ /user    │  │  /life-archive  │  │
         │  │ /goals   │  │  /goals/ai-sug  │  │
         │  │ /plans   │  │  /plans/ai-sug  │  │
         │  │ /reviews │  │  /life-archive  │  │
         │  │ /analysis│  │  /summary       │  │
         │  │ /progress│  └────────────────┘  │
         │  └──────────┘                      │
         └────────────────┬───────────────────┘
                          │
              ┌───────────┼───────────┐
              │           │           │
              ▼           ▼           ▼
      ┌────────────┐ ┌────────┐ ┌──────────┐
      │ PostgreSQL │ │ Claude │ │ Prisma   │
      │ (5434)     │ │  CLI   │ │ ORM      │
      │            │ │ (AI)   │ │          │
      │ LifeArchiv │ │ 复盘   │ │ 数据映射 │
      │ User       │ │ 拆解   │ │          │
      │ Goals      │ │ 摘要   │ │          │
      │ Plans      │ │ 行为   │ │          │
      │ Reviews    │ │        │ │          │
      └────────────┘ └────────┘ └──────────┘
```

### 1.6 用户旅程图

```
┌──────────────────────────────────────────────────────────────────────┐
│                        首次使用（Onboarding）                          │
│                                                                      │
│  Web 录入第一层    Web 录入第二层   AI 写入能量/健康    Web 录入第四层 │
│  MBTI/大五/盖洛普   技能/时间/财务   (复盘后提议           10个愿景问题  │
│                     支持系统/健康     →用户确认)                        │
│       │                 │                    │                 │      │
│       └─────────────────┴────────────────────┴─────────────────┘      │
│                                  │                                    │
│                                  ▼                                    │
│                    AI 读取愿景 + 能力 + 人格                           │
│                           │                                           │
│                           ▼                                           │
│                ┌─────────────────────┐                               │
│                │  AI 建议年度目标      │  ← 年度目标建议页面              │
│                │  用户确认/修改        │                               │
│                └──────────┬──────────┘                               │
│                           │                                           │
│                           ▼                                           │
│                ┌─────────────────────┐                               │
│                │  AI 建议月度计划      │  ← 月度计划建议页面              │
│                │  用户确认/修改        │                               │
│                └─────────────────────┘                               │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                        每日使用（Daily）                               │
│                                                                      │
│   复盘输入          AI 分析           查看报告        次日计划         │
│  (Bridge/CLI)    (含 LifeArc        (分析卡片        AI 建议          │
│                   摘要上下文)         或Web报告)      日计划           │
│       │                │                │             │              │
│       ▼                ▼                │             │              │
│ ┌────────────┐   ┌──────────┐           │             │              │
│ │ 信号评分+追问 │  │structured │           │             │              │
│ │ 评分<5 追问  │  │Report    │           │             │              │
│ │ 评分≥5 分析  │  └────┬─────┘           │             │              │
│ └────────────┘        │                 │             │              │
│                       ▼                 │             │              │
│                ┌──────────────┐         │             │              │
│                │ 回写第三层    │         │             │              │
│                │ (自动)       │         │             │              │
│                │ 提议能量/健康 │────────┼──→ 用户确认 ──┤              │
│                │ 刷新摘要      │         │             │              │
│                └──────────────┘         │             │              │
│                                          ▼             ▼              │
│                                    ┌──────────────────────────┐      │
│                                    │    一天结束 → 下一轮      │      │
│                                    └──────────────────────────┘      │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                        周期性使用（Weekly/Monthly）                   │
│                                                                      │
│  周复盘/月复盘       偏差分析       目标调整         健康/能量更新     │
│    (自动聚合)       (AI检测偏差)   (调整目标        (复盘分析后       │
│                      建议修正)     或拆解新目标)     AI 提议)         │
│       │                │             │               │              │
│       ▼                ▼             ▼               ▼              │
│ ┌────────────┐   ┌──────────┐  ┌──────────┐  ┌──────────────┐     │
│ │ 聚合本周数据 │  │ 对比目标   │  │ Web修改   │  │ AI检测趋势    │     │
│ │ 生成草案    │  │ 检查进度   │  │ 或重新拆解 │  │ 用户确认      │     │
│ │ 用户确认    │  │ 提出修正   │  │          │  │ 写入LifeArc   │     │
│ └────────────┘   └──────────┘  └──────────┘  └──────────────┘     │
└──────────────────────────────────────────────────────────────────────┘
```

---

## 2. 数据架构

### 2.1 总体结构

```json
{
  "layerCore":       Json,    // 第一层：恒定核心（几乎不变）
  "layerResources":  Json,    // 第二层：能力与资源（定期更新）
  "layerBehavior":   Json,    // 第三层：历史行为数据（持续积累，AI 自动提取）
  "layerFuture":     Json,    // 第四层：未来蓝图（目标调整时更新）
  "summary":         String   // AI 摘要（每次对话前加载）
}
```

### 2.2 第一层：恒定核心

**写入频率**：数月～数年一次 | **录入方式**：Web | **AI 权限**：只读分析，不写入

#### 字段结构

```typescript
layerCore: {
  personality: {
    mbti: string | null,          // 如 "INTJ"
    bigFive: {
      openness: number | null,
      conscientiousness: number | null,
      extraversion: number | null,
      agreeableness: number | null,
      neuroticism: number | null,
    } | null,
    gallup: string[] | null,      // 盖洛普优势前5
  }
}
```

#### 录入规则

| 字段 | 必填 | 校验 |
|------|------|------|
| mbti | 否 | 必须是 4 字母 MBTI 类型 |
| bigFive 各维度 | 否 | 取值范围 1-100 |
| gallup | 否 | 最多 5 项 |

#### AI 交互规则

- AI 读取 `layerCore.personality` 作为分析上下文
- AI 在复盘分析和目标拆解时，根据人格特征提供个性化建议
- AI **不允许**修改 `layerCore` 数据

---

### 2.3 第二层：能力与资源现状

**写入频率**：每周～每月 | **AI 权限**：模块级区分

#### 模块 2.1：核心能力（专业技能）

**录入方式**：Web | **AI 权限**：只读 | **数量限制**：不限

User 表中的 `occupation`、`industry` 合并到此模块。

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| skillName | string | 专业领域名称 | "AI 产品经理" |
| level | string | 自评等级 | "高级" |
| yearsOfExperience | number | 从业年限 | 5 |
| description | string | 具体能力描述 | "NLP 产品设计、知识库搭建、AI Agent 落地" |

#### 模块 2.2：时间资源

**录入方式**：Web 直接录入 | **AI 权限**：可分析建议，不允许直接修改

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| weekdayAvailableHours | number | 工作日可支配总小时数 | 3.7 |
| weekdayTimeBlocks | string | 工作日时段明细 | "早间 06:30-08:40, 晚间 21:00-22:30" |
| weekendAvailableHours | number | 周末可支配总小时数 | 6 |
| weekendTimeBlocks | string | 周末时段明细 | "上午 09:00-12:00" |
| fixedExpenditure | string | 固定时间支出描述 | "工作9h，通勤1.5h，睡眠7h" |

#### 模块 2.3：能量精力

**录入方式**：AI 复盘后分析 → 用户确认 → 写入 | **AI 权限**：根据复盘数据写回

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| energyDescription | string | 精力模式描述 | "晨型人，上午效率最高，晚间创造力较强" |
| previousEnergyDescription | string | 上一版精力描述（版本保留） | "下午效率最高" |
| lastAssessedAt | string | 最近评估日期 | "2026-06-14" |

**AI 交互规则**：
- AI 在每次复盘分析时，根据复盘中记录的精力分布、任务完成时段等综合推断
- AI 发现有显著变化时，生成提议文案，用户确认后写入
- 写入时 `previousEnergyDescription` 保存当前值，主字段更新为新值
- 用户不可直接 Web 编辑

#### 模块 2.4：财务状况

**录入方式**：Web | **AI 权限**：只读

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| safetyNet | string | 财务安全垫描述 | "当前储蓄可支撑 12 个月无收入生活" |
| incomeStructure | string | 收入结构描述 | "主业薪资 80%，副业 20%，波动中等" |
| investableFunds | string | 每月可投入自我发展的资金 | "约 3000 元/月" |
| financialStage | string | 财务阶段 | "积累期：有一定选择空间，但尚未自由" |

#### 模块 2.5：支持系统

**录入方式**：Web | **AI 权限**：只读

| 字段 | 类型 | 说明 | 示例 |
|------|------|------|------|
| guidance | string | 导师/前辈资源 | "有 2 位前技术总监可提供职业建议" |
| collaboration | string | 协作搭档 | "有 1 位合伙人做 AI 视频项目" |
| emotionalSupport | string | 情感支持 | "伴侣、2 位好友可深度交流" |
| socialNetwork | string | 社交广度 | "主要在 AI/互联网圈子，正在拓展商业人脉" |

#### 模块 2.6：健康基础

**录入方式**：Web + AI 复盘后写回 | **AI 权限**：根据复盘数据写回

| 字段 | 类型 | 说明 | 录入方 |
|------|------|------|--------|
| physicalHealth | string | 身体健康状况 | Web 用户 + AI |
| mentalState | string | 心理状态 | Web 用户 + AI |
| exerciseRoutine | string | 运动与精力管理习惯 | Web 用户 + AI |
| addictiveHabits | string | 消耗性习惯 | Web 用户 + AI |
| previousPhysicalHealth | string | 上一版（版本保留） | AI 写入时自动保存 |
| previousMentalState | string | 上一版（版本保留） | AI 写入时自动保存 |
| previousExerciseRoutine | string | 上一版（版本保留） | AI 写入时自动保存 |

**AI 交互规则**：
- AI **每次复盘分析后**，根据 `energyRate`、运动记录、情绪状态等数据更新健康趋势
- 有显著变化时，生成提议文案，用户确认后写入
- 写入时 `previous_*` 保存当前值再更新主字段

---

### 2.4 第三层：历史行为数据

**写入频率**：每次复盘后 AI 自动提取 | **录入方式**：AI 自动（无需用户确认）

User 表中的 `pastExperience` 合并到此层，作为基线数据。

#### 字段结构

```typescript
layerBehavior: {
  successPatterns: Array<{
    description: string,
    duration: string,
    conditions: string[],
    examples: string[],
    firstDetectedAt: string,
    lastUpdatedAt: string,
  }>,

  failurePatterns: Array<{
    goalDescription: string,
    dropOffPoint: string,
    triggerThought: string,
    frequency: number,
    relatedSkills: string[],
    firstDetectedAt: string,
    lastUpdatedAt: string,
  }>,

  productivityPatterns: {
    stressEfficiency: string,
    relaxedEfficiency: string,
    procrastinationCauses: string[],
    lastUpdatedAt: string,
  },

  decisionMistakes: Array<{
    title: string,
    context: string,
    reason: string,
    reflection: string,
    impact: string,
    detectedAt: string,
  }>,
}
```

#### AI 提取规则

| 模块 | 数据来源 | 提取逻辑 |
|------|---------|---------|
| 成功规律 | 长期 `COMPLETED` 的目标/习惯 | 追踪连续完成超过 N 周期的计划，分析共同环境条件 |
| 失败模式 | `FAILED`/`ABANDONED` 的计划 + 复盘诊断 | 检测状态变为失败前的复盘记录，提取根因 |
| 情绪生产力 | `energyRate` + `emotionState` + 完成率 | 关联分析不同情绪/精力状态下的产出差异 |
| 决策失误 | 复盘中的反思/后悔表述 | AI 从复盘文本中识别关键决策回顾 |

第三层所有数据 **不设 Web 编辑入口**，完全由 AI 自动积累和管理。

---

### 2.5 第四层：未来蓝图

**录入方式**：Web | **AI 权限**：只读 | **更新频率**：每次调整目标时更新

User 表中的 `goalDomains` 合并到此层。

#### 字段结构

```typescript
layerFuture: {
  vision: {
    years10: string,
    years3: string,
    year1: string,
  },

  goalSource: {
    motivation: string,
    whyNow: string,
  },

  outcomeRange: {
    description: string,
    minimum: string,
    ideal: string,
  },

  roleModels: {
    positive: string,
    negative: string,
  },
}
```

#### 录入规则

| 字段 | 必填 | 录入方式 |
|------|------|---------|
| vision.years10 | 是 | Web 文本框 |
| vision.years3 | 是 | Web 文本框 |
| vision.year1 | 是 | Web 文本框 |
| goalSource.motivation | 是 | Web 文本框 |
| goalSource.whyNow | 是 | Web 文本框 |
| outcomeRange.minimum | 是 | Web 文本框 |
| outcomeRange.ideal | 是 | Web 文本框 |
| outcomeRange.description | 否 | Web 文本框 |
| roleModels.positive | 是 | Web 文本框 |
| roleModels.negative | 是 | Web 文本框 |

---

### 2.6 AI 摘要机制

**作用**：每次对话前快速加载的浓缩版 LifeArchive，避免传输完整四层 JSON。

#### 生成规则

| 触发条件 | 动作 |
|---------|------|
| 任一层次数据更新（Web 或 AI） | 后端自动触发摘要重生成 |
| 首次创建 LifeArchive | 立即生成 |
| 用户手动触发 | 提供重生成按钮 |

#### 摘要内容

摘要由 AI 将四层数据压缩为一段 300-500 字的文本，包含：

- 人格画像摘要（从 layerCore 提炼）
- 当前能力与资源概览（从 layerResources 提炼）
- 关键行为模式（从 layerBehavior 提炼高频模式）
- 当前目标与愿景（从 layerFuture + 现有 YearlyGoal 提炼）

#### 存储

摘要存储在 LifeArchive 表的 `summary` 字段，随各层更新自动刷新。

---

## 3. AI 提示词工程

### 3.1 改造范围

现有的 AI 分析 Prompt 需要融入 `layerCore.personality` 上下文，使 AI 能根据人格特征提供个性化分析。

**涉及的文件：**

| 文件 | 改造内容 |
|------|---------|
| `bridge/auto-processor.cjs` | 在 Prompt 中注入 personality 信息 |
| `backend/src/prompts/daily-review.prompt.ts` | 增加人格特征分析维度 |
| `backend/src/prompts/weekly-review.prompt.ts` | 同上 |
| `backend/src/prompts/goal-setup.prompt.ts` | 涉及目标拆解时引入人格背景 |

### 3.2 注入方式

在构建 Prompt 时，于系统指令段加入两段上下文：

```
【人生档案摘要】
{LifeArchive.summary}

【用户人格特征（仅供参考，不作诊断依据）】
- MBTI: {mbti}
- 大五人格：开放性 {openness}/100、尽责性 {conscientiousness}/100、
           外向性 {extraversion}/100、宜人性 {agreeableness}/100、
           神经质 {neuroticism}/100
- 盖洛普优势：{gallup}
```

**`summary` 优先于完整四层数据** — 每次复盘分析时只加载 `summary` 字段（浓缩的 300-500 字文本），除非特定场景需要完整的人格特征详情。`layerCore.personality` 仅在需要人格分析的场景额外补充。

AI 应在分析时根据 `summary` 中的背景信息和人格特征调整建议的沟通风格和策略方向。

---

## 4. AI 目标拆解

### 4.1 功能概述

基于 LifeArchive 的数据（特别是第四层愿景），AI 辅助用户逐层拆解目标：

```
第四层愿景（未来蓝图）
    │ AI 读取愿景 + 能力评估 + 行为模式 + 人格特征
    ▼
年度目标（建议）←─ LifeGoal / YearlyGoal 表
    │ 用户确认 / 修改
    ▼
月度计划（建议）←─ MonthlyPlan 表
    │ 用户确认 / 修改
    ▼
日计划（建议）  ←─ DailyPlan 表
    │ 用户确认 / 修改
    ▼
用户执行 → 每日复盘 → AI 分析 → 偏差修正 → 下一轮调整
```

### 4.2 拆解规则

#### 层级一：愿景 → 年度目标

**触发条件**：
- 用户完成第四层录入后
- 用户主动点击"AI 建议年度目标"
- 每年年初 / 目标调整时

**输入**：
- `layerFuture.vision`（10年/3年/1年愿景）
- `layerResources`（能力、时间、财务、健康约束）
- `layerBehavior`（历史成功/失败模式）
- `layerCore`（人格特质）

**输出**：
- 建议 1-3 个年度目标（写入 `YearlyGoal` 表草案，状态 `PENDING`）
- 每个目标包含：标题、描述、度量类型、目标值、起始值

**确认机制**：
- Web 端展示 AI 建议的年度目标列表
- 用户可：接受 / 修改 / 拒绝 / 新增
- 确认后状态变为 `ACTIVE`

#### 层级二：年度目标 → 月度计划

**触发条件**：
- 年度目标确认后自动触发
- 用户主动点击"AI 建议月度计划"

**输入**：
- 目标年度目标 × `layerResources` 时间 + 精力模式
- `layerBehavior` 失败模式（避免重蹈覆辙）

**输出**：
- 每个年度目标建议 12 个月度计划
- 包含：标题、描述、目标值

**确认机制**：
- 按年/目标分组展示
- 用户逐月确认 / 修改 / 跳过

#### 层级三：月度计划 → 日计划

**触发条件**：
- 月度计划确认后自动触发
- 每日复盘时 AI 建议次日计划
- 用户主动点击"AI 建议今日计划"

**输入**：
- 当月月度计划 × `timeBlocks`（可用时段）
- 近期完成率（调整任务量）

**输出**：
- 每日计划列表（写入 `DailyPlan` 表草案）
- 任务排期建议（匹配可用时段）

**确认机制**：
- 用户可编辑后确认
- 日计划无需强制确认（未确认则只作为建议展示）

### 4.3 与现有目标体系的关系

| 现有表 | 目标拆解角色 | 状态控制 |
|--------|------------|---------|
| LifeGoal | 人生目标（10-20年） | 用户手动创建，AI 建议关联 |
| YearlyGoal | AI 建议年度目标 | 建议时 PENDING → 确认后 ACTIVE |
| MonthlyPlan | AI 建议月度计划 | 建议时 PENDING → 确认后 ACTIVE |
| DailyPlan | AI 建议日计划 | 建议时 PENDING → 用户可编辑，无需强制确认 |

---

## 5. 复盘分析流程改造

### 5.1 改造后流程

```
复盘输入
    │
    ▼
信号评分 + 追问（不变）
    │
    ▼
加载 LifeArchive 摘要 ─── 加载今日计划 ─── 加载历史模式
    │                         │                    │
    └─────────────────────────┼────────────────────┘
                              ▼
                构建 Prompt（含摘要 + 人格特征）
                              │
                              ▼
                    调用 AI 分析
                              │
                              ▼
                    分析结果 structuredReport
                              │
                   ┌──────────┼──────────────┐
                   ▼          ▼              ▼
          回写 layerBehavior 回写能量精力   回写健康基础
          （自动提取）      （用户确认）    （用户确认）
                              │
                              ▼
              更新 LifeArchive 摘要（自动触发）
                              │
                              ▼
                         反馈评分（不变）
```

### 5.2 具体变更点

#### Bridge（auto-processor.cjs）

| 变更 | 位置 | 说明 |
|------|------|------|
| 分析前加载摘要 | `runAnalysis()` | 调用 `GET /api/life-archive/summary`，注入 Prompt |
| 分析前加载人格 | `runAnalysis()` | 调用 `GET /api/life-archive` 取 layerCore，注入 Prompt |
| 分析后回写行为 | `runAnalysis()` 末尾 | 调用 `POST /api/life-archive/behavior`（自动） |
| 分析后回写能量/健康 | `runAnalysis()` 末尾 | 生成提议文案，等待用户确认后写入 |

---

## 6. API 设计

### 6.1 LifeArchive CRUD

```typescript
// 获取完整档案
GET /api/life-archive
Response: { data: LifeArchive | null }

// 全量更新
PUT /api/life-archive
Body: { layerCore?, layerResources?, layerBehavior?, layerFuture? }
```

### 6.2 分层更新（前端）

```typescript
// 更新第一层
PATCH /api/life-archive/layer-core
Body: { personality: { mbti, bigFive, gallup } }

// 更新第二层
PATCH /api/life-archive/layer-resources
Body: { skills?, fixedExpenditure?, finance?, support?, health? }

// 更新第四层
PATCH /api/life-archive/layer-future
Body: { vision, goalSource, outcomeRange, roleModels }
```

### 6.3 AI 写回接口

```typescript
// 能量精力（AI → 用户确认 → 写入）
POST /api/life-archive/energy
Body: { energyDescription: string }

// 健康基础（AI → 用户确认 → 写入）
POST /api/life-archive/health
Body: { physicalHealth?, mentalState?, exerciseRoutine?, addictiveHabits? }

// 行为数据（AI 自动提取，无需确认）
POST /api/life-archive/behavior
Body: { successPatterns?, failurePatterns?, productivityPatterns?, decisionMistakes? }
```

### 6.4 摘要接口

```typescript
// 获取摘要（AI 对话前加载用）
GET /api/life-archive/summary
Response: { data: { summary: string } | null }

// 触发摘要重生成（任一层次更新后自动调用，也可手动触发）
POST /api/life-archive/summary/refresh
Response: { data: { summary: string } }
```

### 6.5 AI 目标拆解接口

```typescript
// AI 建议年度目标
POST /api/goals/ai-suggest/yearly
Response: { data: Array<{ title, description?, year, metricType, targetValue, startValue? }> }

// 确认 AI 年度目标
POST /api/goals/ai-suggest/yearly/confirm
Body: { goals: Array<{ title, description?, year, metricType, targetValue, startValue? }> }

// AI 建议月度计划
POST /api/plans/ai-suggest/monthly
Body: { yearlyGoalId: string }
Response: { data: Array<{ title, description?, month, year, metricType, targetValue }> }

// 确认月度计划
POST /api/plans/ai-suggest/monthly/confirm
Body: { plans: Array<{...}> }

// AI 建议日计划
POST /api/plans/ai-suggest/daily
Body: { date?: string }
Response: { data: Array<{ title, date, metricType, targetValue }> }
```

---

## 7. User 表合并方案

### 7.1 合并内容

| User 表字段 | 合并到 LifeArchive | 说明 |
|------------|-------------------|------|
| `occupation` | layerResources.skills[].description | 作为第一条技能背景 |
| `industry` | layerResources.skills[].description | 合并到职业描述 |
| `pastExperience` | layerBehavior 基线 | 作为初始行为数据 |
| `weekdayAvailableHours` | layerResources（同名字段） | 前端直接编辑，迁移后弃用 User 表 |
| `weekdayTimeBlocks` | layerResources（同名字段） | 前端直接编辑，迁移后弃用 User 表 |
| `weekendAvailableHours` | layerResources（同名字段） | 前端直接编辑，迁移后弃用 User 表 |
| `weekendTimeBlocks` | layerResources（同名字段） | 前端直接编辑，迁移后弃用 User 表 |
| `goalDomains` | layerFuture.vision | 合并到愿景描述 |

### 7.2 迁移策略

| 步骤 | 操作 | 说明 |
|------|------|------|
| 1 | LifeArchive 表新增对应字段 | User 表保持不动 |
| 2 | 首次启动时自动迁移 | 已有 User 数据复制到 LifeArchive |
| 3 | 双写期 | 数据同时写入 User + LifeArchive（确保兼容） |
| 4 | 前端切换 | 前端改为读取 LifeArchive 数据 |
| 5 | User 字段弃用 | 后续版本清理 User 表冗余字段 |

User 表保留 `id`、`nickname`、`age`、`city` 等基础身份信息。

---

## 8. 权限矩阵

| 数据 | Web 用户 | AI 读取 | AI 写入 |
|------|---------|---------|--------|
| 第一层 恒定核心 | 增删改 | ✅ | ❌ |
| 第二层 核心能力 | 增删改 | ✅ | ❌ |
| 第二层 时间资源 | 增删改 | ✅ | 建议不修改 |
| 第二层 能量精力 | ❌ | ✅ | ✅（复盘后写回，用户确认） |
| 第二层 财务状况 | 增删改 | ✅ | ❌ |
| 第二层 支持系统 | 增删改 | ✅ | ❌ |
| 第二层 健康基础 | 增删改 | ✅ | ✅（复盘后写回，用户确认） |
| 第三层 历史行为 | ❌ | ✅ | ✅（自动提取） |
| 第四层 未来蓝图 | 增删改 | ✅ | ❌ |
| AI 摘要 | ❌ | ✅ | ✅（自动生成） |
| 年度目标（AI 建议） | 确认/修改 | ✅ | 建议写入 PENDING |
| 月度计划（AI 建议） | 确认/修改 | ✅ | 建议写入 PENDING |
| 日计划（AI 建议） | 确认/编辑 | ✅ | 建议写入 PENDING |
