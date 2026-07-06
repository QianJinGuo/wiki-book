# Harness Engineering 系统梳理

## Ch05.049 Harness Engineering 系统梳理

> 📊 Level ⭐⭐ | 10.2KB | `entities/harness-engineering-systematic-framework.md`

## 概述
Harness Engineering 系统梳理——基于李宏毅课程 + OpenAI/Anthropic/Martin Fowler 实践。核心命题：**当 AI 从聊天走向行动，工程的重点不再是写更好的提示词，而是设计一个能持续校正它的系统**。 ^[claude-code-engineering-truth-1.6-98.4.md]

## Prompt / Context / Harness 三层区分
| 层次 | 关心什么 | 本质 |
|------|---------|------|
| **Prompt Engineering** | 怎么去问 | 一句指令 |
| **Context Engineering** | 给模型看什么 | 模型眼前的材料 |
| **Harness Engineering** | 设计多轮行动系统，让模型把任务真的做完 | 一整套工作环境（任务地图/状态文件/工具接口/权限边界/测试反馈/日志观测/交接机制/失败复盘） |
**关键转化：** 自然语言规则是软控制（有概率性）；系统约束、权限边界、状态持久化、测试反馈，才让控制变硬。

## 量化证据：1.6% AI 决策 vs 98.4% 工程基础设施
VILA-Lab（Mohamed bin Zayed AI University）系统性分析了 Claude Code v2.1.88 版本 51.2 万行 TypeScript 源码，发现只有 **1.6% 是 AI 决策逻辑**，剩下的 **98.4% 是确定性的工程基础设施**：权限网关、上下文管理、工具路由、错误恢复。
这不是说模型只贡献 1.6% 的能力，而是说明 Claude Code 作为产品，大量复杂度不在模型本身，而在确定性的工程基础设施上。
**LangChain 的验证**：调整了 harness（系统提示、工具、中间件、推理模式），模型未换，Terminal Bench 2.0 分数从 **52.8 提升到 66.5**。

### OpenAI Frontier 团队的极限实验
- 从空 repo 起步，约 5 个月内由 Codex 生成约 **100 万行代码**和约 **1500 个 PR**
- 团队从 3 人扩展到 7 人，人工不直接写代码，接近「0 人工代码、0 人工 review」
- 关键实践：**层级架构强约束**（Types→Config→Repo→Service→Runtime→UI 单向依赖，linter 强制执行）、**linter 错误即修复指令**（写给人看 vs 写给 Agent 读）、**文档作为单一事实来源**（所有架构图/设计规范在仓库内部 docs/）

### Stripe Minions
每周生成并推动超过 **1300 个 PR** 合并，代码 AI 生成 + 人工 review。

## Harness 不是 AGENTS.md
AGENTS.md 能告诉 Agent 怎么行动，却不能保证 Agent 一定照做。
真正可靠的 Harness：把"希望它这样做"变成"系统默认会这样约束它"：

- 不只是告诉它"要跑测试" → completion 前检查测试结果
- 不只是告诉它"不要越权" → 工具权限/沙箱/人工审批拦住高风险动作
- 不只是告诉它"别忘了进度" → feature list / progress notes / handoff artifacts 写到磁盘
- 不只是告诉它"别破坏架构" → lint / 结构测试 / CI 把边界机械化

## 七环节控制回路
```
人定义目标、边界、验收标准
       ↓
Guides（行动前前馈控制：AGENTS.md / 架构文档 / spec / 操作规范）
       ↓
Agent 执行 Reason → Act → Observe 循环
       ↓
Tools（读文件 / 写文件 / 跑命令 / 查 API / 操作浏览器）
       ↓
Sensors（捕捉偏差：tests / lint / typecheck / e2e / logs / metrics / trace / review agent）
       ↓
State（跨会话真相：feature_list.json / progress notes / handoff artifacts / git history）
       ↓
Harness update（把失败写回规则 / 工具 / 测试 / 文档，同类错误以后更难重复）
```

## 渐进披露原则
OpenAI 教训：把大量规则塞进 AGENTS.md 会失败（挤占上下文 / 重要信息失焦 / 文档快速腐烂）。
Harness 的渐进披露信息系统：

- 常驻文件像地图，帮助定位
- 细节文档按需读取
- 测试/日志/指标要能被 Agent 直接观察
- 计划/进度/决策要变成磁盘上的状态工件
- 旧的、不再真实的文档要被清理和校验
**长任务真正缺的不是无限上下文，而是可恢复、可交接、可验证的外部状态。**

