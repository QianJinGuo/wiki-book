# State of Memory in Agent Harness — mem0 视角的九大 harness 横评

## Ch04.131 State of Memory in Agent Harness — mem0 视角的九大 harness 横评

> 📊 Level ⭐⭐ | 13.7KB | `entities/state-of-memory-in-agent-harness-mem0-2026.md`

# State of Memory in Agent Harness — mem0 视角的九大 harness 横评

> 出处: [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/state-of-memory-in-agent-harness-mem0-2026.md) · 作者 mem0 · 2026-06-11
> 原帖: x.com/mem0ai/status/2061822612398014782

## TL;DR

mem0 团队系统横评了 9 个主流 [agent harness](/ch05-041-harness-engineering-概念框架/) 的 memory 机制（Claude Code、Anthropic Managed Agents、OpenAI Codex、GitHub Copilot、OpenClaw、`Hermes Agent`、AWS Bedrock AgentCore、Windsurf、Devin），得出三个结论：（1）memory 已经是 harness 的核心能力；（2）大多数实现停留在"本地、有限、关键词式、难共享"阶段；（3）这些限制本质上是 **harness boundary 的限制**，因此 mem0 把自己定位为 cross-harness 的基础设施层。

## Memory 三层分类法

文章先建立分析框架：把 memory 按"**存在哪里**"而非"**存什么**"划三层，因为失败模式不同。

| 层 | 载体 | 边界 | Production 现状 (2026) |
|----|------|------|------------------------|
| Working memory | 上下文窗口 | session 结束即重置 | 普遍存在，瓶颈是压缩策略 |
| External memory | vector store / graph / 文件 | 跨 session 持久化 | **几乎所有 production memory** |
| Parametric memory | 训练写入 weights | 全局通用 | 基本无 production 部署 |

这套划分与 `agent memory architecture essence` 中"存什么"的认知科学三分法（semantic / episodic / procedural）正交：前者是物理位置，后者是内容类型。

## 九大 Harness 横评

### 设计模式对照表

| Harness | 写入策略 | 检索方式 | 独特机制 | 主要短板 |
|---------|---------|---------|----------|---------|
| Claude Code | Auto-extraction agent 写笔记 | 小模型按**文件名**选文件 | CLAUDE.md + 自动笔记双线 | 非语义、静默截断 |
| Anthropic Managed | Append-only event log | workspace 共享 store | 历史可审计、多 agent 共享 | 偏 workspace、容量小 (8×100KB) |
| OpenAI Codex | LLM 自主写 markdown | **substring grep** | summary 优先读 | grep-only、token budget 静默截断 |
| GitHub Copilot | 结构化 memory 项 | **Just-in-time citation verification** | **28 天自动过期**（staleness 机制最强） | — (作者最推崇) |
| OpenClaw | 上下文满时触发 LLM 决定写什么 | embedding + hybrid retrieval | SQLite + embedding 完整栈 | 写入质量强依赖单轮 LLM 判断 |
| **Hermes Agent** | working/skills/session 三层各自写入 | FTS5 + 可接 Mem0 | **skills 沉淀 procedural memory** | 默认无 semantic retrieval |
| AWS Bedrock AgentCore | 三种异步提取 (facts/preferences/narrative) | — | **INVALID 标记保留 lineage** | AWS 锁定、公开分数一般 |
| Windsurf | Cascade 生成 | workspace-scoped | 记 codebase 模式与约定 | 跨项目/跨设备弱 |
| Devin | **人工审核后写入** | — | Knowledge + DeepWiki 双库 | 门槛高、没人审则不沉淀 |

### 几个真正的亮点

GitHub Copilot 的 **just-in-time citation verification + 28 天 staleness** 是文章里被点名"目前最强的过时处理方案之一，而且有真实 A/B 结果"。这与 `Hermes Agent` 自己的 memory 体系形成对比 — Hermes 靠 skills 层做 procedural 沉淀，但 staleness 处理依然偏弱（与作者列出的"共同短板"一致）。

