# Codex 重磅升级：Appshots / Goal 毕业 / 锁屏远程操控

## Ch01.274 Codex 重磅升级：Appshots / Goal 毕业 / 锁屏远程操控

> 📊 Level ⭐⭐ | 13.8KB | `entities/codex-major-update-appshots-goal-xinzhiyuan.md`

# Codex 重磅升级：Appshots / Goal 毕业 / 锁屏远程操控

## 相关实体

- [agent资本市场：自主agent融资框架与批判](/ch04-213-agent资本市场-自主agent融资框架与批判/)
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/codex-major-update-appshots-goal-xinzhiyuan.md)

- MOC
## 摘要

OpenAI 在 2026 年 5 月对 **Codex** 进行了重大升级，标志着它从"代码助手"正式蜕变为**全天候 AI 队友平台**。五大能力同时上线：**Appshots**（双击 Command 截屏并读取屏幕外隐藏文本）、**/goal 毕业**（长周期自主编码）、**Locked Use**（Mac 锁屏状态下远程操控）、**应用内浏览器高级标注模式**、**插件共享与 Analytics 升级**。同日 ChatGPT 以插件形式杀入 PowerPoint，进一步扩张 OpenAI 在生产力领域的边界。

关键数据：截至 2026-05，Codex 周活跃开发者突破 **400 万**（两周前还是 300 万）；今年 1-4 月在 ChatGPT Business/Enterprise 中用户数暴增 6 倍；**50% 的 Codex 用户做的事已不是写代码**。

## 核心要点

### 1. Appshots：双击 Command 读懂"所有屏"

- 仅需连按两下 Command 键
- 当前应用窗口被"啪"地挂到 Codex 对话线程
- **关键差异：能读取屏幕外未滚动到的隐藏文本**（包括文件路径、URL）
- 60 秒内与某线程互动过，新 Appshot 自动追加而非开新对话
- 连续多张 Appshot 塞入同一线程
- 目前在 Mac 所有版本计划中上线，企业级权限即将开放

### 2. /goal 模式正式毕业

- 在 Codex App、IDE Extension 或 CLI 设一个明确的里程碑目标
- AI 像不知疲倦的劳模一样持续推进
- 任务跨数小时甚至数天不停
- 中途可查看进度、调整方向、暂停
- 从"扔个 prompt 等结果"演化为**真正的长周期自主工作**

### 3. Locked Use：Mac 锁屏远程操控

- 从手机端可安全操作 Mac 上的应用
- 哪怕屏幕关了、电脑锁了
- 在"计算机使用"设置中开启 Locked Use 即可
- OpenAI 内部称为"Codex 的黑魔法"
- 配合 Codex 移动端预览，构成 **7×24 小时不下线的远程 AI 员工**

### 4. 应用内浏览器迭代

- 全新"高级标注模式"：直接在网页/UI 上修改元素并实时预览，Codex 自动生成对应代码
- 零散修改意见可打包成批处理评论发给 Codex

### 5. 团队协作 + Analytics

- Business 用户可在团队内分发自定义插件、复用内部工具
- Analytics 新增维度：活跃用户、Credits 消耗、Token 用量、运行次数、用户排行榜、生成代码行数、插件使用量
- 更新 Analytics API，便于团队精确掌握 Codex 在组织内的使用情况

### 6. ChatGPT for PowerPoint Beta 同日上线

- ChatGPT 直接在 PowerPoint 内部创建和编辑演示文稿
- 一句话生成全套可编辑幻灯片
- 可从 Gmail、Outlook、SharePoint 拉取实时数据
- 全球所有 ChatGPT 用户层级开放 Beta

### 7. 增长曲线

- 周活 100 万每增长一次，所有用户的使用限额重置一次（直到 1000 万为止）
- 50% 的 Codex 用户已不主要用它写代码
- 自动化流程、跨工具协作、长期任务管理、远程电脑操控

## 深度分析

### 1. Appshots 解决的是"上下文获取的物理边界"

传统 AI 编码工具的上下文输入只能是**用户主动复制粘贴**或文件读取。Appshots 直接读取应用窗口的渲染状态——包括屏幕外未滚动到的内容。这突破了上下文获取的物理边界：

- **旧范式**：用户必须把信息"搬运"给 AI（截图+OCR、复制+粘贴）
- **新范式**：AI 直接从应用程序的内部状态获取信息

从工程实现看，Appshots 显然不是简单的截图+OCR——它能读取屏幕外的文本意味着**Codex 直接调用了应用程序的 accessibility API 或文档对象模型**。这在 Mac 上通过 Accessibility API（AXUIElement）实现技术上可行，但需要用户授予系统级权限。

