# Hermes-Wiki 实战 — Obsidian + Hermes Agent 自动生长知识网络的 9 步搭建法

## Ch03.053 Hermes-Wiki 实战 — Obsidian + Hermes Agent 自动生长知识网络的 9 步搭建法

> 📊 Level ⭐⭐ | 19.0KB | `entities/hermes-wiki-9-step-auto-growing-knowledge-network.md`

## 概述

超级猛 2026-05-05（修改 2026-05-19）"我又把 Obsidian 知识库升级了"——本文是该作者 Obsidian + AI 知识库系列**第 3 篇**（前 2 篇：Hermes Agent 接 Obsidian / Obsidian + Codex 持续进化），核心命题：**让 Agent 通过 Obsidian 的 wikilink 能力，把一篇文章自动编译成互相关联的知识节点，在知识库里自己长出网络**。文章给出 9 步可执行搭建法（建文件夹 / 3 个核心文件 / Obsidian 打开 / WIKI_PATH / 只读验证 / 收录首篇 / 5 点验收 / 本质变化 / 5 条安全规则），把 Karpathy "LLM Wiki" 抽象理念落地为 Hermes Agent 上的可操作工程方案。核心范式转换：从"存 + 搜"线性流程 → "文章 → Agent 拆解 → 概念页/实体页/比较页/MOC → wikilink 互链 → 图谱网络"。

## 范式定位：3 个本质变化

和前两篇基础流程比，这次升级的**关键差异不在"操作"在"关联"**：

| 变化 | 旧 | 新 |
|------|----|----|
| **从存资料到编译资料** | 文章丢进 `raw/articles/` 是一坨 | Agent 拆成概念/实体/MOC，每个页面都是**可被引用的独立节点** |
| **从页面孤立到自动关联** | Agent 建了一堆页面但孤立 | Agent **强制用 wikilink 把每个新页面和已有页面关联**（概念↔概念、概念↔实体、实体↔MOC） |
| **从线性输出到网络生长** | "一篇文章 → 一篇总结" | "一篇文章 → 多个节点 → 和已有节点自动关联 → **图谱越来越密**" |

**最后一行最关键**：文章越多，网络价值越大——**不是线性叠加，是指数增长**。这是从"收藏"到"网络"的范式跃迁。

