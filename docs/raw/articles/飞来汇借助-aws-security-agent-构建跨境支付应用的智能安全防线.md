---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/security-agent-build-payment-application-intelligent-security/
ingested: 2026-05-28
feed_name: AWS China Blog
source_published: 2026-05-27T08:26:50Z
sha256: abcec6cdd4d882a60d0b92246779ae94b2d06b5a98c8e944625f668b8d41035d
---

# 飞来汇借助 AWS Security Agent 构建跨境支付应用的智能安全防线

## 飞来汇借助 AWS Security Agent 构建跨境支付应用的智能安全防线

摘要：飞来汇（Flyway）是一家全栈式跨境服务数字科技平台，专注于跨境资金流痛点，为出海企业提供”收、付、融、兑”全链路解决方案。我们将整套支付与清结算服务部署在亚马逊云科技（AWS）全球基础设施之上，依托 AWS 先进的安全服务与合规认证，打造更快、更简单、更安全的跨境支付体验。  
作为 AWS Security Agent 的早期采用者，飞来汇将其无缝集成到 GitHub 代码仓库与 CI/CD 流程中，构建了一套”全量渗透测试 + 增量代码扫描”的双轮驱动应用安全方案，将原本以”周”为单位的渗透测试节奏压缩到”小时”级别，并在每一次代码提交后的几分钟内即可获得安全反馈。本文将分享飞来汇使用 AWS Security Agent 的真实实践与体感数据，希望为同样关注 AppSec 体系建设的金融科技与出海企业客户提供一些有价值的落地经验。

* * *

## **一、引言**

飞来汇（Flyway）是一家全栈式跨境服务数字科技平台，专注于跨境资金流痛点，为出海企业提供”收、付、融、兑”全链路解决方案。通过部署在亚马逊云科技全球基础设施之上，飞来汇确保了跨境支付服务的全球覆盖与低延迟体验；结合 AWS 先进的安全服务与合规认证，我们助力出海企业高效拓展全球市场，让全球贸易”跨无止境”。

