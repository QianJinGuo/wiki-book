# I/O 2026: Welcome to the agentic Gemini era

## Ch01.1197 I/O 2026: Welcome to the agentic Gemini era

> 📊 Level ⭐⭐⭐ | 16.4KB | `entities/google-io-2026-agentic-gemini-era.md`

## 概述

2026 年 5 月 19 日，Google CEO Sundar Pichai 在 Google I/O 2026 主题演讲中正式宣布 Gemini 进入"**agentic era**（自主智能体时代）"。这是 Google 自十年前 All-in AI 战略以来最具转折性的一次产品与技术宣示——AI 不再只是辅助工具，而是开始自主执行多步骤、长周期任务的代理实体。

演讲核心叙事围绕"全栈 AI 创新"展开：从自定义硅光（TPU 8t/8i）到底层模型（Gemini 3.5 系列），再到面向消费者的自主代理产品（Gemini Spark），形成了一套垂直整合的 agentic 架构。

## 规模数据

Google 在 I/O 2026 披露了一系列规模指标，反映 Gemini 生態系的爆炸性增长：

- **Tokens 处理量**：从两年前的 9.7 万亿 / 月增长至如今的 **3.2 夸脱（quadrillion）/ 月**，一年增长约 7 倍
- **Gemini 月活用户**：从 2025 年 I/O 的 4 亿增长至 **9 亿**，翻逾一倍
- **日均请求量**：同比增长超过 7 倍
- **开发者规模**：每月有 **850 万+ 开发者** 使用 Google 模型 API 构建应用
- **API Token 吞吐量**：每分钟处理约 **190 亿 tokens**
- **企业级客户**：过去 12 个月有 **375+ Google Cloud 客户**各自处理超过 1 万亿 tokens
- **资本支出**：2026 年预计达到 **180-190 亿美元**，是 2022 年（310 亿）的约 6 倍

## AI 全栈概览

### 基础设施：TPU 8t 与 TPU 8i

Google 在 I/O 2026 前夕的 Cloud Next 上发布了 **第八代 TPU**，首次采用训练/推理双芯片架构：

- **TPU 8t**：专为大规模预训练优化，原始算力是上一代的近 3 倍；借助 JAX + Pathways 框架，首次实现跨多个数据中心无缝分布训练，**支持 100 万+ TPU 的全球训练集群**，模型训练周期从月缩短至周
- **TPU 8i**：专为目标推理设计，每一步延迟均大幅降低；两款芯片能效均提升约 2 倍（每瓦性能）

这种双轨架构意味着 Google 可在保持低延迟推理的同时，以前所未有的规模训练更大模型。

### 新模型家族

#### Gemini 3.5 Flash

**Gemini 3.5 Flash** 是 3.5 系列首款模型，主打"前沿智能 + 高行动速度"组合：

- 几乎在所有基准测试中优于 Gemini 3.1 Pro，尤其在 Coding 任务上取得突破性进展（GDPVal 指标剧烈跃升）
- 输出速度是其他前沿模型的 **4 倍**；而 Google 内部优化的 Flash 版本（用于 Antigravity）更达到 **12 倍** 速度优势
- 价格不到其他前沿模型的一半：若企业将 80% 工作负载切换至 3.5 Flash，每年可节省 **超 10 亿美元**
- Google 内部 AI 开发工具链（Antigravity）在 2026 年 3 月日处理 0.5 万亿 tokens，至 I/O 时已突破 **3 万亿 tokens / 天**
- Gemini 3.5 Flash 现已全量上线；Gemini 3.5 Pro 正在内测，预计次月发布

#### Gemini Omni Flash

**Gemini Omni** 是全新多模态输出模型系列，能够从任意输入模态生成任意输出模态的内容，首个模型为 **Gemini Omni Flash**：

- 初期聚焦视频生成，后续扩展至图像与文本
- 将 Gemini 智能与 Google 生成媒体模型深度融合，实现世界模拟能力的飞跃
- 现已在 Gemini app、Google Flow、YouTube Shorts 上线；即将开放 API 给开发者和企业客户

### SynthID 与 AI 透明度

