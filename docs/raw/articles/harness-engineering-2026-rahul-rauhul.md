---
title: "为什么 2026 年真正重要的是 Harness Engineering？"
source: "https://mp.weixin.qq.com/s/RwWfknFIFvJPIdsJMgeNiQ"
source_type: wechat
author: "Rahul (@sairahul1)"
ingested: 2026-06-10
sha256: 98b62b1c84f0925011e7bb992319e0acb4c2af080f321592701e1e3c2f1464bc
confidence: 9
value: 8
stars: 4
description: "2026 年 Harness Engineering 学科正式确立的 canonical 综述：90 天内 OpenAI/Anthropic/ThoughtWorks/HuggingFace 共同命名, 5 种 artifact + 5 项普适原则 + 3 阵营对比 + 衰减论 + 为删除而构建"
created: 2026-06-10
---

## Part 1: Harness 到底是什么

### 1. Harness 定义 (ThoughtWorks)

> **Agent = Model + Harness**

**Harness = 模型之外的一切**:
- 让 agent 不偏离轨道的约束
- 捕捉错误的反馈回路
- 告诉 agent 身在何处的文档
- 允许使用的工具

**类比马具**: 缰绳/马鞍/衔铁, 把强大但不可预测的动物引导到有用方向. 你没让马变聪明, 你设计了让它的力量变得有用的装备.

### 2. 操作系统类比 (Philipp Schmid)

| 层级 | 计算机类比 | 含义 |
|------|------|------|
| Model | CPU | 原始处理能力 |
| Context window | RAM | 有限、易失的工作记忆 |
| Harness | Operating System | 管理 CPU 在何时看到什么 |
| Agent | App | 运行在上面的应用 |

> 大多数人正在运行没有操作系统的应用. 这就是他们的 agent 在生产环境失败的原因.

### 3. 2026 年变化 (LangChain 案例)

LangChain 用同一模型在 Terminal Bench 2.0 跑两次:
- 旧 harness: **52.8%** 分数
- 新 harness: **66.5%** 分数

Vercel 走相反方向: 移除 80% 工具 → **性能反而更好**.

> **2026 不舒服的真相**: Agent 从来不是最难的部分. Harness 才是.

---

## Part 2: 5 种 Harness 工件

### 4. AGENT.md / CLAUDE.md 文件

仓库各处的 Markdown 文件, 每次会话开始时 agent 读取, 像新工程师入职文档.

**内容**: 项目上下文 / 编码约定 / 架构决策 / "我们在这里怎么做事"的指导 / 当前正在推进的工作

**命名差异**: OpenAI = AGENT.md / Anthropic = CLAUDE.md / Cursor = .cursorrules. 名字不同, 原则相同.

### 5. JSON 功能列表 (进度追踪器)

跨多会话构建应用时, agent 每次会话开始拿空上下文. 靠 JSON 文件知道哪些已完成:

每个条目定义:
- 一个功能
- 如何验证它能工作
- 通过/失败状态

> **为什么 JSON 而不是 Markdown?** Anthropic 发现, agent 意外覆盖 JSON 的概率低于 Markdown. 小细节, 在 6 小时自主运行里非常重要.

### 6. 会话初始化例程 (Anthropic 7 步)

每次会话都以同样方式开始, 毫无例外:

1. 确认工作目录
2. 阅读 git 日志和进度文件
3. 检查功能列表, 找到优先级最高的未完成项
4. 启动开发服务器
5. 运行基础端到端验证
6. 实现一个功能
7. 用描述性信息提交, 并更新进度

> 没有这个: Agent 把前 20 分钟浪费在弄清楚已经存在什么. 有了它: Agent 立刻带着上下文启动, 直接进入工作.

### 7. Sprint 合约

在 agent 写下第一行代码之前: **两个 agent 先谈判**.

- **Generator agent** 提出: 它要构建什么 / 如何验证成功
- **Evaluator agent** 审查: 方案是否完整 / 成功标准是否清晰

双方达成一致后才开始实现. 这就是设计评审, 只是两个参与者都是 AI.

> 在同一次处理中同时规划和执行的 agent, 会产出不可靠结果. 规划步骤即使由 AI 完成, 也会显著提升输出质量.

### 8. 结构化任务模板

在任何编码之前, Harness 分析真实代码库, 生成基于实际代码库的影响地图:
- 真实文件路径 (不是幻觉出来的路径)
- 真实存在的符号名
- 应该遵循的现有模式
- 具体验收标准

> 大多数团队会跳过. Agent 猜测文件结构, 发明不存在的 API 端点, 构建出和代码库不匹配的东西.

---

## Part 3: 三个阵营 (撞同一堵墙, 搭出三种梯子)

### 9. OpenAI: 环境优先

Codex 团队: 100 万行生产代码, 0 手写. 在这种规模下不可能逐行 code review.

**方法**:
- 严格依赖流 (Types → Config → Repo → Service → Runtime → UI)
- 遍布代码库的 AGENT.md 文件
- Agent 直接接入 CI/CD 流水线

**核心理念**: 先设计环境. 再放手让 agent 工作.

**实际成果**: **Sora Android 应用** — 4 位工程师 / 28 天 / Play Store 排名第一 / 99.9% 无崩溃. Codex 每周处理内部 70% 的 pull request.

### 10. Anthropic: 执行者和评判者分开

让 agent 评价自己输出时, 它会自信地称赞自己, 即使人类看质量明显平庸.

