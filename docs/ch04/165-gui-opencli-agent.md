# 浏览器自动化：从 GUI 到 OpenCLI — Agent 时代的可调用性竞争

## Ch04.165 浏览器自动化：从 GUI 到 OpenCLI — Agent 时代的可调用性竞争

> 📊 Level ⭐⭐ | 12.2KB | `entities/opencli-browser-automation-jingxing.md`

# 浏览器自动化：从 GUI 到 OpenCLI — Agent 时代的可调用性竞争

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/opencli-browser-automation-jingxing.md)

## 摘要

大淘宝技术明径 2026-05-22 文章。文章提出放弃不稳定的前端 UI 自动化操作，转而解析并复现底层 API 请求。配套开源 `@jackwener/opencli` 提供了 5 级认证策略（public/cookie/header/store-action/ui）和 6 步 Agent 探索工作流（打开 → 观察 → 抓包 → 模拟交互 → 二次抓包 → 验证 API）。核心观点：未来的软件竞争维度不只是界面好不好看，更是谁更容易被 Agent 理解、调用、验证，再接进工作流。

## 深度分析

### 1. 为什么 Agent 操控浏览器路不好走

大量业务系统跑在浏览器里——运营配置后台、工单处理系统、发布运维平台。如果能让这些系统自动运转，对提效和智能化运营的价值不言而喻。但 Agent 想操控浏览器，路并不好走：

- DOM 结构脆弱，前端改版就坏
- 验证码、CAPTCHA、动态 token 拦截
- 异步加载 + 懒加载，元素定位不稳定
- 视觉差异（分辨率、DPR、字体）影响点击精度

OpenCLI 的核心想法很简单：**不跟网页界面较劲，直接抓它背后的 API**。浏览器里看到的数据，本质上都是前端从某个接口拿回来的。把这个接口找出来、把请求复现出来，比点按钮靠谱得多。

### 2. 快速上手

```bash
npm install -g @jackwener/opencli
```

直接使用：

```bash
opencli list               # 查看所有命令
opencli list -f yaml       # 以 YAML 列出所有命令
opencli hackernews top --limit 5  # 公共 API，无需浏览器
opencli bilibili hot --limit 5   # 浏览器命令
opencli zhihu hot -f json        # JSON 输出
opencli zhihu hot -f yaml        # YAML 输出
```

CLI 是 Agent 最喜欢的"执行面"——命令、参数、返回值、失败原因。

### 3. AI Agent 探索工作流

| 步骤 | 工具 | 做什么 |
|------|------|-------|
| 0. 打开浏览器 | `browser_navigate` | 导航到目标页面 |
| 1. 观察页面 | `browser_snapshot` | 观察可交互元素（按钮/标签/链接） |
| 2. 首次抓包 | `browser_network_requests` | 筛选 JSON API 端点，记录 URL pattern |
| 3. 模拟交互 | `browser_click` + `browser_wait_for` | 点击"字幕""评论""关注"等按钮 |
| 4. 二次抓包 | `browser_network_requests` | 对比步骤 2，找出新触发的 API |
| 5. 验证 API | `browser_evaluate` | `fetch(url, {credentials:'include'})` 测试返回结构 |
| 6. 写代码 | — | 基于确认的 API 写适配器 |

这条流程的本质是：**先用浏览器模拟用户行为，触发网络请求，再从 Network 面板里捞出 API，最后用 `fetch` 直接复现**。一旦 API 被复现，后续就不需要浏览器。

### 4. 懒加载机制：必须主动探索

> **你（AI Agent）必须通过浏览器打开目标网站去探索！**
> 不要只靠 `opencli explore` 命令或静态分析来发现 API。
> 你拥有浏览器工具，必须主动用它们浏览网页、观察网络请求、模拟用户交互。

很多 API 是**懒加载**的（用户必须点击某个按钮/标签才会触发网络请求）。字幕、评论、关注列表等深层数据不会在页面首次加载时出现在 Network 面板中。这条警告很关键——它说明静态抓取/分析工具不够。

### 5. 五级认证策略

OpenCLI 提供 5 级认证策略。使用 `cascade` 命令自动探测：

```bash
opencli cascade https://api.example.com/hot
```

策略决策树：

| Tier | 策略 | 判定条件 |
|------|------|----------|
| 1 | public（公开 API，不需要浏览器） | 直接 `fetch(url)` 能拿到数据 |
| 2 | cookie（最常见，evaluate 步骤内 fetch） | `fetch(url, {credentials:'include'})` 带 Cookie 能拿到 |
| 3 | header（如 Twitter ct0 + Bearer） | 加上 Bearer / CSRF header 后能拿到 |
| 4 | intercept（Store Action + XHR 拦截） | 网站有 Pinia/Vuex Store |
| 5 | ui（UI 自动化，最后手段） | 以上都不行 |

