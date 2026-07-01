# Thinking Machines 交互模型（Interaction Models）

## Ch04.285 Thinking Machines 交互模型（Interaction Models）

> 📊 Level ⭐⭐ | 8.8KB | `entities/thinking-machines-interaction-models.md`

## 核心定位
Thinking Machines Lab（OpenAI 前 CTO Mira Murati 创办）发布的交互模型，旨在解决假实时问题——当前 AI 模型以轮次为单位工作，人必须等模型说完才能接话。

## 核心思路
**原生训练，而非外挂拼接**：将实时交互能力作为模型本身的一部分从头训练，而非在轮次模型上套 VAD 等控制框架。

## 系统架构：双模型协作
1. **交互模型**：持续与用户保持双向交换，负责实时感知和响应
2. **异步后台模型**：负责深度推理、工具调用、网页搜索
交互模型始终保持在线，后台模型完成后流式传回结果，交互模型选择合适时机融入对话。

## 时间对齐微轮次（200ms Micro-Turns）
- 以 **200ms** 为单位交替处理输入和输出，无人为轮次边界
- 可实现：说话时同时听（实时翻译）、看视频时同时解说

## 无编码器早期融合
- 音频：dMel 格式 + 轻量嵌入层
- 图像：40x40 图块 + hMLP 编码
- 音频解码：Flow head
- 所有组件从头联合训练，与 Transformer 一体

## 推理优化
- **流式会话**：200ms 分块追加到 GPU 显存持久序列（已提交 SGLang 上游）
- **MoE 内核**：gather+gemv 替代 grouped gemm
- **NVLS**：低延迟 All-Reduce/Reduce-Scatter（Blackwell 确定性）
- **Split-KV**：解决 decode/prefill 注意力累积顺序问题
- **Bitwise Alignment**：训练器与采样器逐位对齐，端到端开销 <=5%

## 基准测试
- TML-Interaction-Small：**276B 总参数，12B 激活 MoE**
- FD-bench + Audio MultiChallenge：首个强智能+强交互性同时优秀的模型
- 内部基准：TimeSpeak（时间点开口）、CueSpeak（语义时机回应）、RepCount-A/ProactiveVideoQA（视觉主动性）
- GPT Realtime-2 等现有模型在上述任务上均无法有效完成

## 安全设计
- TTS 生成自然口语化拒绝训练数据
- 自动化红队 + 多轮拒绝数据，与文本拒绝行为一致

## 局限性
- 长会话上下文管理（重点方向）
- 276B MoE 推理速度限制，更大模型尚无法部署
- 后台智能体协同尚在早期
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/thinking-machines-interaction-models-ai-cold.md)

## 深度分析
**1. 从"轮次"到"微轮次"的交互范式跃迁**
thinking-machines-interaction-models 实体与 interaction-models-human-ai 实体是对同一技术成果的两种叙述视角。前者是中文自媒体对 Thinking Machines 工作的科普化转述，后者是该实验室的官方 Blog原文。两者合读才能完整理解：中文文章点出了"假实时"这个核心批判——当前 AI 所谓的实时不过是"等用户说完 + 等模型生成完"的串行序列，本质上还是轮次模型，只是延迟被人感觉不到地压低了。真正的实时是双向并发：模型在生成的同时感知用户输入，这要求从架构层面重新定义 token 序列的构成方式。
**2. "275B MoE + 12B 激活"背后的推理经济学**
该实体透露了一个关键数字：模型总参数 276B，激活参数 12B。这是一个典型的 MoE（Mixture of Experts）配置，意味着单次前向传播只激活约 4.3% 的权重。这是在"交互延迟 <200ms"与"模型能力足够强"之间的工程妥协——用稀疏激活换取推理速度。但局限性也很明确：更大型、更智能的模型（预计今年发布）因为推理速度太慢还无法部署在这个实时场景。这意味着"原生交互"与"最强大脑"目前尚不可兼得，交互性越强的场景对推理速度的要求越苛刻，模型能力的天花板反而被压低了。
**3. SGLang upstream 的基础设施意义**
流式会话（streaming sessions）特性已上游到 SGLang，这不只是个性能优化 PR，而是意味着交互模型的推理架构正在进入主流 LLM 基础设施层面。SGLang 接受这个 PR，说明"频繁小批量 prefill/decode"的场景已经被认可为一种标准用例，而非边缘 case。对于推理系统工程师而言，这意味着：在设计 KV cache 管理器时，需要考虑持久序列（persistent sequence）而非每次请求独立分配——这是一个从"请求级"到"会话级"的内存管理范式转变。
**4. NVLS 和 Split-KV 的 Blackwell 相关性**
实体中提到的 NVLS（低延迟 All-Reduce/Reduce-Scatter）被描述为"Blackwell 确定性"。这是硬件与软件共同演进的案例——NVLS 是 Blackwell 架构特有的通信原语，提供了确定性的 token 累积顺序，从而解决了 Split-KV 在 decode/prefill 交替时的注意力累积乱序问题。这个案例说明：Agent 系统的性能瓶颈有时不在算法而在底层硬件能力——Agent 架构师需要理解芯片级特性才能做出最优的系统设计决策。

## 实践启示
**1. 交互模型选型时的"稀疏 vs. 稠密"决策框架**
在选型实时交互模型时，12B 激活 / 276B 总参数的 MoE 配置提供了一个参考基线：交互延迟要求 <200ms 时，激活参数与总参数的比例需要控制在 ~4-5%。如果你的场景允许更高延迟（400ms-1s），可以考虑更大激活参数的稠密模型以获得更强推理能力。这不是一个固定比例，而是一个随交互实时性要求动态变化的决策空间。
**2. 流式会话的 KV cache 管理是 Agent 推理优化的下一个热点**
对于需要长期运行（>30 分钟）的 Agent session，streaming session 设计（持久序列追加而非每次重建）是减少 memory fragmentation 和 metadata overhead 的关键实践。在评估或自研 Agent 推理引擎时，关注其是否支持持久化 KV cache 序列——这是 Agent 工作负载区别于普通 LLM 调用的核心特征。
**3. 背景模型与交互模型的上下文协调协议设计**
双模型架构中，交互模型向后台模型传递"rich context package"而非"standalone query"。这个设计细节对 Agent 系统架构有普遍意义：主 Agent 与子 Agent/后台任务之间的上下文传递应该携带完整对话历史（用于上下文理解）而非仅传递当前任务（导致子 Agent 缺乏全局视角）。在设计多 Agent 协作协议时，建议显式定义"上下文包的边界和格式"，而非假设子 Agent 可以从零理解当前任务。
**4. 实时交互系统的安全评估需要新维度**
Thinking Machines 专门提到了"Colloquial refusals"（口语化拒绝）——TTS 生成的拒绝听起来不像机器人，更自然，但必须与 text-based 拒绝保持行为一致。这对 Agent 安全评估有直接启示：实时语音交互会引入"听起来自然但内容有害"的新攻击面。在评估多模态 Agent 产品时，需要增加"语音拒绝一致性"测试——让同一有害请求分别以文本和语音发出，检查拒绝行为是否对齐。

## 相关实体
- [Interaction Models](ch01/522-thinking-machines-interaction-models-ai-cold.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/interaction-models.md)

- [Interaction Models: A Scalable Approach to Human-AI Collaboration](ch04/150-ai.md)
- [thinking-machines-interaction-models-ai-cold](ch01/522-thinking-machines-interaction-models-ai-cold.md)

---

