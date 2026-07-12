# Latest Open Artifacts #19：Qwen 3.5·GLM-5·MiniMax M2.5 中国开源模型前沿

## Ch01.559 Latest Open Artifacts #19：Qwen 3.5·GLM-5·MiniMax M2.5 中国开源模型前沿

> 📊 Level ⭐⭐ | 8.2KB | `entities/latest-open-artifacts-19-qwen-glm-minimax-interconnects.md`

# Latest Open Artifacts #19：Qwen 3.5·GLM-5·MiniMax M2.5 中国开源模型前沿

> 2026-06-07 引用自 Interconnects《Latest open artifacts (#19): Qwen 3.5, GLM 5, MiniMax 2.5》，2026-03-03。

## 背景

本月是顶级开源权重 AI 的繁忙月份：Qwen、MiniMax、Z.ai、Ant Ling、StepFun 都有新旗舰模型发布。所有目光都在 DeepSeek V4 的即将发布， rumors 持续加速。

## Relative Adoption Metrics（RAM）

Interconnects 用 RAM 追踪模型：标准化相对于同尺寸类中同类模型的下载量。RAM > 1 意味着有望成为历史下载量前 10 的模型。

关键发现：
- **GPT-OSS**：实际 off the charts，是自 Llama 3.1 以来最受欢迎的美国开源模型
- **Kimi K2 Thinking**：明显赢家
- **OCR 模型**：明显赢家
- **DeepSeek V3.2 及其近期大型模型**：表现大幅低于 DeepSeek 2025 年早期发布

## Our Picks 重点模型

### Qwen3.5-397B-A17B
长等待的更新，多种尺寸（0.8B-27B dense；35B-A3B 到 397B-A17B MoE），全部多模态，默认推理，基于 Qwen-Next 架构与 GDN 层。相比前版全面升级：风格和指令遵循改进，多语言任务更强。

**弱点**：至少小模型仍然倾向于 overthinking。可通过在聊天模板中禁用推理来关闭。

### Step-3.5-Flash
StepFun 发布的 196B-A11B MoE，各项指标强劲，尤其数学 benchmark 打败数倍大的模型。

### GLM-5
Zhipu 团队的 744B-A40B 发布，需求激增导致[编程方案涨价](https://www.reuters.com/technology/chinese-ai-startup-zhipu-hikes-prices-coding-plan-demand-rises-2026-02-12/)。附带技术报告。

### MiniMax-M2.5
尽管尺寸相对较小，能与 GLM-5 和 Kimi K2.5 匹敌，迅速成为社区最爱之一。

### OpenThinker-Agent-v1
OpenThoughts 已知开放推理发布，现在 tackle agentic 推理。包含 SFT 和 RL 数据，以及 lite 版基于终端的任务用于评估小模型。

## 深度分析

### 1. 中国 AI 实验室的开源模型竞争态势
#19 期的 5 个重点模型中 4 个来自中国实验室（Qwen/StepFun/Zhipu/MiniMax），这延续了 2025 年以来中国实验室主导开源权重前沿的趋势。核心驱动力是开源模型对中国实验室的战略价值——在闭源 API 市场被 OpenAI/Anthropic 压制的情况下，开源权重是获取开发者生态和品牌认知的最佳路径。这与 `Nathan Lambert Claude Mythos Open Weights` 中 Lambert 关于"你无法杀死开源，只能影响和引导它"的论断一致。

### 2. RAM 指标的价值：超越绝对下载量的相对评估
RAM 的创新在于标准化了下载量的比较——不同尺寸类的模型下载量基数不同（7B 模型天然比 70B 下载多），RAM 通过在同尺寸类内归一化解决了这一问题。RAM > 1 的阈值意味着"有望成为历史前 10"是一个强信号。GPT-OSS 的 off-the-charts 表现验证了 OpenAI 开源策略的社区影响力。

### 3. Qwen 3.5 的全面升级与 overthinking 权衡
Qwen 3.5 的全尺寸多模态 + 默认推理是一个激进的产品策略：所有尺寸都支持推理模式，但小模型的 overthinking 倾向是已知问题。解法是通过聊天模板禁用推理——这意味着推理模式对小模型不是默认最优选择，而是需要用户根据场景手动切换。这与 `Olmo Hybrid Gdn Wave 2026` 中关于混合推理架构的讨论呼应。

### 4. MiniMax-M2.5 的效率突破
MiniMax-M2.5 以相对较小的参数量匹配 GLM-5 和 Kimi K2.5，暗示其在训练效率和后训练工艺上有突破。这与 `Aws Sagemaker Sft Dpo Tool Calling` 中 Qwen3-1.7B 通过精调超越 2× 参数模型的效率逻辑一致——模型效率不只取决于参数量，更取决于训练数据和后训练策略。

### 5. DeepSeek V4 发布预期的市场影响
"所有目光都在 DeepSeek V4 的即将发布"这一观察反映了 DeepSeek 在开源社区中的特殊地位。DeepSeek V3.2 的 RAM 表现低于预期可能是因为 V3 发布时的高峰效应——社区对 DeepSeek 的新版本有更高的期望阈值。V4 的发布将重新定义开源前沿的竞争格局。

## 实践启示

### 1. 模型选型：用 RAM 评估社区采纳而非只看 benchmark
RAM > 1 的模型意味着社区验证的高采纳度，这比 benchmark 分数更能预测生态支持（fine-tune 资源、工具链兼容性、社区教程）。在同等 benchmark 表现下，优先选 RAM 更高的模型。

### 2. Qwen 3.5 小模型用户：默认关闭推理模式
小尺寸 Qwen 3.5（<27B）的 overthinking 倾向会增加延迟和 token 消耗。在不需要复杂推理的场景中，通过聊天模板禁用推理模式以获得更快的响应。

### 3. 关注 Step-3.5-Flash 的数学能力
如果应用场景涉及数学推理，Step-3.5-Flash 的 196B-A11B MoE 架构在数学 benchmark 上超越数倍大模型，性价比极高。

### 4. OpenThinker-Agent-v1 是 agentic 推理数据的开源入口
该数据集提供 SFT + RL 数据和基于终端的评估任务，是构建 agentic 推理能力的开源起点。

### 5. 跟踪中国 AI 实验室的开源节奏
Interconnects 的 Latest Open Artifacts 系列是跟踪中国 AI 开源前沿的最佳信源之一。每期覆盖新发布、RAM 追踪和技术架构对比，适合月度扫描。

## 整体观察

本期相对轻量，集中在主流模型 Sizes，轻于长尾专业模态。技术细节深度 complement：["Ahead of AIA Dream of Spring for Open-Weight LLMs"](https://magazine.sebastianraschka.com/p/a-dream-of-spring-for-open-weight) 覆盖了 2026 年 1-2 月的 10 种架构主题。

## 相关实体
- [Latest Open Artifacts 21 Open Model Bonanza Gemma 4 Deepseek](ch01/508-latest-open-artifacts-21-open-model-bonanza-gemma-4-de.html)
- [Nathan Lambert Open Models Bets 2026](ch01/457-nathan-lambert.html)
- [Interconnects Latest Open Artifacts 20 New Orgs New Types Of Models With Nemotron Super Sarvam](ch01/1022-latest-open-artifacts-20-new-orgs-new-types-of-models.html)
- [Gemma 4 Open Model Adoption Framework Interconnects](ch01/612-gemma-4.html)
- [Olmo Hybrid Gdn Wave 2026](ch01/956-20.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/latest-open-artifacts-19-qwen-35-glm-5-minimax-25-chinese-la.md)

---

