---
title: "Coding Agent 下半场：从个人提效到组织级研发体系 — AgentScope Harness + Open SWE + Minions/Inspect/Cloudbot 收敛"
source: wechat-mp
source_url: https://mp.weixin.qq.com/s/LA1AFSjb5ffTHDA2xkv0wQ
author: 阿里云云原生 / AgentScope 社区
published: 2026-06-12
ingested: 2026-06-12
type: article-summary
tags: [coding-agent, agentscope, agentscope-java, harness, open-swe, stripe-minions, ramp-inspect, coinbase-cloudbot, organization-level, sandbox, draft-pr, plan-mode, tool-curation, sub-agent]
sha256: 77f11ee32aa18f0862d039866162af0620cf07a7a1805c250751a43453a5b594
---

你是调研助手...
```

主 Agent 调用 `agent_spawn agent_id="researcher" task="..."`，子 Agent 隔离上下文跑完，结果注入下一轮推理。

### 8.5 Plan Mode

大改之前先想清楚。开启后 Agent 进入只读阶段，只能调读取工具 + 4 个 plan 工具，**退出 plan 需人类确认**。Coinbase Cloudbot "Agent Councils" 同理念。

### 8.6 工具精选：500 → 15

Stripe Minions 早期 500 个工具 → "tool curation matters more than tool quantity"。Open SWE 只暴露约 15 个核心工具。Harness 内置：文件操作 + shell 执行 + 记忆检索，业务工具 `toolkit.register(...)` 按需注册。

### 8.7 Draft PR 作为输出契约

Agent 产出 = draft PR，**永远需要人类 review 后才能 merge**。Agent 不直接改生产代码。

## 九、引用源

- 原文：https://mp.weixin.qq.com/s/LA1AFSjb5ffTHDA2xkv0wQ
- 关联：[[raw/articles/agentscope-java-2.0-enterprise-distributed-harness|AgentScope Java 2.0 实体]]
- 关联：[[raw/articles/agentscope-java-harness-framework-enterprise-distributed|AgentScope Java Harness Framework 42KB]]
- 关联：[[raw/articles/agentscope-builder-enterprise-self-evolving-agent-harness|AgentScope Builder]]
- 关联：[[raw/articles/agent-harness-engineering-survey-2026|Agent Harness Engineering Survey]]
- 关联：[[raw/articles/agent-harness-architecture-design-production-guide|Agent Harness Architecture Production Guide]]
- 关联：[[raw/articles/loop-engineering-addy-osmani-challengehub|Loop Engineering]]
- 关联：[[raw/articles/mxc-execution-containers-internals-origin|MXC Execution Containers]]
