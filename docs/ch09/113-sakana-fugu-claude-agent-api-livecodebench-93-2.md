# Sakana Fugu 发布：Claude 禁令后的多 Agent 编排 API，LiveCodeBench 93.2

## Ch09.113 Sakana Fugu 发布：Claude 禁令后的多 Agent 编排 API，LiveCodeBench 93.2

> 📊 Level ⭐⭐ | 6.8KB | `entities/sakana-fugu-livecodebench-93-2.md`

# Sakana Fugu 发布：Claude 禁令后的多 Agent 编排 API，LiveCodeBench 93.2

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/sakana-fugu-livecodebench-93-2.md)

## 摘要

Sakana AI 在 Anthropic 因美国政府指令暂停 Claude Fable 5 和 Mythos 5 访问后，发布了商业多 Agent 编排 API——Fugu 和 Fugu Ultra。Fugu Ultra 在 LiveCodeBench 上以 93.2 分超越 Fable 5 的 89.8 分，在 SWE-Bench Pro 上以 73.7 分领先 Claude Opus 4.8（69.2）和 GPT-5.5（58.6）。然而，Fugu 的黑盒路由器设计——用户无法知晓底层使用了哪些模型——引发了行业对可信度和透明度的广泛质疑。

## 核心要点

- **多 Agent 编排即服务**：Fugu 本质上是"一个被训练用来调用其他语言模型的语言模型"，能够自主决定何时委派、验证和组合工作，基于 ICLR 2026 论文 TRINITY 和 Conductor 的协调器架构。
- **定价分层明确**：Fugu Ultra 起价 $5/百万输入 token、$30/百万输出 token；上下文超过 272K token 时升至 $10/$45。标准 Fugu 采用可变定价，按请求中最高 tier 模型计费。
- **主权叙事 vs 黑盒现实**：Sakana CEO David Ha 将 Fugu 定位为"绕开供应商限制"的主权解决方案，但 Prime Intellect 研究员指出这是"闭源编排器之上的闭源模型"，用户既无法控制底层模型，也无法知晓具体使用情况。

## 深度分析

### 技术架构：可交换 Agent 池与协调器模型

Fugu 的核心创新在于其**可交换 Agent 池**架构。与传统的固定工作流编排不同，Fugu 使用一个协调器语言模型（Coordinator Model）来动态决定任务分配策略：

- 协调器本身是一个语言模型，被训练用来调用其他语言模型（包括自身实例）
- 系统在运行时决定何时委派、何时验证、何时组合多个 Agent 的输出
- 底层模型池是完全可替换的——这意味着 Sakana 可以随时更换供应商而不影响上层 API 接口

这种架构的灵感来自 Sakana 的两篇 ICLR 2026 论文：**TRINITY** 和 **Conductor**，它们训练协调器模型为专用 Agent 分配任务，而非使用预定义的固定工作流。这代表了从"硬编码编排"到"动态智能路由"的范式转变。

### 基准测试的可信度争议

Fugu 的基准测试成绩存在一个根本性问题：

- Fable 5 和 Mythos Preview 不在 Fugu 的 Agent 池中（因为它们已不公开可用）
- Sakana 未披露 Fugu 在每次请求中具体使用了哪些模型
- 这意味着基准测试结果无法被独立复现——这是一个典型的"黑盒基准"问题

具体成绩对比：

| 基准 | Fugu Ultra | Fable 5 | Claude Opus 4.8 | GPT-5.5 |
|------|-----------|---------|-----------------|---------|
| LiveCodeBench | 93.2 | 89.8 | — | — |
| SWE-Bench Pro | 73.7 | 80.0 | 69.2 | 58.6 |
| GPQA-Diamond | 95.5 | — | — | — |

Fugu Ultra 在 SWE-Bench Pro 上落后 Fable 5（80.0）约 6.3 个百分点，说明尽管在多 Agent 编排上有所创新，但在最难的软件工程任务上仍不及被禁用的前沿模型。

### 商业定位与市场影响

Fugu 的发布时机非常精准——Anthropic 在 2026 年 6 月 12 日宣布美国政府基于国家安全指令要求暂停 Fable 5 和 Mythos 5 的访问，造成市场对单一供应商依赖的恐慌。Sakana 迅速填补了这一空白：

- **供应商锁定对冲**：Fugu 提供"一个端点、多个模型"的模式，降低对任何单一模型供应商的依赖
- **主权 AI 叙事**：契合日本和欧洲对 AI 供应链自主可控的政策需求
- **企业定制**：支持排除特定供应商或模型，可选择不将提示用于训练

然而，Beta 用户的实测结果喜忧参半。Mark Studios 的对比测试显示，Fugu Ultra 在 Three.js 游戏构建中仅用 22 分钟、~89K token、~$7.32，而 Claude Opus 4.8 用了 79 分钟、~940K token、~$37.85——但最终应用设计和功能质量上 Opus 更优。

## 实践启示

1. **多 Agent 编排是未来方向，但黑盒问题需解决**：Fugu 证明了动态 Agent 池架构的可行性，但用户对底层模型不可见是一个严重的信任障碍。评估类似服务时，应要求供应商提供模型路由的透明日志。

2. **基准测试不能替代独立验证**：Fugu 的 LiveCodeBench 93.2 分看似惊艳，但不可复现的基准测试价值有限。在选型决策中，应优先参考独立第三方评估和实际业务场景的 A/B 测试。

3. **供应商多元化策略需权衡新风险**：从单一供应商切换到 Fugu 这样的编排层，只是将风险从模型供应商转移到了编排供应商。真正的多元化应同时保持直接调用多个 API 的能力作为回退。

4. **成本结构可能隐藏复杂性**：Fugu 的可变定价模式（按最高 tier 模型计费）可能导致不可预测的成本。对于大规模生产部署，建议先进行成本建模，特别是长上下文场景（272K+ token 时价格翻倍）。

5. **关注区域合规限制**：Fugu 目前不在 EU/EEA 区域可用，因为仍在处理数据合规问题。如果您的业务涉及欧洲用户，需确认供应商的合规时间表。

## 相关实体

- **Sakana AI 东京研究实验室** — Sakana AI 的研究机构
- **Anthropic Claude Fable 5 / Mythos 5** — Anthropic 被限制的前沿模型
- **多 Agent 编排框架** — 多 Agent 系统的编排方法论
- **LiveCodeBench 编程基准** — 编程能力基准测试
- **AI 模型供应链风险** — 模型供应商依赖的风险管理

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/sakana-fugu-livecodebench-93-2.md)

---

