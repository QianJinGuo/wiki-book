# 全网骂Claude变笨，Anthropic下场揭秘：坑你的不是模型

## Ch01.436 全网骂Claude变笨，Anthropic下场揭秘：坑你的不是模型

> 📊 Level ⭐⭐ | 9.5KB | `entities/claude-perceived-degradation-anthropic-effort-model-explanation-2026.md`

# 全网骂Claude变笨，Anthropic下场揭秘：坑你的不是模型

## 摘要

2026 年 3 月，大量 Claude Code 用户报告模型"变笨"——该读的文件不读、该跑的测试不跑、任务干到一半就撂挑子。AMD AI 负责人 Stella Laurenzo 分析 6852 个会话日志发现 Claude 的思考量较 2 月之前下降了 67%。Anthropic 官方事后澄清：问题根源不在模型能力退化，而是 **Effort（努力度）的默认设置从 high 被降到了 medium**。Anthropic 提出了 Model（模型 = 大脑/能力）与 Effort（态度/投入度）的核心区分框架，并指出：小模型开高 Effort 完全可能干翻大模型开低 Effort。

## 核心要点

1. **"变笨"的真实原因**：2026 年 3 月 4 日，Anthropic 为了压低延迟，将 Claude Code 的 Effort 默认档位从 high 降到了 medium。更新日志虽有记载，但多数用户未注意到这一变化。直到 4 月 7 日才调回默认值并给所有订阅用户重置用量额度。
2. **Model vs Effort 的核心区分**：Model 换的是"脑子"——一套冻结的权重，决定模型"会不会"某项任务；Effort 换的是"态度"——决定 Claude 在这项任务上投入多少工作量（读几个文件、跑不跑测试、要不要额外验证）。
3. **反直觉结论**：小模型开高 Effort 完全可能干翻大模型开低 Effort。Sonnet（全能型）开高 Effort，在不少活儿上能胜过 Opus（专家型）开低 Effort。
4. **判断框架**：Claude 做错了，先排查上下文（prompt、工具、CLAUDE.md）是否给足。上下文没问题后，问自己：它是"不会"（模型能力不足 → 换更强的模型）还是"不够努力"（投入不足 → 调高 Effort）？
5. **ultracode 多档 Effort**：Claude Code 新增的 ultracode 档位提供 xhigh 级火力，额外授权 Claude 在遇到实质性任务时自行拉起多 Agent 队伍并行执行。

## 深度分析

### Effort 机制的技术本质

Effort 不是简单的"思考时间"或"Token 预算"调节器，而是一个**行为信号参数**。它告诉 Claude 任务完成需要达到的彻底程度：

- **低 Effort**：Claude 倾向于快速回复，然后反过来问用户要更多上下文，"能不动手就不动手"。
- **高 Effort**：Claude 倾向于自己去翻阅文件、多调用工具、把多步骤长任务链一口气跑完。

官方测试显示，同一 prompt 下，高 Effort 路径生成的 Token 数量约为低 Effort 的 7 倍。多出的 Token 不是"废话"，而是花在读文件、跑验证、反复确认上的实际工作。

这意味着，Effort 实际控制的是 **Agent 的自主探索深度**——模型是否愿意主动获取环境信息、是否愿意执行验证循环、是否愿意把多步骤任务推到底。在 Agent 系统中，这直接对应 Agent 的任务完成率和可靠性。

### 模型能力与 Effort 的协同效应

Anthropic 用了一个精妙的比喻来说明不同模型 + Effort 的配合：

- **Sonnet（高 Effort）**：有一整个下午的全能选手——从头读到尾、跑一遍、验一遍，真把你的活儿吃透。
- **Opus（低 Effort）**：只给你五分钟的专家——带来的是代码库里没有的经验和直觉，但时间只够扫一眼。
- **Fable**：所有人都卡住了才请得动的专科——哪怕只给五分钟，也能一眼揪出别人谁都没看出的毛病。

这一类比揭示了多层 Agent 调度的本质：资源和能力的优化配置。**对于绝大多数日常任务，Sonnet + 高 Effort 的组合可能比 Opus + 低 Effort 更有效**，因为前者愿意投入充足的"工作时间"来全面理解任务上下文。

