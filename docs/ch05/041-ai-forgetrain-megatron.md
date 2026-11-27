# 全球首个完全AI编写的训练框架：面壁ForgeTrain速度反超英伟达Megatron，年底要把国产算力软件重写一遍

> 📊 Level ⭐⭐⭐ | 9.8KB

> → [原文存档](https://mp.weixin.qq.com/s/rl48C-c_1LQMdnJ7ZKDzJw)

## ForgeTrain：AI 编写训练框架，超越 Megatron

## 一句话

面壁智能 ForgeTrain：全球首个全部由 AI 编写、零人介入的生产级训练框架，比英伟达 Megatron 快 10%，提出"锻造工程"——为每个模型/芯片/任务现场定制框架。

## 核心方法论

**三阶段**：
1. 采集关键数据 → 形成评测 Harness
2. 构建二进制一致版本（已比 Megatron 快 10%）
3. 解除一致限制 → 迭代超越

**为什么更快**：Megatron 需在通用性和性能间权衡；ForgeTrain 为特定模型深度定制，优化空间更细。

## 关键概念

**Harness**：把目标包装成系统——环境 + 上下文 + 工具 + 任务流程 + 评分标准。"AI 制造 AI"没有现成 Harness，面壁在建立"考场"。

**Human on the Loop**：AI 自主运转，人只盯着有没有问题——比 Human in the Loop 更进一步。

"AI 研发 AI"的核心是 Harness——只要问题能被评测，AI 就能把它做得越来越好。

## 关键数字

- 昇腾：MiniCPM5-1B 预训练 3-5 天
- 英伟达：MiniCPM4-0.5B 两天
- 比 Megatron 快 10%
- 内部 8B 已验证，MoE 即将推进

## 锻造工程

AI 写代码成本趋近于零 → 没有必要继续做大而全通用框架 → 为每个模型/芯片/任务"现场锻造"高度定制化软件。

## 深度分析

**ForgeTrain 的技术突破性在于它完全由 AI 生成，而非人类工程师编写。** 这代表着 AI 研发范式的一个关键转折：过去 AI 生成的代码需要人类审核、修改和优化，现在 AI 已经能够生成生产级的训练框架代码。

**三阶段方法论揭示了 AI 研发的核心逻辑：** 第一阶段建立评测标准和 Harness，这是让 AI 能够自主优化的前提条件；第二阶段通过二进制一致约束保证生成代码的正确性；第三阶段解除约束后让 AI 自由迭代超越人类方案。

**速度提升 10% 的意义不在于数字本身，而在于验证了定制化路径的可行性。** 通用框架（如 Megatron）必须在覆盖广泛模型和芯片的同时保证兼容性，这牺牲了性能优化空间。ForgeTrain 为特定模型从零生成的框架，能够充分利用该模型的特性进行深度优化。

**Harness 的本质是构建可评测的"考场"。** 在传统软件开发中，编译器、单元测试等形式化工具提供了天然的评测能力。但"AI 制造 AI"这个领域没有现成的评测系统——运行成本高、反馈周期长、难以量化评估。ForgeTrain 的核心贡献之一是为这个领域建立了评测基础设施，使 AI 能够通过强化学习不断优化自身。

### 资源约束下的原始动机：可评测的问题终将被解决

ForgeTrain 不是孤立的技术炫技，而是面壁对行业资源约束的系统性回应。高质量互联网数据快速消耗、GPU/数据中心/电力日益紧张，继续"堆资源"推动模型进化的边际成本越来越高。面壁给出的答案是让 AI 接管 AI 研发的全链条——代码生成、训练框架开发、算子优化、数据生成、评测反馈、实验迭代乃至模型架构探索。 其背后的关键洞察是一条可迁移的判据：只要一个问题能被高效评测、能为模型准备足够的专家数据、并通过强化学习把能力回流到模型，AI 就会把这件事做得越来越好。 这与 wiki 已有的 [Ai R And D When Ai Builds Itself Bottleneck Shift R D Harness](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/ai-r-and-d-when-ai-builds-itself-bottleneck-shift-r-d-harness.md)（AI 研发 AI 的瓶颈迁移）与 [Rlvr Reinforcement Learning Verified Reasoning](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/rlvr-reinforcement-learning-verified-reasoning.md)（可验证奖励的强化学习）构成同一命题的不同侧面。

### 国产算力追赶的杠杆：用 AI 密度对冲工程存量差距

往生态层面再推一层，ForgeTrain 的真正战略含义落在国产算力板块。英伟达生态好用，源于长期积累的开发者与工程实践存量；国产算力起步晚，靠人类工程师一点点打磨追赶，难度极高。AI 改变了这个不等式的性质——人类开发者再多，也不如 AI 不知疲倦地打磨细节，面壁甚至给出了明确时间表：到年底把头部国产算力软件全做一遍。 但这条杠杆有一个前置条件：AI 只能优化能被评测的目标，国产算力软件若缺乏统一的评测基准，"AI 密度"就无处着力。换言之，ForgeTrain 验证的不仅是写框架的能力，更是"先建考场、再锻造软件"这一顺序的可复制性。

### 当前局限的诚实清单：优势边界与未验证区

对 10% 的速度优势应标注其适用边界。当前验证集中在稠密中小模型上（昇腾 MiniCPM5-1B、英伟达 MiniCPM4-0.5B、内部 8B），MoE 等更复杂模型尚未推进； 同时原文明确列出三重局限：AI 接管范围主要覆盖框架和算子层面，算法调参尚未开始从零交给 AI；Harness 的行业共识尚未完全形成；整体仍处于 Human on the Loop 阶段，不是完全无人介入。 这意味着"零人介入"目前是对研发执行层的描述，而非全流程事实——评测标准的制定仍握在人类手中，这正是下文"提出正确问题比执行方案更重要"这一启示的根源。

### 与 Harness 工程谱系的对接

把 ForgeTrain 放进 wiki 已有的 [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering.md) 谱系看，其独特性在于把 Harness 从"agent 运行时外壳"扩展到"训练框架生成的评测基座"。原文对 Harness 的定义是把目标包装成环境 + 上下文 + 工具 + 任务流程 + 评分标准的整套系统； ForgeTrain 证明同一思路可以下沉到系统软件层——为"训练框架是否更快、数值是否一致"建立考场，使 AI 能在二进制一致的安全护栏内自主迭代。两个层次指向同一结论：可评测性决定 AI 自主优化的天花板，谁先建成考场，谁就先获得迭代飞轮。

## 实践启示

**1. Harness 先行的工程思路值得借鉴。** 在开发任何 AI 生成代码的系统时，应首先问自己：如何评测这套代码？如果无法高效评测，AI 的优化空间就会受限。

**2. 定制化优于通用性。** 当 AI 生成代码的成本趋近于零时，为每个具体场景生成高度定制化的解决方案，比维护一个通用框架更有效。这对其他 AI 研发领域（如数据处理、模型压缩、推理优化）都有指导意义。

**3. Human on the Loop 而非 Human in the Loop。** 人类角色从参与每个环节转向监控整体方向，这要求人类能够提出正确的评测标准，而非具备每个环节的专业知识。培养"提出正确问题"的能力比"执行具体方案"更重要。

**4. 国产算力生态的追赶路径。** 通过 AI 自动化弥补人类工程师数量和经验上的差距，是一个值得关注的思路。但前提是能够建立有效的评测体系，让 AI 知道往哪个方向优化。

## 相关实体
- [Ai Coding Agent Memory System](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-coding-agent-memory-system.md)
- [Deepseek Cost Migration System Layer Kv Cache Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-cost-migration-system-layer-kv-cache-harness.md)
- [Gaode Ai Native 7X24 Pipeline Self Healing](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gaode-ai-native-7x24-pipeline-self-healing.md)
- [Karpathy Claude Md Rules](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-claude-md-rules.md)
- [Tmall Ai Coding Practice Guide](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tmall-ai-coding-practice-guide.md)

- [Minimax M3 Frontier Open Source Model](https://github.com/QianJinGuo/wiki-public/blob/main/entities/minimax-m3-frontier-open-source-model.md)
- [Chromium Ai Coding Development System](https://github.com/QianJinGuo/wiki-public/blob/main/entities/chromium-ai-coding-development-system.md)
- [Loongsuite Pilot Sls Ai Coding Metrics Practice](https://github.com/QianJinGuo/wiki-public/blob/main/entities/loongsuite-pilot-sls-ai-coding-metrics-practice.md)
- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/coding-agent-practice.md)

---

