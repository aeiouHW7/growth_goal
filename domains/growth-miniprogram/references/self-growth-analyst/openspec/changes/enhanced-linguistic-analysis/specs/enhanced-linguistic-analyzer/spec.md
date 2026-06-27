## ADDED Requirements

### Requirement: linguistic_analyzer 增强输出

#### 新增分析字段

| 字段 | 类型 | 说明 |
|------|------|------|
| tone_markers | string[] | 语气标记数组：justification/deflection/neutralization/minimization/blame_shift |
| defense_mechanisms | string[] | 防御机制：rationalization/minimization/blame_shift/denial |
| emotional_temperature | number | 情感温度：0-10，>7热<4冷 |
| implicit_intent | string | 推断出的隐层意图（没说出来的） |
| action_verbs_count | number | 行动词数量 |
| state_verbs_count | number | 状态词数量 |

#### 防御机制检测规则

| 防御机制 | 关键词示例 | 扣分 |
|---------|-----------|------|
| rationalization | "因为"/"所以"/"这样就能"/"为了" | -0.5 |
| minimization | "一点点"/"还行"/"没什么"/"就一点" | -0.5 |
| blame_shift | "是他让我"/"没办法"/"不得不" | -0.5 |
| deflection | "算了"/"不说这个了"/"反正"/"就这样" | -0.5 |

#### Scenario: 检测到合理化
- **WHEN** 用户说"因为周六所以放纵"
- **THEN** tone_markers包含"justification"
- **AND** defense_mechanisms包含"rationalization"
- **AND** implicit_intent = "为凌晨4:30睡觉寻找合理理由"

#### Scenario: 检测到最小化
- **WHEN** 用户说"就一点点累"
- **THEN** tone_markers包含"minimization"
- **AND** emotional_temperature偏低

#### Scenario: 隐层意图推断
- **WHEN** 用户说"周六可以放纵"
- **THEN** implicit_intent = "在为自己的失控行为寻找道德许可"

### Requirement: emotional_temperature 计算

#### 计算公式
```
emotional_temperature = (exclamation_count * 0.3 + emotion_words * 0.5 + question_ratio * 0.2)
```
- exclamation_count: 感叹号/感叹词数量
- emotion_words: 情绪词数量（焦虑/累/爽/烦等）
- question_ratio: 问句占比（越少越冷）

#### 温度分级
| 分数 | 级别 | 说明 |
|------|------|------|
| >7 | hot | 高参与/情绪化 |
| 4-7 | warm | 正常参与 |
| <4 | cool | 冷淡/防御/低参与 |

### Requirement: implicit_intent 生成规则

#### 推断逻辑
1. 分析表面内容和语气标记的组合
2. 识别防御机制类型
3. 推断行为背后的真实动机
4. 用简短句子输出（≤20字）

#### Scenario: 隐层意图推断
- **WHEN** 用户说"我也不知道为什么"
- **THEN** tone_markers包含"deflection"
- **AND** implicit_intent = "在回避对自身行为的深层反思"

### Requirement: linguistic_analyzer 输出格式

```json
{
  "归因分析": "...",
  "情绪分析": "...",
  "防卫分析": "...",
  "语言风格分析": {
    "tone_markers": ["justification", "deflection"],
    "defense_mechanisms": ["rationalization"],
    "emotional_temperature": 5,
    "implicit_intent": "为凌晨4:30睡觉寻找合理理由",
    "action_verbs_count": 3,
    "state_verbs_count": 1
  }
}
```

### Requirement: L2引擎触发条件

- **WHEN** 消息时间在00:00-06:00之间
- **OR** emotional_temperature < 4（冷淡）
- **OR** defense_mechanisms长度 ≥ 2
- **THEN** 触发 time_pattern_analyzer