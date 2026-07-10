# How my non-engineering team at Sentry learned to ship

## Ch01.476 How my non-engineering team at Sentry learned to ship

> 📊 Level ⭐⭐ | 9.6KB | `entities/how-my-non-engineering-team-at-sentry-learned-to-ship-20260606.md`

# How my non-engineering team at Sentry learned to ship

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/how-my-non-engineering-team-at-sentry-learned-to-ship-20260606.md)

## 摘要

Sentry 增长团队成员 Matt 2026 年 6 月在 "Technically" newsletter 发表的实战复盘：原本被 CMS 锁住的市场营销站点，在接入 Claude Code 后被一个非工程团队（作者本人 4 个月前还不会写代码）在 2.5 名开发者的 2 个月内把约 2500 个页面迁移为 Git 仓库中的 Markdown 与代码，并同时把框架从 Gatsby 换成 Astro。真正的驱动力不是降本，而是"让 agent 能完整地操作整个站点"——CMS 把站点切成两半，一半能被 agent 秒级更新，另一半完全触不可及，这种不对称日益难以忍受。文章是 CMS + agent 时代组织级 web 团队转型的典型案例。

## 深度分析

### 触发点：CMS 不对称成为 velocity 杀手

Matt 第一次打开 Claude Code，让 agent 扫描站点找"内链薄弱"页面并自动开 PR。几分钟内，agent 就开始批量修复——但随后撞上了 CMS 这堵墙："能直接看到代码的页面（GitHub 里的部分）可以 18 页一次 PR 一把搞定；锁在 CMS 里的页面（核心博客等）一行都动不了。"

这种"半个站点可编程 + 半个站点不可编程"的不对称才是迁移的真正原因。成本是次要因素——Cursor 之前一年的 CMS 账单约 5.7 万美元，Lee Robinson 把 cursor.com 从 headless CMS 迁回 Markdown 只花了 260 美元的 AI tokens。

### 迁移战果

- **规模**：约 2500 个页面、**2.5 名开发者 2 个月** 完成迁移；Eli（Sr. Growth Software Engineer）写了完整的技术 playbook。
- **顺序**：先文档与营销页（最容易模板化），再博客内容，最后最复杂的交互式页面。CMS 留 free tier 存 legacy 内容做"软切换"。
- **框架切换**：Gatsby → Astro，构建时间从 14 分钟降到 < 6 分钟；上线 Marketo form cache 后进一步降到 < 4 分钟，按每天 ~95 次构建估算每天节省 ~15.8 构建小时。
- **模板化**：约 200 个定制页面被整合到 **3 个模板**，代码库大幅简化、对 coding agent 更友好。
- **脚本与测试**：迁移脚本（从 Contentful 拉内容到 Markdown）大部分由 Claude Code 写；Playwright 视觉回归测试也曾让 Claude 在旧 Gatsby 站点上跑。
- **稳定性**：broken staging builds 下降 ~95%，Web Vitals 分数从 89 升到 97（主要靠砍掉构建期外部 API 调用）。

### 增量产出（迁移后 4 个月）

