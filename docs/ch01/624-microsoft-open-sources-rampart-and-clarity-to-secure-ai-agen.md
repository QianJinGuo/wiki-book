# Microsoft Open-Sources RAMPART and Clarity to Secure AI Agents During Development

## Ch01.624 Microsoft Open-Sources RAMPART and Clarity to Secure AI Agents During Development

> 📊 Level ⭐⭐ | 5.5KB | `entities/microsoft-open-sources-rampart-clarity.md`

## 核心要点

- RAMPART and Clarity: Microsoft Open-Sources AI Security Tools

## 相关实体
- [How Harnesses And Post Training Close The Open Weight Bug Finding Gap 20260606](/ch01-232-how-harnesses-and-post-training-close-the-open-weight-bug-fi/)
- [Secure Ai Agents Policy Lambda Interceptors Aws](/ch04-026-secure-ai-agents-with-policy-and-lambda-interceptors-in-amaz/)
- [Shub Reaper Macos Stealer Attack Chain](/ch12-014-shub-reaper-macos-stealer-spoofs-apple-google-and-microso/)
- [Schmoozing Is Dead Agents Are Hitting 120 Of Humans And Growth Is The Only Thing](/ch01-125-schmoozing-is-dead-agents-are-hitting-120-of-humans-and-g/)
- [Npm Supply Chain Compromise Postmortem](/ch01-179-postmortem-tanstack-npm-supply-chain-compromise-tanstack/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/microsoft-open-sources-rampart-clarity.md)

## 深度分析

Microsoft 通过 RAMPART 和 Clarity 的发布，将 AI 安全测试工具链延伸到了开发过程的最早阶段。RAMPART（Risk Assessment and Measurement Platform for Agentic Red Teaming）是一个 Pytest-native 的安全和攻击测试框架，用于为 AI agent 编写和运行安全测试，涵盖对抗性和良性场景以及多种危害类别 。这与传统的在系统完成后进行渗透测试的做法形成对比，体现了"shift left"的安全理念。

RAMPART 的核心能力在于它只需要一个连接 agent 到测试套件的适配器，就能对 agent 发起攻击或探测，探索潜在的安全违规行为，例如跨提示注入（cross-prompt injections）——即通过 agent 处理的邮件、文件或网页等数据源间接向 AI 系统注入不可信数据 。测试结果由 RAMPART 自动评估和报告，这意味着安全测试可以从临时性的红队活动转变为自动化的 CI/CD 流程的一部分 。

Clarity 被描述为一个"structured sounding board"——AI 思维伙伴，能在团队写代码之前就帮助他们找到正确的方法 。Clarity 的核心价值在于引导团队进行问题澄清、方案探索、失败分析和决策跟踪 。这填补了安全测试在设计阶段前的空白，在系统尚未构建时就捕捉潜在安全问题。

Microsoft AI Red Team 的负责人 Ram Shankar Siva Kumar 道出了这些工具的核心设计思想："We wanted to give product managers and engineers a way to pressure-test their assumptions at the start of a project, when changing course is cheap and the right conversation can save months of rework" 。这个表述清晰地说明了设计意图：在项目早期，当改变方向的成本很低时，就进行假设的压力测试 。

Microsoft 明确区分了三类工具的定位：PyRIT 优化用于系统构建后安全研究人员的黑盒发现，RAMPART 为正在构建系统的工程师设计，Clarity 帮助团队澄清设计意图并捕获假设 。这三个工具共同构成了覆盖 AI 安全全生命周期的工具链，从设计前阶段到系统构建再到上线后审计 。

这些工具开源的另一个战略价值在于将安全事件变为可复现的、将缓解措施变为可验证的，并通过对红队活动进行工程化来扩展学习 。这意味着 AI 安全将从一次性审查转变为整个生命周期中可使用的活的工件 。

## 实践启示

1. **AI 安全测试需要"左移"到开发过程的最早阶段**：RAMPART 和 Clarity 的设计反映了 Microsoft 对 AI 安全的核心理念——在系统构建之前就开始安全测试。团队在规划 AI agent 项目时，应在 design 阶段就引入安全 review，而非等到系统基本完成后再考虑安全 。

2. **利用 RAMPART 将安全测试自动化到 CI/CD 流程中**：由于 RAMPART 是 Pytest-native 的，团队可以将 AI agent 的安全测试编写为自动化测试用例，在每次代码变更时自动运行，而非依赖手动触发或周期性红队检查 。

3. **Cross-prompt injection 是 AI agent 的关键攻击面**：RAMPART 专门测试通过间接数据源向 AI 系统注入不可信内容的场景 。团队在设计 AI agent 时，应特别关注 agent 可能会处理来自外部来源（邮件、文件、网页）数据的场景，并在这些数据进入系统的入口点实施严格的验证和清理。

4. **Clarity 的价值在于强制结构化思考**：将 Clarity 整合到设计流程中，可以在编写代码前强迫团队对解决方案进行系统性探索和失败分析，这有助于在发现设计层面的根本性安全问题，而非在代码实现完成后才发现 。

5. **AI 安全工具应形成完整覆盖生命周期的工具链**：Microsoft 通过 PyRIT（构建后黑盒发现）+ RAMPART（构建中工程化测试）+ Clarity（构建前设计验证）构建了覆盖 AI 系统全生命周期的安全测试工具链 。组织在建设 AI 安全能力时，也应系统性地考虑这个完整链条，而非只关注某一环节。

---

