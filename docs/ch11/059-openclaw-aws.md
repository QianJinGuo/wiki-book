# 当 OpenClaw 学会”团队记忆”：一个面向多客户服务的企业级共享记忆系统设计 | 亚马逊AWS官方博客

## Ch11.059 当 OpenClaw 学会”团队记忆”：一个面向多客户服务的企业级共享记忆系统设计 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 11.6KB | `entities/openclaw-service-enterprise-share-system-design.md`

## 概述
当 OpenClaw 学会”团队记忆”：一个面向多客户服务的企业级共享记忆系统设计 by awschina on 17 4月 2026 in Artificial Intelligence Permalink Share 摘要：本文围绕 AI Agent 在多客户、多 Agent 协作场景下的”记忆困境”，介绍基于 Amazon AgentCore Memory 的 OpenClaw 企业级共享记忆插件 memory-agentcore，逐一拆解记忆系统的五个核心问题：记什么（Amazon AgentCore 4 策略自动提取 + 本地三层噪音预过滤）、怎么存（Event → Memory Record 的全托管数据路径）、怎么找（auto-recall 自动召回 + 肘点算法分数间隙过滤）、谁能看（层级命名空间 + actorId 驱动的最小权限隔离）、怎么管（8 个 Agent 工具

## 核心技术
OpenClaw、Amazon Bedrock、Agentic AI、MCP

## 深度分析
本文围绕 AI Agent 在多客户、多 Agent 协作场景下的"记忆困境"，系统拆解了基于 Amazon Bedrock AgentCore Memory 的 OpenClaw 企业级共享记忆插件 memory-agentcore 的设计决策。

### 核心问题框架
文章将多客户多 Agent 场景的记忆问题归纳为 5 个环环相扣的系统性问题，与企业知识管理经典命题一一对应：
| 问题 | 本质 | 系统性根因 |
|------|------|-----------|
| 记什么 | Extraction | 从对话流中提炼价值，过滤噪音 |
| 怎么存 | Storage | 持久化存储，跨会话跨 Agent 可用 |
| 怎么找 | Retrieval | 在正确范围找到正确记忆 |
| 谁能看 | Access Control | 多用户隔离 + 多 Agent 共享权限 |
| 怎么管 | Lifecycle | 反思、更新、纠错、遗忘、共享 |

### 架构定位：叠加而非替代
memory-agentcore 的核心架构决策是**不占用 OpenClaw 独占 Slot**，而是以 `kind: "general"` 注册，实现零侵入式增强。这一决策的深层逻辑：

- Memory Slot 是独占的——若占用则需替换 memory-core，导致单用户记忆能力受损
- `kind: "general"` = 安装即增强，卸载不影响原有系统
- 内置 memory-core/memory-lancedb 服务单用户维度，memory-agentcore 补充多用户隔离与跨 Agent 共享
三层记忆模型的职责划分：

- **上下文层**：管当前对话发生什么、短期记忆、如何组装上下文
- **本地记忆层**：管记住了什么、召回所需的长期记忆（memory-core/memory-lancedb）
- **云端共享层**：管共享了什么、根据策略提取记忆、如何实现用户隔离和跨 Agent 共享

### 关键技术设计
**记什么（Extraction）**：插件选择信任 AWS 全托管提取引擎，本地专注噪音预过滤。Amazon AgentCore 内置 4 种提取策略（SEMANTIC / USER_PREFERENCE / EPISODIC / SUMMARY）并行运行，自动化程度高。本地三层噪音预过滤：自适应检索门控（短消息/心跳/命令过滤）→ 双语噪声过滤（问候/心跳/AI自我声明/拒绝回复）→ 分数间隙检测（肘点算法自适应截断，避免低质量 top-K 结果注入 prompt）。
**怎么存（Storage）**：完整路径为 Hook 触发 auto-capture → Event（原始对话摘要，90 天 TTL）→ Amazon AgentCore 引擎按策略提取 → Memory Record（精炼记忆，持久化）。Events 是原材料，Memory Records 是成品。存储层由 AWS 全托管，KMS 静态加密 + TLS 传输加密。
**怎么找（Retrieval）**：核心是 `before_prompt_build` hook 驱动的 auto-recall——在每次模型执行前自动触发，对 Agent 和用户完全透明。检索使用 AWS 托管搜索，配合肘点算法分数间隙过滤。memory-agentcore 与 memory-core 的检索能力互补：后者搜索本地去客户化的通用经验，前者搜索云端当前客户记忆。
**谁能看（Access Control）**：层级命名空间（global / agents/ / projects/ / users/ / custom/）+ actorId 驱动的最小权限隔离。面客场景下 `actorId = peerId`（来自 Channel 身份），使记忆天然按客户维度隔离。跨 Agent 共享只需相同 actorId，无需额外配置。三层安全防线：Gateway `tools.profile` 白名单 + `tools.deny` 危险工具拦截 + 插件 `isScopeReadable/Writable` 代码层权限检查。Hooks 不经过工具权限管线，即使所有 agentcore 工具被 profile 屏蔽，自动化双循环仍正常运行。
**怎么管（Lifecycle）**：自动化双循环（auto-capture + auto-recall）驱动日常运行，8 个 Agent 工具（store/recall/correct/forget/search/episodes/share/stats）提供精细控制，9 个 CLI 命令赋能运维人员。EPISODIC 策略 + reflectionConfiguration 支持跨会话反思，可自动生成"近期大量客户投诉色差问题"的反思性记忆。

