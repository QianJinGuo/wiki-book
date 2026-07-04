# Kipi: Open-source OSINT Investigation Platform with Autonomous Agent

## Ch04.293 Kipi: Open-source OSINT Investigation Platform with Autonomous Agent

> 📊 Level ⭐⭐ | 8.7KB | `entities/kipi-osint-autonomous-agent-investigation.md`

# Kipi: Open-source OSINT Investigation Platform with Autonomous Agent

## 摘要

kipi 是一个开源、自托管的 OSINT（开源情报）调查平台，其核心创新在于将**文档智能**与**自主调查 Agent** 结合：用户输入文档（PDF、截图、电子表格、笔记），kipi 提取实体和关系构建图谱，然后自主 Agent 在开放网络上展开调查，实时扩展图谱。这是目前唯一将文档实体提取与图分析（中心性、社区发现、路径查找）整合在同一调查画布上的 OSINT 平台。

## 核心要点

### 产品定位与差异化

kipi 的独特价值主张：**文档 → 实体图谱 → 自主调查** 的端到端流程。

| 能力 | kipi | 传统 OSINT 工具 |
|------|------|----------------|
| 文档 → 实体提取 | ✅ 原生支持 | ❌ 需要手动输入 |
| 图分析（centrality/communities/pathfinding） | ✅ 内置 | ⚠️ 有限或需导出 |
| 自主调查 Agent | ✅ 自动扩展图谱 | ❌ 人工操作 |
| 自托管 | ✅ 完全本地 | ⚠️ 多为 SaaS |
| 证据分级 | ✅ A/B/C + 来源追溯 | ⚠️ 通常无 |

### 技术架构

```
┌─────────────────────────────────────────────┐
│              用户输入（文档/笔记）             │
├─────────────────────────────────────────────┤
│         文档智能层（实体/关系提取）            │
│  PDF → Entity, 关系, 属性, 证据等级          │
├─────────────────────────────────────────────┤
│         自主调查 Agent                        │
│  WHOIS / DNS / 证书 / 网站抓取               │
│  自动 pivot（从发现中发现新线索）             │
├─────────────────────────────────────────────┤
│         图分析引擎                            │
│  Centrality / Communities / Pathfinding      │
├─────────────────────────────────────────────┤
│         调查画布（可视化 + 交互）              │
│  实体图谱 + 证据链 + 调查简报                 │
└─────────────────────────────────────────────┘
```

### 案例演示：俄罗斯联盟欺诈网络

Demo 展示了一个真实案例的调查过程：

1. **种子输入**：两个域名 `trumpfundus.com` 和 `trumpstake.us`
2. **自动调查**：Agent 拉取 WHOIS、DNS、SSL 证书、网站内容
3. **图谱扩展**：发现关联的白标加密赌场、壳公司、联盟网络
4. **关键发现**：
   - 后台运营商注册在雷克雅未克的壳公司
   - 20,000+ 联盟成员
   - 60-80% 被盗存款通过加密货币支付
   - Musk 品牌克隆站点被标记为钓鱼
5. **自动生成简报**：每个声明附带来源和证据等级

### 证据分级系统

kipi 的关键设计决策：**每个发现都有证据等级**。

- **A 级**：DNS 记录、WHOIS 数据等技术事实
- **B 级**：网站内容、公开信息等可验证数据
- **C 级**：分析师推断、关联推测等需要人工确认

"Nothing gets promoted on a name match" — 系统不会因为名称匹配就自动提升证据等级，这是 OSINT 工具中罕见的严谨设计。

### 人机协作模式

kipi 的核心理念："The machine proposes. You decide."

- Agent 自主完成重复性调查工作（DNS 查询、WHOIS 查找、证书检查）
- 分析师保持最终权威：确认、修正或拒绝每个发现
- 人机分工：机器做广度（穷举关联），人类做深度（判断意义）

## 深度分析

### Agent 架构在情报分析中的应用

kipi 是 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 在情报分析领域的优秀实践：

1. **任务分解**：从"调查一个组织"分解为"查询 WHOIS → 分析 DNS → 检查证书 → 抓取网站 → 关联分析"
2. **工具链**：每个子任务对应一个确定性工具（WHOIS 查询、DNS 解析、证书透明度日志）
3. **自主 pivot**：Agent 从发现中自动识别新的调查线索（新域名、新 IP、新组织）
4. **人机边界**：Agent 执行调查，人类审核结果

