# 大模型可控新突破：Steering 机制、评估体系与开源落地

> 📊 Level ⭐⭐⭐ | 10.4KB

## 摘要

浙江大学与阿里安全 AGI 实验室（御风大模型团队）围绕大模型 Steering（行为引导）产出三项互相咬合的工作：两篇 ACL 2026 主会论文分别回答"为什么有效"与"到底多可控"，开源框架 EasyEdit2 把方法、预训练向量与评估打包成可复用工具链。机理侧的核心结论是：看似各异的手段本质上是同一件事——前向传播中对线性层权重的动态更新，其收益随强度提升走出"线性可控 → 过渡波动 → 非线性崩塌"三阶段曲线，并可用激活流形假设给出几何解释。

评估侧则首次把"可控性"拆成多领域 × 三层粒度来量化，发现粒度越细控制越弱的"控制衰减"现象，从而把 Steering 的定位从"万能旋钮"校正为"分层能力"。

## 核心要点

- **统一机理**：局部权重微调、LoRA 低秩更新、激活干预三条路线，可统一为"前向传播中对线性层权重的动态更新"，差别只在扰动的位置、幅度与形式。
- **三阶段规律**：强度逐步提升时，模型行为一致地经历线性可控区 → 过渡波动区 → 非线性崩塌区，"越强越好"是误解，存在最优权衡区间。
- **激活流形假设（Activation Manifold Hypothesis）**：有效激活集中在低维、连续、结构化的流形附近，线性表征假说只是其局部近似；崩塌即激活被推离流形"脱轨"。
- **SPLIT 方法**：以效用损失 + 偏好损失联合训练，增强目标倾向的同时延缓脱轨，扩展线性可控区间，在 Gemma、Qwen 等模型与多任务上有效。
- **SteerEval 框架**：首个多维度、多粒度 Steering 评估体系，借鉴 David Marr 三层分析框架，7560 条数据覆盖人格、情感、语言特征等领域。
- **控制衰减**：粒度越细控制越难——L1 宏观效果甚至优于 prompt 方法，L2 出现损失，L3 微观明显下降。
- **EasyEdit2**：一站式开源 Steering 框架，即插即用（无需改模型源码）、方法全面、内置 SteerEval、提供预训练 Steering 向量。

## 深度分析

### 统一视角：把"各种技巧"收敛成"一件事"

Steering 的诱人之处在于它把"改行为"与"改知识"解耦：权重冻结，只在推理阶段对内部表示或激活做即时调控，就能在不损失既有能力的前提下塑造输出风格、情绪倾向、安全策略乃至推理策略。但长期以来这条路线是碎片化的——有人在 FFN 层改参数，有人用 LoRA 做低秩注入，有人在多层激活上直接做方向加减，彼此缺乏可比的语言。第一篇论文给出的统一视角是：这些方法都可以写成"在前向传播过程中对线性层权重做动态更新"，从而改变激活表示及其演化轨迹；局部权重更新对应权重矩阵的调整，LoRA 对应权重的低秩更新，激活干预则等价于对偏置项的调整。

