# DIPG 蚂蚁保 Host-Research-Verify 三 Agent 离线 verify 闭环：C 端 AIGC 工程化范式

## Ch05.084 DIPG 蚂蚁保 Host-Research-Verify 三 Agent 离线 verify 闭环：C 端 AIGC 工程化范式

> 📊 Level ⭐⭐⭐ | 23.7KB | `entities/dipg-ant-insurance-host-research-verify-offline-closed-loop.md`

# DIPG 蚂蚁保 Host-Research-Verify 三 Agent 离线 verify 闭环

## Overview

DIPG（Deep Interpretation Page Generator）是蚂蚁保保险快查的 C 端 AIGC 深度解读页面生成系统。晓灰 @antgroup.com 2026-06-01 在公众号发表的这篇文章，是蚂蚁集团 Harness Engineering 系列的第 2 篇（前一篇是 HelixVerify）。

> 核心创新：**架构翻转**——不让 C 端用户直接吃 LLM 实时生成的结果，把架构翻转成 **"host-generate-verify-modify → DB 按品开启 → C 端直出"**。

## 为什么 C 端 AIGC 不能让实时直出

| 维度 | 实时直出问题 |
|------|-------------|
| **时延** | 一次完整深度解读需 agentic 检索 + 几千字 HTML，LLM 推理几十秒 |
| **质量（渲染类）** | 孤儿闭合标签、组件层级错乱——页面直接塌掉 |
| **质量（幻觉类）** | 数据不符、编造对比——用户读到假信息 |

LLM 一次过做不到 100% 正确，直出就是赌。C 端 AIGC 交付的本质要求是：用户点开那一刻看到的 HTML 必须已经被校验过。

## 两条链路：离线主路径 + 实时兜底

| 链路 | 定位 | 角色 | 用户看到 |
|------|------|------|---------|
| **离线链路** | 主路径 | Host Agent 调度 Research + Verify，verify 不通过则 patch | 默认可见 |
| **实时链路** | 兜底 | 只跑 Research Agent，不经过 verify | 默认不可见（仅"未开启品"用） |

两条链路的 **Research Agent 完全同源**——离线链路在它之上套了一层 Host Agent；实时链路只跑一次 Research Agent，Host 和 Verify 都不参与。

DIPG 当前采用"离线刷入 DB + 按品维度开启"：后台批量预生成并刷入 DB，只对"已开启的品"向 C 端暴露——用户请求时直接从 DB 读离线产物，命中率 100%，不依赖缓存层兜底。

## 3 个 Agent 三角分工

### Host Agent — 总编排 + 精准修正

读到用户请求后按"研究 → 校验 → (若未通过)修正 → 再校验"的流程派活。**关键设计**：当 Verify Agent 返回修正意见时，Host Agent **自己在已有 HTML 上做精准编辑**（按 fix_hint 定位段落、patch 掉问题点），而不是再派一次 Research Agent 重新生成。

### Research Agent — 只负责从零生成

拿到产品编号后下载素材、多轮读取条款、必要时搜网络，最后产出整份 HTML 片段。**不参与修正循环**——修正不是它的工作。内部也是完整 ReAct Agent，有自己的工具链（`download_insurance_product_materials`、`read_disk_file`、`web_search`）。

### Verify Agent — 只负责校验、不改 HTML

读 HTML 产物 + Research Agent 用过的原始素材，做"程序化结构校验 + LLM 事实校验"两层检查，产出结构化的修正意见（fix_hint 列表）。**模型选型不对称**：Verify Agent 的模型和 Research Agent 的模型最好是不同选型，可以减轻"同一模型既当运动员又当裁判"带来的偏置。

### 调用次数的不对称分工

| Agent | 在闭环里被调用的次数 | 职责 |
|-------|---------------------|------|
| Research Agent | 只在第 1 轮被调一次（从零生成） | 创造 |
| Verify Agent | 每轮被调一次 | 校验 + 提 fix_hint |
| Host Agent | 全程在线 | 编排 + 自己按 fix_hint 精准修正 HTML |

## LangGraph 三层物理嵌套

| 层 | 角色 | 拓扑 | 决策 |
|----|------|------|------|
| 外层 | StateGraph（边硬编码） | callback 必经节点 | 不依赖 LLM 决策 |
| 中层 | Host Agent（`build_domain_agent_v3`） | blueprint 声明式配置 | ReAct 循环 |
| 内层 | Research Agent + Verify Agent | CompiledSubAgent | 各自独立 LangGraph 图 |