AWS Bedrock AgentCore 的 **INVALID 标记 + lineage 保留** 是另一个被点名的工程优点：变更事实不是物理删除，而是状态翻转，可以追溯历史。

Devin 的 **人工审核制 Knowledge** 是质量光谱的另一极：质量上限高，但依赖人工运营，"没人审，很多东西就不会沉淀下来"。

## Benchmark 批判

文章对现有 memory benchmark 给出了相当直接的判断：大多不好。它们多数在测"能不能回忆过去对话里的事实"，已经接近饱和，而且**高分不等于能做出更好的决策**。

| Benchmark | 问题 / 评价 |
|-----------|------------|
| LoCoMo | 仅 10 段对话不稳定、很多题不需要 memory、adversarial 题与目标太像 |
| LongMemEval | 覆盖广（extraction / multi-session / temporal / updates / abstention），但仍偏 recall |
| MemoryArena, Anatomy of Agentic Memory | 把问题说更清楚：**真正该测的是 memory 能不能指导行动** |
| BEAM | **少数在 10M+ token 规模上设计的** benchmark（其它多卡在 1.5M） |

这一段与 `agent memory evaluation landscape` 中"benchmark 偏 recall"的判断完全一致，可视为 mem0 角度的第二信源验证。

## 共同短板与 harness boundary 论点

把九家拉通看，作者总结出五个共同短板：
- 存储 **bounded 且 local**
- 检索大多是 **keyword 式**
- memory 常常**只属于某个 harness**（不跨 agent）
- staleness 处理弱
- isolation 不够（cross-user contamination 风险）

> "这些限制，本质上是 **harness boundary** 的限制。"

这是 mem0 论证的关键转折：单个 harness 内部再怎么优化 memory，都受限于 harness 的边界 — 数据不出 harness、格式不互通、生命周期跟 harness 走。这与 `harness 的持续性 vs 侵蚀` 中讨论的 harness 锁定问题是同一个论域。

## 研究层未解决的三个坑

外部 memory 并没有把问题"解决"，只是把它**从 weights 挪到了检索层**。

1. **稳定性 vs 可塑性**：catastrophic forgetting 在外部 memory 层仍未消除
2. **选择性遗忘**：删过时事实同时保住结构，依然难
3. **安全性**：memory 是新的攻击面（cross-user contamination, poisoning）

## Mem0 的定位

Mem0 把 memory 做成 **基础设施层**而非 harness 内部功能。混合架构：
- vector store → semantic retrieval
- knowledge graph → relational reasoning
- key-value → 元数据与快速访问

**v3 算法（2026 年 4 月）方向**：single-pass ADD-only extraction、multi-signal retrieval、vector store 内的 entity linking。目标是 **portable + semantically searchable + cross-agent + production token volume**。

## 价值与局限

这篇文章在已有大量 `harness engineering` 文献中的独特价值：
- **横评最广**：现有横评（如 `Claude Code vs OpenClaw`、`Hermes vs OpenClaw`）通常只对比 2–3 家；这篇拉通了 9 家
- **来自 mem0 视角**：作者本身在做跨 harness memory 层，对"共同短板"的归纳带有实践基础
- **benchmark 部分干货足**：明确点出 BEAM 是少数 10M+ token 规模 benchmark，这是其它综述较少强调的

局限性：
- mem0 是利益相关方，论证倾向"单 harness memory 注定有限 → 需要 mem0 这样的基础设施"，结论可能被立场影响
- 九家细节都偏简略，深度细节需对照单独条目（如 `Hermes`、`OpenClaw`、`AgentCore`）

## 深度分析

**一、harness boundary 是 memory 系统的根本限制**。九大 harness 共同面临的五个短板（bounded local 存储、keyword 式检索、memory 不跨 harness、staleness 处理弱、isolation 不够），本质上都来自"数据不出 harness"这个边界约束。这不是任何一家公司工程能力不足的问题，而是单 harness 架构的固有局限。跨 harness 的 memory layer 之所以难，不是因为技术复杂，而是因为行业没有动力去标准化。

