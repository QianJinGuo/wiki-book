---
title: "Skill 编排的 6 种依赖关系：数据、顺序、工具、版本、权限、循环"
source_url: "https://mp.weixin.qq.com/s/kS8oyTzjK1LhE_0NRSBJuw"
author: "小G / JavaGuide"
created: 2026-07-02
updated: 2026-07-02
type: raw
tags: [skill-orchestration, dependency-management, agent-skills, context-management, versioning, security]
ingested: 2026-07-02
sha256: 236ff8479914fb50512b2b104744651e55f6f1949ffc671209204646406d4075
---

# Skill 编排的 6 种依赖关系

## 全景

| 依赖类型 | 核心问题 | 解法方向 |
|----------|----------|----------|
| 数据依赖 | 后面的 skill 怎么拿到前面的结果 | 结果追加进 context |
| 顺序依赖 | 先跑哪个后跑哪个 | 文件名前缀 / 规划层动态决策 |
| 工具依赖 | skill 需要的环境信息从哪来 | context 开头注入环境快照 |
| 版本依赖 | skill 更新了旧流程怎么办 | 文件名带版本号，保留历史 |
| 权限依赖 | 某些操作要先鉴权 | auth skill 固定第一个跑 |
| 循环依赖 | A 依赖 B、B 又依赖 A | 线性执行天然避免 |

## 关键见解

### 数据依赖
context 是 skill 之间唯一的信息通道。超过 5-7 个 skill 的链条需要摘要压缩。

### 顺序依赖
- 静态文件名前缀（01_/02_/03_）——透明可读，适合固定流程
- 动态规划层——适合执行路径分叉的场景
- 不要过早设计：固定流程用数字前缀比动态规划值钱

### 工具/环境依赖
依赖注入思维：context 开头注入环境快照，不让 skill 自己猜测环境。**安全坑**：debug 日志中的 API 密钥可能通过 context 泄露，敏感信息走代码通道不走 context。

### 版本依赖
文件名带版本号（send_email_v1.md / v2.md）解决两个问题：用新不用旧 + 可回溯回滚。

### 权限依赖
auth skill 永远第一个跑，但 token 不应进入 context——敏感信息走代码变量层，不走「给模型看」的通道。

### 循环依赖
线性 skill 执行模型天然避免循环依赖——每次追加 context 是单向增长，不存在回溯。
