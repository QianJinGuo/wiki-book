---
title: "ES 做 Agent 记忆层，召回率0.89"
source_url: "https://mp.weixin.qq.com/s/fypjVWJBQg_MZV9OMfPpIA"
created: 2026-07-01
updated: 2026-07-01
type: article
tags: [wechat, agent, memory, elasticsearch, atlas, retrieval, hybrid-search]
ingested: 2026-07-01
sha256: 7496c753a04d44c10d428885f7393a5233961ee72cc88343ba2fa8287b11e3c6
---

Agent记忆不是KV存储问题，是多索引信息检索问题——你熟悉的ES完全够用。

三索引分型(episodic、semantic、procedural) + BM25+dense双通路混合召回 + cross-encoder重排序 + consolidation写后提炼，一条ES查询穿越四种不同生命周期的信息。
关键变量：R@10=0.89，reranker单点贡献0.238，dense是主力0.845，但BM25的词法腿不可省略——三个数字决定的不是参数调优，是架构要不要两条腿。
带走三样东西：三索引ES mapping模板、最小50行recall.py脚本、168 QA评测集使用方式。读完就能在自己集群上跑ablation实验。
01
你的Agent为什么总是"忘了"你上周说过的话？

我最近在跑一个实验：让Agent记住"我只用PostgreSQL，别给我推MySQL"，然后连续对话5轮。

第1轮：Agent说"好的，记住了。"第3轮：我说"帮我设计一个数据表。"它用PostgreSQL。第5轮：我换了个场景——"推荐一个云数据库。"它说："MySQL配合Redis很成熟。"

不是LLM笨——是我的"记忆系统"只有一行 chat_history.append()。

你把所有对话塞进一个数组，每次只取最近N条给LLM看，这能叫记忆吗？这是日志文件。

Agent真正需要的不只是"存下来"——它需要在需要的时候找到对的那条信息。而上周你说的"我只用PostgreSQL"和第5轮的查询"推荐数据库"之间，隔了3轮对话、8条消息、一堆完全不相关的技术讨论。KV append没有任何检索能力穿过这些噪音找到那条偏好。

想象一个仓库。管理员把所有入库单钉在同一摞纸上——第1单钉在上面，第50单的"PostgreSQL偏好"夹在第3页。每次有人来查"这个客户用什么数据库？"，他从第一张开始翻，翻到第3页找到答案。码钉枪就是你的 chat_history.append()——能存，不能找。但你需要的是分拣传送带：货物进来先按品类分到三条传送带上，查货时扫描枪一扫，三条带同时出结果。

更致命的是，你这个Agent要"记住"的不只一种东西。你告诉它的"我只用PostgreSQL"是一个稳定事实，很长时间内不会变。你让它跑的"上周五部署checklist"是一个操作流程，失败了要重新来。你和它闲聊的"今天下雨好烦"是一个时序事件，一周后就不重要了。三种不同生命周期的信息，你用同一个 messages 数组存——这就是为什么Agent永远在"忘记"。所以真正的挑战不是"存多少"——真正的挑战是在三种不同生命周期的信息中，用对的衰减曲线和互补的检索通道，在查询瞬间找到对的那几条。答案藏在Elasticsearch的三索引mapping和一个Painless脚本里。

我最先用的是 Redis——把 user_id 做 key，整个对话历史 JSON 序列化塞进一个 string value。两个星期就崩了：key 膨胀到几百 KB，每次读写要全量反序列化；更致命的是没有任何检索能力——"用户偏好 PostgreSQL"埋在第 47 条消息里，除非 LLM 碰巧翻到那一截 context window，否则根本想不起来。后来试了 Chroma——向量检索解决了"找到相关记忆"的问题，但所有记忆一桶装：上周的部署 tips 和三个月前的一句抱怨用同一个衰减策略。没有分型，就没有生命周期——这就是我决定用 ES 三索引的原因。

02
一条查询穿越三个索引

在拿出代码之前，我先把
recall_memory(query)
这条调用背后发生的事拆成你可以直观理解的管线。

第一步：Verbatim预召回。

