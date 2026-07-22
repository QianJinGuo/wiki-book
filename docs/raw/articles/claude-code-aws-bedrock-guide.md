---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/claude-code-aws-bedrock-config/
ingested: 2026-06-01
sha256: 5673b0bf0b944bdb
---

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

本文提供一条”从零到跑通”的动手路径：先在 AWS Bedrock 中开通并验证目标模型，再建立一个受限 IAM 用户并附加最小权限 policy，最后把 Claude Code 指向 Bedrock 后端，所有步骤都给出可复制的 AWS CLI 命令与环境变量脚本。读者假定熟悉 AWS 控制台与 bash，但不需要事先用过 Bedrock。

## **二、系统架构**

整体链路很简单：本机终端中的 Claude Code 进程，通过环境变量切到 Bedrock 模式后，直接用 AWS SigV4 签名调用目标 region 的 bedrock-runtime 端点；身份由配置文件里的 IAM 用户凭证或实例角色提供，权限由 IAM Policy 约束；模型 ID 走跨区推理标识（Cross-Region Inference Profile），例如 jp.anthropic.claude-opus-4-7\[1m\]，由 Bedrock 自动路由到合适的底层区域。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/28/claude-code-on-aws-bedrock-configuration-guide-1.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/28/claude-code-on-aws-bedrock-configuration-guide-1.png)

\[图1\]

相比直连后端，这套架构有三点优势：（1）网络上收敛到 AWS 内部，适合对外网出口有限制的企业环境；（2）IAM 可按用户 / 团队授予不同模型的调用权限；（3）所有调用都会出现在 CloudTrail / Bedrock 指标里，便于审计与成本分摊。

## **三、第一步：验证 AWS Bedrock 中 Claude 模型是否可用**

在把 Claude Code 接过去之前，必须先确认 AWS 账号中目标 region 的 Bedrock 已经”开通了 Claude 模型”，否则后面所有调用都会返回 AccessDeniedException。本节从开通模型、建用户、配权限、发测试请求四步依次走一遍。

### 1.1 在 Bedrock 控制台测试 Claude 模型

在申请 IAM 权限、拼接环境变量之前，先在 Bedrock 控制台用 Playground 做一次”肉眼可见”的可用性检查：如果模型能正常返回回答，就说明账号、region、模型这条链路是通的，后续的 CLI 与 Claude Code 只是换一种客户端而已。

*   登录 AWS 控制台，切换到目标 region（本文以东京 ap-northeast-1 为例），进入 [Amazon Bedrock](https://aws.amazon.com/cn/bedrock/) 服务页面。
*   在左侧菜单的 Foundation models → Model catalog 中，找到想测试的 Claude 模型卡片（例如 Claude Opus 4.x、Claude Sonnet 4.x，或带 1M 上下文标记的版本），点击进入详情页。
*   在模型详情页点击 “Open in Playground”（或卡片右上角直接进入 Playground），选择 Chat 模式。
*   在对话输入框里发一条简单的测试提示词，例如：”用一句话自我介绍”或”1+1 等于几？”。
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

下面是一份覆盖 Claude Code 实际调用需求的最小 Policy。核心是允许调用 Bedrock Runtime 的 InvokeModel / InvokeModelWithResponseStream，并把资源范围限制在 Anthropic 家族与跨区推理 profile 上；另外允许 ListFoundationModels / ListInferenceProfiles 供 Claude Code 启动时做健康检查。

*   把下面的 JSON 保存为 claude-code-bedrock-policy.json：

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "InvokeClaudeModelsOnBedrock",
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/anthropic.*",
        "arn:aws:bedrock:*:*:inference-profile/jp.anthropic.*",
        "arn:aws:bedrock:*:*:inference-profile/us.anthropic.*",
        "arn:aws:bedrock:*:*:inference-profile/eu.anthropic.*"
      ]
    },
    {
      "Sid": "DiscoverAvailableModels",
      "Effect": "Allow",
      "Action": [
        "bedrock:ListFoundationModels",
        "bedrock:GetFoundationModel",
        "bedrock:ListInferenceProfiles",
        "bedrock:GetInferenceProfile"
      ],
      "Resource": "*"
    }
  ]
}
```

*   创建 Policy 并附加到用户上：

```
# 创建 Policy，记住输出里的 Policy Arn
aws iam create-policy \
    --policy-name ClaudeCodeBedrockAccess \
    --policy-document file://claude-code-bedrock-policy.json

# 关联到刚才建的用户（把 <ACCOUNT_ID> 换成你的 12 位 AWS 账号 ID）
aws iam attach-user-policy \
    --user-name claude-code-bedrock \
    --policy-arn arn:aws:iam::<ACCOUNT_ID>:policy/ClaudeCodeBedrockAccess
