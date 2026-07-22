# Harness 实践：将任何文字编辑成精美的文章

## Ch01.587 Harness 实践：将任何文字编辑成精美的文章

> 📊 Level ⭐⭐ | 7.6KB | `entities/harness-实践将任何文字编辑成精美的文章.md`

# Harness 实践：将任何文字编辑成精美的文章

**来源**: code秘密花园 | **发布日期**: 2026-06-18 | **原文**: https://mp.weixin.qq.com/s/t0-HbOj-Z2_RcZZJRPpM9A

> 本文是 Harness Engineering 系列中关于「Beautiful Article」Skill 的深度实践。核心贡献在于提出了 **Reacticle 组件协议**——一套让 AI 可控地生成长文 HTML 的语义化 React 组件契约，以及一套可迁移的 8 阶段 Harness 骨架。

---

## 摘要

code秘密花园（ConardLi）延续视频 Skill 的 Harness 骨架，为「将任意文字编辑成精美网页文章」构建了 Beautiful Article Skill。核心创新是 **Reacticle 组件协议**，将文章排版从 AI 的自由生成转变为受约束的组件组合，同时通过 11 套主题系统（Tufte、Sottsass、Bayer 等）实现视觉多样性。该实践验证了「好的 Harness 是可以迁移的」这一核心命题。

## 核心要点

- **Reacticle 协议**：React + Article 的组件契约，提供 Article / Hero / Lead / Section / Subsection / Table / Quote / CodeBlock 等语义组件，AI 只负责「组合」，结构和排版由库保证。
- **Raw 逃生舱**：在组件约束之外提供 Raw 组件，允许任意 HTML/SVG/CSS/React，但必须消费主题 token，兼顾自由度与稳定性。
- **11 套编辑级主题**：每套主题包含 CSS token 包 + AI 可读的 Markdown profile（配色风格、代码高亮、Raw 惯用法、反模式说明）。
- **8 Phase 执行流程**：从素材摄入 → 编辑规划 → 首屏开发 → 完整生成 → 多 Agent 并行开发 → 三视角终审 → 最小切片修复 → 交付，其中卡 3 个强制人工检查点。
- **Harness 可迁移性验证**：视频 Skill 的 6 大核心组件（上下文管理、工具系统、执行编排、状态与记忆、评估与观测、约束与恢复）被完整复用，证明好的 Harness 骨架可以横跨不同生产场景。

## 深度分析

### 组件协议作为 AI 输出控制的核心模式

Reacticle 的本质是对 AI 输出空间施加「结构性约束」。与传统的 prompt 约束不同，组件协议将约束从文本层提升到结构层——AI 不需要知道「h2 还是 h3」「div 还是 section」，只需要选择语义组件。这种约束的强度远高于 prompt 指令，因为组件的 Props 类型和嵌套规则是代码级的硬边界，类似于通过定义小型组件词汇表让 AI 在受限空间中发挥创造力。

### 主题 token 系统：AI 时代的「设计规范即代码」

11 套主题每套都有一份 AI 可读的 Markdown profile，这是一个值得推广的模式。传统设计规范面向人类设计师，而主题 profile 面向 AI：它告诉 AI「这个主题追求数据墨水比，不要用渐变、不要用阴影」。这意味着设计规范的受众从「人」扩展到了「AI 协作体」。当 AI 能理解并遵循设计原则时，视觉输出的可控性大幅提升。

### 渐进加载上下文 vs 全量注入

Beautiful Article Skill 不会在启动时把所有规范一次性塞给 Agent，而是在每个 Phase 只加载该阶段需要的文档。这是 Harness Engineering 中上下文管理的关键实践：Phase 1 只加载素材抽取规则，Phase 2 加载文章类型和主题选择，Phase 4/5 才加载组件协议。渐进加载让模型注意力不被稀释，也减少了长会话中的「规则漂移」。

### 最小切片修复与文件化记忆

当终审发现问题时，Skill 不是让 AI 重写整篇文章，而是定位到具体 Section 进行「最小切片修复」——修改只影响被指出的部分，不扰动已完成的其他内容。配套的 review log 文件不仅给人类看，更给 Agent 看，形成 Skill 自进化的反馈飞轮。这与视频 Skill 中的「分节点质检」机制同构，验证了跨场景复用的可行性。

### 多 Agent 并行与模型选型

Phase 5 支持单 Agent 顺序和多 Agent 并行两种模式，后者对模型能力要求极高——需要准确理解 SubAgent 边界，避免「两个 Agent 改同一个文件」或「忘了合并某个 Section」。文章选择 MiniMax M3 作为执行模型，因其在长上下文理解和复杂指令遵循上表现突出，尤其在多 Agent 调度场景「比较稳」。这暗示了一个趋势：Harness 架构与模型能力需要联合优化。

## 实践启示

1. **组件协议 > Prompt 约束**：当需要稳定控制 AI 输出格式时，定义一套组件协议比写长篇 prompt 指令更可靠。组件是代码级硬约束，prompt 是文本级软约束。类似的思路可推广到任何结构化输出场景（报告生成、邮件撰写、数据可视化）。
2. **主题 token 是设计规范的新载体**：将设计原则写成 AI 可读的 Markdown profile，让 AI 理解「为什么这样设计」而不仅仅是「用哪个 CSS class」，是 AI 原生设计系统的新方向。
3. **Harness 骨架可跨场景迁移**：视频 → 文章的技能迁移证明，一旦抽象出通用 Harness 骨架（阶段编排、文件化记忆、强制检查点、独立质检），它可以被复用到完全不同的内容生产场景，显著降低新 Skill 的开发成本。
4. **渐进加载比全量注入更有效**：不要在会话开始时把所有上下文灌给 AI。分阶段按需加载，让模型在每个阶段只关注当前需要的文档，能显著提升长任务的一致性和完成质量。
5. **最小切片修复降低返工成本**：当 AI 产出需要修正时，定位到具体模块进行最小修复，而不是重来一遍，能大幅降低 token 消耗和时间成本。这种「外科手术式」修复模式是 Harness Engineering 中约束与恢复机制的核心设计。

## 相关实体

- [Harness 实践将任何文字编辑成精美的文章](../ch05/018-harness.html) — 本文（姊妹篇：视频 Skill 的 Harness 实践）
- [Loop Engineering Overview Tech Minimalism](../ch05/007-loop-engineering.html) — Loop Engineering 概览，Harness 的另一种编排范式
- [Alibaba Data Rd Harness Engineering Nl2Sql](../ch05/116-harness-engineering.html) — 阿里数据研发的 NL2SQL Harness Engineering 实践
- [Aliyun Loop Engineering Log Scan Auto Fix Deploy](../ch05/007-loop-engineering.html) — 阿里云 Loop Engineering 的日志扫描自修复实践
- [Agent Config Model Tool Skill Mcp Prompt Combination Yexiaochai 09](../ch04/266-skill.html) — Agent 配置层的解耦设计，与 Skill 架构互补

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/harness-实践将任何文字编辑成精美的文章.md)

---