这个结论的工程价值在于它把"选方法"变成了"调扰动"：既然作用机理同一，方法比较就该回到注入点、强度曲线与代价上。它与既有的 [Llm Steering Behavior Guidance](https://github.com/QianJinGuo/wiki-public/blob/main/entities/llm-steering-behavior-guidance.md)、[激活工程](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/activation-engineering.md) 属同一条技术脉络，这也是它在 agent 时代重新被重视的原因——模型需要长时间自主决策时，运行期的可调性比事后微调更有价值。

### 三阶段规律与激活流形假设：为什么不能一路拉满

逐步加大 Steering 强度，模型行为会走出一条高度一致的三段式曲线：强度较小时偏好近似线性变化、任务效用基本稳定，是"温柔的引导"；继续加大后偏好变化开始偏离线性、效用出现波动，进入不稳定的过渡区；越过临界点后偏好与效用同时崩塌，输出质量急剧下降。直观结论是 Steering 存在一个最优权衡区间，控制效果并非越强越好。

线性表征假说只能解释"为什么能引导"，解释不了"为什么会崩塌"。论文因此提出激活流形假设（Activation Manifold Hypothesis）：经过预训练与指令微调的语言模型，其有效激活状态并非铺满整个高维空间，而是集中在低维、连续且结构化的"激活流形"附近——线性假设只是该流形在局部的一阶近似，因此给出了有效性却丢失了边界。在流形图像下，弱 Steering 是沿流形小幅移动，中等强度是走到流形上效用最优的位置，过强则把激活推离流形——"脱轨"导致行为崩塌。论文据此给出有效性衰减公式并成功拟合三阶段曲线；一个有意思的旁证是，神经科学中人类大脑的神经群体活动同样集中在低维流形上。这也提示可解释性与可控性是同一枚硬币的两面：对内部几何的理解深度，直接决定能安全施加多大干预（参见 [2026 06 30 条条电路通罗马 大模型可解释性的 唯一机制 可能从一开始就不存在 机器之心](https://github.com/QianJinGuo/wiki-public/blob/main/entities/2026-06-30-条条电路通罗马-大模型可解释性的-唯一机制-可能从一开始就不存在-机器之心.md)）。

### SPLIT 与 EasyEdit2：从机理到顺手可用的工具

崩塌的根源既在"离开流形"，扩展可控区间的思路就自然浮现：不死磕偏好方向的推力，而是在训练目标中同时保留效用损失（守住模型能力）与偏好损失（增强目标行为倾向），让脱轨发生得更晚。这就是 SPLIT 方法的核心，实验显示它在 Gemma、Qwen 等模型与多个任务上均扩展了线性可控区间。

承接落地的是 EasyEdit2：即插即用、无需改动源码即可支持 LLaMA、Mistral 等主流模型，集成激活干预、LoRA、SPLIT 等方法，内置 SteerEval 评估体系，并提供预训练 Steering 向量，构成从向量生成到效果验证的完整链路。机理 → 工具 → 评估三者互为支撑，研究者不必从零搭轮子，这也是该系列工作在开源生态里值得被跟进的原因。

### SteerEval 与控制衰减：可控性的真实边界

第二篇论文把"大模型到底有多可控"变成可量化的问题。SteerEval 借鉴 David Marr 的三层分析框架，把控制目标拆成三个粒度：L1 计算层问"表达什么"（如"表现出热情"），L2 算法层问"如何表达"（如"使用主动语态和充满活力的赞美"），L3 实现层问"如何实例化"（如"必须包含两次 hooray"）。框架覆盖人格、情感、语言特征等多个行为领域，共 7560 条数据，横跨多个主流大模型。

结论非常直接：粒度越细，控制越难。L1 宏观层面 Steering 效果很好，甚至优于基于提示的方法；到 L2 开始出现损失；L3 微观层面明显下降——这就是"控制衰减"现象。它的实践含义是双面的：粗粒度行为控制已足够可靠，可放心用于人格设定、语气风格、安全策略这类宏观塑造；细粒度精确控制仍是当前方法的瓶颈，需要 prompt 与 Steering 的组合来补。用之前先想清楚要控制的是哪一层粒度，比选哪个 Steering 方法更重要。

把视野拉远：《Science》的《Toward universal steering and monitoring of AI models》同样表明，解析模型内部表征即可对行为实现通用引导与监控。模型能力越强，可控、可预测、可信赖就越不只是技术问题，而是治理问题——Steering 本质是对 AI"认知"与"信念"的调控，既是对齐的关键抓手，也是 运行期可观测与干预 这条线的一环。

## 实践启示

1. **别把 Steering 当强度旋钮一路拉满**：上线前先小步扫强度，画出"效用—强度""偏好—强度"两条曲线，在崩塌前的线性区取值，而非凭手感取大值。
2. **按粒度选工具**：宏观人设、语气、安全策略优先交给 Steering；L3 级别的细粒度约束（句式、必现词、格式）交给 prompt 或与 Steering 组合，因为控制衰减在微观层面最严重。
3. **评估先行**：接入 SteerEval 这类分层评估，在目标领域和粒度上先量出自己的衰减曲线，再决定是否上线，避免用宏观结论背书微观需求。
4. **始终保留效用损失项**：自训向量时同时约束"能力不退化"（SPLIT 的做法），否则偏好提升常以通用能力下降为代价。
5. **优先复用而非自研**：EasyEdit2 已提供整条链路与预训练向量，先验证现成向量是否够用，再考虑自训练。
6. **把 Steering 纳入安全与监控议程**：它既是安全对齐的抓手，本身也是需被审计的模型操纵能力，应与 [AI 安全](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/ai-safety.md)、[自然语言自编码器可解释性](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-nla-natural-language-autoencoders-interpretability.md) 等内部表征解读路线一并纳入治理视角。

## 相关实体

- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-完全指南这可能是全网最新最全的系统化教程了32w字建议收藏-v2.md)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-最新访谈从-vibe-coding-到-agentic-engineering.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-完全指南这可能是全网最新最全的系统化教程了32w字建议收藏.md)
- Karpathy Vibe Coding Agentic Engineering
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentops-operationalize-agentic-ai-at-scale-with-amazon-bedr.md)
- [你不知道的 Agent原理架构与工程实践 V2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/你不知道的-agent原理架构与工程实践-v2.md)

→ [原文存档](https://mp.weixin.qq.com/s/2N8TMiNFoWZzS1yZ-2YTMA)

---

