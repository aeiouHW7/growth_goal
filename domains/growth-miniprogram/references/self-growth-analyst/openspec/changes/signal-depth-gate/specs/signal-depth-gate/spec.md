## ADDED Requirements

### Requirement: signal_depth_gate.md 核心规格
`core/signal_depth_gate.md` 是L1常驻引擎，~200 tokens。

#### 信号厚度评分（0-10）
| 维度 | 权重 | 评分标准 |
|------|:--:|------|
| 具体行为 | 3 | "我做了X"=3分，"有人搞我"=1分，完全无行为=0分 |
| 归因指向 | 2 | "因为X"=2分，"不知道"=0分 |
| 情绪具体 | 2 | "我焦虑，担心OKR完不成"=2分，"烦"=0.5分 |
| 时间锚定 | 2 | "今天下午"=2分，无时间=0分 |
| 涉及维度 | 1 | 提到具体能力维度=1分，未提及=0分 |

#### Scenario: 厚度足够
- **WHEN** 总分 ≥ 5
- **THEN** 继续正常流程（Step 4 → Step 5 → Step 6）

#### Scenario: 厚度不足 → 缺口探测
- **WHEN** 总分 < 5
- **THEN** 检查哪个子维度得分为0，确定缺口类型

### Requirement: 缺口类型与追问方向

| 缺口类型 | 触发条件 | 追问方向 |
|---------|---------|---------|
| [行为缺失] | 具体行为 = 0 | 「你今天具体做了什么？」 |
| [归因缺失] | 归因指向 = 0 | 「你觉得是什么原因造成的？」 |
| [情绪模糊] | 情绪具体 < 1 | 「你说的XX，具体是哪种感受？焦虑/无力/愤怒？」 |
| [时间缺失] | 时间锚定 = 0 | 「这是什么时候的事？」 |

### Requirement: 追问锚定历史模式
追问必须包含以下至少一项：
1. retrieval_index 中频率 ≥2 的模式引用
2. active_conflicts 中的相关矛盾
3. pending_actions 中状态为 pending 的行动

#### Scenario: 锚定追问示例
- retrieval_index 最高频模式为「知道但不做」（频率7）
- 本次输入涉及执行相关话题
- 追问：「你之前说过很多次'知道但不做'。这次说的'烦'，和这个有关系吗？你今天具体没做什么？」

### Requirement: 追问上限 ≤ 2次

#### Scenario: 第1次追问后仍不足
- **WHEN** 用户补充后评分仍 < 5
- **THEN** 发出第2次追问（换一个缺口方向）

#### Scenario: 第2次追问后仍不足
- **WHEN** 用户补充后评分仍 < 5
- **THEN** 归档 [极薄输入]，跳过 Step 5-6，输出 NO_REPLY

### Requirement: [极薄输入] 归档格式
```markdown
[极薄输入] 信号厚度评分: N/10
缺口: [行为缺失]/[归因缺失]/[情绪模糊]/[时间缺失]
追问次数: 2
状态: 已归档，未分析
```

### Requirement: L1引擎注册
- 路径: `core/signal_depth_gate.md`
- 层级: L1（每次碎碎念必加载）
- 触发时机: linguistic_analyzer 输出后立即执行
- 执行顺序: linguistic_analyzer → signal_depth_gate → auto_insight_generator
