## Ch10.004 rag-vector-knowledge-graph-ontology

> 📊 Level ⭐⭐ | 26.0KB | `entities/rag-vector-knowledge-graph-ontology.md`

# rag-vector-knowledge-graph-ontology

向量库是RAG的前菜，知识图谱是答案，本体论是灵魂
2026年5月4日 10:39 四川 标题已修改
在最初做RAG系统的时候有个几乎绑定的名词：向量库。所以他是什么呢？
应该说向量库是一个理论上很美好的名词，他是一类用于存储和检索向量的数据系统，这里有两点要注意：
向量（embedding），可以将一段文本、图片、音频等内容，通过embedding模型编码成一个高维数组；

## 相关实体
- [Three Rag Architectures Classic Graph Agentic](ch04-318-boris-cherny-ide-agent.html)
- [Nvidia Multimodal Rag Knowledge Systems](ch01-285-tencent-ai-infra-backend-engineer-s-guide-to-ai-system-hard.html)
- [Rag技术框架的演进方向](ch01-193-postmortem-tanstack-npm-supply-chain-compromise-tanstack.html)
- [Skill Rag Tsinghua Sra](ch04-430-agent-lbs-intentbench.html)
- [Harness Engineering Framework](ch05-041-harness-engineering.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/rag-vector-knowledge-graph-ontology.md)

- [knowledge base layer architecture: from rag to agent-native](ch04-028-高德-ai-native-生产线-第-3-期-7x24-self-healing-pipeline-agent-自.html)

- MOC
## 深度分析

**一、向量库的"语义检索"神话在工程实践中存在根本性脆弱性。** 向量库将知识压缩为孤立的"向量点"，依赖语义相似度匹配（Top-K检索），但这无法捕捉完整上下文。典型失败场景是：文档分块导致"上下文割裂"——如医疗场景中药物适用症与妊娠期禁用警示被切分到不同向量块，召回时只返回部分信息，导致误诊风险。文章犀利指出"什么JB语义检索，还是关键词检索靠谱"，揭示了向量检索在实际生产环境中的局限被长期低估 。

**二、知识图谱的核心价值在于将知识从"点状存储"升级为"关系网络"。** 知识图谱由实体（节点）、关系（边）和属性构成，能够显式表达"糖尿病→表现为→口渴"、"糖尿病→治疗→胰岛素"等确定性关联。这种网状结构使得推理路径可追溯、可解释，而不像向量检索那样只能提供"概率相似的片段"。在医疗、法律、金融等高风险领域，这种可解释性直接决定系统能否被信任和使用 。

**三、本体论是知识图谱具备行业KnowHow的建模规则，是三者中最被低估的层次。** 本体论定义了"实体类型是什么、允许什么关系、关系语义强度如何、哪些推理规则可以传递"。二甲双胍的案例极具说明性——"治疗糖尿病"（明确适应证）、"可能导致体重下降"（副作用观察）、"通过AMPK通路影响代谢"（作用机制）是三条语义强度完全不同的关系，没有本体论的约束，系统可能将其粗暴理解为"二甲双胍可以减肥"。这解释了为什么医疗、法律等高风险行业不能只靠大模型自动抽取三元组 。

**四、RAG架构正在从"检索增强"向"推理增强"演进，混合架构是当前最优解。** 真实系统往往是关键词路由、向量模糊匹配、知识图谱推理的混合体。向量库在其中扮演的角色正在从"主力检索"退化为"模糊问法的补充工具"，真正复杂的实体关系推理必须交给知识图谱和路由层。这一趋势已在Google NotebookLLM等产品中得到验证 。

**五、知识图谱+LLM的融合是降低医疗幻觉的有效路径，但前提是医疗置信度四维度的完整建设。** 医疗置信度需要同时满足：数据溯源（每条结论追溯到权威文献）、一致性（多模态数据推理结果一致）、动态性（实时更新最新医学研究）、可解释推理链（附详细依据和来源）。知识图谱+CoT+溯源的组合架构已在实验性场景中展现显著优于纯RAG的效果，但距离规模化落地仍有工程成熟度差距 。

## 实践启示

1. **重新评估向量库在RAG架构中的定位。** 向量库并非RAG的必选组件，其语义检索能力存在边界——长文档切分导致的上下文割裂和"信息淹没"问题在复杂场景中不可忽视。建议将向量库定位为"模糊匹配的补充工具"，核心检索逻辑交由结构化程度更高的知识图谱或规则路由层承担。

