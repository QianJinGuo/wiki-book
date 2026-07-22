# 场景营销前端 AI Coding — 从问题到方案

## Ch05.104 场景营销前端 AI Coding — 从问题到方案

> 📊 Level ⭐⭐ | 3.4KB | `entities/frontend-ai-coding-problem-to-solution-taobao.md`

> 原文归档：[原文归档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/frontend-ai-coding-problem-to-solution-taobao-2026-06-22.md)

大淘宝技术团队深度分析AI编码效率瓶颈，指出核心问题在于大模型的注意力机制限制、上下文膨胀与注意力坍塌，以及人机协作模式不匹配；提出通过外置“DeepResearch”型Agent分离“上下文准备”与“编码执行”，以多模态输入、结构化任务、持久化分析和增量更新提升真实提效。

## 一句话

**大模型能力有边界，上下文管理是关键。超长上下文 ≠ 更好的表现，精准裁剪和分阶段注入才是正确使用方式。**

## 核心观点

### 1. 注意力坍塌（Attention Collapse）

- Transformer架构的计算复杂度为O(n²)，上下文越长性能下降越明显
- “Lost in the Middle”现象：关键信息夹在长上下文中间时，命中率明显下滑
- 实践中上下文超过180-200K后，输出质量开始明显下滑

### 2. 真提效 vs 伪提效

**真提效特征：**
- AI能独立完成大块工作，开发者只需少量交互
- 人工只做轻量调优，不重写核心逻辑
- 生成的代码可维护

**伪提效特征：**
- 频繁交互对话，每改一点就要重新说明
- AI生成后需要50%+人工调整
- 开发者仍需承担全部心智负担

### 3. 解决方案：外置DeepResearch型Agent

**核心思路：**
- 分离"上下文准备"与"编码执行"
- 多模态输入、结构化任务、持久化分析
- 增量更新替代全量重构

## 实践指南

### 上下文管理三原则

1. **不要迷信“超长上下文”** — 就像不会把整个node_modules塞进一个bundle
2. **控制上下文规模** — 上下文越小，注意力越集中
3. **分阶段注入上下文** — 理解需求时只给需求文档，编码时只给相关文件

## 相关实体

- [Attention Collapse与上下文管理](https://github.com/QianJinGuo/wiki/blob/main/entities/attention-collapse-context-management.md)
- [Spec驱动开发](ch05/018-harness.html)
- [AI Coding效率分析](ch05/104-ai-coding.html)

## 标签

#AI编码 #前端工程 #大淘宝 #注意力机制 #上下文管理

---

