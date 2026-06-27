# Self-Growth Analyst Skill — 理解与问题报告

> **编写目的**：边读边理解，通过写 README 的过程检验是否真正掌握了这个 skill，同时识别其中的漏洞和不连贯之处。

---

## 一、系统概述

### 1.1 这是什么

自我成长分析师是一个完整的**认知教练系统**，目标用户是一个31岁大厂产品经理。系统通过分析他的"碎碎念"，识别行为模式和心理机制，生成有洞察力的干预（1个问题 + 1个行动），推动他在19个能力维度上的成长。

### 1.2 核心角色

| 角色 | 职责 |
|------|------|
| Observer | 观察者：从碎碎念中提取结构化行为数据 |
| Analyst | 分析师：运行行为模型，检测模式和偏误 |
| Coach | 教练：生成1个问题 + 1个行动的干预 |
| Archivist | 档案员：管理记忆和维护状态 |

### 1.3 文件结构

```
self-growth-analyst/
├── SKILL.md              # 总调度器入口（高位描述）
├── core/                 # 分析引擎（20+个）
│   ├── orchestrator_prompt.md   # 精确执行规格
│   ├── linguistic_analyzer.md   # L1 语言学分析
│   ├── signal_depth_gate.md     # L1 信号厚度判定
│   ├── time_pattern_analyzer.md # L2 时间模式
│   ├── habit_behavior_engine.md # L2 福格行为模型
│   ├── psychodynamic_engine.md # L2 冰山模型
│   ├── strategic_alignment_engine.md
│   ├── veracity_checker.md
│   └── ...（共20个引擎）
├── memories/             # 记忆存储
│   ├── daily_raw/        # 每日碎碎念原始记录
│   ├── short_term/       # 短期记忆
│   │   ├── working_context.md
│   │   └── pending_actions.json
│   └── long_term/        # 长期记忆
│       └── retrieval_index.json
├── skills_library/       # 19个能力维度（目前为 probes 版本）
│   ├── execution/
│   ├── communication/
│   └── ...（28个维度目录）
├── rules/
│   └── intervention_triggers.md
└── config/
```

---

## 二、8步工作流

### Step 1: 加载记忆
读取以下文件：
- `memories/short_term/working_context.md` — 近7天摘要
- `memories/short_term/pending_actions.json` — 待追踪行动
- `memories/short_term/active_conflicts.md` — 当前矛盾
- `memories/long_term/retrieval_index.json` — 模式追踪
- `memories/.orchestrator_state.json` — 调度状态

### Step 2: 判断输入类型
- **紧急信号** → 跳 Step 7（保护模式）
- **周/月考答案** → 交给 exam_answer_handler
- **普通碎碎念** → 继续 Step 3

### Step 3: Observer 语言学分析
调用 `core/linguistic_analyzer.md`，输出：
- 归因模式（external/internal/rationalization）
- 情绪词频统计
- 防卫信号检测
- 语言风格分析（tone_markers, defense_mechanisms, emotional_temperature, implicit_intent）

### Step 3.5: 信号厚度判定（强制门禁）
调用 `core/signal_depth_gate.md`，8维度评分：
- ≥8分：极厚信号，直接深度分析
- 5-7分：正常信号，继续 Step 4
- 3-4分：薄信号，缺口探测≤2次
- <3分：极薄信号，追问1次无改善→归档 NO_REPLY

### Step 3.6: 时间模式分析（L2按需）
条件触发（凌晨00-06点 / 深夜22-24点 / 用户说"累了/困了/熬夜"）

### Step 4: Archivist 归档
- 追加到 `memories/daily_raw/YYYY-MM-DD.md`
- 更新 `working_context.md`
- 写入验证

### Step 5: Analyst 分析
按条件调用分析引擎（L1常驻 + L2按需）：
- **L1 常驻**：linguistic_analyzer、signal_depth_gate、auto_insight_generator
- **L2 条件触发**：habit_behavior_engine、psychodynamic_engine、veracity_checker、strategic_alignment_engine

Diagnostician 融合：找到"最深的根因"和"最表面的卡点"

### Step 6: Orchestrator 决策
检查 `rules/intervention_triggers.md`：
- **深度干预**：近7天≥2次模式 + 阻抗/防卫/自我批判信号 → 1问题+1行动
- **标准干预**：单一频率触发 → 1问题或1行动
- **微反馈**：单一信号触发 → 1句话观察
- **不触发**：NO_REPLY

### Step 7: 保护模式
紧急信号时执行，不分析不追问，只输出温暖陪伴性内容。

---

## 三、三级引擎加载策略

| 级别 | 引擎 | 加载条件 |
|------|------|----------|
| **L1 常驻** | linguistic_analyzer, signal_depth_gate, auto_insight_generator | 每次碎碎念必加载 |
| **L2 条件** | habit_behavior_engine, psychodynamic_engine, veracity_checker, strategic_alignment_engine | 关键词/条件命中时加载 |
| **L3 周期** | scoring_engine, opportunity_cost_engine, wealth_engine, big_five_ocean | cron触发或exam_mode时加载 |

---

## 四、识别到的问题和不连贯

### 🔴 P0 — 无法正常工作的严重问题

#### 问题1：记忆文件路径严重不一致

**症状**：
- Skill 内部期望的路径：`memories/daily_raw/YYYY-MM-DD.md`
- 实际文件位置：skill 目录内的 `skills/self-growth-analyst/memories/daily_raw/`
- 但 workspace 中另有 `memory/daily_raw/`（用户实际使用的）
- AGENTS.md 又写的是 `memory/YYYY-MM-DD.md` 和 `memory/daily_raw/YYYY-MM-DD.md`

