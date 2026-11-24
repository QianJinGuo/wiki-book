# Hermes Agent 自进化机制源码解析

> 📊 Level ⭐⭐⭐ | 12.7KB

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.75**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/hermes-agent-self-evolving.md`，一手来源仍见下方 sources。

## 机制与论文
- [深度拆解 Hermes Agent 记忆系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-memory-system-openclaw-comparison.md) — 记忆成本账四层体系15260字rv10最深版
- [SkillOS: Learning Skill Curation for Self-Evolving Agents](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-os-learning-skill-curation-self-evolving-agents.md) — SkillOS策展RL架构清晰rv10
- [Hermes Agent Skill 互优化：SkillEvolver × Darwin × EmbodiSkill 4 轮闭环](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-skill-crossover-optimization.md) — SkillEvolver×Darwin×EmbodiSkill互优化13412字
- [Agent Memory 模块化框架与评测：Memory in the LLM Era 4 模块 + 10 方案对比 + 新方法 F1 38.79 + 4 条工程原则](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-modular-framework.md) — 四组件统一框架
- [Agentic RL 六框架实践地图：从算法到系统的长程智能体训练](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentic-rl-frameworks-practices-long-horizon-wolfe-2026.md) — RL六框架地图
- [Hermes Agent 深度解析（阿里云/飞樰）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-deep-dive.md) — 自进化内外双路径+四维工程7934字rv9全版
- [LLM agent脚手架如何具备自进化能力？——以hermes agent为例](https://github.com/QianJinGuo/wiki-public/blob/main/entities/llm-agent脚手架如何具备自进化能力以hermes-agent为例.md) — Hermes自进化15402字最全版
- [Agent 记忆存储方案深度洞察：6 大流派分歧、Wiki 编译 vs 原始数据之争、Hermes Agent 启示](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-storage-six-schools-wiki-compile-vs-raw-data-debate.md) — 六派之争全版
- [Harness Engineering 综合论述：为什么 2026 年真正重要的是它（含 ECC 开源实现案例）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-paradigm-comprehensive-2026.md) — 综合论述17305字含ECC案例rv9
- [Agent Harness Engineering: A Survey — ETCLOVG Taxonomy](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-engineering-survey-etcvlovg-taxonomy.md) — ETCLOVG分类补充
- [Claude Fable 5 提示词泄漏 — 1585 行 120K 字符的产品运行时控制平面与安全工程启示](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-fable-5-prompt-leak-runtime-control-plane-vibecoder-2026.md) — 1585行控制平面
- AI Memory Architecture: Deep Dive — 29k记忆架构深度
- [Memory in the LLM Era: Modular Architectures and Strategies in a Unified Framework](https://github.com/QianJinGuo/wiki-public/blob/main/entities/memory-in-the-llm-era-iclr2026.md) — 四组件统一框架10658字
- [深度解析 Hermes Agent 如何实现自进化及其 Prompt / Context / Harness 的设计实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-tools-research.md) — Hermes自进化解析

## 工程实践
- [滴滴 IBG 智能客服质检系统：3 管线（意图 86% / 合规 90%+ / VOC）+ 企业 LLM 落地方法论](https://github.com/QianJinGuo/wiki-public/blob/main/entities/didi-ibg-customer-experience-llm-quality-inspection-3-pipelines.md) — 三管线质检14k
- [Qoder Skills 完全指南 + Agent Skill 迭代式编写 — AI 按你的标准执行](https://github.com/QianJinGuo/wiki-public/blob/main/entities/qoder-skills-完全指南从零开始让-ai-按你的标准执行-v2.md) — 菜单菜谱比喻+三级渐进披露18168字rv9全版
- [Hermes Agent 满配 12 层配置完整指南（从裸装到 24h Agent 团队）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-12-layer-full-configuration-guide.md) — 12层满配指南11566字rv9
- [企业级 Skill 8 块最小骨架 + 8 条 checklist 设计规范](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-design-spec-8-block-checklist-winty.md) — 8块骨架checklist设计规范
- [Harness Engineering 综合性指南（ConardLi 系列 · 含 Beautiful Article 实证 + Reacticle 协议）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-comprehensive-guide-conardli.md) — ConardLi六层架构14634字rv9
- [Skill Hub：企业级 AI 经验资产化的关键（组织能力视角）— winty 前端Q 3 篇合集：组织资产 + 质量门禁 4 关 + 生命周期 6 阶段治理](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-hub-organization-asset-winty.md) — Skill组织资产化治理五件事
- [Karpathy CLAUDE.md — 四条行为准则让 AI 编程 Agent 减少结构性失败](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-claude-md-rules.md) — CLAUDE.md四行为准则rv9
- [Claude Code Skills 实战指南 — 发现机制、编写与安全](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-skills-practical-guide-discovery-frontmatter.md) — 发现机制与安全
- [Skill 版本管理五大原则：从越改越差到持续演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-version-management-semantic-versioning-practices-winty.md) — skill语义化版本五原则
- [Chromium AI Coding 开发体系](https://github.com/QianJinGuo/wiki-public/blob/main/entities/chromium-ai-coding-development-system.md) — Chromium AI基建

## 深度分析

### 自进化闭环的架构：三类经验存储的分工与协同

把这套机制的架构摊开看，它本质上是一个"写入—固化—回收"的三段闭环，而闭环的载体被刻意拆成了三种性质不同的存储：

- **Memory（记忆文件）承担"结论层"**：保存稳定事实——用户偏好、环境配置、项目约定。它的访问模式是被动注入，每次会话启动自动进入 System Prompt，Agent 无需任何主动动作即可享用历史经验。这决定了它只适合放"低频变化、高频使用"的信息。
- **Skill（技能库）承担"方法层"**：保存程序性知识——完整的操作流程、踩坑记录、验证过的命令序列。它的访问模式是索引常驻 + 详情按需加载，Agent 先看名称与描述，匹配后才展开全文。这种两级结构本质上是上下文经济学：不是所有经验都值得常驻 Token 预算。
- **Session Search（会话检索）承担"过程层"**：保存原始对话轨迹中的试错细节——失败的假设、关键的报错信息、顿悟的瞬间。它按需召回、LLM 摘要后返回，平时完全不占上下文。

三者协同才构成完整闭环：System Prompt 负责在行为层面"施压"（复杂任务后必须沉淀、发现技能过时必须立即修补），专用工具负责提供写入通道，磁盘存储负责跨会话固化，下次会话的快照加载完成回收。整个设计有一个清醒的前提：**不更新模型权重**。所谓自进化，是显式知识管理而非梯度下降——这与 [Agent Self Improvement Loops](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-self-improvement-loops.md) 中讨论的权重路径形成了鲜明的两条技术路线。更深层的机制拆解可参考 [Hermes Agent Deep Dive](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-deep-dive.md)。

### 持久化与即时性的权衡：为什么写入不立即生效

这套机制里最反直觉的设计是：Agent 在会话中途写入 memory 或修补 skill 后，**当前会话的 System Prompt 并不更新**，新内容要等下次会话启动才以新快照读入。原因在于 Prefix Cache 的保护——System Prompt 是长会话缓存复用的基石，任何中途改动都会使缓存失效，Token 成本近乎翻倍。

这个权衡揭示了自进化系统的一个普遍约束：**学习速度与推理成本天然互斥**。框架的解法是用 `skills_list` 这类实时查询工具作为"逃生舱"——静态快照保证便宜，需要最新状态时主动调一次工具。类似的经济性考量在 [Context Window Economics](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-window-economics.md) 中有系统展开。这也解释了为什么技能采用"索引常驻、全文加载"的两级结构：把 O(所有技能) 的常驻成本压缩到 O(索引)，只为本会话真正用到的技能支付全文成本。

### 经验驱动规则增长的失败模式

让 Agent 自主积累规则是一把双刃剑，至少有四类结构性失败值得警惕：

1. **技能腐化（skill rot）**：环境变了、技能没跟上，过时流程被反复执行。原文那句"得不到维护的技能终将变成累赘隐患"点破了要害——技能不是资产而是负债，除非有维护压力。框架的对策是把修补义务写进 System Prompt（发现过时立即 patch，不等提醒），但这是行为约束而非机制保证，模型可能怠工。
2. **错误经验的固化与复利**：一次偶发成功可能被沉淀为"最佳实践"，之后每次加载都在放大这个错误。与记忆不同，错误规则有复利效应——每会话自动注入，污染所有后续决策。目前框架缺乏"这条规则是否真的更好"的自动回归验证。
3. **记忆投毒（prompt injection 持久化）**：攻击者诱导 Agent 把恶意指令写入 MEMORY.md，下次会话即被注入 System Prompt，形成持久化后门。框架用正则威胁模式在写入前扫描拦截（如 "ignore previous instructions" 一类模式），这是必要的写入侧防线，但正则对抗注入变形的覆盖能力终究有限。攻防面的系统讨论见 [Agent Security Attack Defense](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-attack-defense.md)。
4. **经验碎片化与重复**：多个会话各自沉淀相似技能，命名不一、内容重叠，索引膨胀后反而增加检索负担。没有 curator 角色做去重合并，技能库会趋向熵增——SkillOS 一类工作（见 [Skill Os Learning Skill Curation Self Evolving Agents](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-os-learning-skill-curation-self-evolving-agents.md)）正是针对这个环节引入策展机制。

### 一条学到的规则是否真的有用：评估视角

判断一条沉淀的经验是否真正产生价值，可以从四个维度构建检验清单：

- **复用频率**：这条规则在后续会话中被加载/遵循的次数。零复用的沉淀是纯成本（索引 Token + 维护义务），应考虑清理。
- **错误代价**：规则错误时的破坏半径。Memory 中的错误事实误导单次决策，Skill 中的错误流程被"严格遵循"会系统性放大——两者的验证严格度应当不同。
- **可验证性**：好的程序性技能包含可执行的验证步骤（命令能跑通、输出能核对）；含糊其辞的"经验"（如"这个库不太好使"）无法证伪，价值存疑。
- **来源可信度**：是用户显式纠正（"remember this"）、还是模型自行总结？显式纠正的信息可信度远高于模型归纳。

这套评估视角目前仍靠人肉 review，框架内没有内置的规则级回归测试。这指向自进化系统的下一层缺失：**元认知层**——不仅要积累经验，还要评估经验的置信度、淘汰失效经验。这与 [Agent Memory Storage Six Schools Wiki Compile Vs Raw Data Debate](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-storage-six-schools-wiki-compile-vs-raw-data-debate.md) 中"Wiki 编译 vs 原始数据"之争呼应：编译（沉淀为规则）有损但高效，保留原始轨迹（session search）则提供回溯与纠错的原材料，两者是互补而非互斥。

## 实践启示

1. **行为引导与机制缺一不可**：仅有 memory/skill 工具不会产生自进化——原文的核心做法是把"何时沉淀、何时修补"明确写进 System Prompt 并设定量化触发条件（5 次以上工具调用的复杂任务必沉淀）。设计自己的 Agent 时，先问"提示词是否给了模型足够的沉淀动机"，再谈存储设计。
2. **把维护义务前置到使用时刻**：过时技能最廉价的修复时机是"正在使用它且发现不对"的当下。在提示词中要求"加载技能时发现问题立即 patch，不等他人提醒"，让每次使用都成为一次质量巡检，而不是等定期清理。
3. **写入通道必须设防**：所有进入持久化存储的内容（MEMORY.md / USER.md / SKILL.md）都应经过注入模式扫描——记忆文件会被自动注入 System Prompt，等于给攻击者一个持久化注入通道。宁可误拦，不可漏放。
4. **按内容的访问模式选存储，不要单一存储**：结论进 memory（被动注入）、流程进 skill（按需加载）、原始试错进会话检索（FTS5 全文索引 + LLM 摘要召回）。混用一种存储会导致要么上下文爆炸、要么经验丢失。记忆架构的分层思路可延伸阅读 [Agent Memory Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-architecture.md)。
5. **为模型封装专用工具，而不是让它用通用工具凑合**：`skill_manage` 把 create/patch/delete 等 6 种能力收敛到一个调度入口，降低了调用出错率、也提高了模型主动沉淀的意愿。这与"用 shell 命令拼一条长替换指令"的对比说明：工具设计的粒度直接影响 Agent 行为可靠性（参见 [Agent Harness Engineering Paradigm](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-harness-engineering-paradigm.md) 中工具层设计的讨论）。

---

