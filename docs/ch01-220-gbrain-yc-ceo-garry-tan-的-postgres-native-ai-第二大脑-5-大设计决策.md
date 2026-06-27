# GBrain — YC CEO Garry Tan 的 Postgres-native AI 第二大脑：5 大设计决策 + 零 LLM 知识图谱 + 8 阶段检索 + Brain⊥Source 正交维度

## Ch01.220 GBrain — YC CEO Garry Tan 的 Postgres-native AI 第二大脑：5 大设计决策 + 零 LLM 知识图谱 + 8 阶段检索 + Brain⊥Source 正交维度

> 📊 Level ⭐⭐ | 16.4KB | `entities/gbrain.md`

## 概述
GBrain 于 2026 年 4 月初开源，十几天内斩获 9K+ Star。其核心解决的是 AI Agent 的"金鱼脑"问题——每次开聊都从零开始，昨天告诉它的事今天就当没发生过。
Garry Tan 本人用 GBrain 运行自己的日常 Agent：17888 个页面、4383 个人物、723 家公司、21 个定时任务全自动运转。
整套项目仅用 12 天完成开发。

## 与 GStack 的关系
- **GStack**：教 Agent 怎么写代码（7 万+ Star，每天 3 万开发者使用）
- **GBrain**：教 Agent 怎么记事和思考
两个项目相互独立，可单独使用，也可组合。`hosts/gbrain.ts` 是连接两者的桥梁——GStack 的编码 Skill 在动手写代码前会先查 GBrain 脑子，确认之前是否讨论过或决定过什么。
两者共同实践了 Garry Tan 的  哲学。

## 核心架构
### Compiled Truth + Timeline 知识模型
每个 brain page 分两层：

- **Compiled Truth**（上层）：当前最佳理解，可被随时改写——认知随新接触不断刷新
- **Timeline**（下层）：只追加不删除，记录每条原始证据
设计目的：既要让认知进化，又不能丢失历史。之前的笔记工具要么覆盖式更新（丢历史），要么纯追加（查的时候一团乱），GBrain 的分层兼顾两者优点。

### 25 个 Skill 即插即用
两个常驻 Skill：

- **signal-detector**：每条新消息进来自动后台运行便宜小模型，抓取随口说的观点和提到的人/公司
- **brain-ops**：Agent 回答前先去脑子查一遍，查不到再调外部 API——解决 AI 瞎编问题
其他 Skill 覆盖：会议、邮件、推特、PDF、视频、GitHub 仓库摄入；cron 调度、每日简报、引用自检、过期页面巡检等运维类任务。

### 混合搜索 + 实体自动升级
搜索：向量 + 关键词 + RRF 融合 + 多查询扩展 + 4 层去重。
实体自动升级机制：

- 被提及 1 次 → 生成 stub 页面
- 被提及 3 次以上 → 自动联网从 LinkedIn/Twitter/公司主页补料
- 被提及 8 次以上或开过会 → 走完整管线，生成详细 dossier
fail-improve 循环：意图分类器从第一周的 40% 确定性提升到 87%。

### 能打电话的脑子
集成 Twilio + OpenAI Realtime——打电话进去时 AI 已从脑子拉出对方全部上下文（上次聊天内容、合作项目、未结话题）。通话结束后自动生成 brain page，包含完整转录、实体识别、与已有页面的交叉引用。

## 部署方式
**路线 A（推荐）**：让 Agent 自己装。将 prompt 贴入 OpenClaw 或 Hermes Agent：
```
Retrieve and follow the instructions at: https://raw.githubusercontent.com/garrytan/gbrain/master/INSTALL_FOR_AGENTS.md
```
约 30 分钟完成。
**路线 B**：本地 CLI 体验：
```bash
git clone https://github.com/garrytan/gbrain.git && cd gbrain && bun install && bun link
gbrain init        # 本地脑子，2 秒拉起
gbrain import ~/notes/
gbrain query "我的笔记里反复出现的主题是什么?"
```
默认使用 PGLite（嵌入式 Postgres），零配置。超过 1000 个文件或多设备同步时，`gbrain migrate --to supabase` 迁移到 Supabase。
**路线 C**：接入 Claude Code / Cursor——自带 30+ MCP 工具，通过 stdio 暴露：
```json
{
  "mcpServers": {
    "gbrain": { "command": "gbrain", "args": ["serve"] }
  }
}
```

