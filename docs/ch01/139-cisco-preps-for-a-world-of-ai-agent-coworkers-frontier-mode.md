# Cisco Preps For A World Of AI Agent Coworkers, Frontier Model Threats

> 📊 Level ⭐⭐⭐ | 11.9KB

URL: https://www.nextplatform.com/ai/2026/06/03/cisco-preps-for-a-world-of-ai-agent-coworkers-frontier-model-threats/5250406

## 深度分析

### 1. AI Agent 作为同事：企业基础设施的准备
Cisco 将 AI agent 看作从 chatbot 演化而来的"数字同事"：AI Software and Platform Group 高级副总裁 DJ Sampath 描述的协作模型是——像新员工一样 onboarding agent，agent 承担繁重工作、人类持续掌控关键事务，取代"人类点遍一堆 dashboard 盯着 agent"的旧模式。 企业需要为 agent 准备身份管理、权限控制、审计日志等基础设施，就像为新员工准备工位一样。

### 2. Frontier model 的安全威胁
前沿模型的能力提升带来新的安全威胁。Infrastructure and Security Group 高级副总裁 Tom Gillis 指出：agent 自主运行任务、深入企业数据与基础设施，而 frontier 模型不仅能快速检测软件漏洞，还能迅速生成 exploit。 传统"加固后一至两年不动"的补丁节奏，在 Mythos 类模型面前形成了从漏洞被发现并利用到补丁部署之间的巨大时间差。 Anthropic 的 Project Glasswing（限制 Mythos 供给以防止攻击者滥用）在一个月内发现了超过 1 万个漏洞，印证了威胁规模。

### 3. 企业网络的 agent 准备度
企业网络当前设计假设所有流量来自人类用户，而 agent 流量呈现高频、自动化、批量的不同模式。Cisco《AI Impact on Wide Area Networks》报告量化了差异：agent 每个任务产生的流量比传统工具高 450%；同时 AI 与自动化把平均 breakout time（从初始入侵到攻击者开始横向移动）压到 29 分钟，Claude Mythos Preview 等 frontier 模型可能把它压得更低。

### 4. Cloud Control 与 AgenticOps：人与 agent 的共同工作台
Cloud Control 是 AgenticOps 的落地平台：AI Assistant 以自然语言横跨 Meraki、Webex、Security Cloud Control 等产品，简化 IT 运维与安全操作；AI Canvas 则是人类与 agent 实时协作调查并解决问题的共同工作区。 Studio 提供环境定制工具：Agent Builder 可创建贴合自身工作流的 agent，经 connector 或 MCP 连接 30 多个第三方平台；App Builder 通过自然语言提示构建并发布应用，内置 OpenAI Codex 编码平台。 Cloud Control Marketplace 则承放第三方与用户自建的 app、集成与 agent。

### 5. Live Protect："数字免疫系统"填补补丁真空
Live Protect 首发于 N9000 系列交换机并将扩展到更多 Cisco 系统，定位不是虚拟补丁：Gillis 将其称为"数字免疫系统"——在维护窗口与补丁周期之间"堵漏的手指"。 今年夏天内还将进入 smart switches、路由器上的 Cisco 防火墙，并为 SD-WAN 设备加入后量子密码。

### 6. 硅-网-安全协同设计的全栈优势
Sampath 强调 Cisco 自研 silicon 带来独有的协同设计能力：从 silicon 到网络、把安全直接融合进网络，再以数据平台汇聚全部 telemetry，最后用 AgenticOps 让跨域运维变得简单——竞争对手难以复制的"very unique advantage"。

## 实践启示

### 1. 为 agent 准备"数字工位"
身份、权限、审计、网络——为 agent 准备与人类员工同等的基础设施。

### 2. Agent 流量需要独立的监控策略
Agent 流量的模式不同于人类——需要独立的异常检测和安全策略。

### 3. Frontier model 的安全评估
追踪前沿模型的能力评估和安全测试——了解最新威胁模型以更新防护策略。

