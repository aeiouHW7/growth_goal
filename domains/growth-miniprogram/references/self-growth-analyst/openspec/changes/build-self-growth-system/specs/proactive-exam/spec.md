# proactive-exam

## ADDED Requirements

### Requirement: 周考触发和时间

系统 SHALL 在以下时间触发周考：
- 时间：每周日 21:00
- 自动动作：从 `skills_library/` 随机抽取3个维度的 probe 问题，加上1道综合题
- 生成文件：`memories/weekly_summaries/YYYY-WW.md`

#### Scenario: 周考提醒（用户未主动分享）
- **WHEN** 当前时间接近22:10且用户今天还没有碎碎念
- **THEN** 系统主动发送提醒："今天还没分享，记得22:10前。"
- **AND** 提醒只发一次，不轰炸

### Requirement: 周考超时惩罚

用户必须在24小时内回答周考问题，否则相关维度默认 -0.5 分（执行力维度）。

#### Scenario: 周考超时
- **WHEN** 周考问题生成后24小时内用户未回答
- **THEN** 系统自动将执行力维度 -0.5 分
- **AND** 记录 `[超时惩罚]` 标记

### Requirement: 月考触发和时间

系统 SHALL 在以下时间触发月考：
- 时间：每月最后一天 20:00
- 自动动作：汇总本月所有碎碎念，调用 `core/scoring_engine.md` 生成20维报告
- 必须包含1-3个深度追问（从 lowest_three_dimensions 中选择）

#### Scenario: 月度评分流程
- **WHEN** 月底触发月度评分
- **THEN** 系统汇总本月所有碎碎念
- **AND** 调用 scoring_engine 生成20维评分
- **AND** 生成1-3个深度追问
- **AND** 输出完整报告到 `memories/monthly_reports/YYYY-MM.md`

### Requirement: 周考输出格式

周考文件必须包含以下格式：

```markdown
# 第 WW 周总结（日期范围）

## 碎碎念摘要
- 本周共 X 条，主要话题：...

## 周考题目与回答
1. 题目：...  
   回答：...

## 维度快照（仅分数变化）
| 维度 | 上周分 | 本周分 | 变化 |
|------|--------|--------|------|
| 认知 | 6 | 6.5 | +0.5 |

## 待追踪
- ...
```

#### Scenario: 周考记录存储
- **WHEN** 周考完成
- **THEN** 保存到 `memories/weekly_summaries/YYYY-WW.md`
- **AND** 更新 `config/capability_baseline.json` 中相关维度（如果有微调）

### Requirement: 月度报告格式

月度报告必须包含以下格式：

```markdown
# YYYY年MM月成长报告

## 20维完整评分表
（全部维度列出）

## 本月关键模式识别
- 模式1：...（证据：3次碎碎念）

## 下月提升重点
1. ...
2. ...

## 待追踪
- ...
```

### Requirement: 半年总结触发

系统 SHALL 每6个月触发一次半年总结，包含：
- 6个月的分数变化曲线
- 重大突破和持续退步分析
- 核心模式变化
- 一个让用户震撼的结论

#### Scenario: 半年总结触发
- **WHEN** 距上次总结6个月
- **THEN** 系统从 `config/capability_baseline.json` 加载所有历史评分
- **AND** 生成6个月的变化曲线
- **AND** 分析趋势和模式
- **AND** 给出一个让用户震撼的结论