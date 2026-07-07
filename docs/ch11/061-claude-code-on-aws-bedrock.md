# Claude Code on AWS Bedrock 配置指南

## Ch11.061 Claude Code on AWS Bedrock 配置指南

> 📊 Level ⭐⭐ | 11.4KB | `entities/claude-code-aws-bedrock-guide.md`

# Claude Code on AWS Bedrock 配置指南

## 核心内容

# Claude Code on AWS Bedrock 配置指南

## Claude Code on AWS Bedrock 配置指南

摘要：本文介绍了如何通过 AWS Bedrock 接入 AI 编程智能体 Claude Code。该方式通过 AWS 内部网络调用模型，计费与权限统一集成于 AWS 账号体系，适合企业团队使用。文章提供了一条“从零到跑通”的动手实践路径，涵盖模型开通、受限 IAM 用户创建及 Claude Code 后端配置，并附带可复制的 AWS CLI 命令与脚本

**目录**

01 [一、背景](#section1)

02 [二、系统架构](#section2)

06 [六、最后](#section6)

* * *

## **一、背景**

Claude Code 是一款功能强大的 AI 编程智能体产品，具备代码库理解、多文件修改、长任务自动化等能力，并提供了面向企业级用户的接入方式，其中之一就是通过 [AWS Bedrock](https://aws.amazon.com/cn/bedrock/) 来调用底层模型。采用这种方式时，模型调用走 AWS 内部网络，计费进入 AWS 账单，权限由 IAM 统一接管，非常适合希望把 AI 编程工具并入自有云账号体系的团队。

本文提供一条"从零到跑通"的动手路径：先在 AWS Bedrock 中开通并验证目标模型，再建立一个受限 IAM 用户并附加最小权限 policy，最后把 Claude Code 指向 Bedrock 后端，所有步骤都给出可复制的 AWS CLI 命令与环境变量脚本。读者假定熟悉 AWS 控制台与 bash，但不需要事先用过 Bedrock。

## **二、系统架构**

整体链路很简单：本机终端中的 Claude Code 进程，通过环境变量切到 Bedrock 模式后，直接用 AWS SigV4 签名调用目标 region 的 bedrock-runtime 端点；身份由配置文件里的 IAM 用户凭证或实例角色提供，权限由 IAM Policy 约束；模型 ID 走跨区推理标识（Cross-Region Inference Profile），例如 jp.anthropic.claude-opus-4-7\[1m\]，由 Bedrock 自动路由到合适的底层区域。

[![img](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/28/claude-code-on-aws-bedrock-configuration-guide-1.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/28/claude-code-on-aws-bedrock-configuration-guide-1.png)

\[图1\]

相比直连后端，这套架构有三点优势：（1）网络上收敛到 AWS 内部，适合对外网出口有限制的企业环境；（2）IAM 可按用户 / 团队授予不同模型的调用权限；（3）所有调用都会出现在 CloudTrail / Bedrock 指标里，便于审计与成本分摊。

## **三、第一步：验证 AWS Bedrock 中 Claude 模型是否可用**

在把 Claude Code 接过去之前，必须先确认 AWS 账号中目标 region 的 Bedrock 已经"开通了 Claude 模型"，否则后面所有调用都会返回 AccessDeniedException。本节从开通模型、建用户、配权限、发测试请求四步依次走一遍。

### 1.1 在 Bedrock 控制台测试 Claude 模型

在申请 IAM 权限、拼接环境变量之前，先在 Bedrock 控制台用 Playground 做一次"肉眼可见"的可用性检查：如果模型能正常返回回答，就说明账号、region、模型这条链路是通的，后续的 CLI 与 Claude Code 只是换一种客户端而已。

*   登录 AWS 控制台，切换到目标 region（本文以东京 ap-northeast-1 为例），进入 [Amazon Bedrock](https://aws.amazon.com/cn/bedrock/) 服务页面。
*   在左侧菜单的 Foundation models → Model catalog 中，找到想测试的 Claude 模型卡片（例如 Claude Opus 4.x、Claude Sonnet 4.x，或带 1M 上下文标记的版本），点击进入详情页。
*   在模型详情页点击 "Open in Playground"（或卡片右上角直接进入 Playground），选择 Chat 模式。
*   在对话输入框里发一条简单的测试提示词，例如："用一句话自我介绍"或"1+1 等于几？"。
*   如果模型在几秒内返回一段合理的回答、没有出现红色报错（AccessDenied / ValidationException 等），就证明这个模型在当前账号与 region 下可用，可以继续后面的 IAM 配置。
*   若 Playground 返回报错，多半是账号未获得该模型的使用权、或所在 region 尚未上线该模型。前者按控制台给出的提示申请访问即可，后者换一个已上线的 region（例如 us-east-1、us-west-2）重试。

### 1.2 创建最小权限的 IAM 用户

用一个单独的 IAM 用户来做 Claude Code 的 AK/SK 载体，避免把根账号或管理员身份泄漏到本机 ~/.aws/credentials。下面的命令序列可直接粘贴到已经具备 IAM 管理权限的终端里执行；推荐先放进一个 setup-bedrock-user.sh 里再跑。

*   创建用户并打印 ARN：

```
aws iam create-user --user-name claude-code-bedrock

# 如需方便本地调试也可以给用户建个 console 密码，可按需跳过
aws iam create-login-profile \
    --user-name claude-code-bedrock \
    --password '<Temp-Password>' \
    --password-reset-required
```

*   生成 Access Key，并立刻将输出里的 AccessKeyId / SecretAccessKey 记录到安全位置（Secret 只会出现一次）：

```
aws iam create-access-key --user-name claude-code-bedrock
```

### 1.3 附加最小权限 Policy

下面是一份覆盖 Claude Code 实际调用需求的最小

## 参考来源

## 相关实体
- [From Code To Molecules An Ai Driven Egfr Inhibitor Discovery Journey](../ch04/070-ai.html)
- [Bedrock Agentcore Payment X402 Agent](ch11/048-bedrock-agentcore.html)
- [Ai Network Claude Code Kiro Cli Implement Aws Ipsec Vpn](../ch03/075-claude-code.html)
- [Easy Deployment Of Claude Agent Sdk In Production](../ch01/1036-claude.html)
- [Claude Code Open Source Model Enterprise Practice](../ch03/075-claude-code.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-aws-bedrock-guide.md)

## 深度分析

**1. IAM 最小权限原则在此场景的完美演绎**

文章展示了一个教科书级别的最小权限实践：创建的 IAM Policy 不仅限定了 `bedrock:InvokeModel` 和 `bedrock:InvokeModelWithResponseStream` 两个动作，还将资源严格限制在 `anthropic.*` 前缀和三个跨区推理 profile 范围内 。这意味着即使 AK/SK 泄露，攻击者也无法用它调用非 Anthropic 模型或访问其他 Bedrock 功能。对比许多生产环境直接给 `Resource: *` 的做法，这个 Policy 是值得效仿的模板。

**2. 跨区推理 Profile 作为模型路由中间层的巧妙设计**

文章选择 `jp.anthropic.claude-opus-4-7[1m]` 作为模型 ID，这并非一个具体_endpoint，而是一个跨区推理标识 。AWS 会自动根据负载、可用性将请求路由到合适的底层区域。这种设计对使用者而言是透明的，但实现了三个关键能力：自动重试失败请求、跨区域负载均衡、以及在特定区域配额耗尽时自动切换。这比手动管理多区域 endpoint 要优雅得多。

**3. 验证前置原则的价值：CLI 测试在先，Claude Code 在后**

文章的流程设计强调了一个容易被忽视的好习惯：在配置 Claude Code 之前，先用 AWS CLI 发送真实的 `converse` API 请求验证整条链路 。这个思路将问题排查提前到最小依赖环境，任何模型开通、权限、区域、模型 ID 的问题都会在这一步暴露，而不是等到 Claude Code 运行时再面对模糊的 agent 行为去排查。

**4. 企业场景下 `--dangerously-skip-permissions` 的取舍**

文章给出了启用 `--dangerously-skip-permissions` 的完整脚本，但也明确标注了这是"仅在沙箱机、容器、个人实验环境里开启，生产机慎用" 。这个 flag 跳过了 Claude Code 对 Bash/文件写入等工具调用的人工确认，在自动化场景确实能带来顺滑度，但从安全角度看等于放弃了最后一道防线。企业在采用前应充分评估内部员工恶意 prompt 或误判的风险与收益。

**5. 从单用户扩展到团队的可复制路径**

文章在结尾指出了扩展路径：把 Policy 挂到 IAM Group，同事各自建子用户加入即可 。这个设计体现了云原生 IAM 的核心理念——权限即代码、身份即资源。每个团队的配额、计费、审计都可以在 AWS 层面统一管理，Claude Code 本身不需要任何额外配置。这种架构对 SRE 平台团队尤为有价值。

## 实践启示

**1. 在配置 Claude Code 之前，先用 AWS CLI 完成端到端验证**

不要跳过文章第 1.4 节的 CLI 验证步骤。即使你熟悉 AWS，这套链路涉及的环节较多（账号、region、模型开通、IAM Policy、凭证配置），任何一环出错都会导致 Claude Code 行为异常。先用 `aws bedrock-runtime converse` 确认模型可达，能将排查问题的时间从"在 agent 会话里摸索"压缩到"5 分钟 CLI 输出分析"。

**2. 为 Claude Code 创建独立的 IAM 用户和 Profile，不要共享凭证**

将 Claude Code 的 Access Key 写入独立的 AWS profile（如 `claude-code`），而不是共享的 `default` profile 。这确保了其他工具（如 Terraform、AWS CLI）的凭证不会受到干扰，也便于通过修改 profile 而不影响全局。同时，这个 IAM 用户的权限范围应严格遵循最小权限原则，只允许调用需要的模型和 Action。

**3. 优先使用跨区推理 Profile 作为模型 ID**

在选择模型 ID 时，优先使用 `jp.anthropic.claude-opus-4-7[1m]` 这类跨区推理标识，而不是直连的 foundation model ID 。跨区推理标识会自动处理区域容灾和负载均衡，减少 `ServiceQuotaExceededException` 和手动路由的工作量。只有在需要精确控制底层区域时才考虑直接使用具体 region 的 model ID。

**4. 保留代理配置段以应对企业网络限制**

如果所在网络环境需要出境代理，保留 `HTTPS_PROXY` 和 `HTTP_PROXY` 配置段 。但建议同时在脚本中加入注释说明这段可以删除，避免在不同网络环境迁移时产生困惑。对于直连环境，直接删除这两行即可无感切换。

**5. 团队扩展时通过 IAM Group 而非直接赋权**

当需要将 Claude Code + Bedrock 扩展到团队时，不要直接给每个用户的 IAM 账号附加 Policy，而是先建一个 IAM Group，把 Policy 挂到 Group，再让用户作为成员加入 。这样可以实现权限的统一管理——调整 Policy 内容即可同步影响所有组成员，而不需要逐个修改。同时，结合 AWS SSO 或 Identity Center 还能实现更精细的访问控制。

---

