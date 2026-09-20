# MFS：zilliztech 的 Agent 统一上下文 harness，一套动词打通 20+ 数据源

> 📊 Level ⭐⭐⭐⭐ | 12.6KB

## 核心概述

zilliztech 的 MFS（Multi-source File-like Search）是一个开源 Agent 上下文管理基础设施，将 20+ 数据源统一成一棵可检索的文件树，用同一套 shell 动词（ls/tree/cat/grep/search）+ URI 寻址（`<scheme>://`）触达所有数据。在 MFS 之上，Open Tag 复刻了 Claude Tag 的 Brain/Memory/Tools 三要素工作流。

→ [原文存档](https://mp.weixin.qq.com/s/LbShWt6lk_ttJPb191CpPg)

## 三层关系

| 名字 | 性质 | 角色 |
|------|------|------|
| **Claude Tag** | Anthropic 官方产品 | 被复刻的范式 |
| **MFS** | 开源基础设施（Apache-2.0） | 底层地基 |
| **Open Tag** | 开源示例应用 | 对 Claude Tag 工作流的参考实现 |

MFS 是 Open Tag 的 Memory 引擎，Open Tag 是 MFS 之上对 Claude Tag 工作流的开源复刻。

## MFS 架构

**瘦客户端 + 有状态服务器**，对外只暴露一个 HTTP `/v1` 接口。

- **客户端无状态**：`mfs` CLI（Rust）、Python/TS SDK、两个 Agent Skill（`mfs-ingest` 注册索引 + `mfs-find` 跨源查找）
- **服务端集中状态**：配置、凭据、任务队列+workers、engine/connectors/processors、数据后端

### 同一套动词到处适用

无论数据源是什么，统一用 `<scheme>://` URI 寻址 + 同一套动词：`ls / tree / cat / head / tail / grep / search`。Agent 本来就会说 shell，学一次到处用。

### Search + Browse 双路径

- **Search**（需索引）：混合检索（dense 向量 + BM25 关键词）或精确匹配
- **Browse**（不需索引）：渐进式定位到字节/记录级别
- 每条结果带 locator（行号区间或主键字典），Agent 知道精确去哪读

### 后端按配置切换

本地零 key 零 GPU 起步（Milvus Lite + SQLite + 本地 ONNX BGE-M3），改配置即切到生产（Zilliz Cloud + Postgres + S3）。索引是派生的、crash-safe 的——上游数据源永远是真相源头。

## Open Tag：Claude Tag 三要素映射

| 要素 | Claude Tag | Open Tag |
|------|-----------|----------|
| Brain | Anthropic 托管模型 | CLI backend（claude / codex） |
| Memory | Anthropic 端托管 | MFS 索引的授权上下文 |
| Tools | Anthropic 平台工具 | MFS Connector 暴露的检索+工作区工具 |

**Slack bridge 极薄**——只做 5 件事（接收 mention → 读线程 → 发临时回复 → 调 agent → 替换回复），所有智能在 backend agent 里。每次 mention = 全新 agent 进程，无跨对话状态。

### 记忆边界

通过 `MFS_ALLOWED_SCOPES` 环境变量 + helper 脚本的 `is_scope_allowed()` 检查强制执行。不靠 Agent 自觉，靠系统拦。

### 诚实边界

Open Tag 是 demo/reference implementation，不是生产安全边界——没有加固沙箱、多用户策略、审计系统。**真正优势在 Memory 广度**：20+ connector 覆盖 Postgres/MongoDB/BigQuery/S3/GitHub/Jira/Slack/Discord/Gmail/飞书/Notion，全部自托管。

## 凭据管理

配置只放引用不放明文（`token = "env:SLACK_BOT_TOKEN"`），CLI 和 Agent 永远碰不到原始凭据。

## 深度分析

### 动词是预训练里的高频接口，工具 schema 是分布外的低频词

shell 动词的优势不只是"短"。`ls` / `cat` / `grep` / `search` 这类符号在预训练语料里出现的次数是海量的，模型对它们的语义、参数惯例、输出形态都握着稳定的先验，调用时接近条件反射，选择成本近乎为零。反过来，一个自定义工具名配一份 JSON Schema 描述，属于训练分布里的低频甚至零频组合：模型每选一次都要现场读懂参数含义、判断适用边界，读 schema 的代价既是 token 开销，也是错误来源。MFS 把 20+ 数据源的能力重新收束成同一套动词，本质是用模型已有先验去换 token 预算和选择准确率——候选动词只剩个位数，误选空间被结构性地压小，参数说明也不必作为常驻文本长期占住上下文。

这套设计有一层隐含代价需要点出：动词的通用性建立在它只承诺"定位与读取"、不承诺"理解语义"之上。`grep` 不会替你判断哪条记录更重要，`search` 也只是按相似度排序。把语义判断留给 agent、把定位能力交给文件树，是接口能长期保持稳定而不必频繁扩词的前提；这也解释了为什么 [工具使用模式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/tool-use-patterns-ai-agents.md) 的收敛方向总是"更少、更通用的动词"，而不是"更多、更专用的函数"。

### 文件树作为通用命名空间：URI 把异构源压成一层可遍历结构

每个后端都有自己的定位词汇：Postgres 是表与主键，S3 是对象键，Slack 是频道加时间戳，GitHub 是仓库与路径。如果把这些差异原样暴露，agent 就得为每个源单独维护一份"东西放在哪、怎么找"的心智模型，新增数据源等于让模型重新学一遍。`<scheme>://` 寻址做的是一次降维：把所有异构定位方式翻译成"路径 + 内容"这唯一一种形状，agent 只需要一套搜索与浏览直觉，不必记住哪个后端支持哪种查询语法——[Context Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md) 意义上的"上下文构造"在这里被化简成了一次寻址。

这层命名空间更大的价值在于可组合——既然所有源都长成文件树，同一个动词就能跨源串联，从 Slack 线程落到 GitHub 代码再回到 S3 里的原始文档，路径拼接不需要任何桥接代码。同时，可遍历性带来纯检索接口给不了的探索能力：agent 可以先 `ls` 看清格局，再决定读哪一个，而不是一次性接受一个排好序的答案列表。

### 工具列表膨胀后的选择退化，与分级返回的上下文预算

[MCP](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-context-protocol-mcp.md) 式集成有个现实代价：工具数量只增不减。每接入一个系统就多出几条工具定义，它们要常驻上下文——工具定义本身就是一笔要计入 [上下文预算](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-window-economics.md) 的固定开销；而候选越多、语义越接近，模型选错的概率越高——工具选择准确率并不随工具数线性增长，越过某个点后反而退化。把 N 个工具压回 5 个左右动词，等于把"N 选 1 挑工具"的难题换成"固定动词 + 不同 URI"，选择复杂度从工具总数转移到了路径上，而路径错误至少是可观测、可纠正的。

Search / Browse 双路径是同一问题的第二次作答。Search 要求先建索引，换回的是混合检索（dense 向量 + BM25 关键词）的召回；Browse 完全不依赖索引，靠 `ls` / `head` / `tail` 渐进式逼近字节或记录级目标。真正省 token 的细节是返回粒度：每条命中只带 locator（行号区间或主键字典），交付的是"去哪读"而不是"已经读完"，读取得以按需发生，候选内容不必一次性灌进上下文。

### 记忆边界与诚实边界是两类约束，混在一起会让 agent 把不确定当事实

`MFS_ALLOWED_SCOPES` 加 helper 脚本里的 `is_scope_allowed()` 检查，管的是"能动什么"：越出授权范围的检索请求在进入 `/v1/search` 之前就被脚本挡掉，不依赖 agent 的自觉。Open Tag 明确声明自己是 demo/reference implementation 而非生产安全边界——没有加固沙箱（可参见 [Agent Sandbox](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-sandbox.md)）、多用户策略引擎、审计与审批流——管的是"能保证什么"。前者是能力边界的硬拦截，属于 [Agent 记忆架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-architecture.md) 里的存取控制那一层；后者是对自身保证强度的诚实声明，属于产品定位层面的自陈。

两类约束一旦混为一谈，最典型的失败模式就是 agent 把"我没被拦住"读成"这件事我确定能做"。范围检查通过只说明请求在授权内，不说明结论可靠；demo 定位只说明功能跑得通，不说明它扛得住攻击或多人并发。把能力边界做成系统层拦截、把保证强度写成对外显式声明，agent 才不会把不确定性顺手当成事实。

### 凭据管理与后端可切换：可移植性背后的验收代价

凭证在 MFS 里只以引用形式出现——`env:SLACK_BOT_TOKEN` 指向环境变量，`file:/run/secrets/...` 指向挂载的密钥文件——CLI 与 agent 在任何环节都接触不到原始凭据，配置文件本身因此可以安全地进仓库。这是最小权限在工具层的一种落地方式：不是要求 agent 少用凭据，而是让凭据根本不进入 prompt 和工具参数这条链路，把风险从"模型会不会乱用"搬到了 harness 层的注入时机上。

后端按配置切换（Milvus Lite / SQLite / 本地 ONNX 模型 → 自托管 Milvus 或 Zilliz Cloud、Postgres、S3、外部 embedding 服务）让同一份上层逻辑可以在离线与生产之间平移，但可移植性不是免费的：索引是派生的、crash-safe 的，上游数据源永远是真相源头——这句话的另一面是每个后端的索引重建与失败恢复路径都必须被单独验证过，否则"可切换"只是配置项层面的可切换，而验收成本被推迟到真正切换的那一天。

## 实践启示

这套设计可以拆成几条能直接搬进自己 harness 的判断。

1. **新数据源先问能不能映射成 shell 动词 + URI**：优先复用 `ls` / `cat` / `grep` / `search` 这套模型熟悉的接口，而不是为每个源新造工具名与参数 schema——前者近乎零学习成本，后者每次调用都要付 schema 阅读税。
2. **给工具总数设上限**：当工具数量增长到选择开始变难时，主动把若干专用工具合并成"一个动词 + 不同寻址"，把 N 选 1 的选择题降级为路径拼接题。
3. **检索结果交付 locator，而不是正文**：只告诉 agent 精确去哪个文件、哪段行、哪条记录，读取动作按需发生，避免候选内容一次性挤占上下文。
4. **把授权约束写成代码拦截，而不是提示词里的叮嘱**：范围白名单、路径校验放在调用前的中间层或 helper 里强制执行，别指望 agent 靠自觉守边界。
5. **凭据只保留引用，并单独声明"非生产安全边界"**：配置里写 `env:` / `file:` 引用让凭据不落 prompt 与仓库明文，同时显式标注缺失的沙箱、审计、多用户策略，避免把"能跑"当成"安全"。
6. **后端可切换就必须按后端验证重建路径**：既然索引派生自上游数据源，就要为每个候选后端单独跑通索引重建与故障恢复，否则可移植性只是纸面能力。

## 关联

- Introducing Claude Tag — Open Tag 复刻的 Anthropic 范式
- [Anthropic Knowledge Work Plugins 分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/knowledge-work-plugins-anthropic-source-analysis.md) — Skills 的渐进式披露，MFS 用不同方式解决相同问题
- [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md) — MFS 作为 Agent 上下文 harness 的基础设施层

---

