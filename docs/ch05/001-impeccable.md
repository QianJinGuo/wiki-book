# Impeccable：大规模自动化测试框架

## Ch05.001 Impeccable：大规模自动化测试框架

> 📊 Level ⭐ | 13.5KB | `entities/impeccable.md`

# Impeccable
> "The design language that makes your AI harness better at design." —— pbakaus/impeccable 官方描述

`pbakaus/impeccable` 是当前规模最大的 **AI 前端设计 skill 项目**（截至 2026-06-04：**34,108 ⭐**，Apache-2.0，主语言 JavaScript）。它把"前端设计经验"打包成可安装的 skill，配合 23 个命令、41 条确定性检测规则、CLI、Chrome 扩展和 live 浏览器变体模式。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/impeccable-frontend-design-skill-harness-vibecoder.md)

## 它解决的问题
AI 编码助手做前端时，代码能跑只是第一步——更麻烦的是页面会"一眼看出 AI 味"：
- 紫蓝渐变
- 卡片套卡片
- 所有文字都用 Inter
- 灰字压在彩色背景上
- 每个 section 都有一个小小的 uppercase eyebrow

这些单独看不一定错，叠在一起就很像模板。Impeccable 把"反 AI 模板审美"工程化。

## 架构：四层叠加在 harness 之上
| 层 | 路径 | 职责 |
|---|---|---|
| **L1 知识层** | `skill/SKILL.src.md` | 入口：setup + 通用设计规则 + provider 特定规则 + 23 命令表 + 路由规则 |
| **L2 命令层** | `skill/reference/*.md` | 每命令一文件：`polish.md` / `typeset.md` / `harden.md` / `live.md` |
| **L3 检测层** | `cli/engine/registry/antipatterns.mjs` | 41 条确定性规则，分 AI tells 与 quality 两类 |
| **L4 分发层** | `scripts/lib/transformers/providers.js` | 同源 SKILL → 编译为 8 家 provider 适配产物 |

**L4 是关键工程**：每个 agent 工具（Claude Code / Codex / Cursor / Gemini / OpenCode / GitHub Copilot / Trae / Rovo Dev）都说自己支持 skills，但目录结构和 frontmatter 字段不同。Impeccable 用 `factory.js` 当编译器，**一份源文件，8 份适配产物**。

## 上下文门：`init` 强制先写 PRODUCT.md + DESIGN.md
```bash
npx impeccable skills install
/impeccable init   # 必须先跑
/impeccable critique landing
/impeccable polish settings
/impeccable typeset article page
/impeccable harden checkout
/impeccable live
```
- `init` 不让 agent 上来就改 UI
- `context.mjs` 会输出 `NO_PRODUCT_MD` 拦截，要求先建产品/用户/品牌性格/设计原则
- 门槛朴素但有效——把"凭品味"改成"凭上下文"

## 23 个命令的 5 阶段分工
| 阶段 | 命令 |
|---|---|
| **Build** | `init` / `shape` / `craft` / `document` / `extract` |
| **Evaluate** | `critique` / `audit`（UX 评审 vs 工程审计） |
| **Refine** | `polish` / `bolder` / `quieter` / `distill` / `harden` / `onboard` |
| **Enhance** | `animate` / `colorize` / `typeset` / `layout` / `delight` / `overdrive` |
| **Fix** | `clarify` / `adapt` / `optimize` |
| **Live** | `live`（浏览器变体协作） |

`audit` 走工程维度（a11y/性能/响应式/主题/anti-patterns），`critique` 走 UX 维度（层级/认知负担/情绪/persona），两者都会保存 snapshot 供对比。

## 检测器：41 条 CI 友好规则
```bash
npx impeccable detect src/
npx impeccable detect index.html
npx impeccable detect https://example.com
npx impeccable detect --json .
```
- **退出码语义**：0 干净 / 2 有问题（**CI-friendly**）
- **多 engine**：HTML 文件走静态 HTML/CSS；JSX/TSX/CSS 走正则+文本分析；URL 走 Puppeteer
- **三处共用**：CLI、Chrome DevTools 扩展、skill 命令共用同一套规则
- `build-browser-detector.js` 把 browser-safe detector 拼成 IIFE，扩展塞进 DevTools panel

