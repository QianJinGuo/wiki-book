---
title: Skill Retrieval Augmentation for Agentic AI — 清华 Skill-RAG
source_url: https://mp.weixin.qq.com/s/xWeppFmwJaqTXmMd-4LI3Q
publish_date: 2026-04-29
tags: [wechat, article, claude, gpt, agent, rag, llm, openclaw]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: 17ff7e1d0e8feff74789ef87d6b05238771a15061fbac29b5c0d505619ef5a1e
---
# Skill Retrieval Augmentation for Agentic AI — 清华 Skill-RAG
> 本文是对 https://mp.weixin.qq.com/s/xWeppFmwJaqTXmMd-4LI3Q 的存档
> 原始论文: https://arxiv.org/abs/2604.24594v1
> GitHub: https://github.com/oneal2000/SR-Agents
## 原文
RAG改换换了！清华提出Skill-RAG
原创 PaperRAG PaperToday
2026年4月29日 20:54 湖北
当你在 Claude Code 里装了几十个 Skill，或者让 GPT 接入上百个工具插件时，你有没有想过一个问题：它真的知道什么时候该用哪个吗？
清华大学的最新研究给出的答案是——不知道。而且不只是"不太确定"，而是系统性地、在完全不该调用外部能力的时候也在调用。这不是一个小的发现，它意味着当前 AI Agent 的核心架构可能存在一个被忽视的盲区。
Skills库正在爆炸式增长
截至 2026 年 4 月，仅 SkillsMP 一个平台就托管了超过一百万个技能。OpenClaw、Claude Code 等系统也在快速增长自己的技能库。现有的做法是把所有可用技能的摘要塞进 Agent 的上下文窗口里，让模型自己判断该用哪个。当技能只有十几个时这没问题，但当 Agent 拥有成千上万个技能时，上下文窗口会被塞满，模型的判断准确率也会断崖式下降。
SRA：从"全部塞给你"到"按需检索"
清华团队提出的解决方案叫Skill Retrieval Augmentation（SRA），即技能检索增强。核心思路很简单：不再把所有技能都塞进上下文，而是像搜索引擎一样，根据当前任务从海量技能库中检索出最相关的几个，再交给 Agent 使用。
这听起来像是 RAG（检索增强生成）的翻版——只是把检索目标从"知识文档"换成了"技能包"。但论文指出，两者有本质区别：RAG 检索的是陈述性知识，用来支撑文本生成；而 SRA 检索的是可执行能力，用来扩展 Agent 的功能边界。检索效果也不能只看语义相似度，还得看最终任务有没有变好。
为了系统性地研究这个问题，团队构建了 SRA-Bench——一个包含 5,400 个测试实例和 636 个人工标注"黄金技能"的评测基准。这些黄金技能被混入了 26,262 个从网络收集的干扰技能中，形成了一个真实的大规模检索场景。评测覆盖数学推理、形式逻辑、工具调用、医学计算、竞赛数学和代码生成六大领域。
好消息：技能检索确实有用
实验的第一组结论是积极的。即使只使用最简单的 BM25 检索器，从 26,000 多个技能中找到 Top-1 并注入上下文，也能显著提升 Agent 在各类任务上的表现。在 Oracle 设定下（直接提供正确技能），性能提升更加明显。
这说明一个基本事实：很多任务确实需要外部技能，当前的 LLM 自身参数知识不够用。SRA 这个方向是对的。
坏消息：Agent 根本不会判断"需不需要帮忙"
但实验也揭示了一个令人意外的瓶颈。团队把测试实例分成两组：一组是 Agent 不用外部技能就能答对的，另一组是答不对的。如果 Agent 是理性的，它应该在后一种情况下更频繁地加载技能，在前一种情况下更保守。
结果呢？两组的技能加载率几乎一模一样。
换句话说，Agent 完全不具备"需求感知"能力。它不知道自己哪些题会做、哪些不会做，也不知道什么时候该向外部技能求助。无论任务是否真的需要外部帮助，它都倾向于以差不多的概率加载技能。
更让人担忧的是，即使检索结果中根本没有正确的黄金技能，Agent 的加载率也没有明显下降。这是一种"技能加载幻觉"——模型在瞎加载，而且自己毫无察觉。只有最强的前沿模型在这个维度上表现出了一定区分能力，但仍然远不理想。
检索不是瓶颈，判断才是
论文还测试了多种检索方案——BM25、TF-IDF、BGE、Contriever、混合检索和 LLM 重排序。结论是：更好的检索确实有帮助，LLM 重排序效果最好。但检索质量的提升并不能完全转化为最终任务的改进。
原因很简单：如果你检索到了正确的技能，但 Agent 选择不用，或者在不该用的时候也在用，那检索再准确也没用。这就像你把一本极好的烹饪书递给一个完全不看菜谱就瞎做的厨师——书再好，问题不在书上。
论文标题: Skill Retrieval Augmentation for Agentic AI
论文链接: https://arxiv.org/abs/2604.24594v1
GitHub: https://github.com/oneal2000/SR-Agents