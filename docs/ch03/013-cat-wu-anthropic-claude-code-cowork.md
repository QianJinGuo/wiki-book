# Cat Wu — Anthropic Claude Code/Cowork产品负责人

## Ch03.013 Cat Wu — Anthropic Claude Code/Cowork产品负责人

> 📊 Level ⭐ | 9.5KB | `entities/cat-wu-claude-code-pm.md`

## 核心洞察
| 话题 | 洞察 |
|------|------|
| 发布速度 | 目标清晰+Research Preview+精简跨职能流程 |
| PM护城河 | 产品品味（判断做什么），不是规划协调 |
| 被低估的AI技能 | 让模型反思自己的错误（问"你为什么这么做"） |
| Evals重要性 | 写好Evals是一门手艺，需要理解产品目标和失败模式 |
| 自动化原则 | 95%≈没自动化，必须做到100%才真正可靠 |
| Anthropic成功 | 使命对齐+专注，使命筛子过滤一切分散注意力的方向 |

## Claude Code三产品选型
- **CLI**：最新功能+多任务并行
- **Desktop**：前端+图形化+不熟悉终端
- **Cowork**：非代码产出（文档/邮件/PPT/Slack）

## 与本文相关
- [Claude Code Agent Engineering](ch03/067-claude-code-agent.html) — Claude Code工程设计
- [Claude Code Prompt Context Harness](../ch09/060-claude-code-prompt.html) — Claude Code Prompt/Harness分析
- [Hermes Agent Deep Dive](ch03/090-hermes-agent.html) — Anthropic的Self-Evolution对照
-  — 详细访谈内容（raw）

## 相关实体
- [Claude Code vs OpenClaw Agent 记忆系统对比](ch03/075-claude-code.html)
- [开源 AI 知识管理搭档 Obsidian + Claude Code 完整集成指南](ch03/002-obsidian-claude-code.html)
- [CLAUDE.md 12 条规则：Karpathy 扩展模板](../ch09/158-claude-code-1.html)
- [两万字详解Claude Code源码核心机制](ch03/075-claude-code.html)
- [Claude Code Subagent 上下文卫生](../ch04/326-claude-code-subagent.html)
- [Claude Code 源码解析：Skills/MCP/Rules 底层机制对比](../ch07/006-claude-code-skills-mcp-rules.html)
- [Claude Code 工具设计演化](https://github.com/QianJinGuo/wiki/blob/main/concepts/claude-code-tool-design-evolution.md)
- [claude-code-agent-view](../ch09/001-claude-code-agent-view.html)
- [Claude Opus 4.7 发布分析](../ch01/849-claude-opus-4-7.html)
- [Anthropic 官方技能最佳实践：14 个可复用的 Agent Skills 设计模式](../ch04/385-agent-skills.html)
- [AI Agent工具数量陷阱——5个边界清楚的工具胜过20个模糊工具](../ch04/030-ai-agent.html)
- [Anthropic发布「AI原生创业公司」手册：涵盖全流程四大核心阶段，一人公司法典来了](../ch04/444-anthropic-ai.html)
- [Claude Code 大型代码库最佳实践 — Anthropic 企业级部署指南](ch03/075-claude-code.html)
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](ch03/045-agent.html)
- [Claude 发布官方报告，承认存在 3 处质量退化问题](../ch01/1024-claude.html)

- [刚刚Opus 4.7发布，相比4.6核心变化，与Claude Code搭配最佳实践](ch03/075-claude-code.html)
- [Prompt Caching 工程实践 — Anthropic Claude Code 经验总结](../ch01/288-anthropic-prompt-caching-claude-code.html)

## 深度分析
### 使命驱动 vs 流程驱动：Anthropic 的双重护城河
Cat Wu 在访谈中揭示了 Anthropic 高发布速度的真实来源——并非外界臆测的 "Mythos 模型"，而是一套**使命对齐 + 流程精简**的组合拳。
使命（mission）在这里扮演的是**筛子角色**：当团队方向与 "为全人类带来安全 AGI" 冲突时，任何看似有利的机会都会被过滤掉。这使得跨组织快速决策成为可能，因为争论最终可以被使命本身终结。
流程层面，"移除一切发布障碍" + "Research Preview 格式" 让 1-2 周出货成为常态而非例外。这与 Lenny Rachitsky 的 PM 传统智慧（6-12 个月路线图）形成了鲜明对比——在 AI 时代，**速度本身就是竞争力**。

### 产品品味与角色融合：PM 职能的范式转移
Cat 提出的 "产品品味 = 最稀缺技能" 指向一个深刻趋势：当代码编写成本趋近于零，"写什么" 的判断力比 "怎么写" 的工程能力更珍贵。
这一判断的延伸是**角色边界模糊化**：PM 在做工程，工程师在做 PM，设计师在提交代码。这种融合不是管理失控，而是 AGI 时代协作的自然形态——人类专注判断，模型专注执行。
关键洞察：工程师拥有产品品味是最稀缺的人才组合，因为这种人能端到端（从用户反馈到发布）完成工作，而不需要跨角色的协调成本。

### 自动化原则：95% = 没自动化
这是访谈中最具实操价值的观点之一。
Cat 的逻辑很清晰：95% 自动化意味着你仍然需要人工介入，等于没有真正节省时间。真正的自动化必须达到 100%，否则只是把人工劳动换了一种形式。
实操含义：

- 找重复性工作 → 教给 AI → 迭代直到 100% 有效 → 才算完成
- 初期不追求完美，追求**端到端跑通**
- 100% 是诚信门槛，不是技术极限

### Evals：被低估的产品工具
10 个好的 eval 就能让团队量化目标、理解进度、发现缺失。 这与业界常见的 "eval 复杂化" 倾向形成对比——Cat 认为哪怕只构建 5 个 eval 也极具价值，关键是**找到 "有品位" 的用户群体**作为参考基准。
这解释了为什么 Anthropic 能快速迭代：他们不是靠大量用户数据，而是靠**少数高质量用户的深度反馈**来校准产品方向。

### 模型进化与 Harness 简化的反向关系
"模型会把你的 Harness 当早餐吃掉"——这句话精准描述了 AI 产品开发的一个反直觉现实：
当模型变强，你会**移除**那些因为模型表现不佳而不得不添加的 "拐杖"。这意味着产品架构需要持续**简化**而非复杂化——今天为弥补模型不足而添加的防护栏，明天可能成为阻碍模型能力的噪音。

## 实践启示
1. **使命先行**：建立清晰的团队使命作为决策筛子，减少无意义争论，加快跨组织决策速度
2. **Research Preview 心态**：接受 "发布有 Bug 的功能，快速获取反馈迭代"——速度 > 完美， Feedback Loop > 一次性完美
3. **自动化诚信标准**：任何未达到 100% 成功率的自动化都不能依赖，必须持续迭代直到无需人工介入
4. **Eval 聚焦策略**：不需要大量数据，先构建 5-10 个高质量 eval，找到 "有品位" 的用户小组作为产品校准基准
5. **角色融合准备**：PM 需要具备基础工程判断力，工程师需要培养产品品味，设计师可能需要能提交代码——技能边界正在消失
6. **模型进化适配**：定期审视产品中为模型弱点添加的 "拐杖"，在模型能力提升后主动移除，而非固守原有设计
7. **并发思维**：从单任务向 50-100+ 并行 Agent 演进是必然方向，产品设计需要提前考虑远程任务管理、信任验证和介入时机
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/cat-wu-anthropic-pm-interview.md)

---