> 这把"反模式"从模型临场审美变成了**机器可检查的事实**。

## Live 模式：浏览器↔源码双向协议
最不像普通 skill 的命令。流程：
1. `live.mjs` 启动或复用本地 helper server，注入脚本
2. `live-server.mjs` 走三条通信线：
   - **SSE** 给浏览器推事件
   - **HTTP POST** 接浏览器事件
   - **Agent long-poll** 拉待处理事件
3. `live-browser.js` 负责：选元素 → 底部工具条 → 展示变体 → accept/discard
4. 接受后还要走 wrap / accept / manual edit applier / Svelte component adapter，把选择映射回真实文件

维护难点：React / Svelte / Vite / CSP / HMR 都会让 source mapping 变得很细。

## 文档漂移
- README 写 "27 rules / 24 issues"，实测 **41 条**
- README 提 "7 个 domain reference"（typography/contrast/motion …），源码实际是 23 命令 + brand/product register + interaction-design
- Chrome 扩展 panel 部分 fix suggestion 仍指向 `arrange`，应映射到 `layout`

不影响核心判断，只说明发布节奏快于文档。

## 在 harness 栈中的位置
```
[Impeccable]         ← 设计能力层（上下文门、命令、检测、Live 反馈）
[Claude Code / Codex / Cursor / OpenCode]   ← 执行层
[LLM]
```
- 把它放在 harness 的**上层工具箱**看
- 底层 agent 负责执行，Impeccable 让执行过程更像"有设计系统约束的前端同事"

## 相关对照
- [Agent Skill 编写指南](../ch04/260-agent-skill.html) —— 通用 skill 格式 + 渐进式披露
- [Agent Harness 架构](ch05/038-agent-harness.html) —— 7 层 harness 模型
- [Agent Skills 综合调研](../ch04/376-agent-skills.html) —— skill 系统全景
- [Skills Refiner 设计质量评估框架](../ch03/069-skills.html)
- [Agentic Design System 演化](../ch01/011-agentic-design-system-from-chatbot-to-orchestration.html)

## 关键启示（harness 设计层面）
1. **多 provider 分发是工程问题，不是文档问题** —— 写编译器比写适配指南更稳
2. **反模式必须可检查**，不能依赖 LLM 自觉 —— 41 条规则 + 退出码 2 才是工程化
3. **上下文门是最便宜的护栏** —— `init` 强制 PRODUCT/DESIGN，胜过 prompt
4. **浏览器侧反馈需要专用协议**（SSE + POST + long-poll 三通道），不是 LLM 调用
5. **命令词汇比"自然语言意图"更稳定** —— 23 个动词 > 任意长 prompt

## Anomaly 创始人的外部印证：6 大 AI 前端失败类别

