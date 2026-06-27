# alibabacloud-cms-manage Skill：阿里云 CMS 2.0 可观测接入的 AI Agent Skill 化（CLI 6 步 + K8s ack-onepilot 自动注入 + 两阶段确认 + 5 大实战场景）

## Ch11.016 alibabacloud-cms-manage Skill：阿里云 CMS 2.0 可观测接入的 AI Agent Skill 化（CLI 6 步 + K8s ack-onepilot 自动注入 + 两阶段确认 + 5 大实战场景）

> 📊 Level ⭐⭐ | 23.6KB | `entities/alibabacloud-cms-manage-skill-natural-language-observability.md`

# alibabacloud-cms-manage Skill：阿里云 CMS 2.0 可观测接入的 AI Agent Skill 化

> 原文存档：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/aliyun-cms2-cli-skill-natural-language-observability.md)

阿里云云原生团队 2026-06-07 发布 **`alibabacloud-cms-manage` Skill**——基于 Claude Code 的 AI Agent Skill 化方案，**将 6 步 CLI 接入流程封装为开箱即用的 Skill**，让用户用**一句自然语言**即可让 AI Agent 自动编排 CLI 命令完成可观测接入。

## 核心定位

**问题**：CMS 2.0 接入配置涉及一系列参数和步骤（账号 ID、workspace、region、LicenseKey、Endpoint、serviceName、serviceType、attributes 等），6 步操作多个参数传递，对**非高频使用 CLI 的运维人员门槛较高**。

**解法**：将完整 CLI 操作知识封装为 Skill，**核心思路 = 将 CLI 操作流程转化为 AI Agent 可执行的结构化工作流**。用户无需记忆命令和参数，只需用自然语言描述需求。

## CMS 2.0 + aliyun cms2 CLI 概览

**CMS（CloudMonitor Service）2.0** 是阿里云统一的可观测管理平台，整合：
- **APM**（应用监控）
- **RUM**（前端监控）
- **Prometheus 服务**
- **告警管理**

`aliyun cms2` 是**阿里云 CLI** 的子命令插件，覆盖 CMS 2.0 各模块。**前置要求**：
- CLI 版本 >= 3.3.15
- `aliyun configure` 配置凭证

## 6 步 CLI 接入流程

| Step | 命令 | 目的 |
|------|------|------|
| 1 | `aliyun sts get-caller-identity` | 获取账号 ID |
| 2 | `aliyun cms2 apm configuration create` | 初始化 APM 基础设施（幂等） |
| 3 | `aliyun cms2 apm configuration get` | 获取接入凭证（LicenseKey、Endpoint 等） |
| 4 | `aliyun cms2 apm service create` | 注册应用服务 |
| 5 | `aliyun cms2 integration addon get` | 获取接入配置模板（以 Java OTel 为例） |
| 6 | `aliyun cms2 apm service list` | 验证接入 |

**APM 模块支持**：
- **多种语言应用接入**
- **ack-onepilot**（K8s 容器）
- **手动自研探针**
- **原生 OpenTelemetry**

**AI 可观测**：CMS 2.0 为主流 AI 框架（LangChain 等）提供**开箱即用**接入体验。

## alibabacloud-cms-manage Skill 工作机制

### Skill 链接

https://skills.aliyun.com/skills/alibabacloud-cms-manage

### 工作机制

当用户描述需求时，AI Agent 按以下流程工作：

- **解析用户自然语言意图**（如"把 LangChain 应用接入 CMS 监控"）
- **派生所需参数**（账号 ID、regionId、集群信息等）
- **自动编排 CLI 命令序列**
- **执行并验证**

### 安全机制：两阶段确认协议

| 命令类型 | 是否需要确认 |
|---------|-------------|
| 只读命令（`get` / `list`） | ❌ 直接执行 |
| CMS 后端资源创建（`apm configuration create`） | ❌ 直接执行 |
| **集群资源变更**（如 `kubectl patch deployment`） | ✅ **必须用户明确 yes/no 确认** |

**安全设计哲学**：只读操作和**用户已经在 CMS 控制台授权过的**后端资源创建走自动执行路径；**影响生产集群的操作**走两阶段确认。

