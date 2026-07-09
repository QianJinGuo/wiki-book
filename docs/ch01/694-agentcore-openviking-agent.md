# 如何利用 AgentCore + OpenViking 快速搭建具备高效记忆的 Agent

## Ch01.694 如何利用 AgentCore + OpenViking 快速搭建具备高效记忆的 Agent

> 📊 Level ⭐⭐ | 6.6KB | `entities/如何利用-agentcore-openviking-快速搭建具备高效记忆的-agent.md`

# 如何利用 AgentCore + OpenViking 快速搭建具备高效记忆的 Agent

> 本文来源：AWS China Blog

## 摘要

本文来自 AWS 官方博客，详细介绍了如何利用 AWS Bedrock AgentCore 结合开源上下文数据库 OpenViking 快速搭建具备高效记忆的 Agent。方案覆盖 Agent 记忆系统的选型分析、两种集成架构（Token 效率优先 vs Agent 自进化优先），并提供了完整的核心代码实现。Agent 记忆系统的核心挑战是：在有限的 Context 窗口中注入最相关的历史信息，以最小 Token 成本获得最高的任务执行成功率。

## 核心要点

1. **记忆是 Agent 从"工具"变为"伙伴"的关键基础设施**：没有记忆的 Agent 每次对话都从零开始，用户反复自我介绍、需求重复，Agent 也无法积累经验变好。

2. **双方案架构**：(1) Token 效率方案——AgentCore Runtime + 纯 OpenViking 记忆，节省约 77% Token；(2) Agent 进化方案——AgentCore 短期记忆 + OpenViking 长期记忆，兼顾可靠性与自进化。

3. **OpenViking 的 8 类记忆结构**：4 类用户记忆（身份/偏好/人-项目-组织/决策里程碑）+ 4 类 Agent 记忆（问题解法/可复用模式/工具使用经验/工作流策略）。

4. **渐进加载机制**：检索 30 条候选记忆 → 高分读全文注入 Context，超限只给 URI → LLM 按需深读，Token 注入量精确可控。

5. **Agent 自进化**：从交互中学习——过去的问题解法积累为 tools 记忆，用户偏好积累为 patterns 记忆，Agent 越用越好。

## 深度分析

### 1. Agent 记忆系统的核心矛盾与解决思路

Agent 记忆面临三个核心挑战：**上下文窗口有限**（200K tokens ≈ 15 万字也经不起超长交互）、**LLM 调用无状态**（上次对话不会自动带入下次）、**Token 成本随历史线性增长**（50 轮对话 ≈ 10,000 tokens）。传统方案将所有历史原文塞入 Context，既浪费 Token，又因注意力衰减降低推理质量。

OpenViking 的渐进加载机制提供了优雅解决：高分记忆读全文、低分记忆只给 URI（type="link"），LLM 在需要时通过工具调用深读。这与 [Agent 记忆模块化框架](../ch04/121-agent-memory.html) 的理念一致——在有限的 Context 预算下做最优信息分配。

### 2. AgentCore Memory 与 OpenViking 的设计哲学差异

| 维度 | AgentCore Memory | OpenViking |
|------|-----------------|------------|
| 定位 | 全托管记忆服务，零运维 | 自包含上下文数据库，可离线 |
| 短期记忆 | Events（原文存储，时间序列） | Session 目录 |
| 长期分类 | 4 Strategy（面向用户） | 8 类（4 用户 + 4 Agent） |
| Token 控制 | top_k 按条数 | max_chars 按字符 + 渐进加载 |
| Agent 自进化 | 需自定义 Strategy 实现 | 内置 tools/skills/patterns/cases |
| 部署要求 | 需要 AWS 账号 | 可完全离线/本地（搭配 Ollama） |

AgentCore 适合快速 PoC 和生产级多租户 SaaS，OpenViking 在 Token 效率和离线场景有优势。两者可以互补：AgentCore 短期记忆提供确定性的对话回放，OpenViking 长期记忆提供语义检索的 Agent 经验积累。

### 3. 两种集成方案的适用场景

**方案一（Token 效率）**：AgentCore 仅提供 Runtime，不启用 Memory。短期用进程内 buffer 保持最近 N 轮，长期用 OpenViking 语义检索 + 渐进加载。50 轮对话从 10,000 tokens 降至 ~2,300 tokens（节省 77%）。适用于长对话、成本敏感、偏离线场景。

**方案二（Agent 进化）**：AgentCore 提供短期 Events（原文即时持久化，毫秒级响应，零 LLM 开销），OpenViking 提供长期 8 类记忆提取。Agent 从交互中持续学习——第一周用户问"怎么用 boto3 查 S3 对象"，Agent 回答后 OpenViking 提取到 tools 类记忆；第二周类似问题直接使用，无需重新查文档。

### 4. 记忆系统选型的四个决策维度

1. **运维能力**：有运维团队 → OpenViking Server；希望零运维 → AgentCore Memory
2. **Token 敏感度**：长对话、成本敏感 → 方案一（纯 OpenViking）
3. **Agent 进化需求**：需要 Agent"越用越好" → 方案二（混合架构）
4. **合规与离线**：数据不出设备 → OpenViking + Ollama

## 实践启示

1. **优先实现记忆系统**：在构建 Agent 应用时，记忆系统应作为基础设施优先考虑——比增加更多工具调用能力更能提升用户体验。

2. **渐进加载优于全量加载**：OpenViking 的渐进加载模式（先摘要后全文）应成为 Agent 记忆检索的默认设计模式，大幅降低 Token 成本。

3. **短期记忆用确定性存储，长期记忆用语义检索**：AgentCore Events 确保对话原文不丢失（确定性强），OpenViking 提供语义检索（灵活度高）——两套系统覆盖不同需求。

4. **Agent 自进化从第一天开始设计**：方案二的 commit 机制让 Agent 在使用中自动积累经验——无论是工具调用模式、用户偏好还是知识库——越用越好。

5. **8 类记忆分类是很好的参考框架**：无论是自建还是使用 OpenViking，将记忆按"用户记忆（身份/偏好/关系/事件）+ Agent 记忆（案例/模式/工具/技能）"分类，有助于精细控制不同记忆的注入优先级。

## 相关实体

- [AI Agent 记忆系统](../ch04/121-agent-memory.html)
- [Hermes Agent 记忆系统](../ch03/090-hermes-agent.html)
- [Agent 记忆模块化框架](../ch04/121-agent-memory.html)
- [Agent 记忆架构](../ch04/121-agent-memory.html)
- [Amazon Bedrock AgentCore MCP 扩展](../ch04/512-amazon-bedrock-agentcore.html)
- [Agent 记忆架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-architecture.md)
- [AI Agent 记忆类型](https://github.com/QianJinGuo/wiki/blob/main/concepts/ai-agent-memory-types.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/如何利用-agentcore-openviking-快速搭建具备高效记忆的-agent.md)

---