五级策略的工程意义是**渐进式降级**：从最简单的公开 API 开始，能用 cookie 就别用 header，能用 header 就别拦截 Store，能拦截就别碰 UI。UI 是最后手段 [raw/articles/opencli-browser-automation-jingxing.md:71-85]。

### 6. 适配器：YAML vs TypeScript

| 形式 | 何时用 |
|------|--------|
| TypeScript (`src/clis/<site>/<name>.ts`) | pipeline 里有 evaluate 步骤（内嵌 JS 代码） |
| YAML (`src/clis/<site>/<name>.yaml`) | 纯声明式（navigate + tap + map + limit） |

保存即自动动态注册。

### 7. 自动生成 CLI：AI 原生流程

1. **探索与分析**：`explore` 深度抓取页面、自动滚动、拦截网络请求、识别框架与状态管理、推断能力与推荐参数
2. **策略选择**：根据鉴权头/签名等特征自动选择策略（public/cookie/header/intercept/store-action）
3. **适配器合成**：`synthesize` 基于探索产物生成候选 YAML，自动模板化 URL、字段映射与参数默认值
4. **测试与验证**：`generate` 串联探索→合成→注册→验证，支持目标化选择与回退策略

这条"探索→合成→注册→验证"的循环，本质上是把"写 CLI"从手工活变成 AI 自动产物。

### 8. 未来软件竞争维度：从界面到可调用性

> 未来的软件，不会只服务人，也会服务 Agent。
> 以前我们评价一个 SaaS，看的是界面顺不顺、按钮好不好点。但 Agent 不会欣赏你的按钮做得多圆。它只在乎一件事：能不能稳定调用你。
> GUI 是给人用的。API 是能力底座。而 Agent 最喜欢的，其实是更清晰的执行面：命令、参数、返回值、失败原因。
> 未来软件可能会多一个新竞争维度：不是谁页面更好看。而是谁更容易被 Agent 理解、调用、验证，再接进工作流。唯有如此，才更有机会成为下一代工作流里的基础节点。
> **过去的软件竞争界面，未来的软件竞争可调用性**。

这是文章最有价值的命题：把"软件竞争"从 GUI 时代拉到 Agent 时代。判断标准不再是"界面是否美观"，而是"API 是否稳定、文档是否完整、失败原因是否清晰、是否能被 Agent 自动发现和验证"。

## 实践启示

1. **API > UI：自动化优先抓接口，不是点按钮**：浏览器自动化的稳定性根源是 API 而不是 DOM。先用浏览器触发请求，再从 Network 面板捞 API，最后用 `fetch` 复现——一旦 API 被复现，后续就不需要浏览器。

2. **5 级认证策略是"渐进式降级"的标准范式**：public → cookie → header → store-action → ui，从最简到最复杂逐级尝试。这套决策树可以推广到任何需要"自动选择调用方式"的场景（爬虫、ETL、agent tool selection）。

3. **懒加载 API 必须主动触发才能发现**：静态分析工具看不到评论区、关注列表这些懒加载数据。Agent 必须拥有浏览器工具并主动浏览——这条原则否定了"零浏览器就能搞定一切"的幻想。

4. **CLI 是 Agent 最好的执行面**：命令、参数、返回值、失败原因——这四个字段是 Agent 调用工具的最小契约。任何"被 Agent 使用"的工具都应该提供 CLI，而不只是 GUI。

5. **未来 SaaS 竞争维度是可调用性**：评价一个 SaaS 不只是界面好不好看，更是 API 稳定不稳定、文档全不全、错误原因为不清不清楚、Agent 能不能自动发现。这条标准对所有 to-B 软件都适用。

## 相关实体

- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](ch04/503-agent.md)
- [Karpathy Vibe Coding Agentic Engineering](ch04/123-karpathy-vibe-coding-agentic-engineering.md)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](ch04/503-agent.md)
- [两万字详解Claude Code源码核心机制](ch03/073-claude-code.md)
- [你不知道的 Agent原理架构与工程实践 V2](ch04/503-agent.md)
- [构建基于多智能体架构的深度思考交易系统 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/构建基于多智能体架构的深度思考交易系统-v2.md)
- [Agent Reliability Engineering Skillify Continuous Improvement](ch04/245-skill.md)
- [Anthropic 95Pct Data Analysis Jiagoux Data Level Harness 20260606](ch01/707-anthropic.md)
- [Codex Goal Source Code Deep Dive](ch09/041-codex-goal.md)
- [Impeccable Frontend Design Skill Harness Vibecoder](ch04/245-skill.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/opencli-browser-automation-jingxing.md)
- [how developers can build agentic agreement workflows on docu](ch04/272-how-developers-can-build-agentic-agreement-workflows-on-docu.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/reinforcement-learning-rlhf.md)

---

