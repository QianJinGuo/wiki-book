# Agentic Overlays -- Retrofit Legacy REST Services into A2A Agents

## Ch04.427 Agentic Overlays -- Retrofit Legacy REST Services into A2A Agents

> 📊 Level ⭐⭐ | 6.3KB | `entities/agentic-overlays-rest-to-a2a-enterprise.md`

# Agentic Overlays -- Retrofit Legacy REST Services into A2A Agents

## 摘要

AWS 与 Cisco 联合提出 **agentic overlay** 模式：通过薄包装层将遗留 REST 服务转换为 A2A（Agent-to-Agent）兼容的 agent，无需重写业务逻辑、无需复制代码、无需运行并行基础设施。核心洞察是"A2A 不是新的 API，而是现有 API 的新接口"。文章提供了两种实现模式：应用内 overlay（适合单服务 agent）和 AgentCore Gateway overlay（适合企业级多服务编排），并以 Flask 计算器为例展示了完整的端到端实现。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/retrofit-dont-rebuild-agentic-overlays-for-transforming-lega.md)

## 核心要点

### REST vs A2A 范式差异

| 维度 | REST | A2A |
|------|------|-----|
| 设计目标 | 稳定的服务接口和直接执行 | 推理驱动的协调和任务导向消息 |
| 通信模式 | 确定性、客户端-服务端、无状态 | 自主 agent 互操作、agent card 发现、JSON-RPC |
| 交互方式 | 调用端点 → 获取响应 | 发现能力 → 协商 → 协调多步任务 |
| 适用场景 | CRUD、明确契约 | 计划、委托、跨服务组合操作 |

### 三种迁移路径对比

| 方案 | 描述 | 问题 |
|------|------|------|
| **双栈并行** | REST + A2A 各自独立端点 | 双倍运维、不一致性风险、双倍成本 |
| **共享业务逻辑重构** | 提取 REST 业务逻辑到共享层 | 回归风险、测试负担、行为漂移 |
| **Agentic Overlay** | 薄包装层，不改原始代码 | ✅ 推荐方案 |

### Agentic Overlay 核心特性

- **零代码变更**：overlay 是独立层，通过 HTTP 调用原始 REST API
- **同时支持 A2A + MCP**：一个 overlay 同时暴露为 A2A agent 和 MCP tool
- **消除 agent 膨胀**：复用现有服务作为 agent，无需新基础设施
- **单部署管线**：build、test、release、rollback 只需一套管线

## 深度分析

### 消息转换设计模式

Agentic overlay 的核心技术是 **Request Translator Pattern**，将 A2A 的 JSON-RPC 2.0 消息转换为 REST payload：

```
A2A JSON-RPC Request
    ↓ 解析 message.parts[0].data
提取 payload (如 {"operation": "add", "operands": [5, 3]})
    ↓ 转发到 REST 端点
POST /api/v1/calculate {payload}
    ↓ REST 响应
包装为 A2A Message Response (messageId, contextId, role, parts)
```

完整工作流：
1. 接收 JSON-RPC 2.0 请求
2. 将 A2A tasks 映射到 REST 端点
3. 转发认证 headers
4. 内部调用 REST 端点
5. 将 REST 响应翻译为 JSON-RPC 格式

### A2A Spec 0.3 关键组件

**Agent Card**（`/.well-known/agent-card.json`）：
```json
{
  "name": "Calculator Agent",
  "description": "Simple calculator supporting basic arithmetic operations",
  "supportedInterfaces": [
    {"url": "http://localhost:5000/a2a", "protocolBinding": "JSONRPC", "protocolVersion": "0.3"}
  ],
  "capabilities": {"streaming": false, "pushNotifications": false},
  "skills": [...] // 从 skills.json 加载
}
```

**路由注册**：
- `GET /.well-known/agent-card.json` — agent 发现
- `GET /a2a/capabilities` — 能力查询
- `GET /a2a/health` — 健康检查
- `POST /a2a` — JSON-RPC 入口

### 两种实现模式

#### 模式 1：应用内 Overlay

在同一应用中添加 A2A 路由：
```python
def create_app():
    app = Flask(__name__)
    app.register_blueprint(rest_api)      # 原有 REST
    setup_a2a_routes(app)                  # 新增 A2A
    return app
```

- 同一 host、同一端口、同一部署管线
- Agent skills 可以直接在 agent scope 内路由，无需导入 MCP server
- 适合 supervisor agent（有限功能范围，如 intent classification 和 routing）

#### 模式 2：AgentCore Gateway 解耦 Overlay

Amazon Bedrock AgentCore Gateway 将 overlay 从应用中解耦：
- 一个 overlay 可以服务多个服务/应用
- 每个 gateway 支持最多 10 个 targets
- 原生集成 AWS 服务 + OpenAPI 端点
- 按功能而非按应用组织 overlay

### 企业级价值

对于拥有大量 REST 微服务的企业（金融、电信、政府），agentic overlay 是最低成本的 agent 化路径：

1. **零重写**：现有服务的业务逻辑完全不变
2. **零并行基础设施**：不需要运行两套系统
3. **渐进迁移**：先 overlay 关键服务，再扩展
4. **单部署管线**：不需要双倍的 CI/CD 投资
5. **A2A 标准化**：将遗留服务带入标准化的 agent-to-agent 世界

### AgentCore 生态集成

AgentCore 提供了完整的 agent 基础设施：
- **Identity**：OAuth 2.0 认证，支持 Okta、GitHub、Slack 集成
- **Observability**：CloudWatch 集成的 agent 性能监控
- **Runtime**：容器化部署，支持开源/custom/Bedrock LLMs
- **Gateway**：集中式工具管理、认证、策略执行

## 实践启示

1. **"A2A 不是新 API，而是新接口"**：这一视角将采用挑战从"重建一切"转变为"增量改造"，企业可以更快实现 AI 价值
2. **Overlay 模式 vs 重构模式**：在遗留系统现代化中，薄包装层优于深度重构——风险更低、收益更快
3. **双协议暴露**：同时暴露 A2A 和 MCP 是务实的选择——A2A 用于 agent 间协调，MCP 用于 tool 调用
4. **渐进式策略**：先 overlay 最关键的服务，验证模式可行后再扩展
5. **Gateway 解耦的价值**：当需要服务多个应用时，AgentCore Gateway 的解耦模式比应用内 overlay 更具扩展性

## 相关实体

- [Agentic AI Data Mesh](ch04/277-ai.md) — 另一种 agent 化路径：data mesh 的 MCP 暴露
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — Agent 约束与验证框架
- [Agent Harnesses Are Dead](ch04/593-agent-harnesses-are-dead-long-live-agent-harnesses.md) — Agent Harness 架构演进讨论

---

