---
source_url: https://www.xiaohongshu.com/explore/6a7aaa9e00000000250028bc?xsec_source=app_share&type=normal&xsec_token=CBf3BqNZ6hJqhhSj5pDzcXz53Tm79w-R7IkHhkHlw_2ZM=
ingested: 2026-08-11
sha256: 21c8cd050e43a76614e13c3a1ce032459ba25e1b38a14a71855f4a6ce0ccb766
title: "GEA：让AI从\"个体进化\"到\"群体进化\""
author: 王鹏LLM
source: 小红书
platform: xiaohongshu
type: raw
tags: [gea, gae, group-evolution, agent-evolution, genetic-algorithm, dgm, arxiv-2602-04837, paper-summary]
---

# GEA：让AI从"个体进化"到"群体进化"

> 原始来源：小红书 https://www.xiaohongshu.com/explore/6a7aaa9e00000000250028bc
> 作者：王鹏LLM（小红书），2026-08-11
> arXiv: https://arxiv.org/pdf/2602.04837

## 全文

分享一个叫 GAE 的项目（标题写作 GEA），这篇工作的思想是把一组 Agent 作为基本进化单元，通过显式共享成功经验（代码补丁、失败日志、工具调用），避免传统树状进化（如 DGM）中"分支孤岛、好经验浪费"的问题。

关键机制如下，有点遗传算法的味道：

- **群体繁殖**：选 K 个高性能且多样化的父 Agent 组成"父代组"
- **经验复用**：聚合全组经验生成子代，而非单点突变
- **双指标筛选**：按 性能 × 新颖性 择优，防止早熟收敛

效果提升还是很明显：

- SWE-bench：71.0%（超越 DGM 的 56.7%）
- Polyglot：88.3%（大幅领先 DGM 的 68.3%）
- 效率：修复框架级 Bug 仅需 1.4 次迭代（DGM 需 5 次）

标签：#howto入门codex #howto入门vibecoding #大模型 #深度学习 #多模态人工智能 #算法 #人工智能发展 #人工智能替代人工
