# Agent Reliability: Context Drift & Tool Calling Hallucination

## Ch04.159 Agent Reliability: Context Drift & Tool Calling Hallucination

> 📊 Level ⭐⭐ | 12.4KB | `entities/agent-reliability-context-drift-tool-hallucination.md`

## 核心问题
Agent 运行多轮后可靠性的两个核心问题：
1. **上下文漂移**（Context Drift）：Agent 执行方向偏离原始目标
2. **工具调用幻觉**（Tool Calling Hallucination）：Agent 调错/调了不存在的/不需要的工具
---

## 一、上下文漂移
### 根因：注意力机制
| 机制 | 描述 |
|------|------|
| **近因效应** | Self-Attention 权重非均匀分配，越近的 Token 权重越高；原始指令在最前，中间大量中间结果，注意力被"稀释" |
| **中间结果抢焦点** | 每步输出追加上下文，成为新刺激信号；上下文越长干扰越多 |
| **Lost in Middle** | Transformer 论文结论：中间信息最容易被忽略；原始指令恰好在"中间"甚至"开头" |
**本质**：原始目标在注意力分配中逐渐失焦。

### 三种漂移模式
| 模式 | 描述 |
|------|------|
| **目标漂移** | 任务 A → 任务 B，原始目标被完全替代 |
| **优先级漂移** | 主次倒置，支线占用大量步骤 |
| **风格漂移** | 目标/优先级不变，但输出格式/风格变化（最隐蔽） |

### 检测信号
- 当前动作与原始目标的关联度
- 步骤重复率
- 目标完成进度

### 解法分层
| 层次 | 方案 | 适用场景 |
|------|------|---------|
| **第一层** | 任务分解 + 子目标检查点 | 大部分场景 |
| **第二层** | 上下文压缩 | 长任务 |
| **第三层** | 定期 Re-Planning | 超长任务 |
---

## 二、工具调用幻觉
### 根因：概率生成
**核心**：模型选工具不是查表，是**根据上下文预测下一个最可能出现的工具名**。

- 工具描述模糊 → 多个工具看起来都可能对 → 靠概率选 → 选错就是幻觉
- 参数类型没约束 → 模型按"感觉"填值 → 格式/类型全错
- 模型被训练得"太积极" → 不需要工具时也硬调
**本质**：概率生成遇到了结构性约束不足。

### 三种幻觉类型
| 类型 | 现象 | 根因 |
|------|------|------|
| **Type 1** | 调了不存在的工具（search_api 但只有 search_database） | 工具描述和任务描述之间存在"语义缝隙"，模型"编"了一个合理的工具名 |
| **Type 2** | 参数类型或格式错误（limit: "十个"，应为 integer） | 参数约束未明确声明，模型按自然语言习惯生成 |
| **Type 3** | 无意义调用（闲聊却去搜天气） | 模型"工具使用倾向"过强，训练数据中调用工具有更高奖励信号 |

### 对应解法
| 类型 | 解法 |
|------|------|
| **Type 1** | 工具描述结构化 + Few-shot 示例 + 调用前校验工具名在注册列表 |
| **Type 2** | JSON Schema 参数约束 + 结构化输出能力 |
| **Type 3** | 显式"无需工具"选项 + 调用必要性判断 + 频率阈值 |

### 三段式校验
```
调用前 → 校验工具名、Schema、必要性
调用中 → 超时/异常捕获 + 结构化错误信息
调用后 → 返回格式校验 + 异常重试(2-3次) → 降级处理
```
---

## 与 vault 知识关联
- [Agent Harness 架构](ch03/044-agent.md) — Context Manager 处理上下文；工具调用校验是 Harness 层的职责
- [Ralph Loop + Harness Takeover](ch03/044-agent.md) — 长周期 Agent 的可靠性机制，与本文上下文漂移问题高度相关
- [Multi-Agent Systems](https://github.com/QianJinGuo/wiki/blob/main/concepts/multi-agent-systems.md) — 多 Agent 协作中，每个 Agent 的上下文漂移问题会叠加放大
- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/kamacoder-agent-context-drift-tool-hallucination.md)