2. **在高风险应用场景（医疗、法律、金融）必须引入知识图谱而非单纯依赖向量RAG。** 这些领域的知识具有强关联性和高置信度要求，向量检索的"概率匹配"无法满足"谁说了什么、证据等级如何、结论是否可传递"的推理需求。知识图谱提供的确定性关系网络和多跳推理能力是降低误诊、误判风险的关键基础设施。

3. **本体论建设应先于知识图谱抽取工程。** 在开始用大模型自动抽取三元组之前，应先与领域专家共同定义清楚：实体类型体系、允许的关系类型、语义强度分级、推理传递规则。否则大模型抽取出的"关系"会因为语义边界模糊而失去可用性，甚至引入误导性关联（二甲双胍→减肥的错误推导）。

4. **采用三层防御架构处理不同复杂度的查询。** 简单标准化查询走RAG基础层，复杂多跳或实体关系推理走图谱推理层，两路结果都经置信度验证（阈值如90%）后才输出或提交专家复核。这一架构已在医疗诊断场景中验证有效，适合作为复杂知识问答系统的设计参考。

5. **关注RAG向"推理增强"的演进方向，而非继续在向量检索上内卷。** 未来的AI知识系统将不再显式区分检索组件，而是将其内化为Agent的自主规划、多步推理、自我校验能力。开发者和企业应储备Agent架构和推理链设计能力，而非持续优化切分策略或向量模型。

6. **拥抱混合架构，但优先投资数据治理而非模型调优。** 文章最后的判断"人们很懒惰，不想处理烦躁的数据"是行业痛点也是机会点——自动数据处理框架（PageIndex等）正在涌现，但最终决定系统效果的仍是数据质量。在图谱和本体论上的数据投入，回报远超在向量模型或Embedding策略上的微调。

---

## 第 2 来源 — Zleap AI 团队「SAG (SQL-Retrieval Augmented Generation)」(2026-06-16)

> Source: [第2原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/sag-sql-retrieval-augmented-generation-zleap-ai-2026-06-16.md)
> Author: 尹John (AGI Hunt)
> Team: Zleap AI
> Date: 2026-06-16

第 1 来源 (2026-05-04) 讲 **向量库/知识图谱/本体论** 三种知识组织形态的对比。第 2 来源是 **Zleap AI 团队 SAG 新 SOTA RAG** —— 用 **event-entity 超边模型 + MySQL + Elasticsearch 双存储 + 双路并行检索 + SQL JOIN 多跳** 替代传统 GraphRAG,在多跳问答基准上**领先 HippoRAG 2 (当前 SOTA) 11.1 个百分点**,已在 **5 亿生产数据**规模稳定运行。本来源填补 wiki 中"RAG 新 SOTA / 新一代架构"的视角空白。

### 核心数据(HippoRAG 2 vs SAG)

| 指标 | HippoRAG 2 | SAG (Zleap AI) | 提升 |
|------|-----------|---------------|------|
| MuSiQue Recall@2 | 49.5% | **64.1%** | +14.6 |
| 三个基准平均 Recall@2 | 68.2% | **79.3%** | +11.1 |
| Recall@5 (MuSiQue) | - | **80.04%** | - |
| 生产数据规模 | - | **5 亿+** | - |

**三个基准**: HotpotQA / 2WikiMultiHopQA / MuSiQue
**统一配置**: BGE-Large-EN-v1.5 (embedding) + Qwen3.6-Flash (LLM)

### 三大 RAG 范式演进(本来源独家时间线)

#### 范式 1: 传统向量 RAG (只会看脸)

**逻辑**: 把每段文本变成一个向量 → 问题来了找最"像"的文本。

**优势**: 快 / 便宜 / 好部署 / 简单问答够用

**根本短板**: 向量搜索只知道"像不像",**不知道"谁跟谁有关系"**

**经典失败案例**(本来源独家):
> "A 公司收购了 B 公司,B 公司的 CTO 后来加入了 C 项目,C 项目影响了哪个产品路线?"
> 答案分散在 3 篇完全不同文档,单独拿出任意一篇都和"问题不太像",只有**连起来才是完整答案**。向量 RAG 稳定找到这条链的概率"相当之低"。

