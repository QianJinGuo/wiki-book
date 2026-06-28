## Ch06.012 MemOS Hermes 记忆插件

> 📊 Level ⭐⭐ | 11.9KB | `entities/memos-hermes-plugin.md`

## Overview
MemTensor 团队为 Hermes Agent 开发的本地记忆插件。让 Hermes 从"记得住但记得乱"变成"存得聪明、找得准"。
开源地址：https://github.com/MemTensor/MemOS/tree/main/apps/memos-local-plugin
文档：https://memos-docs.openmem.net/cn/openclaw/hermes_local_plugin

## 核心问题：Hermes 原生记忆的痛点
Hermes 原生把每轮对话直接存 SQLite，检索用文本匹配：
**问题**：

- 同一信息在不同对话里反复提到 → 大量重复条目
- 过时的、矛盾的内容全部堆在一起 → 记忆库变成大杂烩
- 文本搜索：关键词对不上就搜不到（例："某某餐厅味道不错"搜"好吃"搜不到）
- 技能生成用跑 Agent 的同一模型，质量参差不齐

## MemOS 插件核心能力
### 1. 存得聪明：四步处理链
```
语义分片 → LLM 摘要 → 向量化 → 智能去重
```
**最有价值的部分：智能去重**

- 不是简单文本比对
- 让 LLM 判断当前内容是：重复 / 需要更新 / 全新
- 例："在减肥"后说"放弃减肥" → 自动识别为更新，合并成一条，记录合并历史
效果：记忆库始终保持干净状态，不会越用越乱。

### 2. 找得准：混合检索引擎
双通道并行：

- **全文搜索**：关键词匹配
- **向量语义搜索**：语义理解
然后经过：融合排序 → 多样性去重 → 时间衰减 → 相关性过滤
**效果**：关键词对不上也能搜到。例如原文"某某餐厅味道不错"，搜"好吃"也能命中。
**主动注入**：每轮对话开始时，系统自动用最新消息做预检索，把相关记忆注入上下文。没命中时还会提示 Agent 主动搜索。

### 3. 技能进化：三级独立模型配置
| 处理环节 | 模型选择 |
|---------|---------|
| Embedding | 轻量模型 |
| 摘要 | 中等模型 |
| 技能生成 | 最强模型 |
加规则过滤 + LLM 评估，只生成**可重复、有价值**的任务技能。
**降级机制**：技能模型挂 → 摘要模型 → Hermes 原生模型，全程无需手动干预。

### 4. 多 Agent 协同
**第一层：同机器多 Agent**

- 独立记忆空间
- 共享公共记忆和技能
**第二层：跨机器 Hub-Client 架构**

- 私有数据始终留在本地
- 只有明确共享的内容对团队可见

### 5. 自带管理面板
`http://127.0.0.1:18901`，7 个管理页面：
| 页面 | 功能 |
|------|------|
| 记忆浏览和搜索 | 可视化查看记忆库 |
| 任务管理 | 查看历史任务 |
| Skill 管理 | 管理生成的技能 |
| 分析统计 | 记忆库统计 |
| 工具调用日志 | 调用记录 |
| 数据导入 | 外部数据导入 |
| 在线配置 | 实时配置调整 |
密码保护，只允许本地访问。

## 安装
```bash
curl -fsSL https://raw.githubusercontent.com/MemTensor/MemOS/openclaw-local-plugin-20260408/apps/memos-local-plugin/install.sh | bash
```
前置：Node.js ≥18、Python 3、Hermes Agent 已装好。
完全本地化，零云依赖，数据存本机 SQLite。

## 使用体验
**优点**：

- 记忆检索准确率提升明显，之前搜不到的历史信息现在基本都能找到
- 记忆去重有效，不会出现同一信息存七八条
**局限**：

- 第一次用会多消耗一些 token（模型做摘要和向量化）
- 偶尔用一下 Hermes 的人感受不到太大差别，价值在**长期使用**中逐渐体现

## 使用场景
| 场景 | 价值体现 |
|------|---------|
| 长期高频使用 Hermes | 记忆检索准确率明显提升，历史信息不再搜不到 |
| 多 Agent 团队协作 | 公共记忆共享，避免每人从头积累 |
| 跨机器协同 | Hub-Client 架构保证私有数据本地，共享内容可控 |

## 一句话总结
> **Hermes 让 Agent 能干活，MemOS 让它越干越聪明。**