## 相关实体
- [阿里云 EventHouse 企业级 Agent 上下文供给体系](ch03/044-agent.md)
- [Agent 上下文管理工程模式收敛 — 多框架代码级横向对比](ch03/044-agent.md)
- [Agent Harness 上下文管理：工作集视角](ch03/044-agent.md)
- [AI tool poisoning exposes a major flaw in enterprise agent security](ch04/150-ai.md)
- [CLI、MCP、API 选型：Agent 接入层决策指南](ch03/044-agent.md)
- [AI tool poisoning exposes a major flaw in enterprise agent security | VentureBeat](ch04/150-ai.md)
- [Martin Fowler AI 研发 Harness：非确定性承重层](ch04/150-ai.md)
- [Harness Engineering：让 Coding Agent 可靠完成长程任务](ch03/044-agent.md)
- [Harness Engineering: 让 Coding Agent 可靠完成长程任务](ch09/043-coding-agent.md)
- [长周期 Agent 详解：从 Ralph Loop 到可接管 Harness](ch03/044-agent.md)
- [Harness Design Peer Review Framework](https://github.com/QianJinGuo/wiki/blob/main/queries/harness-peer-review-framework.md)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](ch01/378-claude-code-harness-deep-understanding.md)
- [两万字详解Claude Code源码核心机制](ch03/074-claude-code.md)
- [Agent 自我改进的六条路](ch03/044-agent.md)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](ch04/123-karpathy-vibe-coding-agentic-engineering.md)
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](ch03/044-agent.md)
- [Harness如何支撑Agent在生产环境稳定运行？](ch03/044-agent.md)
- [Agent架构关键变化：Harness正在成为新后端](ch03/044-agent.md)
- [你不知道的 Agent 原理架构与工程实践](ch04/304-agent-principle-architecture-engineering-practice.md)
- [AI Coding Agent 记忆系统](ch04/150-ai.md)
- [柚漫剧 AI 全流程提效拆解](ch04/150-ai.md)
- [Agent Skill 设计模式](ch04/245-skill.md)
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [Coding Harness 工程本质](https://github.com/QianJinGuo/wiki/blob/main/concepts/coding-harness-engineering.md)
- [Thin Harness Fat Skills](ch04/245-skill.md)
- [Design Patterns for AI Agents 2026](ch04/150-ai.md)

## 深度分析
### 上下文漂移的注意力机制深层根因
上下文漂移的根本原因在于 Transformer 的 Self-Attention 机制设计特性。
**近因效应的量化表现**：当上下文长度超过 512 token 时，初始指令的注意力权重可降至 0.1 以下。这意味着 Agent 在第 10 轮对话时，几乎"看不见"最初的指令。
**中间 token 的竞争劣势**：每一个新生成的 token 都会成为后续 attention 计算的 Query，所有历史 token 都是 Key/Value。越新的 token 在 Q-K 匹配中占据优势，历史信息被系统性稀释。
**Lost in Middle 的双向影响**：Transformer 论文的 Lost in Middle 现象表明，中间位置的 token 容易被忽略。但对于多轮 Agent，初始指令还面临"开头"位置的问题——当上下文足够长时，最早的 token 实际落在了"中间"而非"开头"。

### 工具调用幻觉的概率生成本质
工具调用幻觉区别于普通幻觉的根本在于：它发生在结构化约束域内，而非开放域文本生成。
**工具选择是条件概率而非检索**：模型在生成 action 时，做的是 P(tool_name|context)，而非 lookup(context.tool_name)。这意味着工具选择本质上是一个语言建模任务，而非数据库查询。
**语义缝隙是幻觉的主要制造者**：当工具描述（description）与任务描述之间存在语义距离，模型会通过语言模型的补全能力"填补"这个缝隙——即幻觉出一个看起来合理的工具名。
**训练信号扭曲工具使用倾向**：RLHF 阶段中，调用工具的对话往往获得更高的奖励信号（因为看起来"更有行动力"），导致模型在不应该调用工具时也会硬调。

### Context Drift 与 Tool Hallucination 的耦合效应
两个问题并非独立存在，而是相互加强：上下文漂移导致 Agent 对原始目标的注意力下降，使其更容易选错工具；而工具调用失败产生的大量错误信息又加速上下文膨胀，进一步加剧漂移。
---

## 实践启示
### 工程层面：上下文漂移的防御体系
**第一层：任务结构化设计（推荐指数：★★★★★）**

- 在 Agent 执行前，将任务拆解为有限步骤的子目标链
- 每个子目标设置检查点（checkpoint），检查点处强制校验：当前状态是否仍指向原始目标
- 适用场景：大部分有明确流程的任务
**第二层：上下文压缩（推荐指数：★★★★☆）**

- 当上下文 token 超过阈值（如 2K），触发压缩
- 压缩策略：保留原始目标 + 最近 3-5 轮关键结果 + 当前状态摘要
- 适用场景：单轮任务内多步骤分析
**第三层：定期 Re-Planning（推荐指数：★★★☆☆）**

- 每执行 K 步，将当前状态 + 原始目标发给模型，让其判断并输出调整后的下一步计划
- 代价：额外 LLM 调用延迟 1-3 秒，成本增加约 15-20%
- 适用场景：长周期任务（>30 步）

### 工程层面：工具调用幻觉的校验体系
**三段式校验（强制实施）**：
```
调用前：

  - 校验工具名在注册列表中（白名单机制）
  - 校验参数符合 JSON Schema（类型、枚举、格式）
  - 判断调用必要性（显式 "NO_OP" 选项）
调用中：

  - 超时设定（建议 30s）
  - 异常捕获不暴露原始错误，转为结构化错误码
调用后：

  - 返回格式校验（不符合 Schema 则触发重试）
  - 重试上限 2-3 次，超限则降级
```

### Agent Harness 层的职责整合
根据 Agent Harness 架构设计理念，Context Manager 应承担上下文压缩和漂移检测职责；工具调用校验是 Harness 层的核心功能，需在 Agent 执行循环之前拦截幻觉调用。

### 面试回答框架
核心论点：上下文漂移和工具调用幻觉都是概率生成模型的固有特性，前者源于注意力分配机制，后者源于概率采样与结构化约束的冲突。
回答结构：
1. 上下文漂移 → 注意力稀释 → 分层解法（分解+压缩+Re-Planning）
2. 工具调用幻觉 → 概率生成 → 分型解法（结构化描述+Schema约束+必要性判断）
3. 共同本质 → 工程约束兜底而非模型本身解决

---