**核心比喻**: 只会"看脸",不会"顺藤摸瓜"。

#### 范式 2: GraphRAG / HippoRAG 2 (图谱太重)

**思路**: 从文本里把实体和关系抽出来 → 建知识图谱 → 沿着图谱做多跳检索。

**问题 1 - 三元组抽取**: 把每件事拆成"头实体 → 关系 → 尾实体" → 把完整的事拆得支离破碎。质量高度依赖每条"关系"抽得准不准。

**谓词不稳定**(本来源独家观察): 同一件事,不同模型可能抽出"使用"/"基于"/"提出"/"支持"四个不同谓词 → 真实数据里差异迅速放大,一发不可收拾。

**问题 2 - LLM 每步推理**: 抽取实体 → 归一化名称 → 合并重复 → 发现社区 → 生成摘要 → **每步靠 LLM**,跑一遍又慢又贵。

**问题 3 - 增量更新困难**: 新实体/新关系不断出现,旧关系可能过时 → 持续更新是难题。

**HippoRAG 2 的核心痛点**(本来源独家): 依赖**全局 Personalized PageRank** 做图排序,在 benchmark 规模下还行,但数据量上来且每天增量增长时,**全局 PageRank 负担相当大**。

**核心比喻**: "你每次往图书馆加一本新书,就得把整个图书馆的书重新排列一遍"。

#### 范式 3: SAG (索引卡片 + SQL JOIN) —— 本来源重点

**核心创新**: 不建图谱 / 不做三元组 / 不搞全局图。

**索引卡模型**: 给每个文本 chunk 加一张"索引卡":
- **一个 chunk → 一个 event**(事项摘要,保留完整语义)
- **同时抽取多个 entity**(实体,11 种类型标签: 人物/组织/地点/时间/产品/话题 等)
- **event 保留完整语义,entity 负责索引和连接**
- 两者通过 SQL 关联查询建立**多对多连接**,共同定义一条**潜在的超边(hyperedge)**

### event-entity 超边 vs 三元组(本来源独家对比)

| 维度 | 三元组 | SAG 超边 |
|------|-------|---------|
| **结构** | 头 → 关系 → 尾 | event ⟷ entities |
| **语义保留** | 拆碎,质量依赖每条关系 | 完整事项 + 多实体桥接 |
| **LLM 负担** | 抽取实体 + 关系(每条关系都要抽对) | 抽取 event(完整事项) + entity(应提尽提) |
| **谓词稳定性** | 不稳定(同件事不同模型可能抽 4 个不同谓词) | 不需要关系谓词,只有事项摘要 |
| **图结构** | 两点之间的一条线 | 超图中一条超边: event 同时连多个 entity |
| **检索友好** | 关系准才能用 | event 独立可搜,不依赖上下文 |

**为什么 SAG 比三元组更轻、效果反而更好**(本来源独家):
> "RAG 到最后还是要回到原文证据,三元组太碎,容易丢上下文。而 SAG 的 event 则保留了上下文,同时提供了可检索、可扩展的结构。"

**代词消歧代码细节**(本来源独家):
> SAG 在抽取 event 时,**强制做代词消歧** —— 子事项必须把所有"他"/"该公司"/"这个产品"替换成完整名称。从而每个 event 就是一段**独立可搜的完整描述,不依赖上下文就能被理解**。

### SAG 完整架构

#### 离线阶段
1. 把文档切成 chunk
2. 每个 chunk 提取一个 event + 多个 entity
3. 写进 MySQL (存储结构化关系)
4. 同时写入 Elasticsearch 的向量索引和全文索引

**细节**(本来源独家):
- 每条 event-entity 关系自身也带一段描述文本 + 自己的 embedding 向量
- 同一个实体"OpenAI"在不同 event 里的角色描述完全不同:
  - "OpenAI,发布 GPT-5 的公司"
  - "OpenAI,Sam Altman 创立的公司"
- 在向量空间里是**不同的点** → 实体召回更精准

#### 在线检索阶段(双路并行)

```
问题进来
   ↓
LLM 识别关键实体
   ↓
   ├── 路径 A: 结构化召回
   │    实体 → 向量索引找相近实体 → SQL JOIN 查关联 event → 找到 chunk
   │
   └── 路径 B: 语义召回
        问题向量 → 相似度检索 → 找到语义接近的 event
   ↓
合并 + 查询时扩展(从已找到 event → SQL 反查 entity → 找新 event)
   ↓
每一轮只引入之前没出现过的新内容
   ↓
筛选 event 映射回原始 chunk → 回答基于原文证据
```

