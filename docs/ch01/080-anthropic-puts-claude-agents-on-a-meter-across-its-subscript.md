# Anthropic puts Claude agents on a meter across its subscriptions

## Ch01.080 Anthropic puts Claude agents on a meter across its subscriptions

> 📊 Level ⭐ | 6.5KB | `entities/anthropic-puts-claude-agents-on-a-meter-across-its.md`

## 核心要点
- 来源：infoworld.com
- 评分：v=5 c=12 (56分)
- Anthropic 将于 6 月 15 日把程序化 Claude 使用从订阅限制中分离出来
- 引入独立月度积分系统，按 API 风格费率计费，覆盖 Agent SDK、GitHub Actions、OpenClaw
- Pro 用户 $20 积分，Max 5x $100，Max 20x $200
- 之前程序化负载与交互式 Claude 使用共享同一订阅池
## 相关实体
- [Anthropic Claude Agents Meter Infoworld](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-claude-agents-meter-infoworld.md)
- [Www.Infoworld 4171274 Anthropic Puts Claude Agents On A Meter Across Its Subscri](https://github.com/QianJinGuo/wiki/blob/main/entities/www.infoworld-4171274-anthropic-puts-claude-agents-on-a-meter-across-its-subscri.md)
- [Notion Ai Agents](https://github.com/QianJinGuo/wiki/blob/main/entities/notion-ai-agents.md)
- [Announcing Claude Managed Agents On Cloudflare](https://github.com/QianJinGuo/wiki/blob/main/entities/announcing-claude-managed-agents-on-cloudflare.md)
- [Anthropic Claude Managed Agents Platform Launch](https://github.com/QianJinGuo/wiki/blob/main/entities/anthropic-claude-managed-agents-platform-launch.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/anthropic-puts-claude-agents-on-a-meter-across-its.md)

## 深度分析
Anthropic 的这一决策标志着 AI 订阅模式的一次根本性转变。"无限吃到饱"的时代正在终结，程序化使用与交互式使用之间的界限正在被明确划分。
**定价结构的变化**
从 6 月 15 日起，Anthropic 将 Claude 的程序化使用（Agent SDK、GitHub Actions、第三方框架如 OpenClaw）从标准聊天订阅中分离出来，引入独立的月度积分系统。这些积分按 API 风格费率计费，额度与用户现有订阅等级挂钩：Pro 用户 $20、Max 5x 用户 $100、Max 20x 用户 $200。
此前，程序化工作负载与交互式 Claude 使用共享同一订阅池，这使得 Claude 订阅对运行长时 agent 任务的开发者特别有吸引力——通过 OpenClaw 或 Agent SDK 等工具的使用基本上被纳入更广泛的订阅限制，而非单独按 API 费率计费。
**开发者反应**
这一政策引发了开发者的强烈不满。高级数据科学家 Yadesh Salvi 在 X 上发帖称："您提供的月度限额甚至无法支撑一天认真工作。您只是在减少/移除一些最常用功能的使用，如 Claude Agent SDK 和 Claude Code 中的 claude -p，然后称之为福利。"
Broadcom 高级网站可靠性工程师 Advait Patel 持类似观点："对于在平价 Pro 或 Max 计划上构建个人自动化项目的开发者来说，这是一个真正的转变。专用积分池给了你一小段免费实验期，但一旦你的 agent 变得足够有用并开始频繁运行，你就会被纳入计量计费，无论你是否愿意。"
**行业趋势**
Greyhound Research 首席分析师 Sanchit Vir Gogia 认为，Anthropic 的新政策并非孤立的定价调整，而是行业向 agentic AI 工作负载计量经济学的更广泛转型的一部分。他指出，OpenAI 长期以来依赖基于使用量的 API 定价，而 GitHub 也正在将 Copilot 过渡到基于积分和信用的系统。
Gogia 预测："在未来 12 到 24 个月内，企业应该预期更多供应商会为 agent、高端模型、工具使用、后台任务和第三方集成创建单独的消费池。有些叫积分，有些叫请求，有些叫消息，有些叫计算单元。有些会把仪表隐藏在捆绑包中。词汇会有所不同，因为市场营销部门需要一些爱好。但方向不会改变。"
**经济学解读**
Patel 指出，重度 agent 用户消耗的计算量远远超过 $20 或 $100 订阅所能支持的。"运行这些模型确实很昂贵，为程序化使用提供无限套餐的计划永远不会持续。"他补充说，新政策将给依赖 Claude 订阅运行无人值守工作流程（如 CI 管道、计划自动化和长时间运行的编码 agent）的开发者和团队带来新的运营和预算挑战。
"由于使用现在比以往更直接地与 token 消耗挂钩，而非订阅等级，企业可能会发现，对于涉及重试、大上下文窗口或多步骤 agent 循环的工作负载，成本预测变得更加困难。此外，积分按用户计，不共享，因此团队之间无法共享预算。这使得共享自动化变得尴尬。同样，一个失控的 agent 或一个糟糕的 prompt 可以快速耗尽积分，然后要么停止你的管道，要么悄悄地开始产生额外费用。"

## 实践启示
**1. 将 AI 使用视为云基础设施**
Patel 的核心建议是：开发者和企业必须开始将程序化 AI 使用视为带有自身运营和财务控制的计量云服务。"像对待 AWS 或 GCP 一样对待你的 Claude 使用。了解每个工作流程的 token 成本，设置硬性预算警报。"
**2. 优化效率而非依赖补贴**
Doozer AI 联合创始人 Paul Chada 建议开发者开始更加积极地关注效率和在设计 AI agent 及自动化工作流程时的成本纪律。"不要再优化补贴，开始优化 token。将 prompt 缓存、上下文纪律和模型选择作为一等工程问题。"
他补充道："在计量时代茁壮成长的开发者是那些本来就会构建高效 agent 的人；补贴只是在掩盖那是谁。"
**3. 建立新的成本意识**
开发者需要停止将 AI 订阅视为运行生产级 agent 工作负载的低成本路径，因为供应商越来越多地转向基于消费量的定价模式，以应对自动化密集型 AI 使用不断上升的成本。
**4. 为行业转变做好准备**
Gogia 的行业观察表明，整个行业正在朝着分离计量方向演进。企业应该预期更多供应商将创建 agent、高端模型、工具使用和后台任务的单独消费池。
**5. 评估信用的实际成本**
按照新政策，$20 的 Pro 积分实际上并不足以支撑一天的重度程序化使用。开发者需要重新评估其工作流程的实际 token 消耗，并在计量模型下计算真正的成本。

---

