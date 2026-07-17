# Introducing Claude Platform on AWS: Anthropic's native platform, through your AWS account

## Ch01.495 Introducing Claude Platform on AWS: Anthropic's native platform, through your AWS account

> 📊 Level ⭐⭐ | 9.0KB | `entities/introducing-claude-platform-on-aws-anthropics-native-platfor.md`

## Claude Platform experience through AWS
With Claude Platform on AWS, you work with the same APIs, features, and console experience available through Anthropic directly. This includes the [Messages API](https://platform.claude.com/docs/en/build-with-claude/working-with-messages), [Claude Managed Agents](https://platform.claude.com/docs/en/managed-agents/overview) (beta), [advisor tool](https://platform.claude.com/docs/en/agents-and-tools/tool-use/advisor-tool) (beta), [web search](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-search-tool) and [web fetch](https://platform.claude.com/docs/en/agents-and-tools/tool-use/web-fetch-tool), [MCP connector](https://platform.claude.com/docs/en/agents-and-tools/mcp-connector) (beta), [Agent Skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) (beta), [code execution](https://platform.claude.com/docs/en/agents-and-tools/tool-use/code-execution-tool), [files API](https://platform.claude.com/docs/en/build-with-claude/files) (beta). For the full list of capabilities, see the [Claude Platform documentation](https://platform.claude.com/docs/en/home).
You access Claude Platform on AWS through familiar AWS features:

- **Authentication:** You use existing [AWS IAM credentials](https://docs.aws.amazon.com/claude-platform/latest/userguide/authentication.html) to access Claude Platform. No separate accounts or API keys to manage.
- **Billing** : Usage is billed through AWS Marketplace on a [consumption basis](https://platform.claude.com/docs/en/about-claude/pricing), so you can track and manage AI spending alongside your other AWS services.
- **Audit** : Activity is captured [in AWS CloudTrail](https://docs.aws.amazon.com/claude-platform/latest/userguide/monitoring.html), so you can monitor, audit, and investigate AI usage the same way you do for any other AWS services.
Claude Platform on AWS is operated by Anthropic, and the underlying requests and data are processed outside the AWS security boundary. This makes it well suited for teams without specific Regional data residency requirements, and complements Claude models on Amazon Bedrock, so you can access Claude through the approach that fits your needs.

## Getting started with Claude Platform on AWS
You can activate Claude Platform on AWS through the AWS Marketplace. For step-by-step instructions, see [Set up your account](https://docs.aws.amazon.com/claude-platform/latest/userguide/setup.html). After your account is activated, getting to your first API call takes three steps: create a workspace, authenticate, and call the API.

### Step 1: Create a workspace
With a [workspace](https://platform.claude.com/docs/en/manage-claude/workspaces), you can separate projects, environments, or teams while maintaining centralized billing and administration. It also serves as the primary AWS Identity and Access Management (IAM) resource for Claude Platform on AWS. You grant or deny access to specific workspaces through IAM policies using the workspace ARN.

### Step 2: Authenticate
Claude Platform on AWS supports two authentication methods: IAM with AWS Signature Version 4, and API keys. We recommend using temporary IAM credentials for setups that require a higher level of security, and API keys for exploring Claude Platform on AWS.

### Step 3: Make your first API call
You can now install the [Anthropic Client SDKs](https://platform.claude.com/docs/en/api/client-sdks#quick-installation) and make API calls:
```python
from anthropic import Anthropic
import os
client = Anthropic(
    default_headers={"anthropic-workspace-id": os.environ["ANTHROPIC_WORKSPACE_ID"]},
)
message = client.messages.create(
    model="claude-sonnet-4-6",
    max_tokens=1024,
    messages=[{"role": "user", "content": "Hello!"}],
)
print(message)
```

## Claude Platform on AWS in practice
With your setup complete, you can point Claude Code, Claude Cowork, or any other API client at your workspace. After you're connected, your clients can use capabilities like web search, MCP connectors, agent skills, code execution, and file uploads through Claude Platform on AWS.
You can monitor usage in the Claude Console, including breakdowns by workspace, AWS IAM principal, and time period. AWS CloudTrail captures requests to Claude Platform on AWS, and usage is billed through AWS Marketplace.

## Conclusion
Claude Platform on AWS is available in US East (N. Virginia), US East (Ohio), US West (Oregon), Canada (Central), South America (São Paulo), Europe (Dublin), Europe (London), Europe (Frankfurt), Europe (Milan), Europe (Zurich), Europe (Paris), Europe (Stockholm), Asia Pacific (Tokyo), Asia Pacific (Seoul), Asia Pacific (Melbourne), Asia Pacific (Jakarta), Asia Pacific (Sydney).
## 相关实体
- [Introducing Claude Platform On Aws](ch01/495-introducing-claude-platform-on-aws-anthropic-s-native-platf.html)
- [Anthropic Claude Managed Agents Platform Launch](ch01/259-anthropic-claude-managed-agents.html)
- [Anthropic Nla Natural Language Autoencoders Interpretability](ch01/1291-anthropic.html)
- [Anthropic Prompt Caching Claude Code Agihunt](ch01/264-anthropic-prompt-caching-claude-code.html)
- [Aws 一周综述Aws Transform 上线一周年Aws 云端 Claude Platformec2 M3 Ultr](ch01/1149-claude.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/introducing-claude-platform-on-aws-anthropics-native-platfor.md)

## 深度分析
Claude Platform on AWS的发布代表了AI平台服务模式的一次重要演进：
**1. 平台与云厂商的合纵连横**：Anthropic选择AWS作为首个原生平台合作伙伴，而非独立发展或选择其他云厂商，反映了AI公司在商业化阶段对成熟分发渠道的依赖。AWS的 Marketplace机制、IAM体系、CloudTrail审计能力为Enterprise AI提供了开箱即用的合规框架。
**2. 身份与访问管理的范式整合**：将Anthropic原生平台体验嵌入AWS IAM体系，意味着企业无需管理独立的AI平台账号。原有AWS安全流程（SSO、权限策略、审计日志）可直接复用，大幅降低了企业引入AI能力的组织协调成本。
**3. 数据边界的清晰界定**：明确说明"requests and data are processed outside the AWS security boundary"，将AI处理与云厂商基础设施解耦。这一定位适合无需严格数据本地化要求的场景，同时与Amazon Bedrock（数据在AWS边界内处理）形成互补。
**4. 分发渠道vs技术壁垒**：Anthropic选择通过AWS分发而非自建Enterprise渠道，揭示了AI平台商业化的核心逻辑——在技术差异缩小后，分发渠道和用户体验成为竞争焦点。

## 实践启示
1. **企业AI采购的新范式**：通过已有的云服务合同和安全管理体系引入AI能力，无需新建独立的AI平台治理框架。IT团队可以用熟悉的AWS工具管理AI支出和审计。
2. **双轨策略选择**：需要严格数据本地化或已在使用Bedrock的企业可继续原有路径；对原生Claude Platform体验有需求且无严格数据 residency要求的企业，可选择Claude Platform on AWS。
3. **身份整合降低管理成本**：复用AWS IAM意味着AI权限管理可以纳入企业现有的身份治理体系。对于有多AI服务采购的企业，这避免了账号碎片化的问题。
4. **API兼容性保证迁移平滑**：与直接使用Anthropic平台的API完全兼容，企业可以在不修改代码的情况下切换入口，降低了迁移和试点成本。

---

