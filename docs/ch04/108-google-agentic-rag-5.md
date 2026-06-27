# Google Agentic RAG 跨语料库框架：充分上下文智能体 + 5 阶段管线

## Ch04.108 Google Agentic RAG 跨语料库框架：充分上下文智能体 + 5 阶段管线

> 📊 Level ⭐⭐ | 15.4KB | `entities/ai-cambrian-google-agentic-rag-sufficient-context-cross-corpus-20260606.md`

# Google Agentic RAG 跨语料库框架：充分上下文智能体 + 5 阶段管线

> 原文链接：[原文链接](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ai-cambrian-google-agentic-rag-sufficient-context-cross-corpus-20260606.md)

## 摘要

Google Research 与 Google Cloud 联合发布的 **Agentic RAG 框架**（已上线 Gemini Enterprise Agent Platform）把 RAG 从"搜一次 + 生成一次"重写为「充分上下文」（Sufficient Context）驱动的迭代检索流程。新增的核心是 **充分上下文智能体** —— 它在生成答案前判断信息是否足够，**不够就明确指出缺什么并继续找**，而不是给出半截答案或承认"没找到"。在 FramesQA 多跳推理基准上，跨语料库设置下达到 90.1% 准确率，比 Vanilla RAG 提升最高 34%。

## 核心要点

### 1. 现有 RAG 的根本缺陷：搜一次就停

传统 RAG 系统：
> 搜一次，生成一次，就算信息找不全也就这样了。

例：用户问"X 项目用的服务器配置是什么？"
- 系统能找到 X 项目的文档
- 但文档里只写了一个服务器 ID
- **它不会拿着这个 ID 再去另一个数据库搜配置**
- 最终结果要么是半截答案，要么直接说"没找到"

**问题不是信息不存在，是系统没有继续找的能力。**

### 2. 多智能体框架的五个角色

把 RAG 类比成一个研究部门而不是搜索引擎：

| 角色 | 职责 | 类比 |
|------|------|------|
| **编排器（Orchestrator）** | 收到复杂请求后判断不是一步能完成的任务，把工作分配给子智能体 | 部门负责人 |
| **规划智能体（Planner）** | 规划信息获取路径（如"先查财务库，再查项目日志"） | 研究主管 |
| **查询改写器（Query Rewriter）** | 把复杂问题拆成多个可检索的具体查询 | 拆题人 |
| **搜索扇出智能体（Search Fan-out）** | 把改写后的查询同时发给多个数据源 | 外勤研究员 |
| **大模型（LLM）** | 汇总所有上下文，生成最终答案 | 撰稿人 |

### 3. 充分上下文智能体（Sufficient Context Agent）：核心创新

这是谷歌这套框架最关键的部分，相当于流水线末端的 **质检员**。它做三件事：

**第一，审查片段。** 看 RAG 智能体从数据库拉回来的实际文本片段，里面有没有回答问题所需的内容。

**第二，生成草稿并比对。** 先生成草稿答案，然后对比「原始问题 + 草稿答案 + 检索到的片段」，判断是否有足够信息给出全面且可溯源的回答。

例：问题问了三件事（药物、饮食、过敏），但片段里只有两件事的信息 → 标记为「上下文不充分」。

**第三，精确指出缺什么。** 不只输出"信息不够"，而是生成具体的原因和反馈日志：

```
已找到：药物清单和低钠饮食说明。
缺失：关于住院期间过敏反应或不良事件的内容。
→ 已找到药物和饮食，但缺少过敏信息，请专门搜索"皮疹"或"不良事件"。
```

### 4. 5 阶段完整管线

用一个医疗场景 说明：

> 医生问："小李做完膝关节手术后的出院药物和饮食限制是什么？住院期间有没有过敏反应？除了肝素静脉滴注或 Tenecteplase 之外，不要包含仅在住院或急诊期间使用的药物。"

涉及三个数据源：药房、营养、临床记录。

| 阶段 | 动作 | 输出 |
|------|------|------|
| 1. 编排 | 根智能体解析请求，分配给子智能体；规划智能体确定三个检索方向；查询改写器拆成多个子问题 | 任务树 + 子查询列表 |
| 2. 搜索 | RAG 智能体同时检索所有子查询，找到药物清单和饮食信息，但临床记录里没找到过敏 | 部分信息 |
| 3. **充分上下文智能体** | 审查片段、生成草稿、判断上下文不充分、输出「缺过敏信息」的具体反馈 | 反馈日志 |
| 4. 迭代 | 查询改写器生成新搜索词"皮疹"，RAG 智能体重新检索之前忽略的文件 | 补充信息 |
| 5. 最终合成 | 充分上下文智能体再次检查，确认三项信息齐全，判定停止 | 完整答案 |

### 5. 实验结果：FramesQA 90.1%

FramesQA 基于 FRAMES 论文，专门测试多跳推理能力。

典型问题：
> 在收视最高的两个电视季终集中（截至 2024 年 6 月），哪个终集播出时间更长？长了多少？

需要多步：先找收视最高的两个终集（M\*A\*S\*H 和 Cheers）→ 分别查时长 → 计算差值。

多数 RAG 系统：找不到 M\*A\*S\*H 或 Cheers 的明确播出时长 → 答不出。

谷歌框架的答案：M\*A\*S\*H 终集时长 150 分钟，比 Cheers 终集（约 98 分钟）多 52 分钟。

