# Agent Skill 编写指南

> 📊 Level ⭐⭐⭐ | 10.0KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.85**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/agent-skill-writing.md`，一手来源仍见下方 sources。

## 机制与论文
- [Skill 设计模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-design-patterns.md) — 5社区模式+14官方模式全集
- [Hermes Agent 深度解析（阿里云/飞樰）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-deep-dive.md) — 自进化内外双路径+四维工程7934字rv9全版
- [阿里Qwen提出Skill-RM：把奖励模型做成可复用Agent Skill](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-rm-qwen-agent-skill-reward-model.md) — Skill-RM奖励模型技能化
- [SkillCorpus: 大规模社区 Skill 生态的筛选、评测与边界分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skillcorpus-consolidating-open-skill-ecosystem.md) — 96k技能提纯流水线评测
- [AI能接管实验室了？中国科大最新研究给出真实物理世界的压力测试](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai能接管实验室了中国科大最新研究给出真实物理世界的压力测试.md) — 机器实验室评测

## 工程实践
- [Qoder Skills 完全指南 + Agent Skill 迭代式编写 — AI 按你的标准执行](https://github.com/QianJinGuo/wiki-public/blob/main/entities/qoder-skills-完全指南从零开始让-ai-按你的标准执行-v2.md) — 菜单菜谱比喻+三级渐进披露18168字rv9全版
- [企业级 Skill 8 块最小骨架 + 8 条 checklist 设计规范](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-design-spec-8-block-checklist-winty.md) — 8块骨架checklist设计规范
- [Harness Engineering 综合性指南（ConardLi 系列 · 含 Beautiful Article 实证 + Reacticle 协议）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-comprehensive-guide-conardli.md) — ConardLi六层架构14634字rv9
- [Harness 工程搭建式业务 Agent 评测方案：Claude Code 作 Harness 搭建者](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineered-business-agent-evaluation-aliyun-boyu.md) — CC搭评测Harness，1.5周→1-2天
- [Skill 版本管理五大原则：从越改越差到持续演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-version-management-semantic-versioning-practices-winty.md) — skill语义化版本五原则
- [重新定义Skill开发：保姆级教程&一站式开发助手](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-development-guide-linyi.md) — 11320字最全教程版
- [Skill 版本对比五大原则：从'两个数字比大小'到工程化质量门禁](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-version-comparison-five-principles-winty.md) — 版本对比五原则六陷阱
- [Harness 工程之道：Skill 原理与最佳实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-skill-engineering-alibaba-practice.md) — Skill渐进披露三阶段+作用域优先级
- [Qoder Skill UI — Agent 与人类的协作界面层](https://github.com/QianJinGuo/wiki-public/blob/main/entities/qoder-skill-ui.md) — 软件双形态：Agent用CLI人用GUI，HTML沙箱路线
- [AI Agent 落地：如何攻克稳定性、成本与评估难题？ — Trace即Evals](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-agent-trace-evals-stability-cost-evaluation-zhangyanfei.md) — trace即evals
- [skill-up: 阿里开源 Agent Skill 评测框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/alibaba-skill-up-agent-skill-evaluation.md) — skill-up主版
- [Agent Skill 评估与迭代](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-skill-writing-evaluation.md) — skill评估迭代
- [Agent Skill 高质量编写规范](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-skill-writing-practices.md) — 编写规范六条
- [Claude Code Dynamic Workflows 实战模式与构建技巧](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-dynamic-workflows-thariq-practical-patterns.md) — 3失败6模式11用例
- [Skill Craft：Claude Skill 质量工程工具](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-skill-quality-tool-skill-craft.md) — skill质量工程
- [Harness Engineering 系统性解读](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-systematic-explainer.md) — 李宏毅课程解读7933字最全版
- [腾讯 Token 优化实战 — 省 Token 和用好 AI 是同一件事](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tencent-token-optimization-agent-architecture.md) — context rot四步工程化
- [Agent Skills 开发指南：6 字段规范、3 级加载、5 步评估闭环](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-skills-development-guide.md) — 6字段开发指南
- [腾讯 AI Coding 深水区 — 事实vs判断尺子与提示词→框架→runtime 下沉方法论](https://github.com/QianJinGuo/wiki-public/blob/main/entities/tencent-ai-coding-deep-water-fact-vs-judgment-2026.md) — 事实判断尺子runtime主权

## 深度分析

### 激活机制的脆弱性：description 决定一切

Skill 的加载与激活完全由 Agent 自主判断，而判断依据几乎全部来自 frontmatter 中的 description 字段——这意味着 description 不准确或缺少关键词时，Agent 根本不会激活 Skill，写得再好的正文也永远不会被读到。原文将其标注为"90% 的人踩的坑"，并把 name 字段的硬约束（小写字母、数字、连字符、不超过 64 字符、必须与父目录名一致）与 description 的 1024 字符上限一起列为元数据层的核心门槛。这种设计的深层含义是：Skill 的入口是一个被压缩到千余字符以内的"检索接口"，编写者必须像做搜索引擎优化一样，把触发场景的关键词显式写进去，而不是指望 Agent 语义泛化。

### "方法而非答案"：Skill 的知识形态

原文提出的第三条规范——"写方法而不是答案"——指向 Skill 作为知识载体的本质区分：把特定任务的最终答案写进 Skill 只能覆盖一个场景，而教会 AI 如何思考（决策路径、权衡标准）才能泛化到一类场景。与之配套的是"预设默认值"原则：给出推荐方案加备选，而不是罗列菜单让 AI 犹豫——前者压缩了推理空间、降低了输出方差，后者看似灵活实则把本应由作者承担的决策责任推回给模型。这两条合起来界定了一种知识形态：高质量的 Skill 不是文档也不是 FAQ，而是"有默认立场的决策程序"。

### Gotchas 章节：隐性知识的显性化

原文把"坑点（Gotchas）"章节称为整个 Skill 中最有价值的部分，要求把"只有踩过坑才知道"的细节写进去。这与"从真实经验提炼，不要凭空想象"的第一条规范互为表里：事故复盘、代码规范文档、与 AI 协作完成任务的后续总结，都是 Gotchas 的来源。从知识管理角度看，Gotchas 之所以价值最高，是因为它是唯一无法由模型通过通用能力自行推导的内容——显式规则可以查、通用能力可以推理，唯独隐性踩坑经验必须由人显式编码进来，这构成了 Skill 相对于纯提示词的不可替代性。

### with/without 对比：把 Skill 当作可证伪的假设

原文的评估方法论建立在一个简洁的实验设计上：同一测试用例跑两次（with_skill vs without_skill），聚合 pass_rate、time_seconds、tokens 三个 delta 指标，再按断言结果做四象限归因——两种配置都通过的断言删除（无信息量）、都失败的修断言本身、带 Skill 才通过的是 Skill 增值点、高标准差的收紧指令。这套流程把 Skill 从"写完即信"的文档变成了可证伪的假设：每个版本都要回答"它到底带来了多少通过率提升、付出了多少时间和 Token 开销"。迭代原则同样服务于这个闭环——从反馈中泛化而非打狭隘补丁、少而好的指令优于详尽规则、基于推理的指令（"做X是因为Y"）优于僵化指令、把测试中重复编写的辅助脚本打包进 Skill。

### Agentic 脚本：为非交互式 Shell 而写

Skill 中 scripts/ 目录的编写规范常被当作普通工程问题，原文却指出它与 Agent 运行环境存在根本耦合：脚本运行在非交互式 Shell 中，因此避免交互式提示是硬性要求而非风格偏好；--help 是 Agent 学习脚本接口的主要方式；结构化输出（JSON/CSV/TSV，stdout 发数据、stderr 发诊断）决定了 Agent 能否可靠解析结果；幂等性、--dry-run 空运行、有意义的退出码、可预测的输出大小，每一项都对应 Agent 自主调用场景下的一种失效模式。换言之，Agentic 脚本的本质是"把人类 CLI 的交互契约翻译成机器可推断的契约"，依赖自包含声明（Python PEP 723、Deno、Bun、bundler/inline）则解决了 Agent 环境中依赖安装的最后一环。

## 实践启示

1. **先写 description，再写正文**：把触发场景的关键词、适用/不适用边界写进 description（≤1024 字符），这是 Skill 能否被激活的唯一入口；正文再好，description 失败则全部失效。
2. **边界像函数一样设计**：范围过小导致多次激活与冲突，范围过大导致臃肿与误触发——按"一次独立决策域"切分 Skill，而不是按目录或按工具切分。
3. **给默认值，不给菜单**：每个决策点写明推荐方案与备选，避免 AI 在多个合理选项间摇摆；同时用"做 X 是因为 Y"的推理式指令替代硬规则，保证指令可泛化。
4. **Gotchas 优先级最高**：把事故复盘、踩坑记录持续回填进 Skill 的坑点章节——这是模型无法自行推导、只能由人显式编码的部分。
5. **每次修改都跑 with/without 对比**：从 2-3 个测试用例起步（变化措辞、覆盖边缘、用真实上下文），用可编程、可观察、可计数的断言聚合 delta，两种配置都通过的断言直接删除。
6. **脚本按 Agentic 契约写**：无交互提示、--help 自文档、结构化输出分离 stdout/stderr、幂等 + --dry-run、依赖用 PEP 723/Deno/Bun 自包含声明。

## 延伸导航
- [评测体系与基准测试扩展](https://github.com/QianJinGuo/wiki-public/blob/main/moc/evaluation-benchmarks-extended.md)

---

