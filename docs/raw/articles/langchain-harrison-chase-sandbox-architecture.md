---
title: "LangChain创始人解读：AI智能体两种沙盒架构"
created: 2026-05-28
updated: 2026-05-28
type: raw
tags: [sandbox, langchain, harrison-chase, e2b, modal, daytona, deepagents, security, agent-architecture]
sources:
  - https://mp.weixin.qq.com/s/1ts5cEe3qHN0w3-evQMzuQ
review_value: 8
review_confidence: 8
sha256: c48bdb52b0562106e4b66451c9d21b5227d56b7f8f5bd98b56b4ec0c2e4b23f0
---

## 背景

作者：winkrun，AI工程化。

AI新基建当属沙盒，但怎么用是个问题。越来越多的智能体需要执行代码、安装软件包、访问文件。这些操作需要工作空间，但必须与主机系统隔离，防止智能体访问凭证、文件或网络资源。沙盒提供了这种隔离。

LangChain 创始人 Harrison Chase 最近分析了 AI 智能体与沙盒集成的架构问题，指出目前有两种架构模式。

## 模式一：智能体在沙盒内运行

**架构**：智能体完全运行在沙盒环境中，外部通过网络与之通信。

**实现**：构建预装智能体框架的 Docker 或 VM 镜像，在沙盒内运行，从外部连接发送消息。智能体暴露 API 端点（通常是 HTTP 或 WebSocket），应用程序跨沙盒边界通信。

### 优势
- **镜像本地开发环境**：如果本地运行 deepagents，沙盒中运行相同命令
- **直接文件系统访问**：智能体可以直接访问文件系统并修改环境
- **紧密耦合**：智能体与执行环境紧密耦合时有用，比如需要与特定库交互或维护复杂环境状态

### 挑战
- **跨沙盒边界通信基础设施**：一些提供商如 E2B 在 SDK 中处理了这个问题，否则需要自己构建 WebSocket 或 HTTP 层，包括会话管理和错误处理
- **API 密钥安全风险**：密钥必须存储在沙盒内以允许智能体进行推理调用，这在沙盒被攻破时会产生安全风险。E2B 和 Runloop 等提供商正在开发密钥保险库功能来解决这个问题
- **迭代速度慢**：更新需要重建容器镜像并重新部署，会减慢开发迭代周期
- **沙盒状态恢复**：沙盒必须在智能体激活前恢复，通常需要额外逻辑
- **知识产权风险**：对于担心保护智能体知识产权的团队，智能体在沙盒内运行时代码和提示更容易被泄露

### Nuno Campos（Witan Labs）安全观点
> "智能体的任何部分都不能拥有比 bash 工具更多的权限。例如，如果你想要一个既有 bash 工具又有网络搜索工具的智能体，那么所有 LLM 生成的代码都可以进行无限制的网络访问，这是很大的安全风险。如果是模式二，你可以让工具拥有比 LLM 生成代码更多的权限，因为安全边界围绕 bash 工具，而不是整个智能体。"

## 模式二：沙盒作为工具

**架构**：智能体运行在本地或服务器上，需要执行代码时通过 API 调用远程沙盒。

**实现**：智能体在本地（或服务器上）运行，当生成需要执行的代码时，调用沙盒提供商的 API（如 E2B、Modal、Daytona 或 Runloop）。提供商的 SDK 处理所有通信细节，从智能体角度看，沙盒就是另一个工具。

### 优势
- **快速迭代**：可以即时更新智能体代码而无需重建容器镜像，这加快了开发期间的迭代速度
- **API 密钥安全**：API 密钥保留在沙盒外——只有执行发生在隔离环境中
- **清晰的关注点分离**：智能体状态（对话历史、推理链、内存）存在于智能体运行的地方，与沙盒分离。这意味着沙盒故障不会丢失智能体状态，你可以切换沙盒后端而不影响智能体的核心逻辑

### Tomas Beran（E2B）补充的优势
- 可以在多个远程沙盒中并行运行任务
- 只在执行代码时为沙盒付费，而不是整个进程运行时间

### Ben Guo（Zo Computer）补充
> "我们选择模式二还考虑到未来可能需要在 GPU 机器上运行智能体工具——通常持久沙盒和推理工具的环境需求会发生分化。"

### 挑战
- **网络延迟**：主要缺点。每次执行调用都要跨网络边界。对于有许多小执行的工作负载，这会累积
- **有状态会话缓解**：许多沙盒提供商提供有状态会话，其中变量、文件和已安装的包在同一会话的调用之间持续存在。这可以通过减少所需的往返次数来缓解一些延迟问题

## 选择建议

**选模式一的情况**：
- 智能体与执行环境紧密耦合（例如，智能体需要对特定库或复杂环境状态的持续访问）
- 希望生产环境密切镜像本地开发
- 提供商的 SDK 为你处理通信层

**选模式二的情况**：
- 需要在开发期间快速迭代智能体逻辑
- 希望将 API 密钥保留在沙盒外
- 更喜欢智能体状态和执行环境之间更清晰的分离

## 实现示例

### 模式一示例（deepagents）
```dockerfile
FROM python:3.11
RUN pip install deepagents-cli
```
然后在沙盒内运行。完整的实现需要额外的基础设施来处理应用程序和沙盒内智能体之间的通信（WebSocket 或 HTTP 服务器、会话管理、错误处理）。

### 模式二示例（deepagents + Daytona）
```python
from daytona import Daytona
from langchain_anthropic import ChatAnthropic
from deepagents import create_deep_agent
from langchain_daytona import DaytonaSandbox

# 也可以使用 E2B、Runloop、Modal
sandbox = Daytona().create()
backend = DaytonaSandbox(sandbox=sandbox)

agent = create_deep_agent(
    model=ChatAnthropic(model="claude-sonnet-4-20250514"),
    system_prompt="You are a Python coding assistant with sandbox access.",
    backend=backend,
)

result = agent.invoke({
    "messages": [{
        "role": "user",
        "content": "Run a small python script",
    }]
})

sandbox.stop()
```

**流程**：
1. 智能体在机器上本地规划
2. 生成 Python 代码来解决问题
3. 调用 Daytona API，在远程沙盒中执行代码
4. 沙盒返回结果
5. 智能体看到输出并在本地继续推理

## 社区讨论

1. **生产可行性质疑**：有开发者认为存在"巨大的安全漏洞和各种极具挑战性的基础设施约束（沙盒可观察性、正常运行时间、扩展等）"

2. **Nico Ritschel 的反驳**：
   - API 密钥问题可以通过代理推理调用和在沙盒外注入密钥来解决
   - 对于知识产权保护，可以将 IP 保存在智能体可访问的工具中

3. **Harrison Chase 回应**：密钥代理还不是标准做法，虽然一些提供商正在添加这些功能

4. **Adish Jain（InvariumAI）**：无论采用哪种模式，真正的问题是如何验证智能体在沙盒内实际执行的操作，强调了智能体行为测试的重要性

5. **Nathan Flurry 的 Sandbox Agent SDK**：专门解决"智能体在沙盒内"模式复杂性，支持 Claude Code、Codex、OpenCode、Cursor、Amp 和 Pi 等多种智能体，提供统一的 HTTP API 来远程控制沙盒内的智能体

原文链接：https://x.com/hwchase17/status/2021261552222158955
Sandbox Agent SDK：http://github.com/rivet-dev/sandbox-agent