#!/usr/bin/env bash
# cross-review 自检脚本
# 探测平台、扫描 MCP、初始化专用审核 agent，写入 config.yaml
#
# 用法:
#   bash setup.sh          # 交互模式（用户直接调用时）
#   bash setup.sh --auto   # 非交互模式（自动化流程中调用，使用默认值）

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILL_DIR="$(dirname "$SCRIPT_DIR")"
CONFIG_FILE="$SKILL_DIR/config.yaml"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../../.." && pwd)"
AGENT_NAME="cross-reviewer"
AUTO_MODE=false

[[ "${1:-}" == "--auto" ]] && AUTO_MODE=true

# ─── 1. 探测平台 ────────────────────────────────────────────────────────────

detect_platform() {
  # 优先：环境变量（最可靠）
  [[ -n "${KIRO_CLI:-}" ]] && { echo "kiro"; return; }
  [[ -n "${CLAUDE_CODE:-}" ]] && { echo "claude-code"; return; }

  # 其次：当前进程树
  if ps aux 2>/dev/null | grep -q "[k]iro-cli"; then
    echo "kiro"; return
  fi
  if ps aux 2>/dev/null | grep -q "[c]laude"; then
    echo "claude-code"; return
  fi

  # 兜底：目录特征（两者都存在时无法区分，标记 unknown）
  local has_kiro=false has_claude=false
  [ -d "$REPO_ROOT/.kiro" ] && has_kiro=true
  [ -d "$REPO_ROOT/.claude" ] && has_claude=true

  if $has_kiro && $has_claude; then
    echo "unknown"
  elif $has_kiro; then
    echo "kiro"
  elif $has_claude; then
    echo "claude-code"
  else
    echo "unknown"
  fi
}

# ─── 2. 扫描 MCP 工具 ────────────────────────────────────────────────────────

scan_mcp_tools() {
  local mcp_file="$REPO_ROOT/.mcp.json"
  [ -f "$mcp_file" ] || return
  if ! command -v python3 &>/dev/null; then
    echo "  ⚠️  python3 未安装，跳过 MCP 扫描" >&2
    return
  fi
  python3 -c "
import json, sys
with open('$mcp_file') as f:
    data = json.load(f)
servers = list(data.get('mcpServers', {}).keys())
# 精确匹配：名称中必须同时含 review 相关词，排除无关工具
strong = ['review', 'audit']
weak = ['check', 'assistant']
# 优先级：强匹配 > 弱匹配
strong_hits = [s for s in servers if any(k in s.lower() for k in strong)]
if strong_hits:
    print('\n'.join(strong_hits))
else:
    # 弱匹配需要同时命中两个关键词，或名称中含 cross/code-review 等组合
    combo_hits = [s for s in servers if sum(1 for k in weak if k in s.lower()) >= 2
                  or 'cross' in s.lower() or 'code-review' in s.lower() or 'code_review' in s.lower()]
    print('\n'.join(combo_hits))
" 2>/dev/null
}

# ─── 3. 选择模型 ─────────────────────────────────────────────────────────────

select_model() {
  local platform="$1"

  if $AUTO_MODE; then
    # 非交互模式：默认 haiku
    if [ "$platform" = "kiro" ]; then
      echo "claude-haiku-4"
    else
      echo "haiku"
    fi
    return
  fi

  echo ""
  echo "  选择审核 agent 使用的模型："
  if [ "$platform" = "kiro" ]; then
    echo "  [1] claude-haiku-4     （默认，速度快，审核够用）"
    echo "  [2] claude-sonnet-4    （均衡性价比）"
    echo "  [3] claude-opus-4      （最强，较贵）"
    echo "  [4] 手动输入           （运行 /model 查看可用模型后输入）"
    read -r -p "  请选择 [1-4，默认 1]: " choice
    choice="${choice:-1}"
    case "$choice" in
      1) echo "claude-haiku-4" ;;
      2) echo "claude-sonnet-4" ;;
      3) echo "claude-opus-4" ;;
      4) read -r -p "  输入模型 ID: " m; echo "$m" ;;
      *) echo "claude-haiku-4" ;;
    esac
  else
    echo "  [1] haiku    （默认，速度快，审核够用）"
    echo "  [2] sonnet   （均衡性价比）"
    echo "  [3] opus     （最强，较贵）"
    echo "  [4] 手动输入"
    read -r -p "  请选择 [1-4，默认 1]: " choice
    choice="${choice:-1}"
    case "$choice" in
      1) echo "haiku" ;;
      2) echo "sonnet" ;;
      3) echo "opus" ;;
      4) read -r -p "  输入模型 ID: " m; echo "$m" ;;
      *) echo "haiku" ;;
    esac
  fi
}

