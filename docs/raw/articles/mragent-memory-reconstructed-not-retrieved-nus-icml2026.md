---
title: "MRAgent：记忆是重建的，不是检索的——Cue-Tag-Content 图上多轮主动重建"
source_url: "https://mp.weixin.qq.com/s/w6LbWyhlG9ZZxq4DCbDc7w"
ingested: 2026-06-26
sha256: ""
type: raw
---

# MRAgent：Memory is Reconstructed, Not Retrieved

新加坡国立大学提出 MRAgent，把 LLM Agent 的记忆访问从「一次性检索」改成「多轮主动重建」——在 Cue-Tag-Content 关联记忆图上边推理边探索，LoCoMo 整体得分相对最强基线提升 23%，LongMemEval 提升 32%，Token 消耗却只有 A-Mem 的 1/5。

论文标题：Memory is Reconstructed, Not Retrieved: Graph Memory for LLM Agents
论文链接：https://arxiv.org/abs/2606.06036
GitHub：https://github.com/Ji-shuo/MRAgent
ICML 2026 接收

## 问题：被动检索的两条死胡同

现有记忆方案大概两条路：

**第一类：相似度检索（Similarity-based Retrieval）**。代表方法包括 MemoryBank、Mem0 等。检索方向完全由查询决定，推理过程中无法调整。

**第二类：图结构检索（Graph-based Retrieval）**。代表方法包括 A-Mem、Zep 等。沿预定义图结构做 k-hop 邻居扩展，但扩展路径仍是预先固定的——无法根据中间证据动态剪枝或转向。

被动检索只找到 Nate 的电竞比赛记录；MRAgent 的主动重建通过推理推断出「七月」这一时间线索，进而定位 Caroline 的活动。

认知神经科学的老结论：回忆更像按线索一点点「拼」出来，不是打开仓库把整段记忆原样读走。

## MRAgent：Cue-Tag-Content 关联记忆图

### 三层结构

记忆被建模为异构图 M = (C, V, R)：
- **Cue（线索）** c ∈ C：细粒度关键词，如实体名、属性、时间标记
- **Content（内容）** v ∈ V：具体记忆条目
- **Tag（标签）**：连接 Cue 与 Content 的语义桥梁，编码关联关系

三者通过三元组 (c, g, v) ∈ R 相连。Tag 的关键作用是在访问昂贵的 episodic 内容之前，先提供语义导航——避免在大图上做无约束的 k-hop 扩展导致组合爆炸。

先通过 Cue 激活候选 Tag，再基于选定的 Tag 检索 Content——把关联推理和内容检索解耦。

### 多粒度记忆层

| 记忆层 | 存储内容 | 典型用途 |
|--------|----------|----------|
| Episodic（情景） | 特定时间点的具体事件 | 时间推理、事件回溯 |
| Semantic（语义） | 稳定的个人属性、偏好、事实 | 跳过冗长历史直达目标知识 |
| Topic（主题） | 跨多个 episode 的抽象模式 | 自顶向下定位相关事件簇 |

构建阶段保持轻量，复杂的关系推理推迟到检索阶段按需执行——这是 Token 效率优势的重要来源。

### 主动重建算法

MRAgent 把记忆访问形式化为主动重建过程，维护显式重建状态：
- Z^(t)：活跃集，包含当前步骤待探索的 Cue、Tag、Content 候选
- H^(t)：重建上下文，前几步累积的证据

**三类遍历动作：**
- 前向遍历：沿 Cue→Tag→Content 方向扩展
- 反向遍历：从已检索的 Content 反向激活新的 Cue 和 Tag，根据中间证据调整探索方向

**每轮三步走：**
1. LLM 推理与动作选择：基于查询、累积上下文和活跃集，选择本轮遍历动作
2. 受控图遍历：执行选定动作，生成候选节点集
3. LLM 路由与状态更新：评估语义关联，剪枝无关分支

循环持续直到 LLM 判定证据充分，或进一步探索不太可能带来新信息。

## 理论保证：主动检索严格强于被动检索

论文从近似理论角度给出了形式化证明。给定检索预算 T，定义两个假设类：
- H_passive(T)：LM 在推理前固定 T 次非自适应检索所能实现的预测器集合
- H_active(T)：LM 可做 T 次自适应检索所能实现的预测器集合

**定理：** 主动检索的表达能力严格强于被动检索。直觉上，主动检索能学到被动检索能学的任何函数，反之则不成立。

## 实验结果

### LoCoMo（Claude 骨干）

| 问题类型 | 最强基线 J | MRAgent J | 提升 |
|----------|-----------|-----------|------|
| Multi-hop | 75.88 (Mem0) | 90.19 | +18.9% |
| Temporal | 80.68 (LangMem) | 85.34 | +5.8% |
| Open Domain | 56.25 (Mem0) | 71.57 | +27.2% |
| Single hop | 83.12 (LangMem) | 91.10 | +9.6% |
| Overall | 78.61 (LangMem) | 88.32 | +12.4% |

Gemini 骨干下：Overall J 从 Mem0 的 68.31 跳到 84.21，相对提升 23.3%。

### LongMemEval

Overall 相对最强基线提升 32%。MRAgent*（Claude 做检索）Overall J 进一步到 86.76。

### Token 效率

| 方法 | Token 消耗 | 运行时(s) |
|------|-----------|-----------|
| A-Mem | 632k | 1,122 |
| LangMem | 3,268k | 1,210 |
| Mem0 | 245k | 533 |
| MRAgent | 118k | 586 |

MRAgent 的 Token 消耗仅 118k——不到 A-Mem 的 1/5，不到 LangMem 的 1/27。

### 消融实验

光有 CTC 图结构但关闭主动推理，性能会明显回落——图建得再好，不让 LLM 在上面走几步，multi-hop 照样拼不齐。

### 多轮推理分析

- Single-hop 和 Temporal 查询：约 3 轮即达近满分召回
- Multi-hop 查询：迭代探索带来超过 30% 的召回提升
- 自主终止：LLM 能有效判断何时继续搜索、何时停止
- 增加并行检索预算无法替代更深的重建深度——记忆推理的本质是序列依赖的

## 读完几个念头

1. **范式切换**：Mem0、A-Mem、MemoryOS 还在卷「怎么检索更准」，MRAgent 换了个问法：推理时怎么动态重建记忆？论文给出了主动检索严格强于被动检索的形式化证明。

2. **Tag 中介设计讨巧**：纯向量检索太扁，全量 k-hop 图扩展又太重；Cue-Tag-Content 卡在中间——Tag 够轻能做快速语义路由，又够结构化能撑 multi-hop 遍历。

3. **效率数字实用**：118k Token 对 632k，按 API 计费算下来，同等预算能多跑好几轮重建。

4. **成绩分化说明痛点**：Single-hop 涨得温和（83→91），Multi-hop 跳幅大（75→90），说明痛点集中在「得先推理才知道该查什么」的题型。

5. **问号**：多轮 LLM 调用在极端低延迟场景能不能扛住？构建阶段的 LLM 蒸馏一旦抽错 Tag，下游会不会一路带偏？
