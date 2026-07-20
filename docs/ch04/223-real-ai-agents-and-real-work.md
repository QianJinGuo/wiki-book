# Real AI Agents and Real Work

## Ch04.223 Real AI Agents and Real Work

> 📊 Level ⭐⭐ | 10.8KB | `entities/real-ai-agents-and-real-work.md`

# Real AI Agents and Real Work

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/real-ai-agents-and-real-work.md)

## 摘要

Ethan Mollick（One Useful Thing）2025 年 9 月的这篇文章记录了 AI agents "悄悄跨越门槛"的时刻 — 它们现在能执行真正有经济价值的工作。核心证据：OpenAI 的 GDPval 基准测试让有 14 年行业经验的人类专家与 AI 比赛完成 4-7 小时的实际工作任务，**人类专家赢了，但只赢一点点**，且差距因行业而剧烈变化。AI 输的主要原因不是幻觉和错误，而是**结果格式不佳或不严格遵循指令** — 这些都是快速改进中的领域。

## 核心要点

### 1. 测的是任务，不是工作

Mollick 的关键区分：**测的是任务（task），不是工作（job）**。一份教授工作包含教学、研究、写作、年度汇报、学生支持、阅读、行政等多任务，AI 完成其中几个不意味着替代整份工作。在 jagged frontier 持续存在的背景下，AI 难以替代"整个工作"。

**对企业的含义**：与其问"AI 能替代哪个岗位"，不如问"这个岗位的哪些任务可以让 AI 完成"。前者导向裁员焦虑，后者导向生产力提升。

### 2. 学术论文复现：AI 创造新研究可能性

Mollick 给了 Claude Sonnet 4.5 一篇复杂经济学论文 + 完整复现数据，提示"复现这篇论文的发现，你需要自己完成，如果不能完整复现就做你能做的"。Claude 读完论文、打开归档整理文件、把 STATA 统计代码转 Python、逐条核对所有发现，**报告成功复现**。Mollick 抽查后用 GPT-5 Pro 再做一遍，结果一致。在其他论文上同样成功（少数因文件大小或数据问题无法访问）。

**革命性含义不是节省时间**，而是：曾经撼动整个学术界的"复现危机"过去需要昂贵的人工无法规模化复现；现在 AI 可以批量复现，**对所有科学研究都有深远影响**。

**复现可能是一项 AI 任务而非 AI 工作，但它可能戏剧性地改变整个人类事业领域**。这是任务型 AI 的典型范式 — 单点任务有大量价值，组合成完整工作仍有距离。

### 3. Agent 突破的根本原因：精度的小提升带来任务数的大增长

传统假设是"AI agent 在长链任务中只要一步失败就全盘失败"。但 2025 年 9 月的一篇论文推翻了这一假设：**AI 准确率的小幅提升带来可完成任务数的指数级增长**。新模型错误率低 + "thinking" 模型自校正能力，让 agent 能完成比之前多得多步骤的任务。

这一发现重塑了 agent 工程的优化目标：**与其追求单步 99.9% 的精度，不如追求"足够好 + 自校正"**。

### 4. METR 任务长度指数曲线：五年的连贯改善

METR 的"AI 能独立以 ≥50% 准确率完成的任务长度"测试是少数覆盖 GPT-3 到 GPT-5 全系列的度量。**指数增长在五年内高度一致** — 持续不断的 agentic 工作能力提升。

**对预测的含义**：把这条曲线外推，2026-2027 年的 agent 能独立完成"几天"级别的工作流；这对企业流程自动化是质变。

### 5. Agent 尚无真正 agency：人类必须决定"做什么"

Agent "没有真正的 agency（人类意义上的自主性）"。现在需要人类决定**用 agent 做什么**，这将决定工作的未来。Mollick 区分两种风险：
- **风险一**：用 AI 替代人力（"无想象力组织"会聚焦成本削减）
- **风险二**：用 agent 机械地做更多现有任务（不思考"为什么做"）

Mollick 给 Claude 一份企业备忘录，要求转成 PowerPoint，再换一个角度，再换一份 ... **直到 17 份不同的 PowerPoint**。这是第二种风险的预演。

### 6. 推荐工作流：委派 → 审阅 → 修正 → 自做

OpenAI 论文建议的工作流：
1. 委派任务给 AI 做第一遍
2. 审阅结果
3. 如果不够好，给修正或更好的指令再试几次
4. 如果仍不行，自己做

**预计效益：工作快 40%、便宜 60%，更重要的是保留对 AI 的控制权**。

**关键工程含义**：这不是"AI 自动完成工作"，而是"AI + 人类判断"协作模式。判断（什么值得做）由人类完成，AI 完成可委派的部分。