这背后的工程洞察是：**当前大模型的推理能力仍然高度依赖上下文覆盖度**。一个模型即使能力更强，如果它不花时间去充分阅读和理解上下文（低 Effort），它的输出质量可能不如一个能力稍弱但充分理解上下文的模型。

### 2026 年 3 月"变笨"危机的深层教训

这场危机暴露了 AI 产品设计中的一个根本性矛盾：**延迟优化 vs 质量保障**。Anthropic 降低 Effort 默认值是为了压低响应延迟，提升用户体验的"流畅感"，但这直接牺牲了任务完成质量。

Stella Laurenzo 的 6852 个会话分析表明，Claude 的"思考量"（可以理解为 Effort 的外部表现）下降了 67%，这一量化指标与用户感知的"变笨"高度吻合。

这场风波的关键教训是：
1. **AI 产品的默认设置极其重要**——多数用户不会主动调整高级设置，厂商默认值的微小变化可能引发大规模用户体验退化。
2. **"感知智能"（Perceived Intelligence）不等于模型能力**——用户的负面体验反馈可能反映的是产品配置问题而非模型能力退化，厂商需要建立机制来区分这两种情况。
3. **Effort 应该是用户可见可控的配置参数**——Anthropic 最终将 Effort 设置前置到产品 UI 中，并新增 ultracode 档位，让用户可以根据任务复杂度灵活调节。

### 从"模型排行榜"到"调度能力"的范式转变

Anthropic 这篇官方解读指向一个更深层的趋势：AI 编程的竞争，正在从"谁的模型更强"转向"谁更会调度智能体"。

在 ""只选最强模型" 的时代已经过去。有效的 AI 编程现在要求开发者承担"项目经理"角色：
- 简单的改动 → Sonnet 挂低档，秒回还省钱
- 大型重构 → 上强模型加高档 Effort
- 长时自主执行的任务 → 强模型配足 Effort 或 ultracode 级

ultracode 模式更进了一步：它赋予模型在遇到实质性任务时自行拉起多 Agent 队伍的权限，让 Claude 自己决定工作分配策略。

这一转变与生产级 Agent 系统中的"模型路由器"（Model Router）设计理念完全一致——根据任务复杂度、需求特征和预算约束，自动选择最优的模型 + Effort 组合。

## 实践启示

1. **诊断 Agent 错误时，先排查 Effort 再换模型**：调用 Claude Code 或其他 Agent 系统时，如果输出质量不达标，先检查上下文是否给足（prompt、工具配置、文档指引），再检查 Effort 设置是否为 high 或以上。盲目升级模型只会增加成本而非解决问题。

2. **为不同任务类型配置不同的 Effort 策略**：简单任务（单文件编辑、快速问答）使用低 Effort 节省成本；复杂任务（多步骤重构、跨文件分析）使用高 Effort 或 ultracode 确保质量。产品设计应让用户对此有明确的感知和控制。

3. **小模型 + 高 Effort 是成本优化的有效路径**：对于 70% 以上的典型开发任务，Sonnet 级模型 + 高 Effort 可能比 Opus/Fable + 低 Effort 效果更好且成本更低。在 Agent 系统中部署"模型路由器"时，应优先尝试小模型 + 高 Effort 组合。

4. **建立 Agent 行为日志监控机制**：Stella Laurenzo 的分析之所以有力，是因为她基于 6852 个会话的量化数据。生产系统应记录 Agent 的 Token 消耗量、工具调用次数、文件读取量等 Effort 指标，作为输出质量的前置预警信号。

5. **将 AI Agent 视为可调度的人力资源**：像管理一个团队一样管理 AI——为不同角色配置不同的模型和能力档位。学会给 AI "派活"，先于 AI 能力本身的提升，可能是当前阶段提升 AI 生产力的最有效手段。

## 相关实体

- Claude Code 使用规则
- 生产级 Agent 系统
- Claude Code 安全与遥测
- Agent 循环机制
- Fable 5
- Anthropic Prompt Caching

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/claude-perceived-degradation-anthropic-effort-model-explanation-2026.md)

---

