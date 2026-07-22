---
source_url: "https://mp.weixin.qq.com/s/suXF7FpWX_umYSWJIBiUoQ"
title: "LLM Agent 怎么测评：IBM+Yale 评测综述与 2026 三条新范式"
source: "大语言模型论文跟踪"
author: "论文跟踪"
ingested: 2026-07-22
sha256: 4df04ba9e3b12e0d43f00b1f99e6ba02fa210603b103ddf90957501a32e71b01
type: raw-article
tags: [agent-evaluation, survey, ibm, yale, agentatlas, claw-eval, liveagentbench]
---

# LLM Agent 怎么测评：IBM+Yale 评测综述与 2026 三条新范式

> IBM Research + Yale 综述 v2 (arXiv:2503.16416) + 三篇 2026 跟进论文

## 核心矛盾

Agent 评测不能沿用 LLM 评测范式。评 LLM 是「答对没有」，评 Agent 是「在动态环境里通过一连串决策把事做成」。

## 综述五层结构

1. 核心能力（规划/工具/自反思/记忆）
2. 应用 benchmark（Web/SWE/科研/对话）
3. 通用 Agent
4. benchmark 设计维度
5. 开发者评测框架（LangSmith/Langfuse 等）

## Decoupling LLM & Harness Evaluation

一次 Agent 跑分至少混了三样：
- **Backbone LLM**：基座模型的推理与工具调用能力
- **Agent Harness**：编排、记忆、重试策略带来的增益或损耗
- **工具与环境**：外部接口稳定性对分数的影响

## 三篇 2026 新论文

### AgentAtlas（UCSC+MIT, 2605.20530）
控制决策六态：Act/Ask/Refuse/Stop/Confirm/Recover
轨迹失败九类（错误来源 × 影响）
核心发现：给模型显式标签菜单时控制准确率 0.87-0.95；去掉后全体下降 14-40pp 收敛到 0.54-0.62

### Claw-Eval（北大+港大, 2604.06132）
三通道证据：structured execution trace + 服务端 audit log + 执行后环境 snapshot
三维评分：Completion × Safety（乘性门控）× Robustness
核心发现：仅看输出的 LLM Judge 漏检 44% 安全违规

### LiveAgentBench（蚂蚁集团, 2603.02586）
104 场景、374 任务，SPDG 流程构建
最佳 Agent（Manus）成功率 35.29%，人类 69.25%
工具稳定性对分数影响大于模型本身

## 2026 工程向评测 Playbook

| 目标 | 推荐组合 |
|------|---------|
| 工具调用基线 | BFCL v4 + MCP-Atlas |
| 编码 Agent | SWE-bench Verified + Pro |
| Web/桌面 | WebArena / OSWorld |
| 对话+策略 | τ²-bench |
| 真实用户 | LiveAgentBench |
| 上线前审计 | Claw-Eval 风格三通道 |
| 行为诊断 | AgentAtlas 六态 |

固定三角：同一 backbone + 同一工具集 + 同一预算
至少报三个数：成功率、成本、一致性（Pass^k）
拆开 LLM 与 Harness：只做单因子变化
拒绝轨迹黑盒：关键路径必须 step/trajectory 证据
嵌入失败注入：HTTP 429/500 下 Pass^3 暴跌而 Pass@3 几乎不动
动态刷新题池：静态榜饱和后迁移到新版

## 链接

- 论文: 2503.16416v2, 2605.20530, 2604.06132, 2603.02586
