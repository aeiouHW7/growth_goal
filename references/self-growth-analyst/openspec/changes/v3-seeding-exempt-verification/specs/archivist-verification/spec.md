## ADDED Requirements

### Requirement: Step 4.3 写入验证
SKILL.md Step 4末尾必须包含写入验证步骤。

#### Scenario: 验证通过
- **WHEN** Step 4 写入完成后
- **THEN** 检查 daily_raw/YYYY-MM-DD.md 是否存在且包含新内容
- **IF** 存在且有新内容 → 继续后续步骤

#### Scenario: 重试
- **WHEN** 检查发现文件不存在或为空
- **THEN** 重试写入一次

#### Scenario: 失败信号
- **WHEN** 重试仍失败
- **THEN** 输出 [ARCHIVIST_FAIL] 信号到当前对话
- **AND** 不静默跳过，继续记录失败状态

### Requirement: [ARCHIVIST_FAIL]信号定义
[ARCHIVIST_FAIL] 是可见的错误信号，不是静默失败。

#### 格式
```
[ARCHIVIST_FAIL] 日期写入失败，请检查系统状态
```

#### Scenario: 用户看到信号
- **WHEN** [ARCHIVIST_FAIL] 输出
- **THEN** 用户知道数据没落盘，可以手动触发修复