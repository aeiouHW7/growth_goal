## ADDED Requirements

### Requirement: Deposit Retrospective to 10_DOCS

retro Skill SHALL save retrospective results to 10_DOCS/retrospectives/<date>.md.

#### Scenario: Create retrospective document

**WHEN** retro completes  
**THEN** it SHALL create `10_DOCS/retrospectives/2026-05-12.md` with findings

### Requirement: Update Decisions Log

retro Skill SHALL update 10_DOCS/decisions.md with key learnings.

#### Scenario: Record important decisions

**WHEN** retrospective identifies process improvements  
**THEN** retro SHALL append to `10_DOCS/decisions.md`

### Requirement: Path Adaptation

retro Skill SHALL NOT use {agent} placeholders from ai-drive-engine.

#### Scenario: Use relative paths

**WHEN** creating retrospective files  
**THEN** retro SHALL use `10_DOCS/retrospectives/` directly (not `{agent}/10_DOCS/retrospectives/`)
