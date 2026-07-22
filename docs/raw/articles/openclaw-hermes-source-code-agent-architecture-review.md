---
title: "OpenClaw与Hermes：源码里的 AI Agent 架构知识大复盘"
description: "rianli源码深挖OpenClaw(TypeScript微内核)+Hermes架构对比：Channel契约/Gateway路由/Dreaming记忆/Smart Approval/沙箱，22章覆盖协议互通/多Agent协作/Harness治理"
source_url: "https://mp.weixin.qq.com/s/49dxdMXEUoWIYlIh8fFqMQ"
feed_name: "腾讯技术工程"
author: "rianli"
ingested: "2026-05-29"
type: article
tags: [agent, openclaw, hermes, architecture, source-code, local-first, channel, gateway, memory, sandbox]
sha256: "7d6bac01bade4e075ad712daecca998b3165033bb4b305d08b2357fb6941ae67"
---

# OpenClaw与Hermes：源码里的 AI Agent 架构知识大复盘

> 来源：腾讯技术工程 | 作者：rianli | 2026-05-29 | 基于 OpenClaw v2026.5.6

## 核心命题

作者开发 QQBot 插件（openclaw-qqbot）过程中源码学习，对 OpenClaw 和 Hermes 的认知经历"看山三境"：初见惊艳 → 深入发现局限 → 回看理解工程取舍。

**四大发现**：OpenClaw 回答了4个重要问题，多协议可插拔契约、LLM上下文资源预算、记忆自动沉淀不退化、凭证失败与业务失败分治。Hermes 补充另4个：经验自动复用、安全审批先LLM分诊再叫人、执行隔离覆盖本地到云端。

## OpenClaw 设计原理

### 解决的三个核心痛点

| 痛点 | 传统方案 | OpenClaw解法 |
|------|---------|-------------|
| 平台锁定 | 每个通道独立开发Bot | 一个Agent实例，Channel Plugin接入25+通道 |
| 能力割裂 | 能调工具但缺乏安全管控 | 五层纵深防御+审批机制 |
| 隐私失控 | 数据流经第三方服务 | 控制平面本地，仅LLM推理请求出站 |

### 四大核心设计理念

1. **本地优先（Local-First）**：Gateway进程运行在用户设备，~/.openclaw/存储所有数据
2. **万物皆插件（Everything is a Plugin）**：核心只做编排，Channel/Provider/Tool/Media/Memory全部插件化
3. **安全纵深（Defense in Depth）**：五层递进防御，默认deny策略，shell命令需白名单或审批
4. **记忆驱动（Memory-Driven）**：SOUL.md/USER.md/MEMORY.md定义人格记忆，向量引擎+Dreaming+Active Recall

## OpenClaw架构五层

```
触达层：Channel Plugins（25+通道）
编排层：Gateway（消息路由/Agent调度/安全控制/配置管理）
能力层：Plugin SDK
记忆层：向量记忆引擎/Dreaming后台/Active Recall
模型层：9种LLM API协议，多模型降级链
```

## Gateway五大角色（微内核哲学）

1. **唯一长驻进程**：避免多进程下WhatsApp二次扫码/Telegram session冲突
2. **消息总线**：所有channel/client/node流量必经，HTTP/SSE/私有RPC统一到WS Schema
3. **多Agent路由物理边界**：不同来源消息→不同Agent，独立workspace/SOUL/MEMORY/sessions，解决上下文污染/工具链冲突/渠道风格差异
4. **认证+信任边界**：Challenge-Response+Device Identity，不需要再叠nginx/网关
5. **嵌入式HTTP Host**：Agent可主动构造UI（canvas）让用户在浏览器查看

## Session Key路由机制

格式：`agent:{agentId}:{scope}`

多Agent绑定：配置bindings将不同来源消息路由到不同Agent，各Agent workspace完全隔离。

**Hermes对比**：
- ❌ Hermes：一份USER.md多用户共享→串扰
- ✅ OpenClaw：多Agent物理隔离→不串扰

## Channel Plugin契约（25+ Adapter）

完整ChannelPlugin接口包含25个Adapter，分为：
- 必选4项：id/meta/capabilities/config
- Auth+Security 7项：auth/pairing/security/approvalCapability/elevated/secrets/allowlist
- Messaging 7项：messaging/message/outbound/streaming/threading/mentions/agentPrompt
- 协作能力7项：commands/groups/directory/resolver/bindings/conversationBindings/actions
- Gateway+运维6项：gateway/gatewayMethods/lifecycle/status/heartbeat/doctor
- 反向工具：agentTools（Channel反向给LLM提供工具，如Telegram查群成员）

**核心价值**：把"流式LLM输出"翻译成每个IM协议的最佳呈现（Telegram用editMessageText反复编辑、Discord用interaction.followUp）

## Dreaming三阶段加权晋升

记忆自动沉淀机制，解决"健忘"问题（Compaction默认有损+Dreaming默认关导致长对话中段断片）：

- 向量记忆引擎 + Dreaming后台整合 + Active Recall主动召回
- Agent维度隔离记忆

## Part III对比与未覆盖难题

### OpenClaw的局限

- 费token：Bootstrap每轮push几万token
- 健忘：Compaction默认有损+Dreaming默认关
- 复杂任务交付度低：多步骤常丢关键决策（上下文焦虑症+自我评估偏差典型表现）

### Hermes的局限

- 多人仍有串扰风险：v0.13多Profile隔离，但同Profile内USER.md共享
- 核心仍是单体：AIAgent类是万事汇聚的枢纽
- 记忆管理半自动：有Memory Nudge和Session Search，但没有Dreaming那种全自动整理

### 第22章：七大未覆盖落地难题

1. **协议互通（22.1）**
2. **记忆分层（22.2）**
3. **上下文工程（22.3）**：融合Anthropic"上下文焦虑症"与"上下文重置"理论
4. **能力管理（22.4）**
5. **确定性编排（22.5）**
6. **多Agent协作（22.6）**：GAN-like生成-对抗架构与Sprint Contract
7. **Harness全链路治理（22.7）**：自我评估偏差的对抗性消除、模型与脚手架的动态平衡
8. **沙箱安全（22.8）**

---

→ [[raw/articles/openclaw-hermes-source-code-agent-architecture-review|原文存档]]
