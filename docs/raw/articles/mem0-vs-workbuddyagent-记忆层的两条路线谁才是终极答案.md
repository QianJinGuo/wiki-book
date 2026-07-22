---
title: "Mem0 vs WorkBuddy：Agent 记忆层的两条路线，谁才是终极答案？"
source: wechat
source_url: "https://mp.weixin.qq.com/s/CyZv5BQyW3SSVIJ1U8Ba9A"
ingested: 2026-07-08
type: raw
vxc: 56
tags: [raw]
sha256: "ea488becd0b52865612a1e14c7adebe57c6b4fc2c4f1e3d19cfa59e878bfa4b3"
---

# Mem0 vs WorkBuddy：Agent 记忆层的两条路线，谁才是终极答案？

大模型本身是无状态的，一次请求结束后，模型不会记住你是谁，刚刚做过什么，如果想让模型知道之前发生了什么，我们不得不把历史消息丢给大模型，让大模型看到之前的消息，这个也只能解决短期的上下文消息，不能解决Agent的长期协作问题。

一个好用的Agent，不能每次都问用户喜欢什么，它需要记住用户的偏好，记住用户的历史决策以及相关任务状态，并且在未来合适的时候，能够把这些消息找回来，再次丢给大模型，让模型可以在当前事件上做出正确的决策。

这个就是Agent记忆层的，它不是简单的记录了聊天的历史信息，需要把历史交互压缩成可检索，可追述，可演化的长期上下文。

之前我们在开发Agent时候，一般都是自己写代码来做记忆层，包括长期记忆和短期记忆。今天我们来学习一款开源的Agent记忆框架Mem0，看看他的实现方式是什么，是不是可以直接拿到我们的Agent中使用，有没有我们可以借鉴的方法。

## Agent 如何接入 Mem0

github地址 :https://github.com/mem0ai/mem0

有59.9k的star

官网地址：https://mem0.ai/

接入Mem0这个记忆框架，官方给出了三种方式

  * 官方的云端API
  * 自建部署服务
  * 直接使用sdk

这三种方式各有优劣，我们直接看 官方给出的对比图

这三种记忆方式的代码逻辑都是一样的，只是使用方式不一样。个人本地的Agent可以直接使用SDK数据保存在本地，如果是企业使用的话，可以选择自建host服务。不想自己部署折腾的可以使用官方的云端API。

这篇文章我们主要拆解开源SDK的实现，大体的架构如下:

在开源 Python SDK 里，核心入口是 mem0/memory/main.py 里的 Memory 和 AsyncMemory。初始化 Memory() 时，它会创建几类组件：

  * llm：负责从对话中抽取值得记住的事实。
  * embedding_model：负责把记忆文本和查询文本向量化。
  * vector_store：主记忆库，默认是 Qdrant，也可以换 pgvector、Redis、Milvus、Pinecone 等。
  * SQLiteManager：本地 SQLite，保存记忆变更历史和最近消息窗口。
  * entity_store：懒加载的实体索引库，用来把实体和记忆 ID 连起来。
  * reranker：可选，负责对召回结果二次排序。

记忆这块主要关注点就是写入和检索的流程，下面我们来逐一拆解。

## 写入流程，从对话到长期记忆

核心源码在 `mem0/memory/main.py` 其中有一个add()方法用来添加记忆，我们来看下它的主要流程是什么

这个就是把一个聊天内容整理成长期记忆的过程。

Agent把一段新的对话交给add()方法，不能只给用户的消息和模型的回复，还需要提供一个归属字段，例如 user_id,agent_id,run_id这些，这样才能区分这个记忆属于谁，不然后面检索的时候就无法区分。
    
    
    memory.add(  
        [  
            {  
                "role": "user",  
                "content": "我下个月要去东京，想住精品酒店。我不吃生鱼片，帮我以后推荐餐厅时避开寿司 omakase。"  
            },  
            {  
                "role": "assistant",  
                "content": "好的，我之后给你推荐东京餐厅时会避开寿司 omakase，并优先考虑适合精品酒店行程的餐厅。"  
            }  
        ],  
        user_id="u_123",  
        metadata={"app": "travel-agent"}  
    )  
    

Mem0 在收到这个消息后，不会直接把这个消息保存下来，它会先去SQLlite数据库中拿到这个用户的最近的10条消息，再去 Vector Store 里找10条相关旧记忆，这样系统就知道了聊天的上下文消息，以及以前是否聊过这个话题

