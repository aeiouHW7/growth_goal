## ADDED Requirements

### Requirement: Path Adaptation from ai-drive-engine

verify Skill SHALL adapt ai-drive-engine paths to ACE Engine structure.

**Path mapping**:
| ai-drive-engine | ACE Engine |
|----------------|------------|
| `{agent}/10_DOCS/testing/<version>/` | `10_DOCS/testing/<version>/` |
| `{agent}/e2e-tests/` | `backend/tests/` |
| `local-dev.sh verify` | `npm test` |
| `.engine/active-agent` | ❌ Removed |

#### Scenario: Use npm test instead of shell script

**WHEN** verify needs to run tests  
**THEN** it SHALL execute `npm test` from backend/ directory  
**AND** NOT look for `local-dev.sh`

---

### Requirement: Build Verification

verify Skill SHALL execute build verification before running tests.

**Build commands**:
- Backend: `npm run build` or `npm run type-check`
- Frontend: `npm run build`

#### Scenario: Build verification passes

**WHEN** build completes with exit code 0  
**THEN** verify SHALL proceed to test execution

#### Scenario: Build verification fails with auto-fix

**WHEN** build fails with TypeScript error  
**THEN** verify SHALL:
1. Analyze error message
2. Attempt auto-fix (up to 3 rounds)
3. If still fails, pause and ask user

---

### Requirement: E2E Test Execution

verify Skill SHALL execute tests from backend/tests/ directory.

#### Scenario: Run tests with coverage

**WHEN** domain.yaml specifies `testing.unit_test_coverage: 80`  
**THEN** verify SHALL run `npm test -- --coverage`  
**AND** check if coverage >= 80%

#### Scenario: Handle test failures

**WHEN** tests fail  
**THEN** verify SHALL:
1. Show failed test names
2. Show test output/screenshots if available
3. Suggest fixes based on error messages
4. Auto-retry up to 5 rounds
5. If still fails, pause and report

---

### Requirement: Test Case Documentation

verify Skill SHALL ensure test cases are documented in 10_DOCS/testing/.

#### Scenario: Check for test case docs

**WHEN** apply phase created test scripts  
**THEN** verify SHALL check if corresponding test cases exist in `10_DOCS/testing/<version>/`  
**AND** warn if missing

#### Scenario: Create test case docs if missing

**WHEN** test cases don't exist  
**THEN** verify SHALL offer to generate test case documentation from test code

---

### Requirement: Remove GitLab Issue Integration

verify Skill SHALL NOT use GitLab IssueManager from ai-drive-engine.

#### Scenario: Skip issue creation

**WHEN** tests fail  
**THEN** verify SHALL NOT call IssueManager.report_failure()  
**AND** SHALL only log to `.claude/state/verify-log.jsonl`

---

### Requirement: Remove Agent Switching Logic

verify Skill SHALL NOT check `.engine/active-agent`.

#### Scenario: Execute in current project context

**WHEN** verify runs  
**THEN** it SHALL assume current directory is `domains/{project}/`  
**AND** NOT attempt to read `.engine/active-agent`

---

### Requirement: State Logging

verify Skill SHALL log execution to `.claude/state/verify-log.jsonl`.

**Log format**:
```json
{"ts":"2026-05-12T12:00:00Z","skill":"verify","event":"build_pass","change":"add-auth","duration_s":45}
{"ts":"2026-05-12T12:02:00Z","skill":"verify","event":"tests_pass","change":"add-auth","tests":12,"coverage":85,"duration_s":120}
```

#### Scenario: Log build and test results separately

**WHEN** build and tests both complete  
**THEN** verify SHALL write two log entries: one for build, one for tests
