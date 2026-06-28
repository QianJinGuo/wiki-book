## Ch02.016 LLM Wiki 架构

> 📊 Level ⭐⭐ | 8.7KB | `entities/llm-wiki-architecture.md`

## 核心定位
**RAG vs LLM Wiki 区分：**   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

- RAG = 「把资料找出来」——查询时检索原始片段，现场综合回答
- LLM Wiki = 「把读过的资料组织起来」——把合成提前到导入阶段，中间成果持久化保存
两者非替代关系：**RAG 保持原文依据，LLM Wiki 保存可复用的知识结构**，最佳架构往往是两者配合。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

## 架构四层
```  
Raw Sources (原始资料)  
     ↓  
Ingest / Knowledge Compile (两阶段)  
     ↓  
Markdown Wiki 文件树 (持久化层)  
     ↓  
Query / Update Loop (查询仍需检索)  

## ## 相关实体
```  

### 1. Raw Sources（真相来源）
原始资料层（论文、网页、PDF、代码仓库等）。**原则：Raw Sources 是地图背后的地形，Wiki 是地图，不是领土。** 合同条款、实验数据、法规原文等关键内容，Wiki 只做入口，不能替代原文。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

### 2. Ingest / Knowledge Compile（核心引擎）
两阶段设计：   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

把「结构判断」和「页面写作」分开，在写入前暴露关系、冲突和缺口。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
**根本局限：** LLM 的抽取和归纳是非确定性的，同一份资料不一定生成完全相同的 Wiki——这不是编译器，是动态草稿。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

### 3. Markdown 文件树（持久化层）
典型结构：   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
| 文件/目录 | 作用 |  
|---------|------|  
| index.md | 知识库入口，导航索引 |  
| log.md | 操作历史（导入/更新/查询） |  
| overview.md | 整体概览 |  
| sources/ | 原始资料引用 |  
| entities/ | 人物/项目/组织实体页 |  
| concepts/ | 概念/主题/方法论页 |  
| queries/ | 查询过程与中间结果 |  
核心意义：知识变成可打开、可编辑、可审查、可版本管理的文件，而非临时回答。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

### 4. Query / Update Loop
查询时仍需检索 Wiki 页面（必要时回 Raw Sources），将选中的 Wiki 页面 + 原文片段 + 日志历史打包进上下文，再由 LLM 推理回答。有价值的回答保存回 Wiki——但应视为「可审阅更新」而非「自动真理」。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

- [agent 记忆注入实战：5 维框架（选什么/放哪里/怎么放/放多少/何时放）+ 4 前沿论文（memguide/sti](ch01-325-hermes-agent-kanban-cli-orchestrator.html)

## 与其他知识系统对比
| 方案 | 核心 | 优点 | 局限 |  
|------|------|------|------|  
| RAG | 查询时检索片段 | 事实锚点强，启动成本低 | 不沉淀结构化理解 |  
| 笔记软件 | 人手动整理 | 可控、准确 | 维护成本高 |  
| 传统知识库 | 人维护稳定文档 | 规范稳定 | 难快速演化 |  
| **LLM Wiki** | **LLM 辅助维护 Markdown Wiki** | **可读可改可复用可持续** | **摘要漂移/错误固化/非确定性** |  

## 四大风险
1. **信息损失：** 摘要压缩丢失细节/限制/例外   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
2. **摘要漂移：** 多次改写后偏离原始材料   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
3. **冻结错误：** 错误写进 Markdown 后被持续复用   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
4. **非确定性：** 同一资料生成不同 Wiki 版本   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

## 适用边界
**适合：** 个人研究资料整理、长期项目知识库、代码仓库理解、AI Agent 长期工作记忆。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
**不适合：** 法律、医疗、金融、合规审计等强事实一致性场景（Wiki 只能做入口，不能替代原始证据）。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

## 实践原则
1. 保留 raw/——Wiki 不替代原始资料   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
2. 先建立 index.md + log.md，保证入口和变更记录   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
3. 每页保留来源链接，方便回查   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
4. 关键概念页设人工 review   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
5. 增加 lint 规则（断链、孤立页、缺失来源检查）   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

## 与本 wiki 的关系
本文描述的 LLM Wiki 架构与本知识库高度吻合——本 wiki 的 entities/、raw/、index.md、log.md 结构正是 LLM Wiki 模式的具体实现。Karpathy 的框架为理解本 wiki 的设计选择提供了理论支撑。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

## 深度分析
LLM Wiki 体现了一种范式转移：从"检索已有知识"到"构建可演进知识体"。RAG 的核心局限在于每次查询都是独立的，知识无法跨查询累积；而 LLM Wiki 在 Ingest 阶段完成综合，使知识本身变得**有状态**。这意味着 Wiki 层随查询次数增加而持续优化，而非每次查询重新从碎片化片段拼装。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
然而这一范式并非银弹。LLM Wiki 的质量上限由 Schema 决定——Schema 设计差，Wiki 层会系统性积累错误结构，且修正成本极高（需重新 Ingest 全量文档）。这与"设计先行，验证在后"的传统知识工程逻辑高度一致，但 LLM 的非确定性使问题复杂化：同一份资料不一定生成完全相同的 Wiki，摘要漂移和冻结错误是四大核心风险。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
从成本角度看，LLM Wiki 的 Ingest 综合成本一次付清，后续查询几乎零边际成本。当单文档月查询量超过 100 次时，LLM Wiki 的总拥有成本开始优于 RAG。这对高频查询场景（如内部知识库、代码文档）极具吸引力。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

## 相关链接
- Llm Wiki Architecture

## 实践启示
1. **最小可用 Schema 起步**：先定义核心实体类型和必须的关系，通过 3-5 个真实查询案例验证 Schema 充分性后再扩展。Karpathy LLM Wiki V2 的 5 项升级中，Schema 优化是核心。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
2. **RAG + LLM Wiki 混合架构**：RAG 负责广覆盖检索（快速找到相关文档），LLM Wiki 负责深度沉淀（关键步骤的标准化实体页）。设计好两个系统之间的接口——RAG 检索结果作为 LLM Wiki Ingest 候选素材。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
3. **关键场景优先迁移**：员工手册、产品规格书、内部流程文档等"写完很少改、天天有人查"的场景是 LLM Wiki 的最优起点。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]
4. **保持 Raw Sources 不可替代**：Wiki 是地图，不是领土。合同条款、实验数据、法规原文等关键内容，Wiki 只做入口，不能替代原文。   ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/llm-wiki-architecture-karpathy-markdown-knowledge-base.md) ^["LLM Wiki 架构解析：Karpathy 的 Markdown 知识库模式 (2026-05-20)"]

- 上下文工程：三种 Agent Memory 方案对比实验

---
