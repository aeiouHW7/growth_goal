## ADDED Requirements

### Requirement: Archivist逆向重建步骤
当daily_raw/为空但retrieval_index有patterns时，执行逆向重建。

#### Scenario: 逆向重建触发
- **WHEN** daily_raw/目录存在但无文件 AND retrieval_index.json有patterns
- **THEN** 进入逆向重建流程

#### Scenario: 日期提取与文件生成
- **WHEN** 逆向重建执行
- **THEN** 从patterns.dimensions提取每个日期的维度触发记录，生成daily_raw/YYYY-MM-DD.md骨架文件

#### Scenario: 骨架文件格式
```markdown
## [日期] 碎碎念 [重建]

来源: retrieval_index逆向重建
数据可信度: 骨架-待验证

### 维度触发记录
- execution: 触发于"知道但不做"模式
- communication: 触发于"表达不清晰自知"模式
```

#### Scenario: [重建]标注要求
- **WHEN** 生成骨架文件
- **THEN** 文件头部必须标注[重建]
- **AND** 标注数据来源（retrieval_index/dimensions）

### Requirement: 自检触发
当用户提到"知道但不做"模式时，系统检查自身执行链路。

#### Scenario: 元一致自检
- **WHEN** linguistic_analyzer检测到"知道但不做"模式
- **THEN** 调度器检查：
  - daily_raw有没有写入？（若无→触发自愈）
  - baseline有没有同步？（若全0→触发seeding）
  - pending_actions有没有追踪？

### Requirement: Archivist强制写入
SKILL.md Step 4必须是强制步骤，不能跳过。

#### Scenario: 碎碎念写入验证
- **WHEN** 每次碎碎念处理完成
- **THEN** 检查daily_raw/YYYY-MM-DD.md是否已更新
- **IF** 未更新 → 立即写入后再继续后续步骤