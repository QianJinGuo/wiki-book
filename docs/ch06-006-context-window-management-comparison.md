## Ch06.006 context window management comparison

> 📊 Level ⭐⭐ | 15.6KB | `entities/context-window-management-comparison.md`

# Context Window 管理框架深度对比：Pi、OpenClaw、Claude Code、Letta

## 摘要

本文是 Arize AI 联合创始人兼 CPO Aparna Dhinakaran 对四大主流 AI Agent 框架（Pi、OpenClaw、Claude Code、Letta）的上下文窗口管理策略进行的系统性技术对比。核心发现是：**四种框架在上下文管理上表现出惊人的设计收敛**，均采用文件硬上限 + offset/limit 分页 + 工具结果预算 + 子智能体隔离 + LLM 驱动压缩的组合方案。作者认为最理想的设计是让模型自主管理上下文预算，类比传统计算的内存管理系统——让程序只管运行，系统负责管理内存在正确的时间给正确的进程分配正确的工作集。

## 核心要点

- **四大框架的设计趋同**：硬上限、offset/limit 分页、工具结果限制、子智能体隔离、token 阈值触发的 LLM 压缩
- **三种文件读取策略**：harness 优先（Pi/OpenClaw）、双重门禁（Claude Code）、向量索引优先（Letta）
- **三种会话压缩策略**：直接总结（Pi）、分块淘汰+多轮合并（OpenClaw）、滑动窗口+LLM 自压缩（Claude Code）
- **子智能体隔离四模式**：进程隔离（Pi）、session fork（OpenClaw）、typed-agent fork（Claude Code）、主 loop 合并（Letta）
- **核心隐喻**：上下文管理正在成为 Agent 时代的「内存管理」，最好的设计是模型无需思考上下文限制

## 深度分析

### 文件读取管理：三种策略对比

当 Agent 需要读取可能超出上下文窗口的大文件时，每个框架都做出了不同的设计选择。

#### Pi（pi-mono）：harness 优先，强制截断 + 教育提示

Pi 对文件读取实施了硬性截断上限：**最多 2,000 行或 50KB，以先到者为准**。内容从文件头部开始保留，超出部分被直接丢弃。工具输出会附加明确的继续提示：

```
[Showing lines 1-2000 of 50000. Use offset=2001 to continue.]
```

Pi 的设计哲学是：**harness 先保护你，再教模型分页**。通过强制截断防止上下文污染，同时通过提示词引导模型学会使用 offset/limit 参数自行处理大文件。

#### OpenClaw：纵深防御，多层上限叠加

OpenClaw 在 Pi 的基础上叠加了第二层和第三层防护：

- **第一层**：继承 Pi 的 2K 行 / 50KB 截断
- **第二层（Bootstrap 上限）**：每个 bootstrap 文件最多 12,000 字符，总计最多 60,000 字符；超出时使用 75% 头部 / 25% 尾部切分
- **第三层（工具结果预算）**：工具结果最多 16,000 字符，或上下文窗口的 30%，取较小值；当尾部包含「重要」内容（错误关键词、JSON 右括号、summary 关键词）时，自动切换到头部+尾部模式

OpenClaw 的设计哲学是**纵深防御**：不依赖单一截断层，而是用多层预算叠加来应对不同类型的上下文压力。

#### Claude Code：双重门禁，可远程调参

Claude Code 采用了独特的双重门禁设计：

- **第一道门（读取前）**：通过 `stat` 系统调用检查 256KB 字节上限，超出则直接拒绝读取并返回错误，提示模型使用 offset/limit 或 grep
- **第二道门（读取后）**：输出按 token 计数，受 25,000 token 预算约束；默认只返回开头 2,000 行；任何超过 2,000 字符的单行都会被截断

Claude Code 的额外优化是**读取去重**：若模型在同一范围内重复读取同一文件且文件未被修改，则返回 stub 而非完整内容，避免重复 token 浪费上下文空间。

Claude Code 的设计哲学是**harness 优先，并且支持远程调参**——Anthropic 可以通过服务端 feature flag 动态调整所有截断参数，而无需修改客户端代码。

#### Letta：向量索引优先，颠覆性范式转换

Letta 采用了与其他三个框架完全不同的技术路线：**文件同时存在于原始文本和向量库中**，上下文窗口只显示一个受管理的视图，模型通过工具访问更多内容。

具体机制：