## 相关实体
- Running An Ai Native Engineering Org
- [World Knowledge Agent Self Evolution Tencent Hkustgz](https://github.com/QianJinGuo/wiki-public/blob/main/entities/world-knowledge-agent-self-evolution-tencent-hkustgz.md)
- [Introducing Aimap Security Testing For Ai Agent Bishop Fox](https://github.com/QianJinGuo/wiki-public/blob/main/entities/introducing-aimap-security-testing-for-ai-agent-bishop-fox.md)
- [Alphaevolve Deepmind Discovery Agent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/alphaevolve-deepmind-discovery-agent.md)
- [Huggingface Ai Agent Glossary Model Scaffolding Harness Tool Skill Subagent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/huggingface-ai-agent-glossary-model-scaffolding-harness-tool-skill-subagent.md)

→ [原文存档](https://www.nextplatform.com/ai/2026/06/03/cisco-preps-for-a-world-of-ai-agent-coworkers-frontier-model-threats/5250406)
- [olmo-eval: an evaluation workbench for the model development](https://github.com/QianJinGuo/wiki-public/blob/main/entities/olmo-eval.md)

## 摘要

Last month, we did a deep dive into [Cisco Systems’ third quarter fiscal 2026 numbers](https://www.nextplatform.com/connect/2026/05/18/cisco-wins-over-ai-customers-with-merchant-silicon-and-optics/5242200) to get a gauge on what the AI market looks like when you strip away what the hyperscalers, cloud builders, and AI model makers are spending for their AI datacenter buildouts and instead focus on the up-and-coming AI users – think enterprises, neoclouds, and sovereigns – and the traditional hardware vendors that will supply them.

Those include system builders like Dell – and we heard a lot about [what the company is doing with AI](https://www.nextplatform.com/compute/2026/05/19/dell-bulks-up-hardware-as-ai-infrastructure-shifts-to-on-premises/5242811) last month during the Dell Technologies World 2026 show – and later this month, HPE will weigh in at HPE Discover 2026 in Las Vegas. This week it’s Cisco at [Cisco Live 2026](https://www.ciscolive.com/), also in Vegas. Cisco made a [strong push into the AI field](https://www.nextplatform.com/compute/2025/06/12/ciscos-hyperscale-and-cloud-ai-push-will-give-it-enterprise-clout/100798) at last year’s event, and this year they further outlined the latest efforts to build out its AI infrastructure stack for enterprises, particularly in this still emerging world of agentic AI – and now frontier AI models – and the challenges they present.

NEXTPLATFORM AD

Those challenges touch on all aspects of IT, from computing and networking to security and data. For example, AI agents create a tremendous amount of traffic. In its recent report, _AI Impact on Wide Area Networks_, Cisco found that agents generated [450 percent more traffic per task](https://www.cisco.com/c/dam/en/us/solutions/collateral/artificial-intelligence/mass-scale-infrastructure/ai-network-traffic-report.pdf) than with traditional tools. In the realm of data security, AI and automation drastically reduced the average breakout time – the amount of time between an initial network compromise and the moment attackers begin moving laterally through the network [– to 29 minutes](https://www.crowdstrike.com/en-us/global-threat-report/). And the introduction of [frontier AI models](https://www.nextplatform.com/ai/2026/04/27/the-genai-battle-shifts-from-frontier-models-to-agentic-platforms/5218897) like Anthropic’s much-talked-about Claude Mythos Preview could drive that down even more.

The broad reach AI has throughout an enterprise has Cisco, like its competitors, putting pieces in place to ensure its technologies reach every area, and that was on display during the first day of Cisco Live. With each announcement, executives wanted to show a fully integrated stack of Cisco networking, networking, and security for datacenters and cloud environments that can draw in tools from tech partners, drive faster deployment and implementation through validated designs and pre-configured designs, and include security capabilities that are increasingly important as AI becomes embedded in infrastructure and agents take on business operations.

### A ‘Very Unique Advantage’

The vendor has been building out its infrastructure, software, services, and AI capabilities for several years, which DJ Sampath, senior vice president and general manager of Cisco’s AI Software and Platform Group, said gives the company a “very unique advantage” over competitors.

NEXTPLATFORM AD

“We [manufacture our own silicon](https://www.nextplatform.com/connect/2025/07/07/silicon-one-many-cisco-chips-with-one-architecture-chasing-many-ai-workloads/1661717) and that gives us the ability to start to reimagine a co-designed full stack that goes all the way from silicon to the network to the security being fused into that network in a way that nobody else can then combining that with the ability to leverage our data platform that brings all of these telemetry together and finally making it incredibly simple to operate and effective across these different domains using what we call AgenticOps,” Sampath told journalists and analysts.

A key to what Cisco wants to do lies in the understanding that as AI agents become more integrated into business operations, the operating model has to change and be simplified to create the conditions in which humans and agents can work together.

“One of the big transformations that's happening is we're starting to see this evolution happen from chatbots to agents, and when we talk about agents, what we're starting to see is agents are sort of manifesting themselves as additional coworkers,” he said. “You're onboarding them, you're working with these agents and these agents are starting to become very intrinsically woven into how you're starting to think about your day-to-day work. It's no longer about humans clicking through dashboards, a multitude of dashboards, and trying to keep up with what the agents are doing. A true collaborative operating model starts when agents are doing the heavy lifting and humans are constantly staying in control of what matters.

---

