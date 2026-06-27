# 我用Claude搭了个自动新闻简报，30天后比我刷了一年的信息还有用

## Ch03.107 我用Claude搭了个自动新闻简报，30天后比我刷了一年的信息还有用

> 📊 Level ⭐⭐ | 5.5KB | `entities/claude-research-agent-auto-newsletter-cyrilxbt.md`

# 我用Claude搭了个自动新闻简报，30天后比我刷了一年的信息还有用

## 核心结论

- 四任务：信息源监控→信号过滤→综合→交付（45分钟→5分钟）
- 五组件：Claude + Filesystem MCP + Brave Search MCP + N8N + CLAUDE.md
- 复利：30天校准→60天模式揭示→90天专职分析师级输出

## 四任务

1. **信息源监控**：行业新闻/竞品/学术/newsletter/YouTube/播客文字稿/GitHub/Reddit
2. **信号过滤**：基于标准识别重要内容，竞品发产品重要，重复包装不重要
3. **综合**：结构化叙事（发生什么/为什么重要/关联/行动）
4. **交付**：Obsidian vault指定位置，自动送达

## 技术架构

| 组件 | 职责 |
|------|------|
| Claude | 智能层 |
| Filesystem MCP | Obsidian vault读写 |
| Brave Search MCP | 实时搜索（免费2000次/月） |
| N8N | 工作流调度（$5/月DigitalOcean） |
| CLAUDE.md | 个性化上下文 |

## N8N五节点工作流

Schedule Trigger → Read CLAUDE.md → Prepare API Request → Claude API Call → Save to Vault

可选：Telegram通知推送到手机

## CLAUDE.md关键字段

- What I Specifically Do NOT Want（最重要，过滤噪音）
- What I Already Know Well（只过滤重大进展）
- Competitive Landscape（具体监控对象）

## 反馈循环

每份简报底部My Notes区域 → 每周日Claude根据标注优化 → 复利效应

## 深度分析

### 信息过载的结构性解法

传统信息获取模式存在根本性缺陷：人主动去抓信息，容易被算法牵着走，且无法系统性积累。CyrilXBT的方案本质上是把「消费信息」变成了「定制研究」——让Claude扮演一个了解你背景的分析师，每天给你整理值得看的。

### CLAUDE.md为什么是核心杠杆

大多数AI使用场景里，上下文全靠对话时临时补充。但CLAUDE.md构建了一个持久的研究环境：它存储的是你已知什么、你关心什么、你明确不要什么。关键是`What I Specifically Do NOT Want`这一字段——它本质上是一个主动过滤规则，比「多读」更有效的是「少看但看准」。

### MCP工具链的连接价值

Filesystem MCP + Brave Search MCP构建了一个完整的读写-搜索闭环。Claude能读你的vault（理解上下文），能搜网络（获取最新信息），能写简报（交付成品）。这比单纯调用API要强大得多，因为工具调用本身就是上下文的一部分。

### 复利模型的关键洞察

30→60→90天的时间线揭示了一个重要规律：研究系统不是静态稳定的，而是随反馈持续优化的。第一份简报可能是粗筛，90天后是精准情报。差距来自每一份简报末尾的My Notes反馈——人告诉AI什么有用、什么无用，AI据此调整下一轮的过滤逻辑。

## 实践启示

### 起步最小化配置

不需要一开始就搞完整架构。从核心开始：Claude + 2个MCP（Filesystem + Brave Search）+ 一个固定的信息源（RSS或 newsletter）。先验证「AI整理的信息确实比我自己刷有用」，再逐步扩展信息源和调度自动化。

### CLAUDE.md的写作优先级

写CLAUDE.md时，`What I Do NOT Want`应该占最大篇幅——它直接决定噪音过滤效率。相比之下，`Who I Am`反而不那么重要，AI更多靠具体规则而非身份描述来执行任务。

### 反馈循环的实操节奏

每日简报 → 底部My Notes（2分钟标注） → 周日统一处理。这是个低频高价值的闭环：不需要每天优化，每周一次足够产生复利效应。关键是坚持记录，哪怕只是「今天有几条其实我知道」。

### 冷启动期的预期管理

第一个30天不应期待精准输出。系统需要校准：哪些信息源持续产生信号、哪些主题其实不需要深入。把这30天看作「系统磨合期」，目标是让AI熟悉你的研究边界，而不是立刻获得专职分析师级产出。

## 时间线

- 30天：简报校准，噪音主题移除，信号源优先
- 60天：周度综合揭示模式
- 90天：专职分析师级理解

## 相关实体
- [Harness Engineering Jk Launcher Baijiajie](/ch05-029-万字干货-harness-engineering如何工程化落地/)
- [New Ai Lock In](/ch07-031-the-new-ai-lock-in/)
- [Loop Engineering Addy Osmani Challengehub](/ch05-002-loop-engineering-不再写提示词-而是设计替你写提示词的循环-先写刹车再写循环-13-来源深度合并-ad/)
- [Kiro Mcp Rds Mysql Upgrade](/ch07-035-使用-kiro-和-mcp-自动化大规模升级-rds-mysql-8-0-至-rds-mysql-8-4/)
- [Yumanju Ai Full Flow Efficiency](/ch01-356-柚漫剧-ai-全流程提效拆解/)
- MOC

---

