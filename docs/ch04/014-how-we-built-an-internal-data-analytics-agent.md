# How we built an internal data analytics agent

> 📊 Level ⭐⭐ | 10.8KB

> 原文存档：[原文存档](https://github.blog/ai-and-ml/github-copilot/how-we-built-an-internal-data-analytics-agent/)

## 核心内容

Qubot, our internal Copilot-powered analytics agent, allows any GitHub employee to ask questions about our data in plain language. Here’s what we learned as we built it.

June 19, 2026

|

6 minutes

*    Share: 

Large data and analytics organizations often struggle to make access to data and insights truly self-serve. The industry tried to solve this problem, quite unsuccessfully, for decades, but now AI is giving us a credible way to do just that.

At GitHub scale, providing dedicated analytics support to dozens of product teams is challenging, and therefore many teams are left to solve this problem on their own. Though there is a lot of valuable product telemetry that product and engineering teams can use to make decisions, figuring out which data model, which grain, which filter, and then write the query and validate the result has always been difficult without the support of a data analyst.

Enter Qubot, our internal GitHub Copilot-powered analytics agent. Qubot allows any Hubber (that’s what we call GitHub employees) to ask questions about any data model in GitHub’s data warehouse in plain language and get an answer within seconds.

Qubot is not a reporting tool or a dashboard replacement. Instead, it’s intended for exploratory questions like “Which cohort of users has the highest retention on this feature?” or “What product contributed to move this metric the most last week?” Qubot has zero cost maintenance and helps teams ramp up quickly on datasets they may be unfamiliar with.

In this blog post, we’ll go over how we built Qubot, how it’s changed, and what we learned.

## How Qubot works

The architecture has three main components: user interface, context layer, and query engine.

![Image 1: Diagram showing the architecture of the Qubot analytics agent. Context and users feed into Qubot, which references Trino and Kusto for answers.](https://github.blog/wp-content/uploads/2026/06/architecture.png?resize=1024%2C753)
### User interface

Qubot is accessible through Slack, VS Code, and the Copilot CLI. The Slack interface doesn’t require any configuration, and it is the preferred collaboration tool of Hubbers. When someone posts a question in the Qubot Slack channel, a Qubot instance is spawned as a Copilot Cloud Agent running on github.com. The answer is provided directly in Slack, allowing the user to share the result with others, but also iterate in the thread to evolve or refine the question. All the results are also stored as a markdown report in a pull request that the user can reference to fine tune the query or use it in a dashboard.

Qubot is also available in VS Code and the Copilot CLI, for users that want an experience more integrated with their workflows. Qubot can be installed with one command as a plugin, and it becomes available in any agent session in VS Code or Copilot CLI alongside any other custom agents, skills, and tools configured by the user.

### Context layer

Our data warehouse contains data at different stages of curation: raw events (bronze), conformed facts and dimensions (silver), and curated datasets designed for specific business use cases (gold). The context layer is built in a federated way, with knowledge that is tailored to the type of data.

*   For bronze data, we have telemetry context contributed by product teams, with schema information and metadata.
*   For silver data, we have examples of queries, usage guidance, mandatory filters etc, maintained by the data and analytics team.
*   For gold data, we have business rules and metric definitions, contributed by teams owning those datasets.

We also leverage our ETL pipelines to systematically enrich the context layer with additional signals and derived metadata. The context is loaded at runtime via the GitHub MCP Server, fetching it from the context layer.

### Context agent

The context layer is constantly enriched with new knowledge persisted across multiple repositories. At GitHub, we primarily use markdown for documentation, so we don’t need to interface with multiple different tools.

We’ve streamlined federated context contribution through a context agent. Teams can contribute via a standardized template or by referencing a repository containing relevant context. The agent then ingests, organizes, and normalizes this information into a structured format that has proven effective for Qubot based on our evaluations.

### Evaluation framework

Every change to the context layer or agent configuration gets evaluated before it ships. When someone wants to enrich the context layer with new knowledge, they can open a pull request. The new context goes through an offline eval framework that measures accuracy of the response, latency in finding the right answer, and catches regressions before they reach users.

The benchmarking framework for evaluating Qubot across structured test cases has three components:

*   **Test cases**: A curated dataset of prompts with known correct answers, ground-truth SQL, and metadata (domain, difficulty).
*   **Automated run orchestration**: A script that automates launching each test case as an agent task with the GitHub CLI `gh agent-task create`, runs multiple parallel trials, polls for completion, and saves detailed JSON results.
*   **Stats aggregation**: A reportin

---
## 深度分析

### 为什么内部数据分析 Agent 是高 ROI 的首选落地场景

Qubot 的成功并非偶然：数据分析是大型工程组织里风险结构最友好的 Agent 部署场景之一。首先是权限面窄——它只读数据仓库（Trino/Kusto），不写生产代码、不碰用户数据、不触发外部副作用，blast radius 天然受控。其次是任务"模糊但宽容"：探索性问题（"哪个用户群留存最高"）没有唯一正确答案，答错不会造成损害，只会引导用户继续追问。第三是需求密度高：数十个产品团队各自为战地找数据分析师写 SQL，长尾需求根本排不过队；一个让任何员工用自然语言提问的入口，把分析师从重复劳动中解放出来，同时让从未敢碰数据仓库的人第一次获得了数据决策能力。零边际成本 + 立即可感的效率收益，使它成为向组织证明 Agent 价值的理想楔子。

### Harness 设计取舍：为什么不用语义层，也不做裸 text-to-SQL

Qubot 的架构走了第三条路：不做语义层（semantic layer）的重量级抽象，也不做直接把 schema 塞给模型的裸 text-to-SQL，而是把"领域知识"做成一个联邦化的上下文层（context layer），按数据仓库 bronze/silver/gold 的成熟度分级维护——产品团队贡献 schema 元数据，数据分析团队维护查询示例和强制过滤条件，业务团队贡献指标定义。运行时通过 MCP Server 按需加载。这个设计的深意在于：text-to-SQL 的瓶颈从来不在"生成 SQL"，而在知道该查哪个模型、哪个粒度、哪些过滤器——这些隐性知识被显式化成 markdown 文档并由 context agent 统一归一化。实验证明，结构化且精心策展的上下文不仅提升准确率，还让命中正确答案的速度快了三倍。这正是 [Context Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md) 在数据分析域的实证，也呼应 [Harness Long Running Task](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-long-running-task.md) 中"知识资产沉淀在 harness 而非模型"的立场。

### 数值答案的信任与校准机制

数据分析 Agent 的独特难题是"答案看起来都对，数字可能错了"。Qubot 用三层机制建立信任：其一，评测框架把每一次上下文或配置变更都当作一次发布——PR 触发离线评测，用带 ground-truth SQL 的结构化测试集跑多轮并行试验，聚合完成率、准确率和延迟指标，回归在到达用户之前被拦截。其二，答案透明可追溯：结果以 markdown 报告落进 PR，用户能看到并微调底层查询，把"信任黑盒输出"变成"信任可检验的过程"。其三，双引擎路由（默认 Kusto 处理近期事件的探索性查询，需要复杂 join 和历史深挖时自动切 Trino）让用户无需理解引擎差异，降低了因选错引擎导致的隐性错误。这套"评测即发布门禁"的机制，本质上是 [Verifier Paradox](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/verifier-paradox.md) 所揭示问题的工程化对策。

### 对大型工程组织 Agent 落地的启示

Qubot 的部署路径给组织级 Agent 推广提供了可复制的模板：入口零门槛（Slack 零配置即用，VS Code/CLI 一条命令安装）照顾了不同技术水平的用户；分发即协作（Slack 线程里追问、报告进 PR）让每次提问都成为组织知识的一部分；而最关键的治理设计是把"教 Agent"变成各团队的日常贡献——团队用模板提交上下文知识，就像提交代码一样走 PR + 评测。这打破了"中心化平台团队养 Agent、业务团队观望"的常见困局，把 Agent 迭代变成联邦式活动，也符合 [Agent Engineering Capability Map](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-engineering-capability-map.md) 中能力分层由多角色共同承担的图景。另一个反直觉的经验：上线后专家渠道的提问量骤降但并未消失——Agent 处理长尾，人类专家留给了真正的难题，这是人机分工而非替代。

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

