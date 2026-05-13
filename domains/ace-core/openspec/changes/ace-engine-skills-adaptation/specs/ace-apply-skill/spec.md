## ADDED Requirements

### Requirement: Automatic Review After Apply

ace-apply Skill SHALL automatically invoke review Skill after completing all functional tasks.

#### Scenario: Trigger review when all code tasks done

**WHEN** all tasks marked with `- [x]` in tasks.md (excluding testing tasks)  
**THEN** ace-apply SHALL suggest: "功能实现完成，现在运行 review 检查代码质量？"

---

### Requirement: Automatic Verify After Review

ace-apply Skill SHALL automatically invoke verify Skill after review passes.

#### Scenario: Trigger verify after successful review

**WHEN** review Skill completes with no blocking issues  
**THEN** ace-apply SHALL suggest: "代码审查通过，现在运行 verify 执行测试？"

---

### Requirement: Official OpenSpec Apply Integration

ace-apply Skill SHALL delegate task execution to official openspec-apply-change.

#### Scenario: Execute tasks using official skill

**WHEN** ace-apply runs  
**THEN** it SHALL call official openspec-apply-change and monitor progress

---

### Requirement: ACE-Specific Task Handling

ace-apply Skill SHALL recognize ACE-specific task patterns.

**Patterns**:
- Tasks referencing `10_DOCS/` → Auto-create directory if missing
- Tasks referencing `domain.yaml` → Validate syntax after modification
- Tasks referencing `../../rules/` → Ensure compliance

#### Scenario: Auto-create 10_DOCS subdirectories

**WHEN** task says "更新 10_DOCS/testing/v1.0/test-plan.md"  
**THEN** ace-apply SHALL create `10_DOCS/testing/v1.0/` if it doesn't exist

---

### Requirement: State Logging

ace-apply Skill SHALL log task execution to `.claude/state/apply-log.jsonl`.

#### Scenario: Log each completed task

**WHEN** a task is marked as complete  
**THEN** log entry SHALL include task number, description, and timestamp
