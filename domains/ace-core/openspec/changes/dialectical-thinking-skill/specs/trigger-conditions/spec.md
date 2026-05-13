# Trigger Conditions Capability

## ADDED Requirements

### Requirement: Automatic workflow triggering
The system SHALL automatically detect when dialectical thinking is beneficial and offer the workflow proactively.

#### Scenario: Complex decision detection
- **WHEN** user request involves choosing between multiple technical approaches
- **THEN** system detects this as a complex decision and offers dialectical workflow

#### Scenario: Architecture design detection
- **WHEN** user request involves designing system architecture or data models
- **THEN** system detects this as an architecture task and offers dialectical workflow

#### Scenario: Technical tradeoff detection
- **WHEN** user request explicitly mentions tradeoffs, pros/cons, or comparison
- **THEN** system detects this as a tradeoff analysis and offers dialectical workflow

#### Scenario: Framework/library selection detection
- **WHEN** user asks about choosing frameworks, libraries, or tools
- **THEN** system detects this as a selection task and offers dialectical workflow

### Requirement: Trigger condition keywords
The system SHALL recognize specific keywords and phrases that indicate the need for dialectical thinking.

#### Scenario: Decision keywords
- **WHEN** user message contains keywords: "should I", "which one", "what's better", "how to choose"
- **THEN** system recognizes these as decision-making contexts and considers triggering

#### Scenario: Design keywords
- **WHEN** user message contains keywords: "design", "architecture", "structure", "schema", "API design"
- **THEN** system recognizes these as design contexts and considers triggering

#### Scenario: Comparison keywords
- **WHEN** user message contains keywords: "compare", "vs", "pros and cons", "tradeoffs", "alternatives"
- **THEN** system recognizes these as comparison contexts and considers triggering

#### Scenario: Analysis keywords
- **WHEN** user message contains keywords: "analyze", "evaluate", "assess", "consider"
- **THEN** system recognizes these as analysis contexts and considers triggering

### Requirement: Exclude simple tasks
The system SHALL NOT trigger dialectical workflow for clearly simple or straightforward tasks.

#### Scenario: Exclude formatting tasks
- **WHEN** user request is about code formatting, linting, or style fixes
- **THEN** system does not offer dialectical workflow

#### Scenario: Exclude typo fixes
- **WHEN** user request is about fixing typos, renaming variables, or similar trivial changes
- **THEN** system does not offer dialectical workflow

#### Scenario: Exclude direct implementation
- **WHEN** user has already made a clear decision and is requesting implementation
- **THEN** system does not offer dialectical workflow

#### Scenario: Exclude single-solution problems
- **WHEN** problem clearly has only one reasonable solution
- **THEN** system does not offer dialectical workflow

### Requirement: Manual triggering support
The system SHALL allow users to manually invoke dialectical thinking even when automatic triggers don't fire.

#### Scenario: Explicit skill invocation
- **WHEN** user says "use dialectical thinking" or "辩证思考"
- **THEN** system immediately enters dialectical workflow

#### Scenario: Request for analysis
- **WHEN** user asks "can you analyze this dialectically" or "帮我辩证分析"
- **THEN** system immediately enters dialectical workflow

### Requirement: OpenSpec integration awareness
The system SHALL be aware of OpenSpec phases and consider them in triggering logic.

#### Scenario: Explore phase awareness
- **WHEN** currently in OpenSpec explore phase
- **THEN** system is more likely to offer dialectical workflow for design questions

#### Scenario: Plan phase awareness
- **WHEN** currently in OpenSpec plan phase
- **THEN** system is more likely to offer dialectical workflow for implementation approach decisions

#### Scenario: Apply phase suppression
- **WHEN** currently in OpenSpec apply phase (active implementation)
- **THEN** system is less likely to interrupt with dialectical workflow unless explicitly requested

### Requirement: Context-aware triggering
The system SHALL consider conversation context when deciding whether to trigger.

#### Scenario: First major decision
- **WHEN** user presents their first significant technical decision in the conversation
- **THEN** system offers dialectical workflow to establish thorough decision-making

#### Scenario: Repeated similar tasks
- **WHEN** user has declined dialectical workflow for similar tasks multiple times
- **THEN** system reduces automatic triggering frequency for similar contexts

#### Scenario: User explicitly asked for quick answer
- **WHEN** user message includes phrases like "quick question", "just tell me", "don't overthink"
- **THEN** system does not trigger dialectical workflow

### Requirement: Aggressive description for skill matching
The Skill's description field SHALL contain comprehensive keywords to maximize correct triggering.

#### Scenario: Description contains decision keywords
- **WHEN** Skill description is evaluated
- **THEN** it SHALL include: "complex decisions", "architecture choices", "technical tradeoffs"

#### Scenario: Description contains design keywords
- **WHEN** Skill description is evaluated
- **THEN** it SHALL include: "feature design", "API design", "database schema design"

#### Scenario: Description contains selection keywords
- **WHEN** Skill description is evaluated
- **THEN** it SHALL include: "multi-option selection", "framework selection", "technology choice"

#### Scenario: Description contains analysis keywords
- **WHEN** Skill description is evaluated
- **THEN** it SHALL include: "requirement analysis", "tradeoff analysis", "solution comparison"
