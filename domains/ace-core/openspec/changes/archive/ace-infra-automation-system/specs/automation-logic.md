## ADDED Requirements

### Requirement: Declarative-Infra-Assembly
引擎必须能根据 domain.yaml 的声明，自动拼装并拉起基础设施。

#### Scenario: Launch-Lego-Infra
- **WHEN**: 用户在 `domain.yaml` 中声明了 `mysql` 和 `redis`，并运行 `ace-infra up`。
- **THEN**: 
  1. 引擎在 domain 目录下生成 `docker-compose.generated.yml`。
  2. 生成的文件仅包含 `mysql` 和 `redis` 服务。
  3. `docker compose ps` 显示相关容器正在运行且名称包含 `example-app`。

### Requirement: Self-Healing-Diagnostics
引擎必须能主动检测环境故障并给出提示。

#### Scenario: Doctor-Diagnostic
- **WHEN**: 用户运行 `ace-doctor`。
- **THEN**: 
  1. 输出 Docker 的存活状态。
  2. 列出当前活跃的 ACE 容器及其运行状态。
  3. 检查常见端口冲突。
