## ADDED Requirements

### Requirement: Complexity-Based Workflow Enforcement

workflow-guard SHALL allow skipping steps based on change complexity.

**Complexity levels**:
- **Simple**: Documentation, typo, config, CSS
- **Medium**: Single-file features, UI components
- **Complex**: Multi-file changes, architecture, database

#### Scenario: Simple change允许跳过 review/verify

**WHEN** proposal.md contains `**复杂度**: 简单`  
**AND** user tries to run ace-archive  
**THEN** workflow-guard SHALL:
1. Check if apply is done (required)
2. Skip review/verify checks (optional for simple changes)
3. Warn: "💡 简单变更可跳过 review/verify，但建议运行以保证质量"
4. Allow archiving

#### Scenario: Complex change强制完整流程

**WHEN** proposal.md contains `**复杂度**: 复杂`  
**AND** user tries to skip review or verify  
**THEN** workflow-guard SHALL:
1. Block: "❌ 复杂变更必须完成完整流程"
2. Explain: "该变更涉及 [架构/数据库/多文件]，必须通过 review 和 verify"
3. Exit

#### Scenario: User explicitly requests skip

**WHEN** user says "跳过 review 直接 archive" or "skip review"  
**AND** change complexity is Simple or Medium  
**THEN** workflow-guard SHALL:
1. Warn: "⚠️ 跳过 review 可能遗漏代码问题，确定继续吗？"
2. If user confirms, allow skip and log to state
3. If user denies, block and suggest running review

**WHEN** user says "跳过" for Complex change  
**THEN** workflow-guard SHALL:
1. Block: "❌ 复杂变更不允许跳过 review/verify"
2. Explain risks
3. Suggest: "如果确实需要跳过，请使用 '强制运行' 并承担风险"

---

### Requirement: Workflow Sequence Enforcement (Adjusted)

All workflow Skills SHALL check prerequisite steps before execution.

**Workflow sequence**:
```
explore → propose → apply → review → verify → archive
```

#### Scenario: Block apply if proposal not ready

**WHEN** user tries to run ace-apply Skill  
**AND** openspec status shows tasks artifact is not "done"  
**THEN** ace-apply SHALL:
1. Display error: "❌ 前置步骤未完成：proposal、design、specs、tasks 必须先创建"
2. Suggest: "请先运行 ace-propose 创建提案"
3. Exit without executing

#### Scenario: Block review if apply not done

**WHEN** user tries to run review Skill  
**AND** tasks.md has unchecked functional tasks (excluding test tasks)  
**THEN** review SHALL:
1. Display error: "❌ 前置步骤未完成：apply 功能任务尚未完成"
2. Show remaining unchecked tasks
3. Suggest: "请先运行 ace-apply 完成功能实现"
4. Exit without executing

#### Scenario: Block verify if review not passed

**WHEN** user tries to run verify Skill  
**AND** `.claude/state/review-log.jsonl` has no recent "completed" entry for current change  
**THEN** verify SHALL:
1. Display error: "❌ 前置步骤未完成：review 尚未通过"
2. Suggest: "请先运行 review 检查代码质量"
3. Exit without executing

#### Scenario: Block archive if verify not passed

**WHEN** user tries to run ace-archive Skill  
**AND** `.claude/state/verify-log.jsonl` has no recent "tests_pass" entry for current change  
**THEN** ace-archive SHALL:
1. Display error: "❌ 前置步骤未完成：verify 尚未通过"
2. Suggest: "请先运行 verify 执行测试"
3. Exit without executing

---

### Requirement: Prerequisite Check Table (Complexity-Aware)

Each workflow Skill SHALL implement prerequisite checks per this table:

| Skill | Prerequisites | Complexity-Based Rules |
|-------|--------------|----------------------|
| ace-explore | None | No check needed |
| ace-propose | explore completed (optional) | All: Check if user explicitly says "skip explore" |
| ace-apply | propose completed (tasks ready) | All: Run `openspec status --json` and verify tasks artifact is "done" |
| review | apply functional tasks done | All: Read tasks.md and verify all non-test tasks are `- [x]` |
| verify | review passed | **Complex**: Required<br>**Medium/Simple**: Optional (warn if skipped) |
| ace-archive | verify passed | **Complex**: Required<br>**Medium**: verify OR review required<br>**Simple**: apply required only |

