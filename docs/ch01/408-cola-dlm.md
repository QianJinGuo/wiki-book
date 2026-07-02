# Cola DLM：字节跳动连续潜空间扩散语言模型

## Ch01.408 Cola DLM：字节跳动连续潜空间扩散语言模型

> 📊 Level ⭐⭐ | 12.0KB | `entities/cola-dlm-byte-dance-continuous-latent-diffusion-language-model.md`

# Cola DLM：字节跳动连续潜空间扩散语言模型

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/cola-dlm-byte-dance-continuous-latent-diffusion-language-model.md)

## 摘要

字节跳动 Seed 团队发布的 **Cola DLM（Continuous Latent Diffusion Language Model）** 是 2026 年 LLM 架构探索的标志性工作。其核心主张是「**Token ≠ 语义，表征（Representation）才是主角**」——把语言生成从"恢复 token"升级为"transport latent prior"。在 ~2B 参数、约 2000 EFLOPs 的严格对照实验中，Cola DLM 展现出比自回归模型和主流离散 DLM **更稳定的 scaling 趋势**。项目以"开源到底"方式释出论文、代码、模型权重和中文博客。

## 核心要点

- **核心主张**：Token 是语言系统的表层载体，不是语义本身；表征（representation）才是模型应学习的对象
- **架构核心**：Latent Prior（生成"潜在语义"）+ Decoder（把语义翻译成文字）；diffusion / flow matching 全程在 latent 空间而非 token 空间
- **Text VAE**：Encoder 把离散文本压缩成连续 latent，Decoder 把 latent 还原回文本；latent 是可连续变化、可被概率建模的随机变量
- **block-causal DiT + Flow Matching prior**：从高斯分布出发，学习向量场将噪声"运输"为有意义语义；block 结构实现局部并行 + 整体因果
- **Encoder 在 diffusion 阶段冻结**：防止语义空间被 prior 任务污染；加入 BERT-style mask loss 防止 latent 坍塌
- **三目标分解**：重建能力、压缩能力、拟合能力可单独诊断，支持稳定 scaling
- **Scaling 验证**：~2B 参数、约 2000 EFLOPs 对照实验，趋势比 AR 和离散 DLM 更稳定
- **与何恺明 ELF 对比**：ELF 在原 embedding 空间反复琢磨，Cola DLM 分"语义部 + 文字部"两阶段；底层关切一致（连续路线）
- **战略意义**：为文本到连续多模态世界（图像/视频/音频）架桥

## 深度分析

### 为什么"Token ≠ 语义"是一个暴论

字节团队直接抛出一个"暴论"：**Token 是人类语言系统的表层载体，不是语义本身**。这个论断的论证很简洁：

> 我今天很开心。今天我心情很好。今天过得挺愉快。
> token 差了一大堆，但语义还是那一个。

传统自回归 LLM 把这些不同说法当成几套不同的表达分别去学——明明背后是同一个语义，模型偏偏要在 token 这个表层挨个对齐。如果模型内部存在一种更稳定、更抽象的"语义状态"，那这些本质相同、只是说法不同的句子，其实没必要被分别记忆，而是可以在内部收敛到相近的表示。

这个论断对 LLM 架构设计有深远影响：如果表征是更基本的对象，那 Token 就只是表征的"实现细节"——是 tokenizer 工程和历史演化的副产物。这从根本上动摇了"以 token 为中心"的整个 LLM 范式。

### Cola DLM 的生成模型分两段

Cola DLM 的生成模型只有两部分：

1. **Latent Prior**：负责生成"潜在语义"——一个从随机噪声到有意义潜在表示的 transformation
2. **Decoder**：负责把这些语义翻译成具体文字——一个从 latent 到 token 序列的 deterministic mapping

整个 diffusion / flow matching 过程都发生在 latent 空间里，而不是 token 空间里。Cola DLM 干的不是把一堆"脏 token 慢慢去噪成干净 token"，而是先在连续语义空间里把一团随机语义组织成有意义的潜在表达，最后再统一翻译成文字。

这与很多"diffusion 化"的语言模型有本质区别。很多 DLM 本质上还是围绕 token 做"修修补补"（如恢复被 mask 的 token、逐步还原离散文本）。Cola DLM 直接把 diffusion 从"文字层"搬到了"语义层"——diffusion 不再负责"生成 token"，而是负责"组织语义"。

### 关键创新一：Text VAE——latent 不是 embedding 替代品

很多人第一反应是"不就是在 word embedding 上做扩散嘛"。但 Cola DLM 专门搭了一套 Text VAE：

- **Encoder**：把离散文本压缩成连续 latent（相当于提取"语义指纹"）
- **Decoder**：把 latent 再还原回文本

差别在于：token embedding 还是和 token 一一绑定的（每个 token 一个向量，本质上还是 token 序列），而 Cola DLM 的 latent 是一个**可以连续变化、可被概率建模的随机变量**。模型处理的对象不再是"下一个 token"，而是"整段文本对应的语义状态"。

### 关键创新二：block-causal DiT + Flow Matching

Cola DLM 用 block-causal DiT + Flow Matching 实现 latent prior：

