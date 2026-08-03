---
source_url: "https://mp.weixin.qq.com/s/cxPY_AQgp5ci5nWI2RNTRA"
source_author: "云开发团队"
source_title: "OpenAgentKernel 开源：Agent 开发的框架层，我们帮你写好了"
source_date: "2026-08-03"
source_publication: "腾讯云开发CloudBase"
ingested: "2026-08-03"
sha256: "7855727348698e73ed98f95ed34a71a6ff767f7353cc3f1ad444fa9d4ea94d44"
---

现在的 AI Agent 开发，很像框架出现之前的 Web 开发，开发者都构建同一套底层，处理很多重复性的逻辑：会话历史与压缩、断线重连、对接沙箱、MCP/Skills 对接、人机响应（Human in the Loop）、模型多轮循环……真正与开发者自身业务相关的只是代码量很小的一部分，70% 的工作花在了这些底层细节上。这和 Web 开发的「刀耕火种」时代很像：每个团队要从路由、ORM、会话管理开始重复造轮子，直到 Django、Rails 这些全栈框架把基础设施标准化了，开发者的精力才真正回到业务逻辑上。

Agent 开发现在就站在这条分界线上，虽然当下代码仍然是构建 Agent 的主要方式，但显然开发者不需要再徒手写一套会话持久化和工具编排了。

为了解决这些 Agent 开发者的痛点，我们今天很荣幸地推出 OpenAgentKernel：

- Github 仓库地址：https://github.com/TencentCloudBase/OpenAgentKernel
- CNB 仓库地址：https://cnb.cool/tencent/cloud/cloudbase/OpenAgentKernel

这是一个原生适配 CloudBase 平台的 Agent 框架，我们在其中内置了会话持久化、工具编排、人机响应（HITL）等基础能力，让开发者可以专注于业务逻辑的实现，而不是去陷入到基础设施的细节中。

立即试用：`npm install @cloudbase/open-agent-kernel@beta`

前置条件：Node.js 22+、一个 CloudBase 环境的 envId、以及环境的服务端 API Key。

## 最小示例：三十秒看懂核心 API

```javascript
import { createAgent } from "@cloudbase/open-agent-kernel";
process.env.TCB_API_KEY = "your-cloudbase-api-key";

// 创建 Agent
const agent = createAgent({
  envId: "your-env-id",
  model: "deepseek-v4-pro",
  systemPrompt: "你是一个智能助手，请帮我回答用户的问题",
});

// 创建会话
const session = await agent.startSession({ userId: "user-1" });

// 发送消息，并接收响应
for await (const event of session.send("一句话解释：什么是 Serverless？")) {
  if (event.type === "message_delta") process.stdout.write(event.text);
  if (event.type === "session_idle") break; // 本轮结束
}
```

你可以将上面这段代码很轻松地部署到 CloudBase 的 HTTP 云函数中运行，然后用 curl 或者 Postman 等工具来测试。

## 特性介绍

在 OpenAgentKernel 中，我们内置了以下功能：

### 1、会话持久化和跨进程恢复

会话记录默认持久化到云开发数据库，不依赖进程内存。

```javascript
const agent = createAgent({
  envId: "your-env-id",
  model: "deepseek-v4-pro",
  systemPrompt: "你是一个智能助手，请帮我回答用户的问题",
});
const session = await agent.startSession({ userId: "user-1" });
const conversationId = session.id;
```

在之后的另一个进程里，比如第二次函数调用，可以直接使用 conversationId 来恢复对话上下文：

```javascript
const resumed = await agent.resumeSession(conversationId);
```

跨进程恢复会话实录。

### 2、MCP 接入

对接 MCP 几乎是 Agent 开发中必须的功能，所以我们内置了多种 MCP 的接入方式：进程内、本地 stdio、远程 HTTP。

```javascript
import { createSdkMcpServer, tool } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

// 进程内 MCP
const localMCPServer = createSdkMcpServer({
  name: "calc",
  version: "1.0.0",
  tools: [
    tool(
      "add",
      "Add two numbers",
      { a: z.number(), b: z.number() },
      async (args) => ({
        content: [{ type: "text", text: String(args.a + args.b) }],
      }),
    ),
  ],
});

// 本地 stdio MCP
const stdioMCPServer = {
  type: "stdio",
  command: "npx",
  args: ["-y", "@modelcontextprotocol/server-everything"],
};

// 远程 HTTP MCP
const remoteMCPServer = {
  type: "http",
  url: "https://example.com/mcp/v1",
  headers: { Authorization: "Bearer xxx" },
};

const agent = createAgent({
  envId,
  model: "glm-5.2",
  systemPrompt: "你是一个智能助手，请帮我回答用户的问题",
  mcpServers: {
    local: localMCPServer,
    stdio: stdioMCPServer,
    remote: remoteMCPServer,
  },
});
```

### 3、人机响应（HITL，Human in the Loop）

在 Agent 进行一些敏感操作时，比如删除数据库、设置密码等，我们通常需要用户主动确认，Agent 才可以继续执行任务。在 OpenAgentKernel 中，我们内置了人机响应（HITL）的功能：

