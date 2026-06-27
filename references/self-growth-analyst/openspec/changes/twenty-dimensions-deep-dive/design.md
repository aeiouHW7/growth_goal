## Context

当前系统已有：
- Orchestrator v1（中心调度层）
- 3个维度的 skill.yaml（decision/execution/communication）
- Dynamic Baseline + Cognitive Bias Log
- 19个 probe 文件（静态问题清单）

系统需要升级：
- 引入福格/冰山/OCEAN 三个行为分析模型
- 全部20个维度升级为动态 skill.yaml
- 新增跨维度关联规则挖掘
- 新增知识图谱
- 改造 KPI 仪表盘

用户目标是：让系统成为"冷酷的教练+精准导航仪"，通过刚性程序对"自我"进行降维观测和精确纠偏。

## Goals / Non-Goals

**Goals:**
- 3个行为分析引擎（福格/冰山/OCEAN）全部落地，能在诊断流程中被调用
- 20个维度全部有完整的 skill.yaml，包含 trigger/diagnosis/intervention/success_metrics
- 跨维度关联规则库建立，能发现"睡眠好→执行力高"这类规则
- KPI 仪表盘能生成20维度趋势图
- 知识图谱覆盖心理学（ABA/CBT/动机心理学）+ 管理学（GTD/复盘/商业模式）

**Non-Goals:**
- 不做代码级 Agent 进程（保持纯文本 skill 系统）
- 不做 NLP 自动化（分析引擎靠主Agent调用 prompt 执行）
- 不做实时可视化图表（生成 Markdown 格式的趋势报告）
- 不删除现有的 probe 文件（保留作为题目来源）

## Decisions

### D1: 分析引擎用 Prompt 实现，不写代码

**决策**: 福格/冰山/OCEAN 三个引擎全部用 `.md` 文件描述逻辑，主Agent在诊断时读取并应用。

**原因**: 当前系统是纯文本 skill 系统，没有代码执行环境。Prompt 足够描述诊断逻辑，且人类可校验。

**替代考虑**: 写 Python 引擎 → 没有执行环境，放弃。

### D2: Skill.yaml 格式统一，trigger_on 支持多条件

**决策**: 所有20个 skill.yaml 使用统一格式：
```yaml
skill_name: <name>
dimension: <dimension>
version: 1.0
trigger_on:
  - type: pattern  # pattern / score / keyword
    value: <value>
    threshold: <number>
diagnosis_flow:
  - step: N
    method: fogg_model / iceberg / ocean / pattern
    question: "<question>"
    output: <what this step produces>
intervention:
  type: micro_action
  prompt: "<what coach says>"
  action: "<concrete tiny habit>"
success_metrics:
  - "<what good looks like>"
  - "<what bad looks like>"
```

**原因**: 统一格式便于维护和校验，也便于未来代码级解析。

### D3: 跨维度关联规则用手工+启发式发现

**决策**: pattern_miner 不是自动挖掘，而是：
1. Analyst Agent 在每次分析时，手工记录观察到的关联（如"4/19健身→4/20执行力自评高"）
2. 当同类观察出现3次时，创建一条规则写入 `cross_dimension_rules.md`
3. 规则格式：`[规则] 前提行为 → 预期结果 （证据：日期1、日期2）`

**原因**: 数据量太少（13天），自动挖掘会产生噪声。手工+启发式更可靠。

### D4: 知识图谱用 Markdown 而非图数据库

**决策**: 心理学/管理学知识库存为 Markdown 文件，按主题分类。

**原因**: 当前系统没有图数据库，Markdown 足够知识存储，主Agent可读取理解。

### D5: KPI 仪表盘生成 Markdown 趋势报告

**决策**: 每周日生成 `memories/weekly_summaries/YYYY-WW.md` 时，包含20维度趋势数据（用文本表格/ASCII图），不生成图片。

**原因**: 当前系统没有图表渲染能力，Markdown 格式可读且通用。

## Risks / Trade-offs

[风险] 20个 skill.yaml 维护成本高 → 缓解：先完成全部框架，细节后续迭代

[风险] 手工关联规则发现速度慢 → 缓解：3次触发才建规则，避免噪声

[风险] 大五人格 OCEAN 没有足够数据做真正分析 → 缓解：前3个月只记录不计算，积累数据后启动

[风险] 冰山模型触发条件"失败/沮丧/搞砸"可能太宽 → 缓解：加上频率限制（同一关键词周内出现2次以上才触发）

## Migration Plan

**Phase 1: 分析引擎（本周）**
- 新建 `core/fogg_behavior_model.md`
- 新建 `core/iceberg_engine.md`
- 新建 `core/big_five_ocean.md`
- 验证：在诊断流程中正确调用

**Phase 2: Skills Library 全面升级（第二周）**
- 新建 17个维度的 skill.yaml
- 更新 3个已有 skill.yaml
- 验证：每个 Skill 的 trigger/diagnosis/intervention 链路通

**Phase 3: 记忆系统升级（第三周）**
- 改造 `config/capability_baseline.json`（增加行为证据字段）
- 新建 `memories/long_term/personal_bias_tracker.md`
- 新建 `memories/long_term/cross_dimension_rules.md`
- 验证：数据写入和读取正常

**Phase 4: 知识图谱（第四周）**
- 新建 `references/psychology_knowledge.md`
- 新建 `references/management_knowledge.md`
- 验证：主Agent能正确调用知识

**Phase 5: KPI 仪表盘（第五周）**
- 改造 weekly summary 生成逻辑
- 加入20维度趋势表格
- 验证：趋势数据正确

## Open Questions

1. **OCEAN 分析何时启动？** 当前数据量不足以支撑大五分析，是否等3个月后？还是只用部分维度（如尽责性）？
2. **冰山模型追问深度？** 触发后应该追问几层？太多会烦，太少没效果。
3. **trigger_on 多条件组合逻辑？** 当 pattern + score + keyword 同时满足时，优先级是什么？