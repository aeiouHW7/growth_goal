# Domain 模板

这个目录包含创建新 Domain 时使用的标准模板。

## 📁 模板文件

### 1. domain.yaml.template

Domain 的核心配置文件，定义：
- 项目名称和技术栈
- 服务配置（数据库、后端、前端）
- 启动脚本

### 2. start.sh.template

一键启动脚本，自动：
- 启动 Docker 服务
- 安装依赖
- 运行数据库迁移
- 准备开发环境

### 3. directory-structure.txt

标准目录结构参考

---

## 🚀 使用方法

### 创建新项目

```bash
# 1. 复制模板
cp -r templates/domain-react-ts domains/my-project
cd domains/my-project

# 2. 替换项目名
# 在 domain.yaml 和 start.sh 中将 {{PROJECT_NAME}} 替换为实际项目名

# 3. 启动
./start.sh
```

---

## 📝 模板定制

可以修改这些模板来适配你的需求：

1. 编辑 `domain.yaml.template` 改变默认配置
2. 编辑 `start.sh.template` 改变启动流程
3. 下次创建项目时使用新模板