这与 [Claude Code 的动态工作流](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-dynamic-workflows-thariq-practical-patterns.md) 有相似的架构模式：LLM 做决策，工具做执行，人类做监督。

### Graph RAG 的结构化知识组织

kipi 的图谱构建本质上是一种 **Graph RAG**（图增强检索生成）的变体：

- **传统 RAG**：文档 → 向量化 → 语义检索 → LLM 生成
- **kipi 模式**：文档 → 实体/关系提取 → 图谱构建 → 图算法分析 → 简报生成

图谱的优势在于：
- **关系显式化**：实体之间的关系不再是隐含的，而是图上的边
- **多跳推理**：图上的路径查找天然支持"A 关联 B，B 关联 C，因此 A 可能关联 C"
- **社区发现**：自动识别紧密关联的实体集群（团伙、网络）

这与 [SchemaFlow](https://github.com/QianJinGuo/wiki/blob/main/entities/schemaflow-agentic-database-sql-generation-openai-cookbook.md) 的思路互补：SchemaFlow 将 LLM 约束在数据库 schema 中，kipi 将 LLM 约束在图结构中。

### 开源 OSINT 的安全伦理

kipi 作为开源 OSINT 工具，其设计反映了安全伦理考量：

1. **自托管**：数据不离开用户基础设施，适合敏感调查
2. **证据分级**：避免过度推断和误判
3. **人在回路**：Agent 的发现需要人工确认
4. **可审计**：每个声明都有来源追溯

这些设计对于情报分析的可信度至关重要——也与 [Gray Swan](https://github.com/QianJinGuo/wiki/blob/main/entities/latent-space-p-gray-swan.md) 强调的 AI 安全理念一致。

### 技术栈推测

基于开源项目的一般模式和功能描述：

- **LLM 后端**：Anthropic Claude（`ANTHROPIC_API_KEY` 是唯一必需的 key）
- **文档处理**：OCR（tesseract）+ LLM 实体提取
- **图数据库**：可能是 Neo4j 或 NetworkX（轻量级）
- **前端**：Web-based 调查画布
- **调查工具**：WHOIS/DNS/证书透明度 API 集成

## 实践启示

### 适用场景

- **安全调查**：追踪恶意基础设施、分析攻击者网络
- **尽职调查**：企业背景调查、供应链风险评估
- **新闻调查**：关联分析、事实核查
- **学术研究**：网络分析、社会网络研究

### 快速上手

```bash
git clone https://github.com/assafkip/kipi.git && cd kipi
./install.sh                           # venv + deps + DB
export ANTHROPIC_API_KEY=sk-ant-...    # 唯一必需的 key
./invctl serve                         # http://127.0.0.1:8765
```

### 局限性

- 依赖 Anthropic API，调查成本随图谱规模增长
- 自主 Agent 的调查质量取决于目标网站的反爬措施
- 证据分级系统仍需人工校准
- 与 [prompt injection](https://github.com/QianJinGuo/wiki/blob/main/entities/role-confusion-github-io.md) 相关的安全风险：Agent 处理的网页内容可能包含恶意指令

### 与同类工具对比

| 工具 | 文档输入 | 图分析 | 自主 Agent | 开源 |
|------|---------|--------|-----------|------|
| **kipi** | ✅ | ✅ | ✅ | ✅ |
| Maltego | ❌ | ✅ | ❌ | ❌ |
| Shodan | ❌ | ❌ | ❌ | ❌ |
| SpiderFoot | ❌ | ⚠️ | ❌ | ✅ |
| Palantir Gotham | ✅ | ✅ | ❌ | ❌ |

## 相关实体

- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — Agent 架构工程
- [Claude Code Workflows](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-dynamic-workflows-thariq-practical-patterns.md) — Agent 动态工作流
- [SchemaFlow](https://github.com/QianJinGuo/wiki/blob/main/entities/schemaflow-agentic-database-sql-generation-openai-cookbook.md) — 结构化数据的 LLM 约束
- [Gray Swan](https://github.com/QianJinGuo/wiki/blob/main/entities/latent-space-p-gray-swan.md) — AI 安全与 red-teaming
- [Role Confusion](https://github.com/QianJinGuo/wiki/blob/main/entities/role-confusion-github-io.md) — Prompt injection 理论

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/kipi-osint-autonomous-agent-investigation.md)

---

