# Anthropic 14 个 Agent Skills 设计模式

> 📊 Level ⭐⭐⭐ | 10.9KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.8**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/anthropic-agent-skills-design-patterns-14.md`，一手来源仍见下方 sources。

## 机制与论文
- [晓斌：从 People-Oriented 到 Agent-Oriented Infra —— 意图驱动 + 代码沉淀的进化体](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-oriented-infra-intent-driven-code-sedimentation.md) — Agent-Oriented Infra长文
- [MUSE-Autoskill：字节 ByteBrain 自进化 Agent 五阶段技能生命周期，arXiv 2605.27366](https://github.com/QianJinGuo/wiki-public/blob/main/entities/muse-autoskill-bytebrain-self-evolving-agent-arxiv-2605-27366.md) — 五阶段技能生命周期，自生成87.94%超人类68.40%
- [Harness 到底是什么？看看 OpenClaw、Hermes、Claude Code 的演绎吧](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-7-layers-openclaw-hermes-claude-code-p1anu.md) — 三框架演绎七层模型12857字rv9
- [AI Agent 架构设计（七）：Skills 系统设计（OpenClaw、Claude Code、Hermes Agent 对比）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-system-design-three-way-comparison.md) — 三框架skill系统设计对比
- [从 Anthropic 到 Google：Agent Skills 进入设计模式阶段](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-google-agent-skills-design-patterns.md) — ADK五模式对比
- [Hugging Face AI Agent 术语表：Model / Agent / Scaffolding / Harness / Context Engineering / Policy / Tool / Skill / Sub-agent 完整区分](https://github.com/QianJinGuo/wiki-public/blob/main/entities/huggingface-ai-agent-glossary-model-scaffolding-harness-tool-skill-subagent.md) — HF术语表16399字：Scaffolding/Harness/Policy辨析
- [Agent Skills 系统性综述：表示→获取→检索→进化](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-skills-comprehensive-survey.md) — skill综述三元组
- [Mythos for Offensive Security: XBOW's Evaluation](https://github.com/QianJinGuo/wiki-public/blob/main/entities/mythos_offensive_security_xbow_evaluatio.md) — XBOW评测6874字rv9全版：live-site悖论
- [Skill自进化三路线：Trace2Skill归纳法 / EvoSkill验证闭环 / SkillOpt训练范式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-self-evolution-three-approaches.md) — 自进化三路线对比解析
- Anthropic N-days: Frontier Agent Vulnerability Research — N-day研究
- [800行代码实现 Open Claw 的 Tool、消息总线、子Agent管理架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/open-claw-tool-bus-subagent-architecture.md) — 薄抽象显式控制流8802字rv9全版
- [王云鹤眼中的Harness：复杂优化问题，AGI灵魂争夺之战](https://github.com/QianJinGuo/wiki-public/blob/main/entities/wangyunhe-harness-optimization-agentsoul.md) — Agent=Models+Harness联合优化
- [Agent Skill 规范、构建与设计模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-skill-spec-building-design-patterns.md) — skill规范与模式

## 工程实践
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](https://github.com/QianJinGuo/wiki-public/blob/main/entities/boris-cherny-新访谈开发工具正在从-ide-变成-agent-控制台.md) — Boris访谈rv10全版
- [Claude Harness 设计：Generator-Evaluator 架构与 Context Reset 演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-generator-evaluator-anthropic.md) — Generator-Evaluator+context reset 10329字rv9全版
- Claude Code Openclaw Memory Comparison — 记忆系统对比rv9
- [Qoder Skills 完全指南 + Agent Skill 迭代式编写 — AI 按你的标准执行](https://github.com/QianJinGuo/wiki-public/blob/main/entities/qoder-skills-完全指南从零开始让-ai-按你的标准执行-v2.md) — 菜单菜谱比喻+三级渐进披露18168字rv9全版
- [Impeccable：把 AI 前端设计变成可检查的工作流 — 33.4k Star 开源项目深度分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/impeccable-frontend-design-skill-harness-vibecoder.md) — Impeccable四层架构9210字rv9全版
- [Claude Code 一周年回顾：Boris Cherny + Cat Wu 的完整时间线](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-first-year-retrospective-boris-cat-2026.md) — 一周年回顾14k主版
- [鹅厂 Skill 写作完整 Playbook：14 章节 end-to-end 实战 + 工程化评估（腾讯一线踩坑 + Anthropic 官方做法整合）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tencent-skill-writing-complete-playbook-jackjchou.md) — 14章节skill写作playbook
- [Anthropic 最新博客：MCP 没死，它又来了](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-mcp-revisited-tool-search-code-orchestration.md) — MCP三条路
- [长时间运行应用的 Harness 设计](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-design-long-running-apps.md) — GAN式generator/evaluator长时harness 9745字
- [Anthropic 官方技能最佳实践：14 个可复用的 Agent Skills 设计模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-14-skill-patterns-best-practices.md) — 14个skill模式全版
- [Anthropic Claude Skill 9 类任务分类法](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-claude-skill-9-categories-datawhale-2026.md) — 9类分类法

## 深度分析

### description 是预算最紧的「选路信号」，且必须双向设计

会话开始时 Claude 只能看到每个技能的 name 和 description——这意味着 description 不是摘要，而是路由器，入口选错后面写得再好也用不上；而排除条款（何时不用、交给谁、裸模型即可）不是单篇属性而是库级属性——两个技能都说「我能做」或都说「我不做」的冲突/空白，是在库层面涌现的。在 1024/1536 字符的硬预算下（开放规范 vs Claude Code），每句话都要在触发词、排除条件、领域关键词之间做三方取舍——这与 [上下文窗口经济学](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-window-economics.md) 的基本假设同构：选路信息本身就是一种稀缺资源。

### 上下文经济是双层结构：写法层（预算）× 装载层（披露）

14 个模式中「上下文经济」一类实际包含两个互补层次。写法层是 Context Budget：默认前提「Claude 是聪明的」，删掉一句话不让足够聪明的读者困惑就删；术语统一（只用 field 不来回切换 field/box/element）；避免「2025 年 8 月之前」这类时间敏感表达。装载层是 Progressive Disclosure：把 SKILL.md 当目录而非仓库，主文件 ≤500 行、细节拆到 FORMS.md/REFERENCE.md、长参考文件顶部加 TOC 以容忍截断。两层之间藏着一个真正的 free lunch：`scripts/` 里的脚本「可执行但不装载」——用 CPU 换 token，实现细节零上下文成本。这也是 [Skill 工程原则](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/skill-engineering-principles.md) 中「渐进披露」思想的操作化。代价不可忽略：拆分把「下一步该加载哪个文件」的判断转嫁给 Claude，选错就多走几轮——装载层的省，可能被路由层的错吃回去。

### 指令校准是二维谱系：严格度 × 是否解释原因

控制调优模式按「任务脆弱度」给出三档自由度（开放任务→文本指令；部署→伪代码/参数化；数据库迁移→精确脚本+强约束），核心问句是「这里能接受多大的偏差」。解释原因模式则补上第二维：全大写 ALWAYS/NEVER 在 skill-creator 里被当作需要重构的信号，因为字面执行的规则在边界情况会误伤；「规则+原因」让 Claude 在规则未覆盖处也能自行推断。两个维度的交叉才是完整决策：低自由度步骤直接命令式更合适（解释白耗 token），判断密集区才值得带原因写——很多人「写死一点更安全」的直觉，实际只是把失败方式从「做错」换成「做不了」。同一节里的模板与示例构成另一对分工：模板定结构、示例定风格，且 Claude 会优先对齐示例而非文字描述，所以示例必须覆盖多种情况，否则它会学走单一示例里的习惯并全局复现。

### 三个校验环 + 两个外移：把风险推进到副作用之前

工作流控制与可执行代码两类本质是同一件事的递进：让「未完成」和「不对」可见。执行清单的关键机制是未完成项在对话中持续可见——可见性本身构成完成压力，让「提前宣布完成」变得困难；自纠正循环（生成→验证→失败修复→再验证）把质量检查显式化，但可能不收敛，需设重试上限并回退给用户；计划-验证-执行则更进一步——所有验证发生在副作用之前，与自纠正循环「事后修」形成时序对照：批量改表、数据迁移这类不可逆操作必须用后者。两个「外移」收尾：Utility Bundle 把反复重写的确定性逻辑固化进 scripts/，进入上下文的只有输出而非实现过程；Autonomy Calibration 则给出一个安全上的重要澄清——`allowed-tools` 是预批准而非沙箱，真正的约束要靠权限策略，把它当硬限制等于放大权限。这一组模式与 [Skill 自进化三路线](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-self-evolution-three-approaches.md) 中 EvoSkill 的验证闭环同型：验证信号是技能可信度的来源。

## 实践启示

1. **写 description 先写排除条款**：把「不做什么/该交给谁/直接用裸模型即可」当作第一性问题，并以技能库为单位做互斥审计，而不是逐篇打磨正向触发词。
2. **SKILL.md 超 ~300 行即拆分**：主文件当目录用，确定性逻辑全部下沉到 `scripts/`，利用「可执行不装载」用 CPU 换 token；同时在长参考文件顶部加 TOC 对抗截断。
3. **按任务脆弱度分级写指令**：每一步先问「能接受多大偏差」——错一步全错的场景用精确脚本+命令式，开放型任务（如代码审查）才给文本级自由度。
4. **MUST/ALWAYS/NEVER 一律改写为「规则+原因」**，例外仅限低自由度硬约束步骤；发现自己在写全大写指令时，把它当作重构信号。
5. **高风险/批量操作前置可验证中间产物**：先生成结构化计划（如 JSON），验证通过才执行——把所有验证放在副作用之前，并始终配重试上限与用户回退。
6. **维护「已知陷阱」一节**：它是技能里价值最高的内容（直接来自真实踩坑），但库升级、API 变动后旧陷阱会失效，不更新反而误导 Claude 排查已消失的问题。

## 延伸导航
- [Claude Code 生态完全指南](https://github.com/QianJinGuo/wiki-public/blob/main/moc/claude-code-complete-guide.md)

## 关联

- 同题异语种孪生页：[Anthropic 官方技能最佳实践14 个可复用的 Agent Skills 设计模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-官方技能最佳实践14-个可复用的-agent-skills-设计模式.md)（归并候选，提案卡 #11 批1）
- 同题异语种孪生页：[Anthropic 官方 Agent Harness 平台Claude Managed Agents 完整指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-官方-agent-harness-平台claude-managed-agents-完整指南.md)（归并候选，提案卡 #11 批1）

---

