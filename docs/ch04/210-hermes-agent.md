# 拆完 Hermes 源码发现 Agent 自我进化不需要训练模型

## Ch04.210 拆完 Hermes 源码发现 Agent 自我进化不需要训练模型

> 📊 Level ⭐⭐ | 11.0KB | `entities/hermes-agent-self-evolution-源码解析.md`

# 拆完 Hermes 源码发现 Agent 自我进化不需要训练模型

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hermes-agent-self-evolution-源码解析.md)

## 摘要

刘庭辉 2026 年对 Hermes Agent 源码的拆解分析：Hermes Agent 的核心创新不是"能做什么"而是"做完之后会发生什么"——通过四维持久记忆、技能自动创造系统、KEPA（对"提示"做反向传播）三大机制，让 Agent 越用越强。所谓的"自动学习"，本质是 Prompt Engineering + 文件持久化的一次精妙工程化实践。

## 核心要点

- **核心创新**：不是"能做什么"，而是"做完之后会发生什么"。所谓的"自动学习"，本质是 Prompt Engineering + 文件持久化的一次精妙工程化实践。
- **OpenClaw vs Hermes 哲学分歧**：OpenClaw 是全能助手、插件生态、无状态（需手动配置 AGENTS.md/SOUL.md/USER.md）；Hermes Agent 是自我进化、越用越强、四维持久记忆自动保存。
- **四维持久记忆系统**：身份记忆（IDENTITY，Agent 角色定义）+ Agent 笔记（MEMORY.md，用户偏好、项目上下文、经验教训）+ 程序性记忆（SKILL.md，可复用工作流程）+ 对话历史（当前会话完整上下文）。
- **冻结快照模式**：每次会话开始时加载 MEMORY.md 和 SKILL.md 作为快照，会话过程中文件更新不影响当前会话（看到的仍是开始时的版本），保证单次会话内一致性。
- **技能自动创造系统**：传统 Agent Skill 生命周期是"用户编写→安装→执行→结束"，需要用户手动说"更新 Skill"才触发；Hermes 的 Skill 生命周期是"Agent 执行任务→后台自动审查→判断是否有价值→自动创建/更新 Skill→下次会话自动加载"。
- **KEPA：对"提示"做反向传播**：传统深度学习是"前向传播（输入→模型→输出）+ 反向传播（根据损失函数更新模型权重）"。Hermes 的 KEPA 是"前向传播（用户意图→Hermes→执行结果）+ 反向传播（周期性回顾执行过程→检测失败点→更新 Skill/记忆）"。关键差异：不是更新"模型权重"，而是更新"如何使用模型"的策略。
- **后台审查触发**：每 10 次工具调用触发一次 `_spawn_review()`，启动 SKILL_REVIEW_PROMPT 审查 Agent 判断是否值得保存 Skill。
- **决策表**："用完即走"型用户 → OpenClaw；"长期陪伴"型用户 → Hermes。

## 深度分析

### "自我进化不需要训练模型"的工程含义

文章的核心断言"Agent 自我进化不需要训练模型" 不是说模型不需要进化，而是说进化可以在**外部状态层**完成，不需要修改模型权重。这种"外部状态进化"的具体路径是：
- **Skill 是 Markdown 文件**：纯自然语言描述，可读、可编辑、可复用
- **MEMORY.md 是 Markdown 文件**：用户偏好、项目上下文
- **IDENTITY 是 Markdown 文件**：Agent 角色定义

所有"进化"都以 Markdown 文件形式持久化，不需要任何训练代码。Agent 下次会话开始时加载这些文件，就把"过去的经验"带进了新会话。这种设计的最大优势：**进化是可解释、可审计、可手动修改的**。如果某个 Skill 是错的，用户可以直接编辑 Markdown 文件纠正；如果某个 MEMORY 是过期的，用户可以手动删除。这与模型权重形成了鲜明对比——模型权重是黑盒，错了只能重新训练。

### 冻结快照模式：为什么不能"实时更新记忆"

Hermes 采用的"冻结快照"模式 看起来反直觉：会话过程中文件被更新，当前会话看到的仍是开始时的版本。为什么不让会话实时读取最新文件？这个设计背后的一致性考虑：如果当前会话实时读取文件，那么同一会话内的不同决策可能基于不同的 MEMORY/SKILL 状态，导致推理不一致。冻结快照确保一次会话内所有决策基于同一个状态，下一次会话再加载最新文件。这种设计哲学：**会话内一致性 > 实时更新**。

### KEPA 与传统反向传播的本质类比

文章用深度学习的反向传播来类比 KEPA，这个类比揭示了 Hermes 设计的核心创新：

| 维度 | 传统深度学习 | Hermes KEPA |
|------|------------|------------|
| 前向传播 | 输入→模型→输出 | 用户意图→Hermes（LLM+工具）→执行结果 |
| 反向传播 | 根据损失函数更新模型权重 | 周期性回顾执行过程→检测失败点→更新 Skill/记忆 |
| 更新对象 | 模型权重 | 使用模型的方式（策略） |
| 更新成本 | 高（GPU 训练） | 低（写入 Markdown 文件） |

这种类比的工程价值：**把"学习"从昂贵的训练过程转化为廉价的文件写入**。传统深度学习的"学习"成本高（GPU 小时数、数据标注），所以模型更新频率低（几天到几周）；KEPA 的"学习"成本极低（写一个 Markdown 文件），所以可以高频触发（每 10 次工具调用）。

