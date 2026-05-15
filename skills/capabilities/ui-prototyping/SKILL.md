---
name: ui-prototyping
description: "UI 原型生成胶水层——注入设计决策、规范原型生成、质检验证。引用 shadcn/ui（组件）、ui-ux-pro-max（设计知识库）、mastepanoski claude-skills（设计质检）。"
---

# UI Prototyping — 原型生成胶水层

设计三个步骤：**定方向 → 出原型 → 验质量**。不重写已有知识库，而是引用来告诉 AI 查哪里、用哪个命令、遵循哪个规范。

## 集成点

本 skill 被 `ace-planner` Phase 2 Step 2.3（生成 PRD + 原型）调用：

```
ace-planner Phase 2
  ├─ Step 2.2: Grill 拷问（此时确定：产品类型、目标用户、品牌基调）
  ├─ Step 2.3: PRD + 原型
  │   ├─ 读本 skill → 确定设计方向 → 生成原型 → 质检
  │   └─ 辩证验证（PRD ↔ 原型）
  └─ ...
```

---

## Step 1：定设计方向

> 告诉 AI "长什么样"，不泛泛而出。

### 1a. 优先：用 ui-ux-pro-max 搜索引擎

如果项目已 clone [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)，通过 shell 调用其 Python 搜索引擎：

```bash
# 生成完整设计系统推荐
cd skills/capabilities/ui-prototyping/references/ui-ux-pro-max-study
python3 src/ui-ux-pro-max/scripts/search.py "SaaS 后台" --design-system -f markdown -p "项目名"

# 补充搜索：配色
python3 src/ui-ux-pro-max/scripts/search.py "healthcare calm" --domain color -n 3 -f markdown

# 补充搜索：UX 规范
python3 src/ui-ux-pro-max/scripts/search.py "form validation" --domain ux -n 5 -f markdown

# 框架规范（shadcn/ui）
python3 src/ui-ux-pro-max/scripts/search.py "dialog form" --stack shadcn -n 5 -f markdown

# 框架规范（HTML+Tailwind）
python3 src/ui-ux-pro-max/scripts/search.py "responsive layout" --stack html-tailwind -n 5 -f markdown
```

可用 `--domain`：`product`, `style`, `color`, `typography`, `chart`, `ux`, `landing`, `icons`

### 1b. 备选：内置产品-风格决策表

如果 Python 不可用，用以下简化表确定设计方向（20 种常用类型）：

| 产品类型 | 推荐风格 | 配色基调 | 字体倾向 |
|---------|---------|---------|---------|
| SaaS 后台 | Minimalism + Glassmorphism | 信任蓝 #2563EB，中性灰背景 | Inter / Geist |
| 内部工具 | Minimalism + Flat | 功能蓝，高密度布局 | Inter，mono 用于数据 |
| API 开发者工具 | Dark Mode + Minimalism | 深黑 #0A0A0A，霓虹 accent | JetBrains Mono + Inter |
| AI/Chatbot | AI-Native UI + Minimalism | 紫蓝渐变，深色模式 | Geist / Inter |
| 电商（大众） | Vibrant & Block-based | 品牌主色 + 成功绿 #059669 | Inter + 品牌字体 |
| 电商（高端） | Dark Luxury | 深色 #1C1917，金 accent #A16207 | Serif 标题 + Sans body |
| 金融/Fintech | Glassmorphism + Dark Mode | 深绿 #065F46，红/绿告警 | Inter / IBM Plex Sans |
| 医疗健康 | Neumorphism + Accessible | 宁静蓝 #0284C7，健康绿 | 无衬线，高可读性 |
| 教育/学习 | Claymorphism + Flat | 温暖橙 #EA580C，亮色背景 | 圆体 / Inter |
| 游戏 | 3D Hyperrealism + Retro | 霓虹电光色，暗黑背景 | 个性字体 + Inter |
| 社交媒体 | Motion-Driven + Vibrant | 品牌渐变，用户生成内容区 | Inter |
| 新闻/内容 | Editorial + Swiss Style | 白底黑字，品牌 accent | Serif 标题 + Sans body |
| 法律/合规 | Trust & Authority + Minimalism | 海军蓝 #1E3A5F，金 accent | Serif / Inter |
| 房地产 | Glassmorphism + Dark Mode | 大地色，高端暗色 | Serif 标题 |
| 餐饮 | Vibrant & Block-based | 食欲色（橙/红），暖背景 | 圆体 / Inter |
| 健身 | Dark Mode + Brutalism | 黑底，霓虹绿 accent | 粗体 / Inter |
| 音乐 | Dark Mode + Motion-Driven | 深黑，动态渐变 | 个性字体 + Inter |
| B2B 企业 | Minimalism + Accessible | 品牌蓝，专业灰 | Inter |
| 个人博客 | Editorial + Swiss Style | 白底黑字，品牌 accent | 自定义字体 |
| 后台管理 | Flat Design + Data-Dense | 低饱和，功能色区分 | Inter，mono 数据 |

---

## Step 2：出原型

### 2a. 原型必须覆盖的状态

原型不是画一个界面，是画**一个需求的所有界面状态**。对照 PRD 中的场景清单，每个场景对应一种界面/状态：

