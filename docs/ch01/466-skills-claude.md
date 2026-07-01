# Skills：让 Claude 记住「怎么做」，告别重复教学

## Ch01.466 Skills：让 Claude 记住「怎么做」，告别重复教学

> 📊 Level ⭐⭐ | 8.6KB | `entities/claude-code-skills-workflow-encapsulation-costa-long.md`

# Skills：让 Claude 记住「怎么做」，告别重复教学

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-skills-workflow-encapsulation-costa-long.md)

## 摘要

CostaLong 月影 2026 年 5 月的这篇文章系统介绍 Claude Code 的 Skills 机制 — **把常用工作流封装成可复用的技能，一次定义多次使用**。核心配置项包括 `context: fork`（隔离 Subagent 运行，不污染主 session）和 `disable-model-invocation: true`（防止自动触发，适合有副作用的操作）。Skills 是 Claude Code 相比 prompt 的关键升级：可跨项目持久、可链式组合、可分级权限管控。

## 核心要点

### 1. Skill vs Prompt 的本质差异

| 维度 | Prompt | Skill |
|------|--------|-------|
| 用途 | 一次性指令 | 可复用的工作流 |
| 生命周期 | 单次 session | 跨项目持久 |
| 调用方式 | 每次手动输入 | `/skill-name` 自动触发 |
| 能否组合 | 独立使用 | 可链式调用其他 Skill |

来源：

**关键设计含义**：Skill 是一等公民的工作流封装，而 prompt 是临时指令。把团队反复用到的"代码 review、API 设计、测试生成"沉淀为 Skill，比每次写 prompt 更稳定、可审计、可优化。

### 2. context: fork 解决主 session 污染

```yaml
context:
  fork: true  # 在隔离 Subagent 中运行，不污染主 session
```

来源：

**典型场景**：当你让 Skill 执行"在大代码库里 grep 所有 TODO 并生成报告"，如果直接在主 session 运行，会污染主对话上下文。让 Skill 在隔离 Subagent 中运行，只把最终结果返回给主 session。

### 3. disable-model-invocation 防止自动触发的副作用

```yaml
disable-model-invocation: true  # 防止 Skill 被自动触发，适合有副作用的操作
```

来源：

**关键工程含义**：默认 Claude 可以自由决定是否调用 Skill，但对有副作用的 Skill（部署、发邮件、删文件、推送代码）应禁用自动触发。**这是 Claude Code 工作流中的"安全栏杆"模式**。

### 4. SKILL.md 最小结构

```yaml
---
name: api-review       # 技能名称，用于 /api-review 调用
description: 按标准流程 review API 代码，发现问题列出修复建议
---

# 技能描述
按标准流程 review API 代码...

# 具体步骤
1. 读取路由文件...
2. 对照 schema...
3. 检查错误处理...
```

来源：

**最简结构** = name + description + 步骤列表。前置元数据决定 Skill 如何被发现和调用，正文是给 LLM 阅读的执行指令。

### 5. Skill 的两种部署粒度

```bash
# 项目级 Skill（只对这个项目有效）
.claude/skills/<skill-name>/SKILL.md

# 全局级 Skill（所有项目都能用）
~/.claude/skills/<skill-name>/SKILL.md

# 调用
/api-review
```

来源：

**项目级**：跟随代码仓库提交，团队成员 clone 后自动获得。**全局级**：跨项目共享的通用工作流（如"代码 review"、"文档翻译"）。两种粒度可以并存，形成"团队标准 + 个人偏好"的分层。

## 深度分析

**Skill 作为记忆系统的工程化演进**：Skills 解决了 prompt 每次需要重建上下文的根本痛点，把"怎么做"封装为持久化资产。与 [存之有序治之有矩Agent 记忆系统的工程实践与演进](ch03/044-agent.md) 中的记忆系统不同，Skill 不是靠向量检索召回历史，而是直接定义工作流执行步骤——这是一种"程序性记忆"而非"陈述性记忆"。两者结合可以构建更完整的 agent 知识管理体系。

