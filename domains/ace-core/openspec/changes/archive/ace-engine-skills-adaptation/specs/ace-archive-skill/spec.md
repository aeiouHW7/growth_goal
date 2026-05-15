## ADDED Requirements

### Requirement: Knowledge Deposition to 10_DOCS

ace-archive Skill SHALL deposit key design decisions to 10_DOCS/ when archiving changes.

#### Scenario: Archive important architecture decisions

**WHEN** proposal involves architecture changes  
**THEN** ace-archive SHALL:
1. Extract key decisions from design.md
2. Create/update `10_DOCS/architecture/decisions.md`
3. Include timestamp and change reference

---

### Requirement: CHANGELOG Update

ace-archive Skill SHALL update 10_DOCS/CHANGELOG.md with change summary.

#### Scenario: Add entry to CHANGELOG

**WHEN** archiving a change  
**THEN** ace-archive SHALL prepend an entry to `10_DOCS/CHANGELOG.md`:
```markdown
## [Date] - Change Name

- Summary of what changed
- Key decisions made
- Breaking changes (if any)
```

---

### Requirement: Regression Test Index

ace-archive Skill SHALL create regression test index for core features.

#### Scenario: Index regression tests

**WHEN** verify phase created test cases in `10_DOCS/testing/regression/`  
**THEN** ace-archive SHALL update `10_DOCS/testing/regression/README.md` with test list

---

### Requirement: Official OpenSpec Archive Integration

ace-archive Skill SHALL delegate archiving to official openspec-archive-change.

#### Scenario: Call official archive skill

**WHEN** ace-archive runs  
**THEN** it SHALL:
1. Call official openspec-archive-change
2. After official archiving completes, perform ACE-specific depositions (10_DOCS, CHANGELOG)

---

### Requirement: State Logging

ace-archive Skill SHALL log to `.claude/state/archive-log.jsonl`.

#### Scenario: Log archived changes

**WHEN** archiving completes  
**THEN** log SHALL include change name, artifacts archived, and 10_DOCS files updated
