# Claude Code Agent Memory Systems — L0~L3 四层记忆方案

> 📊 Level ⭐⭐⭐ | 11.7KB

> 文章 "从 Claude Code 记忆系统看四层 Agent 记忆方案" (2026-07-07) 的实体整理。以 Claude Code 记忆体系为起点，系统拆解 Agent 记忆的 4 层演化方案。

## 核心演化逻辑

四层方案不是并列选项——它们是演化关系，每一层解决上一层解决不了的新问题：

```
L0 RAG          → "帮 Agent 找到相关的外部知识"
     ↓ 但 Agent 还需要记住对话过程本身
L1 Summary      → "把长对话压缩成摘要，节省上下文"
     ↓ 但压缩会丢细节，特别是限定词
L2 Reflection   → "不存原文，存对原文的判断"
     ↓ 但谁来管理记忆？外部系统总有判断盲区
L3 Cognitive    → "Agent 自己管自己的记忆"
```

核心变量只有一个：**谁来管理记忆？** L0: 检索算法 → L1: LLM（只做概括）→ L2: 外部记忆系统（LLM 提取 + 多通路检索）→ L3: Agent 自己（tool calling 主动读写）。

## 各层详解

### L0 RAG — 外部知识检索
- 只能检索"外部知识"（文档、代码、FAQ），无法处理对话状态和自我认知
- 语义相似 ≠ 因果相关 — 可能检索到无关内容
- Agent 记忆需要三种类型：外部知识 / 对话状态 / 自我认知，RAG 只能处理第一种

### L1 Summary — 对话压缩（LangGraph）
- LangGraph 双层架构：MemorySaver (short-term) + InMemoryStore/PostgresStore (long-term)
- **核心缺陷**：信息衰减不可逆 — CogCanvas 论文 (2026) 量化：exact-match recall 从 93.0% 暴跌到 19.0%（~74pp loss）
- 限定词丢失（"everywhere" → 风格偏好），且递归压缩会放大失真

### L2 Reflection — 判断型记忆（Mem0）
- 核心洞察：不必记住每句话，只需记住"这次对话改变了我对什么的判断"
- 源自 Reflexion 论文（Shinn et al., NeurIPS 2023）
- Mem0 三合一存储：向量库 + 知识图谱 + KV 存储（200K QPS per node）
- 多信号融合检索：0.5×时间衰减 + 0.3×语义相似度 + 0.2×关系密度
- Mem0 v2 基准：LoCoMo 71.4→91.6, LongMemEval 67.8→94.8
- **限制**：图存储仅在 Pro tier ($249/mo)；记忆提取依赖 LLM 判断，无反馈循环

### L3 Cognitive Memory — 自治记忆（Letta/MemGPT）
- Agent 通过 tool calling 自己判断什么值得记、什么时候记、什么时候忘了
- 核心理念：将 LLM 上下文窗口视为操作系统的虚拟内存
  - Core Memory = 常驻 RAM（Always in context）
  - Recall Memory = 磁盘缓存（可检索）
  - Archival Memory = 冷存储（向量库）
- **与 Mem0 的根本区别**：不是"外部系统提取→存储→检索"，而是 Agent 主动推理记忆
- **代价**：Letta 不是可插拔组件，需用完整平台；社区较小（22K stars）；仍偏学术研究

## 决策框架

### 四个升级信号
| L0→L1 | L1→L2 | L2→L3 |
|---|---|---|
| 用户抱怨"我问同一问题，它像第一次见我" | Agent 在限定条件上反复出错 | 你在写越来越多的记忆管理规则 |

### 当前推荐
对于大多数团队：**L0 RAG 起步，L2 Mem0 是当前性价比最均衡的选择**。L3 等 Letta 生态更成熟再评估。

## 与已有实体的关系

- Claude Code Memory Workbench + Agents SDK MCP — 同为 Claude Code 记忆相关，但本实体聚焦于四层记忆架构的横向对比和决策框架

## 相关链接

