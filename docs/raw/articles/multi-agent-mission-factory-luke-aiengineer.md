---
tags: [wechat, article, claude, openai]
title: "multi agent mission factory luke aiengineer"
type: raw
url: https://mp.weixin.qq.com/s/Yxthv6KXRefxqcd_XUvGZg
ingested: 2026-05-08
sha256: 7a491c0b51e0ad3ccc55678d99d305eb8cda6ab77f4523e54645cdec5dc65d2b
review_value: 8
review_confidence: 8
review_stars: 4
review_product: 64
review_recommendation: STRONG
source: 微信公众号（AI 寒武纪）
published: ~2026-05-08
created: 2026-05-10
updated: 2026-05-10
---
# Multi-Agent 架构：Factory Mission 系统的方法论
**来源：** AI Engineer 频道 YouTube 演讲整理（微信公众号"AI 寒武纪"）
**演讲者：** Luke Alvoeiro（Block → 开源 Goose 43.9k★ → Factory CTO）
**主题：** 当你想让 agent 团队完成比单个 agent 难上一两个数量级的任务时，应该怎么组织
**产品：** Factory Droid（15亿美元估值，Series C）
## 核心判断：瓶颈不再是智能，而是人的注意力
> "今天做软件工程的瓶颈不再是智能，而是人的注意力。一个工程师手头可能积压 50 个 feature，但每天真正能往前推的只有两三件，因为每件事都要他分神、每次 commit 都要他 review。今天的模型已经聪明到足以搞定这 50 件事的方案，真正缺的是监督它们落地所需的人力带宽。"
## 五种 Multi-Agent 前沿策略
| 策略 | 描述 | Mission 采用 |
|------|------|-------------|
| **Delegation（委派）** | 父 agent 派生子 agent 取返回值，sub-agent + coding tool call 是最常见实现 | ✅ |
| **Creator-Verifier（创建者+验证者）** | 一个建、一个查；关注点分离；新鲜上下文更容易挑出问题 | ✅ |
| **Direct Communication（直接通信）** | agent 互发私信，无中央协调者；状态散落多条对话，难以做对 | ❌ |
| **Negotiation（协商）** | agent 围绕共享资源沟通（同一 API / 同一代码块）；正和交易场景 | ✅ |
| **Broadcast（广播）** | 一对多，状态更新/共享约束下发；对长任务连贯性至关重要 | ✅ |
## Mission 架构：三角 + 四策略
```
Orchestrator（规划）
  - 像共鸣板，提战略问题，梳理模糊需求
  - 输出：执行计划 = feature 清单 + 里程碑 + Validation Contract
         ↓
Workers（实现）
  - 每个 feature 一个 worker
  - 完全干净的上下文、零包袱、满格注意力
  - 通过 Git commit 交接，下一个 worker 接手干净代码库
         ↓
Validators（验证）
  - scrutiny validator：lint + 类型检查 + 测试 + 独立 code review agent
  - user testing validator：端到端行为验证（computer use 填表单/点按钮/看页面）
  - 两个 validator 都没看过代码，验证从设计上就是对抗性的
```
## Validation Contract（核心概念）
**问题**：agent 写完 feature 顺手写测试，测试跑通覆盖率漂亮——但这些测试是按**实现出来的代码**反向捏的，不是按**代码本该实现什么**写的。
> "写在实现之后的测试抓不到 bug，它们只是在确认已经做出的决定。"
**解法**：
- 任何代码写下去**之前**（规划阶段）就把正确性定义清楚
- 复杂项目可能有几百条断言，每个 feature 分配一条或多条必须满足的断言
- 这是一个**独立于实现的锚点**
**配合机制：结构化 Handoff**
worker 做完 feature 时填写详细文档：完成了什么 / 哪些没做完 / 跑过哪些命令及退出码 / 发现了什么问题 / SOP 遵守情况
关键：**错误在里程碑边界被捕获**，纠错工作被明确界定，不依赖 agent"记得"发生过什么，靠强制写下来。
## 串行 > 并行（违反直觉的结论）
**直觉反应**：10 个 agent 同时跑 = 10 倍吞吐
**Factory 的实践结论**：软件工程类任务**不适合纯并行**
原因：
- agent 会互相踩改动
- 重复做事
- 做出互相冲突的架构决定
- 协调 overhead 吃掉速度收益
**Mission 的做法**：
- feature 层面**串行**：同一时刻只有一个 worker 或一个 validator 在跑
- 允许并行的只有两类：
  1. feature 内部的**只读操作**（搜索代码库、查 API 文档）
  2. validator 内部的**只读操作**（多个 code review 同时进行）
**整体：串行执行 + 定点内部并行**。纸面更慢，但错误率大幅下降，长任务里正确性不断复利。
## Droid Whispering（模型选择）
给每个角色挑合适模型：
- **规划（Orchestrator）**：慢速、审慎的推理 → 慢模型
- **实现（Worker）**：快速的代码流畅度和创造力 → 快模型
- **验证（Validator）**：精确的指令遵循 → 最精确的模型
进一步：用**不同模型厂商**做验证，避免同一份训练数据带来的同向偏见。
> "你被某一家模型锁定，这个家族最弱的能力就是你系统的天花板。"
反过来说：即使使用开源模型，只要 Validation Contract 和里程碑检查点都在，mission 依然能跑成功。
## 编排逻辑尽量声明式（700 行文本改四句话）
- 编排逻辑几乎全写在 prompt 和 skill 里，避免硬编码状态机
- 整套 feature 拆解和失败处理 ≈ **700 行文本**
- 改四句话就能大幅改变执行策略
- worker 行为由 orchestrator 每个 mission 动态定义的 skill 驱动
- 确定性代码层非常薄，只做 bookkeeping（跑验证、交接阻塞时进度）
> "mission 负责提供**纪律**，模型负责提供**智能**。"
这与 Anthropic 的 Skills 方向高度一致：**编排逻辑尽量声明式、尽量用 prompt 写、尽量让模型升级自动带动系统升级**。
## Mission 克隆 Slack 的具体数字
| 指标 | 数值 |
|------|------|
| 时间分配 | 60% 在 implementation，60% token 消耗也在 implementation |
| 验证通过率 | 几乎每个里程碑都要追加 follow-up feature 来修 |
| 代码库组成 | 50% 行数是测试代码，代码覆盖率 90% |
| 成本优化 | prompt cache 大量使用 |
| 真实耗时 | 绝大部分 wall clock time 不在生成 token，而在 user testing validator 等待交互 |
| 人力效率 | 以前 5 人团队同时推 10 条工作流 → 现在 30 条 |
| 团队角色转变 | 注意力从执行 → 架构和产品决策 |
| 代码库质量 | mission 跑完比开工时更干净（测试 + skill 文件 + 结构性产物全留下）|
## 三点核心启发
1. **验证和实现要分家，分到不同模型厂商**：让同一模型既做实现又做验证，丧失系统里最重要的对抗性红利
2. **跨 agent 的 handoff 必须强制结构化**：至少包含完成项 / 未完成项 / 执行命令及退出码 / 发现的问题 / SOP 遵守情况。最低成本、最容易落地的改造。
3. **Validation Contract 可迁移出 coding 场景**：做报告生成 / 市场研究 / 多日复杂流程自动化时，都可以先写几百条断言，把"怎样算做完"锁死在实现前面
---
*评审：Value 8 × Confidence 8 = 64 | ★★★★ | 推荐入库*