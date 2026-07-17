# The Bitter Lesson versus The Garbage Can

## Ch04.337 The Bitter Lesson versus The Garbage Can

> 📊 Level ⭐⭐ | 8.2KB | `entities/the-bitter-lesson-versus-the-garbage-can.md`

# The Bitter Lesson versus The Garbage Can

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/the-bitter-lesson-versus-the-garbage-can.md)

## 摘要

Ethan Mollick 借用 Richard Sutton 2019 年的"苦味教训"（Bitter Lesson）来挑战企业 AI 落地的传统路径。传统思路：先梳理混乱的组织流程（Garbage Can Model 描述的企业现实）→ 再让 AI 理解流程 → 再自动化。苦味教训暗示了相反路径：**跳过流程梳理，直接训练 AI 产出"好结果"**——AI 会找到自己的路径通过组织混乱。Manus（手工艺精心设计）与 ChatGPT agent（强化学习训练结果）的对比，是这一论点的实证。

## 核心要点

- **Garbage Can Model 的现实**：组织并非理性机器，而是"垃圾筒"——问题、方案、决策者被随机倒在一起，决策是这些元素偶然碰撞的结果。组织理论家 Cohen, March, Olsen 1972 年提出。
- **传统自动化的痛点**：43% 美国职场人用过 AI，但都是非正式地解决自己工作问题。企业级扩展难——传统自动化要求**清晰规则与定义流程**，而这正是 Garbage Can 组织所缺的。
- **苦味教训的历史回放**：1997 年 Deep Blue 用 200M positions/sec 暴力搜索 + 一些人类 chess 知识击败 Kasparov；2017 年 AlphaZero 用零先验知识自博弈训练，横扫 chess、shogi、go。**纯算力 + 通用 ML 击败了几百年 chess 智慧的编码**。
- **Manus vs ChatGPT agent**：Manus 是手工精心设计的通用 agent——数百行精心打造的 system prompts、明确的 to-do list 流程、硬编码的 agent 知识。ChatGPT agent 用 RL 训练于**最终结果**（不是过程）——不教它怎么造 Excel，只评估 Excel 文件质量。同一 prompt 任务下，ChatGPT 找到更可信的来源，生成的 Excel 实际可用。
- **企业 AI 落地的反直觉路径**：不需梳理每个混乱流程，只需定义"好输出"是什么、给足够示例，让 AI 找到自己的路径。组织中那些"非官方、文档化不足"的流程**可能并不重要**——重要的是能识别好结果。

## 深度分析

### 1. Sutton 苦味教训的精确表述

Sutton 2019 年原文论点：AI 研究者一次又一次尝试用人类理解编码解决难题（chess, Go），但最终胜出的是**通用方法 + 算力**。教训之"苦"在于：人类毕生经验编码的智慧在 AI 解决问题时**不重要**。几十年研究者精心编码的领域知识最终被"砸更多算力"超越。

### 2. Manus 的"工艺陷阱"与 ChatGPT agent 的"结果训练"

Manus 是工艺典范：几百行手工 system prompts、明确的工作流脚本、积累的"如何让 agent 在今天 AI 系统下工作"的经验。这种"carefully crafted, bespoke, incorporates hard-won knowledge"的工程——**正是苦味教训警告会过时的那种工作**。ChatGPT agent 代表了根本转变：不训练于**工作过程**，而训练于**最终结果**。OpenAI 的 RL 让 AI 自由发展实现路径，只要产出高质量 Excel。

同一 prompt 测试结果：ChatGPT agent 找到更可信的来源（_The Atlantic_ 文章、Reddit 讨论对比 Deep Blue ELO 估算），生成可工作的 Excel；Manus 找到基础搜索的 Reddit 讨论，Excel 有错误。**这并非 Manus 必然差，而是改进路径的差异**——Manus 需要更多手工艺，ChatGPT agent 只需更多算力与示例。

### 3. 从 Garbage Can 到"Bitter Lesson Enterprise"

文中推论：组织中的 Garbage Can 现象（混乱流程、文档化不足、CEO 拍脑袋决策）对企业 AI 落地是**已知痛点**。传统思路：先梳理混乱流程（耗时长、阻力大），再自动化。**苦味教训暗示了相反路径**：跳过流程梳理，只定义好结果，让 AI 自己找到路径。

