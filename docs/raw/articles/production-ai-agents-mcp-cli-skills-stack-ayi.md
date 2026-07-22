---
title: "如何构建生产准备的AI代理：MCP、CLI与技能——适合合适的工作的工具"
source_url: "https://mp.weixin.qq.com/s/lW51nHefm7pEmhjKxEWOFw"
author: "啊镒opc实验基地"
created: 2026-05-26
type: article
tags: [mcp, cli, skill, agent, production, connection-stack, tool-calling]
sha256: ""
---

如何构建生产准备的AI代理：MCP、CLI与技能——适合合适的工作的工具

啊镒opc实验基地
2026年5月26日 10:58 浙江

2024年，我们制作了演示。2025年，我们开发了编码代理。2026年，我们将将通用知识工作者投入生产。

据Anthropic的David Soria Parra介绍，模型上下文协议（MCP）已达到惊人的月下载量1.1亿次——比React更快实现这一里程碑。但随着我们扩展代理以处理跨多个SaaS应用和共享硬盘的复杂企业工作流，一个关键认识浮现：连接性并非单一因素。

如果有人告诉你所有连接问题——无论是电脑使用、MCP还是CLI——都有统一解决方案——那他们错了。顶级客服人员不会在工具之间做选择——他们同时且轻松地使用整个连接堆栈。

以下是掌握2026年连接技术栈的逐步指南：技能、MCP和CLI。

理解连接堆栈

在编写代码之前，你必须了解现代代理连接的三个不同层面。技能、CLI和MCP到底是什么？它们是如何形成的？

技能（领域知识）：可重用的程序指令和 Markdown 文件，用于教导模型如何使用工具。它们可以在不同客户端之间移植，并为复杂任务提供必要的上下文。技能通常由人类编写或由代理生成，并从本地目录或远程存储库加载。

CLI / 计算机使用（本地执行）：Unix 风格的连接方法。它高度可组合，token 效率高（每个响应约 200 个 token），并利用模型在现有工具（如 git、gh、curl）上的预训练。CLI 工具通过包管理器安装标准二进制文件形成。

MCP（连接组织）：提供丰富语义、平台独立性和关键企业功能（如 OAuth、治理策略和审计跟踪）的集成协议。MCP 服务器通过在代码中定义工具、资源和提示并使用 HTTP 或 SSE 上的 JSON-RPC 2.0 进行通信而形成。

使用 MCP 执行任务

当你需要丰富语义、授权和平台独立性时，MCP 是正确的工具。它提供了一种以模式优先、确定性为基础的工具选择方法。

然而，这需要权衡。在简单的实现中，提前加载所有工具模式可能会消耗大量上下文（例如，44,000–55,000 个 token）。响应是一个完整的、带类型的 JSON 对象，它非常适合程序化解析，但在 token 方面可能会很重。

服务器作者的技巧：
始终使用描述性的函数名、参数名，并用描述标注参数。如果 LLM 确切地知道期望什么，它们将更快、更成功。

Annotated Tool Definitions 示例：
from typing import Annotated
from datetime import date
from enum import Enum

class Category(str, Enum):
    TRAVEL = travel
    MEALS = meals
    OFFICE = office

def submit_expense(
    amount: Annotated[float, The expense amount in USD],
    date: Annotated[date, Date of the expense in YYYY-MM-DD format],
    category: Annotated[Category, The expense category]
) -> str:
    Submits a new expense report for approval.
    pass

使用 CLI 执行任务

当工具已包含在模型的预训练数据中（例如 GitHub CLI 或 Git）时，CLI 执行非常强大。它允许模型使用管道和重定向来组合命令，以高效的方式迭代错误。

与其返回一个庞大的 JSON 负载，模型可以使用工具来过滤它需要的确切内容，返回一个约 200 个 token 的紧凑响应。

渐进式发现

我们必须对我们的代理 harnesses 进行的首要改进是渐进式发现。我们不将所有工具都放入上下文窗口，而是将工具加载推迟到模型实际需要它们的时候。

通过提供 tool_search 功能，模型可以动态查找工具。这种模式可以将上下文使用量减少 5 倍。

程序化工具调用（代码模式）

如果您希望模型协调多个工具，不要强迫它进行顺序工具调用。顺序调用依赖于每个协调步骤的推理延迟。

相反，使用程序化工具调用或代码模式。为模型提供一个环境——例如 V8 隔离或 Python 沙盒——并让它编写一个脚本来组合这些工具。

// Programmatic Tool Calling (Code Mode)
// Instead of multiple sequential LLM turns, the model writes this script once:
const issue = await mcp.call_tool("linear_get_issue", { id: "ENG-5121" });
const prs = await mcp.call_tool("github_list_prs", { repo: "frontend" });
// Use structured output to enforce types
const expectedType = z.object({ title: z.string(), status: z.string() }).passthrough();
const typedIssue = await extract("claude-haiku-4-5", expectedType, issue);

为代理构建

作为服务器开发者，我们必须停止将 REST API 一对一映射到 MCP 服务器。我们需要从基础开始为代理进行设计。

设计具有明确目的的工具，为编排提供沙盒，并发布 UI 资源。

MCP 今年 — 将要推出什么

2026 年路线图包括无状态传输、跨应用访问以及通过 MCP 的技能。

改进核心：一种新的无状态传输协议（由 Google 提出）将使部署 MCP 服务器到 Kubernetes 和 Cloud Run 更加容易。期待 TypeScript 和 Python SDK v2.0 发布。

无处不在集成：跨应用访问将允许使用您公司的身份提供商在 MCP 服务器之间进行单点登录（SSO）。服务器发现将通过 .well-known/mcp-server-card/server.json 自动进行。

突破边界：MCP 上的技能将允许服务器附带工具使用领域知识进行交付。

MCP 的批评——标记开销、认证漏洞和服务器质量——是真实存在但可解决的工程挑战，而非生存威胁。生态系统已经具备自我修正能力。渐进式发现和程序化工具调用（代码模式）等技术能大幅减少标记膨胀和延迟，证明可以在不放弃标准的前提下进行优化。

此外，在企业环境中放弃 MCP 会引发更严重的问题：身份验证碎片化、无审计追踪以及供应商锁定。MCP 提供的连接纽带对于大规模治理和安全至关重要。