在LLM看到你的消息之前，系统先用你原始的话——一个字不改——跑一遍检索。如果你输入的是"postgres v15.3 + pgvector 0.5.1"，就是这个原串进去。

不能用LLM改写过的版本——LLM会把"postgres v15.3 + pgvector 0.5.1"泛化成"PostgreSQL数据库"，版本号和扩展名全丢了，BM25的词法匹配就废了。这一步是Atlas的agent.py第128行的精确逻辑——在messages.append(user_msg)和LLM调用之间插入一次pre-recall，结果以合成assistant tool_call的形式注入对话历史。

第二步：双通路并行检索。

左边跑BM25词法检索——在四个ES索引（episodic/semantic/procedural/catalog）的text、title、name、description、trigger_text字段上做multi_match，text字段权重2x。每个索引包裹function_score，内嵌Painless decay_script做per-index时间衰减（episodic按timestamp衰减、semantic按last_used_at衰减、procedural恒为1.0豁免衰减）。

右边跑Jina v5稠密向量——用ES 8.16的semantic_text字段，写入时copy_to自动生成向量，查询时knn搜索语义相近的记忆。两路同时跑，不分先后。

第三步：RRF融合。

两路各返回一堆候选（rank_window_size=max(80, k*8)），用RRF（Reciprocal Rank Fusion）把两个排序列表融合成一个。rank_constant=30——这个值比默认60小，意味着每路排名靠前的结果在融合后保持更强的信号权重，不是各退一步"你给个面子我也给个面子"。

第四步：Cross-encoder重排序。

Jina v2 cross-encoder对融合后的80条候选逐对评分——把(query, doc)喂给模型，输出一个0-1的相关性分数——然后截断到top-K条返回。reranker失败时系统不静默，日志记录error，降级为RRF顺序（fillna RRF rank后sort）。

这就像快递分拣中心的双通道扫描——条码枪（BM25精确匹配SKU号"postgres v15.3"）和视觉摄像头（dense语义理解"上次那种蓝色包装的数据库"）同时扫描货物，控制台按加权规则融合两路结果，人工复核员（reranker）在top80候选里挑出最相关的top-K件。

关键变量 RECALL_OVER_FETCH_K=80 。为什么不是10？因为consolidation会产生近重复的事实——"用户偏好PostgreSQL"可能存了3个版本的semantic doc。候选池如果只有10条，这3条近重复doc可能把gold doc挤出去，reranker根本看不到它。80候选在 ~250 docs/用户的demo语料上是32%覆盖率——reranker有足够空间发挥。但也不是越大越好：reranker推理成本随候选数线性增长，80是这个demo的工程平衡点。

03
三索引不是设计选择，是不能省的分型逻辑

现在打开ES的mapping。Atlas（noamschwartz/atlas-memory-demo）不是建一个叫"memories"的索引然后在文档里加个type字段。它建了四个独立的索引，每个有完全不同的字段和衰减策略：

维度
	
episodic
	
semantic
	
procedural
	
catalog


存储内容
	
原始消息+时间戳
	
提炼后稳定事实
	
多步操作playbook
	
公共共享知识


衰减源字段
	
timestamp
	
last_used_at
	
无衰减
	
timestamp


衰减类型
	
gauss(scale=1825d)
	
gauss(scale=1825d)
	
恒为1.0
	
gauss(scale=1825d)


写入频率
	
每回合
	
consolidation时
	
consolidation时
	
手动/脚本


更新规则
	
只写不改
	
supersession链更新
	
计数器更新
	
脚本覆盖


特殊字段
	
无
	
use_count+superseded_by
	
success/failure_count
	
无user_id


DLS隔离
	
user_id
	
user_id
	
user_id
	
所有用户可见

这对应物流分拣中心的四条传送带：生鲜走episodic（时间戳主导，过期就沉底）；库存品走semantic（可盘点、可更新，use_count高的自动靠前）；标准操作手册走procedural（不会因时间失效）；公共货架走catalog（所有人可见，不贴user标签）。一个查询同时翻三柜+公共货架，不需要分别调三条API。

为什么不能合并成一个索引？

