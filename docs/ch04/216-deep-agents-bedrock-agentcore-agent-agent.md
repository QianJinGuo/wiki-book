# Deep Agents + Bedrock AgentCore：多 Agent 编排 + 隔离基础设施的端到端研究 Agent 实战

## Ch04.216 Deep Agents + Bedrock AgentCore：多 Agent 编排 + 隔离基础设施的端到端研究 Agent 实战

> 📊 Level ⭐⭐ | 11.0KB | `entities/deep-agents-bedrock-agentcore-subagent-orchestration-aws.md`

# Deep Agents + Bedrock AgentCore：多 Agent 编排 + 隔离基础设施的端到端研究 Agent 实战

> **Background**: 本文合成自 AWS ML Blog 2026-06-15 文章，作者 Sundar Raghavan（Sr Solutions Architect, Agentic AI Foundations）和 Saurav Das（AgentCore PM）。聚焦 LangChain Deep Agents 框架 + Amazon Bedrock AgentCore 基础设施的端到端集成，是"框架级 + 基础设施级"双层编排的最新官方参考实现。

## 核心模式

**两层分工**：

1. **编排层（Deep Agents）**：负责 subagent 生成、生命周期管理、消息路由
2. **基础设施层（AgentCore）**：负责每个 subagent 需要的隔离执行环境（Browser MicroVM、Code Interpreter、Memory、Runtime）

**关键收益**：coordinator 的 context window 不再被原始网页内容填满，每个 subagent 在自己的 MicroVM 中执行，**只返回简洁结构化结果**给 coordinator。

## 实战架构

### 五个核心组件

| 组件 | 角色 | AgentCore 服务 |
|------|------|---------------|
| Coordinator Agent | 高级推理 + 任务分发 | Deep Agents `create_deep_agent` |
| Research Subagent × 3 | 并发浏览竞品网站 | AgentCore **Browser MicroVM**（每会话独立 Chromium） |
| Analyst Subagent | 数据分析 + 图表生成 | AgentCore **Code Interpreter**（含 pandas/matplotlib） |
| Memory | 跨会话持久化洞察 | AgentCore **Memory** + extraction strategy |
| Observability | 链路追踪 + 评估 | AgentCore Observability / CloudWatch / LangSmith |

### 工作流（4 步）

```
用户查询
    ↓
[Coordinator] → 检查 AgentCore Memory 历史洞察
    ↓
[并行 × 3] → Browser Subagent 在各自 MicroVM 调研 3 个竞品
    ↓
[Analyst] → Code Interpreter 生成对比图 + Markdown 报告
    ↓
[Memory] → 关键洞察持久化到长期记忆
```

**运行时长**：4-6 分钟（含真实浏览器导航时间），**3x 快于串行**。

## 关键工程细节

### Browser MicroVM 隔离

每个 research subagent 创建独立 BrowserToolkit：
```python
for company_name, company_url in COMPETITORS:
    browser_toolkit, browser_tools = create_browser_toolkit(region="us-west-2")
    browser_toolkit.session_manager.session_wait_timeout = 60.0
    # 每个 MicroVM 独立 session_id、独立 Chromium 实例
```

**关键参数**：`session_wait_timeout = 60.0`（默认 10s，并发时不够用）

### Code Interpreter 隔离

```python
ci_toolkit, ci_tools = await create_code_interpreter_toolkit(region="us-west-2")
# 工具: execute_code, execute_command, write_files, read_files, install_packages
# 预装: pandas, matplotlib, numpy
# 运行时长: 最多 15 分钟
```

### Memory 配置

```python
@tool
def save_research_insights(insights: str, session_id: str = "default") -> str:
    memory_client.create_event(
        memory_id=memory_id, actor_id=actor_id, session_id=session_id,
        messages=[(f"Save these insights: {insights}", "USER"),
                  ("Insights saved.", "ASSISTANT")],
    )
```

**重要**：必须配置至少一个 extraction strategy（如 `semanticMemoryStrategy`），否则 `create_event` 只存原始事件、不提取洞察用于 recall。

### 模型无关

```python
# 切换模型只需一行 — AgentCore Browser/Interpreter/Memory 不变
from langchain_aws import ChatBedrockConverse
model = ChatBedrockConverse(model="us.anthropic.claude-sonnet-4-6", region_name="us-west-2")
# → 可换 Anthropic API / Google Gemini / OpenAI
```

## 三层可观测性

1. **CloudWatch GenAI Observability**：OTEL 格式 traces，coordinator → subagent → tool 三层 span
2. **AgentCore Evaluations**：内置 goal success rate + tool selection accuracy 评估器
3. **LangSmith**：3 个环境变量启用（`LANGCHAIN_TRACING_V2=true`）

## 部署到 Runtime

```bash
agentcore create      # 脚手架
agentcore deploy      # 部署
agentcore invoke      # 调用
agentcore logs        # 流式日志
agentcore traces      # 检查 traces
agentcore remove all  # 清理
```

