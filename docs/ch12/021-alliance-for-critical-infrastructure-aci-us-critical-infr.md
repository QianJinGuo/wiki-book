# Alliance for Critical Infrastructure (ACI): US Critical Infrastructure Cybersecurity Coalition

## Ch12.021 Alliance for Critical Infrastructure (ACI): US Critical Infrastructure Cybersecurity Coalition

> 📊 Level ⭐⭐ | 14.0KB | `entities/818662.md`

# Alliance for Critical Infrastructure (ACI): US Critical Infrastructure Cybersecurity Coalition

> Source: Cybersecurity Dive, Eric Geller, 2026-05-11. URL: https://www.cybersecuritydive.com/news/critical-infrastructure-cybersecurity-coalition-aci-government/818662/

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/818662.md)

## 摘要

2026 年 2 月，JPMorgan Chase、Mastercard、AT&T、Berkshire Hathaway Energy 等公司联合发起 Alliance for Critical Infrastructure（ACI，关键基础设施联盟），把既有的三部门执行工作组（Tri-Sector Executive Working Group：能源、金融、电信）重组为可吸纳更多成员的非营利组织。联盟成立的直接背景是 Trump 政府对 CISA 的大幅裁员、关闭 Critical Infrastructure Partnership Advisory Council（CIPAC），并暗示可能关闭 FEMA——这导致基础设施运营商失去与联邦政府的协调通道。ACI 的核心战略是四支柱：① 跨部门依赖分析；② polycrisis（复合危机）联合响应；③ 私营部门对政府的运营支持（含扩大的信息共享）；④ 政策与监管建议。

## 核心要点

- **联盟由 2025 政府撤退催化**：整个 2025 年 Trump 政府清洗 CISA、取消 CIPAC、考虑关闭 FEMA，私人部门从「支持角色」转为「领导角色」。Tri-Sector 重组为可招募更多会员的非营利 ACI。
- **创始成员结构**：JPMorgan Chase、Mastercard、AT&T、Berkshire Hathaway Energy 四大行业巨头联合发起，执行董事 Michele Guido（来自 Southern Company 战略安全政策总监）、主席 Ben Flatgard（JPMorgan Chase 网络安全政策负责人），Lumen Technologies CSO Natnael Habtesion 等担任顾问。
- **核心痛点：跨部门依赖无人建模**：每个垂直行业都「在自己的筒仓里变得很擅长」，但跨部门的依赖关系（如 GPS 卫星、海底光缆支撑 AI/云计算）没有任何一个行业能完全理解或缓解。Lumen CSO Habtesion 的判断是 ACI 的独特价值在于「认识到对某一部门的威胁很少保持孤立，会产生相邻影响」。
- **四支柱战略**：① 跨部门依赖分析（发白皮书）；② polycrisis 联合响应协议（含与 CISA 合作扩展现有 incident-response playbooks）；③ 对政府的运营支持与扩大的信息共享；④ 政策与监管建议。
- **Polycrisis 定义**：国家级紧急情况同时威胁广泛基础设施（物理+数字后果叠加）。典型场景：自然灾害 + 重大网络攻击同时发生，「我们不是这么规划的」（Guido）。现有策略是为地理有限的 5 级飓风准备的，复合危机下「会显著拉伸我们的能力」。
- **三角制衡（Tri-Sector 的局限）**：原有 Tri-Sector 撮合了能源、金融、电信，影响了国会特许的 Cyberspace Solarium Commission 建议等行政与立法，但始终未能解决跨部门组件问题，ACI 试图补上这一环。
- **与 ISAC/SCC 协作避免重复**：ACI 已开始与 ISAC（信息共享与分析中心）和 SCC（部门协调委员会）对话。Health-ISAC CSO Errol Weiss 的关键建议是 ISAC 已提供运营威胁情报和部门特定上下文，「重复或绕过该生态系统会给运营商带来混乱」。
- **政府关系缺口**：CIPAC 框架（让政府与行业领袖私下会面而没有反垄断担忧）被突然取消，DHS 正在开发替代品但政府不回答运营商的问题。Harrell（前 CISA 基础设施安全助理主任）的提醒是：没有联邦监督，行业联盟「缺乏支撑其运营的主权情报源和反垄断豁免」。
- **CISA 仍在行动但规模有限**：CISA 最近发布危机期间维持服务的指南，计划通过针对性接触评估运营商的弹性，但 CISA 的裁员可能限制该工作规模。ACI 想要 CIPAC 替代品，「但我认为这不能阻止我们继续前进」（Guido）。

## 深度分析

### 1. ACI 出现的政治背景：政府撤退的产业自组织