## K8s 自动接入演示：LangChain 应用的 ack-onepilot 探针注入

### 场景设定

- 已有 ACK 集群
- 已有 LangChain 应用 `customer-support-agent`（Deployment）
- 目标：接入 CMS 监控

### ack-onepilot 机制

`ack-onepilot` 通过 **DaemonSet** 在集群节点运行 Agent Pod：
- **当 Deployment 标注指定 Label 后自动注入探针**
- **无需修改应用代码或 Dockerfile**

### 完整交互过程

**用户**：`帮我把 ACK 集群里的 LangChain 应用 customer-support-agent 接入 CMS 监控`

**AI Agent 自动执行**：

- **检测容器接入场景，获取集群信息**
   ```bash
   $ aliyun sts get-caller-identity --force -o json
   # → AccountId: 1108xxxxxxxxxxxx
   $ aliyun cs describe-clusters
   # → clusterId: c8d3f***********, region_id: cn-hangzhou
   ```

- **初始化 APM 基础设施并获取凭证**
   ```bash
   $ aliyun cms2 apm configuration create \
       --workspace default-cms-1108xxxxxxxxxxxx-cn-hangzhou --region cn-hangzhou
   # → 成功
   $ aliyun cms2 apm configuration get \
       --workspace default-cms-1108xxxxxxxxxxxx-cn-hangzhou --region cn-hangzhou -o json
   # → LicenseKey: a]***@***************4b70
   $ aliyun cms2 apm service create \
       --workspace default-cms-1108xxxxxxxxxxxx-cn-hangzhou --region cn-hangzhou \
       --body '{"serviceName":"customer-support-agent","serviceType":"TRACE","attributes":"{\"language\":\"python\"}"}' \
       < /dev/null
   # → serviceId: a]***@*********************7f1
   ```

- **检查 ack-onepilot 组件状态**
   ```bash
   $ kubectl get pods -n ack-onepilot
   # ack-onepilot-7d8f9   1/1   Running   0   5d
   ```

- **查找目标 Deployment**
   ```bash
   $ kubectl get deployment --all-namespaces | grep customer-support
   # default   customer-support-agent   3/3   3   3   12d
   ```

- **执行计划汇报 + 两阶段确认**
   ```
   找到目标 Deployment default/customer-support-agent（3 副本）。
   执行计划 — Patch K8s Deployment
   请确认执行（yes / no）。
   ```

**用户**：`yes`

- **执行 Patch + 验证滚动更新**
   ```bash
   $ kubectl patch deployment customer-support-agent -n default \
       --type=strategic -p '{
         "spec":{"template":{"metadata":{"labels":{
           "aliyun.com/app-language":"python",
           "armsPilotAutoEnable":"on",
           "armsPilotCreateAppName":"customer-support-agent",
           "armsPilotAppWorkspace":"default-cms-1108xxxxxxxxxxxx-cn-hangzhou"
         }}}}}'
   # deployment.apps/customer-support-agent patched

   $ kubectl rollout status deployment/customer-support-agent -n default --timeout=120s
   # deployment "customer-support-agent" successfully rolled out
   ```

**接入完成**：2-3 分钟后即可在 CMS 控制台看到 **LLM 调用耗时、Token 使用量、Agent 链路**等监控数据。

### 自动化覆盖的 8 个步骤

| 步骤 | 手动 CLI | Skill 自动化 |
|------|---------|-------------|
| 1 | 查账号 ID | ✅ AI 派生 |
| 2 | 查集群信息 | ✅ AI 派生（无需手动提供 regionId） |
| 3 | 初始化基础设施 | ✅ AI 自动 |
| 4 | 获取凭证 | ✅ AI 自动 |
| 5 | 注册服务 | ✅ AI 自动 |
| 6 | 检查组件状态 | ✅ AI 自动 |
| 7 | 查找目标 Deployment | ✅ AI 自动 |
| 8 | Patch + 验证 | ⚠️ AI 执行 + **用户两阶段确认** |

**对比**：手动操作需要执行 **8+ 条命令**，Skill 将接入体验从"**记命令、查参数、拼 JSON**"简化为**一句话**。

## 与现有实体差异化

