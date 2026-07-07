# 一篇看懂 Agent Harness 的结构！ — 12组件+7决策完整框架

## Ch04.069 一篇看懂 Agent Harness 的结构！ — 12组件+7决策完整框架

> 📊 Level ⭐⭐ | 20.1KB | `entities/agent-harness-12-components-7-decisions.md`

# 一篇看懂 Agent Harness 的结构！ — 12组件+7决策完整框架

> 本文是对 https://mp.weixin.qq.com/s/BEuV7aCCZgWcX7MRLVC86w 的存档
> 作者：石榴爸爸 AI 实战，2026-04-20
Agent = Model + Harness。模型负责智能，Harness 负责把智能变成能持续工作的系统。
LangChain 证明：只改 Harness（不改模型权重），TerminalBench 2.0 从榜外跳到第 5 名。

## 相关实体
- [长周期 Agent 详解 从 Ralph Loop 到可接管 Harness](../ch05/009-harness.html)
- [Harness Engineering Framework](../ch05/062-harness-engineering.html)
- [Langchain Anatomy Agent Harness](../ch05/038-agent-harness.html)
- [Huggingface Ai Agent Glossary Model Scaffolding Harness Tool Skill Subagent](ch04/147-ai-agent.html)
- [Code As Agent Harness Survey](../ch09/051-code-as-agent-harness.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-harness-12-components-7-decisions.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/agent-engineering-guide.md)
## 核心主张

Agent = Model + Harness。模型负责智能，Harness 负责把智能变成能持续工作的系统。 LangChain 证明：只改 Harness（不改模型权重），TerminalBench 2.0 从榜外跳到第 5 名。

## 三层工程

1. Prompt engineering / 2. Context engineering / 3. Harness engineering

## 生产级 Harness 12 组件

### 1. 编排循环

TAO/ReAct：组 prompt → 调模型 → 解析输出 → 执行工具 → 结果喂回 → 继续。Anthropic 称"dumb loop"。

### 2. 工具

工具注册 / Schema校验 / 参数提取 / 沙箱执行 / 结果捕获 / 格式化 observation

### 3. 记忆

短期记忆 + 长期记忆。Claude Code 三级：轻量索引(~150char) → 详细主题文件 → 原始记录

### 4. 上下文管理

Context rot 是隐性最大失败原因。策略：Compaction / Observation masking / Just-in-time retrieval / Sub-agent delegation

### 5. Prompt Construction

system prompt + 工具定义 + 记忆 + 会话历史 + 当前消息

### 6. 输出解析

优先原生 tool calling。判断：有 tool call → 执行循环；无 → 最终回答

### 7. 状态管理

LangGraph: typed dictionary；Claude Code: git commit=checkpoint, progress file=scratchpad

### 8. 错误处理

四类：瞬时/模型可恢复/需用户处理/非预期。Stripe 重试 ≤2 次

### 9. 安全护栏

OpenAI 三层(输入/输出/工具)；Anthropic 权限与推理分离

### 10. 验证回路

规则型(测试/lint) / 视觉(截图) / LLM as judge。质量提升 2-3 倍

### 11. 子 Agent 编排

Fork(完整复制) / Teammate(文件通信) / Worktree(独立分支)

### 12. 循环流程

Prompt Assembly → LLM Inference → Output Classification → Tool Execution → Result Packaging → Context Update → Loop

## 7 个关键决策

1. 单 agent vs 多 agent（先单再考多）
2. ReAct vs Plan-and-Execute（后者快 3.6x）
3. 上下文管理策略（ACON：降 26-54% token 保 95%+ 准确率）
4. 验证回路设计（guides vs sensors）
5. 权限宽严（速度 vs 风险）
6. 工具暴露（Vercel 砍 80% 反而更好；Claude Code lazy loading 削 95%）
7. Harness 厚度（Anthropic 薄 vs 显式控制厚）

## 框架对比

- Anthropic：Gather-Act-Verify 
- OpenAI Agents SDK + Codex：三层结构 
- LangGraph：显式状态图 
- CrewAI：Agent/Task/Crew 分层 
- AutoGen：conversation-driven orchestration 

## 脚手架隐喻

脚手架不盖楼，但工人够不到更高楼层。模型变强 → harness 部分复杂度可删（共进化）。Manus 6个月重写5次删复杂度。

## 深度分析

**1. Model 与 Harness 的职责分离是框架核心设计哲学**

