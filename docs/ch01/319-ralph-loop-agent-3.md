# Ralph Loop 不够用：长时间 Agent 还缺这 3 件事

## Ch01.319 Ralph Loop 不够用：长时间 Agent 还缺这 3 件事

> 📊 Level ⭐⭐ | 12.0KB | `entities/ralph-loop-不够用长时间-agent-还缺这-3-件事.md`

## 核心要点
- **Ralph Loop本质**：Codex /goal底层采用重复提示循环+SQLite跟踪，通过"Continue working toward the active thread goal"反复提示同一目标 
- **三大缺陷**：模糊性随迭代复利增长（compounding ambiguity）、多agent架构优于单体agent、跨上下文记忆对长运行任务至关重要 
- **优化工作流**：前期通过/interview阶段大幅降低任务模糊性，目标拆解为里程碑，主编排器+sub-agent（实现者+评审者）模式 
- **持久化记忆文件**：维护GOAL.md、STANDARDS.md、IMPLEMENT.md、PROGRESS.md实现跨上下文连续性 
- **推荐配置**：Codex App配合GPT 5.5 xHigh使用，前端设计用Claude Design 

## Codex Goals工作原理解析
### Ralph Loop的技术本质
Codex的goals功能于2026年5月1日进入Codex CLI 0.128.0，本质是让一个goal跨越多轮持续存在，在达成之前不停止 。
Codex底层使用SQLite设计：创建`thread_goals`表存储每个goal的目标、ID、状态和可选token预算。通过`get_goal`和`update_goal`工具记录进展并更新数据库状态 。
核心prompt模板为"Continue working toward the active thread goal"，配合预算信息（已用时间、已用token、剩余token），并在决定达成目标前执行完成度审计 。
这种方式解决了每15分钟停止询问的烦恼，但Jarrod Watts认为这并非让agent长时间运行的有效方式 。

### 模糊性的复利效应
LLM在循环中运行时，每一轮输出都会变成下一轮输入，形成对后续迭代的复利效应。当要求模型从头构建某物时，它会做出无数决定，到某个时刻通常会做出你自己不会做的决定，之后的每一份工作都可能在方向上开始偏移 。
AI目前缺乏"品味"，要避免这种情况非常困难，除非写出极其详细的prompt来减少出错空间 。

## Jarrod Watts的优化工作流
### Phase 1：前期澄清（Interview阶段）
针对模糊性问题，Jarrod采用类似Matt Pocock的"grill-me"skill的/interview变体，在"设置阶段"进行大量用户交互前置。只有在用户充分澄清目标之后，才开始任何自主agent循环 。
这个过程迫使人类自己思考"我到底想要什么"，而不只是让agent去猜测。Codex在 Interview阶段经常会问出用户完全没考虑过的假设，这些细节往往出奇地重要 。
比喻：将决策过程想象成潜在结果树，每个分支都是一个决定，最终通向目标结果。前期澄清让人类有机会在agent流程开始前剪掉偏离方向的分支 。

### Phase 2：多Agent编排架构
研究和自己经验都表明，使用编排器-子代理（orchestrator<>subagent）关系的多agent，比单体agent更强 []。这本质上是横向扩展token消耗的方式——与其让一个聪明agent花更多token思考，不如让多个聪明agent一起花更多时间思考 。
主long-running agent作为orchestrator，可以针对每个独立任务自由创建subagent小队：

- **实现者（Implementer）**：负责实现被分配的任务
- **评审者（Reviewer）**：负责review代码
- 两个agent围绕修复和改进来回迭代，直到都对质量满意，再向主orchestrator汇报 
Reviewer的独立视角很重要：subagent第一次看到代码可以进行目标明确、相对不带偏见的review。这解决了上下文窗口混乱时agent容易自我说服相信完全错误结论的问题 。
Claude Code创建者Boris的观点："往编程问题里投入的token越多，结果就越好。subagent有效的原因在于使用独立上下文窗口，一个agent会引入bug，另一个..."

### Phase 3：跨上下文记忆维护
给agent一个可以跨上下文窗口存储记忆的地方，强制它们在每个新上下文窗口读取这些记忆，对agent和人类都有帮助，能让大家理解当前进展到哪里 。
四个核心记忆文件：
1. **GOAL.md**：顶层目标
2. **STANDARDS.md**：不可协商的代码质量标准
3. **IMPLEMENT.md**：工作流说明（多agent review、测试编写、验证等）
4. **PROGRESS.md**：持续更新日志，记录已做决策和已完成工作
新agent加入时必须阅读所有这些文件，立刻理解之前agent的进展并保持一致行动。这些是指导原则而非严格保证，但总体上能帮助流程运转 。

