# 你写的 Skill，及格了吗？

## Ch04.267 你写的 Skill，及格了吗？

> 📊 Level ⭐⭐ | 9.7KB | `entities/你写的-skill及格了吗.md`

> -> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/你写的-skill及格了吗.md)
从微信文章 [你写的 Skill，及格了吗？](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/你写的-skill及格了吗.md) 提取。

## 核心内容
source_url: https://mp.weixin.qq.com/s/kPW5lgHmhn4vUihRcNo7uQ

### 主要章节
- ##
Skill 是 Agent 能力的最小封装单元，它把领域知识、工作流程和工具集成打包成一个即插即用的模块，让通用 Agent 秒变领域专家。

- ##
这里从 dodo 的可用 Skill 列表中随便选取了两个功能相近的 Skill 进行评估对比：

- ##
回到开头的两个问题：自己写的 Skill 够不够好？网上下载的选哪个？

- ##  本案例中的 Skill 地址
- ##  https://github.com/sunxingboo/skill-evaluator

## 深度分析
**Skill 评估框架的核心问题：能跑和好用之间隔着"可量化标准"。** 文章指出了 Skill 开发中的核心困境：description 写得太宽泛导致 Agent 不触发，工作流缺少分支导致复杂输入就翻车，需要脚本却硬塞 Markdown 导致重复执行同一段代码。这些问题写的时候不一定能看出来，只有真正使用时才会暴露（也可能不会暴露）。这意味着 Skill 的质量无法靠"看起来合理"来判断，必须有一套可量化的评估体系。
**D1 元数据质量是唯一决定"生死"的维度。** 8个评估维度中，D1 元数据质量（description 是否精准描述功能、是否包含触发关键词、是否注明不该触发的场景）决定了一个 Skill 装好后 Agent 在每次对话中是否会被加载。如果 description 写得不好，Skill 根本不会被触发，后面 SKILL.md 写得再好也没有意义。其他7个维度影响的是"好不好用"，D1 决定的是"有没有机会被用到"。这是 Skill 设计中投入回报比最高的改进点。
**8个维度分布在 Skill 生命周期的三个阶段。** 第一阶段（能不能被找到）：D1 元数据质量。第二阶段（用起来顺不顺）：D2 执行引导清晰度、D3 领域知识密度、D4 工作流完整性、D5 错误处理与恢复能力。第三阶段（能不能被信任和演进）：D6 脚本与自动化质量、D7 版本治理与可维护性、D8 社区反馈与实际效果。这是一个"发现 → 执行 → 演进"的完整生命周期，每个阶段都有明确的评估重点。
**多模型交叉验证是评估可靠性的保障。** 文章设计了多模型交叉验证流程：同一个 Skill 由不同的 LLM 在相同输入下执行，比较输出质量的差异。这是因为不同模型对同一 Skill 设计的理解可能有显著差异——一个在 GPT-5 上触发良好的 Skill 在 Claude 上可能表现完全不同。这种交叉验证揭示了一个重要事实：Skill 设计不能只验证于单一模型环境，否则你的"质量评估"只是特定模型的局部最优。
**Skill 评估框架的两个使用场景：改进自己的 Skill vs 横向对比选择 Skill。** 审视自己的作品，它是"改进路线图"——哪个维度最低就优先改进哪个；对比他人的作品，它是"选型决策工具"——在多个竞争 Skill 中用同一把尺子量出质量差距。这两个场景代表了 Skill 评估框架的两种用户：开发者和使用者。对于开发者，评估框架是质量改进的导航仪；对于使用者，评估框架是选择决策的依据。

