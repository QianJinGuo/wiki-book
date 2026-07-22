---
title: "Codex 架构配置：五层架构"
source_url: "https://www.xiaohongshu.com/explore/6a0c142b000000000702719d"
created: 2026-07-02
updated: 2026-07-02
type: article
tags: [xiaohongshu, codex, architecture, agents-md, skills, hooks, subagents, plugins]
ingested: 2026-07-02
sha256: d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5
---

# Codex 架构配置：五层架构

## Layer 1：记忆层（AGENTS.md）
- **关键价值**：统一命名、结构、仓库规范，让 AI 团队所有成员对齐底层规则
- **核心作用**：全局配置、项目级规则、代码规范、工程红线，是"写死的团队共识"

## Layer 2：知识层（skills/）
- **关键价值**：沉淀团队最佳实践，避免重复造轮子，让 AI 按场景匹配能力
- **核心作用**：工作流提取，让 Agent 自动识别、按需调用

## Layer 3：护栏层（hooks/）
- **关键价值**：事前拦截风险、事后留痕记录，确保 AI 操作安全可控
- **核心作用**：特定行为前后自动执行，防危险命令、自动化操作、部署通知

## Layer 4：委派层（subagents/）
- **关键价值**：每个子智能体有独立上下文窗口、自定义工具与权限，结果回传主线程
- **核心作用**：子智能体，独立上下文、并行执行、互不干扰

## Layer 5：分发层（plugins/）
- **关键价值**：支持 NPM 包分发、版本可控，一键安装实现全队配置同步
- **核心作用**：技能、规则、子智能体一键同步，确保团队配置完全一致
