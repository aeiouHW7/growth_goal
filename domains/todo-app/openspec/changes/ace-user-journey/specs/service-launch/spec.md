## ADDED Requirements

### Requirement: applier 完成后服务启动
ace-applier SHALL 在所有 task 完成且测试通过后，提示用户是否启动服务查看效果，用户确认后在 tmux 中启动。

#### Scenario: 全部 task 完成
- **WHEN** applier 完成最后一个 task 且测试全通过
- **THEN** 读取 domain.yaml 的 scripts.dev 段，提示用户 "实现完成，要启动服务看效果吗？"

#### Scenario: 用户确认启动
- **WHEN** 用户确认启动服务
- **THEN** 在 tmux session 中按 domain.yaml services 顺序启动各服务，输出访问地址

#### Scenario: 用户跳过启动
- **WHEN** 用户选择不启动
- **THEN** 直接进入收尾流程，不启动任何服务