## 深度分析
### Ralph Loop的根本局限
Codex的Ralph Loop设计解决了一个表面问题（避免频繁中断询问），但没有解决根本问题：模糊性在重复迭代中的复利积累。当agent在一个模糊目标上连续运行数小时甚至数天后，最初的小偏差会被不断放大，最终输出可能与原始目标相去甚远 。
SQLite的状态跟踪只是记录进度，无法修正方向偏差。这与人类工作方式形成鲜明对比：人类会定期停下来反思"我是否还在正确的轨道上"，而LLM循环缺乏这种元认知能力 。

### 多Agent架构的认知科学依据
独立上下文窗口的有效性有认知科学依据：人类专家在评审他人工作时会带着"新鲜视角"（fresh eyes），不受先入为主观念影响。Subagent的独立review机制复制了这种效应，使reviewer能够发现实现者因陷入上下文而忽略的问题 。
这种"横向扩展"相比单纯增加token预算的"纵向扩展"，能更有效地改善结果质量。消耗更多token的"横向"方式让多个agent从不同角度审视问题，相当于并行召开多个专家会议 。

### 持久化记忆的工程价值
GOAL.md、STANDARDS.md等文件的本质是将隐性的组织知识显性化。在传统软件开发中，这种知识通常存在于团队成员的脑子里或Slack/邮件的零散记录中，面临人员变动就丢失的风险 。
持久化记忆文件让agent切换时新agent能快速接手，而不是从头理解整个项目背景。这对长时间运行任务特别重要，因为任务可能跨越数天甚至数周，人类需要休息，agent上下文也会耗尽 。

### 模糊性前置的成本收益分析
Interview阶段看似增加了前期投入，但降低了返工成本。如果在Agent工作了几十小时后才发现方向偏离，前期澄清投入远低于重做成本 。
Jarrod的实践表明，几乎每次Interview阶段Codex都会问出用户完全没考虑过的假设——这正说明了前置澄清的必要性 。

## 实践启示
### 1. 避免单独依赖Ralph Loop
Codex的goals功能是好的起点，但不应作为长时间agent任务的唯一编排机制。建议在goals基础上增加定期的"方向审计"——让agent停下来反思"当前产出是否真正服务于原始目标"，这类似于人类的阶段性复盘 。

### 2. 投资前期需求澄清
/interview类工具应在任何自主agent工作开始前强制执行。这不仅减少后续返工，更重要的是迫使人类自己明确需求。很多时候用户并不真正知道自己想要什么，直到被系统性地追问 。

### 3. 至少采用双Agent评审机制
对于重要任务，应实现者和评审者分离。Reviewer使用独立上下文窗口，不应"偷看"实现者的思考过程。这种blind review能更有效发现真正的问题 。

### 4. 设计可审计的记忆系统
GOAL.md、STANDARDS.md、PROGRESS.md等文件应作为长运行agent项目的标准配置。这些文件不仅是给agent看的，更是给人类团队看的——它们提供了项目演进的可审计历史，使human-in-the-loop监督成为可能 。

### 5. 根据任务类型选择模型
Jarrod建议非前端任务用GPT 5.5 xHigh，前端设计用Claude Design。这反映了当前模型能力的差异化：Claude在创意设计任务上更强，GPT 5.5在复杂推理任务上更优。未来长运行agent系统应具备根据子任务类型动态选择模型的能力 。

### 6. token预算管理的工程实践
Codex goals允许设置token预算来控制agent运行成本。实际项目中应设置合理的预算上限，并在接近预算时触发更保守的决策策略，避免在接近耗尽时做出高风险选择 。

## 相关资源
- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/ralph-loop-不够用长时间-agent-还缺这-3-件事.md)
- [Jarrod Watts GitHub: long-running-agent-skill](https://github.com/jarrodwatts/long-running-agent-skill/tree/main)
- [Claude Delegator](https://github.com/jarrodwatts/claude-delegator/)
- [Matt Pocock grill-me skill](https://www.aihero.dev/my-grill-me-skill-has-gone-viral)

## ## 相关实体
- [从 30 分钟手搓 Agent，到 Harness 成为"新后端"](ch03/044-agent.md)

## ## 相关实体
- [gsd-get-shit-done-context-management-tool](ch01/196-gsd-get-shit-done-context-management-tool.md)

## ## 相关实体
- [Hermes Agent /goal 长任务运行时架构](ch03/044-agent.md)

## ## 相关实体
- [LoongSuite GenAI 可观测语义规范](ch04/150-ai.md)

## ## 相关实体
- [低代码 Agent、框架 Agent、自研 Agent 决策框架](ch03/044-agent.md)

## ## 相关实体
- [三器合一：gstack + Superpowers + OpenSpec 工程化 AI 编程实战](ch04/150-ai.md)

---

