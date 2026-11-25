# 三器合一（Comet + OpenSpec + Superpowers）：用文件系统给 AI 编程上工程纪律 — 术哥源码级深度分析（WHAT/HOW/WHEN-NEXT 分工 + 9 平台 Hook + 上下文压缩 + 多 Agent 协作 + Shell+YAML 工程取舍）

> 📊 Level ⭐⭐⭐ | 14.1KB

## 摘要

术哥对 Superpowers、OpenSpec、Comet 三个 GitHub 开源项目做了源码级拆解，结论反直觉：AI 编程的核心瓶颈不在模型能力，而在工程纪律——需求只活在聊天记录里、换个终端就不知道做到哪一步、阶段校验缺失。三者不是同类竞品，而是一条流水线的三层：OpenSpec 管 WHAT（规格生命周期）、Superpowers 管 HOW（方法论技能库）、Comet 管 WHEN/NEXT（编排与状态机），全程不依赖数据库或云服务，只用 Markdown、YAML 和 Shell 就把即兴对话改造成可追踪的工程流水线。作者自觉声明分析基于本地仓库版本、尚未在生产环境完成全场景验证，属于诚实的二手解读。

## 核心要点

- **三器是流水线三层而非竞品**：OpenSpec 管 WHAT（提案 → 规格 → 设计 → 任务 → 归档），Superpowers 管 HOW（TDD、调试、子代理协作等 Skill 库），Comet 管 WHEN/NEXT（五阶段 `open → design → build → verify → archive` 状态机）。
- **Superpowers 的反直觉结构**：核心是十几个 SKILL.md，几乎没有可执行代码，唯一算代码的是 57 行 `hooks/session-start` Shell 脚本，在会话启动 / 清空 / 压缩时自动注入 Skill 使用指令。
- **Delta Spec 面向存量项目**：变更只描述 ADDED / MODIFIED / REMOVED 增量，归档时分别追加 / 替换 / 删除，不必为一个功能重写整份规格。
- **Artifact Graph 的依赖观**：依赖是使能器（enabler）而非门控（gate），表示「可以创建什么」而非「必须创建什么」；哲学是 fluid not rigid、iterative not waterfall、brownfield-first。
- **`.comet.yaml` 充当 Agent 外部记忆**：字段分阶段控制 / 构建决策 / 验证交接三类，五种合法转换事件，guard 校验不过即阻断（退出码 1）。
- **嵌套 Skill 要求「真正执行」而非「模仿」**：强制触发表述 + PreToolUse Hook 写保护（open/design/archive 阶段拦截代码写入），9 平台支持 hooks。
- **上下文压缩 beta 模式省 25-30% token**：交接包由脚本确定性生成、带行号范围和 SHA256 引用，可追溯、可跨会话恢复，测试通过率不受影响。
- **工程取舍透明**：YAML 换来零依赖与 Git 可追踪但并发写无保护；Shell 换来直接调用系统工具与可调试性但要付 GNU/BSD 兼容代价。

## 深度分析

### 1. 三器分工：WHAT / HOW / WHEN-NEXT 与「编排层不侵入」原则

三个项目解决同一类痛点（需求散落聊天记录、状态无法跨会话、阶段校验缺失），但各切流水线一层：OpenSpec 用 TypeScript CLI + Markdown 模板把需求规格变成可版本控制的文件；Superpowers 用十几个 SKILL.md 规定 AI 在特定场景遵循的纪律；Comet 架在两者之上，用状态机决定何时进入哪个阶段、分发到哪个子技能。

最关键的工程决策是 Comet 的定位：CLAUDE.md 明确规定它不修改 OpenSpec 和 Superpowers 的原始 Skill 文件，是纯粹的编排层。好处是底层项目各自迭代时 Comet 不受影响，用户也可只装其中一个；代价是 Comet 无法深度定制底层行为，只能靠编排规则约束——它能决定「什么时候调用哪个 Skill、调用前后加什么校验」，不能改变 Skill 本身的内容。

### 2. Superpowers：57 行 Shell 的自举与 Skill 依赖链

Superpowers 的源码结构颠覆「方法论框架必须有大工程量」的预期：核心是十几个 Markdown 文件，唯一算代码的是 `hooks/session-start` 这 57 行脚本。脚本读取 `using-superpowers/SKILL.md` 全文，JSON 转义后作为会话上下文注入；SessionStart 监听的 matcher 是 `startup|clear|compact`，即启动、清空、压缩三种情况都会重新注入。这解决的是很直接的问题：很多方案失败在依赖 AI 自己记住该用什么方法论，但 AI 注意力有限、聊着聊着就忘了——Superpowers 等于在每次对话前给 AI 贴一张备忘录。

