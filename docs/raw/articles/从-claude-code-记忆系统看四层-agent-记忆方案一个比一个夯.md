---
source: wechat
source_url: https://mp.weixin.qq.com/s/ub1ZOzpjImpVc8plcsMA4w
ingested: 2026-07-07
feed_name: 数据STUDIO
wechat_mp_fakeid: MP_WXS_3949259461
source_published: 2026-07-07
sha256: "7754dc813debeaabd4398bdd213121409fe8306d34c1d217cd7edf2cd83600db"
---


# 从 Claude Code 记忆系统看四层 Agent 记忆方案，一个比一个夯

我先给 Claude Code 一条明确约束：

> 这个项目只使用 PostgreSQL。后续涉及数据库选型、建表、部署或架构设计时，不要推荐 MySQL。

如果这条规则写进项目根目录的 `CLAUDE.md`，Claude Code 会在每次会话启动时加载它；即使长会话发生上下文压缩，这类项目级规则也会从磁盘重新注入。Claude Code 还有 Auto Memory，会自动沉淀一些它从项目、命令和用户纠正中学到的经验。

看起来，它已经解决了“Agent 不记得上一轮说过什么”的问题。

但实际使用中，问题并没有消失，只是换了一种形式。

例如，用户可能只是在一次普通对话里说过：

> 我只用 PostgreSQL，别给我推 MySQL。

第 1 轮，Claude Code 会回答：“好的，记住了。”

第 3 轮，让它基于 PostgreSQL 设计数据表，它通常也能正确执行。

但任务继续推进、文件内容和命令输出不断进入上下文、会话经历自动压缩，或者用户换到一个新会话后，这条只存在于聊天记录里的约束，未必还会出现在模型当前能看到的有效上下文中。

于是到了第 5 轮，用户换了一个看似无关的问题：

> 推荐一个云数据库。

Agent 可能又回到默认知识，给出：

> MySQL 配合 Redis 是一套成熟、稳定的方案。

这不一定是模型笨，也不代表 Claude Code 没有记忆。

更准确地说，Claude Code 的记忆体系主要由四部分组成：

  1. 当前会话的上下文历史；
  2. 长会话接近容量上限后的自动摘要压缩；
  3. 用户显式维护的 `CLAUDE.md`、规则文件与个人配置；
  4. Claude 自动沉淀的项目级 Auto Memory。

它们已经比简单的：
    
    
    chat_history.append(message)  
    

成熟得多。

但它们的核心仍然是：**在合适的时机，把规则、摘要和历史重新放回模型上下文。**

这与真正面向 Agent 的记忆系统，仍有一个关键差异：

> Claude Code 更擅长管理“项目上下文”；而复杂 Agent 系统还需要管理“可检索的事实、长期偏好、任务状态、经验沉淀、跨会话边界，以及什么时候应该遗忘”。

也就是说，Agent 记忆的难点从来不是“保存更多聊天记录”，而是四个更具体的问题：

  * 哪些信息应当永久保存，哪些只在当前任务有效；
  * 新任务到来时，应该检索哪些历史，而不是把全部历史塞回 Prompt；
  * 用户偏好、项目规范、工具经验与任务状态，是否应该放在同一个记忆层；
  * 当记忆彼此冲突、过期或不再适用时，系统如何更新、降权和遗忘。

本文将以 Claude Code 的 `CLAUDE.md`、Auto Memory 与上下文压缩机制为起点，结合 LangGraph、Mem0、Letta 的公开文档与架构设计，拆解 4 种 Agent 记忆方案：

  * 它们分别把什么当作“记忆”；
  * 各自解决了什么，又遗漏了什么；
  * Claude Code 的文件化记忆适合哪些工程场景；
  * 什么时候应从上下文与规则文件，升级到检索式、结构化、可治理的 Agent 记忆系统。

## 01从"检索"到"自治"的演化

