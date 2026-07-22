---
title: prompt-debugger-compare-templates-winty
source_url: https://mp.weixin.qq.com/s/8E06C-KCdUushnuoIYW7Jg
publish_date: 2026-05-12
tags: [wechat, article, claude, openai, gpt]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: b33485051b4bf94673c0fab1dae11bbaedc0843c03c7e3f7e53372ce70cc067c
---
Prompt 调试器要解决的问题：把"凭感觉调 Prompt"变成"有数据对比的 A/B 测试"。
核心能力三件套：
1. 并排对比 — 同一个输入，两个 Prompt 的输出摆在一起看
2. 参数调优 — 同一个 Prompt，换 Temperature/模型，看输出质量怎么变
3. 评分沉淀 — AI 自动评分 + 用户手动打分，高分 Prompt 自动存进模板库
## 一、并排对比
数据库设计：experiments 表（固定输入）下挂 experiment_runs 表（不同 Prompt/参数的结果），同一输入对比任意变体。
后端 API 用 Promise.all 并行调用，同时发两个请求。用 Vercel AI SDK 的 generateText 统一封装 OpenAI 和 Anthropic。
前端用 Tailwind grid-cols-2 做分屏，体验像 diff 工具。
## 二、参数调优面板
Temperature 实战经验：
- 生成结构化 JSON/代码 → 0~0.2，GPT-4o
- 技术文章/周报 → 0.3~0.5
- 创意文案/营销标题 → 0.8~1.2，Claude 3.5 Sonnet
- 翻译润色 → 0.2~0.4
同一 Prompt 在不同模型上可能需要不同 Temperature——GPT-4o 上 0.5 刚好，Claude 上可能偏放飞，需要降到 0.3。
## 三、AI 自动评分 + 用户打分
核心思路：写一个"元 Prompt"（Meta-Prompt），让 AI 当裁判。
用 generateObject + Zod Schema 保证结构化返回，Temperature=0 保证评分稳定可复现。评分维度：accuracy、readability、format、completeness、overall。
AI 评分是批量筛选初筛手段，用户评分是最终裁判。
## 四、最佳模板自动沉淀
规则：AI 评分 ≥ 4 且用户评分 ≥ 4，自动保存到模板库。
模板版本追踪：记录每次评分的历史，每个模板有一条评分曲线，能看出 Prompt 经过多次测试和微调后的分数变化。
## 五、部署与成本控制
开发用 SQLite，生产切 Turso（API 兼容）。每次对比 ≈ 3 次 API 调用（2 次对比 + 1 次评分）。
省钱技巧：初筛用 GPT-4o-mini（成本降 30 倍）；差异不明显的才触发评分；设置每日调用上限。
## 关键洞察
Prompt 调试器 = Chrome DevTools 之于前端开发，没有调试器就调 Prompt 等于没有 DevTools 调样式。
沉淀闭环：调试器 → 对比 → 评分 → 高分自动入库 → 下次调试直接从库里选基线。