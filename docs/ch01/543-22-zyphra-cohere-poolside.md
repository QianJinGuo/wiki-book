# 开放模型生态快报 #22：Zyphra、Cohere、Poolside 扩张开放模型版图

## Ch01.543 开放模型生态快报 #22：Zyphra、Cohere、Poolside 扩张开放模型版图

> 📊 Level ⭐⭐ | 8.3KB | `entities/latest-open-artifacts-22-zyphra-cohere-and-poolside-are-expa.md`

# 开放模型生态快报 #22：Zyphra、Cohere、Poolside 扩张开放模型版图

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/latest-open-artifacts-22-zyphra-cohere-and-poolside-are-expa.md)

## 摘要

Interconnects 第 22 期开放模型生态快报揭示了开放模型生态系统的结构性转变：模型制造者从少数中国玩家主导演变为全球多元化格局。本期重点包括 Zyphra 的 ZAYA1 系列（74B-A4B MoE 和 8B-A0.6B MoE）在 AMD GPU 上训练的独特架构选择、Cohere 将旗舰模型 Command A+（218B-A25B MoE）以 Apache 2.0 开源、Poolside 的 Laguna-M.1 也转向 Apache 2.0 并承诺未来开放发布。同时，GLM-5.2 成为本期最大亮点，在日常工作中已接近最佳闭源模型的可用性。

## 核心要点

- **开放模型生态多元化**：模型制造者从少数中国玩家扩展到全球范围的"纯粹模型制造商"（DeepSeek、Zyphra、Poolside）、"大科技公司"（阿里 Qwen、Google Gemma）和"产品公司"（JetBrains、Zed、Krea）三类参与者。
- **Cohere 转向完全开源**：Command A+（218B-A25B MoE）以 Apache 2.0 发布，此前版本使用非商业许可证，这一转变意义重大。模型支持多模态、多语言和 Agent 能力，可在单张 B200（4-bit）上运行。
- **Zyphra 的 AMD GPU 训练路线**：ZAYA1-74B-preview（74B-A4B MoE）和 ZAYA1-8B（8B-A0.6B MoE）在 AMD GPU 上训练，其技术报告以有趣的架构选择著称，是研究社区中的"内幕推荐"。
- **Poolside 承诺开放路线**：Laguna-M.1 以 Apache 2.0 发布，公司明确表示"开放权重现在是我们的默认策略"，将继续向前沿推进并开放发布。
- **NVIDIA 采用 OpenMDW 许可证**：Nemotron-3-Ultra-550B-A55B 使用 LatentMoE 架构，并采用专为模型权重设计的 OpenMDW 许可证，替代了之前的自定义许可证。

## 深度分析

### 开放模型生态的三类参与者模型

Interconnects 的分析揭示了开放模型生态的结构性分化，这一框架有助于理解不同组织的发布动机：

1. **"纯粹"模型制造商**：目标是训练接近前沿的模型。包括 DeepSeek、Zhipu、Minimax 等中国公司，以及 Poolside、Arcee、Zyphra 等西方公司。主权 AI 玩家（Cohere、Sovereign、Mistral、Trillion Labs）也日益活跃。近期 Mythos 事件（Anthropic 模型被美国政府限制）可能进一步刺激主权模型训练投入。

2. **大科技公司**：动机更多元。阿里通过模型发布 upsell 闭源模型；NVIDIA 受益于繁荣的开放模型生态（增加 GPU 需求）。这与 Llama 时代的"为开放而开放"有本质区别——现在的开放发布有更清晰的商业逻辑。

3. **产品公司**：JetBrains、Zed、Krea、Photoroom 等以 AI 为核心组件的产品公司，训练高度专业化的轻量模型。开源权重不会损害其核心业务，反而能避免被闭源模型供应商限制访问。

这一多元化格局验证了 Interconnects 的假设：更多公司将开发长尾模型，而追逐绝对前沿开放模型的公司数量将减少。

### 本期重点模型技术分析

**GLM-5.2**（zai-org）是本期最大亮点：
- 在日常工作中"真正可用"，与最佳闭源模型的差距不大
- 下载量与 GLM-5 发布后持平，说明社区接受度稳定
- 代表了开放模型从"研究玩具"到"生产力工具"的关键转变

**Zyphra ZAYA1 系列**的技术独特性值得关注：
- 在 AMD GPU 上训练（而非 NVIDIA），展示了 GPU 生态的多元化趋势
- 74B-A4B MoE 架构在推理效率上具有优势
- 技术报告中的架构选择在研究社区中被视为"内幕推荐"

**Cohere Command A+** 的开源策略转变具有行业信号意义：
- 218B-A25B MoE 规模，单 B200（4-bit）可运行
- 多模态 + 多语言 + Agent 能力三位一体
- 从非商业到 Apache 2.0 的转变，可能反映 Cohere 在主权 AI 市场的竞争策略

**NVIDIA Nemotron-3-Ultra-550B-A55B** 的 OpenMDW 许可证采用是另一个重要信号：
- LatentMoE 架构带来更快的推理速度
- 绝大多数训练数据开源
- OpenMDW 是 Linux 基金会专门为模型权重设计的许可证，比 MIT/Apache 更适合 AI 模型

### 开放模型生态的禁令免疫性

Interconnects 强调了一个关键观点：试图减缓或禁止开放模型生态不仅是徒劳的（如技术禁令的历史所示），而且是"不安全且反自由的"。

- 限制将集中 AI 开发和使用于少数精英手中
- 危及外部人员自由采用这一重要技术的能力
- 开放模型生态的多样性本身就是其优势之一——不同组织复用彼此的架构选择、训练方法和数据

## 实践启示

1. **关注许可证变化**：Cohere 从非商业到 Apache 2.0、NVIDIA 从自定义到 OpenMDW，许可证策略的转变直接影响模型的可商用性。评估开放模型时，许可证应与基准性能同等重视。

2. **AMD GPU 训练生态值得关注**：Zyphra 在 AMD GPU 上训练成功的案例表明，NVIDIA 的硬件垄断正在被打破。对于有成本压力的团队，AMD 路线可能成为可行的替代方案。

3. **产品公司的小模型策略可借鉴**：JetBrains、Zed 等公司训练高度专业化的小模型而非通用大模型。对于有明确垂直场景的团队，这种"小而专"的策略比追逐前沿大模型更具成本效益。

4. **GLM-5.2 可作为日常工作的开放模型首选**：如果团队需要避免闭源模型供应商锁定，GLM-5.2 是目前最接近闭源模型体验的开放选项，且下载量稳定表明社区支持良好。

5. **主权 AI 趋势加速**：Mythos 事件后，主权 AI 玩家的活跃度预计将进一步提升。Cohere 和 Poolside 的开源策略转变可能是这一趋势的早期信号。评估长期 AI 基础设施时，应将主权 AI 模型纳入技术栈考量。

## 相关实体

- **Zyphra ZAYA1 MoE 架构** — Zyphra 的 MoE 模型架构
- **Cohere Command A+ 开源** — Cohere 旗舰模型的开源策略
- **Poolside Laguna 代码模型** — Poolside 的代码生成模型
- **GLM-5.2 开放模型** — Zhipu 的开放模型
- **NVIDIA Nemotron-3-Ultra** — NVIDIA 的开放 MoE 模型
- **开放模型生态多元化** — 开放模型生态系统的结构性转变

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/latest-open-artifacts-22-zyphra-cohere-and-poolside-are-expa.md)

---

