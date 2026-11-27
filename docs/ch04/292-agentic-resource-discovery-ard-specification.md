# Agentic Resource Discovery (ARD) Specification

> 📊 Level ⭐⭐⭐⭐ | 12.1KB

## 摘要

**Agentic Resource Discovery (ARD)** 是 Snowflake 联合 Microsoft、GoDaddy 等推出的开放协议，标准化企业级 AI Agent 的目录化、搜索和发现机制。ARD 解决的核心问题是：企业内部已部署大量 AI Agent（MCP servers、A2A agents、Skills、传统 API tools），但 AI 客户端无法自动找到最佳能力来完成给定任务。ARD 作为**发现层**，与 MCP（工具调用）、A2A（Agent 间通信）互补，三者构成完整的 Agent 互操作栈。

## 核心要点

### 从部署到发现的断层

- AI 客户端已能调用外部工具、MCP 服务器、API、工作流和 Agent
- 缺失的一环：**AI 客户端如何自动发现**组织内所有已构建和批准的能力？
- ARD 填补这一发现层——将分散的 Agent 集合转变为**互联的企业级能力网络**
- "周一数据团队发布的 Agent，周二销售即可通过任意 AI 界面使用"——无需手动集成

### 四步架构

| 步骤 | 说明 |
|------|------|
| **Describe** | 资源发布者创建 `ai-catalog.json` 清单，描述 Agent 功能、任务类型、调用方式。清单托管在发布者自有域名。 |
| **Curate** | Discovery service 通过爬取公开目录、导入内部清单或应用策略来构建集合。企业控制哪些 Agent 被纳入。 |
| **Search** | 客户端用自然语言 + 可选过滤器查询 discovery service，返回排序后的 Agent 列表（含 schema 和 endpoint）。 |
| **Execute** | 客户端直接连接到所选资源的原生协议（MCP / A2A / REST）。Discovery service 不在调用路径中。 |

### 关键设计决策

- **域锚定（domain-anchored）**：`ai-catalog.json` 托管在发布者自有域名，不依赖中心化注册表——避免单点故障和审查风险
- **联邦可组合**：企业可运行一个 ARD endpoint，合并内部 Agent + 选定的供应商和公共资源——统一答案集、组织保留控制权
- **不在调用路径中**：Discovery service 仅负责发现，不代理调用——认证和数据访问在客户端与 Agent 之间（性能和安全的关键设计）
- **协议无关**：支持 MCP、A2A、REST 等多种协议的 Agent 统一发现

### 与 Snowflake Cortex Agents 的集成

- 团队在 Snowsight / CoCo 中构建 Agent → **自动生成 ARD 清单**
- 通过 Snowflake CoWork 或 Microsoft Copilot 等 AI 界面发现并调用
- 零集成成本：数据团队构建的 Agent 自动出现在销售团队的 AI 界面中

### ARD 在互操作栈中的位置

```
┌─────────────┐
│     ARD     │  ← 发现层：Agent 如何被发现
├─────────────┤
│     A2A     │  ← 通信层：Agent 间如何通信
├─────────────┤
│     MCP     │  ← 工具层：工具如何被调用
└─────────────┘
```

三者互补而非竞争——ARD 解决 "找谁"，A2A 解决 "怎么对话"，MCP 解决 "怎么调工具"。

## 深度分析

### 企业 AI 的"最后一公里"：两个来源对同一断层的独立确认

两篇原始材料从不同角色描述了同一个断层。Snowflake 站在客户端一侧：AI 客户端已能调用工具、MCP 服务器、API 与 Agent，缺的是在组织已构建并批准的全部能力中"自动找到给定任务的最佳选择"。AWS 站在运营者一侧：没有中央目录时资源彼此孤立，开发者只能人工定位、审查、连接并维护每条集成，且为一个 AI 客户端做的配置不会自动对另一个生效。合起来看，供给侧（把 Agent 构建出来）已经过剩，发现侧仍是人工流程——这正是"已构建"到"被使用"之间的最后一公里，其出现逻辑与 DNS/搜索引擎同构：当数量超过人工记忆或管理能力时，目录式发现成为必需品。

### DNS 类比的真实分量：出自 DNS 工程师的设计意图

第 2 来源把 ARD 的联邦作用直接类比 DNS 的名称解析：各环境目录以共同协议暴露在端点之后，任何注册表只需理解共享协议即可跨库索引，本地注册表联邦互操作无需双边协议或专有连接器。这个类比不是修辞——该文两位核心作者均出自 Amazon Route 53 与大规模 DNS/网络技术体系，其明确方向是让成熟的互联网基础设施支撑 Agent 的发现，乃至为其提供稳定、可验证的身份（参见 [Agent Identity Portability](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-identity-portability.md)）。对照第 1 来源：域锚定的 `ai-catalog.json` 托管在发布者自有域名，如同 DNS 的区域自治——每个域自持权威数据；而"企业运行一个合并内部、供应商与公共资源的 ARD 端点，员工看到统一答案集"则是组合式解析的企业版。AWS 还给出反命题：各环境各用私有元数据格式时，每对需要互通的注册表都要编写 bespoke 连接器；共享规范把方程改写为"描述一次、处处发现"。

