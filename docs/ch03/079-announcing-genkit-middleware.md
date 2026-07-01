# Announcing Genkit Middleware

## Ch03.079 Announcing Genkit Middleware

> 📊 Level ⭐⭐ | 9.6KB | `entities/developers.googleblog-announcing-genkit-middleware-intercept-extend-and-harden-y.md`

## 核心架构：三层拦截体系
Genkit 的 tool loop 每次迭代经历：模型生成输出 → 工具执行 → 结果反馈新模型调用 → 循环直到模型结束。Middleware 在此循环的三层注入钩子：
| 层级 | 触发频率 | 设计意图 |
|------|----------|---------|
| **Generate Hook** | 每轮 tool-loop 迭代执行一次 | 上下文注入、消息改写、会话级逻辑 |
| **Model Hook** | 每次模型 API 调用执行一次 | 重试、fallback、缓存、延迟日志 |
| **Tool Hook** | 每次工具执行时执行一次 | 人工审批、沙箱隔离、按工具日志 |
这个三层设计的精妙之处在于：**Generate 层处理对话级横切关注点，Model 层处理模型提供商级可靠性，Tool 层处理工具执行级安全和审计**。三层职责清晰分离，避免了单一职责膨胀。

## 预置中间件分析
### Retry — 瞬态故障弹性
使用指数退避 + jitter 自动重试 `RESOURCE_EXHAUSTED`、`UNAVAILABLE` 等瞬态错误。仅重试模型 API 调用，不重放整个 tool loop——这是一个关键的设计选择，避免了工具副作用被重复执行的风险。
**典型场景**：LLM API 提供商的速率限制（rate limit）恢复、区域级临时不可用。

### Fallback — 多模型韧性
在指定错误码触发时切换到备用模型，支持跨提供商（例如 Gemini → Claude）。这对生产级应用至关重要——单一模型依赖是可靠性单点故障。
**典型场景**：主模型配额超限、服务降级时的优雅切换。

### Tool Approval — 人工在环（Human-in-the-Loop）
通过 allow-list 限制工具执行，任何未授权工具触发中断（interrupt），等待人工确认后恢复。这为 Agentic 应用的破坏性操作提供了安全阀。
**典型场景**：删除文件、发送邮件、支付操作等高风险工具调用前的确认。

### Skills — 动态技能注入
扫描目录中的 `SKILL.md` 文件并注入系统 prompt，同时暴露 `use_skill` 工具供模型按需加载。这实现了**技能的热插拔**，无需重启应用即可更新模型行为。
**典型场景**：RAG 知识库补充、角色扮演（persona）切换、领域专业知识注入。

### Filesystem — 沙箱化文件系统访问
通过注入工具（`list_files`、`read_file`、`write_file`、`edit_file`）给予模型受限的文件系统访问，路径安全强制执行防止目录遍历（directory traversal）攻击。
**典型场景**：代码生成 Agent 的工作区隔离、文档处理应用。

## 深度分析
### 1. Middleware 组合顺序语义
Genkit 明确采用**从左到右的包装顺序**：第一个列出的 Middleware 是最外层包装，依次向内。示例代码中 `Retry` 包裹 `ContentFilter`，意味着重试逻辑会包含内容过滤的结果——如果内容过滤失败（forbidden term 被检测），重试会再次执行整个 `ContentFilter` 逻辑。
这种顺序语义在设计组合时需要仔细考虑：

- **幂等性**：如果中间件的操作是幂等的，顺序通常不重要
- **副作用**：如果中间件有非幂等副作用（如日志、审批），顺序会影响行为
- **错误传播**：内层中间件的错误会向外传播，外层可以决定是否重试

### 2. 与传统 Web Middleware 的范式对比
传统 Web 中间件（如 Express middleware）通常处理请求-响应周期，模式是线性的。Genkit middleware 运行在**迭代式的工具循环**中，复杂性在于：

- 同一 hook 可能在单个 `generate()` 调用中执行多次
- Generate hook 在每次迭代都执行，累积效果需要考虑状态管理
- Tool hook 的副作用可能导致状态变化，影响后续迭代

### 3. 中间件的跨语言一致性
Genkit middleware 在 TypeScript、Go、Dart 三种语言中的接口一致（Python 即将支持）。核心契约极简：提供一个 `name()` 和 `New()` 工厂函数，返回需要实现的 hooks。这降低了多语言项目的维护复杂度。

### 4. 与主流 Agent 框架的对比
| 特性 | Genkit Middleware | LangChain Agents | OpenAI Agent SDK |
|------|-------------------|------------------|------------------|
| 拦截层级 | Generate/Model/Tool 三层 | 主要是 Tool 层 | 类似 LangChain |
| 组合方式 | 显式顺序堆栈 | 链式调用 | 链式调用 |
| 预置中间件 | Retry/Fallback/Approval/Skills/Filesystem | 有限 | 极少 |
| 多语言支持 | TS/Go/Dart/Python | JS/Python | JS |

## 实践启示
### 1. 生产级应用的 Middleware 堆栈建议
典型的生产 Agentic 应用应考虑以下堆栈顺序（从外到内）：
```
[Retry (外层)] → [ToolApproval (人工审批)] → [ContentFilter (内容安全)] → [Model (核心逻辑)]
```

- **Retry 最外层**：最大化重试成功率，因为重试会包含所有内层逻辑
- **ToolApproval 次外层**：高风险操作前强制人工介入
- **ContentFilter 中间层**：在模型输出后、工具执行前拦截不合规内容
- **Model 最内层**：直接与模型提供商交互

### 2. 自定义 Middleware 设计原则
编写自定义中间件时应遵循：

- **单一职责**：每个中间件只解决一个横切关注点
- **幂等性优先**：尽量设计幂等的 hook，便于重试
- **错误明确化**：使用结构化错误信息，便于调试
- **状态隔离**：避免在 hook 中存储跨调用状态，使用外部存储

### 3. 调试与可观测性
Genkit Developer UI 提供了中间件执行的可视化追踪，这是开发和调试时的利器。在生产环境中，应考虑：

- 在 Model hook 中记录每次 API 调用的延迟和 token 消耗
- 在 Tool hook 中记录工具执行的输入输出（脱敏后）
- 使用分布式追踪（OpenTelemetry）聚合跨服务调用

### 4. 安全考量
ToolApproval 中间件是安全关键路径：

- **空 `AllowedTools` 列表** 意味着每个工具调用都会中断——适用于高安全场景
- `RestartWith()` 的 approval metadata 应加密存储，防止注入
- 考虑审批流程的审计日志保留策略

### 5. 性能影响
Middleware 链会增加每次调用的延迟：

- **零开销设计**：Genkit 的 hook 机制只在需要时调用对应接口
- **Lazy 初始化**：工厂函数在每次 `generate()` 调用时创建新实例，避免状态泄露
- 监控建议：在 Model hook 层面监控端到端延迟，区分模型 API 延迟和中间件开销

## 相关资源
## 相关实体
- [Announcing Genkit Middleware Intercept Extend And Harden Your Agentic Apps](ch04/502-agent.md)
- [Pi Mono](ch01/621-pi-mono-github.md)
- [Microsoft Agent Framework Structured Output](ch04/502-agent.md)
- [Agentscope Java Harness Framework Enterprise Distributed](ch04/502-agent.md)
- [Skillsui](ch03/095-skillsui.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/developers.googleblog-announcing-genkit-middleware-intercept-extend-and-harden-y.md)

## 标签
#genkit #middleware #agent-framework #reliability #go #typescript #dart #python

---

