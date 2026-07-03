# OpenClaw与Hermes源码架构对比

## Ch01.318 OpenClaw与Hermes源码架构对比

> 📊 Level ⭐⭐ | 17.6KB | `entities/openclaw-hermes-source-code-agent-architecture-review.md`

## 核心洞察

OpenClaw和Hermes都还在路上——各自回答了4个重要问题，但都有局限。源码级对比揭示了每个"不完美"背后的工程取舍。

作者开发 QQBot 插件（openclaw-qqbot）过程中源码学习，对 OpenClaw 和 Hermes 的认知经历"看山三境"：**初见惊艳 → 深入发现局限 → 回看理解工程取舍**。

**四大发现**：OpenClaw 回答了4个重要问题，多协议可插拔契约、LLM上下文资源预算、记忆自动沉淀不退化、凭证失败与业务失败分治。Hermes 补充另4个：经验自动复用、安全审批先LLM分诊再叫人、执行隔离覆盖本地到云端。

## OpenClaw四大设计亮点

| 设计 | 解决的问题 | 核心机制 |
|------|---------|---------|
| 多协议可插拔契约 | 平台锁定 | Channel 25+ Adapter，统一Plugin SDK |
| 可插拔Context Engine+多级Compaction | LLM上下文预算 | 按业务模块筛选工具，减少上下文成本 |
| Dreaming三阶段加权晋升 | 记忆退化 | 向量引擎+Dreaming后台+Active Recall主动召回 |
| 凭证失败与业务失败分治 | 可靠性 | 分离身份认证和业务逻辑 |

### 解决的三个核心痛点

| 痛点 | 传统方案 | OpenClaw解法 |
|------|---------|-------------|
| 平台锁定 | 每个通道独立开发Bot | 一个Agent实例，Channel Plugin接入25+通道 |
| 能力割裂 | 能调工具但缺乏安全管控 | 五层纵深防御+审批机制 |
| 隐私失控 | 数据流经第三方服务 | 控制平面本地，仅LLM推理请求出站 |

**四大核心设计理念**：

1. **本地优先（Local-First）**：Gateway进程运行在用户设备，~/.openclaw/存储所有数据
2. **万物皆插件（Everything is a Plugin）**：核心只做编排，Channel/Provider/Tool/Media/Memory全部插件化
3. **安全纵深（Defense in Depth）**：五层递进防御，默认deny策略，shell命令需白名单或审批
4. **记忆驱动（Memory-Driven）**：SOUL.md/USER.md/MEMORY.md定义人格记忆，向量引擎+Dreaming+Active Recall

## Gateway微内核哲学

Gateway同时承担5大角色（这是与Hermes单体的根本区别）：

1. **唯一长驻进程**：避免多进程下WhatsApp二次扫码/Telegram session冲突
2. **消息总线**：所有channel/client/node流量必经，HTTP/SSE/私有RPC统一到WS Schema
3. **多Agent路由物理边界**：不同来源消息→不同Agent，独立workspace/SOUL/MEMORY/sessions，解决上下文污染/工具链冲突/渠道风格差异
4. **认证+信任边界**：Challenge-Response+Device Identity，不需要再叠nginx/网关
5. **嵌入式HTTP Host**：Agent可主动构造UI（canvas）让用户在浏览器查看

### Session Key路由机制

格式：`agent:{agentId}:{scope}`

多Agent绑定：配置bindings将不同来源消息路由到不同Agent，各Agent workspace完全隔离。

### 与Hermes的关键区别

- ❌ Hermes：一份USER.md多用户共享→串扰
- ✅ OpenClaw：多Agent物理隔离→不串扰

这与 [Multi-Agent 协作模式](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-collaboration-patterns.md) 中的**物理隔离原则**一致——多Agent架构中，隔离是防止上下文污染的根本手段。

## OpenClaw架构五层

```
触达层：Channel Plugins（25+通道）
编排层：Gateway（消息路由/Agent调度/安全控制/配置管理）
能力层：Plugin SDK
记忆层：向量记忆引擎/Dreaming后台/Active Recall
模型层：9种LLM API协议，多模型降级链
```

## Channel Plugin核心价值

完整ChannelPlugin接口包含25个Adapter，分为：

- **必选4项**：id/meta/capabilities/config
- **Auth+Security 7项**：auth/pairing/security/approvalCapability/elevated/secrets/allowlist
- **Messaging 7项**：messaging/message/outbound/streaming/threading/mentions/agentPrompt
- **协作能力7项**：commands/groups/directory/resolver/bindings/conversationBindings/actions
- **Gateway+运维6项**：gateway/gatewayMethods/lifecycle/status/heartbeat/doctor
- **反向工具**：agentTools（Channel反向给LLM提供工具，如Telegram查群成员）

**核心价值**：把"流式LLM输出"翻译成每个IM协议的最佳呈现：

