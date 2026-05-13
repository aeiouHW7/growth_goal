## ADDED Requirements

### Requirement: coding_standards Field

domain.yaml SHALL support optional `coding_standards` field for review Skill.

**Structure**:
```yaml
coding_standards:
  backend:
    - "Rule 1"
    - "Rule 2"
  frontend:
    - "Rule 1"
  api:
    - "Rule 1"
```

#### Scenario: Provide coding standards to review

**WHEN** review Skill reads domain.yaml  
**THEN** it SHALL use coding_standards field if present  
**AND** fallback to `../../rules/code-quality.md` if field absent

---

### Requirement: testing Field

domain.yaml SHALL support optional `testing` field for verify Skill.

**Structure**:
```yaml
testing:
  unit_test_coverage: 80
  e2e_test_required: true
  test_framework: vitest
```

#### Scenario: Configure test coverage threshold

**WHEN** verify Skill runs tests  
**THEN** it SHALL check coverage against `testing.unit_test_coverage`  
**AND** warn if below threshold

---

### Requirement: Backward Compatibility

Extended domain.yaml SHALL remain compatible with projects that don't have new fields.

#### Scenario: Work without coding_standards field

**WHEN** domain.yaml lacks `coding_standards`  
**THEN** review SHALL use default rules from `../../rules/`  
**AND** NOT fail

#### Scenario: Work without testing field

**WHEN** domain.yaml lacks `testing`  
**THEN** verify SHALL use default settings (coverage 80%, framework auto-detect)  
**AND** NOT fail

---

### Requirement: Template Update

templates/domain.yaml.template SHALL include example coding_standards and testing fields.

#### Scenario: New projects get extended template

**WHEN** ace-create-project generates domain.yaml  
**THEN** it SHALL use template with coding_standards and testing examples (commented out)
