# 十年老技术开发的 AI Agent 探索之路

## Ch04.273 十年老技术开发的 AI Agent 探索之路

> 📊 Level ⭐⭐ | 9.1KB | `entities/十年老技术开发的-ai-agent-探索之路-v2.md`

## 相关实体
- [AI MAP: Security Testing for AI Agent Infrastructure — Bishop Fox](ch04/150-ai.md)
- [AI tool poisoning exposes a major flaw in enterprise agent security](ch04/150-ai.md)
- [Qoder Skills 完全指南：从零开始，让 AI 按你的标准执行](ch04/245-skill.md)
- [柚漫剧 AI 全流程提效拆解](ch04/150-ai.md)
- [Agent Skill 设计模式](ch04/245-skill.md)
- [AI 行业就业八大变化（腾讯研究院纵向对比）](ch04/150-ai.md)
- [CDP Bridge MCP：真实浏览器直连 MCP 工具](ch03/044-agent.md)

- [要实现一个工作流选择-agent-skills-还是-ai-表格](ch04/245-skill.md)
- [ai agent memory systems](ch04/150-ai.md)
- [精选 10 个开发者常用的 AI 智能体技能（Agent Skills）](ch04/245-skill.md)
- [Garry Tan](ch01/510-garry-tan.md)
- [Agent Workflows](ch04/310-agent-workflows.md)
- [Hermes Agent 新手上手指南](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent-onboarding.md)
- [重新定义Skill开发：保姆级教程&一站式开发助手发布](ch04/245-skill.md)
- [十年老技术开发的 AI Agent 探索之路](ch04/150-ai.md)- [十年老技术开发的 AI Agent 探索之路](ch04/150-ai.md)- 十年老技术开发的 AI Agent 探索之路- [十年老技术开发的 AI Agent 探索之路](ch04/150-ai.md)- [四种 Sub Agent 模式](ch03/044-agent.md) 

## 深度分析
### 范式转移：人是瓶颈，但解决方式不是替代人
作者的核心洞察不是"AI 能做什么"，而是重新定义了问题本身——人的瓶颈不是能力不够，而是注意力有限。4-6 个终端并发是硬上限，原因不在于不努力，而在于人脑的并发模型本身就是这样。解决方案不是让 AI 替代人，而是让系统不再依赖人的实时在场。
这条思路从一开始就跳出了"AI 替代人"的误区，走向了"人机协同系统化"的方向。

### 决策层级：代码优先于 Prompt，能在下层解决就不上推
作者提出的决策层级 **目标 → 代码 → CLI → Prompt → Agent** 是全文最具价值的框架之一。每往上一层，不确定性增加一个量级，成本也增加一个量级。80% 的"AI 需求"其实不需要 AI，一次 `cron + curl` 或 `inotifywait + shell` 就能搞定，且比套 LangChain + Agent 循环更稳定。
这个认知对工程决策有直接的指导意义：拿到需求时先问"10 行 Bash 能搞定吗？"，再问"一次 LLM 调用够吗？"，最后才考虑 Agent。

### Vibe Coding 的陷阱：先易后难，以十倍代价还债
作者真实记录了一次 Vibe Coding 翻车全过程：Day 1-3 成就感爆棚，Day 7 开始代码混乱，Day 14 被迫逐一打开文件修复，Day 15 整整一天"设计与实现对齐"——这一天的价值比前两周加起来都大。
Vibe Coding 的本质是"先易后难"——前期省掉的设计时间后期会以 10 倍的 debug 时间还回来。SDD（Spec-Driven Development）恰好相反：写 spec 很慢，但一旦写清楚，后面的执行、验证、迭代全都有据可循。"大道如夷，而民好径。"

### 脚手架重于模型：投入回报的实证结论
作者给出了一个反直觉但实用的对比：

