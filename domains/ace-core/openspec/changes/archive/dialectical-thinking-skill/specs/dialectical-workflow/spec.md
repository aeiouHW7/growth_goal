# Dialectical Workflow Capability

## ADDED Requirements

### Requirement: Four-stage workflow execution
The system SHALL provide a four-stage dialectical thinking workflow consisting of Question, Explore, Compare, and Decide phases that can be executed sequentially.

#### Scenario: Complete workflow execution
- **WHEN** user accepts the dialectical workflow offer
- **THEN** system guides through Question → Explore → Compare → Decide stages in order

#### Scenario: Partial workflow execution
- **WHEN** user requests to skip to a specific stage (e.g., "skip to Explore")
- **THEN** system allows jumping to the requested stage without completing prior stages

### Requirement: Question stage - challenge assumptions
The system SHALL provide a Question stage that challenges the problem definition and identifies hidden assumptions.

#### Scenario: Question the requirement
- **WHEN** entering Question stage
- **THEN** system analyzes whether the requirement itself is reasonable and well-defined

#### Scenario: Identify assumptions
- **WHEN** analyzing the problem in Question stage
- **THEN** system lists all implicit assumptions found in the requirement

#### Scenario: Redefine the problem
- **WHEN** assumptions are identified
- **THEN** system offers a redefined problem statement that addresses the assumptions

### Requirement: Explore stage - generate multiple solutions
The system SHALL provide an Explore stage that generates 2-3 distinct solution approaches without bias.

#### Scenario: Generate multiple approaches
- **WHEN** entering Explore stage
- **THEN** system generates at least 2 different solution approaches with distinct core ideas

#### Scenario: Avoid premature judgment
- **WHEN** presenting solution approaches in Explore stage
- **THEN** system presents all approaches neutrally without indicating preference

#### Scenario: Document approach details
- **WHEN** presenting each approach
- **THEN** system includes core idea, key technologies, and high-level implementation strategy

### Requirement: Compare stage - analyze tradeoffs
The system SHALL provide a Compare stage that objectively compares solutions across multiple dimensions.

#### Scenario: Multi-dimensional comparison
- **WHEN** entering Compare stage
- **THEN** system compares approaches across at least 4 dimensions (complexity, performance, maintainability, learning curve)

#### Scenario: Comparison table format
- **WHEN** presenting comparison
- **THEN** system uses a markdown table with clear ratings or descriptions per dimension

#### Scenario: Identify key tradeoffs
- **WHEN** analyzing approaches in Compare stage
- **THEN** system explicitly lists 2-3 key tradeoff decisions (e.g., "complexity vs performance")

### Requirement: Decide stage - provide reasoned recommendation
The system SHALL provide a Decide stage that recommends a specific solution with clear reasoning.

#### Scenario: Make explicit recommendation
- **WHEN** entering Decide stage
- **THEN** system recommends exactly one approach with specific identification (e.g., "Recommend: Approach B")

#### Scenario: Justify recommendation
- **WHEN** making recommendation
- **THEN** system provides at least 2 concrete reasons supporting the choice

#### Scenario: Document risks and caveats
- **WHEN** making recommendation
- **THEN** system lists at least 2 potential risks or things to watch out for

#### Scenario: Explain non-recommended options
- **WHEN** making recommendation
- **THEN** system briefly explains why other approaches were not chosen

### Requirement: Workflow offer and user consent
The system SHALL offer the dialectical workflow to the user and allow them to accept or decline.

#### Scenario: Present workflow offer
- **WHEN** trigger conditions are met (complex decision detected)
- **THEN** system presents a clear offer describing the four stages and asks if user wants to proceed

#### Scenario: Accept workflow
- **WHEN** user accepts the workflow offer
- **THEN** system begins with Question stage

#### Scenario: Decline workflow
- **WHEN** user declines the workflow offer
- **THEN** system proceeds with direct discussion without entering the workflow

#### Scenario: Exit workflow mid-process
- **WHEN** user requests to exit during any stage (e.g., "just give me the recommendation")
- **THEN** system provides a summary and exits the workflow gracefully

### Requirement: Stage transition flexibility
The system SHALL allow flexible navigation between workflow stages.

#### Scenario: Sequential progression
- **WHEN** completing a stage without explicit navigation request
- **THEN** system asks if user wants to proceed to the next stage

#### Scenario: Skip stages
- **WHEN** user requests to skip a stage (e.g., "skip Question, I know the problem is well-defined")
- **THEN** system acknowledges and moves to the requested stage

#### Scenario: Return to previous stage
- **WHEN** user requests to return to a previous stage (e.g., "go back to Explore, I want to add another approach")
- **THEN** system returns to the requested stage and allows modifications

### Requirement: Output format consistency
The system SHALL produce consistent, structured markdown output for each workflow stage.

#### Scenario: Question stage output format
- **WHEN** completing Question stage
- **THEN** system outputs markdown with sections: "需求本身是否合理？", "有哪些隐含假设？", "问题定义是否清晰？"

#### Scenario: Explore stage output format
- **WHEN** completing Explore stage
- **THEN** system outputs markdown with "方案 A/B/C" headers, each containing "核心思路" and "关键技术"

#### Scenario: Compare stage output format
- **WHEN** completing Compare stage
- **THEN** system outputs a markdown table with dimensions as rows and approaches as columns, plus "关键权衡点" section

#### Scenario: Decide stage output format
- **WHEN** completing Decide stage
- **THEN** system outputs markdown with sections: "推荐方案", "推荐理由", "注意事项", "不推荐的原因"
