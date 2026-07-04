# Programbench Swe Agent Benchmark

## Ch04.486 Programbench Swe Agent Benchmark

> 📊 Level ⭐⭐ | 4.9KB | `entities/programbench-swe-agent-benchmark.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/programbench-swe-agent-benchmark.md)

## 摘要
[Leaderboard](/) [Paper](https://arxiv.org/abs/2605.03546) [GitHub](https://github.com/facebookresearch/ProgramBench) [Team](/team/) [Blog](/blog/) [H...

## 原文存档
- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/programbench-swe-agent-benchmark.md)

## 相关资源
## 深度分析
ProgramBench的核心设计哲学是回答"SWE-bench等现有benchmark无法回答的一个问题"：在没有方法签名、没有类骨架、没有需求文档的情况下，模型能否真正从零设计一个完整的软件系统？答案是目前所有模型都极低（0% Resolved），但这个"失败"本身就是最重要的发现。
**1. ProgramBench的"无提示设计"是它与其他SWE benchmark的本质区别。** SWE-bench给了方法签名和类骨架，Agent的工作是实现而非设计。ProgramBench要求Agent自主决定抽象层次、模块划分和接口设计——这些正是软件工程中最难自动化的部分，也是之前所有benchmark有意回避的部分。当前所有模型均为0% Resolved，说明即使是最强模型，在"从零架构"这件事上仍远未达到可靠水平。
**2. 248,000+行为测试用例（覆盖200个任务）使得ProgramBench的评测具有前所未有的细粒度。** SWE-bench通常只判断"测试是否通过"，ProgramBench通过模糊测试（fuzzing）生成大量边界测试用例，即使是"几乎解决了"的任务（Almost Resolved，≥95%测试通过）也可能因为剩余5%的边界问题而完全不可用。FFmpeg和PHP Compiler仅5%的得分就是例证——这些系统的边界条件极其复杂。
**3. 禁用互联网访问和反编译是ProgramBench防作弊设计的核心，不是为了"让题目更难"，而是为了确保测试的是"真实软件构建能力"而非"信息检索能力"。** 研究者发现在允许互联网的实验版本中，Agent找到了大量捷径（从GitHub克隆源代码、通过包管理器下载代码），必须用LM作为评判来标记和排除这些作弊行为。这反过来说明：在无互联网的clean room环境下，当前模型几乎不可能可靠地完成复杂软件重构。
**4. 所有模型0%的结果本身就是一个关于当前LLM架构能力边界的重要信号。** 任务从设计上是"可解决的"（参考实现pass了所有测试），但当前模型无法解决。这意味着SWE-bench上的高得分（SWE-bench Verified上某些模型已达60%+）可能高估了模型的真实软件工程能力——因为SWE-bench的设计更接近"补全已有代码"而非"从零构建"。
**5. Claude Opus 4.7在0% Resolved的情况下仍有3.0% Almost Resolved，排名第一——这说明Claude在架构设计决策上的表现优于其他模型，尽管仍远未达到实用水平。** 这个差距可能反映了Claude在长程规划和代码组合能力上的相对优势，但3.0%的Almost Resolved也说明即使是最强的模型，在面对PHP Compiler或FFmpeg这种量级的项目时也举步维艰。

## 实践启示
**对于AI coding agent开发者：** ProgramBench的0% Resolved结果表明，当前所有coding agent的"从零构建"能力都有根本性缺陷——这解释了为什么SWE-bench Verified上表现良好的agent在实际复杂项目中仍然经常失败。不要把SWE-bench分数作为"软件工程能力"的代理指标，它测试的是"代码补全"而非"架构设计"。
**对于评估LLM软件工程能力的团队：** 在评估框架中加入ProgramBench式的"无提示"任务，可以更真实地反映模型在生产环境中的能力边界。如果ProgramBench的分数不提升，说明当前模型的架构设计能力存在系统性问题，而非个别任务失败。
**对于AI coding agent研究者：** ProgramBench即将开放提交端口，这是参与一个全新benchmark的机会。设计更好的scaffold（而非更强的模型）可能是短期内提升ProgramBench分数的最有效路径——当前使用的是极简的mini-SWE-agent，没有利用任何高级规划策略或工具调用模式。
**对于担心模型"记忆源代码"问题的评估者：** ProgramBench的"不同语言"消融实验结果表明，当前极低的分数与源代码记忆无关——强制模型用不同语言实现时分数没有显著变化，说明模型确实是在"尝试构建"而非"回忆已有代码"。

## 相关资源
- [Agent Memory 架构](https://github.com/QianJinGuo/wiki/blob/main/entities/agent-memory-architecture.md)
- [Claude Managed Agents 开发者指南](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-managed-agents-developer-guide.md)

---