# ─── 4. 检查/创建专用审核 agent ──────────────────────────────────────────────

check_agent_exists() {
  local platform="$1"
  case "$platform" in
    kiro)        [ -f "$REPO_ROOT/.kiro/agents/${AGENT_NAME}.json" ] && echo "yes" || echo "no" ;;
    claude-code) [ -f "$REPO_ROOT/.claude/agents/${AGENT_NAME}.md" ] && echo "yes" || echo "no" ;;
    *)           echo "no" ;;
  esac
}

AGENT_PROMPT='你是一位资深评审员，专注于发现问题而非认可现有方案。

审核前先读取以下文件获取项目上下文：
- AGENTS.md（决策原则、编码规范、技术栈）
- openspec/config.yaml（项目编码规范详细定义）

审核时保持独立视角，基于代码/规范/数据库事实给出意见。
每条意见必须注明优先级（P0 阻塞/P1 建议/P2 优化）、具体问题和修改建议。
没有问题时直接输出"✅ 未发现明显问题"，禁止硬凑意见。'

create_agent() {
  local platform="$1"
  local model="$2"
  # 转义换行符用于 JSON
  local prompt_json
  prompt_json=$(echo "$AGENT_PROMPT" | python3 -c "import sys,json; print(json.dumps(sys.stdin.read()))")

  case "$platform" in
    kiro)
      mkdir -p "$REPO_ROOT/.kiro/agents"
      cat > "$REPO_ROOT/.kiro/agents/${AGENT_NAME}.json" <<EOF
{
  "name": "cross-reviewer",
  "description": "专用交叉审核 agent，用于方案/代码/测试的独立评审。发现问题而非认可现有方案，基于事实给出 P0/P1/P2 分级意见。",
  "tools": ["read", "grep", "glob"],
  "model": "${model}",
  "prompt": ${prompt_json}
}
EOF
      # 注册到 default.json 的 availableAgents 和 trustedAgents
      local default_json="$REPO_ROOT/.kiro/agents/default.json"
      if [ -f "$default_json" ] && command -v python3 &>/dev/null; then
        python3 -c "
import json, sys
with open('$default_json') as f:
    data = json.load(f)
ts = data.setdefault('toolsSettings', {}).setdefault('subagent', {})
for key in ('availableAgents', 'trustedAgents'):
    lst = ts.setdefault(key, [])
    if '${AGENT_NAME}' not in lst:
        lst.append('${AGENT_NAME}')
with open('$default_json', 'w') as f:
    json.dump(data, f, indent=2, ensure_ascii=False)
    f.write('\n')
" 2>/dev/null && echo "  ✅ 已注册到 default.json" || echo "  ⚠️  注册到 default.json 失败，请手动添加"
      fi
      echo "$REPO_ROOT/.kiro/agents/${AGENT_NAME}.json"
      ;;
    claude-code)
      mkdir -p "$REPO_ROOT/.claude/agents"
      cat > "$REPO_ROOT/.claude/agents/${AGENT_NAME}.md" <<EOF
---
name: cross-reviewer
description: 专用交叉审核 agent，用于方案/代码/测试的独立评审。发现问题而非认可现有方案，基于事实给出 P0/P1/P2 分级意见。
model: ${model}
tools: Read, Grep, Glob
---

${AGENT_PROMPT}
EOF
      echo "$REPO_ROOT/.claude/agents/${AGENT_NAME}.md"
      ;;
  esac
}