## 深度分析

### 任务而非工作：Mollick 核心区分的深层含义

Mollick 坚持"测的是任务而非工作"这一区分，其深层含义远比表面听起来深刻。当我们把 AI 放在任务的维度上衡量，它已经跨越了经济价值门槛；但放在工作的维度上，Jagged Frontier 仍然阻止它全面替代。 这个区分的实践意义是：组织不应再问"AI 能替代哪个岗位"，而应问"这个岗位的哪些任务可以委派给 AI"——前者导向裁员焦虑，后者导向真正的生产力提升。这不是语言游戏，而是重新框定问题的思维方式转变。

### Agent 精度提升的指数效应：被低估的拐点

传统观点认为 AI agent 在长链任务中一步失败便全盘皆输，因此其能力被严重高估。但 2025 年的研究推翻了这个假设：准确率的小幅提升带来可完成任务数的指数级增长。这意味着 agent 能力的发展不是线性的，而是存在快速爬坡的拐点。当错误率降到某个阈值，agent 能处理的任务长度突然爆发。这个拐点可能比大多数预测者估计的更近——结合 METR 五年的指数曲线，2026-2027 年 agent 能独立完成"几天"级别的工作流并非激进预测。

### METR 指数曲线：五年一致性的信誉背书

METR 的任务长度测试覆盖了 GPT-3 到 GPT-5 全系列，是少数跨模型世代的连续度量。 五年高度一致的指数增长的意义在于：这不是某个特定模型的偶然表现，而是整个 agentic AI 能力域的系统性提升。这种一致性给了我们外推未来的信心——把曲线往前推，2026-2027 年的 agent 将能在 ≥50% 准确率下独立完成几天级别的工作流，这对企业流程自动化而言是质变而非渐变。

### 判断与执行的分离：Agentic AI 重构认知工作价值链

Mollick 的 agentic AI 图景揭示了一个根本性转变：AI 接管执行性任务，人类保留判断性任务。这不只是效率提升，而是认知工作价值链的倒置——当执行可以批量自动化，"判断什么值得做"成为最稀缺的能力。Mollick 的"17 份 PowerPoint"警示并非技术失败，而是价值判断缺失的失败：Agent 可以无限生成，但生成什么必须由人类决定。这种分离为 harness engineering 等 [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 提供了核心前提：人类的判断力成为整个系统的瓶颈和杠杆。

## 实践启示

1. **用"任务视角"做 AI 落地规划**：不讨论"AI 替代哪些岗位"，列出每个岗位的 10 个核心任务，标出哪些可 AI 委派 + 哪些需要人类判断 — 这是 ROI 最清晰的拆解方式。
2. **优先把"判断密集型任务"留给人类**：Mollick 的"17 份 PowerPoint"案例警告我们，agent 不会自动判断"什么值得做"。在 agent 系统设计中应显式区分"做哪些事"和"怎么做"。
3. **优化"足够好 + 自校正"而非"单步极致精度"**：研究表明 agent 准确率的小幅提升带来任务数指数级增长。设计 agent harness 时，引入自校正循环比追求单步 99% 更有杠杆。
4. **把"复现"作为高价值 AI 应用**：学术论文复现、代码 review 复现、报告数据核验 — 这些都是"耗时但可委派"的任务，AI 复现可以释放人类创造力到真正需要判断的工作上。
5. **用"委派 → 审阅 → 修正 → 自做"工作流约束 agent 使用**：在团队流程中明确这四个步骤，避免"agent 无限循环生成无用结果"或"人类 100% 自做浪费 AI 能力"两个极端。
6. **关注"判断环节"的人员培养**：当 AI 接管执行性任务后，团队最稀缺的能力是"判断什么值得做" — 应在流程中显式保留和培养这一能力，而不是让组织结构扁平化消灭判断者。

## 关联实体

- [存之有序治之有矩Agent 记忆系统的工程实践与演进](../ch03/046-agent.html)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](ch04/235-agentic.html)
- [一文带你弄懂 Ai 圈爆火的新概念Harness Engineering](../ch05/052-harness-engineering.html)
- [Karpathy Vibe Coding Agentic Engineering](ch04/132-karpathy-vibe-coding-agentic-engineering.html)
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](ch04/230-agentops-operationalize-agentic-ai-at-scale-with-amazon-bed.html)
- [两万字详解Claude Code源码核心机制](../ch03/076-claude-code.html)
- [The Shape Of Ai Jaggedness Bottlenecks And Salients](../ch01/464-the-shape-of-ai-jaggedness-bottlenecks-and-salients.html)
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

---