```

*   把 1.2 拿到的 AK/SK 写入本机 ~/.aws/credentials 的独立 profile，避免污染其它 profile：

```
# ~/.aws/credentials
[claude-code]
aws_access_key_id     = AKIAxxxxxxxxxxxxxxxx
aws_secret_access_key = xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# ~/.aws/config
[profile claude-code]
region = ap-northeast-1
output = json
```

### 1.4 用 AWS CLI 发一次真实调用做验证

在切到 Claude Code 之前，先用 AWS CLI 直接打一发 InvokeModel 到 Bedrock，确认模型开通、权限、区域、模型 ID 都没问题。任一环节出错，都会在这一步暴露，比把问题留到 Claude Code 里排查要省事得多。

*   列一下当前账号可见的 Anthropic 模型，快速确认模型 ID 与”是否开通”：

```
AWS_PROFILE=claude-code aws bedrock list-foundation-models \
    --region ap-northeast-1 \
    --by-provider anthropic \
    --query "modelSummaries[?contains(modelId,\`claude\`)].[modelId,modelLifecycle.status]" \
    --output table
```

*   再列一次跨区推理 profile，确认 jp.anthropic.claude-opus-4-7\[1m\] 在列：

```
AWS_PROFILE=claude-code aws bedrock list-inference-profiles \
    --region ap-northeast-1 \
    --query "inferenceProfileSummaries[?contains(inferenceProfileId,\`anthropic\`)].[inferenceProfileId,status]" \
    --output table
```

*   用 bedrock-runtime 发一发真实对话请求（converse API，最简），能收到 completion 就说明链路通了：

```
AWS_PROFILE=claude-code aws bedrock-runtime converse \
    --region ap-northeast-1 \
    --model-id 'jp.anthropic.claude-sonnet-4-6[1m]' \
    --messages '[{"role":"user","content":[{"text":"用一句话自我介绍"}]}]' \
    --inference-config '{"maxTokens":128}'
```

*   常见错误速查：

错误信息

含义

处理方式

AccessDeniedException: not authorized to perform bedrock:InvokeModel

Policy 没覆盖当前模型 ARN

核对 1.3 里的 Resource 是否包含目标 model / inference-profile 前缀

ValidationException: Invocation of model ID … with on-demand … isn’t supported

该模型在当前 region 不支持 on-demand，只支持 inference profile 调用

把 model-id 换成跨区推理的 jp./us./eu. 前缀版本

ThrottlingException / ServiceQuotaExceededException

账号 TPS / TPM 配额不够

去 Service Quotas 页给目标模型申请提升配额，或切到更空的 region

You don’t have access to the model with the specified model ID

模型还没在 Model access 页批准

回到 1.1 步重新申请并等状态变 granted

## **四、第二步：配置 Claude Code 指向 Bedrock**

Claude Code 通过一组环境变量识别”当前后端是 Bedrock”、”默认走哪个模型”等策略。下面给出一份即用脚本 run-claude-bedrock.sh，把它放到 PATH 里（比如 ~/bin/），每次在新终端里 source 或直接执行即可。脚本以 exec claude 收尾，意味着直接把当前 shell 替换成 Claude Code 进程，不遗留父 shell。

*   创建脚本 ~/bin/run-claude-bedrock.sh，按功能分段来看，关键变量可分为四块：

```
# 1) 告诉 Claude Code 走 Bedrock 后端，并指定 Bedrock 所在 region
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=ap-northeast-1

# 2) 启用实验性的 Agent Teams 功能（多 agent 协作；按需保留或删除）
#    指定要调用的模型 ID，全部走跨区推理 profile
#    [1m] 代表 1M tokens 长上下文版本
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
export ANTHROPIC_MODEL='jp.anthropic.claude-opus-4-7[1m]'

# 3) 如果终端在公司内网 / 需要出境代理，按需设置；否则整段可删除
export HTTPS_PROXY=http://127.0.0.1:10082
export HTTP_PROXY=http://127.0.0.1:10082

# 4) 把当前 shell 替换为 claude 进程，所有命令行参数透传
#    --dangerously-skip-permissions 会跳过工具调用的权限确认，仅在可信环境下使用
exec claude --dangerously-skip-permissions "$@"
```

*   赋予可执行权限，并让它优先使用 1.3 里创建的 AWS profile：

```
chmod +x ~/bin/run-claude-bedrock.sh

