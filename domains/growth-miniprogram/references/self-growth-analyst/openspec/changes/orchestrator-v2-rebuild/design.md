## Context
当前系统有：SKILL.md（概念文档）、19个probe文件、orchestrator_prompt.md（第一版调度）、部分skill.yaml。用户最新的Task要求聚焦：先装"大脑"（core/引擎），再丰富"感官"（rules/触发），最后装"手脚"（skills/诊断脚本）。

## Goals / Non-Goals

Goals:
- 让SKILL.md成为真正可运行的总调度器，每次Claude读取它就知道完整工作流怎么跑
- 5个分析引擎全部落地，能被调度器调用
- 工作记忆系统（short_term/）能追踪"上次说了什么"和"答应要做什么"
- 干预触发规则固化，系统知道何时出手
- 第一个诊断脚本样板（execution）能跑通完整闭环

Non-Goals:
- 不一次改造全部20个维度（先做execution做样板）
- 不做代码级多进程（保持纯文本prompt系统）
- 不做NLP自动化（引擎靠主Agent读取prompt执行）

## Decisions

### D1: 引擎用.md实现，不写代码
5个引擎全部用markdown描述逻辑，主Agent在诊断时读取并应用。
原因：当前系统是纯prompt系统，没有代码执行环境。

### D2: SKILL.md是唯一入口
Claude每次处理消息前，只读取SKILL.md（不再分散读取core/orchestrator_prompt.md）。
SKILL.md内部包含完整调度逻辑，所有引擎路径都在里面。
原因：减少分散，提高调度确定性。

### D3: 工作记忆用3个文件
working_context.md + pending_actions.json + active_conflicts.md
working_context.md: 近7天摘要（含模式变化）
pending_actions.json: 结构化待办（含验证关键词）
active_conflicts.md: 当前活跃矛盾（如"想写公众号但连续3周未做"）
原因：3个文件各司其职，海马体结构清晰。

### D4: 干预触发用AND/OR明确化
近7天同一卡点出现≥2次 AND (阻抗信号 OR 进步信号 OR 强烈自我批判) → 出手
原因：让规则明确，不靠人工判断。

### D5: execution做样板，其他跟进
第一批只改造 skills_library/execution/，其他维度后续按样板改造。
原因：控制复杂度，验证后扩展。

## Risks / Trade-offs
[风险] SKILL.md太重 → 缓解：内部分章节，只在启动时完整加载，执行时按需引用
[风险] 5个引擎调用复杂 → 缓解：SKILL.md工作流章节清晰定义调用顺序
[风险] 工作记忆数据稀疏 → 缓解：前4周只记录不计算

## Migration Plan
Phase 1 (本周): Task 1,2,3 → 神经核心装好
Phase 2 (下周): Task 4,5,6 → 工作流落地
Phase 3 (持续): Task 7,8,9 → 知识填充和高级功能

## Open Questions
1. veracity_checker和self_awareness的区别？前者检测欺骗，后者检测认知盲点
2. linguistic_analyzer和iceberg_engine的关系？前者分析语言表层，后者挖深层心理