- [Agent 记忆架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-architecture.md)
- [Agent 记忆系统设计](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-system-design.md)

## 深度分析

### 一、四个物理介质对应四条不同的成本曲线

Claude Code 的记忆不是一个层，而是四个介质拼起来的。放回 L0~L3 看，被设计的不是"存什么"，而是"token 在哪个时刻被支付"。

- **会话上下文**：每轮全量重付，成本随 token 乘轮数增长，换零检索延迟与逐字保真，无跨会话能力。
- **摘要压缩**：写时付一次、此后少付，代价是不可逆的信息损失，且损失位置不可审计。
- **CLAUDE.md 与规则**：永远付、无论相不相关，固定开销换最高权威性，覆盖面由作者的事前想象力封顶。
- **Auto Memory 与检索库**：读时付，索引成本近似对数，但每次召回都在用相似度猜因果——RAG 返回的永远是被动文档，不是关于这个用户的动态事实。

硬推论：上下文窗口是唯一有硬上限的资源，任何 harness 迟早执行一次驱逐决策。Claude Code 选"压缩"而非"丢弃"，失效半径于是变成整个历史——exact-match recall 从 93.0% 掉到 19.0%，而你无法从摘要看出它删了哪句。容量是唯一必然发生的写入触发器。

### 二、晋升与降级：四种力逼出一次写入

1. **容量**（被动、必然）：接近上限即摘要，唯一不依赖判断的晋升，也是唯一静默丢信息的。
2. **重复纠正**（主动、按次计）：同一约束被纠正第二次才升 CLAUDE.md；判据是"下个会话还会不会出现"，不是"它是否正确"。
3. **跨会话复现**（被动、按频次计）：Auto Memory 沉淀的是反复出现的项目事实，不是单次对话里最响的那句。
4. **规则膨胀**（元信号）：你在写越来越多的记忆管理规则，说明人已经变成检索算法——L2→L3 唯一可靠的信号。参见 [Agent Harness 上下文管理工作集](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-context-management-working-set.md)。

降级实现差异很大：L2 里唯一量化的降权是 0.5 权重的时间衰减，重于语义相似度（0.3），即新鲜度压过相关性，过期但字面高度匹配的记忆排不进 top-k；L0/L1 几乎没有降权通道——检索算法没有"已过期"概念，摘要一旦生成不可回滚。

最容易被忽略的不对称是**晋升单向棘轮**：停在会话层时判断错了只丢一次，进 CLAUDE.md 后判断错了会在每次请求里被重新注入、重新加权。门槛因此应是"复发至少两次且可锚定到仓库状态"，而不是"看起来重要"。

### 三、五类失效模式

1. **陈旧记忆投毒**：仓库重命名或依赖升级后，旧规范仍在每个请求里注入。它先于检索结果进入注意力，且无法被相似度过滤——always-in-context 的条目没有"这条不适用"的通道，所以规则只会越加越长（参照 [CLAUDE.md 十二条规则](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-md-12-rules-mnilax.md)）。
2. **指令与事实的语法歧义**：CLAUDE.md 用同一文体同时承载"必须用 pnpm"（零可协商性）与"这个 repo 用 Postgres 14"（随时过期），同文件同优先级，模型只能靠语义猜哪条可被推翻——Letta 把 Core / Recall / Archival 三分，本质就是把这层歧义从存储结构上消掉。
3. **无界增长挤占注意力预算**：每加一条规则都是每请求成本，而注意力预算固定，边际规则挤掉核心规则；摘要侧对应的是递归压缩——在已失真的文本上再抽样，误差累积而非抵消。
4. **记忆与仓库状态矛盾**：记忆是快照，仓库是真相。冲突时模型倾向相信上下文里那段显式文本，于是"照着过期记忆改代码"，错误看起来像理解问题，实际是数据新鲜度问题。
5. **写入侧静默丢失**：L2 提取完全依赖 LLM 判断哪些事实"值得存"，判断错了就永久丢失且无反馈循环找回。写侧假阴性比检索未命中更难发现——检索失败至少有 query 与 top-k 可查，写入失败什么都没有。

