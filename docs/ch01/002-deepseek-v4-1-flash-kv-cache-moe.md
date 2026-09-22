# DeepSeek-V4.1-Flash：把 KV Cache 压缩到极限的百万上下文 MoE（技术报告全系统解读）

> 📊 Level ⭐ | 11.8KB

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

## 与已有实体的关系

- [DeepSeek V4 (Flash & Pro) 新纪元](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-v4-flash-pro-通往百万级上下文与万亿参数推理的新纪元.md) — V4 世代前作（thin stub），本文是 V4.1-Flash 的全系统深化
- V4-Flash LLM steering — V4-Flash 时代外部视角，本文补充官方技术报告内幕数字
- [V4.1 Engram 专篇（VibeCoder，Raw only）](https://mp.weixin.qq.com/s/kXvqPAPllQQZ7izhLTnvWA) — 同世代不同角度：Engram 单组件机制级拆解 vs 本文全系统；Engram 动量+Sinkhorn 新增信息可回补
- [DSpark V4/DeepSpec](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-dspark-v4-speculative-decoding-deepspec.md) — DSpark 组件的开源工具链报道，本文给出 V4.1 内集成形态
- [DeepSeek V4 训练 58 页论文深读](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-v4-training-58-page-paper-deep-dive.md) — V4 训练方法论前作

---