### 联邦架构的战略选择：控制权留在本地

第 1 来源的架构取向——清单不离自有域名、跨"可组合、联邦的发现服务网络"运作——在第 2 来源得到逐条呼应：跨云/本地/SaaS 的存量基础设施以一致格式暴露而无需迁移（"federate without migrating"），发布方保留对内容、可见性与撤销时机的控制（"discover globally, control locally"），现有访问控制仍留在执行点、ARD 只承担互操作层，且任何组织都能在自有域名发布目录、打开跨组织发现路径。这解释了企业敢于采用的前提：控制平面留在本地，而发现层本身以 Apache 2.0 开放规范存在，不被单一厂商锁定——发现层的"谁被看到"与执行层的"谁能访问"被有意分离。

### 从规范到落地：协议规范 + 注册表实现的双层模式

ARD 统一发现 MCP 服务器、A2A Agent、Skills 与传统 API 工具，与 [Model Context Protocol (MCP)](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-context-protocol-mcp.md) 互补而非替代。两个来源恰好展示了栈的两层：AWS Agent Registry 是规范思想的集中式具体实现——Registry/Record 双概念（带授权与审批配置的目录 + 描述"是什么/做什么/如何连接"的单条记录，可跨账号服务整个 AWS Organization），治理工作流为管理员建库（IAM/JWT 授权）→ 发布者提交记录 → 策展人审批或弃用 → 消费者搜索发现，并配达标审批、语义+关键词混合搜索、注册表自身暴露为远程 MCP 端点等企业特性；Snowflake 侧则是自动化路径——在 Snowsight/CoCo 构建的 Cortex Agent 自动生成 ARD 清单。这正是成熟基础设施的常见模式：开放协议（类 DNS 的 RFC）+ 多元注册表实现（类 BIND/Route 53）。不变的边界是：发现服务永远不在调用路径中，认证与数据访问保持在客户端与 Agent 之间——发现层只回答"找谁"，不触碰"怎么调用"。

## 实践启示

1. **关注 ARD 规范演进**：作为新兴开放协议，早期参与（实现、反馈）可在规范定型前获得影响力——参考 MCP 早期采用者的先发优势
2. **为企业 Agent 建立清单目录**：即使不采用 ARD，也应为企业内部 Agent 建立标准化的元数据描述（功能、输入输出、所属团队），为未来发现层做准备
3. **评估 Snowflake Cortex Agents 集成**：如果已在使用 Snowflake，关注 CoWork/CoCo 中的 ARD 自动生成机制——可能是零成本接入 Agent 发现网络的最快路径
4. **Agent 互操作栈选型**：MCP + A2A + ARD 正在形成事实标准组合——新 Agent 项目应优先考虑与这三者的兼容性
5. **联邦发现模式的内部应用**：ARD 的联邦可组合架构可被内部平台团队借鉴——构建统一的 Agent 目录服务，合并各团队的 Agent 资源

## 第 2 来源 — AWS（2026-08-25）

AWS 侧对同一 ARD 开放规范的补充视角，聚焦 **AWS Agent Registry**（AWS Agent Registry + Agentic Resource Discovery 规范）。与第 1 来源（Snowflake/Microsoft 视角）互补，互补角度如下：

- **1. 具体实现：AWS Agent Registry 的 Registry/Record 双概念**——Registry 是按授权与审批设置建立的目录（可跨账号共享服务整个 AWS Organization），Record 是描述"是什么/做什么/如何连接"的单个资源条目，形成可审批的目录模型
- **2. DNS 类比：ARD 作为 Agent 发现的联邦层**——ARD 对注册表的联邦作用类比 DNS 对网络的名称解析；本地注册表通过共享通用协议即可联邦互操作，无需双边协议或专有连接器
- **3. 企业级治理工作流**——创建 registry（IAM/JWT 授权）→ 发布 records → 策展审批/弃用 → 消费者（人或 Agent）搜索发现；混合搜索（语义+关键词）、MCP-native 远程端点访问
- **4. 跨环境挑战**——多云/本地/SaaS 各用自有元数据格式时需 bespoke 连接器；共享规范（ARD）让"发布一次、处处发现"，是第 1 来源"联邦可组合"的具体落地机制
- **5. ARD 开放标准属性**——Apache 2.0 许可、agenticresourcediscovery.org + GitHub ards-project，AWS 贡献反馈；"federate without migrating / discover globally, control locally" 原则

**判据**：同 ARD 规范、知识可迁移（注册表/策展/联邦发现模式不绑定 AWS），非平台教程，与第 1 来源互为补充

## 相关实体

- [Model Context Protocol (MCP)](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-context-protocol-mcp.md)
→ [原文存档](https://www.snowflake.com/en/blog/agentic-resource-discovery-specification/)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构

---

