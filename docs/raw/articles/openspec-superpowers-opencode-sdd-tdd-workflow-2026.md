---
title: "OpenSpec + Superpowers：用 OpenCode 搭建 SDD+TDD 双驱动 AI 编程工作流"
type: raw-article
source_url: "https://mp.weixin.qq.com/s/Et3q4VVVH4e2VHk597Im4Q"
source_author: "编译完就下班（十三子悠）"
source_date: 2026-07-08
ingested: 2026-07-31
sha256: 7a11056f813dfe398634f79bbdcf49c61c58b65f44e2fd8204f24646adf1e5bf
rating: 30
tags: [ai-coding, openspec, superpowers, opencode, sdd, tdd, spec-driven-development, workflow, vibe-coding]
---

# OpenSpec + Superpowers：用 OpenCode 搭建 SDD+TDD 双驱动 AI 编程工作流

## 摘要

针对 Vibe Coding 的"没有工程纪律的快速原型"问题（AI 无需求规约凭感觉写、无测试规约写完就完），本文提出给 AI 加规约的三工具组合：**OpenSpec 管需求（SDD）、Superpowers 管质量（TDD）、OpenCode 当执行引擎**——"先想清楚再动手，动手就要写好"。

## 三工具分工

| 工具 | 职责 | 机制 |
|------|------|------|
| **OpenSpec** | 管需求（SDD） | 每个变更对应一个文件夹，含 proposal.md（为什么做）、specs/（做什么）、design.md（怎么做）、tasks.md（实现顺序） |
| **Superpowers** | 管质量（TDD） | 可组合技能体系：brainstorm（澄清需求）、write-plan（实现计划）、subagent-driven-development（子代理逐任务实现，强制 TDD + 两阶段审查）；强制 YAGNI/DRY 工程原则 |
| **OpenCode** | 执行引擎 | 开源 AI 编程 Agent，provider-agnostic（OpenRouter/Anthropic 等任意模型），TUI + CLI；SKILL.md 机制可加载外部 Skill |

**单独使用的缺陷**：单 OpenSpec 的 apply 阶段质量保障弱；单 Superpowers 的需求输入/设计决策缺乏结构化载体（易丢在聊天历史）；单 OpenCode 缺乏方法论约束（易变纯 Vibe Coding）。

## 安装要点

- OpenCode：`curl -fsSL https://opencode.ai/install | bash` 或 `npm i -g opencode-ai@latest` 或 `brew install anomalyco/tap/opencode`
- OpenSpec：`npm install -g @fission-ai/openspec@latest` + `openspec init`
- Superpowers：SKILL.md 放入 `.opencode/skills/superpowers/`（推荐）或 `.claude/skills/`（OpenCode 自动发现）
- **OpenCode Skill 搜索路径优先级**：`.opencode/skills/` > `~/.config/opencode/skills/` > `.claude/skills/` > `~/.claude/skills/`
- 社区插件：openflow（OpenCode 专用 OpenSpec+Superpowers 工作流插件）、opencode-plugin-openspec（添加 openspec-plan 模式）

## 6 步工作流

1. **OpenSpec 生成 Spec**：`/opsx:propose "需求"` → 自动生成 proposal.md + design.md + specs/（能力规范）+ tasks.md（任务拆分）
2. **Superpowers 细化 Spec**：读取 OpenSpec change 文件后 brainstorm 深度技术设计（OpenSpec 是需求事实源，不重写 proposal/spec；delta spec 缺口回写）→ 产出 Design Doc（状态流/ID 生成/持久化/渲染策略/事件委托等 7 章节 + 风险表 + 测试策略）+ Delta Spec 补充缺失场景（如 whitespace-only 输入拒绝、localStorage 写入失败、部分有效数据恢复、XSS 边界、Enter 键空输入）
3. **Superpowers 写实现计划**：`writing-plans` 生成计划文件（含 change、design-doc、base-ref 记录 git HEAD），建分支
4. **Superpowers 实现**：`subagent-driven-development` 逐任务派子 agent：TDD（先测试→实现→验证）+ 两阶段审查 + tasks.md 勾选 + commit message 体现设计意图；Spec 不完整时编辑 delta spec/design.md/追加 tasks.md，全新能力走 `/opsx:new`
5. **双重验证**：`/opsx:verify`（Spec 是否全部实现）+ `superpowers finishing-a-development-branch`（代码质量+测试覆盖）
6. **OpenSpec 归档**：`/opsx:archive` → changes/archive/，支持版本追溯与团队共享

