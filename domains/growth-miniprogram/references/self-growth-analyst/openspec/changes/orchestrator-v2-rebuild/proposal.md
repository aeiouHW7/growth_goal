## Why
当前系统是"概念宣言驾驶舱"——有 SKILL.md、有 probes、有概念配置，但没有大脑把各模块串起来。系统无法自动路由、没有工作记忆、无法追踪行为承诺、干预时机靠人工判断。需要将系统从"设计精良的文档"升级为"可运行的成长调度器"。

## What Changes

### 阶段一：架构神经系统重构
- 新建 5个分析引擎：linguistic_analyzer / psychodynamic_engine / habit_behavior_engine / strategic_alignment_engine / veracity_checker
- 重写 SKILL.md 为总调度器（增加完整工作流章节：感知→记忆更新→紧急检查→静默/分析→诊断→干预→写回）
- 升级 capability_baseline.json 为20维双评分（自评+系统计算）加 blind_spot_index

### 阶段二：工作流落地
- 新建 memories/short_term/：working_context.md / pending_actions.json / active_conflicts.md
- 新建 rules/intervention_triggers.md：定义何时出手的条件
- 改造 skills_library/execution/ 为诊断脚本样板（trigger/diagnosis/intervention/verification）

### 阶段三：分析深度质变
- 新建 references/cognitive_biases_lexicon.md（40种偏误+提示词）
- 新建 references/fogg_behavior_model_detail.md（M/A/P诊断问题清单）
- 新建 references/iceberg_model_questions.md（逐层追问序列）
- 新建 references/motivational_interviewing_tips.md（过程性夸赞+好奇语调）
- 新建 core/weekly_strategic_audit.md（维持/成长/消耗时间分类）

## Capabilities

### New Capabilities
- `linguistic-analyzer`: 语言学分析引擎，分析归因模式、情绪词频、防卫信号
- `psychodynamic-engine`: 心理动力引擎，冰山模型追问触发器
- `habit-behavior-engine`: 习惯行为引擎，用福格模型诊断M/A/P
- `strategic-alignment-engine`: 战略对齐引擎，追踪行动和"前100富人"目标的距离
- `veracity-checker`: 真实性检测器，检测自我欺骗和盲点
- `short-term-memory`: 工作记忆系统，为引擎提供即时上下文
- `intervention-triggers`: 干预触发规则，明确何时出手
- `execution-diagnostic-skill`: 执行力诊断脚本样板
- `cognitive-bias-lexicon`: 认知偏误百科（40种）
- `motivational-interviewing-guide`: 动机性访谈指南

### Modified Capabilities
- `skill-md`: 重写为总调度器，定义完整工作流
- `capability-baseline`: 扩展为20维双评分+blind_spot_index
- `skills-library-execution`: 从 probes 改为诊断脚本

## Impact
- core/ 新增5个引擎 + weekly_strategic_audit
- SKILL.md 重写为可运行调度器
- config/ 改造 capability_baseline.json
- memories/ 新增 short_term/ 目录
- rules/ 新增 intervention_triggers.md
- skills_library/execution/ 改造为诊断脚本
- references/ 新增4个知识库文件