**二、现有 memory benchmark 偏重 recall 而非 decision quality，是系统性偏差**。LoCoMo 只有 10 段对话、很多题不需要 memory；LongMemEval 覆盖 extraction/multi-session/temporal，但仍然偏 recall。真正该测的是"memory 能不能指导更好的行动"，而不仅仅是"能不能回忆起事实"。BEAM 是少数在 10M+ token 规模上设计的 benchmark，这才是 production agents 的真实量级。

**三、Parametric memory 是 memory 架构中被忽视的"第三层"**。Working memory 和 external memory 都在讨论，但 parametric memory（通过训练更新 weights 里的知识）基本没有 production 部署。外部 memory 实际上只是把问题从 weights 挪到了检索层——catastrophic forgetting 的挑战并没有被消解，只是在不同层次之间转移了。

**四、GitHub Copilot 的 staleness 处理代表当前最强工程实践**。28 天自动过期 + just-in-time citation verification（有真实 A/B 结果支撑）是目前唯一被明确验证过的过时处理方案。这说明 memory 的"新"和"旧"不能只靠时间判断，还需要验证"引用的上下文是否还成立"——这对代码类 memory 尤其重要。

**五、Mem0 的跨 harness 定位是务实的，但壁垒是生态而非技术**。Mem0 把 memory 做成 portable + semantically searchable + cross-agent + production token volume 的基础设施层，逻辑上优雅。但这个定位要求所有 harness 都开放接口——这是行业协调问题，不是技术问题。Mem0 的成功不取决于它自己有多强，而取决于有多少 harness 愿意接入。

## 实践启示

1. **用"存在哪里"的三层分类法评估 memory 架构**：Working memory（上下文窗口，会话结束即重置）、External memory（vector store/graph/文件，跨 session 持久化，是 2026 年 production 的主力）、Parametric memory（训练进 weights，基本无 production 部署）。先搞清楚需求属于哪层，再选对应技术方案。

2. **设计 memory benchmark 时，测 decision quality 而非 recall**：传统 recall benchmark 已经接近饱和，真正有价值的评估维度是"有了这段 memory，agent 的最终决策/输出是否更好"。参考 BEAM 的 10M+ token 规模设计，这是 production agents 的真实工作负载。

3. **staleness 处理在系统设计之初就要考虑**：不能靠简单的 TTL 过期。GitHub Copilot 的 just-in-time citation verification + 28 天 staleness 是目前最强方案；AWS Bedrock AgentCore 的 INVALID 标记 + lineage 保留是另一个值得参考的工程实践。设计 memory 系统时，问自己：如果记忆所依赖的上下文变了，系统能感知到吗？

4. **memory 安全是一等公民**：cross-user contamination 和 poisoning 风险是真实存在的攻击面。在设计 memory 系统时，isolation 机制要从一开始就作为核心需求来考虑，而不是后期打补丁。

5. **如果选 Mem0 这类跨 harness 基础设施，先评估生态接入成本**：Mem0 的方案逻辑上完整，但实际价值取决于有多少 harness 愿意开放接口。在选型时，不仅看技术指标，还要看目标 harness 是否已经支持或计划支持 Mem0 的接入协议。

## 相关页面

- `Agent Memory Architecture Essence` — memory 本质（存什么 vs 存哪里）
- `Agent Memory Architecture Ruofei` — 若飞视角的 memory 架构
- `Hermes Agent Memory System` — Hermes memory 系统深度
- `Claude Code 7 Layer Memory Architecture` — Claude Code memory 七层
- `Harness Engineering Framework` — harness engineering 总览
- `Agent Memory Evaluation Landscape Taobao Survey` — memory benchmark 综述（淘宝视角）
- `Harness Engineering Future Persistence Vs Erosion` — harness boundary 与持续性
## 相关实体

- [self-harness：上海ai lab 提出的 agent 自我改进 harness 范式](/ch04-049-self-harness-上海ai-lab-提出的-agent-自我改进-harness-范式/)

---

