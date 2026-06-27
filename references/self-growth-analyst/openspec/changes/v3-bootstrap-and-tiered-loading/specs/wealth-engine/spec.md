## ADDED Requirements

### Requirement: wealth_engine.md 月度财富健康度报告
core/wealth_engine.md 是L3周期引擎，每月cron触发。

#### Scenario: 月度报告生成
- **WHEN** 每月最后一天，或用户说"生成财富报告"
- **THEN** 读取 financial_metrics.json + 当月碎碎念 → 输出财富健康度报告

#### 报告格式
```markdown
## 财富健康度报告

### 净资产状态
- 当前净值: XXX万（null时显示"待更新"）
- 12个月目标: XXX万
- 距离目标: +/-XXX万

### 收入结构
- 主动收入: XX%
- 被动收入: XX%（目标≥30%）
- 多元化评分: X/10

### 财务行为评分
- 储蓄率: XX%
- 投资收益率: XX%
- 本月财务行为亮点: [从碎碎念提取]
- 本月财务行为风险: [从碎碎念提取]

### 下月行动建议
- [优先级1]
- [优先级2]
```

### Requirement: 不暴露绝对数字
报告可以显示百分比例和趋势，但不强制要求显示绝对金额。

#### Scenario: 用户隐私
- **WHEN** 用户不想暴露具体数字
- **THEN** 报告可以只显示"净值趋势上升/下降"和百分比变化

### Requirement: L3引擎不随碎碎念加载
wealth_engine 只在以下时机运行：
- 每月最后一天的cron触发
- 用户明确说"生成财富报告"