# ─── 5. 写入 config.yaml ─────────────────────────────────────────────────────

write_config() {
  cat > "$CONFIG_FILE" <<EOF
# Cross-Review 配置（由 setup.sh 自动生成）

# 当前 AI 平台（自动探测）
platform: ${1}

# 交叉审核 MCP 工具名
# - 填写工具名：使用该 MCP 工具作为 Level 1 provider
# - none：跳过 Level 1，直接使用 Subagent（Level 2）
mcp_tool: ${2}

# 专用审核 subagent 名称
# - 填写 agent name：Level 2 使用该 agent 执行审核
# - 留空：使用 default subagent
subagent_name: ${3}
EOF
}

# ─── 主流程 ──────────────────────────────────────────────────────────────────

echo "🔍 cross-review 自检中..."

PLATFORM=$(detect_platform)
echo "  平台: $PLATFORM"

MCP_CANDIDATES=$(scan_mcp_tools)
MCP_TOOL="none"
if [ -n "$MCP_CANDIDATES" ]; then
  CANDIDATE_COUNT=$(echo "$MCP_CANDIDATES" | wc -l | tr -d ' ')
  if [ "$CANDIDATE_COUNT" -eq 1 ]; then
    MCP_TOOL="$MCP_CANDIDATES"
    echo "  ✅ 使用 MCP: $MCP_TOOL"
  elif $AUTO_MODE; then
    MCP_TOOL=$(echo "$MCP_CANDIDATES" | head -1)
    echo "  ✅ 使用 MCP: $MCP_TOOL（自动选择第一个）"
  else
    echo "  发现多个候选 MCP 工具:"
    i=1
    echo "$MCP_CANDIDATES" | while read -r tool; do
      echo "    [$i] $tool"
      i=$((i + 1))
    done
    read -r -p "  请选择 [默认 1]: " choice
    choice="${choice:-1}"
    MCP_TOOL=$(echo "$MCP_CANDIDATES" | sed -n "${choice}p")
    [ -z "$MCP_TOOL" ] && MCP_TOOL=$(echo "$MCP_CANDIDATES" | head -1)
    echo "  ✅ 使用 MCP: $MCP_TOOL"
  fi
else
  echo "  ⚠️  未发现审核 MCP 工具，将使用 Subagent 模式"
fi

SUBAGENT_NAME=""
if [ "$PLATFORM" != "unknown" ]; then
  AGENT_EXISTS=$(check_agent_exists "$PLATFORM")
  if [ "$AGENT_EXISTS" = "yes" ]; then
    SUBAGENT_NAME="$AGENT_NAME"
    echo "  ✅ 已有专用审核 agent: $AGENT_NAME"
  elif $AUTO_MODE; then
    MODEL=$(select_model "$PLATFORM")
    AGENT_FILE=$(create_agent "$PLATFORM" "$MODEL")
    SUBAGENT_NAME="$AGENT_NAME"
    echo "  ✅ 已创建: $AGENT_FILE（模型: $MODEL）"
  else
    echo ""
    read -r -p "  是否创建专用审核 agent '$AGENT_NAME'（独立视角，可指定模型）？[Y/n] " answer
    answer="${answer:-Y}"
    if [[ "$answer" =~ ^[Yy]$ ]]; then
      MODEL=$(select_model "$PLATFORM")
      AGENT_FILE=$(create_agent "$PLATFORM" "$MODEL")
      SUBAGENT_NAME="$AGENT_NAME"
      echo "  ✅ 已创建: $AGENT_FILE（模型: $MODEL）"
    else
      echo "  跳过，将使用 default subagent"
    fi
  fi
else
  echo "  ⚠️  平台 '$PLATFORM' 暂不支持自动创建审核 agent（当前仅支持 kiro、claude-code），将使用 default subagent 或降级为自审"
fi

write_config "$PLATFORM" "$MCP_TOOL" "$SUBAGENT_NAME"
echo ""
echo "✅ 配置已写入 $CONFIG_FILE"
cat "$CONFIG_FILE"
