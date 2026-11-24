# 从 Prompt 到 Harness：Claude 官方学习资料

> 📊 Level ⭐⭐ | 7.9KB

> 作者：张嘎（公众号「有戏圈」），2026-05-07。
> 对 Learn Harness Engineering 课程 + OpenAI/Anthropic 官方资料的实践者解读。
> 核心判断：很多 AI 编码翻车不是模型能力不够，而是仓库没有给 Agent 一套能可靠工作的系统。
1. **指令子系统** — 告诉 Agent 项目是什么、技术栈、不可违反的规则

## 相关实体
- Claude Code Harness Deep Understanding
- [Claude Code Harness Deep Dive Founder Park](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-harness-deep-dive-founder-park.md)
- [Claude Opus 47](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-opus-47.md)
- Openclaw Prompt Context Harness
- [Anthropic Managed Agents Scaling](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-managed-agents-scaling.md)

→ [原文存档](https://mp.weixin.qq.com/s/CRgnx9wMv6xvAeE-KG6K4A)

## 深度分析

**Agent 失败的根因是"系统缺失"而非"模型能力不足"。** 文章的核心判断——"很多 AI 编码翻车不是模型能力不够，而是仓库没有给 Agent 一套能可靠工作的系统"——揭示了当前 AI 编码工具的核心瓶颈。OpenAI Frontier 团队实现了空 repo 到 5 个月约 100 万行代码的自动化，说明模型能力早已不是瓶颈，差距在于基础设施设计 。

**Harness 五子系统形成了一个完整的 Agent 运行环境闭环。** 指令子系统定义项目上下文，工具子系统提供执行能力，环境子系统保证依赖可复现，状态子系统维持长任务连续性，反馈子系统验证执行正确性。这五个子系统缺少任何一个都会导致 Agent 行为的不确定性增加 —— 特别是反馈子系统最容易被低估 。

**WIP=1 原则直接针对 Agent 的"过度延伸"行为模式。** Agent 最大的问题不是不勤奋，而是太勤奋地把事情做散。坑开太多（过度延伸）和跑通很少（不足完成）是两种常见错误，WIP=1 原则通过强制单任务完成后再开始新任务来对抗这一倾向 。

**验证不是收尾动作——验证会塑造实现方式。** 这一洞察颠覆了传统开发流程中"先实现后测试"的思维。在 Agent 场景下，由于 Agent 的自信来自局部代码判断而非系统级验证，必须将验证设计前置，才能确保实现方式本身是可测试的 。

**OpenAI 案例（空 repo → 100 万行代码、1500 PR、0 人工 review）和 Stripe Minions（每周 1300+ PR）** 证明了在成熟 Harness 体系下，AI 代码生成的规模效应是真实的。这为"AI 写代码是否可行"提供了实践层面的正面证据 。

### 五个子系统各自的失效路径
把"系统缺失"落到具体场景，可以看到每个子系统缺席时的典型翻车姿势并不相同：指令缺失，Agent 每个新会话都要重新猜测项目规范，同一任务在不同会话间产出漂移；工具缺失，它只能靠想象作答，幻觉随之上升；环境缺失，上下文被"依赖为什么装不上"这类排障消耗殆尽；状态缺失，长任务跨会话失忆，已完成的工作被重复甚至覆盖；反馈缺失，它用"看起来对"替代"验证过对"。其中前四类缺失的症状是"做不动"，容易被察觉；反馈缺失的症状却是"自信地做错"，要到集成甚至上线才暴露——这正是反馈子系统最容易被低估的原因。这一视角与 [Prompt Context Harness Three Evolutions](https://github.com/QianJinGuo/wiki-public/blob/main/entities/prompt-context-harness-three-evolutions.md) 的 harness 演化梳理相互印证：harness 不是一次性配置，而是随任务复杂度逐步补齐的系统能力。与此同时，它与 Claude Code Harness Deep Understanding 中"把工程纪律外置到运行环境"的立场一致：修补单次失败没有意义，要修的是让失败可复现、可拦截的那层系统。

### 验证前置如何反向塑造实现策略
"验证会塑造实现方式"是全文杠杆最大的判断之一。当验证被放在最后，Agent 的理性选择是一口气做大改动——中途没有检查点，大步迈进与小步迭代在"通过"之前无法区分；而当每个功能都必须挂上可执行的具体验证命令，实现策略被迫改变：改动拆成可独立验证的小步，关键路径必须能被脚本触达。前置验证闸门因此不只是质量手段，而是通过重新定义"什么算完成"，间接约束了 Agent 选择实现路径的方式。三层终止检查（静态、运行时、系统级）则是对 Agent 自信来源的校准：它的自信建立在局部代码判断上，而真实正确性往往藏在模块边界与集成点，只有 E2E 走查能够暴露。与 WIP=1 组合后，三者构成纪律闭环——单任务限制防止过度延伸，前置验证防止带病前进，闸门式判定防止过早宣告完成。

### 规模数据背后的两种信任模型
OpenAI Frontier 案例（约 1500 个 PR、接近零人工 review）与 Stripe Minions（每周 1300+ PR、AI 生成加人工 review）常被并列引用，但两者的信任结构并不相同：前者把把关职责完全押给 harness 的机器验证链条，后者保留人工 review 作为最终闸门。这组对照说明"AI 能否写生产代码"已不是能力问题，而是组织愿意把多少验证职责交给机器的问题。另一个易被忽略的细节是人力配置：3 人涨到 7 人的团队产出约 100 万行代码，人的角色没有消失，而是从逐行写代码迁移到设计 harness、划定边界、处理机器验证不了的部分。这与 [Claude Code Prompt Context Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-prompt-context-harness.md) 的上下文工程实践和 Agentcore Managed Harness 的托管式 harness 思路指向同一方向：组织级 AI 编码的竞争力，正从模型选型转向验证体系与运行环境的搭建能力。

## 实践启示

**立即为你的项目编写 `AGENTS.md`** —— 这是最小可行的 Harness 入口文件，应包含：项目是什么、怎么启动、怎么测试、硬约束、更多文档去哪看。不要写成百科全书，要写成地图目录 。

**落实 WIP=1 原则，为每个功能建立三字段清单**：行为描述 → 验证命令 → 当前状态。Agent 每次只做一个功能，做完必须验证，验证通过后才能开始下一个。这直接减少了"过度延伸"和"不足完成"两类错误 。

**实施三层终止检查作为每次完成的闸门**：静态检查（语法、类型、lint）→ 运行时验证（服务启动、关键路径）→ 系统级确认（E2E 走一遍）。没有验证证据不允许说完成 。

**把架构约定和上线禁忌文档化到仓库本身** —— 不在 Slack，不在老员工脑子里。重要约束要靠近代码，过时文档必须清掉。仓库是唯一事实来源 。

**每次会话结束执行"清洁状态五件事"**：构建通过、测试通过、进度更新、临时垃圾清掉、下一个会话能直接启动。这确保了下一次 Agent 接入时系统处于确定性的干净状态 。

→ [原文存档](https://mp.weixin.qq.com/s/CRgnx9wMv6xvAeE-KG6K4A)

---

