# 如何构建生产准备的AI代理：MCP、CLI与技能——适合合适的工作的工具

## Ch07.052 如何构建生产准备的AI代理：MCP、CLI与技能——适合合适的工作的工具

> 📊 Level ⭐⭐ | 5.1KB | `entities/production-ai-agents-mcp-cli-skills-stack-ayi.md`

# 如何构建生产准备的AI代理：MCP、CLI与技能——适合合适的工作的工具

> **来源**：啊镒opc实验基地（2026-05-26）| 原文存档：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/production-ai-agents-mcp-cli-skills-stack-ayi.md)

## 深度分析

本文系统梳理了 2026 年 AI Agent 生产部署的连接技术栈：Skills（领域知识）、MCP（模型上下文协议）、CLI（命令行执行）。核心论点是三者不是互斥选择，而是互补层——顶级 Agent 使用所有三层。

### 连接技术栈三层模型

**Skill（领域知识）**：可重用的程序指令和 Markdown 文件，教导模型如何使用工具。可跨客户端移植，从本地目录或远程仓库加载。负责复杂任务的上下文和领域知识。

**CLI / 计算机使用（本地执行）**：Unix 风格连接，高 token 效率（每响应约 200 token），利用模型预训练知识（git、gh、curl 等）。通过包管理器安装标准二进制文件。

**MCP（连接组织）**：提供丰富语义、平台独立性和企业功能（OAuth、治理策略、审计追踪）。通过代码定义工具/资源/提示，JSON-RPC 2.0 over HTTP/SSE 通信。适合需要确定性、授权和平台独立的场景。

### MCP 的 Token 开销问题与解决

MCP 的主要缺点：简单实现中，提前加载所有工具模式可能消耗 44,000–55,000 token 上下文。

解决策略：
- **渐进式发现**（Progressive Discovery）：不将所有工具放入上下文窗口，将工具加载推迟到模型实际需要时。通过 `tool_search` 功能按需加载，可将上下文使用减少 5 倍。
- **Annotated Tool Definitions**：使用描述性函数名、参数名并标注参数描述，帮助 LLM 精确知道期望，减少推理失败。

### 程序化工具调用（代码模式）

传统顺序工具调用的问题：依赖每个协调步骤的推理延迟，效率低。

代码模式解决方案：为模型提供执行环境（V8 隔离或 Python 沙盒），让其编写脚本一次性编排多个工具，而非多次顺序调用。

### 2026 MCP 路线图

- **无状态传输**：Google 提出新型协议，简化 Kubernetes/Cloud Run 部署，TypeScript/Python SDK v2.0 将发布
- **跨应用访问**：MCP 服务器间单点登录（公司身份提供商），服务器发现通过 `.well-known/mcp-server-card/server.json` 自动进行
- **MCP 上的技能**：服务器附带工具使用领域知识，通过 `skills/list` 和 `skills/get` endpoints 交付

### 核心结论

没有统一解决方案。顶级 Agent 使用全部三层：
- Skill = 领域知识（复杂上下文）
- CLI = token 高效执行（预训练工具）
- MCP = 安全连接性（企业级治理）

MCP 放弃会引发：身份验证碎片化、无审计追踪、供应商锁定。对大规模企业环境，连接纽带对于治理和安全至关重要。

## 实践启示

1. **不要在 MCP vs CLI 之间选择，而是三层全用**：根据任务类型选择正确层——预训练工具用 CLI，复杂上下文用 Skill，企业级集成用 MCP。
2. **渐进式发现减少上下文消耗**：使用 `tool_search` 按需加载工具，而非预加载全部，可减少 5 倍上下文使用。
3. **Annotated 参数描述提升 MCP 工具调用成功率**：描述性函数名/参数名 + 类型标注，让 LLM 精确知道期望，减少推理失败。
4. **代码模式替代顺序工具调用**：为 Agent 提供沙盒环境写编排脚本，减少多次 LLM 调用的累积延迟。
5. **MCP 服务器设计原则**：停止 REST API 一对一映射；设计具有明确意图的工具，为编排提供沙盒，发布 UI 资源。
6. **关注 MCP 2026 路线图**：无状态传输、跨应用 SSO、技能端点——企业级 MCP 生态正在快速成熟。

## 相关实体
- [Cli Mcp Skill Architecture Decision Vibecoder](/ch07-030-cli-mcp-和-cli-skill-应该如何选/)
- [Tencent Skill Writing Complete Playbook Jackjchou](/ch04-118-鹅厂-skill-写作完整-playbook-14-章节-end-to-end-实战-工程化评估-腾讯一线踩坑/)
- [Baixing Ontoz Enterprise Ontology Multi Agent](/ch04-131-百型智能-ontoz-企业本体论-群智能体协同体系-出海企业数字大脑-palantir-中国类比/)
- [From Agent Protocol To Harness Skill](/ch04-351-from-agent-protocol-to-harness-skill/)
- [Anthropic 官方生产级 Agent 最佳实践12 个可复用的 Mcp 设计模式 V2](/ch07-060-anthropic-官方生产级-agent-最佳实践-12-个可复用的-mcp-设计模式/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/production-ai-agents-mcp-cli-skills-stack-ayi.md)
- Mcp Server Patterns

---

