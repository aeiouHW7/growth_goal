---
name: feedback-openspec-per-domain
description: openspec 按子项目管理（domains/todo-app/openspec/），todo-app 是引擎优化载体
metadata:
  type: feedback
---

OpenSpec 变更提案按 domain 管理，不放在引擎根目录。

**Why:** 用户确认 todo-app 不是独立产品，是 ACE Engine 的"练兵场"— 引擎新能力在这里实战验证。变更记录跟着项目走，不跟着引擎走。

**How to apply:** 新的 openspec 变更放在 `domains/{project}/openspec/changes/{change-id}/`，不放在根目录的 openspec/。引擎自身的改动（如 ace-user-journey）也放在 todo-app 的 openspec 下，因为是通过 todo-app 验证的。