**context: fork 的隔离设计哲学**：Subagent 隔离模式体现了"最小权限"原则——Skill 的工作上下文与主 session 隔离，防止副作用扩散。这一设计理念与 [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 中的 harness 隔离机制高度一致，都是为了在多 agent 协作时保护主控制平面的稳定性。fork 模式尤其适合大规模代码库扫描等高上下文消耗操作。

**安全栏杆机制的本质**：disable-model-invocation: true 是一个"人类在环"（human-in-the-loop）强制门禁，防止 autonomous agent 执行不可逆操作。与传统软件中的"双击确认"或"删除二次确认"相同，这是对 AI 执行危险操作的安全校验。该设计呼应了 [龙虾装上了可以用来干啥分享下我的 Openclaw 多智能体团队搭建经验 V2](ch11/210-openclaw.md) 中的多 agent 权限管控思路——不同技能的自动化等级应该可配置。

**工作流级封装 vs 原子级工具**：Skill 的可链式调用代表了一种新的抽象层次——工作流级封装。对比 [两万字详解Claude Code源码核心机制](ch03/074-claude-code.md) 中描述的原子级 tool-use，Skill 更适合复杂多步骤流程（如"代码 review → 生成测试 → 修复 lint"流水线），而 tool 适合单点操作。两者可以共存，Skill 调用 tool，tool 执行原子步骤。

**项目级与全局级的分层治理模型**：Skill 的两层部署结构（.claude/skills/ vs ~/.claude/skills/）本质上是"团队标准 + 个人偏好"的分层治理，与软件工程中"项目本地依赖 vs 全局依赖"的思路一致。参见 [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](ch03/044-agent.md) 中提到的 vibe coding 趋势，这种分层设计让 AI 工作流既可团队共享标准化，又可个人灵活定制，是工程化落地的关键平衡点。

## 实践启示

1. **优先把高频重复的工作流封装为 Skill**：当一个工作流在团队中每周被重复 5+ 次，立即沉淀为 Skill — 收益包括上下文节省、知识沉淀、新人 onboarding 加速。
2. **有副作用的操作必须设 disable-model-invocation: true**：部署、发邮件、删除、推送等 Skill 应禁用自动触发，强制要求用户显式 `/skill-name` 调用，避免 agent 误触造成生产事故。
3. **用 context: fork 隔离大型上下文操作**：所有需要扫描/读取大量文件然后返回摘要的 Skill 应在隔离 Subagent 中运行，把"工作上下文"和"主 session 上下文"分开管理。
4. **项目级 Skill 跟随仓库提交，全局级 Skill 保持精简**：把"本项目特有的部署流程、API 规范"放 `.claude/skills/`，把"通用代码 review、文档翻译"放 `~/.claude/skills/`，避免项目级 Skill 污染全局工作流。
5. **用"可链式调用"组合复杂工作流**：把"代码 review Skill"作为基础，组合"自动生成测试用例 Skill" + "自动修复 lint Skill"，可以构建端到端的质量保障流水线。
6. **Skill description 是发现机制**：写好 description 决定 Skill 能否被 Claude 正确识别调用 — 应包含"做什么、什么时候用、输入输出是什么"。

## 关联实体

- [两万字详解Claude Code源码核心机制](ch03/074-claude-code.md)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](ch03/074-claude-code.md)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](ch03/044-agent.md)
- [你不知道的 Agent原理架构与工程实践 V2](ch03/044-agent.md)
- [龙虾装上了可以用来干啥分享下我的 Openclaw 多智能体团队搭建经验 V2](ch11/210-openclaw.md)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](ch03/044-agent.md)
- [Karpathy Vibe Coding Agentic Engineering](ch04/118-karpathy-vibe-coding-agentic-engineering.md)
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [Claude Code Deep Architecture Analysis](https://github.com/QianJinGuo/wiki/blob/main/concepts/claude-code-deep-architecture-analysis.md)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/workflow-orchestration.md)

---

