# OpenViking 三论文：VikingMem 记忆管理 + TrieHI 目录感知向量检索 + VikingRAG 分层按需读取

> 📊 Level ⭐ | 6.2KB

## OpenViking 三论文：VikingMem + TrieHI + VikingRAG

字节/火山 OpenViking 团队围绕 Agent 上下文管理的三个问题各发一篇论文：**怎么记**（VikingMem，VLDB 收录，arXiv:2605.29640）、**怎么存**（TrieHI，ICDE 收录，arXiv:2606.16903）、**怎么读**（VikingRAG，arXiv:2609.11390）。

## 一、VikingMem：记忆是持续更新的档案，不是只进不出的收藏夹

Agent 记错（如预算数字过期）的根因不是没记住，而是**记得太多**：新旧内容并存，查询时都被召回但不知道该信哪条。VikingMem 把记忆分两层：**Event**（日记，何时发生了什么）与 **Entity**（档案，由算子按需调用大模型维护的"当前状态"）。维护时能直接算的（计数）不调模型，只有需要语义理解的合并与冲突判断才交给大模型。

三个关键机制：
- **写入时合并**：去掉闲聊后，把散在多轮对话的同一件事合成一条完整记录——去掉这一步 LoCoMo 得分从 88.83 掉到 83.51，是所有环节中影响最大的。
- **旧事衰减**：近期保留细节，久未提及的压缩成周报/月报式摘要。
- **低成本档案更新**：模型只输出"改动"（旧文字→新文字），系统按编辑距离定位原地替换，不再调一次模型——单次抽取成本从 $0.35 降到 $0.07（-80%），得分基本不变。

**实验数据**：LoCoMo 88.83 vs 第二名 MIRIX 78.66 vs 全历史塞给模型 77.47（信息最全分数反而更低）；查询延迟 ~0.2s（MIRIX 10s+）；存储只占原始记录约 1/6；LongMemEval 75.80 vs 63.81（+11.99pp）。搜索结果再做 ColBERT 式多向量精排，向量写入时算好并压缩。已在 100+ 真实企业应用上线。

## 二、TrieHI：目录不是给人看的，是搜索的边界

两个项目同名《技术方案》拿错的根因：向量数据库没有文件夹概念，所有资料在同一空间按内容相似度召回。TrieHI 把目录存成树，每个文件夹挂一张清单（该目录及所有子目录的资料索引）；搜索时先定位文件夹、只在清单内候选做向量检索；移动文件夹只更新沿路几个上级清单，资料本体不动。目录清单定位耗时从 365ms 降到 273μs（**1000+ 倍**）。

OpenViking 实现为 `viking://` 统一 URI：`ov find viking://projects/项目A "技术方案"`——Agent 先浏览目录结构再自己决定进哪层找。这与通用文件系统组织知识、记忆和技能的定位一致。

## 三、VikingRAG：先看简介再下钻，按需读取 + 经验路线复用

人查资料的习惯（先看目录→定位→细读→够了就停）被显式建模为 **L0/L1/L2 三层读法**：L0 一句话简介判断相关性、L1 目录概要决定下一步、L2 完整原文。每读完一段检查证据是否足够，够了就停止查询。

- **VikingRAG-E（Experience Edge）**：记住"上次问什么、从哪开始、在哪找到"，下次相似问题直接沿路线取回。与知识图谱的区别：KG 记"A 与 B 有什么关系"，Experience Edge 记"上次问这类问题最后在哪儿找到的"。
- **VikingRAG-E+（自适应先快后全）**：先快速查找，证据足够直接答，不够才进完整多轮查找。
- **实验**：六个结构化文档数据集上准确率基本持平，token 用量仅为高准确率方法的 11.6%–51.9%（加 E/E+ 后 5.1%–32.5%）。短板：**"数据足够可以停"的判断仍有 >5% 误判**；L0/L1/L2 与经验记忆已上线，自适应先快后全仍在实验阶段。

## 四、组合效果与定位

三项合起来的实测：LoCoMo 问答准确率接 OpenClaw/Hermes/Claude Code 后从 24%–57% 升到 80%–83%（查询时间与输入 token 同降）；HotpotQA 91% 准确率、每题 ~1.25 万 token、检索 0.23s（LightRAG 同实验 89% / 2.8 万 token / 75s）。

与库内 [OpenViking 经验记忆](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openviking-experience-memory-agent-evolution-loop-2026.md) 的关系：那篇讲 **Experience 层**（Session→Trajectory→Experience 进化闭环，跨会话学习"怎么做"）；本篇三论文讲 **基础设施层**（记忆怎么存对、目录怎么圈范围、文档怎么按需读），两篇互补构成 OpenViking 完整记忆/检索栈。Event/Entity 双层与 [Context Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md) 的分层上下文思想互证。

## 相关实体

- [OpenViking 经验记忆进化闭环](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openviking-experience-memory-agent-evolution-loop-2026.md)
- [Context Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md)
- [美团评测方法论](https://github.com/QianJinGuo/wiki-public/blob/main/entities/meituan-turing-agent-evaluation-methodology-2026-08-06.md)——同属"Agent 生产环境工程化"叙事，评测侧对照

→ [原文存档](https://mp.weixin.qq.com/s/-7LmtflPn2xyTlwhqI2szw)

---