同一脚本还按环境变量做三路平台适配：有 `CURSOR_PLUGIN_ROOT` 输出 snake_case 格式，有 `CLAUDE_PLUGIN_ROOT` 且无 `COPILOT_CLI` 输出 Claude Code 嵌套格式，其余走 SDK 标准。SKILL.md 内容还能还原出依赖链：brainstorming（不可跳过的入口）→ using-git-worktrees（工作空间隔离）→ writing-plans → subagent-driven-development，内部调用 TDD、代码审查、分支完成、完成前验证——本质是把标准软件工程流程固化成 AI 能逐条执行的指令。

### 3. OpenSpec：Delta Spec 增量规格与 Artifact Graph 依赖观

其一是面向存量项目（brownfield）的 Delta Spec：变更提案不重写整份规格，而是用 ADDED / MODIFIED / REMOVED 三个分节描述增量，每节内是携带完整 scenarios 的 Requirement 块；归档时三个分节分别应用——追加、替换、删除。MODIFIED 的规则最严格：必须把整个需求块（从 Requirement 标题到全部 scenarios）复制一份在副本上改，只写改动部分的 MODIFIED 归档时会丢细节，schema 的 instruction 字段有明确提醒。

其二是 Artifact Graph：spec-driven schema 把制品依赖声明为一张图——proposal 无依赖，specs 依赖 proposal，design 可与 specs 并行，tasks 依赖两者。关键是依赖是使能器而非门控：表示「可以创建什么」而非「必须创建什么」，可跳过 design 也可回头补。官方概括为 fluid not rigid、iterative not waterfall、easy not complex、brownfield-first。schema 可自定义（如在 proposal 前插入 research 阶段），另靠 26 个适配器文件把同一套工作流分发到 Claude Code、Cursor、Codex、Gemini 等平台。

### 4. Comet：YAML 状态机强制纪律、上下文压缩与多 Agent 隔离

Comet 工程量最重：核心逻辑全在 Shell 脚本（comet-state.sh 1245 行、comet-guard.sh 752 行、comet-handoff.sh 390 行），创新点是用 `.comet.yaml` 充当 Agent 外部记忆。状态字段分阶段控制（workflow / phase / archived）、构建决策（build_mode / isolation / tdd_mode / subagent_dispatch）、验证交接（verify_mode / verify_result / handoff_hash）三类；转换收敛为五种合法事件，每次转换前 guard 校验前置条件，不满足即阻断。两条硬约束颇具代表性：离开 build 前必须完成全部构建决策；进入 archive 前必须有真实存在的验证报告且分支状态已处理。tasks_all_done 更彻底——没有已完成任务阻断、有未完成任务也阻断，AI 没法口头宣称完成。阶段检测用 first-match-wins 链路，每次恢复上下文都重跑前置步骤、不信任可能被压缩截断的对话历史：只有文件系统状态可靠。

嵌套 Skill 触发是核心技术挑战：模仿（读描述照着做）和真正触发（用宿主 Skill 工具加载全文）有本质区别，前者会遗漏关键步骤。Comet 定义了中英文统一的强制触发表述——「立即执行：使用 Skill 工具加载 `<skill-name>` 技能，禁止跳过」——并用 `comet-hook-guard.sh` 这个 PreToolUse Hook 兜底：open / design / archive 阶段 AI 试图写代码文件即被拦截。9 个平台支持 hooks（Claude Code / Codex / Amazon Q 共用 claude-code 格式，另有 Gemini、Windsurf、Copilot、Qwen、Kiro、Qoder），不支持的平台（如 Cursor）只能靠文字指令、可靠性打折。

上下文压缩解决 Design → Build 交接的窗口经济学：off 模式嵌入完整 Spec，beta 模式只保留 SHA256 哈希引用、AI 按引用回读原文件。交接包不是 AI 写的摘要，而是脚本确定性生成的上下文包，每个源文件标注路径、行号范围和 SHA256，Guard 进入 build 前校验 handoff_hash。基准数据显示 beta 减少 25-30% build 阶段输入 token，测试通过率不受影响、Spec 覆盖率从 100% 微降到 95%；更重要的是跨会话恢复可靠——不依赖对话历史，读 `.comet.yaml` 和交接包即可复原状态。

