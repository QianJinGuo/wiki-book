# 从 Claude Code 记忆系统看四层 Agent 记忆方案，一个比一个夯

## Ch01.608 从 Claude Code 记忆系统看四层 Agent 记忆方案，一个比一个夯

> 📊 Level ⭐⭐ | 7.5KB | `entities/从-claude-code-记忆系统看四层-agent-记忆方案一个比一个夯.md`

# 从 Claude Code 记忆系统看四层 Agent 记忆方案，一个比一个夯

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/从-claude-code-记忆系统看四层-agent-记忆方案一个比一个夯.md)

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

Summary Memory 的

---