**3 个专门 agent**:
- **Planner**: 把两句话 prompt 转成完整产品规格
- **Generator**: 一次一个 sprint 实现功能
- **Evaluator**: 用浏览器自动化像真实用户一样测试运行中的应用

> 关键洞察: 让独立 evaluator 保持怀疑, 比让 generator 严厉批评自己的工作容易得多.

**对比**:
- 单独 agent (无 harness): **9 美元, 20 分钟** → 破损应用
- 完整 harness: **200 美元, 6 小时** → 带精致 UI 的可用软件

### 11. ThoughtWorks: 2×2 框架

观察 50+ 工程团队如何失败, 沿两个轴分类每种 harness 控制:

| 轴 | 维度 |
|------|------|
| **何时运行** | Feedforward (行动前) / Feedback (行动后) |
| **如何工作** | Computational (确定性, 毫秒) / Inferential (LLM, 秒) |

**2×2 矩阵**:
- **Computational Feedforward**: 类型系统、linter、架构规则
- **Computational Feedback**: 测试套件、覆盖率分析、变异测试
- **Inferential Feedforward**: 规格文档、约束描述
- **Inferential Feedback**: LLM 代码评审器、行为验证器

> 单靠 feedforward 或 feedback 都不够. 两者都需要.

---

## Part 4: 5 项普适原则 (三支团队独立走到这里)

### 12. 上下文胜过指令

- OpenAI: "给地图, 不要给 1000 页手册"
- Anthropic: JSON 功能列表和进度文件
- Red Hat: 生成任务前先分析真实代码库
- ThoughtWorks: "Feedforward"

说法不同, 发现相同: 把当前世界状态展示给 agent, 持续胜过抽象地告诉它该做什么.

### 13. 规划和执行必须分离

- OpenAI: 人类设计环境, agent 执行
- Anthropic: 专门 Planner agent 在 Generator 接触代码前运行
- ThoughtWorks: 规划和实现之间必须有人类评审检查点
- Red Hat: 阶段 1 (影响地图) 和阶段 2 (实现) 之间有硬门禁

> 让 agent 在同一次处理中同时规划和执行, 会产出不可靠结果. 规划步骤不一定要由人类完成, 但必须是一个独立步骤, 而且输出需要在实现开始前被审查.

### 14. 反馈回路不可协商

- OpenAI: agent 接入 CI/CD 和可观测性系统
- Anthropic: 专门 Evaluator agent 使用浏览器自动化
- ThoughtWorks: 形式化为"传感器"

> 没有反馈的 harness, 只是一个绕了远路的 prompt.

### 15. 一次只做一件事

- OpenAI: 把目标拆成更小的构建块, 深度优先推进
- Anthropic: 强制每个 sprint 只做一个功能, 每次之后提交
- ThoughtWorks: 分阶段生命周期 (集成前 → 集成后 → 持续监控)

> 强制增量主义, 是所有成功 harness 的共性.

### 16. 代码库就是文档

- OpenAI: 把 AGENT.md 文件嵌入仓库
- Anthropic: 用功能列表/进度文件/git 历史作为连续性机制
- ThoughtWorks: 衡量"harnessability" = 代码库对 agent 的可读性

> 投资代码组织的团队, 会免费获得更好的 agent 性能. 混乱 repo + AI agent = 规模化混乱.

---

## Part 5: 悖论 — 构建是为了删除

### 17. Harness 衰减

当 Anthropic 从 Opus 4.5 升级到 Opus 4.6 时: 曾经必不可少的 sprint 拆解变成了累赘. 模型规划能力提升后, 它就多余了.

- **Opus 4.5**: sprint 拆解 + 每个 sprint 评估
- **Opus 4.6**: 不做 sprint 拆解 + 单次评估 (**节省 38% 成本**)
- **Opus 4.7**: 模型开始自我验证 → evaluator 角色进一步缩小

> Harness 中的每个组件, 都编码了一个关于"模型做不到什么"的假设. 随着模型进步, 这些假设会过期, 组件也会变成开销.

### 18. 构建是为了删除 (Philipp Schmid)

> 把每个 harness 组件都设计成可移除的. 定期关掉每个组件, 测试输出质量是否变化. 如果没有变化: 删除它.

- **Manus** 在 6 个月里重构了 5 次 harness
- **LangChain** 在 1 年里重组了 3 次
- **Vercel** 移除了 80% 工具, 性能反而更好

> 携带已经失效的 harness 组件, 会在每一次运行里消耗 token. 没有额外质量. 纯粹浪费.

### 19. 成本现实 (Anthropic A/B 测试)

- 单独 agent (无 harness): **9 美元, 20 分钟** → UI 能用, 核心功能坏掉
- 完整 harness (Opus 4.5): **200 美元, 6 小时** → 软件能工作, UI 精致, 物理逻辑正确

**22 倍成本** 换来可运行产品, 而不是截图里看起来正确的演示版.

> **有件事几乎没人谈**: Harness + 模型的组合会演化. 一次模型升级后, 200 美元的 harness 变成 124 美元.

**趋势线**:
> 更好的模型 = 更简单的 harness = 更便宜的运行 = 更快的输出

> 2026 胜出的工程师, 是在设计最好的约束, 并且愿意把它们丢掉.

---

## 参考阅读 (原文推荐)

- 从 Harness 到动态工作流: Claude Code 多智能体任务编排新范式
- 自我进化的 Agent Skill: 微软 SkillOpt 到底解决了什么?
- Harness 工程: C 端 AIGC 内容生产自优化闭环实践
- Claude Opus 4.8 发布: 更强判断力、更长自主工作时间、Claude Code 动态工作流
