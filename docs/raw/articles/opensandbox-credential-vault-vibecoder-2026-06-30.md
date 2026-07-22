---
title: "OpenSandbox Credential Vault：让真实密钥不再进入沙箱"
source_url: "https://mp.weixin.qq.com/s/IHT_Apd5KccDnI8xprlR7w"
author: "VibeCoder (Vibe编码)"
published: 2026-06-30
ingested: 2026-06-30
language: zh
type: raw
sha256: "130f722889a36e5240cab99cede04c5ebd27bd35f2308a47deae89e2ad0f0c9f"
---

# OpenSandbox Credential Vault：让真实密钥不再进入沙箱

OpenSandbox 是一个阿里巴巴开源的面向 AI Agent 的通用沙箱平台，提供多语言 SDK、CLI、MCP Server，以及 Docker / Kubernetes 运行时，在阿里内部广泛应用于 Coding Agent、GUI Agent、代码执行、Agent 评测、RL 训练等场景。

OpenSandbox 正在成为 AI Agent 基础设施领域里一个重要的开源项目。随着 AI Agent 从 Demo 走向生产环境，沙箱要解决的问题也不再只是"代码在哪里执行"，还包括"真实凭据应该如何安全使用"。

这就是 Credential Vault 要解决的问题：让工具照常工作，但让真实密钥不再进入沙箱。

## 为什么不能直接把密钥放进沙箱

在过去，想让 Agent 在沙箱里调用外部服务，最直接的方式往往是把 API Key、Git Token、Registry 凭据等塞进环境变量、命令行参数或配置文件里。

这种方式虽然简单，不过，风险也很直接：沙箱本来是用来隔离不可信代码和工具执行的，一旦真实密钥进入沙箱，Prompt Injection、恶意依赖、日志泄露、文件读取等风险都会被放大。

例如，一个 Coding Agent 可能需要：

- 调用模型 API；
- clone 私有 Git 仓库；
- 安装私有包；
- 用 curl 访问内部 API；
- 运行第三方 CLI 或依赖脚本。

这些操作都可能需要凭据。如果凭据直接暴露在沙箱环境变量、命令参数、配置文件或日志里，那么，只要沙箱内的任意工具链环节失控，真实密钥就可能被读取、打印或转发。

## Credential Vault 的核心思路

Credential Vault 是 OpenSandbox 的出站凭据代理能力。它把真实凭据保存在沙箱外，由 OpenSandbox 的 egress sidecar 在出站请求经过时按规则注入认证信息。

整体流程可以理解为：

1. 宿主侧 SDK 创建 sandbox，并启用 Credential Proxy；
2. SDK 将真实凭据和绑定规则写入 egress sidecar 的 Credential Vault；
3. 沙箱进程只拿到假值或空值，例如一个假的 API Key；
4. 当沙箱内工具发起 HTTPS 出站请求时，egress sidecar 检查请求的 scheme、host、port、method 和 path；
5. 如果请求精确匹配某条 Credential Vault binding，sidecar 就在出站时注入对应的认证 Header；
6. 真实凭据不会返回给沙箱，也不会出现在沙箱环境变量、命令行、文件系统和日志里。

换句话说，沙箱仍然可以运行 Claude Code、Git、curl、包管理器或模型 API 客户端，但真实密钥不再交给这些工具所在的运行环境。

## 典型场景：沙箱内的 Claude Code 调用模型 API

以 Claude Code 调用 Anthropic API 为例。

传统做法通常是在沙箱里设置真实的 ANTHROPIC_API_KEY，让 CLI 读取这个环境变量后访问 api.anthropic.com。使用 Credential Vault 后，沙箱里可以只设置一个假的 ANTHROPIC_API_KEY，让 CLI 正常启动。真正的 Anthropic API Key 由宿主侧 SDK 写入 Credential Vault，并绑定到明确的出站请求范围，例如：

- scheme：https
- host：api.anthropic.com
- port：443
- method：GET、POST
- path：/v1/*
- auth header：x-api-key

当 Claude Code 在沙箱里访问 https://api.anthropic.com/v1/* 时，egress sidecar 会在请求离开沙箱前注入真实的 x-api-key Header。对 Claude Code 来说，请求可以正常完成；对沙箱进程来说，它从未见过真实密钥。

## 不只适用于模型 API

Credential Vault 也适用于更多常见开发者工具场景。

私有 Git 仓库 clone 可以使用 Basic Auth binding。真实的 username:token 先在宿主侧编码后写入 Vault，沙箱里执行的仍然是普通无密钥 URL：

```
GIT_TERMINAL_PROMPT=0 git clone https://api.github.com/org/private-repo.git
```

访问内部 API 时，也可以把 Token 绑定到明确的 Header、Host、Path 和 Method 上。沙箱命令保持干净：

```
curl -fsS https://api.github.com/v1/projects/
```

真正的认证信息由 egress sidecar 在出站链路上补齐。这种设计的价值在于，凭据不再是一个进入沙箱后任意可读、任意可复制的字符串，而变成一条受控的出站授权规则。

## 更细粒度的安全边界

Credential Vault 通常应该和默认拒绝的出站网络策略一起使用。这也就意味着，沙箱默认不能访问任意外部地址，只允许访问工具真正需要的服务 Host，再通过 Credential Vault 将凭据绑定到更窄的请求范围。

例如，对模型 API 可以只允许 /v1/*；对 Git 仓库可以只绑定某个私有仓库路径；对内部 API 可以限制到具体 Method 和 Path。

这带来以下几项直接收益：

- 真实密钥不进入沙箱环境；
- 密钥不会自然残留在命令行、文件和日志中；
- 凭据只能在匹配的出站请求上被使用；
- 不同服务、不同路径可以绑定不同凭据；
- 平台可以更容易审计和收敛凭据使用边界。

需要注意的是，Credential Vault 依赖 egress sidecar 的透明出站拦截和 MITM 路径。

如果 sandbox pod 同时注入 Istio / Envoy 这类透明 service mesh sidecar，两层拦截会在同一个网络命名空间内冲突。OpenSandbox 当前不支持 Credential Vault 与这类透明 service mesh sidecar 同时工作在同一个 sandbox pod 内。

## 从沙箱隔离到凭据隔离

沙箱平台过去关注的重点，通常是进程隔离、文件系统隔离、网络隔离和资源隔离。Credential Vault 进一步补上了 AI Agent 生产化过程中的关键一环：凭据隔离。

AI Agent 的执行链路往往更长，也更难完全预测。它可能会调用外部 CLI，安装依赖，执行仓库脚本，访问模型 API，甚至被用户输入或网页内容间接影响。如果真实密钥直接暴露给这条链路，风险很难收敛。

Credential Vault 给出的答案是：真实密钥应该留在沙箱外，由平台在受控的出站链路上按规则注入。沙箱负责执行，Vault 负责授权，egress policy 负责边界。

这让 OpenSandbox 不只是一个"能运行 Agent 的地方"，而是向生产级 Agent Runtime 又推进了一步。

一句话总结：Credential Vault 不是让沙箱更方便地保存密钥，而是让沙箱不再需要保存真实密钥。

## References

[1] OpenSandbox GitHub
https://github.com/opensandbox-group/OpenSandbox

[2] Credential Vault 文档
https://github.com/opensandbox-group/OpenSandbox/blob/main/docs/guides/credential-vault.md