对开发者工作流的实际影响：阅读长文档/邮件/API 参考时不再需要分段截图，整页都被 AI 一次性消化。这是**消除人机交互摩擦力**的核心机制。

### 2. /goal 毕业意味着 Agent 从"反射模型"升级为"规划模型"

传统 Codex 是反射式（reactive）：用户给 prompt → AI 生成 → 等待下一个 prompt。/goal 毕业意味着 Codex 进入**目标导向（goal-directed）模式**：用户给里程碑 → AI 自主规划子任务 → 持续推进数小时至数天 → 中途用户可查询/调整/暂停。

这与 [nanobot](/ch01-208-nanobot-4000行极简-agent-框架架构解析/) 的 subagent 机制本质相同（spawn 长任务到后台），但 OpenAI 把这个机制产品化、规模化，让无技术背景的用户也能用。

对工作流的根本性影响：
- 早上设目标 → 晚上回来看结果 → 这是新的开发节奏
- 开发者从"指令的发出者"变成"目标的设定者+结果的评审者"
- 单位时间产出从"代码行数"转向"已完成里程碑数"

但**风险也跟着翻倍**：长周期自主任务可能：
- 走错方向数小时后才被发现
- 产生大量难以审查的代码变更
- 跨多个 commit 引入难以回滚的副作用

参见 [天猫团队实战指南](/ch09-029-天猫新品营销技术团队ai编码实战指南-上/)中"AI 一直无法输出正确结果，在错误中不断循环"的"改不动"痛点——这在长周期任务中会被放大。

### 3. Locked Use 是 Computer Use 的物理空间扩展

Anthropic 已先推出 Computer Use，Google Project Mariner 跟进。但**Locked Use 是 OpenAI 的差异化**：让 AI 在"用户物理不在场+屏幕已锁"的条件下继续操作电脑。

技术上，这要求：
- macOS 的特殊 entitlement（绕过 lock screen security model）
- 与 Apple 的合作或基于 Accessibility 的官方支持
- 远程命令通过 Codex 服务端中转

商业意义：**计算资源的"远程化"达到了新高度**——Mac 本质上从"个人设备"演化为"个人云上的工作单元"。用户在手机上发指令，Mac 在家或办公室继续工作。

这对硬件市场也有连带影响：辣评"逼着我现在就去买一台 Mac"反映了 AI 时代下 **硬件作为 AI Agent 的物理基座** 的新需求逻辑。

### 4. "50% 用户不写代码"是 Codex 定位的根本转变

这个数据点比所有新功能都更重要。当 50% 用户用 Codex 做的事**不是写代码**时：
- 命名"Codex"已不准确（应叫 General Agent）
- 用户画像扩展到所有知识工作者
- 竞争对手不再是 Cursor/GitHub Copilot，而是 Slack/Notion/Microsoft Copilot

OpenAI 的产品策略路径开始清晰：
1. 从 ChatGPT 抓住对话场景
2. 从 Codex 抓住编程场景
3. 用 Codex 的能力扩张到"所有需要操作电脑的知识工作"
4. 用 ChatGPT for PowerPoint 这类插件回头反向渗透传统办公软件

这与 [同期 a16z 对话 Roblox PM](/ch01-340-腾讯研究院ai速递-20260506/) "工具型 App 首当其冲被 Agent 入口替代" 的判断完全一致。

### 5. 增长 hack：用 quota reset 强化用户增长

"每增长 100 万周活，重置所有用户限额"是非常聪明的增长设计：
- 现有用户有动力推广（推广 = 自己得到更多额度）
- 新用户感知价值（"先用够了再说"）
- 把增长拉力从"产品体验"扩展到"社交激励"

这种**用产品资源直接奖励社交传播**的机制，在 SaaS 增长史上较少见。Dropbox 的"邀请获取存储"是远祖，但 OpenAI 把它做到了**实时增长曲线驱动**——这是把增长数据本身变成产品机制。

### 6. ChatGPT for PowerPoint：从 Add-in 到 Agent 入口

ChatGPT 杀入 PowerPoint 看似是常规产品扩张，但有两个关键差异：
- **数据连接能力**：直接从 Gmail/Outlook/SharePoint 拉取实时数据
- **完全可编辑输出**：不是图片 / 不可改的模板，而是原生 PowerPoint 对象

第二点尤其重要——传统 AI 生成的 PPT 输出常常是图片或不规范模板，用户改起来困难。"完全可编辑"意味着 AI 真正进入了**专业工具的编辑模型**而非"贴一个外壳"。