### `task` 工具：SubAgent 注入机制

LangGraph 里没有"直接调另一个 agent"的原生操作，所有异构执行必须包装成工具。`create_task_tool` 把 Research Agent 和 Verify Agent 按 name 注册到 `agents` 字典，创建一个 `task(description, subagent_type)` 工具加到 Host Agent 的工具列表。Host Agent 看到的是**多态工具**。

### `task` 内部三件事

- **上下文隔离**：每次调用都用新 thread_id + 全新 messages，SubAgent 看不到 Host 的对话历史，也看不到兄弟 SubAgent 之前跑过什么
- **单一返回值**：Host 只收到一条 ToolMessage，SubAgent 内部的多轮工具调用、中间推理对它不可见
- **files 合并**：SubAgent 写的 `state["files"]` 通过 `Command.update` 合并回 Host 的 `state["files"]`

## state["files"] 与 /audit/ 数据契约

### 双层数据通道

| 位置 | 写入者 | 读取者 | 生命周期 |
|------|--------|--------|----------|
| `state["files"]` | write_file 工具 via `Command.update` | 任何能访问 state 的 SubAgent | 随 checkpointer 持久化 |
| `/audit/` | AuditWrapperMiddleware 包装所有工具调用 | Verify Agent 通过 read_file | 随 checkpointer 持久化 |

> `files` = 生成的产物（HTML、中间结果）。`/audit/` = 生成的原料（工具调用的输入输出）。Verify Agent 用 `ls /audit/` + `read_file` 就能读到 Research Agent 期间的全部工具调用记录。

**架构意义**：Verify Agent 不是对 HTML 做静态语言分析，而是对 HTML 和它的数据源做对齐分析。缺少 `/audit/` 这一层，事实性校验就失去工程意义。

## 两类致命错误的真实 badcase

### 渲染类：孤儿 `</div>` 让页面塌掉

某重疾险深度解读在 C 端偶发渲染错位——最后一个"风险提示"卡片下，下一个无关模块被挤歪。LLM 凭"印象"在末尾补了一个 `</div>` 当收尾，进到移动端容器被当成关闭自身的信号。**问题很隐蔽**：整份报告顶层本应平铺结构，HTML 文字上完全"合理"，LLM 生成时也没"犹豫"。

### 幻觉类：惠民保"优于市场 85%" 骗人

"特色保障分析"模块赫然写着"优于市场 85% 同类惠民保产品"。翻遍 Research Agent 拉到的全部素材——保险条款、投保须知、健康告知——**没有任何关于"市场排名"或"百分位"的数据**。LLM 为了让页面更有说服力，凭空编造了一个具体数字。页面渲染完全正常，视觉上看不出毛病。

> 孤儿 `</div>` 让页面"塌掉"，这个 badcase 让页面"骗人"——而且骗得很体面，不翻数据源根本看不出来。

## Verify Agent 两层校验

### structural_check（程序化校验）

纯 Python，基于 `html.parser.HTMLParser` 自定义的 `StructureParser`，检查确定性规则：

| 规则 | 检查内容 |
|------|----------|
| rule1 | `<style>` 标签不应出现在片段中 |
| rule3 | `<h2>` 之间必须有实质内容（防止连续空 h2） |
| rule4 | `<h2>` 文本不得手动加序号 |
| rule5 | 标签完全闭合 / 无孤儿闭合标签 / 无交叉嵌套 |
| rule6 | `<h2>` 必须在顶层，不能被非组件 `<div>` 包裹 |
| rule7 | 禁止内容重复 |

**毫秒级响应，零假阳性**。孤儿 `</div>` badcase 就是被 rule5 的 TAG_ORPHAN 直接命中。

### llm_verify（语义 + 事实校验）

消费 `/audit/` 下的原始数据供给 + 生成的 HTML，产出结构化 JSON。

**两个节点分工原则**：能用程序判定的，不让 LLM 看。LLM 的 token 预算全部投给真正擅长的事实性判断，不浪费在数"有几个未闭合标签"这种机械活上。

## Research Agent 的 prompt 契约

### 合规用语硬规则

