## ADDED Requirements

### Requirement: ace-handoff 会话交接
系统 SHALL 提供 `ace-handoff` 命令，在会话中断时生成交接文档，包含当前阶段、未完成工作、开放问题和建议的下次入口。

#### Scenario: 实现阶段中断
- **WHEN** 用户在 applier 阶段执行 ace-handoff，且 tasks.md 中有 3/8 完成
- **THEN** 生成交接文档，包含：当前阶段（applier）、进度（3/8 tasks）、当前 task 描述、未解决的阻塞问题、建议下次用 ace-applier 继续

#### Scenario: 规划阶段中断
- **WHEN** 用户在 planner 阶段执行 ace-handoff，PRD 已写但提案未完成
- **THEN** 生成交接文档，包含：当前阶段（planner Phase 2→3）、已有 artifacts 路径、未决策的设计问题

### Requirement: 交接文档引用而非重复
ace-handoff 生成的文档 SHALL 引用已有 artifacts 的文件路径，MUST NOT 复制其内容。

#### Scenario: 引用已有提案
- **WHEN** 交接文档提及当前变更的提案内容
- **THEN** 使用路径引用（如 "详见 openspec/changes/xxx/proposal.md"），不复制内容
