# Microsoft is quietly shopping for an OpenAI replacement

## Ch01.036 Microsoft is quietly shopping for an OpenAI replacement

> 📊 Level ⭐ | 8.7KB | `entities/microsoft-is-quietly-shopping-for-an-openai-replac.md`

## 核心要点
- 来源：https://thenextweb.com/news/microsoft-startup-deals-life-after-openai
- 评分：v=8 × c=7 = 56
- 关键事件：Microsoft 秘密接触 AI 初创公司，评估 OpenAI 替代方案
- 核心人物：Mustafa Suleyman（MAI Superintelligence 负责人）
- 涉及公司：Cursor、Inception、GitHub Copilot→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/microsoft-is-quietly-shopping-for-an-openai-replac.md)

## 事件背景
据 Reuters 于周三报道，引用五位知情人士的消息，Microsoft 一直在悄悄接触 AI 初创公司，寻求收购或战略合作，以建立不依赖 OpenAI 的选择权。这一动向发生在 Microsoft 重写那份将两者绑定近十年合同的三周之后——该选择权已不再是理论可能。
2026 年 4 月 27 日签署的修订协议产生了深远影响：结束了 Microsoft 对 OpenAI 模型的独家许可，允许 OpenAI 在 AWS 和任何其他云上销售，并取消了所谓的 AGI 条款——该条款原本会在 OpenAI 董事会宣布达到通用人工智能阈值时触发 Microsoft IP 权利的变更。
Microsoft 保留了到 2032 年的 IP 许可、约价值 1350 亿美元的 27% 股份，以及新 OpenAI 产品的 Azure 优先部署条款。但它放弃的，用通俗的话说，是 OpenAI 将是 Microsoft 唯一需要的 frontier lab 这一隐含假设。

## Cursor 收购尝试：最具体的退却
到目前为止最具体的尝试以撤退告终。今年春天，Microsoft 权衡收购 Cursor——这家年收入从零在三年内增长到 20 亿美元的代码生成初创公司——然后选择放弃。
内部结论是：同时拥有 GitHub Copilot 并收购 Cursor 会引发 Microsoft 不愿挑起的监管对抗。几天后，Elon Musk 新合并的 SpaceX-xAI 载体以 600 亿美元的价格收购了 Cursor 的股权，并附加了 100 亿美元的分手费。失标方（Microsoft）没有支付任何代价，保留了 Copilot，但失去了这个资产。
## Inception：正在进行的对话
目前活跃的对话对象是 Inception，这是一家从斯坦福大学剥离出来的 Palo Alto 初创公司，由 Stefano Ermon 教授创立。Inception 是极少数在主要实验室之外构建基于扩散的语言模型（diffusion-based language models）的团队之一，而非自回归模型（autoregressive models）——这种架构并行处理 token 而非逐个处理，Ermon 声称其运行速度超过每秒 1000 个 token。
Microsoft 的 M12 基金已经参与了该公司去年 11 月的 5000 万美元轮次。Reuters 报道称，母公司正在就更大规模的合作进行谈判。

## MAI：内部自研路径
这两项交易都属于同一个目标：在内部项目必须独自承担重担之前，储备人才和架构多样性。该项目有名称和负责人：
2025 年 11 月在 Mustafa Suleyman 手下成立的 **MAI Superintelligence 团队** 于今年 4 月发布了首批三个基础模型：MAI-Transcribe-1、MAI-Voice-1 和 MAI-Image-2。根据 Suleyman 自己在 3 月的备忘录，frontier 通用 LLM 是 2027 年的目标。

## 深层战略逻辑
这两项交易——Cursor 和 Inception——都指向同一个差距，不是 AGI 竞赛本身，而是其底层：代码生成、模型架构，以及谁拥有开发者入口谁就拥有未来十年的工作假设。
一个耐人寻味的事实是：一家在合作伙伴身上投入 130 亿美元的公司，立即启动了替代方案的影子采购流程。Microsoft 不会这样表达，Reuters 的消息来源也没有人使用"replacement"这个词。
Suleyman 尚未公开说明目前躺在 Microsoft 管道中的初创公司哪些会被收购，哪些会建立合作伙伴关系，哪些会等到别人先收购。SpaceX 已经使得成为同一资产的第二竞标者变得代价高昂。

## 深度分析
Microsoft 在 OpenAI 身上押注 130 亿美元后寻求替代方案，这一动向背后折射出 AI 领域几个重要的结构性变化。
首先，独家绑定模式的瓦解反映了 AI 供应链多元化的必然趋势。当 OpenAI 获得在 AWS 上销售的能力，Microsoft 与 OpenAI 之间的关系就从战略同盟转向了正常的商业竞争。Microsoft 的"备份计划"本质上是对单一供应商风险的本能反应，这在企业级技术采购中是标准做法，只是规模空前。
其次，Cursor 的案例揭示了 AI 代码生成赛道的战略价值。三年内从零增长到 20 亿美元年收入的速度，证明了这个市场的爆发力。Microsoft 放弃收购并非因为不看好，而是监管压力下的被迫选择——同时控制 GitHub Copilot 和 Cursor 会在开发者工作流入口形成垄断地位，这是反垄断监管者无法忽视的。SpaceX-xAI 的接手则说明了 Musk 在 AI 赛道上的野心与支付能力。第三，Inception 的扩散模型路径与主流自回归模型的技术分歧值得关注。如果 Ermon 宣称的每秒 1000 token 属实，这将显著改变边缘推理的成本结构。Microsoft 对 Inception 的持续兴趣暗示其可能在押注非Transformer 架构的未来。
第四，Mustafa Suleyman 主导的 MAI 项目表明 Microsoft 在"造轮子"这件事上已经开始认真。2027 年 frontier LLM 的目标虽然遥远，但这与同步推进的外部投资策略形成了双轨并进的格局——既不完全依赖 OpenAI，也不完全押注自研。

## 实践启示
对于 AI 行业观察者而言，Microsoft 的这一系列动作可以作为判断 AI 行业整合趋势的重要指标。当头部玩家开始多元化其模型供应商时，意味着整个生态系统正在从"少数几个基础模型统治一切"向更分散的架构演进。
对于企业技术决策者，Microsoft 的策略提供了关于供应商风险管理的重要案例研究：即便是已经投入 130 亿美元的深度合作关系，也需要建立应急备份计划。企业不应将所有 AI 能力绑定在单一 API 提供商，即便是像 Microsoft 这样量级的合作伙伴。
对于开发者社区，Cursor 的案例和 GitHub Copilot 的存在共同塑造了 AI 编程助手的竞争格局。两者的竞争而非整合，可能最终有利于开发者——更多的选择和更快的创新迭代。对于投资者，Suleyman 尚未公开的 pipeline 名单代表了下一个值得关注的焦点。SpaceX 的介入已经证明优质 AI 资产的并购成本正在快速上升，早期识别这些潜在标的可能带来显著的投资回报。

## 相关实体
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/microsoft-is-quietly-shopping-for-an-openai-replac.md)
- [OpenAI携手五巨头开源革命性超算协议：一举解决超大集群LLM训练不稳定和网络性能难题](ch01/165-openai.html)- [anthropic](ch01/1292-anthropic.html)- [inference cost at scale with napkin math](ch01/968-20.html)- [olmo-eval: an evaluation workbench for the model development](ch01/818-olmo-eval-an-evaluation-workbench-for-the-model-development.html)- [why use app-level auth when every database has auth? (splunk](ch01/172-why-use-app-level-auth-when-every-database-has-auth-splunk.html)

---

