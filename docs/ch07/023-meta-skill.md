# Meta Skill

## Ch07.023 Meta Skill

> 📊 Level ⭐⭐ | 10.6KB | `entities/meta-skill.md`

# Meta Skill
> "Skill 的 Skill" —— 多个原子 Skill 的"项目经理操作手册"。当员工（Agent）变多、业务（Skill）变多，必然遇到指数级放大的噪音；Meta Skill 是用来指导 Agent 三省六部的白皮书。

**Meta Skill = 在 Skill 之上编排 Skill 的抽象层**。把多步骤编排（并行/串行决策、产出物上下游衔接）**全部内嵌到一份 SKILL.md**，端到端打通一整套长程 Workflow。OpenSquilla 当前内置 **9 个 Meta Skill**（2026-06-04），2,757 ⭐，Apache-2.0。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/meta-skill-skill-orchestration-opensquilla-jay.md)

## 它解决了什么
**SOP 已梳理清楚，但每个蓝色方块都要在对话框单独调 Skill** —— 像戳一下动一下，全程 Human in the loop，光翻 Skill 列表就够忙活半天。

工作流固化后，把所有上下文炼化成超级 Skill：自动判断当前阶段 → 调用对应子 Skill 交付结果 + 心跳机制定时查状态文档 → 完全自动化推进。

> 关键转换：从"手动组合 Skill"到"Skill 自我编排"。

## 三大要素组合
| 要素 | 角色 | 类比 |
|---|---|---|
| **Meta Skill** | "项目经理的操作手册"——决定哪些步骤并行/串行、产出物上下游衔接 | PM |
| **智能路由** | "老虎机"——每个子步骤根据复杂度分配最便宜的合适模型 | 预算管理 |
| **Meta-skill-creator** | 写 PM 手册的元方法——把"想清楚 SOP"这件事工业化 | PM 培训 |

> 三个加起来：调度 + 预算 + 写调度说明书的工具 = **端到端闭环**。

## 典型实现：meta-kid-project-planner
**Prompt**：孩子9岁，想做一本 Meta Skill 魔法书，每页介绍一个咒语。

**内部 5 步流程**（5 个原子 Skill 拼接）：
1. **立项**：询问用户偏好（年龄/周期/预算/家长参与度）
2. **可行性分类**：判断安全/需不需要大人帮/要不要额外买东西
3. **执行**：分步计划 → 材料清单 → 安全提醒 → 家长学习目标 → 最终组装交付
4. **外部信息**：户外活动 → web search 查天气
5. **安全审查**：单独一轮为儿童场景跑安全 filter

**结果**：全程无需人介入，自己跑 20+ 分钟，交付 3000 字 md + 交互式 HTML（哈利波特风格 + 魔镜魔镜 Skill 选择器）。

## 真实成本
- **Meta Skill 创建成本高**：单个 400+ 行 SKILL.md，跟 AI 迭代 ~30 分钟（前提：脑中有清晰 SOP）
- **跨行业 Know-How 整合灾难**：内容行业凑合；跨行业专家经验排列组合 = 不可行
- **社区 Skill 爆炸后供需匹配**：未来上百个 Meta Skill，如何知道哪个最适合场景

## 解决方案：个人 × 社区索引协议
> "你平时常用哪些 Skill、偏好什么组合顺序、哪个试过不好使……这些会作为信号，被 Agent 拿去匹配社区里别人做好的 Skill，然后根据你的工作流缝合出个新的。"

- **个人侧信号采集**：Skill 使用频率/偏好/拒绝
- **社区侧 Skill 共享**
- **自动推荐引擎**：根据个人信号 + 社区 Meta Skill 库，缝合新方案

> 简单来说：**自动的 Skill 推荐引擎**。

## 范式：Skill 2.0
> "单个 Skill 已经不够用了，自动化想要进一步深入，必须要学会对多个子 Skill 排列组合。
> Agent 下一步要解决的问题，已经从'会不会调用工具'，变成了'**会不会组织工具**'。"

| 维度 | Skill 1.0 | Skill 2.0 (Meta Skill) |
|---|---|---|
| **粒度** | 一个 Skill 干一件事 | 多个原子 Skill 拼接 |
| **编排** | 手动（Human in the loop） | SKILL.md 写清楚并行/串行 |
| **选择** | 人工翻 Skill 列表 | 自动按上下文判断 |
| **预算** | 全部用最贵模型 | 按子任务复杂度路由 |
| **生产** | 手写 | Meta-skill-creator 辅助生成 |
| **匹配** | 关键词搜索 | 个人信号 × 社区推荐 |

## 三条线交点（为什么现在出）
1. **模型**：复杂多步骤指令理解能力飞速拉升，Agent token 数据飞轮已转
2. **生态**：社区 Skill 爆发式增长（手写→自动生成→社区共享）—— 当可选 Skill 成千上万时，需要 Meta Skill 这种更高抽象
3. **成本**：大规模跑大模型依然贵；Meta Skill 把"trial-and-error 烧 token"前置到 Skill 层

> 三个痛点同时指向了又一次正在被倒逼出来的范式迭代。

