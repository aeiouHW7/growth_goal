## ADDED Requirements

### Requirement: ace-status 命令
系统 SHALL 提供 `ace-status` 命令，读取 domain.yaml 的 services 段，检测各服务端口状态，输出表格化状态面板。

#### Scenario: 所有服务运行中
- **WHEN** 用户执行 ace-status，且 database(5432)、backend(3000)、frontend(5173) 均在监听
- **THEN** 输出三行状态表格，所有 Status 列显示 UP

#### Scenario: 部分服务未运行
- **WHEN** 用户执行 ace-status，且 backend 和 frontend 未运行
- **THEN** 输出三行状态表格，backend 和 frontend 的 Status 列显示 DOWN，database 显示 UP

#### Scenario: domain.yaml 无 services 段
- **WHEN** 用户执行 ace-status，但 domain.yaml 不包含 services 配置
- **THEN** 输出提示信息："domain.yaml 中未定义 services，请先配置"
