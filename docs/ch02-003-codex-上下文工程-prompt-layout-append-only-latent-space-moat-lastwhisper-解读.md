## Ch02.003 Codex 上下文工程 — Prompt Layout + Append-only + Latent Space Moat（LastWhisper 解读）

> 📊 Level ⭐⭐ | 21.2KB | `entities/codex-context-engineering-lastwhisper-thinking-in-context.md`

# Codex 上下文工程 — Prompt Layout + Append-only + Latent Space Moat（LastWhisper 解读）

LastWhisper（北大计算机硕士）"Thinking in Context" 系列开篇，对 OpenAI 工程博客《Unrolling the Codex agent loop》的深度解读。聚焦**世界级 Coding Agent 中的前沿上下文工程实践**，提出两条核心观察：

1. **The Architecture of State** — 缓存友好 Prompt Layout + Append-only 状态管理
2. **The Latent Space Moat** — 应用层 vs 基础设施层压缩能力的不对称

- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/codex-context-engineering-lastwhisper-thinking-in-context.md)

## 深度分析

### 核心观点：确定性是性能的前提

Codex 的 Prompt Layout 设计揭示了一个反直觉但普适的工程真理：在 Prompt Caching 机制下，**缓存命中的关键不是内容质量，而是前缀稳定性**。变化频率最低的内容（System Message / Tools / Instructions）置顶，变化频率最高的内容（对话历史 / Tool Traces）置底——这个排序不是经验法则，而是由严格前缀匹配机制推导出的必然约束。OpenAI Codex 引入 MCP 时因工具枚举顺序不一致导致 cache miss，代价是完整重计算。这对所有依赖 Prompt Caching 的 Agent 系统都有警示意义：Context Engineering 的核心工程约束是**确定性排序**。

### 技术要点：Append-only 是 Event Sourcing 在 Agent 状态管理中的具体实现

"State is a projection of events" 这个命题在 Codex 中不是隐喻，而是工程实现。状态变化时追加新消息（而非原地修改）带来的两大收益：前缀不变 → 缓存命中；因果链保留 → 可推断意图。这与 [Claude Code Vs Codex Context Architecture 02](ch01-286-claude-code-vs-codex-上下文架构-五层压缩管道-vs-容器文件系统.html) 中描述的 Claude Code 激进 Context Editing 路线形成鲜明对比。两种流派并非优劣之分，而是不同工程约束下的取舍：Append-only 更保守、工程友好，适合需要稳定缓存的生产系统；Context Editing 更激进、Token 精简，但前缀破坏带来工程复杂度。

### 实践价值：压缩能力的不对称是结构性的，应用层应聚焦可控部分

应用层压缩（Semantic Compression）与基础设施层压缩之间存在结构性信息不对称：厂商可访问注意力分布、海量真实对话数据、专用 Fine-tuned 压缩模型，应用层无法复制这一优势。理解这一点后，[Anthropic Prompt Caching Claude Code](ch09-022-prompt-caching-工程实践-anthropic-claude-code-经验总结.html) 等应用层实践的价值在于：放弃追求"更好的压缩"，转而聚焦**缓存友好的 Prompt Layout + 显式的 Compress/Select 策略**，这是应用层真正能控制的部分。context-kit 开源工具正是这一哲学的教学实现。

### 深层博弈：Append-only 需要模型专门适配

LastWhisper 提出的两个方向值得深思：OpenAI 是否专门训练了模型适应 Append-only？相较 Claude Code 的 Context Editing，这种保守路线是否更有工程可维护性？前者指向模型定制成本，后者指向架构选择。如果 Append-only 需要专门模型训练才能避免上下文膨胀带来的性能衰退，那么这意味着**状态管理策略不是纯工程问题，还受模型训练目标约束**。

### 技术判断：Latent Compression 更可能是信息增强的 Semantic Compression

尽管"/responses/compact"端点使用"latent understanding"措辞，但向量表征与模型架构深度耦合使得纯 Latent Compression 的工程可行性存疑。更合理的推断是：厂商做的是 Semantic Compression，但拥有关键信息优势（注意力分布、真实数据、专用压缩模型）。这与 [Harness Engineering](ch05-010-harness-engineering-ai.html) 实践中"在不确定黑盒内部机制时，聚焦可控部分"的原则一致。

## 实践启示