字段语义污染。 timestamp对episodic是主衰减源，但对semantic只是"这个事实什么时候被发现的"——真正的衰减源是last_used_at。合并后Painless decay_script必须写if-else分支，每次查询跑条件判断，慢且易出错。

生命周期冲突。 episodic高频写入从不更新，semantic低频写入但高频更新（use_count、superseded_by），procedural写少改少但字段完全不同。三套update pattern，塞进一个索引是三种互斥模式硬叠。

mapping无法承载。 ES的mapping是schema-on-write——semantic有superseded_by（keyword），episodic没有。procedural有success_count（integer），semantic没有。合并后要么全量字段带大量null，要么nested/object结构让查询语法复杂度暴涨。

DLS多租户隔离

Atlas默认支持多租户。每个用户只看到自己的记忆。但隔离不是应用层 if user_id == request.user_id——那太容易写漏了。

ES的Document-Level Security把隔离规则写进集群本身。每个用户拿到的API key（通过bootstrap_users.py铸造）的role descriptor里带DLS query——

{"bool": {"should": [{"term": {"user_id": "bob"}}, {"bool": {"must_not": {"exists": {"field": "user_id"}}}}]}}

——只允许user_id匹配或没有user_id字段（catalog）的文档可见。

应用层 _user_or_catalog_filter 作为冗余防御。catalog索引以CATALOG_SOURCE_PRIOR=0.85软倾斜参与排序——不是硬路由规则，当catalog文档的relevance明显更强时，reranker仍然会选它。

# bootstrap_users.py 的核心逻辑
def bootstrap_user(es_client, user_id: str):
    role_name = f"atlas_user_{user_id}"
    es_client.security.put_role(
        name=role_name,
        body={
            "indices": [
                {
                    "names": ["atlas-episodic", "atlas-semantic",
                              "atlas-procedural", "atlas-catalog"],
                    "privileges": ["read", "write"],
                    "query": {
                        "bool": {
                            "should": [
                                {"term": {"user_id": user_id}},
                                {"bool": {
                                    "must_not": [
                                        {"exists": {"field": "user_id"}}
                                    ]
                                }}
                            ]
                        }
                    }
                }
            ]
        }
    )
    api_key = es_client.security.create_api_key(
        body={"name": f"atlas-key-{user_id}",
              "role_descriptors": {role_name: {}}}
    )
    return api_key["id"], api_key["api_key"]

关键变量与领域调参

DECAY_SCALE=1825天（约5年）是演示场景的保守默认—不是"正确答案"。客服Agent应收紧到 60-180天，个人助理可放宽到 3650 天。DECAY_OFFSET=180天给衰减曲线前加了一段平坦区——180天内的 doc 乘数均为 1.0，减少短期排名抖动。USE_COUNT_BOOST_WEIGHT=0.2 保守设置—— use_count=10 时 boost 约1.21x，use_count=100 时才达到约1.40x。

Ablation实验数据

168 QA题，3个persona（bob/alice/zeek），各约250条记忆文档：

四个数字说清楚每条腿的价值：dense是主力（0.845），但BM25的单腿0.708说明词法腿不是"辅助"——是核心贡献者。reranker最大单点贡献（丢失后-0.238），但它只在候选池足够宽时有用——如果第一阶段就漏了gold doc，100个reranker也救不回来。

CI gate设定R@10≥0.85为通过（Atlas实际0.89），R@5≥0.75，leaks=0。

04
从写入到召回——五条代码链路跑通完整引擎

下面是实操核心。五条链路各自独立，你可以按顺序跑通，也可以跳到最需要的部分。

链路1：写入记忆（write_memory）
# write_memory 核心调用
from elasticsearch import Elasticsearch

client = Elasticsearch("http://localhost:9200")

def write_memory(doc: dict, index: str) -> str:
    """
    写入一个记忆条目到指定索引。
    refresh=True: 强制shard refresh，保证后续同一轮对话的recall能看到这条记忆。
    这个参数是整套系统的'同轮可见'机制的基石——ES默认refresh_interval=1s，
    意味着write后最多1s内recall不可见。对Agent来说，1s的不可见窗口
    意味着你这轮写进去的memory，LLM下一句就可能读不到。
    """
    resp = client.index(
        index=index,
        body={
            "user_id": doc["user_id"],
            "text": doc["text"],
            "memory_type": doc.get("memory_type", "preference"),
            "title": doc.get("title", ""),
            "timestamp": doc.get("timestamp", "now"),
            "metadata": doc.get("metadata", {})
        },
        refresh=True
    )
    return resp["_id"]

