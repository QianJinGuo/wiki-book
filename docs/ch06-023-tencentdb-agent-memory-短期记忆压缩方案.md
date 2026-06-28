## Ch06.023 TencentDB Agent Memory 短期记忆压缩方案

> 📊 Level ⭐⭐ | 6.2KB | `entities/tencentdb-agent-memory-short-term-compression.md`

## 核心方案

**短期记忆压缩 = 上下文卸载 + Mermaid 无限画布**

- **上下文卸载**：完整信息保留于外部文件系统，上下文只留摘要和索引
- **Mermaid 无限画布**：把任务执行过程转化为可导航的结构化记忆图

## 四层记忆折叠架构

| Level | 存储 | 内容 | 用途 |
|-------|------|------|------|
| 0 | refs/*.md | 完整 tool result | 原始证据 |
| 1 | offload-*.jsonl | 工具调用级 summary | 快速检索 |
| 2 | mmds/*.mmd | 任务节点级 summary | 任务进度导航 |
| 3 | history metadata | taskGoal、status、mmdFilePath | 上下文入口 |

## 核心实验结果

| 评测集 | 任务类型 | 成功率提升 | Token 节省 |
|--------|---------|-----------|-----------|
| SWEbench | 代码修复 | +9.93% | 33.09% |
| Toolathlon | 复杂长任务 | 20%→35% | 26.18% |
| WideSearch | 网页搜索 | +51.52% | 61.38% |
| AA-LCR | 长文总结 | +7.95% | 30.98% |

## 符号设计三原则

1. **通用知识**：符号必须是所有主流 LLM 都训练过的格式
2. **生成不能复杂**：生成端和理解端的语义要一致
3. **表达自由**：不被格式束缚，让模型灵活调整

## Mermaid vs StateDiagram

Flowchart 比 StateDiagram 在长任务场景效果好约 15%。StateDiagram 适合严格状态机（订单、审批），Flowchart 适合 Agent 探索式执行（并行分支、交叉引用）。

## 层次化注意力

1. **Overview**：任务级概览，判断方向
2. **Focus**：打开任务画布，看任务地图
3. **Detail**：需要时追溯 JSONL → refs

## 消融实验结论

- 仅上下文卸载：Token 节省 ~15%，成绩 +5%
- 完整方案：Token 节省 31-33%，成绩 +9.9%
- **MMD 解决的是"结构丢失"问题，不是"内容太长"问题**

## 核心判断

> 压缩不是让 Agent 少知道，而是让 Agent 少背负。信息可以离开上下文窗口，但不能离开 Agent 的可达范围。

## 深度分析

**从"上下文窗口焦虑"到"可达性设计"**

这套方案的本质突破，是把记忆管理的核心问题从"上下文窗口大小"重新定义为"信息可达性"。传统思路是扩大窗口或压缩内容，都停留在"塞进去"的逻辑里。而腾讯云的方案承认上下文窗口有限，转而设计一套让信息在窗口外仍然"活着"的系统——不是让信息变小，而是让信息搬家后还能找回来。

**四层折叠的递归压缩结构**

四层记忆折叠不是简单分级，而是一个递归压缩的信息管道：原始 tool result → 工具调用级摘要 → 任务节点级摘要 → 上下文元数据。每一层都比上一层更抽象，同时保留指向更底层的引用指针。这与人类工作记忆中的"组块化"机制类似：不是删除细节，而是把细节打包成更高层次的单元，同时保留解压路径。

**Mermaid 为什么有效：结构先于内容**

论文指出 Mermaid 解决的是"结构丢失"问题而非"内容太长"问题。这一区分至关重要。传统压缩研究专注于让同样的信息用更少的 token 表达（内容压缩），而腾讯云关注的是：当信息被压缩后，推理链路是否能保持完整（结构压缩）。Mermaid Flowchart 通过节点+边+引用路径，让 Agent 保留了"从哪里来、到哪里去"的导航能力，这是线性 summary 做不到的。

**符号设计三原则的本质**

三个原则的底层逻辑是：压缩符号必须让模型能从结构推理语义，而不是依赖记忆特定符号。INTJ 式的记忆压缩不稳定，因为模型可能没训练过这个符号；但 Mermaid 节点的结构（node_id + summary + result_ref）是自解释的，模型可以从关系推理出含义。这与"形式化知识表示"的思路一致：不是编码更多知识，而是让知识以模型能推理的方式被表达。

## 实践启示

**对 Agent 开发者的实操建议**

1. **优先实现上下文卸载**：在 Agent 设计初期就把完整工具结果写入外部存储，不要等到上下文吃紧再补救。上下文卸载可以带来 ~15% Token 节省和 +5% 任务成功率，性价比最高。

2. **选择 Flowchart 而非 StateDiagram**：对于非确定性、长周期、多分支的任务（编程、调研、创作），用 Flowchart 而非 StateDiagram。Flowchart 在长任务场景效果比 StateDiagram 高约 15%。

3. **设计节点引用路径**：每个 Mermaid 节点必须包含 node_id、summary、result_ref 三个字段，确保信息可定位、可恢复。这是实现"无限画布"的核心——不是窗口无限大，而是信息永不丢失。

4. **分层召回而非一次性加载**：实现 Overview → Focus → Detail 三层注意力机制，不要让 Agent 一次性加载所有历史。根据任务需要逐层展开，可以显著降低单次调用的 Token 消耗。

**什么时候用这套方案**

- 适用场景：SWEbench 类代码修复、ToolAtlas 类复杂长任务、WideSearch 类多轮搜索、AA-LCR 类长文总结
- 不适用场景：短任务（Token 节省效果不明显）、状态机驱动的确定性流程（StateDiagram 更适合）
- 核心判断：如果任务的执行路径高度动态、多分支、可能长时间挂起，这套方案收益明显；如果任务线性确定，传统上下文管理足够

## 关联阅读

## 相关实体
- [Agent Memory Architecture](ch04-146-how-ai-agent-memory-works.html)
- [Agent Memory Evaluation Landscape Taobao Survey](ch04-465-meet-customers-where-they-are-agentforce-contact-center-now.html)
- [Ai Agent Memory Systems](ch04-487-hidden-technical-debt-of-ai-systems-agent-harness.html)
- [Agent Memory Modular Framework](ch01-238-agent-memory-模块化框架与评测-memory-in-the-llm-era-4-模块-10-方案对比.html)
- [How Ai Agent Memory Works](ch04-145-how-ai-agent-memory-works.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/tencentdb-agent-memory-context-offloading.md)

---
