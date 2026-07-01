# Impeccable：把 AI 前端设计变成可检查的工作流 — 33.4k Star 开源项目深度分析

## Ch01.312 Impeccable：把 AI 前端设计变成可检查的工作流 — 33.4k Star 开源项目深度分析

> 📊 Level ⭐⭐ | 13.8KB | `entities/impeccable-frontend-design-skill-harness-vibecoder.md`

# Impeccable：把 AI 前端设计变成可检查的工作流 — 33.4k Star 开源项目深度分析

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/impeccable-frontend-design-skill-harness-vibecoder.md)

## 摘要

Impeccable 是 VibeCoder 整理的 33.4k Star 开源项目（pbakaus/impeccable），把 Claude Code / Codex / Cursor / OpenCode 等 harness 之上叠加一层"前端设计能力层"。它由 4 层架构组成（知识层/命令层/检测层/分发层）、23 个分阶段命令、41 条确定性 UI 反模式检测规则，以及一个浏览器↔源码的 Live 协作协议。核心借鉴价值是把"AI 前端设计"从"相信模型有品味"改成"给模型上下文、给用户命令、给代码检测、给浏览器反馈"四件套。

## 深度分析

### 1. 一句话定位：harness 之上的"设计同事"

Claude Code、Codex、Cursor、OpenCode 这些 harness 负责"读代码、改代码、跑命令"。Impeccable 负责告诉它们"做前端时先读什么上下文、什么设计词汇代表什么动作、哪些 UI 反模式应该被拦住、浏览器里选中的元素如何变成源码里的修改"。类比：Impeccable 是 harness 之上的"设计同事"——给它上下文、命令、检测器、浏览器反馈闭环；底层 agent 只管执行。

### 2. 安装与运行

```bash
npx impeccable skills install
```

之后在支持 skills 的工具里可运行 23 个命令（节选）：
- `/impeccable init` —— 强制先写 `PRODUCT.md` + `DESIGN.md` 才能改 UI（`context.mjs` 输出 `NO_PRODUCT_MD` 拦截）
- `/impeccable critique landing` —— UX 评审
- `/impeccable polish settings` —— 上线前细节
- `/impeccable typeset article page` —— 排版/字体
- `/impeccable harden checkout` —— 错误态/i18n/边界数据/文本溢出
- `/impeccable live` —— 启动浏览器变体协作（最特殊，下面单独讲）

`init` 步骤的关键设计是**上下文门**：没有 PRODUCT.md（产品定位）和 DESIGN.md（设计语言）就不准改 UI。这种"前置文档门"把 AI 的"自由发挥"约束在已经沉淀过的产品上下文里。

### 3. 架构四层

| 层 | 路径 | 职责 |
|---|------|------|
| **L1 知识层** | `skill/SKILL.src.md` | 入口：setup + 通用设计规则 + provider 特定规则 + 23 命令表 + 路由规则 |
| **L2 命令层** | `skill/reference/*.md` | 每个命令一个文件：`polish.md` / `typeset.md` / `harden.md` / `live.md` …… |
| **L3 检测层** | `cli/engine/registry/antipatterns.mjs` | **41 条确定性检测规则**，分 AI tells 与 quality 两类 |
| **L4 分发层** | `scripts/lib/transformers/providers.js` | 同源 SKILL → 编译为 8 家 provider 适配产物 |

**L4 是关键工程**。Claude Code、Codex、Cursor、Gemini、OpenCode、GitHub Copilot、Trae、Rovo Dev 都说"支持 skills"，但目录结构和 frontmatter 字段不同。Impeccable 用 `factory.js` 做编译器：维护一份源文件，编译出 8 份适配产物。这种"同源多端"的模式可推广到任何需要跨 harness 兼容的能力层。

### 4. 23 个命令的 5 阶段分工

| 阶段 | 命令 | 用途 |
|------|------|------|
| **Build** | `init` / `shape` / `craft` / `document` / `extract` | 建上下文 → 定 UX/UI 方向 → 从 brief 到实现 → 提取 DESIGN.md → 收回 token |
| **Evaluate** | `critique` / `audit` | UX 评审（层级/认知负担/情绪/persona/snapshot）vs 工程审计（a11y/性能/响应式/主题/anti-patterns） |
| **Refine** | `polish` / `bolder` / `quieter` / `distill` / `harden` / `onboard` | 细节 / 放大太安全 / 降刺激 / 删复杂度 / 健壮性 / 首次体验 |
| **Enhance** | `animate` / `colorize` / `typeset` / `layout` / `delight` / `overdrive` | 动效 / 配色 / 排版 / 间距节奏 / 记忆点 / 高难视觉（shader/scroll/canvas） |
| **Fix** | `clarify` / `adapt` / `optimize` | UX 文案 / 跨设备 / 加载/渲染/动画/网络/CWV |
| **Live** | `live` | 浏览器变体协作 |

23 个命令覆盖了一个产品界面从"立项 → 评审 → 细化 → 增强 → 修复 → 协作"的全生命周期。Build 阶段的 `init` 是上下文门，Evaluate 阶段的两条线（UX vs 工程）说明评审不能只看美学，还要看 a11y、性能、响应式。

### 5. 检测器：41 条确定性规则

```bash
npx impeccable detect src/
npx impeccable detect index.html
npx impeccable detect https://example.com
npx impeccable detect --json .
```

关键设计点：