- 模型升级：成本 +300%，效果 +20%
- 脚手架升级：成本 +50%，效果 +200%
一个设计精良的系统可以让弱模型发挥惊人性能；反过来，烂系统完全浪费掉顶级模型的能力。"垃圾的思考乘以强大的模型，等于精美的垃圾。"

### 自举的前提：不是碰运气，而是系统性基础设施
Agent 自己修了自己的 bug，听起来惊艳，但背后有严肃的前提：Day 15 整整一天的"设计与实现对齐"建立了三样东西——清晰的设计文档、SDD 标准流程、constitution.md 架构约束。没有这些基础设施，AI"自己修自己"就只是碰运气；有了这些，AI 才能在框架内工作而不是自由发挥。

### Task-Driven 到 Goal-Driven：迭代而非替代
作者将演进路径分为两个阶段：Task-Driven 解决执行问题（让系统能跑），Goal-Driven 解决迭代问题（让系统能持续向前）。两者的核心区别在于决策中心的位置——前者在人脑里，后者在于目标 + 边界 + 系统状态里。
但 Goal-Driven 不是更放权，而是更强约束下的有限自治：目标清晰、边界清晰、状态可见、过程留痕、权限可控。

### 协议层正在收敛：框架之争转向协议 + runtime + control plane
作者梳理了 2025-2026 年行业基础设施成形的脉络：OpenAI Responses API、MCP 工具接入标准化、A2A 多 Agent 协作协议。这些事件的共同信号是：Agent 开发正在从"框架之争"转向"协议 + runtime + control plane 之争"。
对个人开发者来说，现在值得花时间理解的不是某个框架的 API，而是协议背后的设计理念。

## 实践启示
### 工程建议汇总
**关于起步**

- 如果你现在也在手动管多个 AI 终端，先别急着造系统。先记录一周：哪些操作是重复的？哪些切换是可以消除的？瓶颈清单比技术方案更重要。
- 起步阶段，文件系统 + JSON 状态比数据库更适合 Agent 系统——出了 bug 可以直接让 AI 读文件排查，不需要教它查数据库。等系统稳定到需要事务和并发锁的时候，再升级不迟。
**关于决策**

- 拿到一个新需求时，从表格最底行往上看——先问"10 行 Bash 能搞定吗？"，再问"一次 LLM 调用够吗？"，最后才考虑 Agent。这个习惯会帮你省掉 80% 的过度工程。
- 如果你现在正在 Vibe Coding，享受前几天的快感没问题，但第三天就要开始补 spec。越早补，代价越小。哪怕只有三段话——要做什么、不做什么、怎么算完成。
**关于治理**

- 如果你的系统还没有 observability（至少能回答"它为什么失败"），那比换一个更强的模型优先级高 10 倍。先投治理，再投模型。
- 自举的前提是 constitution.md（架构约束文件）。不需要写得多长，但至少要覆盖三件事：目录结构约定、模块边界、命名规则。有了它，AI 才能在"框架内工作"而不是"自由发挥"。
**关于技术选型**

- 选技术栈时，优先看它是否兼容 MCP / Responses API 这些正在收敛的协议。自己造的胶水层越多，未来迁移成本越高。协议层是长期资产，框架是短期工具。
**关于 Goal-Driven**

- Goal-Driven 必须建立在成熟的 Task-Driven 基础上。一个连任务都执行不稳定、没有留痕、没有 Skill 沉淀的系统，不可能真的进入目标驱动。别跳步。
- 6 步落地路径：写清楚 spec → 执行过程留痕 → 补 observability 和 eval → 高频动作沉淀为 Skill → 引入调度和并发 → 最后才尝试 Goal-Driven。"先让一次执行可复盘，再让它可重复，再让它可规模化，最后让它可有限自主。"

### 核心认知一句话
**捷径的尽头是弯路，大道的尽头是自由。** Vibe Coding 看似省事，最终以十倍代价还债；SDD 看似麻烦，才能让系统真正跑稳、跑久。

---

