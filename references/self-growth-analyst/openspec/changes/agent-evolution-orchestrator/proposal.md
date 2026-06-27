## Why

当前系统的核心问题：**它是一个"会提问的档案系统"，不是"能主动诊断并推动改变的教练"**。Memories只存储不计算，Skills只有问题清单没有调度逻辑，Core缺位导致各模块成为孤岛。系统需要从静态档案升级为闭环的认知操作系统。

## What Changes

- **新增 Growth Orchestrator（成长调度引擎）** — 串联记忆、技能、分析的中心决策层
- **新增 Observer Agent** — 从碎碎念实时抽取结构化行为数据
- **新增 Analyst Agent** — 运行行为模型，检测模式，评估维度KPI
- **改造 Coach Agent** — Skills从静态问题清单升级为"诊断→干预→行动"闭环脚本
- **新增 Archivist Agent** — 管理长短期记忆，维护行为基线和偏见日志
- **新增 Dynamic Baseline** — 可计算的行为概率（如"冲突下沉默概率70%"）
- **改造 Skills Library** — 每个Skill升级为YAML格式的动态诊断脚本
- **新增 Orchestrator Prompt** — 用自然语言模拟调度器的决策逻辑

## Capabilities

### New Capabilities

- `growth-orchestrator`: 中心调度引擎，串联Observer/Analyst/Coach/Archivist四个子Agent
- `observer-agent`: 从用户输入中实时抽取行为、情绪、归因方式等结构化事实
- `analyst-agent`: 运行行为模型（福格、冰山），检测模式，评估维度真实KPI
- `coach-agent`: 每个Skill升级为"触发条件→诊断流程→干预行动→追踪反馈"闭环
- `archivist-agent`: 维护动态行为基线（可计算的概率分布）和认知偏见日志
- `dynamic-baseline`: 可计算的行为概率数据（如冲突下沉默概率、决策冲动概率）
- `cognitive-bias-log`: 长期追踪用户反复出现的思维偏误，比维度评分更底层
- `orchestrator-prompt`: 用自然语言编写调度器决策逻辑，支持自然语言模拟调度

### Modified Capabilities

- `skills-library` (改造): 从静态probes.md升级为YAML动态诊断脚本结构

## Impact

- `core/` 新增 orchestrator 调度逻辑
- `skills_library/` 全部重构为 YAML 格式 + 诊断脚本
- `memories/` 新增 `dynamic_baseline.json` 和 `cognitive_bias_log.md`
- `config/` 新增 `orchestrator_config.yaml`
- 工作流从"被动等输入"变为"主动观察→诊断→干预→追踪"闭环