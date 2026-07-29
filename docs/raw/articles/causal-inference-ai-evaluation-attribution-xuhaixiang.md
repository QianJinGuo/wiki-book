---
title: "相关性 ≠ 因果性：因果推断在 AI 评测归因中的方法与实践"
source_url: "https://mp.weixin.qq.com/s/g8kqrvXl12llVS0g_DlyAg"
author: 徐海翔
platform: WeChat
ingested: 2026-07-29
slug: causal-inference-ai-evaluation-attribution-xuhaixiang
sha256: 15625f6be94a5924b11423a024d03f572fb2cdede42401be81eefde6149086cc
---

系统性技术综述：因果推断与归因分析方法在 AI 评测中的应用。涵盖三大实操路径（Trace 日志归因/扰动式归因/因果推断 A/B 测试）及多个完整案例。

## 核心架构

### 因果推断两大框架
- **Rubin 潜在结果模型 (RCM)**：倾向得分匹配、双重差分、工具变量
- **Pearl 因果图模型**：DAG、do-算子、后门准则、前门准则

两者目标一致：计算存在混淆变量时干预对结果的影响。Rubin 侧重效应估计，Pearl 侧重机制识别。

### 工具对比

| 工具 | 开发方 | 特点 | 适用场景 |
|------|--------|------|---------|
| DoWhy | Microsoft | 因果图建模，四步框架（建模→识别→估计→反驳） | 因果发现、假设检验 |
| EconML | Microsoft | 正交机器学习 | 高维数据、异质性效应 |
| CausalML | Uber | Meta-Learner | 营销归因、A/B 测试 |
| PyCausalSim | 社区 | 模拟驱动因果发现 | A/B 测试分析 |

### SHAP 值
基于 Shapley 值（博弈论）公平分配每个特征贡献度，满足效率性/对称性/哑元性/可加性四公理。

## AI 评测归因三大实操路径

### 1. Trace 日志归因（需要完整执行轨迹）
方法论：将端到端失败拆解为组件的贡献度。

核心指标：Tool Selection Accuracy、Parameter Construction Quality、Plan Adherence Score、Answer Relevancy、Token Efficiency

典型案例：工具描述模糊导致选错工具 → 50 次类似 Query 中错误率 60%；参数特殊字符导致调用失败 → 100 次任务中参数错误占失败 45%；规划步数过多导致超时 → 成功任务平均 3-4 步 vs 失败任务 8 步。

### 2. 扰动式归因（无 Trace 场景）
方法论：通过微调输入要素（Prompt/示例/上下文/格式/温度），观察输出变化幅度，反向推断贡献度。

典型案例：缺失输出格式约束导致解析成功率仅 60% → 加 JSON 约束后升至 95%（贡献度 58.3%）；RAG 检索噪声干扰 → 相关性阈值过滤后评分从 6.2 升至 8.5（贡献度 37.1%）；示例顺序影响推理链 → "由浅入深"排列准确率 78% vs 随机排列 65%（贡献度 16.7%）。

### 3. 因果推断 A/B 测试
方法论：通过 DAG 控制混杂变量，估计干预净效应。方法包括：t-test、PSM、双重稳健估计、神经正交学习（NOL）。

典型案例：辛普森悖论——新版 Prompt 平均提升 5% 但简单 Query +8.9%、困难 Query -10.8%；PSM 匹配后发现 Temperature 真实效应仅 5%（表面 18% 中 13% 是混杂）；NOL 发现 Prompt V2 + 低 Temperature 有协同作用（组合效应 +0.18 > 单独之和 +0.09）。

## 方法选择与边界

- Trace 日志归因：需 Trace 完整度，建议 100+ 次执行
- 扰动式归因：每个变体 20+ 次运行，高成本
- 因果 A/B：PSM 需 500+ 样本

不当用场景：数据 < 50 条、系统快速迭代期、问题已明确、单组件系统。

## 关键教训
- 从单一组件开始归因
- 基线数据先行（100+ 次收集）
- 80% 确信度足以指导优化
- 每条归因结论必须附带可执行的优化建议
