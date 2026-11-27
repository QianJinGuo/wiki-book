# 告别“氛围编程”：基于 Harness 治理和 SDD 的团队级 AI 研发范式演进与实践

> 📊 Level ⭐⭐⭐ | 12.9KB

从微信文章 [告别“氛围编程”：基于 Harness 治理和 SDD 的团队级 AI 研发范式演进与实践](https://mp.weixin.qq.com/s/-_IBJFuXpvoqMJxL9oaEJQ) 提取。

### 主要章节
- ####  原因2：存量应用进行 Vibe Coding 风险非常高
- ####  原因3：大型项目、复杂需求超出了单次 AI 对话的能力边界
- ####  SDD  （规范驱动开发）
- ####  Harness Engineering  （驾驭工程）
- ####  步骤1：设计知识库
- ####  步骤2：处理需求 PRD
- ####  步骤3：专家团执行任务
- ####  步骤4：任务部署

## 深度分析

### 一、范式演进的真实动因：出码率幻觉与存量风险

本文最有价值之处是诚实记录了一次“指标悖论”：团队半年内把 AI 出码率从 53% 提到 80%-90%，但访谈团队、核对 PMO 数据后发现提效并不明显——交付周期未缩短，开发者工作量也未减少。 作者借《人月神话》“没有银弹”解释：研发是提需、评审、设计、开发、测试、联调、上线的全链路过程，编码只占一段，优化编码 50% 或只带来 15% 整体提效，何况 AI 代码还会增加评审、调试与返工时间。 解法因此不是继续优化写码，而是让 AI 跨越环节边界、打通需求到部署的闭环。

更直接的推动力是失败案例：AI 修改核心接口参数顺序，单测全过，上线后三个下游服务报错，排查一整天。 单测通过不等于系统正确——存量应用的隐式依赖与沉淀在代码里的业务知识不在测试覆盖内，这正是氛围编程的结构性风险，也解释了为何涉及十几个模块的重构超出了单次对话的能力边界。 加上自由发挥、多轮拉扯、长对话遗忘约束三类问题， 结论是：AI 编程必须从“个人技能”升级为“团队级工程能力”。

### 二、SDD：规范成为唯一真实来源

SDD 的颠覆点是文档与代码关系倒转：传统开发中 PRD 只是“指导书”、代码是唯一真理之源，文档注定过期脱节；SDD 中规范成为唯一真实来源，且被定义为可被 Agent 精确理解和执行的“意图代码”。工作流是四阶段闭环：Specify（结构化规范）→ Plan（AI 像编译器一样把规范“编译”成技术方案与任务拆解）→ Implement（Agent 逐任务生成代码）→ Validate（按规范自动生成并执行测试）。 落地细节里，Spec 生成刻意保留 HITL 干预——AI 主动提问澄清“用户登录”背后的登录方式、登录态、密码强度、失败处理等隐性知识；而验收标准必须可测试、无歧义：“3 秒内跳转首页并显示用户昵称”才算合格。 质量锚点由此从“AI 写得像不像”移到“规范是否可判定”。

### 三、Harness：确定性治理层的四支柱

Harness 的角色是不改变马的基因（模型本身），而是为它设计精密控制系统。四支柱中最“硬”的是架构约束：用物理手段强制分层——UI 层代码绝对禁止访问数据库层，违规代码连语法检查都过不了、提交前即被拦截，治理从提示词等“软约束”升级为“硬门禁”。 反馈回路与熵管理则坦承“AI 一定会犯错”，建设测试沙箱循环（写码→测试→失败→读日志→自我修正），并把人类修复错误的经验固化为新规则，确保同样的错误不犯第二次；人类监督完成角色迁移——审核员与环境设计师，处理那 5% AI 无法判断的模糊逻辑。 作者将其总结为范式转移：从“怎么跟 AI 说话”，到“AI 应该看到什么”，再到“AI 如何在受控环境中运行”。

### 四、团队级落地：三层知识库与专家团执行

落地骨架是三层知识库：项目层（架构、目录、技术选型，以顶层 README.md 为“单一事实来源”——不在文档里的信息对 AI 即不存在）、技术层（编码规范、最佳实践等跨项目沉淀）、资产层（可复用组件、历史 PRD、归档测试 Case），经 README 索引按需加载避免上下文过载；Memory 解决长周期开发的“上下文焦虑”。 执行采用专家团模式：按 Spec 拆解出有明确输入输出和验收标准的小任务，分配给五类内置角色 Agent；用户随时可介入，由 Experts Leader 在下一轮循环调整方向或取消任务。 部署经 Aone 的 MCP 工具由运维 Agent 触发 CI/CD、查询状态、处理异常，辅以数据库 Skill 做数据验证，打通“PRD→Spec→拆解→生成→测试→部署”全自动链路；结尾给出三个演进方向：更智能的 Spec 生成、更强的 Agent Teams、更完善的知识管理。

**延伸阅读**：[Sdd Specification Driven Development Harness](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/sdd-specification-driven-development-harness.md)、[Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering.md)、[Vibe Coding Paradigm](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/vibe-coding-paradigm.md)、[从Vibe Coding到Agentic Engineering重构后台开发全流程](https://github.com/QianJinGuo/wiki-public/blob/main/entities/从vibe-coding到agentic-engineering重构后台开发全流程.md)

## 实践启示
**团队引入 AI 辅助开发时**：第一步不是让所有人开始用 AI 写代码，而是建立设计知识库——把团队的设计决策、业务规则、边界条件用 AI 可消费的格式（而非自然语言文档）结构化存储。没有这个基础层，AI 生成的代码质量完全依赖模型能力，无法进行有针对性的治理。
**存量项目改造**：采用「特权最小介入」原则——只让 AI 处理明确无误的任务（如测试生成、文档编写、重构辅助），关键业务逻辑和跨模块决策仍由人类把关。在 Harness 中设置「AI 禁止修改」区域，并配置强制人工 review 的门禁。
**大型复杂项目**：将需求进行 SDD 分解后，再通过专家团（Human Expert Panel）逐个确认每个子任务的可行性和安全性。AI 的角色是「加速执行」，而非「替代判断」。任务部署前必须有 Harness 的自动化检查清单覆盖。

- [基于 Harness + SDD + 多仓管理模式的 AI 全栈开发实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-sdd-duiwu-ai-fullstack-dewux.md)
- [Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness不是目的知识才是护城河-一个ai工程交付团队的知识沉淀实践.md)
- [Martin Fowler AI 研发 Harness：非确定性承重层](https://github.com/QianJinGuo/wiki-public/blob/main/entities/martin-fowler-ai-rd-harness-nondeterminism.md)
- [腾讯 AI Team 知识沉淀体系（Harness Engineering 实践）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tencent-ai-team-knowledge-harness.md)

## 相关实体
- [Agent 开发范式演进：从环境工程出发，“简化”多源实时上下文](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-开发范式演进从环境工程出发简化多源实时上下文.md)
- SkillOS: Learning Skill Curation for Self-Evolving Agents
- [深度拆解 Hermes Agent 记忆系统：它修正了 OpenClaw 的哪层误区？](https://github.com/QianJinGuo/wiki-public/blob/main/entities/深度拆解-hermes-agent-记忆系统它修正了-openclaw-的哪层误区.md)
- [Harness Engineering实践做了一个平台让AI一晚上自动评测和优化你的系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering实践做了一个平台让ai一晚上自动评测和优化你的系统.md)
- [Cursor 复盘 Harness：模型决定能力上限，Harness 决定生产下限](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cursor-复盘-harness模型决定能力上限harness-决定生产下限.md)
- [在 RDS PostgreSQL 中实现 RaBitQ 量化](https://github.com/QianJinGuo/wiki-public/blob/main/entities/在-rds-postgresql-中实现-rabitq-量化.md)
- [Codeindex · 让大模型更好地理解你的代码](https://github.com/QianJinGuo/wiki-public/blob/main/entities/codeindex-让大模型更好地理解你的代码.md)
- [使用 Agent Skills 做知识库检索，能比传统 RAG 效果更好吗？](https://github.com/QianJinGuo/wiki-public/blob/main/entities/使用-agent-skills-做知识库检索能比传统-rag-效果更好吗.md)
- [RAG深度解析：分块、向量化、召回、重排，才是"蒸馏同事skill"的关键](https://github.com/QianJinGuo/wiki-public/blob/main/entities/rag深度解析分块向量化召回重排才是蒸馏同事skill的关键.md)
- [Claude Code 之父最新访谈：编程已经结束、harness 将消失、Claude Code 将只有 100 行代码、loop 才是未来](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-之父最新访谈编程已经结束harness-将消失claude-code-将只有-100-行代码loop-才是未来.md)
- [Harness Engineering：耗时一周，我是如何将应用的AI Coding率提升至90%的](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering耗时一周我是如何将应用的ai-coding率提升至90的.md)

- [Anthropic 联创：2028 年实现 AI 自我构建的概率超过 60%](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-联创2028-年实现-ai-自我构建的概率超过-60.md)
- [Agent架构关键变化：Harness正在成为新后端](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent架构关键变化harness正在成为新后端.md)
- [我把 Karpathy 的 AutoResearch 搬到了软件开发领域，效果炸了](https://github.com/QianJinGuo/wiki-public/blob/main/entities/我把-karpathy-的-autoresearch-搬到了软件开发领域效果炸了.md)
- [吴恩达：AI 将最先杀死前端](https://github.com/QianJinGuo/wiki-public/blob/main/entities/吴恩达ai-将最先杀死前端.md)
- [精选 10 个开发者常用的 AI 智能体技能（Agent Skills）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/精选-10-个开发者常用的-ai-智能体技能agent-skills.md)
- [国产顶尖模型 benchmark 评分那么高，可实际效果为什么差？看完 Anthropic 这篇博客，刷分的因素太单一了](https://github.com/QianJinGuo/wiki-public/blob/main/entities/国产顶尖模型-benchmark-评分那么高可实际效果为什么差看完-anthropic-这篇博客刷分的因素太单一了.md)
- [你写的 Skill，及格了吗？](https://github.com/QianJinGuo/wiki-public/blob/main/entities/你写的-skill及格了吗.md)
- [2 小时，0 行手写代码，我用 Claude 做了一个生产级 VSCode 插件](https://github.com/QianJinGuo/wiki-public/blob/main/entities/2-小时0-行手写代码我用-claude-做了一个生产级-vscode-插件.md)
- [Anthropic 官方 Agent Harness 平台：Claude Managed Agents 完整指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-官方-agent-harness-平台claude-managed-agents-完整指南.md)
- [IMClaw：通过微信/飞书操控ClaudeCode/Codex/GeminiCLI/Pi Agent蜂群](https://github.com/QianJinGuo/wiki-public/blob/main/entities/imclaw通过微信飞书操控claude-code-coodex-gemini-clipi-agent蜂群.md)
- [民生银行基于规格驱动开发（SDD）的 CodeAgent 私域研发探索与实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/民生银行基于规格驱动开发sdd的-codeagent-私域研发探索与实践.md)
- [两万字详解Claude Code源码核心机制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-20000-char-source-analysis.md)
- [天猫新品营销技术团队AI编码实战指南（上）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/天猫新品团队ai编码实战指南下.md)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](https://github.com/QianJinGuo/wiki-public/blob/main/entities/深入理解-claude-code-源码中的-agent-harness-构建之道-v2.md)
- [从Vibe Coding到Agentic Engineering：重构后台开发全流程](https://github.com/QianJinGuo/wiki-public/blob/main/entities/从vibe-coding到agentic-engineering重构后台开发全流程.md)
- [AI Agent 工程师能力地图](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-agent-engineer-capability-map.md)

→ [原文存档](https://mp.weixin.qq.com/s/-_IBJFuXpvoqMJxL9oaEJQ)

---