多 Agent 方面，subagent-driven-development 让主 Agent 只协调：编码派给拿到全新上下文的 Implementer 子代理，再由规格合规与代码质量两个 Reviewer 审查——子代理只接收当前任务所需信息，避免上下文污染。Comet 加了配套约束：`build_mode: subagent-driven-development` 时 `subagent_dispatch` 必须确认为 confirmed，否则恢复时提示确认派发或切换 executing-plans。这堵住了「声称子代理模式、实际主窗口执行」的漏洞——子代理的价值就在上下文隔离，主窗口执行等于价值清零。取舍上，YAML 换来零依赖与 Git 可追溯但放弃并发写保护（AI 编程通常单 Agent 活跃，可接受）；Shell 换来直接调 git / grep / awk / sha256sum 与可调试性，代价是 GNU/BSD 兼容——禁 `sed -i`、兼容两套 sha256 工具、为解析 YAML 行内注释写了 20 多行 awk 程序。

## 实践启示

1. **需求规格落盘到文件系统，而非留在聊天记录里**：项目级 AI 编程从建立 spec 目录与变更 delta 习惯开始；建议先单独试用 OpenSpec，再决定是否叠加整套流水线。
2. **方法论注入靠机制而非自觉**：把「该用什么流程」固化成 SessionStart hook 自动注入，而不是指望模型在长对话中自己想起来；上下文清空或压缩后指令还能自动补回。
3. **关键 gate 用脚本阻断而非 prompt 劝说**：任务全勾选、验证报告存在、构建决策齐备等硬前置条件用退出码 1 的守卫脚本强制执行——AI 无法口头宣称完成，纪律才成立。
4. **跨阶段 / 跨会话交接用确定性生成的上下文包**：带路径、行号、SHA256 指纹的机器生成交接包远比 AI 摘要可追溯，有疑问可直接回源文件验证。
5. **子代理模式的价值在上下文隔离，须防退化**：主窗口只协调、子代理给全新上下文；在状态文件中显式记录派发模式并要求确认，防止「口头子代理、实际主窗口执行」。
6. **编排层与底层解耦是可持续演进的前提**：不改底层 Skill、只在调用前后加校验，底层升级时编排不受影响；扩展新平台优先走适配器抽象，而不是分叉底层逻辑。

## 相关实体

- [Three Tools In One Gstack Superpowers Openspec Engineering Ai Coding](https://github.com/QianJinGuo/wiki-public/blob/main/entities/three-tools-in-one-gstack-superpowers-openspec-engineering-ai-coding.md) — 同主题三器组合（第三器为 gstack），AgentBuff 视角偏 HARD-GATE 串联与 TDD / review 互补
- [Superpowers Deep Dive Kaiyuandakashuo](https://github.com/QianJinGuo/wiki-public/blob/main/entities/superpowers-deep-dive-kaiyuandakashuo.md) — Superpowers 单项目深度拆解（开源圆桌）；本实体是三项目系统视角
- [Openspec Spec Driven Development Trae Solo](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openspec-spec-driven-development-trae-solo.md) — OpenSpec 单项目 + Trae 原生 SDD 视角；本实体是三项目流水线视角
- [Openspec 四步法深度复盘 流程完整不等于代码正确](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openspec-四步法深度复盘-流程完整不等于代码正确.md) — OpenSpec 四步法实战复盘：流程完整不等于代码正确
- [Ai Production Development Workflow Openspec Superpowers Gstack](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-production-development-workflow-openspec-superpowers-gstack.md) — gstack + OpenSpec + Superpowers 生产级实践
- [Claude Code Skills Superpowers Practice](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-skills-superpowers-practice.md) — Claude Code + Superpowers 实践
- [Hermes Agent Skills Source Code Analysis Shuge](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-skills-source-code-analysis-shuge.md) — 术哥对 Hermes Agent Skills 的同风格源码分析（方法论参照）
- [Openspec Superpowers Decommissioning Frankenstein Three Questions Shuge 2026 06 18](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openspec-superpowers-decommissioning-frankenstein-three-questions-shuge-2026-06-18.md) — 同作者 24h 后的「缝合怪」下线反思：三器融合方案的减法决策

→ [原文存档](https://mp.weixin.qq.com/s/2LSn2Tbw7iN1XZnckQUY1g)

---

