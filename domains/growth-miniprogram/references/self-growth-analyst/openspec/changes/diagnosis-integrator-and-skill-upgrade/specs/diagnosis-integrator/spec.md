## ADDED Requirements

### Requirement: Diagnostician 融合逻辑
Step 5.5 必须收集所有引擎输出，并按规则融合为一个核心诊断传递给 Step 6。

#### Scenario: 多引擎同时输出
- **WHEN** habit_behavior_engine 输出"动机不足" AND psychodynamic_engine 输出"深层恐惧"
- **THEN** Diagnostician 融合输出 primary_diagnosis="深层恐惧", surface_diagnosis="动机不足"

#### Scenario: 无引擎异常但模式频率高
- **WHEN** 没有引擎输出异常，但 retrieval_index 中某模式近7天频率≥3
- **THEN** 以该模式作为 primary_diagnosis

#### Scenario: 模式上游下游关系
- **WHEN** 模式A是模式B的上游（如"害怕失败"导致"知道但不做"）
- **THEN** 优先处理上游模式，primary_diagnosis指向上游

#### Scenario: 多引擎无层级
- **WHEN** 多个引擎输出且没有明显层级差异
- **THEN** 选择近7天频率最高的模式作为主诊断

### Requirement: 融合输出格式
Diagnostician 必须输出包含 primary_diagnosis/surface_diagnosis/triggered_dimensions/recommended_skill_dimension/reason 的结构化对象。

#### Scenario: 输出格式验证
- **WHEN** Step 5.5 完成
- **THEN** 输出对象包含全部5个字段，Step 6 可直接使用 recommended_skill_dimension 加载对应 skill