支付业务对安全的要求是天然苛刻的——任何一个未被发现的越权漏洞、逻辑漏洞，都可能直接对应资金风险与合规事件。在引入 [AWS Security Agent](https://aws.amazon.com/security-agent/) 之后，我们的应用安全（AppSec）团队第一次拥有了”7×24 持续运行、按需触发”的智能渗透测试能力，并把代码安全审查直接前移到了开发者的 Pull Request 阶段。本文将介绍飞来汇 AWS Security Agent 落地实践，并分享我们在渗透测试与增量代码扫描两大场景下的真实体验。

## **二、跨境支付行业的安全挑战**

跨境支付是金融科技中风险密度最高的细分赛道之一。在飞来汇的”收、付、融、兑”业务体系中，我们直面以下四类典型的安全挑战：

### 2.1 强监管与多地合规要求

跨境支付涉及多国/多地区的金融牌照与合规框架，例如 PCI DSS、SOC 2、ISO 27001，以及不同司法辖区针对反洗钱（AML）、KYC、数据出境的监管要求。这意味着我们的应用安全测试不仅要”发现漏洞”，还需要周期性、可追溯地执行，并能够清晰记录和展现每一次的测试结果历史。

### 2.2 业务逻辑漏洞远比通用漏洞更致命

支付系统中真正”要命”的漏洞，往往不是 SQL 注入或 XSS 这类通用 OWASP 漏洞，而是隐藏在业务流程中的越权访问和业务逻辑漏洞——例如：商户 A 通过篡改请求参数查询到商户 B 的资金流水、退款接口在某种状态机组合下被重复调用、汇兑接口在并发条件下被绕过风控阈值等。这类问题通常需要资深安全工程师结合业务理解，手动构造多步骤攻击链才能复现，传统自动化扫描器很难触达。

### 2.3 渗透测试节奏跟不上发版节奏

传统人工渗透测试通常需要数天到一周才能完成一轮，与飞来汇的发布节奏和安全合规要求不匹配。

### 2.4 应用代码安全左移落地难

我们一直希望把代码安全审查”左移”到 Pull Request 阶段，但传统 SAST 工具普遍存在误报率高、与业务上下文脱节的问题，开发者很快就会对其结果”麻木”，最终导致工具沦为流水线上的一个”绿勾”。如何让安全审查的结果可读、可信、可执行，是我们在工程实践中持续思考的问题。

## **三、AWS Security Agent 简介**

[AWS Security Agent](https://aws.amazon.com/security-agent/) 是亚马逊云科技推出的一款 AI 驱动的 frontier agent，能够在整个软件开发生命周期中主动保护应用安全。它通过部署一组专门化的 AI 子代理，相互协作完成”侦察—漏洞分析—利用验证—修复建议”的完整链路，能力覆盖按需渗透测试、代码安全审查与设计安全审查三大场景。

### 3.1 核心能力一览

能力

说明

按需渗透测试（On-demand Penetration Testing）

针对 Web 应用与 API，按 OWASP Top 10 与业务逻辑漏洞构造多步骤攻击场景，验证可利用性

代码安全审查（Code Security Review）

在 GitHub Pull Request 中对增量代码进行扫描，输出可直接采纳的修复建议

设计安全审查（Design Security Review）

上传架构/设计文档即可完成基于组织安全要求的合规校验，将安全左移到设计阶段

全仓库代码扫描（Full Repository Scanning）

对存量代码做全量扫描，建立漏洞基线

可操作的修复建议（Actionable Fixes）

每一个漏洞均带有可复现的攻击路径、影响分析以及面向开发者语言的修复代码片段

### 3.2 多智能体协作架构

与传统 SAST/DAST 工具不同，AWS Security Agent 内部由多个具备不同专长的 AI 子代理组成，例如包括了负责”绘制攻击面”的子代理，负责”漏洞挖掘与分析”的子代理，负责”漏洞验证”的子代理。这种多智能体协作机制让每一个代理可以专注于特定的工作，从而最大化每一个子代理的工作效果，同时又能够通过相互协作来发现多漏洞利用攻击链这种复杂的漏洞场景，比传统扫描器具备明显优势。

### 3.3 与开发流程的原生集成

AWS Security Agent 提供了完整的 API/SDK，并原生支持 GitHub / GitHub Enterprise 集成。我们可以从 CI/CD 流水线中触发渗透测试，把扫描结果回写到 PR 评论；同时支持 Cross-Account VPC，能够穿透多账号架构对真实环境进行测试，这对于多账号隔离部署的金融科技公司来说至关重要。

## **四、飞来汇的 Security Agent 解决方案**

结合飞来汇自身的技术栈与 AppSec 团队规模，我们围绕 AWS Security Agent 构建了一套以\*\*”双轮驱动 + 自动闭环”\*\*为核心理念的应用安全方案。

### 4.1 整体架构

整套方案由三条主线构成：

*   左侧——开发态：增量代码扫描线。开发者在 GitHub 上提交 Pull Request 后，AWS Security Agent 自动对增量变更代码进行扫描，将带有上下文与修复建议的评论回写到 PR，开发者在合入前完成处置。
*   中间——预发态：全量代码扫描线。每周对核心仓库执行一次全量代码扫描，作为长期基线，识别历史遗留风险。
*   右侧——运行态：按需渗透测试线。每周/每个大版本上线前，基于 Cross-Account VPC 对预发环境的 Web 应用与 API 触发一次按需渗透测试，重点关注 OWASP Top 10 与业务逻辑漏洞。

三条主线共享同一个 AWS Security Agent 项目空间，由 AppSec 工程师做二次复核与流转。

### 4.2 增量代码扫描：让安全反馈与 Code Review 同节拍

我们把 AWS Security Agent 的代码安全审查能力直接接入 GitHub。具体做法是：

1\. 在 AWS Security Agent 控制台中授权 GitHub App，并选择需要受保护的核心仓库。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/security-agent-build-payment-application-intelligent-security-1.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/security-agent-build-payment-application-intelligent-security-1.png)

\[图1\]

2\. 在 AppSec 工作流中默认10条常见安全要求，支持自定义配置组织级安全要求（Organizational Security Requirements），例如”所有涉及资金流水查询的接口必须做商户级越权校验”等业务语义规则。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/security-agent-build-payment-application-intelligent-security-2.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/security-agent-build-payment-application-intelligent-security-2.png)