**实验规模**：824 个查询，2676 份 PDF 文档。

**三个设置对比**：
- Vanilla RAG（Google RAG Engine + LLM 解析器 + 重排序器）
- 单语料库 Agentic RAG（只在 FramesQA 文档中检索）
- 跨语料库 Agentic RAG（在 FramesQA + 三个无关干扰数据集中检索，规划智能体自己判断去哪个库）

**结果**：
- 跨语料库设置下，系统在四个数据库中正确路由并回答了 **90.1%** 的问题
- 单库和跨库两个版本的延迟相差不超过 3%
- 比 Vanilla RAG 准确率提升最高达 **34%**

## 深度分析

### 1. "充分上下文"是 RAG 的范式转移

RAG 1.0（Vanilla）：检索 → 生成
RAG 2.0（Agentic）：检索 → 生成 → **审查 → 反馈 → 重检索**
RAG 3.0（Sufficient Context）：检索 → 生成 → 审查 → 反馈 → 重检索 → **再审查 → 停止条件**

范式转移的本质：
- **从"信源驱动"到"答案驱动"**：1.0 模式下系统看手里有什么就给什么，3.0 模式下系统看问题需要什么就给什么。
- **从"概率填空"到"可审计追溯"**：3.0 模式下每个判断都有具体反馈日志，答案可审计。
- **从"单轮检索"到"多轮对话"**：3.0 模式下系统可以连续多轮查询，每次聚焦于"还缺什么"。

### 2. 跨语料库检索的工程价值

跨语料库设置 的关键不是"搜得更多"，而是"在多个数据源中智能路由"。

现实企业场景里，数据通常分散在：
- 内部知识库（Confluence、Notion）
- 产品文档（PDF、Markdown）
- 工单系统（Jira、Zendesk）
- 代码仓库（GitHub）
- 数据库（PostgreSQL、MongoDB）

规划智能体需要根据问题类型决定先去哪个库 —— 这种"跨库路由"是 2026 年 RAG 工程化最难的部分。Google 的 90.1% 说明这种路由是可行的，且代价极小（延迟差 ≤ 3%）。

### 3. "Sufficient Context" 设计的精妙之处

充分上下文智能体 的输出格式很值得借鉴：

```
已找到：[已找到的内容列表]
缺失：[明确缺什么]
→ [具体改进指令]
```

这种"对比式"反馈比"score: 0.7"或"is_sufficient: false"更好用 —— 因为下游的查询改写器可以直接照着"缺失"和"改进指令"生成新查询。

工程上等于把"判断"和"决策"解耦 —— 充分上下文智能体只负责判断，决策权（要不要重检索、检索什么）留给查询改写器。

### 4. 与"循环 Agent"的本质区别

RAG 里的迭代 ≠ Agent 里的 ReAct 循环：
- **ReAct 循环**：模型自己决定下一步（思考 → 行动 → 观察）→ 灵活但难控制
- **充分上下文迭代**：由专门的"质检员"决定要不要继续 → 结构化、可审计

充分上下文管线的优势是 **可预测性** —— 每一步都是确定性的（要么通过、要么明确指出缺什么），不会出现"模型陷入死循环"的问题。这对企业级 RAG 部署是关键的工程属性。

## 实践启示

1. **RAG 系统卡在"答不全"时，加充分上下文智能体比加更多 chunk 有效**。90.1% 的提升不是来自检索质量提升，而是来自"知道什么时候信息不够、缺什么、去哪里找"的元能力。
2. **充分上下文的反馈格式要"对比式"**。"已找到 X、缺失 Y、建议搜 Z" 这种结构化反馈比 "is_sufficient: false" 强 10 倍 —— 下游可以直接消费。
3. **跨语料库路由是 2026 RAG 工程化的分水岭**。如果你的企业数据分散在多个系统，跨库路由能力直接决定 RAG 能不能上线。延迟代价 ≤ 3% 是个非常正面的信号 —— 不用为了性能放弃多库。
4. **可审计性 = 可部署性**。充分上下文智能体产生的反馈日志让 RAG 系统的每个答案都能溯源（用了哪些库、哪些片段、缺什么、为什么停止）。这是企业 RAG 准入的硬指标。
5. **RAG 的下一步不是"更大的模型"而是"更聪明的检查器"**。Vanilla RAG → Agentic RAG 的提升主要来自"判断 + 反馈 + 迭代"三件套，模型本身的提升反而是次要的。

## 相关实体

- [原文链接](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ai-cambrian-google-agentic-rag-sufficient-context-cross-corpus-20260606.md)
- [Agent 记忆系统的工程实践](https://github.com/QianJinGuo/wiki/blob/main/entities/存之有序治之有矩agent-记忆系统的工程实践与演进.md)
- [Karpathy: 从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/karpathy-最新访谈从-vibe-coding-到-agentic-engineering.md)
- [AgentOps: Amazon Bedrock 上的 Agent 运维](https://github.com/QianJinGuo/wiki/blob/main/entities/agentops-operationalize-agentic-ai-at-scale-with-amazon-bedr.md)
- 谷歌研究博客: https://research.google/blog/unlocking-dependable-responses-with-gemini-enterprise-agent-platforms-agentic-rag/
- Gemini Enterprise: https://docs.cloud.google.com/gemini-enterprise-agent-platform/build/rag-engine/cross-corpus-retrieval
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/mlops-training-inference.md)

---

