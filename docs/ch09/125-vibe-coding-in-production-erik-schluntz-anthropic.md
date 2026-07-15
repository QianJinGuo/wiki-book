# Vibe Coding in Production — Erik Schluntz / Anthropic

## Ch09.125 Vibe Coding in Production — Erik Schluntz / Anthropic

> 📊 Level ⭐⭐ | 5.2KB | `entities/erik-schluntz-vibe-coding-in-production.md`

# Vibe Coding in Production — Erik Schluntz / Anthropic
> 作者：整理自 Anthropic 研究员 Erik Schluntz 演讲《Vibe Coding in Production》
> 原文：https://mp.weixin.qq.com/s/uajs9vOpVPqBzGFBw7zxtQ

- **Karpathy 定义**：完全沉浸在 vibe 中，彻底忘记代码的存在。不是"AI 帮你写代码"，是"忘记代码的存在"。
- **Schluntz 补充**：只要你还在逐行审查 AI 写的代码，你就没有在 vibe coding，你只是换了个更贵的 IDE。真正的 vibe coding 是：你跟 AI 说清楚要什么，它出结果，你只看结果对不对。代码长什么样你不关心。就像打车，你关心的是到没到目的地，不是司机怎么握方向盘。

## 深度分析

Vibe Coding 本质上是一种**工程师主体性迁移**：从"代码执行者"转变为"结果验证者"。Karpathy 的定义揭示了一个深刻的隐喻——当 AI 的代码质量超越人类审读者时，坚持逐行审查反而成为系统瓶颈，如同坚持手写汇编的程序员被时代淘汰。

Schluntz 提出每 7 个月 AI 编程任务时长翻倍的增长曲线，意味着当前 AI 能稳定执行 1 小时任务，14 个月后将能执行一整天。这个指数增长的含义不是"AI 越来越强"，而是"人类成为整个链条里最慢环节"的速度正在加快。编译器取代汇编的历史正在大模型时代重演。

**"找到你能验证的抽象层"**是全文最核心的方法论。Schluntz 用公司管理层级做类比：CEO 看财务、CTO 看测试、产品经理看体验——没有人看代码。验证层次从高到低是用户数据 > 产品体验 > 自动化测试 > 代码审查。这个层次结构的底层逻辑是：越高层验证越接近最终价值，越能抵御实现细节的技术债务。

干部分离（Trunk-and-Branch）策略将代码库按风险分为"主干架构"和"叶子节点"——主干必须人工守住，叶子可以全力交给 AI。这个分层模型解决了 Vibe Coding 的最大恐惧：不是全放（找死），也不是全收（浪费）。Anthropic 的 22,000 行代码合并案例验证了这个策略的可行性：两周逐行审查压缩到一天，代价是坚守"开工前需求对齐 + 叶子节点限定 + 核心逻辑人工审 + 可验证检查点"四条铁律。

责任模型从"工程师对代码质量负责"转变为"工程师对产品结果负责，AI 对代码实现负责"，这重新定义了工程师的核心能力：以前是写代码，现在是**说清楚要什么**。开工前 15-20 分钟的对齐动作（AI 探索项目结构→说出任务理解→共同定计划→整合成完整 prompt）本质上是将产品经理的需求澄清环节前置到工程执行之前。

## 实践启示

1. **从一个叶子节点开始练习 Vibe Coding**：不要试图将整个项目交给 AI，先找一个不被其他模块依赖的末端功能模块，让 AI 实现，你只验证结果。关键是克服"必须审每一行"的心理惯性。

2. **在每个任务开始前强制执行需求对齐**：让 AI 先探索项目背景、表达对任务的理解、共同制定计划，再给出完整上下文。这个 15-20 分钟的前置动作能指数级提升 AI 执行成功率。

3. **明确你的验证层并建立快速反馈机制**：在动手之前，先问自己"我怎么快速判断这事做对没做对"——如果答案不清晰，这件事比学 AI 工具更紧迫。验证层决定了你能放手多少代码给 AI。

4. **建立代码库的风险分层地图**：将现有代码库分为"主干架构"（核心逻辑、底层接口）和"叶子节点"（末端功能），对叶子节点全力拥抱 AI，对主干架构保持人工守护和严格测试覆盖。

5. **接受责任模型转变，重新定义职业核心能力**：工程师的价值不再体现在"代码写得漂亮"，而体现在"能否说清楚要什么、能否在高层验证结果"。这是职业身份的重新定位，需要刻意练习新的能力组合。

## 相关实体
- [Anthropic Coding Agents Social Science Survey 2026](ch09/042-anthropic-coding-agent.html)
- [Vibe Coding Agentic Engineering Convergence Simon Willison](../ch04/422-vibe-coding-agentic-engineering.html)
- [从Vibe Coding到Agentic Engineering重构后台开发全流程](../ch04/235-agentic.html)
- [Tencent Vibe Coding To Agentic Engineering Backend](../ch04/203-tencent-vibe-coding-to-agentic-engineering-backend.html)
- [Anthropic 官方生产级 Agent 最佳实践12 个可复用的 Mcp 设计模式 V2](../ch01/891-anthropic.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/erik-schluntz-vibe-coding-in-production.md)

---