三年期 AI 水印方案 **SynthID** 已累计标记超过 **1000 亿张图片和视频**，以及约 **6 万年时长的音频资产**。 新增 **Content Credentials 验证**（内容来源溯源标准），并扩大至 Search 和 Chrome。同时，OpenAI、Kakao、Eleven Labs 已签约采用 SynthID 方案。

## Agentic 产品矩阵

Google 在 I/O 2026 推出了多款具有代理能力的产品，覆盖生产力、搜索、智能穿戴等多个场景：

### Gemini Spark（消费者 AI 代理）

**Gemini Spark** 是 Gemini app 中的 24/7 个人 AI 代理，以 Gemini 3.5 Flash + Antigravity 为底层驱动：

- 运行于 Google Cloud 专用虚拟机，无需保持设备在线
- 通过 MCP（Model Context Protocol）集成第一方及第三方工具
- 初期支持 Gemini app，夏季扩展至 Email 和 Chat；秋季通过 Android Halo UI 呈现实时任务进度；夏季末直接内嵌 Chrome 作为网页浏览代理
- 面向 Google AI Ultra 订阅用户，分阶段推送（Trusted Tester → Beta）

### 信息代理（Information Agents）in Search

Search 在 agentic 时代新增**个性化信息代理**功能：用户可配置 AI 代理在后台 24/7 运行，在恰当时机主动推送信息并代为执行操作。 夏季起向 Google AI Pro 和 Ultra 订阅用户开放。此外，Search 将具备生成式 UI 能力（基于 Gemini 3.5 Flash + Antigravity），可动态生成自定义布局和交互可视化，并对所有用户免费开放。

### Daily Brief（个性化每日简报）

Gemini app 新增开箱即用代理 **Daily Brief**，汇聚用户 Gmail inbox、Google Calendar 和 Tasks 信息，自动生成优先排序的行动建议简报。 不同于简单摘要，它主动组织信息并推荐下一步操作。

### Ask Maps 与 Ask YouTube

- **Ask Maps**：2025 年上线，Maps 十年最大升级，用户可提复杂长问题；Gemini 驱动的自然语言对话体验
- **Ask YouTube**：重新想象视频探索体验——根据用户兴趣推荐视频，并直接跳转至最相关的视频时间点；美国区夏季广泛推送

### Docs Live（语音驱动文档）

**Docs Live** 彻底改变了文档创建方式：用户只需口头"脑暴"倾倒想法，Gemini 自动整理成结构化文档。 未来将支持语音直接编辑文档。夏季首先向订阅用户推出， Gmail 和 Keep 同期获得强化的语音能力。

### Google Pics（AI 图像创作）

**Google Pics** 基于最新 Nano Banana 图像生成模型，帮助用户从空白画布创建或编辑现有照片，将每个元素视为独立对象处理（而非扁平静态图像），实现精细的局部创建、替换和优化。 夏季向 Google AI Pro 和 Ultra Workspace 订阅用户推出。

### Google Flow（AI 创意平台）

Google Flow 推出新型代理，能够在复杂任务中进行规划与推理，支持创意工具的 vibe coding（氛围编程），包括视频特效、手绘动画、文字叠加等设计工具。

### Gemini for Science

整合 Gemini 深度推理、Deep Think 和 Deep Research 能力，并通过新的 Science Skills 将 agentic 平台连接至 **30+ 生命科学数据库和工具**，推动科研加速。 Science Skills 现已在 Antigravity GitHub 和平台内开放。

### 智能眼镜

Google 首次详细披露两款智能眼镜产品：

- **Audio Glasses**：音频眼镜，通过语音提供实时辅助，秋季率先上市
- **Display Glasses**：显示眼镜，在需要时直接呈现信息

两者均支持 hands-free、heads-up 的 Gemini 语音交互。

## Antigravity 2.0

Antigravity 是 Google 的 agent-first 开发平台，I/O 2026 迎来 2.0 版本：

- 从编码环境扩展为**自主 AI 代理开发与编排平台**
- 推出独立桌面应用，作为代理交互的中心枢纽
- 集成更深度优化的 Gemini 3.5 Flash（比标准版本快 12 倍）
- 所有开发者今日即可尝鲜体验