# episodic: 每轮对话写入原始消息
write_memory({
    "user_id": "bob",
    "text": "用户的原始消息: 帮我查一下上周五的部署日志",
    "memory_type": "message",
    "title": "用户查询部署日志",
    "timestamp": "2026-06-19T10:30:00+08:00"
}, index="atlas-episodic")


踩坑注：Painless脚本难调试。我的排障方法是先在Kibana Dev Tools里跑 _explain API——把查询、文档ID、具体参数喂进去，返回的explanation逐段展示每个boost/decay乘数的中间值。比在console里print一整天快得多。

另外，refresh=True牺牲写入吞吐换召回一致性——production高写入量场景（每秒数百次write）应迁移至async indexing + agent层的just-written register，在LLM context里缓存刚写的事实直到ES native refresh追上。

链路2：recall_memory（混合检索+reranker）




上下滑动查看更多源码

def recall_memory(
    client: Elasticsearch,
    user_id: str,
    query: str,
    k: int = 5,
    include_superseded: bool = False
) -> list[dict]:
    """
    混合检索 + cross-encoder重排序的完整调用链。
    RRF overfetch=80, rank_constant=30, Jina v5 dense + BM25 multi_match。
    """
    overfetch_k = 80# RECALL_OVER_FETCH_K
    rank_constant = 30

    # Painless decay_script —— per-index时间衰减
    decay_script = {
        "script_score": {
            "script": {
                "source": """
                    double decay = 1.0;
                    if (params._source.containsKey('index_name')) {
                        String idx = params._source.index_name;
                        long now = params.now;
                        if (idx == 'episodic') {
                            long ts = params._source.timestamp;
                            long days = (now - ts) / 86400000L;
                            if (days > params.offset) {
                                decay = Math.exp(
                                    -Math.pow(Math.max(days - params.offset, 0) / params.scale, 2)
                                    * Math.log(Math.sqrt(2))
                                );
                            }
                        } else if (idx == 'semantic') {
                            long lua = params._source.containsKey('last_used_at')
                                ? params._source.last_used_at : params._source.timestamp;
                            long days = (now - lua) / 86400000L;
                            if (days > params.offset) {
                                decay = Math.exp(
                                    -Math.pow(Math.max(days - params.offset, 0) / params.scale, 2)
                                    * Math.log(Math.sqrt(2))
                                );
                            }
                            double use_count = params._source.containsKey('use_count')
                                ? (double) params._source.use_count : 0;
                            decay *= 1 + Math.log10(1 + use_count) * params.use_count_boost;
                        }
                        // procedural: decay stays at 1.0 (explicit exemption)
                    }
                    return decay;
                """,
                "params": {
                    "now": 1687100000000,
                    "offset": 180,
                    "scale": 1825,
                    "use_count_boost": 0.2
                }
            }
        }
    }

    resp = client.search(
        index=["atlas-episodic", "atlas-semantic", "atlas-procedural", "atlas-catalog"],
        body={
            "query": {
                "bool": {
                    "should": [
                        # BM25腿 —— multi_match跨多个文本字段
                        {
                            "multi_match": {
                                "query": query,
                                "fields": ["text^2", "title", "name", "description", "trigger_text"],
                                "type": "best_fields"
                            }
                        },
                        # 向量腿 —— semantic_text字段的knn检索
                        {
                            "knn": {
                                "field": "semantic_content",
                                "query_vector_builder": {
                                    "text_embedding": {
                                        "model_id": "jina-v5-embeddings",
                                        "model_text": query
                                    }
                                },
                                "k": overfetch_k,
                                "num_candidates": overfetch_k * 2
                            }
                        }
                    ],
                    "filter": {
                        "bool": {
                            "should": [
                                {"term": {"user_id": user_id}},
                                {"bool": {"must_not": [{"exists": {"field": "user_id"}}]}}
                            ]
                        }
                    }
                }
            },
            # function_score包裹整个query，叠加时间衰减
            "ext": {
                "function_score": {
                    "query": {"match_all": {}},
                    "functions": [decay_script],
                    "boost_mode": "multiply"
                }
            },
            # RRF融合配置
            "rank": {
                "rrf": {
                    "window_size": max(overfetch_k, k * 8),
                    "rank_constant": rank_constant
                }
            }
        },
        size=overfetch_k
    )

    # Reranker阶段：Jina v2 cross-encoder逐对评分
    try:
        reranked = client.search(
            index=["atlas-episodic", "atlas-semantic", "atlas-procedural", "atlas-catalog"],
            body={
                "query": {"ids": {"values": [h["_id"] for h in resp["hits"]["hits"]]}},
                "knn": {
                    "field": "semantic_content",
                    "query_vector_builder": {
                        "text_embedding": {
                            "model_id": "jina-v2-reranker",
                            "model_text": query
                        }
                    },
                    "k": k,
                    "num_candidates": overfetch_k
                }
            }
        )
        hits = [{
            "id": h["_id"],
            "index": h["_index"],
            "text": h["_source"]["text"],
            "score": h["_score"],
            "source": "reranker"
        } for h in reranked["hits"]["hits"][:k]]
    except Exception as e:
        # fallback: reranker失败时降级为RRF顺序
        print(f"[WARN] Reranker failed, falling back to RRF order: {e}")
        hits = [{
            "id": h["_id"],
            "index": h["_index"],
            "text": h["_source"]["text"],
            "score": h["_score"],
            "source": "rrf-fallback"
        } for h in resp["hits"]["hits"][:k]]

    return hits