- **退出码语义**：0 干净 / 2 有问题（**CI 友好**）
- **复用**：CLI、Chrome 扩展、skill 命令三处共用同一套规则
- **多 engine**：`build-browser-detector.js` 把 browser-safe detector 拼成 IIFE，扩展塞进 DevTools panel

实测 fixture：`node cli/bin/cli.js detect --json tests/fixtures/antipatterns` 返回大量 findings，退出码 2。41 条规则分 AI tells（生成痕迹）和 quality（质量缺陷）两类。

### 6. Live 模式：小型的浏览器协作协议

这是 Impeccable 最特殊的部分——在浏览器里做"变体协作"：

1. `live.mjs` 检查 `.impeccable/live/config.json`，启动或复用本地 server，注入脚本
2. 输出 server port、token、page files、PRODUCT/DESIGN context
3. `live-server.mjs` 走三条通信线：
   - **SSE** 推事件给浏览器
   - **HTTP POST** 接浏览器事件
   - **Agent long-poll** 拉待处理事件
4. `live-browser.js` 负责：选元素 → 显示底部工具条 → 展示变体 → accept/discard
5. 接受变体后还有 wrap / accept / manual edit applier / Svelte component adapter 等脚本，把浏览器选择映射回真实文件

> 维护难点：只要涉及 React、Svelte、Vite、CSP、HMR，source mapping 就会很细。

Live 模式的价值是把"AI 输出"从单向的"修改文件"变成双向的"人类在浏览器里选变体 → AI 落地到源码"。这接近 v0 / Bolt 这类产品的核心交互模式，但开源。

### 7. 文档 vs 代码的小漂移

实测仓库时发现的几个不一致：

- README 写 "27 deterministic rules / 24 detector issues"，实测 **41 条**
- README 提 "7 个 domain reference"（typography、color-and-contrast、motion-design …），源码里实际是 23 个命令 reference + brand/product register + interaction-design
- Chrome 扩展 panel 里部分 fix suggestion 仍指向 `arrange`，当前 23 个命令里**没有**此命令，应映射到 `layout`

不影响核心判断，只说明项目发布节奏很快。

### 8. 核心借鉴价值：四件套

把"AI 前端设计"从"相信模型有品味"改成四件套：

- **上下文门**（`PRODUCT.md`/`DESIGN.md` 必须先有）
- **命令词汇**（23 个稳定动词）
- **反模式检测**（41 条 CI 规则）
- **Live 变体闭环**（浏览器↔源码双向）

适合长期让 AI 维护同一产品界面的团队。短期 demo 价值有限。

### 9. 仓库元数据（2026-06-04 验证）

- Repo: `pbakaus/impeccable`
- Stars: **34,108**
- Created: 2025-11-16
- Last push: 2026-06-03
- License: Apache-2.0
- 主语言: JavaScript
- 配套 npm: `impeccable`（含 CLI、`skills install`、detector）

## 实践启示

1. **AI 前端设计需要"上下文门"，不是更长 prompt**：先用 `init` 强制写 PRODUCT.md + DESIGN.md，再让 agent 改 UI。这条规则可以推广到任何设计密集型场景（品牌、视觉规范、可访问性基线）。

2. **23 个命令 vs 模糊 prompt 的本质区别**：命令词汇是稳定动词（polish / harden / audit / typeset），是有穷集合；prompt 是自由文本，agent 每次理解都可能偏移。把设计动作收敛成 23 个动词 + 每个动词一个 reference 文件，是工程化的关键。

3. **反模式检测必须 CI 化**：41 条确定性规则、退出码语义（0/2）、CLI 与 Chrome 扩展与 skill 命令共用——这套工程思路可以照搬到任何"AI 生成 + 确定性校验"的场景（代码、文档、设计、SQL）。

4. **同源多端编译器是 harness 生态的必备基础设施**：8 家 provider（Claude Code / Codex / Cursor / Gemini / OpenCode / Copilot / Trae / Rovo Dev）的目录结构和 frontmatter 字段都不一样。维护一份源文件、编译出多份适配产物的模式，应该作为任何跨 harness 兼容层（skill / MCP / agent template）的标准实现。

5. **Live 模式给"AI 输出"加上人类反馈闭环**：浏览器里选变体 → SSE/HTTP/long-poll 三线通信 → 接受后映射回源码。这种"双向协作"比纯单向"AI 生成 → 人工审查"的成本低一个数量级，是 v0 / Bolt 模式的开源实现。

## 相关实体

- [两万字详解Claude Code源码核心机制](ch03/074-claude-code.md)
- [你不知道的 Agent原理架构与工程实践 V2](ch03/044-agent.md)
- [龙虾装上了可以用来干啥分享下我的 Openclaw 多智能体团队搭建经验 V2](ch11/210-openclaw.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](ch11/210-openclaw.md)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](ch03/044-agent.md)
- [构建基于多智能体架构的深度思考交易系统 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/构建基于多智能体架构的深度思考交易系统-v2.md)
- [Agent Reliability Engineering Skillify Continuous Improvement](ch04/245-skill.md)
- [Agent Skill Writing Evaluation](ch04/245-skill.md)
- [Agent Skill Writing](ch04/245-skill.md)
- [Anthropic 95Pct Data Analysis Jiagoux Data Level Harness 20260606](ch01/707-anthropic.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/impeccable-frontend-design-skill-harness-vibecoder.md)
- [我把 claude design 做成了 skill，人人都能成为顶级网站设计师](ch04/245-skill.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/data-infrastructure.md)

---