Mem0 把“新对话 + 最近消息 + 相关旧记忆”交给 LLM，LLM会对这些数据进行整理，它要判断这段对话是否有需要长期保存的事实，比如用户偏好，计划，长期目标等。如果只是寒暄这些意义的聊天，就不会抽取出新的有记忆，LLM会返回一段整理好的文本

下面是一个简化版例子来理解它的提示词。真实 prompt 更长，会包含很多质量要求和边界条件，但核心意思大概是这样：
    
    
    你是一个 Memory Extractor。  
    你的任务不是回答用户，而是从新对话里抽取值得长期保存的事实。  
      
    请同时阅读 user 和 assistant 的消息：  
    - user 消息里可能有偏好、计划、经历、长期目标  
    - assistant 消息里可能有推荐、方案、安排、已经给出的建议  
      
    下面是系统已经知道的相关旧记忆，只能用来去重和关联，  
    不要从旧记忆里重新生成新记忆：  
    [  
      {"id": "old-1", "text": "用户计划 7 月去日本旅行"},  
      {"id": "old-2", "text": "用户喜欢轻松、不赶路的旅行安排"}  
    ]  
      
    下面是最近几条对话，用来理解上下文：  
    user: 上次说的日本行，我想把京都多留两天。  
    assistant: 可以，那行程可以改成东京 3 天、京都 4 天、大阪 2 天。  
      
    输出格式要求是：只返回能被解析的 JSON，不要解释、不要推理过程。结构类似这样：  
    {  
    "memory": [  
        {  
          "id": "0",  
          "text": "一条从新对话里抽取出的长期记忆",  
          "attributed_to": "user",  
          "linked_memory_ids": ["相关旧记忆 id"]  
        },  
        {  
          "id": "1",  
          "text": "另一条从新对话里抽取出的长期记忆",  
          "attributed_to": "assistant",  
          "linked_memory_ids": []  
        }  
      ]  
    }  
      
    

LLM处理后，新的记忆大概会返回这些内容：
    
    
    {  
      "memory": [  
        {  
          "id": "0",  
          "text": "User plans to visit Tokyo next month",  
          "attributed_to": "user"  
        },  
        {  
          "id": "1",  
          "text": "User prefers boutique hotels",  
          "attributed_to": "user"  
        },  
        {  
          "id": "2",  
          "text": "User does not eat raw fish and wants future restaurant recommendations to avoid sushi omakase",  
          "attributed_to": "user"  
        }  
      ]  
    }  
      
    

接下来，Mem0 会把这些LLM返回的新记忆变成向量，它会做一次简单去重：如果同样的记忆已经存在就跳过，不再重复保存。

新记忆会写进 Vector Store 里面。这里的 Vector Store 不是固定某一个数据库，而是 Mem0 的向量数据库接口。

它默认用的是 Qdrant，本地数据默认放在 /tmp/qdrant，主记忆 collection 叫 mem0。我们也可以修改默认的配置，使用其他的向量数据库，那么数据就会保存到指定配置的数据库中。

记忆保存后 Mem0 会在 SQLite 里记一条 history，它的作用就是记录最近的历史消息，方便下一次写入的时候继续理解上下文

最后Mem0 会从新记忆里抽取实体，写进 Entity Store

### ADD-only：不急着覆盖旧记忆

Mem0 v3 的写入策略偏 ADD-only。也就是说，新事实默认作为新记忆加入，而不是直接覆盖旧记忆。

这种和摘要式记忆不同，摘要记忆会覆盖原始信息，时间信息也会被消除掉，例如 用户之前是喜欢喝咖啡，后来喜欢喝茶，如果只保留一条不断更新的摘要，记忆里面就只有一条信息，用户喜欢喝茶，如果 用户问 我是什么时候开始喜欢喝茶的，这个记忆是没有的。

ADD-only 的好处是保留事实演化轨迹，让时间推理、多跳检索和冲突处理更有空间。如果一直ADD-only 碰到用户偏好和事实就一直添加，会不会导致记忆膨胀呢。

Memo0在保存记忆的时候 做了两层处理

  * LLM 在看到相关旧记忆后尽量不重复抽取
  * SDK 对新记忆文本计算 `md5` hash，如果 hash 已经存在于相关旧记忆，或同一批次里已经出现，就跳过写入