输出示例——一次查询同时返回三种不同类型的记忆：

recall_memory(query="用户数据库偏好") →
[
  {id: "sem_042", index: "atlas-semantic", text: "用户偏好PostgreSQL (confidence: 0.92, last_used: 3天前)",
   score: 0.94, source: "reranker"},
  {id: "epi_189", index: "atlas-episodic", text: "上周五: 用户提到'我们一直用pg'",
   score: 0.87, source: "reranker"},
  {id: "proc_056", index: "atlas-procedural", text: "部署checklist Step 2: 选择PostgreSQL作为数据库",
   score: 0.81, source: "reranker", success_count: 12, failure_count: 1}
]

链路3：Verbatim Pre-Recall（精确词锚定）

这套系统里最短但最有价值的5行代码。agent.py的run_turn()方法中，在messages.append(user_msg)和LLM调用之间：

# agent.py run_turn() line 128 —— verbatim pre-recall
def run_turn(self, user_message: str, turn_id: str) -> str:
    # 1. Verbatim pre-recall —— 用户原话，不经LLM改写
    pre_recall_call_id = f"call_pre_{turn_id[:8]}"
    pre_recall_result = recall_memory(
        self.client, self.user_id, user_message, k=5
    )

    # 2. 将pre-recall结果以合成assistant tool_call注入messages
    self.messages.append({
        "role": "assistant",
        "tool_calls": [{
            "id": pre_recall_call_id,
            "function": {
                "name": "recall_memory",
                "arguments": json.dumps({"query": user_message})
            }
        }]
    })
    self.messages.append({
        "role": "tool",
        "tool_call_id": pre_recall_call_id,
        "name": "recall_memory",
        "content": json.dumps(pre_recall_result, ensure_ascii=False)
    })

    # 3. 追加用户消息后调用LLM
    self.messages.append({"role": "user", "content": user_message})
    return self.llm.chat(self.messages)


为什么这5行代码贡献了BM25腿的关键价值？因为LLM被训练成了改写机器——你给它一个包含版本号、错误码、型号名的用户消息，它大概率在调用recall_memory前把这些精确token泛化成简洁的描述：

"postgres v15.3 + pgvector 0.5.1"→"PostgreSQL数据库"。