1. **将 Prompt 排序视为工程约束而非实现细节**：在设计任何 Agent 上下文架构时，先确定变化频率梯度——低变化内容（System Prompt、工具定义）置顶，高变化内容（对话历史）置底。任何动态工具列表（如 MCP notifications/tools/list_changed）的处理都需要特别设计以保护前缀稳定。

2. **状态变化优先 Append-only 策略**：当 Agent 状态变化时（切换目录、审批模式、权限配置），追加新消息而非修改现有消息。这最大化 Prompt Cache 命中，同时保留完整因果链用于意图推断。结合 Agent Harness Context Management Working Set 中的工作集管理实践，Append-only 是生产级 Agent 状态管理的推荐方案。

3. **在工具枚举顺序上强制规范化**：MCP 工具列表、Function Calling 顺序必须硬编码到系统 Prompt 中，禁止动态排序。如果工具列表可能动态变化，必须设计独立的缓存分区策略，避免污染稳定的缓存前缀。

4. **用 context-kit 建立上下文工程直觉**：Compress/Select/Memory 三模块覆盖了应用层上下文管理的核心场景。在生产环境中，这些模块的简化版本（如基于 LLM 的语义压缩 + JIT 文件检索 + 文件系统卸载）可以实现"do the simplest thing that works"。

5. **警惕压缩能力的结构性不对称**：应用层压缩永远受限于信息劣势。不要过度投入"更智能的摘要算法"，而是将资源投入到缓存友好的架构设计和规范的 [Harness Engineering](ch05-010-harness-engineering-ai.html) 实践中——这些是真正可控且可累积的工程优势。

## 1. Architecture of State

### Prompt Layout — 缓存友好排序

Codex 的 Responses API 请求按 `input` 字段组装，原则：**变化频率最低置顶，最高置底**：

1. System Message / Tools / Instructions（稳定）
2. 对话历史 / Tool Traces（动态）

**核心机制**：Prompt Caching 要求**严格前缀匹配**。任何位置变动（哪怕调整两个 Tool Definition 顺序）都使后续所有 Token 缓存失效，触发完整重计算。

**工程教训**：Codex 早期引入 MCP 时未保证工具枚举顺序一致 → cache miss。`notifications/tools/list_changed` 中途响应同样破坏前缀。

**效果**：采样成本从理论二次增长降低为**近似线性**。

### Append-only — 不修改，只追加

当 Agent 状态变化（切换审批模式、切换工作目录），Codex **不修改**已发送消息，而是**追加新消息**：

- 工作目录变了 → 追加 `role=user` 消息 + 新 `<environment_context>`
- sandbox 配置变了 → 追加 `role=developer` 消息 + 新 `<permissions instructions>`

**类比**：DB migration — 不直接修改生产 Schema，而是追加 Migration 文件。**"State is a projection of events"**（Event Sourcing pattern）。

**收益**：

1. 前缀始终不变 → 最大化 Prompt Cache 命中
2. 因果链保留 — 切换目录"为了运行测试"是显式事件，可推断意图

**代价与取舍**：

- 上下文膨胀 → 冲突/噪声影响性能
- 保留因果链 vs 控制信噪比之间的张力
- LastWhisper 两个推测方向：(a) OpenAI 专门训练让模型适应 Append-only；(b) Append-only 是更传统保守模式，相较 Claude Code 激进的 Context Editing 更工程友好

**两种流派对比**：

| 流派 | 代表 | 核心动作 | 收益 | 代价 |
|---|---|---|---|---|
| **Append-only** | OpenAI Codex | 状态变化时追加 | 前缀稳定，缓存命中 | 上下文膨胀 |
| **Context Editing** | Anthropic Claude Code | 原地修改/剪枝 | Token 精简 | 前缀破坏，工程复杂 |

## 2. Latent Space Moat — 压缩能力的不对称

### 两种 `encrypted_content`

Codex 实际使用了 `encrypted_content` 字段，但承担**两种不同用途**：

| 用途 | 字段 | 含义 | 触发 |
|---|---|---|---|
| **推理链保护** | `type: "reasoning"` | 加密 o1/R1 思考过程 | API 协议要求 |
| **上下文压缩** | `type: "compaction"` | 厂商压缩策略载体 | 上下文达阈值调用 `/responses/compact` |

第一种不是压缩机制 — 是**隐私保护**载体，客户端只看到 `summary`，加密推理链原样回传供服务端恢复状态。