这 4 种方案不是 4 个并列选项——它们是**演化关系** ，每一层解决上一层解决不了的新问题。
    
    
    L0 RAG          →  "帮 Agent 找到相关的外部知识"  
         ↓ 但 Agent 还需要记住对话过程本身  
    L1 Summary      →  "把长对话压缩成摘要，节省上下文"  
         ↓ 但压缩会丢细节，特别是限定词  
    L2 Reflection   →  "不存原文，存对原文的判断"  
         ↓ 但谁来管理记忆？外部系统总有判断盲区  
    L3 Cognitive    →  "Agent 自己管自己的记忆"  
    

核心变量只有一个：**谁来管理记忆？**

  * L0：检索算法
  * L1：LLM（只做"概括"这一种操作）
  * L2：外部记忆系统（LLM 提取 + 多通路检索）
  * L3：Agent 自己（通过 tool calling 主动读写记忆）

下面逐层拆解。

## 02L0 RAG：上下文塞的越多效果越差

多数人以为给 Agent 加记忆就是接一个向量数据库——把对话历史 embed 进去，下次对话时检索相关片段注入 Prompt。

这个方案的问题不新鲜：**语义相似 ≠ 因果相关** 。两个事实可能在向量空间中距离很近，但之间没有逻辑关系。

更深层的问题是：RAG 只能检索"外部知识"（文档、代码、FAQ），但 Agent 记忆至少需要三种完全不同的信息类型：

信息类型| 例子| RAG 能处理吗？  
---|---|---  
外部知识| "PostgreSQL 支持 JSONB"| ✅  
对话状态| "用户说了只用 PostgreSQL"| ❌  
自我认知| "上次推荐 MySQL 翻车了，因为没问清楚需求"| ❌  
  
RAG 查到的永远是被动的"相关文档"，不是"关于这个用户的动态事实"。

**代码示例** （基于 LangChain 官方 Quickstart 文档）：
    
    
    # 标准 RAG pipeline — 只能检索文档，不是 Agent 记忆  
    from langchain.embeddings import OpenAIEmbeddings  
    from langchain.vectorstores import Chroma  
      
    vectorstore = Chroma(embedding_function=OpenAIEmbeddings())  
    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})  
      
    # 用户问 → 向量检索 → 注入 Prompt  
    query = "推荐一个数据库"  
    docs = retriever.get_relevant_documents(query)  
    # → 返回 PostgreSQL 和 MySQL 的文档片段，但不知道用户偏好  
    

**RAG 能做到的上限** ：检索外部知识片段，注入当前 Prompt。

**RAG 解决不了的** ：跨对话维护用户偏好、理解因果链、从错误中学习。

如果 Agent 只需要"查文档"，RAG 够了。但如果需要"记住用户是谁"，就得往上一层。

## 03L1 Summary：压缩对话，然后丢了关键信息

Summary Memory 的逻辑很直观：对话太长 → 让 LLM 把旧消息压缩成一段摘要 → 旧消息被替换，摘要留在上下文里。

LangGraph 的做法是双层架构：

  * **Short-term Memory** ：`MemorySaver` checkpointer，按 `thread_id` 隔离会话，每个 super-step 自动存检查点
  * **Long-term Memory** ：`InMemoryStore`（或 PostgresStore），按 `user_id` 命名空间跨会话持久化

**代码示例** （基于 LangGraph 官方文档 Memory 章节）：
    
    
    from langgraph.checkpoint.memory import MemorySaver  
    from langgraph.store.memory import InMemoryStore  
      
    checkpointer = MemorySaver()  
    store = InMemoryStore()  
      
    # 短期：同一 thread 内自动加载历史  
    config = {"configurable": {"thread_id": "session-1", "user_id": "user-1"}}  
    graph.invoke({"messages": [HumanMessage("记住：我数据库只用 PostgreSQL")]}, config)  
      
    # 长期：跨 thread 持久化用户事实  
    namespace = ("memories", "user-1")  
    store.put(namespace, "db_preference", {"data": "PostgreSQL only"})  
    

