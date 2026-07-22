---
source_url: https://mp.weixin.qq.com/s/Lec1nRrWVgj50PYR0DxKlg
ingested: 2026-07-15
sha256: 8e96c3194b8d606c591ae5b6e7b39947672fd8de37a311e71d0d416962a6003a
source_published: 2026-07-15
title: "阿里荣膺 ACL 2026 最佳资源论文 | HSCodeComp 揭开智能体「分层规则应用」的能力鸿沟"
author: 兰天
feed_name: 阿里技术
---

HSCodeComp（Harmonized System Code Compass）是阿里 ATH-MaaS 团队构建的第一个面向「分层规则应用」（Hierarchical Rule Application）能力的真实且专家级 Deep Search Agent 基准，获 ACL 2026 最佳资源论文（Best Resource Paper）。

## 背景：HS Code 任务

HS Code（商品名称及编码协调制度）是全球跨境贸易的"商品唯一数字身份证"，支撑每年约 26 万亿美元贸易。任务需要将商品沿专家编写的规则树逐层推导到唯一 10 位编码。

任务形式化：Agent 在含噪商品档案 X（标题/属性/类目/图片/价格）上，逐级调用工具检索并应用规则 R（层级关税规则+专家决策规则）与知识 K（CROSS 历史裁定库），得到唯一 10 位编码 Y。本质是一个多步"检索—推理—回溯"循环。

## 知识复杂度三层模型

Level 1 开放域数据：BrowseComp、WebArena、GAIA 等
Level 2 结构化数据：MedBrowseComp、FinSearchComp 等
Level 3 分层规则数据（本文焦点）：精准应用人类专家撰写的层级专业规则——当前评测关键盲区

Level 3 三大挑战：
- 层级深、一步错步步错（Hierarchical Reasoning）
- 语义边界模糊（Vague Boundary）：规则里充斥"除……以外"、"其他"等自然语言限定
- 逻辑高度耦合（Coupled Rules）：例外条款与交叉引用

## 基准构建

- 632 个真实商品，横跨 32 个大类
- 26 位关务专家（平均从业 5 年+）标注，六步工作流（双人独立→仲裁→复核），分歧率仅 2%
- 评测指标：Exact Match Accuracy（2/4/6/8/10 位），10 位最严格
- Bootstrap 95% CI 已达统计平衡

## 评测结果：28 个系统

核心发现——巨大的能力鸿沟：
- 最强 Agent（Hermes-Agent+Qwen3.7-Max）10 位 ~49.4%，远落后于人类专家 95%
- 前沿系统勉强超过传统 ML 决策树（~45%）
- 6k 样本 SFT+Agentic RL 也只能到 65%——结构性瓶颈

### 分析一：Test-Time Scaling 无法缓解差距

- 多数投票 Voting@K 几乎不提升——投票在同源错误里挑众数
- 自我反思提升微弱——混淆正确修正和错误改写
- 推理漂移（Reasoning Drift）：强迫模型"想得更多"非但不涨反跌——GPT-5 10 位准确率随推理深度从 40.82% 跌到 35.44%

### 分析二：三类信号重要性排序

1. Agent Harness（规则/知识检索）—— +8.5pt，地基
2. CROSS 历史裁定库—— +5~10pt，稳定可靠
3. 视觉信息—— +4pt 且仅限强 VLM，边际补充

### 分析三：长尾类目挑战

最难样本集中在 Novelty & Special Use、Men's Clothing 等长尾类目。大多品类平均 10 位准确率不足 25%。

## 落地与开源

基于 Qwen 基座 + 6k 专家数据 SFT+Agentic RL 达约 65% 准确率（AI Agent 第一名）。全部数据与评测代码已开源。
- GitHub: github.com/ATH-MaaS/Marco-DeepResearch
- HF 数据集: huggingface.co/datasets/ATH-MaaS/HSCodeComp
- 论文: aclanthology.org/2026.acl-long.937