- Telegram：editMessageText反复编辑同一条消息
- Discord：interaction.followUp
- iMessage：不支持流式，退化为分段发送

agentTools反向能力：Channel给LLM提供平台特有工具（如Telegram查群成员）

## Dreaming三阶段加权晋升

记忆自动沉淀机制，解决"健忘"问题（Compaction默认有损+Dreaming默认关导致长对话中段断片）：

- 向量记忆引擎 + Dreaming后台整合 + Active Recall主动召回
- Agent维度隔离记忆

这与 [Agent Memory 生命周期](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-lifecycle-philosophies.md) 中的**遗忘必要性**呼应——记忆系统必须同时具备"记住"和"遗忘"的双向能力，OpenClaw的Dreaming机制正是这一理念的工程实现。

## Hermes的补充设计

Hermes补充了另4个重要问题的解法：

| 问题 | Hermes解法 |
|------|-----------|
| 经验自动复用 | Skill即时生成+RL微调双路径 |
| 安全审批 | 先LLM分诊再叫人（Smart Approval） |
| 执行隔离 | 沙箱机制覆盖本地到云端 |
| 记忆管理 | Memory Nudge + Session Search |

### 核心定位

> Hermes Agent 并不是一个绑定在 IDE 中的编程 Copilot，也不是仅封装了单一 API 的聊天机器人外壳。它是一个部署在服务器上的自主智能体，能够记住所学内容，并且运行时间越长，能力就越强。
> — Nous Research 官方定位

详见 [Hermes-Agent 概念](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent.md)。

## 两者的局限

**OpenClaw**：

- **费token**：Bootstrap每轮push几万token
- **健忘**：Compaction默认有损+Dreaming默认关
- **复杂任务交付度低**：多步骤常丢关键决策（上下文焦虑症+自我评估偏差典型表现）

**Hermes**：

- **多人仍有串扰风险**：v0.13多Profile隔离，但同Profile内USER.md共享
- **核心仍是单体**：AIAgent类是万事汇聚的枢纽
- **记忆管理半自动**：有Memory Nudge和Session Search，但没有Dreaming那种全自动整理

> [!contradiction] 与 [Agent Memory 生命周期](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-lifecycle-philosophies.md) 的"文件即源"观点存在张力：OpenClaw的MEMORY.md和Hermes的USER.md都是Markdown，但两者在记忆治理自动化程度上差异显著——Hermes通过Skill实现了半自动的经验固化，OpenClaw的Dreaming则追求全自动整理但默认关闭。

## 第22章：七大未覆盖落地难题

