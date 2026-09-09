# Ch02 提示词工程与上下文工程

> 与 AI 高效对话的科学与艺术：Prompt、CoT、Context Engineering

> 本章收录 **26 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐ 入门 | 零基础可读 | 6 |
| ⭐⭐ 工程师 | 需编程基础 | 3 |
| ⭐⭐⭐ 专家 | 需ML基础 | 8 |
| ⭐⭐⭐⭐ 科学家 | 需研究背景 | 5 |
| ⭐⭐⭐⭐⭐ 大师 | 前沿/哲学 | 4 |

---

## 导读

一个精心设计的提示词，可以让同一个模型的表现相差 10 倍。

本章从最基础的 Prompt 写法开始：如何给模型足够的上下文、如何用 Few-shot 示例引导输出格式、如何用 Chain-of-Thought 让模型"展示推理过程"。然后进入更高阶的 Context Engineering——不是"写更好的提示词"，而是"设计更好的信息环境"。

你会看到 Hermes Agent 的 Prompt 调试器如何做 A/B 对比，Codex 的上下文工程如何用 Append-only 策略管理信息流，以及为什么 Karpathy 说"未来的工程师不是写代码，而是设计上下文"。

这是从"会用 AI"到"用好 AI"的关键跳板。

---

## Ch02.001 Hermes Agent 自进化机制源码解析

> 📊 Level ⭐ | 5.3KB | `entities/hermes-agent-self-evolving.md`

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
- [AI Memory Architecture: Deep Dive](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-memory-architecture-deep-dive.md) — 29k记忆架构深度
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

---

## Ch02.002 Agent Skill 编写指南

> 📊 Level ⭐ | 4.7KB | `entities/agent-skill-writing.md`

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