监管敏感词绝不允许出现——0免赔/零免赔/无免赔 → 0免赔额/免赔额为0；100%全赔 → 责任内,赔付比例100%；储蓄险 → 储蓄型保险；确诊即赔 → 首次确诊责任内疾病可赔。硬约束清单。

### 事实性保证的 8 条规则（节选）

- **信源优先级**：产品档案 > 保险条款 > 网络搜索 > 通用知识
- **无数据不展示**：缺失字段直接隐藏，不做任何臆测
- **图表真实性**：单点数据不准画趋势图，降级为数字卡片
- **禁止盲目对比**：没有竞品数据不得使用"优于市场 85%"
- **否定约束**：`is_state_owned: false` 就严禁出现"国企/央企"

### 强制前置溯源（最关键的一条）

利用模型自回归特性，在生成任何关键数据之前，**先生成 HTML 注释说明数据来源**：

```html
<!-- Source: [信源] - [字段] -->
<div>数据...</div>
```

如果写不出注释，说明该数据是幻觉，必须留空。

> 不是求 LLM "请标注来源"，而是让"写不出来源就不要写数据"变成自然的生成顺序。**结构强制比语义强制有效得多。**

## 强制闭环：靠 Host Agent 的 prompt 守纪律

### 路 A vs 路 B：体系性设计选择

- **路 A**：再派 Research Agent 重新生成。问题：Research 不擅长改只擅长生成，prompt 和工具链是为"理解需求 → 拉素材 → 综合产出"设计的。再派它"按意见修正"会重新进入研究模式，容易全盘重写
- **路 B**：Host Agent 自己 patch。Verify 给的是已精确定位的 fix_hint（含 module 名、evidence 行号、具体动作），此时修正已退化成"在已有文档里找到 X,改成 Y"这种轻量编辑

**DIPG 走的是路 B**。Host Agent 直接调 `edit_file` / `write_file` 工具在 `state["files"]["report.html"]` 上做局部编辑。

### 5 轮异常兜底

正常 1~3 轮内闭环收敛。5 轮仍未通过通常不是生成/校验本身的问题，而是意外情况（素材缺关键数据、双方拉锯）。到上限就停，让 LLM 互卷只会浪费算力。Host 暂停并把分歧点抛给下游（`error_code` 透传到 callback），由业务侧决定处理（通常标记"待人工介入"）。

## 错误回灌 prompt：让生成过程更可靠

### 两重价值

| 价值 | 作用对象 | 生效时机 |
|------|---------|---------|
| **把关**（直接价值） | 当次生成的 HTML | 离线生成时立即生效：不合格的产物不刷入 DB |
| **回灌**（间接价值） | 后续所有生成（含实时兜底） | 下次生成时生效：Research Agent "一次过"的概率更高 |

> 离线链路本身不依赖回灌——哪怕回灌机制完全不存在，离线链路凭 Verify 把关也足以保证交付质量。但有了回灌，离线链路的 verify-修正闭环收敛更快，实时兜底链路的出错率也随之下降。

### 具体案例：实体对齐规则

早期 LLM 经常把"集团/母公司"的数据（总资产、世界 500 强排名）直接套用到"子公司/产品"上。Verify 反复抓到，抽象成 prompt 规则：

```
实体对齐(信源优先级原则的子条款):严禁混用主体。禁止将"集团/母公司"的数据(如总资产、世界 500 强排名)直接套用到"子公司/产品"上,除非明确说明是"依托于集团"。
```

至此，badcase 走完"Verify 抓到 → Host 修正 → 回灌 prompt → 下次不犯"的完整闭环。

### 回灌的必要性

只有把关、没有回灌会怎样？——离线链路无限跑下去，每次都要 Verify 抓相同的错，Host 按相同的 fix_hint 反复 patch。**计算成本浪费，且不收敛**。

> Verify Agent 不只是质检员，它同时在替 Research Agent 的 prompt 产出训练信号——这就是 "规则从哪来" 的完整答案。

## 三级 Harness 嵌套

整个 DIPG 系统实际上是**三级嵌套的 Harness 反馈回路**，跨越了线下/线上、离线/实时四个象限：

| 层级 | 时间尺度 | 做什么 | 角色 |
|------|---------|--------|------|
| **Level 3** | 线下（周/月） | 迭代 verify 能力 | 让 verify 越来越强（召回更准、误报更少） |
| **Level 2** | 线上（按品预生成） | DIPG 主干 | 离线 verify 把关主交付 + 沉淀 prompt |
| **Level 1** | 线上（用户请求时） | 兜底 | 仅在"品未开启"或"DB 暂未写入"时触发 |