> 与 [LLM Wiki / Obsidian-Wiki / GBrain 自组织自进化](/ch01-499-llm-wiki-obsidian-wiki-gbrain-self-organization-self-evoluti//) 在"知识管理从静态检索到动态自组织"维度同源——但本文是**Hermes-Wiki 的可操作搭建法**，前者是 **LLM Wiki / Obsidian-Wiki / GBrain 三种实现的架构分析**。**互补不重叠**：一个讲 what/why（架构哲学），一个讲 how（工程落地）。

## 文件夹结构：节点类型分离

核心原则：**不同类型的内容不要混在一起**——让 Agent 有能力"区分节点类型"，不同类型的页面在网络里扮演不同角色。

```
Hermes-Wiki/
├── SCHEMA.md       # 规则文件
├── index.md        # 总入口
├── log.md          # 更新日志
├── raw/
│   ├── articles/   # 原始文章（追加只读）
│   ├── papers/     # 论文
│   ├── transcripts/# 转录稿
│   └── assets/     # 截图、附件
├── concepts/       # 概念页（跨资料沉淀的长期节点）
├── entities/       # 实体页（工具/项目/公司）
├── comparisons/    # 比较页（Hermes vs Claude Code 等）
├── queries/        # 重要问答（解决重要问题的才沉淀）
├── moc/            # 主题地图（Map of Content）
└── drafts/         # 输出草稿（终局是输出，不是收藏）
```

**关键分层逻辑**：

| 目录 | 角色 | 写入规则 |
|------|------|----------|
| `raw/` | 证据层 | 源头坏了后面全乱。**只追加只读，不修改原文** |
| `concepts/` | 长期知识节点 | 跨多份资料沉淀——不是文章摘要，是**可被反复引用的抽象** |
| `entities/` | 工具/人/公司 | 概念和实体必须**分开**，否则术语和人名工具名全混一起 |
| `comparisons/` | 长期更新页 | 每篇新资料都可能补充新维度——适合做"对照表" |
| `queries/` | 高价值问答 | 不是每次聊天都存，**解决重要问题的才沉淀** |
| `moc/` | 理解路线图 | 不是目录——是**阅读顺序地图**（"先读 X 再读 Y"） |
| `drafts/` | 终局输出 | 知识库的终局是输出，**不是收藏** |

**核心信条**："raw 是证据层，源头坏了后面全乱"——这一条决定了 AI 知识库的可信度。

## 三个核心文件：规则/入口/日志

**这三个文件比文件夹更重要**——没有它们，Agent 会乱（今天建 summary，明天建 note，后天换一种命名——得到的是"AI 生成的新垃圾"）。

### 1. SCHEMA.md：规则文件（Agent 行为约束）

关键规则清单：
- `raw/` 是原始资料区，**只能追加和读取，不要改写原文**
- `concepts/entities/comparisons/queries/moc/drafts/` 严格按节点类型分目录
- **重要概念使用 wikilink**（整个网络能形成的底层前提——没有双链，页面再多都是孤岛）
- 关键结论尽量绑定来源
- 不确定内容必须标记为"**待验证**"
- 每次重要修改后更新 `log.md`
- 新增重要页面后更新 `index.md`

**核心信条**："**让 Agent 稳定维护知识库，第一步不是给资料，是给 schema**"——不给规则，Agent 就会自作主张。

### 2. index.md：总入口

不用写复杂，早期三块就够：
- **核心概念**：链接到 `concepts/` 下的关键概念
- **主题地图**：链接到 `moc/` 下的阅读路线
- **最近更新**：链接到最新 `raw/articles/` 处理结果

作用是让人和 Agent 一眼知道这个 Wiki 的入口在哪。

### 3. log.md：更新日志（可追溯性基础）

每次新建/更新页面、标注来源、标记待验证项，**都记进 log.md**。

**没有 log，AI 知识库就是黑箱**——页面多了你不知道：
- 哪来的
- 为什么创建
- 哪些是原文结论
- 哪些是 AI 归纳

**这对长期知识库是致命的**。

> 与 [Hermes Skills + Karpathy LLM Wiki 让 AI 越用越懂你](/ch01-711-手把手-用-hermes-skills-karpathy-的-llm-wiki-让-ai-越用越懂你//) 在"三层互相喂养（Memory + Skills + Wiki）"维度同源——本文把 Wiki 单层做深，给出 9 步可执行搭建法。

## 9 步可执行搭建法

### 步骤 1 — 建文件夹
按上文结构创建。`Obsidian` 打开要选**整个文件夹**作为 vault（不要选子目录）。

### 步骤 2 — 写 3 个核心文件
SCHEMA.md / index.md / log.md，**这三件套比文件夹重要**。

### 步骤 3 — Obsidian 打开
"Open folder as vault" → 选 Hermes-Wiki。**Obsidian 和 Hermes 必须指向同一个文件夹**。

### 步骤 4 — 设置 WIKI_PATH
告诉 Hermes Wiki 文件夹在哪。

**最容易出错的是 Windows 用户**：
- WSL/Ubuntu 里运行 Hermes → `WIKI_PATH` 要设置在 WSL 里，**不是 Windows PowerShell**
- Windows + WSL：`export WIKI_PATH="/mnt/c/Users/你的用户名/Hermes-Wiki"`
- Mac：`export WIKI_PATH="$HOME/Hermes-Wiki"`

### 步骤 5 — 先只读，不要急着改
第一次启动 Hermes 后，**不要一上来就让它写文件**。先做初始化检查：

```
请读取我的 LLM Wiki。Wiki 路径使用环境变量 WIKI_PATH。
先不要修改任何文件，只做初始化检查：
1. 读取 SCHEMA.md
2. 读取 index.md
3. 读取 log.md
4. 总结当前 Wiki 结构
5. 告诉我下一步应该收录哪些资料
```

**验证标准**：Hermes 能准确说出 `raw/` 是原始资料、`concepts/` 是概念页、`moc/` 是主题地图、`SCHEMA.md` 是规则文件、`index.md` 是总入口、`log.md` 是更新日志。**说对了再进入下一步**。

### 步骤 6 — 收录第一篇文章
进入 `raw/articles/` → 新建 Markdown 文件 → 粘贴文章 → 在 Hermes 里输入：

```
请收录这篇文章：raw/articles/你的文章标题.md
注意：这是一篇文章草稿，请把它作为 raw 原始资料处理，不要修改原文。
要求：
1. 读取文章内容，提取核心主题
2. 根据内容创建或更新对应的 Wiki 页面
3. 重要使用 wikilink 双链（方括号包裹概念名）
4. 关键结论必须标注来源：raw/articles/你的文章标题.md
5. 如果某些内容是总结归纳或待验证判断，请明确标记
6. 更新 index.md
7. 更新 log.md
8. 如果适合，请创建或更新 moc/LLM Wiki 地图.md
9. 完成后列出本次新增和更新了哪些文件
```

**4 个确保要点**：① raw 原文不要改 ② 关键结论标注来源 ③ 要求列出新增/更新文件 ④ 更新 log.md——**这四条确保这是一次可检查的知识编译，不是随手总结**。

### 步骤 7 — Obsidian 5 点验收

| 验收点 | 期望结果 |
|--------|---------|
| `concepts/` | 从文章中拆出**长期知识节点**（如 RAG / MOC / 知识飞轮） |
| `entities/` | 概念和工具/实体**分开**（Obsidian / Hermes / Claude Code） |
| `moc/` | **理解路线图**（不是列清单，是"先读 X 再读 Y"） |
| `log.md` | 记录：新增/更新页面、来源、待验证内容、下一步 |
| **图谱** | 概念↔概念、概念↔实体、实体↔MOC，**形成可见网络** |

**第 5 点（网络）才是核心验收点**——前 4 点都对但图谱空，等于没成。

### 步骤 8 — 验收通过的本质
如果前面 wikilink 规则生效，Obsidian 图谱视图应该看到：
- `concepts/` 里的概念页**互相链接**
- `entities/` 里的实体页和概念页**交叉关联**
- `moc/` 作为**中枢节点**把多个页面串在一起

效果：**一篇文章 → Agent 拆出 5-10 个页面 → 每个页面用 wikilink 互相链接 → Obsidian 图谱中形成可见的知识网络**。文章越多，网络越密。

### 步骤 9 — 5 条安全规则

> **不要一上来全自动**——AI 知识库最怕的不是不够自动，是自动生成一堆你自己都不信的东西。

1. **只让 Agent 操作独立的 Hermes-Wiki，不要直接动主力 Vault**
2. **raw 原始资料只追加只读，不让 AI 改写**
3. **每次生成后看 log.md，确认改了什么**
4. **不确定内容一律标"待验证"**
5. **先用 3-5 篇文章测试，命名/双链/MOC 规则稳定后再扩大到论文/转录稿**

## 深度分析

**核心洞察**：Hermes-Wiki 的本质不是"存储知识的仓库"，而是一个**让 Agent 在编译过程中将离散文章转化为可关联知识节点**的工程系统。9 步搭建法的每一步都在解决一个具体的 Agent 行为约束问题，而非流程优化问题。

**技术要点**：

1. **网络价值的指数特征**：wikilink 网络遵循梅特卡夫定律——价值随节点数呈二次增长。"一篇文章 → 多个节点 → 和已有节点自动关联 → 图谱越来越密"，这意味着知识库存在一个**网络效应临界点**，在此之前价值累积缓慢，在此之后呈现非线性爆发。

2. **三层分离架构的深层逻辑**：`raw/`（证据层）+ `concepts/`（长期知识节点）+ `entities/`（工具/项目/公司）的分离，本质是让 Agent 在编译时就能区分"事实来源""抽象概念""具体实例"三类认知对象——这种区分能力直接决定 wikilink 能否形成有意义的语义网络，而非同质链接堆砌。

3. **SCHEMA.md 是行为约束而非格式规范**：Agent 知识库失败的根本原因是 Agent 的"创意自由"——今天建 summary、明天建 note、后天换命名。SCHEMA.md 的核心价值在于把"如何维护知识库"变成一个**可执行的行为契约**，而不是一个可被忽略的建议。[Hermes Skills + LLM Wiki 越用越懂你](/ch01-711-手把手-用-hermes-skills-karpathy-的-llm-wiki-让-ai-越用越懂你//)的三层互相喂养框架在这里有直接呼应——Wiki 层需要 Schema 层来稳定行为预期。

4. **"先只读再写"是初始化对齐而非谨慎措施**：步骤 5 的初始化检查（读 SCHEMA.md / index.md / log.md 并总结结构）的本质是**在 Agent 和 Wiki 之间建立共同认知基底**，确保 Agent 理解目录角色和操作规范。这与 [Karpathy LLM Wiki v2](/ch01-271-karpathy-llm-wiki-v2-2026//) 的"LLM Wiki 是关于如何组织知识而非存储知识"的核心理念一脉相承。

**实践价值**：对于想构建自生长知识网络的团队，9 步法的最大启示是"**先规则后内容**"——不给 Agent 规则而直接给资料，最终得到的是一堆 AI 生成的新垃圾，命名混乱、链接无意义、不可追溯。

[LLM Wiki / Obsidian-Wiki / GBrain 自组织自进化](/ch01-499-llm-wiki-obsidian-wiki-gbrain-self-organization-self-evoluti//)提供了架构层面的理论支撑，解释了为什么 wiki-based knowledge network 能实现从静态检索到动态自组织的范式跃迁。

## 实践启示

1. **节点类型分离是 wikilink 网络的前提**——`concepts/entities/comparisons/moc` 各司其职，结构化网络才有意义；同质页面互链是无效的
2. **3 个核心文件比文件夹更重要**——SCHEMA.md（规则）/ index.md（入口）/ log.md（追溯）缺一不可
3. **先只读再写**——启动后第一步是初始化检查，确认 Agent 理解目录角色再进入写入流程
4. **WIKI_PATH 跨平台陷阱**——Windows WSL 用户必须把路径设在 WSL 侧，否则 Obsidian 和 Hermes 指向不同目录
5. **5 点验收中的"图谱"是核心**——前 4 点都对但图谱空，等于没成；wikilink 规则是网络的底层前提
6. **不要一上来全自动**——先用 3-5 篇文章测试稳定后再扩大；自动化的反面是"自动生成一堆你自己都不信的东西"
7. **log.md 是黑箱解药**——没有 log 的 AI 知识库，长期看就是不可信的资料堆

## 与现有实体的差异化

| 维度 | 本文（超级猛 Hermes-Wiki 教程） | 现有 LLM Wiki 实体 |
|------|-------------------------------|---------------------|
| **canonical artifact** | 超级猛 Hermes-Wiki 9 步搭建法 | 井底之硅/项目深度解析系列 LLM Wiki / Obsidian-Wiki / GBrain 三实现架构分析 |
| **类型** | **操作教程**（9 步可执行） | **架构分析**（3 实现对比） |
| **焦点** | **Hermes-Wiki 单一实现的具体路径** | LLM Wiki / Obsidian-Wiki / GBrain 三实现 |
| **可复用抽象** | 中（9 步流程） | 高（架构哲学） |
| **可操作性** | **极高**（prompt + 路径 + 验收清单） | 中（概念层） |
| **目标读者** | 想搭 Hermes-Wiki 的开发者 | 想理解知识管理范式的架构师 |

**结论**：两文**互补不重叠**——本文给 how，前者给 what/why。**新 entity**。

## 相关实体

- **同 LLM Wiki / Obsidian 知识管理**：
  - [LLM Wiki / Obsidian-Wiki / GBrain 自组织自进化](/ch01-499-llm-wiki-obsidian-wiki-gbrain-self-organization-self-evoluti//)（架构分析）
  - [Karpathy LLM Wiki v2](/ch01-271-karpathy-llm-wiki-v2-2026//)（原始方法论）
  - [Karpathy LLM Wiki 第二大脑](/ch01-321-卡帕西-llm-wiki-到底是什么-用-claude-obsidian-给自己造一个第二大脑的完整拆解//)
  - Obsidian 工具概览
  - [Claude Code Memory Setup (Obsidian + Graphify)](/ch01-666-claude-code-memory-setup-obsidian-graphify//)
- **同 Hermes Agent 生态**：
  - [Hermes Skills + LLM Wiki 越用越懂你](/ch01-711-手把手-用-hermes-skills-karpathy-的-llm-wiki-让-ai-越用越懂你//)（三层互相喂养）
  - Hermes Agent 自进化机制源码解析
  - [Hermes Agent Memory System vs OpenClaw](/ch04-068-hermes-agent-记忆系统深度拆解//)
- **同上下文工程 / 记忆架构**：
  - [AI Coding Agent 记忆系统](/ch04-288-ai-coding-agent-记忆系统//)
  - 上下文工程三种记忆范式对比
  - 企业 AI 记忆 substrate 三层架构

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/obsidian-hermes-wiki-auto-growing-knowledge-network.md)

---

