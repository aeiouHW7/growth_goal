# Design: ace-infra-automation-system

## 1. 架构目标 (Architecture Goals)
- **解耦环境配置**: 采用“乐高积木”模式，将中间件配置模板化。
- **自适应执行**: 脚本具备环境感知能力（端口检测、Docker 状态）。
- **一键闭环**: 实现从 `domain.yaml` 声明到服务可用的全自动化。

## 2. 实现路径 (Implementation Path)

### 目录结构
- `templates/infra/`: 存放各中间件的 `compose-fragment.yml`。
- `skills/common/ace-infra/`: 核心执行逻辑，负责拼装并运行 Docker。
- `skills/common/ace-doctor/`: 负责环境诊断与修复建议。

### 核心算法：乐高拼装 (Lego Assembly)
1. 读取 `domain.yaml` 中的 `infrastructure` 列表。
2. 遍历 `templates/infra/`，提取对应的 YAML 片段。
3. 合并为一个临时的 `docker-compose.generated.yml`。
4. 调用 `docker compose up -d`。

## 3. 方案权衡 (Trade-offs)
- **方案 A (选定): 模块化 YAML 拼接**
  - *利*: 极致的灵活性，新增中间件只需添加一个模板文件；用户配置极简。
  - *弊*: 多个容器间的网络依赖管理比单文件稍微复杂（通过统一的 ACE 网络解决）。
- **方案 B: 静态全家桶脚本**
  - *利*: 结构简单。
  - *弊*: 难以维护，且用户无法根据需要剔除不用的服务。

## 4. 使用效果 (Expected Outcome)
- 用户只需在 `domain.yaml` 勾选 `mysql`。
- 运行 `ace infra up` 后，AI 自动处理端口映射、环境变量注入、并汇报“健康状态”。
