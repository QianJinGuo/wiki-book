# 从 Anthropic 到 Google：Agent Skills 进入设计模式阶段

## Ch04.184 从 Anthropic 到 Google：Agent Skills 进入设计模式阶段

> 📊 Level ⭐⭐ | 11.8KB | `entities/anthropic-google-agent-skills-design-patterns.md`

## 相关实体
- [Anthropic 14 个 Agent Skills 设计模式](ch04/245-skill.md)
- [Anthropic 官方技能最佳实践：14 个可复用的 Agent Skills 设计模式](ch04/245-skill.md)
- [Anthropic 官方 14 种 Skill 设计模式](ch04/245-skill.md)
- [Skills 详解：拆一个技能，看 Anthropic 和 OpenAI 的思路差异](ch01/546-skills-anthropic-openai-comparison-frontend-design.md)
- [要实现一个工作流选择-agent-skills-还是-ai-表格](ch04/245-skill.md)
- [Agent 上下文管理工程模式收敛 — 多框架代码级横向对比](ch03/045-agent.md)
- [Mythos for Offensive Security: XBOW's Evaluation](https://github.com/QianJinGuo/wiki/blob/main/entities/mythos_offensive_security_xbow_evaluatio.md)
- [Anthropic Claude Managed Agents 平台正式发布](ch03/045-agent.md)
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](ch03/045-agent.md)
- [Anthropic Computer Use 最佳实践](ch01/689-anthropic-computer-use.md)
- [Claude 发布官方报告，承认存在 3 处质量退化问题](ch01/380-claude.md)

- [刚刚Opus 4.7发布，相比4.6核心变化，与Claude Code搭配最佳实践](ch03/075-claude-code.md)
- [Claude Code Agent 工程设计](ch03/075-claude-code.md)
- [Qoder Skills 完全指南：从零开始，让 AI 按你的标准执行](ch04/245-skill.md)
- [AI 行业就业八大变化（腾讯研究院纵向对比）](ch04/150-ai.md)
- [Anthropic 长时运行 Agent 架构：对抗式设计 + 合同谈判 + 审美量化](ch03/045-agent.md)
- [CDP Bridge MCP：真实浏览器直连 MCP 工具](ch03/045-agent.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/claude-code-complete-guide.md)
## 深度分析
Google ADK 提出的 5 种 Skill 设计模式——Tool Wrapper、Generator、Reviewer、Inversion、Pipeline——并非简单的分类标签，而是一套经过实践验证的工作流结构化方案。这套模式的演进轨迹清晰地呈现出 Agent 工程的一个核心趋势：从"如何让模型理解指令"转向"如何让模型按正确顺序执行任务"。
**设计模式本质上是 5 类失败模式的解决方案。** 每一模式都对应 Agent 在实际场景中的典型失败：
Tool Wrapper 解决的是"领域知识缺失"问题。当 Agent 需要调用 FastAPI、Terraform、Pandas 或 React Server Components 等领域特定技术时，将其塞入系统提示词会迅速导致上下文膨胀。Tool Wrapper 的核心思想是将低频、领域明确的知识保留在 `references/` 目录，仅在触发时加载，实质上是将上下文窗口从"存储空间"转变为"检索入口"。
Generator 应对的是"输出稳定性"挑战。报告生成、PR 描述、架构评审、周报、API 文档、事故复盘等任务中，Agent 每次输出格式参差不齐。Generator 模式通过 `assets/` 目录的模板与 `references/` 目录的风格指南相配合，将输出稳定性问题转化为结构化填空流程。模板与风格分离、缺失变量单独补齐、该保留的章节明确标记——这种分工策略使得生成质量不再完全依赖模型的"自我理解"。
Reviewer 模式体现了工程团队最关键的质量门控需求：审查流程与审查标准的分离。代码审查、安全审查、Prompt 审查、架构方案审查都面临同一困境——"怎么审"（流程）与"审什么"（清单）混在系统提示词中难以维护。Reviewer 模式将评分清单外置到 `references/review-checklist.md`，SKILL.md 仅规定审查协议：先理解代码目的，再按清单检查，按严重程度输出问题，给出具体修复建议。这种分离使得清单可以版本化、替换、按项目分层，Agent 负责应用标准而非临时发明标准。
Inversion 解决了一个被普遍低估的问题：Agent 倾向于过早开始生成。用户一句"帮我设计一个系统"，Agent 就立刻画架构、选数据库、列服务，看起来完整，实际上关键约束全未确认。Inversion 模式将流程倒置，强制 Agent 先当采访者：先问清问题、用户、规模，再问部署环境、技术栈、非协商约束，不到阶段完成不进入最终方案合成。这里的核心是门控机制——"如果需要可以提问"不够，Agent 容易觉得自己已知晓；明确阶段、退出条件、何时禁止继续，才是可靠的设计。
Pipeline 模式针对的是复杂任务的跳步骤问题。文档生成、发布、数据迁移、代码重构、Incident 复盘等都需要先清点、再生成、再确认、再组装、再质检。Pipeline 的关键是检查点机制——需求没问完不生成架构方案、API 清单没确认不生成最终文档、测试没跑过不宣称修复完成、风险项没分级不进入发布建议、破坏性操作没确认不执行。这类门控一旦含糊，Agent 很容易自行补全后续步骤、直接输出看似完整实则未经验证的结果。
**从"提示词工程"到"过程资产"的认知跃迁。** Skill 的演进揭示了一个深层转变：传统提示词模板解决的是"一次对话怎么说"，而 Skill 作为过程资产解决的是"这类事情以后怎么做"。Skill 不是给用户临时阅读的文档，而是给 Agent 在运行时执行的指令——触发词影响加载决策、步骤顺序影响是否跳步、检查清单影响结果评价、负面约束影响权限边界、支撑文件影响上下文容量、脚本影响可确定性执行的动作。这种运行时职责使得 Skill 更接近"代码级别的接口"，而非"文档级别的建议"。
**Skill 与 Harness 的协同关系。** 从 Agent 产品持续演进的角度看，Harness 负责运行时主循环（上下文组织、工具调用、状态持久化、错误反馈、权限收口），Skill 负责将可复用方法带入运行时（API 怎么写、文档怎么生成、代码怎么审、需求怎么问、流程怎么跑）。两者是同一件事的两面：Skill 是 Harness 可以按需加载的过程模块。
Kaxil Naik（Apache Airflow PMC member）的描述最为直接——他几个月没有手写代码，但花大量时间迭代 Skills、Hooks、CLI、MCP 和集成，让 Agent 按他的工作方式运转。当资深工程师说"Skill is the code"，它意味着的是：过去写在手里、脑子里、团队习惯里的工作方式，正在被写成 Agent 可执行的接口。