### 四、权威性与覆盖面的守恒

四层各占一头，没有一层能同时拿满：CLAUDE.md / Core 权威最高（显式、无检索损耗、必然进上下文）但覆盖最窄；RAG / Recall / Archival 覆盖最广但权威最低（相似不等于相关，返回的是被动文档）；Summary 覆盖本会话全部、权威中等，限定词一压缩就从约束降格为偏好；Reflection 的权威由提取器判断质量决定，提取器一偏整层跟着偏。

守恒量是每轮进入上下文的 token 预算：四层只是把支付挪到写时、读时或永远，把判断权分别交给检索算法、LLM 概括器、外部提取器或 Agent 自己。

### 五、与其他 harness 的结构对照

- **文件基座（Claude Code）**：真相在磁盘，索引就是目录结构，可读改、可 diff。零基础设施，但没有相关性检索，覆盖面等于"被写进文件的那部分"。
- **外部记忆系统（Mem0）**：向量 embedding + 图谱关系 + KV 事实（200,000 QPS per node），排序靠 0.5 时间衰减 + 0.3 语义 + 0.2 关系密度；代价是多一跳外部服务，图存储锁在 $249/月 tier 后。脉络见 [Mem0 与 Agent Harness 记忆现状](https://github.com/QianJinGuo/wiki-public/blob/main/entities/state-of-memory-in-agent-harness-mem0-2026.md)。
- **操作系统式自治（Letta / MemGPT）**：Core 常驻、Recall 可检索、Archival 冷存，换页由 Agent 用 tool calling 决定，把"什么时候忘"变成可推理动作；代价是不可插拔，社区小一个量级（22K 对 48K stars）。

三者分歧不在存储而在"谁承担召回失败的责任"：文件基座交给人（没写就没有），向量基座交给 embedding（写了也可能召不回），L3 交给 Agent。可观测性随之不同——文件能 diff，向量只能看 top-k，Agent 只能看 tool trace。

## 实践启示

1. **按可协商性分区，不按主题分层。** 只有"不可协商"的条目（工具链约束、禁止操作）能进 always-in-context；事实类必须带 updated 时间戳并走检索；经验类必须带触发条件。每条记忆打 (类型, 作用域, 失效条件, 证据来源) 四元组，缺一项不许晋升。
2. **晋升门槛设为复发至少两次且可锚定。** 单次纠正留在会话层，第二次才写 CLAUDE.md，并写进可验证的锚（路径、命令、依赖版本）——晋升把"错了丢一次"变成"错了每轮注入"。
3. **失效用仓库状态校验，不用时间猜。** 启动时对文件基座的每条记忆跑轻量校验（路径存在、命令可执行、版本匹配），失败条目降权并在注入时标注"待确认"而非删除——保留"曾经如此"对诊断冲突有用。
4. **去重按结论折叠，不按文本追加。** 同一结论的多次观察折叠成一条并累加证据计数，否则 top-k 被其近似变体占满；Mem0 的权重结构（0.5 时间 / 0.3 语义 / 0.2 关系）意味着近似文本间排序差异本就窄，冗余条目边际收益近零。
5. **压缩必须显式保护限定词，并做回归抽检。** 在压缩 prompt 里点名保留 every / only / except 这类作用域词，再用固定的 exact-match 探针集抽查产物：93.0% → 19.0% 可直接当回归基线，跌破两成说明压缩策略已不可用。
6. **读写两侧分开评估。** 写侧测"该存的有没有存"：灌入已知关键事实看提取器漏掉哪些；读侧测"该给的有没有给"：LoCoMo（+20pts）与 LongMemEval（+27pts）分开看。长程集提升更大，说明跨会话边界才是主要失分点，评估预算按此比例投，口径见 [Agent 记忆评测全景](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-evaluation-landscape-taobao-survey.md)。

## 参考

→ [原文存档](https://mp.weixin.qq.com/s/ub1ZOzpjImpVc8plcsMA4w)

---