每一层 loop 时间尺度差了一到两个数量级，但它们共享：同一个 Verify Agent、同一份 Research Agent prompt (`chacha_prompt.py`)、同一套 `/audit/` 数据契约、同一组 benchmark 样本。

## 5 条踩坑经验

1. **不要让 LLM 实时产物直出给 C 端用户**——架构上排除实时直出，改为"离线生成 + Harness 把关 + 刷入数据/存储层 + 按需直出"
2. **生成器代码 / prompt 在两条链路之间严格同源**——离线链路的改进能自动传导到实时兜底，分叉则收益断
3. **能用确定性程序判定的，不要留给 LLM 判**——LLM 不擅长数标签、对正则；交给 `HTMLParser` + 规则函数
4. **verify 必须看得到生产原料**——事实性校验是"HTML 数值 vs 数据源"对齐，`/audit/` 是前提
5. **三轮可达 + 5 轮兜底**——1-3 轮内收敛，5 轮是异常安全网，到上限就停

## 与已有实体的关系

本文是 **C 端 AIGC 完整工程化范式**：

- 墙比模型更重要 — Stripe/DeerFlow/支小助 的统一论断（行业 proof + 阶段史）
- Harness Engineering 概念框架 — 抽象框架（Compaction vs Reset, Generator + Evaluator 分离）
- LangChain 沙盒架构 — sandbox 设计
- Agent Harness Engineering: A Survey — 学术 7 层 ETCLOVG 分类法
- AHE：Agentic Harness Engineering — 复旦/北大自动优化 Harness

DIPG 的独特贡献是：**把"verify 闭环"工程化到具体代码级别**——3 Agent 三角分工、LangGraph 三层嵌套、state["files"] + /audit/ 双层数据通道、prompt 错误回灌、3 级 Harness 嵌套。每一层都有具体工具名、文件路径、badcase 案例，可直接复用。

## 可迁移场景

- AI 生成的图表、图片、视频：离线跑合规 + 质量 verify，合格才入 CDN
- AI 写的文档、摘要：离线跑事实 + 风格 verify，合格才入产品
- AI 生成的营销素材、广告词：离线跑监管 + 事实 verify，合格才投放

## 相关实体
- [Wall Not Model Harness Three Case Studies Stripe Deerflow Ant](ch05/009-harness.md)
- [Nvidia Gamma World Multi Agent World Model](ch03/044-agent.md)
- [Anthropic Multi Agent Research System](ch04/462-anthropic-multi-agent-research-system.md)
- [Openclacky Harness Engineering 100 Percent Cache Hit](ch05/061-harness-engineering.md)
- [Factory Mission Multi Agent Architecture](ch01/888-factory-mission-multi-agent-architecture.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/dipg-ant-insurance-host-research-verify-offline-closed-loop.md)

- [how grab is using ai agents to boost team productivity](ch04/150-ai.md)

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/multi-agent-coordination.md)
## 深度分析

### 分析 1：架构翻转背后的工程哲学

DIPG 的核心创新不是某个具体算法，而是一次**架构范式转移**——把"生成后校验"变成了"校验前生成"。传统思路是让 LLM 尽量一次做对，然后在输出端做验证。但文章揭示了一个更务实的工程哲学：LLM 无法保证一次做对，那么架构设计的目标就不是"防止出错"而是"保证错误不触达用户"。

离线生成 + Verify 闭环的架构，本质上是把 LLM 的不确定性封装在一个受控的异步环境里（后台批量生成），让 C 端用户只接触到经过校验的确定性产物。这与传统的"缓存 + 兜底"思路不同——DIPG 不依赖缓存层来吸收生成时延，而是彻底把生成行为从用户请求路径上剥离。

### 分析 2：三角分工的职责边界设计

三个 Agent 的分工有一个微妙但关键的设计洞察：**Research Agent 被设计成"只生成，不修正"**。这不是功能缺失，而是刻意的能力边界划分。如果 Research Agent 同时具备修正能力，它在收到修正指令时会重新进入"研究模式"——重新理解需求、重新拉素材、重新综合产出，容易把正确的部分也改错。