| 状态类型 | 覆盖要求 | 示例 |
|---------|---------|------|
| **主流程** | 用户成功完成目标的最佳路径 | 登录 → 输邮箱 → 输密码 → 进首页 |
| **空态** | 没有数据时的界面 | 列表为空：显示引导文字和 CTA |
| **加载中** | 数据加载/操作进行中 | Skeleton，loading spinner，进度条 |
| **错误态** | 操作失败的状态 | 表单校验错误、服务器 500、网络断开 |
| **边缘态** | 极端数据量/长文本/慢加载 | 1000 条数据的分页、超长用户名截断 |
| **权限/角色差异** | 不同用户看到不同内容 | Admin 看到管理入口，普通用户看不到 |

每生成一个界面，自问："这个界面还有别的状态吗？"

### 2b. 原型生成规范

基于纯 HTML + Tailwind CSS（CDN），生成可独立打开的单文件原型：

```html
<!DOCTYPE html>
<html lang="zh-CN" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{页面名称} - 原型</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    /* 设计 tokens — 从 Step 1 的设计方向填入 */
    :root {
      --background: #F8FAFC;
      --foreground: #0F172A;
      /* ... 其余 tokens */
    }
  </style>
</head>
<body class="bg-[var(--background)] text-[var(--foreground)]">
  <!-- 原型内容 -->
</body>
</html>
```

**要求**：
- 单文件，浏览器可直接打开
- 可点击交互（用简单 JS 或 `onclick` 实现状态切换）
- 每个状态一个 `<section>` 或独立页面，方便截图
- 不要求响应式（原型阶段，桌面优先）

---

## Step 3：质检验证

> 原型生成后，跑质检。借鉴 [mastepanoski claude-skills](https://github.com/mastepanoski/claude-skills) 的评估体系。

### 3a. 设计嗅觉扫描（Design Smells）

逐项检查，任一红灯必须修复：

| 类别 | 🚨 红灯 | ✅ 绿灯 |
|------|---------|--------|
| **字体** | body < 14px / 超过 3 种字体 / 行高 < 1.3 | ≥ 14px / ≤ 2 种 / 行高 1.4-1.6 |
| **颜色** | 纯黑 #000 + 纯白 #FFF / 低对比度 | 语义 token / 至少 4.5:1 文本对比 |
| **间距** | 随机 px 值（13/17/23）/ 元素贴边缘 | 8px 倍数体系 / 有 padding |
| **一致性** | 同一操作多种按钮样式 / 圆角各异 | 统一 variant 体系 / 统一圆角 |
| **过时** | 浮雕/斜角 / Web 2.0 渐变 / 不响应 | 扁平/微阴影 / 现代渐变 / 响应式 |

### 3b. 组件状态检查

核对每个交互组件是否有完备状态：

```
□ Button:    default / hover / active / focus-visible / disabled / loading
□ Input:     default / focus / disabled / error / placeholder
□ Card:      default / hover（可选）/ loading / empty
□ Modal:     open / closed / 键盘关闭 / 背景点击关闭
□ Toast:     success / info / warning / error / loading
□ Empty:     引导语 / 推荐操作 / 示意图标
□ Error:     错误信息 / 重试按钮 / 返回链接
```

### 3c. 可访问性最低门槛

| 检查项 | 阈值 |
|--------|------|
| 文本对比度 | ≥ 4.5:1（普通），≥ 3:1（大文字 ≥18px） |
| 触控目标 | ≥ 24×24px（WCAG），≥ 44×44px（最佳实践） |
| Focus 可见 | 所有可交互元素有可见焦点环 |
| 键盘可达 | Tab 键可遍历所有交互元素 |
| prefers-reduced-motion | 动画用户可关闭 |
| 色彩独立 | 信息不依赖颜色单一传达 |

### 3d. 对照 PRD 辩证验证

逐条对照 PRD 场景：

```
PRD 场景                           原型界面
─────────                         ────────
SCN-HAPPY-01: 用户成功登录    →   login-success.html ✓
SCN-ERR-01: 邮箱格式错误      →   login.html（error 态）✓
SCN-ERR-02: 密码错误          →   login.html（error 态）✓
SCN-EDGE-01: 3 次失败锁定     →   ❌ 原型中未体现！
```

发现原型遗漏 → 补上。发现 PRD 没写的界面 → PRD 补场景。

---

## 技能依赖

| 外部资源 | 用途 | 引用方式 |
|---------|------|---------|
| [ui-ux-pro-max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 设计知识库：产品→风格→配色→字体 | `python3 search.py` shell call |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | 组件库：59 个 React 组件源码 | `npx shadcn add` + 源码模式参考 |
| [claude-skills](https://github.com/mastepanoski/claude-skills) | 设计质检：设计嗅觉、组件状态、可用性 | 检查清单嵌入式引用 |

ACE 内部集成：

| 内部 Skill | 调用场景 |
|-----------|---------|
| `codebase-recon` | 项目首次用 ui-prototyping，查已有的 UI 规范和组件库存 |
| `dialectical-thinking` | 风格/配色方案选择时，对比多个方案做 trade-off |
| `cross-review` | 原型完成后，第二 AI 审查 UI 一致性和可用性 |
