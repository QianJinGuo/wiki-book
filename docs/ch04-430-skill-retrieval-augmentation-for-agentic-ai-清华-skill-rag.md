# Skill Retrieval Augmentation for Agentic AI — 清华 Skill-RAG

## Ch04.430 Skill Retrieval Augmentation for Agentic AI — 清华 Skill-RAG

> 📊 Level ⭐⭐ | 5.0KB | `entities/skill-rag-tsinghua-sra.md`

# Skill Retrieval Augmentation for Agentic AI — 清华 Skill-RAG
> 本文是对 https://mp.weixin.qq.com/s/xWeppFmwJaqTXmMd-4LI3Q 的存档
> 原始论文: https://arxiv.org/abs/2604.24594v1
> GitHub: https://github.com/oneal2000/SR-Agents
RAG改换换了！清华提出Skill-RAG

## 相关实体
- [Claude Code开发负责人 为何放弃Rag而选择Agentic Search](/ch04-386-claude-code-开发负责人-为何放弃-rag-而选择-agentic-search/)
- [Claude Code开发负责人 为何放弃Rag而选择Agentic Search](/ch04-386-claude-code-开发负责人-为何放弃-rag-而选择-agentic-search/)
- [Hermes Agent Newbie Guide Dotta](/ch04-418-hermes-agent/)
- [Google Agentic Rag Sufficient Context Agent Framesqa](/ch01-297-google-agentic-rag-sufficient-context-agent-framesqa-90/)
- [Three Rag Architectures Classic Graph Agentic](/ch04-318-一文看懂三种-rag-架构-classic-rag-graph-rag-与-agentic-rag/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skill-rag-tsinghua-sra.md)

- MOC
## 深度分析

**1. 技能库规模爆炸导致上下文窗口成为 Agent 瓶颈。** 截至 2026 年 4 月，仅 SkillsMP 平台就托管超过一百万个技能，OpenClaw、Claude Code 等系统也在快速增长。当技能数量从十几个增长到成千上万个时，将所有技能摘要塞进上下文的传统方法导致判断准确率断崖式下降。SRA-Bench 规模达到 26,262 个干扰技能——这不是夸张，而是真实场景的准确刻画。

**2. SRA 与 RAG 有本质区别，不能简单套用。** RAG 检索的是陈述性知识（支撑文本生成），SRA 检索的是可执行能力（扩展 Agent 功能边界）。RAG 的评估指标是语义相似度，但 SRA 必须看最终任务有没有变好。这一本质差异意味着：把 RAG 系统的设计经验直接搬过来会出问题。

**3. 当前 Agent 存在"需求感知缺失"系统性缺陷。** 实验将测试实例分为 Agent 能答对和不能答对两组，理论上应分别表现为"保守加载技能"和"积极加载技能"。但结果显示两组技能加载率几乎相同——Agent 完全不知道自己哪些题会做、哪些不会。这不是偶发的 bug，而是当前 Agent 架构的系统性盲区。

**4. "技能加载幻觉"揭示更严重的问题。** 即使检索结果中根本没有正确的黄金技能，Agent 的技能加载率也没有明显下降。模型在瞎加载技能，而且自己毫无察觉。这说明当前 Agent 的自我评估能力极差——不仅不知道自己会不会，连检索结果的质量都无法判断。

**5. 检索质量提升无法弥补判断能力缺失。** 论文测试了 BM25、TF-IDF、BGE、Contriever、混合检索和 LLM 重排序等多种方案。结论是更好的检索有帮助，但检索质量的提升无法完全转化为最终任务改进。瓶颈不在检索端而在判断端——"把好书递给不看菜谱的厨师"这个比喻精准描述了这个困境。

## 实践启示

1. **在 Skill-RAG 之前增加"需求感知"预判层。** 既然 Agent 无法自主判断是否需要外部技能，就需要在系统层面增加这一判断。实现方式可以是：用一个小模型先判断任务是否超出纯参数知识范围，再决定是否触发技能检索。这比单纯提升检索质量更有效。

2. **用最终任务指标而非检索指标评估技能检索系统。** 论文明确指出 SRA 不能只看语义相似度。在评估任何技能检索系统时，必须以任务完成率、执行步骤数等最终效果为指标，而不是以 Top-K 准确率、MRR 等检索指标为主。

3. **大规模技能库必须分层管理而非扁平堆叠。** 当技能数量达到数万级别时，扁平列表无论怎么排序都无法解决加载率与任务需求不匹配的问题。建议按功能域、复杂度、使用频率等维度对技能库进行分层，Agent 先选择域，再在域内检索。

4. **在生产环境中监控"技能加载幻觉"信号。** 具体做法：对比技能加载率与任务实际改进率。如果加载率很高但改进率很低，说明 Agent 在盲目加载——这是一个需要干预的系统性信号。可以设置自动化告警并触发技能加载策略的调整。

5. **在 SRA-Bench 上评估多模型的需求感知能力。** SRA-Bench 包含 5,400 个测试实例，覆盖六大领域，是评估 Agent 是否具备"知道自己会不会"能力的标准 benchmark。在选型 Agent 时，可以用这个 benchmark 测试模型的自我评估准确性，而不只是测任务准确率。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/skill-rag-tsinghua-sra.md)

---

