---
title: "AI编码实战 | 0 行手写代码，2 天重构 2 万行 Vue 项目"
source_url: "https://mp.weixin.qq.com/s/hsV43GFwtiM2Nv7Qq-5UUA"
source_name: "vivo互联网技术"
author: "Liu Shudong"
type: "raw"
created: 2026-08-19
ingested: 2026-08-19
tags: [ai-coding, refactoring, agents-md, skills, constraint-system, bluecode, vue, vivo]
sha256: 2bf394826e987ca44c5545cf69e1a64efb00e6982237eb4eee7c24afc92c7973
---

# AI编码实战 | 0 行手写代码，2 天重构 2 万行 Vue 项目

> 账号：vivo互联网技术（AI 技术团队）| 作者：Liu Shudong

## 核心命题

在不手写一行代码的情况下，用自然语言指挥 BlueCode AI 编程助手，在 2 个工作日内完成一个 4 年历史、2 万行 Vue 项目的全面重构。**核心观点：AI 辅助开发的关键不在 AI 本身的能力，而在于人为 AI 建立的约束体系**——通过 Skills 技能包注入领域知识、AGENTS.md 沉淀项目规范、飞轮效应让错误只犯一次，将模糊目标转化为 AI 可精确执行的高质量指令。

## 关于 BlueCode

BlueCode 是 vivo 内部的 AI 编程助手（CLI 形态），类似业界的 Claude Code，支持自然语言指令完成代码生成、重构、调试。原生支持 Skills 技能包机制与 AGENTS.md 项目规范注入，能将团队领域知识和工程规范沉淀为 AI 可复用的约束体系。

## "0 行手写代码"的意思

不是什么都没做。作者做了：梳理重构目标、设计约束体系（Skills/AGENTS.md）、逐条下达高质量指令、审查 AI 产出。没做：手写任何代码。所有代码变更——Vue 组件、TypeScript 类型、composable 函数、单元测试、CSS 样式、构建配置——100% 由 BlueCode 在终端中直接编写。

## 项目现状与产出

千询是 vivo 内部 AI 对话产品，前端基于 Vue 3 + Vite + Arco Design Vue，4 年快速迭代积累大量债务。

**2 天产出**：157+ 个文件变更；+21,199 行新增 / -27,322 行删除 / 净减 6,123 行；108 个单元测试（从 0 开始）；手写代码 0 行。还有重构日志、详细分析、汇报 PPT + 分享 blog。资深工程师独立完成需 12-16 个工作日，BlueCode 协作下 2 个工作日。

## 人机分工

- **我的角色：导演** — 定目标、建约束、拆需求、审结果
- **BlueCode 的角色：全栈执行者** — 读文件、分析边界、写代码、改文件、跑构建/测试

实际对话例：
- 代码拆分：作者一句话"把 SessionView 中所有 SSE 相关变量提取到 useSSEStream.ts，保持行为不变，改完跑 build"，BlueCode 读文件→分析边界→建新文件→改 import→跑 npm run build 全自动。
- 测试编写：给 chatStore 的 setLoading 写 4 场景单元测试，BlueCode 读源码和 types→生成 4 用例→跑 vitest→4/4 passed。
- UI 迭代：让 BlueCode 参考开源 Figma 设计稿视觉语言（间距/圆角/配色/组件形态），明确约束"只改 CSS/Less 和模板 class 不动组件逻辑、保留品牌色 Logo、适配已有功能模块非 1:1 复刻"，通过 Figma MCP 读取设计稿节点树后落地。

## 为什么 BlueCode 能做到——方法论

1. **Skills 技能包注入领域知识**：把团队领域知识编码为可复用技能，注入 AI 上下文
2. **AGENTS.md 沉淀项目规范**：项目规范（架构约束/命名规范/复用组件）沉淀为 AI 可读的规范文件
3. **飞轮效应让错误只犯一次**：每次发现的问题沉淀回约束体系，持续收敛

## 诚实复盘（BlueCode 犯的错）

文章诚实列出 BlueCode 的失败案例，不粉饰。强调约束体系是迭代优化的核心。

## 结论

AI 辅助开发的关键不在 AI 能力，而在人为 AI 建立的约束体系。将模糊目标转化为 AI 可精确执行的高质量指令，从提出需求到代码合入，甚至本篇分享也是 AI 生成。

---

**决策**：v=7 / c=8 / v×c=56 → **NEW Entity**（vivo 第一方 c=8；0 行手写代码大规模重构+约束体系方法论全库零覆盖的实战案例，完整量化数据 157 文件/108 测试/-30%，v=7）
