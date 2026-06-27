# Skill Craft：Claude Skill 质量工程工具

## Ch07.043 Skill Craft：Claude Skill 质量工程工具

> 📊 Level ⭐⭐ | 7.4KB | `entities/claude-skill-quality-tool-skill-craft.md`

# Skill Craft：Claude Skill 质量工程工具

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-skill-quality-tool-skill-craft.md)

## 摘要

Skill Craft 是面向 Claude Skill 的质量工程工具（GitHub: [3stoneBrother/skill-craft](https://github.com/3stoneBrother/skill-craft)），由微信公众号"三石随笔录"作者开发。它解决 Skill 系统中"不触发、乱触发、越用越跑偏"三类典型问题，核心洞察是：**大多数 Skill 的问题不在"有没有功能"，而在"有没有质量防护"——本质上没有把 Skill 当成需要工程化治理的对象**。

## 核心要点

1. **7 类系统性失效模式**：约束衰减（对话越长规则越弱）、工具选择漂移（超时后换工具不回来）、输出膨胀（要简明给论文）、依赖链断裂（29 个对象只处理 20 个）、并行孤岛（子 Agent 结论矛盾不校验）、触发模糊（误判用户意图）、幻觉填充（没查到就编一个）。这些模式会**连锁触发**——输出膨胀挤满上下文 → 约束衰减 → 工具漂移/步骤跳过/幻觉填充。

2. **四种模式覆盖完整生命周期**：`check`（评估单个 Skill）、`fix`（修复+回归验证）、`create`（从零生成合规 Skill）、`audit`（系统级审计多 Skill 路由边界和职责分工）。

3. **三层评估体系**：8 个结构模块（触发条件、行为准则、工具优先级、输出约束、流程 Checkpoint、依赖链、子 Agent 委派规则、幻觉防护）→ 7 类反模式风险检测 → 3 条完整性原则（可计数验收、Checkpoint 阻断、失败路径定义）。

4. **fix 模式的回归验证机制**：修复后重新评估，确认分数提升、风险下降、结构闭环。四类关联检查确保修复不引入新问题（引用方同步、对称方同步、消费方同步、同层结构检查）。

5. **audit 模式的系统视角**：当系统有 5+ Skill 时，单独看每个可能"不算太差"，但放在一起就会出现路由边界重叠、文档传播旧规则、引用链断裂等系统性问题。

## 深度分析

### 1. Skill 质量问题的根因：缺乏工程化治理

Skill Craft 的核心贡献在于**将 Skill 从"写一段提示词"提升为"工程化治理对象"**。传统 Skill 开发的问题是：开发者写好 Skill 后丢进 `~/.claude/skills/` 就完事了，没有测试、没有回归、没有系统级审计。这导致：

- Skill 在简单场景下表现良好，但长对话中逐渐失效（约束衰减）
- 多个 Skill 共存时路由冲突，Agent 不知道该触发哪个
- Skill 修改后没有回归验证，修复一个问题引入另一个

Skill Craft 将软件工程的最佳实践（单元测试、回归测试、代码审查、系统集成测试）映射到 Skill 开发领域，填补了一个关键空白。

### 2. 三层评估体系的设计哲学

三层评估的设计体现了从"有没有"到"防不防得住"的思维跃迁：

- **第一层（结构模块）**：检查 Skill 是否具备必要的结构元素。但"有模块"不等于"有效"——触发条件不能只写"触发"，还要写"不触发"和"歧义处理"。
- **第二层（反模式风险）**：检查结构是否真的能防住对应问题。不是有没有幻觉防护模块，而是模块有没有**防御力**——"注意准确"是无效的，"没有来源就不能输出"才是有效的。
- **第三层（完整性原则）**：三条原则直击 LLM 的行为特性——模型倾向于"跳过"和"编造"，所以需要可计数验收（处理数必须等于总数）、Checkpoint 阻断（每步都要中间输出）、失败路径定义（没有 else，模型默认 skip）。

这种分层设计体现了对 LLM 行为模式的深刻理解——不是让 Skill 更"详细"，而是让 Skill 更"防错"。

### 3. 约束衰减：Skill 系统的阿喀琉斯之踵

7 类失效模式中，**约束衰减**是最根本的问题。它的机制是：对话上下文有限（如 200K tokens），前几轮 Skill 规则占据显要位置，但随着对话增长，早期规则被推到上下文深处，模型的注意力机制对它们的权重下降。同时，输出膨胀（模型倾向于生成更多内容）加速了这一过程——膨胀的输出挤占上下文，让约束更快地被"遗忘"。

这个问题的工程含义是：**Skill 的质量不能只靠"写得好"，还需要结构性的防衰减机制**——如定期重申关键约束、在 Checkpoint 处重新加载规则、限制单次对话的轮次上限等。

### 4. 从单 Skill 到多 Skill 系统的复杂性跃迁

audit 模式揭示了一个关键问题：**多 Skill 系统的复杂性不是线性的**。5 个各自"不算太差"的 Skill 放在一起，可能出现：

- 路由边界重叠：两个 Skill 的触发条件有交集，Agent 在歧义时随机选择
- 真值源不统一：Skill A 说"用工具 X"，Skill B 说"用工具 Y"，Agent 无所适从
- 文档传播滞后：主文档改了，但 README 和 Skill 内的引用还是旧版本
- 引用链断裂：Skill A 引用 Skill B 的某个规则，但 Skill B 更新后该规则被删除

这类似于微服务架构中的"分布式单体"问题——每个服务单独看都合理，但整体行为不可预测。

## 实践启示

1. **把 Skill 当成代码来对待**：为 Skill 建立版本控制、测试用例、回归验证流程。Skill Craft 的 check/fix/create/audit 四种模式可以直接嵌入 CI/CD 流程。

2. **Skill 必须定义"不触发"条件**：这是 Skill Craft 审计发现的最致命问题之一。只写"何时触发"不写"何时不触发"，Agent 会在歧义场景下误触发。

3. **可计数验收是防幻觉的关键**：不要写"逐个处理"，要写"处理数必须等于总数"。模型擅长计数和比较，不擅长判断"是否处理完了"。

4. **多 Skill 系统需要定期 audit**：当 Skill 数量超过 5 个时，建议每月运行一次系统级审计，检查路由边界、真值源一致性、引用链完整性。

5. **失败路径定义是生产级 Skill 的标配**：每个流程步骤都要有 else 分支。模型在没有 else 时的默认行为往往是 skip（跳过），而不是报错或询问——这会导致静默失败。

## 相关实体

- [两万字详解Claude Code源码核心机制](/ch01-734-两万字详解claude-code源码核心机制/) — Claude Code 的 Skill 加载与执行机制
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](/ch04-215-agentops-operationalize-agentic-ai-at-scale-with-amazon-bed/) — Agent 系统的可观测性与运维
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](/ch01-707-存之有序-治之有矩-agent-记忆系统的工程实践与演进/) — Agent 记忆系统中的约束管理
- [Harness Engineering Framework](/ch05-041-harness-engineering-概念框架/) — Harness Engineering 中的质量工程维度
- Prompt Engineering Patterns — 提示工程模式
- MOC

---