第二种才是真正压缩。原文："preserves the model's latent understanding of the original conversation"。

### Semantic vs. Latent Compression

**应用层 — Semantic Compression**：

- 应用开发者能实现的压缩 = **语义重构**（LLM 摘要）
- 始终是原始信息的有损投影
- 推理微观逻辑、注意力分布模式在文本摘要中不可避免丢弃
- 通用模型预训练目标并非上下文压缩
- Cognition AI（Devin）会 Fine-tune 专用压缩模型，但仍操作文本表征

**基础设施层 — Latent Compression（推测）**：

`/responses/compact` 端点未公开。一个自然推测：厂商在模型**隐空间**对高维向量做压缩：

- 文本是模型内部状态的**低维投影**
- 隐空间含更丰富信息结构
- 高维空间有损压缩上限更高

**但有重要工程问题**：

- 向量表征与模型架构深度耦合
- 隐空间维度/结构/语义取决于具体模型版本
- 模型升级 → 向量表征失效 → 需重新适配

**更可能的实现 — 有信息优势的 Semantic Compression**：

`/responses/compact` 本质上仍是 Semantic Compression，但厂商有应用开发者不具备的信息优势：

1. **模型内部状态访问** — 注意力分布、token 关注度用于指导压缩决策
2. **海量真实用户数据** — 优化压缩策略
3. **专用 Fine-tuned 压缩模型** — 训练数据规模和多样性远超应用层

## 3. context-kit 教学工具

LastWhisper 开源了 **context-kit**（教学原型），覆盖三大模块：

| 模块 | 实现 |
|---|---|
| **Compress** | `compress_by_rule`（对齐 Claude Context Editing API 结构化剪枝）+ `compress_by_model`（LLM 语义压缩） |
| **Select** | JIT Context 渐进式检索（`list_dir` → `grep` → `read_file`） |
| **Memory** | 上下文卸载到文件系统（Write 策略持久化） |

哲学：**Do the simplest thing that works!**

## 关键 takeaway

1. **确定性是性能的前提** — 缓存友好 = 前缀稳定 = 工程约束
2. **Append-only vs Context Editing** — 两种流派长期共存（Codex 偏前者，Claude Code 偏后者）
3. **能力不对称是结构性的** — 应用层做 Semantic Compression，基础设施层有信息优势的 Semantic Compression
4. **Codex 实测效果** — 采样成本从二次增长降低为近似线性
5. **State is a projection of events** — Event Sourcing pattern 在 Agent 状态管理中的应用

## 与既有相关实体的关系

| 实体 | 关系 | 区分 |
|---|---|---|
| `entities/claude-code-vs-codex-context-architecture-02` | Codex context 架构对比 | 5 层压缩管道 vs 容器文件系统；本篇聚焦 Codex 单边 + Append-only 核心 + Latent Moat |
| `entities/claude-code-context-engineering-anthropic-thariq` | Claude 上下文工程 | Anthropic 视角；本篇 OpenAI Codex 视角 |
| `entities/context-engineering-three-memory-paradigms` | 3 种 Memory 方案 | 评测对比；本篇工程实践 + 流派对比 |
| `entities/llm-observability-4-layer-model` | 4 层可观测性 | 偏运维；本篇偏架构 |

## 相关链接

