## ADDED Requirements

### Requirement: Path Adaptation from ai-drive-engine

review Skill SHALL adapt ai-drive-engine paths to ACE Engine structure.

**Path mapping**:
| ai-drive-engine | ACE Engine |
|----------------|------------|
| `openspec/config.yaml` → coding standards | `domain.yaml` → coding_standards |
| `{agent}/10_DOCS/business/` | `10_DOCS/business/` |
| `{agent}/.ai-state/review-log.jsonl` | `.claude/state/review-log.jsonl` |

#### Scenario: Read coding standards from domain.yaml

**WHEN** review Skill starts  
**THEN** it SHALL read coding_standards from domain.yaml  
**AND** fallback to `../../rules/code-quality.md` if field not present

---

### Requirement: Design Consistency Check

review Skill SHALL compare implementation against design.md.

#### Scenario: Verify API interfaces match design

**WHEN** design.md defines API endpoint `/api/users`  
**THEN** review SHALL check if backend code implements this exact endpoint

#### Scenario: Detect missing implementations

**WHEN** design.md mentions "JWT authentication"  
**THEN** review SHALL verify JWT-related code exists in git diff

---

### Requirement: Task Completeness Check

review Skill SHALL verify every checked task `- [x]` has corresponding code changes.

#### Scenario: Warn about checked task with no diff

**WHEN** tasks.md shows `- [x] 实现用户登录`  
**AND** git diff contains no login-related changes  
**THEN** review SHALL warn: "Task '实现用户登录' marked complete but no related code found"

---

### Requirement: Coding Standards Validation

review Skill SHALL validate code against domain.yaml coding_standards.

**Standards sources** (in order):
1. `domain.yaml` → coding_standards
2. `../../rules/code-quality.md`
3. Built-in defaults (TypeScript strict, error handling, etc.)

#### Scenario: Check backend standards

**WHEN** domain.yaml specifies "所有 API 必须有错误处理"  
**THEN** review SHALL verify all API routes have try-catch blocks

#### Scenario: Check frontend standards

**WHEN** domain.yaml specifies "函数式组件 + Hooks"  
**THEN** review SHALL warn if class components found in git diff

---

### Requirement: Business Logic Validation

review Skill SHALL check business rules from 10_DOCS/business/.

#### Scenario: Reference business requirements

**WHEN** 10_DOCS/business/user-management.md states "用户名最少3字符"  
**THEN** review SHALL verify validation logic enforces this rule

---

### Requirement: Auto-Fix vs Ask User

review Skill SHALL categorize issues and handle accordingly.

**Auto-fix** (no user input):
- Naming conventions (camelCase → snake_case)
- Missing comments
- Formatting issues

**Ask user** (requires decision):
- Business logic concerns
- Architecture decisions
- Security issues

#### Scenario: Auto-fix naming convention

**WHEN** review detects `user_id` in TypeScript (should be `userId`)  
**THEN** it SHALL auto-fix and report: "✅ Auto-fixed: 1 naming convention issue"

#### Scenario: Ask about business logic

**WHEN** review detects ambiguous validation rule  
**THEN** it SHALL ask user with recommended options

---

### Requirement: Remove GitLab Integration

review Skill SHALL NOT include GitLab IssueManager functionality from ai-drive-engine.

#### Scenario: Skip issue reporting

**WHEN** review finds issues  
**THEN** it SHALL NOT call IssueManager.report_failure()  
**AND** SHALL only log to `.claude/state/review-log.jsonl`

---

### Requirement: State Logging

review Skill SHALL log execution to `.claude/state/review-log.jsonl`.

**Log format**:
```json
{"ts":"2026-05-12T12:00:00Z","skill":"review","event":"completed","change":"add-auth","auto_fixed":3,"asked":1,"issues":4}
```

#### Scenario: Log auto-fixes and user interactions

**WHEN** review completes  
**THEN** log SHALL include counts of auto_fixed, asked, and remaining issues
