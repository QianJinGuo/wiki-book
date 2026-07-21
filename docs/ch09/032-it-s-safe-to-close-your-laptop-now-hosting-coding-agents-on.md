# It’s safe to close your laptop now: Hosting coding agents on Amazon Bedrock AgentCore

## Ch09.032 It’s safe to close your laptop now: Hosting coding agents on Amazon Bedrock AgentCore

> 📊 Level ⭐⭐ | 15.0KB | `entities/bedrock-agentcore-coding-agent-hosting.md`

# It’s safe to close your laptop now: Hosting coding agents on Amazon Bedrock AgentCore

> **Source archive**: [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/its-safe-to-close-your-laptop-now-hosting-coding-agents-on-a.md)

## 深度分析

### 1. 笔记本作为 Coding Agent 宿主的结构性缺陷

文章指出笔记本并非 Coding Agent 的天然适配器，而是「最方便的机器」而非「正确的机器」——这一判断揭示了分布式 AI Agent 部署的结构性问题。 四个具体缺陷（受影响域重叠、密钥与代码同域、worktree 半隔离、笔记本合盖即 kill switch）指向同一个根本矛盾：在开发者本地环境运行 LLM 控制的生产级工具，存在信任边界的根本错位。企业安全策略通常不允许在开发者工作站上运行第三方 Agent，但笔记本合盖的物理约束反而迫使 Agent 必须「现场运行」，这是一个被长期忽视的系统性矛盾。

### 2. AgentCore 的核心价值定位：不是容器，而是「远端工作站即服务」

AgentCore Runtime 的关键创新不在于提供 isolated Linux microVM（这是 Firecracker 已有能力），而在于将 Identity、Gateway、Observability 三个基础设施层与 microVM 绑定，形成一个开箱即用的远端工作站系统。 开发者不需要在每台 Agent 实例上手动配置 GitHub credentials、VPC 路由或 CloudWatch traces——这些在传统自托管方案中需要重复构建的基础设施，在 AgentCore 中由平台团队一次性配置，Agent 实例按需获取。这是一种平台工程（Platform Engineering）思维的落地：平台团队定义安全边界和使用条款，开发者只携带 Agent harness 接入。

### 3. 三种 Credential 模式（Bot / On-behalf-of / Broker）解决了企业级 Agent 身份映射的核心挑战

企业环境中，Agent 以谁的身份行动是一个复杂的合规问题。文章揭示的三种认证模式覆盖了主要场景：Bot 模式适合自动化流程（以 service account 身份行动），On-behalf-of 模式支持需要人类归属感的场景（PR 以真实开发者身份提交），Broker 模式则为不支持标准 OAuth 的 legacy 系统保留了集成路径。 这种分层设计说明 AgentCore 的身份层不是简单地将 credentials 注入 microVM，而是构建了一套与企业文化 IdP 对齐的权限映射体系。

### 4. 持久化 `/mnt/workspace` 设计重新定义了「Session」的语义

传统 Serverless 函数的「无状态」与 Agent Session 需要的「现场恢复」存在根本冲突。文章展示的 `/mnt/workspace` 持久化设计（14 天不活跃保活）实际上定义了一种新的计算语义：Session 不是进程，而是带有文件系统的计算上下文。 这与 Git worktree 的逻辑隔离不同——microVM 的物理隔离意味着每个 Session 有独立的 `node_modules`、build cache 和文件系统状态，消除了跨 Session 状态污染的可能性。这是比 `git worktree` 更诚实的并行化方案。

### 5. 「Bring any agent」策略与 Model-agnostic Runtime 的战略含义

AgentCore 支持 Claude Code、Codex、Kiro、Cursor CLI、OpenCode、Gemini CLI 同时运行在相同基础设施上，并通过 MCP（Model Context Protocol）统一工具接口。 这意味着企业不需要在 Claude Code 专用平台和 Codex 专用平台之间做二选一，而是可以用同一套安全边界、同一套身份层和同一套 observability 基础设施来评估和运行多种 Agent harness。这一策略的深层含义是：AgentCore 把自己定位为 Agent harness 的运行环境，而不是某个特定 Agent 的托管平台——这是一个以「harness portability」为核心竞争差异的战略选择。

## 实践启示

### 1. 将「Agent 必须在笔记本上运行」视为技术债，而不是物理约束

