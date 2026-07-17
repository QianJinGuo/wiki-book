# Agentic时代用户主导个性化推荐范式

## Ch04.610 Agentic时代用户主导个性化推荐范式

> 📊 Level ⭐⭐ | 3.5KB | `entities/user-governed-personalization-agentic-recommendation-paradigm-2026.md`

# Agentic时代用户主导个性化推荐范式

由UIUC、UT Austin、CMU、NYU、UC Berkeley、Northeastern University等多校研究团队联合提出的position paper，系统性论证了在Agentic时代，个性化推荐将从平台中心范式转向用户主导个性化（User-Governed Personalization）的结构性变化。

## 平台中心范式的结构性限制

论文指出，平台无法获得完整用户画像不是因为推荐算法不够强，而是面临四重结构性data barrier：竞争壁垒（用户数据是平台核心护城河，平台间无动机共享）、监管壁垒（DMA/GDPR限制跨服务数据合并）、隐私壁垒（用户不愿意将所有数据交给单一平台）、以及认知壁垒（平台看到行为但看不到动机）。平台只能记录**what**，却很难知道**why**。

## LLM Agent作为用户侧数据理解与决策代理

LLM Agent使User-Governed Personalization第一次具备可操作性：Agent能读取JSON、CSV、HTML等不同格式的个人数据，将跨平台数据与用户自然语言指令结合，执行偏好建模、总结、推理、解释，并调用外部工具执行搜索、筛选和推荐任务。核心不对称性在于：平台和用户都可以使用同样的大模型，但只有用户能合法、自然地聚合跨平台与线下信息——给定同样的大模型，谁拥有更完整的用户上下文，谁就更有可能做出更好的个性化判断。

## 实验验证

15名参与者的proof-of-concept实验采用Claude Code（Sonnet 4.6、Opus 4.6、Opus 4.7）作为Agent。

**任务一：Amazon future-purchase prediction**。使用Amazon-only vs Amazon+Google跨平台数据，加入Google数据后Hit@5从86.6提升至90.0，NDCG@5从64.8提升至68.4，Recall@5从60.1提升至63.9，所有提升统计显著。

**任务二：YouTube video recommendation**。在reinforcement和exploration两种推荐模式下，加入跨平台数据后用户继续观看意愿均显著高于YouTube-only设置。

## 推荐系统Agent化路径

论文提出从platform-mediated recommendation向user-mediated recommendation演进的路线图，涵盖数据聚合层、用户偏好理解层、跨平台协调层和决策执行层四层架构。关键基础设施包括：数据可携带权（GDPR）、标准化数据格式、端侧Agent运行环境、以及用户授权与隐私保护机制。维基已有huawei-fuxi-recommendation-system-ascend-npu-scaling-law（华为推荐系统）和onereason-kuaishou-reasoning-recommender-system（快手推理推荐）等推荐系统实体，本实体关注的是Agent如何从根本上改变推荐的权力结构。

-> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/user-governed-personalization-agentic-recommendation-paradigm-2026.md)

---

