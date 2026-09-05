---
title: harness-engineering-systematic-explainer
source_url: https://mp.weixin.qq.com/s/CN4nXoEaqzNBxeMePSpCMQ
publish_date: 2026-04-30
tags: [wechat, article, claude, openai, agent, harness, rag, coding]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 319b5b095c1b744851e29c865886faaece57de4b0f764cc13b03cee37589096f
---
## 核心主线
李宏毅老师课程核心：有时候语言模型不是不够聪明，只是缺少人类为它设计好的行动环境。
> 一个模型会写代码，不代表它知道文件在哪里；一个测试脚本存在，不代表它会主动运行；规则写在文档里，不代表它会稳定遵守。
Harness 要解决的不是"怎样让模型回答得更漂亮"，而是：当一个概率模型要读文件、调用工具、修改代码、运行测试、观察日志、操作浏览器、跨会话推进任务时，怎样让它持续看见事实、执行动作、接收反馈、保存进度，并在失败后修正下一轮行动？
## Prompt / Context / Harness 三层区分
| 层次 | 关心什么 | 类比 |
|------|---------|------|
| **Prompt Engineering** | 怎么去问 | 一句指令 |
| **Context Engineering** | 给模型看什么 | 模型眼前的材料 |
| **Harness Engineering** | 怎样设计多轮行动系统，让模型把任务真的做完 | 一整套工作环境 |
- Prompt 让模型知道"你要什么"
- Context 让模型看见"该依据什么"
- Harness 进一步规定：它能用什么工具、怎么验证自己、失败后怎么恢复、下一轮怎么接上、哪些动作必须被系统拦住
## Harness 不是 AGENTS.md
AGENTS.md 很重要，但只是 Harness 的一部分——它能告诉 Agent 怎么行动，却不能保证 Agent 一定照做。
真正可靠的 Harness：把"希望它这样做"变成"系统默认会这样约束它"。
- 不只是告诉它"要跑测试"，而是 completion 前检查测试结果
- 不只是告诉它"不要越权"，而是用工具权限、沙箱、人工审批拦住高风险动作
- 不只是告诉它"别忘了进度"，而是把 feature list、progress notes、handoff artifacts 写到磁盘
- 不只是告诉它"别破坏架构"，而是用 lint、结构测试、CI 把边界机械化
自然语言规则是软控制（有概率性）；系统约束、权限边界、状态持久化、测试反馈，才让控制变硬。
## Harness 的本质：七环节控制回路
```
人定义目标、边界、验收标准
       ↓
Guides（行动前的前馈控制：AGENTS.md、架构文档、spec、操作规范）
       ↓
Agent 在环境中执行 Reason → Act → Observe 循环
       ↓
Tools（读文件、写文件、跑命令、查 API、操作浏览器）
       ↓
Sensors（捕捉偏差：tests、lint、typecheck、e2e、logs、metrics、trace、review agent）
       ↓
State（跨会话真相：feature_list.json、progress notes、handoff artifacts、git history）
       ↓
Harness update（把失败写回规则、工具、测试或文档，让同类错误以后更难重复发生）
```
## 为什么"更多上下文"不是答案
OpenAI 经验：把大量规则塞进巨大的 AGENTS.md 会失败——单体规则文件挤占任务上下文空间，真正重要的信息失焦，且文档随项目变化快速腐烂。
Harness 的"渐进披露"信息系统：
- 常驻文件像地图，帮助 Agent 定位
- 细节文档按需读取，避免一上来淹没模型
- 测试、日志、指标要能被 Agent 直接观察
- 计划、进度、决策要变成磁盘上的状态工件
- 旧的、不再真实的文档要被清理和校验
**长任务真正缺的不是无限上下文，而是可恢复、可交接、可验证的外部状态。**
## Generator / Evaluator 模式
Planner / Generator / Evaluator 三角色：
- **Planner**：把目标拆成计划
- **Generator**：生成方案或实现代码
- **Evaluator**：检查结果、给出反馈
Evaluator 不是天然客观的。Anthropic 经验：Claude "开箱即用"不是一个好的 QA agent——它会发现真实问题，但随后又说服自己这些问题"不重要"并批准结果；它也倾向于浅层测试而不主动探测边界。
**Evaluator 本身也需要自己的 Harness：**
- 明确的验收标准（而不是凭感觉）
- 能操作真实环境（打开页面、调用接口、检查数据库）
- 能看日志、跑测试、截屏、记录复现路径
- 把判断写成 evidence，而不是只给一句结论
- 知道哪些失败必须升级给人
- 提示词、评分标准、测试深度要根据真实误判不断修正
核心原则：不要用"另一个模型"替代验证，要用"另一个被约束的验证流程"提高可靠性。
## 核心动作
> 找到当前 Agent 行动链路中的断点，然后把断点工程化地补成下一轮默认存在的能力。
- 如果 Agent 总是忘记跑测试 → 把测试接进完成条件
- 如果 Agent 总是读不到关键背景 → 把知识整理成地图和按需读取的文档
- 如果 Agent 总是在长任务里丢失进度 → 把 feature list、progress notes、handoff artifacts 写到磁盘
- 如果 Agent 总是对自己的结果太宽容 → 让验证流程变得更明确、更可观察、更可复盘
## 参考资料
- 李宏毅 Harness Engineering 教程
- OpenAI: Harness engineering: leveraging Codex in an agent-first world
- Anthropic: Effective harnesses for long-running agents
- Anthropic: Harness design for long-running application development
- Martin Fowler: Harness engineering for coding agent users