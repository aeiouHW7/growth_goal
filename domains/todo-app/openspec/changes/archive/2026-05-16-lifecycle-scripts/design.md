## Context

todo-app 的 start.sh（140 行）和 status.sh（130 行）全部硬编码端口和容器名，缺 stop.sh。domain.yaml 已有完整的 services 定义但脚本完全没用。ace-status command 和 status.sh 功能重叠。

遵循 ECC 进化哲学：先让配置驱动在一个项目跑通，再泛化为模板。

**约束**：
- 脚本必须纯 bash，不引入 python/node 运行时依赖（yq 用 grep/sed 降级方案）
- 双模可用：终端 `./start.sh` + AI 调用
- 不改变用户可见的输出风格（保持 emoji + 中文提示）

## Goals / Non-Goals

**Goals:**
- 三件套从 domain.yaml 读取服务配置（端口、依赖、容器名）
- PID 文件管理取代 `pkill -f` 猜测式停服
- 健康检查轮询取代 `sleep 3` 盲等
- stop.sh 补齐，实现优雅关停
- 归档已完成的 openspec changes

**Non-Goals:**
- 不做通用脚本模板引擎（留给未来 ace-generate）
- 不改 docker-compose.yml（已经是好的）
- 不做跨项目脚本复用（每个项目独立三件套）
- 不引入 yq 依赖（用 grep/awk 解析 domain.yaml 简单字段）

## Decisions

### D1: domain.yaml 解析方式 — grep/awk vs yq vs node

**选定**：grep/awk 轻量解析 + 兜底硬编码默认值

**理由**：
- domain.yaml 结构简单（仅需读 services.*.port 和 services.*.dependencies）
- yq 不是 macOS 自带，增加安装依赖
- node 脚本会让"纯 bash 三件套"变成混合项目
- grep/awk 能力足够，失败时使用 domain.yaml 中写死的默认值

**实现**：
```bash
parse_yaml_value() {
  local key="$1" file="$2"
  grep "^\s*${key}:" "$file" 2>/dev/null | head -1 | sed 's/.*:\s*//' | tr -d '"'
}
```

**备选（已拒绝）**：yq（需要安装）、node 脚本（混合运行时）

### D2: PID 管理策略 — .pids/ 目录 vs /tmp/ 文件

**选定**：项目本地 `.pids/` 目录

**理由**：
- `/tmp/` 是全局的，多项目 PID 文件可能冲突
- `.pids/` 在项目目录内，git ignore 即可
- 语义清晰：PID 文件生命周期和项目绑定

**实现**：
```
.pids/
├── backend.pid
└── frontend.pid
```

Docker 容器不需要 PID 文件——`docker compose down` 自己管理。

### D3: 健康检查方式 — curl 轮询 vs pg_isready vs 全部 curl

**选定**：数据库用 docker compose 内置 healthcheck + `docker inspect`，应用服务用 curl 轮询

**理由**：
- docker-compose.yml 已有 pg_isready 健康检查定义
- `docker inspect --format='{{.State.Health.Status}}'` 比自己跑 pg_isready 更可靠
- 应用服务（backend）用 curl 检查 /health endpoint
- frontend 用 curl 检查根路径返回

**实现**：
```bash
wait_for_healthy() {
  local service="$1" max_wait="$2"
  local elapsed=0
  while [ $elapsed -lt $max_wait ]; do
    if docker inspect --format='{{.State.Health.Status}}' "$service" 2>/dev/null | grep -q "healthy"; then
      return 0
    fi
    sleep 2
    elapsed=$((elapsed + 2))
  done
  return 1
}
```

### D4: stop.sh 停止策略 — SIGTERM+等待 vs 直接 kill

**选定**：SIGTERM → 等待 5s → SIGKILL 兜底

**理由**：Node.js 进程需要时间清理（关闭数据库连接等），直接 SIGKILL 可能导致资源泄漏。

**兜底**：PID 文件不存在或进程已死时，通过 `lsof -ti :port` 端口查杀。

### D5: domain.yaml lifecycle 字段 — 新增 vs 复用 services

**选定**：在 domain.yaml 新增 lifecycle 顶层字段

**理由**：
- services 已有端口和依赖信息，lifecycle 补充脚本行为配置
- 分开关注点：services 定义"有什么"，lifecycle 定义"怎么管"

```yaml
lifecycle:
  pid_dir: .pids
  log_dir: .logs
  health_check:
    backend: /health
    timeout: 30
```

## Risks / Trade-offs

| Risk | Impact | Mitigation |
|------|--------|------------|
| grep/awk 解析 YAML 不健壮 | 复杂 YAML 解析失败 | domain.yaml 结构简单且受控，兜底用默认值 |
| PID 文件过期（进程崩溃未清理） | stop.sh 误杀新进程 | 停止前验证 PID 对应的进程名，不匹配则跳过 |
| macOS vs Linux 的 `lsof` 差异 | 某些平台兜底失败 | 当前只需支持 macOS |

## Migration Plan

增量操作，无破坏性变更：
1. 新增 `.pids/` 目录和 `.gitignore`
2. 新增 `.logs/` 目录和 `.gitignore`
3. 重写 start.sh（保持外部行为兼容）
4. 新建 stop.sh
5. 重写 status.sh
6. 更新 domain.yaml 增加 lifecycle 字段
7. 归档完成的 changes

回滚：git checkout 恢复原始脚本即可。
