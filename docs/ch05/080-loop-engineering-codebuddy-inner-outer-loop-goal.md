# Loop Engineering 实践指南：CodeBuddy 中的自主循环系统 — Inner/Outer Loop + /goal + /loop + Team 对抗验证 + 状态外置

> 📊 Level ⭐⭐⭐⭐ | 12.4KB

> 原文存档：[原文存档](https://mp.weixin.qq.com/s/YqIyL7uW4EV2r5HLDW7wcA)

## Loop Engineering 实践指南：CodeBuddy 中的自主循环系统

腾讯工程师 eliqiao 发布的 Loop Engineering 实践指南，是**首个将 Loop Engineering 系统映射到具体产品（CodeBuddy）的完整实现文档**。核心贡献：**Inner/Outer Loop 概念模型**（ReAct = Inner Loop，Loop Engineering = Outer Loop）、**五阶段循环机制**（Discover → Plan → Execute → Verify → Iterate）、**六要素构建体系**、以及 CodeBuddy 三种循环驱动模式（/goal 条件驱动、/loop 时间驱动、Automations 跨会话）。

## Inner/Outer Loop 概念模型

本文最核心的理论贡献是将 ReAct 与 Loop Engineering 的关系明确定义为 **Inner Loop vs Outer Loop**：

- **ReAct = Inner Loop**：单任务内的"思考 → 衧行动 → 观察"循环，解决"怎么一步步做"
- **Loop Engineering = Outer Loop**：跨任务的"目标拆解 → 任务分配 → 结果汇总 → 再计划"，解决"做什么、谁来做、何时停、怎么续"

```
Loop Engineering（Outer Loop）
┌─────────────────────────────────────────────────────┐
│  目标拆解 → 任务分配 → 结果汇总 → 再计划              │
│  ┌─────────────────────────────────────────────────┐ │
│  │  ReAct（Inner Loop）                             │ │
│  │  思考 → 行动 → 观察 → 思考 → 行动 → 观察 ...     │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

8 维度对比表覆盖：关注层次、循环粒度、状态管理、停止条件、验证机制、错误恢复、并行能力、运行周期。

## ReAct 四大局限 → Loop Engineering 四大补位

| 局限 | 症状 | Loop Engineering 解法 | CodeBuddy 实现 |
|------|------|---------------------|---------------|
| 上下文窗口有限 | 长任务遗忘早期信息 | **状态外置**：每次迭代从全新上下文开始 | Memory / CODEBUDDY.md / Rules |
| 自我检查盲区 | 同模型写+查=确认偏误 | **对抗验证**：执行者与评估者用不同模型 | /goal 评估器（gemini-2.5-flash）/ Team reviewer |
| 无跨任务进度跟踪 | 崩溃后只能从头来 | **断点续跑**：状态文件记录进度 | /goal --resume / Memory |
| 缺少编排能力 | 单 Agent 串行 | **多 Agent 并行 + 工作树隔离** | Team 模式 + Git worktree |

## 五阶段循环机制

Discover → Plan → Execute → Verify → Iterate 闭环：

- **Discover**：自动读取 CI 失败、issue、代码审查等信号（输入源结构化、可订阅）
- **Plan**：分解目标为具体步骤（温度适中，避免过早收敛）
- **Execute**：执行代码编辑与工具调用（工具调用幂等、可回滚）
- **Verify**：通过测试、lint、类型检查等客观信号验证（标准必须客观、可机器判定）
- **Iterate**：失败则自动修复并重新循环；成功则进入下一任务（状态持久化，支持断点续跑）

## 六要素构建体系

| 要素 | 作用 | CodeBuddy 实现 |
|------|------|---------------|
| 自动化（心跳） | 按计划或事件触发循环 | /goal + /loop + Automations |
| 工作树 | 并行隔离，零冲突 | Git worktree + Team 模式 |
| 技能（SKILL.md） | 固化项目知识，避免冷启动 | Skills 机制 |
| 连接器（MCP） | 打通真实工具链 | MCP 协议 |
| 子智能体 | 写+查分离，对抗验证 | Task 工具 + Team 模式 |
| 状态文件 | 进度记录，断点续跑 | Memory / CODEBUDDY.md / Rules |

## CodeBuddy 三种循环驱动模式

### /goal — 条件驱动的持续工作

写好条件三要素：**可度量的终态**（测试通过/构建成功）+ **可证明方式**（`npm test` exits 0）+ **不可破坏的约束**（不修改其他模块测试）+ **兜底上限**（or stop after N turns）。

评估器三态结果：✅ ok: true（完成）→ 🔄 ok: false（继续）→ ❌ impossible: true（目标不可达，立即停止）。

关键设计：**评估器使用小模型（gemini-2.5-flash），只看 transcript 不调用工具，与执行 Agent 使用不同模型 → 天然对抗验证**。条件上限 4000 字符。

### /loop — 时间驱动的循环任务

按时间间隔重复执行（最小 1 分钟），适合 CI 监控、巡检等持续性场景。每会话上限 50 个任务，3 天后自动清除，只在会话空闲时触发。

### Automations — 跨会话定时任务

持久化定时任务，不随会话消失。Recurring（cron 规则）和 Once（一次性触发）。

## 范式演进链

```
Prompt Engineering  → 怎么问（单次交互优化）
      ↓
ReAct               → 怎么做（单任务内推理-行动循环）
      ↓
Loop Engineering    → 怎么管（跨任务编排、验证、状态管理）
```

**"不是替代，是演进"**——在 CodeBuddy 中，/goal 设置条件后每轮内部仍用 ReAct，但 /goal 评估器在 Outer Loop 层面判断整体进度。

## 三大风险（与 Loop Engineering 综合实战来源共享框架）

- **理解债务加速累积**：代码库真实状态与开发者理解之间的鸿沟随循环加速扩大 → 定期 review AI 变更
- **认知投降风险**：开发者极易停止独立判断 → 把 AI 当协作者而非权威，质疑每个变更
- **验证责任不可转移**：无人值守的循环也是无人值守地犯错 → 关键变更仍需人工审查

## 深度分析

### 小模型当裁判：对抗验证的务实解，而不是妥协

评估器选用小模型（gemini-2.5-flash）常被读成省钱手段，但它的可靠性收益同样关键：只读 transcript、不允许调用工具，意味着裁判在结构上**无法"顺手修一下再判"**——它只能做纯粹的判定，这封死了"既当运动员又当裁判"的自我检查盲区。与执行者异构则切断了确认偏误的传导路径。三态结果设计（完成 / 继续 / impossible）比二态多了一条止损出口：当目标被判定不可达时立即终止，避免在死目标上无限燃烧 token。这与 [Verifier Driven Development](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/verifier-driven-development.md) 中"验证器先于生成器可信"的思路互为印证，也呼应 [Verifier Paradox](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/verifier-paradox.md) 指出的评估者独立性困境。

### 状态外置把上下文窗口从「记忆」降级为「工作台」

"所有状态存储在外部系统"这一原则的深层含义是：模型上下文不再承担长期记忆职责，只承担当轮推理。每轮从全新上下文启动、从持久化文件读取状态，使信息漂移和压缩损耗被**结构性消除**而非靠提示词缓解——这是与 ReAct 同窗重试的本质分野。代价是关键路径发生转移：状态文件本身成了系统的"真实数据结构"，其写法质量直接决定循环成败。状态写得含糊，循环就退化为每轮从零开始猜；状态结构清晰（进度、约束、下一步），断点续跑和跨会话恢复才真正成立。这一设计与 [Agent Memory Architecture](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-architecture.md) 强调的外部记忆分层是同一哲学在编码场景的落地。

### 循环可靠性的瓶颈在停止条件，不在执行能力

三种驱动模式（/goal 条件驱动、/loop 时间驱动、Automations cron 驱动）的分野，本质是"何时开始、何时停止"的调度问题，而非执行问题。原文反复强调验证标准必须"客观、可机器判定"，条件要写成"AI 自己的输出能证明"的形式——这揭示一个反直觉判断：当模型执行力已足够强时，决定循环能否稳定运行数十轮的不是模型，而是**停止条件的设计精度**。条件模糊的循环不是危险，而是无效——AI 会反复尝试却永远无法满足；条件可度量的循环反而敢放开轮数上限。循环设计因此更接近控制系统工程而非提示词调优，可参照 [Loop Engineering Methodology](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/loop-engineering-methodology.md) 的整体方法论框架。

### 速度收益与认知债务的交换是结构性的，而非可避免的副作用

理解债务加速累积（代码库真实状态与开发者理解之间的鸿沟随循环扩大）不是实现不当的 bug，而是该范式的固有交换率：单位时间产出的变更越多，人的消化带宽相对越不足。三大风险（理解债务、认知投降、验证责任不可转移）共同指向同一结论——循环可以外包"操作者"角色，但**"监督者"角色无法外包**。由此可推出一条衡量标准：Loop Engineering 实践的成熟度应以"人工审查刻意设在哪一层"来评估（关键变更、合并前、迭代边界），而不是以"多久不用人管"来评估。把无人值守时长当 KPI，恰恰是认知投降的早期症状。

## 实践案例

1. **/goal 模块迁移**：auth/legacy → 新 API，三条件（测试通过 + 构建成功 + 旧代码零引用）+ 30 轮上限
2. **/loop CI 监控与自动修复**：每 2 分钟检查 CI，失败则读日志→分析→修复→提交
3. **Team 对抗验证**：planner + coder + reviewer 三角分工，不同模型/指令
4. **Skills 固化项目知识**：编码规范 + 架构约定写入 skill.md，每次自动加载
5. **MCP 打通工具链**：Jira + Jenkins + 数据库 → /goal 循环中 AI 直接操作真实工具
6. **Rules + Memory 状态外置**：硬性约束 + 跨会话偏好 + 进度记录

## 关键金句

- **"让人从循环内部的操作者，转变为循环之上的监督者和目标设定者"**
- **"ReAct 是 Loop Engineering 的 Inner Loop"** — 两层循环关系的最简表达
- **"所有状态存储在外部系统，而非模型的上下文窗口"** — 状态外置哲学
- **"评估器使用小模型，快速且便宜，只看 transcript 不调用工具"** — 对抗验证的工程实现
- **"无人值守的循环也是无人值守地犯错"** — Loop 的安全边界

## 相关实体

- [Loop Engineering 核心范式（13 来源合并）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/loop-engineering-addy-osmani-challengehub.md)
- [Loop Engineering 反馈控制系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/loop-engineering-feedback-control-system.md)
- [Loop Engineering 四层循环栈（LangChain）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/loop-engineering-langchain-four-layer-loopcraft.md)
- [Loop Engineering 清华框架](https://github.com/QianJinGuo/wiki-public/blob/main/entities/loop-engineering-tsinghua-2026.md)
- [Agent Loop 8 个未解问题（腾讯陈进）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-loop-engineering-handbook-8-questions-chen-jin-tencent-self-2026.md)
- [OpenClaw Agent Loop 设计范式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-agent-loop-design-patterns.md)
- [AI Agent Loops Claude Code Codex](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-agent-loops-claude-code-codex.md)
- [Hermes Agent Loop 架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/hermes-agent-loop-architecture.md)
- → [原文存档](https://mp.weixin.qq.com/s/YqIyL7uW4EV2r5HLDW7wcA)

---

