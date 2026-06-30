# 别再亲自写Prompt了！OpenClaw与Claude Code创始人已经用'循环'让一堆Agent自动打工了

## Ch01.571 别再亲自写Prompt了！OpenClaw与Claude Code创始人已经用'循环'让一堆Agent自动打工了

> 📊 Level ⭐⭐ | 6.4KB | `entities/openclaw-boris-cherny-agent-loop-design-patterns.md`

# OpenClaw Boris Cherny Agent Loop Design Patterns

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/openclaw-boris-cherny-agent-loop-design-patterns.md)

## 摘要

OpenClaw 创始人 Peter Steinberger 的推文引发 AI Coding 圈热议（阅读量 650 万），Claude Code 创始人 Boris Cherny 表示自己已经不再手动编写提示词，而是编写「循环」——小程序自动向 Agent 发出指令、读取输出、判断完成状态并决定下一步。文章梳理了从 2022 年 ReAct 论文到 2026 年多 Agent 编排循环的五级跃迁史，并指出：当模型编写代码的成本趋近于零时，最昂贵的不再是 token，而是循环管控——迭代上限、无进展检测、预算限制。

## 核心要点

### Boris Cherny 的进化三阶段

1. **一年前**：手动编写代码，使用自动补全
2. **中期**：同时运行 5-10 个 Claude 会话分别提示
3. **现在**：编写提示 Claude 的循环，几百个 Agent 读取他的 GitHub、Slack 和 Twitter，决定接下来做什么

> 「我不再需要向 Claude 发出指令。有一些循环在持续运行着，正是这些循环在向 Claude 发出指令。我的任务就是编写这些循环而已。」

一个「循环」就是你编写的小程序：替你向 Agent 发出提示 → 读取输出 → 判断是否完成 → 未完成则再次提示。你变成了循环的创造者，模型变成了子程序。

## 深度分析

### 五级跃迁史

**第一阶段：学术 While 循环（2022 ReAct 论文）**
- 模型推理 → 调用工具 → 读取结果 → 循环直至完成
- 一个模型、一个循环、一个人旁观
- 本质是 ReAct 范式的工程化表达

**第二阶段：AutoGPT（2023）**
- 被赋予目标并允许自行生成提示词
- 因「空转状态」闻名——Agent 持续生成计划但不产出结果
- 埋下「智能体是玩具」的种子，暴露了无约束循环的根本问题

**第三阶段：Ralph 循环（2025 年 7 月 Geoffrey Huntley）**
- 简单 Bash 命令，将同一提示文件反复管道传入 Agent
- 创新在于纪律性：每次迭代将上下文重置为固定锚定文件
- 仅花约 297 美元就构建了一整套编程语言
- 关键洞见：循环的价值不在于复杂性，而在于纪律性

**第四阶段：产品化（2026 年春季）**
- Codex 和 Claude Code 推出 `/goal` 命令
- 持续运行 Ralph 循环直至验证模型确认任务完成
- 循环从个人工具变成产品功能

**第五阶段：多 Agent 编排循环（Boris 和 Steinberger 所指）**
- 循环成为工作单元而非任务
- 循环并行运行，按计划监督其他循环
- 计划调度取代人工启动
- 基于 Git 的状态管理和崩溃恢复机制
- 每个时间点上，由模型决定下一步执行什么操作

### Boris 的循环实操五条技巧

1. **auto mode**：处理权限问题，避免人工干预
2. **动态工作流**：让 Claude 协调数百或数千个 Agent 完成任务
3. **/goal 或 /loop**：推动 Claude 持续执行直至任务完成
4. **云端 Claude Code**：可以合上笔记本电脑，循环在云端继续
5. **端到端自我验证**：确保 Claude 能够对自己的工作进行验证

### 循环管控的三个硬性约束

2026 年所有严肃论述都指向三个共同限制：
- **最大迭代次数**：防止无限循环
- **无进展检测**：识别 Agent 在空转
- **Token/资金预算上限**：Uber 四个月耗尽年度 AI 预算，被迫对 Claude Code 和 Cursor 限制（每人每月每工具 $1500）

> 循环的浪漫版本：编写好循环，一千个智能体一夜之间帮你建立公司。现实版本：大部分工作花在确保它们及时停止上。

### 循环增值的关键：可复用技能

Steinberger 的观点：做某件事超过一次 → 转化为自动化技能；做某件困难的事 → 事后转化为技能。循环是管道机制，资产是它调用的技能。一个内部没有可复用技能的循环，不过是空转的 while-true。

**三大核心新逻辑**：
1. 一个循环 = Cron + 决策机制：每个时间点由模型决定下一步操作
2. 最昂贵资源从 Token 转移到循环管理：需要限制迭代、检测无进展、设定预算
3. 循环中的可复用单元是技能而非提示词：循环调用明确命名的技能产生复合效益

## 实践启示

1. **从提示词到循环**：Agent 工程的范式转移——你的工作不是写更好的提示词，而是编写能自动发出提示词的循环
2. **纪律性 > 复杂性**：Ralph 循环用最简单的 Bash 命令取得惊人成果，关键在于每次迭代重置上下文的纪律
3. **循环三要素**：最大迭代次数 + 无进展检测 + 预算上限。没有这三个约束的循环是定时炸弹
4. **技能是资产**：循环本身是管道，可复用技能才是复利来源。把反复做的事转化为命名技能
5. **Git 状态管理**：循环崩溃恢复依赖 Git 作为状态存储——这是第五阶段循环与前四阶段的本质区别

## 相关实体

- [MCP 12 设计模式](ch04/503-agent.md)
- [OpenClaw 多智能体团队](ch11/207-openclaw.md)
- [OpenClaw 完全指南](ch11/207-openclaw.md)
- [Claude Code 源码机制](ch03/073-claude-code.md)
- [Karpathy: Vibe Coding 到 Agentic Engineering](ch04/503-agent.md)
- [Agent 原理与工程实践](ch04/503-agent.md)
- [Figma Make](ch03/045-figma-make.md)
- [华术设计 2.0](https://github.com/QianJinGuo/wiki/blob/main/entities/huashu-design-2-0-flower-uncle-3-patterns.md)

---

