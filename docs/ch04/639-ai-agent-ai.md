# AI 浏览器三条技术路线：侧栏 / Agent / AI 原生

## Ch04.639 AI 浏览器三条技术路线：侧栏 / Agent / AI 原生

> 📊 Level ⭐⭐ | 2.2KB | `entities/ai-native-browser-three-routes-tabbit-meituan-2026.md`

# AI 浏览器三条技术路线：侧栏 / Agent / AI 原生

> **Background**：本文基于机器之心 PRO 会员通讯专题整理。2026 年 6 月美团 GN06 团队发布 AI 原生浏览器 Tabbit 1.0，以此为契机梳理当前 AI 浏览器的三条技术路线与架构特征。

当前 AI 浏览器行业呈现三条并存的技术路线：

**路线一：传统内核 + AI 侧栏** — 以 Edge+Copilot 和 Brave+Leo 为代表。AI 以侧边栏插件或实验性模块接入，主要承担问答、总结、检索任务，未改变浏览器内核的页面加载、权限管理与安全隔离机制。

**路线二：研究/Agent 向浏览器** — 以 Perplexity Comet 和 ChatGPT Atlas 为代表。仍基于 Chromium 内核，但将 AI 从侧栏移入核心模块，具备视觉多模态理解与全局上下文记忆能力，支持跨标签页关联分析。

**路线三：AI 原生浏览器** — 以 Tabbit、Dia、Fellou 为代表。以「Browser + Agent + Workflow」架构将 Agent 调度能力写入浏览器运行时，从底层构建标签页、输入框和智能体。Tabbit 内置 LongCat、DeepSeek、GLM、Kimi 等多模型，支持根据任务类型动态切换。其 Agent 任务成功率在 100 天公测内从 53.1% 提升至 91.8%。

三条路线在架构融合度、模型绑定策略和自动化执行深度三个维度上呈现不同取向。前两条路线延用 Chromium 内核，AI 原生路线则从 Shell 层重构浏览器的运行时架构。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/当-ai-浏览器走向原生ai-侧栏会被吞并还是与之共存.md)

---

