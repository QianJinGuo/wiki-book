# 腾讯 WorkBuddy 实践：如何把 Agent 做成可用产品

## Ch04.332 腾讯 WorkBuddy 实践：如何把 Agent 做成可用产品

> 📊 Level ⭐⭐ | 10.0KB | `entities/腾讯-workbuddy-agent产品化-上下文工程.md`

# 腾讯 WorkBuddy 实践：如何把 Agent 做成可用产品

腾讯 WorkBuddy 策略产品经理 Anne 从产品视角拆解 Agent 的运行机制，沿「模型—上下文—Harness—Loop」链路讲清如何把 Agent 从模型能力推进到可用产品能力。常见判断是「模型够强，剩下交给提示词」，但把 Agent 做成能在生产环境稳定完成任务的产品后会发现，模型只承担其中一部分：工具接入、上下文组织、权限边界、结果验证、反馈纠正和跨会话延续都会直接影响产品是否可靠。

对产品侧而言，模型可以抽象为「根据输入产生后续文字的函数」，这个抽象包含两条约束，决定了上层所有工程的存在理由：模型是无状态的（产品在模型外部保存对话历史、Memory、数据库，需要时再注入），模型的知识截止到训练日期（实时信息需先用工具查询再放进上下文）。工具调用是模型与外部系统的结构化协议：模型负责生成调用请求，Agent 负责执行——持有 API Key、发起请求、修改数据的是 Agent 不是模型，因此权限、审批、参数校验和审计日志都必须由模型外部的工程机制执行。

## 四个概念：工具调用 / MCP / Skill / Plugin

工具调用解决「一个模型怎么请求执行动作」；MCP 解决「外部系统怎么标准化接入」——Anthropic 2024 年底发布的开放协议，提供 Resources（应用/Agent 驱动的只读内容）、Tools（模型驱动的动作）、Prompts（用户驱动的提示模板）三种原语，2026 年的 MCP Apps 扩展还允许工具返回可直接渲染的交互式 UI；Skill 解决「一类任务应该按什么方法做」——沉淀经过验证的工作方法（说明、步骤、脚本、命令和判断标准），Tool 负责「一个动作」，Skill 负责「一类任务的做法」；Plugin 解决「能力组合如何安装和分发」——把 MCP、Skills、Rules、Hooks、模板组合成可安装分发的单位（MCP 是跨产品协议，Plugin 是产品层的打包概念）。选择外接能力形态的判断标准是：能力边界、更新频率、权限风险、上下文成本、执行延迟与跨产品复用价值。

一次完整任务（如「调研 OpenAI/Anthropic/LangChain 的 Harness 实践并输出大纲」）的流程是：检查已有资料 → 读取 Memory 和 Skill → 查询内部问题 → 分配 Sub-agent 并行调研 → 汇总观点和证据 → 补充缺口 → 生成大纲，整个过程由多轮「工具调用—拿到工具结果—决定下一步」的 ReAct 循环构成，主上下文长度逐渐增大，因此必须做上下文管理。

## Context Engineering：模型这一刻该看到什么

Context Engineering 定义为：在一次模型决策前，设计哪些信息进入上下文、以什么形式进入、放在什么位置、何时更新或移出，以提高模型做出正确下一步决策的概率。它包含五类动作：写入（把目标、规则、环境和任务状态显式写进上下文）、选择（从已有候选里只挑当前需要的）、检索（不在手的信息按需捞进来）、压缩（长内容外置到文件、只留结论与证据位置）、隔离（用独立会话或 Sub-agent 处理旁支任务只带回结果）。Context Engineering 追求相关、准确、及时，不是单纯堆 token。

Prompt Cache 是上下文管理的第一要义：按前缀匹配缓存，WorkBuddy 遵循几条规则——System Prompt、基础工具定义、长期规则放前面保持稳定；对话历史追加保存不修改已发送消息；动态内容追加到后面；工具和 Skill 按需加载；只在需要压缩或纠正错误时才接受前缀变化。工具定义与 Skill 都采用渐进式加载（先看名称和简介，进入任务再加载完整内容），意图识别负责「先选对方向」，渐进式加载负责「再按需展开」。工具结果过长时分页、截断或写入文件，截断时明确告诉模型「结果未完整」并附总量、截断位置和继续读取方法。

## Memory：让正确的过去在正确的时候重现