## 延伸导航
- [评测体系与基准测试扩展](https://github.com/QianJinGuo/wiki-public/blob/main/moc/evaluation-benchmarks-extended.md)

---

## Ch02.003 Claude Code Prompt 与上下文 Harness 设计

> 📊 Level ⭐ | 4.6KB | `entities/claude-code-prompt-context-harness.md`

> 本页原内容在 2026-09-07 质量闭环中判定为 **dup-0.8**，已按导航页（MOC）重建；
> 原文备份见 `_archive/hub-rewrite-2026-09-07/claude-code-prompt-context-harness.md`，一手来源仍见下方 sources。

## 机制与论文
- [AgentScope Java Harness Framework 2.0 — 企业级 Agent 分布式场景的 Harness 实现 (Java 2.0 重大升级)](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentscope-java-harness-framework-enterprise-distributed.md) — AgentScope Java全版
- [晓斌：从 People-Oriented 到 Agent-Oriented Infra —— 意图驱动 + 代码沉淀的进化体](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-oriented-infra-intent-driven-code-sedimentation.md) — Agent-Oriented Infra长文
- [Coding Harness 工程本质：从 Pi 到 OpenClaw](https://github.com/QianJinGuo/wiki-public/blob/main/entities/pi-openclaw-coding-harness.md) — Harness八能力+五工程模式：Context像投影8441字rv9
- [Anthropic N-days: Frontier Agent Vulnerability Research](ch04/315-anthropic-n-days-frontier-agent-vulnerability-research.html) — N-day研究
- [一篇看懂 Agent Harness 的结构！ — 12组件+7决策完整框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-12-components-7-decisions.md) — harness 12组件框架
- [深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-prompt-context-harness.md) — 三维度源码：23模块拼装+自适应分块+双层Memory
- [GLM-5.2 is the step change for open agents](https://github.com/QianJinGuo/wiki-public/blob/main/entities/glm-52-is-the-step-change-for-open-agents.md) — Interconnects评GLM-5.2开放Agent跃迁
- [Agent Harness 解析：智能体架构深度拆解](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-architecture-deep-dive-aksahy.md) — harness解剖深度
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](https://github.com/QianJinGuo/wiki-public/blob/main/entities/深入理解-claude-code-源码中的-agent-harness-构建之道.md) — 16095字源码8步循环
- [从 Prompt 到 Harness：Claude 官方学习资料](https://github.com/QianJinGuo/wiki-public/blob/main/entities/from-prompt-to-harness-claude-official.md) — Harness五子系统闭环解读
- [原始文章存档](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-search-architecture-tencent-2026.md) — ripgrep五层过滤
- [Claude Opus 4.7 并不是一次全面升级，甚至部分能力大幅衰退](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-opus-47.md) — 4.7衰退面分析
- [复旦北大 AHE：Agentic Harness Engineering 瓶颈分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/fudan-peking-ahe-agentic-harness-engineering.md) — AHE三支柱可观测性5622字深析版
- [Claude Code and What Comes Next](ch01/257-claude-code-and-what-comes-next.html) — 压缩/Skills/Subagents

## 工程实践
- [Tencent Vibe Coding to Agentic Engineering Backend](ch04/306-tencent-vibe-coding-to-agentic-engineering-backend.html) — 全流程串终端会话实践
- [高德广告工程 Harness/SDD 体系演进：从\](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gaode-sdd-harness-team-ai-coding-paradigm-ibjfu.md) — SDD+Harness团队级范式11119字
- [Build a serverless image editing agent with Amazon Bedrock AgentCore harness](ch05/012-build-a-serverless-image-editing-agent-with-amazon-bedrock-a.html) — 图像编辑agent
- [AWS Bedrock Agentcore Quality Optimization Flywheel](ch11/099-aws-bedrock-agentcore-quality-optimization-flywheel.html) — 质量飞轮
- [AI 生产开发工作流：OpenSpec 规范驱动 + Superpowers 工具链](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-production-development-workflow-openspec-superpowers-gstack.md) — 三件套工作流
- [2 小时，0 行手写代码，我用 Claude 做了一个生产级 VSCode 插件](https://github.com/QianJinGuo/wiki-public/blob/main/entities/2-小时0-行手写代码我用-claude-做了一个生产级-vscode-插件.md) — 实践复盘有具体经验教训
- [Claude Code 上下文工程 —— Anthropic 团队的工程实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-context-engineering-anthropic-thariq.md) — 上下文工程官方表述
- [Anthropic Managed Agents：用 K8s 思路虚拟化 Agent 组件](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-managed-agents-scaling.md) — 宠物到牛群
- [长周期-agent-详解-从-ralph-loop-到可接管-harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/长周期-agent-详解-从-ralph-loop-到可接管-harness.md) — Ralph loop到接管harness
- [从零复刻 Claude Code：Harness 构建学习笔记](https://github.com/QianJinGuo/wiki-public/blob/main/entities/准备开一个新坑从零复刻一个-claude-codenn目标是在这个过程中和大家一起学习-claude-code-的-harness-是如何做的nnclaude-.md) — easy-agent复刻路线图

## 延伸导航
- [Agent 工程全景指南](https://github.com/QianJinGuo/wiki-public/blob/main/moc/agent-engineering-guide.md)

---

## Ch02.004 Skills 重新定义 Agent 喂知识：从'提前给'到'按需取'的范式反转

> 📊 Level ⭐ | 4.5KB | `entities/skills-redefine-agent-knowledge-allen-tang-2026.md`

## 核心概述

本文梳理了给 Agent 喂知识的四种方法进化线（Prompt → RAG → CLAUDE.md → Skills），指出前三种的共同死穴是"提前给"，而 Skills 的颠覆在于"按需取"——通过渐进式披露（Progressive Disclosure）三层机制，让知识可以无限积累却始终只有当下需要的那一点出现在模型眼前。Skills 不是一份 markdown，而是可执行的能力。

→ [原文存档](https://mp.weixin.qq.com/s/fuhenGVN36CHTvj3LW_D_Q)

## 四种喂法进化线

| 喂法 | 核心机制 | 关键缺陷 |
|------|----------|----------|
| **Prompt** | 当场说 | 一次性，说完就忘 |
| **RAG** | 提前存进知识库，用时检索 | 得提前猜要用什么，存多存少都出问题 |
| **CLAUDE.md** | 每次自动注入 | 越堆越长，噪音淹没关键内容 |
| **Skills** | 按需取，渐进式披露 | 无（范式反转） |

前三种的共同死穴：**都是"提前给"**——Prompt 当场提前说，RAG 提前存进库，CLAUDE.md 提前写好每次灌。都预设你得在 AI 干活前准备好知识，但"提前"本身就是原罪。

## ETH Zurich 实证（2026-02）

机器生成的 CLAUDE.md 类上下文文件使任务成功率**降低约 3%**，人精心写的也只**提升约 4%**，且无论哪种都让推理成本**涨 20% 以上**。原因：无差别灌入大量模型"本来就知道"的内容，等于往上下文灌噪音。

## 渐进式披露三层机制

1. **目录层**：每个 skill 一行简介（~80 token），系统启动时只加载所有 skill 的目录。17 个官方 skill 全部目录才一千多 token。
2. **正文层**：任务匹配到某个 skill 时才加载完整正文，其他 skill 一字不进。
3. **参考文件层**：正文中引用的更深细节，只有真的需要时才单独加载。

**装一百个 skill 也不会互相干扰**——没用上的 skill 压根不占上下文。

## Skills ≠ markdown：可执行的能力

一个 skill 是一个文件夹，里面能装可执行代码。Anthropic 的 docx skill 除了说明还塞了脚本（"必须显式设置纸张大小""绝不用 unicode 字符当项目符号"等踩坑经验）。

关键：脚本和数据**全程不进入上下文**，只有结果进。把确定性操作从"模型用脑子硬想"卸载成"运行一段代码"——更可靠，几乎不占脑容量。

**纯 markdown = 文字描述的知识（占上下文）；Skill = 可执行的能力（不占上下文）。**

## 决策规则

> 背景知识（项目是什么、有哪些资料）→ Projects / CLAUDE.md
> 做事的本事（代码审查流程、文档规范）→ Skill

Anthropic 重新定义的不是"知识的格式"，是**"知识被调用的时机"**。

## 关联

- [Claude Code 大型代码库 Harness 配置](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-large-codebase-harness-configuration.md) — Skills 作为 Harness 五扩展点之一，渐进式披露的工程视角
- [Anthropic Knowledge Work Plugins 分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/knowledge-work-plugins-anthropic-source-analysis.md) — 3 级渐进式披露的详细技术分析
- [Claude Code 为什么会忽略指令](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-why-instructions-ignored-jia-gou-x-2026.md) — CLAUDE.md 越写越糟的诊断，本文给出 Skills 作为解法
- [Claude Code 七种自定义方法](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-seven-customization-methods-anthropic-official.md) — Skills 在七种方法中的定位
- [CLAUDE.md 12 条规则](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-md-12-rules-mnilax-cf2019.md) — CLAUDE.md 喂法的代表，本文指出其局限

---

## Ch02.005 Enrich your datasets with business context

> 📊 Level ⭐ | 4.0KB | `entities/enrich-your-datasets-with-business-context-migrating-from-le.md`

# Enrich your datasets with business context: Migrating from legacy Topics to semantic datasets in Amazon Quick

→ [原文存档](https://aws.amazon.com/blogs/machine-learning/enrich-your-datasets-with-business-context-migrating-from-legacy-topics-to-semantic-datasets-in-amazon-quick)

## Enrich your datasets with business context: Migrating from legacy Topics to semantic datasets in Amazon Quick

If you’ve been managing [Amazon Quick](<https://aws.amazon.com/quick/>) legacy Topics alongside your datasets, you know the challenge: two assets that must stay perfectly synchronized, each with its own permissions, lineage, and versioning. Column synonyms drift. Calculated fields diverge. A rename in the dataset breaks the Legacy Topic silently. You can now use Amazon Quick to embed that business context directly into the dataset itself through **Dataset Enrichment** in the new data prep experience. Column descriptions, synonyms, calculated fields, custom instructions, and business rules all live alongside the data. Dataset Enrichment bakes business context directly into the dataset. Everything (permissions, semantics, AI context) travels with the data and is automatically inherited by anything built on top of it. One asset, one source of truth, one place to govern.

In this post, we walk through what Dataset Enrichment is, how it differs from legacy Topics, and provide three migration scenarios with step-by-step guidance so you can move your business context into the dataset layer with confidence.

**Topic** is now the [multi-dataset](<https://aws.amazon.com/blogs/machine-learning/build-a-unified-semantic-layer-across-datasets-with-multi-dataset-topics-in-amazon-quick/>) semantic and reasoning layer, the construct where multiple datasets are composed, relationships are defined, business metrics are authored, and business terminology is mapped. Rather than introducing a net-new construct, we are re-purposing Topic to fulfill this role more completely. Moving dataset-intrinsic semantics down to where they belong, and elevating Topic to own the cross-dataset relationships, metrics, and business terminology that it was always meant to carry. This isn’t a cosmetic change. It establishes a clean, forward-looking architecture that supports both deterministic BI workflows and flexible AI-driven analytics from a shared semantic foundation. It also sets up the framework for catalog integration.

### What is Topics (legacy)

Legacy Topics provided the initial approach to adding business context to datasets in Amazon Quick Sight. It stored column synonyms, calculated fields, named entities, filters, and custom instructions in a separate object that sat on top of the dataset, linked but independently managed. Going forward, we classify existing Topics as legacy. The new version of Topics is being elevated to a _multi-dataset semantic layer_**.** A single-entry point for cross-dataset Q&A that lets business users and AI workflows query across multiple enriched datasets in one conversation. Dataset Enrichment is the foundation that makes this possible: each dataset must carry its own semantic context before Topics can unify them at a higher level.

### Key differences: Topics (legacy) vs. Dataset Enrichment (new data prep)

| **Legacy Topics** |

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

## Ch02.006 AE 到可运行代码：大淘宝 AI 动画全链路方案（实践篇）

> 📊 Level ⭐ | 3.7KB | `entities/taobao-ae-to-code-animation-practice-2026.md`

## 核心概述

淘天集团营销&交易技术团队落地的全链路方案：将传统动画交付流程从「AE → Lottie/视频 → 前端手写代码」简化为「AE 插件直出代码」，通过 AE 插件 + 工程代码生成 + Cursor Skill AI 集成，打通从视觉表达到可执行代码的完整链路。单次开发耗时从 2-4 小时压缩至 15-30 分钟，还原度从 70-80% 提升至 95%+。

→ [原文存档](https://mp.weixin.qq.com/s/4I7DWStQU0uVB6llzeJ1tw)

## 问题：设计与工程的结构性鸿沟

传统动画交付的核心矛盾是**设计侧视觉表达与工程侧代码实现之间的结构性鸿沟**。现有两条路线都走不通：

| 路线 | 缺陷 |
|------|------|
| 纯手写 DOM 动画 | 还原度差、2-4h/个、动画与业务耦合 |
| Lottie 播放 | 体积大（复杂动画破百 KB）、交互受限（静态播放） |

问题不在实现方式，而在**交付形式本身**——需要让设计师交付可运行代码而非动画文件。

## 方案：三段式全链路

### 设计师侧（AE 插件）
1. AE 动画制作 + 规范检查（遮罩图层一致性、图层遮挡检查）
2. 一键转码：AE 工程 → 代码生成 → byte 预览 → 动画代码链接
3. 实时预览闭环：在 AE 中直接看到代码渲染效果，问题前置发现

### 开发侧（Cursor Skill）
1. 打开动画链接，可视化筛选导出（多段拆分、剔除干扰元素）
2. CSS / Anime.js 双格式代码输出
3. Cursor Animation Integration Skill 智能集成

### AI 集成策略
- **DOM 优先**：以现有业务 DOM 为基础，映射动画节点（业务 DOM 已存在时）
- **动画优先**：以动画代码为基础，扩展业务逻辑（设计稿与业务 UI 差异大时）

AI 的核心价值在于集成环节——需同时理解动画结构和业务 DOM 现状，判断节点映射关系，决定合并策略。**这个过程无法规则化，是整条链路中最适合交给大模型的部分**。建议使用 opus 4.6 模型。

## 效率数据

| 指标 | 传统 | 新方案 |
|------|------|--------|
| 单次开发耗时 | 2-4 小时 | 15-30 分钟 |
| 还原度 | 70-80% | 95%+ |

已验证场景：淘宝秒杀砸金蛋、一元购动画等。

## 缺口与演进：Clip 分层产物

**当前缺口**：多模块串联动画（如红包飞入→抖动→用户点击→砍价→价格变化），串联关系只存在于设计稿和开发认知里。

**Clip 分层方案**：将"完整组件"改为同时产出"完整组件 + clips/"，每个 clip 只负责"动"不感知业务，串联编排逻辑收敛在胶水层。AI 辅助长段动画智能分段 + 自动生成 Cursor Prompt。

## 关联

- [淘宝动效解决方案分享](https://github.com/QianJinGuo/wiki-public/blob/main/entities/淘宝动效解决方案分享.md) — 同团队早期平台级方案（Lottie → Anime.js、MCP 协议、跨端 Player），本篇是实践落地篇

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

## Ch02.007 AINMM：存量生产级工程向 AI Native 演进的五级成熟度模型

> 📊 Level ⭐⭐ | 5.9KB | `entities/ainmm-ai-native-maturity-model.md`

> 大淘宝技术（供给技术团队·木直）提出的 AI Native 能力成熟度模型，借鉴 CMMI 思想，定义了 5 个成熟度等级（ML1-ML5）和 5 大过程域，配套 AI Native Evolution Kit 工具，通过挽单系统实践验证。

## 核心命题

行业存在结构性矛盾：AI 代码产出能力快速提升，但端到端交付效率未同步增长。Sonar 报告 42% 新增代码由 AI 生成，GitClear 发现代码搅动率翻倍、重复代码增长 4x，OpenAI 将此定义为 Harness Gap。AINMM 的目标是把模糊感知变成可测量、可比较、可指导的工程框架。

## 五大过程域（PA1-PA5）

| 过程域 | 对应 Harness 层 | 核心内容 |
|--------|----------------|---------|
| PA1 上下文工程 | Context Layer | 建立 AI 能理解的"项目语义层"——AGENTS.md 做地图，docs/ 做手册 |
| PA2 能力封装 | Capability Layer | 高频操作封装为标准化 Skill（SKILL.md），行为可预测可复制 |
| PA3 验证回路 | Verification Layer | 自动化门禁 Gate 1-4（编译→架构→单元测试→集成测试+E2E） |
| PA4 协作契约 | Collaboration Layer | Design by Contract + 置信度路由（4 级分流）+ 8 阶段 SOP + 偏航检测 |
| PA5 自进化 | Evolution Layer | 经验沉淀→主动优化→量化管理→跨项目复制 |

## 五级成熟度定义

| 等级 | 名称 | 核心特征 | 五维度基准分 | 总分范围 |
|------|------|---------|------------|---------|
| ML1 | 已感知级（Aware） | AGENTS.md 就位，AI 认识项目 | D1≥8 | 8-16 |
| ML2 | 已管理级（Managed） | Skill 封装+基础门禁，AI 可预测 | D1≥12,D2≥8,D3≥8 | 32-44 |
| ML3 | 已定义级（Defined） | 契约式协作+置信度路由，组织标准流程 | D1≥16,D2≥12,D3≥12,D4≥10 | 50-64 |
| ML4 | 已量化级（Quantitatively Managed） | 数据驱动+受控进化+Critic Agent | D1≥18,D2≥16,D3≥16,D4≥12,D5≥8 | 70-85 |
| ML5 | 持续优化级（Optimizing） | 进化可遗传，AI Native 成为组织资产 | D1≥18,D2≥18,D3≥18,D4≥16,D5≥16 | 86-100 |

等级判定需同时满足两个条件：(1) 各维度得分达到最低分阈值；(2) 该等级关键过程域特定目标（SG）全部达成。

## 评估方法：AINA 框架

五维度独立评分（每维 0-20 分），采用 AINA（AI Native Assessment）方法，包含三类评估：AINA-C（自动快照）、AINA-P（计划评估）、AINA-S（持续监控）。同时支持阶段式表示法（整体等级）和雷达图式表示法（五维度评分）。

## 提升路径

| 路径 | 核心行动 | 方法 |
|------|---------|------|
| ML1 起点 | Context Day | 建立 AGENTS.md + docs/ + 信息分级 |
| ML1→ML2 | Skill Sprint + Gate Sprint | 封装高频 Skill + 建立 Gate 1-2 + MEMORY.md |
| ML2→ML3 | Contract Sprint | 契约式设计 + 置信度路由 + 8 阶段 SOP + Gate 1-4 |
| ML3→ML4 | Metrics Sprint + Evolution Sprint | 指标基线 + Critic Agent + 进化元约束 |
| ML4→ML5 | Ecosystem Sprint | Evolution Kit + 跨项目复制 + 虚拟 Monorepo |

## 实践案例

挽单系统（淘天内部存量 Java 生产系统，千余文件、微服务、跨多端）作为 AINMM 的"孵化器"，采用**双循环方法论**：

- **内层循环**（工程演进）：评估 → 识别短板 → 定向改造 → 验证效果 → 再评估
- **外层循环**（框架沉淀）：实践 → 模式提炼 → 通用化 → AINMM 定义 → 反哺实践

实战结果：AINA 初始评估 30 分（ML1）→ 改造后 48 分（ML2）。识别的真实缺口包括子工程 Monorepo 策略、电商全自动测试链路、线上数据回流闭环。

## 与 CMMI 的关系

AINMM 继承 CMMI 的"逐级递进、每级是下一级基础"原则——ML1 是 ML2 的基础，不存在跳级捷径。保持相同五级结构，但特化到 AI Native 研发范式，评估"AI 参与的深度和工程化程度"。

## 设计哲学

1. **Harness 比 Agent 更重要**——评估不是"用了多先进的模型"，而是"为 AI 搭建了多完善的工作环境"
2. **信任是可以工程化的**——通过上下文、封装、验证、契约、进化机制分级释放信任
3. **成熟度是渐进式螺旋上升**——从 AGENTS.md 开始就是一个有价值的起点

## 关联

- [Harness Engineering](ch05/061-harness-engineering.html) — AINMM 的过程域对应 Harness 五层架构
- [高德 Harness/SDD 演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gaode-sdd-harness-team-ai-coding-paradigm-ibjfu.md) — 另一家团队 AI Native 团队级实践
- [Agent 作为 Software 3.0 基础设施](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-as-software-3-0-substrate.md) — AI Native 的范式基础
- [AI Agent 评测 5 维体系](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-coding-practice-agent-evaluation-five-dimension-three-level-gating.md) — 评估维度的互补框架
- [Vibe Coding vs Agentic Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/comparisons/vibe-coding-vs-agentic-engineering.md) — 工程成熟度背景

→ [原文存档](https://mp.weixin.qq.com/s/VBbr0jqHSQQn1W-iwRuG8g)

---

## Ch02.008 新程Alpha认知模型：4B参数端侧部署，群体智能以小搏大比肩GPT-5.4

> 📊 Level ⭐⭐ | 5.5KB | `entities/nextie-alpha-cognitive-model-4b-on-device.md`

> 原文存档：[原文存档](https://mp.weixin.qq.com/s/ypRly7nJcT3sKkvEI46OLw)

# 新程Alpha认知模型：4B参数端侧部署，群体智能以小搏大比肩GPT-5.4

Nextie（明日新程）推出行业首个认知模型「新程Alpha」——仅4B参数，端侧可部署，在群体智能任务上效果比肩GPT-5.4等千亿参数模型。核心思路：解耦知识与认知，凝练认知核心，强化泛化和抽象能力。

## 认知模型范式：知识≠智能

卡帕西判断"推理模型要变天"——仅需10亿参数就能构建优秀的认知核心（剥离事实记忆、只保留思考算法）。传统推理模型陷入Scaling困境：参数越大≠越聪明，反而在逻辑陷阱上频频翻车。核心转变：从"拥有知识"到"运用知识"，从"在已有知识中找答案"到"自主思考+跨域泛化"。

## 技术路线：220年学术论文+RL强化

- 梳理1800-2020年跨越220年的人类学术论文，归纳群体智能演化脉络
- 提出群体智能五维评估：视角完备性、隐含诉求满足度、辩证深度、落地实操性、决策可解释性
- 在开源推理模型上做强化学习，解耦知识与认知，训练目标=泛化+抽象
- 4B参数=黄金尺寸：大到承载思考算法，小到MacBook/具身智能端侧部署

## 三层范式转移

1. **Harness多智能体质量提升**：认知模型为Agent提供统一规划推演，多Agent从并行→协同思考
2. **算力成本断崖下降**：4B端侧运行，从烧显卡→交电费，日常场景首次经济可行
3. **Proactive场景解锁**：7×24低成本运行，Agent从Reactive→不间断自主规划执行

## 团队：小冰原班人马

- **李笛**（CEO）：小冰之父、微软亚洲工程院前常务副院长
- **曾敏**：小冰联合创始人、微软前首席研发总监
- **王文斓**：小冰前大模型与算法负责人、英特尔前架构师
- 技术传承：小冰链X-CoTA（GPT-3 2%参数实现透明思维链）→ rinna 3.6B击败Llama 65B → 新程Alpha
- 融资：天使轮创新工场+Atypical Ventures联合领投，奇绩创坛跟投；李开复+陆奇押注

### 认知模型 vs 知识型推理模型：架构分叉点

新程Alpha的核心创新不在参数规模而在**训练范式**——用RL在开源推理模型上强化"如何思考"而非"记住什么"。这与Karpathy的"认知核心"论高度吻合：1B参数足以承载推理算法，剩余参数主要承载事实记忆。4B的"黄金尺寸"选择暗示：认知核心≈1B + 少量领域适配≈3B，恰好卡在端侧部署阈值。

### 群体智能五维评估框架的工程价值

五维评估（视角完备性/隐含诉求满足度/辩证深度/落地实操性/决策可解释性）实际上提供了一个**Harness多智能体系统的质量门控标准**——传统多Agent系统缺乏统一的决策质量度量，导致输出一致性差。这五个维度可以直接映射为Harness的验收条件，是"认知模型+群体智能"落地的关键桥梁。

### 小参数路线的历史验证

3.6B rinna击败65B Llama（20倍参数差）+ 新程Alpha 4B比肩GPT-5.4，两次验证了"小参数+高质量架构"路线的可行性。这呼应了DeepSeek-V4的MoE稀疏架构思路——不是参数越多越好，而是**参数用在正确的认知功能上**。

### Proactive Agent的经济可行性突破

Proactive Agent长期受限于推理成本——7×24运行千亿参数模型的Token费用不可承受。4B端侧模型将单次推理成本压到"几格电池"，这是**从实验室概念到产品化**的关键拐点。具身智能（家庭机器人）是最直接受益场景。

## 相关实体

- [Agent Harness Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-architecture.md)
- [Agent Self-Improvement](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-self-improvement-six-mechanisms.md)
- [Agentic AI System Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentic-ai-system-architecture-harness-skill-mcp.md)

→ [原文存档](https://mp.weixin.qq.com/s/ypRly7nJcT3sKkvEI46OLw)

---

## Ch02.009 AI 导购在 vivo 官网的落地实践

> 📊 Level ⭐⭐ | 5.2KB | `entities/vivo-ai-sales-guide-ecommerce-agent.md`

> -> [原文存档](https://mp.weixin.qq.com/s/ureOXhYFIJrUlZdL9JvEFQ)

# vivo AI 导购落地实践

## 一句话

vivo 团队在官网 APP 落地 AI 导购 agent：FastText 小模型做意图分类（10ms）+ RAG 知识库 + 双智能体（参数解读/商品推荐）+ 结构化输出，首字符 2.5s 内。

## 架构亮点

- **FastText 意图分类**：CPU 推理 10ms，解决率高
- **推荐思路**：将手机列表随 Prompt 给大模型，而非人工打标签规则——兼容开放性用户问题
- **结构化输出关键设计**：推荐场景要求模型第一句直接给出手机名 → 才能立刻请求商品接口
- **安全兜底**：内容审核接入蓝心运营平台

## 效果

- 首字符响应速度 2.5s 内
- AB 实验对 GMV 和解决率正向贡献

## 一句话

FastText + RAG + 结构化输出 = 垂直电商 AI 导购 agent 的生产级工程实现。

## 深度分析

vivo AI 导购项目的核心工程价值在于**小模型 + 大模型协同**的分层架构设计。FastText 作为轻量级意图分类器（10ms CPU 推理）解决了电商场景中用户Query的快速分发问题，相比直接让大模型判断意图，大幅降低了推理延迟和成本。

**意图分类器的选型思考**：FastText 的优势在于速度快、资源占用低，适合对延迟敏感的电商场景。但其局限在于仅能做两分类（参数解读/商品推荐），无法处理更复杂的意图。这暗示在实际系统中，意图分类只需做到"足够好"即可驱动下游路由，真正的理解仍交给大模型。

**商品推荐策略的创新点**：传统电商推荐依赖人工规则或标签体系，而 vivo 选择将手机列表直接作为 Prompt 上下文输入给大模型。这一设计利用了大模型的理解和推理能力，使其能够根据用户问题动态匹配商品，而非依赖预设的标签关联。这种"模型自己找答案"的思路在开放性用户问题上有明显优势。

**结构化输出的工程链路**：推荐场景要求模型第一句话直接输出手机名称，这是关键的前置约束——只有拿到商品名才能调用商品接口获取价格、图片等信息。这体现了 AI 应用开发中的"接口驱动设计"思维：先确定需要调用的外部接口，再以此约束模型的输出格式。

**安全架构的三层防护**：模型控制层 + 边界关键字转人工 + 蓝心运营平台内容审核，形成纵深防御。1.6W 条安全测试语料说明安全投入的规模，这对生产系统非常重要。

## 实践启示

1. **分层架构优先**：用小模型处理简单任务（意图分类、路由），大模型专注生成。可显著降低延迟和成本。
2. **接口驱动Prompt设计**：先明确需要调用的外部接口，再反向设计Prompt约束，确保模型输出能被系统解析和使用。
3. **结构化输出的价值**：流式输出 + 商品卡片 + 相关帖子组合，既满足即时性需求，又提供完整信息。
4. **安全投入不可忽视**：1.6W 条测试语料 + 三层防护是生产级别的安全基线。
5. **AB 实验验证价值**：GMV 和解决率的双重正向贡献是 AI 导购项目成功的核心指标。

## 相关实体
- [Harness Engineering耗时一周我是如何将应用的Ai Coding率提升至90的](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering耗时一周我是如何将应用的ai-coding率提升至90的.md)
- [Wangyunhe Harness Optimization Agentsoul](https://github.com/QianJinGuo/wiki-public/blob/main/entities/wangyunhe-harness-optimization-agentsoul.md)
- [Claude Code开发负责人 为何放弃Rag而选择Agentic Search](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code开发负责人-为何放弃rag而选择agentic-search.md)
- [Integrate Atlassian Confluence Cloud With Amazon Quick](https://github.com/QianJinGuo/wiki-public/blob/main/entities/integrate-atlassian-confluence-cloud-with-amazon-quick.md)
- [Rag Vs Llm Wiki Enterprise Knowledge Base](https://github.com/QianJinGuo/wiki-public/blob/main/entities/rag-vs-llm-wiki-enterprise-knowledge-base.md)

→ [原文存档](https://mp.weixin.qq.com/s/ureOXhYFIJrUlZdL9JvEFQ)
- [电商 ai 操作系统崛起：从「工具人」到「all in one」+ 行业 knowhow skill 化 + 5 巨头](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ecommerce-ai-os-all-in-one-storeclaw-geek-park-2026.md)

---

## Ch02.010 Using Claude

> 📊 Level ⭐⭐⭐ | 18.4KB | `entities/claude-code-html-artifacts.md`

# Using Claude Code: The unreasonable effectiveness of HTML

> 来源：[原文存档](https://claude.com/blog/using-claude-code-the-unreasonable-effectiveness-of-html)

## 概述

HTML Artifacts 是 [Claude Code](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-architecture.md) 中一种强大的输出形式，它使 Agent 能够生成富交互式的 HTML 文档，显著超越传统 Markdown 的表达能力。

## 为什么选择 HTML 而非 Markdown

传统的 Markdown 在处理复杂信息时存在明显局限——它只能表达简单的文档结构（标题、列表、代码块），而无法承载更丰富的信息形态。相比之下，HTML 可以：

- 使用 `<table>` 表达结构化数据
- 使用 CSS 描述设计规范
- 使用 SVG 绘制插图和图表
- 使用 `<script>` 嵌入代码片段
- 结合 JavaScript + CSS 实现交互组件
- 使用 SVG + HTML 描述工作流
- 使用绝对定位和 Canvas 处理空间数据
- 使用 `<img>` 标签嵌入图像

这种信息密度使 Claude 能够高效地向用户传达深度信息。在无法使用 HTML 的场景下，模型往往被迫采用低效的 Markdown 变通方案，如 ASCII 图表或使用 Unicode 字符估算颜色。

## 核心优势

### 信息密度

HTML 的表达能力几乎涵盖了 Claude 能够读取的所有信息类型，这使其成为模型与用户之间高效沟通的媒介。

### 视觉清晰度与可读性

随着 Claude Code 处理的任务复杂度提升，它生成的规格文档和计划也越来越大。研究表明，审阅者通常不会仔细阅读超过 100 行的 Markdown 文件。

HTML 文档则不同——Claude 可以通过以下方式优化视觉组织：

- 使用 Tabs 组织结构化内容
- 嵌入 SVG 插图辅助理解
- 添加内部链接便于导航
- 实现移动端响应式布局

### 易于分享

Markdown 文件在浏览器中通常无法原生渲染，需要作为附件发送。而 HTML 文件可以直接上传分享，同事可以在任何环境下轻松打开和引用。这大大提升了技术文档、PR 描述和报告的实际阅读率。

### 双向交互

HTML 文档支持用户与 Claude 创建的内容进行交互。例如，可以要求 Claude 添加滑块或旋钮来调整设计参数，或允许用户调整算法选项并实时预览效果。

这种交互能力使用户能够：

- 创建针对特定问题的编辑环境
- 通过 UI 调整参数并复制回 prompt
- 实现比纯文本更精确的需求表达

### 数据摄取

Claude Code 相比 Claude.ai 或 Claude Design 的最大优势之一是其强大的上下文摄取能力。在撰写本文时，作者让 Claude Code 扫描整个代码目录，查找所有生成的 HTML 文件，按类型分组，然后生成包含每种类型图表的 HTML 文件。

此外，Claude Code 还可以通过 MCP（如 Slack、Linear 等）、浏览器插件和 Git 历史来获取额外上下文。

## 快速上手

使用 Claude Code 生成 HTML Artifacts 非常简单——只需提示它"创建一个 HTML 文件"或"创建一个 HTML Artifact"。关键在于明确 Artifact 的用途和预期使用方式。

## 典型使用场景

### 规格文档、规划与探索

HTML 为 Claude 提供了一个丰富的画布来处理复杂问题。对于一个问题的处理流程，作者倾向于创建一个由多个 HTML 文件组成的网络，而非简单的 Markdown 计划。典型工作流包括：

1. 让 Claude Code 头脑风暴并创建不同选项的探索文件
2. 选择一个方向扩展，生成 Mockup 或接口示例
3. 编写详细的实现计划
4. 开启新会话时传入所有文件供实现使用

验证阶段同样可以让 Agent 读取这些文件，获得更全面的上下文。

**适用场景：**

- 代码实现的多种方式探索
- 多视觉设计方案的并行比较

### 代码审查与理解

在 Markdown 中代码难以阅读，但 HTML 可以渲染 Diff、注释注释、流程图和模块图。这使得：

- Agent 编写的代码更容易审查
- PR 的评审流程更高效
- 复杂的代码逻辑更容易解释给他人

### 设计与原型

Claude Design 基于 HTML 构建，因为 HTML 在设计表达上极为强大——即使最终输出不是 HTML。Claude 可以先用 HTML 草绘设计，然后用 React、Swift 等语言实现。

还可以原型化交互效果（如动画、动作），并通过滑块、旋钮等控件进行调优。

**适用场景：**

- 创建设计系统 Artifact
- 调整 UI 组件参数
- 可视化组件库
- 原型化动画效果

### 报告、研究与学习

Claude Code 善于跨多个数据源综合信息并转换为可读报告。可以指示 Claude 搜索 Slack、代码库、Git 历史或互联网，生成易读的 HTML 文档、交互式解释器或幻灯片。

**适用场景：**

- 编写功能摘要
- 生成技术解释文档
- 起草周报
- 编写事故报告
- 生成 SVG 插图、流程图和技术图表

### 自定义编辑界面

当难以用纯文本框描述需求时，可以要求 Claude 为当前工作构建一个专用的单次性编辑器——不是产品或可重用工具，而是一个为特定数据构建的单 HTML 文件。

关键技巧是最后添加导出功能——"复制为 JSON"或"复制为 Prompt"按钮，将 UI 中的操作转换回可粘贴到 Claude Code 的内容。

**适用场景：**

- 对任何事物进行排序、分类或分组（工单、测试用例、反馈）
- 编辑有约束条件的结构化配置（Feature Flags、环境变量、JSON/YAML）
- 调优 Prompt、模板或文案并实时预览
- 策划数据集——批准/拒绝行、标记示例、导出选择
- 标注文档、转录或 Diff 并导出注释
- 选择文本难以表达的值：颜色、缓动曲线、裁剪区域、Cron 表达式、正则表达式

## 常见问题

### HTML 是否效率更低？

虽然 HTML 确实使用更多 Token，但 HTML 增强的表达能力和文档被阅读的可能性大幅提升整体产出质量。考虑到 Opus 4.7 拥有 100 万 Token 的上下文窗口，额外 Token 消耗几乎可以忽略不计。

### 何时仍使用 Markdown？

作者坦言自己已几乎完全停止使用 Markdown，但坦承自己可能属于"HTML 最大化主义者"。

### HTML 是否替代了规划？

作者发现，相比单一计划，他更倾向于为项目的不同部分/阶段维护多个 HTML 文件。例如，可能有一个 HTML 实现计划，另一个用于 UI 探索，最后一个列出所有设计的 HTML 组件。这些文件既是未来的参考，也在验证阶段发挥作用。

## 核心价值：保持参与感

作者使用 HTML 而非 Markdown 的根本原因在于，它帮助他保持与 Claude 决策过程的参与感。随着 Claude 承担更多任务，作者发现自己越来越少仔细阅读计划——他希望有一种方式让自己持续参与 Claude 的选择，而非简单地将任务交接。HTML 正是这样的工具。

> "I feel more in the loop now than I ever did before."

→ [原文存档](https://claude.com/blog/using-claude-code-the-unreasonable-effectiveness-of-html)

## 相关概念

- [Claude Code 最佳实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-best-practices.md) — 相关实践指南
- [原文存档](https://claude.com/blog/using-claude-code-the-unreasonable-effectiveness-of-html) — 原始来源

## 深度分析

这篇文章揭示了 AI Agent 交互范式中的一个深刻转变：从「文档输出」到「交互界面」的概念跃迁。作者的核心论点「HTML 比 Markdown 更高效」并非关于格式偏好的主观选择，而是对 AI 与人类协作中「信息密度」问题的精准回应。当 Claude 能够生成的内容远超人类愿意阅读的范围时，如何让人类重新回到决策循环中——这才是 HTML 作为 Artifact 媒介的真正价值所在。它不是炫技，而是解决「Agent 能力越强、人类越被边缘化」这个结构性问题的有效路径。理解这一点，才能理解为什么作者说「感觉自己比以往任何时候都更在循环中」。

Markdown 在 AI 输出场景中的根本局限在于它是「被动消费」型媒介——它能承载信息，但无法创造反馈回路。当一个 PRD 文档、一份技术方案、或一份代码审查报告以 Markdown 交付时，人类的角色在「阅读」这个动作完成后就结束了。而 HTML 的交互能力——滑块、旋钮、可编辑字段、实时预览——将人类从纯阅读者转变为可调节参数的参与者。这意味着需求澄清不再发生在「你写的我不明白，请重写」的多轮低效对话中，而是发生在「你构建了一个可操作的界面，我在上面调参数并即时看到结果」的一次性高效交互中。数据摄取场景下让 Claude 扫描代码库后生成 HTML 这个例子很好地说明了这一点——一次性生成图表，比多轮文字描述高效得多。

「Token 效率 vs. 阅读率」的权衡是一个被大多数技术读者低估的决策变量。Markdown 倡导者通常以 Token 节约为由反对 HTML，但这个逻辑忽略了「写出没人读的内容 = 零产出」这个基本现实。作者的核心论点是：HTML 消耗更多 Token，但文档被实际阅读和使用的概率大幅提升，在 100 万 Token 上下文的背景下，这个 Trade-off 对 HTML 有利。这对于所有需要用 AI 辅助生成正式文档的知识工作者都是一个重要提醒——你的目标不是最小化 Token 消耗，而是最大化文档的最终价值产出。

多文件 HTML 网络而非单一 Markdown 计划的用法，揭示了一种新兴的 AI 辅助工作的架构思维。传统的「一个计划文档」模型假设信息是静态的、一次性传递的、后续不依赖的。但复杂项目的现实是：不同阶段需要不同类型的信息（技术约束、设计审美、进度节点），而且这些信息之间存在引用和验证关系。作者维护多个 HTML 文件（实现计划、UI 探索、设计组件清单）并在验证阶段让 Agent 读取所有文件，正是利用了 Claude Code 的强上下文能力来构建「持久化的工作记忆」。这比每次新会话都从头构建上下文、或依赖文字描述来传递复杂关系要高效得多。

从更宏观的视角看，HTML Artifacts 的兴起预示着「Agent as Co-Worker」时代的工作流重构方向。当 AI 能够生成任意复杂度的交互界面时，人类与 AI 之间的协作不再遵循传统的「人写文档 → AI 执行」的单向模式，而是演变为「AI 构建工作台 → 人在工作台上调整参数 → 人给 AI 新任务 → AI 更新工作台」的持续互动循环。这种模式对于需要持续迭代的创造性工作（产品设计、架构探索、代码审查）特别有意义——它让 AI 的规划能力与人类的设计直觉在同一个可视化空间中协同作用，而不是在抽象的文字描述中各自为战。

## 实践启示

**当需求表达在纯文本中变得低效时——比如涉及空间布局、颜色调优、参数组合对比、或复杂结构化配置——应该立即转向要求 HTML Artifact 而非继续在 Markdown 中艰难沟通。** 判断标准很简单：如果在纯文本描述中你需要写「请看第三段的表格中第三行那个蓝色的按钮」这样的定位描述，说明你已经遇到了 HTML 可以自然解决的表达瓶颈。主动切换到 HTML 能节省大量来回澄清的低效对话时间。

**在代码审查场景中，要求 Claude 生成带渲染 Diff 和注释的 HTML 而非纯文字 Diff。** 传统 Diff 在 Markdown 中的呈现方式（+/- 行、难以定位上下文）使评审者难以快速建立对变更的整体认知。HTML 可以实现行内注释、颜色编码严重程度、模块依赖图等增强阅读体验的呈现，让代码评审从「努力读完」变成「高效理解」。这在评审他人代码或解释自己的设计决策时尤其有价值。

**利用「可调参数 + 导出按钮」的组合来构建 Prompt 调优工作流。** 当你需要反复调整 System Prompt 或模板的措辞时，让 Claude 生成一个左右分屏的 HTML 编辑器：左侧是可编辑的模板（高亮变量槽），右侧是多个样本输入的实时渲染，加上 Token 计数和「复制为 Prompt」按钮。这个工作流比在 Chat 界面中反复粘贴修改要高效得多，特别适合需要精细调优 Prompt 的生产场景。

**将 Claude Code 的多会话协作视为「构建持久化知识库」而非「一次性任务执行」。** 作者的多 HTML 文件工作流（实现计划、UI 探索、设计组件清单）实际上构建了一个可被后续会话重用的结构化知识库。每次开启新会话时，将这些文件作为上下文传入，Claude 就能获得比任何文字描述更完整准确的项目状态认知。建议对重要项目建立这种「HTML 知识文件」而非每次从零描述项目背景。

**对于数据标注、排序分类等结构化操作类任务，HTML 的批量操作能力远超文字描述效率。** 比如需要从 50 个工单中筛选优先级、或者从代码片段集合中标记可复用组件，手动复制粘贴加文字描述远比用 HTML 构建一个可交互的拖拽式看板低效。这类任务中「导出」环节是关键——「复制为 Markdown」或「复制为 JSON」按钮将 UI 中的操作结果转换回 Claude Code 可处理的格式，形成完整的「人在回路中」的数据处理管道。

## 新增洞察：Artifact 循环作为人机协作界面（2026-05-23 ifanr）
**新增内容（ifanr，Anthropic Claude Code blog 解读）：**

- **Artifact 循环工作流**：读取上下文 → 生成单文件 HTML artifact → 人在 artifact 内审阅/调参/选方案 → 导出成 Markdown/JSON/Prompt/diff → 交给下一轮 Agent 实现或验证
- **Claude Code 上下文优势**：Claude Code 能读文件系统、git history、MCP 工具（Slack/Linear）、浏览器上下文——生成的不是普通网页，而是项目工作台
- **Output styles 产品化信号**：Anthropic 在把"输出形态"产品化——不只是 `generate an HTML file`，而是 stable format 的工作成果（always diagrams first、always reviewer artifact、always implementation report）
- **适用场景扩展**：PR review、多方案技术选型、陌生模块理解、设计稿对比、事故复盘时间线、prompt 调参、Linear ticket 优先级整理、研究报告和竞品分析
- **Prompt 模板**：
  > 请读取当前项目上下文，生成一个单文件 HTML artifact，用来帮助我审阅这个任务。要求：第一屏给 TL;DR 和风险点；用横向对比展示方案差异；用 SVG 展示模块关系；关键代码加注释；结尾提供 copy as Markdown 按钮；不依赖外部资源
**合并判断：** 现有 entity 基于 Anthropic 官方 blog（feature 清单式），本篇补充更深层的分析视角——Artifact 作为人机协作界面的工作流价值、Claude Code 的上下文优势、Output styles 的产品化信号。merge 后从"功能清单"升级为"工作流方法论"。
→ [原文存档](https://claude.com/blog/using-claude-code-the-unreasonable-effectiveness-of-html)

## 第 3 来源 — Claude Code 工程师 @Thariq：为何选择 HTML 替代 Markdown

- v×c=56, Thariq (Claude Code 工程师) 从开发者体验角度论证 HTML 优于 Markdown 作为 AI 文档载体
- **互补角度**:
  1. **信息密度**: HTML 可承载表格、CSS、SVG、JavaScript、交互组件，Markdown 难以自然表达
  2. **视觉清晰度**: 长文档（>100行 Markdown）可读性差，HTML 支持标签页、插图、响应式布局
  3. **分享便利**: Markdown 在浏览器中渲染不佳，HTML 可上传至 S3 直接分享链接
  4. **双向交互**: HTML 文档可含滑块/旋钮调整设计参数，修改可反向生成 prompt 粘回 Claude Code
  5. **Claude Code 摄取**: 通过文件系统和 MCP 获取大量上下文（Slack、Linear、git 历史等），生成结构化 HTML
  6. **趣味性**: 与 Claude 共同创作 HTML 文档更有参与感

> 来源：[原文存档](https://mp.weixin.qq.com/s/QY2cGVJqKiZE8wgJUojB1Q)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/prompt-engineering-guide.md)

---

## Ch02.011 Development environments for your cloud agents

> 📊 Level ⭐⭐⭐ | 14.7KB | `entities/cloud-agent-development-environments.md`

> 来源：[原文存档](https://cursor.com/blog/cloud-agent-development-environments)

## 核心要点
- Cursor 发布 cloud agent 开发环境配置工具，支持多 repo 环境和 Dockerfile-based 配置即代码
- Multi-repo 环境让 agent 能够跨越多个代码库进行推理和修改，解决了单 repo 局限性问题
- 环境配置支持 build secrets、layer caching（缓存命中构建速度快 70%）、版本历史和审计日志
- Egress 和 secrets 可按环境级别隔离，不同环境之间无法互相访问彼此的 secrets
- 未来方向：环境配置将随代码库演变而自主演化，而非静态快照
- 技术深度：v=8, c=7
→ [原文存档](https://cursor.com/blog/cloud-agent-development-environments)

## 相关实体
> [主题导航](https://github.com/QianJinGuo/wiki-public/blob/main/queries/ai-model-research-latest-directions.md)

- [Unlocking asynchronicity in continuous batching](https://github.com/QianJinGuo/wiki-public/blob/main/entities/continuousasync.md)
- [Modal — Truly serverless GPUs](https://github.com/QianJinGuo/wiki-public/blob/main/entities/modal-truly-serverless-gpus.md)
- [Google Genkit Middleware](https://github.com/QianJinGuo/wiki-public/blob/main/entities/announcing-genkit-middleware-intercept-extend-and-harden-your-agentic-apps.md)

- [development environments for your cloud agents](https://github.com/QianJinGuo/wiki-public/blob/main/entities/development-environments-for-your-cloud-agents.md)

### Multi-repo 环境：企业级 agent 工作流的基础单元
传统的 single-repo agent 面临一个根本性限制：企业软件架构早已是分布式微服务体系，一个业务变更往往需要跨越 5-10 个 repo 才能完成端到端交付。Cursor 的 multi-repo 环境设计本质上是在解决"最后一公里"问题——让 agent 获得完整的跨服务上下文，而不是在信息孤岛中盲人摸象。
这一设计的战略意义在于它重新定义了"autonomous agent"的边界。当一个 agent 能够同时访问 product-service、auth-service、billing-service 并理解它们之间的依赖关系时，它才能真正替代人类工程师完成跨服务修改的闭环。Amplitude 的案例（"agent can investigate a reported issue, figure out which repos it touches, and open a PR with the fix in the right places"）证明了 multi-repo 环境不是理论上的优化，而是已经在生产中验证的实际需求。

### 基础设施即代码范式的云端迁移
Dockerfile-based 配置将开发环境纳入版本控制，这意味着环境变更可以通过 code review 流程进行管理——每一步环境配置都有审计记录、可回滚、可diff比对。这与传统的"手把手搭建环境"模式有本质区别：后者是运维知识的手工传承，前者是将环境规范转化为可复现的代码资产。
特别值得注意的是 build secrets 的设计：scoped to build step, not passed to running agent's environment。这解决了两个相互冲突的需求——构建时需要访问私有 registry（需要 credentials），但运行时的 agent 不应该继承这些 credentials。传统方案往往通过将 secrets 注入镜像来解决，但这创造了安全风险：镜像一旦包含 secrets，任何有镜像访问权限的人都能读取。Cursor 的 build secrets 在构建完成后即失效，将攻击面限制在构建阶段而非运行时。

### Agent-led 环境配置：自我感知与自我修复
Cursor 宣称能够自动检测 repo 中的依赖和工具，并生成 Dockerfile 配置（private beta）。这一能力的深层含义是：环境配置本身成为 agent 系统的一部分。Agent 不再被动等待环境就绪，而是能够主动发现环境缺陷并修复它们。
"Cursor will ask you questions, flag missing credentials, and validate that your environment is set up properly" 和 "If your environment configuration fails, Cursor will default to a base image with clear warning signs so that your cloud agents can keep running instead of immediately failing" 这两个设计体现了容错优先的原则：环境配置失败不应该导致 agent 完全停摆，而是应该提供一个 degradation path。这意味着 cloud agent 的可靠性设计必须超越单个 agent 本身，延伸到其运行环境层面。

### 环境级别的治理与安全边界
"Every development environment now has its own version history" 和 "An audit log captures every action team members take on environments" 将环境从"资源配置"提升为"一等治理对象"。传统的 dev environment 安全往往依赖网络隔离或VPN，而 Cursor 的环境级别 egress allowlisting 和 secrets scoping 提供了更细粒度的控制。
Secrets scoped per environment 是一个关键的安全设计：即使某一环境的配置被攻击者获取，他们无法横向移动到其他环境。这类似于 Kubernetes 的 network policy 但应用于 secrets 访问控制。然而，值得注意的是，环境的隔离边界取决于底层容器/VM 隔离——如果两个环境运行在同一个宿主机上，内核级别的漏洞可能导致隔离失效。

### 从静态环境到自适应环境
"we are building towards environment setups that evolve autonomously as your codebase evolves" 是整个文章中最具前瞻性的声明。传统的 environment-as-code 是"声明式快照"——你在某个时间点声明环境状态，之后代码库的演变会导致环境逐渐与代码不同步（environment drift）。自适应环境则意味着环境配置本身成为一个持续运行的 agent，不断根据代码库状态调整自身。
这一方向的技术挑战是巨大的：如何判断环境与代码库的"不同步"？如何避免过度调整导致的 build 不稳定？如何在环境变更和稳定性之间取得平衡？但如果成功，它将彻底改变 cloud agent 的运维模式——从"管理环境"变成"让环境自我管理"。

## 实践启示
### 对 AI 工程团队
1. **多 repo 环境的拓扑设计**：在设计 multi-repo agent 工作流时，需要先建立 repo 之间的依赖关系图，明确哪些 repo 必须同时出现在同一环境中，避免将不相关的 repo 纳入同一环境造成不必要的上下文膨胀。
2. **环境配置的版本化管理**：将 Dockerfile 和环境配置文件纳入与业务代码相同的 CI/CD 流程，每次环境变更都必须经过 code review。这不仅是安全要求，也是调试环境相关问题的关键——通过 git blame 可以追溯"哪一次环境变更导致了 agent 行为变化"。
3. **Build secrets vs Runtime secrets 的分离策略**：在设计 CI/CD pipeline 时，严格区分构建时 secrets（私有依赖、测试数据库凭证）和运行时 secrets（生产 API key）。使用 Cursor 的 build secrets 机制处理前者，使用环境变量或 secrets manager 处理后者，永远不要将构建时 secrets 烘焙到镜像中。
4. **Layer caching 优化实践**：在进行 Dockerfile 优化时，将不常变化的依赖安装步骤（如 apt-get install、pip install base packages）放在 Dockerfile 前面，高频变化的代码复制步骤放在后面，以确保缓存命中率达到 70% 以上的加速效果。

### 对安全工程师
1. **Egress allowlisting 的粒度控制**：在为不同环境配置网络白名单时，应遵循最小权限原则——测试环境可以开放更广泛的 egress，而包含敏感数据的 prod 环境应严格限制到必要的 API endpoints。建议为每个环境维护一份 egress 清单，并将其纳入安全审计范围。
2. **Secrets 访问审计**：利用 Cursor 的 per-environment secrets scoping，不仅要配置 secrets，还要定期审计哪些环境访问了哪些 secrets。异常的秘密访问模式（如平时不活跃的环境突然大量请求 secrets）可能预示着环境被入侵。
3. **Rollback 权限的最小化**：环境版本历史功能如果配置不当（如任何团队成员都能回滚），可能成为社会工程攻击的向量。建议将高风险环境（prod 等）的 rollback 权限限制为仅管理员，并在审计日志中记录所有 rollback 操作。
4. **多环境隔离的假设检验**：定期进行环境隔离的渗透测试，验证不同环境之间的 secrets 确实无法互相访问。同时关注容器运行时的新版本，及时修补可能影响环境隔离的内核漏洞。

### 对平台工程师
1. **自我修复环境的架构设计**：在设计自适应环境系统时，需要建立明确的"环境健康度"指标（如 build 成功率、测试通过率、依赖完整性），以及触发环境更新的条件（如依赖的某个包发布新版本）。避免过于敏感的触发条件导致环境频繁变更。
2. **混合云环境的一致性**：如果 cloud agent 需要运行在多个云平台（AWS、GCP、Azure），需要在 Dockerfile 层面处理云厂商差异（如不同的 base image、不同的包管理器），同时在上层抽象中保持环境配置的统一性。
3. **环境初始化延迟的优化**：Docker build 时间直接影响 agent 的启动延迟。对于需要频繁重建环境的场景（如 A/B testing 不同环境配置），考虑预构建 base image 并结合增量构建，将初始化时间控制在秒级而非分钟级。
4. **多租户场景下的环境配额管理**：当多个团队共享 cloud agent 基础设施时，需要建立环境配额机制（CPU、内存、存储、并发 agent 数量），避免单一环境过度消耗资源影响其他租户。

### 对工程管理者
1. **Cloud agent 环境的技术债务评估**：许多组织的现有代码库可能依赖于"隐性知识"——环境中的某些配置从未被文档化，只有少数人知道如何复现。在引入 cloud agent 之前，应进行环境依赖的技术债务盘点，将隐性配置转化为显式的环境代码。
2. **Agent 工作流的 SLO 设计**：Cloud agent 的可靠性不仅取决于 agent 本身，还取决于其运行环境的可用性。需要为 agent 环境建立 SLO（如 99.9% 的环境可用性），并将其纳入整体的 agent service 可靠性指标。
3. **渐进式推广策略**：建议从 low-stakes 的场景（如文档生成、代码审查）开始试点 cloud agent 环境，在验证稳定性后再扩展到 high-stakes 场景（如生产部署、数据修改）。每个阶段都应记录环境的异常事件和回滚操作，作为后续决策的数据支撑。
4. **跨团队环境标准化**：当多个团队各自维护自己的 cloud agent 环境时，组织的工程效率可能反而下降（重复造轮子、环境碎片化）。建议在组织层面建立"Golden environment"模板，定义标准化的工具链和依赖版本，同时允许团队在 golden template 之上进行定制。

## 第 2 来源 — How we set up our cloud agent environment (2026-07-30)

> 来源：[原文存档](https://cursor.com/blog/cloud-agent-environment) — Cursor 工程团队 7 个月实践复盘（Mathew Hogan & Arvind Saripalli, 7 min read）。v×c=49（v=7, c=7, stars=3），与第 1 来源同 publisher 同 artifact family 的 evolution MERGE。

**互补角度 5 条**：
1. **量化采纳曲线**：2025-12 cloud agents 撰写 Cursor monorepo 约 1/10 合并 PR → 2026-07 超过一半（7-day rolling >50%），且内部 cloud agent 已 "author a majority of the code we ship"。这是第 1 来源（产品功能公告）缺少的生产实证。
2. **`anydev` CLI 模式**：为了去掉 devex 中的 footguns，Cursor 构建单一 CLI（`anydev`）让 agent 启动所有服务 + supervisor process 监控/重启长驻 build commands——把"守护长驻进程"从模型职责中完全移除。Skills 只记录命令，命令本身的复杂度必须由工具层吸收。
3. **Cursor Cloud MCP + Cloud Doctor 自愈闭环**：选择 MCP 作为 agent-环境接口（动态可发现工具、接口可变而无需重建 agent loop）；Cloud Doctor 周期性检查失败、区分 transient vs salient 错误、做 RCA、自动开 PR 修复，并 inspect traces 优化其他 agent 的 skill/路径。环境自愈从第 1 来源的"愿景"变成"已实现"。
4. **安全注入 secrets 的四件套**：网络 egress 限制、scoped and proxied git remote access、commit/commit message secret scanning、tool results 中的 secret redaction（agent 即使尝试也读不到 secret 值）——补全了第 1 来源 build-secrets 之外的运行时 secret 防护面。
5. **环境就绪度三问框架**：① agents 能否访问开发者同等的工具和数据？② agents 能否找到文档化"开发者实际如何工作"的 skills？③ agents 能否测试和验证核心 workflows？——把 cloud agent 环境准备从模糊工程问题变成可操作的 checklist。

---

## Ch02.012 Claude Fable 5 提示词泄漏 — 1585 行 120K 字符的产品运行时控制平面与安全工程启示

> 📊 Level ⭐⭐⭐ | 12.1KB | `entities/claude-fable-5-prompt-leak-runtime-control-plane-vibecoder-2026.md`

## 概述

2026-06-12 VibeCoder 公众号深度分析 2026-06-09 Anthropic 发布 Fable 5 + Mythos 5 后 **CL4R1T4S 仓库泄漏的 `CLAUDE-FABLE-5.md`（1585 行 / 120,040 字符）**——这份提示词不是普通角色卡，而是**完整的产品运行时控制平面**（工具地图 + 权限边界 + 上下文结构 + 产品路由策略）。泄漏降低探索成本，把"产品架构文档"直接公开。文章提出 3 个核心安全工程论断：**(1) Prompt 不能继续当保险箱** — 风险判断应拉到工作流层（请求 + 历史 + 工具输出 + 计划 + 产物 = 同一条审计链）；**(2) 攻击面像系统** — MCP 联网后模型风险边界从文本输出迁移到动作执行，等同 SaaS 权限系统；**(3) 分类器要处理组合风险** — 单点判断 → 状态判断（跨轮 + 工具链 + 产物 + 试探轨迹）。核心设计原则："**所有 system prompt / AGENTS.md / skill / tool schema 都应按会被公开来写。能公开的放进去，不能公开的搬到服务端。**"

## 深度分析

**CLAUDE-FABLE-5.md 是 6 层产品运行时控制平面，不是单层系统提示词。** 文章把它翻译为分层配置：**第 1 层行为宪法**（Fable/Mythos 产品口径 + 10+ 敏感场景拒答策略）、**第 2 层产品说明**（Claude Code/Cowork/in Chrome/in Excel/in PowerPoint 携带官方口径）、**第 3 层能力系统**（Memory system + Artifact 持久化存储 — Claude 不只回答问题，还能生成有状态小应用）、**第 4 层 computer use**（创建文件/写代码/做幻灯片前先读 SKILL.md）、**第 5 层搜索与版权**（近期事件/陌生产品按"信息是否会变"决策 + 限制长引用）、**第 6 层工具和环境**（完整工具 schema + 网络白名单 + 只读目录）。**10 大设计亮点**：Fable/Mythos 差异是产品口径、高风险拒答"不能因为公开可得就放行"、MCP 推荐带 opt-in、Skills 先读再执行、完整工具 schema 进入上下文、网络/目录边界显式可见——这些都是**架构决策**而不是 prompt 技巧。

**"Prompt 不能继续当保险箱"是 Fable 5 泄漏的核心启示。** 文章把 Agent 安全责任重新划界：**能写进 prompt 的** = 用户体验规则（语气/格式/解释方式/工具最小说明/错误沟通）；**应放在服务端策略层的** = 高风险分类/权限判定/工具授权/用户数据边界/fallback 路由/内部策略开关。理由：长上下文模型可把任务拆成多段，Agent 可把一个请求变成搜索+文件读取+代码生成+工具调用+结果重组，**安全判断如果只看当前用户消息，很容易漏掉跨轮组合意图**。**更稳的方式是把风险判断拉到工作流层**——一次请求 + 历史上下文 + 工具输出 + 计划步骤 + 最终产物都要进入同一条审计链。某个片段看起来无害，不代表最终组合结果无害。

**"攻击面像系统"标志着 Agent 安全从内容风险时代进入动作风险时代。** 当模型只能聊天时，安全边界主要在文本输出。当模型能搜索、读写文件、调用 bash、生成 artifact、使用 MCP、连接外部 app 时，**边界就扩展到动作**。攻击者关心的不只是模型会说什么，还会关心**模型能碰到什么、能把数据送到哪里、能不能诱导它调用某个工具**。**MCP 联网后这一迁移尤其剧烈**——连接器让 AI 从聊天窗口走向真实账户和真实业务系统，攻击面变得更像 **SaaS 权限系统**：推荐连接器、选择供应商、读取用户数据、执行第三方动作——都不能只靠模型自觉。**对所有 Coding Agent（Claude Code、OpenCode、Cursor、Windsurf）都有启发**：系统提示词 + AGENTS.md + skills + 工具 schema 本质上都是模型可见上下文，**不要放秘密、不要放绕行路径、不要放内部开关**。

**"分类器要处理组合风险"是 Fable 5 争议的真正难点。** 攻击者可把危险意图拆成低风险问题：上下文埋进长文档、目标伪装成小说/课程/论文/测试题、多个模型/Agent 串起来。**每一步都不一定触发分类器，最终输出却可能越界**。文章提出**单点判断 → 状态判断**的演进方向：分类器要能看到**跨轮意图 + 工具调用链 + 生成产物 + 用户反复试探的轨迹**。对于高风险领域还要有**任务级别的预算和中断机制**：当系统发现方向已经偏离安全研究或合法防御，就应该停止继续提供细节，而不是等最终答案成型。**这并不意味着把所有敏感词都封死**（误伤会伤害正常研究，尤其是网络安全/防御/生命科学），更现实的做法是**分层**：普通解释给、防御建议给、检测加固给；**可执行攻击/武器化步骤/违禁合成/绕过安全系统的操作细节挡在模型外侧**。

**3 个开发者判断**把"提示词泄漏"事件升级为 Agent 工程反思框架：

**判断 1：系统提示词会越来越像基础设施配置。** 过去泄漏 prompt 大家看个热闹，研究模型人设和口癖；现在泄漏 prompt 看到的是**产品能力 + 工具协议 + 权限设计 + 安全策略**，**已经接近架构文档**。

**判断 2：Agent 安全会从模型层挪到 harness 层。** 模型拒答只是一环，**真正要管的**：执行环境 / 工具权限 / 上下文压缩 / 日志审计 / 回滚恢复 / 连接器授权 / 服务端策略。

**判断 3：红队实验要讲决策价值。** 看到一种绕过方式 ≠ 穷举 100 种变体。更好的实验问题是："**这类绕过说明分类器要改还是工具权限要改？说明 prompt 需要移出敏感规则还是需要跨轮风险聚合？**"如果某组实验只是在重复确认"还能绕"，边际信息就很低。

## 实践启示

1. **审查你自己的 Agent 系统提示词**："哪些信息一旦泄漏会出事？哪些工具权限过宽？哪些风险只能单轮判断？哪些日志根本查不到？" 这个检查比围观 Fable 5 破解更有用。文章的 8 个具体动作（不要放秘密 / 工具按最小权限 / 日志记录 / MCP 按 SaaS 权限系统设计 / 风险判断放工作流层 / 分类器从单点到状态 / 任务级别预算 + 中断 / 分层放行）应作为内部 Agent 安全审计 checklist。

2. **把"system prompt 按公开材料设计"作为 2026 H2 的安全红线**：能公开的（UX 规则、错误信息格式、工具最小说明）放 prompt；不能公开的（高风险分类、权限矩阵、fallback 路由、内部策略开关）放服务端策略层。这意味着 `AGENTS.md` / `skill` / `tool schema` 同样适用此原则——**它们都是模型可见上下文，等同于公开材料**。

3. **为 Coding Agent 引入"工作流层审计链"**：在工具调用层记录"请求 + 历史上下文 + 工具输出 + 计划步骤 + 最终产物"的完整 trace，能在事故后回放而非猜测。这与 [Loop Engineering 的"状态文件"](https://mp.weixin.qq.com/s/vmGx9IELbWgKZqHm-M3G5w) 有共鸣——两者都是"对话之外的可审计载体"。

4. **MCP 连接器按 SaaS 权限系统设计**：连接器推荐 / 用户数据读取 / 第三方动作执行不能只靠模型自觉，需要 opt-in + 权限范围 + 操作日志三件套。这是 Fable 5 提示词里"MCP App 商业边界"的具体工程化。

5. **任务级别预算 + 中断机制是高风险领域的必备**：当系统检测到方向偏离合法研究/合法防御时，**主动中断而非被动拒绝**。这与 [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md) 中的"deterministic guards" 思路一致——哪些事交给模型决定、哪些事用确定性代码保证，这条线要画清楚。

6. **红队实验重新定位为"决策输入"而非"绕过证明"**：每次越狱实验的产出应是一个工程决策（"分类器要改 / 工具权限要改 / prompt 要移出敏感规则"），而不是"我们又绕过了一种变体"——后者边际信息很低。

## CLAUDE-FABLE-5.md 6 层架构图

| 层 | 主题 | 关键内容 | 安全责任 |
|----|------|----------|----------|
| **1. 行为宪法** | 自我介绍 + 拒答口径 | Fable/Mythos 差异 + 10+ 敏感场景 | 高风险 |
| **2. 产品说明** | 产品矩阵 | Claude Code/Cowork/in Chrome/in Excel/in PPT | 中 |
| **3. 能力系统** | Memory + Artifact | 用户记忆 + 持久化 KV 存储 | 中 |
| **4. computer use** | 文件 + 幻灯片 + PDF | 先读 SKILL.md + 真实文件判定 | 中 |
| **5. 搜索与版权** | 搜索规则 + 引用 | "信息是否会变"决策 + 长引用限制 | 中 |
| **6. 工具和环境** | 完整工具 schema | bash/web/file/MCP/网络白名单/只读目录 | **高** |

→ [原文存档](https://mp.weixin.qq.com/s/vsvqHXCBHWJJFRDOviIj2w)

## 相关实体

- [Claude Fable 5 安全寓言](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-fable-5-and-new-ai-safety-fables.md) — Nathan Lambert 的安全政策分析
- [Fable 5 on AWS Bedrock](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-claude-fable-5-on-aws内置保护措施的-mythos-级功能现已推出.md) — 企业部署视角
- [Mollick Fable 5 patron vs wizard](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-fable-5-mollick-patron-vs-wizard.md) — 用户体验视角
- [阿里云云原生 安全护栏三域演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aliyun-cloud-native-safety-guardrails-three-domains.md) — 3 域对比（云资源约束 / AI 输出约束 / 模型路由约束）
- [Mythos bug hunting 营销](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-mythos-bug-hunting-marketing.md)
- [System over Model tested](https://github.com/QianJinGuo/wiki-public/blob/main/entities/system-over-model-tested-reproducing-mythoss-freebsd-find-on-20260606.md) — 评测视角
- [Loop Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/loop-engineering-addy-osmani-challengehub.md) — 状态文件作为对话外可审计载体
- [Anthropic 12 MCP 生产模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-12-mcp-production-patterns.md)
- [Anthropic 14 Skill 模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-14-skill-patterns-best-practices.md)
- [Skill Issues Claude Code](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-issues-compromising-claude-code-with-malicious-skills-agents.md) — 同样的 supply chain 攻击视角
- [System Prompt vs Post-Training](https://github.com/QianJinGuo/wiki-public/blob/main/entities/system-prompt-vs-post-training-behavioral-constraints-2026.md) — 行为约束应进训练而非 prompt
- [AIMap Security Testing](https://github.com/QianJinGuo/wiki-public/blob/main/entities/introducing-aimap-security-testing-for-ai-agent-bishop-fox.md) — 同样聚焦 AI Agent 安全测试
- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/prompt-engineering-guide.md)

---

## Ch02.013 Superpowers 6.0 跑了 25 个实验才发现：prompt 里写的每一条\"不要\"，可能都在帮倒忙

> 📊 Level ⭐⭐⭐ | 10.5KB | `entities/superpowers-prompt-dont-experiment-shuge.md`

# Superpowers 6.0 跑了 25 个实验才发现：prompt 里写的每一条"不要"，可能都在帮倒忙

## 摘要

Superpowers 6.0（Jesse Vincent 的 coding agent skills 系统）通过约 25 个微测实验系统性地检验了 prompt 措辞对 Agent 行为的影响。核心发现反直觉：在 dispatch prompt 中写"不要重述 brief"的违规次数是 4.4 次（5 次平均），而完全没写任何指导的对照组反而只有 3.6 次——**禁止式比什么都不写还差**。进一步实验揭示了一套"失败分类 → 措辞形态选择"的分型方法论：组合型禁止（composition prohibitions）在输出形状类问题上会激发对抗产生 backfire，而离散型禁止（discrete prohibitions）在纪律型问题上仍然有效。每发微测仅需 $0.15-0.30、5 次重复迭代，就能产出可量化的措辞优化结论。

## 核心要点

1. **禁止式（不要做 X）可能比不写还差**：dispatch-prompt 实验中，禁止组 4.4 次违规 vs 无指导对照组 3.6 次——禁止式在输出形状类问题上 backfire
2. **正面配方的工程优势**：正面配方以 3.0 次且零方差异常胜出；给赢的配方加 nuance clause 会退化到 3.8 noisy
3. **微测方法论五步法**：fresh-context 单样本 → 无指导对照组 → 每变体 ≥5 次重复 → 人工逐条复核 → 方差作为指标
4. **五条分类定律**：绊线有效 / 识别表有效 / 离散禁止有效 / 组合禁止 backfire / 平局选更短
5. **两条硬规则**：不写 nuance clause（会退化赢的配方）、豁免条款不作用域（会抑制应豁免的部分）
6. **成本分工**：prompt 措辞迭代在 $0.15-0.30/发的微测中完成，结构性变化才回到 $12/次的完整 eval

### 禁止式 backfire 的机制分析

Superpowers 实验揭示了禁止式 backfire 的条件边界。在 dispatch-prompt 实验中，controller 组装 dispatch 指令时自认为"重述 spec"是有用的策展行为，模型对输出有自己的 agenda。禁止式在此类**输出形状问题**上激发了对抗——模型不是服从禁令，而是将其视为需要绕过的约束。

但在**纪律型问题**上（如"不要让 reviewer 重跑测试"），模型没有做该行为的竞争动机，禁止式 5/5 次全部有效（对照组 3/5 失败）。区别在于：前者模型有自己的"更好方式"的判断，禁令与模型直觉冲突；后者只是约束一个模型没有强烈倾向的机械行为。

这一发现与"别想白熊"效应（Ironic Process Theory）在认知心理学中的观察一致——试图抑制某个念头反而使其更活跃。在 LLM 语境中，禁止式在 instruction-following 过程中激活了被禁止概念的表示，增加了而非降低了其出现概率。

### 正面配方的设计原理

正面配方的优势在于它给了模型一个**可执行的替代行为**。当 controller 被告知"你的 dispatch 应包含 (1) 精简的任务描述 (2) 明确的输出格式 (3) ..."时，它有一个清晰的目标状态可以 optimize toward。而"不要重述 brief"只告诉模型什么不能做，没有告诉它应该做什么——模型在否定约束的空间中仍然需要猜测正确行为。

实验中正面配方 5 次重复均收敛到零方差，说明当指令足够具体且正面时，模型行为从概率性变为确定性。工程上，零方差约等于 pass^k 所有 k 次都成功——这是一个比 pass@k 严格得多的度量。

### Nuance Clause 的退化效应

一个特别反直觉的发现是：nuance clause（如"只引用片段……"）追加到已经赢的正面配方上，会将其从 3.0 consistent 退化到 3.8 noisy。原因在于 nuance 重新打开了"谈判空间"——模型开始判断"这次是否需要引用片段"，从确定性执行退化为概率性判断。

Superpowers 团队由此提炼出硬规则：**不写 nuance clause**。如果有了真实例外，将其表达为键到可观测谓词的独立条件，而非附加到已有规则上的修饰语。同理，豁免条款（"此限制不适用于代码块"）实际上仍然会抑制代码块的生成——如果输出的一部分必须豁免，重新组织让规则够不到它，而非试图用豁免条款控制范围。

### 微测方法论的系统价值

Superpowers 的微测方法论最大的贡献不是某一条具体结论，而是将 prompt 工程从"手感"升级为"实验"。每次微测 $0.15-0.30、5 次重复、几秒一轮迭代，对照完整 eval 的 $12/次和 50 分钟一轮。措辞在微测中磨，结构性变化才回到完整 eval 确认。

关键的五步法设计细节包括：

1. **Fresh-context 单样本调用**：system prompt 填真实完整上下文（整个 skill 或 prompt 模板），user message 填一个会诱发目标失败的 realistic 任务
2. **无指导对照组是灵魂**：dispatch-prompt 实验同时揭露了 backfire 和有效禁令——没有对照组无法区分
3. **5 次重复是起步**：单样本会骗人，5 次是经验下限
4. **人工复核不可替代**：模板回声和引用反例会伪装成命中，程序化计数会同时夸大失败和成功
5. **方差是信号不是噪音**：consistent（5 次收敛）vs noisy（5 次结果各不同），前者说明措辞绑住了形式，后者说明形式还需收紧

其中第 2 步和第 5 步最容易被跳过，也最有价值。第 2 步的对照组防止你在"帮倒忙"而不自知；第 5 步的方差判断是措辞是否真正生效的硬指标。

### "做了实验，结论是不用改"的工程诚实

微测方法论有一个容易被忽略的美德：诚实记录"做了实验，结论是不用改"。在 writing-plans 的 No Placeholders 章节微测中，4 个变体（含对照）在 40 个 plan 中全部 0 placeholder——current-gen opus 即使在被蓄意施压下也不产生 plan placeholder。结论是不用改，但保留了 No Placeholders 章节原样并记录了 V2 relocation 设计方案以备未来模型代际回归。

同一份文档还专门列出了"tested-and-declined"清单，将做了实验但被否决的方案带着数据写进去——防止有人没有新证据就重新提议同一个方案。这种将否定结果写入文档的做法，很多团队的 prompt 仓库都缺。

### 便宜化 vs. 判断降级的边界实验

微测在成本优化上的应用同样富有启发性。L2 梯级（sonnet controller）的微测看起来很有希望——recon 阶段干净通过、显式冲突 5/5 升级成功。但 planted-defect battery 决定性失败：sonnet controller 在 Strengths 中写"no assertion, as required"——**把没写断言这个缺陷描述成符合要求**。结论是便宜 controller 能处理显式升级，但会吸收隐性的 authority-vs-quality 裁决，将质量判断扭曲为计划合规辩护。

三条梯级的生死记录（L1 活的、L2 死的、L3 死的）定义了"便宜化机械，绝不便宜化判断"的边界。这条边界是用美元和 run 数堆出来的，不是拍脑袋。

## 实践启示

1. **不要默认使用禁止式**：先判断你治的是哪一类失败——输出形状问题（模型有自己的 agenda）用正面配方，纪律型问题（模型无竞争动机）用离散禁止。

2. **正面配方要给出可执行结构**：不要只说"不要 X"，要说"应包含 (1)...(2)...(3)..."。具体到模型能 optimize toward 的粒度。

3. **微测是最小可行实验框架**：$0.15-0.30 一发、5 次重复、带对照组——你自己的 prompt 也可以用同一套框架验证。核心在于：prompt 是可以被实验验证的。

4. **永远设无指导对照组**：一个对照组可以同时告诉你"禁令在帮倒忙"和"禁令在帮真忙"两个方向的信息。没有对照组你无法区分改进和帮倒忙。

5. **赢了就不要加 nuance**：给赢的配方加 nuance clause 会把它从 consistent 退化为 noisy。真实例外应表达为独立条件，而非已有规则的修饰语。

6. **记录否定结果**：做了实验发现不用改、方案被否决，都带数据写进文档。这是防止重复劳动的最佳机制。

7. **平局选更短**：Codex 一个长 session 会重读 SKILL.md 约 500 次，prose 长度是真金白银。在效果相近时，更短的措辞碾压。

## 相关实体

- [Harness 工程实践 17 vs 6 Subagent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-practical-17ge-versus-6-subagent.md) — 探讨 Agent Skills 的工程化设计，与 Superpowers 的 prompt 微测方法论形成互补
- [Claude Code 深度架构分析](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/claude-code-deep-architecture-analysis.md) — Claude Code 的架构设计，与 Superpowers 的 SDD 工作流设计有共通的设计哲学
- [Agent Loop 设计模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-boris-cherny-agent-loop-design-patterns.md) — 探讨 Agent 运行循环的设计模式，为理解 dispatch prompt 的上下文机制提供参考
- [Harness Engineering](ch05/061-harness-engineering.html) — Agent 工程化的广义框架，Superpowers 的微测方法是 prompt engineering 层面对 Harness Engineering 的一次实践验证

## 参考来源

→ [原文存档](https://mp.weixin.qq.com/s/4XTsfY8SzcjusCU6sUg7yg)

---

## Ch02.014 深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践

> 📊 Level ⭐⭐⭐ | 9.3KB | `entities/openclaw-prompt-context-harness.md`

## Prompt Engineering：动态组装与文件驱动
System Prompt由buildAgentSystemPrompt()构建，23个模块按固定顺序搭积木般拼装。三种提示词模式：full（完整）/ minimal（精简）/ none（极简）。六个核心.md文件（AGENTS.md/SOUL.md/IDENTITY.md/USER.md/TOOLS.md/HEARTBEAT.md等）构成Agent的"灵魂"与"骨架"，通过Markdown文件驱动实现配置与代码解耦。

## Context Engineering：扩展、压缩和记忆
- **Skills渐进式披露**：默认只注入名称描述，任务需要时才读取SKILL.md，避免上下文爆炸
- **自适应分块压缩**：BASE_CHUNK_RATIO=0.4，分层摘要三函数（summarizeInStages→summarizeChunks→summarizeWithFallback）
- **修剪策略**：头尾保留中间省略，KV Cache时间窗口优化
- **双层Memory**：MEMORY.md长期记忆（每次对话注入，截断200行）+ memory/日期.md每日笔记（BM25+向量双路召回，时间衰减e^(-λt)）

## Harness Engineering：约束与引导控制
Workflow（主导权在人）vs Harness（主导权在AI）的本质区别。OpenClaw的Harness实践：

- **Hook全生命周期**：before_prompt_build / before_tool_call（参数校验拦截）/ after_tool_call / before_compaction / after_compaction / message_received / message_sending
- **三层安全沙箱**：文件系统沙箱 + 命令执行沙箱（白名单+Ask模式+safeBins）+ 网络访问沙箱
- **防注入/防越权/防泄露/防篡改**：操作系统最小权限兜底
- **人在环路**：高风险操作暂停等待人工确认

## 深度分析
**OpenClaw的三维工程体系为何重要**
Prompt/Context/Harness三层分离本质上是AI工程化的三次关键抽象。第一次抽象在"说"的层面——将Prompt的静态模板升级为动态组装的模块系统；第二次抽象在"看"的层面——通过渐进式披露和分层压缩解决上下文无限膨胀的根本矛盾；第三次抽象在"运行"的层面——用Hook机制和安全沙箱在保持AI自主性的同时建立可控边界。这三次抽象反映了从"如何用好AI"到"如何管好AI"的认知跃迁。
**文件驱动架构的设计哲学**
AGENTS.md/SOUL.md/IDENTITY.md等核心文件将Prompt的"灵魂"与代码解耦，这种做法解决了三个实际问题：1）非工程师也能修改Agent行为；2）同一套代码可以加载不同性格的Agent；3）运行时可以动态切换身份而不重启进程。Markdown作为配置载体的选择体现了"最小化依赖"原则——不需要解析器，不需要数据库，纯文本即可版本控制、diff对比、跨平台同步。
**双层Memory的时间衰减机制**
MEMORY.md长期记忆采用固定截断（200行）而每日笔记采用指数衰减e^(-λt)，这两种策略对应不同的记忆需求。长期记忆需要高可靠性和零干扰（每次对话必须存在），所以用简单粗暴的截断；每日笔记需要优先保留近期内容（低频日常交互），所以用时间衰减让旧记忆自然淡化。这个设计体现了"不同类型信息用不同策略处理"的工程原则。
**Harness的"度"如何把握**
OpenClaw的Hook机制提供了before_prompt_build、before_tool_call、after_tool_call等7个生命周期节点，但并非所有节点都需要强约束。参数校验拦截（before_tool_call）是低风险高收益的典型场景——不阻止AI行动，只确保行动参数有效；而网络访问沙箱则是高风险场景，需要白名单兜底。这种分级策略避免了"过度安全"导致的AI能力瘫痪，也避免了"过度自由"导致的安全事故。

## 实践启示
**1. 构建自己的"积木式Prompt库"**
不追求一个完美的System Prompt，而是将23个模块按职责分离到独立文件。每个模块独立测试、独立版本控制。需要完整能力时全加载，需要轻量执行时只加载核心模块。这种思路比"一个巨大Prompt打天下"更易于维护和调试。
**2. 渐进式披露的上下文管理**
任何长期运行的AI系统都面临上下文膨胀问题。OpenClaw的解法——默认只注入名称描述、任务需要时才读取完整Skill——可以迁移到自己的系统：建立"能力清单+按需加载"的文档机制，而不是把所有文档一股脑塞进上下文。
**3. 设计"人在环路"的触发条件**
不是所有AI操作都需要人工介入。参考OpenClaw的分级策略：低风险操作（读文件、数据查询）直接执行；中风险操作（写文件、修改配置）用Hook做参数校验后执行；高风险操作（网络请求、系统命令）才暂停等待确认。提前定义分级标准，比事后打补丁更有效。
**4. 用文件沙箱替代代码沙箱**
如果你的AI系统需要访问文件系统，不必实现完整的Linux容器隔离。可以学习OpenClaw的"严格限制Workspace访问范围"策略：在应用层定义可访问路径白名单，路径外访问直接拒绝。这比容器方案轻量得多，且足以应对大多数场景。
**5. Hook是调试AI的利器**
before_tool_call阶段的参数校验不仅能防止错误，还能作为"AI行为观察点"。在这个节点记录AI的原始意图（tool name + arguments），可以帮助分析AI的思考路径，定位Prompt或Instruction的歧义点。

## 相关维度深度分析
- **[Claude Code Prompt Context Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-prompt-context-harness.md)**（飞樰）侧重 Claude Code 的 Prompt/Context/Harness 三维度，与本文同作者互补
- **[Claude Code Agent Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-agent-engineering.md)**（SooKool）侧重 StreamingToolExecutor/主循环/压缩/小模型
- **[Openclaw Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/openclaw-architecture.md)**（800行架构）侧重 Tool/MessageBus/SubagentManager/REPL 主循环，与本文互补
- **[Hermes Agent](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/hermes-agent.md)** Hermes的Self-Evolving与OpenClaw的Memory机制对照

## 相关实体

- [Agent Harness 上下文管理：工作集视角](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-context-management-working-set.md)
- [从 Prompt 到 Harness：最小实操指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/from-prompt-to-harness-claude-official.md)
- [Agent Memory 架构解析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-architecture-ruofei.md)
- [Claude Code Prompt 提示词体系源码解析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-prompt-source-analysis.md)
- [Claude Code vs OpenClaw 记忆系统 — 向量数据库必要性反思](https://github.com/QianJinGuo/wiki-public/blob/main/entities/读完-claude-code-和-openclaw-的-memory-源码我对agent记忆需要向量数据库这件事产生了怀疑.md)
- [From Agent Protocol to Harness Skill](https://github.com/QianJinGuo/wiki-public/blob/main/entities/from-agent-protocol-to-harness-skill.md)
- [Agent Harness 架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-architecture.md)
- [Agent 自我改进的六条路](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-self-improvement-six-mechanisms.md)
- [Agent Memory System 设计指南](https://github.com/QianJinGuo/wiki-public/blob/main/queries/agent-memory-system-design.md)
- [SkillClaw](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skillclaw.md)
- [Skill 系统：Agent 如何把经验沉淀成可复用能力](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-skill-system-winty.md)
- [Agent架构关键变化：Harness正在成为新后端](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-architecture-harness-new-backend.md)
→ [原文存档](https://mp.weixin.qq.com/s/JycTfNd7EnmWCnJK-QCf0Q)

- [Thin Harness Fat Skills](https://github.com/QianJinGuo/wiki-public/blob/main/entities/thin-harness-fat-skills.md)
- [Hermes Agent 记忆系统深度拆解](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-memory-system-vs-openclaw.md)
- [Claude Code 架构深度解析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-deep-architecture-analysis.md)
- [AgentCore Managed Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentcore-harness.md)
- [从 30 分钟手搓 Agent，到 Harness 成为"新后端"](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cong-30-fen-zhong-shou-gu-agent-dao-harness-cheng-wei-xin-hou-duan.md)
- [harness-engineering-systematic-explainer](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-systematic-explainer.md)
- [claude-code-7-layer-memory-architecture](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-7-layer-memory-architecture.md)
- [AI Agent 工程师能力地图](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-agent-engineer-capability-map.md)
- [阿里云端到端业务需求专家 agent：multica 平台 + superai-* 技能集群 + tdd/pre-pus](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aliyun-end-to-end-business-requirements-agent-multica-2026.md)
- [fanling company as agent ai org reflection v2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/fanling-company-as-agent-ai-org-reflection-v2.md)

---

## Ch02.015 Prompt Context Harness 三次演进

> 📊 Level ⭐⭐⭐ | 8.1KB | `entities/prompt-context-harness-three-evolutions.md`

# 从Prompt、Context到Harness，工程的三次进化与终局之战
> 原文：[从Prompt、Context到Harness，工程的三次进化与终局之战](https://mp.weixin.qq.com/s/b1VL28GX5d17sKPfkSbIsw)
**OpenAI 内部实验**：3-7人团队，5个月，AI生成近**100万行**生产级代码。全程没有工程师手写业务代码。

## 相关实体
- [Openclaw Prompt Context Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-prompt-context-harness.md)
- [From Prompt To Harness Claude Official](https://github.com/QianJinGuo/wiki-public/blob/main/entities/from-prompt-to-harness-claude-official.md)
- [Agentcore Managed Harness](ch04/310-agentcore-managed-harness.html)
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- [Hermes Agent Deep Dive Alibaba](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-deep-dive-alibaba.md)

→ [原文存档](https://mp.weixin.qq.com/s/b1VL28GX5d17sKPfkSbIsw)

## 深度分析

**Harness 衰变定律指向了 AI 工程化的核心矛盾：模型的快速进化正在压缩人工 Harness 的价值窗口。** 文章提出的「模型能力越强，所需的 Harness 越简单」这一洞察，在 2026 年的模型能力背景下具有特殊的工程含义。Claude 3.0 时代需要极严格的 Harness 约束——逐点执行、频繁重置上下文、大量硬编码检查——到了 Claude 3.5 时代许多规则自然消失。这个现象背后是一个更深层的问题：当模型能力提升的速度快于团队构建 Harness 的速度时，今天精心设计的 Harness 体系可能在 6-12 个月后成为冗余约束。这要求团队在设计 Harness 时必须区分「因模型能力不足而必需的约束」和「业务逻辑本身必需的约束」，前者是过渡性的、应该在模型升级后主动移除，后者则是持久的设计选择。

**F-Harness 三角色模式揭示了多 Agent 协作中「权力分立」的工程价值。** Anthropic 发现的「AI 倾向于给自己的 Bug 打高分」这一「自恋问题」，本质上反映了一个通用认知偏见在 AI 系统中的具体表现。Planner-Generator-Evaluator 三角色架构的精髓在于：Evaluator 必须与 Generator 完全独立，不受生成偏见影响，才能有效履行审核职责。这一设计的工程价值远超单纯的分工：它本质上是把「构建者」和「验证者」分属到不同的激励体系和能力边界中，避免了单一 Agent 在自我生成和自我验证时的利益冲突。效率数据的对比极具说服力——单 Agent 模式 20 分钟、$9，但输出质量勉强可用；三角色模式 6 小时、$200，却是生产环境级别。20 倍时间代价和 22 倍成本代价换来的是质的飞跃，这说明在高质量 Agent 应用中，评估和验证的成本不是浪费，而是质量的必要代价。

**上下文治理的「百行原则」揭示了 Agent 系统中最容易被忽视的信号衰减问题。** OpenAI 百万行代码实验中，「巨型 agent.md 导致 Agent 什么都抓不住重点」是一个极具代表性的工程失败模式。当 Agent 的上下文文档过长时，有效信息被淹没在噪声中，模型对关键指令的注意力被稀释——这本质上是注意力机制在系统设计层面的具象化表现。文章提出的「压缩至百行只保留索引」方案背后的原理是：与其让模型在长上下文中进行信息检索（这会消耗大量 token 且检索质量不稳定），不如在源头就强制执行严格的信息过滤，只保留索引和指向代码仓库的引用。这一原则在工程实践中具有广泛适用性：任何面向 Agent 的上下文文档，都应该先问「如果只能保留 100 行，哪些是绝对必要的？」然后果断丢弃其余内容。

**「Human Steer, Agents Execute」标志着 AI 工程评价标准的根本性范式转移。** 文章列举的新旧衡量标准对比（从「每天能写多少行代码」到「Harness 能支撑多高的代码产出率」，从「能实现多复杂的业务逻辑」到「能设计多健壮的 Agent 系统」）揭示了一个深刻转变：个人生产力的衡量维度正在被系统性杠杆所取代。这个转变对工程团队的影响是深远的——在旧标准下，工程师的价值体现在「自己能写多少行」；在新标准下，工程师的价值体现在「能构建多完善的自动闭环机制」。这意味着技术面试、项目评估、团队配置等一系列工程管理实践都需要重新校准标准。那些仍然以代码产出量评估工程师生产力的团队，正在用工业时代的尺子测量知识经济时代的产出。

**三层嵌套关系的澄清，对于防止 AI 工程中的「技术时尚病」具有重要价值。** 最大的误解——认为 Harness Engineering 最高级、前两个过时了——在 AI 圈子里有相当普遍的代表性。这种线性升级思维的误区在于，它把三个层次看成相互替代的关系，而实际上它们是相互依存的嵌套结构。没有好的 Prompt，Context 注入的信息无法被正确理解；没有好的 Context，Harness 的 Agent 在信息真空中瞎跑；没有好的 Harness，再好的 Prompt 和 Context 只是沙滩上的城堡。对于工程团队而言，这个嵌套结构意味着：任何一个层次的短板都会成为系统能力的上限。因此，资源的分配不应该追逐「最先进」的概念，而应该优先补足当前系统中最薄弱的层次。

## 实践启示

1. **建立 Harness 的「必要性审查」清单**：每次设计新的 Harness 约束时，明确标注该约束是「因模型能力不足而必需」（模型升级后应移除）还是「业务逻辑本身必需」（持久保留）。每季度回顾一次 Harness 体系，移除那些模型能力已经覆盖但仍然存在的冗余约束，避免 Harness 体系随时间累积变得臃肿低效。

2. **在关键代码路径上强制引入独立的 Evaluator 角色**：当 Agent 输出涉及金额、权限、安全策略等高风险决策时，必须有一个与 Generator 完全独立的 Evaluator 进行独立验证。即使评估成本较高，也应该视为高风险场景的必要工程投入，而非可选项。可以先从规则驱动的 Evaluator 起步，逐步过渡到模型辅助的评估。

3. **对所有面向 Agent 的上下文文档执行「百行压缩测试」**：在将技术规范、决策文档、API 文档接入 Agent 上下文之前，先问自己：如果只能保留 100 行，哪些是让 Agent 正确执行任务绝对必要的信息？超过这个阈值的文档都应该被压缩、切片或建立索引式引用，而非直接整块塞入上下文。

4. **重新校准工程团队的能力评估标准**：从「代码产出量」向「系统杠杆率」迁移。具体的评估维度应包括：能否设计有效的验证闭环、能否构建可靠的 Agent 协作架构、能否建立可持续的 Harness 演进机制。在招聘、晋升和技术方案评审中，将系统设计能力置于个人编码速度之上。

5. **每次系统能力出现瓶颈时，首先诊断是哪一层的问题**：Agent 系统表现不佳时，团队容易第一时间怀疑 Prompt 不够好、或者模型能力不够强，而实际上很多问题的根因在 Context 层（上下文信息错误或缺失）或 Harness 层（缺少有效的验证和反馈机制）。建立系统性的根因诊断流程，先确认是哪一层的问题再行动，可以避免大量的无效 Prompt 调优和模型切换成本。

---

## Ch02.016 System Prompt vs Post-Training：行为约束该写还是该训？

> 📊 Level ⭐⭐⭐ | 6.9KB | `entities/system-prompt-vs-post-training-behavioral-constraints-2026.md`

## 概述

System Prompt 与 Post-training 是两种截然不同的"行为约束注入方式"：前者每次调用重新解码、占输入 token、易被上下文漂移覆盖；后者通过 SFT/DPO 写入模型权重、成为模型先验、行为稳定。**2024 年 Prompt Engineering 思维（把规则塞进 System Prompt）正在被 2026 年的"行为约束 → Post-training"工程范式取代**。

## 深度分析

**System Prompt 路线在 production 环境会"逐步退化"，D91 漂移是真实现象。** 原文用 Claude 做了对比实验：要求"必须用 `<think>` 标签输出思考过程"，D1 100% 遵循、D30 70%、D91 已混入错误标签。**根本原因**：System Prompt 占用输入 embedding 位置，每次调用重新解码，"被告知的知识"在模型内部表征是临时性的，会被长上下文中的新内容稀释、覆盖、漂移。**Post-training 路线**（DPO/SFT 把同样约束写入权重）跟踪 D1-D91 始终 100% 遵循——因为约束已 baked into attention/FFN 权重，成为模型先验。

**"被告知的知识"与"被训练的知识"在权重空间分配完全不同。** System Prompt 实质是输入序列的一部分，模型在每层 attention 把它当作"上下文 token"对待——可被后续 token 覆盖、稀释、注意力分散。Post-training 改变的是 transformer 层本身的 attention / FFN 权重，让模型**在生成第一个 token 之前就已经"知道"该约束**。这一区别是工程级的：前者是"查字典"，后者是"记住"。**任何依赖稳定行为的 production agent 都应该走 Post-training 路线**。

**"硬塞 System Prompt"是反智能，但只对行为约束成立。** 关键洞察：System Prompt 与 Post-training 不是"二选一"，而是"各管一摊"。**当下任务参数**（API 端点、用户偏好、当前任务描述、上下文数据）→ 写 System Prompt；**行为/规则/约束**（输出格式、禁用词、风格要求、合规红线）→ Post-training（SFT/DPO）。一个反例警示："你必须用 JSON 输出"是行为约束，应该 SFT/DPO；"今天用户是 VIP"是当下参数，应该 System Prompt。两者混淆是大量 agent 工程失败的根源。

**"Post-training 让 System Prompt 变薄"是 2026 年的范式转折点。** 当所有行为约束都被 Post-training 处理，System Prompt 只剩任务参数，体积可以大幅压缩——这与 Kimi K2.5 / openJiuwen 等"harness 内化"路线形成共鸣：模型层处理行为，harness 层处理任务，prompt 层只做参数注入。**"prompt engineering"作为独立工种在 2026 Q3 之后会大幅萎缩**，因为"写 prompt"和"训 prompt"被分别自动化和工程化。真正稀缺的是 **Post-training Engineer** + **Agent Harness Engineer**。

## 实践启示

1. **在 production agent 中，先做一次"约束审计"**：把所有写在 System Prompt 里的规则分类成"行为约束"vs"任务参数"，把前者全部迁移到 Post-training（DPO/SFT）。这是把"日 D91 漂移"问题一次性根治的工程动作。

2. **用"行为一致性 SLA"做约束选型判断**：如果某个约束的失败代价是"用户看到的输出违反产品规范"（如禁用词、格式、风格），它必须走 Post-training；如果失败代价是"任务执行偏差"（如 API 端点写错），可以放 System Prompt。代价等级 = 选型优先级。

3. **DPO 是行为约束的"轻量 SFT"**：相比完整 SFT，DPO 只需要 (prompt, chosen, rejected) 三元组，训练成本低、效果对齐人类偏好。如果行为约束有明确"对/错"二元（如"必须 JSON 格式"），DPO 优于 SFT。

4. **不要用"长 System Prompt"做行为管理**：长 System Prompt 会被 attention 机制稀释，行为一致性会随上下文长度下降。如果业务要求"在 50K token 上下文中依然稳定遵循规则"，唯一可靠方案是 Post-training。

5. **把"行为约束迁移"作为 2026 Q3 的工程红线**：随着基础模型升级（K2.5、GLM-5.1、Claude 4.x），Prompt-only 的"行为管理"会越来越脆弱。提前做 DPO/SFT 迁移，是为下半年新模型时代的生产稳定性买保险。

## 关键区分：System Prompt vs Post-training

| 维度 | System Prompt | Post-training |
|------|---------------|---------------|
| 实现位置 | 输入 token 序列 | 模型权重 |
| 每次调用代价 | 重新解码 + 算 attention | 0（已 baked in） |
| 行为一致性 | 弱（被上下文漂移影响） | 强（写进先验） |
| 调整成本 | 修改 prompt 字符串 | 重训 / DPO |
| 适合范围 | 当下任务参数 | 行为规则/约束 |
| 类比 | 查字典 | 记住 |

→ [原文存档](https://mp.weixin.qq.com/s/RkCp-TgitKtSp5Hn9z03Bg)

## 相关实体

- [LLM Post-Training 全景指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/llm-post-training-full-guide.md) — Post-training 方法论基础（RLHF/GRPO/RLVR）
- [Harness + Post-Training bug-finding gap](https://github.com/QianJinGuo/wiki-public/blob/main/entities/how-harnesses-and-post-training-close-the-open-weight-bug-finding-gap-20260606.md) — Harness 与 Post-training 的协同效应
- [Qoder Skills 指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/qoder-skills-完全指南从零开始让-ai-按你的标准执行-v2.md) — 讨论 skill 约束与 prompt 边界
- [文心 Post-training 演进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/baidu-wenxin-post-training-evolution.md) — Post-training 工程实践案例
- [Yann Dubois OpenAI Post-Training 访谈](https://github.com/QianJinGuo/wiki-public/blob/main/entities/yann-dubois-openai-post-training-interview.md) — Post-training 职业路径
- [Kimi K2.5 架构创新](https://github.com/QianJinGuo/wiki-public/blob/main/entities/kimi-k2-5-architecture-innovation-moonshot-2026.md) — 同样强调"模型层处理行为，harness 层处理任务"
- [goodfire predictive data debugging：可解释性指导 post-training 数据塑形](https://github.com/QianJinGuo/wiki-public/blob/main/entities/goodfire-predictive-data-debugging-post-training-anatomy-2026.md)

---

## Ch02.017 深度解析 Hermes Agent 如何实现自进化及其 Prompt / Context / Harness 的设计实践

> 📊 Level ⭐⭐⭐ | 6.9KB | `entities/agent-tools-research.md`

→ [原文存档](https://mp.weixin.qq.com/s/2xFei8dMx99lc-iyrZZrww)

## 摘要

阿里云开发者飞樰撰文深度分析 Hermes Agent（Nous Research，开源，40k+ Stars）的 Self-Evolving 机制，聚焦两条进化路径：Skill 动态生成（外挂式进化）和 RL 训练（内功式进化）。文章同时横向对比了四个 Agent 工具项目：CLI-Anything（32.4k ⭐）、OpenCLI（17.1k）、AutoCLI（2.4k）、AgentBrowser（~25 stars）。

## 核心要点

### Hermes Agent 双轨自进化机制

**外挂式进化：Skill 动态生成**

Hermes Agent 的 Skill 系统允许 Agent 在运行时动态创建、修改和加载新能力模块。这是一种"不改模型权重，扩展能力边界"的轻量级进化方式：

- **Skill 创建**：Agent 在执行任务过程中，可以将重复性操作抽象为可复用的 Skill 文件
- **Skill 注入**：新的 Skill 通过配置文件动态加载，无需重新训练模型
- **Skill 演进**：已有 Skill 可以被 Agent 自行修改和优化，形成自我改进循环

这种机制的核心优势是**零成本扩展**——不需要 GPU 训练，不需要数据标注，Agent 通过实际使用经验自动积累能力。

**内功式进化：RL 训练**

与外挂式进化互补的是基于强化学习的模型内部优化：

- 通过收集 Agent 执行任务的成功/失败信号作为 reward
- 对基础模型进行 RL 微调，提升特定场景下的推理和决策能力
- 这种进化更深层但也更昂贵，需要计算资源和高质量反馈数据

### Prompt / Context / Harness 三层架构

**Prompt 层：指令设计**

- System Prompt 定义 Agent 的人格、能力边界和行为规范
- Skill-specific Prompt 为每个能力模块提供执行指令
- 动态 Prompt 组装：根据当前任务上下文组合相关 Skill 的 Prompt

**Context 层：信息管理**

- 短期记忆：当前对话和任务上下文
- 长期记忆：跨会话的知识积累（通过 Memory 系统）
- 外部知识：文件系统、数据库、API 等运行时可访问的信息源

**Harness 层：执行框架**

- 工具调用调度：决定何时使用哪个工具
- 权限控制：不同操作的安全边界
- 错误处理与重试：异常情况的恢复策略
- 人机协作：何时请求人类确认

### Agent 工具项目横向对比

| 项目 | Stars | 核心定位 | 特点 |
|------|-------|----------|------|
| **CLI-Anything** | 32.4k | 通用 CLI Agent | 最广泛的命令行自动化 |
| **OpenCLI** | 17.1k | 开源 CLI 框架 | 社区驱动的 CLI Agent |
| **Hermes Agent** | 40k+ | 自进化 Agent | Skill 动态生成 + RL 训练 |
| **AutoCLI** | 2.4k | 轻量 CLI 工具 | 简化的命令行自动化 |
| **AgentBrowser** | ~25 | 浏览器 Agent | 浏览器自动化方向 |

### 自进化的两难：外挂 vs 内功

Hermes Agent 的双轨进化策略实际上反映了 Agent 能力扩展的根本张力：

- **外挂式进化（Skill）**：快速、低成本、可解释，但受限于基础模型的理解能力上限。如果基础模型无法理解某个复杂概念，再好的 Skill 框架也无法突破这个天花板。
- **内功式进化（RL）**：深层、持久、可突破模型能力边界，但昂贵、缓慢、需要高质量数据。

最优策略是两者结合：用 Skill 快速覆盖新场景，用 RL 持续提升核心能力。这与 持续学习 的研究方向一致。

### Harness Engineering 的兴起

Hermes Agent 的 Harness 层设计体现了 Harness Engineering 的核心理念：Agent 的能力不仅取决于模型本身，更取决于围绕模型构建的执行框架。Harness 决定了：

- Agent 能看到什么信息（Context 管理）
- Agent 能做什么操作（工具注册）
- Agent 的行为边界（权限控制）
- Agent 如何从错误中恢复（容错机制）

这解释了为什么同样基础模型在不同 Harness 下表现差异巨大。

### Skill 生态的网络效应

Hermes Agent 的 Skill 系统具有潜在的网络效应：

1. 用户创建 Skill → Skill 被社区复用 → 更多用户参与
2. 更多 Skill → Agent 能力更强 → 吸引更多用户
3. 更多使用数据 → 更好的 Skill 质量 → 正向循环

这种模式类似插件生态（VS Code Extensions、Chrome Extensions），但有一个关键区别：Agent 的 Skill 可以被 Agent 自己创建和修改，形成自我加速的进化飞轮。

## 实践启示

1. **Skill 优先策略**：对于快速扩展 Agent 能力，Skill 动态生成是最高效的路径——无需训练，即时生效
2. **Harness 是核心竞争力**：投资于 Context 管理、工具调度、权限控制等 Harness 层设计，而非仅关注模型能力
3. **渐进式进化**：先用 Skill 覆盖场景，收集数据后再用 RL 微调，避免盲目训练
4. **评估 Agent 框架时关注 Harness**：选择 Agent 框架时，Harness 层的工程质量比底层模型选择更影响实际效果
5. **构建 Skill 复用机制**：企业内部应建立 Skill 库和复用流程，避免每个团队重复造轮子

## 相关实体

- Harness Engineering
- [Karpathy: Vibe Coding 到 Agentic Engineering](ch04/009-karpathy-vibe-coding-agentic-engineering.html)
- [Claude Code 源码中的 Agent Harness 构建之道](https://github.com/QianJinGuo/wiki-public/blob/main/entities/深入理解-claude-code-源码中的-agent-harness-构建之道.md)
- [Claude Code 源码核心机制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/两万字详解claude-code源码核心机制.md)
- [Harness Engineering 概念解析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/一文带你弄懂-ai-圈爆火的新概念harness-engineering.md)
- [OpenClaw 完全指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-完全指南这可能是全网最新最全的系统化教程了32w字建议收藏.md)
- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/mlops-training-inference.md)

---

## Ch02.018 Codex 上下文工程 — Prompt Layout + Append-only + Latent Space Moat（LastWhisper 解读）

> 📊 Level ⭐⭐⭐⭐ | 19.7KB | `entities/codex-context-engineering-lastwhisper-thinking-in-context.md`

LastWhisper（北大计算机硕士）"Thinking in Context" 系列开篇，对 OpenAI 工程博客《Unrolling the Codex agent loop》的深度解读。聚焦**世界级 Coding Agent 中的前沿上下文工程实践**，提出两条核心观察：

1. **The Architecture of State** — 缓存友好 Prompt Layout + Append-only 状态管理
2. **The Latent Space Moat** — 应用层 vs 基础设施层压缩能力的不对称

- [原文存档](https://zhuanlan.zhihu.com/p/2001069051741496397)

### 核心观点：确定性是性能的前提

Codex 的 Prompt Layout 设计揭示了一个反直觉但普适的工程真理：在 Prompt Caching 机制下，**缓存命中的关键不是内容质量，而是前缀稳定性**。变化频率最低的内容（System Message / Tools / Instructions）置顶，变化频率最高的内容（对话历史 / Tool Traces）置底——这个排序不是经验法则，而是由严格前缀匹配机制推导出的必然约束。OpenAI Codex 引入 MCP 时因工具枚举顺序不一致导致 cache miss，代价是完整重计算。这对所有依赖 Prompt Caching 的 Agent 系统都有警示意义：[Context Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md) 的核心工程约束是**确定性排序**。

### 技术要点：Append-only 是 Event Sourcing 在 Agent 状态管理中的具体实现

"State is a projection of events" 这个命题在 Codex 中不是隐喻，而是工程实现。状态变化时追加新消息（而非原地修改）带来的两大收益：前缀不变 → 缓存命中；因果链保留 → 可推断意图。这与 [Claude Code Vs Codex Context Architecture 02](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-vs-codex-context-architecture-02.md) 中描述的 Claude Code 激进 Context Editing 路线形成鲜明对比。两种流派并非优劣之分，而是不同工程约束下的取舍：Append-only 更保守、工程友好，适合需要稳定缓存的生产系统；Context Editing 更激进、Token 精简，但前缀破坏带来工程复杂度。

### 实践价值：压缩能力的不对称是结构性的，应用层应聚焦可控部分

应用层压缩（Semantic Compression）与基础设施层压缩之间存在结构性信息不对称：厂商可访问注意力分布、海量真实对话数据、专用 Fine-tuned 压缩模型，应用层无法复制这一优势。理解这一点后，[Anthropic Prompt Caching Claude Code](ch01/199-anthropic-prompt-caching-claude-code.html) 等应用层实践的价值在于：放弃追求"更好的压缩"，转而聚焦**缓存友好的 Prompt Layout + 显式的 Compress/Select 策略**，这是应用层真正能控制的部分。context-kit 开源工具正是这一哲学的教学实现。

### 深层博弈：Append-only 需要模型专门适配

LastWhisper 提出的两个方向值得深思：OpenAI 是否专门训练了模型适应 Append-only？相较 Claude Code 的 Context Editing，这种保守路线是否更有工程可维护性？前者指向模型定制成本，后者指向架构选择。如果 Append-only 需要专门模型训练才能避免上下文膨胀带来的性能衰退，那么这意味着**状态管理策略不是纯工程问题，还受模型训练目标约束**。

### 技术判断：Latent Compression 更可能是信息增强的 Semantic Compression

尽管"/responses/compact"端点使用"latent understanding"措辞，但向量表征与模型架构深度耦合使得纯 Latent Compression 的工程可行性存疑。更合理的推断是：厂商做的是 Semantic Compression，但拥有关键信息优势（注意力分布、真实数据、专用压缩模型）。这与 [Harness Engineering](ch05/061-harness-engineering.html) 实践中"在不确定黑盒内部机制时，聚焦可控部分"的原则一致。

## 实践启示

1. **将 Prompt 排序视为工程约束而非实现细节**：在设计任何 Agent 上下文架构时，先确定变化频率梯度——低变化内容（System Prompt、工具定义）置顶，高变化内容（对话历史）置底。任何动态工具列表（如 MCP notifications/tools/list_changed）的处理都需要特别设计以保护前缀稳定。

2. **状态变化优先 Append-only 策略**：当 Agent 状态变化时（切换目录、审批模式、权限配置），追加新消息而非修改现有消息。这最大化 Prompt Cache 命中，同时保留完整因果链用于意图推断。结合 [Agent Harness Context Management Working Set](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-context-management-working-set.md) 中的工作集管理实践，Append-only 是生产级 Agent 状态管理的推荐方案。

3. **在工具枚举顺序上强制规范化**：MCP 工具列表、Function Calling 顺序必须硬编码到系统 Prompt 中，禁止动态排序。如果工具列表可能动态变化，必须设计独立的缓存分区策略，避免污染稳定的缓存前缀。

4. **用 context-kit 建立上下文工程直觉**：Compress/Select/Memory 三模块覆盖了应用层上下文管理的核心场景。在生产环境中，这些模块的简化版本（如基于 LLM 的语义压缩 + JIT 文件检索 + 文件系统卸载）可以实现"do the simplest thing that works"。

5. **警惕压缩能力的结构性不对称**：应用层压缩永远受限于信息劣势。不要过度投入"更智能的摘要算法"，而是将资源投入到缓存友好的架构设计和规范的 [Harness Engineering](ch05/061-harness-engineering.html) 实践中——这些是真正可控且可累积的工程优势。

## 1. Architecture of State

### Prompt Layout — 缓存友好排序

Codex 的 Responses API 请求按 `input` 字段组装，原则：**变化频率最低置顶，最高置底**：

1. System Message / Tools / Instructions（稳定）
2. 对话历史 / Tool Traces（动态）

**核心机制**：Prompt Caching 要求**严格前缀匹配**。任何位置变动（哪怕调整两个 Tool Definition 顺序）都使后续所有 Token 缓存失效，触发完整重计算。

**工程教训**：Codex 早期引入 MCP 时未保证工具枚举顺序一致 → cache miss。`notifications/tools/list_changed` 中途响应同样破坏前缀。

**效果**：采样成本从理论二次增长降低为**近似线性**。

### Append-only — 不修改，只追加

当 Agent 状态变化（切换审批模式、切换工作目录），Codex **不修改**已发送消息，而是**追加新消息**：

- 工作目录变了 → 追加 `role=user` 消息 + 新 `<environment_context>`
- sandbox 配置变了 → 追加 `role=developer` 消息 + 新 `<permissions instructions>`

**类比**：DB migration — 不直接修改生产 Schema，而是追加 Migration 文件。**"State is a projection of events"**（Event Sourcing pattern）。

**收益**：

1. 前缀始终不变 → 最大化 Prompt Cache 命中
2. 因果链保留 — 切换目录"为了运行测试"是显式事件，可推断意图

**代价与取舍**：

- 上下文膨胀 → 冲突/噪声影响性能
- 保留因果链 vs 控制信噪比之间的张力
- LastWhisper 两个推测方向：(a) OpenAI 专门训练让模型适应 Append-only；(b) Append-only 是更传统保守模式，相较 Claude Code 激进的 Context Editing 更工程友好

**两种流派对比**：

| 流派 | 代表 | 核心动作 | 收益 | 代价 |
|---|---|---|---|---|
| **Append-only** | OpenAI Codex | 状态变化时追加 | 前缀稳定，缓存命中 | 上下文膨胀 |
| **Context Editing** | Anthropic Claude Code | 原地修改/剪枝 | Token 精简 | 前缀破坏，工程复杂 |

## 2. Latent Space Moat — 压缩能力的不对称

### 两种 `encrypted_content`

Codex 实际使用了 `encrypted_content` 字段，但承担**两种不同用途**：

| 用途 | 字段 | 含义 | 触发 |
|---|---|---|---|
| **推理链保护** | `type: "reasoning"` | 加密 o1/R1 思考过程 | API 协议要求 |
| **上下文压缩** | `type: "compaction"` | 厂商压缩策略载体 | 上下文达阈值调用 `/responses/compact` |

第一种不是压缩机制 — 是**隐私保护**载体，客户端只看到 `summary`，加密推理链原样回传供服务端恢复状态。

第二种才是真正压缩。原文："preserves the model's latent understanding of the original conversation"。

### Semantic vs. Latent Compression

**应用层 — Semantic Compression**：

- 应用开发者能实现的压缩 = **语义重构**（LLM 摘要）
- 始终是原始信息的有损投影
- 推理微观逻辑、注意力分布模式在文本摘要中不可避免丢弃
- 通用模型预训练目标并非上下文压缩
- Cognition AI（Devin）会 Fine-tune 专用压缩模型，但仍操作文本表征

**基础设施层 — Latent Compression（推测）**：

`/responses/compact` 端点未公开。一个自然推测：厂商在模型**隐空间**对高维向量做压缩：

- 文本是模型内部状态的**低维投影**
- 隐空间含更丰富信息结构
- 高维空间有损压缩上限更高

**但有重要工程问题**：

- 向量表征与模型架构深度耦合
- 隐空间维度/结构/语义取决于具体模型版本
- 模型升级 → 向量表征失效 → 需重新适配

**更可能的实现 — 有信息优势的 Semantic Compression**：

`/responses/compact` 本质上仍是 Semantic Compression，但厂商有应用开发者不具备的信息优势：

1. **模型内部状态访问** — 注意力分布、token 关注度用于指导压缩决策
2. **海量真实用户数据** — 优化压缩策略
3. **专用 Fine-tuned 压缩模型** — 训练数据规模和多样性远超应用层

## 3. context-kit 教学工具

LastWhisper 开源了 **context-kit**（教学原型），覆盖三大模块：

| 模块 | 实现 |
|---|---|
| **Compress** | `compress_by_rule`（对齐 Claude Context Editing API 结构化剪枝）+ `compress_by_model`（LLM 语义压缩） |
| **Select** | JIT Context 渐进式检索（`list_dir` → `grep` → `read_file`） |
| **Memory** | 上下文卸载到文件系统（Write 策略持久化） |

哲学：**Do the simplest thing that works!**

## 关键 takeaway

1. **确定性是性能的前提** — 缓存友好 = 前缀稳定 = 工程约束
2. **Append-only vs Context Editing** — 两种流派长期共存（Codex 偏前者，Claude Code 偏后者）
3. **能力不对称是结构性的** — 应用层做 Semantic Compression，基础设施层有信息优势的 Semantic Compression
4. **Codex 实测效果** — 采样成本从二次增长降低为近似线性
5. **State is a projection of events** — Event Sourcing pattern 在 Agent 状态管理中的应用

## 与既有相关实体的关系

| 实体 | 关系 | 区分 |
|---|---|---|
| `entities/claude-code-vs-codex-context-architecture-02` | Codex context 架构对比 | 5 层压缩管道 vs 容器文件系统；本篇聚焦 Codex 单边 + Append-only 核心 + Latent Moat |
| `entities/claude-code-context-engineering-anthropic-thariq` | Claude 上下文工程 | Anthropic 视角；本篇 OpenAI Codex 视角 |
| `entities/context-engineering-three-memory-paradigms` | 3 种 Memory 方案 | 评测对比；本篇工程实践 + 流派对比 |
| `entities/llm-observability-4-layer-model` | 4 层可观测性 | 偏运维；本篇偏架构 |

## 相关链接

- OpenAI: [Unrolling the Codex agent loop](https://openai.com)
- Anthropic: [Effective context engineering for AI agents](https://anthropic.com)
- LastWhisper 博客: Context Engineering，一篇就够了
- LastWhisper 博客: Just-in-Time Context，一篇就够了
- context-kit: GitHub Repository
- [原文存档](https://zhuanlan.zhihu.com/p/2001069051741496397)

## 相关实体

- [反向审计 prompt 范式 — 从 vb 50 行 codex 自我蒸馏到 5 行核心](https://github.com/QianJinGuo/wiki-public/blob/main/entities/reverse-audit-prompt-paradigm-codex-5-line-version.md)
- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/prompt-engineering-guide.md)

## 2026-09-05 SUPP：Codex 上下文管理切窗机制（若飞源码/PR 级拆解）

> 本文档早期版本聚焦 LastWhisper 对 OpenAI《Unrolling the Codex agent loop》的解读（Prompt Layout / Append-only / Latent Space Moat）。2026-09-05 若飞《Codex 的「记忆」大改？上下文管理架构拆解》补充了 Codex CLI 0.153.0 实验性 context management 的**切窗协议与状态分离**维度——四类状态分离框架、new_context/notes/history 工具协议、状态所有权表，扩展了本实体从「压缩/缓存」到「切换窗口 + 交接」的完整上下文管理图景。

### 四类状态分离：把「记忆」拆成不同生命周期

Codex 实验性 context management 将常被统称为「记忆」的内容拆成四类状态，每类的写入者、保存时长、覆盖规则与冲突裁决权都不同：

| 状态 | 载体 | 作用 | 生命周期 |
|---|---|---|---|
| 当前工作集 | context window | 眼前推理材料（系统指令/用户要求/最近对话/工具结果） | 当前窗口，token 预算管理 |
| 交接状态 | notes | 跨窗口接手所需信息（目标/关键决策/当前进展/下一步），带 window ID + item ID 指向原始记录 | 跨窗口，模型筛选整理（检查点而非前情提要） |
| 会话历史 | history | 旧窗口原始条目，可列出/读取/字面子串搜索 | 持久，搜索非语义检索（区分大小写） |
| 外部权威事实 | 代码/Git/CI/工单 | 任务真实状态，不受切窗影响 | 独立于模型上下文 |

核心判断：这组实现没有为 Agent 凭空增加「永久记忆」，而是**把不同可信度与生命周期的状态分开放置**。模型上下文丢失可从 notes/history 重建；但外部副作用（已发请求/已提交事务）不能靠笔记猜测——结果未知时先查权威系统，再依据幂等键决定重试。

### 切窗协议：模型主动收尾 + Harness 硬边界兜底

切窗由模型与 Harness 共同完成，关键 PR：token budget context feature（#27438）、new context window tool（#27488）、fallback phase before automatic context rollover（#33255）、history and notes tools（#39827）、inject history notes hints（#40539）、experimental context management activation（#42385）。

两层的分工：模型判断「这一阶段是否做完」「哪些决策值得交接」（可主动调用 new_context）；运行时盯住 token 余量——余量跨阈值提醒一次、基础预算耗尽注入兜底提示并留出缓冲让模型写 notes，缓冲耗尽才自动切换。thread_hint 注入上限 4000 字节、单项注入上限 1 万 token——系统不追求把旧内容重新塞满窗口，而是「短交接 + 原始历史按需读取」在预算内恢复。

### 与 compaction 的关系：不同成本的读取层级

摘要适合快速恢复全局，notes 适合保存明确交接状态，history 适合核对关键细节——compaction 与硬切窗口不是互斥路线，而是同一条运行链路上不同成本的读取层级。Codex 当前实验采用「短交接 + 原始历史」组合，官方产品仍保留 compaction（0.150.1 还有 remote compaction 修复），与本文档早前记录的 `encrypted_content` compaction 载体并存。Hermes 也在加入 compaction recall（回看压缩前内容），两个项目给压缩/交接后的内容都留了回查原始记录的入口。

---

## Ch02.019 Headroom：上下文压缩与缓存稳定化框架（live zone + CCR + RawValue 字节级 patch）

> 📊 Level ⭐⭐⭐⭐ | 16.1KB | `entities/headroom-context-compression-cache-stabilization.md`

# Headroom：上下文压缩与缓存稳定化框架

> 原文存档：[原文存档](https://mp.weixin.qq.com/s/gNW3rrCUl9wRxs1BJ_vpnA)

Headroom 切的是 Agent 工具链里**最痛的点**：tool output 把上下文打爆。测试日志、grep 结果、API 返回、DB rows、长 diff——这些是真正让 context window 告急的内容。**Headroom 在工具输出进入 LLM 之前，先做压缩和缓存稳定化**。

## 形态：库 / Proxy / Wrapper / MCP Server

- 覆盖 Claude Code、Codex、Cursor、Aider、Copilot、OpenAI/Anthropic/Bedrock 等多 provider
- **Rust 主路径**最值得研究（其他 wrapper 是补全）
- 主要模块：
  - **`crates/headroom-proxy`**：请求入口，按 provider endpoint 分派给上游
  - **`crates/headroom-core`**：live-zone 压缩、内容类型检测、CCR store、tokenizer gate

**设计原则**：**先保证哪些字节不能碰，再谈哪些内容可以压**——目标**不是写一个通用 summarizer**。

## 核心技术 1：Live Zone

**传统直觉** = 哪里 token 多压哪里。
**Headroom 思路** = **哪里改了不会破坏 provider prompt cache？**

对 **Anthropic `/v1/messages`** 来说，根据 `cache_control` 计算 **frozen floor**：

| 区域 | 能否压缩 |
|------|---------|
| floor 之前的消息（缓存前缀） | ❌ 不能动 |
| 最新 assistant continuation | ❌ 不能动（下一次响应继续基础） |
| 最新 user message 里的 tool result / 长文本 | ✅ 真正能动的 |

**这解释了它为什么不像很多上下文压缩方案那样直接删历史消息**——历史消息一旦在上游出现过，后续再改就可能导致 prefix cache miss。**你以为省了 token，可能实际把缓存收益打没了**。

## 核心技术 2：RawValue 字节级 patch

**不是**把请求 JSON parse 成 `Value` 后整体重序列化。

`live_zone.rs` 用 `serde_json::value::RawValue` 找到 block 内容在原始请求里的 **byte range**，然后**只替换这一段**。

未修改的 bytes 原样复制：
- 空格
- key 顺序
- 数字格式
- Unicode escape

**关键洞察**：**JSON 语义等价不代表 provider cache key 等价**——这个坑很多系统会踩。

## 4 类内容压缩器

| 压缩器 | 目标 | 关键策略 |
|--------|------|---------|
| **SmartCrusher** | JSON array（API response / DB rows / 搜索索引） | 表格化、采样、去重；保留异常、首尾、重要项 |
| **LogCompressor** | 日志 | 保留 error/fail/warning/stack trace/summary；裁掉重复 INFO |
| **SearchCompressor** | 搜索结果（`file:line:content`） | 按文件聚合；每文件限制命中数；保留首尾 + 高分 match |
| **DiffCompressor** | diff | 限制文件数 / hunk 数 / context 行数；lockfile + 纯空白 hunk 视为低价值噪声 |
| **CodeCompressor** | 源码 | **no-op**（默认）——压函数体容易误伤 |

**CodeCompressor 默认 no-op 的设计哲学**：用户让 Agent 读代码，通常就是要模型看代码本身。

## 核心技术 3：CCR（Compress-Cache-Retrieve）

让压缩**可恢复**的机制：

1. 压缩器把短视图放进 prompt
2. 原文存到本地 store
3. 压缩文本后追加 `<<ccr:HASH>>` marker
4. 模型需要完整数据时，**通过 retrieval 工具按 hash 取回**

**不是魔法意义上的无损压缩**——LLM 当下看到的是压缩视图，系统端保留原文，模型有机会取回。

**风险**：
- 模型没有意识到需要取回
- CCR store 丢失
- 细节就不会出现在模型当前视野

**默认配置**：
- **CCR TTL = 5 分钟**
- 后端：in-memory / SQLite / Redis
- 单进程实验用 in-memory，生产多 worker 用共享后端

## 核心技术 4：缓存稳定化

**不一定减少当前请求 token，但能减少后续重复计算**。

### Tools 数组排序
很多 SDK 工具收集顺序受 map/set 迭代影响，**同一组工具每次顺序不同** → provider cache miss。Headroom **按工具名稳定排序**。

### JSON Schema key 递归排序
Schema 语义没变，但 **bytes 稳定了**。

### Provider-specific marker 注入

| Provider | 注入字段 | key 来源 |
|----------|---------|---------|
| **Anthropic PAYG** | `cache_control` | 自动加 |
| **OpenAI PAYG** | `prompt_cache_key` | `model + system + tools`（**刻意排除 user/assistant message**——把用户轮次算进去会让 key 每轮都变） |

**Auth mode gate**（重要安全设计）：
- OAuth / subscription 模式**不会乱加**这些字段
- 已有客户自己设置的 marker / key **优先保留**

## 副作用与风险（被显式工程化）

| 风险 | 缓解机制 |
|------|---------|
| 压缩视图漏细节（rows / hunk / matches / log lines 被裁掉） | CCR 可取回 + 模型可主动调 retrieval |
| CCR marker 占 token + retrieval 额外 tool call + 延迟 | 保守默认阈值（log/diff < 50 行不 offload；search < 10 match 不 offload） |
| Proxy 缓冲请求体（流式 → buffer），超出 `compression_max_body_bytes` 会 413 | 这是代理架构绕不开的成本 |
| 读源码场景收益有限 | CodeCompressor 默认 no-op，明确**承认此场景的压缩边界** |
| 缓存稳定化主动改请求体（byte mutation） | PAYG gate + customer-value-wins gate |

**做审计、安全取证、逐行核对时，第一个风险不能忽略**。

## 部署指南

### 适合先接的场景
- 测试日志多
- grep 多
- 大 JSON 多
- 长 diff 多
- 修 bug、跑测试、搜代码、分析 API 返回

### 不适合全局开启的场景
- 短问答
- 轻量聊天
- 主要读源码
- 强审计任务
- 没有可靠 CCR store 的多 worker 部署

### 监控指标
- tokens freed
- RejectedNotSmaller
- CCR retrieve miss
- cache hit
- p95 latency

**压缩系统最怕：表面省 token，实际把 cache 和语义搞坏了**。Headroom 源码里最值得学的地方，恰好就是**没有只看 token savings**。

## 价值定位

> "Headroom 的价值不止 README 里的 60-95% fewer tokens，更在源码里那套边界感。"

**把上下文节省拆成两件事**：
1. **tool output 变瘦** → 减少当前请求输入
2. **缓存前缀变稳** → 减少后续重复付费

**真正应该压的是**：日志、搜索结果、大 JSON、长 diff。
**源码和普通文本，很多时候保持原样更正确**。

## 与现有实体差异化

- [Agent Harness Context Management Working Set](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-context-management-working-set.md) — Agent 上下文管理的 working set 模式（**主线程 vs 后台 subagent**）。Headroom 是 **proxy/中间层方案**，在工具输出层做字节级压缩。两者**问题域重叠但切入点完全不同**。
- [Agent Context Management Architecture Patterns](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-context-management-architecture-patterns.md) — 上下文管理的架构模式总览（截断 / 总结 / 滑动窗口 / RAG）。Headroom 走**更激进的字节级 patch + cache-aware 路径**，是这些模式之外的"代理层"独立分支。
- [Openclacky Harness Prompt Cache](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclacky-harness-prompt-cache.md) — OpenClacky 提示词缓存策略。Headroom 与之同源思想（**关注 prompt cache key 稳定性**）但实现不同：OpenClacky 是 SDK 层策略，Headroom 是 proxy 层工具。
- [Ai Context Layer Kgc 2026](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-context-layer-kgc-2026.md) — AI 上下文层（知识图谱增强）。Headroom 走**字节级压缩**而非**结构化知识层**，定位互补。
- [Claude Code Prompt Context Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-prompt-context-harness.md) / [Claude Code Session Management 1M Context](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-session-management-1m-context.md) — Claude Code 的上下文管理实现。Headroom 是**通用 provider 方案**（覆盖 Claude Code / Codex / Cursor / Aider / Copilot），Claude Code 上下文管理是**单 provider 内部**方案。
- [Claude Code Vs Codex Context Architecture 02](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-vs-codex-context-architecture-02.md) — Claude Code vs Codex 上下文架构对比。Headroom **同时支持两者**（作为 proxy 层），可以视为这两者的**第三方统一优化层**。
- [Agent Reliability Context Drift Tool Hallucination](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-reliability-context-drift-tool-hallucination.md) — 上下文漂移导致工具幻觉。Headroom 的 cache stabilization 间接缓解上下文漂移（cache 命中率高 → 历史更稳定）。
- [Agentic Ai Infrastructure Practice Series Nine Context Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentic-ai-infrastructure-practice-series-nine-context-engineering.md) — Agent 上下文工程实践系列。Headroom 是**具体实现**之一，可作为该系列的"proxy 层"案例补充。
- [Cl Bench Life Tencent Context Learning](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cl-bench-life-tencent-context-learning.md) — 腾讯 CL-Bench 长上下文学习基准。Headroom 是**生产工具**（不是基准），与之形成"评估 vs 优化"对照。
- [Alibaba Eventhouse Enterprise Agent Context](https://github.com/QianJinGuo/wiki-public/blob/main/entities/alibaba-eventhouse-enterprise-agent-context.md) — 阿里云 EventHouse 企业级 Agent 上下文。Headroom 走**proxy 通用方案**，EventHouse 走**企业级云服务方案**。

## 相关主题

- 上下文工程 — [Agentic Ai Infrastructure Practice Series Nine Context Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agentic-ai-infrastructure-practice-series-nine-context-engineering.md)
- 提示词缓存策略 — [Openclacky Harness Prompt Cache](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclacky-harness-prompt-cache.md)
- Agent 工具链 — [Agent Harness Architecture Design Production Guide](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-architecture-design-production-guide.md)
- VibeCoder / Vibe编码 公众号其他文章 — [Cli Mcp Skill Architecture Decision Vibecoder](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cli-mcp-skill-architecture-decision-vibecoder.md) / [Impeccable Vibe Design Philosophy Anomaly](https://github.com/QianJinGuo/wiki-public/blob/main/entities/impeccable-vibe-design-philosophy-anomaly.md) / [Impeccable Vibe Design Philosophy Anomaly](https://github.com/QianJinGuo/wiki-public/blob/main/entities/impeccable-vibe-design-philosophy-anomaly.md)
- MCP server 模式 — [Cli Mcp Skill Architecture Decision Vibecoder](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cli-mcp-skill-architecture-decision-vibecoder.md)

## 深度分析

- **"live zone" 概念重新定义了"哪里压"**：传统上下文压缩以"token 数量"为目标函数，**但 Anthropic / OpenAI 都有 prompt cache**，改 cache 范围内的内容会让 cache miss，**实际开销可能更大**。Headroom 提出的"先问哪里改了不破坏 cache"是**对 prompt cache 经济的工程化承认**——把 token optimization 升级为**token + cache cost 的联合优化**。这对所有走 provider prompt cache 的 Agent 都有普适价值。

- **RawValue 字节级 patch 是"JSON 语义 vs 字节"分离的工程胜利**：很多 LLM gateway 工具会 `parse → modify → serialize`，看起来无害，但**数字格式、Unicode escape、key 顺序**这些字节差异都会让 provider hash 出新 cache key。**Headroom 用 `serde_json::value::RawValue` 直接定位 byte range 做替换**，是一个看似简单但需要深谙 serde 设计才能想到的实现。这个模式可推广到所有"中间层修改请求"场景（logging / monitoring / proxy / guardrail）。

- **CCR 是"压缩可恢复"的优雅折中**：完全无损压缩不可能（信息论下界），完全有损压缩会丢信息。**CCR 把"压缩视图 + 原文本地 + 按需取回"组合在一起**，是一种**概率无损**——LLM 不需要原文时是省 token 的，需要时通过 retrieval 工具主动拉回。**关键风险是"模型不主动取"**——这需要配合 prompt 设计告诉模型"如果你发现需要细节，调 `retrieve(<<ccr:HASH>>)`"。这是压缩代理 + LLM 协作的关键设计点。

- **CodeCompressor 默认 no-op 揭示"不是所有内容都该压"**：很多上下文压缩工具一刀切对所有内容压缩，结果压函数体、压注释、压空行，导致代码语义损坏。**Headroom 明确"代码就保持原样"**——这是**对"压缩工具应主动放弃某些场景"的工程化承认**。这种"克制"反而让工具在正确场景下更值得信任。

- **Auth mode gate + customer-value-wins 体现"中间层修改请求"的伦理边界**：Headroom 会**主动改请求体**（加 cache marker、排序 tools、排序 schema）。如果用户已经在 OAuth / subscription 模式，Headroom **不会自动注入**这些字段；如果用户已经设了 cache marker，Headroom **优先保留**用户的设置。这是对"中间层有责任不破坏用户已有配置"的**伦理化设计**——比"我能改我改"的工具更可信赖。

## 实践启示

- **评估上下文压缩工具时，看 cache cost 而非 token savings**：Headroom 监控指标里 `cache hit` 跟 `tokens freed` 并列——这是核心提示。**省 token 但破 cache 的工具可能反而更贵**。评估压缩工具时务必看 provider cache 命中率变化。

- **设计中间层时优先用 RawValue 字节级 patch 而非 JSON 重序列化**：所有 LLM gateway / 监控 / 代理工具，**直接定位 byte range 修改**比 `parse → modify → serialize` 更安全（保留 cache key 稳定性）。这是 Headroom 给整个 LLM 工具链的工程范式贡献。

- **给 LLM 配 retrieval 工具来支持"概率无损"压缩**：如果自己做上下文压缩，配合 `<<ref:HASH>>` marker + retrieval 工具，让模型在需要细节时主动取回。**关键是 prompt 设计要让模型知道"可以取"**——这比"压缩后什么都不做"更安全，比"完全不压缩"更省 token。

- **Agent 工具链加入"压缩代理层"作为可插拔中间件**：Headroom 的 proxy / wrapper / MCP server 模式让它**对应用层透明**——现有 Agent 不用改代码就能获得压缩 + 缓存稳定化收益。如果你在构建 Agent 平台或 IDE 集成层，**优先考虑 Headroom-style 透明代理**而非侵入 SDK 修改。

## 架构图
→ （架构图待生成: C4 架构图）

---

## Ch02.020 视觉 AI 的下一前沿是代码：a16z 关于视觉生成范式转移的论述

> 📊 Level ⭐⭐⭐⭐ | 14.3KB | `entities/a16z-com-the-next-frontier-of-visual-ai-is-code.md`

→ [原文存档](https://a16z.com/the-next-frontier-of-visual-ai-is-code/)

## 摘要

a16z 的署名文章（2026 年 6 月 2 日）提出一个核心论点：视觉 AI 正在从"像素生成"转向"代码生成"。过去几年视觉 AI 主要由像素评判——扩散模型生成更美的图像、视频、3D 场景即代表更好的模型。但对许多视觉相关任务（图形设计、UI 设计、3D 建模），用户真正需要的是可迭代、可编辑、可交接的产物——图层、组件、关键帧、几何结构。当前最有意思的视觉 AI 工具已经停止直接生成最终输出，转而生成背后的源代码。这一转变释放了像素原生模型无法企及的可编辑性、迭代性与反馈循环。

## 核心要点

1. **两大视觉生成栈**：① 像素原生（pixel-native）——直接生成图像/视频，擅长纹理、光照、氛围、真实感；② 代码原生（code-native）——生成可被其他引擎执行或渲染的表征（SVG、HTML/CSS、Lottie JSON、Blender 脚本、USD scene graph、shader、游戏引擎场景等）。
2. **关键差异在于"生成之后"**：生产工作流关心生成后的可编辑性、可复用性、可版本化、可集成性、可验证性。代码原生生成将视觉产物变成可被设计师、工程师和 Agent 共同操作的工件。
3. **代码 → 渲染 → 检查 → 修订**：代码原生生成形成精确的循环，模型生成工件、渲染、看到错误、打补丁源——而非简单地"重新采样"。这与 Agent 循环设计 的核心模式一致。
4. **测试时计算（test-time compute）的天然契合**：代码原生生成处于"受益于生成更多 token 与测试时计算"的直线上，模型在闭环可验证环境中调试视觉程序，而非仅仅采样更多图像。
5. **市场结构围绕运行时分化**：每个运行时（浏览器、SVG 渲染器、Lottie player、Blender、游戏引擎、模拟器）构成不同的市场楔子，因为每个都有自己的源表征、反馈循环与生产工作流。
6. **3D 是下一前沿**：3D 资产不能仅"看起来对"——它需要一致的底层 3D 表征（几何、材质、部件层级、场景上下文），VIGA 与 Articraft3D 是这一方向的代表项目。
7. **三大未解问题**：① 每个领域哪种表征会胜出？② 是否需要重新构建引擎与渲染器？③ 多少视觉品味可以通过约束、测试与反馈循环捕获？

### 范式转移：从像素到代码

过去几年视觉 AI 的主流范式是**像素原生生成**——模型在潜空间中直接生成图像或视频，最终通过解码器输出像素。评判标准是"最终像素好不好"。这种范式在氛围、纹理、真实感、电影级镜头生成上具有统治地位。

但对**生产工作流**而言，这远远不够：

- 设计师需要**图层、组件、可交接的源文件**，而不是一张漂亮的截图。
- 动画师需要**时间曲线、关键帧、可编辑的运动参数**，而不是一段视频。
- 3D 艺术家需要**几何、材质、光照、相机、场景结构**，而不是一张渲染图。

这正是代码原生生成的用武之地——模型生成的**不是像素，而是产生像素的程序**。程序可能是 SVG 文件、HTML/CSS 布局、React 组件、Lottie JSON 文件、Blender 脚本、USD scene graph、shader、游戏引擎场景。

### 代码作为视觉问题的优秀基底

文章用一个简单例子说明代码作为视觉基底的优势：

**Logo 设计场景**：如果模型输出的是栅格图像，曲线错了，用户必须 mask、inpaint、重新生成或手动重画。如果输出是 SVG，用户可以直接编辑路径、原语、渐变、描边或文本元素。这已经是设计师在 [Quiver 等工具](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-canvas-agent-era-content-creation.md) 上设计 Logo 的方式。

**UI 设计场景**：如果输出是截图，它只是"灵感"；如果输出是 HTML/CSS 或 React，设计师可以检视 DOM、替换真实组件、测试响应式状态、检查可访问性、嵌入到应用中。

### 视觉生成栈的三层结构

文章提出视觉生成的栈式结构：

| 层级 | 角色 |
|------|------|
| **编码模型**（Coding model） | 工件的作者与编辑器，写 HTML、SVG、Lottie JSON、Blender 脚本、USD scene、3D 资产程序 |
| **符号表征**（Symbolic representation） | 真理之源（source of truth）——UI 的 DOM 节点、布局规则、组件；Lottie 动画的图层、矢量形状、时间曲线、关键帧、运动参数；3D 资产的几何、材质、关节、约束、层级 |
| **渲染器或引擎**（Renderer or engine） | 把结构转化为像素——浏览器渲染 HTML/CSS、SVG 渲染器渲染矢量、Lottie player 渲染运动、Blender 或游戏引擎渲染 3D 场景、模拟器验证关节资产是否可运动或交互 |

这一栈与测试时计算循环精确对应：在 Code → Render → Inspect → Revise 的每次循环中，模型不仅生成新样本，而是用渲染器作为反馈改进底层工件——可以修改 CSS 规则、调整 SVG 路径、修复动画时间、更新 3D 约束，然后重新渲染并继续改进。

### OmniLottie 与代码原生的可编辑性

**OmniLottie** 是这一思路的典型案例。Lottie 是轻量级、基于 JSON 的动画格式，将运动表示为可编辑的矢量形状、图层、关键帧和时间参数，而非扁平的视频。OmniLottie 提出将原始 Lottie JSON 转换为对模型更友好的命令序列，使模型能更可靠地生成和编辑 Lottie 动画。

关键洞见是：**Lottie 本身已是可编辑的动画格式**。一旦运动被表示为形状、图层、时间和动画参数，反馈可以映射到源代码级编辑——物体移动太慢就调整时间、路径错了就编辑矢量、变形不对就更新形状序列。这是"模型更易生成"与"工件天然可编辑"的双向契合。

### 像素原生 vs 代码原生：反馈的精度差异

像素原生生成中，更多推理通常意味着采样更多输出——生成二十张图、选最好的一张、也许再试一次。这有用，但每次尝试基本是新的随机掷骰。模型能响应反馈，但反馈通常是全局且不精确的——奖励信号只能告诉模型"输出 A 比输出 B 好"，无法干净地把反馈映射到特定的源代码级编辑。

代码原生生成中，每次重试都能改进源工件本身。模型在闭环可验证环境中调试视觉程序，而非仅仅采样更多图像或视频。这是测试时计算能"收敛"的关键——不是"再多生成几次"，而是"源代码级别的精确定向改进"。

### 围绕运行时的市场地图

代码原生视觉生成的市场正围绕工件被渲染或执行的运行时分化。每个运行时构成不同的市场楔子：

- **浏览器**：HTML/CSS/React UI 生成
- **SVG 渲染器**：矢量图形设计
- **Lottie player**：网页动画
- **Blender**：3D 资产与场景
- **游戏引擎**：交互式 3D 内容
- **模拟器**：物理验证与仿真

每个运行时都有自己的源表征、反馈循环和生产工作流。当前最明显的应用在 2D 设计（特别是 UI 与图形设计），但代码原生视觉生成远超设计工具——任何视觉工件有底层表征可被生成、渲染、检查、精炼的地方都适用。

### 3D：最受益的下个前沿

为什么 3D 是下一关键前沿？

- 2D 设计有时"看起来对"就够了
- **3D 资产必须有一致性**——一张椅子的渲染图不是椅子，是椅子的图片。要在游戏、模拟或 3D 编辑工具中有用，工件需要具备一致的底层 3D 表征（正确的几何、材质、部件层级、场景上下文）

VIGA 与 Articraft3D 是这一方向的代表项目：

- **VIGA**：使用 Blender 作为渲染与反馈环境，将视觉重建转化为 code-render-inspect 循环；不仅暴露原始 Blender 在循环中，而是为 Agent 提供语义观察与修改工具，加上对先前尝试的记忆，使其能从更好的视角检查、诊断错误、做出针对性编辑。
- **Articraft3D**：更直接针对资产结构，将关节 3D 生成框架化为编写定义部件、几何、关节与测试的程序。

### 未来影响与未解问题

如果视觉代码生成可行，胜出的产品不仅生成更漂亮的输出，而是**拥有完整循环**——生成工件、渲染、检查错误、修订源代码。

三大影响：

1. **渲染器成为反馈环境**：浏览器、SVG 渲染器、Lottie player、Blender、游戏引擎和模拟器将变成 Agent 测试和改进其工作的环境，就像今天编码 Agent 利用 sandbox 和 VM。
2. **迭代上下文质量比以往更重要**：要把 Agent 带入视觉代码的"Ralph loop"等价物，中间表征必须足够精确以指导下一步。结构、渲染或反馈中的小错误会在迭代中快速复合。
3. **未来很可能是混合**：像素原生模型仍将最适合真实感、纹理与探索；代码原生系统更适合结构、迭代与生产。最有用的工作流将结合两者。

## 实践启示

1. **重新定义"视觉 AI 产品"的形态**：视觉 AI 创业公司不应只做"更美的输出"，而应**拥有完整循环**：生成工件、渲染、检查、修订源代码。拥有运行时 + 闭环反馈的产品将构筑更高壁垒。
2. **测试时计算在视觉场景的应用逻辑**：不要被"采样更多图像"的诱惑带偏——更高效的方式是"源代码级定向改进"。在 Agent 循环设计 中，应将代码 → 渲染 → 检查 → 修订作为视觉场景的标准模式。
3. **围绕运行时选市场楔子**：与其做一个"通用视觉 AI 工具"，不如聚焦一个运行时（浏览器 SVG、Lottie player、Blender 等），把该运行时的源表征、反馈循环、生产工作流吃透。这是 a16z 给出的市场地图核心建议。
4. **3D 是更大的蓝海**：相比 2D 设计已相对拥挤，3D 资产的一致性问题仍未被根本解决。VIGA、Articraft3D 的路径（Blender 作为闭环环境 + 语义工具 + 部件/关节/约束的程序化定义）值得创业团队深入研究。
5. **OmniLottie 模式可迁移到其他格式**：把不友好的格式（原始 JSON、视频、栅格图）转换为模型更易生成与编辑的中间表征，是一种通用工程范式。SVG、USD scene graph、shader 等都存在类似改造机会。
6. **视觉 AI 的下一竞争点不是模型规模，而是反馈循环质量**：拥有精确、可验证反馈的循环比单纯堆参数更能提升输出质量。这与 [Agentic 工程范式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agentic-engineering-paradigm.md) 中"反馈驱动改进"的核心一致。

## 关联实体

- [ICLR 2026: 英伟达/普渡用 Agent 闭环实现文生 3D](https://github.com/QianJinGuo/wiki-public/blob/main/entities/iclr-2026-英伟达-普渡大学用agent闭环实现文生3d.md) — 同一时期 3D 生成的 Agent 闭环探索
- [DeepSeek 视觉原语](https://github.com/QianJinGuo/wiki-public/blob/main/entities/deepseek-visual-primitives.md) — 视觉表征的另一思路：堆指代精度而非图像分辨率
- [ICLR Agent 3D 生成](https://github.com/QianJinGuo/wiki-public/blob/main/entities/iclr-agent-3d-generation.md) — Agent 在 3D 生成中的另一研究路径
- [Ethan He: Cosmos / Grok Imagine / Latent Space 视频 Agent](https://mp.weixin.qq.com/s/dOKQToqmT5a-CrBLRDMQxA) — 视频生成的 Agent 化方向
- [AI 硬件寒武纪时刻](https://mp.weixin.qq.com/s/lSCOtbmMq90cQKFXos4mCg) — AI 硬件的爆发与基础设施工具的关系
- [Ethan He: Cosmos / Grok Imagine / Latent Space 视频 Agent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ethan-he-cosmos-grok-imagine-latent-space-video-agent-20260606.md) — 视频与多模态生成的前沿
- Agent 循环设计 — Code → Render → Inspect → Revise 正是 Agent 循环的标准范式
- [Agentic 工程范式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agentic-engineering-paradigm.md) — 反馈驱动改进的工程化方法

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/mlops-training-inference.md)

---

## Ch02.021 LLM Wiki 架构

> 📊 Level ⭐⭐⭐⭐ | 8.6KB | `entities/llm-wiki-architecture.md`

## 核心定位
**RAG vs LLM Wiki 区分：**   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

- RAG = 「把资料找出来」——查询时检索原始片段，现场综合回答
- LLM Wiki = 「把读过的资料组织起来」——把合成提前到导入阶段，中间成果持久化保存
两者非替代关系：**RAG 保持原文依据，LLM Wiki 保存可复用的知识结构**，最佳架构往往是两者配合。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

## 架构四层
```
Raw Sources (原始资料)
     ↓
Ingest / Knowledge Compile (两阶段)
     ↓
Markdown Wiki 文件树 (持久化层)
     ↓
Query / Update Loop (查询仍需检索)

## ## 相关实体
```

### 1. Raw Sources（真相来源）
原始资料层（论文、网页、PDF、代码仓库等）。**原则：Raw Sources 是地图背后的地形，Wiki 是地图，不是领土。** 合同条款、实验数据、法规原文等关键内容，Wiki 只做入口，不能替代原文。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

### 2. Ingest / Knowledge Compile（核心引擎）
两阶段设计：   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

把「结构判断」和「页面写作」分开，在写入前暴露关系、冲突和缺口。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

**根本局限：** LLM 的抽取和归纳是非确定性的，同一份资料不一定生成完全相同的 Wiki——这不是编译器，是动态草稿。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

### 3. Markdown 文件树（持久化层）
典型结构：   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

| 文件/目录 | 作用 |
|---------|------|
| index.md | 知识库入口，导航索引 |
| log.md | 操作历史（导入/更新/查询） |
| overview.md | 整体概览 |
| sources/ | 原始资料引用 |
| entities/ | 人物/项目/组织实体页 |
| concepts/ | 概念/主题/方法论页 |
| queries/ | 查询过程与中间结果 |
核心意义：知识变成可打开、可编辑、可审查、可版本管理的文件，而非临时回答。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

### 4. Query / Update Loop
查询时仍需检索 Wiki 页面（必要时回 Raw Sources），将选中的 Wiki 页面 + 原文片段 + 日志历史打包进上下文，再由 LLM 推理回答。有价值的回答保存回 Wiki——但应视为「可审阅更新」而非「自动真理」。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

- [agent 记忆注入实战：5 维框架（选什么/放哪里/怎么放/放多少/何时放）+ 4 前沿论文（memguide/sti](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-injection-5-dimensions-4-papers-agent-shouji-2026.md)

## 与其他知识系统对比
| 方案 | 核心 | 优点 | 局限 |
|------|------|------|------|
| RAG | 查询时检索片段 | 事实锚点强，启动成本低 | 不沉淀结构化理解 |
| 笔记软件 | 人手动整理 | 可控、准确 | 维护成本高 |
| 传统知识库 | 人维护稳定文档 | 规范稳定 | 难快速演化 |
| **LLM Wiki** | **LLM 辅助维护 Markdown Wiki** | **可读可改可复用可持续** | **摘要漂移/错误固化/非确定性** |

## 四大风险
1. **信息损失：** 摘要压缩丢失细节/限制/例外   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
2. **摘要漂移：** 多次改写后偏离原始材料   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
3. **冻结错误：** 错误写进 Markdown 后被持续复用   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
4. **非确定性：** 同一资料生成不同 Wiki 版本   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

## 适用边界
**适合：** 个人研究资料整理、长期项目知识库、代码仓库理解、AI Agent 长期工作记忆。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

**不适合：** 法律、医疗、金融、合规审计等强事实一致性场景（Wiki 只能做入口，不能替代原始证据）。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

## 实践原则
1. 保留 raw/——Wiki 不替代原始资料   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
2. 先建立 index.md + log.md，保证入口和变更记录   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
3. 每页保留来源链接，方便回查   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
4. 关键概念页设人工 review   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
5. 增加 lint 规则（断链、孤立页、缺失来源检查）   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

## 与本 wiki 的关系
本文描述的 LLM Wiki 架构与本知识库高度吻合——本 wiki 的 entities/、raw/、index.md、log.md 结构正是 LLM Wiki 模式的具体实现。Karpathy 的框架为理解本 wiki 的设计选择提供了理论支撑。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

## 深度分析
LLM Wiki 体现了一种范式转移：从"检索已有知识"到"构建可演进知识体"。RAG 的核心局限在于每次查询都是独立的，知识无法跨查询累积；而 LLM Wiki 在 Ingest 阶段完成综合，使知识本身变得**有状态**。这意味着 Wiki 层随查询次数增加而持续优化，而非每次查询重新从碎片化片段拼装。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

然而这一范式并非银弹。LLM Wiki 的质量上限由 Schema 决定——Schema 设计差，Wiki 层会系统性积累错误结构，且修正成本极高（需重新 Ingest 全量文档）。这与"设计先行，验证在后"的传统知识工程逻辑高度一致，但 LLM 的非确定性使问题复杂化：同一份资料不一定生成完全相同的 Wiki，摘要漂移和冻结错误是四大核心风险。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

从成本角度看，LLM Wiki 的 Ingest 综合成本一次付清，后续查询几乎零边际成本。当单文档月查询量超过 100 次时，LLM Wiki 的总拥有成本开始优于 RAG。这对高频查询场景（如内部知识库、代码文档）极具吸引力。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

## 相关链接
- [Llm Wiki Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/entities/llm-wiki-architecture.md)

## 实践启示
1. **最小可用 Schema 起步**：先定义核心实体类型和必须的关系，通过 3-5 个真实查询案例验证 Schema 充分性后再扩展。Karpathy LLM Wiki V2 的 5 项升级中，Schema 优化是核心。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
2. **RAG + LLM Wiki 混合架构**：RAG 负责广覆盖检索（快速找到相关文档），LLM Wiki 负责深度沉淀（关键步骤的标准化实体页）。设计好两个系统之间的接口——RAG 检索结果作为 LLM Wiki Ingest 候选素材。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
3. **关键场景优先迁移**：员工手册、产品规格书、内部流程文档等"写完很少改、天天有人查"的场景是 LLM Wiki 的最优起点。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
4. **保持 Raw Sources 不可替代**：Wiki 是地图，不是领土。合同条款、实验数据、法规原文等关键内容，Wiki 只做入口，不能替代原文。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

→ [原文存档](https://mp.weixin.qq.com/s/F2JcvwDDT99F_WZexowHGg) ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

- [上下文工程：三种 Agent Memory 方案对比实验](https://github.com/QianJinGuo/wiki-public/blob/main/entities/context-engineering-three-memory-paradigms.md)

---

## Ch02.022 OneReason：快手将推理注入推荐基模的系统性尝试

> 📊 Level ⭐⭐⭐⭐ | 7.5KB | `entities/onereason-kuaishou-reasoning-recommender-system.md`

> 原文归档：[原文归档](https://mp.weixin.qq.com/s/-qZ_Z8RMm67tv0ciFbpSSA)

快手技术团队 OneRec 团队推出的 **OneReason**——把 Reasoning 真正注入推荐基模的系统性尝试。核心包括：578B 数据三阶段预训练、归纳/溯因/演绎推荐 CoT 设计、"先专后合"强化学习。首次在推荐基础模型上让 thinking 稳定超越 non-thinking（Pass@4 +13.45%），业务收益年化数亿元。

## 一句话

**OneReason 用完整闭环回答了三个曾经悬而未决的问题：**(1) 推荐基模能不能"会推理"？(2) 推荐 CoT 应该长什么样？(3) 推理基模能不能上线工业场景？

## 核心创新

### 578B 数据三阶段预训练

四层递进式数据架构实现 item 与自然语言深度语义对齐：

| 粒度 | 内容 | 目标 |
|------|------|------|
| Token | 单 Token 释义、前缀语义预测 | 子单元语义绑定 |
| Item | 容量感知粗粒化、多视角 QA | 单品内容双向映射 |
| Relational | 看后搜、协同过滤、共窗共现 | 隐式偏好翻译为可解释语义 |
| User | 分域分组、全时序穿插 | 全场景用户兴趣对齐 |

三阶段训练策略：预热(110B)→全参(449B)→长序列(19B)，上下文窗口放开至 32K。

**效果：** R0 物品锚定 +160.5%，R3 跨域推荐 +65.1%。

### 推荐专属 CoT 三模块

不同于数学推理的演绎式，推荐推理是溯因式的——从噪声行为中提取信号、假设兴趣、收敛到决策。

```
用户抽象 (Persona Abstraction)
    ↓
兴趣发散 (Interest Expansion) —— "少即是多"消融实验: n=1,3,5 最佳，n=10,20 衰减
    ↓
兴趣推断 (Transition Inference)
```

### 先专后合的强化学习

针对推荐奖励稀疏问题的 GRPO 改进：

1. **两阶段轨迹生成**：先生成推理轨迹，再扩展多个候选
2. **Set-wise 奖励**：从 point-wise 抬升到 set-wise，评估覆盖度与多样性
3. **优化稳定策略**：推理文本 token 和推荐 itemic token 采用不同裁剪范围

融合路线：RFT (高质量轨迹筛选) vs MOPD (多教师在策略层面落)。

## 关键突破

### 技术突破1: 首次让 thinking 稳定超越 non-thinking

之前 OneRec-Think、OpenOneRec 都观察到 thinking 模式不稳定优于 non-thinking 的反常识现象。OneReason 在 Pass@4 上让 thinking 平均领先 +13.45%，把"思考"在推荐基模上第一次变成正资产。

### 技术突破2: 证明 RL 是解锁推理收益的必备环节

仅 SFT 时 thinking 表现劣于 non-thinking；经过"先专后合"的 RL 方案后 thinking 实现反超。同时发现 **CoT 能力内化现象**：引入 CoT 不仅提升 think 能力，还能间接反哺 non-think 性能。

### 技术突破3: Fast-Slow Thinking 工业部署

| 部署方式 | 曝光 | 广告收入 |
|----------|------|---------|
| Slow (近线慢思考) | +0.94% | +4.53% |
| Fast (实时快思考) | +6.83% | +4.64% |
| **Combined** | **+10.33%** | **+8.23%** |

对应年化数亿元人民币级别商业增量，**ROI > 5**。

## 四层能力梳理

| 层级 | 能力 | SFT 数据量 | 核心任务 |
|------|------|-----------|---------|
| R0 | 感知 | ~941K | 单 itemic token 还原物料语义 |
| R1 | 推导 | ~400K | LLM judge 筛选解释高质量 i2i 关系 |
| R2 | 演进 | ~130K | 合成带 CoT 的兴趣演化数据 |
| R3 | 推荐 | ~885K | 归纳/溯因/演绎合成 CoT 冷启数据 |

## 与已有实体的关联

- [华为伏羲推荐系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/huawei-fuxi-recommendation-system-ascend-npu-scaling-law.md) — 另一个大规模生成式推荐实践
- [Agent Harness Engineering Survey](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-engineering-survey-2026.md) — 推理系统的 harness 范式
- [高德 Marketing AutoResearch](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gaode-marketing-autoresearch-ai-native-practice.md) — 同样涉及算法模型迭代自动化
- [OpenClaw Agent Loop](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-agent-loop-design-patterns.md) — Fast-Slow Thinking 与 Loop 设计范式对照

## 下一步：Agentic Recommender Harness

OneReason 把推荐基模的 Reasoning 补上了关键一步。下一步是打造 **Agentic Recommender Harness**，让推荐基模具备：

- **规划能力**：能够制定多步推荐策略
- **工具调用**：能够调用外部检索、计算工具
- **长程对话**：支持多轮交互式推荐

最终驱动推荐系统从"千人一面的固定流水线"走向"千人千策、能规划、能用工具、能多轮对话"的 Agentic 推荐系统。

### 1. OneReason：推理驱动的推荐系统
快手的 OneReason 将推荐系统从"匹配模式"升级为"推理模式"——不只是"用户可能喜欢什么"，而是"为什么推荐这个"。

### 2. 可解释推荐的商业价值
推理驱动的推荐不仅提升推荐质量，还提供可解释性——用户看到"推荐原因"后信任度和接受度更高。

### 3. 推理成本 vs 推荐质量的权衡
推理型推荐的计算成本高于匹配型推荐——需要根据场景权衡推理深度和推荐延迟。

## 实践启示

### 1. 关键推荐场景引入推理
对高价值推荐场景（如医疗、金融、教育）引入推理驱动推荐，提升质量和信任。

### 2. 推理结果作为推荐解释
将推理过程转化为用户可理解的推荐解释——不只是"你可能在想什么"，而是"为什么这个适合你"。

### 3. 推理型推荐的 A/B 测试
量化推理型推荐 vs 匹配型推荐的质量差异和成本差异——用数据驱动决策。

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/reinforcement-learning-rlhf.md)

---

## Ch02.023 Hugging Face AI Agent 术语表：Model / Agent / Scaffolding / Harness / Context Engineering / Policy / Tool / Skill / Sub-agent 完整区分

> 📊 Level ⭐⭐⭐⭐⭐ | 27.9KB | `entities/huggingface-ai-agent-glossary-model-scaffolding-harness-tool-skill-subagent.md`

# Hugging Face AI Agent 术语表

## 核心问题：术语混乱

**AI Agent 是这两年最常被提到的 AI 词之一**。

**但问题是**：同样是"Agent"，**很多人说的并不是同一件事**：
- 有人把"**会调用工具的大模型**"叫 Agent
- 有人把"**驱动模型执行的整套系统**"叫 Agent
- 有人把"**负责某个子任务的子模块**"叫 Agent

> "**不是资料太少，而是术语越来越多，大家却未必在用同一套定义。**"

**Hugging Face 发布 AI Agent 术语表的初衷**：
- 系统梳理这波讨论里**最常出现的一批核心概念**
- 无论你是**构建 / 部署 / 日常使用 Agent**，这些词几乎都会反复遇到
- 最后单独补充一组**和模型训练相关的概念**

## 相关实体
- [Harness Engineering 第三代工程范式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-第三代工程范式.md)
- [Cursor Harness Model Production Floor](ch01/107-cursor-harness-model-production-floor.html)
- [Fudan Peking Ahe Agentic Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/fudan-peking-ahe-agentic-harness-engineering.md)
- [From Agent Protocol To Harness Skill](https://github.com/QianJinGuo/wiki-public/blob/main/entities/from-agent-protocol-to-harness-skill.md)
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

→ [原文存档](https://mp.weixin.qq.com/s/RCEGqAvfJxbzaPJIJDOKwA)

- [is grep all you need? — 检索 × harness × 交付方式耦合三元组（pwc 论文 arxi](https://github.com/QianJinGuo/wiki-public/blob/main/entities/is-grep-all-you-need-pwc-retrieval-harness-coupling.md)
- [model-harness-fit-agent-harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/model-harness-fit-agent-harness.md)

## 核心定义：Agent 不是一个模型

> "**AI Agent 是一个以大模型为核心、能够调用工具、接收反馈并持续完成任务的系统。**"

**最关键的词**：不是"生成文本"，而是"**持续完成任务**"。

| 类型 | 范式 | 类比 |
|---|---|---|
| **普通聊天模型** | 你问一句，我答一句 | **单轮** |
| **Agent** | 你给一个目标 → 我先理解任务 → 再决定下一步做什么 → 做完一步根据结果继续往下走 | **持续循环** |

**Agent 任务的 4 个典型例子**（都不是一次回答能完成的）：
1. 帮你搜索资料并整理成摘要
2. 帮你读取一个文件并分析内容
3. 帮你调用代码工具处理数据
4. 帮你在网页上完成一连串操作

## Model 和 Agent：到底什么关系？

**很多人刚接触 Agent 时最容易混淆**：Agent 和 Model 是不是一回事？**不是**。

> "**Model 是 Agent 的核心，但不是 Agent 的全部。**"

**Model 本质**：**"文本进，文本出"**
- **没有跨调用记忆**
- **没有执行循环**
- 可以表达"我下一步想调用某个工具"的意图
- **但真正去点击网页、读取文件、调用 API 或运行工具，还得靠模型外面的系统来完成**

## Scaffolding 和 Harness：分别做什么？

**这两个词经常一起出现**，也最容易一起被叫成"Agent 框架的一部分"。但如果想真正看清一套 Agent 系统，**最好把它们分开理解**。

**核心记忆口诀**：

> "**Scaffolding 管'怎么想'，Harness 管'怎么跑'。**"

| 概念 | 职责 |
|---|---|
| **Scaffolding** | **"怎么想"** — 模型推理和决策的脚手架（prompt 结构 / 推理步骤 / 思维链） |
| **Harness** | **"怎么跑"** — 模型外的执行系统（工具调用 / 记忆管理 / 执行循环） |

## Context Engineering 和 Policy：一个管输入，一个管行为

**这两个概念都会影响 Agent 下一步怎么做**，但它们并不是一回事：

- **Context Engineering 讲的是模型在每一步到底看见什么**
- **Policy 讲的是基于这些输入表现出怎样的行为方式**

### Context Engineering：决定模型每一步看见什么

> "**如果说 Prompt Engineering 关心的是'提示词怎么写'，那么 Context Engineering 更关心的是：在 Agent 执行的每一步里，模型到底应该看到什么信息。**"

**包含的内容**：
- 系统提示词
- 工具说明
- 历史对话
- 检索进来的知识
- 工具返回结果

**关键特征**：
- **不是一次性的设置** — 随着任务推进，harness 会**持续决定哪些信息保留、哪些丢弃、哪些重新注入**
- **在训练和推理两端都适用**
- 训练时塞错了：模型学到的东西可能会偏掉
- 推理时塞错了：通常还能通过改提示词或重配上下文再来一次

### Policy：决定 Agent 按什么方式做选择

> "**Policy 指的是一个 Agent 所遵循的行为方式：给定一种情境，它会以什么方式在多个可能动作之间做选择。**"

**RL 严格定义** vs **LLM Agent 实用定义**：
- **RL 定义**："对各个可能动作的概率分布"
- **LLM Agent 实用**：这套策略**一部分学在模型权重里，一部分又受到提示词、工具、记忆和执行循环的影响**

**关键区分**：

> "**Policy 不等于 Agent 本身。Agent 是那个在环境里真正采取行动的完整系统，Policy 则是它表现出来的行为方式。**"

## Tool / Skill / Sub-agent：三层不同东西

**这三个词很容易被混用，但它们其实对应三层不同的东西**：**动作、方法和分工**。

### 1. Tool — 一个具体动作

**Tool 是最基础的一层**：Agent 伸手够到自身之外的方式：
- 调用 API
- 代码解释器
- 数据库
- 网页搜索
- 文件系统

**关键机制**：
- **模型只会以结构化格式表达"我要用某个工具"的意图**
- **真正把调用路由出去、拿回结果并继续循环的是 harness**

> "**Tool 更像 Agent 的'手'。**"

### 2. Skill — 一套可复用的方法

> "**Skill 不只是一个动作，而是一整套围绕某个目标沉淀下来的做事方法。**"

**例子**（都不是一次工具调用能完成的）：
- 排查一个 bug
- 完成一次数据清洗
- 写一版市场调研摘要

**特点**：
- 往往需要**一组步骤、一套经验和一个相对稳定的处理流程**

> "**Skill 更像 Agent 的'套路'。**"

### 3. Sub-agent — 一个能独立完成子任务的 Agent

> "**Sub-agent 则更进一步。它不是一个被动工具，也不只是一套方法，而是另一个可以自己思考、自己调用工具、独立处理子任务的 Agent。**"

**典型场景**（主 Agent 写行业分析）：
- 一个 Sub-agent 去收集资料
- 一个 Sub-agent 去整理数据
- 一个 Sub-agent 去写成初稿
- 最后再把这些结果统一整合

**三者层次关系**：

```
Sub-agent（最复杂）= 独立可思考的 Agent
  ↑
Skill（中等）= 围绕目标的可复用方法
  ↑
Tool（最基础）= 一个具体动作
```

## 训练 Agent 的 4 个核心概念

> "**前面讲的，主要是 Agent 怎么被搭出来。而下面这几个词，更多出现在'Agent 怎么被训练得更强'这个阶段。**"

### Environment — Agent 可交互的环境

- 浏览器 / 文件系统 / 代码仓库
- 也可以是某种更抽象的任务空间
- **Agent 在环境里采取动作，环境再返回新的状态和结果**

### Rollout — 完整一次任务过程

> "**Rollout 指的是 Agent 从开始到结束完成一次任务的完整过程。它记录了 Agent 看到了什么、做了什么、最后结果怎样。**"

### Reward — 对执行结果的打分

> "**Reward 是对这次执行结果的打分。它告诉系统：这次做得好不好，哪里做对了，哪里做错了。**"

**Reward 来源**：
- 测试是否通过
- 人工偏好
- 其他评估方式

### Trainer — 利用 rollout 和 reward 更新模型

> "**Trainer 负责利用大量 rollout 和 reward 去更新模型，让 Agent 在反复试错中学会更好的策略。**"

**终极断言**：

> "**到了训练阶段，Agent 讨论的就不只是'会不会用工具'，而是'能不能在环境里不断变强'。**"

## 终极概念图（文字版）

> "**AI Agent 不是一个单独的新模型名词。它更像是一整套围绕模型搭起来的系统：模型负责理解和决策，工具负责行动，执行系统负责把任务一轮轮推进下去。**"

**把这些概念分清之后，再去看各种 Agent 产品 / 框架 / 论文，就不会那么容易混乱了**。

## 9 大核心概念速查表

| 概念 | 一句话定义 | 类比 |
|---|---|---|
| **Model** | 文本进 / 文本出；没有跨调用记忆 / 没有执行循环 | 大脑 |
| **Agent** | 以大模型为核心 / 调用工具 / 接收反馈 / 持续完成任务 | 完整机器人 |
| **Scaffolding** | 管"怎么想"（prompt 结构 / 推理步骤） | 思维脚手架 |
| **Harness** | 管"怎么跑"（工具调用 / 记忆 / 执行循环） | 执行系统 |
| **Context Engineering** | 决定模型每一步看见什么（不是一次性设置） | 注意力管理 |
| **Policy** | Agent 在多个可能动作之间做选择的行为方式 | 行为模式 |
| **Tool** | Agent 伸手够到自身之外的一个具体动作 | **手** |
| **Skill** | 围绕目标沉淀下来的一整套做事方法 | **套路** |
| **Sub-agent** | 一个能独立完成子任务的 Agent（可自思/调工具） | **代理人** |
| **Environment** | Agent 可交互的环境（浏览器/文件系统/任务空间） | 世界 |
| **Rollout** | 一次完整任务过程（看到什么/做什么/结果怎样） | 一次实验 |
| **Reward** | 对执行结果的打分 | 反馈 |
| **Trainer** | 利用 rollout 和 reward 更新模型 | 训练器 |

## 与已有实体的关系

**本实体是"概念术语表"类**——与所有其他 entity 形成**统一的定义层**：

- claude md init anthropic architecture — Claude Code 内部架构 = 实际产品中如何组合 Scaffolding / Harness / Skill / Tool
- `Mac Multi Agent Coding Skills Hooks Harness` — MAC = Skills 概率层 + Hooks 确定性层 = Skill/Policy 的具体实现
- `Hermes Agent 12 Layer Full Configuration Guide` — 12 层配置 = Agent 各组件的部署清单
- `Hermes Agent Skill Crossover Optimization` — Skill 互优化 = "Skill 是一整套做事方法"的具体进化
- `Impeccable` — Impeccable = "Skill" 的具体例子（前端设计 33+ star）
- `Agent Harness Architecture` — Harness 7 层 = "Harness 管怎么跑" 的展开
- `Miroflow Deep Research Agent Harness Mirothinker` — Deep Research Harness = "Tool + Skill + Sub-agent" 的实际组合
- `Rein Go Agent 4 Modules 5 Type Boundaries` — Rein = "Tool + Harness + Skill + Sub-agent" 的 Go 实现
- `Claude Code Dynamic Workflows Multi Agent Orchestration` — Dynamic Workflows = "Scaffolding" 的任务图固化
- `Hermes 9 Module Architecture` — 9 模块 = Agent 内部组件
- `Anthropic 95Pct Data Analysis Skill Stack Architecture` — Anthropic 95% = "Skill 路由器" 的具体实现
- `Impeccable Vibe Design Philosophy Anomaly` — Skill 哲学层
- `Didi Ibg Customer Experience Llm Quality Inspection 3 Pipelines` — 3 管线 = "Sub-agent" 在企业场景的实例

**本术语表 = 这一系列实体的"统一语言层"**。

## 核心金句

- "**AI Agent 是一个以大模型为核心、能够调用工具、接收反馈并持续完成任务的系统**"
- "**最关键的词，不是'生成文本'，而是'持续完成任务'**"
- "**Model 是 Agent 的核心，但不是 Agent 的全部**"
- "**Model 本质是'文本进，文本出'。更重要的是，它本身没有跨调用记忆，也没有执行循环**"
- "**Scaffolding 管'怎么想'，Harness 管'怎么跑'**"
- "**如果说 Prompt Engineering 关心的是'提示词怎么写'，那么 Context Engineering 更关心的是：在 Agent 执行的每一步里，模型到底应该看到什么信息**"
- "**Context Engineering 不是一次性的设置**"
- "**训练时塞错了，模型学到的东西可能会偏掉；推理时塞错了，通常还能通过改提示词或重配上下文再来一次**"
- "**Policy 不等于 Agent 本身。Agent 是那个在环境里真正采取行动的完整系统，Policy 则是它表现出来的行为方式**"
- "**Tool 更像 Agent 的'手'**"
- "**Skill 更像 Agent 的'套路'**"
- "**Sub-agent 则更进一步。它不是一个被动工具，也不只是一套方法，而是另一个可以自己思考、自己调用工具、独立处理子任务的 Agent**"
- "**到了训练阶段，Agent 讨论的就不只是'会不会用工具'，而是'能不能在环境里不断变强'**"
- "**AI Agent 不是一个单独的新模型名词。它更像是一整套围绕模型搭起来的系统**"
- "**模型负责理解和决策，工具负责行动，执行系统负责把任务一轮轮推进下去**"
- "**把这些概念分清之后，再去看各种 Agent 产品、Agent 框架和 Agent 论文，就不会那么容易混乱了**"

### 1. 为什么术语分歧会成为 Agent 落地的核心障碍

Hugging Face 这篇术语表的真正价值，不在于定义本身，而在于它揭示了一个结构性问题：整个行业对 "Agent" 这个词的使用是**多层次的**，且每一层都有其合理性。

当一个人说 "Agent 调用了工具"，他可能指的是：(a) 模型表达了一个工具调用意图；(b) Harness 实际执行了这个调用；(c) Sub-agent 在独立完成一个子任务。 这三种理解指向完全不同的工程实现，但都会被笼统地称作 "Agent 在调用工具"。这种歧义会在团队协作、技术方案评审和框架选型时造成大量无效争论。

术语统一不是语义洁癖，而是**团队认知对齐**的前提。当一个团队在讨论 "要不要给 Agent 加一个 Skill" 时，如果每个人脑子里想的 "Skill" 是不同的东西——有人想的是单一工具，有人想的是完整工作流——那么讨论结果大概率无法落地。

### 2. Scaffolding 和 Harness 的二分法是一种设计哲学

Scaffolding/Harness 的二分法不是 Hugging Face 的随意分类，而是一种有意识的**架构哲学**：将 "推理逻辑" 和 "执行逻辑" 分离。

这一思想在传统软件工程中并不陌生：业务逻辑（Business Logic）和运行时框架（Runtime Framework）的分离是所有成熟框架设计的基本原则。但在大模型时代，这个分离有了新的含义：

- **Scaffolding** 对应的是 "模型应该怎么思考"——prompt 结构、few-shot 示例、思维链、推理步骤的组织方式
- **Harness** 对应的是 "模型思考完了应该怎么动"——工具调用的路由、记忆的读写、循环的终止判断

这种分离的工程价值在于：**可独立迭代**。你可以换一套 prompt（Scaffolding 变更）而不动执行系统，也可以升级工具调用框架（Harness 变更）而不改模型推理逻辑。在实际项目中，这两个模块的变更频率和改动风险完全不同，混在一起会给迭代带来不必要的耦合。

### 3. Context Engineering 的 "非一次性" 特性是它最容易被忽视的维度

大多数讨论 Context Engineering 的人，会把它理解为 "给模型提供正确的上下文"，但往往会忽略一个关键点：上下文不是静态填充的，而是**动态管理的**。

在 Agent 的执行循环中，Harness 每一步都在决定：保留哪些历史信息、丢弃哪些中间结果、注入哪些新的上下文片段。这个决策的质量直接影响模型每一步推理的有效性。

训练阶段和推理阶段对 Context Engineering 的容错度不同，这一点值得特别关注：训练时一旦塞错了信息，模型权重会学到错误的关联，这个错误是嵌入模型内部的；推理时塞错了，通常可以通过调整提示词或上下文重新来，但这种 "重来的可能性" 会让人低估错误上下文的危害。

### 4. Tool / Skill / Sub-agent 的三层模型揭示了 Agent 能力的层次天花板

这个三层模型（Tool < Skill < Sub-agent）本质上描述的是 Agent 能力的**递进关系**：从被动工具，到有固定套路的方法，再到主动思考的独立 Agent。

理解这个层次天花板很重要，因为每提升一层，系统复杂度都会显著增加：

| 层次 | 自主程度 | 需要的管理 | 失败模式 |
|------|---------|-----------|---------|
| Tool | 无自主，需要 Harness 路由 | 最低 | 调用失败、参数错误 |
| Skill | 半自主，有固定处理流程 | 中等 | 流程不适用、步骤遗漏 |
| Sub-agent | 完全自主，独立推理 | 最高 | 目标误解、子任务协调、循环 |

这意味着：在设计 Agent 系统时，应该尽可能在底层解决问题（用 Tool 组合能完成就不用 Skill，能用 Skill 解决就不用 Sub-agent），只有在低层方案明显不够用时才升级到上一层。Sub-agent 虽然最灵活，但也最难调试、最容易失控。

### 5. 训练端四概念（Environment/Rollout/Reward/Trainer）代表了 Agent 工程化的下一个前沿

当讨论从 "Agent 怎么搭" 进入 "Agent 怎么训练" 时，实际上是在讨论 Agent 的**自我改进能力**。

Environment/Rollout/Reward/Trainer 这四个概念，直接对应强化学习（RL）的基本框架，但移植到 LLM Agent 场景时遇到了独特挑战：

- **Environment**：真实世界的 Agent 任务（网页操作、文件系统、代码执行）比 RL 的标准环境要复杂和不可预测得多
- **Rollout**：一次完整的 Agent 任务执行可能非常长，包含几十到上百步工具调用，rollout 的成本极高
- **Reward**：Agent 任务的结果质量往往无法用自动指标衡量（需要人工偏好或复杂评估函数）
- **Trainer**：用 rollout 和 reward 的信号更新模型，但 LLM 的全量微调成本远高于 RL 的策略梯度更新

这四个概念的存在，标志着一件事：**Agent 的核心竞争力正在从"能不能用工具"转向"能不能在环境中持续变强"**。能够高效收集 rollout、设计可靠 reward 信号、实现低成本 trainer 的框架，将在未来 Agent 竞争中占据核心优势。

## 实践启示

### 1. 在团队内部建立统一术语卡斯

当团队开始使用 Agent 相关技术时，第一件事不是选框架，而是**在团队内部建立一份术语对照表**——明确每个核心概念在当前项目语境下的具体含义。

建议：把本文的 9 大核心概念速查表作为基准，结合项目实际情况定义每一个词的项目级含义。每个人的 "Agent" 可能不一样，每个人的 "Skill" 也可能不一样，提前对齐能避免后期大量无效讨论。

### 2. 始终区分 Scaffolding 变更和 Harness 变更的变更管理策略

当 Agent 系统出现问题时，第一判断应该是：**问题出在"怎么想"还是"怎么跑"**。

如果是 Scaffolding 问题（模型推理质量下降、思维链不连贯），调整 prompt 结构或 few-shot 示例；如果是 Harness 问题（工具调用失败、记忆混乱），检查执行循环和路由逻辑。**这两类问题的诊断路径和修复策略完全不同**，混在一起诊断会大幅拖慢调试速度。

建议：为 Scaffolding 和 Harness 维护独立的变更日志，当问题出现时先分类再定位。

### 3. 把 Context Engineering 作为一等公民来设计，而非事后补充

不要等到推理效果不好了才想起来 "调一调上下文"。Context Engineering 应该从系统设计之初就被纳入考量。

关键实践：每个工具调用返回的结果片段，是否需要保留在上下文中？保留多久？历史对话中哪些信息应该在第 N 步时继续暴露给模型？这些问题应该在 Harness 设计阶段就有明确的策略，而不是靠试错来决定。

建议：建立一份 "上下文决策表"，明确每类信息的保留条件和淘汰条件，作为 Harness 设计文档的一部分。

### 4. 优先用 Tool 组合解决新需求，只有在明显不够用时才引入 Skill 或 Sub-agent

在设计新的 Agent 能力时，应该先问：**这个问题能否用现有工具的组合来完成？** 只有当工具组合明显不够用或过于复杂时，才考虑引入 Skill 或 Sub-agent。

这一原则的直接价值：**降低系统复杂度，减少调试成本**。Sub-agent 虽然能力最强，但引入的目标理解、子任务协调和执行循环管理会带来全新的复杂度维度。在没有明确证据表明低层方案不够用之前，不要升级到更高层次。

### 5. 在训练 Agent 能力时，先确保 Environment 和 Reward 的可信赖，再考虑 Trainer

如果你的 Agent 需要被训练（而不是纯提示工程），那么最关键的前置工作不是选 trainer 工具，而是**确保 Environment 可复现、Reward 信号可靠**。

具体来说：Environment 是否足够稳定，能支撑大量 rollouts 的重复执行？Reward 的评估是否和真实任务目标一致？如果 Environment 不稳定，rollout 信号会充满噪声；如果 Reward 设计有偏，模型会优化错误的目标。在这两个条件不满足之前，上任何 trainer 都是浪费资源。

建议：先用人工评估或规则校验跑通一批 rollout，确认 Environment 和 Reward 基本可信后，再引入自动 trainer。

---

## Ch02.024 反向审计 Prompt 范式 — 从 VB 50 行 Codex 自我蒸馏到 5 行核心

> 📊 Level ⭐⭐⭐⭐⭐ | 25.6KB | `entities/reverse-audit-prompt-paradigm-codex-5-line-version.md`

## 概述

小黑（AI Native 软件工程，2026-06-11）拆解 OpenAI Codex 团队 Vaibhav Srivastav (VB) 在 X 上挂出的"50 行 Codex 自我蒸馏 prompt"（让 Codex 把过去 30 天工作自动蒸馏成 skill/subagent/automation），通过**亲身实测**发现：在国内开发者复刻这条 prompt 时普遍跑空——Codex 给出的"重复工作流候选"只是把关键词重新分类了一遍，**对已有的 skill 完全失明**。根因是 **3 条前置缺失**（worker 边界 / skill description 触发词 / producer 链路回执），任何一条缺失都会让这条 prompt 退化成"关键词分类器"。文章最终砍出**一条 5 行的"反向审计"骨架版本**——把"agent 应该反过来看自己的历史痕迹"这个核心视角剥到只剩三个问题。这是从"传统 prompt 工程（让 agent 听指令做事）"到"agent 自评（让 agent 审计自己的能力链路）"的**范式转换**。

## VB 50 行 prompt 完整复刻（中文圈疯传版）

VB（OpenAI Codex 团队）原文在 X 公开后，量子位翻译 → 新浪/51CTO/CSDN/各公众号一周内全转。核心叙事："一条 prompt 让 Codex 把你过去 30 天的工作蒸馏成 skill/subagent/automation"。

prompt 结构（3 部分）：

1. **证据来源声明**（前 1/3）：让 Codex 按优先级读取——
   - Recent Codex sessions and task summaries
   - Codex Memories and rollout summaries
   - Chronicle（Windows 端屏幕级活动记录）
   - Existing skills, custom agents, automations（**复用优先于重复造**）
2. **判断标准**（中 1/3）：什么样的工作流值得 package——出现过 2+ 次、有稳定输入输出、能改进速度/质量/一致性、不被现有覆盖
3. **产出格式**（后 1/3）：先 shortlist（workflow/证据/confidence/推荐形式/理由），再创建高置信项，最后说明跳过项和证据不足项

**选择形式**：skill（可复用工作流）/ custom subagent（隔离 context 的专家任务）/ automation（定期 check/report/reminder）/ skip（一次性或证据不足）。

## VB prompt 调用的 3 套 Codex 内部机制

理解 VB prompt 的前提是知道它不是普通 prompt 工程——它**调用 Codex 内部 3 套真实存在的官方机制**：

| 机制 | 来源 | VB prompt 中的对应表述 | 关键设计 |
|------|------|----------------------|---------|
| **Codex Skills** | OpenAI Agent Skills 官方文档 | "skill: a reusable workflow or playbook" / "extend existing instead of duplicating" | 项目级/用户级能力包，靠 `name + description` **隐式匹配** |
| **Custom Subagent** | openai/codex#11701 + reach_vb/status/2052090279344120278 | "custom subagent: a bounded specialist role suitable for delegation" | **不会自动 spawn**，需 prompt 明确要求；隔离 context 干活，只回结论 |
| **Sessions / Memories / Chronicle** | Codex 自身 + Windows 发布说明 reach_vb/status/2029260173823332857 | "Use available evidence in this order" | 灵魂在这里——**让 Codex 看你留下了什么痕迹，而不是问你"在做什么"** |

**VB prompt 的精妙之处**：这 3 套机制是 OpenAI 内部用户的**默认前置**——他们用 Codex 自动加载了 skills，用 Codex 自带 sessions/memories，知道 subagent 可以怎么 spawn。这条 prompt 让 Codex **反过来扫一遍**，看哪些重复工作该沉淀。

> 与 [Skill 设计模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-design-patterns.md) 在"skill 是知识注入而非工具生成"维度同源，但本文聚焦**触发失败诊断**而非模式选择。

## 跑空根因：3 条前置缺失（缺一不可）

小黑亲身实测：把 VB 50 行 prompt 贴进自己的 Codex → Codex 列了"每周复盘/PR 审查/文档自动化"等候选清单，**置信度评分、证据描述一应俱全**——但这些 skill 他**早就有**，只是 Codex **看不见**（skill description 写得太弱，触发失败）。

**根因**是 3 条前置缺失，**不是装一条就好，缺一不可**——任何一条缺失，prompt 都会退化成"看起来在审计你，其实只是把你的关键词重新分类了一遍"。

### 缺失 1：AGENTS.md 没有 worker 边界

AGENTS.md 是 agents.md 公开 spec 定义的"agent 看的项目级 README"——Codex 发现会优先读，作为后续所有任务的项目上下文前缀。

**反例**：
```markdown
# AGENTS.md
This project uses TypeScript and pnpm.
- Run `pnpm install` to set up.
- Run `pnpm test` to run tests.
- Follow the code style in eslint.config.js.
```

这是把 README 改了个名字——告诉 agent"装什么、测什么、风格怎么写"，**没告诉 agent "这个 repo 里有哪些角色、谁负责什么、谁不该碰什么、做完一件事的产物长什么样"**。

**worker 边界的作用**：给 agent 一个**反向审计的坐标系**。VB prompt 里"playbook"的潜台词是"同一个角色反复跑同一个流程"——如果 AGENTS.md 没区分"研究 worker/评分 worker/reviewer"，Codex 做蒸馏时就没有"角色"维度可用。它能看到的只是"过去 30 天发生过 47 次任务"，看不到"这 47 次任务里有 12 次本来应该 reviewer 介入但没介入"。

没有坐标系，prompt 跑出来的"重复工作流"永远是**任务表面的相似性**（"都是写文档""都是改测试"），而不是**结构性的缺位**。

### 缺失 2：skill description 没有触发词

OpenAI 官方 Codex Skills 文档有一句话："**Codex 初始只会读 skill 的 name、description 和路径，不会读完整的 SKILL.md**。它要等到运行时基于 description 判定'这个任务该不该用这个 skill'之后，才会去 load 完整内容。而且初始 skills 列表有上下文预算（~8000 字符），skill 多了，description 会被压缩，部分 skill 甚至会被省略"。

**含义**：skill 触发完全押在 description 上。description 写得抽象、宽泛、没把触发词前置——这个 skill 就是"**装了但没用**"。

**反例 vs 正例**：

```yaml
# 反例：100% 不会被触发
name: investment-research
description: A skill for conducting investment research tasks.
# → 跟用户实际会说的话（"帮我看下机器人产业最近的玩家排名"）
#   一个词都对不上
```

```yaml
# 正例：把触发词前置 + 写清不适用范围
name: investment-research
description: |
  当用户要求生成产业研报、行业网页、公司榜单、证据评分、
  机器人/具身智能/AI 应用方向调研、React 投研驾驶舱、
  SQLite 证据账本、worker 并发研究、强证据厚内容报告时触发。
  不适用于：单个公司的财务三表分析、纯数据爬取任务。
# → 用户真的会说"产业研报"/"公司榜单"/"证据评分" → 触发成功
```

**两个关键动作**：
1. **把触发词前置**（用户会真的说的话）
2. **写清不适用范围**（让 Codex 知道边界，避免误触发）

**与 VB prompt 的关联**：VB 那条 "extend existing instead of duplicating" 假设你的 skill description 是健康的、Codex 能识别"这个工作流已经有 skill 在做"。**如果你 50% 的 skill 都长成 "A skill for X tasks" 这种废话 description，Codex 根本看不见这些 skill 的存在**——它给你的"重复工作流候选"里，会出现一大堆你已经有 skill 在跑但 Codex 不知道的项目。

> 与 [Agent Skill 进阶模式与治理](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-skill-writing-advanced.md) 在"description 是触发信号源"维度同源——但本文给的是**反模式 → 正模式**的具体对照，可作 description 写作 checklist。

### 缺失 3：producer 链路没在写结构化回执

VB prompt 的证据基础是 "Codex sessions、Memories、rollout summaries、Chronicle"——**这些是 Codex 自己写的**。在 VB 的语境里"证据"是默认存在。

但有自定义 producer 链路的人（worker/reviewer/validator/handoff 文件/可点击回执）——**这些东西 Codex 一概看不见**。它能看见的只有标准 Codex sessions 一层。

更要命：**很多人手里这套 producer 链路，自己根本没在写回执**。

**回执 ≠ 日志**，是结构化的、可被反向读出的：

```markdown
# 00_GPT 可点击回执.md

## TASK
机器人产业研报 V1.3 内容厚度修复

## STATUS
PARTIAL_SUCCESS - 5 个公司榜单已加证据，2 个图表未答业务问题

## ARTIFACTS
- ./outputs/robotics_2026_06_10/01_人类总览.html
- ./outputs/robotics_2026_06_10/03_证据索引.md
- ./outputs/robotics_2026_06_10/99_receipts/...

## VALIDATOR_SCORE
内容厚度：73 / 100  (target: ≥ 85)
证据完整度：88 / 100
图表问答率：62 / 100  (target: ≥ 80)  ← 主要缺口

## NEXT
1. 重做 P3 图（机器人 BOM 价格趋势）
2. 给 P5 表加置信度列
3. 跑 V1.4 跑分对比
```

**有 VALIDATOR_SCORE 这种字段 → 反向审计有抓手**——Codex 看到 "图表问答率 = 62" 立刻知道"这个 skill 在『图表是否回答业务问题』这件事上反复掉分，应该回去修 skill 的 validator"。

**没有回执 → 只能看到表面"这件事发生过几次"，看不到"这件事每次都有同样的瑕疵"**。

**最难补的一条**：AGENTS.md 写好、skill description 写好都是一次性投入；**producer 链路写回执是每一次任务都要做的事**。

> 与 [Agent 可靠性工程与持续改进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-reliability-engineering-skillify-continuous-improvement.md) 的"产品级可观测"维度同源——本文聚焦"**可被反向审计的回执结构**"这一具体落地形态。

## 真正值钱的不是 prompt，是"反向审计"这个视角

把 3 条缺失串起来，会浮现一个反共识但很朴素的判断：

**VB 那条 50 行 prompt 的价值不在它的字数多、维度全、考虑细**——这些都只是表面工艺。它真正值钱的是一个**视角**：**让 agent 不去看"我现在该做什么"，而是去看"我过去做的事留下了什么痕迹，这些痕迹能不能反向告诉我我的能力包哪里漏了"**。

中文叫"**反向审计**"（reverse audit）更贴切——和传统 prompt 工程的方向是**反的**：

| 范式 | 假设 | 流程 | 适用阶段 |
|------|------|------|---------|
| **传统 prompt 工程** | 我对自己要什么很清楚 | "我给你一段指令，你按指令产出" | 单轮交互 / 短链路 |
| **反向审计 prompt** | agent 链路足够长，我不再清楚自己每一层"应该要什么" | "你看着我过去的产物，告诉我我的指令系统哪里在漏水" | 多 worker / 多 skill / 长链路 |

**为什么是范式变化**：传统 prompt 工程的有效性建立在"我对自己要什么很清楚"这个假设上。当 agent 链路足够长（有 worker/skill/reviewer/validator），你就不再清楚自己每一层"应该要什么"了。这时候你需要的不是更强的 prompt，是一个**能从自己历史里反向发现问题的 agent**。

**VB prompt 在 OpenAI 圈子能打的原因**：他们已经在 Codex 内部把反向链路建好了——skills、sessions、memories、Chronicle、AGENTS.md，五件套齐。中文圈复制 prompt 但没复制这套链路，自然跑空。

**与两年前 CoT 的类比**：CoT 真正起作用的前提是模型已经具备相应的中间推理能力，prompt 只是把那个能力**激活**；模型里没有的东西，prompt 喊破喉咙也喊不出来。**反向审计 prompt 是同一个道理**——它激活的是你 repo 里已经存在的能力链路。链路不在，prompt 只能让 agent 凭空编一份看起来很像审计的清单。

> 这是与 [Skill 工程化设计：把 Agent 当算法用](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-engineering-ai-as-algorithm.md) 在"agent 链路是激活对象"维度上的**范式共振**——本文给出的是诊断视角，后者给出的是生产视角。

## 5 行骨架版：把 50 行砍到只剩三个问题

> **扫描我最近 30 次任务的产物、回执、validator 记录、handoff 文件。回答三个问题：**
> 1. 哪几个 skill 本应该被触发但没被触发？证据路径是什么？
> 2. 哪些产物明显"变薄"或"重复出问题"？根因是 skill 没生效、worker 没跑、还是 validator 没拦住？
> 3. 这些证据应该沉淀进 skill description、AGENTS.md、还是新 validator？**给出具体的 patch 文案，不要 generic 建议**。

5 行。三个问题。三件具体动作。

**为什么砍得动**（与 VB 50 行逐段对照）：

| VB 50 行段落 | 5 行版本处理 | 理由 |
|--------------|-------------|------|
| 证据来源声明（前 1/3） | 删 | 你已知道路径（你直接指） |
| 判断标准（中 1/3） | 删 | "要不要建"是 5 行版本读者自己决定的事，不该让 agent 替 |
| 产出格式（后 1/3） | 删 | 5 行版本要的是"哪里漏了"，不是"请你创建这些 skill" |
| 核心视角：让 agent 反向审计能力链路 | **保留** | 整个 5 行版本的灵魂 |

**5 行版本 ≠ VB prompt 的简化版**——它是**另一个 prompt**，专门解决"我手里有一堆 skill 但我不知道哪些在裸跑"。

## 50 行 VB 版 vs 5 行反向审计版能审计什么对比

| 维度 | VB 50 行版 | 5 行反向审计版 |
|------|------------|---------------|
| **主要目的** | 沉淀新 skill / subagent / automation | 诊断已有 skill / worker / validator 是否在跑 |
| **证据基础** | Codex sessions、Memories、Chronicle、已有 skill | 自己的 producer 链路产物 / 回执 / validator 记录 |
| **输出形态** | shortlist + 自动创建高置信项 | 诊断报告 + 具体 patch 文案（**不自动创建**） |
| **需要前置** | Codex 自带历史齐全 | AGENTS.md 有 worker 边界 + 回执在写 |
| **适用对象** | OpenAI 内部用户 / 纯 Codex 用户 | 有自定义 worker / skill / producer 链路的人 |
| **致命缺陷** | 在前置不全的 repo 里会退化成关键词分类器 | 在没有回执链路的 repo 里跑不出任何有效结论 |

**最后一行最关键**——两个 prompt 的失败模式完全不同：VB 是"看起来跑了，其实是凑数"，5 行版本是"直接跑不出来，agent 会明确告诉你没有证据可看"。**后者其实更友好**，因为它主动暴露 producer 链路问题，而不是用一份漂亮的清单帮你盖住。

## 5 行版本的使用时刻（3 种）

| 时刻 | 触发条件 | 期望产出 |
|------|---------|---------|
| **1. 产物质量持续下滑** | 单独看每份还过得去，放一起明显比上个月薄；validator 分数在 70 多分徘徊；reviewer 问题翻来覆去就那几条 | 把"感觉哪里不对但说不清"具象成"这两个 skill 的 description 触发风险评分 80/75，下面是建议的 patch 文案" |
| **2. 刚装了一批新 skill 想验证** | 让 agent 扫最近 30 次任务，看新 skill 实际触发率；装 5 个新 skill 但最近 30 次任务里 4 个一次都没触发 → 不是 skill 不好，是 description 写错了 | 新 skill 触发率清单 + 触发失败的具体 description 字段 |
| **3. 能力交付前自检** | skill 系统要交到别人手里之前，自己跑一遍反向审计，把所有漏的洞补上再交出去 | patch 文案清单（人类筛一道再落到 repo） |

**5 行版本不能解决的事**（诚实摆出）：

1. **不能替你写新 skill**——告诉你"这里缺一个评分 worker"，但不会替你写出来。是诊断工具不是生成工具
2. **不能在没有回执的 repo 里跑出任何有效结论**——30 天任务里只有 README 和 git log，agent 能看到的最多就是 commit 信息
3. **不能替代 reviewer**——reviewer 是单任务实时检查站，5 行版本是跨任务事后诊断。两者解决的根本不是同一个问题
4. **跑出来的 patch 文案必须人类筛一道**——作者实测 60% 直接可用 / 30% 改 1-2 词 / 10% 完全 agent 脑补的触发词（"我从来没说过这种话，但它觉得我会说"）

### 核心观点：反向审计是范式转换，不是 prompt 优化

传统 prompt 工程的有效性建立在"我对自己要什么很清楚"这个假设上；当 agent 链路足够长（有 worker/skill/reviewer/validator），你就不再清楚每一层"应该要什么"了。**反向审计 prompt 激活的不是模型的新能力，而是 repo 里已经存在但长期被忽视的能力链路**——VB prompt 在 OpenAI 圈子能跑通，是因为他们的 Codex 已经把 skills/sessions/memories/Chronicle/AGENTS.md 五件套建好；中文圈复制 prompt 但没复制链路，自然跑空。

### 技术要点：3 条前置缺失是架构问题，不是配置问题

worker 边界、skill description 触发词、producer 链路回执——这三条缺失任何一条都会让 prompt 退化成"关键词分类器"，而且它们是**递进依赖关系**：

- AGENTS.md 没有 worker 边界 → Codex 做蒸馏时没有"角色"维度可用，只能看到任务表面的相似性，看不到结构性的缺位
- skill description 没有触发词 → Codex 根本看不见这些 skill 的存在，给出的"重复工作流候选"里会大量出现已有 skill 在跑但 Codex 不知道的项目
- producer 链路没写结构化回执 → 只能看到"这件事发生过几次"，看不到"这件事每次都有同样的瑕疵"

这三条里最难补的是第 3 条——前两条是一次性投入，**producer 链路写回执是每一次任务都要做的事**。

### 实践价值：5 行骨架版的核心价值是暴露问题而不是生成方案

5 行反向审计版本和 VB 50 行版本的**失败模式完全不同**：VB 是"看起来跑了，其实是凑数"；5 行版本是"直接跑不出来，agent 会明确告诉你没有证据可看"。**后者其实更友好**——它主动暴露 producer 链路问题，而不是用一份漂亮的清单帮你盖住。patch 文案 60% 直接可用 / 30% 改 1-2 词 / 10% 完全 agent 脑补（"我从来没说过这种话，但它觉得我会说"）这一经验值，是人类必须参与 review 的根本原因。

---

## 实践启示

1. **不要复制粘贴 VB 50 行 prompt**——前置缺失会让它退化成关键词分类器。先审计自己的 repo 是否满足 3 条前置（worker 边界 / 触发词 description / producer 回执）
2. **先修 AGENTS.md**——加 worker 边界（明确角色分工）比写 50 条 skill 更基础
3. **description 是触发的全部**——把"装了但没用"的 skill 优先重写（用"用户会真的说的话"作为触发词 + 写清不适用范围）
4. **结构化回执是反向审计的基石**——每条任务都应该有 STATUS / VALIDATOR_SCORE / NEXT 三个字段，不只是 git log
5. **5 行版本是诊断起点**——不要期望跑完就有 3 个新 skill 装好；它告诉你"哪里漏了"，创建动作交给人类
6. **人类筛 patch 文案**——60/30/10% 比例是经验值，agent 生成的触发词 10% 是幻觉
7. **范式转换的边界**——传统 prompt 工程在单轮交互中仍有效；只有 agent 链路长起来后，反向审计才显示出边际收益

## 相关实体

- **同 skill description / 触发信号**：
  - [Agent Skill 进阶模式与治理](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-skill-writing-advanced.md)（description + name + 触发机制）
  - [Skill 设计模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-design-patterns.md)（5 种核心模式 + 1 特殊模式）
  - [Anthropic 官方技能最佳实践 14 模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-14-skill-patterns-best-practices.md)（5 类设计模式）
  - [AI Skill Evolution Framework](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-skill-evolution-framework.md)（skill 评估与度量）
  - [Anthropic+Google Agent Skills 设计模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-google-agent-skills-design-patterns.md)
- **同 Codex / OpenAI**：
  - [Codex Goal 代理运行时](https://github.com/QianJinGuo/wiki-public/blob/main/entities/codex-goal-agent-runtime.md)
  - [Codex Goal 六小时运行](ch09/082-codex-goal-six-hour-run.html)
  - [Codex 上下文工程](https://github.com/QianJinGuo/wiki-public/blob/main/entities/codex-context-engineering-lastwhisper-thinking-in-context.md)
  - [OpenAI Codex JasonLiu maxxing 攻略](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openai-codex-jasonliu-maxxing-playbook.md)
  - [GPT-5.4 Codex Interconnects](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gpt54-codex-interconnects.md)
- **同 AGENTS.md / 角色边界**：
  - [Agent 可靠性工程与持续改进](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-reliability-engineering-skillify-continuous-improvement.md)
  - [Skill 工程化设计：把 Agent 当算法用](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skill-engineering-ai-as-algorithm.md)
- **同 prompt 工程 / 范式**：
  - [Claude Managed Agents](ch01/104-claude-managed-agents.html)（prompt 工程的边界探索）
  - [AI 蜜罐：对抗 AI 智能体](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-powered-honeypots-turning-the-tables-on-malicious-ai-agents.md)
- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/wiki-pending-concepts-roadmap.md)

→ [原文存档](https://mp.weixin.qq.com/s/1D3E6CHLMP1fjZgPevNrGg)

---

## Ch02.025 Hermes Agent 深度解析（阿里云/飞樰）

> 📊 Level ⭐⭐⭐⭐⭐ | 14.7KB | `entities/hermes-agent-deep-dive.md`

## Overview
飞樰（阿里云开发者）对 Hermes Agent 的深度源码解析文章，从 Self-Evolving / Prompt Engineering / Context Engineering / Harness Engineering 四个维度展开，附 Agent 演进三阶段框架。
原文：https://mp.weixin.qq.com/s/2xFei8dMx99lc-iyrZZrww

## Self-Evolving：内外双路径驱动
### 路径一：动态 Skill 沉淀（"外挂式"进化）
**核心**：Skill 从"静态调用"变为"动态生成"。OpenClaw/Claude Code 的 Skill 是用户预编写或下载安装，Hermes 则在每次任务完成后自动复盘，将试错经验抽象为结构化 Skill 文件包。
**触发机制**：`_iters_since_skill` 计数器连续 10 轮无 Skill 操作 → 系统提醒 Agent 整理经验。
**后台审查 Agent**：主 Agent 回复后，异步 Fork 轻量级审查 Agent，从三个维度复盘：

- **记忆审查**：提炼值得长期保留的关键经验 → 存入长期记忆库
- **技能审查**：判断任务解决路径是否值得固化为可复用 Skill
- **综合审查**：反思优化空间和潜在错误模式
→ "前台即时响应、后台异步进化"

### 路径二：RL 训练闭环（"内功式"进化）
Skill 沉淀是"记笔记"，RL 训练是"练内功"——改变模型权重，真正内化能力。
**完整闭环**：
| 阶段 | 关键实现 |
|------|---------|
| 任务定义 | 用户指定目标（"提升数学推理能力"等） |
| 轨迹捕获 | batch_runner.py 并行生成 ShareGPT 格式轨迹；默认 Claude Opus 4.6 Teacher；工具集随机采样防死记硬背；零推理过滤 |
| 轨迹压缩 | 精炼到 15250 Tokens；保护头部（任务定义）+ 尾部（最后4轮）+ 中间 LLM 摘要 |
| 渐进训练 | 小步快跑；验证可行性后再大规模训练 |
| 自动评估 | WandB 指标；未达标则反馈调整后继续迭代 |
| 固化 | 效果达标固化模型版本 |
**GRPO 算法**（DeepSeek R1）：同问题生成 8~16 个回答 → 奖励函数打分 → 学习多产出高分回答。无需单独训练 Reward Model。
**奖励函数设计原则**：

- 组合 3~5 个奖励维度：正确性（2.0最高）、格式规范（0.5）、渐进格式（0~0.5）
- 给部分分（如写了开标签但没闭合也给 0.125 分）
- 可执行真实验证（编译代码、读文件、访问网络）
**为什么不直接用用户对话数据做 RL**：
1. 隐私问题
2. 用户对话质量参差不齐，直接训练会让模型变差
3. 正确做法：人工导入 + Teacher Model 质量把关

## Prompt Engineering
### 工具使用强制指导（因"材"施教）
| 模型 | 问题 | 动态注入指令 |
|------|------|------------|
| Claude | 训练充分 | 无需额外提醒 |
| GPT/Codex | "只说不做" | 必须用工具执行，禁止幻觉 |
| Gemini/Gemma | 需要规范 | 绝对路径、先读后改、并行调用 |

### 生态兼容性（极低迁移成本）
- **OpenClaw 生态**：直接读取 AGENT.md、SOUL.md、USER.md
- **AI Coding 规范**：支持 CLAUDE.md、.cursorrules、.cursor/rules/*.mdc
- **多平台 IM**：WhatsApp、Slack 等适配

## Context Engineering
### 压缩：相对比例阈值 vs 绝对阈值
| | OpenClaw | Hermes |
|--|---------|--------|
| 触发 | 绝对 Token 数（如 18K） | 相对窗口比例（如 50%） |
| 优势 | 简单 | 自适应不同模型窗口大小 |
**裁剪策略**：保护头部（系统指令+任务定义）+ 保护尾部（最后几轮）+ 中间 LLM 摘要

### Memory：内外双层混合架构
**内部记忆**：

- Markdown 文件（MEMORY.md/USER.md）记录长期静态事实
- SQLite 存储所有每日对话历史 → 为 RL 训练提供原始轨迹素材
**外部记忆**：原生支持 Mem0、Honcho、Hindsight、Supermemory → 跨框架记忆流转

### 上下文注入：@ 语法
```bash
@file:main.py              # 注入完整文件
@file:src/utils.py:10-20   # 注入指定行
@folder:src/               # 列出目录树
@diff                      # git diff
@git:3                     # 最近3次提交
@url:https://...           # 抓取网页转 Markdown
```
本质：**工具调用 → 上下文预加载**，省去"是否调用工具"的中间推理环节，响应更快、Token 消耗更低。

## Harness Engineering
### 全生命周期 Hook
`on_agent_start` / `on_tool_call` / `on_tool_result` / `on_agent_end` / `on_turn_start` / `on_pre_compress` / `on_memory_write` / `on_delegation` / `on_session_end`

### 14 种错误分类与自愈
| 错误类型 | 含义 | 典型场景 |
|---------|------|---------|
| auth | 认证失败 | API Key 无效 |
| billing | 账单问题 | 额度用完 |
| rate_limit | 请求过多 | 被限流 |
| timeout | 请求超时 | 网络问题 |
| context_overflow | 上下文溢出 | 消息太长 |
| ... | ... | ... |
| unknown | 未知错误 | 需要重试 |

### 子 Agent 沙箱隔离
```python
DELEGATE_BLOCKED_TOOLS = {
    "delegate_task",  # 防递归委派
    "clarify",       # 防嵌套提问
    "memory",        # 防操纵记忆
    "send_message",  # 防消息劫持
    "execute_code"   # 防权限升级
}
MAX_CONCURRENT_CHILDREN = 3
MAX_DEPTH = 2
```

### 安全护栏
- 防 Prompt 注入攻击
- Skill 文件加载前静态安全扫描

## Agent 演进三阶段
| 阶段 | 代表 | 特点 |
|------|------|------|
| 被动 Agent | 早期 | 一问一答，无法执行复杂长周期任务 |
| 自主 Agent | OpenClaw / Claude Code | 自主规划 + 工具调用 + 复杂任务 |
| **自进化 Agent** | **Hermes** | 自主执行 + 执行中学习 + 越用越强 |

## Related
- [Hermes Agent](ch03/060-hermes-agent.html) — Nous Research 开源框架（4万+ Stars），核心亮点自进化
- [OpenClaw 架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/openclaw-architecture.md) — Hermes 竞品和参照系，Prompt/Context/Harness 设计高度相似
- [Claude Code 架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-architecture.md) — 同为 Agent 深度解析系列参照
- [MemOS Hermes 插件](https://github.com/QianJinGuo/wiki-public/blob/main/entities/memos-hermes-plugin.md) — 第三方记忆插件，与 Hermes 原生 Memory 形成互补
- [Agent Skill 编写指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-skill-writing.md) — Skill 格式规范，与 Hermes 动态 Skill 沉淀机制高度相关
- [原始文章存档](https://mp.weixin.qq.com/s/2xFei8dMx99lc-iyrZZrww)
- [Harness Engineering 七层框架](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-7-layers-framework.md)
- [Claude Code vs OpenClaw 记忆系统 — 向量数据库必要性反思](https://github.com/QianJinGuo/wiki-public/blob/main/entities/读完-claude-code-和-openclaw-的-memory-源码我对agent记忆需要向量数据库这件事产生了怀疑.md)
- [Harness Engineering：AI 从"聪明"到"可靠"的第三代工程范式](ch05/061-harness-engineering.html)
- [Agent 原理、架构与工程实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-engineering-principles-architecture-practice.md)

### 自进化架构的本质：记忆即智能
Hermes 的 Self-Evolving 颠覆了传统 Agent 的设计范式。传统 Agent（如早期 ReAct 框架）的"智能"是静态的——模型参数固定，工具集固定，只能依赖输入提示词中的零星示例来适应新任务。而 Hermes 将"进化"本身工程化为两个正交路径：**外挂式技能沉淀**和**内功式 RL 训练**，形成类似生物体的外显记忆 + 内隐学习双重机制。
这一设计的深层逻辑在于：模型权重的改变（RL）和显式知识的存储（Skill）是互补的。前者慢但泛化深，后者快但依赖检索。Hermes 通过 `_iters_since_skill` 计数器把技能生成变成一个自驱动的过程，而非用户手动触发，这解决了 OpenClaw/Claude Code 用户"想用 Skill 但懒得写"的根本痛点。

### GRPO 的工程意义：去 Reward Model 化
DeepSeek R1 提出的 GRPO 最大的工程贡献是**证明了 Reward Model 可以被绕过**。传统 RLHF 需要训练一个 Reward Model 来评价回答质量，这引入了额外的建模误差和训练成本。GRPO 让同一问题的多个采样回答相互竞争，直接用奖励函数打分来驱动优化。
对 Hermes 的实际影响：团队不需要维护一套单独的 Reward Model 标注流程，奖励函数可以直接对接可执行验证（编译、运行测试、访问网络），这使得奖励信号本身是**可信赖的**，而不是另一个模型的"猜测"。这解释了为什么 Hermes 的奖励函数设计强调可执行真实验证——它的奖励信号质量直接决定了训练效果。

### 上下文压缩的相对比例策略：窗口多样性的解法
OpenClaw 用绝对 Token 数（18K）触发压缩，在上下文窗口较小的模型上表现尚可，但遇到 200K 窗口的 Claude 或 Gemini 时，50% 触发阈值意味着要等到 100K Tokens 才压缩——这显然是浪费。Hermes 采用相对窗口比例（如 50%），自适应特性让它在任意窗口大小下都能保持一致的记忆管理策略。
这背后还有一个更本质的设计哲学：**让 Agent 自己管理自己的注意力资源**。OpenClaw 把压缩时机交给用户配置，Hermes 则内化为系统的自适应的行为。

### Harness Engineering 的护栏价值
14 种错误分类 + 子 Agent 沙箱隔离，是 Hermes 在**生产级可靠性**上的关键投入。大多数开源 Agent 演示只处理成功路径，真实环境中 auth 失败、rate_limit、context_overflow 才是常态。Hermes 的错误自愈不是简单重试，而是**按错误类型分类处置**——认证失败和额度用完的处理策略完全不同，这比"出错了就重试三次"的简单逻辑可靠得多。

## 实践启示
### 立即可用的设计模式
**1. 后台异步复盘机制值得借鉴**
主 Agent 同步响应 + 后台审查 Agent 异步进化的前台/后台分离模式，可以直接移植到任何需要"快速响应 + 持续优化"的 Agent 系统。实现要点：审查 Agent 必须是轻量的（只做分析不执行任务），且与主 Agent 完全解耦。
**2. Skill 自动生成的触发阈值设计**
`_iters_since_skill` 计数器是一个极佳的**低侵入性反馈机制**——它不打断主流程，只在安静期（连续 10 轮无技能操作）才提醒。这比强制用户填写反馈表单的体验好得多，且积累的数据质量更高（用户在任务刚完成后马上写的经验往往更准确）。
**3. 轨迹压缩的"头-尾-摘要"策略**
15250 Tokens 的精炼轨迹（头部任务定义 + 尾部最后 4 轮 + 中间 LLM 摘要）是处理长对话的标准范式。头部保护确保模型始终知道"我要做什么"，尾部保护保留了最近的上下文（对强化学习来说，尾部往往是最有信息量的），中间摘要则压缩了冗长的中间过程。这一策略对任何需要处理长上下文的系统都适用。

### 中期可探索的方向
**渐进式 RL 训练：小步快跑验证**
不要一开始就上大规模数据训练。先用小批量（如 32 条轨迹）验证奖励函数设计的合理性，确认信号质量后再扩大规模。这一原则在机器学习工程中普遍适用，但在 Agent RL 训练中往往被急于看到效果的团队忽视。
**多维度奖励函数的部分分设计**
给"写了开标签但没闭合"的部分分设计非常符合真实任务的连续性——现实中的解决方案很少是 0/1 的，而是有中间状态的。这种部分奖励的设计可以防止模型在遇到困难时完全放弃，而是尝试走到更接近正确答案的方向。

→ [原文存档](https://mp.weixin.qq.com/s/2xFei8dMx99lc-iyrZZrww)

### 长期需要注意的风险
**Skill 数量膨胀后的检索质量**
当 Skill 文件积累到数百个时，检索质量会成为系统瓶颈。OpenClaw 的 Skill 是用户主动安装的，数量可控；Hermes 的 Skill 是自动生成的，理论上会持续增长。需要提前设计 Skill 的生命周期管理（合并、废弃、版本化）机制。
**RL 训练的数据隐私**
文章明确指出不用用户对话做 RL，核心问题是隐私。但"人工导入 + Teacher Model"这条路径本身也有成本——Teacher Model（默认 Claude Opus 4.6）的 API 调用成本不容忽视。团队需要评估自进化带来的能力提升是否足以覆盖额外的训练成本。
**多模型支持的一致性挑战**
动态注入指令机制（Claude 无需提醒，GPT/Codex 禁止幻觉，Gemini 需要规范）意味着系统需要对每个模型有不同的行为假设。这在模型更新后可能需要重新调优，是多模型支持的真实成本。

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/reinforcement-learning-rlhf.md)

---

## Ch02.026 Claude Code Prompt 提示词体系源码解析

> 📊 Level ⭐⭐⭐⭐⭐ | 14.0KB | `entities/claude-code-prompt-source-analysis.md`

## 概述
FanOne 从源码角度解析 Claude Code 的 Prompt 提示词模块六大分层体系：Core System（静态/动态分离 + 优先级策略树）、Tool（自然语言行为协议）、Skill（渐进式加载 + Reading Guide）、Agent（强角色边界 SOP）、Context Management、Memory（四类分级存储）。与 [Claude Code 架构解析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-architecture.md) 构成完整源码解读系列。

## 六大 Prompt 模块
| 模块 | 核心职责 | 关键设计 |
|------|---------|---------|
| **Core System Prompt** | 角色/边界/风格/风险原则 | 静态/动态分离 + P0-P4 优先级树 |
| **Tool Prompts** | 每个工具的用途/约束/边界 | 自然语言行为协议，不用代码补丁 |
| **Skill Prompts** | 专项能力包 + 渐进式展开 | Reading Guide + 语言检测 + doc 标签 |
| **Agent Prompts** | 四种角色（coordinator/worker/verifier/planner）| 强角色边界 SOP 模板 |
| **Context Management** | 压缩/总结/提取/恢复 | — |
| **Memory Prompts** | user/feedback/project/reference 四类存储 | 持久化文件 + MEMORY.md 索引 |

## Core System Prompt：优先级策略树
**buildEffectiveSystemPrompt** 保证多模式/多角色/多来源 prompt 共存时的覆盖关系：

| 优先级 | 类型 | 规则 |
|--------|------|------|
| **P0** | Override | 硬覆盖，其他所有 prompt 全部失效 |
| **P1** | Coordinator | coordinator mode 开启时，主线程变为调度者 |
| **P2** | Agent | mainThreadAgentDefinition 设置时；proactive mode 下追加而非替换 |
| **P3** | Custom | 用户 `--system-prompt` 传入 |
| **P4** | Default | 最终兜底 |
**静态/动态分离**：静态规则缓存（不频繁变化的部分），动态规则每次会话更新。两者有明确 boundary 划分。

## Tool Prompts：自然语言行为协议
CC 的 Tool Prompt 特点：

- **不用代码补丁**：把规则以自然语言放在 Prompt 里，充分相信大模型的理解能力
- **典型结构**：「这个工具是什么 / 什么时候该用 / 什么时候不该用 / 参数约束是什么」
- **BashTool 特殊案例**：Prompt 复杂到像 SOP（定义了 git 提交/PR 详细流程、禁止事项、Skill 替代部分 git 流程）—— 看起来是 Skill 的前身

## Skill Prompts：渐进式加载
**问题**：所有工具定义塞进上下文 → token 严重浪费

**Solution**：Skill 作为 Prompt 资产先注册，运行时不立刻展开，按需从 SkillTool 展开成上下文消息。

### Token 优化：Reading Guide + 语言检测
- `detectLanguage`：检测项目语言（Python → pyproject.toml/requirements.txt，Go → go.mod，Java → pom.xml）
- 只发**当前项目最相关的文档**，不发全部语言版本
- doc 标签标识文档来源，防止重复检索

### Skill Prompt 标准格式
```markdown
name / description / allowedTools / model / hooks / paths

## Reference Documentation
...Reading Guide...（文档索引）

## Included Documentation
<doc path="go/claude-api/README.md">...</doc>
<doc path="shared/tool-use-concepts.md">...</doc>

## When to Use
## Common Pitfalls
```

## Agent Prompts：强角色边界 SOP
### 主线程视角（如何使用 AgentTool）
Prompt 组成：Shared core + When NOT to use + Usage notes + Writing the prompt + When to fork + Examples

### Agent System Prompt 模板
```markdown

## 工作职责：负责什么 / 核心价值
## 强制边界：不能做什么 / 失败条件
## 可获取信息：输入什么 / 依赖什么上下文
## 执行过程：先做什么 → 再做什么 → 何时停止 → 何时升级
## 错误处理：常见错误行为 + 纠正方法
## 工具使用：优先用什么 / 什么不能碰 / 什么信号要验证
## 输出规范：汇报格式 / 必须字段 / verdict/critical files/summary
```
**原则**：用有逻辑的自然语言，不用 JSON/key-value 编码语言。

## Memory Prompts：四类分级存储
### 四类 Memory
| 类型 | 内容 | 写法 |
|------|------|------|
| **user** | 角色/目标/知识水平/偏好 | 直接描述 |
| **feedback** | 对 Agent 工作方式的反馈 | 规则 → Why → How to apply |
| **project** | 事实/决策/动机/截止时间/事故背景 | 事实 → Why → How to apply |
| **reference** | 看板/dashboard/Slack/Linear 入口 | 直接描述 |
**不进 Memory**：代码结构、git 历史、修 bug recipe、CLAUDE.md 内容、临时任务状态。

### 两步保存法
1. 每条 memory 写**单独文件** + frontmatter（name/description/type）
2. 入口加到 `MEMORY.md`（仅索引，不写正文）

### 读取时机
- 相关时读 / recall/check/remember 时必须读 / ignore memory 时当为空
- memory 可能过时——提到文件/函数/flag 时**先验证是否还存在**

### 分层设计的工程哲学
六大模块的划分不是功能的简单堆砌，而是对"prompt 职责"的精细分解。每层解决不同粒度的问题：

| 层级 | 解决的问题 |
|------|-----------|
| Core System | 角色、边界、风格、风险原则 |
| Tool | 调用契约、使用条件、参数约束 |
| Skill | 知识分发、按需加载 |
| Agent | 协作结构、角色边界 |
| Context Management | 上下文容量管理 |
| Memory | 长期记忆与知识保留 |
这种分层使得每层可以独立演进，不互相耦合。

### 静态/动态分离的性能含义
静态规则缓存 → 减少每次会话的 token 消耗；动态规则按需 → 会话特定信息不冗余。两者之间有明确的 boundary 划分，使得缓存失效范围清晰可控。

### 优先级树的覆盖语义
P0 硬覆盖在极端情况下保留降级通道；P1/P2 的追加而非替换设计是关键亮点——proactive mode 下追加而非替换，保持了系统可扩展性。多模式/多角色/多来源 prompt 共存时，优先级策略树保证覆盖关系清晰。

### 自然语言行为协议的深意
"充分相信大模型的理解能力"是 CC 设计哲学的核心。不依赖代码补丁来约束模型行为，而是用自然语言描述工具语义：工具是什么 / 什么时候该用 / 什么时候不该用 / 参数约束是什么。这是一种"语义优先于结构"的设计哲学。

### 渐进式加载的成本控制
注册与展开的分离是关键技术：Skill 作为 Prompt 资产先注册，运行时不立刻展开，按需从 SkillTool 展开成上下文消息。Token 消耗从"全部"降到"按需"。语言检测 + Reading Guide 进一步减少不相关文档传输；doc 标签防止同一文档被重复引用。

### Agent 强角色边界的协作语义
七维度角色契约：工作职责 / 强制边界 / 可获取信息 / 执行过程 / 错误处理 / 工具使用 / 输出规范。coordinator/worker/verifier/planner 四种角色的语义距离清晰，各自的失败条件和升级条件明确。

### 四类 Memory 的知识分层
user → 关于"人"的知识；feedback → 关于"协作方式"的知识；project → 关于"事实"的知识；reference → 关于"外部系统"的知识。不进 Memory 的内容划定了边界（代码结构、git 历史、修 bug recipe、CLAUDE.md 内容、临时任务状态），防止记忆系统过载。

## 实践启示
### 1. 按职责分层设计 prompt 系统
不要把所有规则塞进一个 system prompt。区分：角色定义（Core）/ 工具约束（Tool）/ 知识资产（Skill）/ 协作协议（Agent）/ 上下文管理（Context Management）/ 长期记忆（Memory）。分层后每层可独立测试、独立迭代。

### 2. 优先级覆盖比追加更重要
多来源 prompt 共存时，明确优先级比简单追加更有价值。P0（硬覆盖）→ P1（Coordinator）→ P2（Agent追加）→ P3（Custom）→ P4（Default）的设计值得借鉴。这套机制保障了系统在多模式切换时的可预测性。

### 3. 静态缓存 + 动态按需是性能优化的标准模式
不频繁变化的部分（角色定义、风险原则、工具总则）缓存起来减少 token 消耗；会话特定的部分（memory、session guidance）每次会话更新。这套模式适用于任何需要控制 token 成本的场景。

### 4. 自然语言 > 代码补丁
在 prompt 中用自然语言描述工具的使用规范，而不是用代码/JSON 去限制模型行为。大模型对语义的理解远比结构化编码更灵活。信任模型的理解能力，比试图用参数定义约束它更有效。

### 5. 渐进式展开是 token 成本控制的关键
Skill/knowledge module 的思想：不是一次性加载所有知识，而是按需展开。需要建立一套"注册→展开"的机制：注册时只知道有哪些 Skill，展开时才注入具体内容。语言检测 + Reading Guide 是具体实现手段。

### 6. Agent 角色用 SOP 而非 JSON 定义
用有逻辑的自然语言描述角色，比用 JSON/key-value 编码更利于模型理解。每个角色应有：明确的工作职责 + 强制边界 + 可获取信息 + 执行过程 + 错误处理 + 工具使用指南 + 输出规范。七个维度构成完整的角色契约。

### 7. Memory 系统按类型分层，定期验证时效
Memory 分四类（user/feedback/project/reference）避免记忆混乱。每条 memory 写单独文件 + frontmatter + MEMORY.md 索引。Memory 内容可能过时——提到文件/函数/flag 时必须先验证是否还存在。

### 8. BashTool 的 SOP 化是工具设计的高阶形态
BashTool 的 prompt 已经复杂到像高风险工具专用操作 SOP（定义 git 提交/PR 详细流程、禁止事项、Skill 替代部分 git 流程）。这提示：当某个工具的行为复杂度超过简单描述时，应该用 SOP 而非简单 prompt 来定义它。

## 相关页面
- [原文存档](https://mp.weixin.qq.com/s/ogougiFVBLXAY2IihS94JA)
- [Claude Code Skills 实践与 Superpowers](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-skills-superpowers-practice.md) — Skill 体系工程化实践
- [Claude Code Subagent 上下文卫生](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-subagent-context-hygiene.md) — Subagent = Harness 上下文隔离工具
- [Agent Memory 架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-memory-architecture.md) — 与 CC Memory 的对比
- [Obsidian + Claude Code 集成指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/obsidian-claude-code-integration.md) — 五种集成策略

## 相关实体
- [Claude Code 源码解析：Skills/MCP/Rules 底层机制对比](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-skills-mcp-rules-source-analysis.md)
- [两万字详解Claude Code源码核心机制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-20000-char-source-analysis.md)
- [Claude Code 源码深度解析（13 核心机制）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-source-deep-dive-warrior.md)
- [Claude Code 源码拆解：从启动到多 Agent 扩展层](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-source-architecture.md)
- [Claude Code 接入自建开源模型：企业私有化与降本实践 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-open-source-model-enterprise-practice.md)
- [Claude Code 设计原则与对照分析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-architecture-analysis.md)
- [Claude Code vs OpenClaw 记忆系统 — 向量数据库必要性反思](https://github.com/QianJinGuo/wiki-public/blob/main/entities/读完-claude-code-和-openclaw-的-memory-源码我对agent记忆需要向量数据库这件事产生了怀疑.md)
- [Agent Memory System 设计指南](https://github.com/QianJinGuo/wiki-public/blob/main/queries/agent-memory-system-design.md)
- [SkillClaw](https://github.com/QianJinGuo/wiki-public/blob/main/entities/skillclaw.md)
- [Skill 系统：Agent 如何把经验沉淀成可复用能力](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-skill-system-winty.md)
- [深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-prompt-context-harness.md)
- [AI Agent 记忆系统架构](ch04/115-how-ai-agent-memory-works.html)
- [从Vibe Coding到Agentic Engineering：重构后台开发全流程 — 腾讯技术工程](ch04/306-tencent-vibe-coding-to-agentic-engineering-backend.html)
- [Agent Memory System Design](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-system-design.md)
- [KAIROS — Claude Code 常驻协作范式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/kairos-claude-code-paradigm.md)
- [Thin Harness Fat Skills](https://github.com/QianJinGuo/wiki-public/blob/main/entities/thin-harness-fat-skills.md)
- [Hermes Agent 记忆系统深度拆解](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-memory-system-vs-openclaw.md)
- [Code as Agent Harness 综述](https://github.com/QianJinGuo/wiki-public/blob/main/entities/code-as-agent-harness-survey.md)
- [AI Agent 工程师能力地图](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-agent-engineer-capability-map.md)
- [using claude](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-html-artifacts.md)
- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/prompt-engineering-guide.md)

---