改写完再查ES，那些精确token在索引里根本匹配不到——但用户下一次可能直接用精切版本号来查。verbatim预召回绕过了LLM的改写层，把最原始的token直接给了BM25。

ablation实验专门验证过query expansion的反效果——用gpt-5.4-mini产生两个paraphrase经doc id去重融合后，确定性能反而下降。BM25腿已经捕获了精确token，dense腿已经捕获了语义改写，再多一个LLM paraphrase阶段只会引入噪音。

链路4：Consolidation（写后提炼）

每回合结束后，consolidation loop从最近30条episodic事件中提取稳定事实和操作流程。consolidate.py的核心prompt结构要求一次LLM调用同时输出三类结果：

# consolidate.py 的prompt结构（核心输出schema）
CONSOLIDATION_PROMPT = """
You are analyzing recent episodic memories to extract structured knowledge.

RECENT EPISODIC EVENTS (last 30):
{episodic_events}

EXISTING SEMANTIC FACTS (~50):
{existing_facts}

EXISTING PROCEDURALS (~20):
{existing_procedurals}

Output JSON:
{
  "new_facts": [
    {
      "fact": "...",
      "confidence": 0.0-1.0,
      "supporting_episode_ids": ["epi_123", "epi_145"],
      "supersedes_id": null
    }
  ],
  "new_procedures": [
    {
      "name": "...",
      "steps": ["step 1", "step 2"],
      "confidence": 0.0-1.0,
      "trigger_text": "when user asks about deployment"
    }
  ],
  "procedural_updates": [
    {
      "procedural_id": "proc_056",
      "success_delta": 1,
      "failure_delta": 0,
      "refined_steps": null
    }
  ]
}

Rules:
- Confidence >= 0.8 to create new procedural
- Mark supersedes_id when new fact contradicts existing one
- Include supporting_episode_ids for traceability
"""


每回合跑consolidation会翻倍LLM调用成本——一轮对话两次LLM inference（一次回复+一次consolidation）。production场景建议改为后台日批模式：积累一天的episodic事件，在夜间统一跑一次consolidation。

记忆新鲜度损失约24小时，LLM成本减半。数据量上去后，可按"最近24小时内新增episodic事件超过N条"做动态触发——事件密度高时自动提高consolidation频率。

链路5：Soft-Supersession（非破坏矛盾处理）

用户说"我搬家了，现在在深圳"——以前的记忆是"用户在杭州"。系统不是update旧doc，而是创建新doc + 标记旧doc + 召回时过滤旧版：

def supersede_fact(
    client, user_id: str, old_fact_id: str,
    new_text: str, contradiction_type: str = "natural"
) -> str:
    """
    natural: 自然变化（搬家/升级/偏好改变），新事实满置信度写入
    harsh:   用户明确否认/纠正，新事实扣 SUPERSEDE_CONFIDENCE_PENALTY=0.1
    """
    confidence = 1.0
    if contradiction_type == "harsh":
        confidence -= 0.1

    # 1. 写入新fact，携带supersedes旧ID
    new_id = write_memory({
        "user_id": user_id,
        "text": new_text,
        "memory_type": "semantic",
        "confidence": confidence,
        "supersedes": old_fact_id,
        "timestamp": "now"
    }, index="atlas-semantic")

    # 2. 更新旧fact：标记被supersede
    client.update(
        index="atlas-semantic",
        id=old_fact_id,
        body={
            "doc": {
                "superseded_by": new_id,
                "superseded_at": "now"
            }
        }
    )
    return new_id

# 召回默认过滤被supersede的旧版
# recall_memory的bool filter中加：
# "must_not": {"exists": {"field": "superseded_by"}}


链式supersede支持任意长度的追溯链——abc→xyz→pqr→……永远不删除旧记录，只是按链路标记。

如果你想看"这个用户三年前的数据库偏好是什么"，调 recall_memory(include_superseded=True) 一次性拿到全版本链。harsh矛盾（用户说"我从来没说过这话"）对新事实扣0.1置信度——系统对新事实"略不自信"，直到后续交互中再次确认才恢复满置信度。