**为什么两条路**(本来源独家):
> 路径 A 通过实体关联覆盖**结构化的多跳线索**,路径 B 通过语义匹配覆盖**直接相关的事项**。两者在证据召回上**高度互补**。

**消融实验数据**(本来源独家):
- **纯语义路径**: Recall@5 = 56.2%
- **加入少量结构化路径**: Recall@5 = **80.0%**
- 提升 **+23.8 个百分点**

**多跳实现**(本来源独家简洁):
> 实现方式上,用的只是 SQL 里的**关系扩展**,不需要全局 PageRank,不需要让 LLM 临时推理一张图。
> **就是数据库里的 JOIN,而已。**

#### 两种使用模式(本来源独家)

| 模式 | 特点 | 适用场景 |
|------|------|---------|
| **快速模式** | 省掉 LLM 精排 | 追求速度 |
| **高精度模式** | 加一步 LLM 重排序 | 追求准确率 |

两者都用 event/entity 索引和多跳检索,**核心架构一致**。

### 两来源对比表

| 维度 | 第 1 来源 (2026-05-04) | 第 2 来源 (Zleap AI 2026-06-16) |
|------|------------------------|-------------------------------|
| **核心定位** | 向量库/知识图谱/本体论三种形态对比 | **RAG 新 SOTA** (SAG event-entity 超边) |
| **视角** | 知识组织形态学 | **新架构** + 量化数据 |
| **核心结论** | 知识图谱是答案,本体论是灵魂 | **SAG 超边 + SQL JOIN** 是新 SOTA |
| **核心痛点** | 向量检索"语义检索神话"根本性脆弱 | **向量 RAG + GraphRAG 都搞不定多跳** |
| **解决方案** | 混合架构(图谱+向量+本体) | **event-entity 超边 + 双路并行 + SQL JOIN** |
| **生产规模** | 未量化 | **5 亿+ 生产数据** |
| **量化数据** | 概念层 | **Recall@2 79.3% (+11.1 vs HippoRAG 2)** |
| **技术新颖性** | 综合综述 | **SQL JOIN 替代 PageRank** / **代词消歧** / **同一实体不同角色向量化** |

### 关键独到判断(本来源独家)

- **范式 3 演进**: 向量 RAG → GraphRAG → SAG 超边 —— RAG 已进入第三代
- **event-entity 超边模型**(本来源独家): 不建图谱 / 不做三元组 / 不搞全局图,用 SQL JOIN 替代 PageRank
- **代词消歧代码细节**(本来源独家): 子事项强制替换"他"/"该公司" → 每个 event 独立可搜不依赖上下文
- **同一实体不同角色描述**(本来源独家架构细节): "OpenAI 发布 GPT-5"和"OpenAI Sam Altman 创立"在向量空间是不同点 → 召回更精准
- **纯语义 vs 结构化融合**(本来源独家消融数据): 纯语义 56.2% → 加结构化 80.0% (+23.8 百分点) → 双路并行必要性
- **谓词不稳定问题**(本来源独家观察): 同一件事不同模型可能抽 4 个不同谓词 → 三元组路线的根本性弱点
- **5 亿生产规模**(本来源独家): 不是 benchmark 模拟数字,是生产环境稳定运行
- **快速模式 vs 高精度模式**(本来源独家): 同一架构不同模式,速度和准确率权衡

### 实践启示(本来源补全)

- **RAG 已进入第三代**: 向量库 → GraphRAG/HippoRAG → SAG event-entity 超边 —— 跟进 SOTA 很重要
- **不要被 GraphRAG 三元组路线绑架**: 谓词不稳定 + 全局 PageRank 难增量更新是结构性弱点
- **代词消歧是 RAG 鲁棒性的关键**: 每个 chunk/event 都应该是独立可搜的完整描述
- **双路并行必要性**: 纯语义 56.2% vs 加结构化 80.0% → **结构化召回不应被语义检索取代**
- **SQL JOIN 替代 PageRank**: 5 亿级数据规模下,SQL 关系扩展比全局图排序更可扩展
- **同一实体不同角色**: 向量化时考虑实体在不同上下文的不同含义,避免混淆
- **代词消歧 + 独立可搜 + 完整语义** = SAG event 的三大特征,值得借鉴到所有 RAG 系统的 chunk 设计