## 与多 Agent 团队的关系
最近不少模型都推出了自己的 Agent 团队：腾讯 Marvis / MiniMax Mavis / Kimi Agent 集群 —— **但 Skill 层似乎还停留在 Claude 带火时的阶段**。

> 多 Agent 的潜能其实一直没能被完全释放。
> **Meta Skill 的可能性**：专为 Agent 团队设计的白皮书，赋予模型更宏观的全局上下文 —— **从单兵作战到团队作战**。

## 与 SkillOpt 的对比
| 维度 | [SkillOpt](../ch05/041-skillopt.md) | Meta Skill |
|---|---|---|
| **目标** | 训练出**更好的单个 Skill** 文档 | **编排多个 Skill** 完成长程任务 |
| **方法** | 冻结模型 + 验证集门控 + 优化 skill 文本 | 在 SKILL.md 里写"步骤 N 调用哪个原子 Skill" |
| **训练阶段** | 训练期烧 token（compile step） | 创作期烧 30 分钟/个 |
| **部署** | 零额外模型调用 | 每次执行按子任务路由 |
| **门槛** | 需训练集 + 验证集 | 需清晰的 SOP |

> **互补关系**：SkillOpt 让 Skill 变好；Meta Skill 让 Skill 变多；两者一起 = Skill 2.0 闭环。

## 与 Impeccable 的对比
| 维度 | [Impeccable](../ch05/001-impeccable.md) | Meta Skill |
|---|---|---|
| **范围** | 单个 Skill（前端设计） | 多个 Skill 的编排 |
| **抽象层** | skill 内命令 (23 commands) | skill 间编排 (SKILL.md) |
| **解决** | "AI 味"反模式 | 长程 Workflow 自动化 |

## 关键启示
1. **抽象层级会随业务复杂度上移** —— 当 Skill 数量超过人类管理能力时，自然出现"Skill 的 Skill"
2. **路由 + 编排 + 创建是三层独立基础设施** —— 三者协同才能闭环
3. **Meta Skill 的本质是"流程知识资产"** —— 像公司 SOP 一样可读、可审计、可迁移
4. **Agent 团队 = 单兵 + 编排 + 路由** —— 模型强只是一半
5. **个人信号 × 社区匹配** = Skill 发现的新范式，超越关键词搜索

## 相关对照
- [OpenSquilla](../ch01/014-opensquilla-launches-open-source-ai-agent-to-cut-token-costs.md) —— Meta Skill 的实现载体
- [SkillOpt](../ch05/041-skillopt.md) —— 互补（Skill 变好 vs Skill 变多）
- [Impeccable](../ch05/001-impeccable.md) —— skill 内命令的范例
- [Agent Skill 编写指南](../ch04/260-agent-skill.md)
- [10 篇论文看懂 AI Agent Skill](../ch04/262-skill.md)
- [Agent Skills 系统性综述](../ch04/375-agent-skills.md)
- [Skills 系统设计三路对比](../ch04/262-skill.md)
- [Agent/Skills/Teams 架构演进](../ch04/233-agent-skills-teams.md)

## 深度分析
- **流程知识资产化**：Meta Skill 将隐性的 SOP 流程转化为显性的可执行文档，赋予模型超越单步工具调用的宏观上下文理解能力 
- **范式迭代节点**：从"会不会调用工具"到"会不会组织工具"的转变，标志着 AI 自动化进入长程工作流编排的新阶段，技能抽象层级随业务复杂度自然上移 
- **三大基础设施协同**：路由（预算分配）+ 编排（步骤调度）+ 创建（Meta-skill-creator 辅助生成）构成缺一不可的闭环，单一层面的优化无法实现真正的 Skill 2.0 
- **Token 效率验证**：实测省 60-80% 成本，弱智问题用小模型搞定（3 分钱），复杂安全审查才动用大模型 —— 智能路由的经济价值在实践中得到验证 
- **多 Agent 收敛趋势**：Meta Skill 与 [Minimax Mavis](../ch04/146-ai-minimax-agent-team-mavis.md) 等 Agent 团队架构在"编排层"形成技术收敛，从单兵作战走向团队协作是 Agent 发展的必然方向 

## 实践启示
- **先有清晰 SOP 再谈 Meta Skill**：单个 Meta Skill 需 400+ 行 SKILL.md 和约 30 分钟迭代，没有清晰的流程定义就无法有效抽象，先在业务层把 SOP 跑通是前置条件 
- **用 [SkillOpt](../ch05/041-skillopt.md) 优化单 Skill、用 Meta Skill 组织多 Skill**：两者是互补关系而非竞争关系，单个 Skill 的质量决定了编排层的下限，两层一起才能构成完整闭环 
- **智能路由是成本控制关键**：按子任务复杂度选择模型是 Meta Skill 的核心优势，建议默认开启路由，仅在特定场景（如合规审查）才锁定使用高端模型 
- **关注个人信号 × 社区匹配机制**：未来 Skill 发现将从关键词搜索转向基于使用行为和偏好的智能推荐，提前布局信号采集和社区共享可获得先发优势 
- **为 Agent 团队准备 Meta Skill 白皮书**：多 Agent 协作的瓶颈不在模型能力而在全局上下文赋予，Meta Skill 是赋予模型"团队视野"的关键载体，提前储备可加速团队作战能力建设

---

