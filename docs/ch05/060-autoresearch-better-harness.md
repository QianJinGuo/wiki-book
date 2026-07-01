# 从 Autoresearch 到 Better-Harness：自动优化真正难在评价信号

## Ch05.060 从 Autoresearch 到 Better-Harness：自动优化真正难在评价信号

> 📊 Level ⭐⭐ | 7.1KB | `entities/better-harness-eval-trace-harness-hill-climbing.md`

# 从 Autoresearch 到 Better-Harness：自动优化真正难在评价信号
**来源:** 慢学AI（基于 LangChain 博客）
**URL:** https://mp.weixin.qq.com/s/Tinog5FcVCjtFrhcgbVrtQ
**原文:** LangChain — *Better Harness: A Recipe for Harness Hill-Climbing with Evals*
**标签:** #BetterHarness #HarnessEngineering #Eval #Trace #自动优化

## 相关实体
- [Hermes Agent Deep Dive Alibaba](ch03/044-agent.md)
- [Deerflow Hermes Openclaw Comparison](ch11/209-openclaw.md)
- [Harness Evolution Papers](ch05/009-harness.md)
- [Better Harness Eval Trace Methodology](ch05/009-harness.md)
- [Wow Harness V3 Governance Protocol](ch05/009-harness.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/better-harness-eval-trace-harness-hill-climbing.md)

## 深度分析

Karpathy 的 Autoresearch 证明自动优化「能跑起来」，但 Better-Harness 揭示了更艰难的一半：当评价信号（eval）错了，系统会沿着错误方向「跑得更快」。这个核心矛盾的根源在于 eval 与 prompt/工具/工作流之间的关系本质上不同于测试答案与程序的关系——eval 是方向信号，而方向一旦偏离，优化过程会在错误的方向上积累错误的进步。传统 ML 中梯度反向传播可以即时修正方向错误，但 harness 优化依赖离散的行为信号，无法提供类似的即时修正机制 。

LangChain 提出的六步法中，「拆优化集和留出集」这一步揭示了自动优化中最容易被忽视的过拟合问题：如果只在优化集上反复调，Agent 最终会「背熟题」而非真正提升能力。这一问题的深层原因在于 eval 样例本身也是 Agent 训练数据的一部分——反复针对同一批 eval 调整 harness，实质上是在让 Agent 学会「讨好」这些特定样例的表面特征，而非掌握任务背后的通用能力。留出集的存在本质上是对抗这种数据泄露的防御机制 。

trace 作为诊断工具的价值远超「记录执行过程」这一表面功能。在 Better-Harness 的方法论中，trace 是定位「行动节奏问题」的唯一手段——Agent 该停的时候继续搜、该动手的时候反复确认、该问目标的时候去问实现细节，这些模糊的行为异常只有在 trace 中才能被具体定位。然而，trace 的价值取决于其颗粒度和可读性：过于稀疏的 trace 无法支撑定向分析，过于稠密的 trace 会造成信息过载。实践中，团队需要在记录成本和分析需求之间找到平衡点 。

eval 生产飞轮的设计揭示了一个能力进化的正反馈循环：更多使用 → 更多 trace → 更多 eval → 更好的 harness。这个飞轮的核心驱动力是 trace 中蕴含的失败模式——每一条 Agent 失败 trace 就是一条潜在的 eval 来源。这意味着 eval 的质量直接与 trace 的覆盖度成正比，而 trace 的覆盖度又与 Agent 的使用规模成正比。对于刚起步的团队，飞轮早期阶段天然处于「鸡生蛋还是蛋生鸡」的困境：没有足够的使用量就没有足够的失败 trace，没有足够的失败 trace 就无法建立高质量 eval 。

从类比ML训练的角度看，Better-Harness 的框架揭示了 eval 设计在 harness 工程中的核心地位。传统 ML 的核心资产是「训练数据」，harness 工程的核心资产是「eval 和 trace 系统」。一旦 eval 系统成熟，单条 prompt 的价值会显著下降——因为 prompt 的效果边界由其对应的 eval 决定，而 eval 的质量决定了优化的天花板。这一转变意味着团队应将更多工程资源投入 eval 系统的建设，而非 prompt 的手工调优 。

## 实践启示

1. **eval 设计能力是 harness 工程师最高杠杆的技能**：一个设计精良的 eval 可以驱动整个优化过程走向正确方向，而一个设计糟糕的 eval 会让所有优化努力南辕北辙。团队应投入专门资源（甚至设立专职 eval 工程师岗位）来设计覆盖关键行为维度的 eval 体系，而非将 eval 当作「顺带手」的工作。eval 的行为标签体系（搜索是否适时停止、工具选择、多步推理等）是构建行为地图的基础 。

2. **留出集是防止自欺的必要机制，每次优化迭代都应使用**：将 eval 拆分为优化集（发现问题和提出改动）和留出集（验证改动在未见样例上的泛化能力）是标准实践。优化集变好 + 留出集变差意味着 Agent 在「刷熟悉题」，并无真正泛化。团队应建立明确的「留出集通过率」作为优化是否有效的判断标准，避免将过拟合误判为进步 。

3. **trace 分析应聚焦于「行动节奏」而非「答案正确性」**：LangChain 实验发现的核心洞察是：很多 Agent 失败不是因为「不会做任务」，而是因为「行动节奏不对」。这意味着 trace 分析的重点应从「最终结果对不对」转向「过程中的行为序列是否合理」——工具选择时机、搜索停止时机、确认与执行的顺序等。节奏问题比结果问题更隐蔽，但更容易通过 trace 定向修正 。

4. **人工审核是 eval + trace 自动流程的必要兜底，而非可选项**：即使 eval 分数通过、留出集通过，人工审核仍可能发现「指令过度具体只服务某个样例，浪费上下文窗口」等问题。这些问题本质上不是 eval 能捕捉的行为信号，而是产品体验层面的判断。自动化流程可以排除大多数常规错误，但产品体验的最终把关仍需人工判断 。

5. **生产 trace 是最高质量的 eval 来源，应优先于手工策展和外部数据集**：用户真实使用中产生的失败 trace 具有最高的行为真实性——每一条失败 trace 都是一个天然形成的 eval 样例。相比手工策展（价值高但难规模化）和外部数据集（只适合作为原材料），生产 trace 提供了质量与规模的最优平衡。团队应建立从生产 trace 到 eval 的自动化 pipeline，实现 eval 生产的规模化 。

---