### 后台审查逻辑的设计取舍

后台审查的触发条件是"每 10 次工具调用"，审查 Agent 的 `max_iterations=8`。这两个参数的选择体现了两层权衡：
- **触发频率**：太频繁会浪费 token（每次审查消耗约 8 次 LLM 调用）；太低会错过学习机会（失败经验还没来得及沉淀就被遗忘）。10 次是经验值。
- **审查深度**：max_iterations=8 给审查 Agent 足够的能力判断"这个任务有没有学习价值"，但不会让审查陷入无限循环。

审查 Prompt 设计的核心判断：
- 任务是否有试错或中途改变策略？（试错 = 有价值）
- 最终方案是否具有可复用性？（一次性方案 = 无价值）
- 值得保存则调用 skill_manager，否则回复"Nothing to save."

这两个判断标准解决了"什么值得保存"的根本问题——不是"成功的任务"才值得保存（成功但是一次性的方案不值得），而是"有试错过程 + 可复用"的任务才值得保存。

### 强弱分析：自动进化的边界

文章诚实地分析了 Hermes 自动进化的局限性：
- **"自动"不等于"准确"**：判断力上限是 LLM 能力上限——如果 LLM 判断"这个 Skill 有学习价值"是错的，那么保存的 Skill 也是错的
- **只有复杂任务触发**：简单任务大概率跳过，因为简单任务没有试错过程
- **更新有延迟**：冻结快照机制，下一次会话才生效——意味着当前会话无法从学习结果中获益
- **生态差距**：OpenClaw 有数千插件，Hermes 还在早期——社区生态是长期竞争力的关键

这些限制决定了 Hermes 不是"万能解"，而是"特定场景下的有效解"。

### 用户驱动 vs Agent 自驱动：学习的二元论

文章提出了学习驱动方式的二元对比：

| 维度 | 用户驱动（OpenClaw） | Agent 自驱动（Hermes） |
|------|-------------------|----------------------|
| 精确可控 | ✅ | ❌ |
| 无噪声 | ✅ | ❌ |
| 成本高 | ❌ | ✅ |
| 容易遗漏 | ❌ | ✅ |

最理想方案是两者结合：
- 核心确定性知识 → 用户显式定义（OpenClaw SOUL.md）
- 隐性经验性知识 → Agent 自动积累（Hermes KEPA）

这种"用户+Agent 协同进化"的模式，可能是 Agent 系统的最终形态。

### "会长大的软件"的范式意义

文章最后提出"会长大的软件"概念——传统软件装好什么样就是什么样，Hermes 新范式会随着使用而成长。这个论断的范式意义：**软件从"确定性产物"变成了"演化性产物"**。每个用户的 Hermes 实例都是独一无二的，因为它学到了不同用户的偏好和工作流。这种个性化不是预定义的配置，而是使用过程中的自然涌现。

## 实践启示

1. **进化在外部状态层完成**：不要试图通过 prompt 让 LLM "记住"什么，所有需要持久化的知识都应该写入文件（Markdown/JSON/SQLite）。LLM 本身没有持久化能力。
2. **冻结快照优于实时更新**：单次会话内基于同一个状态做决策，避免推理不一致。更新延迟到下次会话生效是可接受的代价。
3. **学习 = 写入文件而非更新权重**：把"学习"从 GPU 训练降级为文件写入，让学习成本从小时级降到毫秒级，学习频率从周级提升到分钟级。
4. **后台审查触发频率的经验值**：每 10 次工具调用触发一次是好的起点，根据任务复杂度调整（简单任务可以更频繁，复杂任务可以更稀疏）。
5. **保留用户手动覆盖的接口**：自动进化不应该是黑盒。让用户能查看/编辑/删除 Skill 和 MEMORY，确保自动进化的可控性。
6. **用户驱动 + Agent 自驱动协同**：确定性知识用 OpenClaw 模式（用户显式配置），经验性知识用 Hermes 模式（Agent 自动积累）。两者结合覆盖完整场景。

## 相关实体

- [Karpathy 从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/karpathy-最新访谈从-vibe-coding-到-agentic-engineering.md)
- [Karpathy Vibe Coding Agentic Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/karpathy-vibe-coding-agentic-engineering.md)
- [你不知道的 Agent原理架构与工程实践 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/你不知道的-agent原理架构与工程实践-v2.md)
- [Ethan He Cosmos Grok Imagine Latent Space Video Agent 20260606](https://github.com/QianJinGuo/wiki/blob/main/entities/ethan-he-cosmos-grok-imagine-latent-space-video-agent-20260606.md)
- [OpenClaw 多智能体团队搭建](https://github.com/QianJinGuo/wiki/blob/main/entities/龙虾装上了可以用来干啥分享下我的-openclaw-多智能体团队搭建经验-v2.md)
- [OpenClaw 完整指南](https://github.com/QianJinGuo/wiki/blob/main/entities/openclaw-完全指南这可能是全网最新最全的系统化教程了32w字建议收藏-v2.md)
- [Hermes Agent](https://github.com/QianJinGuo/wiki/blob/main/concepts/hermes-agent.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/data-infrastructure.md)
- 
- 
-

---

