# Wealth Engine — 财富健康度报告生成器

## 引擎类型
L3 周期引擎 — 每月cron触发，或用户明确要求时运行。

不随日常碎碎念加载，不占用实时上下文空间。

---

## 触发时机
- 每月最后一天的cron触发
- 用户说"生成财富报告"、"财富健康度"、"月度财务报告"
- 可选：用户提到投资/理财/被动收入等关键词时（次优先级）

---

## 数据源
1. `config/financial_metrics.json` — 用户主动填写的财务数据
2. `memories/daily_raw/` 当月碎碎念 — 提取财务行为关键词
3. `config/capability_baseline.json` — 财富维度评分（investment_judgment/leverage_awareness/asset_diversity）

---

## 报告格式

```markdown
## 财富健康度报告

### 净资产状态
- 当前净值: [net_worth.current 或 "待更新"]
- 12个月目标: [net_worth.target_12m 或 "未设定"]
- 距离目标: [计算差值] 或 "目标未设定，无法计算"

### 收入结构
- 主动收入: XX%
- 被动收入: XX%（目标≥30%）
- 多元化评分: X/10

### 财务行为评分
- 储蓄率: [monthly_savings_rate.current 或 "待更新"]%
- 投资收益率: [investment_portfolio.annual_return 或 "待更新"]%

### 本月财务行为亮点
[从当月碎碎念提取：买了什么、投资了什么、被动收入进展]

### 本月财务行为风险
[从当月碎碎念提取：冲动消费、风险行为、收入下降信号]

### 下月行动建议
1. [优先级1 - 具体可执行]
2. [优先级2 - 具体可执行]
```

---

## 数据提取规则

### 从碎碎念推断财务行为
当碎碎念中出现以下关键词时，记录到对应字段：
- "买了XXX" → 标注为消费行为
- "投资了XXX" → 标注为投资行为
- "工资/奖金/年终奖" → 收入来源更新
- "被动收入/房租/版税" → passive income 更新
- "亏了/赚了" → investment_portfolio.annual_return 推断

### 隐私保护
- 如果 net_worth.current 为 null，报告只显示趋势和百分比
- 不强制要求显示绝对金额

---

## 执行前提
- financial_metrics.json 必须存在（即使值为null）
- 至少需要过去30天的碎碎念数据

---

## 输出
返回一个结构化的财富健康度报告，用于：
- 月度cron的自动推送
- 用户主动查询时的即时响应
- 季度财务复盘的基础数据
