# Mo' turns, mo' problems：agentic RL 后训练的 on-policy 完整性三重撕裂

> 📊 Level ⭐⭐⭐ | 16.9KB

> 来源：Ian Barber 个人博客（2026-10-15），（/s=4）→ NEW Entity。原文以业界（Alibaba、DeepSeek、QwenGyre、Prime Intellect、Colfax）公开材料的二次梳理为主，属"把散落的工程经验收拢成一条失效链"的分析文，非一手实验报告——因此 confidence 按 7 记（有具体机制与数字，但无本文自产 benchmark）。

## 核心论点：agentic 后训练把 on-policy 假设拆成了三层

教科书版 agentic RL 很简单：给每个问题起一台 VM + 一个 harness + 一份干净模型上下文 → 发提示 → 让模型调工具 → 结尾打分 → 更新权重。这条链条唯一的关键假设是 **rollout 生成模型与更新模型为同一权重**（即 on-policy），PPO 的 importance ratio 正是用来度量两者偏离程度的标尺——**第一次更新时该比值应恰好等于 1**（同权重、同 token，理论上应产出同一答案）。

作者的主张是：进入 agentic 场景后，**"同权重同 token 必然同答案"这个前提不再成立**，因为除了模型本身，rollout 还由**推理引擎 + harness + 沙箱环境**共同产出；会话越长，撞上"有意义的差异"的概率越高。论文侧的量级佐证是阿里 122B 模型的 rollout 平均约 2 小时，2.4T 旗舰多数跑过 4 小时——在这种长度下任何微小不一致都会被放大。

据此可把撕裂点归纳为三层（原文按行文顺序展开，此处重组）：**基础设施层**（harness/沙箱在 rollout 期间被停顿或迁移）、**轨迹层**（工具调用 token 与树状 rollout 的 credit 归属）、**数值层**（推理与训练使用不同 kernel 导致的位级差异）。

## 基础设施层：阿里"沙箱常驻 + GPU cell 翻转" vs DeepSeek"整体冻结"

**训练与推理共用同一套 harness** 是最自然的做法（"要让模型擅长 Claude Code，为什么不直接在 Claude Code 里训练"）——阿里部分采用该路线，理由之一是**闭源 harness 换代极快，在 RL 框架内重新实现其控制流不现实**；代价是 harness 成了黑盒。

矛盾在这里出现：为了不浪费 GPU，需要**动态切换哪些卡在训练、哪些卡在跑 rollout**；但**一旦把 harness 停住，产出就开始因与模型无关的原因发生变化**。阿里的解法是：沙箱容器**保持常驻不停**，推理走代理；GPU 按负载聚成 **cell**，在 rollout 与训练之间快速翻转；**代理负责改派飞行中的请求，KV cache 在 cell 之间转运**。也就是说"不打断会话"被放在"最大化利用率"之前，代价是多了一层代理与跨 cell 的 KV 迁移。

DeepSeek 走的是相反方向：**用自己的 harness，所以可以整体暂停**；同时为进一步优化吞吐，**会主动抢占（preempt）长跑 rollout**。v4.1 之前 agent loop 活在"可被抢占的 GPU job"里，job 回来后要靠一次 reply 把上下文重建出来；**v4.1 把 harness 挪进沙箱内部，直接冻结全部状态——DRAM 加上文件系统的可写层**。这条路线把"状态可暂停/可恢复"当作一等公民，用自研 harness 换掉了黑盒代价。