# 让脚本显式走 claude-code 这个 profile，避免走默认 profile 导致的权限/区域混乱
# 可以加在脚本开头；或在调用时 AWS_PROFILE=claude-code run-claude-bedrock.sh
export AWS_PROFILE=claude-code
```

*   关键环境变量速查：

变量

含义

建议值

CLAUDE\_CODE\_USE\_BEDROCK

启用 Bedrock 后端

1

AWS\_REGION

Bedrock 调用的 region

ap-northeast-1（或 us-east-1 / eu-central-1 等）

AWS\_PROFILE

取哪个 profile 的凭证

claude-code（1.3 创建的用户）

ANTHROPIC\_MODEL

要调用的模型 ID

jp.anthropic.claude-opus-4-7\[1m\]

CLAUDE\_CODE\_EXPERIMENTAL\_AGENT\_TEAMS

启用 Agent Teams 实验特性

1（不需要可省）

HTTPS\_PROXY / HTTP\_PROXY

出网代理

按企业网络填写；直连环境留空

*   关于 –dangerously-skip-permissions：它跳过了 Claude Code 在执行 Bash / 写文件等工具调用前的人工确认，能大幅提升”自动化跑完整个任务”的顺滑度；但也意味着恶意 prompt / 误判会直接作用于本机。建议只在沙箱机、容器、个人实验环境里开启，生产机慎用。

### 4.1 完整脚本清单：run-claude-bedrock.sh

下面给出上述所有环境变量与启动语句拼接在一起的完整脚本，可直接整段拷贝保存为 ~/bin/run-claude-bedrock.sh。按需删除代理段、或把 AWS\_REGION / AWS\_PROFILE 改为你自己的值。

```
#!/bin/bash
export CLAUDE_CODE_USE_BEDROCK=1
export AWS_REGION=ap-northeast-1
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1
export ANTHROPIC_MODEL='jp.anthropic.claude-opus-4-7[1m]'
export HTTPS_PROXY=http://127.0.0.1:10082
export HTTP_PROXY=http://127.0.0.1:10082
exec claude --dangerously-skip-permissions "$@"
```

## **五、第三步：启动 Claude Code 并验证**

*   启动：

```
~/bin/run-claude-bedrock.sh
```

*   脚本执行后即可进入 Claude Code 的交互界面，如下图所示。此时可以简单做个测试，例如输入 hi，看到 Claude 正常回复（”Hi! What would you like to work on?”）就说明工作正常，可以继续做后端自检。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/28/claude-code-on-aws-bedrock-configuration-guide-2.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/28/claude-code-on-aws-bedrock-configuration-guide-2.png)

\[图2\]

*   接下来输入一句用来确认后端的 prompt，例如：

`你现在走的是哪个后端？请用 /status 自检一下，并把当前使用的模型 ID 告诉我。`

*   期望看到的关键信息：

检查项

期望值

Provider / Backend

AWS Bedrock

Region

ap-northeast-1

当前模型

jp.anthropic.claude-opus-4-7\[1m\]

凭证来源

AWS\_PROFILE=claude-code（~/.aws/credentials）

### /status 自检的界面截图

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/28/claude-code-on-aws-bedrock-configuration-guide-3.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/28/claude-code-on-aws-bedrock-configuration-guide-3.png)

\[图3\]

## **六、最后**

到这里，Claude Code 已经跑在企业 AWS Bedrock 之上：模型开通、IAM 用户、最小 Policy、跨区推理 profile 全部到位，AWS CLI 级别的验证也通过了。以后再扩展到整个团队时，可以把 ClaudeCodeBedrockAccess policy 挂到一个 IAM Group，每位同事建自己的子用户加入即可——权限、计费、审计一次到位。

**➡️ 下一步行动：**

**相关产品：**

*   [Amazon Bedrock](https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=1) — 用于构建生成式人工智能应用程序和代理的端到端平台
*   [Amazon IAM](https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=2) — 身份管理和访问权限
*   [Amazon CloudTrail](https://aws.amazon.com/cn/cloudtrail/?p=bl_pr_cloudtrail_l=3) — 审计跟踪

**相关文章：**

*   [基于 AWS DevOps Agent 构建 AI 驱动的运维分析系统](https://aws.amazon.com/cn/blogs/china/based-on-aws-devops-agent-build-ai-operations-analytics-system/?p=bl_ar_l=1)
*   [（上篇）基于 AWS Bedrock AgentCore 构建企业级航空客服智能体 —— 基于AIDLC方法从需求分析到生产部署的完整实践](https://aws.amazon.com/cn/blogs/china/based-on-aws-bedrock-agentcore-build-enterprise-intelligent-based-on-aidlc-analytics-deploy-practice/?p=bl_ar_l=2)
*   [Amazon Bedrock模型推理的Serverless 异步架构 – 处理在线多模态高负载案例](https://aws.amazon.com/cn/blogs/china/amazon-bedrock-model-inference-serverless-architecture-case-study/?p=bl_ar_l=3)
*   [AWS IAM Identity Center 现在支持适用于 AWS 账户访问和应用程序使用的多区域复制功能](https://aws.amazon.com/cn/blogs/china/aws-iam-identity-center-now-supports-multi-region-replication-for-aws-account-access-and-application-use/?p=bl_ar_l=4)
*   [AWS Security Agent 渗透测试实操](https://aws.amazon.com/cn/blogs/china/aws-security-agent-testing/?p=bl_ar_l=5)

\*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

* * *

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/summit-tag3.png)

## 亚马逊云科技中国峰会

开发者挑战赛现场开启，基于真实业务场景亲手构建 Agent。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/25/yuyuecanhui.png)](https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p2&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d)

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/14/2026_Summits_Commercial_Banner_1440x657.png)