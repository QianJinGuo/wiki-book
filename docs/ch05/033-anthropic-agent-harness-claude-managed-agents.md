# Anthropic 官方 Agent Harness 平台：Claude Managed Agents 完整指南

> 📊 Level ⭐⭐⭐ | 11.0KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.8**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/anthropic-官方-agent-harness-平台claude-managed-agents-完整指南.md`，一手来源仍见下方 sources。

## 机制与论文
- [晓斌：从 People-Oriented 到 Agent-Oriented Infra —— 意图驱动 + 代码沉淀的进化体](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-oriented-infra-intent-driven-code-sedimentation.md) — Agent-Oriented Infra长文
- [Agent Harness Engineering: A Survey](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-engineering-survey-2026.md) — harness工程survey
- [Harness 到底是什么？看看 OpenClaw、Hermes、Claude Code 的演绎吧](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-7-layers-openclaw-hermes-claude-code-p1anu.md) — 三框架演绎七层模型12857字rv9
- [Claude Opus 4.7 发布分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-opus-4-7-launch.md) — 4.7发布分析
- [刚刚Opus 4.7发布，相比4.6核心变化，与Claude Code搭配最佳实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/刚刚opus-47发布相比46核心变化与claude-code搭配最佳实践.md) — 6588字最全发布分析
- Anthropic N-days: Frontier Agent Vulnerability Research — N-day研究
- [Claude Opus 4.8 系统卡片深度分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-opus-48-system-card-analysis.md) — RSP放松批判
- [王云鹤眼中的Harness：复杂优化问题，AGI灵魂争夺之战](https://github.com/QianJinGuo/wiki-public/blob/main/entities/wangyunhe-harness-optimization-agentsoul.md) — Agent=Models+Harness联合优化
- Claude 4/5 Sonnet & Opus Release Notes — 发布时间线与能力
- [LLM 自我提升系统综述 — Yang 等 113 页四阶段闭环框架（Zesearch NLP Lab）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/llm-self-improvement-system-survey-zesearch-nlp-2026.md) — 113页自提升综述：四阶段闭环+评估控制层

## 工程实践
- 'Harness Engineering：AI 从 — 六层架构+七大反模式+分级决策树19712字rv9
- [Claude Harness 设计：Generator-Evaluator 架构与 Context Reset 演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-generator-evaluator-anthropic.md) — Generator-Evaluator+context reset 10329字rv9全版
- [刚刚Opus 4.7发布，相比4.6核心变化，与Claude Code搭配最佳实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/opus-4-7-launch-claude-code-best-practices-wechat.md) — Opus 4.7核心变化+CC六新功能14779字rv9
- ['Harness Engineering：AI 能在真正](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineeringai-能在真正出事会炸的后端系统里写代码吗.md) — 腾讯CDN LEGO五层架构+对抗式CR全版
- [CLAUDE.md](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-source-leak-lifecycle-analysis.md) — 8步生命周期10k
- [Claude Code Skills / MCP / Rules 源码分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-skills-mcp-rules-source-analysis.md) — 三个注入位置
- [Anthropic Claude Managed Agents 平台正式发布](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-claude-managed-agents-platform-2026.md) — 平台发布14k主版
- [阿里工程师 Harness 工程化实践 (双案例合并)](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-alibaba-java-case-study.md) — 阿里Java双案例合并15565字全版
- [Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness不是目的知识才是护城河-一个ai工程交付团队的知识沉淀实践.md) — 知识五层存储×五类型×三成熟度15831字
- [Anthropic Institute《When AI builds itself》深度解读：AI 进入 AI 研发执行层、瓶颈迁移与研发级 Harness（架构师 JiaGouX）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-institute-when-ai-builds-itself-jiagoux-interpretation.md) — 解读短条borderline
- [面向大型代码库的 Claude Code 团队落地经验与扩展策略（Agent Harness）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-large-codebase-team-deployment-agent-harness.md) — 13模式全版
- [我把 Karpathy 的 AutoResearch 搬到了软件开发领域，效果炸了](https://github.com/QianJinGuo/wiki-public/blob/main/entities/我把-karpathy-的-autoresearch-搬到了软件开发领域效果炸了.md) — val loss换多维评分
- [精选 10 个开发者常用的 AI 智能体技能（Agent Skills）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/精选-10-个开发者常用的-ai-智能体技能agent-skills.md) — 四类技能质量筛选节点
- [你写的 Skill，及格了吗？](https://github.com/QianJinGuo/wiki-public/blob/main/entities/你写的-skill及格了吗.md) — D1元数据定生死评估框架

## 深度分析

### 定位：补齐企业级 Agent 的产品断层，Anthropic 走平台化路线
Managed Agents 的本质不是又一个 Agent 框架，而是把 harness 从"开发者自己拼"变成"平台代管"：工具调用、上下文管理、错误恢复都内置于编排引擎，并随模型能力一起升级。文章指出的断层很真实——企业想跑长时间、能自主调工具的 Agent，过去得自建沙箱、状态管理、权限与错误恢复，这些 infra 工作往往比业务逻辑还重。作者的 EC2→Lambda 类比点出了战略含义：Anthropic 在复制云厂商的抽象阶梯（Messages API → Managed Agents），把 [Agent Harness Engineering Paradigm](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-harness-engineering-paradigm.md) 从开发者自拼的工程实践收编为托管服务，与 [Anthropic Claude Managed Agents Platform 2026](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-claude-managed-agents-platform-2026.md) 的平台发布主版互为印证。

### 四概念模型：Agent / Environment / Session / Events 的关注点分离
四个概念是一次教科书级的职责切分：
- **Agent** = 可版本化的配置（模型 + 系统提示词 + 工具集），创建后拿 Agent ID 复用；`agent_toolset_20260401` 开箱即用（Bash/文件/搜索/Web）但可逐项禁用，且每次更新生成新版本，可把会话固定在指定版本上做生产灰度。
- **Environment** = 运行模板（依赖、网络规则、挂载），支持 pip/npm/apt/cargo/gem/go 预装并缓存加速后续会话；网络默认 `unrestricted`，可切 `limited` + 域名白名单处理敏感数据；GitHub 仓库挂载后启动自动 clone，天然适配自动化 PR 检查。
- **Session** = 独立容器中的运行实例，文件系统/进程/网络互相隔离，多轮对话保留状态、持续存在直到手动关闭或超时——这是它与无状态 API 调用的本质区别，后续任务直接基于已写好的代码继续。
- **Events** = SSE 双向通道，消息下发与响应/工具调用/状态更新实时流回，全程可见、可中途打断。

底层仍是与 Claude Code 相同的 ReAct（Reason → Act → Observe）循环，区别只在运行环境与调度逻辑已被平台接管——这与 [Harness Generator Evaluator Anthropic](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-generator-evaluator-anthropic.md) 中 harness 能力内置化的演进方向一致。

### 多智能体编排：对话隔离、文件系统共享的折中设计
研究预览版的编排是 coordinator → worker 的一层分工，工作者不能再往下拆。设计上最有意思的取舍是"**对话隔离、结果共享**"：每个工作者在独立上下文运行、互不污染，但共享同一容器和文件系统——测试智能体能直接看到审查智能体标出的问题并针对性补测试。这等于用共享文件系统替代消息总线做 agent 间通信，简单但有效。作者把它类比成"AI 版 CI/CD 流水线"：lint、测试、安全扫描、部署各由专门 agent 处理，协调器统一收口。配套自定义工具（JSON Schema 定义、事件流接住请求再回传）与 MCP 直连（Slack/GitHub/Jira 复用现成工具），扩展面基本覆盖了企业内部系统集成的两类主流路径。

### 成本结构：token 是思考成本，runtime 是环境成本
计费 = token（与普通 API 同价）+ 会话运行时间 $0.08/小时、精确到毫秒、空闲不计费。作者先用一张"你要自己管多少东西"的对比表定位 Managed Agents，再给出实例账：Opus 4.6 跑 1 小时编码任务（50K 输入 + 15K 输出）总计约 $0.705。两个容易忽略的点是：Web 搜索 $10/1000 次可能悄悄成为大头；提示词缓存命中只算 0.1x——对上下文很长的 Agent 这是关键折扣。作者对 runtime 的判断也务实：对比自建 EC2 + 容器 + 调度 + 工具链，时间成本与工程复杂度往往更高。

## 实践启示

1. **选型先问"要管多少 infra"，再问场景**：完全定制走 Messages API，想复用 Claude Code 工具集但自托管走 Agent SDK，后端自动化（PR 审查、代码生成流水线、测试、文档生成）走 Managed Agents，本地交互式开发用 Claude Code CLI。
2. **把 Environment 当 IaC 用**：敏感数据场景一律 `limited` 网络 + 域名白名单；GitHub 仓库挂载 + 环境缓存让自动化 PR 检查的冷启动成本趋近于零。
3. **多智能体按流水线编排，不按对话编排**：一层 coordinator→worker 虽然受限，但"对话隔离 + 共享文件系统"的协作面足够支撑审查→补测试这类串行工作流；先想清楚 agent 间通过文件系统交接什么，而不是堆消息协议。
4. **成本模型算三笔账**：token（思考成本）、runtime（环境成本，$0.08/小时空闲免费）、易漏的 Web 搜索与缓存折扣（命中 0.1x）——长上下文 Agent 务必开启提示词缓存，否则成本结构完全不同。
5. **用 Agent 版本化做生产灰度**：每次更新生成新版本，先让测试会话跑新版本，验证后再把生产会话固定切过去。
6. **自建沙箱的机会成本被系统性低估**：循环控制、工具调用、执行环境、上下文管理这些"看不见的 infra"正是平台收走的部分——对长时运行任务，托管方案的时间与工程复杂度优势通常是决定性的。

## 延伸导航
- [Anthropic 生态与战略](https://github.com/QianJinGuo/wiki-public/blob/main/moc/anthropic-ecosystem.md)

## 关联

- 同题异语种孪生页：[Claude Managed Agents Developer Guide](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-managed-agents-developer-guide.md)（归并候选，提案卡 #11 批1）
- 同题异语种孪生页：[Anthropic Agent Skills Design Patterns 14](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-agent-skills-design-patterns-14.md)（归并候选，提案卡 #11 批1）
- 同题异语种孪生页：[Anthropic Claude Code Large Codebase Best Practices 50002A089323](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-claude-code-large-codebase-best-practices-50002a089323.md)（归并候选，提案卡 #11 批1）

---

