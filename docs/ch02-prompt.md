# Ch02 提示词工程与上下文工程

> 与 AI 高效对话的科学与艺术：Prompt、CoT、Context Engineering

> 本章收录 **31 篇**实体，按深度递增排列。

---

## 本章导航

| Level | 含义 | 篇数 |
|-------|------|------|
| ⭐⭐ 工程师 | 需编程基础 | 30 |
| ⭐⭐⭐ 专家 | 需ML基础 | 1 |

---

## 导读

一个精心设计的提示词，可以让同一个模型的表现相差 10 倍。

本章从最基础的 Prompt 写法开始：如何给模型足够的上下文、如何用 Few-shot 示例引导输出格式、如何用 Chain-of-Thought 让模型"展示推理过程"。然后进入更高阶的 Context Engineering——不是"写更好的提示词"，而是"设计更好的信息环境"。

你会看到 Hermes Agent 的 Prompt 调试器如何做 A/B 对比，Codex 的上下文工程如何用 Append-only 策略管理信息流，以及为什么 Karpathy 说"未来的工程师不是写代码，而是设计上下文"。

这是从"会用 AI"到"用好 AI"的关键跳板。

---

## Ch02.001 Hugging Face AI Agent 术语表：Model / Agent / Scaffolding / Harness / Context Engineering / Policy / Tool / Skill / Sub-agent 完整区分

→ [独立页面](ch02-001-hugging-face-ai-agent-术语表-model-agent-scaffolding-harness-context-engineering-po.html)

## Ch02.002 反向审计 Prompt 范式 — 从 VB 50 行 Codex 自我蒸馏到 5 行核心

→ [独立页面](ch02-002-反向审计-prompt-范式-从-vb-50-行-codex-自我蒸馏到-5-行核心.html)

## Ch02.003 Codex 上下文工程 — Prompt Layout + Append-only + Latent Space Moat（LastWhisper 解读）

→ [独立页面](ch02-003-codex-上下文工程-prompt-layout-append-only-latent-space-moat-lastwhisper-解读.html)

## Ch02.004 Using Claude

→ [独立页面](ch02-004-using-claude.html)

## Ch02.005 Headroom：上下文压缩与缓存稳定化框架（live zone + CCR + RawValue 字节级 patch）

→ [独立页面](ch02-005-headroom-上下文压缩与缓存稳定化框架-live-zone-ccr-rawvalue-字节级-patch.html)

## Ch02.006 Hermes Agent 自进化机制源码解析

→ [独立页面](ch02-006-hermes-agent-自进化机制源码解析.html)

## Ch02.007 Hermes Agent 深度解析（阿里云/飞樰）

→ [独立页面](ch02-007-hermes-agent-深度解析-阿里云-飞樰.html)

## Ch02.008 视觉 AI 的下一前沿是代码：a16z 关于视觉生成范式转移的论述

→ [独立页面](ch02-008-视觉-ai-的下一前沿是代码-a16z-关于视觉生成范式转移的论述.html)

## Ch02.009 Claude Code Prompt 提示词体系源码解析

→ [独立页面](ch02-009-claude-code-prompt-提示词体系源码解析.html)

## Ch02.010 Development environments for your cloud agents

→ [独立页面](ch02-010-development-environments-for-your-cloud-agents.html)

## Ch02.011 Claude Fable 5 提示词泄漏 — 1585 行 120K 字符的产品运行时控制平面与安全工程启示

→ [独立页面](ch02-011-claude-fable-5-提示词泄漏-1585-行-120k-字符的产品运行时控制平面与安全工程启示.html)

## Ch02.012 Skills赏析：使用skills-refiner提升skill质量

→ [独立页面](ch02-012-skills赏析-使用skills-refiner提升skill质量.html)

## Ch02.013 Karpathy CLAUDE.md — 四条行为准则让 AI 编程 Agent 减少结构性失败

→ [独立页面](ch02-013-karpathy-claude-md-四条行为准则让-ai-编程-agent-减少结构性失败.html)

## Ch02.014 Prompt 调试器：A/B 对比 + 自动评分 + 模板沉淀

→ [独立页面](ch02-014-prompt-调试器-a-b-对比-自动评分-模板沉淀.html)

## Ch02.015 深度解析 OpenClaw 在 Prompt / Context / Harness 三个维度中的设计哲学与实践

→ [独立页面](ch02-015-深度解析-openclaw-在-prompt-context-harness-三个维度中的设计哲学与实践.html)

## Ch02.016 LLM Wiki 架构

→ [独立页面](ch02-016-llm-wiki-架构.html)

## Ch02.017 Skills Registry 公测开启：为企业打造私有的 Skill 管理中心

→ [独立页面](ch02-017-skills-registry-公测开启-为企业打造私有的-skill-管理中心.html)

## Ch02.018 Prompt Context Harness 三次演进

→ [独立页面](ch02-018-prompt-context-harness-三次演进.html)

## Ch02.019 qoder skills

→ [独立页面](ch02-019-qoder-skills.html)

## Ch02.020 Claude Design 系统提示词 → web-design-engineer Skill

→ [独立页面](ch02-020-claude-design-系统提示词-web-design-engineer-skill.html)

## Ch02.021 Agent Skill 编写指南

→ [独立页面](ch02-021-agent-skill-编写指南.html)

## Ch02.022 System Prompt vs Post-Training：行为约束该写还是该训？

→ [独立页面](ch02-022-system-prompt-vs-post-training-行为约束该写还是该训.html)

## Ch02.023 深度解析 Hermes Agent 如何实现自进化及其 Prompt / Context / Harness 的设计实践

→ [独立页面](ch02-023-深度解析-hermes-agent-如何实现自进化及其-prompt-context-harness-的设计实践.html)

## Ch02.024 fb134668f09a3b45c1813781f912ae4e7e26294d3b60332606983b946944c328

→ [独立页面](ch02-024-fb134668f09a3b45c1813781f912ae4e7e26294d3b60332606983b946944c328.html)

## Ch02.025 深度解析 Hermes Agent 如何实现\"自进化\"及其 Prompt / Context / Harness 的设计实践

→ [独立页面](ch02-025-深度解析-hermes-agent-如何实现-自进化-及其-prompt-context-harness-的设计实践.html)

## Ch02.026 阿里巴巴 & 蚂蚁 LoongSuite GenAI 可观测语义规范：从统一数据语言到规模化落地

→ [独立页面](ch02-026-阿里巴巴-蚂蚁-loongsuite-genai-可观测语义规范-从统一数据语言到规模化落地.html)

## Ch02.027 新程Alpha认知模型：4B参数端侧部署，群体智能以小搏大比肩GPT-5.4

→ [独立页面](ch02-027-新程alpha认知模型-4b参数端侧部署-群体智能以小搏大比肩gpt-5-4.html)

## Ch02.028 AI 导购在 vivo 官网的落地实践

→ [独立页面](ch02-028-ai-导购在-vivo-官网的落地实践.html)

## Ch02.029 PROJECT_ANALYSIS.md — PromptQueue + OpenGorilla 项目全景分析

→ [独立页面](ch02-029-project_analysis-md-promptqueue-opengorilla-项目全景分析.html)

## Ch02.030 从Prompt、Context到Harness，工程的三次进化与终局之战

→ [独立页面](ch02-030-从prompt-context到harness-工程的三次进化与终局之战.html)

## Ch02.031 OneReason：快手将推理注入推荐基模的系统性尝试

→ [独立页面](ch02-031-onereason-快手将推理注入推荐基模的系统性尝试.html)

