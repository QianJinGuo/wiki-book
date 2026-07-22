---
title: "当AI开始重写自己：EverMind的自进化智能体框架Raven"
source_url: "https://mp.weixin.qq.com/s/-mXphRfXeukWNvfUAcG7gQ"
source_site: "机器之心"
author: "机器之心发布"
ingested: "2026-07-08"
sha256: "e81c10e3eba7810a8b4b268dde9f042a8c69b984d68c758f6410ba64dffeae32"
type: raw
tags:
  - evermind
  - raven
  - self-evolving
  - agent-harness
  - long-term-memory
  - everos
  - digital-life
  - agent-framework
---

> Raven 基于自研记忆系统 EverOS，是一个自进化 Agent Harness，核心主张：主动（Proactive）、进化（Improving）、个性化（Personalized）。

## 数字生命四阶段框架（L1-L4）

- **L1：角色化指令体** — 当前 90% AI 应用，固定 Prompt 预设，无历史上下文
- **L2：记忆增强体** — 跨会话记忆，能进行长时任务规划（EverOS 覆盖）
- **L3：自我进化体** — 具备强化学习、反思与自我改进，能从交互中提炼通用知识（Raven 目标）
- **L4：全自主数字生命** — 主动探索，独立数据主权，端到端自我演化

## EverOS 核心架构

四层仿生架构：代理层、记忆层、索引层、接口层。独特之处：
- 将原始对话流切分为独立记忆单元
- 通过聚类算法形成"记忆场景"
- 对个体进行深度画像（身份、偏好、技能、工作目标）
- 以传统方案 1/10 Token 消耗实现超越全量上下文的准确率

三种记忆范畴：User Memory（定义人）、Agent Memory（定义 Agent）、Knowledge Wiki（定义世界知识）

## Raven 的自我进化能力

- 内置 **100,000 项**经过深度评测的 Skills
- 能重写自身代码：实时进化技能，闲时自我修改逻辑和策略代码
- 可通过 EverBrain（用户侧记忆模型）动态微调模型权重
- 支持微信/WhatsApp/Telegram 作为任务指挥台

## 学术护城河

- MSA（Memory Sparse Attention）：端到端稀疏注意力，1 亿 Tokens 上下文，衰减 < 9%
- HyperMem：超图层次化记忆架构，LoCoMo 基准 SOTA 92.73%，ACL 2026 Oral
- EverMemOS：自组织记忆操作系统，ACL 2026 主会
- KDD 2026 Oral：多方协作对话长时记忆评测

## 全栈生态

底层 EverOS → 模型层 EverBrain → Agent 层 Raven → 用户层 EverMe → EverX 生态计划

## 对比 mem0

| 维度 | mem0 | EverMind |
|------|------|----------|
| 定位 | 纯 API 中间件 | 底座 OS |
| 架构 | 通用向量库 + SQLite | 四层仿生 + 超图记忆 |
| Token 消耗 | 基准 | 1/10 |
| 学术 | — | ACL/KDD 顶会 |
