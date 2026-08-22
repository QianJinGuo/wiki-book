# Cursor Origin：面向智能体时代的 Git Forge（并购 Graphite 后落地）

## Ch04.768 Cursor Origin：面向智能体时代的 Git Forge（并购 Graphite 后落地）

> 📊 Level ⭐⭐ | 3.4KB | `entities/cursor-origin-agent-github-2026.md`

# Cursor Origin：面向智能体时代的 Git Forge

## 背景：仓库架构跟不上 AI 写代码的速度

2026 年 8 月，Cursor 宣布上线全新的代码托管平台 **Origin**（early beta，向付费用户逐步推送），首次把「代码存放在哪里」纳入自己的产品边界。此前 Cursor 主要负责写/改代码和调用 Agent，仓库、PR、协作流程仍发生在 GitHub 上。

动机是 AI Agent 改变了协作节奏：当一个人同时指挥 5-10 个 Agent 干活时，它们会同时克隆仓库、开出大量分支、高频提交、彼此 rebase，产生一堆相互依赖需按顺序合并的变更。传统 Git 托管流程在这种密度下会「排队」——PR 相互阻塞，冲突需人挨个仲裁。Origin 把自身定位为「面向智能体时代的 Git forge」，暗示 GitHub 属于上一个（以「人天」为节奏、围绕人的 PR 审阅）时代。

## 两种工作模式

1. **托管在 Origin**：Cursor 客户端新增「Codebase」标签页作为统一入口，创建仓库后（`cursor.com/codebase/<org>`）安装 Origin CLI。底层仍是标准 Git 仓库，`git clone/pull/push` 照常可用。
2. **同步 GitHub 仓库**：连接 GitHub 后挑选需同步的仓库，与 Origin 原生仓库并列显示、秒级实时同步。可在 Cursor 内浏览/搜索/拉取代码、查看 PR 时间线/提交/CI/变更文件、审阅 diff、留言甚至合并；PR 讨论双向同步（Cursor 评论→GitHub，GitHub 回复→Cursor）。边界：对 GitHub 同步项目，代码推送仍进 GitHub，GitHub 继续作为 source of truth。

2025 年 12 月 Cursor 收购了以**堆叠式 PR（stacked PR）**工作流著称的代码审查工具 Graphite，其专长正是处理多个相互依赖的变更并行推进——如今这套机制被重新用在机器协作上（官方称真正的 Agent 原生功能稍后推出）。生态首批接入 Vercel（每 PR 自动预览部署）、Depot 与 Buildkite（CI，可运行现有 GitHub Actions 工作流）。

## 发布时机与战略

Origin 上线当天 GitHub 恰好遭遇全球性服务中断（8/17，PR/Issues/Actions/Webhooks/API/Copilot 受影响，事故约 3 小时 20 分）。三天前 SpaceX 刚完成对 Anysphere 的 600 亿美元全股票收购（6/16 宣布，创风投支持初创公司最大退出纪录），Origin 被解读为 SpaceXAI「垂直整合 AI 技术栈」的第一个动作。

## 定位

- 与 [Cursor Harness](../ch01/451-cursor-harness-model-production-floor.html) 同属 Cursor 向更底层「工作流/协作」边界的延伸；与 [Cursor Evals](../ch01/340-cursor-evals-benchmark-3-1-2026-07.html) 关注点不同（本实体是代码托管/协作层，非评估）。
- 代表「Agent swarming 时代源码托管」的新范式：stacked PR 机制从人类协作复用为机器协作。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/cursor-origin-agent-github-2026.md)

---

