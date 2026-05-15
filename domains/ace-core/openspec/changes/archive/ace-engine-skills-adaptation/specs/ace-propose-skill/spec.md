## ADDED Requirements

### Requirement: ACE Context Loading

ace-propose Skill SHALL automatically load ACE Engine project context before generating proposal artifacts.

**Context includes**:
- `domain.yaml` - Project configuration
- `10_DOCS/` - Business and technical documentation
- `../../rules/` - Global coding standards from root directory

#### Scenario: Load context at skill startup

**WHEN** user triggers ace-propose Skill  
**THEN** the Skill SHALL:
- Read `domain.yaml` to understand project name, tech stack, database config
- List available files in `10_DOCS/` directory
- Note the existence of `../../rules/code-quality.md` for later reference

---

### Requirement: Dialectical Thinking Integration

ace-propose Skill SHALL proactively suggest using dialectical-thinking Skill when creating design artifacts.

#### Scenario: Suggest dialectical thinking for technical decisions

**WHEN** design.md requires choosing between multiple technical approaches  
**THEN** the Skill SHALL suggest:  
"要不要我用 dialectical-thinking 对比一下这几个方案？"

#### Scenario: Auto-invoke for critical decisions

**WHEN** proposal involves architecture changes or new dependencies  
**THEN** the Skill SHALL automatically invoke dialectical-thinking before writing design.md

---

### Requirement: Testing Tasks Generation

ace-propose Skill SHALL automatically append testing preparation tasks to tasks.md.

**Testing tasks group**:
```markdown
## N. 测试准备

- [ ] N.1 代码审查：运行 review Skill 检查代码质量
- [ ] N.2 构建验证：运行 verify Skill 执行测试
- [ ] N.3 文档更新：更新 10_DOCS/ 相关文档
```

#### Scenario: Add testing tasks to all proposals

**WHEN** tasks.md is generated  
**THEN** the Skill SHALL append a "测试准备" section with review and verify tasks

#### Scenario: Skip testing tasks for documentation-only changes

**WHEN** proposal only involves documentation updates (no code changes)  
**THEN** the Skill MAY omit testing tasks

---

### Requirement: Domain.yaml Awareness in Proposal

ace-propose Skill SHALL reference domain.yaml configuration in proposal.md.

#### Scenario: Include tech stack from domain.yaml

**WHEN** generating proposal.md  
**THEN** the Impact section SHALL include:  
"技术栈: [从 domain.yaml 读取的 project.stack 或 database.type]"

#### Scenario: Warn about port conflicts

**WHEN** domain.yaml shows database.port is 5432  
**THEN** the Skill SHALL check if port is already mentioned in proposal and warn if changed

---

### Requirement: Rules Compliance Check

ace-propose Skill SHALL validate proposal against global rules before completion.

#### Scenario: Check for dialectical thinking requirement

**WHEN** proposal.md is created  
**THEN** the Skill SHALL verify it includes a "方案对比" section (per rules/dialectical-thinking.md)

#### Scenario: Warn if missing risk assessment

**WHEN** proposal.md lacks "风险评估" section  
**THEN** the Skill SHALL warn user and suggest adding it

---

### Requirement: Official OpenSpec Integration

ace-propose Skill SHALL delegate core proposal generation to official openspec-propose.

**Delegation**:
- Call `openspec new change <name>` to create change directory
- Call `openspec instructions <artifact>` to get templates
- Follow official artifact build order (proposal → design → specs → tasks)

#### Scenario: Seamless official skill invocation

**WHEN** ace-propose Skill runs  
**THEN** it SHALL:
1. Load ACE context (10_DOCS, domain.yaml, rules)
2. Invoke official openspec-propose with enhanced context
3. Post-process generated artifacts to inject ACE-specific content

#### Scenario: Handle official skill failures

**WHEN** official openspec-propose fails  
**THEN** ace-propose SHALL:
- Display the official error message
- Suggest potential fixes based on ACE Engine context
- Not proceed with ACE enhancements

---

### Requirement: State Logging

ace-propose Skill SHALL log execution to `.claude/state/propose-log.jsonl`.

**Log format**:
```json
{"ts":"2026-05-12T12:00:00Z","skill":"ace-propose","event":"started","change":"add-auth"}
{"ts":"2026-05-12T12:01:30Z","skill":"ace-propose","event":"completed","change":"add-auth","artifacts":["proposal","design","specs","tasks"]}
```

#### Scenario: Log successful execution

**WHEN** ace-propose completes successfully  
**THEN** it SHALL write an "event":"completed" log entry with list of created artifacts

#### Scenario: Log failures with error details

**WHEN** ace-propose encounters an error  
**THEN** it SHALL write an "event":"failed" log entry with error message