→ [第2原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/sag-sql-retrieval-augmented-generation-zleap-ai-2026-06-16.md)

## 第 3 来源 — VibeCoder「SAG 知识引擎：用 SQL 做 RAG」(Vibe编码, 2026-06-17)

> Source: [第3原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/sag-knowledge-engine-sql-rag-vibecoder-vibe-2026-06-17.md)
> Publisher: Vibe编码 / Author: VibeCoder
> 视角: **源码级实现 + Agent MCP 集成视角** (与第 2 来源的"架构对比与生产数据"视角互补)
> 与第 2 来源的关系: 同一篇 Zleap AI SAG 论文,不同公众号(Vibe编码 vs AGI Hunt)的二次解读。VibeCoder 提供了源码行号级别的实现细节 + Agent 工具集成接口 + 消融实验数据。

第 1 来源 (2026-05-04) 讲**向量库/知识图谱/本体论**三种知识组织形态的对比。第 2 来源 (2026-06-16) 是 **Zleap AI 团队 SAG 新 SOTA RAG 概览 + 范式对比**。本来源 (2026-06-17) 是 **VibeCoder 对同一篇 SAG 论文的源码级深度解读** —— 给出具体的源文件路径、MCP 工具集定义、检索 SQL 实现、消融实验数据,补全 SAG 在 **"Agent 如何消费知识"** 与 **"工程落地细节"** 这两个视角。

### 互补角度 7 条

1. **源码级文件路径引用** (本来源独家): `src/services/webui-service.ts:131`(上传入口)/ `src/services/ingestion-service.ts:55`(入库流程)/ `src/ingestion/chunking/markdown.ts:34`(切片)/ `src/ingestion/extract/extractor.ts:4`(抽取,含 `.slice(0, 1)` 强制融合)/ `src/services/search-service.ts:92`(多路检索主流程)/ `src/db/repositories.ts:465`(实体库 SQL)/ `src/mcp/server.ts:17`(MCP server 起点)与 `:110`(UUID 校验)/ `src/services/mcp-agent-service.ts:434`(WebUI Agent 清理工具参数)—— 比第 2 来源的"4 表结构"描述更具体到行
2. **MCP 工具集 4 个定义** (本来源独家): `sag_ingest_document`(写入)/ `sag_search`(检索+trace)/ `sag_explain_search`(调试链路)/ `sag_get_event`(回查事项)—— 提供 Agent 消费 SAG 的标准接口形态
3. **项目边界服务端控制** (本来源独家): MCP server 启动时通过 `SAG_MCP_SOURCE_ID` 绑定当前项目,`src/mcp/server.ts:110` 校验 UUID;WebUI 内置 Agent 在 `src/services/mcp-agent-service.ts:434` 删除工具参数里的 sourceId/sourceIds/projectId/projectIds—— **Agent 不需要也无法指定项目边界**,服务端单向控制,降低误用风险
4. **检索两模式 fast vs standard** (本来源独家):
   - `fast` 模式: 不调用 LLM 抽 query entities,直接在实体库做全文检索 + trigram 相似度 + 实体名包含关系 + 精确匹配(`src/db/repositories.ts:465`)
   - `standard` 模式: 让 LLM 先抽查询实体,再做实体名称 + 向量召回
5. **Trace 调试数据结构** (本来源独家): SAG trace 记录 `queryEntities`、`recalledEntities`、`expandedEventIds`、`rerankedEventIds` 与 `timings` 五个阶段,检索失败时可定位到实体抽取 / SQL 连接 / rerank 哪个环节出问题——对 Agent 系统级调试极有价值
6. **消融实验数据** (本来源独家补充):
   - 关闭查询时扩展: MuSiQue Recall@5 从 **80.0% → 69.4%** (降 10.6pp,共享实体扩展对多跳证据至关重要)
   - event hyperedge 拆三元组: Recall@5 从 **80.0% → 77.1%** (降 2.9pp,完整事项比碎三元组更稳)
   - 候选 event 从 100 → 200 → 500: 收益迅速变小,**直接变成 LLM token 成本与延迟**