虽然抽取记忆使用了 ADD-only 的机制，但是业务系统还是需要显示的记忆维护能力，Mem0 同时也提供了update和delete记忆的的方法

### 记忆主存储：向量库

Vector Store 里面每条记忆会包含下面的信息：

  * 记忆文本 `data`
  * 向量 embedding
  * 作用域信息：`user_id`、`agent_id`、`run_id`
  * 元数据：创建时间、更新时间、hash、角色、过期日期等
  * BM25 辅助字段：词形还原后的 `text_lemmatized`

真正落库时，Mem0 会优先走批量路径，对抽取出的记忆文本调用 `embed_batch`，再一次性 `insert` 到向量库。如果 provider 不支持或调用失败，才降级成逐条 embedding、逐条 insert。

历史记录也是同样的思路，优先 `batch_add_history`，失败再逐条写。这个细节说明 Mem0 的实现不是 demo 级封装，而是考虑了生产场景里的吞吐和失败降级。

SQLite 里有两张关键表：`history` 和 `messages`。

`history` 记录每条 memory 的 ADD、UPDATE、DELETE 事件，保存旧值、新值、时间、角色、actor 信息

`messages` 保存最近消息窗口，并且每个 session scope 只保留最新 10 条。

这样，Mem0 既能追踪某条记忆如何变化，也能在下一次抽取时利用近期对话降低重复。

### 实体索引：让记忆之间产生连接

Mem0 还有一个独立的 Entity Store。它会从记忆文本中抽取实体，例如人名、组织、地点、产品名、被引号包裹的关键词、复合名词短语等，然后建立：
    
    
    实体 -> linked_memory_ids -> 多条相关记忆  
    

这个和我们常见的知识图谱建立的实体关系不一样，它并没有建立实体之间的关系，而是将抽离出来的实体和 记忆的数据建立了关系，系统可以通过实体查到以往的历史记忆数据。

实体写入也有去重逻辑。Mem0 会先按规范化文本做精确匹配，比如去掉多余空格、转小写，如果没有精确命中，再对实体文本做向量搜索，分数达到阈值才认为是同一个实体。命中后不是新增实体，而是更新这个实体 payload 里的 `linked_memory_ids`。这样，一个实体可以逐渐连接越来越多的记忆，形成“实体到事件”的索引。

一条 Entity Store 里的记录，大概可以理解成这样：
    
    
    {  
      "id": "entity-vector-id-001",  
    "vector": "embedding(Project Atlas)",  
    "payload": {  
        "data": "Project Atlas",  
        "entity_type": "PROPER",  
        "linked_memory_ids": [  
          "memory-id-001",  
          "memory-id-002"  
        ],  
        "user_id": "user-123"  
      }  
    }  
      
    

这里的`id`是这条实体记录的ID；`vector` 是实体文本的向量数据，用来做相似搜索，里面写成 `embedding(Project Atlas)` 只是为了方便阅读，真实数据库里会是多维数组 ，`payload.data` 是实体文的内容，`linked_memory_ids` 是最关键的字段，表示这个实体关联了哪些长期记忆。

`user_id`、`agent_id`、`run_id` 这类作用域字段也会一起保存，用来保证检索时记忆不会乱串。

## 检索流程

Agent 在生成回答前调用 `memory.search(...)`，检索相关的长期记忆内容，补充给模型消息。

Mem0在查询的时候，会把用户问题转换成多路查询，然后将结果融合排序。

想要检索召回的数据质量高，就不能简单只做向量检索，Mem0 的检索使用三种方式：

  * **Semantic Score** ：embedding 相似度，适合语义问题。
  * **BM25 Score** ：关键词匹配，适合精确词、日期、术语。
  * **Entity Boost** ：实体命中后给相关记忆加权，适合围绕人、项目、地点、产品的查询。

如果配置了 reranker，还可以在候选结果上做二次排序处理。

在进行BM25 查询的时候，会做词形还原，可以让关键词匹配更加稳一点。

实体检索的时候，会先从查询信息里面抽取实体出来，Mem0 这里的实体抽取走的是 spaCy NLP 模型 + 规则，没有走大模型调用。抽取实体后，把实体文本向量化，最后再去Entity Store 里找相似实体。找到之后就可以根据实体关联的记忆id，召回相关的原始数据。

在检索的时候 查询参数会传一个参数 top k，实际检索的时候不会只取top k，在内部查询的时候，会把这个数量扩大4倍，先形成一个候选池，前面多召回一点，后面在进行融合打分，避免过早的丢掉相关记忆。