**这套方案的核心缺陷不是实现复杂度，而是信息衰减。**

CogCanvas 论文（2026）给了一个精确的量化数据：Summary 方案下，exact-match recall 从 93.0% 暴跌到 **19.0%** 。一句话压缩后，"use type hints **everywhere** " 变成 "prefers type hints"——限定词 `everywhere` 丢了，实现要求变成了风格偏好。

而且这种衰减是**递归的** 。二次压缩压的是"摘要 + 新消息"，上一轮的失真会被放大。

**什么时候用 Summary** ：单次对话较长、需要维护叙事连贯性，但不需要精确逐字记忆。典型场景是客服对话摘要、会议记录。

**什么时候升级** ：当限定词丢失会导致错误决策时——比如 Agent 需要记住"只用 PostgreSQL"而不是"偏爱 PostgreSQL"。

## 04L2 Reflection：不存原文，存判断

Reflection Memory 的核心洞察：你不必记住每一句话，你只需要记住"这次对话改变了我对什么的判断"。

这来自 Reflexion 论文（Shinn et al., NeurIPS 2023）的启发——Agent 在失败后写一段文字反思，存入 episodic memory buffer，下次类似场景自动加载。HumanEval pass@1 从 80% 提升到 91%。

Mem0 把"反思记忆"做成了独立产品。它的架构不只是存反思文本，而是三合一存储 + 多信号融合检索：

**三层存储** ：

  * **向量库** ：存语义 embedding，负责"这句话跟什么相关"
  * **图谱** ：存实体和关系，"用户 A 偏好 PostgreSQL"是一个边
  * **KV 存储** ：快速查结构化事实，200,000 QPS per node

**多信号融合检索公式** （Mem0 v2，2026-04）：
    
    
    最终得分 = 0.5 × 时间衰减 + 0.3 × 语义相似度 + 0.2 × 关系密度  
    

**代码示例** （基于 Mem0 GitHub Quickstart 文档）：
    
    
    from mem0 import Memory  
      
    m = Memory()  
      
    # 写入：LLM 自动提取实体→分存三层  
    m.add("我只用 PostgreSQL，别推 MySQL", user_id="user-1")  
    # → 向量: embedding → 图谱: (user-1)--[prefers]-->(PostgreSQL)  
    # → KV: {"user-1": {"db_preference": "PostgreSQL"}}  
      
    # 检索：多通路并行 + 融合得分  
    memories = m.search("推荐一个数据库", user_id="user-1")  
    # → 返回排序后的相关记忆，带时间衰减权重  
    

Mem0 v2 的基准数据（官方自报）：LoCoMo 从 71.4 → 91.6（+20pts），LongMemEval 从 67.8 → 94.8（+27pts）。

**但是** ，Mem0 有一个关键限制：**图存储只在 Pro tier（$249/月）** 。免费版只有向量 + KV，图谱推理能力不可用。

**更根本的局限** ：记忆提取依赖 LLM 判断哪些事实"值得存"。判断错了，关键信息就永久丢失了。而且这个判断没有反馈循环——你不知道什么被漏掉了。

## 05L3 Cognitive Memory：让 Agent 管理自己的记忆

前三层有一个共同假设：**有一个外部系统在管理 Agent 的记忆** 。RAG 是检索算法，Summary 是 LLM 压缩器，Reflection 是 Mem0 的提取+存储管道。

Letta（原 MemGPT）的赌注不一样：**Agent 应该自己管理自己的记忆** 。

核心理念来自 UC Berkeley 的 MemGPT 论文——把 LLM 的上下文窗口当成操作系统的虚拟内存来管理。Core Memory 是常驻"RAM"（Always in context），Recall Memory 是"磁盘缓存"（可检索），Archival Memory 是"冷存储"（向量库）。