文章开篇即点明"Agent = Model + Harness"，这不是简单的加法，而是职责分离。模型专司智能推理，Harness 负责把智能封装成可持续工作的系统。LangChain 案例极说明问题：不改模型权重，只改 Harness，TerminalBench 2.0 从榜外跳到第 5 名。这揭示了当前 Agent 系统的主要矛盾不在模型本身，而在 Harness 工程。

**2. 12 组件非独立模块，而是有机协作的子系统**

初看 12 组件列表容易误以为是 12 个独立模块，但仔细分析可见强耦合性：编排循环驱动工具执行，工具输出写入记忆，记忆内容喂入上下文管理上下文字化后再输入 Prompt Construction，Prompt 输出经 Output Parsing 判断后可能触发 Error Handling 重新进入循环。任何单个组件的失效都会产生连锁反应。

**3. 上下文管理是隐形最大败因，ACON 策略验证了主动管理的必要性**

文章将 Context rot 列为"隐性最大失败原因"，而非显性的工具调用失败或模型幻觉。ACON 策略（降 26-54% token 消耗仍保持 95%+ 准确率）的数据极具说服力。上下文不是越多越好，当前模型上下文窗口虽大，但噪声累积导致质量下降的速度比窗口扩张更快。这对所有生产级 Agent 系统都是警示。

**4. Plan-and-Execute vs ReAct 的抉择本质是「效率」与「鲁棒性」的权衡**

Plan-and-Execute 比 ReAct 快 3.6x，但代价是重规划时的鲁棒性要求更高。ReAct 的优势在于推理过程透明（每步都有 trace），便于调试，但重复计算多。这不是非此即彼的选择，而是取决于场景：简单确定性格式化任务选 Plan-and-Execute，多步复杂推理选 ReAct。

**5. Anthropic 的「薄 Harness」与 LangGraph/CrewAI 的「厚 Harness」代表两种工程哲学**

Anthropic 偏向让模型做更多决策（薄 Harness），显式控制框架（LangGraph、CrewAI）则将状态转移和流程编排全部纳入显式图管理。前者依赖模型能力（模型越强 Harness 可越薄），后者依赖工程化精细控制（模型能力不足时提供补偿）。选择哪种取决于团队对模型可靠性的信心度。

## 实践启示

**1. 先从单 Agent 开始，多 Agent 架构只在明确收益时才引入**

文章强调"先单再考多"，这是正确的工程优先级。多 Agent 引入了通信、协作和冲突处理的新复杂度，在单 Agent 能力边界未摸清之前不应提前设计。实践做法：先用单 Agent 跑通核心流程，通过日志分析定位能力边界，再评估是否需要多 Agent 分解。

**2. 上下文管理需要主动设计，而非事后补救**

不要等到 context overflow 或质量下降才开始处理上下文。从系统设计之初就应规划 Compaction、Observation masking 和 Just-in-time retrieval 策略。参考 ACON 的思路：对历史上下文做主动压缩和裁剪，可显著降低 token 成本而不牺牲输出质量。

**3. 工具暴露遵循"最小够用"原则，砍掉 80-95% 是常态**

Vercel 砍 80% 工具反而更好，Claude Code lazy loading 削 95% 工具调用。这说明大多数 Agent 系统的工具集是过度设计的。实践做法：先用最少量工具验证核心流程，再基于实际调用数据（而非预判）逐步添加被高频使用的工具。

**4. 验证回路是生产级系统的必备组件，而非可选项**

规则型验证(lint/测试)、视觉验证(截图对比)和 LLM as judge 三种方式组合使用可将质量提升 2-3 倍。在 Agent 系统中，由于执行路径不确定，没有验证回路就等于在开没有安全阀的机器。实践做法：从第一个 Agent 上线起就集成验证回路，哪怕是简单的规则检查也比没有强。

**5. Harness 复杂度应随模型能力共进化，定期做减法**

Manus 6 个月重写 5 次删复杂度，这个案例说明 Harness 不是一次性设计，而是持续迭代的。模型每升级一代，原来需要的部分 Harness 复杂性可能就不再需要了。建议每季度对 Harness 做一次"复杂度审计"，识别哪些是为了补偿模型能力不足而添加的过渡性逻辑。

---

## 第 2 来源 — Elvis Saravia (DAIR.AI)：自主编码智能体的 7 个设计要素 (2026-06-14)

