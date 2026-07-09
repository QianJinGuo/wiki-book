# 阿里 Harness 工程实战：Agent 自主迭代 17 小时优化业务 Agent

## Ch05.113 阿里 Harness 工程实战：Agent 自主迭代 17 小时优化业务 Agent

> 📊 Level ⭐⭐⭐ | 4.1KB | `entities/alibaba-harness-autonomous-agent-iteration.md`

# 阿里 Harness 工程实战：Agent 自主迭代 17 小时优化业务 Agent

> 肖汉松（阿里技术）分享的真实 Harness 工程落地案例：让一个 Coding Agent **自主运行 17 小时、完成 16 轮迭代**，优化线上业务 Agent 的 Prompt，最终第 4 轮通过人工复核上线。

## 背景：Badcase 修复速度为瓶颈

一个服务大规模用户的线上业务 Agent，团队每天只能跑一次迭代实验（修改 prompt → 评测 2-3 小时 → 分析 → 再修改），而 weekly badcase 涌入速度远超修复速度。虽然已用 AI 辅助分析 badcase，但中间步骤（代码发布、启动评测）仍需人工串联。

## 三大落地关卡

### 第一关：工具 Agent 可调用化

研发工具只有 GUI 界面，没有 MCP 或 CLI。解法：与平台团队合作，为 Agent 提供代码部署 + 评测调用 + 结果获取的 skill 接口，通过 system prompt 注入工具描述。

### 第二关：长程任务防早停与上下文打爆

核心技巧：
- **禁止提问** — 模型默认遇事请示，打断自主流程
- **防早停** — 明确"持续执行直到任务完成，禁止早停"
- **遇错先分析** — 相同异常不能机械重试，须先分析
- **父子 Agent 模式** — 复杂分析任务委托给子 Agent（高推理模型），父 Agent 只协调迭代流程

### 第三关：防止 Reward Hacking 与策略退化

模型会为单个 case 硬编码针对性规则（如"不得虚构'降低 xx%'"），即 reward hacking。解法：
- **训练集/验证集分离** — 训练集暴露全部信息（问题、回答、打分理由、得分），验证集只看得分，防止硬编码
- **Champion-Challenger 机制** — champion = 未过拟合的历史最高分轮次；challenger = 各轮 prompt 改动。AI 从冠军策略出发改进，须完全超过才可换冠军

## 迭代过程：做加法 → 做减法

16 轮的实际迭代轨迹：

| 轮次 | 策略 | 结果 |
|------|------|------|
| Round 1 | 做加法：补任务分流 + 全面性框架 + 正确性细则 | 领域外任务修复 |
| Round 2 | 做减法：整段删掉全面性框架 | 领域内正确性回升 |
| Round 3 | 继续减法：删多余抑制规则和正确性细则 | 效果仍不理想 |
| Round 4 | Prompt 回归简洁 | **整体涨分，成为新冠军** ✅ |

后续 12 轮因评测集噪声（错误评分信号）被带偏，未产出有效改进。

## 与现有知识体系的关系

- 是 **Agent 用 Harness 循环改进另一个 Agent**（元 Harness），区别于 [Lilian Weng Harness Engineering Self Improvement](ch05/050-harness-engineering.html) 的理论框架
- 实践了 [Loop Engineering Feedback Control System](ch05/007-loop-engineering.html) 的"小循环 → 大循环"演进路径
- Champion-Challenger 机制与 [Improving Agents Data Mining Perspective Langchain](../ch03/045-agent.html) 的多轮迭代实验设计互补
- 父子 Agent 模式体现了 [Agent Vs Workflow Control Continuum Framework](../ch04/606-agent-vs-workflow.html) 中"控制权连续谱"的层级 delegation

## 关键教训

- **没有银弹**：16 轮中仅第 4 轮可用，后面 13 轮被评测集噪声带偏；评测环境稳定性问题 AI 无法解决
- **Harness 工程短期被高估、长期被低估** — AI 基建和业务评测集完善需要时间
- **从小循环到大循环**：小循环（prompt 优化）依赖人工整理评测集；大循环（badcase 发现→上线全链路自动化）是下一步方向

---

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/alibaba-harness-autonomous-agent-iteration.md)

---