## 设计哲学
GBrain 背后是 **Thin Harness, Fat Skill** 哲学：把智能放在 Skill 里，Runtime 越薄越好。
Garry Tan 的观点：**Skill 文件就是代码**，是目前做知识工作最强的载体。
**性能基准**：P@5 49.1%、R@5 97.9%。关闭 KG 功能后 P@5 下降 31.4pp，优于纯 ripgrep-BM25+向量 RAG 。

## 深度分析
### Thin Harness, Fat Skill 哲学的完整实现
GBrain 是 Garry Tan `` 哲学在记忆与认知领域的完整实践。GStack 管编码执行，GBrain 管记忆与推理——两者共同构成一个轻 Harness 上长出胖 Skill 的 Agent 系统 。
Runtime 极薄：只有 25 个 Skill 的加载器和调度器，所有智能逻辑都在 Skill 文件里。Skill 文件即代码，是目前知识工作最强的载体——这是 Garry Tan 的核心论点 。

### Compiled Truth + Timeline 的认知价值
传统笔记工具两难：覆盖式更新丢失历史，纯追加无法形成有效认知。GBrain 的双层设计破解了这一困境 ：

- **Compiled Truth 层**：当前最佳理解，可被随时覆写——认知随新接触不断刷新
- **Timeline 层**：只追加不删除，每条原始证据都有时间戳和来源
这本质上是让 AI Agent 拥有了"进化中的记忆"，而非静态的文档库。

### 8 层架构的认知升维
传统 RAG 只到"找得到"，GBrain 的 8 层架构实现了从检索到记忆再到认知的跃迁 ：
| 层 | 名称 | 本质 |
|----|------|------|
| 1-4 | 基础检索强化 | 让相关内容能被找到 |
| 5 | Reranking | 92% 的第一名结果在此步变动——排序即认知 |
| 6 | **Epistemology** | 记录来源/时间戳/置信度，知识的知识 |
| 7 | Entity KG | 14 万+关联边，构成关系网络 |
| 8 | Dreaming Loops | 闲时自主合并同类项、修补逻辑断层 |
网友称第 6 层为"真正护城河"——因为它让整个系统可知可溯，而非黑箱生成 。

### 实体自动升级的价值
不需要人工标注重要性，系统通过提及频率自动判断：1 次生成 stub → 3 次联网补料 → 8 次或开会生成完整 dossier。这是一种基于涌现的被动学习机制 。
fail-improve 循环让意图分类器从 40% 提升到 87%——系统在每次兜底中自我优化 。

## 实践启示
### 对 Agent 开发者的启示
1. **记忆是 Agent 的基础设施**：没有记忆的 Agent 每次都是新手。GBrain 证明了记忆系统可以开源、快速部署、且效果显著。
2. **Skill 即认知单元**：把智能放在可插拔的 Skill 里，而非硬编码进 Runtime。这是未来 Agent 架构的主流方向。
3. **知识的知识是护城河**：第 6 层 Epistemology 记录来源和置信度，比答案本身更有价值——它让 Agent 知道自己不知道什么。

### 对个人知识管理的启示
1. **两档记忆优于单一记忆**：既要有随时刷新的认知层（Compiled Truth），也要有永不丢失的证据层（Timeline）。
2. **频率即重要性**：被提及多次的实体自动升级，无需人工标注。
3. **对话即输入**：电话、消息、会议都可以成为记忆的来源，系统自动完成提取和关联。

### 对 AI 创业的启示
1. **12 天 MVP 是可行的**：Garry Tan 12 天完成 GBrain，说明 AI 项目的核心原型可以极快验证。
2. **开源 + YC 背书 = 传播飞轮**：9K+ Star 十几天达成，创始人个人品牌是重要的放大器。
3. **零配置起步，按需扩展**：默认 PGLite 嵌入式 Postgres，零配置；超过 1000 文件或多设备同步再迁 Supabase——这是 SaaS 工具的正确打开方式。

