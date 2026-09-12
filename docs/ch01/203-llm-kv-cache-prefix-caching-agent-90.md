# LLM 缓存原理与实践：从 KV Cache 到 Prefix Caching，Agent 命中率常挂 90% 的机制与工程含义

> 📊 Level ⭐⭐⭐ | 17.9KB | `entities/llm-prefix-caching-comprehensive-guide.md`

## LLM 缓存原理与实践

> 原文归档：[原文归档](https://mp.weixin.qq.com/s/bsSBfvWyLUEdFHFZmFOckQ)

LLM 缓存技术的完整梳理，从 KV Cache 第一性原理到 Prefix Caching 跨请求复用，再到 vLLM/SGLang 引擎实现和四家商用模型落地策略，最后揭示 agent 工作负载如何天然匹配"只追加"模式驱动 90% 缓存命中率。

## 一句话

**Agent 多轮对话的"只追加"模式天然匹配 Prefix Caching 的前缀精确匹配规则，导致主力模型缓存命中率普遍落在 90% 上下——这不是某家模型的特殊能力，而是工作负载形态的必然结果；高命中率本身也不等于低成本，因为它意味着每一轮都把整段大上下文重发了一遍。**

### KV Cache：推理地基

自回归模型每生成一个新 token，都需要"回看"前面所有 token 计算注意力。KV Cache 将历史 token 的 Key/Value 缓存下来避免重算，把每步计算从 O(n²) 降到 O(n)。但局限是默认只在单请求内有效，无法跨请求复用。

### Prefix Caching 的两条铁律

1. **必须精确匹配**：RoPE 位置编码下，每个 token 的 K/V 既取决于内容也取决于位置，前缀中间一改后面全废
2. **只能追加**：在已缓存内容后面接新内容，缓存照命中；插改前置内容则全部失效

推论：稳定内容（系统提示、工具定义）放在最前面，易变内容（用户问题、时间戳）放最后。

### 缓存技术的四个方向

| 方向 | 技术 | 核心思想 |
|------|------|---------|
| 内存管理 | PagedAttention (vLLM) | KV Cache 分页虚拟化，显存浪费 60-80% → <4%，吞吐 2-4× |
| 前缀复用（哈希表） | vLLM APC | 定长 block 链式哈希，LRU 淘汰 |
| 前缀复用（前缀树） | SGLang RadixAttention | 基数树显式建模共享前缀，递归 LRU 叶子淘汰，吞吐最高 6.4× |
| 位置无关缓存 | Prompt Cache / CacheBlend / EPIC | 突破"必须是前缀"限制，模块化预计算/KV 融合/attention sink 修正 |

所有四个方向的详细机制见原文。

### 四家商用模型缓存落地对比

| 维度 | Claude | OpenAI | Gemini | DeepSeek |
|------|--------|--------|--------|----------|
| 开启 | 手动/自动 | 全自动 | 隐式+显式 | 全自动 |
| 命中折扣 | ~0.1× | ~5折→90% | ~75% | ~1/10 |
| TTL | 5min(自动续) | 5-10min | 1h(可自定义) | 数小时至数天 |
| 最小粒度 | 1024-4096 | 1024(128增量) | 1024-2048 | **64 token** |
| 存储 | 厂商侧 | 厂商侧 | 厂商侧 | **硬盘阵列(MLA压缩)** |

DeepSeek 的硬盘缓存方案独树一帜：靠 MLA 架构大幅压缩 KV 体积，得以低成本落地到分布式硬盘上长期保留。

### 命中率 ≈ (T−1)/(T+1)

agent 多轮对话的"只追加"模式使前缀不断增长。简化模型推导得出命中率公式 ≈ (T−1)/(T+1)：

| T（会话轮数） | 命中率 |
|--------------|--------|
| 10 | 81.8% |
| 20 | 90.5% |
| 40 | 95.1% |

典型 agent 编码会话十几到几十轮工具调用，命中率自然落在 90% 上下。TTL 短但每次命中自动续期，整场会话几乎不过期。

### 反直觉提醒

高命中率 ≠ 低成本。命中率高恰恰是"每轮都重发整段大上下文"的副产物。真实成本 = 命中读 + 写入 + 未缓存三部分总和。降成本的杠杆往往在掉到 50% 的少数流量上（绑定单一模型、稳定工具集），而非已 90% 的主力模型。

## 本实体与现有 wiki 的关系

本实体是 wiki 中首个系统性覆盖 LLM 推理缓存的实体。与以下实体形成互补：

- 与 [DeepSeek 成本迁移与系统层 KV Cache + Harness 工程](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-cost-migration-system-layer-kv-cache-harness.md) 互补——该实体聚焦 DeepSeek 的迁移案例，本文提供全行业全景
- 与 [OpenClacky Prompt Cache Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclacky-prompt-cache-harness-v2ex-799662c56ba6.md) 互补——该实体聚焦特定提示缓存方案，本文覆盖原理和所有主流方案
- 与 [Claude Cache Tokenomics](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tokenomics-the-625-minute-rule-for-claudes-cache.md) 互补——该实体聚焦 Anthropic 的 5 分钟 TTL 机制，本文提供跨厂商对比

## 第 2 来源 — SageMaker 前缀感知路由：把 cache 局部性提升到路由层（2026-09-10）

前文的四方向缓存技术与四家商用落地方案都聚焦**单实例/单请求内**的前缀复用；本节补充**跨副本维度**——当服务水平扩展成实例队列后，prefix caching 会被负载均衡"打散"而失效，路由层必须配合。来源：[AWS ML Blog](https://aws.amazon.com/blogs/machine-learning/reduce-llm-latency-with-prefix-aware-routing-on-amazon-sagemaker-inference)

- **问题**：随机路由把同一前缀分散到不同实例，没有实例能看到足够频繁的同一前缀，KV cache 建不起来——prefix caching 即使开着也几乎不命中，实测命中率仅约 25%。
- **方案**：prefix-aware routing 看请求开头（prefix）做一致性路由，同一 prefix 固定落到同一实例，让该实例的 KV cache 真正热起来；无需人工打 affinity 标签或管理会话粘性。
- **实测（Llama 3.1 70B Instruct、7×ml.p5.48xlarge、vLLM 开 prefix caching）**：长上下文（8,000-token 共享前缀，持续 1 小时）P50 TTFT −71~77%、P90 TTFT −33~37%、KV cache 命中率 25%→82%、吞吐 +15~16%；短上下文（ShareGPT 式变长对话）P50 TTFT −13~16%、吞吐 +1.7~2.0%。路由逻辑开销 1.3~1.9ms/请求（同期 TTFT 63~280ms），流量分布 13.3~15.4%（理想均分 ±1%，无热点）。共享前缀越长，收益越大。
- **两项内置保护**：过载保护（目标实例达到 ConcurrencyThreshold 时改投较闲实例，牺牲单次命中换不压垮单机）；扩缩容稳定（增删实例时仅少量流量迁移，缓存不因 scale 事件整体失效）。
- **工作负载模式映射**（比前文的"agent 多轮"更完整）：RAG（共享检索文档前缀）/ 多轮对话（历史前缀随轮次增长）/ 模板化 bot 与助手的结构化长指令 / 代码补全（同一文件内容为前缀）。
- **配置旋钮**：PrefixLength（1024–65536；原生 Invoke API 按请求体字节计，OpenAI 兼容 API 按抽取后的 message 文本字符计）与 ConcurrencyThreshold（1–1024）；三种路由策略 RANDOM / LEAST_OUTSTANDING_REQUESTS / PREFIX_AWARE 可按 production variant 切换，无需重新部署模型。
- **与前文的关系**：前文给出"必须精确匹配 / 只能追加 / 稳定内容放前面"的缓存铁律与 ≈(T−1)/(T+1) 的 90% 命中率推导；本节补充**这些铁律在多实例服务拓扑下的前提——路由必须保持前缀一致性，否则命中率从 90% 掉回 25%**。与 [分级 KV Cache：跨副本 shared L2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tiered-kv-cache-large-llms-sagemaker-hyperpod-curvine.md) 同源（都是"路由到不同副本 = 冷启动"），后者用存储层级（跨节点 NVMe 共享 L2）解决，本节用路由层解决。
- **互补角度小结**：① 跨副本路由失效问题（前文未覆盖）② 量化 benchmark（TTFT/命中率/吞吐/开销四组数）③ 三种路由策略对比与适用前提 ④ RAG/多轮/模板/代码补全四类工作负载映射 ⑤ 两个可调配置旋钮与过载/扩容保护语义。

## 第 3 来源 — Mooncake 集群级 KV Cache 池化：把缓存从节点私有资源变成集群共享池（2026-09-11）

前两节分别覆盖**单实例内的前缀复用原理**（第 1 来源）与**跨副本路由层**（第 2 来源）；本节补充第三层——**池化层**：当单机缓存无法继续扩展时，把分散在各节点的 DRAM 组织成集群级共享 KV Cache 池，并解除"缓存位置约束调度"的耦合。来源：[量子位（趋境科技、KVCache.AI 投稿）](https://mp.weixin.qq.com/s?__biz=MzIzNjc1NzUzMw==&mid=2247921612&idx=3&sn=093fb9795201626263820bf95a370eac)

- **问题升级（单机缓存的边界）**：先在生产环境引入 **SGLang HiCache** 把容量更大的 Host DRAM 纳入 KV Cache 层级，命中率与可用容量明显提升；但系统扩到日均万亿级 Token 后单机边界显现——单节点 DRAM 容量有限、分散在不同节点的重复 KV Cache 无法共享、且同一节点多个 TP Rank 会分别保存缓存（单节点最高 **8×** 数据冗余）。更关键的是**单机缓存把"KV Cache 位置"与"请求执行位置"绑定**：某段缓存只存在于特定 Prefill 节点时，为复用就必须把请求继续调度到那些节点，使本应由实时负载/请求特征/资源状态决定的调度被缓存位置约束。
- **调度耦合的代价**：若为命中率持续把相同前缀的请求路由到少数 Prefill 节点，会概率性出现热点堆积、违反 TTFT SLO；但为缓解热点把请求迁到其他节点，又会因 KV Cache 无法跨节点复用而触发大规模重算，高峰时把压力传导到新节点。对万亿级 Token 工厂而言，这已不只是几个百分点命中率问题，而是**集群调度空间、峰值吞吐承载、故障应对与 SLO 保障**的系统性问题。
- **方案：Mooncake Store 把节点内存池化为集群级共享资源**，目标同时做到三件事——进一步提升命中率、解除 KV Cache 存储位置对集群调度的约束、对推理关键路径不引入额外性能开销与系统风险（第三点最难）。架构上采用 **Prefill-Decode 分离**且**仅在 Prefill 节点开启 HiCache**（长上下文开销集中在 Prefill，缓存命中可直接减少首 token 前的大量重复计算；Decode 侧优先保持链路简单稳定）；**Store Service 独立部署在所有 Prefill/Decode 节点**，Decode 节点 Host Memory 主要给 Mooncake Store，Prefill 节点由 HiCache 与 Store 共用；HiCache 内嵌的 Mooncake client **不持全局缓存空间**（全局空间由独立 Store Service 进程持有），使推理引擎与缓存系统解耦、可各自独立升级扩缩容。
- **取回链路**：Prefill 请求先查本地 HiCache，未命中部分经 RPC 向 Mooncake Master 查询元数据，再经 RDMA 从多个 Store 节点并行取回，数据就绪后才进入 GPU 执行剩余 Prefill；新算出的 KV 再写回 Store，Master 持续维护元数据并执行 LRU 淘汰。HiCache 在请求进入调度队列后**尽早异步发起远端 prefetch**，使网络传输与 GPU 计算重叠——只要数据在 GPU 开始处理当前请求前就绪，缓存系统开销"几乎无感"；反之读取落后于调度节奏，GPU 就会空等，缓存反而制造新的 TTFT 开销。
- **生产规模量化数据**：日均高品质 AI Token 稳定突破**一万亿**；自 2026 年春节以来平均单台算力 Token 生产效率提升 **>3×**、总 Token 产能增长 **>30×**；KV Cache 命中率显著提升并**稳定在 90% 以上**；线上 KV Cache 批量读取平均延时 **<50ms**、绝大多数请求 <100ms，未观察到 RDMA 传输成为主要性能瓶颈（800Gbps 网卡 + Transfer Engine 多网卡池化 + 拓扑感知路径选择）。
- **Mooncake Master 并发/锁工程优化（长文核心）**：Master 元数据哈希为 **1024 个 shard**、每 shard 独立读写锁；eviction 线程逐个获取 shard 写锁会长时间占用写锁并阻塞读写请求、显著抬高延迟。优化分两条线——提升 eviction 执行效率（大幅减少字符串拷贝、对象构造与内存分配开销；允许推理引擎多个 rank 写同一对象的不同位置，大幅减少缓存对象数量）与降低锁竞争（把 replica 销毁与内存释放等耗时操作移出 eviction 写锁临界区；进一步把 **shard 粒度锁细化为对象粒度锁**）。
- **扩缩容性能优化**：Store 节点上线需申请数 TB 内存并注册到多张 RDMA 网卡、下线需注销并释放，过程极其耗时 → 针对内存初始化与 RDMA 注册做性能优化（数倍提升）并支持大页；Master 侧节点下线需遍历所有 shard 清理该节点数据（否则后续请求读到已下线节点数据而失败），元数据量大时拖慢下线 → 需专门优化下线流程。集群扩展采用**逐级放大**（小规模验证 → 测试集群长稳 → 线上灰度 → 全面上线）把扩展本身变成可控可重复的工程流程。
- **部署拓扑**：考虑单机 NUMA 拓扑（每节点 2 个 NUMA Node），各绑定一个 Store Service 以保持 KV Cache 本地访问与网络传输的 NUMA 亲和、充分利用 Transfer Engine 的拓扑感知传输；控制面 Mooncake Master **三副本（一主两从）部署在三个 GPU 节点**，依赖的 etcd 同样三副本并与其它管理组件部署在独立 CPU 节点；集群分组内请求调度基于 **SMG（SGLang Model Gateway）**——Prefill 侧综合本地 HiCache 命中率、节点实时负载、节点状态与请求特征做决策，在满足 SLO 前提下提升吞吐、降低 TTFT；Decode 侧尽量把生成负载均摊到多个 Decode 实例以保尾延迟；Kubernetes 层用 **RBG（RoleBasedGroup）** 统一管理 SGLang 与 Mooncake 工作负载，使 Prefill/Decode/Store 作为整体编排（etcd 独立运行不纳入 RBG）。
- **与本节（第 1 来源）的关系**：前文把 90% 命中率解释为"引擎内缓存策略 × agent 只追加工作负载"的必然结果，并给出 ≈(T−1)/(T+1) 推导；本节说明在集群规模下命中率还与**缓存能否跨节点共享**、**调度能否自由迁移**直接相关——即使引擎内前缀复用做到极致，只要 KV Cache 仍是节点私有资源，缓存复用与集群调度就仍然耦合，规模化收益会触顶。与 [分级 KV Cache：跨副本 shared L2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tiered-kv-cache-large-llms-sagemaker-hyperpod-curvine.md) 互补：后者用**存储层级**（跨节点 NVMe 共享 L2）扩展容量，本节用**分布式内存池**（Mooncake Store + RDMA）同时扩展容量并解除调度耦合；与 [算力亲和 KV Cache 调度](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openjiuwen-compute-affinity-kv-cache-scheduling-2026.md) 互补：后者聚焦调度器对缓存亲和与算力亲和的联合权衡，本节提供缓存侧池化的基础设施前提。
- **互补角度小结**：① 单机 → 集群级缓存池化（前两节未覆盖的第三层）② 缓存位置与集群调度解耦（"缓存不再约束调度空间"）③ 生产规模量化数据（万亿 token/日、3×/30×、>90%、<50ms）④ Mooncake Master 并发/锁/eviction 与扩缩容工程优化细节 ⑤ PD 分离 + SMG 调度 + RBG 编排 + NUMA 亲和 + Master/etcd 三副本的部署拓扑。

## 标签

#LLM推理 #KVCache #前缀缓存 #PagedAttention #RadixAttention #推理优化 #成本优化 #延迟 #Agent工作负载 #vLLM #SGLang

→ [原文存档](https://mp.weixin.qq.com/s/bsSBfvWyLUEdFHFZmFOckQ)

→ [第 2 来源原文存档](https://aws.amazon.com/blogs/machine-learning/reduce-llm-latency-with-prefix-aware-routing-on-amazon-sagemaker-inference)

→ [第 3 来源原文存档](https://mp.weixin.qq.com/s?__biz=MzIzNjc1NzUzMw==&mid=2247921612&idx=3&sn=093fb9795201626263820bf95a370eac)

---