Runtime 关键能力：
- ARM64 容器 + 每次会话独立 microVM
- 单会话最长 8 小时
- 稳定 invocation ARN

## 与已有实体的差异化

| 实体 | 关注点 | 本文差异 |
|------|--------|---------|
| [Agentcore Harness](ch04/652-agentcore-harness.html) | AgentCore 平台概念 + Harness 趋势 | 偏理论，无代码 |
| [Agentcore Managed Harness](ch04/222-agentcore-managed-harness.html) | 托管 Harness 平台 overview | 无具体 subagent 编排 |
| [Langchain Harrison Chase Sandbox Architecture](../ch05/086-ai.html) | LangChain 沙箱架构演进 | 聚焦 sandbox，不涉及 Bedrock AgentCore 集成 |
| [Production Harness 12 Components Framework Comparison](../ch05/035-harness-12.html) | 12 组件框架对比 | 偏理论框架，无 AWS 端到端代码 |

**本文独特价值**：是 **LangChain Deep Agents + Bedrock AgentCore** 这一特定组合的**官方端到端实现**（含完整 Python 代码、IAM 权限、4 步部署、cleanup 流程）。

## 深度分析

1. **双层编排的架构价值**：框架层（Deep Agents）和基础设施层（AgentCore）的职责分离是本文的核心设计模式[Multi Agent Orchestration](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-orchestration.md)。框架层负责 subagent 的生命周期管理、生成和消息路由，基础设施层提供隔离的 MicroVM 执行环境。这种分层使编排逻辑与执行环境可以独立演进——框架可以在不同后端 runtime 间迁移，而不必重写编排策略。

2. **Subagent 并发压缩时间的本质**：三个 research subagent 并行执行将端到端耗时从串行的 12-18 分钟压缩至 4-6 分钟（3x 提升）。这一收益的来源不是并发本身，而是 coordinator 只接收结构化摘要而非原始网页内容，从而保持 context window 高效利用[Harness Context Window Management](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-context-window-management.md)。如果 subagent 返回完整页面内容，coordinator 的 context window 会在并发时更快被填满，反而抵消并发收益。

3. **MicroVM 隔离是并发的物理基础[Multi Agent Context Isolation](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-context-isolation.md)**：每个 research subagent 在独立 MicroVM 中运行，拥有独立 Chromium 实例和独立 session_id。这不仅消除了并发 subagent 间的状态共享和互相干扰，还使调试可重复——每个 MicroVM 的状态是隔离的，不会因其他 subagent 的操作而改变。AgentCore Runtime 的 ARM64 容器架构进一步将这种隔离扩展到运行时长 8 小时的会话级别。

4. **Memory 的"主动提取"vs"原始存储"陷阱**：AgentCore Memory 必须配置至少一个 extraction strategy 才能实现真正的长期 recall。如果未配置，`create_event` 只存储原始事件，不提取可用于检索的洞察[Agent Memory Substrate Three Layer](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-substrate-three-layer.md)。这意味着 Memory 组件在未配置 extraction strategy 时形同虚设——看似存储了信息，实则无法在后续会话中被检索。这是该框架最容易被忽视的配置陷阱。

5. **框架无关 + 模型无关降低锁定风险**：AgentCore 工具集（Browser MicroVM、Code Interpreter、Memory）在不同模型间行为一致[Multi Agent Orchestration](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-orchestration.md)。切换模型只需替换一行 model 调用代码，AgentCore 工具保持不变。这种设计使团队在评估不同模型供应商时可以保持基础设施不变，降低了厂商锁定风险。

---

## 实践启示

1. **MicroVM 隔离是 subagent 并发的物理基础** — 没有隔离，并发 subagent 会共享状态、互相干扰
2. **Context window 不够时不要 prompt-chaining** — 用 subagent delegation + 简洁返回值
3. **Memory 必须是"主动提取"而非"原始存储"** — 没配 extraction strategy = Memory 形同虚设
4. **框架无关 + 模型无关的设计让迁移成本接近零** — 只需替换 model 调用一行
5. **可观测性必须从第一天就集成** — CloudWatch / LangSmith 三环境变量启动成本极低

## 上手资源

- **Notebook**：`https://github.com/langchain-ai/langchain-aws/blob/main/samples/agents/competitive_research_agent.ipynb`
- **Deep Agents CLI**：`deepagents --sandbox agentcore`（无需建完整 agent 即可试用 CodeInterpreter）
- **AgentCore CLI**：`https://github.com/aws/agentcore-cli/tree/main`
- **Part 2**：notebook 第二部分演示 AgentCore Runtime 部署

## 应用场景（作者建议）

- **尽调**：subagent 调研 SEC EDGAR、新闻稿、监管文件
- **内容创作**：research subagent 收集素材，writing subagent 起草
- **数据管道编排**：subagent 从不同源取数，analyst subagent 做 join/transform

→ 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/build-context-rich-research-agents-with-deep-agents-and-bedr.md)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/multi-agent-coordination.md)

---