7. **SAG 短板公开承认** (本来源独家): 实体合并很轻(字符串归一 + SQL 唯一键),别名/缩写/同义词可能分裂成多个索引点;低频桥接实体可能在扩展早期被剪枝—— 与第 2 来源的"5 亿生产规模乐观结论"形成对照,补全工程落地的真实约束

### 与第 2 来源的关系定位

| 维度 | 第 2 来源 (尹John / AGI Hunt 2026-06-16) | 第 3 来源 (VibeCoder / Vibe编码 2026-06-17) |
|------|------------------------------------------|----------------------------------------------|
| **核心视角** | 论文概览 + 范式对比 + 生产数据 | **源码实现 + Agent MCP 集成** |
| **量化数据** | Recall@2 79.3% / Recall@5 80.04% / 5 亿生产 | **消融: 80.0%→69.4% (无扩展) / 80.0%→77.1% (三元组)** |
| **代码细节** | 4 表结构概述 | **8 个具体源文件路径 + 行号** |
| **Agent 集成** | 未涉及 | **MCP 4 工具 + 项目边界服务端控制 + WebUI Agent 工具参数清理** |
| **失败调试** | 未涉及 | **Trace 5 阶段结构(queryEntities/recalledEntities/...)** |
| **承认的短板** | 未明确披露 | **轻量实体合并 / 低频桥接实体剪枝** |
| **生产规模** | 5 亿级 | 未量化(侧重实现而非规模) |

### 关键独到判断(本来源独家)

- **Agent 集成优先的工程视角**: VibeCoder 直接给出 `sag_search / sag_explain_search / sag_get_event / sag_ingest_document` 4 个 MCP 工具,Agent 集成路径清晰可参考
- **项目边界服务端收口设计** (本来源独家): `SAG_MCP_SOURCE_ID` + UUID 校验 + Agent 工具参数清理 = 三重防护,**Agent 无法越界访问其他项目知识** —— 比"让 Agent 自己传 projectId"的常见做法更安全
- **共享实体扩展是 SAG 的关键差异化** (本来源独家消融验证): Recall@5 从 80.0% 掉到 69.4% 说明 **如果去掉扩展,SAG 退化成普通向量检索**——共享实体扩展是 SAG 的灵魂,不是可选项
- **完整 event 比三元组稳** (本来源独家消融验证): 80.0% → 77.1% 的 2.9pp 差看似小,但意味着 **拆解上下文本身有信息损失**,完整事件保留更多语义信号
- **候选数量边际递减** (本来源独家消融验证): 100 → 200 → 500 收益迅速变小,**应将候选上限设为 100-200 之间**——超过即浪费 token,反而引入噪声
- **Trace 5 阶段结构** (本来源独家): queryEntities/recalledEntities/expandedEventIds/rerankedEventIds/timings —— 给所有 RAG 系统做 trace 提供了参考模板
- **源码行号是工程落地信任信号** (本来源独家隐含): VibeCoder 给的 8 个具体 `file.ts:line` 引用,意味着文章不是 PPT 级概述,而是真正读源码的产物——可信度高于"概述级二手解读"

### 实践启示(本来源补全)

- **Agent 集成 RAG 应优先 MCP 化**: 4 个工具(sag_search / sag_explain_search / sag_get_event / sag_ingest_document)形态清晰,值得所有 RAG 系统参考
- **项目边界应服务端单向控制**: 不要让 Agent 传 projectId,服务端用 `SOURCE_ID` 环境变量 + UUID 校验 + Agent 工具参数清理三重防护
- **RAG 系统都应实现 5 阶段 trace**: queryEntities / recalledEntities / expandedEventIds / rerankedEventIds / timings,失败时可定位环节
- **候选上限设 100-200 之间**: 超过即边际递减,反而引入噪声 + 浪费 token
- **不要拆解完整事件**: 拆成三元组会损失 2.9pp 的 Recall@5,完整 event 保留更多上下文
- **共享实体扩展是核心差异化**: 去掉共享实体扩展 Recall@5 暴跌 10.6pp 到 69.4%,本质退化成普通向量检索
- **SAG 的代码结构可参考**: 4 张表 + 1 个 MCP server + 1 个 webui-service + 1 个 ingestion-service + 1 个 search-service + 1 个 mcp-agent-service,职责清晰可拆分

→ [第3原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/sag-knowledge-engine-sql-rag-vibecoder-vibe-2026-06-17.md)

---