### 设计哲学
从"个人笔记本"到"团队知识管理系统"的演进隐含着一条清晰的设计哲学：**记忆的隔离和共享完全由"谁在说话"决定**，而非依赖配置或 LLM 行为。面客模式下，记忆天然按客户隔离、跨 Agent 共享，是因为 actorId = 客户 ID，三个层面的自动化（auto-capture / auto-recall / 策略提取）让 Agent"无感"地获得记忆能力。安全不依赖 LLM 的道德判断，而是由代码层面的权限检查保障。

## 实践启示
### 分阶段采用路径
建议按照复杂度渐进引入共享记忆能力：
1. **单 Agent + memory-core**：解决个人记忆，零额外成本，已有方案
2. **+ memory-agentcore（员工助手模式）**：云端持久化 + 4 策略自动提取，跨设备可用
3. **多 Agent + 命名空间隔离 + 跨 Agent 共享**：团队记忆，企业级治理
4. **面客模式（dmScope: per-peer）**：记忆自动按客户维度隔离，跨 Agent 天然共享，安全两层防线

### 面客部署关键配置点
- **Gateway 配置**：使用 `profile: "messaging"` 白名单机制拦截所有插件工具，自动化双循环由 Hooks 驱动不受影响
- **dmScope 配置**：设置为 `per-peer` 或 `per-channel-peer` 使 sessionKey 包含客户标识，插件自动提取 peerId 作为 actorId
- **无效 scope 安全回退**：无效的 scope 字符串不会导致权限升级，而是回退到 global——最小权限原则的保障

### 命名空间设计建议
根据使用场景选择命名空间粒度：

- **个人使用**：`/agents/{id}`，按 Agent 隔离
- **项目组共享**：`/projects/{id}`，多 Agent 可访问同一项目上下文
- **客户服务**：`/users/{id}`，跨 Agent（售前/客服/履约）共享同一客户记忆
- **全局共享**：`/global`，所有 Agent 可读可写的通用经验

### 运维实践
- **调试时**：优先使用 CLI 命令（`agentcore-status` / `agentcore-list` / `agentcore-search`）直接检查记忆内容，不依赖 Agent 对话间接操作
- **容量规划**：Events TTL 默认 90 天，按 `eventExpiryDays` 可配置；Memory Records 持久化不过期
- **文件同步**：默认不同步任何文件，仅在需要同步 Project Context 之外的文件（如产品知识库）时配置 `fileSyncEnabled: true`，使用 SHA-256 哈希做变更检测

### 噪音预过滤的自定义
运维人员可通过 `bypassPatterns`（强制通过）和 `noisePatterns`（强制过滤）的正则表达式自定义过滤规则，无需修改代码。例如配置 `"^Error:"` 作为 bypass pattern 确保错误报告永远不会被过滤。

### 安全部署检查清单
面客部署务必确认：
1. Gateway `tools.profile` 设置为 `"messaging"`，所有 agentcore 工具被拦截
2. `tools.deny` 包含 `"group:runtime", "group:fs", "group:automation"` 等危险工具组
3. dmScope 配置为 `per-peer` 或 `per-channel-peer`，确保 actorId = 客户 ID
4. Hooks 驱动的自动化双循环作为记忆读写主路径

### 与业务系统的边界
记忆系统**不能替代业务系统**（订单、CRM、工单），其职责是提取那些不在任何数据库字段里的、非结构化的、在对话中自然流露的认知——如"化纤过敏"、"审美偏保守"、"上次围巾色差投诉"等隐性信息。这一定位明确后，memory-agentcore 作为业务系统缺失的非结构化认知沉淀层，与业务系统形成互补而非竞争关系。

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/openclaw-service-enterprise-share-system-design/)

## 架构图
→ [C4 架构图](assets/c4/openclaw-service-enterprise-share-system-design-c4.html)

## 相关实体
- [企业级OpenClaw安全部署架构指南 | 亚马逊AWS官方博客](ch11/227-openclaw.html)
- [CI&amp;T基于 Amazon Bedrock AgentCore 与 OpenClaw 的企业级智能运维最佳实践 | 亚马逊AWS官方博客](../ch04/535-amazon-bedrock-agentcore.html)
- [Agentic Design System - From Chatbot to Orchestration](../ch01/010-agentic-design-system-from-chatbot-to-orchestration.html)
- [快时尚电商行业智能体设计思路与应用实践（八）基于 WebSocket 的语音系统：Nova 2 Sonic, AgentCore, Strands Agents 企业级架构实践 | 亚马逊AWS官方博客](../ch03/046-agent.html)
- [把 OpenClaw 从个人助手变成客服：一次信任模型的翻转 | 亚马逊AWS官方博客](ch11/227-openclaw.html)
- [深度拆解 Hermes Agent 记忆系统](../ch03/092-hermes-agent.html)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/openclaw-architecture.md)
## Related

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-managed-agents-self-hosted-sandbox-mcp-tunnels-enterprise.md)

- `OpenClaw Tool 消息总线架构`

---