极端推论："all those undocumented workflows and informal networks that pervade organizations might not matter. What matters is knowing good output when you see it."——这彻底颠覆了"运营卓越 = 竞争优势"的传统商业逻辑。

### 4. "哪种问题"才是企业现实——未解之问

文末留了一个开放问题：企业究竟更像 chess（屈服于算力）还是更复杂（需要理解才能处理）？**赌注已经下了**——那些押"结果训练"路线的公司（如 OpenAI），与押"流程梳理"路线的传统咨询/自动化厂商，正在做不同的赌注。答案会在接下来几年揭晓。

### 5. 与 RAG / Knowledge Graph 派的对立

这一论点与 [RAG](https://github.com/QianJinGuo/wiki/blob/main/concepts/rag-framework-comparison.md) 派、知识图谱派、流程挖掘派形成有趣对立：
- **RAG/知识图谱派**：让 AI 理解组织知识结构 → 检索增强 → 准确回答
- **苦味教训派**：跳过结构化理解 → 直接训练结果 → 算力会找到路径

这是 AI 应用的两条**根本路径**。未来 5-10 年的实证数据将决定哪条更优。

### 与相邻观点的张力

- 与 [Claude Code 现状](../ch01/438-claude-code-and-what-comes-next.html)对照：Claude Code 是"工艺派"——精心设计的 harness + Opus 4.5 智能 + Skills + Subagents + MCP。属于"精心打造"的 agent 范式——但其作者团队同时投入算力与训练。
- 与 [CrewAI 迭代论](ch04/380-your-first-ai-agent-should-do-one-thing-badly.html)的张力：迭代论强调"先做糟糕的 agent 再迭代"；苦味教训暗示"算力取代工艺"。前者是工程路径，后者是范式断言。
- 与 [管理即超能力](../ch01/519-management-as-ai-superpower.html)互补：Mollick 在商业文章中强调"管理能力"为稀缺资源；本文同一作者暗示 AI 找到路径后，管理定义"好结果"的能力成为新稀缺。

## 实践启示

1. **优先定义结果而非流程**：与其梳理"客服流程是什么"，不如定义"好客户响应是什么样的"——让 AI 找到路径。
2. **慎选"工艺派"长期投入**：手工艺精心设计的 agent / pipeline 会过时——把赌注放在算力 + 通用方法上，长期回报可能更高。
3. **关注"结果训练"信号**：评估厂商/框架时，关注其是否在"训练最终结果"还是"训练工作过程"——前者更可能享受算力提升的红利。
4. **保留"流程梳理"作为短期务实路径**：完全跳过流程梳理在当下仍不现实，混合策略（短期梳理关键流程 + 中期转向结果训练）可能更稳健。
5. **重新思考"运营卓越"作为护城河**：如果苦味教训成立，那些依赖内部流程复杂性的护城河（运营知识、未文档化的 know-how）可能比想象中脆弱。

## 相关实体

- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](ch04/610-agentic.html)
- [Karpathy Vibe Coding Agentic Engineering](ch04/132-karpathy-vibe-coding-agentic-engineering.html)
- [Management As Ai Superpower](../ch01/519-management-as-ai-superpower.html)
- [Claude Code And What Comes Next](../ch01/438-claude-code-and-what-comes-next.html)
- [Your First Ai Agent Should Do One Thing Badly](ch04/380-your-first-ai-agent-should-do-one-thing-badly.html)
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](ch04/230-agentops-operationalize-agentic-ai-at-scale-with-amazon-bed.html)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](../ch03/046-agent.html)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](../ch11/224-openclaw.html)
- [你不知道的 Agent原理架构与工程实践 V2](../ch03/046-agent.html)
- [RAG](https://github.com/QianJinGuo/wiki/blob/main/concepts/rag-framework-comparison.md)
- [Knowledge Graph RAG](https://github.com/QianJinGuo/wiki/blob/main/concepts/knowledge-graph-rag.md)
- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [Harness Engineering Paradigm Shift](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-paradigm-shift.md)

---