竞争格局：ChatGPT vs. Claude vs. Copilot 三足鼎立。Microsoft 在 Office 内的天然优势被 ChatGPT 通过插件机制部分抵消——**插件模式让 OpenAI 不需要拥有 Office，也能成为 Office 内的 AI 主导**。

### 7. 跨能力组合的乘法效应

Appshots（屏幕感知） + /goal（长周期自主） + Locked Use（物理边界突破） + 插件共享（团队协作） 不是叠加，是**乘法**：
- Appshots 让 AI 看见任何应用 → /goal 让它干任何任务 → Locked Use 让它持续干 → 插件让团队复用
- 最终形态：**一个能自主理解屏幕、长期推进任务、跨设备运行、团队级复用的 AI 工作者**

这个组合的整体冲击力远超单项功能之和。从 Karpathy "锯齿智能"的视角看，OpenAI 正在用产品工程**主动磨平能力分布的锯齿**——单项能力不一定最强，但组合后的实用性最高。

## 实践启示

1. **重新评估 AI 工具选型边界**：如果你只用 Codex 写代码，可能严重低估其价值。审视团队工作流中"操作电脑"的所有场景，看哪些可以委托给 Codex。

2. **建立长周期任务的审查机制**：/goal 模式带来"开早晚归看结果"的新节奏，但需要配套的代码审查机制——不能让 AI 跑 8 小时后发现整个方向错了。建议：每完成一个子里程碑就强制人工 checkpoint。

3. **Accessibility API 友好的工程设计**：随着 Appshots 这类工具普及，应用程序应该：
   - 给 UI 元素提供合理的 accessibility label
   - 保持 DOM/视图层级清晰
   - 避免用图片代替文本
   这同时改善了 AI 可读性与无障碍体验。

4. **远程工作流重构**：Locked Use 让"在路上用手机管理桌面任务"成为现实。重新设计工作流，把"必须在电脑前完成"的任务转化为"在桌面被 AI 长期推进，手机查看进度"的模式。

5. **团队插件作为 SOP 沉淀**：把团队的最佳实践沉淀到 Codex 插件，比维护 wiki 文档更可执行。每个插件本身就是可调用的 SOP。

6. **PPT 自动化重新评估**：ChatGPT for PowerPoint + 数据连接意味着季度回顾/客户简报/董事会汇报的制作时间可压缩 80%+。值得在这些高频场景做完整迁移。

7. **预算与限额规划**：quota reset 机制下，使用越多团队成员就越能解锁更多额度。建议团队层面统一推广 Codex 而非个人零散使用。

8. **Computer Use 安全治理**：Locked Use 等能力存在严重的安全风险（AI 在用户不在场时操作电脑）。企业需建立：审计日志、权限白名单、敏感操作二次确认机制。

## 关联实体

- [Nanobot Agent Framework Architecture Deep Dive](/ch01-208-nanobot-4000行极简-agent-框架架构解析/) — subagent / 长周期任务的极简框架样本
- [腾讯研究院Ai速递 20260506](/ch01-340-腾讯研究院ai速递-20260506/) — 同期 AI 行业全景，含"工具型 App 消亡"判断
- [天猫新品营销技术团队Ai编码实战指南上](/ch09-029-天猫新品营销技术团队ai编码实战指南-上/) — AI 编码全流程工程化方法论
- [Karpathy Vibe Coding Agentic Engineering](/ch04-070-从氛围编程到智能体工程/) — vibe coding 到 agentic engineering 的演进
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](/ch04-125-karpathy-最新访谈-从-vibe-coding-到-agentic-engineering/) — 锯齿智能与 Codex 能力组合
- [Harness Engineering Framework](/ch05-041-harness-engineering-概念框架/) — Agent harness 的工程框架
- Agent Harness Context Management Working Set — Appshots 引发的 working set 管理新挑战

## 信号判断

短期（6 个月）：
- Cursor / GitHub Copilot / Claude Code 将跟进 screen-capture-aware + long-running goal 能力
- macOS / Windows 会增加 Computer Use 类操作的官方 entitlement 体系
- 企业级 AI 治理工具市场被催生

长期（18 个月）：
- "Agent 入口"逐步取代"App 入口"，传统 SaaS 的导航/搜索/设置等 UI 部分被 Agent 化
- 50% 不写代码的趋势继续放大到 70%+，Codex 演化为 General Agent
- "在电脑前工作"的物理隐喻被打破，远程 AI 委托成为主流工作模式

---

