# ACE 基础设施与自动化指南

> 本文档定义了 ACE 如何实现“声明式环境”与“全自动资产同步”。

## 1. 目录规范 (Directory Standard)

为了减少信息噪音，ACE 采用 **“动静分离”** 的收纳原则：

- `skills/system/`: 存放初始化、部署等底层指令。
- `skills/common/`: 存放日常开发的通用业务指令。
- `rules/system/`: 存放官方镜像与核心协议。

## 2. 一键环境部署 (Infrastructure as Code)

### 步骤 A: 在 `domain.yaml` 声明需求
```yaml
infrastructure:
  mysql: { type: default }
  redis: { type: default }
```

### 步骤 B: 启动环境
运行 `node skills/system/ace-infra/executor.mjs up <domain>`。
引擎会自动从 `templates/system/infra/` 提取积木，并拉起 Docker。

## 3. 资产自动同步 (Asset Sync)

如果你有初始的数据库脚本，只需将其放在：
`domains/${domain}/10_DOCS/init/setup.sql`

运行 `node skills/system/ace-config-sync/executor.mjs <domain>`，引擎会自动将 SQL 灌入对应的容器。

## 4. 环境医生 (The Doctor)
运行 `node skills/system/ace-doctor/executor.mjs` 获取全境健康报告。