实际没跑全量——我的 memory 系统用在内部工具 bot 上，用户量 20 人。直接砍了 consolidation，只留 episodic + manual semantic 写入。不是 consolidation 没用——是 20 人的场景下，手工标记语义事实（"记住这个偏好"）的开销远低于设计一套自动提炼 pipeline。

Atlas 的 consolidation 是为"用户不可见记忆管理"设计的——你的用户不会手动帮你维护 semantic index。如果你的场景用户量小且愿意配合标记，consolidation 不是必选项；如果你在做产品且用户不知道自己有记忆系统，不跑 consolidation 就等于没有 semantic 层。

05
GBrain的另一种答案——Markdown+Git做记忆真值源

同一个问题——Agent怎么记住你——Garry Tan的GBrain（14k+ Stars）走了一条完全不同的路。

Atlas用搜索引擎做记忆存储。 三索引分型，ES原生DLS多租户隔离，soft-supersession矛盾链，per-index gauss时间衰减。你的记忆是searchable documents，你看不到原始存储——你只能通过recall_memory的输出来"感知"系统记住了什么。

GBrain用Markdown文件做记忆存储。 三层架构：Brain Repo（Markdown文件分三类存放，Git版本控制）+ 混合检索（P@5 49.1%, R@5 97.9%）+ Dream Cycle（夜间巩固，把近期交互提炼为持久记忆）。你可以直接打开 .brain/bob/semantic_facts.md，看到"用户偏好PostgreSQL (confidence: high, updated: 2026-06-15)"——人类可读，直接可编辑。

核心差异：

存储引擎：ES搜索引擎存储 vs Markdown+Git文件存储。后者对调试极友好——不需要ES查询，打开文件就看到了。但Git不适合高频episodic写入——每回合commit一次，日志量会让仓库迅速膨胀。
多租户：Atlas集群层DLS（一行配置解决隔离，零应用层代码），GBrain应用层auth（需要自己实现用户权限控制）。
矛盾处理：Atlas软删除链（superseded_by追溯），GBrain Git版本历史（git log看变化，git checkout恢复旧版）。两个都是非破坏性的，走不同的审计路径。
衰减：Atlas per-index gauss（episodic沉底/semantic根据last_used_at浮动/procedural永不过期），GBrain无显式时间衰减——全量保留，靠检索排序决定谁出现。

Mem0和Letta排在右上（向量数据库+一些管理功能）但弱于Atlas——有向量检索，但没有分型生命周期（所有记忆一桶装）和BM25词法腿。LangGraph checkpointing排左下——它是状态机快照，不是记忆检索系统，适合工作流重放而非跨会话知识查询。

两条路线各有所长。GBrain的Markdown可读性是实在的优势——你不需要信任一套你看不到内部的系统，打开文件就知道Agent关于你记住了什么。代价是Git不适合高频写入。Atlas的ES在多租户SaaS场景下更自然——DLS解决了隔离，"refresh=True"保证了同轮可见，评测有明确的R@10=0.89基线。记住一件事：个人助理偏向GBrain（人可读信任优先），多租户产品偏向Atlas（ES原生隔离必要）。别搞反了。

06
超越ES——记忆系统的三个通用设计原则

从Atlas和GBrain的并置里，我抽出三个跨存储引擎的通用原则。不管你用ES、Postgres JSONB+pgvector、还是Markdown文件，这三个原则都适用：

原则1：衰减曲线是领域性决策，不是技术参数。

Atlas的1825天保守到几乎不衰减。但客服Agent必须收紧到60-180天——产品每周迭代，旧事实快速失效。先定义你的信息有效周期，再反向定衰减参数。这不是"选哪个值更好"——是"你的领域特征是什么"。

原则2：混合检索中BM25+vector互补，不是二选一。

纯向量方案丢失了BM25的词法腿——用户输入"v3.7.2-beta"时，精确token匹配是唯一能抓到的腿。纯BM25在用户说"上次说的那个数据库偏好"时完全盲区——"数据库偏好"这四个字没出现在任何文档里。两条腿为不同查询设计：BM25抓精确术语（版本号/错误码/人名），dense抓语义意图。query expansion的ablation已证明额外改写反而降低性能——BM25已捕获精确token，dense已捕获语义改写，再加LLM paraphrase是画蛇添足。