## 实践启示
**团队落地 Skill 的六问框架。** 从一个很窄但高频的流程开始（固定服务发布检查、特定框架代码审查、数据口径变更评审、Incident 复盘模板、PR 合并前安全检查、客户方案生成前信息收集），再逐步扩展。启动前需要回答六个问题：
第一，**触发边界是什么**——`description` 更像路由契约，需要说明具体场景而非泛化描述。触发范围太宽 Agent 会乱用，太窄又可能用不上。
第二，**属于哪种模式**——先判断主要任务形态：知识注入（Tool Wrapper）、输出格式稳定（Generator）、质量门禁（Reviewer）、模糊需求收集（Inversion 前置）、多阶段流程（Pipeline）。
模式  |  解决的问题  |  更像什么
第三，**什么东西适合拆出去**——稳定但长的规范放 `references/`、固定输出模板放 `assets/`、确定性重复性动作放 `scripts/`、主文件只保留路由、流程、边界和加载规则。
第四，**哪些步骤需要停下来**——生产级 Skill 通常需要检查点，能落到"禁止继续"的地方就把禁止条件写清楚。
第五，**失败以后怎么走**——识别失败、收集证据、自动重试范围、人工介入条件、禁止绕过的动作，这些越具体 Agent 越不靠猜。
第六，**如何版本化和审查**——每个 Skill 有 owner、每次修改走 review、高风险 Skill 有测试样例、关键流程有变更记录、废弃规则定期清理、第三方 Skill 默认不信任。
**Skill 治理的分级信任策略。** 经验沉淀的诱惑与错误固化风险并存——一次误判只影响当前会话，但如果被写进 Skill，以后每次类似任务都会更快走向同一个错误。分级信任策略：官方内置 Skill 可较高信任但仍看版本；团队自写 Skill 走 review、测试和变更记录；Agent 自动生成 Skill 默认草稿需要人工确认；社区第三方 Skill 默认不信任先做安全审查；带脚本 Skill 按可执行代码对待不按普通文档对待。
更重要的边界是：`SKILL.md` 是 Markdown 但它会影响 Agent 行为——只要 Agent 能调工具、读文件、改代码、发请求，Skill 就可能间接影响真实系统。安全底线、危险命令阻断、权限控制、审计记录更适合下沉到确定性更强的层（如 Hook），而不是只写在提示或 Skill 里。
**Skill 开发与 Agentic Engineering 的全局视角。** Agent 时代的架构师不能只看模型，也不能只追框架。真正耐用的能力是把工作流拆成边界清楚、可组合、可观测、可回滚的系统部件。Skill 正是这样一个入口——小到一个文件就能开始、低门槛到 Markdown 就能写，但只要进入真实工作流就牵出上下文、工具、权限、评估、版本和治理等一系列工程问题。从"写提示词"到"设计工作流"的转变意味着工程团队要开始回答：哪些经验值得沉淀、哪些规则常驻哪些按需加载、哪些判断交给模型哪些动作交给脚本、哪些流程需要检查点、哪些 Skill 可以自动更新哪些需要人工审查、模型升级后旧 Skill 还适不适合。这套问题框架比 Skill 本身更重要，因为它定义的是团队如何持续演进 Agent 能力的方法论。

---