**代码示例** （基于 Letta 官方文档 REST API）：
    
    
    # Letta Agent 通过 tool calling 自己管理记忆  
    # Agent 决定"这值得记住"时，调 core_memory_append  
    # Agent 需要上下文时，调 archival_memory_search  
      
    # 创建带自管理记忆的 Agent  
    agent = client.create_agent(  
        name="db_advisor",  
        memory_blocks=[  
            {"label": "human", "value": "用户是 PostgreSQL 用户"},  
            {"label": "persona", "value": "我是数据库选型顾问"}  
        ]  
    )  
      
    # Agent 在对话中主动调 memory 工具：  
    # 1. 用户说"只用 PostgreSQL"  
    # → Agent 内部: core_memory_replace("human", "...数据库只用 PostgreSQL")  
    # 2. 用户问"推荐一个数据库"  
    # → Agent 内部: 先读 core_memory("human") → 看到偏好 → 只用 PostgreSQL 相关推荐  
    

**与 Mem0 的根本区别** ：不是"外部系统提取→存储→检索"，而是 Agent 通过 tool calling **自己判断什么值得记、什么时候记、什么时候忘了** 。记忆管理从"被动管道"变成了"主动推理任务"。

**代价** ：Letta 不是可插拔组件。你要用它的 Agent 运行时、REST API、ADE 调试界面。社区比 Mem0 小（22K vs 48K stars），Python-only SDK。而且 Cognitive Memory 仍偏学术研究——Letta 官方还没有发布 LongMemEval 分数。

## 06写在最后

你的 Agent 该用哪一层？

看完 4 种方案，最后一步是决策。下面的决策树帮你定位：

### 先问 3 个问题

  1. **你的 Agent 需要记住什么？**  外部文档 → L0 RAG 可能够了。用户偏好 / 对话状态 → 至少 L1。自己摸过的坑和纠正过的判断 → L2 起步。
  2. **记多久？**  一次对话内 → L1 Summary 够用。跨会话、跨周 → L2 Reflection 或 L3。
  3. **记了之后用来做什么？**  检索相关文档 → L0。维护叙事连贯性 → L1。改进未来决策 → L2。形成持续演进的自我模型 → L3。

### 四种方案一表对比

维度| L0 RAG| L1 Summary| L2 Reflection (Mem0)| L3 Cognitive (Letta)  
---|---|---|---|---  
记忆类型| 外部知识检索| 对话历史压缩| 判断型记忆| 自治记忆  
谁管理| 检索算法| LLM（只做概括）| 外部系统（多通路）| Agent 自己  
检索方式| 纯向量相似度| 摘要注入| 向量+关键词+图+时间衰减| Agent tool calling  
信息衰减| 无衰减（原文保留）| 衰减不可逆（~74pp loss）| LLM 判断误差| Agent 判断误差  
成本| 向量库| LLM 摘要 token| 免费版可用（图存储 $249/mo）| 完整平台（自部署或云）  
生产就绪| ✅| ✅| ⚠️ (v2 2026-04)| ⚠️ (学术→产品过渡)  
  
### 升级信号

从一层往上升的信号很具体：

  * **L0 → L1** ：用户开始抱怨"我问同一个问题，它像第一次见我"
  * **L1 → L2** ：Agent 在限定条件上反复出错（"我说了三遍只用 PostgreSQL"）
  * **L2 → L3** ：你发现自己在写越来越多的记忆管理规则——这些规则本身该让 Agent 学

对于大多数正在搭 Agent 的团队：**L0 RAG 起步，L2 Mem0 是当前性价比最均衡的选择** 。L3 等 Letta 生态更成熟再评估。

##### 参考资料

  * LangGraph Memory 文档 — docs.langchain.com
  * Mem0 GitHub (48K+ stars) — github.com/mem0ai/mem0
  * Letta / MemGPT (22K+ stars) — github.com/letta-ai/letta
  * CogCanvas 论文 — arXiv:2601.00821
  * Reflexion 论文 — Shinn et al., NeurIPS 2023
