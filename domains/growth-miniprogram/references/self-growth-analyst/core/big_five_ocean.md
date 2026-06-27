# 大五人格 OCEAN 分析

## 五维度定义
- O (Openness): 开放性 - 对新经验的开放程度
- C (Conscientiousness): 尽责性 - 组织性和可靠性
- E (Extraversion): 外向性 - 社会能量水平
- A (Agreeableness): 宜人性 - 合作和信任倾向
- N (Neuroticism): 神经质 - 情绪稳定性

## 数据积累期规则
- 前3个月：只记录，不计算
- 启动条件：积累足够数据后（约90天）

## 干预策略适配
- 尽责性低 → 多设外部提醒和约束
- 神经质高 → 强化情绪智力和抗压维度干预
- 开放性低 → 鼓励尝试新方法
- 宜人性高 → 注意边界和拒绝能力

## 每次分析输出格式
- 主导维度: xxx
- 基线状态: 1-10
- 建议策略: xxx

---

## 人格→能力维度映射表

本映射表在90天数据积累后启用。当前仅作规格参考。

### 映射表

| OCEAN维度 | 正向影响能力维度 | 负向风险 |
|-----------|-----------------|---------|
| O(开放性)高 | creativity, learning, strategic_thinking | execution(想太多做太少) |
| C(尽责性)低 | execution, time_management, goal_drive | — |
| E(外向性)高 | influence, social_wisdom, leadership | self_awareness(外部验证依赖) |
| A(宜人性)高 | communication, emotional_intelligence | decision, negotiation(该强硬时软弱) |
| N(神经质)高 | — (全是负面影响) | resilience, decision, emotional_intelligence |

### 计算公式（90天后启用）

当OCEAN评估完成后，每个能力维度的system_calculated_score基于人格基线做偏移：

```
system_calculated_score = 
  (capability_baseline_score × 0.7) + 
  (ocean_influence_factor × 0.3)

其中ocean_influence_factor = 
  正向维度贡献 - 负向风险惩罚
```

### 正向/负向维度贡献计算

- O(开放性)高: creativity +0.3, learning +0.2, strategic_thinking +0.2, execution -0.2
- C(尽责性)低: execution -0.3, time_management -0.2, goal_drive -0.2
- E(外向性)高: influence +0.2, social_wisdom +0.2, leadership +0.1, self_awareness -0.15
- A(宜人性)高: communication +0.25, emotional_intelligence +0.2, decision -0.2, negotiation -0.2
- N(神经质)高: resilience -0.3, decision -0.2, emotional_intelligence -0.25

### 启用条件
- 90天碎碎念数据积累完成
- OCEAN评估完成（每季度重新评估）
- capability_baseline 有足够的行为证据