原则3：记忆不只"存和查"——后台提炼和矛盾处理是必须的。

consolidation把原始事件转化为稳定事实。没有这一步，你的记忆系统就是一个越来越大的日志文件，BM25和reranker在面对海量噪声文档时召回质量急剧下降——events-to-facts的比例差异越大，检索降级越严重。supersession让系统有非破坏性更新路径：旧事实不消失（审计需要），但新查询不再返回（业务需要）。这两步是信息生命周期设计的核心——不绑定到ES、Markdown或任何具体引擎。GBrain用Dream Cycle做夜间巩固、Git做版本控制，Atlas用每回合consolidation、soft-supersession链——机制不同，解决的问题相同。

三个原则说穿了一件事：Agent记忆系统的瓶颈从来不在数据库引擎。5年后ES可能被别的方案取代，但三索引的分型逻辑、混合召回的双腿互补、写后提炼+矛盾处理的闭环——这三个设计决策会比你选的引擎活得久。

原则 1——衰减曲线——是我见过最多人忽视的。绝大多数 Agent 项目要么没有衰减（"全都存着就行"），要么用一个统一的 30 天过期策略套在所有记忆上。我见过一个客服 Agent 把客户的"我只用 API v2"偏好的时间衰减设得和"我今天心情不好"一样——一个月后两条一起沉底。

但"我只用 API v2"在你没听到客户说"我升级到 v3"之前是一个稳定事实，它的衰减驱动力应该是 last_used_at（你什么时候最后一次用到这条偏好），不是 timestamp（你什么时候第一次听到它）。Atlas 用 semantic 索引的 last_used_at 做衰减源、用 use_count 做 boost，这两个参数本质上在说同一句话：信息的衰减驱动力是它有多频繁被需要，不是它有多旧。

如果你只改一个东西，先把衰减源从 timestamp 改成跟你场景信息生命周期匹配的字段。

07
可带走的三件套——mapping模板 + recall脚本 + 评测基线

读完这篇文章，你能直接带走的三样东西：

产出1：三索引ES mapping模板。

创建 episodic 索引 —— 核心字段：timestamp(date, 衰减源)、text（text, copy_to: semantic_content)、user_id(keyword, DLS过滤键)。

创建 semantic索引 —— 在 episodic 基础上增加：last_used_at(date)、use_count(long)、confidence(float)、superseded_by / superseded_at。use_count 通过 bulk partial-document update 增量更新(semantic_text 字段拒绝script，所以从 _source 读当前值 +1 写回)。

创建 procedural 索引 —— 核心字段：name(text)、steps(text数组)、success_count / failure_count（long）、trigger_text(text)、confidence(float)。免衰减 —— Painless decay_script检测到index=procedural时直接返回1.0。

完整 mapping.json 在 atlas-memory-demo 的 backend/app/atlas/memory/mappings/ 目录，直接拷贝到ES 8.16+集群。

产出2：最小recall.py脚本（约50行Python）。

上面链路2的代码就是完整版——直接复制运行。关键参数全部变量化：RECALL_OVER_FETCH_K、rank_constant、USE_COUNT_BOOST_WEIGHT、DECAY_SCALE、DECAY_OFFSET。改成你的值，跑 python recall.py "用户用什么数据库？" bob 直接看召回结果。

产出3：168 QA评测集的使用方式。

eval_recall.py接收question/gold_doc_id的JSON文件，跑完整检索管线，输出R@10/R@5/MRR。三persona各约250条文档，评测期间关闭use_count update_stats保证可复现。CI gate: R@10≥0.85, R@5≥0.75, leaks=0——这是Atlas在demo数据集上的参考值，不是你的硬性目标。

下一步：clone仓库，用自己的ES集群跑通核心链路后，先跑ablation实验——BM25-only vs dense-only vs hybrid vs no-reranker——看每条腿在你数据上的贡献分布。Atlas的数字是参考，不是你的答案。

做完这三步之后，你对"Agent记忆到底怎么存"的判断就不是从对比文章里看来的——是从自己集群上跑出来的。