**影响**：三个不同的记忆路径体系，互相不认对方的数据。

**根因**：skill 设计时假设 memories/ 在 skill 内部，但实际运行时记忆文件被放在 workspace-root 的 memory/ 下。

**建议**：统一路径——所有记忆文件统一在 `workspace-main/memory/` 下，skill 内部不再单独管理 memories/。skill 通过读取 workspace 的 memory/ 来获取记忆。

---

#### 问题2：retrieval_index.json 位置错误

**症状**：
- SKILL.md 说路径是 `memories/long_term/retrieval_index.json`
- 实际文件在 `memories/retrieval_index.json`（根目录，非 long_term/）
- `memories/long_term/` 目录是空的

**建议**：将 retrieval_index.json 移到 long_term/ 子目录，或更新 SKILL.md 中的路径引用。

---

#### 问题3：Step 编号不一致

**症状**：
- SKILL.md 中：信号闸门是 Step 3.5，时间分析是 Step 3.6，分析师是 Step 5
- orchestrator_prompt.md 中：信号闸门是 Step 4，时间分析是 Step 5，分析师是 Step 5（混了）

**影响**：执行时到底按哪个顺序？两个文件打架。

**建议**：统一为一个执行顺序，以 SKILL.md（高位描述）为准，在 orchestrator_prompt.md 中精确映射。

---

### 🟡 P1 — 功能不完整

#### 问题4：skills_library 为空（只有 probes，没有 skill_definition）

**症状**：
- SKILL.md 第5章说："skills_library/execution/skill_definition.md" 是诊断脚本版本
- 实际只有 `execution/execution_probes.md`，没有 skill_definition.md
- 所有28个维度都是 probes 版本，不是诊断脚本版本

**影响**：Step 6 的 Coach 干预依赖 skill_definition.md，但文件不存在，实际上会用 probes 版本来做诊断——但 probes 不是为诊断设计的。

**建议**：要么将 probes 升级为诊断脚本（需要大量工作），要么在 SKILL.md 中说明当前是"probes 版，过渡方案"。

---

#### 问题5：.active_exam.json 从未创建

**症状**：
- SKILL.md Step 2.2 依赖 `memories/.active_exam.json` 来判断是否在考试模式
- 但这个文件从未出现在 memories/ 目录中
- 考试模式实际上是靠 cron job 在特定时间触发，但那又是怎么和这个文件关联的？

**建议**：需要明确考试模式的触发机制——是由 cron 直接设置这个文件，还是其他方式。

---

#### 问题6：skills_library 目录有异常文件

**症状**：
- 存在 `{cognition,learning,self_awareness,emotional_intelligence,influence,business_acumen,strategic_thinking,creativity,resilience,time_management}` 这种花括号命名的文件/目录（应该是 copy-paste 错误）
- `archive/` 目录内容未知

**建议**：清理这些异常文件。

---

#### 问题7：config/ 只有2个文件，缺少用户画像

**症状**：
- SKILL.md 附录提到：`config/user_profile.json` 和 `config/capability_baseline.json`
- 实际 config/ 只有 `capability_baseline.json` 和 `financial_metrics.json`
- 没有 user_profile.json

**建议**：补充缺失文件或更新 SKILL.md 移除这些引用。

---

### 🟠 P2 — 设计层面的问题

#### 问题8：两套记忆系统并行

**症状**：
- `workspace-main/memory/` — 用户实际在用的（今天 2026-05-04 的记录在这里）
- `workspace-main/skills/self-growth-analyst/memories/` — skill 内部管理的

这两个目录都在被使用，但内容不一样，会导致数据分裂。

**建议**：明确"单一数据源"原则——记忆文件只在 `memory/` 下，skill 读取 `memory/` 而不是有自己的 memories/ 目录。

---

#### 问题9：Step 5 引擎调用没有标准化输出格式

**症状**：
- habit_behavior_engine、psychodynamic_engine 等都有各自的输出格式
- 但没有统一的"引擎输出格式规范"
- SKILL.md 说"调用 engine 获取输出"，但没有说输出是什么格式、如何消费

**建议**：为每个引擎定义标准化的输出格式，并在 orchestrator_prompt.md 中明确如何融合多引擎输出。

---

#### 问题10：Cron 触发逻辑未实现

**症状**：
- scoring_engine（L3周期引擎）需要周考时触发
- weekly_strategic_audit 需要每周日触发
- 但没有看到任何 cron job 的配置说明

**建议**：补充 cron 配置指南，注明如何设置周考/月考的定时触发。

---

## 五、总结

| 维度 | 状态 |
|------|------|
| 核心流程设计 | ✅ 完整，逻辑清晰 |
| 引擎系统（L1/L2/L3） | ✅ 分层合理 |
| 8步流程 | ✅ 覆盖完整 |
| 文件路径一致性 | ❌ 严重混乱 |
| Step 编号一致性 | ❌ 两个文件打架 |
| skills_library 完整性 | ❌ 缺少 skill_definition |
| 记忆系统单一性 | ❌ 两套并行 |
| Cron 配置 | ❌ 未实现 |

**最优先修复**：问题1（路径统一）和问题3（Step编号统一），这两个不解决 skill 根本无法正确执行。

---

## 六、给用户的问题

1. 记忆文件应该统一在哪？
   - 方案A：统一在 `workspace-main/memory/`（当前 workspace 用的）
   - 方案B：统一在 `skills/self-growth-analyst/memories/`（skill 设计时的假设）
   
2. skills_library 要不要升级成完整的诊断脚本？还是维持 probes 过渡版本？

3. Cron 周考/月考的触发机制——是你之前手动设了 cron，还是这个机制还没建立？