- **从高斯分布出发**：初始 latent 是随机噪声
- **学习向量场**：模型学习一个向量场，将噪声"运输"为有意义语义
- **block 结构**：实现"局部并行 + 整体因果"——同一个 block 内的位置可以并行解码，不同 block 之间保持因果顺序

这比"全并行"更适合长文本生成，又比"全自回归"快很多。block 大小是效率/质量权衡的关键超参数。

### 关键创新三：Encoder 冻结 + mask loss 防止 latent 坍塌

训练时 Encoder 在 diffusion 阶段**冻结**，防止语义空间被 prior 任务污染。同时加入 **BERT-style mask loss 防止 latent 坍塌**——避免所有 latent 退化成同一点。

这两个设计都是"训练稳定性"的工程细节，但正是这些细节让 Cola DLM 能在 ~2B 参数规模上稳定 scaling。

### 关键创新四：三目标分解

Cola DLM 把训练目标拆成三个可独立诊断的项：

1. **重建能力**：Decoder 能否从 latent 还原出原文本
2. **压缩能力**：Encoder 能否把文本压缩成有意义的低维 latent
3. **拟合能力**：Prior 能否从高斯分布采样出有意义的 latent

这种三目标分解让 ablation 实验特别清晰——每个环节的贡献可以被独立测量。Scaling 过程中哪一环先出问题，可以精准定位。

### 与何恺明 ELF 的对比

何恺明团队同期推出的 **ELF（Embedding Language Model）** 也走连续路线，105M 参数就跑赢主流扩散语言模型，首次证明连续路线的潜力。Cola DLM 进一步把这一路线推到 2B 规模，并解决了"如何把语义和文字分层"的架构问题。

- **ELF 的做法**：跳过 token 层，把整个生成过程留在连续 embedding 空间里完成
- **Cola DLM 的做法**：分"语义部"和"文字部"两阶段——latent prior 生成语义，Decoder 翻译成文字

两者的底层关切一致（连续路线），但 Cola DLM 的"分阶段"设计让"语义"和"文字"成为两个相对独立的模块，便于扩展到多模态。

### Scaling 验证：~2B 参数、2000 EFLOPs 的对照

Cola DLM 报告的 scaling 实验设置是**严格的对照实验**——同样的参数规模、训练算力（~2000 EFLOPs）、数据集，对比自回归、离散 DLM、Cola DLM 三种范式。结果是 Cola DLM 展现出**比 AR 和离散 DLM 更稳定的 scaling 趋势**。

"稳定"是关键词——scaling 曲线的斜率不一定比 AR 大，但 variance 小、可预测。这对实际生产部署尤其重要：你需要能可靠预测"训练多少天能达到什么效果"。

### 战略意义：通往多模态的桥梁

Cola DLM 的"语义部 + 文字部"分层，在多模态语境下有天然优势：

- **图像 → 文本**：把图像编码为 latent（用图像 VAE），共享 latent prior，就可以从图像 latent 生成文本描述
- **文本 → 图像**：把文本编码为 latent，latent prior + 图像 Decoder，文本到图像
- **视频 / 音频**：同理，只需替换 Encoder / Decoder 模块，latent prior 通用

如果这条路被验证，**多模态 LLM 不再需要"模态对齐层"**——所有模态先转成 latent，在 latent 空间统一处理，最后再 Decoder 回各模态。这是表征中心范式（representation-centric）相对于 token 中心范式的核心优势。

## 实践启示

- **关注扩散模型在语言任务上的进展**：这是超越自回归模型的重要方向。Cola DLM 和 ELF 在 2026 年给出了连续路线的稳定 scaling 证据
- **表征学习是下一代 LLM 的关键**：从"预测下一个 token"升级到"理解语义状态"，是 LLM 从"模仿者"走向"理解者"的关键步骤
- **多模态融合为表征学习提供新突破口**：统一 latent 空间是通往多模态 LLM 的更优雅路径
- **关注各公司在大模型架构上的差异化布局**：字节（Cola DLM）、何恺明（ELF）、OpenAI（AR + 工具）、Anthropic（Constitutional）等路线分化，不应只比较"谁参数更多"
- **开源到底的策略值得借鉴**：论文 + 代码 + 权重 + 中文博客的完整释出，对建立研究社区影响力效果显著
- **Text VAE 的 Encoder 冻结是工程关键**：保护语义空间不被 prior 训练污染，是稳定 scaling 的关键设计
- **三目标分解提供 ablation 模板**：把生成模型拆成可独立诊断的子模块，是架构研究的通用方法

## 相关实体

- [Deepseek V4 Flash Pro 通往百万级上下文与万亿参数推理的新纪元](ch01/777-deepseek.md)
- [读完这篇你就搞懂 Deepseek V4 了 V2](ch01/777-deepseek.md)
- [Harness Engineering Core Patterns Claude Code](ch03/074-claude-code.md)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](ch03/044-agent.md)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](ch03/044-agent.md)
- [Diffusion Model Architecture](https://github.com/QianJinGuo/wiki/blob/main/concepts/diffusion-model-architecture.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/cola-dlm-byte-dance-continuous-latent-diffusion-language-model.md)

---