ACI 不是常规意义上的行业自律组织——它是 2025-2026 年美国联邦政府网络安全协调能力系统性退却的产业对冲。 关键事实链是：① CISA 被大幅裁员（很多部门领导离开或即将离开）；② CIPAC 框架被突然取消（让政府行业私下协调变得有反垄断风险）；③ 联邦应急管理署（FEMA）被考虑关闭；④ 白宫鼓励各州接管历史上属于联邦的关键基础设施保护责任。这四件事叠加后，私人部门从「协调支持角色」转向「承担领导责任」。Ben Flatgard 的总结很到位：「我们不能把这种责任或相关的风险管理实践外包出去，我们必须也自己掌控解决方案。」 这条线给跨国/跨行业 IT 架构师的启示是：当公共部门能力收缩时，私人部门的自组织会成为新的现实，但自组织联盟缺乏主权情报源和反垄断豁免，注定是「带边界的能力补充」而不是「政府的替代品」。

### 2. Polycrisis 是 ACI 唯一真正新的安全概念

四支柱战略里前两项（跨部门依赖分析、polycrisis 联合响应）才是 ACI 区别于既有 ISAC/SCC 的真正价值。 Polycrisis 不是简单的「多事件同时发生」，而是「国家级紧急情况同时威胁广泛基础设施且物理+数字后果叠加」——一个飓风袭击某地区的同时遭遇重大网络攻击。Guido 的原话是「那不是我们规划的方式」。 这种威胁形态打破了传统安全模型的几个前提：① 单部门演练无法应对；② 物理事件与网络事件的因果链难以预先建模；③ 资源在多事件并发下被稀释（Flatgard 原话「会显著拉伸我们的能力」）；④ 决策权在「坏日子那天」由谁承担是制度空白。这给网络安全架构师的具体启示是：传统 SPOF（单点故障）模型不够用，需要的是「级联故障路径」建模——当一个行业被影响时，会触发哪些相邻行业（电信被影响 → 支付被影响 → 金融被影响）的次生故障，这是 ACI 第一个支柱「跨部门依赖分析」要解决的核心问题。

### 3. ISAC/SCC 协作模型是 ACI 成功的关键约束

ACI 的执行路径里最容易被忽视但最关键的一条是：与既有 ISAC（信息共享与分析中心）和 SCC（部门协调委员会）的协作承诺。 ACI 领导层反复强调「我们不想重复 ISAC/SCC 已有的功能」，这是制度设计上的清醒。Health-ISAC CSO Errol Weiss 的判断是 ISAC 已提供运营威胁情报和部门特定上下文，「重复或绕过该生态系统会给运营商带来混乱」。 这种「承认既有组织边界、不试图吞并」的姿态是 ACI 与很多失败的产业联盟（比如互联网早期各种「XX 联盟」）的关键区别。给做跨组织架构设计的启示是：建立新组织时，第一步不是定义自己的功能，而是明确「我不做什么，已有什么组织在做」——否则会陷入与既有组织争夺成员和资源的零和博弈。

### 4. CIPAC 缺位的制度真空是 ACI 的最大风险

Harrell（前 CISA 基础设施安全助理主任）的话很尖锐：「没有联邦监督，这些行业联盟缺乏支撑其运营的主权情报源和反垄断豁免。」 这两件事分开看：① 主权情报源是 CISA/FBI/NSA 等机构通过 CIPAC 等机制与行业共享的高敏感度威胁情报，没有这个渠道 ACI 只能依赖商业威胁情报（覆盖和质量都更弱）；② 反垄断豁免让行业领袖可以公开讨论安全事件、共享指标而不违反反垄断法，没有这个保护，ACI 的工作会受制于「什么能说什么不能说」的法律灰色地带。 这意味着 ACI 注定是「带边界的能力补充」——能协调私人部门，但无法替代政府的核心功能。DHS 正在开发 CIPAC 替代品但「政府没有回答运营商的问题」，ACI 的策略是「我们不能让它阻止我们继续前进」（Guido）。 给跨国 IT 架构师的启示是：当政府能力撤退时，私人部门能补的是协调层和运营层，但**信息源和制度保障必须由公共部门提供**，这两件事不能被自组织联盟替代。

### 5. 创始成员结构反映「关键基础设施」的真正权重

JPMorgan Chase（金融）+ Mastercard（支付）+ AT&T（电信）+ Berkshire Hathaway Energy（能源）—— 这四家不是随机选择，是美国关键基础设施的四个核心节点。 加上 Lumen Technologies（光通信）和 Southern Company（电力）等核心成员，ACI 的覆盖范围实质上是「金融 + 支付 + 电信 + 能源 + 公用事业」的网络物理基础设施。给做行业分析的启示是：ACI 名单本身就是美国关键基础设施的「最小覆盖集」——任何针对美国关键基础设施的网络攻击（无论是勒索软件、APT、还是 polycrisis 场景），都会触发这五到六个行业的级联响应。监控这些公司的联合声明、白皮书、公开测试结果，是预判美国关键基础设施安全态势的高信噪比信号。

### 6. 18 个月路线图是观察联盟成熟度的窗口