- **147 个页面** 在 2 个 PR 里被改（Screaming Frog 爬虫发现的链接问题）。
- **50 个遗留 blog redirects** 约 5 分钟清完——以前是个无人认领的 backlog ticket。
- **116 个内部链接改进 PR**，由作者自建的 hub-and-spoke 工具（[GitHub: Matth3nd3rson/hub-and-spoke-seo](https://github.com/Matth3nd3rson/hub-and-spoke-seo)）驱动，作为 Claude Code skill 通过 MCP 从 Ahrefs 拉 authority 数据。
- **10 个页面** 在产品发布和 A/B 测试结论当天更新或新建。
- **11 个 A/B 测试** 并发运行，其中一个新 solutions page 下午完成 prototype——以前每个都曾是跨职能项目请求。

### 关键基础设施：page-type Skills

Sentry 给每种页面类型写了 Skills（AI 指令文件）：landing pages、product pages、solutions、blog posts、cookbook recipes、workshop templates。每个 Skill 编码了页面结构、SEO 要求、品牌规范、组件库。

当团队成员让 Claude 创建新 landing page 时：

1. Skill 主动"采访"用户收集必填字段（slug、display name、SEO metadata、hero copy）。
2. 生成符合页面类型 schema 的结构化 Markdown/JSON 文件。
3. 直接开 PR。

> This is the same consistency our CMS templates used to give us, except the agent actually follows the rules (humans are less observant than agents to pedantic instructions).

### Sentry Cookbook：从"长博客"到"可执行结构化内容"

观察到传统博客的有机搜索流量连续两年下降，而 LLM 与 AI Overviews 持续引用结构化、可执行内容。Sentry 推出了 **Sentry Cookbook**——以"可复制粘贴的代码 + 短而结构化的解说"为单元的食谱式内容。Cookbook 把"内容为 SEO 服务"与"内容为用户服务"的传统对立折叠起来：开发者与 LLM 都需要结构化、短小、code-first 的答案。

### 不顺利的部分（诚实清单）

- **设计保真度比数据迁移慢**：Anita Kirkovska 在 Vellum 写过同样的坑。把内容从 Contentful 拉成 Markdown 是脚本工作；让新 Astro 页面像素级匹配旧 Gatsby 页面才是真正慢的部分——"Claude Code 擅长产出功能代码；1:1 匹配既有设计仍然很难"。
- **人因失误**：迁移期间有人在表单上加了一条"看似无害"的 email 校验规则，几天内把一个关键转化指标砸了才被发现。
- **构建基础设施是被低估的失败源**：Marketo cache 后期才上，是项目最高杠杆的改动之一——不是因为它加速构建（虽然确实加速了），而是因为它消除了"过去几年一直在悄悄绕过的"整类故障。"值得在你'需要'之前就做。"
- **学习曲线真实但比预想小**：作者 4 个月前还不会写代码，现在团队多人能开 PR。第一个月会明显慢于预期，要预先规划这个窗口。

### 未来方向

- **自治工作流**：已上线一个把特定 Linear ticket 路由给 Claude 的工作流（ticket 一入，agent 一接，PR 一出）。目前对"小、定义良好"的修复（坏链、typo、blurb 更新）效果最好；agent-ready vs. human-in-the-loop 的边界还在探索。
- **AI code review**：让 agent 触碰 production 的最大风险是"质量控制全部压在 reviewer 身上，reviewer 在 50 处改动里会漏东西"。

### 关联实体

- [存之有序治之有矩Agent 记忆系统的工程实践与演进](../ch03/045-agent.html)
- [两万字详解Claude Code源码核心机制](../ch03/075-claude-code.html)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](../ch05/039-agent-harness.html)
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](../ch04/230-agentops-operationalize-agentic-ai-at-scale-with-amazon-bed.html)
- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](ch01/1113-scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on.html)
- [Nvidia Isaac Lab Sagemaker Robot Rl Humanoid](https://github.com/QianJinGuo/wiki/blob/main/entities/nvidia-isaac-lab-sagemaker-robot-rl-humanoid.md)
- [DDoSing Software Delivery Pipelines](ch01/950-20.html)
- [Unexpected lessons from an AI-assisted prototyping experiment](../ch05/081-ai.html)

## 实践启示

1. **CMS × Agent 时代的不对称** — 任何"半结构化 + 半 CMS"的组合都会成为 agent 时代 velocity 的瓶颈；迁移到 git-as-CMS 是务实的解法之一。
2. **Skills 即新模板** — 把 CMS 模板里"编码"的那部分知识（结构、SEO、品牌、组件）沉淀为 AI agent Skills，比传统 template 更稳定——agent 比人更严格地遵守细则。
3. **Cookbook 式内容** — 长博客的有机流量下滑 + LLM/AI Overview 偏好结构化可执行内容，正在推动内容形态从"长文 SEO 文"向"代码优先的结构化食谱"转型。
4. **基础设施前置** — 把外部 API 从构建期移除（用 cache/快照代替）通常是高 ROI 改动，不必等问题爆发再做。
5. **设计保真度 ≠ 功能代码** — 1:1 复刻既有设计是当前 coding agent 的明显短板，迁移项目要在排期上为它预留足够时间。
6. **风险护栏** — 让 agent 触 production 的最大风险是 review 阶段的疲劳；引入 AI code review 是下一步关键投资。

## 原文链接

- [http://read.technically.dev/p/how-matt-learned-to-ship](http://read.technically.dev/p/how-matt-learned-to-ship)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/how-my-non-engineering-team-at-sentry-learned-to-ship-20260606.md)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/vision-multimodal.md)

---