\[图2\]

3\. 开发者在创建 Pull Request 后，AWS Security Agent 自动对变更代码进行分析，并以评论的形式给出风险点与修复建议，AppSec 工程师可在关键问题上介入。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/security-agent-build-payment-application-intelligent-security-3.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/security-agent-build-payment-application-intelligent-security-3.png)

\[图3\]

真实使用体感：在我们日常的 PR 流程中，开发者推送几个文件之后，通常等待 1~2 分钟（甚至不到）即可看到扫描结果。这个延迟基本对齐了开发者切回 IDE 写下一个改动的时间窗口，几乎不会打断节奏。这也是我们后续判断”增量代码扫描会被高频使用”的最重要依据——因为它真正做到了\*\*”无感入侵开发流程”\*\*。

### 4.3 按需渗透测试：把”周级别”压缩到”小时级别”

按需渗透测试是 AWS Security Agent 给我们带来最显著体感变化的能力。我们的接入方式如下：

1\. 在 AWS Security Agent 控制台中创建一个针对预发环境的渗透测试目标（Target），录入待测的 Web 应用与 API 列表，并通过 Cross-Account VPC 打通账号间网络，让 Agent 能够真实地访问到目标。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/security-agent-build-payment-application-intelligent-security-4.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/security-agent-build-payment-application-intelligent-security-4.png)

\[图4\]

2\. 上传必要的应用上下文（API 文档、典型业务流程说明等），帮助 Agent 更好地理解我们的业务，从而构造贴合业务的攻击场景。

3\. 在渗透测试配置端，可自定义HTTP标头，可用于在WAF侧识别、观察aws security agent渗透测试请求。并支持配置多个账号credential，测试过程中，不同功能多账户进行权限交叉验证。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/security-agent-build-payment-application-intelligent-security-5.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/security-agent-build-payment-application-intelligent-security-5.png)

\[图5\]

4\. 在每一次大版本上线前，由 AppSec 工程师在控制台一键发起渗透测试，或在 CI/CD 流水线中通过 API 自动触发。

5\. 测试结束后，导出 PDF 报告（含执行摘要、CVSS 评分、可复现攻击路径与修复建议），用于内部归档与外部审计提交。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/security-agent-build-payment-application-intelligent-security-6.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/security-agent-build-payment-application-intelligent-security-6.png)

\[图6\]

6\. AWS Security Agent会将渗透过程中各个环节的agent的操作日志保存，便于发现问题后溯源。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/security-agent-build-payment-application-intelligent-security-7.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/security-agent-build-payment-application-intelligent-security-7.png)

\[图7\]

**4.3.1 真实使用体感**

*   效率方面：传统人工渗透测试视系统体量需要几天到一周，而 AWS Security Agent 的一轮按需渗透测试几小时即可完成。这意味着我们可以从”季度级”的渗透节奏切换到”周级别”甚至”按版本”的节奏，这是过去靠堆人力完全做不到的。
*   效果方面：实事求是地说，AWS Security Agent 能发现真实问题——尤其令我们惊喜的是，它不仅能识别常规 OWASP 漏洞，还能发现越权漏洞，甚至部分业务逻辑漏洞，这是传统自动化工具几乎做不到的。当然，与资深人工渗透相比，AWS Security Agent 在某些深度场景上仍有提升空间——这一点我们建议各位客户保持客观预期，并不会”一招吃遍天”。
*   成本方面：AWS Security Agent 同时给到了我们高效率与低成本的组合，这让我们可以把渗透测试的覆盖范围从”少数核心系统”扩大到”几乎所有对外暴露的应用”，这对一家持牌支付机构的整体风险敞口管理意义非常大。

### 4.4 全量代码扫描：建立长期安全基线

在按需渗透测试之外，我们每周还会跑一次全仓库代码扫描，作为”地基”型工作。它的价值不在于发现新的高危漏洞，而在于持续盘点存量代码中的风险，让我们的 AppSec 团队在做季度回顾时有据可依。这条线我们倾向于周期性使用，与渗透测试的节奏保持一致。

