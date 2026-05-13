## ADDED Requirements

### Requirement: Automated Workflow Execution

autopilot Skill SHALL execute complete workflow (propose → apply → review → verify) with minimal user intervention.

#### Scenario: Full automation

**WHEN** user provides high-level requirement  
**THEN** autopilot SHALL:
1. Call ace-propose to create proposal
2. Get user approval
3. Call ace-apply to implement
4. Call review to check code
5. Call verify to run tests
6. Call ace-archive if all pass

### Requirement: Smart Pausing

autopilot Skill SHALL pause and ask user when critical decisions needed.

#### Scenario: Pause for architecture decisions

**WHEN** dialectical-thinking suggests multiple equally-valid approaches  
**THEN** autopilot SHALL pause and ask user to choose

### Requirement: Path Adaptation

autopilot Skill SHALL work within ACE Engine project structure.

#### Scenario: Execute in current project

**WHEN** autopilot runs  
**THEN** it SHALL assume current directory is `domains/{project}/` and execute all Skills in that context
