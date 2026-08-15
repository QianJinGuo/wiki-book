# AML（Agent Memory Leaderboard）：机制级 Agent 记忆评测榜单

## Ch06.031 AML（Agent Memory Leaderboard）：机制级 Agent 记忆评测榜单

> 📊 Level ⭐⭐ | 5.6KB | `entities/agent-memory-leaderboard-aml-2026.md`

# AML（Agent Memory Leaderboard）：机制级 Agent 记忆评测榜单

## 核心定位

**AML（Agent Memory Leaderboard，记忆之巅排行榜）2026-08-12 发布首期结果**，由清华、北大、人大、上海交大、浙大、复旦、中科大、南大、上海人工智能实验室、中科院自动化所等国内外数十所高校与研究机构联合主办，Datawhale 参与——是业内首个关注 Agent 记忆系统的**机制级榜单**。上线十天内 136 个团队注册参评，官方站点点击量突破 20 万次。

## 评测设计：机制隔离是核心创新

AML 与既有记忆基准（[Agent-Memory 评测全景](../ch04/180-agent-memory.html) 覆盖的 MUSE/LOCOMO/MemoryAgentBench 等 9 大方案）的关键区别在于**机制级变量控制**：

- **统一提供生成模型和评分模型**，将参评方案的发挥空间集中在检索与召回环节——避免"最终效果分不清来自底层模型还是记忆模块"的经典混淆问题
- **双维度矩阵**：类型分文本记忆/代码记忆两条赛道 × 组别分学术方法榜/商业产品榜
- 文本赛道考察：事实召回、多跳整合、时序理解、记忆治理、个性化、规则执行、安全与隐私
- 代码赛道考察：从历史工程任务中检索并复用调试经验与项目上下文
- **防刷分机制**：公开子集 + 私有盲测集相结合，评测分数与代码 Commit/镜像版本绑定，降低硬编码与测试集过拟合可能

## 首期榜单结果

| 榜单 | 第一名 | 分数 | 紧随其后 |
|------|--------|------|---------|
| 商业产品榜·文本赛道 | **MemoraX** | 58.0 | MemOS、NTES-MEMORY-SMART |
| 开源方法榜·文本赛道 | **InvMem** | 45.1 | Refind、ActiveMemoryIndex |

MemoraX 在系统稳定性、信息检索与召回等方面表现突出，体现工程落地能力。Hybrid Search、ChronoHybridMem 等方案也取得靠前成绩。

## 行业信号

**Agent 记忆系统尚未形成单一主流路线**——动态记忆索引、混合检索等方向仍在持续演进，学术界与开源社区加快探索迭代。AML 将常态化更新并推出技术复盘。

## 2nd Source — 机器之心（2026-08-14 首期揭榜报道）

AML 首期榜单发布后 48 小时内，GitHub、Hugging Face 及 Twitter/X 等海内外技术社区引发爆发式讨论。机器之心将这一事件定位为 Agent 长期记忆赛道的 **"ImageNet 时刻"**——长期记忆（Long-term Memory）是实现 Agent 长期协作的基础，决定其能否摆脱"永远从头开始"的西西弗斯困境。

**互补角度**：
1. **MemoraX 全维度统治**：首期榜单中 MemoraX 以 58.0 高居商业产品榜榜首，并在文本类记忆全部 7 个能力维度位列第一（事实召回、多跳整合、时序理解、记忆治理、个性化、规则执行、安全与隐私）
2. **社区反响数据**：榜单发布 48h 内 GitHub/HF/X 引发爆发式讨论，标志 Agent 记忆评测进入公众视野
3. **记忆痛点的工程化表述**：将长期记忆问题具象化为"API 账单指数级爆炸 + 冗长噪音信息海洋中的幻觉 + 失效规则反复执行 + 过期偏好无法清除 + 上轮踩坑下轮重演"五大工程痛点

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agent-memory-leaderboard-aml-jiqizhixin-first-round-2026-08-14.md)

## 相关实体

- [Agent-Memory 评测全景（9 大方案）](../ch04/180-agent-memory.html) — 2026-06 综述，AML 是其"机制隔离"路线的后继基准
- [Mem0/Letta/Zep/VoltMem 对比](../ch04/180-agent-memory.html)
- [Agent 记忆架构本质](../ch04/180-agent-memory.html)
- [记忆存储工程实践](../ch04/180-agent-memory.html)
- [AI Agent 记忆系统](../ch04/180-agent-memory.html)
- [Agent 记忆架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-architecture.md)
- [Agent 评测基准](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-evaluation-benchmarks.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agent-memory-leaderboard-aml-2026.md)

---

