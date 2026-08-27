# 从 Spec 驱动转向环境与验证驱动：AI Coding 提效的投资账

## Ch05.148 从 Spec 驱动转向环境与验证驱动：AI Coding 提效的投资账

> 📊 Level ⭐⭐⭐ | 7.3KB | `entities/from-spec-driven-to-environment-verification-driven-ai-coding-wu-zuoyan-2026.md`

# 从 Spec 驱动转向环境与验证驱动：AI Coding 提效的投资账

吴佐衍（2026-07-31）对 AI Coding 研发提效的框架性思考：Coding 已被 SOTA 模型解决（SWE-bench Pro / Terminal-Bench 2.1 达 80% 上下），真正的瓶颈在 Coding 之外——验证与环境。核心主张：不做「如何让 AI 生码更强」的军备竞赛，只做企业内部环境的工具化。

## 核心论点：瓶颈转移

- **Coding 被解决**：头部模型 Coding benchmark 分数差距已小于口径差距（Anthropic Claude Mythos 5 SWE-bench Pro 80.3% / Terminal-Bench 2.1 88.0%，OpenAI GPT-5.6 Sol 64.6%/88.8%，Moonshot KIMI 3 独立测试 Terminal-Bench 2.1 88.3%）。Claude Code 作者 Boris 称「Coding 已经被解决」
- **效率未同步上涨**：生码在研发链路只占 20-30%。阿姆达尔定律：把占三成的环节压缩到接近零，链路提升上限只有三成——瓶颈不在 Coding，而在 Coding 之外（跨平台影响面分析、联调环境、发布编排、灰度验证、封网期合规检查）
- **AI 能力边界由「可验证的反馈」确定**：Coding 和数学最先被突破，因为「对错机器自己就能判」（编译/测试跑一下就知道）；企业生产环境答案藏在内部系统，没有公开反馈，验证成本高 → 主动把内部研发工作流改造成「有反馈、可验证」的环境

## Spec 驱动路线的结构性天花板

主流做法（PRD → 需求澄清 → 技术方案 → 任务拆解 → 生码 → 测试，每节点 AI 局部提效）——SDD、Agent Skills、Superpowers 插件本质同一条路线。

- 优化的是「人使用 AI 的方式」，不是「AI 使用环境的方式」——AI 被困在给人协作分工的管道里
- 本质是在 AI 时代重新引入瀑布模型：假设需求澄清后就是对的、方案评审后就是可行的
- 真实开发中一次测试失败可能来自实现/环境/数据/架构假设/需求理解任何一层；失败回退到方案重新生码会推倒已做对的判断
- 技术方案本身并不等价于代码（Jack Reeves《Code as Design》：源代码才是软件真正的设计）

**Agentic 路线**：Agentic 的本质不是「AI 主导决策」，而是「AI 能否自主获取验证信号」。workflow 不消失，退到该待的位置：调度、权限控制、状态保存、审计和高风险检查。

## 投资判据：贬值区 vs 增值区

中心问题：「下一代 SOTA 模型发布时，我正在做的这件事，是获益，还是作废？」

| 区域 | 内容 | 命运 |
|---|---|---|
| 贬值区 | 微调模型提升生码质量、囤积提示词技巧、精细编排生码流程 | 昨天的脚手架变成今天模型的内置能力——和模型厂商军备竞赛对赌 |
| 增值区 | 把企业内部构建/部署/测试/数据/接口/日志/监控/发布链路做成 AI 可调用工具 | 没有任何厂商能替我们做；模型越强这些资产越值钱 |

分界线不在「编排 vs 环境」两个词，在于和模型能力的关系：替代/补偿模型推理能力的东西（拆解步骤、设计提示词、编排流程）会被模型下一次升级吸收；给模型提供它自己造不出来的信息的东西（内部系统真实状态、构建结果、日志、测试反馈）持续增值——关于世界的信息只能从世界里来，不可能从权重里长出来。

**乘法关系**：企业从 AI 拿到的红利 ≈ 模型能力 × 环境能力（不是和）。模型是租来的因子（跟厂商节奏上涨），环境是自有因子（只涨不跌）。任何一端为零结果为零；模型每变强一代把同一套环境价值重新放大一遍。workflow 化收益是线性的（加常数），环境投入收益是复利的（乘法占因子）。

## 环境与工具 = Agent 核心基础设施（五构件）

1. **业务领域知识构建**：业务域 SKILL、本体知识库
2. **可复现可调用的研发环境**：Agent 独立构建项目/启动服务/准备数据/调用接口/操作浏览器或 APP/查看日志调用链/读取监控指标——把「只有人会操作的内部系统」翻译成「AI 可调用的工具」
3. **分层验证体系**：秒级反馈（编译/类型检查/单元测试）高频自主迭代；分钟级反馈（集成/契约/浏览器自动化）覆盖真实行为；人工判断只保留业务价值/用户体验/伦理边界
4. **端到端研发系统打通**：发布平台/实验平台/监控平台改造为 AI Friendly
5. **spec 新写法——区分「约束」与「假设」**：数据不能出域/接口向后兼容/延迟阈值 = 约束（长期保存+自动检查）；微服务还是单体/缓存策略 = 待验证假设（允许 AI 根据运行反馈调整）。spec 划定「什么算对」的边界，不规定实现路径

## 互补角度

- 与 [OpenSpec Spec 驱动](ch05/057-openspec.html) 的关系：本文批判 spec 驱动路线的瀑布模型倾向，但保留 spec 的新写法（约束/假设二分）——不是反对 spec，而是反对「spec 规定实现路径」
- 与 [Agent 生产力悖论](../ch03/006-agent.html) 互补：那篇讲协作/组织瓶颈，本文给「为什么瓶颈在 Coding 之外」的工程量化（阿姆达尔 + 20-30% 生码占比）
- 与 [Harness Engineering](ch05/096-harness-engineering.html) 互补：本文提供 harness 的「投资账」论证——环境与验证投入是复利因子
- 与 [Vibe Coding](../ch04/812-vibe-coding-ai.html) 的演进关系：从 vibe coding 的生成狂欢到验证驱动的冷静期

## 相关实体

- [OpenSpec Spec 驱动开发](ch05/057-openspec.html)
- [Agent 生产力悖论](../ch03/006-agent.html)
- [Harness Engineering 2026](ch05/096-harness-engineering.html)
- [Vibe Coding](../ch04/812-vibe-coding-ai.html)
- [Agentic Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/agentic-engineering-paradigm.md)
- [Agent Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-harness-engineering-paradigm.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/from-spec-driven-to-environment-verification-driven-ai-coding-wu-zuoyan-2026.md)

---

