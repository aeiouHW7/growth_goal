# 文件清理和优化方案

## ✅ 执行步骤

### 1. 备份旧文件（安全起见）

```bash
mkdir -p .archive/old-docs-$(date +%Y%m%d)
cp AGENTS.md .archive/old-docs-$(date +%Y%m%d)/
cp QUICKSTART.md .archive/old-docs-$(date +%Y%m%d)/
```

### 2. 替换为新版本

```bash
# 替换 AGENTS.md
mv AGENTS.md AGENTS_OLD.md
mv AGENTS_NEW.md AGENTS.md

# 替换 QUICKSTART.md
mv QUICKSTART.md QUICKSTART_OLD.md
mv QUICKSTART_NEW.md QUICKSTART.md
```

### 3. 删除过时文件

```bash
# 删除备份文件
rm -f docker-compose.yml.backup

# 归档重构文档
mkdir -p docs/archive
mv ARCHITECTURE_REFACTOR.md docs/archive/

# 移动技术栈指南
mv FRONTEND_BACKEND_GUIDE.md docs/TECH_STACK.md

# 合并功能清单到 README（手动操作后删除）
# 1. 将 CAPABILITIES.md 内容合并到 README.md 的 "核心能力" 章节
# 2. 然后删除
rm CAPABILITIES.md
```

### 4. 更新 .gitignore

```bash
echo "" >> .gitignore
echo "# 备份和临时文件" >> .gitignore
echo "*.backup" >> .gitignore
echo "*_OLD.md" >> .gitignore
echo ".archive/" >> .gitignore
```

---

## 📋 文件清单

### ✅ 保留并优化

| 文件 | 状态 | 操作 |
|------|------|------|
| **AGENTS.md** | ⭐ 最重要 | 替换为新版本（AI-First、最新 Skills） |
| **README.md** | ✅ 已优化 | 保留（已包含 AI-First 内容） |
| **QUICKSTART.md** | 需更新 | 替换为新版本（去除 ace:up，强调 start.sh） |
| **ETHOS.md** | ✅ 完美 | 完全保留 |
| **CONTRIBUTING.md** | ✅ 保留 | 保留（可选：更新提及 OpenSpec） |
| **package.json** | ✅ 已清理 | 保留（已删除过时脚本） |

### ❌ 删除或归档

| 文件 | 理由 | 操作 |
|------|------|------|
| **docker-compose.yml.backup** | 临时备份文件 | 删除 |
| **ARCHITECTURE_REFACTOR.md** | 重构完成，临时文档 | 移到 `docs/archive/` |
| **CAPABILITIES.md** | 功能清单应整合到 README | 合并后删除 |
| **FRONTEND_BACKEND_GUIDE.md** | 应该在 docs/ 下 | 移到 `docs/TECH_STACK.md` |

---

## 🔍 对比：旧版 vs 新版

### AGENTS.md

**旧版问题**:
- ❌ 提到已删除的 `ace-select`、`ace-init-domain`
- ❌ 提到 `.engine/active-domain`（不存在）
- ❌ 提到 `openspec` 软链接（不需要）
- ❌ 缺少新 Skills（ace-init-env、ace-create-project）

**新版优势**:
- ✅ 反映真实架构（根目录 vs 子项目）
- ✅ 完整的 Skills 清单（项目管理 + 开发）
- ✅ AI-First 交互模型说明
- ✅ 清晰的工作流程图
- ✅ 故障排除指南

### QUICKSTART.md

**旧版问题**:
- ❌ 步骤 2: `npm run ace:up`（已删除）
- ❌ 步骤 3-6: 手动安装依赖、迁移（应用 start.sh）
- ❌ 缺少 AI 辅助创建新项目的方式

**新版优势**:
- ✅ 三种启动方式（一键、AI 辅助、手动）
- ✅ AI-First 工作流示例
- ✅ 完整的故障排除 FAQ
- ✅ 清晰的命令参考

---

## 📊 文档结构优化

### 优化前

```
根目录/
├── AGENTS.md              # 过时，提到已删除功能
├── README.md              # 已更新
├── QUICKSTART.md          # 过时，npm run ace:up
├── ETHOS.md               # 完美
├── CONTRIBUTING.md        # 可用
├── CAPABILITIES.md        # 冗余
├── FRONTEND_BACKEND_GUIDE.md  # 位置不对
├── ARCHITECTURE_REFACTOR.md   # 临时文档
└── docker-compose.yml.backup  # 备份文件
```

### 优化后

```
根目录/
├── AGENTS.md              # ⭐ 全新，AI 入口
├── README.md              # ✅ 已优化
├── QUICKSTART.md          # ✅ 全新，三种启动方式
├── ETHOS.md               # ✅ 保留
├── CONTRIBUTING.md        # ✅ 保留
├── package.json           # ✅ 已清理
└── docs/
    ├── INTERACTION_MODEL.md   # AI-First 详解
    ├── TECH_STACK.md          # 技术栈指南（原 FRONTEND_BACKEND_GUIDE）
    └── archive/
        └── ARCHITECTURE_REFACTOR.md  # 已完成的重构文档
```

---

## 🎯 核心改进

1. **AGENTS.md**: 从 36 行 → 300+ 行，完整的 AI 协作指南
2. **QUICKSTART.md**: 从单一手动流程 → 三种启动方式（含 AI 辅助）
3. **文档组织**: 删除冗余，明确分类（根目录 vs docs/）
4. **AI-First**: 所有文档强调自然语言触发 Skills

---

## ✅ 验证清单

执行完成后，检查：

- [ ] `AGENTS.md` 提到的 Skills 都存在且可用
- [ ] `QUICKSTART.md` 的命令都能正常执行
- [ ] 没有提到已删除的功能（ace:up、ace-select 等）
- [ ] AI 读取 AGENTS.md 后能正确理解架构
- [ ] 新用户按 QUICKSTART.md 能成功启动项目

---

## 🚀 执行命令汇总

```bash
# 1. 备份
mkdir -p .archive/old-docs-$(date +%Y%m%d)
cp AGENTS.md QUICKSTART.md .archive/old-docs-$(date +%Y%m%d)/

# 2. 替换
mv AGENTS.md AGENTS_OLD.md && mv AGENTS_NEW.md AGENTS.md
mv QUICKSTART.md QUICKSTART_OLD.md && mv QUICKSTART_NEW.md QUICKSTART.md

# 3. 清理
rm -f docker-compose.yml.backup
mkdir -p docs/archive
mv ARCHITECTURE_REFACTOR.md docs/archive/
mv FRONTEND_BACKEND_GUIDE.md docs/TECH_STACK.md

# 4. 更新 .gitignore
cat >> .gitignore << 'EOF'

# 备份和临时文件
*.backup
*_OLD.md
.archive/
EOF

# 5. 提交
git add .
git commit -m "docs: 优化核心文档，反映 AI-First 架构

- 重写 AGENTS.md: 完整的 Skills 清单和交互模型
- 重写 QUICKSTART.md: 三种启动方式（含 AI 辅助）
- 清理过时文件: 删除 backup、归档临时文档
- 优化文档组织: 技术文档移到 docs/

BREAKING CHANGE: 删除对已移除功能的引用（ace:up、ace-select）
"
```
