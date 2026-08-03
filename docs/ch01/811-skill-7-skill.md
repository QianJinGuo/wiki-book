# 工作流的 Skill 怎么写？从 7 个顶级 Skill 中提炼的模式与最佳实践

## Ch01.811 工作流的 Skill 怎么写？从 7 个顶级 Skill 中提炼的模式与最佳实践

> 📊 Level ⭐⭐ | 7.8KB | `entities/工作流的-skill-怎么写从-7-个顶级-skill-中提炼的模式与最佳实践.md`

# 工作流的 Skill 怎么写？从 7 个顶级 Skill 中提炼的模式与最佳实践

> 从微信文章 [工作流的 Skill 怎么写？从 7 个顶级 Skill 中提炼的模式与最佳实践](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/工作流的-skill-怎么写从-7-个顶级-skill-中提炼的模式与最佳实践.md) 提取。

## 摘要

本文是阿里云开发者公众号对 Skill 写作方法论的梳理，样本为 openai/skills、obra/superpowers、stitch-skills、Product-Manager-Skills、trailofbits/skills 等仓库中的 7 个顶级 Skill。核心结论：Skill 本质是「知识注入」——SKILL.md 的指令文本被注入 LLM 上下文后由既有工具执行，写作质量直接决定 Agent 行为；frontmatter 的 description 则决定 Skill 能否在正确时机被加载。文章给出 5+1 种设计模式（线性、决策树、循环迭代、接力棒、多阶段+检查点、思维框架）与对抗 LLM 偷懒的写作技巧。

## 核心要点

- Skill 是一个文件夹，核心是 SKILL.md（YAML frontmatter + Markdown）；加载时全文注入上下文，由 LLM 用既有工具执行，而非生成新工具。
- description 是加载率的「门面」：要写触发短语（"deploy my app"）、时序位置（"before writing implementation code"）与产品关键词；模糊描述（"Helps with deployment stuff"）是反面典型。
- 五种模式：线性（vercel-deploy，77 行）、决策树+按需加载（cloudflare-deploy，224 行）、循环迭代（TDD，371 行）、接力棒（stitch-loop，203 行）、多阶段+检查点（discovery-process，502 行）。
- 特殊模式「思维框架」（audit-context-building，302 行）控制 LLM 怎么想而非做什么：量化阈值、反幻觉规则、非目标约束。
- 知识组织三层架构即 token 预算管理：frontmatter ~100 → 主文件 2K-5K → references/ 按需加载，总占用 <10K tokens。
- 对抗偷懒四武器：强硬语气、借口反驳表、量化阈值、负面指令；官方规范（agentskills.io、anthropics/skills）与精选仓库/列表构成生态参考。

## 深度分析

### Skill 的本质：知识注入，而非工具封装

Skill 不会动态生成新工具，只把指令文本作为 tool-result 注入上下文，由 LLM 自主决定如何执行。这意味着作者是在为「能力很强但容易走捷径的读者」写操作手册：指令必须具体到可直接执行的 bash 命令，并预设安全默认值（"Always deploy as preview, not production"）、超时提示（600000ms）、降级方案（Fallback 脚本）与负面指令（"Do not curl the deployed URL to verify"）。顶级 Skill 普遍自包含 Troubleshooting 表，正因注入的文本不能依赖 LLM 的常识补全。

### description 是加载率的门面

LLM 靠扫描全部 Skill 的 frontmatter（预算约 100 tokens）决定加载谁，因此 description 要回答三问：做什么、用户会怎么说、在流程的哪个位置用。vercel-deploy 列举 "deploy my app"、"push this live" 等触发短语，TDD 定义时序 "before writing implementation code"；扩展字段（type、best_for、scenarios、estimated_time 等）可提供更精确的匹配信号。把 description 当作产品文案来写，是 7 个 Skill 共有的第一课。

### 五种模式的本质差异：控制对象不同

模式差异不在格式而在控制对象：线性控制步骤顺序；决策树控制信息组织——按用户意图（"I need to run code"）而非技术术语分类，靠 7KB 主文件 + references/ 渐进式披露；循环迭代控制质量——Iron Law、12 种借口反驳表、退出清单保证每轮不缩水；接力棒控制跨 session 状态——状态写进 next-prompt.md，写下一个接力棒标记为 Critical + MUST；多阶段控制长流程进度——统一 Activities→Outputs→Decision Point 模板，NO 路径标注时间成本，调度 10+ 个子 Skill。模式 3 与 4 的分界清晰：前者状态在对话上下文（分钟~小时），后者状态在文件系统（天~周）。

### 思维框架与通用写作技巧

audit-context-building 代表另一类 Skill：不指挥操作步骤，而是规定思维流程——第一性原理、5 Why/5 How 作分析框架，量化阈值（每个函数至少 3 个不变量、5 个假设）强制分析深度，反幻觉规则（"Never reshape evidence to fit earlier assumptions"）防止自我欺骗，非目标约束（不要识别漏洞、不要提出修复）克制 LLM 最想做的事。通用技巧分三组：防偷懒四武器（强硬语气如 "Delete it. Start over."、借口反驳表、量化阈值、负面指令）、教学三方式（Good/Bad 对比、具体命令、完整示例）、安全三原则（安全默认值、权限最小化、人类兜底 "ask your human partner"）。共同洞察：Skill 写作的一半工作是在预判并堵死 LLM 的偷懒路径。

## 实践启示

1. **从最小可用 Skill 起步**：先用线性模式搭骨架（核心原则 + Prerequisites + Steps + Troubleshooting），跑通后再决定是否拆 references/ 或升级模式。
2. **把 description 当产品文案写**：列出用户可能的原话、定义时序位置、覆盖产品关键词；自检标准是「LLM 只读这 100 tokens，会在正确时机加载我吗」。
3. **按决策树选模式**：明确步骤→线性；大平台选型→决策树（必要时拆导航型/操作型）；反复执行→循环迭代；跨 session 长期项目→接力棒；多周多阶段带决策点→多阶段；深度分析→思维框架。
4. **预设 LLM 的偷懒路径**：预判「合理化借口」并用反驳表堵死，给出量化阈值作为硬性完成标准，用负面指令禁止危险动作。
5. **把 token 预算当架构约束**：主文件控制在 2K-5K tokens，详细文档、示例、清单放入 references/ 按需加载，保持总上下文占用 <10K tokens。
6. **站在生态的肩膀上**：以 agentskills.io 与 anthropics/skills 的 template/spec 为基线，从 openai/skills、obra/superpowers 等精选仓库与 awesome-agent-skills 等列表快速选型。

## 相关实体

- [你写的 Skill，及格了吗？](../ch04/341-skill.html)
- [SkillOS: Learning Skill Curation for Self-Evolving Agents](../ch04/204-skillos-learning-skill-curation-for-self-evolving-agents.html)
- [Perplexity 内部 Skill 设计指南](../ch04/341-skill.html)
- [Skill 系统设计三方对比](../ch04/341-skill.html)
- [Meta-Skill：Skill 编排](../ch04/366-skill-skill.html)
- [Nico 的 25 个 Skill 工作流资产分析](../ch03/076-skills.html)
- [Lightfield：Introducing Skills](../ch03/076-skills.html)
- [GPT-Image-2 完全指南！附大量玩法案例，顺便开源我的生图 Skill ～](ch01/1258-gpt-image-2.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/工作流的-skill-怎么写从-7-个顶级-skill-中提炼的模式与最佳实践.md)

---