### 4.5 多账号统一管理与凭证安全

飞来汇内部按业务/环境进行了严格的 AWS 多账号划分（生产、预发、合规审计等）。我们利用 AWS Security Agent 的 Cross-Account VPC 与 IAM Role 跨账号信任能力，使用一个集中的”安全治理账号”来统一管理所有 Agent 任务，遵循最小权限原则按需授予各业务账号的只读访问权限，相关密钥与令牌则统一托管在 [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) 中，避免任何形式的硬编码。

## **五、飞来汇采用 Security Agent 的收益**

### 5.1 渗透测试效率：从”周级”到”小时级”

维度

传统人工渗透

AWS Security Agent

单轮耗时

几天到一周（视系统体量）

几小时即可完成

触发节奏

季度/年度，资源受限

按需触发，可与每个版本同步

覆盖范围

仅最关键的少数应用

可横向覆盖大部分对外应用

综合成本

较高

显著更低

这一变化的实际意义是：我们终于可以让渗透测试节奏跟上发版节奏——这是过去靠堆人力都做不到的根本性改变。

### 5.2 增量扫描”近乎实时”，安全真正左移

得益于 AWS Security Agent 在 PR 阶段提供的”1~2 分钟反馈”，我们在不增加 AppSec 团队人力的情况下，把代码安全审查的触达面扩大到了每一次代码提交。这意味着大量本应由 AppSec 在上线前才能发现的问题，被前置到了开发者写代码的当下就能修复，整体修复成本大幅下降。

### 5.3 能发现越权与业务逻辑漏洞，弥补传统工具盲区

AWS Security Agent 给我们留下深刻印象的一点，是它能够发现越权漏洞与部分业务逻辑漏洞——这两类问题恰恰是支付行业最关心、传统自动化扫描器最薄弱的环节。我们也客观看待它当前在深度场景上的局限性，会让其与人工红队、内部安全众测形成互补，而不是替代关系。

### 5.4 报告与合规交付能力

AWS Security Agent 自带的 PDF 报告导出能力，包含执行摘要、CVSS 评分、漏洞复现路径、修复指南，可以直接交付给内部合规团队和外部审计师参考，显著降低了我们在内外部审计中的材料准备工作量。

### 5.5 AppSec 团队能力的”人均放大”

支付行业的 AppSec 工程师普遍稀缺。AWS Security Agent 让我们的安全工程师可以从”重复性的扫描和复测”中解放出来，把更多时间投入到威胁建模、红队演练、应急响应这类真正需要人类判断力的工作上。这是我们认为最具长期价值的一类收益。

## **六、落地最佳实践**

### 6.1 三类扫描的使用频率建议

结合飞来汇的实际经验，我们对三类能力的使用频率建议如下：

能力

建议频率

适用场景

增量代码扫描

高频/每次 PR

开发态左移，是日常使用最频繁的能力

全量代码扫描

周期性（如每周一次）

维护长期安全基线，定期巡检存量风险

按需渗透测试

周期性（每个大版本/每周一次）

上线前关卡，输出可审计的渗透报告

简而言之：增量扫描跑在日常，全量扫描和渗透测试跑在节拍上。

### 6.2 把”业务上下文”喂给 Agent，效果会大幅提升

AWS Security Agent 之所以在越权与业务逻辑漏洞场景上表现亮眼，是因为它能够”理解应用上下文”。我们的经验是：上传完整的 API 文档、关键业务流程说明、用户/商户角色矩阵，可以显著提升它构造攻击链的精准度。这一步是性价比最高的优化项。

### 6.3 与人工红队协同，而非替代

我们建议不要把 AWS Security Agent 视为人工渗透的替代品，而应将其视为”7×24 自动化基础层”：常规 OWASP 漏洞、越权漏洞、典型业务逻辑漏洞由 Agent 持续覆盖；更深度的攻击链、链式漏洞、社工类风险则交由人工红队/安全众测处理。两者形成”广覆盖 + 高深度”的互补结构，整体性价比远高于纯人工模式。

### 6.4 凭证与权限治理

