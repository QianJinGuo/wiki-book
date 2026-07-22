# 云效 AI Code Review — GitLab Integration for Private-Network Code Review

## Ch09.171 云效 AI Code Review — GitLab Integration for Private-Network Code Review

> 📊 Level ⭐⭐ | 2.6KB | `entities/yunxiao-ai-code-review-gitlab.md`

# 云效 AI Code Review: GitLab Integration

云效 (Yunxiao) is `Alibaba Cloud`'s DevOps platform. Its **AI Code Review** capability, previously available for Alibaba Cloud's Codeup, now officially supports **GitLab integration** — enabling enterprises to leverage AI-driven code review without moving their repositories out of private networks.

## Key Design Principles

### Security-First Architecture
Many enterprises keep GitLab behind corporate firewalls, VPCs, or private clouds for security compliance. The 云效 integration is designed around:
- **No public exposure** required — GitLab stays in the private network
- **No repository migration** — Code never leaves its original location
- **Personal Access Token** based authentication for secure API access
- VPC network connectivity support for GitLab deployed within private VPCs

### Seamless Workflow
Developers' existing collaboration habits remain unchanged. When a Merge Request is created or reopened, GitLab notifies 云效 via Webhook. The AI review service reads the code diff and relevant context, performs analysis, and writes results back to the Merge Request as comments. All follow-up discussions happen within GitLab's native interface.

## Integration Options

- **Self-hosted GitLab** — On-premise or cloud-hosted, as long as 云效 can reach it
- **Managed GitLab** — GitLab.com or other managed instances
- **VPC-internal GitLab** — Through Alibaba Cloud's private network access capabilities

This extends 云效's AI code review ecosystem, which also includes `Open Code Review CLI` and the broader `Ai Code Review Automation` landscape. The GitLab support fills a critical gap for enterprises that have standardized on GitLab but want AI-assisted code review without compromising security posture.

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/代码不出内网也能用上-ai-智能评审云效现已支持-gitlab.md)

---

