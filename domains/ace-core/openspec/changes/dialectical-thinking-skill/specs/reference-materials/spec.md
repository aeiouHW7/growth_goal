# Reference Materials Capability

## ADDED Requirements

### Requirement: Progressive disclosure of reference materials
The system SHALL provide reference materials as separate files that can be loaded on demand rather than all at once.

#### Scenario: Core workflow without references
- **WHEN** dialectical workflow is triggered
- **THEN** system loads only SKILL.md without automatically loading reference files

#### Scenario: On-demand reference loading
- **WHEN** user asks for more guidance during workflow
- **THEN** system suggests specific reference files relevant to the current stage

### Requirement: Principles reference file
The system SHALL provide a principles.md file containing core dialectical thinking principles.

#### Scenario: Principles file exists
- **WHEN** reference materials are set up
- **THEN** a file SHALL exist at `skills/coding/dialectical-thinking/references/principles.md`

#### Scenario: Principles content structure
- **WHEN** principles.md is loaded
- **THEN** it SHALL contain 5-7 core principles, each with a 50-word explanation and brief example

#### Scenario: Suggest principles during Question stage
- **WHEN** user is in Question stage and needs guidance on challenging assumptions
- **THEN** system suggests reading principles.md

### Requirement: Patterns reference file
The system SHALL provide a patterns.md file containing structured thinking patterns and templates.

#### Scenario: Patterns file exists
- **WHEN** reference materials are set up
- **THEN** a file SHALL exist at `skills/coding/dialectical-thinking/references/patterns.md`

#### Scenario: Patterns content structure
- **WHEN** patterns.md is loaded
- **THEN** it SHALL contain 3-5 thinking patterns, each with a template and usage scenarios

#### Scenario: Suggest patterns during Explore stage
- **WHEN** user is in Explore stage and needs help generating approaches
- **THEN** system suggests reading patterns.md

### Requirement: Examples reference file
The system SHALL provide an examples.md file containing real-world case studies.

#### Scenario: Examples file exists
- **WHEN** reference materials are set up
- **THEN** a file SHALL exist at `skills/coding/dialectical-thinking/references/examples.md`

#### Scenario: Examples content structure
- **WHEN** examples.md is loaded
- **THEN** it SHALL contain 2-3 real case studies showing complete dialectical workflow

#### Scenario: Suggest examples during Compare stage
- **WHEN** user is in Compare stage and needs inspiration for comparison
- **THEN** system suggests reading examples.md

### Requirement: Reference file independence
Reference files SHALL be independently readable and self-contained.

#### Scenario: Standalone readability
- **WHEN** a user reads any reference file directly
- **THEN** the file SHALL be understandable without requiring context from SKILL.md

#### Scenario: Cross-reference links
- **WHEN** reference files mention related concepts
- **THEN** they MAY include relative links to other reference files

### Requirement: Minimal token consumption
The system SHALL minimize context token usage by loading references only when beneficial.

#### Scenario: Experienced user workflow
- **WHEN** user is familiar with dialectical thinking
- **THEN** system completes workflow without loading any reference files

#### Scenario: Novice user workflow
- **WHEN** user is new to dialectical thinking and asks for help
- **THEN** system loads only the specific reference file relevant to current stage

### Requirement: Reference suggestion format
The system SHALL use a consistent format when suggesting reference materials.

#### Scenario: Suggestion prompt format
- **WHEN** suggesting a reference file
- **THEN** system uses format: "需要更多指引？查看 [specific guidance]: `path/to/reference.md`"

#### Scenario: Multiple references suggestion
- **WHEN** multiple reference files are relevant
- **THEN** system lists them with clear descriptions of what each contains

### Requirement: Principles content requirements
The principles.md file SHALL contain foundational dialectical thinking principles.

#### Scenario: First principles thinking
- **WHEN** principles.md is loaded
- **THEN** it SHALL include "第一性原理" (first principles) with explanation and example

#### Scenario: Reverse thinking
- **WHEN** principles.md is loaded
- **THEN** it SHALL include "逆向思维" (reverse thinking) with explanation and example

#### Scenario: Devil's advocate
- **WHEN** principles.md is loaded
- **THEN** it SHALL include "魔鬼代言人" (devil's advocate) with explanation and example

#### Scenario: Question assumptions
- **WHEN** principles.md is loaded
- **THEN** it SHALL include "质疑假设" (question assumptions) with explanation and example

### Requirement: Patterns content requirements
The patterns.md file SHALL contain structured analysis templates.

#### Scenario: SWOT analysis pattern
- **WHEN** patterns.md is loaded
- **THEN** it SHALL include SWOT analysis template and when to use it

#### Scenario: Five Whys pattern
- **WHEN** patterns.md is loaded
- **THEN** it SHALL include "五个为什么" (Five Whys) pattern and when to use it

#### Scenario: Decision matrix pattern
- **WHEN** patterns.md is loaded
- **THEN** it SHALL include decision matrix template and when to use it

### Requirement: Examples content requirements
The examples.md file SHALL contain realistic, detailed case studies.

#### Scenario: Complete workflow example
- **WHEN** examples.md is loaded
- **THEN** at least one example SHALL show all four stages (Question → Explore → Compare → Decide)

#### Scenario: Real project context
- **WHEN** examples.md is loaded
- **THEN** examples SHALL be based on real ACE Engine design decisions (anonymized if needed)

#### Scenario: Diverse problem types
- **WHEN** examples.md is loaded
- **THEN** it SHALL include examples from different categories (architecture, API design, technology selection)

### Requirement: Reference file maintenance
Reference files SHALL be updated based on usage patterns and user feedback.

#### Scenario: Outdated example detection
- **WHEN** an example references deprecated technology or practices
- **THEN** it SHALL be updated or marked as historical reference

#### Scenario: New principle addition
- **WHEN** a new valuable dialectical principle is identified through usage
- **THEN** it SHALL be added to principles.md with proper documentation