## 实践启示
1. **写完 Skill 后，第一件事是审查 description，而不是 SKILL.md 正文。** description 决定 Agent 是否会在需要时加载这个 Skill。先问自己：用户可能用哪些关键词触发这个 Skill？哪些场景下不应该触发（负面触发条件）？description 是否有足够的关键词覆盖？描述是否说明了"在什么时候/之前/之后"使用？这个优先级应该高于 SKILL.md 的正文内容质量。
2. **用8维度框架对你的 Skill 做一次诊断性评估。** 按三个阶段逐项打分：D1 元数据质量（生死维度）、D2-D5 执行质量、D6-D8 治理与演进。特别关注 D1 和 D2：描述是否精准决定触发率，执行引导是否清晰决定完成率。这两项是大多数 Skill 最常见的短板。
3. **在多个模型上验证 Skill，避免单模型质量幻觉。** 在开发环境验证 Skill 时，用至少两个不同家族的模型（GPT 系列 + Claude 系列，或 Claude 系列 + Gemini 系列）分别测试。如果一个 Skill 在模型 A 上表现良好，在模型 B 上完全无法触发或行为异常，说明 Skill 描述或工作流设计依赖于特定模型的某些行为特性，需要修正。
4. **把"负面触发条件"写进 description，这是区分优秀 Skill 和普通 Skill 的关键。** 大多数 Skill 只写"在 X 场景使用"，不写"在 Y 场景不要使用"。但 Agent 在触发 Skill 时的误判成本很高——如果 Skill 被错误触发，Agent 可能在一个完全不对的场景下执行了错误的工作流。在 description 中明确列出"不适用场景"是成本最低、效果最好的 Skill 质量改进。

## 相关实体
> ai agent platforms topic map（已删除）

- [精选 10 个开发者常用的 AI 智能体技能（Agent Skills）](ch04/391-agent-skills.html)
- [GPT-Image-2 完全指南！附大量玩法案例，顺便开源我的生图 Skill ～](../ch01/1220-gpt-image-2.html)
- [Anthropic 官方 Agent Harness 平台：Claude Managed Agents 完整指南](ch04/668-claude-managed-agents.html)
- [Agent 开发范式演进：从环境工程出发，“简化”多源实时上下文](../ch03/046-agent.html)
- [Anthropic 联创：2028 年实现 AI 自我构建的概率超过 60%](../ch01/891-anthropic.html)
- [Agent架构关键变化：Harness正在成为新后端](../ch05/099-harness.html)
- [我把 Karpathy 的 AutoResearch 搬到了软件开发领域，效果炸了](https://github.com/QianJinGuo/wiki/blob/main/entities/我把-karpathy-的-autoresearch-搬到了软件开发领域效果炸了.md)
- [吴恩达：AI 将最先杀死前端](../ch05/086-ai.html)
- [国产顶尖模型 benchmark 评分那么高，可实际效果为什么差？看完 Anthropic 这篇博客，刷分的因素太单一了](../ch01/891-anthropic.html)
- [2 小时，0 行手写代码，我用 Claude 做了一个生产级 VSCode 插件](../ch01/460-claude.html)
- [IMClaw：通过微信/飞书操控ClaudeCode/Codex/GeminiCLI/Pi Agent蜂群](../ch03/076-claude-code.html)
- [两万字详解Claude Code源码核心机制](../ch03/076-claude-code.html)
- [天猫新品营销技术团队AI编码实战指南（上）](../ch05/086-ai.html)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](../ch05/039-agent-harness.html)
- [从Vibe Coding到Agentic Engineering：重构后台开发全流程](ch04/235-agentic.html)
- [告别“氛围编程”：基于 Harness 治理和 SDD 的团队级 AI 研发范式演进与实践](../ch05/099-harness.html)
- [别再把上下文当聊天记录](https://github.com/QianJinGuo/wiki/blob/main/entities/别再把上下文当聊天记录.md)
- [Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践](../ch05/099-harness.html)
- [深度拆解 Hermes Agent 记忆系统：它修正了 OpenClaw 的哪层误区？](../ch03/092-hermes-agent.html)
- [Cursor 复盘 Harness：模型决定能力上限，Harness 决定生产下限](../ch05/099-harness.html)
- [你不知道的 Agent：原理、架构与工程实践](../ch03/046-agent.html)
- [看 AgentRun 如何玩转记忆存储，最佳实践来了！](ch04/413-agentrun.html)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](ch04/235-agentic.html)
- [一文带你弄懂 AI 圈爆火的新概念：Harness Engineering](../ch05/112-harness-engineering.html)
- [龙虾装上了，可以用来干啥？分享下我的 OpenClaw 多智能体团队搭建经验！](../ch11/225-openclaw.html)
- [Harness Engineering：耗时一周，我是如何将应用的AI Coding率提升至90%的](../ch05/112-harness-engineering.html)
- [fastapi上线实战：认证、限流、零停机，一套代码搞定](../ch11/200-fastapi.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/ai-skill-design.md)

---