Verify Agent 只负责校验不改 HTML，进一步强化了职责分离。校验者如果同时是修改者，它的修正动作会污染下一轮的校验视野——修改过的内容会让自己更难客观判断。Host Agent 承担修正动作，但被 prompt 强制约束"只做局部 patch，不从零生成"——这是一个精心设计的最小修正原则。

### 分析 3：Prompt 回灌的本质是弱监督蒸馏

错误回灌机制揭示了一个重要的系统思维：**Verify Agent 在同时扮演两个角色**——对当次生成物的质检员，和对历史 prompt 的训练信号发生器。离线链路的每次 verify 修正循环，都在生产可供回灌的监督数据。当同类错误累积到足够量，就从具体的 fix_hint 蒸馏成通用的 prompt 规则。

这种设计的工程价值在于：它不需要额外的标注数据或人工介入，错误本身就是信号来源。但这也带来一个隐蔽的风险——回灌规则会逐渐累积，可能导致 Research Agent 的 prompt 变得越来越长、越来越复杂，最终影响生成质量。需要定期对 prompt 规则进行去重和合并，防止规则膨胀。

### 分析 4：两级校验的分层Token分配

structural_check 和 llm_verify 的分工表面上是效率优化（程序判定比 LLM 便宜），实质上是一个**Token 预算分配策略**。在有限的 LLM token 预算内，把机械性检查全交给程序，LLM 只做它真正擅长的事——事实性判断和语义理解。这意味着每次调用 llm_verify 时，模型面对的输入已经是一个"通过结构性检查的、相对可信的 HTML"，它的工作变成了判断"内容是否忠实于数据源"，而不是"有没有语法错误"。

两级校验还带来一个额外优势：降低 Verify Agent 的模型能力要求。既然结构性问题已经被程序处理掉，llm_verify 只需要一个相对轻量的模型就能完成语义校验，可以降低推理成本。

### 分析 5：三级 Harness 的时间尺度解耦

DIPG 的三级 Harness 嵌套实际上是一个**多时间尺度的反馈系统设计**。Level 1（用户请求级）的兜底链路执行最频繁但覆盖最小，Level 2（按品预生成级）执行频率次之但覆盖主路径，Level 3（线下迭代级）执行频率最低但影响最深远。

这种设计的精妙之处在于：每一层的决策周期和影响范围是匹配的。Level 1 的决策必须快（用户等不起），Level 3 的决策可以慢（离线迭代有充裕时间）。但三层共享同一套数据契约和工具，保证了整个系统在演进过程中的一致性。

## 实践启示

### 启示 1：在架构设计阶段就锁定"不出错"而非"少出错"

如果你的 AIGC 产品面向 C 端用户且一次成功率无法保证 100%，应在架构设计阶段就把"实时直出"排除在主路径之外。改为"离线生成 + 校验 + 存储 + 按需直出"的架构，把 LLM 的不确定性封裝在异步后台。实时兜底只作为未覆盖场景的降级方案，而非默认路径。

### 启示 2：生成器和校验器的模型选型要有差异

为 Verify Agent 选择与 Research Agent 不同的模型，可以减轻"同一模型既当运动员又当裁判"带来的认知偏置。如果资源允许，Verify Agent 使用比 Research Agent 更强的模型可能带来更好的校验效果——因为校验要求更严格的推理链和更强的指令遵循能力。

### 启示 3：用结构强制替代语义强制

在要求模型引用数据源的场景下，与其要求模型"请在生成内容后标注来源"，不如设计让模型"写不出来源就不要写数据"的生成顺序。利用自回归模型先生成注释再生成内容的特性，让结构本身成为约束，而不是依赖模型的语义理解来保证合规。

### 启示 4：为修正循环设置硬上限并定义降级策略

1-3 轮收敛是正常预期，5 轮是异常安全网。在设计修正循环时，必须设置硬上限并定义到达上限后的降级策略（标记待人工介入、抛出 error_code 给下游业务决定），而不是让 LLM 无限互卷。修正循环不收敛通常意味着更深层的问题（如素材缺失），不是更多轮次能解决的。

### 启示 5：建立 Prompt 规则的定期蒸馏机制

当同类 verify 错误累积时，应有机制将其从具体的 fix_hint 蒸馏成通用的 prompt 规则。但要防止规则无限膨胀——建议建立规则去重和合并的流程，定期审视 prompt 规则库的冗余度和复杂度，保持 Research Agent prompt 的可维护性。

---

