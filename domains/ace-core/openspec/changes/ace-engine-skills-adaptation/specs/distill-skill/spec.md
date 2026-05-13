## ADDED Requirements

### Requirement: Extract Knowledge from Changes

distill Skill SHALL extract reusable knowledge from archived changes.

#### Scenario: Identify patterns

**WHEN** multiple changes solve similar problems  
**THEN** distill SHALL identify common patterns and suggest creating a template

### Requirement: Update 10_DOCS with Distilled Knowledge

distill Skill SHALL deposit distilled knowledge to 10_DOCS/patterns/ or 10_DOCS/best-practices/.

#### Scenario: Create pattern documentation

**WHEN** pattern is identified  
**THEN** distill SHALL create `10_DOCS/patterns/{pattern-name}.md`

### Requirement: Path Adaptation

distill Skill SHALL NOT use {agent} paths.

#### Scenario: Use relative paths

**WHEN** reading archived changes  
**THEN** distill SHALL read from `openspec/archive/` (not `{agent}/openspec/archive/`)
