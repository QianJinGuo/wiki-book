# Hermes Agent

## Ch04.506 Hermes Agent

> 📊 Level ⭐⭐ | 5.4KB | `entities/hermes-agent.md`

## Overview
Hermes Agent 是 **Nous Research** 开源的自主演式 AI Agent 框架，GitHub **10 万+ Stars**（2026 年 4 月）。
核心思路：一个部署在你自己设备上的 AI Agent，**用得越久越强**，拥有自我进化的学习循环、记忆机制、40+ 聊天平台接入。

## Key Facts
| Fact | Detail |
|------|--------|
| 开发商 | Nous Research |
| GitHub Stars | 10 万+ |
| 定位 | 自主 Agent 框架 |
| 核心特性 | 自我进化、记忆机制、多平台接入 |
| 开源协议 | 开源 |

## 核心架构
### Self-Evolution（自进化）
两条进化路径：

- **外挂式（Skill 生成）**：AI 做过的任务自动生成 Skill，下次同类任务直接调用，无需重复 prompt
- **内功式（RL 训练）**：通过强化学习持续提升模型能力

### 记忆机制
- 原生：每轮对话直接存 SQLite，检索用文本匹配
- **问题**：重复条目多、过时矛盾内容堆积、关键词搜不到
- **解决方案**：搭配 MemOS 插件（见 [MemOS 记忆插件](https://github.com/QianJinGuo/wiki/blob/main/entities/memos-hermes-plugin.md)）

### Skill 机制
- 做过的活儿不用教第二遍
- Skill 自动生成 → 积累成可复用工具包
- 原生限制：技能生成用同一模型，质量参差不齐

## 生态位
| 维度 | 说明 |
|------|------|
| Agent 框架 | OpenClaw 竞品 |
| 进化机制 | Skill 生成（外挂）+ RL 训练（内功） |
| 记忆 | 原生弱，需配 MemOS 插件 |
| 多平台 | 40+ 聊天平台接入 |

## Related
- [Hermes-Agent 自进化机制](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent.md) — Skill 生成 + RL 训练双路径详解
- [原始调研存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-tools-research.md)
- [Qoder Skills 完全指南：从零开始，让 AI 按你的标准执行](../ch07/034-qoder-skills.html)
- [Thin Harness Fat Skills](../ch05/079-thin-harness-fat-skills-ai.html)
- [从Vibe Coding到Agentic Engineering：重构后台开发全流程 — 腾讯技术工程](ch04/203-tencent-vibe-coding-to-agentic-engineering-backend.html)

## 深度分析
Hermes Agent 的自进化机制代表了一种新型的 AI Agent 设计范式：**外挂式技能生成 + 内功式强化学习**的双轨并行架构。
**外挂式进化（Skill 生成）**的核心价值在于边际成本趋零——每完成一次任务，AI 自动将解决方案封装为可复用的 Skill 组件。这意味着随着使用时长增加，Agent 的"工具箱"不断扩充，后续同类任务无需重新编写 prompt，直接调用已有 Skill 即可。
**内功式进化（RL 训练）**则作用于模型底层能力，通过强化学习持续优化决策策略。两者的关键区别在于：Skill 生成解决的是"经验复用"问题，RL 训练解决的是"能力提升"问题。
**记忆机制的局限性**是当前架构的主要瓶颈。原生 SQLite + 文本匹配的方案在长期使用后会产生知识冗余和检索衰减，这与 MemOS 插件的结合反映了社区对这一问题的认知——单纯依赖向量相似度匹配并非银弹。
从横向对比角度看，CLI-Anything（32.4k ⭐）、OpenCLI（17.1k）、AutoCLI（2.4k）等竞品主要聚焦于特定场景的垂直能力，而 Hermes 的差异化在于其**生态广度**（40+ 平台接入）和**进化深度**（双轨并行）的结合。

## 实践启示
1. **自进化应作为 Agent 设计的第一性原则**：从架构层面支持 Skill 自动生成，而非事后打补丁
2. **记忆系统需要分层设计**：短期对话记忆、长期技能记忆、跨会话知识持久化应分离处理，避免用单一存储方案应对所有场景
3. **多平台接入是生态壁垒**：40+ 聊天平台接入带来的网络效应远大于单平台深度优化
4. **警惕"进化陷阱"**：Skill 自动生成若缺乏质量控制，会导致技术债务累积，需要配套的 Skill 评估与淘汰机制

## 相关实体
- [9个Agent技能模块化SageMaker微调生命周期](ch04/402-aws-sagemaker-ai-agent.html)

- [Perplexity 内部 Skill 设计指南：四维体系与维护方法论](ch04/267-skill.html)
- [重新定义Skill开发：保姆级教程&一站式开发助手发布](ch04/267-skill.html)
- [Anthropic 14 个 Agent Skills 设计模式](ch04/251-anthropic-agent.html)
- [Skill 系统：Agent 如何把经验沉淀成可复用能力](../ch07/017-hermes-skill.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hermes-agent-closed-learning-loop.md)

- [Trace2Skill: 轨迹经验蒸馏为可迁移 Agent Skills](ch04/396-agent-skills.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/claude-code-complete-guide.md)

---