如果你的团队正在通过保持笔记本开盖来维持 Agent 运行，这说明你的平台基础设施还没有为 AI-native 开发流程做好准备。第一步行动是识别 Agent 运行时依赖的五个要素（shell、文件系统、代码库、依赖、凭证），然后评估哪些可以在云端实现物理隔离。 任何在本地运行 Agent 的团队都应该问自己：我们的安全边界是否真的允许 Agent 访问 GitHub credentials？答案如果是「勉强允许」或「不知道」，那么 AgentCore 或类似平台就是优先的迁移目标。

### 2. 平台团队应将 AgentCore Identity + Gateway 配置视为一等公民的基础设施

文章强调 Gateway 只需要配置一次，之后所有 Agent 通过一个 MCP endpoint 接入工具链。 对于平台团队而言，正确的实施顺序是：先完成 Identity + Gateway 的企业 IdP 集成（On-behalf-of 模式），再注册团队共享的 MCP 工具（GitHub、Jira、Slack），最后才让开发者接入 Agent harness。这个顺序确保了凭证从不落入 Agent 运行的 microVM 内部——这是安全架构的基本原则。

### 3. 利用并行 Agent 对比实验建立团队内部的模型选择基准

文章提供的「Race」和「Bench」实验模式（四个 Agent 同时处理同一 GitHub issue）是一个可操作的评估框架。 团队应该用 AgentCore 的并行 microVM 能力建立持续的模型 × harness 基准测试，把「哪个模型最适合我们的代码库」这个问题从主观判断变成可重复的实验数据。这是打破团队内部关于 AI 模型选择争议的有效方式。

### 4. 优先使用 On-behalf-of 认证模式而非 Bot 模式，以保持审计链的完整性

从企业安全和合规角度，On-behalf-of 模式（Agent 以真实开发者身份行动，PR 归属到个人）比 Bot 模式（统一 bot 账号）更符合审计要求。 如果你的工作流中 Agent 的代码提交需要通过代码审查（Code Review），On-behalf-of 模式确保 Reviewer 看到的是真实开发者的 PR，而不是难以追责的 bot。这在高度监管的行业（金融、医疗、法律）中尤为重要。

### 5. 在评估 AgentCore 时，关注「Session 恢复」和「VPC 网络」两个长期成本因素

文章提到 `/mnt/workspace` 持久化 14 天、VPC 网络模式下的私有 DNS 解析和网络安全组控制。 在实际评估中，需要特别关注：长时间运行任务（90 分钟以上的 refactor 或 overnight migration）的 Session 管理策略，以及 Agent 对私有 registries（PyPI mirror、npm private registry）的依赖是否已经可以通过 VPC 路由透明解决。这两个因素直接影响 AgentCore 是否能真正替代笔记本成为开发者首选的 Agent 运行载体。

# It’s safe to close your laptop now: Hosting coding agents on Amazon Bedrock AgentCore