## 相关链接
- GitHub: github.com/garrytan/gbrain
- 安装指引: raw.githubusercontent.com/garrytan/gbrain/master/INSTALL_FOR_AGENTS.md
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/gbrain-garry-tan-yanfa-zhili.md)
- [8层架构详解（51CTO）](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/gbrain-8layer-51cto.md)

## 8 层架构详解 
GBrain 将传统 RAG 的 4 层扩展为 8 层，从"找得到"升级到"真正记住并进化"：
| 层 | 名称 | 功能 |
|----|------|------|
| 1 | Chunking | v4 分块器，处理 Markdown/代码块/元数据 |
| 2 | Embedding | 对比 3 家供应商，选最优语义匹配方案 |
| 3 | Indexing | O(log n)，375K 块时 2ms vs 2s |
| 4 | Query Understanding | tokenmax 模式查询扩展 + 意图检测 |
| 5 | Reranking | ZE zerank-2 重排序，92% 第一名结果在此变动 |
| 6 | **Epistemology** | 记录来源/时间戳/置信度（网友称"真正护城河"） |
| 7 | Entity KG | 14 万+关联边，人物→公司→会议→概念关系网 |
| 8 | Dreaming Loops | 闲时自主触发，合并同类项、修补逻辑断层 |
**性能基准**：P@5 49.1%、R@5 97.9%。关闭 KG 功能后 P@5 下降 31.4pp，优于纯 ripgrep-BM25+向量 RAG 。

## 相关实体
- [AgentBrowser](/ch04-451-agentbrowser/)
- 企业级AI记忆基质三层架构：事实/交互/行动记忆
- [Agent 自我改进的六条路](/ch04-047-agent-自我改进的六条路/)
- [Demis Hassabis YC 专访：AGI / 记忆 / Agent / 创造性观点集](/ch04-427-demis-hassabis-yc-专访-agent-才刚刚开始-ai-下一步是创造虚拟细胞/)
- [Agent Memory System 设计指南](/ch04-087-agent-memory-架构本质/)
- [SkillClaw](/ch04-312-阿里skillclaw-让-agent-技能在真实使用中集体进化/)
- [Skill 系统：Agent 如何把经验沉淀成可复用能力](/ch04-135-skill-系统-agent-如何把经验沉淀成可复用能力/)
- [OpenHuman: AI Agent 持久记忆框架](/ch04-284-1-6万-star-ai-agent-赛道又杀出一匹黑马/)
- 上下文工程 - 三种Memory方案对比

- [AutoCLI](/ch03-111-autocli/)
- [阿里巴巴 Aone 面向 Agent 的研发模式探索](/ch04-045-alibaba-aone-agentic-rd-mode-xiangbangyu/)
- [CLI-Anything](/ch04-336-cli-anything-让-agent-自主驱动任意-gui-软件/)
- [AgentRun](/ch04-003-agentrun/)
- [OpenCLI](/ch04-165-浏览器自动化-从-gui-到-opencli-agent-时代的可调用性竞争/)
- CLI-Tools 横向对比
- [24h打工人](/ch04-009-24h打工人/)
- [深度解析LLM Wiki / Obsidian-Wiki / GBrain：Agent时代知识的"自组织"与"自进化"](/ch01-499-llm-wiki-obsidian-wiki-gbrain-self-organization-self-evoluti/)
- [hermes-agent-self-evolving-source-analysis](/ch04-039-hermes-agent-self-evolving-source-analysis/)
- [Agent 原理、架构与工程实践](/ch04-435-agent-engineering-principles-architecture-practice/)
- [AI Agent 工程师能力地图](/ch04-139-ai-agent-工程师能力地图/)

- [agent 记忆注入实战：5 维框架（选什么/放哪里/怎么放/放多少/何时放）+ 4 前沿论文（memguide/sti](/ch01-325-agent-记忆注入实战-5-维框架-选什么-放哪里-怎么放-放多少-何时放-4-前沿论文-memguide-sti/)

## 第 3 来源：术哥无界 v0.42.44.0 源码深度解析

运维有术（术哥无界 ShugeX）2026-06-16 发布的源码深度分析 — 项目已经从 4 月初的 v0.17 演进到 **v0.42.44.0**，生产数据从 17,888 pages / 4,383 people / 723 companies / 21 cron jobs 增长到 **146,646 pages / 24,585 people / 5,339 companies / 66 cron jobs**（约 8.2× 增长）。