*   所有触发 Security Agent 的 API 凭证统一存放在 [AWS Secrets Manager](https://aws.amazon.com/secrets-manager/) 中，应用通过 IAM Role 拉取，杜绝硬编码。
*   跨账号访问遵循最小权限原则，仅授予 Agent 完成扫描所需的只读权限。

## **七、总结与展望**

通过引入 AWS Security Agent，飞来汇成功地把应用安全模式从”周期性、人力密集型的人工渗透”升级为”7×24 自动化 + 关键场景人工补强”的智能 AppSec 体系，在不增加 AppSec 团队规模的前提下，实现了：

*   渗透测试效率从几天/一周缩短到几小时；
*   增量代码扫描在每次 PR 后 1~2 分钟反馈，安全真正左移到开发态；
*   在越权、业务逻辑漏洞等支付行业最关键的盲区上，首次有了可用的自动化能力。

在实践过程中，我们也基于一线使用经验对 AWS Security Agent 未来的能力演进有以下期待：

*   更深的业务逻辑漏洞挖掘：当前 Agent 在常规越权与简单逻辑漏洞场景已有不错表现，期待未来能在多步骤复合业务漏洞、状态机滥用、并发竞态等更深度的场景中继续提升发现能力，进一步缩小与资深人工渗透专家的差距。
*   更强的金融行业上下文理解：期待 Agent 在支付/清结算/风控等典型金融业务模型上有更多的”内置先验知识”，进一步降低我们上下文喂入的成本。
*   与 IDE 的更原生集成：当前增量代码扫描已经在 PR 阶段做到了”近实时”反馈，未来如果能进一步前移到 IDE 阶段，将进一步缩短反馈链路。

我们相信，随着 AI Agent 能力的持续演进，AWS Security Agent 会成为越来越多金融科技与出海企业 AppSec 体系中的”默认配置”。飞来汇也将持续与 AWS 安全产品团队保持密切协作，把这套方案打磨得更加贴合跨境支付场景，让全球贸易跨无止境，也让安全无止境。

**➡️ 下一步行动：**

**相关产品：**

*   [Amazon Secrets Manager](https://aws.amazon.com/cn/secrets-manager/?p=bl_pr_secrets-manager_l=1) — 密钥管理
*   [Amazon VPC](https://aws.amazon.com/cn/vpc/?p=bl_pr_vpc_l=2) — 隔离云网络
*   [Amazon IAM](https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=3) — 身份管理和访问权限
*   [Amazon WAF](https://aws.amazon.com/cn/waf/?p=bl_pr_waf_l=4) — Web 应用程序防火墙

**相关文章：**

*   [Inside AWS Security Agent: A multi-agent architecture for automated penetration testing](https://aws.amazon.com/cn/blogs/security/inside-aws-security-agent-a-multi-agent-architecture-for-automated-penetration-testing/?p=bl_ar_l=1)
*   [AWS Security Agent on-demand penetration testing now generally available](https://aws.amazon.com/cn/blogs/security/aws-security-agent-on-demand-penetration-testing-now-generally-available/?p=bl_ar_l=2)
*   [AWS Security Agent full repository code scanning feature now available in preview](https://aws.amazon.com/cn/blogs/security/aws-security-agent-full-repository-code-scanning-feature-now-available-in-preview/?p=bl_ar_l=3)
*   [航班变更信息智能识别解决方案](https://aws.amazon.com/cn/blogs/china/flight-change-information-intelligent/?p=bl_ar_l=4)
*   [（上篇）基于 AWS Bedrock AgentCore 构建企业级航空客服智能体 —— 基于AIDLC方法从需求分析到生产部署的完整实践](https://aws.amazon.com/cn/blogs/china/based-on-aws-bedrock-agentcore-build-enterprise-intelligent-based-on-aidlc-analytics-deploy-practice/?p=bl_ar_l=5)

\*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

* * *

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/summit-tag3.png)

## 亚马逊云科技中国峰会

开发者挑战赛现场开启，基于真实业务场景亲手构建 Agent。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/25/yuyuecanhui.png)](https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p2&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d)

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/14/2026_Summits_Commercial_Banner_1440x657.png)
