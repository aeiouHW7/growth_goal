## Context

当前系统是"静态档案系统"：Memories只存储分级记忆文件，Skills是静态问题清单，Core各模块是孤岛。缺乏中心调度、行为预测能力和动态干预闭环。

用户给了一个关键方向：**把系统升级为"认知教练"，遵循观察→分析→诊断→干预→反馈的闭环**。

改造目标：保留现有文件结构，新增 Orchestrator 作为中心调度层，改造 Skills Library 为动态诊断脚本。

## Goals / Non-Goals

**Goals:**
- 新增 Growth Orchestrator 作为中心调度引擎，串联4个子Agent
- Observer Agent 从碎碎念实时抽取结构化行为数据
- Analyst Agent 运行行为模型（福格、冰山）检测模式和偏见
- Coach Agent 每个Skill升级为"触发→诊断→干预→追踪"闭环
- Archivist Agent 维护动态行为基线和认知偏见日志
- E2E串起：用户输入→感知分类→模式分析→调度决策→干预→追踪验证

**Non-Goals:**
- 不重写已有的碎碎念处理流程（core/auto_insight_generator.md 继续有效）
- 不改变现有 SKILL.md 的身份定义和触发条件
- 不做多Agent的代码级实现（先用自然语言+状态机模拟）
- 不重构现有的周考/月考 cron 逻辑（独立运行）

## Decisions

### D1: Orchestrator 用自然语言状态机实现，不写 Python

**决策**: 用 `core/orchestrator_prompt.md` 描述调度逻辑，作为系统 prompt 的一部分注入给主Agent。

**原因**:
- 当前 skill 是纯文本系统，没有代码执行环境
- 自然语言状态机足够描述"观察→分析→诊断→干预→反馈"流程
- 未来如需升级为代码实现，状态机是可转译的设计文档

**替代考虑**: 写 Python orchestrator.py — 当前系统不支持代码执行，放弃。

### D2: Skills Library 改造为 YAML + markdown 双格式

**决策**: 每个维度新建 `skills_library/<dimension>/skill.yaml` 作为动态脚本，保留 `*_probes.md` 作为题目来源。

**原因**:
- YAML 定义触发条件、诊断流程、干预动作，可被显式解析
- markdown 保留人类可读的问题清单
- 渐进改造：先建 YAML 不删 markdown

### D3: Dynamic Baseline 用 JSON 文件而非数据库

**决策**: 新增 `memories/dynamic_baseline.json`，每次更新直接读写文件。

**原因**:
- 当前系统没有数据库
- JSON文件足够轻量，行为概率更新频率极低
- 未来可低成本迁移到数据库

### D4: Observer/Analyst/Coach/Archivist 不作为独立Agent进程

**决策**: 这四个角色作为 Orchestrator 的"逻辑模块"存在于 prompt 中，由主Agent调用时注入角色。

**原因**:
- 当前没有多Agent进程管理能力
- 用角色 prompt 模拟子Agent足够实现"活起来"的效果
- 避免引入 ACP sessions_spawn 的复杂性

## Risks / Trade-offs

[风险] 主Agent调用Orchestrator时可能遗忘角色 → 缓解：在 system_prompt.md 显式注入 Orchestrator 角色定义

[风险] YAML 调度逻辑无法被代码校验 → 缓解：保留 markdown probes 作为人类校验基准

[风险] 行为基线数据稀疏（只13天） → 缓解：前4周只记录不计算，4周后启动概率推断

[风险] 改造后 Skill 数量翻倍维护成本上升 → 缓解：先改3个维度做样板，验证后再扩展

## Migration Plan

**Phase 1: Orchestrator Core（本周）**
1. 新建 `core/orchestrator_prompt.md` — 调度逻辑的角色 prompt
2. 更新 `core/system_prompt.md` — 注入 Orchestrator 角色定义
3. E2E测试：输入碎碎念→验证完整链路走通

**Phase 2: Skills 改造（第二周）**
1. 选3个维度（决策、执行、沟通表达）做样板
2. 新建 `skills_library/decision/skill.yaml`
3. 验证触发→诊断→干预→追踪闭环

**Phase 3: Dynamic Baseline（第三周）**
1. 新建 `memories/dynamic_baseline.json` 结构
2. Observer Agent 开始写入行为事件
3. Analyst Agent 开始计算基础概率

**Rollback**: 原文件已全部在 Git，不存在删除风险。

## Open Questions

1. **YAML 调度解析器**: 未来如果需要代码级解析，谁来解析 skill.yaml？主Agent的 prompt 能稳定解析 YAML 吗？
2. **基线数据稀疏**: 13天数据够不够建立初始行为概率？还是需要至少一个月？
3. **跨维度的模式**: 如果一个行为同时触发"执行"和"心理"两个维度，Orchestrator 如何决定优先级？
4. **挑战模式触发时机**: 当基线数据建立后，什么条件下 Agent 应该主动挑战用户，而不是只记录？