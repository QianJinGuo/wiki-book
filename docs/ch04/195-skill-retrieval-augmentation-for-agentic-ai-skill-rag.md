# Skill Retrieval Augmentation for Agentic AI — 清华 Skill-RAG

> 📊 Level ⭐⭐⭐ | 7.7KB

> 本文是对 https://mp.weixin.qq.com/s/xWeppFmwJaqTXmMd-4LI3Q 的存档
> 原始论文: https://arxiv.org/abs/2604.24594v1
> GitHub: https://github.com/oneal2000/SR-Agents
RAG改换换了！清华提出Skill-RAG

## 相关实体
- [Claude Code开发负责人 为何放弃Rag而选择Agentic Search](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code开发负责人-为何放弃rag而选择agentic-search.md)
- [Hermes Agent Newbie Guide Dotta](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-newbie-guide-dotta.md)
- [Google Agentic Rag Sufficient Context Agent Framesqa](https://github.com/QianJinGuo/wiki-public/blob/main/entities/google-agentic-rag-sufficient-context-agent-framesqa.md)
- [Three Rag Architectures Classic Graph Agentic](https://github.com/QianJinGuo/wiki-public/blob/main/entities/three-rag-architectures-classic-graph-agentic.md)

→ [原文存档](https://mp.weixin.qq.com/s/xWeppFmwJaqTXmMd-4LI3Q)

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/ai-skill-design.md)
## 深度分析

### 规模定律：技能库增长把"全量加载"推向结构性失效
现有 Agent 的默认做法是把所有可用技能的摘要塞进上下文窗口，让模型自行选择，这在技能只有十几个时工作正常。但截至 2026 年 4 月，仅 SkillsMP 一个平台就托管了超过一百万个技能，OpenClaw、Claude Code 等系统的技能库也在快速增长；技能数量到达成千上万量级时，上下文被塞满，判断准确率断崖式下降。 SRA-Bench 把黄金技能混入 26,262 个网络收集的干扰技能中，正是对这一真实规模的还原而非人为放大的压力测试。 因此这不是"上下文不够长"的工程问题，而是全量摘要策略随规模增长必然失效的结构问题——参见 [Context Window Economics](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-window-economics.md) 对上下文成本随规模增长的分析。

### 与 RAG 的本质差异：检索目标与评估范式都要换
SRA 的形式像 RAG 的翻版——检索目标从"知识文档"换成"技能包"——但论文指出两处不可迁移的差异：RAG 检索的是陈述性知识、用于支撑文本生成，SRA 检索的是可执行能力、用于扩展 Agent 的功能边界；RAG 可用语义相似度评估召回质量，SRA 必须以最终任务是否变好为准。 这意味着 Top-K 准确率、MRR 等检索指标无法代理 SRA 的效果评估，评估必须端到端落到任务层。已有 [Three Rag Architectures Classic Graph Agentic](https://github.com/QianJinGuo/wiki-public/blob/main/entities/three-rag-architectures-classic-graph-agentic.md) 对经典/图谱/Agentic 三种 RAG 架构的总结与 [Retrieval Augmented Generation Rag](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/retrieval-augmented-generation-rag.md) 的方法论梳理在此构成参照系：SRA 相当于把 Agentic 检索的对象从知识换成了能力，评估范式随之从"相似度"迁移到"任务增益"。

### 两个实验暴露的系统性盲区：需求感知缺失与技能加载幻觉
论文最有价值的发现来自分组实验：把测试实例分成"不用外部技能也能答对"与"答不对"两组，理性 Agent 应在前者保守加载、在后者积极加载，但两组的技能加载率几乎一模一样——Agent 完全不具备"需求感知"能力，不知道自己哪些题会做、哪些不会。 更严重的推论是：即使检索结果中根本没有正确的黄金技能，加载率也没有明显下降，即"技能加载幻觉"——模型在盲加载且毫无察觉；只有最强的前沿模型表现出一定区分能力，仍远不理想。 这说明缺陷不在提示词层面而在架构层面：当前 Agent 缺少对自身能力边界的校准。这与 [Agentic Abstention Washington Allen 2026](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentic-abstention-washington-allen-2026.md) 研究的"该弃答时不弃答"是同一枚硬币的两面——一个是不知道何时该向外部求助，一个是不知道何时该承认不会。

### 瓶颈错位：检索已接近可用，判断成为新的边际收益所在
积极的一面：即使最简单的 BM25 从 26,000 多个技能中取 Top-1 注入上下文，也能显著提升任务表现；Oracle 设定（直接提供正确技能）下提升更大，说明大量任务确实超出 LLM 的参数知识范围，SRA 方向本身成立。 论文随后测试了 BM25、TF-IDF、BGE、Contriever、混合检索与 LLM 重排序：检索质量持续提升且 LLM 重排序最好，但检索收益不能完全转化为任务收益——检索对了 Agent 可能不用，不该用时也在用。 "把极好的烹饪书递给不看菜谱的厨师"的比喻准确刻画了瓶颈位置：边际收益已从检索端转移到判断端。对系统设计者的含义是：继续堆更重的 reranker、更好的 embedding 回报递减，投资于"何时检索、何时加载、何时不用"的决策层回报更高。

### SRA-Bench 的评测设计：把判断能力从任务能力中剥离
SRA-Bench 包含 5,400 个测试实例、636 个人工标注黄金技能，覆盖数学推理、形式逻辑、工具调用、医学计算、竞赛数学和代码生成六大领域。 其设计的关键在 Oracle/检索双轨：Oracle 轨道给出能力上限，检索轨道暴露判断损耗，两者之差即为"判断能力缺口"——这使它成为少有的能单独度量"知道自己会不会"这一元认知能力的 benchmark，与 [Agent Evaluation Benchmark Frameworks](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-evaluation-benchmark-frameworks.md) 收录的通用评测形成维度互补。技能生态仍在扩张（见 [Google Agentic Skills Survey Sixtuple 2026](https://github.com/QianJinGuo/wiki-public/blob/main/entities/google-agentic-skills-survey-sixtuple-2026.md)），这一缺口的代价会随规模持续放大。

## 实践启示

1. **在 Skill-RAG 之前增加"需求感知"预判层。** 既然 Agent 无法自主判断是否需要外部技能，就需要在系统层面增加这一判断。实现方式可以是：用一个小模型先判断任务是否超出纯参数知识范围，再决定是否触发技能检索。这比单纯提升检索质量更有效。

2. **用最终任务指标而非检索指标评估技能检索系统。** 论文明确指出 SRA 不能只看语义相似度。在评估任何技能检索系统时，必须以任务完成率、执行步骤数等最终效果为指标，而不是以 Top-K 准确率、MRR 等检索指标为主。

3. **大规模技能库必须分层管理而非扁平堆叠。** 当技能数量达到数万级别时，扁平列表无论怎么排序都无法解决加载率与任务需求不匹配的问题。建议按功能域、复杂度、使用频率等维度对技能库进行分层，Agent 先选择域，再在域内检索。

4. **在生产环境中监控"技能加载幻觉"信号。** 具体做法：对比技能加载率与任务实际改进率。如果加载率很高但改进率很低，说明 Agent 在盲目加载——这是一个需要干预的系统性信号。可以设置自动化告警并触发技能加载策略的调整。

5. **在 SRA-Bench 上评估多模型的需求感知能力。** SRA-Bench 包含 5,400 个测试实例，覆盖六大领域，是评估 Agent 是否具备"知道自己会不会"能力的标准 benchmark。在选型 Agent 时，可以用这个 benchmark 测试模型的自我评估准确性，而不只是测任务准确率。

→ [原文存档](https://mp.weixin.qq.com/s/xWeppFmwJaqTXmMd-4LI3Q)

---

