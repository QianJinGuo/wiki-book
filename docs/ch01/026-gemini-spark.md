# 谷歌风雨飘摇，市值蒸发数千亿美元！Gemini Spark能救场吗？

## Ch01.026 谷歌风雨飘摇，市值蒸发数千亿美元！Gemini Spark能救场吗？

> 📊 Level ⭐ | 9.6KB | `entities/谷歌风雨飘摇市值蒸发数千亿美元gemini-spark能救场吗.md`

# 谷歌风雨飘摇，市值蒸发数千亿美元！Gemini Spark能救场吗？

## 摘要

2026年6月，谷歌经历了一周内四位核心人才接连流失的震荡：Transformer 八子之一 Noam Shazeer 离开去 OpenAI（谷歌曾花约 27 亿美元将其请回），AlphaFold 主导者、诺贝尔化学奖得主 John Jumper 去 Anthropic，Gemini 预训练核心 Jonas Adler 和 Alexander Pritzel 同样准备去 Anthropic。资本市场的反应直接而猛烈——Alphabet 股价两天跌 5%～6%，市值蒸发数千亿美元。

就在这场人才失血的同时，谷歌端出了酝酿已久的产品：Gemini Spark——一款运行在谷歌云专用虚拟机上的持久化 Agent，可以跨 Gmail、Calendar、Docs、Sheets、Drive 等工具自主执行多步骤任务，被视为谷歌在 Agent 产品化方向的「最关键一张牌」。

## 核心要点

- **人才流失的四条神经线**：Noam Shazeer（架构）、John Jumper（科学/AlphaFold）、Jonas Adler（预训练）、Alexander Pritzel（编程）——分别踩在大模型最核心的几条神经线上，引发市场对谷歌「能否留人」的深层担忧。
- **Gemini 3.5 Pro 跳票**：I/O 2026 上承诺的 Gemini 3.5 Pro 从 6 月推至 7 月，两百万 token 上下文和 Deep Think 深度推理空有纸面规格，迟迟不到用户手中，加剧市场焦虑。
- **Gemini Spark 的核心定位**：不是普通的聊天机器人，而是运行在云端专用 VM 上的持久化 Agent——用户合上电脑、锁了手机、睡着了，它还在云端继续运行。通过 Antigravity Agent 框架（Tasks、Skills、Schedules）实现定时或条件触发的自动化工作流。
- **深度集成 Google Workspace**：Spark 能够操作 Gmail、日历、Docs、Sheets、Slides、Drive、地图和 YouTube，通过 MCP 协议接入 Canva、OpenTable、Instacart 等第三方服务，涉及花钱、发邮件等高风险动作时会先请求用户确认。
- **定价壁垒**：仅限 Google AI Ultra 用户（每月 100 美元），Pro 用户只能拿到 Daily Brief 晨间简报而非 Spark 本体，引发「数字员工被圈在最贵一层」的争议。

## 深度分析

### 谷歌悖论：最该赢的公司为何起了大早赶了晚集

文章揭示了一个深刻的谷歌悖论：没有哪家公司比谷歌更适合做生产力 Agent。Gmail、Calendar、Docs、Sheets、Drive 不是孤立应用，而是现代办公生活的毛细血管。真正的数字员工如果能天然接入这些系统，效率优势会极其可怕。

问题在于，谷歌越大越怕出事——AI 读错邮件、误删文件、错误发出内容、访问用户隐私引发公关灾难，这些对创业公司是风险，对谷歌就是雷区。于是它谨慎、犹豫、审查、等待，而在它犹豫不决时，以 OpenClaw 为代表的开源项目正在重新定义「浏览器智能体」。

这种「巨头的傲慢与恐惧」导致谷歌在 Agent 产品化上落后于 OpenAI 和 Anthropic。Spark 的出现是谷歌终于决定放开束缚、让 AI 真正进入后台「替人干活」的转折点——但问题在于，那些造神的人（Shazeer、Jumper）都走了，剩下的「打工机器」能否撑起谷歌的下一个十年？

### Gemini Spark 的产品架构与竞品对比

Gemini Spark 的产品设计聚焦于「持久化 Agent」这一核心能力，与市场上的主要竞品形成差异化：

