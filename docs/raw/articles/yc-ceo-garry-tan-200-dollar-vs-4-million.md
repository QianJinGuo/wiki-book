---
source: wechat
source_url: https://mp.weixin.qq.com/s/mSb8J8laT-rqIEohW-6LEw
author: 玉澄/51CTO技术栈
date: 2026-05-11
title: "200美元搞定400万美元的项目！YC总裁：同时调用15个Agent，每月交付数十万行代码，Claude Code和Codex协作开发，用Token换时间亿万富翁"
type: raw
tags: [agent, yc, claude-code, codex, token-maxxing, garry-tan, workflow]
review_value: 9
review_confidence: 8
review_recommendation: very-strong
review_stars: 5
ingested: 2026-05-11
sha256: 48e614f02604f362d4bedb452044c6609a5f5f396407f1c5073a20d47cbe14b1
---
# 200美元搞定400万美元的项目！YC总裁：同时调用15个Agent
## 核心数据
| 指标 | 传统方式 | AI 方式 |
|---|---|---|
| 成本 | $4,000,000 | $200 |
| 人数 | 6人 | 1人 |
| 工期 | 18个月 | 5天 |
| 代码产出 | — | 400倍（按逻辑代码行数） |
Garry Tan（YC CEO）：13年不写代码，重写当年花400万美元的博客平台Posterous第三次，这一次只花200美元（Claude Code Max账号），5天完成，GitHub超10万星。
## 三大核心概念
### 1. Token Maxxing（Token 极大化）
"如果你能'煮干大海'（Boil the Ocean），也就是做极致的完美主义研究会怎样？如果是人类做这种研究可能需要一个月，但现在你只需要投入更多算力。你可能会花很多钱买Token，但这叫'Token极大化'。如果增量的工作能让事情更完整、更出色，那就值得。"
- 不满足单一来源，20个来源进行交叉比对
- 增量Token投入 = 买下机器的意识时间，换回自己的时间
- "Token预算会越来越像房租一样，不再是可省可不省的开销，而是必备生产力支出"
### 2. Thin Harness, Fat Skills
**核心观点**：Markdown 实际上就是代码。"Markdown 实际就是代码，它只是编译方式不同。"
- **Harness**（薄）：核心循环——接收用户输入→交给LLM→执行LLM的操作（如工具调用）。这是平台应该搞定的，不要重写。
- **Skills**（厚）：把什么逻辑放在Markdown里（LLM这边），什么放在代码里（确定性执行）。这是工程师应该花时间的地方。
**对比**：
- LLM的"潜在空间"：理解人类复杂的动机，处理通用情况
- 代码：确定性的0和1执行，不理解你想要什么、你是谁
### 3. Claude + Codex 双AI协作模式
Garry的工作流（以GStack为载体）：
- **Claude Code**：多动症型CEO，擅长快速迭代、创意发散
- **Codex**（/codex命令）：高冷CTO，"智商200且几乎不说话"，找出所有问题和Bug
- **协作**：`/codex`调Codex review，`/claude`在Codex里临时调Claude当CEO
> "Claude Code非常适合'多动症型CEO'，但偶尔会胡编乱造。Claude模型虽然很棒，但事实证明它们并非在所有方面都是最聪明的。如果你遇到一个非常疯狂的问题，你需要那个智商200且几乎不说话的'高冷CTO'。"
### GStack：并行15个Agent的开发框架
Conductor（Mac应用）同时启动多个Claude Code/Codex实例，每个在独立Git worktree中工作，避免冲突。
**GBrain**：基于OpenClaw + Conductor + GStack + PG Vector RAG的组合。
## 关键洞察
### Agent脆弱性不怕，只要能被另一个Agent修复
"只要你能让另一个代理坐在那一直修复，它的脆弱和需要修理就不再是问题。"
Claude Code（50-60%）+ OpenClaw（另一半）配合使用。
### 测试覆盖率80-90%
- 没有测试就扔给用户 = 产出"垃圾"（Slop），比人类烂代码糟糕10倍
- Token Maxxing可以轻松实现90%测试覆盖率
### 2013年 vs 2025年：专业工程师每天30-50行
"如果你查阅90年代到2000年关于软件工程的文献：一个专业的、经过测试且可投入生产的软件工程师，平均每天产出的代码量并不是几百行，而是30到50行左右。"
Garry当时兼职写代码，每天可能只有14行。400倍就来自于此。
## 未来判断
### 个人AI革命 = 个人电脑革命
"历史上最伟大的礼物就是个人电脑革命，而我们即将经历一场完全相同的个人AI革命。"
两种选择：
1. 拥有自己的AI、数据和集成环境，自己写提示词
2. 被企业控制（像Facebook信息流）
### "时间亿万富翁"概念
"如果你能做到Token极大化，你就能买下'机器意识'的数百万年意识时间。这样我也可以成为时间亿万富翁。这不是我自己的时间，而是机器在为我工作。"
### 1970年代"自制电脑俱乐部"阶段
"现在的感觉是，人们觉得OpenClaw或Hermes模型还差点火候，或者用起来太累。但我敢保证，明年这时候，每个人都会拥有自己的个人AI。"
## Garry's List 项目详情
- 每次深度调研（读几十篇文章、整本相关书籍）只需5-10美元Opus调用费
- 完整RAG + Agent检索，能阅读整个互联网 + 所有推文
- 递归爬虫 + 深度研究
- 每天发布2-3篇关于加州、旧金山和洛杉矶政务的高质量调研文章
## 参考
- 播客原文：https://www.youtube.com/watch?v=57lDpTwiW6g