# OpenSandbox：阿里开源的云端 Agent 安全沙箱（凭据 Vault + egress sidecar）

## Ch12.119 OpenSandbox：阿里开源的云端 Agent 安全沙箱（凭据 Vault + egress sidecar）

> 📊 Level ⭐⭐ | 3.0KB | `entities/opensandbox-aliyun-cloud-agent-sandbox-vibecoder.md`

# OpenSandbox：阿里开源的云端 Agent 安全沙箱（凭据 Vault + egress sidecar）

阿里开源的通用 sandbox 平台，解决云端 Agent 安全执行代码的问题。提供 SDK、CLI、MCP、统一生命周期 API，以及 Docker / Kubernetes 两套 runtime。

## 定位：执行面，不是完整 Agent 产品

OpenSandbox 负责执行面：创建隔离环境、执行命令、处理文件、控制出站请求。调度、会话、记忆、任务语义等上层能力需要外部系统自己接。

与 [Claude Managed Agents](ch04/503-agent.md) 的关系：OpenSandbox 更接近 Environment、Sandbox、Vault、Permission policy 里偏运行时的部分，Agent harness 那层不会替你做。

## 凭据设计（核心亮点）

**问题**：最省事的做法是把 token 放到环境变量里，但 Agent 进程能读到，命令能打印出来，恶意代码也能转手带走。

**方案：Credential Vault**：
- 真实凭据写进 egress sidecar
- 容器里只给 fake key 或空值
- Agent 发 HTTPS 请求，sidecar 透明拦截检查目标 host/method/path
- 匹配绑定规则才注入真实请求头
- 工具链不用大改（Claude Code、Git、curl、npm、模型 SDK 按原来方式访问）

**限制**：
- 依赖透明 MITM 和 CA 信任
- 与 Istio/Envoy sidecar 冲突
- 不做 response body 的 secret 重写

## 云端 Agent 接入架构

外部控制面接收任务 → 判断权限和资源配额 → 创建短生命周期 sandbox → sandbox 内运行 Agent CLI → egress sidecar 管出站策略和凭据注入 → 任务结束后日志/结果回传控制面 → sandbox 销毁。

## 适用场景与前置条件

**适合**：运行不完全可信的代码，Agent 需要访问 Git、模型 API、包仓库，真实凭据不能直接进容器。

**前置条件**：先有调度器、队列、会话管理、权限策略和审计链路，再接 OpenSandbox 作为 runtime。网络环境（MITM、CA 信任、K8s sidecar 兼容性）必须按真实生产网络验证。

## 相关实体

- [Claude Managed Agents](ch04/503-agent.md) — 类似的 sandbox 架构
- [LangChain Sandbox Architecture](ch04/310-ai.md) — 另一种 sandbox 设计
- [Microsoft mxc Containers](ch04/310-ai.md) — Microsoft 的 sandbox 方案

---

