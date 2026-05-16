# 生命周期脚本：配置驱动的启停三件套

> 来源：lifecycle-scripts 变更（2026-05-16），archiver 归档时沉淀

## 设计原则

- **配置驱动**：从 `domain.yaml` 读取端口、依赖、容器名，不硬编码
- **依赖拓扑**：启动按依赖顺序（DB→Backend→Frontend），停止反序
- **健康检查轮询**：替代 `sleep N` 盲等，数据库用 `docker inspect` 检查 healthy 状态，应用用 curl 轮询
- **PID 文件管理**：`.pids/` 目录跟踪进程，`.logs/` 存放后台日志
- **幂等性**：已运行的服务跳过启动，未运行的服务跳过停止

## domain.yaml lifecycle 字段

```yaml
lifecycle:
  pid_dir: .pids
  log_dir: .logs
  health_check:
    backend: /health
    timeout: 30
```

`services` 定义"有什么"，`lifecycle` 定义"怎么管"。

## 三件套契约

| 脚本 | 职责 | set 模式 |
|------|------|----------|
| start.sh | 依赖拓扑启动，写 PID/日志，健康检查 | `set -e` |
| stop.sh | 反序停止，端口清扫 + PID 清理 | `set +e` |
| status.sh | 检测各服务状态，表格化输出 | 无 |

## 关键陷阱

### npm 进程树问题

`npm run dev &` 创建进程树：npm(parent) → tsx/vite(child)。child 才是真正占端口的进程。杀 npm 父进程时 child 可能存活成孤儿。

**正确的停止策略（端口清扫优先）**：
1. `lsof -ti :port | xargs kill` — 杀端口占用者（child）
2. `kill -9 $(cat pidfile)` — 杀孤儿 npm（parent）
3. `rm -f pidfile` — 清理 PID 文件

### bash `local` 变量陷阱

```bash
# 错误：$name 引用的是外层作用域（空），不是刚赋的 $1
local name="$1" port="$2" pid_file="$PID_DIR/${name}.pid"

# 正确：每个 local 单独一行
local name="$1"
local port="$2"
local pid_file="$PID_DIR/${name}.pid"
```

bash 的 `local` 语句中，同一行的后续变量看不到前面刚赋的值。

## YAML 解析方式

使用 grep/sed 轻量解析 + 兜底默认值，不依赖 yq：

```bash
parse_port() {
  local service="$1"
  grep -A5 "^  ${service}:" "$DOMAIN_YAML" | grep "port:" | head -1 | sed 's/.*port:\s*//' | tr -d ' '
}
```

适用条件：domain.yaml 结构简单且受控。复杂 YAML 场景需换用 yq 或语言级解析。

## 进化路径

硬编码 → 配置驱动（当前） → 模板化 → ace-generate 自动生成
