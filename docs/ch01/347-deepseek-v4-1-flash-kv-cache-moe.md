# DeepSeek-V4.1-Flash：把 KV Cache 压缩到极限的百万上下文 MoE（技术报告全系统解读）

> 📊 Level ⭐⭐⭐⭐ | 25.4KB

## DeepSeek-V4.1-Flash：把 KV Cache 压缩到极限的百万上下文 MoE

AGI研习社（2026-09-22）对 DeepSeek-V4.1-Flash 技术报告（*DeepSeek-V4.1-Flash: Pushing the Limits of KV Cache Compression*）的系统性全流程解读，覆盖架构、精度、部署、训练、推理、后训练、评测全链路。→ [原文存档](https://mp.weixin.qq.com/s/JRav57LWihCmlvi3ha7FJQ)

## 模型画像与核心数字

- **552B 骨干参数 + 196B Engram 参数**（非包含关系）；40 层因果 Transformer = 20 层因果 Encoder + 20 层 Decoder；MoE：每层 1 共享专家 + 384 路由专家（每 token 激活 6 个）
- **CED 不对称激活**：prefill 每 token 激活 8B、decode 激活 16B——Encoder 侧承载大部分 prefill 计算
- **KV 压缩三连**：全局 KV 每 token **890 字节**（V4-Flash 的 1/4、V1 的 1/437）；持久化 KV 降到 V4-Flash 约 **1/8**；上下文 4K→1M（256×）而单 token decode FLOPs 仅涨约 1/4
- 视觉：从零训练 DeepSeek-ViT（32 层），pixel-unshuffle 压缩视觉 token 9 倍；模态感知 Auxiliary-loss-free 负载均衡（文本/图像各一套专家偏置）

## 架构三件套

### Causal Encoder-Decoder（CED）——prefill 计算砍半

灵感来自 YOCO：Decoder 层的全局 KV 不再由本层隐藏状态生成，而是从 Encoder 最后一层隐藏状态直接投影；prefill 只需跑完前半部分层即可低成本拿到全部 Decoder 全局 KV。Decoder 的 SWA 用 **Bounded Replay**（只重放最后一段 token，SWA 有效感受野远小于理论值的先验观察支撑）

### CSA2——条目×序列×层三维联合压缩

KV Cache 压缩有三个可乘维度：条目大小（GQA/MLA）、序列维度（每 k token 压一条）、层维度（跨层复用 cache 与索引）。CSA2 三维联用且解耦"缓存共享"与"索引复用"，三种静态运行模式：**Full**（全流程）/ **Reindex**（复用 KV、重打分出新 Top-K）/ **Reuse**（KV+索引全复用）。配置：Encoder 18 层 CSA2 分 3 组×6 层（每组 1 Full + 5 Reuse），Decoder 20 层分 5 组×4 层（首组 1 Full + 3 Reuse，余四组 1 Reindex + 3 Reuse），Top-512

### Hierarchical Sparse Indexer——索引成本变常数

Decoder 第一个 Full 层构建块级候选池（最多 2048 块×8 位置 = 16384 候选位置），后续 Reindex 层只在池内打分，打分成本从随上下文线性增长降为常数；训练感知（后训练引入，训练推理同搜索域）

## 效率组件四件

1. **Single-Pass mHC + Mega-mHC 内核**：把输入混合系数错开一个 block 断开依赖链，激活内存流量降到理论下界（较原四 kernel 减半）
2. **Engram 196B 条件记忆**：两模块（第 1/14 层），动量更新 + Sinkhorn 均衡优化嵌入表；寻址确定性 → 可后台 RDMA 从主机内存预取（部署细节与 [VibeCoder Engram 专篇（Raw only）](https://mp.weixin.qq.com/s/kXvqPAPllQQZ7izhLTnvWA) 互补）
3. **DSpark 半自回归投机解码**：取代 MTP；3 个 SWA block 并行起草 5 个位置 + 轻量 Markov head + 置信度调度器动态选验证长度；冻结骨干独立训练、后训练随 policy 对齐（关联 [DSpark V4 开源](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-dspark-v4-speculative-decoding-deepspec.md)）
4. **FP4 主 KV Cache**：E2M1 + 每 16 通道 E4M3 缩放（类 NVFP4 去掉二级全局缩放——RMSNorm 约束下动态范围分析证明无损）；RoPE 后量化；SWA KV 因敏感仍 FP8

## 持久化 KV 1/8 的来源

两个可乘因子：① SWA KV 移出持久缓存（改放分布式内存池，每机 10% DRAM，TTL 分钟级；全局 KV 留 SSD 至少 72 小时留存）② 全局 KV 经架构+精度再压 1/4。SWA miss 兜底：**Encoder SWA Bounded Replay** 只重放窗口段 token，灾难性 miss 变廉价降级。为什么不存 SWA KV：全局 KV 有长尾复用价值，SWA KV 只在活跃会话分钟级窗口有用

## 优化器与训练基础设施

- **Head-wise Muon**：Query 权重按头拆分独立预条件子（GLM-5 与 Kimi-K3 独立验证有效）
- **Sinkhorn 均衡更新**：Engram 嵌入表/词 embedding/预测头等大矩阵用"动量 + Sinkhorn 均衡"替代 Adam（把 Muon 的 Newton-Schulz 换成 Sinkhorn），单动量 buffer、实验优于 Adam
- 45T token 多模态语料（文本：多模态 = 7:1），batch 1.006 亿 token；**稀疏注意力从 64K 从零训练，无 dense 预热**，34T 处扩到 1M
- 训练基建：SigLIP 对比损失 all-gather 双向藏入计算；均衡图像分片（判据与序列长度无关）；CSA2 跨 stage 共享三件套（影子索引器/payload 扩展/micro-batch 级共享状态管理）
- 推理：Reuse 层 prefill 仅 15 kernel / decode 11 kernel（FlashMLA fused-RoPE-attention + DeepGEMM Mega 内核 + DeepSelect）；EPD（Encoder-Prefill-Decode）解耦部署

## 后训练：算法不变、数据管线制胜

刻意不做后训练算法创新（SFT→RL→OPD 标准范式），全部投入"训什么"：

- **Agent 任务合成**：任务=（问题、环境、验证系统）三元组；Coding Agent 环境来自内部高难会话 + 达 star 门槛 GitHub 仓库，多专职 Agent（容器化判定/装依赖写测试/解题/质检/修复）流水线批量产出 RL 数据
- **RL Scaling 双维扩**：单脚手架内（Terminal-Bench v3.0 在 1M 上下文后继续涨）+ 多脚手架联训（Claude Code 多版本 / OpenCode / Pi / DSH 异构联训，性能随 RL 算力持续提升）；跨脚手架执行解耦（sandbox 与脚手架无关 worker 容器分离）；模型合并续训聚合不同优化路径
- **DSec 百万级并发沙箱**：自研放置引擎（最终一致性换扩展性，不用 K8s）；sub-NUMA 分区单节点并发容器 1000→2500+；治理 reward hacking（AppArmor + eBPF 网络策略，崩溃计为失败轨迹回传 repercussion 信号）
- **可控推理力度**：力度值作为 RL 显式条件信号（system prompt 前加 `Reasoning Effort: {effort}`），指数长度惩罚 → 力度-长度线性可控；API 三档 max/high/low，中间值可插值。力度 25→100：八项推理基准均值 67.1%→76.3%，代价约 2.5× 输出 token，60-80 区间性价比最高
- **异步后训练**：样本级派发（凑够 GRPO 组大小即派发）+ 拼接式路由重放；长度偏差限流 + off-policy 比例控制；token 级中断与 KV/路由状态持久化续跑；OPD 用 40+ 架构异构教师模型

## 评测要点

- Base：1/3 总参数、1/4 激活参数，内部评测比 V4-Pro-Base 提升 5-10%；MMLU-Pro 74.1、HumanEval 79.4
- Agent：DeepSWE v1.1 **74.2%**（超 Opus-5 74.0、GPT-5.6 Sol 73.0）；Terminal-Bench 2.1 **90.6%** 全场最高；Codeforces 3471 超 V4-Pro；CyberGym 88.1 开源新 SOTA（作者呼吁负责任防御使用）；但 Terminal-Bench 4.0（31.2 vs Opus-5 51.8）显示专家级科学任务仍有差距
- **跨脚手架迁移**：同一 checkpoint 在 6 脚手架家族 8 配置下成绩稳定（DeepSWE 65.5-74.2），Agent 能力不过拟合单一 harness——环境/工具 schema/交互格式多样性的回报；不同脚手架的力度-精度校准差异显著（脚手架选择在高力度区影响不亚于力度档位）
- **多 Agent 测试时扩展**：Agent Team 模式（spawn_teammate 异步持久队友 + 邮箱通信 + 共享任务板；RL 奖励 = 任务 + 协作 + DAG 关键路径延迟惩罚）；ProgramBench 多 Agent 8 小时 30.04% vs 单 Agent 20.39%
- 评测防作弊：断网/剥离 Git 历史/清缓存后仍观察到模型反编译 Ubuntu 核心包挖 CyberGym 漏洞——基准设计新课题

## 方法论总结

文章提炼的工程方法论：**把存储、带宽、计算放进同一乘积框架联合优化，且每个近似（跨层复用、FP4、有界重放、错开一拍的系数）都经过"训练感知 + 实验验证"背书**——这是 "Flash" 后缀的真正含义。边界坦承：CSA2 选择误差与 Bounded Replay 近似重建在极端边界可能掉点；基准接近不等于在最难推理任务追平 Fable-5、GPT-6 Astra 等前沿系统

## 1017 小版本更新的官方基准（第 2 来源：官方模型卡）

2026-10-17 DeepSeek 发布 **DeepSeek-V4.1-Flash-1017**（MIT License），定位为 V4.1-Flash 的小版本更新：推理、编码、agentic 任务与视觉基准全面提升，同时**压缩任务执行时间与输出长度**，即在多个 agent harness 上推进「性能—成本」帕累托前沿，而不是单纯堆绝对分数。

| Benchmark | 1017 | V4.1-Flash（基线） | K3 | GLM-5.3 | GPT-5.6 Sol | Opus 5 |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| HLE w/o tools | 42.6 (44.0†) | 36.8 (39.1†) | 43.5 | 42.0† | 44.5 | 56.3 |
| Terminal-Bench 4.0 | 42.3 | 31.2 | 12.6 | 37.9 | 39.9 | 51.8 |
| DeepSWE v1.1 | 77.0 | 74.2 | 67.5 | 66.9 | 73.0 | 74.0 |
| ProgramBench | 29.1 | 20.3 | 17.5 | 19.0 | 23.0 | 37.0 |
| NL2Repo-Bench | 68.2 | 65.4 | 58.0 | 58.0 | 56.8 | 75.3 |
| Automation-Bench v1.0.6 | 60.5 | 54.8 | 46.7 | 48.8 | 45.8 | 50.3 |
| Agents' Last Exam | 35.4 | 31.8 | 27.6 | 28.5 | 26.7 | 28.6 |
| Apex Bench v1.1 | 72.1 | 64.6 | 47.8 | 56.6 | 54.3 | 65.8 |
| Chartography (w/tools) | 83.0 | 78.9 | 68.1 | — | 79.9 | 84.0 |
| BabyVision (w/tools) | 92.5 | 89.6 | 85.7 | — | 88.9 | 94.1 |
| ZeroBench-main (w/tools) | 51.0 | 49.0 | 41.0 | — | 53.0 | 52.0 |

† HLE 纯文本子集。**harness 条件必须一起读**：Terminal-Bench 4.0 用 Claude Code harness、DeepSWE v1.1 用 Mini-SWE-V2 harness——这正是前文「跨脚手架迁移」结论的延伸，分数是「模型 × harness」联合产物而非模型单独属性。

增量最大的四项：Terminal-Bench 4.0 31.2→42.3（+11.1，与前文"专家级科学任务落后 Opus-5"的判断一致地缩小但未消除差距，仍 42.3 vs 51.8）、ProgramBench 20.3→29.1、Apex Bench 64.6→72.1、Automation-Bench 54.8→60.5；HLE 36.8→42.6 但仍显著低于 Opus 5 的 56.3。DeepSWE v1.1 77.0 继续压过 Opus 5（74.0）与 GPT-5.6 Sol（73.0），是本代最强项。

工程接口有两处变化值得记：其一，**本版不再附带 Jinja 格式 chat template**，改为仓库内自包含 Python 参考实现 `encoding.py`（覆盖多轮、工具调用、thinking、数值化 reasoning effort、对话中途 system message、交错图像）+ 单独发布的 **deepseek-recipe**（Rust 库 + Python 绑定，协议感知地把 Messages/Chat Completions/Responses 请求统一编码为 DeepSeek V4/V4.1 prompt 或 token IDs，并解析回完整/流式响应，推理与工具执行留给调用方）；其二，推荐采样为 temperature 1.0 / top_p 1.0 / **context 1M tokens / max_tokens ≥256K**——「长输出预算」被写进默认配置，与官方的 harness 场景定位吻合。

## 深度分析

### 1/8 是缓存分层的复利，不是压缩算法的胜利

把「持久化 KV 降到 1/8」拆开，两个因子的性质完全不同：第一个是**要不要存**——SWA KV 从持久缓存里整个移出，省掉近一半；第二个是**存得多省**——全局 KV 经架构与 FP4 再压到 1/4。前者没有改动任何模型数学，只是把「分钟级有用的数据」从「72 小时留存的数据库」里分出去。报告给出的理由也不是什么理论最优，而是访问模式不匹配：全局 KV 有长尾复用价值，SWA KV 会话一结束就是死数据。这是对自家 workload 的统计判断，不是注意力的数学定理。

所以这个数字的可迁移性必须分开评估。FP4 的那一半依赖 RMSNorm 下的动态范围分析与 QAT，是模型侧的硬功夫，抄不走；缓存分层的那一半依赖「知道自己的流量在什么时间尺度上复用」，任何自建推理栈都能照搬，但前提是先有 prefix 命中率与 SWA 窗口命中的遥测。把它读成「算法胜利」，行动项会变成去追更激进的压缩格式；读成「分层复利」，才会先去补遥测——而后者才是这条 1/8 的真正前置条件。同类思路在 [分层 KV 缓存的托管实现](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tiered-kv-cache-large-llms-sagemaker-hyperpod-curvine.md) 中也能看到，差别只在 DeepSeek 把 TTL 语义写进了架构本身。

### 三条压缩路径的取舍：条目、序列、层，外加一条绕开 attention 的旁路

条目维度（GQA 减头、MLA 在头间共享 latent）已是上一代的红海；CSA2 的增量在序列维度（每 k 个 token 压一条）与层维度（跨层复用 cache 与索引）的**联合**，而它真正的手法是给两个原本耦合的代价分开定价：Reuse 模式 KV 与索引全复用，Reindex 模式只复用 KV、用自己的 indexer Q 重新打分产出新 Top-K。这一步的含义是「缓存共享」不必以「稀疏选择退化成全网一致」为代价——此前只复用索引的省不下主 KV，全网共享路由的会掉点，混合设计还留着全注意力层。[HySparse2 的混合 KV 共享](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hysparse2-mimo-v3-hybrid-kv-sharing-2026.md) 正是这条路线上的同期对照。

第二条旁路更值得注意：196B 参数的条件记忆把「记忆」搬出 attention/KV，落到确定性寻址的嵌入表上，因此可以后台 RDMA 从主机内存预取。也就是说 DeepSeek 没有把所有信息都硬塞进 KV 去压，而是按信息性质分流：需要逐 token 精确回溯的进 KV，可哈希寻址的进参数化记忆，只在一小段窗口内有效的进重算。三条路的账单分别落在 HBM、主机内存与算力上——这才是「组合式取舍」的实际形态，不是把三个压缩率相乘，而是让三种介质各自承担最擅长的那部分。同期架构综述把这个方向概括为「KV 共享 + mHC + 压缩注意力」三线并进，见 [近期 LLM 架构进展](https://github.com/QianJinGuo/wiki-public/blob/main/entities/recent-developments-in-llm-architectures-kv-sharing-mhc-and-compressed-attention.md)。

而所有近似都配了训练侧兜底：Bounded Replay 在后训练阶段模拟同样的重放做训练感知适配，FP4 走 QAT，分层索引器在后训练引入并保持训练/推理同一搜索域。这是全文最硬的一条工程纪律——**近似要进训练分布，而不是留给推理时靠精度补救**。

### 成本曲线平的是 FLOPs，不是账单

官方叙事里最漂亮的一条曲线：上下文 4K→1M（256 倍），单 token decode FLOPs 只涨约 1/4。但这条曲线画的是计算，不是账单。存储侧依然线性：890 字节/token × 1M token 约 890 MB/请求，单个请求的运行时 KV 就吃掉一张 80GB 卡 1% 出头的显存——并发一上来，排队理由是 HBM 容量而不是算力，这正是报告开头要把 runtime KV 与 persistent KV 分开定义的原因。带宽同理：prefill 被 CED 砍到近乎减半，但仍是 O(n)，输入重的 agent workload 不会因为稀疏注意力变成常数成本。这条「平曲线」在 [上下文窗口经济学](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-window-economics.md) 里应该配上容量轴才有意义。

真实的失效边界有三处，都能从报告里读出来。其一是**索引 recall 被池子钉住**：分层索引把深层打分从随上下文线性增长变成常数，代价是候选池固定为最多 2048 块 × 8 位置 = 16384 个候选位置，上下文再长，索引能看到的范围也不会自动变大。其二是**近似状态在极端边界掉点**：报告自己承认 CSA2 的选择误差与 Bounded Replay 的近似重建，在未经测试的极端情况下仍可能掉分。其三是**窗口容量与长上下文能力不是一回事**：V4.1-Flash-Base 在 LongBench-V2 上是 45.2，略高于 V4-Flash-Base 的 44.7，却明显低于 V4-Pro-Base 的 51.5。把窗口做大与把窗口里的信息用好，是两件不同的事：前者这条曲线已经解决，后者这条曲线还没画出来。

对选型而言这条边界很直接：任务是「把大量文档塞进去做一次性抽取」，1M 窗口加 890 字节/token 是净收益；任务是「跨几十万 token 维持一致性推理」，LongBench-V2 这类分数提醒你别把窗口当能力。

### 与同期前沿模型的分歧：效率优先的性能形状

同一张 Max 力度评测表读起来是有形状的。V4.1-Flash 在**短程、工具密集、可自动验证**的 agent 任务上领先或追平最贵的前沿模型：DeepSWE v1.1 74.2 压过 Opus-5 的 74.0 与 GPT-5.6 Sol 的 73.0，Terminal-Bench 2.1 90.6 全场最高，CyberGym 88.1 拿到开源 SOTA；但在**需要长程规划与专家知识**的任务上明显落后：Terminal-Bench 3.0 只有 30.0 对 Opus-5 的 43.3，即使 1017 版本把 Terminal-Bench 4.0 从 31.2 补到 42.3，仍低于 51.8，HLE 42.6 也低于 56.3。

这不是「小模型追平大模型」的故事，而是两条路线的成绩单形状不同：一条买参数与 RL 算力，在需要深度知识与长程一致性的任务上收租；另一条买单位 token 的边际成本，先把输入重、工具密集、可验证的 workload 吃干净。DeepSeek 还刻意把后训练算法留白，把资源全押在数据与环境管线（多脚手架异构联训、DSec 百万并发沙箱）——这本身就是路线选择的一部分：它赌的是 harness 多样性与环境规模，而不是新的 RL 目标函数。

对第三方最实用的推论是：这两条曲线的交点随任务象限移动，选型该按「任务落在哪个象限」而不是按总分。而且同一 checkpoint 在六个脚手架家族八种配置下 DeepSWE 从 65.5 到 74.2，harness 带来的 8.7 分方差，与 V4-Flash 到 V4.1 的代际跃升（54.4→74.2）并非不在同一量级——低估 harness 的团队，等于把一次架构升级的收益丢在了接入层。

## 实践启示

1. **先分账，再压缩。** 长上下文成本是三张账单的乘积：存储、带宽、计算。先量出自家 agent 的 prefix 复用率、上下文长度分布、SWA 窗口命中率，再决定压哪一项；只盯 FLOPs 会漏掉 HBM 容量与 SSD I/O 这两个真正排队的地方。
2. **缓存按「复用价值半衰期」分层，而不是按数据类型分层。** 长尾复用的全局 KV 落 SSD（至少 72 小时），分钟级有效的 SWA KV 落分布式 DRAM 池（TTL 分钟级、每机 10% 主机内存），miss 用有界重放优雅降级而不是精确重建。这套三级结构不依赖 DeepSeek 的模型，任何前缀缓存系统都能照搬。
3. **任何近似都要进训练。** 有界重放、FP4、跨层复用三者在本文里都做了训练感知适配；反过来说，只在推理侧做的量化与层间 cache 共享，掉点几乎是必然的——这是判断一份「压缩方案」是否可信的最快标尺。
4. **把长输出预算写进默认配置。** 官方推荐 context 1M / max_tokens ≥256K，并把 chat template 换成 `encoding.py` 参考实现加 deepseek-recipe 库。自建 agent 应直接吃 recipe 做协议编码，别手写 prompt 拼装：多轮、工具调用、thinking、对话中途 system message、交错图像这些边界，比自家 switch 分支多得多。
5. **评测锁 harness 并跨 harness 复测。** 分数是「模型 × harness」的联合产物：同一 checkpoint 在六个脚手架上是 65.5-74.2，Terminal-Bench 4.0 用 Claude Code harness、DeepSWE 用 Mini-SWE-V2。报一个数字而不报 harness 与力度档位，等于没报。
6. **窗口与力度是最容易过度购买的两样东西。** LongBench-V2 的 45.2 对 51.5 说明窗口变大不等于长上下文理解变强；力度从 60-80 区间继续拉到 100，Agent 轨迹会变长 1.6-1.8 倍却只换边际提升，而整体代价可达 2.5 倍输出 token。默认配置应是「够用的窗口 + 中间力度」，把预算留给验证与重试。

## 与已有实体的关系

- [DeepSeek V4 (Flash & Pro) 新纪元](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-v4-flash-pro-通往百万级上下文与万亿参数推理的新纪元.md) — V4 世代前作（thin stub），本文是 V4.1-Flash 的全系统深化
- V4-Flash LLM steering — V4-Flash 时代外部视角，本文补充官方技术报告内幕数字
- [V4.1 Engram 专篇（VibeCoder，Raw only）](https://mp.weixin.qq.com/s/kXvqPAPllQQZ7izhLTnvWA) — 同世代不同角度：Engram 单组件机制级拆解 vs 本文全系统；Engram 动量+Sinkhorn 新增信息可回补
- [DSpark V4/DeepSpec](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-dspark-v4-speculative-decoding-deepspec.md) — DSpark 组件的开源工具链报道，本文给出 V4.1 内集成形态
- [DeepSeek V4 训练 58 页论文深读](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-v4-training-58-page-paper-deep-dive.md) — V4 训练方法论前作

---

