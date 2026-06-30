# 我把Mac留在家，用手机让TRAE SOLO替我打了一天工

## Ch01.445 我把Mac留在家，用手机让TRAE SOLO替我打了一天工

> 📊 Level ⭐⭐ | 8.2KB | `entities/我把mac留在家用手机让trae-solo替我打了一天工.md`

# 我把Mac留在家，用手机让TRAE SOLO替我打了一天工

review_confidence: 10
review_recommendation: worth-reading
review_stars: 3

👆这个场景你大概再熟悉不过。工作日下午，星巴克长桌前长满了人。每个人都低着头，眉头微皱，看上去像在拯救世界。

## 相关实体
- [Trae Solo Work Feishu Bitable Pipeline Tutorial](https://github.com/QianJinGuo/wiki/blob/main/entities/trae-solo-work-feishu-bitable-pipeline-tutorial.md)
- [Www.Infoworld 4171274 Anthropic Puts Claude Agents On A Meter Across Its Subscri](ch04/503-agent.md)
- [Anthropic Pm Jess Yan Managed Agents](ch04/353-anthropic-pm-jess-yan-managed-agents.md)
- [Anthropic Claude Managed Agents Platform 2026](ch04/503-agent.md)
- [Claude Code Hackathon Winners 2026](ch01/786-claude-code-hackathon-winners-2026.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/我把mac留在家用手机让trae-solo替我打了一天工.md)

- [trae solo work 模式 + 飞书多维表格 5 步教程](https://github.com/QianJinGuo/wiki/blob/main/entities/trae-solo-work-feishu-bitable-tutorial.md)

## 深度分析

**1. AI Agent 的形态正在从「桌面工具」转向「随身劳动力」**

过去三个月，Anthropic、Nous Research 等公司都在往同一方向走：让 AI Agent 离开必须坐在电脑前才能用的形态，变成随身能调度的东西。

Anthropic 走的是「遥控器路线」，Claude Code Remote Control 需要订阅 Max 套餐（每月 100-200 美元）。Nous Research 的 Hermes Agent 支持 Android，用户能在 Termux 里跑 Agent，走的是开源命令行路线，自由度高但门槛也高。而 TRAE SOLO Mobile 则代表了第三种路径：**原生 App 形态，无需订阅，无需折腾，门槛最低**。

**2. MTC 模式重新定义 Coding Agent 的边界**

Coding Agent 能干的事情，早已远远超过编程本身：写文章（长文初稿、结构调整、风格审校，多 Agent 并行）、做视频（脚本、口播稿、字幕、剪辑指令）、做产品宣传动画、做自媒体内容数据分析。

TRAE SOLO Mobile 的 MTC 模式（More Than Coding）专门面向这些通用工作场景。其高明之处在于让那些「还认为 AI Coding Agent 只是写代码工具」的人意识到「原来你还能干这个」。 这是产品设计上的一次认知破界。

**3. 随身 Agent 的核心价值：任务中断 vs 任务连续**

传统 AI Coding Agent 的致命缺陷是「必须在电脑前用」。当任务需要长时间执行时，要么守着电脑，要么中断任务。

TRAE SOLO Mobile 解决了这个问题：任务在远端跑，状态实时同步回手机。用户在咖啡馆提交任务 → 喝完一杯美式 → 手机查看进度 → 到家时任务已完成。 整个过程没碰过电脑，咖啡都没凉。这不是效率提升，是工作形态的根本改变。

**4. 「AI 工具管家」：Agent 作为 Agent 的使能层**

文章揭示了一个被低估的使用场景：让 Agent 帮你安装、配置、调试其他 AI 工具。

丢两个 GitHub 链接给 TRAE SOLO，说「帮我安装这两个 skill」，它自己跑命令，skill 装到 `~/.agents/skills/` 目录，所有支持的 AI Agent（包括 Claude Code）都能直接调用。飞书 CLI 的安装也是同样套路——把仓库地址丢给 SOLO，一句话搞定。

这意味着 TRAE SOLO 可以成为「AI 工具管家」——你在使用任何 AI 工具时碰到的安装、配置、调试问题，丢给它就行。

**5. 飞书 CLI 接入：工作流缝合的最后一公里**

飞书官方把日历、消息、文档、多维表格、任务、知识库封装成 CLI 工具 `@larksuite/cli`，对所有 Coding Agent 兼容。 但 TRAE SOLO 接入最深，专门做了一键安装和 Agent Skill。

整个链路：手机一句话 → PC 远端执行 → 飞书文档生成 → 分享链接到手。这个工作流以前任何一个环节断掉都做不成，今天终于全跑通了。 这代表了一种新的人机协作范式：**人负责决策，机器负责执行，状态实时同步**。

## 实践启示

**1. 用手机 + 远端 PC 实现「无电脑工作日」**

如果你的工作主要依赖 AI Coding Agent（写代码、做分析、生成内容），完全可以尝试不带电脑出门一天。手机提交任务 → 远端 PC 执行 → 手机查看结果。 对于出差、通勤、咖啡馆办公场景，这能释放大量「必须守着电脑」的时间。

**2. 优先使用 MTC 模式处理「非编程」工作**

Coding Agent 的价值被严重低估——它不只是写代码，能做 PPT、Excel 报告、视频脚本、数据分析。 如果你只用它写代码，说明你还没解锁它的全部能力。遇到任何「需要一个交付物」的任务时，先想想 MTC 模式能不能做。

**3. 用 Agent 充当「AI 工具安装助手」**

当你需要安装 Claude Code、配置 Skill、搭建 MCP 环境时，不要自己折腾文档。找一个能操控命令行的 Agent，丢 GitHub 链接，说「帮我安装」，剩下的让它自己跑。 这是 Agent 时代最高效的工具配置方式。

**4. 利用飞书 CLI + Agent 构建「手机 → 文档」工作流**

飞书 CLI 覆盖了日历、消息、文档、表格、邮件、任务等核心业务域。 配合 Agent 的自然语言理解能力，你可以在手机上发一句指令「写一份关于 XX 的介绍文档，保存进飞书，把链接发给我」，剩下的全由远端 Agent 执行。

**5. 让 Agent 记住你的工作路径，实现真正的连续性**

TRAE SOLO 会记住你上次用的是 Code 还是 MTC、当时的环境、当时的工作路径，下次进来直接接着上次的状态走。 使用任何支持会话记忆的 Agent 时，应该让它保持长期上下文，而不是每次都开新会话。这样 Agent 才能真正成为「工作伙伴」而非「临时工具」。

---