#### Scenario: Archive simple change without verify

**WHEN** user runs ace-archive  
**AND** proposal shows `复杂度: 简单`  
**AND** review-log shows no recent "completed" entry  
**THEN** ace-archive SHALL:
1. Warn: "💡 未运行 review/verify，建议至少运行其一"
2. Ask: "继续归档吗？(y/n)"
3. If yes, proceed with warning logged
4. If no, exit and suggest running review

#### Scenario: Allow user to skip optional steps

**WHEN** user explicitly says "跳过 explore 直接 propose"  
**THEN** ace-propose SHALL:
1. Warn user: "⚠️ 跳过 explore 可能导致需求理解不充分"
2. Ask for confirmation
3. If confirmed, proceed without explore check

---

### Requirement: Prerequisite Check Implementation

Each Skill SHALL implement prerequisite checks at the beginning of SKILL.md.

**Example for review Skill**:
```markdown
## Prerequisite Check

Before starting, check if apply is complete:

1. Read tasks.md
2. Count unchecked functional tasks (exclude lines containing "测试" or "review" or "verify")
3. If any unchecked tasks remain:
   - Display: "❌ apply 尚未完成，剩余 X 个功能任务"
   - List unchecked tasks
   - Exit

4. If all functional tasks checked:
   - Display: "✅ apply 已完成，开始 review"
   - Proceed with review
```

#### Scenario: Display clear prerequisite error messages

**WHEN** prerequisite check fails  
**THEN** the Skill SHALL:
1. Use emoji prefix: ❌
2. Clearly state what's missing
3. Show current state (e.g., "3/10 tasks completed")
4. Suggest next action with exact command or natural language
5. Exit with non-zero status

---

### Requirement: State Log Integration

Prerequisite checks SHALL use state logs when available.

**Log-based checks**:
- review → Check `.claude/state/apply-log.jsonl` for "tasks_completed" event
- verify → Check `.claude/state/review-log.jsonl` for "completed" event
- archive → Check `.claude/state/verify-log.jsonl` for "tests_pass" event

#### Scenario: Fallback when logs unavailable

**WHEN** state log file doesn't exist  
**THEN** Skill SHALL fallback to direct file checks:
- apply → Check openspec status
- review → Read tasks.md directly
- verify → Ask user for confirmation

#### Scenario: Grace period for recent completions

**WHEN** checking state logs  
**THEN** Skill SHALL only check logs from last 24 hours  
**AND** ignore older entries (to prevent stale data)

---

### Requirement: Skip Confirmation for Expert Users

workflow-guard SHALL allow power users to force-skip checks.

#### Scenario: Force execution with flag

**WHEN** user says "强制运行 review" or "跳过检查运行 verify"  
**THEN** the Skill SHALL:
1. Warn: "⚠️ 强制跳过前置检查可能导致问题"
2. Log warning to state file
3. Proceed with execution

---

### Requirement: Cross-Session Awareness

workflow-guard SHALL work across multiple Claude sessions.

#### Scenario: Resume work in new session

**WHEN** user opens new Claude session  
**AND** runs verify Skill  
**THEN** verify SHALL:
1. Check `.claude/state/review-log.jsonl` for previous session's review completion
2. If found and within 7 days, proceed
3. If not found or too old, block and suggest re-running review

---

### Requirement: Visual Workflow Status

workflow-guard SHALL provide a status command to show current workflow state.

#### Scenario: User asks "where am I in the workflow?"

**WHEN** user asks about workflow status  
**THEN** display:
```
📍 当前工作流状态:

探索需求 [✅]  explore completed  
创建提案 [✅]  proposal/design/specs/tasks ready  
实现变更 [🔄]  7/10 tasks completed  
代码审查 [ ]  waiting for apply  
构建验证 [ ]  waiting for review  
归档变更 [ ]  waiting for verify  

💡 下一步: 继续运行 ace-apply 完成剩余 3 个任务
```

#### Scenario: Check status from state logs

**WHEN** generating workflow status  
**THEN** read all state logs to determine completed steps:
- Check openspec status for propose/apply state
- Check `.claude/state/review-log.jsonl` for review state
- Check `.claude/state/verify-log.jsonl` for verify state
- Check openspec archive for archive state