```javascript
const agent = createAgent({
  envId,
  model: "glm-5.2",
  systemPrompt: "你是一个智能助手，请帮我回答用户的问题",
  // 配置哪些工具需要人工确认
  permissions: {
    requireApproval: ["database_delete", "reset_password"],
  },
});
```

配置完成后，Agent 如果在任务中遇到需要人工确认的工具，那么在响应的事件流就会触发一个 `tool_approval_required` 类型的事件，开发者可以进一步基于此来实现人工确认的产品交互逻辑：

```javascript
const session = await agent.startSession({ userId: "user-1" });
for await (const event of session.send("帮我删除 todo_list 这个数据表")) {
  if (event.type === "tool_approval_required") {
    // 实现人工确认的交互逻辑，拿到 event.toolUseId 后调用 session.respondApproval()
  }
}
```

### 4、Agent 记忆

现在记忆也成为了大多数 Agent 自带的能力，在 OpenAgentKernel 中，我们内置了记忆的功能：

```javascript
const agent = createAgent({
  envId,
  model: "glm-5.2",
  systemPrompt: "你是一个智能助手，请帮我回答用户的问题",
  // 开启记忆
  userMemory: true,
});
```

用户私有的 `.claude/` 记忆文件将会自动同步到 CloudBase 的云存储中，并且跨会话生效。当然开发者也可以主动调用 API 来实现记忆的预置和删除：

```javascript
import { writeUserMemoryFiles } from "@cloudbase/open-agent-kernel";
await writeUserMemoryFiles({
  envId,
  userId: "alice",
  files: [{ path: "CLAUDE.md", content: "请始终用中文回答。" }],
});
```

### 5、沙箱：让 Agent 在安全环境中跑代码动文件

Agent 跑代码、改文件、执行 Shell，都需要一个隔离的执行环境。为此我们在 OpenAgentKernel 中内置了沙箱（Sandbox）的功能：

```javascript
const agent = createAgent({
  envId,
  model: "glm-5.2",
  systemPrompt: "你是一个全能编程助手，帮助用户编写代码",
  // 开启 Sandbox
  sandbox: {
    enabled: true,
    cloudbaseTools: true, // 镜像支持时，沙箱内可直接调用 CloudBase MCP 工具
    scope: "shared", // shared：多会话共享实例；session：每会话独立实例
    ttl: 3600,
  },
});
```

开启沙箱后，Agent 会在沙箱环境中执行代码、读写文件。比如让 Agent 生成一个网页并预览：

```javascript
const session = await agent.startSession({ userId: "user-1" });
session.send(
  "帮我写一个个人博客的首页，用 React + Tailwind CSS，然后部署到 CloudBase 上"
);
```

这样 Agent 就会自动在沙箱中创建文件、安装依赖、并且调用沙箱中内置的 CloudBase 密钥，将产物部署到云端，开发者无需管理和调度沙箱。CloudBase 的 Sandbox 能力当前内测中，如果您有需求，欢迎联系我们。

## 我们自己是如何使用 OpenAgentKernel 的？

目前 CloudBase 平台大部分的 AI 功能已经基于 OpenAgentKernel 构建，包括：

### CloudBase Agent

云开发控制台的 Agent 板块是基于 OpenAgentKernel 焕新的：新建 Agent 时选择官方 cloudbase-agent 模板，得到的就是一个 OpenAgentKernel 项目——会话持久化、MCP 工具、人工审批开箱即用，创建完成即可在「接入 & 调试」页直接对话。需要深度定制时，「本地开发」页给出完整指引：`tcb fn code download` 把代码拉到本地，交给你的 AI 编程工具修改，改完 `tcb fn deploy` 一条命令部署回去。控制台负责托管、日志和调试入口，OpenAgentKernel 负责运行时。

### Issue Agent

CloudBase 社区（CNB）的 Issue Bot 是一个跑在流水线里的 OpenAgentKernel Agent。新 issue 进来后，它以「云开发工程师」的角色检索资料、给出有依据的答复。它用到了 OpenAgentKernel 的三个能力：进程内 MCP server 提供受控工具，最终答复必须通过 `reply` 工具发布，从机制上保证"要么有据可查，要么明确标注推断"；skills 加载答疑经验（issue-agent-guide）；多模态附件让它能看懂用户贴的报错截图——截图先由一个视觉会话逐张识别，再进入主流程。

## 立刻使用 OpenAgentKernel

使用 npm 直接安装 SDK：`npm install @cloudbase/open-agent-kernel@beta`

你也可以访问下面的链接来查看代码：

- GitHub：https://github.com/TencentCloudBase/OpenAgentKernel
- CNB：https://cnb.cool/tencent/cloud/cloudbase/OpenAgentKernel

或者，直接打开 CloudBase 控制台（https://tcb.cloud.tencent.com/dev）的 Agent 板块，开始你的 Agent 开发之旅：

- npm：https://www.npmjs.com/package/@cloudbase/open-agent-kernel
- 源码与 README：https://github.com/TencentCloudBase/OpenAgentKernel
- Agent 开发文档：https://docs.cloudbase.net/ai/agent-development/

关注腾讯云开发，第一时间获取产品动态与最佳实践。
