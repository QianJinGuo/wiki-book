---
title: "AI 导购在 vivo 官网的落地实践"
source: wechat
source_url: https://mp.weixin.qq.com/s/ureOXhYFIJrUlZdL9JvEFQ
author: vivo互联网大前端团队
feed_name: vivo互联网技术
review_value: 7
review_confidence: 8
review_recommendation: moderate
review_stars: 3
date: 2026-05-27
created: 2026-05-28
updated: 2026-05-28
tags: [ai-agent, ecommerce, rag, fasttext, intent-classification, product-recommendation, vivo, structured-output, knowledge-base, prompt-engineering]
type: article
provenance_state: synthesized
sha256: b955f976153d15ac043f10bc6c0e49abee457f58c456f66d8a1c74ddde95b723
---

# AI 导购在 vivo 官网的落地实践

> **来源**：vivo互联网技术，2026年5月27日
> **背景**：vivo 互联网大前端团队在 vivo 官网 APP 落地 AI 导购 agent，涵盖意图分类、RAG 知识库、手机推荐/参数解读 agent、结构化输出

## 一句话

vivo 团队在官网 APP 落地 AI 导购 agent，通过 FastText 小模型做意图分类（手机参数解读 vs 商品推荐），配合 RAG 知识库和大模型生成能力，首字符响应速度 2.5s 内，AB 实验对 GMV 和解决率有正向贡献。

## 整体架构

用户输入 → FastText 意图识别（参数解读/商品推荐）→ 对应智能体 → RAG 知识库检索 → 大模型生成 → 结构化输出（商品卡片 + 流式文字 + 相关帖子）

## 意图分类（FastText）

**FastText 超参数**：
```python
model = fasttext.train_supervised(
    lr=0.5, dim=200, ws=5, epoch=50,
    wordNgrams=3, minn=3, maxn=6, loss="softmax"
)
```

- CPU 推理，每次约 10ms
- 两分类：手机参数解读 / 手机商品推荐

## 手机参数解读智能体

**流程**：用户问题 → 获取机型 + 模块信息语料 → 拼接 Prompt → RAG 检索 → 大模型生成

**Prompt 设计原则**：角色定义 + 任务边界 + 输出格式 + 示例引导

## 手机商品推荐智能体

**思路**：不靠人工打标签规则，而是将手机列表信息随 Prompt 一起给大模型，让模型自行理解和推荐。

**Prompt 要点**：
- 只推荐 vivo/iQOO
- 补充知识1 = 推荐手机列表，补充知识2 = 上下文，补充知识3 = 用户原始问题
- 智能客服官方回答作为兜底
- Markdown 格式输出，加粗突出商品名

## 知识库与 RAG

两个知识库：
- **商品推荐知识库**：每个手机的卖点 + 评测数据
- **商品评测知识库**：拟人化测评描述

知识库维度：评测 / 参数 / 卖点 / 对比分析

## 结构化输出

三部分：
1. **商品卡片**：接口获取（价格/图片/名称/评论）
2. **流式文字**：SSE 输出，端侧做缓存队列平滑
3. **相关帖子**：RAG 匹配相关社区帖子

**关键设计**：推荐场景要求大模型第一句话直接给出手机名称 → 拿到名称后再请求商品接口

## 安全测试

- 1.6W 条安全测试语料（伦理道德、低俗、不良引导等）
- 三层策略：模型控制 + 边界关键字转人工 + 蓝心运营平台内容审核兜底

## 效果

- 首字符响应速度：2.5s 内
- AB 实验：对 GMV 和解决率有正向贡献

## 一句话总结

垂直领域 AI 导购的工程落地样本：FastText 快速意图分类 + RAG 知识库 + 结构化输出 = vivo 官网 AI 导购 agent。

---

*vivo 互联网大前端团队*