- 每个上传文件被解析、分块并嵌入向量数据库
- 当文件处于「打开」状态时，可见内容被截断到按文件计算的字符上限
- 字符上限随上下文窗口大小分档：8K → 5,000 字符；32K → 15,000；128K → 25,000；200K+ → 40,000
- 可同时打开的文件数量也受档位限制（小模型 3 个，超大模型最高 15 个）
- 超出限制时使用 **LRU（最近最少使用）策略** 驱逐文件

Letta 的设计哲学是**memory 优先**——文件不只存在于上下文窗口中，而是存在于一个分层的存储系统中，Agent 通过工具访问文件就像程序通过内存访问数据。

### 会话压缩：四种框架的 Compaction 策略

随着对话增长，上下文中的历史消息会消耗大量 token，每个框架都设计了不同的压缩策略。

#### Pi：经典 LLM 驱动总结

- **触发条件**：估算上下文 token 超过 `contextWindow - reserveTokens`（默认 reserve 16,384 tokens）
- **保留范围**：从对话末尾向前遍历，保留最近约 20,000 tokens 的消息
- **压缩方式**：更早的所有内容交给 LLM 总结，生成一条合成的 user message，前置到被保留的尾部之前
- **安全特性**：永远不会切出孤立的 tool-call 或 tool-result，保持配对完整

#### OpenClaw：分块淘汰 + 多轮合并 + 工具状态预flush

OpenClaw 在 Pi 的基础上增加了更复杂的压缩机制：

- **触发条件**：历史超过上下文窗口的 50%（`maxHistoryShare = 0.5`）
- **淘汰方式**：历史被切成 token 质量相等的块，最老的块被丢弃，其余保留；自动修复 tool-call/result 配对
- **压缩方式**：被丢弃内容经过分阶段多轮 LLM 总结，带 merge 步骤以减少信息损失
- **预flush 机制**：压缩前，静默的 agentic turn 让 Agent 把状态持久化到 memory 文件，在历史消失前完成关键信息存档
- **第二层**：对工具结果做非破坏性内存内剪枝（先 soft-trim，再 hard-clear），使用 5 分钟缓存 TTL

#### Claude Code：九段 Prompt + 查询前优化 + 兜底 Head-drop

Claude Code 的压缩策略最为复杂：

- **触发条件**：估算 token 超过有效上下文窗口减去 13,000-token buffer（约 167K tokens for 200K 上下文）
- **压缩方式**：完整对话发给模型，附带结构化的九段 prompt，引导模型系统性总结
- **恢复机制**：compaction 后，最近读取过的最多 5 个文件会被重新附加到上下文中
- **查询前优化**：每次模型调用前，超大工具结果被持久化到磁盘，替换为 2KB preview（每个工具 50,000 字符上限，每条消息聚合后 200,000 字符上限）
- **兜底机制**：如果 compaction 调用本身触发上下文限制，确定性的 head-drop 会移除最旧的 API-round groups

#### Letta：滑动窗口 + Self-compact + 两阶段兜底

Letta 采用了最激进的压缩策略：

- **触发条件**：上下文使用量超过上下文窗口的 90%
- **驱逐方式**：滑动窗口从 30% 的消息开始，每轮增加 10%，直到 token 使用量低于目标
- **Self-compact 模式**：使用 Agent 自己的模型来总结，不需要单独的 summarizer 成本
- **两阶段兜底**：首先把工具返回钳制到 5,000 字符并重试；如果仍然溢出，就对 transcript 做中间截断，保留 30% 头部和 30% 尾部

### 子智能体上下文管理：隔离策略四模式

当一个 Agent 需要派生子智能体完成特定任务时，如何管理父子之间的上下文共享是一个核心设计决策。

| 框架 | 子 Agent 隔离策略 | 上下文共享方式 |
|------|------------------|---------------|
| Pi | 每个任务启动新进程 | 只收到任务字符串作为唯一 user message，无父对话历史 |
| OpenClaw | 默认 fresh isolated sessions | fork 模式可复制父 transcript，仅适用于 same-agent spawns；workspace context 过滤到最小 allowlist |
| Claude Code | 默认 typed-agent 路径创建空白对话 | fork 路径传递完整父消息历史用于 prompt cache sharing；worker 工具按自己权限模式重建 |
| Letta | 普通工具执行时完全不 fork | 工具运行在主 agent loop 中；历史通过 conversation search 和 archival memory search 访问 |

四种模式代表了从「完全隔离」到「完全共享」的连续光谱：
- **Pi** 是最激进的隔离派：子 Agent 完全不知道父对话的存在
- **Letta** 是最激进的共享派：根本没有 fork 概念，所有工具在同一上下文中执行
- **OpenClaw 和 Claude Code** 处于中间，通过 fork 机制让调用者选择隔离程度