## 深度分析
1. **LLM 判断去重突破文本相似度瓶颈** — 传统去重（simhash、embedding distance）只能发现字面重复，MemOS 用 LLM 判断"重复 / 需要更新 / 全新"，能捕捉"在减肥"→"放弃减肥"这类语义反转。这将去重从"找相同"升级为"理解变化"，从根本上解决了记忆库随时间腐化的问题。
2. **三级模型分离 + 降级链是系统工程思维** — 不是用一个最强模型处理所有记忆任务（embedding、摘要、技能生成），而是按任务匹配模型强度，再构建"技能模型→摘要模型→Hermes 原生"降级链。这种设计保证任意环节模型故障不影响系统整体可用性，是生产级系统的必备特征。
3. **主动记忆预注入 vs 被动检索** — 多数记忆系统在对话需要时才开始检索，MemOS 在每轮对话开始时主动用最新消息预检索相关记忆并注入上下文，未命中时还提示 Agent 主动搜索。这一设计将记忆从"被动响应"变为"主动供给"，显著降低关键信息被遗漏的概率。
4. **Hub-Client 跨机器架构的隐私分层模型** — 私有数据始终本地、只有显式共享内容对团队可见。这代表多 Agent 协作设计中"隐私优先"的思想，与 OpenClaw 架构的本地优先理念一脉相承，也是企业部署的关键考量。
5. **长期使用才有价值的工程设计逻辑** — 首次使用多消耗 token（摘要 + 向量化），但长期积累后检索收益远大于初始成本。这种设计明确面向高频用户，解释了为什么"偶尔用一下 Hermes 的人感受不到太大差别"——这是刻意的产品取舍，不是缺陷。

## 实践启示
1. **为记忆系统设计去重逻辑时，优先判断内容是否代表"状态更新"而非仅判断"是否相同"** — 实现方式是每次存入新记忆前，让 LLM 回答三个选项：重复（丢弃）、需要更新（与已有条目合并）、全新（追加）。合并时保留历史版本和合并时间戳，支持回溯。
2. **构建多模型协作的记忆架构时，用三级模型分离 + 降级链保证韧性** — embedding 用轻量模型（如 bge-small）控制向量检索成本；摘要用中等模型；技能生成用最强模型。降级链配置为：技能模型 → 摘要模型 → Agent 原生，每级都应能独立完成处理。
3. **在对话轮次开始时实现主动记忆预注入，而非被动等检索** — 用当前用户消息做预检索 query，将 Top-K 结果和置信度一并注入上下文；设定相似度阈值（如 <0.6）时主动提示 Agent"相关内容较少，建议主动搜索"。
4. **多 Agent 协作场景下采用"本地私有 + 按需共享"的数据分层** — 每个 Agent 有独立记忆空间，公共记忆和技能库单独管理；跨机器共享时只传递明确标记为 shared 的条目，敏感数据不离开本地节点。
5. **评估记忆插件价值时拉长时间周期，而非单次使用成本** — 建议记录"首次命中失败但长期积累后成功检索"的案例数，作为记忆系统ROI的核心指标。单次使用感受不到价值是预期行为，设计演示场景时应展示"三个月后还能精准召回三个月前的信息"。

## 关联分析
|| 相关文章 | 关联点 |
|---------|--------|
|| [Hermes Agent](ch04-418-hermes-agent.html) | MemOS 是 Hermes 的记忆插件，解决 Hermes 记忆乱的痛点 |
|| [Claude Code 架构解析](ch01-571-claude-code-架构解析.html) | Claude Code 的 Query Loop 含上下文管理，和 MemOS 的记忆注入思路一致 |
|| [AgentCore Harness](ch04-206-agentcore-managed-harness.html) | AgentCore 管运行时，MemOS 管记忆，是不同维度的 Agent 基础设施 |
**核心洞察**：Harness Engineering（AgentCore）和记忆工程（MemOS）是 Agent 走向生产的两个不同维度——前者管"运行"，后者管"记忆"。

## Related
- [原始文章存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/memos-hermes-plugin.md)
- [Hermes Agent 记忆系统深度拆解](ch04-068-hermes-agent-记忆系统深度拆解.html)
- [AI Agent 工程师能力地图](ch04-139-apache-rocketmq-5-5-0-litetopic-ai-agent.html)
## 相关实体
- [Ai Task Scheduling Dynamic Hibernate Aliyun Mse](ch01-744-ai-anthropic-1-2-openai.html)

- [Tencentdb Agent Memory Context Offloading](ch04-175-context-agent.html)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](ch01-642-mozilla-warns-uk-breaking-vpns-will-not-magically-fix-brita.html)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](ch01-702-microsoft-for-startups-microsoft.html)
- [龙虾装上了可以用来干啥分享下我的 Openclaw 多智能体团队搭建经验 V2](ch01-715-gpt-image-2.html)
- [Openclaw Boris Cherny Agent Loop Design Patterns](ch01-835-3-0.html)

---
