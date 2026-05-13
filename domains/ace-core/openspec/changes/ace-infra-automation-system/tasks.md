## 1. 基础设施自动化 (Infra Automation)

- [ ] 1.1 设计 `domain.yaml` 的 `infrastructure` 详细 Schema
- [ ] 1.2 开发 `ace-infra` 执行器：支持 MySQL/Redis/Nacos 的标准 Docker 启动
- [ ] 1.3 编写 `ace-infra` 的验证场景 (Specs)

## 2. 环境诊断与巡检 (Diagnostics)

- [ ] 2.1 开发 `ace-doctor`：实现端口检查、Docker 状态检查、网络连通性检查
- [ ] 2.2 实现 `ace-doctor` 的自动修复建议逻辑

## 3. 配置与流程贯通 (Flow & Sync)

- [ ] 3.1 实现 `ace-config-sync`：支持初始化 SQL 和配置文件的自动灌入
- [ ] 3.2 串联 `ace-flow`：实现从 `init -> infra -> run` 的引导式体验

## 4. 资产沉淀 (Assets)

- [ ] 4.1 更新 `10_DOCS/technical/infrastructure-guide.md`
- [ ] 4.2 提炼通用的 `docker-compose` 模板到 `templates/infra/`
