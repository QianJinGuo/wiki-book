---
title: "蚂蚁阿福：从 0 到生产的医疗 Agent 工程化落地"
source_url: "https://mp.weixin.qq.com/s/GQwCRSrXBjSlTE4TEY_wfQ"
source_site: "mp.weixin.qq.com"
source_author: "郭春晓｜蚂蚁集团 / QCon 2026 北京"
ingested: "2026-07-14"
sha256: "55c3aec05cdcc173127b60ac38935a330aa384033d9a57a400f19d4cf0341eab"
type: "raw-article"
tags: [ant-group, medical-agent, healthcare, agent-engineering, evaluation, agentic-rag, memory, inference-optimization]
status: "ingested"
---

# 蚂蚁阿福：从 0 到生产的医疗 Agent 工程化落地

> 蚂蚁集团医疗健康资深专家郭春晓在 QCon 2026 北京站的分享，深入分析医疗 Agent 的工业级研发实践。

## 医疗 Agent 的独特挑战

医疗 Agent 与其他 Agent 的根本差异：
- **零容错**：一个致命回答可能就是一个家庭的悲剧
- **循证逻辑**：所有诊断必须依据指南和教科书
- **确定性要求**：大模型非确定性 vs 医疗场景追求可解释、可复现、符合指南的推理
- **长期记忆缺失**：用户病症往往是长年累月的
- **风险合规**：医疗数据泄露超 50 条可能触犯刑法

## Agent 研发范式转型

传统 TDD → Benchmark 驱动 → Badcase 驱动快速迭代。

**代码数据化**：过去思路是改代码，现在把逻辑转化为数据，用数据训练模型。

## 评测体系（EBPP）

评测集是重中之重，需快速建设。医疗评测不是唯一解，而是多 rubric——必须回答到"点"上。

- **评测集起点 = Badcase**，而非丢给质量团队
- **自动化评测**耗时从 12 天缩短到小时级
- Benchmark 会随时间 overfitting，需通过 Badcase 持续补充
- **数据集要求**：有区分度（能评出能力差距）、样本量充足、评判与人对齐

**人工校准流程**：人与人做一致性评估 → 人机对齐（一个场景约 1-2 个月）。

## 上下文工程

Copilot/Codex 的完整上下文策略，但医疗更聚焦关键信息与信息冲突。

关键策略：
- **结构化 + 非结构化混合**：约 20-30% 关键信息结构化
- **上下文压缩**：保留用户 query（问题远比回答重要）
- **渐进式策略**：先看目录再决定是否阅读全文
- **主子 Agent 上下文共享**：长文档委派子 Agent，返回 Index 而非原文
- "非必要不要搞 multi-agent 架构"

## RAG → Agentic RAG

从单次检索演进到多跳 Agentic 检索。合成多跳问题的核心：从知识图谱提取最长子问题 → 模糊化 → 让模型答对。

**模型选型经验**：
- 偏写作：蒸馏 Gemini
- 分析战略框架：蒸馏 Gemini
- 强工具调用：蒸馏 Claude
- 交互场景写 HTML：Gemini 最强
- GPT：用户体验好（小词汇写作）

## 记忆系统

医疗记忆的核心挑战：
- **遗忘比记忆更重要**：感冒过了就得遗忘
- **数据冲突确认**：医疗特有，让用户确认
- **替人咨询识别**：区分"我自己"和"我家小孩"
- **百分之百确认才用**：不确认就不结合，尤其医疗不敢激进

**方案**：病例级长期记忆（生命周期+病程推理）+ 结构化信息 + Summary 双路结合 + 遗忘机制。

## 训推优化

- **KV cache 管理**：改上下文策略不能丢 KV cache
- **Prefill/Decode 分离**：prefill 用计算强卡，decode 用 HBM 高卡
- **计算压缩**：BF16 → FP8/INT8
- **长上下文分流**：>32K 与 <32K 不同部署策略
- **Speculative Decoding**：蚂蚁开源自研 SpecFog 方案，50→120 token/s，提升 2 倍
- **Agent RL 训推分离**：训练框架与 Agent 代码解耦

## 开源贡献

蚂蚁系统性开源了整套医疗 Agent 训练与推理技术栈，包括 SpecFog 1T 加速方案、Agent RL 框架等。
