# Introducing Scheduled Tasks 2.0

## Ch03.036 Introducing Scheduled Tasks 2.0

> 📊 Level ⭐ | 5.7KB | `entities/manus.im-manus-schedules.md`

## 核心要点
- **上下文感知调度**：Scheduled Tasks 2.0 将调度从单纯的时间触发进化为上下文感知的工作流，允许定时任务在同一任务内继续，保留指令、文件、对话和历史
- **项目级复用**：定时任务可以复用 Project 中共享的设置（文件、技能、连接器、指令、输出标准），实现跨任务的一致性
- **Web 应用内嵌调度**：Web 应用内置调度能力，支持数据刷新、脚本运行、仪表板更新、提醒和摘要生成
- **执行环境透明**：支持选择 Agent、附加到 Project、使用云端计算资源

## 深度分析
### 从「时间触发」到「上下文感知」的范式转变
传统的定时任务系统本质上是**时间驱动**的——在设定的时间点触发某个操作，结果通常独立于之前的工作。这种设计在简单场景下足够用，但当工作流涉及多步骤、多文件、持续迭代时，问题就出现了：
1. **上下文断裂**：每次运行生成独立任务，需要重新建立上下文，丢失了之前的工作进展
2. **重复劳动**：文件、指令、格式标准需要在每个新任务中重新声明
3. **可见性缺失**：难以追踪一个长期工作流的历史执行情况和结果
Manus Scheduled Tasks 2.0 的核心创新在于将「**在哪里运行**」提升到与「**何时运行**」同等重要的位置。这代表了 AI Agent 调度从 Cron-style 向「Living Document」模式的转变。

### Project 作为调度容器的设计意义
Project 在此版本中成为定时任务的「**上下文容器**」——定义了一套共享资源（文件、技能、连接器、输出标准），定时任务可以附加到这个容器上而非单独配置。这意味着：

- 一个「每日客户反馈摘要」项目可以包含：数据源连接器（CRM API）→ 分析提示词模板 → 输出格式标准 → 调度配置
- 当 Manus 执行定时任务时，它自动继承 Project 的全部上下文
- 项目的变更（如更新输出格式）会自动反映在后续执行中

### Web 应用调度能力的战略意义
允许 Web 应用内置调度能力，是 Manus 从「对话式 Agent」向「自动化平台」演进的标志。这意味着：

- **嵌入式自动化**：自动化能力不再是外围功能，而是应用本身的一部分
- **用户主权**：用户无需打开应用，自动化可以在后台运行
- **场景扩展**：数据监控、定期报告、轮询任务都可以内嵌到为用户构建的应用中

## 实践启示
### 场景一：持续性研究工作流
适用：市场调研、竞品分析、技术追踪等需要持续更新的知识工作。
```
提示词示例：
"Every weekday at 9 AM, summarize the open action items in this task and remind me what needs follow-up today."
```
关键配置：

- 选择「Continue in the same task」确保所有研究记录在同一任务内累积
- 跳过确认（Skip confirmations）适用于不需要人工审核的例行操作
- 连接相关数据源作为输入

### 场景二：项目管理与状态追踪
适用：敏捷站会、项目周报、里程碑追踪。
```
提示词示例：
"Every Monday, update the customer feedback summary in this Project using the files and format already here."
```
关键配置：

- 附加到包含模板和格式定义的 Project
- 设置云端计算资源以处理较大数据集
- 复用 Project 的连接器访问最新数据

### 场景三：数据驱动型 Web 应用
适用：监控仪表板、实时数据可视化、定期报告生成。
```
提示词示例：
"In this web app, refresh the dashboard data every morning and generate a short daily summary."
```
关键配置：

- 在 Web 应用层面配置调度，而非任务层面
- 设置数据连接器作为数据源
- 配置输出格式（报告结构、可视化样式）

### 最佳实践
1. **命名规范**：为需要持续更新的制品（仪表板、报告、摘要）使用清晰、一致的名称
2. **上下文保留**：对于需要累积学习的任务（如研究），选择在同一任务内继续
3. **项目复用**：建立标准化的 Project 模板，包含常用技能、连接器和输出标准
4. **信任边界**：对于成熟的工作流启用 Skip confirmations，避免不必要的中断
5. **执行环境选择**：资源密集型任务使用云端计算资源，避免拖慢本地设备
## 相关实体
- [Introducing Scheduled Tasks 2 0](../ch03-036-introducing-scheduled-tasks-2-0)
- [Skill Development Guide Aliyun 2026](../ch07-045-重新定义skill开发-保姆级教程-一站式开发助手发布)
- [Openclaw Multi Agent Team Practice](../ch04-038-openclaw-multi-agent-team-practice-v2)
- [Strands Agents Cloud Cost Optimizer](../ch04-128-基于-strands-agents-构建亚马逊云科技云成本分析与优化-ai-助手)
- [别为了用龙虾而用龙虾一个技术管理者折腾三周唯一留下的场景却是这个](../ch03-025-别为了用龙虾而用龙虾一个技术管理者折腾三周唯一留下的场景却是这个)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/manus.im-manus-schedules.md)
- [10x is a lot](../ch03-027-10x-is-a-lot)
- [还在手写 os.getenv？pydantic-settings 让你配置管理效率翻倍](../ch03-031-还在手写-os-getenv-pydantic-settings-让你配置管理效率翻倍)

---