> 来源：微信公众号「AI技术立文」翻译 Elvis Saravia (@omarsar0) 2026-06-14 推文
> 原始来源：DAIR.AI Academy 讲座 `[1]` + Claude Code 官方文档 (`/goal` `[2]` + `/loop` `[3]`)
> 本文由 Codex + Claude Code 协作完成
> URL: https://mp.weixin.qq.com/s/b2pvXBGA6BkY6gJbLerZ1g
> v=7, c=7, v×c=49（boundary ingest，与 1st source 主题 overlap 70%）

### 核心叙事差异：1st source 是「12 组件 + 7 决策」工程图谱，2nd source 是「控制系统 7 要素」心智模型

1st source（石榴爸爸）从 LangChain TerminalBench 2.0 实战出发，把 Harness 拆解为 12 个工程组件 + 7 个生产决策；2nd source（Elvis）从 Claude Code `/goal` + `/loop` 实操出发，提炼**控制系统 7 要素**（目标/评估器/验证器/循环/规划/产物/会话挖掘）作为心智模型。两套框架**不是替代而是映射**——Elvis 的 7 要素可直接对应石榴爸爸的 12 组件核心集。

### 互补角度 7 条

1. **「目标即契约」取代「提示词」**：Elvis 把目标定义为"期望终态 + 证据 + 不可违反约束 + 轮次/预算"四元组，类比合同条款；1st source 决策层只有"目标"概念，没有"证据-约束-预算"的契约化结构。Elvis 的契约化目标更容易被模型反复自我衡量。

2. **评估器 vs 验证器二分**（Elvis 关键创新）：1st source 的"组件 5 评估"和"组件 10 验证回路"在原文未严格区分；Elvis 明确二分——**评估器**判断「输出是否合理」（研究报告连贯性、UI 设计意图、论文忠实度，需语言/判断/视觉能力）；**验证器**判断「输出是否满足客观条件」（类型检查、单元测试、基准测试、留出验证）。这一二分让"分层验证"有了清晰的层次结构。

3. **确定性检查 + 智能体评估的组合模式**：Elvis 提出**确定性检查作为底线 + 智能体评估作为更高层级审查**的实战组合——减少幻觉化成功判定，同时允许智能体在测试无法清晰断言的任务上保持自主性。1st source 仅在组件层分开列出，未给出这种**层级化组合**配方。

4. **Ralph 循环的两层抽象**：1st source 组件 1「编排循环」= 简单的智能体-工具循环（Anthropic "dumb loop"）；Elvis 把循环明确分为 **Ralph 循环**（智能体 + 确定性条件，最简形式）vs **评估器循环**（包含能推理进度的评估器智能体，更灵活）。这一抽象让循环设计有了**复杂度梯度**，可按任务选择。

5. **OOD 验证问题作为研究前沿**：Elvis 明确指出**前沿模型在训练分布外的验证任务上显著挣扎**——这是"验证器"作为研究领域的真实挑战。1st source 完全未涉及此风险，给读者"组件 10 验证回路就是保险"的错觉。Elvis 的"微调验证器是企业高需求"预测为该领域投资方向提供了锚点。

6. **模型选择 = 架构决策**：Elvis 提出规划/执行/评估/视觉审查 4 角色**能力要求矩阵**（强推理 vs 高代码准确率 vs 批判性思维 vs 多模态），把模型选择从"挑一个最强模型"重构为"按角色选能力匹配模型"。1st source 仅在决策层讨论"模型选择"，未展开角色 × 能力矩阵。

7. **会话挖掘 → 项目指令反馈环**：Elvis 提出**扫描过去 30 天会话 → 找到反复出现失败模式 → 提升为项目指令/知识库条目/智能体规则**的反馈循环。1st source 仅在组件 3 记忆层讨论「Claude Code 三级记忆」作为存储机制，未涉及「会话挖掘 → 规则更新」这种**主动学习**闭环。Elvis 的会话挖掘 = 让本地环境变聪明而无需从头训练模型。

### 7 要素 ↔ 12 组件映射表

| Elvis 7 要素 | 石榴爸爸 12 组件对应 | 重叠/补全关系 |
|------------|--------------------|--------------|
| ① 目标（契约）| 决策 1 (目标) | Elvis 补全"证据-约束-预算"契约结构 |
| ② 评估器 | 组件 5 (评估) | Elvis 明确评估 vs 验证二分 |
| ③ 验证器 | 组件 10 (验证回路) | Elvis 补全分层验证（确定性 + 智能体）|
| ④ 循环 | 组件 1 (编排循环) + 组件 12 (循环流程) | Elvis 补全 Ralph vs 评估器循环的两层抽象 |
| ⑤ 规划 | 组件 5 (Prompt Construction) | Elvis 补全"规划-执行"模型角色分工 |
| ⑥ 可视化产物 | 组件 9 (安全护栏) | Elvis 补全存储（Markdown）与展示（HTML）分离 |
| ⑦ 会话挖掘 | 组件 3 (记忆) | Elvis 补全「挖掘 → 规则」主动学习闭环 |

