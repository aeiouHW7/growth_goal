## ADDED Requirements

### Requirement: financial_metrics.json 数据结构
config/financial_metrics.json 必须包含以下结构（initial值全部为null）：

```json
{
  "net_worth": { "current": null, "target_12m": null, "history": [] },
  "income_sources": { "active": [], "passive": [], "diversification_score": 0 },
  "passive_income_ratio": { "current": null, "target": "≥30%" },
  "monthly_savings_rate": { "current": null, "history": [] },
  "investment_portfolio": { "allocation": {}, "annual_return": null },
  "last_updated": null
}
```

### Requirement: 用户自愿填写
用户可以主动更新financial_metrics.json中的真实数字。系统不能强制。

#### Scenario: 用户主动更新
- **WHEN** 用户说"更新净资产到XXX万"
- **THEN** 更新 net_worth.current，记录到 history

### Requirement: 从碎碎念推断
当碎碎念中出现投资/收入关键词时，wealth_engine 可以推断填充（标注为"从碎碎念推断"）。

推断关键词：买了/投资/基金/股票/工资/被动收入/房租