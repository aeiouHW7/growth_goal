## ADDED Requirements

### Requirement: Version Bump in domain.yaml

release Skill SHALL update version in domain.yaml (if field exists).

#### Scenario: Increment version

**WHEN** releasing a new version  
**THEN** release SHALL update `project.version` in domain.yaml

### Requirement: Generate Release Notes

release Skill SHALL generate release notes from 10_DOCS/CHANGELOG.md.

#### Scenario: Create release notes

**WHEN** preparing release  
**THEN** release SHALL extract recent changes from CHANGELOG and format as release notes

### Requirement: Path Adaptation

release Skill SHALL NOT use {agent} paths from ai-drive-engine.

#### Scenario: Use relative paths for release artifacts

**WHEN** creating release documentation  
**THEN** release SHALL use `10_DOCS/releases/` (not `{agent}/10_DOCS/releases/`)