## Comet：5 阶段自动化流水线

Comet 非独立项目，是 OpenSpec + Superpowers 组合的自动化封装（社区 Skill，.opencode/skills/comet/）：`/comet` 按当前状态自动判断下一步，5 阶段 = Open（/comet-open 生成 proposal/specs/design/tasks）→ Design（/comet-design Superpowers 头脑风暴）→ Build（/comet-build 规划+子 agent TDD 实现）→ Verify（/comet-verify 双重验证+自动修复）→ Archive（/comet-archive 归档+delta spec 同步）；快捷路径 /comet-hotfix（跳过头脑风暴）、/comet-tweak（小改动）。每阶段跑"阶段守卫"脚本硬性检测完成度（如 Open 阶段检查 Spec 文件是否齐全），防止 AI 跳步。

**实战案例（kcctl 命令优化）**：/comet 自动流转 5 阶段，全程约 40 分钟、20 个任务分 5 个 Phase 子 agent 并行实现；Verify 阶段发现 1 个 FAIL（缺少 sponsor 列）自动修复；Archive 8/8 步骤成功（brainstorming → delta spec → 实施 → 验证 → 主 spec 覆盖 → design doc 标注 → 归档）。

## OpenCode vs Claude Code

| 维度 | OpenCode | Claude Code |
|------|----------|-------------|
| 模型 | Provider-agnostic，任意模型 | 绑定 Anthropic |
| 开源 | 完全开源 | 不开源 |
| Skill 加载 | SKILL.md，6 个搜索路径，兼容 .claude/skills/ | /plugin marketplace |
| Plugin 系统 | JS/TS 事件钩子 + npm 支持 | 无正式 Plugin 系统 |
| Custom Tools | .opencode/tools/ TS/JS | 无 |
| 成本 | 可选便宜模型 | 固定 Anthropic 定价 |

核心优势：不绑死模型 + 兼容 Claude Code Skill（便宜的模型跑简单任务、贵的模型跑复杂设计）。

## 诚实清单

- 学习曲线不低：三工具加起来至少半天摸索
- 小项目杀鸡用牛刀：改配置/修小 bug 直接 `opencode run` 即可，hotfix/tweak 模式为轻量场景设计
- Comet 是社区封装：无独立 npm 包，Skill 文件需从社区仓库获取；建议先手动跑通 OpenSpec + Superpowers 再上自动化
- AI 不是银弹：Superpowers 能补边界条件但不能替代人判断"该不该做"，proposal 阶段人为判断不可省略
- OpenCode 的 Skill 适配比 Claude Code 少：Superpowers 对 Claude Code 更成熟，OpenCode 版需手动配置

## 要点提炼

- Vibe Coding 的本质问题：AI 基于概率最大化生成 token，上下文有限导致每次产出局部最优解，整体代码量大、质量参差——缺需求规约（SDD）和测试规约（TDD）
- 三工具组合的分层逻辑：OpenSpec（WHAT/需求）→ Superpowers（HOW/质量）→ 执行引擎（OpenCode，provider 自由 + Skill 加载）
- Superpowers 核心价值：AI 自己发现 Spec 漏洞（如 localStorage 写入失败、XSS 边界），人写 Spec 常漏边界条件
- 关键技术决策范例：渲染用 textContent 不用 innerHTML（防 XSS）、事件委托（dataset.action 派发）、ID 用 Date.now().toString(36)+随机后缀、持久化 try/catch + 非阻塞告警横幅
