---
title: "提示词工程、上下文工程之后，循环工程到底是什么？"
source_url: "https://mp.weixin.qq.com/s/XEy2rXAVzk7H6XPVKwQKBQ"
source_site: "ChallengeHub"
author: "ChallengeHub"
ingested: "2026-07-08"
sha256: "467e9670bbf009649af7af85b7029d8e01ee52276df80cc113e87e4667732781"
type: raw
tags:
  - loop-engineering
  - prompt-engineering
  - context-engineering
  - andrew-ng
  - addy-osmani
  - boris-cherny
  - peter-steinberger
  - ai-agent
---

> "别再给 Agent 写提示词了：三位大佬同时押注「循环工程」"

## 循环工程的兴起

AI 编程圈的三个声音汇聚到了同一个想法上——Loop Engineering（循环工程）：

- **Peter Steinberger**（OpenClaw 作者）：大家不该再给编程智能体写提示词了，而应该去设计那些「会给智能体写提示词」的循环
- **Boris Cherny**（Claude Code 之父）：自己已不再直接 prompt Claude——有一堆循环在跑，写循环现在就是我的工作
- **Addy Osmani**（谷歌 Chrome 工程负责人）：给这门实践正式起名并给出完整的解剖结构

## 三代工程的接力

1. **提示词工程**：优化的是「我该问什么？」——一条指令
2. **上下文工程**：优化的是「模型该知道什么？」——喂给模型的信息
3. **循环工程**：优化的是「工作该如何自主推进？」——整个执行系统

## 循环的六块积木（Addy Osmani）

1. **自动化（Automations）**：按计划自动触发，独立完成发现与分诊
2. **Worktree（并行隔离）**：让多个 Agent 并行开工互不踩踏
3. **技能（Skills）**：项目知识固化，SKILL.md 格式
4. **插件与连接器（Connectors）**：基于 MCP，读 issue、查数据库、调 API
5. **子智能体（Sub-agents）**：Maker ≠ Checker，干活的和检查的分开
6. **状态（State）**：Agent 遗忘之后依然存活的记忆

## 吴恩达的三个循环

1. **智能体编程循环（分钟级）**：给定规格 + 评估集，Agent 写代码、自测、持续迭代。吴恩达举例：给女儿做打字 App，Agent 独立工作一小时
2. **开发者反馈循环（几十分钟到几小时）**：开发者审视产品引导改进。提出「上下文优势」（context advantage）概念——人类远比 AI 更了解用户和环境
3. **外部反馈循环（数小时到数周）**：Alpha 测试、A/B 测试，数据反哺产品愿景

## 落地案例

**Valentina Alto** 用 GitHub Copilot + Actions 构建 Issue-to-PR 循环：触发→意图规范化→人工闸门→有边界自主构建→持续校验→自动恢复→记忆持久化→完成条件强制执行。

**WorldQuant BRAIN 挖因子循环**：每小时自动醒来，自己找方向、跑模拟、校验、记笔记、决定下一步，为期七天。体现了自校正能力——撞墙后主动切换方向。