### 与 1st source 呼应的具体修正

- 1st source「决策 5 薄 vs 厚 Harness」讨论 Anthropic 偏薄、LangGraph 偏厚。Elvis 的「目标 + 循环 + 评估器 + 验证器」实际是**第三种选择**——把 Harness 拆为「目标 + 循环」（控制层）+ 「评估器 + 验证器」（验证层）双层，每层可薄可厚。补充了 1st source 未覆盖的控制层 vs 验证层二维度。
- 1st source「实践启示 1 先从单 Agent 开始」隐含"单 Agent 能力边界"假设；Elvis 的"小子集验证"给出**更具体的边界探测方法**——用小的、廉价的子集先跑，再启动完整自主运行。
- 1st source「实践启示 4 验证回路是生产级系统的必备组件」强调"规则型 + 视觉 + LLM as judge 三种方式组合可提升质量 2-3 倍"；Elvis 的「确定性 + 智能体评估」分层给出**类似的组合但更明确**——确定性作为底线，智能体评估作为更高层级。

### 实践启示（Elvis 视角补全）

1. **目标契约化**：写 /goal 任务时不要只写"实现 X 功能"，要补全"四元组"——期望终态 + 证据要求（截图/测试报告/基准分数）+ 不可违反约束（不引入新依赖/不破坏现有 API）+ 轮次/预算上限
2. **验证器分层**（与 1st source 决策 1 互证）：单层验证（无论确定性还是 LLM）都有失败模式——确定性检查漏掉语义判断、LLM 评估被模型"用言辞绕过"。两层组合是唯一可靠的工程实践
3. **循环选型按任务**：UI/产品/数据转换等确定性强的任务用 Ralph 循环（智能体 + 条件）成本最低；研究/分析/创作等需要推理的任务用评估器循环（智能体 + 评估器智能体）才够灵活
4. **会话挖掘 30 天滚动**：每周花 30 分钟扫一遍过去一周失败会话 → 提取反复出现的失败模式 → 写入 `AGENTS.md` / 项目 CLAUDE.md / 知识库。这是 1st source 完全未涉及的主动学习机制
5. **模型选择 = 架构决策**（取代「选最强模型」惯性）：规划用 Claude Opus / 执行用 Claude Sonnet / 评估用 Claude Sonnet + visual / 视觉审查用 GPT-4V / Claude 3.5 Sonnet。组合的灵活性远大于单模型堆参数

### 借鉴边界 / 警惕

- **Elvis 7 要素的「可视化产物」≠ 1st source 的「安全护栏」**：Elvis 强调产物作为控制界面（实时仪表盘），不是事后报告；1st source 组件 9 安全护栏主要是输入过滤、权限控制、白名单机制。两者的"安全"维度是不同概念，**不能混用**。
- **Elvis 7 要素偏 Claude Code 视角**：所有案例（/goal、/loop、sub-agent、视觉审查、构建产物）都基于 Claude Code 命令；不直接适用于其他 harness 框架（LangGraph、CrewAI、AutoGen）。1st source 是 12 组件通用框架，跨 harness 框架适用性更高。
- **Elvis 的"小子集" + "会话挖掘" = 增量式工作流**：1st source 的"先单再考多"是结构式（先建单 Agent 再考虑多 Agent）；Elvis 的"小子集 + 30 天会话挖掘"是数据驱动式（让会话数据告诉你边界在哪）。两者**互补**而非矛盾。

### 上线状态 / 引用链接

- 原文链接：https://mp.weixin.qq.com/s/b2pvXBGA6BkY6gJbLerZ1g
- Elvis Twitter: https://x.com/omarsar0
- DAIR.AI Academy 讲座原文: https://academy.dair.ai/events/cmplo7v3b000e04l1pxprat4d
- Claude Code /goal 文档: https://code.claude.com/docs/en/goal
- Claude Code release notes (/loop): https://docs.anthropic.com/en/release-notes/claude-code

→ [第 2 原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/elvis-saravia-autonomous-coding-7-elements-control-system.md)

---