## 产品生态规模

Google 目前拥有 **13 款用户超 10 亿的产品**，其中 5 款超过 30 亿用户。 Search 的 AI Overviews 月活 25 亿；AI Mode 推出一年已突破 10 亿月活，成为 Google Search 史上最大升级。

## 技术趋势总结

I/O 2026 的核心叙事可以归纳为以下几个技术方向：

1. **Agentic Everywhere**：AI 从被动回答转向主动执行多步骤任务
2. **全栈垂直整合**：TPU 硅光 → JAX/Pathways 框架 → Gemini 模型 → Antigravity 平台 → 消费者产品，形成闭环
3. **速度即产品**：Gemini 3.5 Flash 的 4x/12x 速度优势被作为核心竞争力反复强调
4. **基础设施超规模投资**：180-190 亿美元年资本支出支撑千万级 TPU 集群
5. **多模态泛化**：Gemini Omni 从任意输入生成任意模态输出

## 深度分析

### 从"AI 辅助"到"AI 代理"的结构性转变

I/O 2026 最具标志性的叙事并非某一款单点产品，而是 Sundar Pichai 正式宣告的"**agentic era**"。这一表述的重量级在于：它代表着 Google 对 AI 本质的重新定义——AI 不再是增强人类决策的工具，而是开始**自主执行多步骤、长周期任务**的代理实体。

这一转变的技术基础是 Gemini 3.5 Flash + Antigravity 的组合：前者提供了"前沿智能 + 高行动速度"的双重能力，后者则解决了代理执行框架的工程化问题。Gemini Spark 作为 24/7 云端代理产品的推出，意味着 AI 代理终于从 demo 走进了真实消费产品。

### 全栈垂直整合：Google 的结构性护城河

本次 I/O 最清晰的技术逻辑主线是**全栈垂直整合**——从 TPU 8t/8i 硅光到底层框架（JAX + Pathways），从 Gemini 模型家族到 Antigravity 开发平台，再到覆盖 13 款十亿级用户产品的消费端出口。

这条链路的独特价值在于**迭代速度**：Google 可以在内部消化 3 万亿 tokens/天的 Antigravity 使用量（2026年3月0.5万亿 → I/O时3万亿），形成强大的反馈循环直接优化 3.5 Flash 模型本身。这种"内部大规模使用 → 模型迭代"的闭环是其他云厂商难以复制的路径。

TPU 8t/8i 的双芯片架构（训练/推理分离）是另一关键工程决策：此前 Google 面临"大模型训练需要高算力密度"与"推理需要低延迟"之间的结构性矛盾，双轨 TPU 架构通过硬件层面的专用化首次在同一个生态内同时解决了两个问题。结合 100 万+ TPU 全球训练集群的支持，模型训练周期从月缩短至周。

### 速度作为核心竞争力

Gemini 3.5 Flash 被作为"4 倍速"和"12 倍速（Antigravity 优化版）"的标签反复强调，这在 Google 的产品营销中极为罕见——通常科技公司倾向于强调模型"有多聪明"，而非"有多快"。这一叙事转向揭示了一个关键判断：**在 agentic 时代，推理延迟直接影响代理执行多步骤任务的成功率**。速度慢的代理会在长周期任务中积累误差，而 Gemini 3.5 Flash 通过在保持前沿智能的同时实现 4x 速度提升，实际上是在为代理任务提供更可靠的执行基础设施。

### 商业策略：价格锚定与成本重构

Gemini 3.5 Flash"不到其他前沿模型一半价格"的定价策略，配合"80% 工作负载切换可节省超 10 亿美元"的测算，是一次精准的 B 端市场营销。这个表述的隐含逻辑是：**Google 正在主动发起一场成本重构游戏**——通过将价格锚定到 Flash，迫使其竞争对手要么接受低利润空间，要么失去工作负载。考虑到 375+ Google Cloud 客户各自处理超过 1 万亿 tokens 的规模，这个策略针对的是有强烈动机优化 AI 支出的企业用户。

### AI 透明度：SynthID 的生态扩张