1. **协议互通（22.1）**：跨Channel/跨Agent的通信标准化，与 [Model Context Protocol](https://github.com/QianJinGuo/wiki/blob/main/concepts/model-context-protocol-mcp.md) 探索同一问题域
2. **记忆分层（22.2）**：与 [Agent Memory 生命周期](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-lifecycle-philosophies.md) 的"OS隐喻"呼应
3. **上下文工程（22.3）**：融合Anthropic"上下文焦虑症"与"上下文重置"理论
4. **能力管理（22.4）**：Skill/SOP/工具的动态管理
5. **确定性编排（22.5）**：多Agent协作的确定性保证
6. **多Agent协作（22.6）**：GAN-like生成-对抗架构与Sprint Contract，与 [Multi-Agent 协作模式](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-collaboration-patterns.md) 交叉
7. **Harness全链路治理（22.7）**：自我评估偏差的对抗性消除、模型与脚手架的动态平衡，与 [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 直接相关
8. **沙箱安全（22.8）**：Hermes的沙箱机制与安全隔离

这七点是当前Agent架构的真实工程缺口，任何生产级Agent系统都必须面对这些挑战。

## 工程取舍总结

| 维度 | OpenClaw选择 | Hermes选择 | 背后的权衡 |
|------|-------------|-----------|-----------|
| 架构 | 微内核（Gateway分离） | 单体（AIAgent汇聚） | 隔离性 vs 简单性 |
| 记忆 | Dreaming全自动（有损默认关） | Memory Nudge半自动 | 自动化 vs 可控性 |
| 自进化 | Skill单路径 | Skill+RL双路径 | 轻量 vs 持久 |
| 安全 | 五层纵深防御 | Smart Approval分诊 | 纵深 vs 体验 |
| 多Agent协作 | GAN-like生成-对抗 | Sprint Contract | 不串扰 vs 资源共享 |

## 深度分析

### 微内核 vs 单体：架构选择的本质

OpenClaw的Gateway微内核和Hermes的单体AIAgent代表两种截然不同的架构哲学。微内核追求**隔离性**：每个Channel/Agent独立运行，通过WS Schema通信，物理边界清晰。但代价是复杂性上移——Gateway成了所有流量的必经节点，需要处理多协议转换、Session路由、安全边界等，这在Channel Plugin数量膨胀时带来巨大的维护负担。

Hermes的单体AIAgent则追求**简单性**：所有能力汇聚在一个类里，工具调用链、记忆管理、审批流程都在同一个上下文里完成。这降低了外部集成复杂度，但带来了"万能对象"问题——AIAgent类承担了太多职责，扩展任何一条能力线都可能影响到其他线。

### 记忆系统的两种哲学

OpenClaw的Dreaming机制代表**全自动整理**哲学——向量引擎在后台自动整合记忆，通过加权晋升机制将重要记忆逐层沉淀。但默认关闭+Compaction有损的设计表明，全自动整理的代价是信息损失不可控。Hermes的Memory Nudge+Session Search则是**半自动辅助**——不主动整理，但提供工具让用户或Agent手动触发整理。

这两种路线背后是一个根本问题：**记忆整理的收益难以量化**。一次Dreaming整合可能丢失关键上下文，而手动整理又无法规模化。这是为什么七大未覆盖难题中"记忆分层"（22.2）排在第二位——这个问题不解决，任何记忆系统都无法保证长期可靠性。

### 安全模型的纵深 vs 分诊

OpenClaw的五层纵深防御是**预防导向**：假设任何操作都可能是恶意的，逐层设卡，默认deny。这对于Shell命令等高危操作特别有效，但代价是用户体验——每次高危操作都需要审批，体验摩擦大。

Hermes的Smart Approval是**分诊导向**：先用LLM判断危险等级，再决定是否需要人工介入。这降低了 benign 操作的摩擦，但引入了新的风险——LLM分诊本身可能被攻击，且分诊逻辑的边界情况难以穷举。

两者的本质差异在于：**OpenClaw信任架构（物理隔离），Hermes信任模型（AI判断）**。在安全要求极高的场景，架构信任更可靠；在用户体验要求高的场景，模型信任更实用。

## 实践启示

### 当你选择OpenClaw时

**适合场景**：多IM平台覆盖（25+ Channel）、隐私敏感（数据不出设备）、多租户隔离（每人独立Agent实例）。OpenClaw的Gateway进程管理天然适合个人生产力工具或小规模团队协作工具。

**避坑指南**：记忆Dreaming默认关意味着你需要显式激活它，否则长对话必然断片；Bootstrap每轮push大量token意味着你需要监控LLM API成本；复杂任务交付度低意味着你需要将长程任务拆解为短程SOP。

### 当你选择Hermes时

**适合场景**：单平台深度集成、Skill自进化需求强、经验快速固化（RL微调路径）。Hermes的Skill+RL双路径对于需要持续提升专业能力的场景特别有价值——每次解决新问题，经验自动沉淀到模型权重里。

**避坑指南**：多人同Profile内USER.md共享意味着你需要为每个用户创建独立Profile，否则上下文串扰不可避免；单体架构意味着扩展能力时需要小心AIAgent类的职责膨胀；记忆半自动意味着你需要建立手动整理的记忆管理SOP。

### 架构迁移的临界点

当你发现OpenClaw的Channel Plugin维护成本超过收益时，往往意味着你应该考虑Hermes的反向路径——用Skill封装能力，而不是用Plugin扩展触达。反之，当Hermes的AIAgent类过于臃肿时，考虑OpenClaw的微内核思路：按职责拆分物理边界，用WS Schema做进程间通信。

### 七大未覆盖难题的优先级

根据工程复杂度排序：协议互通（22.1）最难——需要全行业共识；记忆分层（22.2）次难——需要OS级抽象；上下文工程（22.3）是当下最紧迫——直接影响LLM可用性；能力管理（22.4）和确定性编排（22.5）属于工程问题，有成熟方案可借鉴；多Agent协作（22.6）和Harness治理（22.7）需要结合场景深度定制；沙箱安全（22.8）已有多开源方案可集成。

## 参见

- [Hermes-Agent](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent.md) — Nous Research的持久化Agent
- [OpenClaw架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/openclaw-architecture.md) — OpenClaw设计原理
- [Agent Memory 生命周期](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-lifecycle-philosophies.md) — 记忆系统的OS隐喻
- [Multi-Agent 协作模式](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-collaboration-patterns.md) — 多智能体协作范式
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — Agent治理工程

## 相关实体
- [Hermes Agent Vs Openclaw Comparison](ch03/045-agent.md)
- [Gateway Architecture Openclaw Claude Hermes Comparison](ch11/210-openclaw.md)
- [Skill System Design Three Way Comparison](ch04/245-skill.md)
- [Hermes Agent Memory System Vs Openclaw](ch03/045-agent.md)
- [Openclaw Prompt Context Harness](ch11/210-openclaw.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/openclaw-hermes-source-code-agent-architecture-review.md)

- [Openclaw Architecture 800Lines](ch11/210-openclaw.md)
- [Aliyun Mse Ai Task Scheduling Agent Sandbox Cost 90 Percent](ch04/150-ai.md)

---