对读 wiki 相关实体的启示：这两条路线正好覆盖了 [Agent Harness 工程范式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-harness-engineering-paradigm.md) 里"harness 是运行时契约"的一面——**harness 不只是给模型用的外壳，它同时是 RL 训练系统的状态边界**；谁拥有 harness，谁就拥有"是否允许暂停"的决定权。工程侧的同类记录可对照 [Nova 多轮 RL 基础设施](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deploying-multi-turn-rl-infrastructure-for-amazon-nova-on-amazon-sagemaker-hyper.md) 与 [并行 RL 训练吞吐](https://github.com/QianJinGuo/wiki-public/blob/main/entities/fast-parallel-rl-training-tsinghua-didi-2026.md) 两篇。

## 轨迹层：工具调用 token、格式重排与树状 rollout

即便 harness 行为一致，**轨迹本身仍可能 off-policy**。早期 RL 的 rollout 是"单条生成流"，而工具调用引入了**不属于模型产出的额外 token**，必须 mask 掉，否则模型会为自己没写过的东西训练。更隐蔽的是**推理服务对模型输出文本做规范化**时引入的变化——**同一个工具参数值在不同轮次被格式化成不同字面形式**。

业界已有针对性工程：Prime Intellect 团队在其库中做了大量相关工作；**QwenGyre 的代理直接缓存原始 tool-call payload**，原因是 harness 会在轮次之间重新格式化这些调用。

第二重变化来自 **单次 rollout 已不成立**：Agent 会派生子智能体、并发调工具、压缩长会话，**最终从长会话回来的是"一棵树"**，而树很难直接喂给训练器。QwenGyre 的做法是**把树序列化成一条或多条流，并按"历史中包含该 token 的分支比例"给每个 token 加权**；同时**限制可训练路径数量上限**，并把 token 权重跨 rollout 求平均，避免"派生子智能体多的 rollout 自动拿到更多梯度"。这实质上是在树结构上做 credit assignment 的工程折中。

与 [上下文窗口管理](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-context-window-management.md) 的关系：长会话的压缩动作本身进入了训练轨迹（原文末尾提到"总结也要训练，让模型学会压缩"），压缩质量因此不再是纯推理期优化，而是后训练目标的一部分。

## 数值层：kernel 不一致与三种修法（重算 / 校正 / 位级一致）

第三层最容易被忽视：**即使 token 完全可靠，对这些 token 的运算仍可能不同**。原因是推理面向延迟、用小 batch，训练面向吞吐、用大 batch，于是**同一算子在不同引擎里落到不同 kernel 上**——rollout 常用 SGLang 或 vLLM，训练常用 Megatron 或 TorchTitan。

作者列出三种应对，并给出各自代价：

1. **重算**：在训练器上重新计算 old log-probs，等于"向采样器一侧走 off-policy 来把比值硬掰回 1"，**代价是每条 rollout 多一次前向**。
2. **校正**：QwenGyre 的训练器按 rollout 裁剪比值、对每个 token 的权重设上限；作者直言这是"有点糊弄"的做法，**Megatron 一方明确不认同**，理由是它"把不匹配藏起来，而不是消掉"。
3. **位级一致**：如果计算能做到完全 bitwise-equivalent，就既不需要校正也不需要重算。浮点位级差异的来源主要是**归约顺序**，其次是**部分和精度、FMA、以及在哪里做舍入**；把顺序固定并非免费——**可能牺牲 10-20% 性能**。Colfax 的近期工作给出训练侧同量级数字：**head-dim-64 反向传播 1.13×，改用确定性累加后降到 1.05×**。

更进一步的方向是**把位级一致做进架构起点**：从一个"推理与训练共享的位级一致 kernel"出发，再让 Agent 在维持 parity 的前提下逐个把它变快——即**用 agentic loop 来优化 agentic RL 的数值底座**。

## 判断要点：什么可以迁移，什么不能

- **可迁移**（工程模式）：①"训练/推理共用 harness"与"自研 harness 以换取可暂停性"是一组明确的架构取舍轴，判据是**harness 是否属于自己**；②长会话 rollout 的**状态冻结粒度**（DRAM + 可写层）是可复用的设计点；③树状 rollout → 按分支历史比例加权 + 路径上限 → 跨 rollout 权重平均，是通用 credit assignment 折中；④**tool-call payload 原样缓存**是应对 harness 重排格式的最小成本手段；⑤kernel 级不一致的三种处理（重算/校正/位级一致）与各自 10-20%、1.13×/1.05× 的代价数字可直接作为方案选型依据。
- **不可迁移**：Alibaba / DeepSeek / QwenGyre / Prime Intellect 的**具体实现细节与内部数字**（122B 与 2.4T 的 rollout 时长、cell 翻转策略、代理实现）属于厂商内部工程，只能当参照量级，不能当结论复现。
- **与既有实体的分工**：本篇的定位是**"失效模式地图"**，补齐 wiki 中 [Harness 作为产品面](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-as-product-surface.md)、[编码 Harness 工程](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/coding-harness-engineering.md) 与 RL 训练基础设施类实体之间的缺口——后者多讲"如何训练得更好"，本篇讲"训练信号在哪些环节被静默污染"。

## 深度分析

### 三层彼此独立：撕裂落在三个不同的所有权边界上

三层的区别不在技术栈位置，而在**谁拥有那块状态、修复由谁付费**：基础设施层是沙箱与调度器的所有权（会话能否暂停、KV 能否跨 cell 搬），轨迹层是数据管道的所有权（哪些 token 进梯度、树怎么序列化），数值层是 kernel 的所有权（同一算子落到哪段代码）。修复者与发布周期都不同，所以修好一层不会顺带修好另两层——代理改派再正确，也不会让被 harness 重排过的工具参数回到原始字节；缓存了 payload，也不会让 SGLang 与 Megatron 的归约顺序一致。三层还有检测上的偏序，不可倒着查：状态不一致时位级一致无从谈起，token 不可靠时"比值应为 1"的诊断也失效。

### 吞吐与策略新鲜度：阿里与 DeepSeek 是一枚硬币的两面

两条路线常被读成"谁的基础设施更强"，实质是一次**风险归属的交换**。阿里让沙箱常驻、推理走代理、GPU 按 cell 快速翻转、KV 跨 cell 转运：多养一层代理与一次迁移，换会话永不中断——训练目标就是闭源 harness 里的真实能力，一旦停住 harness，产出差异便"与模型无关"，恰是最脏的一类 off-policy。

DeepSeek 反向：自研 harness 换"整体冻结"的权力，冻结 DRAM 与文件系统可写层，于是敢常规抢占长跑 rollout 榨吞吐；它付的不是工程正确性而是**分布真实性**——自研与目标 harness 的行为差无法被单测覆盖。判据因此不是吞吐数字，而是**你能否测试自己的失败模式**；两者都不占的团队只剩第三条路——缩短会话、提高同步频率，用会话长度换一致性。

### 树状 rollout：credit assignment 从序列问题变成图问题

子智能体、并行工具调用与会话压缩把一次 rollout 变成一棵树，而训练器要的是定长序列加逐 token 权重。QwenGyre 的"序列化 + 按历史含该 token 的分支比例加权 + 路径上限 + 跨 rollout 权重平均"是务实降维，但引入的 off-policy 是**语义性的而非数值性的**：同一 token 在不同分支里条件上下文不同，压成一条流必然丢掉分支条件；按比例加权又把"出现在多少种上下文里"折叠成标量，映射不可逆。对照之下，**缓存原始 tool-call payload** 是全篇性价比最高的手段——重排是确定性变换，存原始字节即可无损复原。这也让 [上下文窗口管理](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-context-window-management.md) 多一层含义：压缩既已进入训练轨迹，压缩质量就从推理期优化变成后训练目标。

### 三种数值修法：运行时补丁与资本支出

重算、校正、位级一致不是同层级选项。重算即在训练器上重算 old log-probs，正确性最高（以训练侧为唯一真相），代价是每条 rollout 多一次前向。校正是零额外算力的软化：裁剪比值、给每 token 权重设上限；如 Megatron 一方所指，它"把不匹配藏起来而非消掉"，副作用是连真实策略漂移一起压平，ratio 失去诊断价值。位级一致一次付清、永久免修，来源主要是归约顺序，其次部分和精度、FMA 与舍入位置；固定顺序要付 10-20% 性能，Colfax 训练侧的数字是 head-dim-64 反向 1.13×、改用确定性累加后 1.05×。模型越大、rollout 越长（本已 2-4 小时量级），重算摊销越贵、位级一致越划算。真正该带走的是方法论：**on-policy 不是训练前的声明，而是全程需持续测量的量**——契约由第三方 harness 持有时，训练系统就失去了对数据来源的完整性担保。

## 实践启示

1. **把 importance ratio 做成第一步诊断。** 首次更新前打印其均值与分布：同权重同 token 下应恰为 1；均值偏离且方差随轮次增长时，先查基础设施（会话是否被暂停/迁移），再查 kernel，最后才怀疑模型。
2. **三处埋点，缺一处无法定责。** payload 级原样落盘 tool-call 原始字节（不存重排后文本）；token 级记录每轮 mask 掉的 token 数与总量；logprob 级同时存 sampler 值与 trainer 重算值并逐 token 求差。
3. **冻结策略按"harness 是否属于自己"定。** 闭源 → 沙箱常驻 + 代理改派 + KV 跨 cell 转运；自研 → 整体冻结并把抢占做成常规；两者都不占 → 缩短会话、提高同步频率。
4. **最小可行验证只要三次运行。** 同 prompt 同权重连跑两次 rollout，比 token 序列与 logprob（查基础设施与采样确定性）；再在训练器上对同一序列重算一次前向（查 kernel）。三者差值为 0 才叫 on-policy，任一非 0 即得可回归的用例；数值一致要按资本支出立项（5-20% 折价 vs 每条 rollout 一次前向），而不是按 bug 修。

## 关联

- [Agent Harness 工程范式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-harness-engineering-paradigm.md) — harness 作为运行时契约，本篇补充"它同时是训练系统状态边界"的一层。
- [上下文窗口管理](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-context-window-management.md) — 压缩/总结进入训练目标（原文末尾的 summarization 训练）。
- [Harness 作为产品面](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-as-product-surface.md) / [Harness 组件过期](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-component-expiry-and-build-to-delete.md) — 闭源 harness 快速换代导致"在 RL 框架里复刻控制流不现实"，是组件过期的训练侧代价。
- [Nova 多轮 RL 基础设施](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deploying-multi-turn-rl-infrastructure-for-amazon-nova-on-amazon-sagemaker-hyper.md) — 平台侧实现，可与本篇的"训练/推理同引擎"取舍对照。
- [并行 RL 训练吞吐](https://github.com/QianJinGuo/wiki-public/blob/main/entities/fast-parallel-rl-training-tsinghua-didi-2026.md) — 吞吐导向路线的另一条记录。
- [Relay OPD 在线蒸馏交接](https://github.com/QianJinGuo/wiki-public/blob/main/entities/relay-opd-handoff-trigger-online-distillation-zju-alibaba-2026.md) — 同为"训练与推理之间的信号交接"问题，但那条走蒸馏而非 RL 比值。
- [SGLang 推理部署实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/sglang-inference-deployment-practice-benchmark-tuning.md) / [vLLM](https://github.com/QianJinGuo/wiki-public/blob/main/entities/vllm.md) — 文中点名的 rollout 引擎候选，本篇给的是它们在 RL 场景下的数值一致性风险。

→ [原文存档](https://ianbarber.blog/2026/10/15/mo-turns-mo-problems/)

---