SynthID 三年累计标记 1000 亿张图片/视频和约 6 万年音频，新增 Content Credentials 验证并扩展至 Search 和 Chrome，更重要的是获得了 OpenAI、Kakao、Eleven Labs 的采用签约。这一进展的意义在于：AI 水印从 Google 单家技术方案开始向**行业标准**演进。在监管压力日益增大的背景下，谁先建立透明度标准谁就掌握了定义监管框架的主动权。

### 基础设施超投资信号

2026 年预计 180-190 亿美元资本支出（是 2022 年 310 亿的约 6 倍），这一数字本身就是对 AI 竞争烈度的声明。考虑到 Google 此前在 TPU 世代迭代上的持续投入节奏，这笔支出主要指向三个方向：TPU 8 系的量产部署、全球训练集群的扩展（100 万+ TPU）、以及 Gemini Omni 等多模态生成模型对推理算力的爆炸性需求。

## 实践启示

### 对开发者

**Gemini 3.5 Flash API 是当前性价比最优的前沿模型选择**。在 benchmark 优于 3.1 Pro、速度是其他前沿模型 4 倍、价格不到一半的三重优势下，将主流工作负载迁移至 Flash 是合理的。对于需要长周期代理任务的场景，Antigravity 2.0 提供了开箱即用的编排框架，其 12x 速度优化的 Flash 版本是真正的工程差异化所在。

### 对企业

**AI 支出优化窗口已打开**。Google 明码标价地给出了"80% 工作负载切换至 3.5 Flash 节省超 10 亿美元"的测算，这意味着 AI 成本结构正在被头部玩家重写。对于日均处理万亿级 tokens 的企业，现在是做 API 成本审计的时间点。Gemini for Science 连接 30+ 生命科学数据库的布局，对制药、材料、生物科技领域的 R&D 团队有直接价值。

### 对产品团队

**Agentic UX 是下一个范式转移**。Gemini Spark 的设计逻辑——24/7 云端代理、MCP 工具集成、Android Halo 实时任务进度 UI、Chrome 内嵌网页浏览代理——展示了一套完整的消费级代理产品设计思路。Search 的"生成式 UI"和"自定义信息代理"进一步例证了从 query-response 向 task-execution 的交互范式转变。产品团队需要开始思考：**你的产品中哪些高频、长周期任务适合代理化？**

### 对基础设施团队

**训练/推理分离的硬件架构正在成为行业共识**。Google TPU 8t/8i 的双芯片路径，叠加 100 万+ TPU 全球集群的支持，表明未来 AI 基础设施的关键工程挑战已从"如何做一块好芯片"转向"如何编排大规模异构计算"。对于自建 AI 基础设施的团队，分离训练和推理资源池可能是必经之路。

### 对 AI 研究者

**Gemini Omni 的 any-to-any 模态生成**代表着世界模拟能力的重要进步。当模型可以从任意输入模态生成任意输出模态时，其对物理世界建模的保真度将远超单模态模型。Gemini for Science 将 agentic 平台连接至 30+ 生命科学数据库的实验设计，则展示了 AI Agent 在科研场景落地的具体路径——数据库集成比通用搜索更能发挥深度推理的优势。

## 相关实体
- [Gemini 3 5 Frontier Intelligence](ch01/499-gemini-3-5-frontier-intelligence-with-action.html)
- [Building The Agentic Future Developer Highlights From Io 2026](../ch04/017-building-the-agentic.html)
- [Gemini Embedding 2 Multimodal Unified Vector Hyman](https://github.com/QianJinGuo/wiki/blob/main/entities/gemini-embedding-2-multimodal-unified-vector-hyman.md)
- [Google Debuts Gemini Focused Updates At Io 2026](ch01/981-20.html)
- [Alphaevolve Deepmind Discovery Agent](../ch03/046-agent.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/google-io-2026-agentic-gemini-era.md)

- [Introducing Gemini Omni](ch01/1252-introducing-gemini-omni.html)
- [Google Pm 2026 Five Developer Skills Shubham](ch01/424-pm-2026.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/vision-multimodal.md)

---

