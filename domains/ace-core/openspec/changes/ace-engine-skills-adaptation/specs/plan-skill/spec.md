## ADDED Requirements

### Requirement: Domain.yaml Awareness

plan Skill SHALL read domain.yaml to understand tech stack before planning.

#### Scenario: Plan based on project tech stack

**WHEN** domain.yaml shows database.type = "postgres"  
**THEN** plan SHALL suggest PostgreSQL-specific approaches (e.g., JSONB, full-text search)

### Requirement: Template Reference

plan Skill SHALL reference templates/domain-react-ts/ for project structure patterns.

#### Scenario: Follow established patterns

**WHEN** planning new features  
**THEN** plan SHALL suggest file locations matching template structure

### Requirement: Rules Compliance

plan Skill SHALL check ../../rules/architecture.md for architectural principles.

#### Scenario: Enforce architecture rules

**WHEN** planning cross-cutting changes  
**THEN** plan SHALL verify approach doesn't violate architecture rules