- [Alibaba Agent Observability Audit Loongsuite Pilot Coding Agent Blackbox To Transparent](https://github.com/QianJinGuo/wiki/blob/main/entities/alibaba-agent-observability-audit-loongsuite-pilot-coding-agent-blackbox-to-transparent.md) — **LoongSuite Pilot** 是 Agent 观测的**数据采集应用层**（OTel SemConv + 三类 Agent 形态 + 四大观测能力）。**alibabacloud-cms-manage Skill 是 Agent 接入层**（如何让 AI Agent 自己完成可观测接入）。**LoongSuite = 数据从 Agent 流出的标准化**；**alibabacloud-cms-manage = AI Agent 自动化完成接入编排**。两者**互补**：LoongSuite 让你能看到 Agent 行为，cms-manage Skill 让 Agent 自己接入观测。
- [Hermes Observability Aliyun](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-observability-aliyun.md) — Hermes 装上显微镜的 ARMS 观测实践（**Hermes-specific**）。本实体是**通用 CMS 2.0 接入**（不绑定具体 Agent 框架），适用更广。
- [Aliyun Agentrun](https://github.com/QianJinGuo/wiki/blob/main/entities/aliyun-agentrun.md) / [Aliyun Agentrun 5Min Quickstart](https://github.com/QianJinGuo/wiki/blob/main/entities/aliyun-agentrun-5min-quickstart.md) / [Aliyun Agentrun 2Line Integration](https://github.com/QianJinGuo/wiki/blob/main/entities/aliyun-agentrun-2line-integration.md) — **AgentRun** 是阿里云 AI Agent 运行时（运行 Agent 的平台）。**alibabacloud-cms-manage Skill 是观测接入工具**（为已部署的 AI Agent 接入 CMS 监控）。两者**关系**：Agent 跑在 AgentRun 上 → 通过 cms-manage Skill 接入 CMS 监控 → 通过 LoongSuite 上报 Agent 行为数据。
- [Skill Development Guide Aliyun 2026](https://github.com/QianJinGuo/wiki/blob/main/entities/skill-development-guide-aliyun-2026.md) — Aliyun 团队发布的 **Skill 开发保姆级教程**（教你如何写 Skill）。**alibabacloud-cms-manage Skill 是 Skill 教程落地的一个具体生产 Skill 案例**——是 Skill 教程的"现身说法"。
- [Skills Registry 公测开启为企业打造私有的 Skill 管理中心](https://github.com/QianJinGuo/wiki/blob/main/entities/skills-registry-公测开启为企业打造私有的-skill-管理中心.md) — 阿里云 **Skills Registry 公测**（企业私有 Skill 管理中心）。**alibabacloud-cms-manage** 是部署在 Skills Registry（`skills.aliyun.com`）上的官方 Skill，是 Registry 生态的具体产品实例。
阿里云 AI 工具链定位对照：本实体（CMS 观测接入）与阿里云 **MSE AI 网关** 90% 成本节约（任务调度 + Sandbox）属于阿里云 AI 工具链不同环节。
- [Alibaba Eventhouse Enterprise Agent Context](https://github.com/QianJinGuo/wiki/blob/main/entities/alibaba-eventhouse-enterprise-agent-context.md) — 阿里 EventHouse 企业 Agent 上下文。本实体是 CMS 接入（**事件**层）—— EventHouse 处理**状态上下文**，CMS 处理**可观测性**。
阿里云 **API 网关（Gateway API 标准）** 是**网络层**接入；本实体是**观测层**接入，定位不同。
- [Aliyun Cio Ai Rd Efficiency](https://github.com/QianJinGuo/wiki/blob/main/entities/aliyun-cio-ai-rd-efficiency.md) — 阿里 CIO 视角的 AI 研发效率。本实体是具体工具（**Skill 化观测接入**），是该战略的工具落地。
- [Agent Evolution Four Stages Six Dimensions Aliyun](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-evolution-four-stages-six-dimensions-aliyun.md) — Agent 演化的四个阶段六维度（阿里云视角）。本实体的 Skill + 自然语言接入模式属于该框架中"**降低接入门槛**"维度的具体实现。
- [Cli Mcp Skill Architecture Decision Vibecoder](https://github.com/QianJinGuo/wiki/blob/main/entities/cli-mcp-skill-architecture-decision-vibecoder.md) — VibeCoder 的 **CLI vs MCP vs CLI+Skill** 架构决策指南。本实体是**CLI+Skill 模式**的具体生产案例（CMS CLI 6 步流程 → Skill 化），是该架构决策的真实落地示例。
- [Deeppotential Alibabacloud Agentrun Scientific Ai](https://github.com/QianJinGuo/wiki/blob/main/entities/deeppotential-alibabacloud-agentrun-scientific-ai.md) / [Agent Evolution Four Stages Six Dimensions Aliyun](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-evolution-four-stages-six-dimensions-aliyun.md) — 阿里云 AgentRun 生态。本实体与之是**同一厂商不同产品线**（AgentRun vs CMS Skill）—— 都是阿里云 AI 工具链。

## 相关主题

—
- Agent Skill 生态 — [Agent Skills Comprehensive Survey](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-skills-comprehensive-survey.md)
- 可观测性 — [Hermes Observability Aliyun](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-observability-aliyun.md)
- OTel / APM 接入 — [Alibaba Agent Observability Audit Loongsuite Pilot Coding Agent Blackbox To Transparent](https://github.com/QianJinGuo/wiki/blob/main/entities/alibaba-agent-observability-audit-loongsuite-pilot-coding-agent-blackbox-to-transparent.md)
- K8s 自动注入 — [Higress Cncf Sandbox Ingress Nginx Replacement](https://github.com/QianJinGuo/wiki/blob/main/entities/higress-cncf-sandbox-ingress-nginx-replacement.md)

## 深度分析

- **"AI Agent 自动化运维"的产品化范式**：传统云产品的接入流程是**面向运维人员**设计——多步 CLI + 多个参数 + JSON 拼装。**alibabacloud-cms-manage Skill 是**面向 AI Agent 重新设计接入流程**——把"该传什么参数、该走什么步骤"作为**结构化知识**封装进 Skill，让 AI Agent 替运维人员完成繁琐工作。这是**云计算产品 AI Agent 化的标志性产品**——从"教人用工具"到"让 Agent 替人用工具"。这种范式可能扩散到所有云产品接入（数据库、网络、存储、函数计算等），**未来云产品的接入层可能默认带 Skill 化入口**。

- **两阶段确认协议是 Skill 化运维的关键安全设计**：当 AI Agent 直接操作云资源，**安全性比能力更重要**。**alibabacloud-cms-manage 的两阶段协议**通过**操作类型分类**实现精细化授权：只读操作零摩擦（提升效率），**生产集群变更必须用户明确确认**（守住安全边界）。这是 Skill 化运维的**可信赖模式**——可以推广到所有"AI Agent 触达基础设施"的场景。**关键洞察**：不要"一刀切"全部要求确认（破坏体验），也不要"全自动"（破坏安全）——**按操作风险分级确认**是正确解法。

- **ack-onepilot 的 DaemonSet + Label 注入模式可推广**：ack-onepilot 通过 DaemonSet 在每个节点跑 Agent Pod，**通过 Deployment Label 触发自动注入探针**——**无需修改应用代码或 Dockerfile**。这是**K8s 原生可观测性接入**的优雅范式：把"侵入式 SDK 集成"变成"声明式 Label 触发"。**对比传统 OTel SDK 接入**：需要修改应用代码、添加 SDK 依赖、配置 OTLP endpoint，**ack-onepilot 把这些都下移到了 K8s 调度层**。这种范式可推广到所有 K8s 上的可观测组件（log、metrics、trace、profiling）。

- **"6 步 CLI → 一句话"是 Agent Skill 价值的最直观演示**：本文的 K8s 演示从用户角度只输入**一句自然语言**（"帮我把 ACK 集群里的 LangChain 应用 customer-support-agent 接入 CMS 监控"），AI Agent 自动完成**8 个步骤**（含 8+ 条 CLI 命令 + 两阶段确认）。**这种 Before/After 对比是 Skill 价值的最佳呈现方式**——所有要做"Skill 化包装"的产品都可以用同样的演示模式：原流程 N 步 → Skill 化后 1 句自然语言。**这是 Skill 产品化推广的标准模板**。

- **CMS 2.0 对 AI 框架的"开箱即用"支持揭示 AI 可观测的差异化需求**：CMS 2.0 对主流 AI 框架（LangChain 等）提供开箱即用接入，**支持 LLM 调用耗时、Token 使用量、Agent 链路**等 AI 特有监控维度。**这是传统 APM（只关注请求延迟、错误率、吞吐量）的扩展**——AI 应用的监控需要 **Token 经济性 + 推理链路 + 多步工具调用**的专门维度。**这种"AI-aware 可观测"是云厂商的差异化竞争点**——比通用 APM（Datadog / New Relic 等）多一层 AI 语义。

## 实践启示

- **AI Agent 化云产品接入的标准路径**：如果你的云产品有"多步 CLI + 多参数"接入流程，**优先做 Skill 化**——把"操作流程 + 参数知识 + 安全分级"封装进 Skill，让 AI Agent 替用户完成。这是**云产品 AI 时代的最自然入口**。**三步走**：(1) 把 CLI 操作流程化、参数知识文档化；(2) 设计两阶段确认协议分级授权；(3) 把 Skill 部署到 Skills Registry（公共或私有）供 Agent 调用。

- **Skill 化运维必须设计操作风险分级授权**：当 AI Agent 直接操作云资源，**不要"一刀切"全确认（破坏体验）或"全自动"（破坏安全）**。**按操作风险分级确认**——只读操作零摩擦；后端资源创建（已通过控制台授权）零摩擦；**生产集群变更 / 数据删除 / 计费变更**必须明确确认。这种分级是 Skill 化运维的**可信赖基础**。

- **K8s 探针注入优先选 DaemonSet + Label 模式**：ack-onepilot 的范式（**DaemonSet + Label 触发自动注入**）是 K8s 可观测性接入的最佳实践。**对比 SDK 嵌入**：不需要修改应用代码、不需要重新构建镜像、**探针版本与业务代码解耦**。如果你的 K8s 集群需要可观测接入，**优先看是否有 DaemonSet 探针方案**而非 SDK 嵌入方案。

- **AI 应用的可观测需求不止传统 APM 三件套**：除请求延迟、错误率、吞吐量外，**AI 应用还需要 Token 经济性（prompt/completion token 数 + 成本）、推理链路（多步 tool call 追踪）、模型版本对比、prompt 漂移检测**。**选择 APM 时优先看是否原生支持 AI 语义**（如阿里云 CMS 2.0、Datadog LLM Observability、Helicone 等），不要直接套用传统 APM。

## 第 2 来源 — 陈廷彬颍川 2026-06-14 续篇: 5 大实战场景 + 完整 CLI 命令树 + "可控自动化" 设计原则

**作者**: 陈廷彬(颍川) | **发布**: 2026-06-14 | **v×c=49** | **类型**: 同源不同作者续篇
**原文**: [mp.weixin.qq.com/s/57VtC2cq2sTEWHGRPEqDGA](https://mp.weixin.qq.com/s/57VtC2cq2sTEWHGRPEqDGA)
**与第 1 来源关系**: 同一公众号「阿里云云原生」+ 同一产品 (`aliyun cms2` + `alibabacloud-cms-manage Skill`) + 不同作者(铖朴/珂帆 vs 陈廷彬) + 7 天后续篇
**互补角度 6 条**(第 1 来源 APM 接入 vs 第 2 来源场景全景):

- **场景驱动视角** — 第 1 来源聚焦"APM 接入 6 步"单场景,第 2 来源把 Skill 应用扩展到 **5 大场景** (接入中心 ACK 集群 / 告警中心 / Prometheus 服务 / APM / 数据查询),覆盖云监控**完整生命周期**
- **接入中心 7 步流程** — 第 1 来源只讲 APM 接入 6 步;第 2 来源给出 **ACK 集群接入 7 步流程** (查询容器集群 → 已接入实例判断 → 资源验证 → 组件选择 → 策略创建 → 组件部署 → 结果验证),适合 SRE 团队批量接入
- **告警中心智能管理** — 第 1 来源无;第 2 来源新增**告警规则查询/生成/Dry Run/创建/修改/噪声分析** 全流程,含 prompt 示例 6 条 (智能分析告警规则 / 修改联系人 / 查询告警历史等)
- **完整 CLI 命令树** — 第 1 来源只演示 6 条命令;第 2 来源给出 **`aliyun cms2` 完整命令树** (integrate/workspace/prometheus/apm/rum/alert/notification-channel/event-hub/metric/trace/entity/meta 共 12 大域)
- **"可控自动化"设计原则** — 第 1 来源侧重"两阶段确认"安全机制;第 2 来源升级为 **"可控自动化"** (Agent 不绕过运维体系 + 统一 CLI 入口 + Skill 业务规则 + 权限/确认/审计边界三件套)
- **AI Agent 原生 CLI 设计** — 第 1 来源只讲 Skill;第 2 来源新增 CLI 层"为 AI 设计"原则 (`--show-schema`/`--show-example-body` 辅助 / 默认 `-o text` 降低 Token / 结构化 JSON 错误码支持自动修复)

### 第 2 来源独有命令树全景

| 域 | 子命令 | 第 1 来源覆盖 | 第 2 来源覆盖 |
|----|--------|:----------:|:----------:|
| **integrate (接入中心)** | policy/service-monitor/pod-monitor/custom-job/addon-release/addon | ❌ | ✅ |
| **workspace** | create/get/list/update/delete | ❌ | ✅ |
| **prometheus** | instance/view/recording-rule | ❌ | ✅ |
| **apm** | service/configuration | ✅ 6 步 | ✅ 简述 |
| **rum** | service/configuration | ❌ | ✅ |
| **alert** | rule/template/history | ❌ | ✅ 6 步 |
| **notification-channel** | contact/robot/webhook | ❌ | ✅ |
| **event-hub** | list/get | ❌ | ✅ |
| **metric** | promql/basic | ❌ | ✅ |
| **trace** | search/tree | ❌ | ✅ |
| **entity** | query | ❌ | ✅ |
| **meta** | metrics/namespaces/events | ❌ | ✅ |

**结论**: 第 1 来源是"深度 1 场景",第 2 来源是"广度 12 域" — **互补不重叠**,合并后形成 Skill 完整使用手册。

### 第 2 来源 prompt 工程价值

第 2 来源 6 类实战场景给出**完整 prompt 模板**,这是第 1 来源缺失的关键工程资产:

- **接入中心 prompt 模板** (按资源组/标签/跨账号/组件部署/target检查/自定义采集规则)
- **告警中心 prompt 模板** (智能分析/查询/修改联系人/删除/查询历史)
- **Prometheus 服务 prompt 模板** (存储时长/RecordingRule 创建/停止/聚合视图)
- **数据查询 prompt 模板** (CPU使用率最高ECS/top N 排查模板)

### 与第 1 来源的呼应

- **设计原则一致**: 第 1 来源的两阶段确认 → 第 2 来源的"可控自动化",**哲学延续**(第 1 讲"何时确认",第 2 讲"为何可控")
- **CLI 命令延续**: 第 1 来源 `aliyun cms2 apm` 6 步 → 第 2 来源 `aliyun cms2` 全 12 域,**第 1 是第 2 的子集**
- **APM 场景互补**: 第 1 来源详写 APM 6 步 CLI;第 2 来源简述 APM + 完整命令树,**避免重复并补全全景**

## 参考资料

- **Skill 链接**

https://skills.aliyun.com/skills/alibabacloud-cms-manage
- **阿里云 CLI**：https://github.com/aliyun/aliyun-cli
- **CMS 控制台**：https://cmsnext.console.aliyun.com/
- **APM 应用监控文档**：https://help.aliyun.com/zh/cms/cloudmonitor-2-0/
- **阿里云 CLI 安装指南**：https://help.aliyun.com/zh/cli/install-update-alibaba-cloud-cli
## 相关实体

- [opentelemetry ebpf instrumentation (obi) — 零代码全栈可观测性的内核级实现](https://github.com/QianJinGuo/wiki/blob/main/entities/open-telemetry-ebpf-instrumentation-obi-zero-code-observability-aliyun-2026.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/observability-monitoring.md)

---