## Generator / Evaluator 模式
| 角色 | 职责 |
|------|------|
| **Planner** | 把目标拆成计划 |
| **Generator** | 生成方案或实现代码 |
| **Evaluator** | 检查结果、给出反馈 |
**Evaluator 不是天然客观的。** Anthropic 经验：Claude 开箱即用不是好的 QA agent——它发现真实问题后会说服自己"不重要"并批准结果，倾向于浅层测试而不主动探测边界。
**Evaluator 本身也需要 Harness：**

- 明确的验收标准（不是凭感觉）
- 能操作真实环境（页面 / 接口 / 数据库）
- 看日志 / 跑测试 / 截屏 / 记录复现路径
- 判断写成 evidence，不只给结论
- 知道哪些失败必须升级给人
核心原则：不要用"另一个模型"替代验证，要用"另一个被约束的验证流程"提高可靠性。

## 核心动作
> 找到 Agent 行动链路中的断点，然后把断点工程化地补成下一轮默认存在的能力。

- Agent 总是忘记跑测试 → 把测试接进完成条件
- Agent 总是读不到关键背景 → 整理成地图和按需读取的文档
- Agent 总是在长任务里丢失进度 → feature list / progress notes / handoff artifacts 写到磁盘
- Agent 总对自己的结果太宽容 → 验证流程更明确、更可观察、更可复盘

## 相关
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [Agent 工程实践](ch03/045-agent.md)
- [OpenClaw 架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/openclaw-architecture.md)

## 深度分析
1. **AI 决策仅占 1.6%**——VILA-Lab 分析 Claude Code 51.2 万行源码发现，98.4% 是确定性工程基础设施（权限网关、上下文管理、工具路由、错误恢复）。这说明工程复杂度不在模型本身，而在模型所依赖的系统环境。
2. **自然语言规则是软控制，系统约束才让控制变硬**——规则写在文档里有概率性，但工具权限、沙箱、completion 前检查、状态持久化，使控制从"希望它这样做"变成"系统默认会这样约束它"。
3. **渐进披露优于无限上下文**——OpenAI 教训：大量规则塞进 AGENTS.md 会导致上下文空间被挤占、重要信息失焦、文档快速腐烂。长任务真正缺的不是无限上下文，而是可恢复、可交接、可验证的外部状态。
4. **Evaluator 本身也需要 Harness**——Anthropic 经验：Claude 开箱即用不是好的 QA agent，发现真实问题后会说服自己"不重要"并批准结果，倾向于浅层测试而不主动探测边界。不要用"另一个模型"替代验证，要用"另一个被约束的验证流程"提高可靠性。
5. **七环节控制回路是核心架构**——人定义目标 → Guides 前馈控制 → Agent Reason/Act/Observe → Tools → Sensors 捕捉偏差 → State 跨会话持久化 → Harness update 把失败写回规则，使同类错误以后更难重复。

## 实践启示
1. **测试接进完成条件**：不要只靠语言提醒 Agent"要跑测试"，而是在 completion 前强制检查测试结果，把测试通过设为任务完成的必要条件。
2. **知识整理成地图 + 按需读取的文档**：常驻文件像地图帮助定位，细节文档按需读取，避免一上来用大量信息淹没模型。
3. **feature list / progress notes / handoff artifacts 写到磁盘**：确保长任务可恢复、可交接，Agent 跨会话能接上进度，而不是每次从零开始。
4. **Evaluator 需要明确验收标准 + 操作真实环境**：验证流程要明确知道什么叫"通过"，能操作真实环境（页面/接口/数据库），能看日志/跑测试/截屏，把判断写成 evidence 而不只是结论。
5. **持续修正 Evaluator 本身**：提示词、评分标准、测试深度要根据真实误判不断修正——Evaluator 不是一次性建好就完事的，它本身也是需要被 Harness 的组件。

## 相关实体
- [Harness Engineering - 让 Coding Agent 可靠完成长程任务](ch05/085-harness.md)
- [Harness Engineering：AI 从"聪明"到"可靠"的第三代工程范式](ch05/091-harness-engineering.md)
- [Harness Engineering 四根支柱与四要素架构](ch01/216-0.md)
- [Harness Engineering 指南（字节跳动TRAE）](ch05/085-harness.md)

---