### 跨框架设计收敛分析

尽管四个框架独立开发，但它们在以下方面表现出了明显的设计收敛：

**共同采纳的模式（6 项）**：
1. 对文件读取设置硬上限
2. 支持 offset/limit 分页
3. 限制工具结果大小
4. 隔离子智能体会话
5. 由 token 阈值触发、LLM 驱动的 compaction
6. 估算上下文使用量并检测压力

**具体设计押韵（4 项）**：
- Pi 和 OpenClaw 都对文件读取做头部截断，并附加继续提示
- Claude Code 和 OpenClaw 都把超大的工具结果持久化到磁盘
- Pi、OpenClaw 和 Claude Code 都在 compaction 期间强制保持 tool-call/result 边界安全
- 三个支持把父 transcript fork 到子智能体（Letta 除外）

### Arize Alyx 的独立收敛

值得注意的是，Arize 自己的数据探索助手 Alyx（用于非代码编辑场景）也独立走到了同样的设计结论：

- 工具结果 10,000-token 预算
- 二分搜索找最大数据集切片
- 长 cell value 头尾截断 + back-reference
- 50,000 tokens 强制 checkpoint
- 压缩前状态 flush

这种跨框架、跨场景的独立收敛表明，**上下文管理的核心挑战和最优解法已经开始被行业清晰地识别出来**。

### 核心洞察：内存管理的类比

文章最后将上下文管理类比为传统计算的内存管理：

> 50 年计算机发展教会我们，最好的内存管理，是程序根本不用思考的那种。寄存器、缓存行、页表、交换空间。每一层都由系统管理，对上一层不可见。程序只管运行。

Agent harness 正在朝同一个方向移动。目标不是向模型展示一切，而是：
- **在正确的时间给它正确的工作集**
- **允许它动态决策，管理自己的上下文**
- **让上下文管理对上层应用不可见**

这是 Agent 系统从「手工调优」走向「系统化管理」的关键转折点。

## 实践启示

### 对 Agent 开发者的建议

1. **不要让模型自己管理上下文预算**：上下文管理是 harness 的职责，而非模型的认知负担；参考 Claude Code 的双重门禁设计，在读取前和读取后都设置检查点
2. **compaction 必须保持 tool-call/result 配对**：这是 Pi、OpenClaw、Claude Code 的共同选择——孤立的 tool-call 或 tool-result 会导致模型推理混乱
3. **查询前优化比 compaction 更重要**：在模型调用前持久化大结果比事后压缩更高效（Claude Code 的 50KB/200KB 上限值得参考）
4. **子智能体 fork 策略要可配置**：OpenClaw 和 Claude Code 的做法值得借鉴——提供「空白 fork」和「完整历史 fork」两种模式，让框架使用者根据场景选择

### 对工具构建者的建议

1. **offset/limit 是最小共识**：所有框架都支持，工具设计时必须兼容
2. **继续提示很重要**：Pi 的 `[Showing lines 1-2000 of 50000. Use offset=2001 to continue.]` 设计降低了模型的学习成本
3. **向量库 + 原始文本双存储**是长期方向：Letta 的方案代表了文件管理的未来，适合知识密集型 Agent

### 对 AI 产品设计者的建议

1. **compaction 的时机比方式更重要**：Claude Code 的 13,000-token buffer 是经过优化的经验值，可作为基准
2. **compaction 后要保留关键上下文**：Claude Code compaction 后重新附加最近 5 个文件、OpenClaw 的 pre-flush 机制都值得借鉴
3. **LRU 驱逐适合大多数场景**：Letta 的 LRU 策略简单高效，适合文件数量不固定的场景

## 相关实体

- [Pi (pi-mono) — harness 优先的经典设计代表，强制截断 + 教育提示](ch03-068-pi-mono-ai-agent-openclaw.html)
- OpenClaw — 纵深防御设计，多层上限叠加 + 分块淘汰压缩
- [Claude Code — 双重门禁 + 可远程调参 + 九段 prompt compaction](ch03-002-obsidian-claude-code.html)
- Letta — 向量索引优先，颠覆性的 memory-first 架构
- Arize Alyx — 独立收敛到相同设计的内部工具
- [Agent Runtime — 上下文管理是 Agent 运行时系统的核心子系统](ch04-060-fable-5-的信号-agent-开始拼-runtime-架构师若飞的-runtime-contract-工程化拆.html)
- [MOC](ch04-146-how-ai-agent-memory-works.html)

---