[Anomaly Innovations 创始人](https://raw/articles/impeccable-anomaly-vibe-design-vs-vibe-coding)（37 年设计经验）在评论 Impeccable 时提出 **6 大 AI 前端失败类别**——这 6 类与本项目 41 条检测规则**高度重合**，印证了"经验分类 ≈ 规则集"的同构关系：

| 失败类别 | 典型问题 | 对应 Impeccable 检测器 |
|---|---|---|
| **色彩理论** | 紫蓝渐变、对比度不足、品牌色乱搭 | `colorize` 命令 + 配色 token 检测 |
| **可访问性** | 键盘导航、ARIA、screen reader | `audit` 命令（a11y 维度）+ axe-core |
| **排版细节** | 字距、行高、字号节奏 | `typeset` 命令 + typography scale 规则 |
| **视觉层次** | F/Z-pattern 缺失、CTA 不突出 | `critique` 命令（UX 维度） |
| **动效过度** | 缓动曲线怪、时长失控 | `animate` 命令 + motion token 限制 |
| **一致性** | 组件风格跳跃、间距不统一 | `audit` + design token drift 检测 |

**核心论点**："Code is correct or not, design is good or not. The same workflow can't serve both." —— vibe coding 对软件工程有效（代码对错分明），但**对设计无效**（设计好坏分明）。这就是为什么前端需要 Impeccable 这类**结构化 skill**（命令 + 上下文 + 检测器），而不仅仅是 CLAUDE.md 里的硬规则。

## 深度分析

1. **L4 多 provider 分发是 Impeccable 最重要的工程贡献**：23 个命令要跑在 8 个不同的 agent 工具上，每家目录结构和 frontmatter 字段都不同。Impeccable 用 `factory.js` 做编译器，一份源文件编译出 8 份适配产物——这是「写编译器比写适配指南更稳」的活教材

2. **上下文门是设计质量的最便宜护栏**：很多 design skill 失败的原因是 agent 上来就改 UI，凭空生成没有上下文的代码。Impeccable 的 `init` 命令强制要求 PRODUCT.md + DESIGN.md 先存在，`context.mjs` 输出 `NO_PRODUCT_MD` 拦截，靠「先强迫建立上下文」而不是「后置规则检查」来保证设计决策有据可依

3. **「命令词汇 > 自然语言意图」是 skill 设计核心洞察**：自然语言意图会随模型上下文漂移，而 23 个动词命令（polish、typeset、harden、live）代表稳定的设计操作语义。命令词汇表比「请优化这个页面的视觉层次」更稳定可执行，这是 skill 能够跨越模型版本和 provider 差异的核心原因

4. **41 条规则 + 退出码 2 = 设计反模式工程化**：设计规则以前被认为不可检查，只能靠人工 review。Impeccable 的 41 条规则把「AI 味」变成机器可检查的事实，CLI 退出码 0 干净 / 2 有问题——这个语义让设计质量进入 CI 流程

5. **Anomaly 创始人印证了 Impeccable 的 6 类失败覆盖**：Anomaly 提出的 6 大 AI 前端失败类别（色彩理论/可访问性/排版/视觉层次/动效/一致性）与 Impeccable 的 41 条检测器高度重合，说明「经验分类 ≈ 规则集」——资深设计师的直觉可以通过规则工程化

6. **vibe coding 对代码有效、对设计无效**：这个判断划清了 AI 工具在前端的适用边界。代码对错分明，可以用 vibe coding；设计好坏分明，需要结构化 skill（命令 + 上下文 + 检测器）而不是 CLAUDE.md 里的硬规则

## 实践启示

1. **先用 `init` 建立上下文护栏**：任何新项目跑 `/impeccable init`，强制先生成 PRODUCT.md + DESIGN.md，让设计决策有文档依据，而非凭空生成

2. **把 `npx impeccable detect` 加入 CI**：41 条规则 + 退出码 2 语义让设计质量检查进入自动化流程——这比人工 review 更可持续，也更适合高频迭代

3. **`audit`（工程维度）和 `critique`（UX 维度）要分开跑**：两者 snapshot 用途不同，混用会导致反馈信号混乱——audit 看 a11y/性能/响应式，critique 看层级/认知负担/情绪

4. **多 provider 分发时用工厂编译器模式**：不要维护 8 份适配文档，而是维护一份源文件 + `factory.js` 编译器，一次编译多份产出

5. **浏览器内实时反馈参考 Live 模式的三通道协议**：SSE 推 + HTTP POST 收 + Agent long-poll拉的组合是经过工程验证的浏览器↔源码双向同步方案

6. **设计 skill 应该搭配硬规则使用**：Anomaly 创始人推荐的组合是「2-3 个 design skill + 一组硬规则（颜色、字号、间距）」，两者互补而非替代

## 关联阅读
- [Agent Skill 编写指南](../ch04/260-agent-skill.html) —— skill 格式规范与渐进式披露机制
- [Karpathy Vibe Coding → Agentic Engineering](../ch03/045-agent.html) —— Vibe Coding 原始定义与 Software 3.0 演化
- [Claude Design Skill](../ch01/1047-claude-design-skill.html) —— Anthropic 的设计 skill 实践对比
- [前端 Design Skills 全景对比](../ch01/661-skills-anthropic-openai-comparison-frontend-design.html) —— Anthropic vs OpenAI 设计 skill 生态比较

---

