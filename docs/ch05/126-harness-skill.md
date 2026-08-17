# Harness 工程之道：Skill 原理与最佳实践

## Ch05.126 Harness 工程之道：Skill 原理与最佳实践

> 📊 Level ⭐⭐ | 2.0KB | `entities/harness-skill-原理与最佳实践-zhangmengjie-2026.md`

# Harness 工程之道：Skill 原理与最佳实践

## 核心内容

一篇系统讲解 Agent Skill **结构规范、触发机制、作用域优先级** 及最佳实践的工程化文章，基于真实项目 `trade-ab-skill`。Agent Skills 是一种轻量、开放的能力扩展规范，用于为 AI Agent 扩展专业知识与工作流。

## 关键维度

- **结构规范**：Skill 文件/目录如何组织，如何声明触发条件与描述
- **触发机制**：Agent 在何种条件下自动加载/匹配 Skill
- **作用域优先级**：多个 Skill 或 Skill 与系统指令冲突时的解析顺序
- **最佳实践**：如何用工程化方法（如 trade-ab-skill）让 Skill 可复用、可维护、可评估

## 与现有 Skill 体系的关系

本文与 [Anthropic 官方 Agent Skills 设计模式](../ch01/778-anthropic.html)、[Skill 设计 8 块清单](../ch04/348-skill.html)、[Harness 工程范式](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-harness-engineering-paradigm.md) 同属 Skill/Harness 工程化议题——本文的差异化在于从**原理层**（触发/作用域/优先级）而非模式清单切入，并附真实工程案例。

## 价值

- 为 Skill 设计提供可迁移的"原理 + 落地"框架，直接可用于 coding agent / research agent 的能力扩展
- 补充了 Skill 触发与注入机制的底层理解

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/harness-skill-原理与最佳实践-zhangmengjie-2026.md)

---