本来源与前两来源的视角差异：
- **第 1 来源**（Garry Tan 研发治理，2026-04）：项目刚开源的 12 天 MVP 视角
- **第 2 来源**（8 层架构详解，2026-05）：从 RAG 4 层扩展到 8 层的功能视角
- **第 3 来源（本篇）**：从**源码**出发的 5 大设计决策 + 工程可靠性视角

### 5 大设计决策

#### 1. 契约优先：双引擎架构
- 47 个 `BrainEngine` 接口操作，`kind: 'postgres' | 'pglite'` 判别字段
- 避开 `instanceof` 跨模块动态导入的原型链断裂陷阱
- TypeScript discriminated union 编译期穷尽性检查
- 想加第三个引擎实现 47 个操作即可，CLI/MCP 层不动
- 代价：contract 一旦定型修改波及面大

#### 2. 零 LLM 知识图谱：正则 + 动词
- 4 pass 提取链（Markdown 链接 / 限定 wikilink / 非限定 wikilink / 裸名）
- 60+ 动词正则（works_at / invested_in / founded / advises）
- Frontmatter 派生边（works_at / founded / attended）
- `addLinksBatch` JSONB 批量写入绕过 65535 参数上限
- **零 LLM 调用 → 近零成本 + 秒级全图提取 + 每次写页自动触发**

#### 3. 四层检索：8 阶段管线
- 向量（HNSW）+ BM25 + 关系（递归 CTE BFS）+ source-aware → RRF 融合
- 5 个硬编码常量（`COMPILED_TRUTH_BOOST=2.0` / `CROSS_SOURCE_BOOST=1.10` 等）
- Per-page max-pool (`DISTINCT ON (slug)`) 防长页面占满结果集
- evidence + create_safety 标签让下游知道每条结果的可信度
- 三种模式：conservative / balanced（默认）/ tokenmax

#### 4. Brain ⊥ Source：两个正交组织维度
- Brain（数据库轴）× Source（仓库轴）
- slug 在 source 范围内不重复，全局可重复
- 6 层渐进增强解析链（参数 > env > dotfile > path > fallback）
- `PageType` v0.38 从闭合 union 改为开放 string，Schema Pack 可扩展

#### 5. 工程可靠性
- `batchRetry` + decorrelated jitter 防 thundering herd
- `background-work` 5 sink 按 order 顺序 drain，防 CLI 退出数据丢失
- `ctx.remote === false` 才可信，4 个信任边界调用点全部 fail-closed
- PGLite advisory lock 用 PID liveness + heartbeat 防 WAL 损坏

### gbrain think 命令

| 命令 | 行为 |
|------|------|
| `gbrain search` | 返回原始页面（和普通 RAG 一样） |
| `gbrain think` | 综合答案 + 显式引用 + 缺口分析（gap analysis） |
| 缺口分析 | 页面过期 / 声明无引用 / 两页矛盾 / 知识空洞 |

**搜索引擎和大脑的区别**：搜索找页面，**大脑读页面并写出答案，同时承认自己不知道什么**。

### 源码诚实的局限标注（README 不会告诉你）

1. **PGLite 单写者限制**：大规模 sync 需要停 serve
2. **frontmatter tag 无 provenance 列**：reindex 只能 add-only
3. **图遍历的 truncation 检测**：存在 false positive/negative，方案已推迟

### 与其他 GBrain 来源的关系

- **第 1 来源**（Garry Tan 研发治理）：项目 12 天 MVP 故事 + Thin Harness Fat Skill 哲学 + 25 Skill + 部署方式 + Compiled Truth+Timeline
- **第 2 来源**（8 层架构详解）：从 RAG 4 层扩展到 8 层（Chunking/Embedding/Indexing/Query/Reranking/Epistemology/Entity KG/Dreaming Loops）
- **第 3 来源**（本篇）：5 大设计决策 + 源码级实现细节 + 工程可靠性 + gbrain think

三个来源构成"项目故事 → 功能架构 → 源码实现"完整闭环。

---

