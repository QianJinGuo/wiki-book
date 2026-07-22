---
title: "/grill-with-docs，superpowers的对手来了"
source_url: "https://mp.weixin.qq.com/s/H_0v5TFawGkc7cma2ozwlg"
source_site: "AI编程实验室"
author: "鲁工"
ingested: "2026-07-08"
sha256: "35bd27aba7513cc419398be27d8d7b2acd18191949f367f194f9dcb504b1f3b2"
type: raw
tags:
  - matt-pocock
  - skills
  - superpowers
  - claude-code
  - skills-engineering
  - grill-with-docs
  - to-prd
  - agent-workflow
---

> 一套 Skills 在 X 上很火，作者 Matt Pocock，仓库名就叫 skills，15.4 万 star。

## 核心哲学

Matt Pocock 的 skills 定位是 "Skills for Real Engineers"。不同于 Superpowers（强制流程），Matt 的假设是**模型大概率会做对**，skill 只负责在关键处给一个最小的锚点。

21 个 skill 合计仅 1321 行（Superpowers 14 个 skill 合计 3300+ 行）。TDD skill 只有 36 行，篇幅全花在三个测试反模式上，剩下的交给模型自己。

## 工程流水线

五步链路：
1. **/grill-with-docs** — 连环拷问开发者，一次一个问题，问到整棵设计树没有悬而未决的分支
2. **/to-prd** — 将对话合成 PRD
3. **/to-issues** — 将 PRD 切成独立 issue
4. **/implement** — 每个 issue 单开会话执行
5. **/code-review** — 代码审查收官

## 三个精巧设计

1. **CONTEXT.md** — 项目词典。/grill-with-docs 在拷问中顺手编一本项目黑话词典，agent 能用更少的 token 更精准地沟通。本质是把领域驱动设计的通用语言概念搬给 agent
2. **disable-model-invocation** — 21 个 skill 中有 13 个禁用模型自动调用，只有手敲斜杠命令才能唤起，描述不进模型上下文。配 /ask-matt 路由 skill 兜底
3. **最小锚点原则** — 引用经典软件工程：TDD 引 Kent Beck，模块设计引 Ousterhout 深模块理论，把经典书压缩成 agent 可执行的形态

## vs Superpowers

| 维度 | Matt Pocock Skills | Superpowers |
|------|-------------------|-------------|
| 行数 | 1321 行 / 21 个 | 3300+ 行 / 14 个 |
| 触发方式 | 手动斜杠，disable-model-invocation | hook 自动注入，强推 |
| 控制假设 | 模型大概率会做对，给最小锚点 | 模型会偷懒，堵死每条退路 |
| 索引 | /ask-matt 路由 skill | — |
| star | 15.4 万 | 24.7 万 |