记忆解决的是重复交代背景的问题。WorkBuddy 把长期信息拆成五类陈述性记忆：稳定事实、用户知识背景、行为信号、表达偏好、会话延续信息，每类影响范围不同（Semantic 可作为默认前提、Style 只影响表达、Behavior Signal 需观察多次稳定行为并允许用户纠正）。关键设计是没有把 Procedural Memory（程序性记忆）纳入长期记忆——「做事方法」一旦注入会直接影响推理路径：局部经验可能被误升为通用策略、干扰模型推理、隐性改写 Agent 行为且缺少版本评测审批回滚。WorkBuddy 的选择是用户事实和历史状态放进 Memory，经过验证的工作方法保存为 Skill（可版本化、可评审、可测试、可回滚、按需加载）。记忆按作用域分层（当前轮临时上下文 → 会话/Thread → 项目/Workspace → 用户级 → 团队/组织级），作用范围越大写入晋升门槛越高。

## Harness Engineering：引导、约束与整合

从词源（套在马身上的整套装备）出发，Harness 拆出三类能力：驾驭（Steer，控制执行方向、速度和停止时机——System Prompt、规则文件、Skills、Task/Todo、自我纠正提示）、约束（Constrain，防止执行超出安全范围——权限边界、Sandbox、Approval Gate、Allowlist/denylist、测试验证、rollback、audit log）、整合（Integrate，把执行能力、状态承载、协作机制、自动化配齐并协同）。三类能力必须共同工作：只有引导没有约束，Agent 可能执行不该执行的动作；只有约束没有反馈，出错后无法修正；工具多但缺编排，长任务难以稳定完成。

业界实践参照：OpenAI 一个 3 人小组用 Codex 从空仓库开发 5 个月产出约 100 万行代码、1500 个 PR；Anthropic 长任务 harness 用「初始化 Agent + Coding Agent」跨会话交接、Planner/Generator/Evaluator 三角色对抗评估；LangChain 定义更宽——Agent = Model + Harness，用 Compaction、Tool Call Offloading、Skills 渐进式加载应对 Context Rot，用 Ralph Loop 拦截提前结束信号。WorkBuddy 构建的 Harness 是控制系统：行动前通过前馈（Feedforward）提供目标、规则、环境和可用能力，行动后通过反馈传感器（Feedback sensors）观察结果并返回修正信息；控制按执行方式分为计算型（LSP、类型检查、linter、单测，快便宜可重复）和推断型（Review Agent、AI judge，覆盖难以写成规则的问题）——能用计算型信号解决的优先交给确定性程序。五层结构：运行环境层、引导层（Feedforward）、反馈层（Feedback，含编辑前时间戳校验、外部验证信号、Audit log）、编排层（渐进式加载、意图识别路由、多模型路由、Teams 协作）、迭代层（Harness 自身随模型能力、用户场景和已发现问题持续调整，需证据支撑并评估副作用）。

## Loop Engineering 与未解决问题

Loop Engineering 关注任务如何被触发、连续执行、验证结果、记录进度并再次运行——工程对象从单条 Prompt 扩展到可长期稳定运行的任务循环。一个可用的 Loop 至少需要：触发器、独立执行环境、Skills、Tools/Connectors/MCP、Sub-agents、Memory/Durable Artifacts、Sensors/Evals、Stop Conditions/Budget。需要强调的是 Goal ≠ Loop——Goal 只定义「要去哪里」，Loop 还需要触发器、执行环境、工具、验证信号和停止条件。Loop 不会自动产生正确目标、不会自动产生可信的验收标准、不会承担责任。

未解决的问题包括：功能和业务正确性验证缺口（实现和测试可能共享同一个误解，业务正确性缺少可计算判定标准，AI 自治度需随风险提高而降低：核心业务逻辑支付/风控/订单自治度上限低）、代码库的 Harnessability 决定建设难度（老系统缺结构、历史违例多、可观测性弱）、案例有适用边界、Harness 需要持续投入（工程严谨度从代码编写本身部分转移到环境、反馈回路和控制系统的设计上）。两个核心结论：模型决定能力上限，上下文和 Harness 决定这个上限能否稳定落地；人负责选择方向、定义标准并承担责任，Agent 负责执行、验证和加速迭代。

## 相关实体

- [上下文工程](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-engineering.md)
- [Harness 即产品面](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-as-product-surface.md)
- [WorkBuddy 产品框架](../ch05/043-agent-harness.html)
- [WorkBuddy Skill 全拆解](../ch07/068-workbuddy-skill.html)
- [Harness Loop 架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-loop-architecture.md)
- [上下文管理系统](https://github.com/QianJinGuo/wiki/blob/main/concepts/context-management-agent-systems.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/腾讯workbuddy实践如何把agent做成可用产品.md)

---