最终融合在 `score_and_rank` 里完成。候选记忆先经过语义分数阈值过滤，低于 threshold 的结果直接丢弃，通过过滤后，计算：
    
    
    final_score = (semantic_score + bm25_score + entity_boost) / max_possible  
    

这里三个分数来源不同：

  * `semantic_score` 来自主记忆 Vector Store 的语义相似度。简单说，就是这条 memory 和 query 在意思上有多像。它先过 `threshold`，太低的候选会直接丢掉。
  * `bm25_score` 来自关键词检索。底层数据库会先给一个 BM25 原始分数，Mem0 再把它压到 0 到 1 之间，方便和语义分数相加。关键词接近，这个分数越高，如果底层向量库不支持 `keyword_search`，这一项就是 0。
  * `entity_boost` 来自 Entity Store。Mem0 从 query 里抽实体，去 Entity Store 里找相似实体。如果某个实体关联了这条 memory，这条 memory 就会被加一点分。这个加分最高按 `ENTITY_BOOST_WEIGHT` 这个变量控制，当前默认是 0.5，所以它是加权增强，不是直接压过语义检索。

`max_possible` 可以理解成归一化的分母，用来把总分归一化到 0 到 1 附近。它会根据这次实际启用了哪些检索方式动态变化：

启用的信号| max_possible  
---|---  
只有语义检索| 1.0  
语义 + BM25| 2.0  
语义 + Entity Boost| 1.5  
语义 + BM25 + Entity Boost| 2.5  
  
举个例子，如果一条 memory 的语义分数是 `0.72`，BM25 归一化后是 `0.60`，实体增强是 `0.30`，这次三路信号都启用了，那么：
    
    
    final_score = (0.72 + 0.60 + 0.30) / 2.5 = 0.648  
    

这样做的话：语义、关键词、实体这几个查询结果都能影响排序，但最后用 max_possible 做了归一化。不然的话，开了 BM25 或实体加成之后，分数单纯因为多加了几项就变大，并不代表它真的更相关

## 如何把 Mem0 接入自己的 Agent？

如果我们需要把这个记忆框架接入到Agent中 ，其实非常简单，Agent 回复用户前先检索记忆，把相关记忆注入 system/context，Agent 回复后再把这轮对话交给 Mem0 抽取并保存。

如果需要将Mem0接入Agent中，可以考虑以下原则：

  * **把作用域设计清楚** ：个人偏好用 `user_id`，单次任务用 `run_id`，Agent 自身行为或能力沉淀用 `agent_id`。
  * **把检索放在推理前** ：先 `search`，再把 Top-K 记忆作为上下文给业务 LLM。
  * **把写入放在回复后** ：先完成用户响应，再异步 `add`，避免记忆抽取影响业务回复的速度。
  * **用 metadata 做业务隔离** ：例如 `project_id`、`workspace_id`、`category`，方便后续过滤。
  * **高精度场景启用 reranker** ：客服、医疗、法务、企业知识库等场景，reranker 通常比单纯向量召回更稳。

另外还有一个重要的问题，Agent的每一轮回复都需要使用memory.add()方法来抽取长期记忆吗，我们可以想象一下 如果是一个写作Agent，Agent输出了一个草稿或者说是正文，这个内容就很多，如果放到Mem0里面去提取实体，会提取多少实体出来，而这些 我觉得 不应该变成长期记忆。

不是所有的Agent都适合Mem0这种长期记忆架构，写作Agent这种 在保存记忆之前，需要先塞选内容，只把合适的内容写入长期记忆。或者说可以将这个memory.add() 封装成工具，让Agent按需使用。

## 总结

Agent 记忆层的本质就一句话：**把发生过的事儿存下来，保证将来能再翻出来用。**

Mem0这个框架，就是用 LLM 从对话里面抽取关键信息，用向量库保存内容，SQLite 记录记忆的里信息和最近10条聊天的上下文，抽取实体，把记忆和实体关联起来。

对开发者来说，接 Mem0 最需要花心思的不是怎么写几行代码来接入，而是想清楚下面这几件事：

  * 什么内容值得写入记忆
  * 怎么隔离不同用户的记忆
  * 什么时候需要去查询记忆

这几个问题搞明白了，Memo0这个记忆框架就会变得非常简单。更多信息见：
