## 1. OpenSpec 文档（本轮已完成）

- [ ] 1.1 proposal.md 创建 ✅
- [ ] 1.2 design.md 创建 ✅
- [ ] 1.3 4个 spec 文件创建 ✅
- [ ] 1.4 tasks.md 创建（本文件）✅

## 2. 验证已实施的改动

- [ ] 2.1 检查 SKILL.md Step 5.5 是否正确插入（融合规则在 Step 5 和 Step 6 之间）
- [ ] 2.2 检查 intervention_triggers.md 是否有"深度干预触发（频率+信号）"区块
- [ ] 2.3 检查 communication/skill_definition.md 是否包含 trigger/diagnosis/intervention/verification/escalation
- [ ] 2.4 检查 effectiveness_log.md 是否包含完整字段和评分标准

## 3. E2E 穿线测试（必须执行）

- [ ] 3.1 测试诊断融合：当 habit_behavior 和 psychodynamic 同时输出时，Step 5.5 正确融合
- [ ] 3.2 测试双重触发：频率+信号同时满足时触发深度干预
- [ ] 3.3 测试 communication skill_definition 可被正确加载和执行
- [ ] 3.4 测试 effectiveness_log 写入路径

## 4. Git Push（验证后执行）

- [ ] 4.1 如验证通过，git add + commit + push
- [ ] 4.2 如验证失败，修复问题后重新测试