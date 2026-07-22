---
title: 三器合一：gstack + Superpowers + OpenSpec 工程化 AI 编程实战
source_url: https://mp.weixin.qq.com/s/j5_WRygYB_N4eagUCPSZwA
author: AgentBuff
publish_date: 2026-05-12
tags: [wechat, article, agent, coding, openspec, superpowers, gstack, engineering]
created: 2026-05-19
sha256: 428505c6293403e9fa418e30814baedf0962f70d2ae1eef0a107522edbbb9e07
---
# 三器合一：gstack + Superpowers + OpenSpec 工程化 AI 编程实战
## 核心架构
| 工具 | 管什么 | 核心机制 |
|------|--------|----------|
| OpenSpec | 做什么 | DAG 产物依赖图，写代码前先对齐需求 |
| Superpowers | 做得好 | HARD-GATE + TDD 铁律，自动拦截低质量代码 |
| gstack | 怎么做、怎么发 | Browse 引擎 + 7 阶段 Sprint 管线 |
## 安装：三者共存
- OpenSpec 产物 → `openspec/` 目录
- Superpowers 规则 → `CLAUDE.md` 和 skill 文件
- gstack 状态 → `.gstack/` 目录
三套状态互不干扰，共存于同一个 Claude Code 会话。
## 四个串联点
### 串联点 1：OpenSpec 产物 → gstack 评审输入
`/opsx:propose` 生成四个文件（proposal.md、specs/、design.md、tasks.md）。`/autoplan` 启动 CEO → design → eng → DX 四类评审，直接读取 OpenSpec 产物作为输入。
### 串联点 2：Superpowers HARD-GATE → 自动拦截编码
`brainstorming` skill 的 HARD-GATE 要求"先展示设计并获得用户批准"才能写代码。OpenSpec 的 `design.md` + gstack 评审结论满足此门禁条件，自动放行。
### 串联点 3：Superpowers TDD → gstack /review 自动生效
TDD 铁律（先写失败测试再写代码）作为 skill 文件规则自动执行。`/review` 因有测试作为行为契约，审查质量更高。
### 串联点 4：gstack /ship → OpenSpec /opsx:archive
发布完成后运行 `/opsx:archive`，Delta 规范自动合入主规范。顺序固定：先 `/ship` 上线，再 `/opsx:archive` 收尾。
## 完整案例：加暗色模式（7 步）
| 步骤 | 命令 | 自动发生的事 |
|------|------|-------------|
| 1 | `/opsx:propose` | DAG 引擎生成 4 个产物文件 |
| 2 | `/autoplan` | 4 个评审角色读取 OpenSpec 产物，输出评审结论 |
| 3 | （写代码） | Superpowers HARD-GATE 检查设计批准，TDD 铁律先写测试 |
| 4 | `/review` | gstack 读取 diff + 测试，找出生产级 bug（如 Safari 隐私模式 localStorage 异常）|
| 5 | `/qa` | Playwright Chromium 执行真实浏览器操作（截图、对比度验证）|
| 6 | `/ship` | VERSION 升级、CHANGELOG 生成、PR 创建、推送、部署 |
| 7 | `/opsx:archive` | Delta 规范合入主规范，归档变更 |
手动输入的命令只有 7 个，其余串联全部自动完成。
## 避坑指南
- **不要重复门禁**：Superpowers HARD-GATE 已卡住设计审批，不要再用 gstack 的 `/plan-design-review` 重复审查。推荐：Superpowers 管设计门禁，gstack 管代码审查（有浏览器验证）。
- **specs/ 是唯一真相源**：需求有冲突时以 `openspec/specs/` 为准。
- **/ship 是唯一发布出口**：OpenSpec 归档只是收尾记录，不是发布。
- **TDD 三个例外**：一次性原型、生成的代码、配置文件——这三种场景可以跳过 TDD。除此之外，铁律不打折扣。
## 总结
OpenSpec 在写代码之前把需求锁住，Superpowers 在写代码时把质量卡住，gstack 在写完代码之后把发布包了。三套规则在同一个会话里自动生效、互相补位。