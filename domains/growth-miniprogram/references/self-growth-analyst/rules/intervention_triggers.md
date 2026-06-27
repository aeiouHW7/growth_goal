# 干预触发规则 (Intervention Triggers)

## 触发条件（必须同时满足）

### 基本条件（AND）
- 用户输入类型 = 碎碎念（不是考题回答/紧急提问）
- 当前不在保护模式中

### 模式触发条件（满足任一即可）
1. **频率触发**: 近7天同一卡点出现≥2次
2. **进步触发**: 用户首次完成之前拖延的任务
3. **退步触发**: 某维度评分连续2周下降

### 信号触发条件（满足任一即可）
4. **阻抗信号**: 用户回复变短（<20字）、延迟回复、转移话题
5. **自我批判信号**: 用户说"我真差劲"、"我怎么又..."
6. **极端情绪信号**: 用户说"受不了了"、"想放弃了"

### 危险触发（立即出手，不管其他条件）
7. **自我伤害信号**: 用户说"活着没意思"、"不想活了"
8. **极端失控信号**: 用户说"我控制不住了"

### 深度干预触发（频率触发+信号）
**条件**：近7天同一模式出现≥2次 **AND** 满足以下任一信号
- **阻抗信号**：回复变短（<20字）、延迟回复、转移话题
- **防卫信号**：合理化、否认、转移
- **自我批判信号**：说"我真差劲"、"我怎么又..."

**结论**：→ 深度干预（1个问题+1个行动）

---

## 模式 → Skill 映射表

| 检索 Index Pattern | Skill Definition | 维度 |
|-------------------|-------------------|------|
| "知道但不做" | `skills_library/execution/skill_definition.md` | execution |
| "计划被打断就跳过" | `skills_library/execution/skill_definition.md` | execution |
| "表达不清晰自知" | `skills_library/communication/skill_definition.md` | communication |
| "任务时间估算乐观" | `skills_library/task_time_optimism/skill_definition.md` | time_management |
| "条件依赖型执行" | `skills_library/condition_dependent_execution/skill_definition.md` | execution |

**规则**：
- Step 5 模式扫描命中 pattern 时，优先查找对应的 skill_definition
- 如果没有专门 skill_definition，回退到 dimension 维度的通用 skill
- trigger_conditions 检查：pattern frequency ≥ 2 时触发

---

## 不触发干预的条件
- 普通碎碎念，无模式信号
- 数据积累期（前4周）只记录不干预
- 用户正在考试/测试中
- 用户明确说"不想聊这个"

## 触发优先级
1. 最高：危险触发 → 保护模式，立即出手
2. 次高：频率触发 + 信号触发同时满足 → 深度干预
3. 中等：单一频率触发 → 标准干预
4. 低：单一信号触发 → 微反馈

## 干预强度
- 危险触发：保护性回复 + 建议寻求专业帮助
- 深度干预：1个核心问题 + 1个具体行动
- 标准干预：1个问题 或 1个行动（二选一）
- 微反馈：1句话观察，不追问

## 追踪规则
每次干预后，更新 pending_actions.json
用户下次输入时，检查是否说了 verification_keywords
