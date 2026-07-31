# QQ浏览器团队经验管理系统：从AI Coding对话中提纯团队经验

## Ch04.480 QQ浏览器团队经验管理系统：从AI Coding对话中提纯团队经验

> 📊 Level ⭐⭐ | 6.4KB | `entities/team-experience-management-ai-coding-tencent-qqbrowser.md`

# QQ浏览器团队经验管理系统：从AI Coding对话中提纯团队经验

QQ 浏览器平台技术团队（腾讯 CSIG）基于 CodeBuddy Plugin 搭建了一套从 AI Coding 对话中自动提取、治理、召回团队经验的完整系统。核心创新在于三层治理管道（Review/Dedup/Merge）和"三镜头"认知障碍框架，将初版 90% 的抽取垃圾率降至治理后 95% 的有效率，最终入库率约 80%。

## 问题定义：经验断层

团队使用 AI Coding 时面临四类问题：
1. **经验即抛** — session 纠偏产出的经验，session 结束即清零
2. **重复踩坑** — 隐性工程约束（如"stop hook 不能同步上报"）不在文档中，换人换 session 大概率照踩
3. **知识碎片化** — 老同事的 pattern 无动力书面化
4. **AI 永远是"新同事"** — 每次进项目从零开始，缺乏团队语境

## 核心设计：从 Agent 视角定义经验

判定标准：**被召回后，Agent 能否产生正向的行为变更**。

### 三镜头框架

文章提出了**三镜头（Three Lenses）**框架，将"Agent 不容易直接发现"的信息分为三类：

| 镜头类型 | 认知障碍 | 例子 |
|---------|---------|------|
| **黑话镜头** | 语义不可发现 | "D 站"字面只是字母 D，实际指盗版站点 |
| **索引镜头** | 位置不可发现 | "直达页面功能在 xhome 模块，关键类是 FastCutXXX" |
| **逻辑镜头** | 行为不可发现 | stop hook 同步上报——AI 推理不出并发阻塞风险 |

## 系统架构

### 管道流程

对话上报 → 主题分组 → 经验抽取 → Review → Dedup → Merge → 入库 → 召回统计

### 三层治理

**1. 抽取（Extraction）**：归纳九类典型垃圾特征（事实性错误、通用常识、对话摘要、一次性 case 等）。以 Recall/Precision/Garbage Rate 三指标驱动 Prompt 迭代。

**2. Review**：入库前精准拦截明确垃圾。策略：**默认保留、定向过滤**。特色创新是**源码探索（Code Explorer）**：对候选经验中提到的代码方法名在源码库中做事实验证，拦截不存在的方法调用。例如某经验声称 FastScrollBar 有 attachToQBListView() 方法，源码检索发现该类只有 attachToRecyclerView() 和 attach()，正确方法属于 FastScrollBarCompat.attachToQBRecyclerView()。

**3. Dedup**：宁严勿宽，禁止桥接合并。当 What 和 When 均相同时 Recall 达 91.67%；整体 F1=71.79%。

**4. Merge**：唯一目标先行，保护历史边界。六轮实验 157 样本，整体 F1=94.27%。Create 最稳定（F1=96.46%），Update 存在"积极合并"倾向（Recall 96.30% 但 Precision 78.79%）。

## 生产数据

- **规模**：6 个仓库，50+ 研发人员
- **数据量**：1,236 次独立对话 → 1,022 条候选经验 → 最终入库 **789 条**高置信经验
- **管线已稳定运行 30+ 次**
- **召回表现**（125 次真实检索）：请求级召回率 68.8%，no_hit 仅 4.8%，平均注入 2.4 条经验，平均检索耗时 1,299 ms

### 基础设施

底层复用公司已有设施：IWIKI 经验空间落库 → Knot 知识库自动索引（向量+关键词） → Agent 通过 Knot MCP 协议实时检索。

## 四条方法论

1. **先定义资产边界，再做自动化沉淀**
2. **分层治理，别用一个 prompt 解决所有问题** — Review/Dedup/Merge 各层目标不同、prompt 不同
3. **默认策略按业务风险分别设计** — Review 默认保留、Dedup 宁严勿宽、Merge 保护历史边界
4. **Prompt 优化从错例中抽象规则** — 固定流程：收集错例→识别误判类型→抽象规则→多轮实验→固定评测集

## 与业界方案对比

本文系统性地对比了 ClaudeCode AutoDream（单会话自动记忆整理）、Hermes Agent（Prompt 驱动 memory）、Mem0（长期记忆基础设施），指出共同局限：聚焦"个人记忆"而非"团队质量"。本系统追求"留下更少但更可信"——带适用场景、约束边界、来源证据的工程经验。

## 风险与未来方向

三层治理后垃圾率降至约 5%，但仍有三个未闭合的环：
- **生产阶段**：源码探索只覆盖部分场景，事实性错误仍难纯文本识别
- **召回阶段**：命中≠采纳，缺乏观测 Agent 行为变更的手段
- **生命周期**：无自动淘汰机制，项目演进时历史经验可能集体失效

---
**相关条目**
- [腾讯 AI 编程实践](../ch05/112-ai-coding.html)
- [腾讯 TAB Harness 生产实践](../ch05/009-harness.html)
- [腾讯团队知识 Harness](../ch05/009-harness.html)
- → [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/ai-coding-team-experience-management-tencent-qqbrowser.md)

---