ACI 接下来 18 个月的工作包括：建立工作组、定义试点项目、审查会员申请、与政府机构/SCC/ISAC/智库协作。 具体的 polycrisis 响应工作是与 CISA 合作扩展 incident-response playbooks 来反映跨部门协作。 试点项目可能包括区域性试点（事件响应、信息共享、服务恢复）涉及水处理厂、健康诊所、军事基地等。 给行业观察者的具体建议是：盯 18 个月内 ACI 发布的两个东西——① 跨部门依赖白皮书（第一个支柱的产出），能直接反映「跨行业级联故障」的当前建模能力；② polycrisis 联合响应协议（第二个支柱的产出），能反映 ACI 协调能力的实际成熟度。如果 2027 年中前这两个产出都到位，ACI 才算真正建立了可持续的协调能力。

## 实践启示

1. **跨部门依赖建模应纳入企业风险评估**：传统 SPOF 模型不够用，企业架构师要主动建模「行业级联故障路径」——本行业被影响时，会触发哪些相邻行业的次生故障。这正是 ACI 第一个支柱要解决的核心问题。
2. **观察关键基础设施联盟成熟度用两个产出物**：跨部门依赖白皮书 + polycrisis 联合响应协议。这两份文件是判断联盟可持续协调能力的硬指标。18 个月内到位才算真正建立协调能力。
3. **建立新组织时第一步是定义「我不做什么」**：ACI 的关键清醒是「不想重复 ISAC/SCC 已有的功能」。这种制度边界设计是新组织能避免与既有组织零和博弈的关键。
4. **私人部门自组织是带边界的能力补充**：政府撤退时私人部门能补的是协调层和运营层，但信息源（主权情报）和制度保障（反垄断豁免）必须由公共部门提供。这两件事不能被自组织联盟替代。
5. **CIPAC 类框架是产业联盟的隐形基础设施**：能私下协调 + 不违反反垄断法 + 接收主权情报，这三件事是产业联盟的隐形基础设施。给跨国 IT 架构师的启示是评估任何产业联盟可持续性时，先看它是否解决了「情报源 + 法律保护 + 制度对接」这三个底层问题。
6. **监控 ACI 创始成员是预判关键基础设施安全态势的高信噪比信号**：JPMorgan/Mastercard/AT&T/Berkshire Hathaway Energy 覆盖了金融+支付+电信+能源的网络物理节点，其联合声明、白皮书、公开测试结果是观察美国关键基础设施安全态势的最佳窗口。
7. **复合危机演练需要物理+数字叠加场景**：传统单事件演练（飓风 OR 网络攻击）不够，polycrisis 演练必须是物理+数字同时发生的叠加场景，并明确「坏日子那天」决策权的归属。

## 相关实体

- [Ai Agents Security Survey Attack Defense](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-agents-security-survey-attack-defense.md)
- [Anthropic Llm Attck Navigator Cyber Operations](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-llm-attck-navigator-cyber-operations.md)
- [Agent Security Three Step Sequence Harness Governance Identity Crewai](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-security-three-step-sequence-harness-governance-identity-crewai.md)
- [Ai Gateways Vs Mcp Gateways What Security Teams Need To Know](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-gateways-vs-mcp-gateways-what-security-teams-need-to-know.md)
- [Aws Software Supply Chain Security Well Architected Best Practices](https://github.com/QianJinGuo/wiki/blob/main/entities/aws-software-supply-chain-security-well-architected-best-practices.md)
- [Cilium Tetragon Kubernetes Runtime Security Ebpf](https://github.com/QianJinGuo/wiki/blob/main/entities/cilium-tetragon-kubernetes-runtime-security-ebpf.md)
- [Ai Tool Poisoning Exposes A Major Flaw In Enterprise Agent Security](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-tool-poisoning-exposes-a-major-flaw-in-enterprise-agent-security.md)
- [Ai Traffic Cyberthreat Benchmark 2026](https://github.com/QianJinGuo/wiki/blob/main/entities/ai-traffic-cyberthreat-benchmark-2026.md)
- [Cisco Preps For A World Of Ai Agent Coworkers Frontier Model Threats](https://github.com/QianJinGuo/wiki/blob/main/entities/cisco-preps-for-a-world-of-ai-agent-coworkers-frontier-model-threats.md)
- [Securing Ai Agents How Aws And Cisco Ai Defense Scale Mcp And A2A](https://github.com/QianJinGuo/wiki/blob/main/entities/securing-ai-agents-how-aws-and-cisco-ai-defense-scale-mcp-and-a2a.md)
- [Anthropic To Share Mythos Cyber Flaw Findings With Global Finance Watchdog](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-to-share-mythos-cyber-flaw-findings-with-global-finance-watchdog.md)
- [5238213](https://github.com/QianJinGuo/wiki/blob/main/entities/5238213.md)
- [5237875](https://github.com/QianJinGuo/wiki/blob/main/entities/5237875.md)
- [820297](https://github.com/QianJinGuo/wiki/blob/main/entities/820297.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/security-privacy-landscape.md)

---

