## Context

SKILL.md 已有完整工作流（Step 1-7），但缺少两个关键连接：
1. Step 5（多个引擎独立输出）→ Step 6（决策器）的融合逻辑
2. Skills 库只有 execution 和 communication 是诊断脚本，其他17个还是 probes

用户明确说"别这么快，认真思考，深度思考"。我们走 OpenSpec 流程，验证后再实施。

## Goals / Non-Goals

**Goals:**
- 诊断融合逻辑明确定义，让多个引擎输出汇集成一个核心诊断
- 明确 communication 诊断脚本的完整规格
- 验证已实施的改动（SKILL.md Step 5.5、intervention_triggers.md、effectiveness_log）是否正确落地

**Non-Goals:**
- 不一次升级所有17个维度
- 不写代码级实现（保持纯文本 prompt 系统）
- 不改变 Step 1-5 和 Step 7 的已有逻辑

## Decisions

### D1: Diagnostician 融合是调度器的一部分，不是独立引擎

**决策**: Step 5.5 Diagnostician 融合写在 SKILL.md 内部，不新建 `core/diagnosis_integrator.md`。

**原因**:
- 融合是调度决策，不是独立分析能力
- 减少文件分散，提高调度确定性
- 未来如果需要复杂融合逻辑，再拆成独立文件

**替代考虑**: 新建 `core/diagnosis_integrator.md` → 增加文件数量和调用复杂度，放弃。

### D2: communication 诊断脚本优先于其他维度

**决策**: communication 是第二个升级的维度（第一个是 execution）。

**原因**:
- 从模拟数据看，communication 是高频触发维度（4/19、4/24 都出现）
- 用户明确知道自己的沟通表达有问题（self-awareness 高），但无改变
- 这是真实的痛点，不是假设

**替代考虑**: 其他17个维度 → 没有数据支持优先级，communication 有真实触发记录。

### D3: effectiveness_log 在每次干预后主动写入

**决策**: 干预效果记录由 Archivist 在每次干预后自动写入，不需要用户手动输入。

**原因**:
- 如果靠用户主动记录，数据会非常稀疏
- 系统自我进化需要这些数据
- 格式简单，结构化程度高

## Risks / Trade-offs

[风险] 融合规则可能不够精确，多引擎同时输出时判断主观 → 缓解：先定义简单规则，用 effectiveness_log 反馈迭代

[风险] communication 诊断脚本可能不完整 → 缓解：参考已验证的 execution skill_definition

[风险] effectiveness_log 数据积累慢 → 缓解：前4周只记录不计算，4周后开始分析

## Migration Plan

**已完成（本轮之前）:**
- SKILL.md Step 5.5 插入 ✅
- intervention_triggers.md 补充 ✅
- communication/skill_definition.md 创建 ✅
- effectiveness_log.md 创建 ✅

**待验证:**
- Step 5.5 融合逻辑是否正确嵌入
- intervention_triggers.md 双重判断是否完整
- communication/skill_definition.md 是否符合标准

**后续（下一轮）:**
- 用 E2E 测试验证 Step 5.5 融合逻辑
- 检查 effectiveness_log 写入路径

## Open Questions

1. 当多个引擎输出的维度冲突时（比如 habit_behavior 说 A，psychodynamic 说 B），优先信哪个？
   暂时规则：深层优先（心理 > 行为 > 表层）

2. effectiveness_log 分析什么时候启动？
   暂时规则：积累20条以上记录后启动分析