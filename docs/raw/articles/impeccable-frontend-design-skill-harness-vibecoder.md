---
title: "Impeccable：把 AI 前端设计变成可检查的工作流 — 33.4k Star 开源项目深度分析"
source_url: "https://mp.weixin.qq.com/s/zbXBK9EpsGEqPNS0f6b7Cw"
publish_date: 2026-06-04
tags: [wechat, article, agent-skill, harness, frontend, design-system, antipattern, cli, chrome-extension, code-review]
review_value: 9
review_confidence: 9
review_recommendation: strong
sha256: 84581e35d89b36d76be473a0941d76a5b3cff27df6be3bedf8ea6b6778dc42b1
---
# Impeccable：把 AI 前端设计变成可检查的工作流
> 作者：VibeCoder · 整理：Hermes Agent
> 原文：https://mp.weixin.qq.com/s/zbXBK9EpsGEqPNS0f6b7Cw
> GitHub：https://github.com/pbakaus/impeccable （34.1k ⭐ · Apache-2.0 · 主力 JavaScript）

## 一句话定位
**Impeccable = "AI 前端设计的设计能力层"。** Claude Code / Codex / Cursor / OpenCode 这些 harness 负责"读代码、改代码、跑命令"，Impeccable 负责告诉它们"做前端时先读什么上下文、什么设计词汇代表什么动作、哪些 UI 反模式应该被拦住、浏览器里选中的元素如何变成源码里的修改"。

> 类比：Impeccable 是 harness 之上的"设计同事"——给它上下文、命令、检测器、浏览器反馈闭环；底层 agent 只管执行。

## 安装与运行
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

## 架构四层
| 层 | 路径 | 职责 |
|---|---|---|
| **L1 知识层** | `skill/SKILL.src.md` | 入口：setup + 通用设计规则 + provider 特定规则 + 23 命令表 + 路由规则 |
| **L2 命令层** | `skill/reference/*.md` | 每个命令一个文件：`polish.md` / `typeset.md` / `harden.md` / `live.md` …… |
| **L3 检测层** | `cli/engine/registry/antipatterns.mjs` | **41 条确定性检测规则**，分 AI tells 与 quality 两类 |
| **L4 分发层** | `scripts/lib/transformers/providers.js` | 同源 SKILL → 编译为 8 家 provider 适配产物 |

**L4 是关键工程**。Claude Code、Codex、Cursor、Gemini、OpenCode、GitHub Copilot、Trae、Rovo Dev 都说"支持 skills"，但目录结构和 frontmatter 字段不同。Impeccable 用 `factory.js` 做编译器：维护一份源文件，编译出 8 份适配产物。

## 23 个命令的 5 阶段分工
| 阶段 | 命令 | 用途 |
|---|---|---|
| **Build** | `init` / `shape` / `craft` / `document` / `extract` | 建上下文 → 定 UX/UI 方向 → 从 brief 到实现 → 提取 DESIGN.md → 收回 token |
| **Evaluate** | `critique` / `audit` | UX 评审（层级/认知负担/情绪/persona/snapshot）vs 工程审计（a11y/性能/响应式/主题/anti-patterns） |
| **Refine** | `polish` / `bolder` / `quieter` / `distill` / `harden` / `onboard` | 细节 / 放大太安全 / 降刺激 / 删复杂度 / 健壮性 / 首次体验 |
| **Enhance** | `animate` / `colorize` / `typeset` / `layout` / `delight` / `overdrive` | 动效 / 配色 / 排版 / 间距节奏 / 记忆点 / 高难视觉（shader/scroll/canvas） |
| **Fix** | `clarify` / `adapt` / `optimize` | UX 文案 / 跨设备 / 加载/渲染/动画/网络/CWV |
| **Live** | `live` | 浏览器变体协作（见下） |

## 检测器：41 条确定性规则
```bash
npx impeccable detect src/
npx impeccable detect index.html
npx impeccable detect https://example.com
npx impeccable detect --json .
```
- **退出码语义**：0 干净 / 2 有问题（**CI 友好**）
- **复用**：CLI、Chrome 扩展、skill 命令三处共用同一套规则
- **多 engine**：`build-browser-detector.js` 把 browser-safe detector 拼成 IIFE，扩展塞进 DevTools panel

实测 fixture：`node cli/bin/cli.js detect --json tests/fixtures/antipatterns` 返回大量 findings，退出码 2。

## Live 模式：小型的浏览器协作协议
1. `live.mjs` 检查 `.impeccable/live/config.json`，启动或复用本地 server，注入脚本
2. 输出 server port、token、page files、PRODUCT/DESIGN context
3. `live-server.mjs` 走三条通信线：
   - **SSE** 推事件给浏览器
   - **HTTP POST** 接浏览器事件
   - **Agent long-poll** 拉待处理事件
4. `live-browser.js` 负责：选元素 → 显示底部工具条 → 展示变体 → accept/discard
5. 接受变体后还有 wrap / accept / manual edit applier / Svelte component adapter 等脚本，把浏览器选择映射回真实文件

> 维护难点：只要涉及 React、Svelte、Vite、CSP、HMR，source mapping 就会很细。

## 文档 vs 代码的小漂移
- README 写 "27 deterministic rules / 24 detector issues"，实测 **41 条**
- README 提 "7 个 domain reference"（typography、color-and-contrast、motion-design …），源码里实际是 23 个命令 reference + brand/product register + interaction-design
- Chrome 扩展 panel 里部分 fix suggestion 仍指向 `arrange`，当前 23 个命令里**没有**此命令，应映射到 `layout`

不影响核心判断，只说明项目发布节奏很快。

## 核心借鉴价值
**把"AI 前端设计"从"相信模型有品味"改成"给模型上下文、给用户命令、给代码检测、给浏览器反馈"四件套**：
- 上下文门（`PRODUCT.md`/`DESIGN.md` 必须先有）
- 命令词汇（23 个稳定动词）
- 反模式检测（41 条 CI 规则）
- Live 变体闭环（浏览器↔源码双向）

适合长期让 AI 维护同一产品界面的团队。短期 demo 价值有限。

## 仓库元数据（2026-06-04 验证）
- Repo: `pbakaus/impeccable`
- Stars: **34,108**
- Created: 2025-11-16
- Last push: 2026-06-03
- License: Apache-2.0
- 主语言: JavaScript
- 配套 npm: `impeccable`（含 CLI、`skills install`、detector）
