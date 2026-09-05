---
source_url: "https://mp.weixin.qq.com/s/a3-nYQIezEDBFrvVXm8-bQ"
title: "新概念 AI 编程第五章：Graph Engineering"
source: "Vibe编码"
author: "VibeCoder"
ingested: 2026-07-22
sha256: aa9a77b71f23093effbef1bd654107d21cd5af6fb312ec7fef99e4ee7273ed4e
type: raw-article
tags: [graph-engineering, agent-orchestration, vibe-coder, loop-engineering, governance]
---

# 新概念 AI 编程第五章：Graph Engineering

## 定义：两层图

- **执行图**：工作如何流动。节点=Agent/脚本/测试/审批；边=依赖/数据/分支/汇合/重试/升级
- **治理图**：谁有权相信谁。反指标/慢层目标所有者/仲裁/独立审计

## 五层工程栈

Prompt Engineering → Context Engineering → Harness Engineering → Loop Engineering → **Graph Engineering**

外层扩大控制范围，内层依然存在。Graph 里有 Loop，节点里照样需要 Prompt、Context 和 Harness。

## 可执行 Agent 图设计

### 节点契约
- 输入：目标、验收、context、artifact 版本、权限、预算
- 输出：artifact、evidence、state delta、failure（避免自然语言丢给下游）

### 边声明
激活条件、数据选择、下游身份、汇合规则、失败语义

### 四块状态
- 调度状态（运行位置）
- artifact 状态（工件版本）
- context 状态（节点所见内容）
- policy 状态（权限规则）

## 集体自欺（Collective Self-Deception）

| 模式 | 表现 |
|------|------|
| **Goodhart** | 代理指标越做越好，真实结果一路变差 |
| **向上盲视** | 完成错误目标 |
| **循环冲突** | 各项局部全绿，整体持续振荡 |
| **测量衰减** | 报表互相确认，数字早已脱离现实 |

## 什么时候扩成 Graph

先检查单 Loop：外部 verifier、持久状态、成功出口、硬停止。这里没做好，扩图只会放大故障。

强顺序推理、共享同一大块上下文、没有可执行 verifier 时，单 Loop 更稳更便宜。

## 链接

- 已有实体: [[entities/grok-build-agent-kernel-vibecoder-2026]]（VibeCoder 其他源码级分析）
- 已有 raw: [[raw/articles/graph-engineering-claude-code-seebin-2026]]（另一篇 Graph Engineering 文章）
