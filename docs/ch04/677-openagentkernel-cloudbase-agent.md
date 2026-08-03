# OpenAgentKernel：腾讯云 CloudBase 的 Agent 开发框架层

## Ch04.677 OpenAgentKernel：腾讯云 CloudBase 的 Agent 开发框架层

> 📊 Level ⭐⭐ | 4.1KB | `entities/open-agent-kernel-cloudbase-tencent-2026.md`

# OpenAgentKernel：腾讯云 CloudBase 的 Agent 开发框架层

**来源**: 腾讯云开发CloudBase（云开发团队）

**发布日期**: 2026-08-03

**原文链接**: https://mp.weixin.qq.com/s/cxPY_AQgp5ci5nWI2RNTRA

**仓库**: https://github.com/TencentCloudBase/OpenAgentKernel（npm: `@cloudbase/open-agent-kernel@beta`）

## 摘要

腾讯云原生适配 CloudBase 平台的 Agent 开发框架，定位类比 Web 时代的 Django/Rails——把 Agent 开发中 70% 的重复性底层工作（会话历史与压缩、断线重连、沙箱对接、MCP/Skills 对接、HITL、模型多轮循环）标准化内置，让开发者专注业务逻辑。核心 API 为 `createAgent()` + `startSession()` + `session.send()` 的事件流模式，可部署到 CloudBase HTTP 云函数运行。

## 五大内置能力

### 1. 会话持久化与跨进程恢复

会话记录默认持久化到云开发数据库（不依赖进程内存），通过 `conversationId` 在任意进程恢复上下文：`agent.resumeSession(conversationId)`。适配 Serverless 场景的多次函数调用。

### 2. MCP 接入（三模式）

内置进程内（`createSdkMcpServer` 直接注册 tool）、本地 stdio（`npx` 子进程）、远程 HTTP（带 headers 鉴权）三种 MCP server 接入方式，统一通过 `mcpServers` 配置项声明。

### 3. 人机响应（HITL）

`permissions.requireApproval` 声明敏感工具（如 `database_delete`、`reset_password`），命中时事件流触发 `tool_approval_required` 事件，开发者通过 `session.respondApproval()`（携带 `toolUseId`）实现人工确认交互。

### 4. Agent 记忆

`userMemory: true` 开启后，用户私有 `.claude/` 记忆文件自动同步到 CloudBase 云存储并跨会话生效；也提供 `writeUserMemoryFiles` API 主动预置/删除记忆。

### 5. 沙箱（Sandbox）

`sandbox: { enabled, cloudbaseTools, scope: shared|session, ttl }` 提供隔离执行环境跑代码/读写文件，沙箱内置 CloudBase 密钥可直接部署产物到云端，开发者无需管理调度。CloudBase Sandbox 能力当前内测中。

## 内部自用案例

- **CloudBase Agent**：云开发控制台 Agent 板块基于 OpenAgentKernel 焕新，官方 `cloudbase-agent` 模板开箱即用（会话持久化/MCP/人工审批），`tcb fn code download` 本地定制 + `tcb fn deploy` 一键部署。控制台负责托管/日志/调试，框架负责运行时。
- **Issue Agent**：CNB 社区 Issue Bot 跑在流水线里，进程内 MCP server 提供受控工具（最终答复必须通过 `reply` 工具发布，机制上保证"有据可查或明确标注推断"）+ skills 加载答疑经验 + 多模态附件识别报错截图（视觉会话逐张识别后进主流程）。

## 相关链接

- → [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/open-agent-kernel-cloudbase-tencent-2026-08-03.md)
- 同平台姊妹篇：[Agent Loop Engineering 手册（腾讯）](../ch05/006-loop-engineering.html)、[WorkBuddy 产品实践：从模型到 Harness 的 Agent 可用产品架构（腾讯技术工程）](../ch05/062-agent-harness.html)
- 相关主题：[Agent Harness 12 组件 7 决策](../ch05/062-agent-harness.html)、[AgentScope 2.0：Managed Agents 底座 Harness](../ch05/085-harness.html)

---