There’s a habit going around. Walking from one meeting to the next with the laptop cradled half-open. Sitting through a 1:1 with the lid propped just enough to keep the screen alive. Riding home while holding your laptop because it must stay running. Anywhere except closed on a desk, because closed on a desk is what kills the coding agent running inside (Claude Code, Codex, Kiro, OpenCode, Gemini CLI, Cursor CLI, or whatever harness the developer pulled together). [Business Insider has a piece on it](<https://www.businessinsider.com/coders-keep-laptops-open-in-public-ai-agent-2026-5>).

Strip any of these agents down and they all need the same five things: a shell, a filesystem, the project checked out, its dependencies installed, and the right permissions (to act on the filesystem, plus credentials for the network and the outside world). Your laptop has all five. Nothing about the list says laptop, though. The laptop won the job by being the nearest machine, not the right one.

The rest of this post is about reaching for a different one. [Amazon Bedrock AgentCore Runtime](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/agents-tools-runtime.html>) gives every session a dedicated environment: an isolated Linux microVM with a persistent workspace, a real shell, and deterministic command execution. Most sandbox products do something similar. What’s harder to assemble, and what [AgentCore](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html>) ships out of the box, is the surrounding system: an [Identity](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/identity.html>) layer so the agent acts as the user who triggered it, a [Gateway](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/gateway.html>) that gives Claude Code, Codex, Kiro, and the rest the same set of tools (GitHub, Jira, Slack, your own services) through one Model Context Protocol (MCP) endpoint with the real tokens held outside the agent, and [Observability](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/observability.html>) so every step the agent takes lands in the Amazon CloudWatch your team already uses. And then the lid can close.

By the end of this post, we’ll hand the same GitHub issue to Claude Code, Codex, Kiro, and Cursor at the same time, each in its own environment, and grade them on the things that actually matter: latency, dollar cost, and whether the tests pass on the first try.

## Why a laptop is the wrong host

Before we get there, it’s worth saying out loud why the laptop was never the right host for this. Four reasons stand out.

  1. **Your laptop is your affected zone.** The agent shares your shell, your filesystem, your tokens, your VPN, your loaded SSH keys. One prompt-injected README is one prompt-injected README too many.
  2. **Secrets sit next to the code the agent edits.** `.env` files, `~/.aws/credentials`, `~/.ssh/id_ed25519`, that one `~/.npmrc` with the private registry token: all reachable from the same shell the agent runs in. The principle of least privilege has not been observed.
  3. **`git worktree` is a half-fix for parallelism.** The standard play for running two agents at once is to spin up worktrees for two branches and point one agent at each. The agents themselves do part of the job. Codex sandboxes to the working directory by default. Claude Code is read-only until you say otherwise. But they all share one machine, and the machine is what they collide on: the same Postgres on `localhost:5432`, the same `:3000` your dev server wants, the same SSH keyring, the same outbound IP, the same `~/.aws/credentials`. Three agents on three branches are three processes fighting over one host. The honest answer to parallelism isn’t another worktree. It’s a dedicated machine per agent.
  4. **The laptop lid is the kill switch.** Suspend the laptop and the agent suspends on it. Close it for a meeting, lose the session. Close it for a flight, lose the workspace. Half-installed dependencies, a partially applied refactor, a still-running test suite, all gone with the lid. The longer the job, the worse the math: a 90-minute refactor or an overnight migration means the lid must stay open for 90 minutes, or all night. Shipping a feature should not depend on the angle of a laptop hinge.

## What developers and platform teams want

If you’re a developer, you want a laptop experience, without the laptop limitations. Same agent, same shell, same filesystem, same instant feedback, but the lid can close, multiple agents can run side by side, and the work survives a reboot, a flight, or a long lunch.

If you’re on a platform team, you want what you always want. Each agent with its own scope. Traffic flowing through your virtual private cloud (VPC), not the public internet. Identity tied to the company identity provider (IdP), not a `.env` file. AWS CloudTrail records of every invocation. CloudWatch traces of every step. Tool access mediated by a policy layer instead of `~/.netrc`. Credentials that are not on disk inside a large language model (LLM)-controlled environment. None of that should be optional, and none of it should require building.

Let’s see how AgentCore gets you both.

## Bring any agent. Pick any model. Run them in parallel.

**Any agent.** You can host Claude Code, Codex, Kiro, OpenCode, Cursor CLI, Gemini CLI, your own harness, and you can package anything into a container or a .zip. Push the container to Amazon Elastic Container Registry (Amazon ECR) or zip-deploy a [Python](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-get-started-toolkit.html>) or [Node.js](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/runtime-get-started-code-deploy-node.html>) project directly. You can bring your own dependencies in the image: language runtimes, build tools, git, system package

## 相关实体
- [Control Where Your Ai Agents Can Browse With Chrome Enterprise Policies On Amazo](../ch11/132-control-where-your-ai-agents-can-browse-with-chrome-enterpri.html)
- [Building Multi Tenant Agents With Amazon Bedrock Agentcore](../ch04/534-amazon-bedrock-agentcore.html)
- [Using Amazon Bedrock Agentcore Openclaw Multi 2](../ch04/534-amazon-bedrock-agentcore.html)
- [Aws 一周综述Amazon Bedrock Agentcore 付款适用于 Aws 的 Agent 工具套件等2026 年 5 月 11 日](../ch04/534-amazon-bedrock-agentcore.html)
- [Amazon Quick Bedrock Agentcore Finops Chat](../ch11/127-amazon-quick-bedrock-agentcore-finops.html)
- [deep agents + bedrock agentcore：多 agent 编排 + 隔离基础设施的端到端研究 ag](../ch04/494-agent-orchestration.html)
- [development environments for your cloud agents](ch09/122-development-environments-for-your-cloud-agents.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/coding-agent-practice.md)

---