- OpenAI: [Unrolling the Codex agent loop](https://openai.com)
- Anthropic: [Effective context engineering for AI agents](https://anthropic.com)
- LastWhisper 博客: Context Engineering，一篇就够了
- LastWhisper 博客: Just-in-Time Context，一篇就够了
- context-kit: GitHub Repository
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/codex-context-engineering-lastwhisper-thinking-in-context.md)

## 深度分析

### 核心观点：确定性是性能的前提

Codex 的 Prompt Layout 设计揭示了一个反直觉但普适的工程真理：在 Prompt Caching 机制下，**缓存命中的关键不是内容质量，而是前缀稳定性**。变化频率最低的内容（System Message / Tools / Instructions）置顶，变化频率最高的内容（对话历史 / Tool Traces）置底——这个排序不是经验法则，而是由严格前缀匹配机制推导出的必然约束。OpenAI Codex 引入 MCP 时因工具枚举顺序不一致导致 cache miss，代价是完整重计算。这对所有依赖 Prompt Caching 的 Agent 系统都有警示意义：Context Engineering 的核心工程约束是**确定性排序**。

### 技术要点：Append-only 是 Event Sourcing 在 Agent 状态管理中的具体实现

"State is a projection of events" 这个命题在 Codex 中不是隐喻，而是工程实现。状态变化时追加新消息（而非原地修改）带来的两大收益：前缀不变 → 缓存命中；因果链保留 → 可推断意图。这与 [Claude Code Vs Codex Context Architecture 02](ch01-286-claude-code-vs-codex-上下文架构-五层压缩管道-vs-容器文件系统.html) 中描述的 Claude Code 激进 Context Editing 路线形成鲜明对比。两种流派并非优劣之分，而是不同工程约束下的取舍：Append-only 更保守、工程友好，适合需要稳定缓存的生产系统；Context Editing 更激进、Token 精简，但前缀破坏带来工程复杂度。

### 实践价值：压缩能力的不对称是结构性的，应用层应聚焦可控部分

应用层压缩（Semantic Compression）与基础设施层压缩之间存在结构性信息不对称：厂商可访问注意力分布、海量真实对话数据、专用 Fine-tuned 压缩模型，应用层无法复制这一优势。理解这一点后，[Anthropic Prompt Caching Claude Code](ch09-022-prompt-caching-工程实践-anthropic-claude-code-经验总结.html) 等应用层实践的价值在于：放弃追求"更好的压缩"，转而聚焦**缓存友好的 Prompt Layout + 显式的 Compress/Select 策略**，这是应用层真正能控制的部分。context-kit 开源工具正是这一哲学的教学实现。

### 深层博弈：Append-only 需要模型专门适配

LastWhisper 提出的两个方向值得深思：OpenAI 是否专门训练了模型适应 Append-only？相较 Claude Code 的 Context Editing，这种保守路线是否更有工程可维护性？前者指向模型定制成本，后者指向架构选择。如果 Append-only 需要专门模型训练才能避免上下文膨胀带来的性能衰退，那么这意味着**状态管理策略不是纯工程问题，还受模型训练目标约束**。

### 技术判断：Latent Compression 更可能是信息增强的 Semantic Compression

尽管"/responses/compact"端点使用"latent understanding"措辞，但向量表征与模型架构深度耦合使得纯 Latent Compression 的工程可行性存疑。更合理的推断是：厂商做的是 Semantic Compression，但拥有关键信息优势（注意力分布、真实数据、专用压缩模型）。这与 [Harness Engineering](ch05-010-harness-engineering-ai.html) 实践中"在不确定黑盒内部机制时，聚焦可控部分"的原则一致。

## 实践启示

1. **将 Prompt 排序视为工程约束而非实现细节**：在设计任何 Agent 上下文架构时，先确定变化频率梯度——低变化内容（System Prompt、工具定义）置顶，高变化内容（对话历史）置底。任何动态工具列表（如 MCP notifications/tools/list_changed）的处理都需要特别设计以保护前缀稳定。

2. **状态变化优先 Append-only 策略**：当 Agent 状态变化时（切换目录、审批模式、权限配置），追加新消息而非修改现有消息。这最大化 Prompt Cache 命中，同时保留完整因果链用于意图推断。结合 Agent Harness Context Management Working Set 中的工作集管理实践，Append-only 是生产级 Agent 状态管理的推荐方案。

3. **在工具枚举顺序上强制规范化**：MCP 工具列表、Function Calling 顺序必须硬编码到系统 Prompt 中，禁止动态排序。如果工具列表可能动态变化，必须设计独立的缓存分区策略，避免污染稳定的缓存前缀。

4. **用 context-kit 建立上下文工程直觉**：Compress/Select/Memory 三模块覆盖了应用层上下文管理的核心场景。在生产环境中，这些模块的简化版本（如基于 LLM 的语义压缩 + JIT 文件检索 + 文件系统卸载）可以实现"do the simplest thing that works"。

5. **警惕压缩能力的结构性不对称**：应用层压缩永远受限于信息劣势。不要过度投入"更智能的摘要算法"，而是将资源投入到缓存友好的架构设计和规范的 [Harness Engineering](ch05-010-harness-engineering-ai.html) 实践中——这些是真正可控且可累积的工程优势。
## 相关实体

- [反向审计 prompt 范式 — 从 vb 50 行 codex 自我蒸馏到 5 行核心](ch01-508-gpt-5-4-codex-评测-interconnects-的-agent-使用体验.html)
- MOC

---