| 维度 | Gemini Spark | OpenAI Agent | Claude Code/Computer Use |
|------|-------------|-------------|------------------------|
| 核心场景 | 办公自动化（邮件、日历、文档、表格） | 通用对话 + 工具调用 | 软件工程 + 浏览器操作 |
| 持久化能力 | 云端 VM 持续运行，用户离线仍工作 | 会话级，无持久化 | 本地运行，需用户在线 |
| 系统集成 | Google Workspace 深度集成 | 通用 API 集成 | 本地文件系统 + 终端 |
| 定价 | $100/月（Ultra 层） | API 按量计费 | Pro/Max 订阅 + API |
| 框架 | Antigravity（Tasks + Skills + Schedules） | 未有公开产品框架 | Agent Teams + Subagent |

Spark 的独特优势在于 Workflow 集成深度和持久化能力。一个典型的场景：摄影师收到询价邮件 → Spark 自动提取客户信息 → 写入客户追踪表格 → 新建 Drive 文件夹 → 这一切在用户离线时完成。

### 行业趋势：AI 从「副驾驶」到「司机」

文章中提到的行业共识也是 Agent 产品化的核心趋势：AI 正在从「副驾驶」（你开车，它提醒你）变成「司机」（你说目的地，它自己规划路线）。

这一转变意味着 Agent 产品需要解决三个层面的问题：

1. **任务理解与拆解**：从自然语言目标到可执行的多步骤计划
2. **跨系统编排**：在多个 SaaS 工具之间协调数据流和操作流
3. **安全与治理**：高风险操作的审批、审计、回滚

Gemini Spark 通过 Antigravity 框架（Tasks + Skills + Schedules）来应对前两个层面，但第三个层面——安全治理——仍是所有 Agent 产品的共同挑战。这与 [Harness Engineering](../ch05/115-harness-engineering.html) 框架中强调的六大控制层（调度流、工具层、记忆层、门控层、安全层、观测层）高度一致。

### 人才流失背后的深层信号

一周内四位核心人才同时离开，反映的是比薪酬更深层的组织问题。Noam Shazeer 曾被谷歌以约 27 亿美元请回，不到两年又离开——这说明谷歌在 AGI 层面的愿景和执行力可能未能匹配这些顶尖人才对技术前沿的追求。

相似的情况也出现在 [Anthropic 的人才吸引力](ch01/933-anthropic.html) 和 OpenAI 的人才竞争中——AI 顶尖人才的流动性极高，他们追逐的是技术愿景的实现空间，而非薪酬或头衔。

## 实践启示

1. **Agent 产品化的核心壁垒在于系统集成深度**：Gemini Spark 的最大优势是 Google Workspace 的原生集成，而非 AI 能力本身。任何 Agent 产品的护城河最终来自于它能够操作的系统数量和质量，而非模型参数规模。

2. **持久化 Agent 是下一波产品浪潮**：从「你问它答」到「你设置它执行」的转变，要求 Agent 具备持久化运行能力。云端 VM 方案虽然成本高，但为长时间运行、后台执行、定时触发提供了可行的工程基础。

3. **定价策略决定市场覆盖**：$100/月的定价将 Spark 限定在高价值企业用户，限制了规模化扩展。在 Agent 产品化的早期阶段，更灵活的分层定价（如按任务计费、按集成深度计费）可能比单一高价层更有利于市场教育。

4. **组织能力是 AI 产品竞争力的隐性维度**：谷歌的困境表明，即使拥有最强的技术栈和产品基础设施，如果留不住核心人才，产品迭代速度和技术领先性都会受到影响。AI 公司的竞争本质上是人才的竞争。

5. **Harness Engineering 是 Agent 产品化的必经之路**：无论 Spark、Claude Code 还是 OpenAI 的 Agent 产品，最终都要解决同一个问题——如何让 Agent 在「替人干活」的同时保持可控、可审计、可回滚。控制平面的设计决定了 Agent 产品能走多远。

## 相关实体

- [Agent Teams 对比](../ch03/076-claude-code.html) — 三家 Agent 产品路线对比
- [Claude Science](../ch03/076-claude-code.html) — Anthropic 的 Agent 平台化路径
- [Harness Engineering](../ch05/115-harness-engineering.html) — Agent 控制面板的系统方法论
- [Agent落地真相](../ch03/046-agent.html) — Agent 从演示到投产的核心挑战
- [Agent Harness 招聘实践](../ch05/039-agent-harness.html) — Agent 在企业场景的工程实践

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/谷歌风雨飘摇市值蒸发数千亿美元gemini-spark能救场吗.md)

---

