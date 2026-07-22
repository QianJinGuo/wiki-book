---
source_url: "https://mp.weixin.qq.com/s/ys_yLo-xP6Hy0PnHYXHEMg""
ingested: 2026-06-26
sha256: 2539a6f1fca08b7f
---

# DIPG 蚂蚁保 保险快查 深度解读页面生成系统：Host-Research-Verify 三 Agent 离线 verify 闭环

> 来源：微信公众号｜作者：晓灰 @antgroup.com｜2026-06-01

## 核心设计：架构翻转

DIPG（Deep Interpretation Page Generator）是蚂蚁保保险快查的 C 端 AIGC 深度解读页面生成系统。它的核心创新是**架构翻转**：

> 不让 C 端用户直接吃 LLM 实时生成的结果，把架构翻转成 **"host-generate-verify-modify → DB 按品开启 → C 端直出"**。

- 离线生成：带 verify 闭环的 Agentic Loop 负责，只有通过 verify 的 HTML 才刷入 DB 并暴露给用户
- 实时生成：保留为未开启品的兜底路径

## 为什么不能让实时生成直出

### 1. 时延扛不住

一次完整的深度解读需要 agentic 检索素材与条款 + 生成几千字 HTML，LLM 推理加起来几十秒。C 端用户等不起，"秒出"是基础体验要求。

### 2. 质量扛不住

LLM 生成 HTML 出两类错：
- **渲染类错误**（孤儿闭合标签、组件层级错乱）让页面直接塌掉
- **幻觉类错误**（数据不符、编造对比）让用户读到错信息

LLM 一次过做不到 100% 正确，直出就是赌。C 端 AIGC 交付的本质要求是：用户点开那一刻看到的 HTML 必须已经被校验过。

## DIPG 的两条线上链路

| 链路 | 定位 | 角色 | 用户看到 |
|------|------|------|---------|
| **离线链路** | 主路径 | Host Agent 调度 Research + Verify，verify 不通过则 patch | 默认可见 |
| **实时链路** | 兜底 | 只跑 Research Agent，不经过 verify | 默认不可见（仅"未开启品"用） |

两条链路的 **Research Agent 完全同源**——离线链路在它之上套了一层 Host Agent（调度 Research/Verify、按 verify 反馈 patch HTML）；实时链路只跑一次 Research Agent，Host 和 Verify 都不参与。

DIPG 当前采用"离线刷入 DB + 按品维度开启"：后台批量预生成并刷入 DB，只对"已开启的品"向 C 端暴露——用户请求时直接从 DB 读离线产物，命中率 100%，不依赖缓存层兜底。

## DIPG 内部的 3 个 Agent（三角分工）

### Host Agent — 总编排 + 精准修正

读到用户请求后按"研究 → 校验 → (若未通过)修正 → 再校验"的流程派活。当 Verify Agent 返回修正意见时，**Host Agent 自己在已有 HTML 上做精准编辑**（按 fix_hint 定位段落、patch 掉问题点），而不是再派一次 Research Agent 重新生成。

### Research Agent — 只负责从零生成

拿到产品编号后下载素材、多轮读取条款、必要时搜网络，最后产出整份 HTML 片段。**不参与修正循环**——修正不是它的工作。内部也是完整 ReAct Agent，有自己的工具链。

### Verify Agent — 只负责校验、不改 HTML

读 HTML 产物 + Research Agent 用过的原始素材，做"程序化结构校验 + LLM 事实校验"两层检查，产出结构化的修正意见（fix_hint 列表）。

### 3 个 Agent 协作的 LangGraph 实现

三个 Agent 都是 LangGraph 意义上的独立子图，Host Agent 通过 `task` 工具异步调用另两个。LangGraph 物理上是**三层嵌套**（外层 Graph / 中层 Host / 内层两个 SubAgent），逻辑上就是三角分工。

## 真实 badcase：两类致命错误

### Badcase 1：孤儿 `</div>` 让页面塌掉

某天巡检到一份重疾险深度解读报告在 C 端偶发渲染错位——最后一个"风险提示"卡片下，下一个无关模块被挤歪了。HTML 末尾多了一个孤儿闭合标签，进到移动端容器被当成关闭自身的信号，导致下一个兄弟组件位置错乱。

**问题很隐蔽**：整份报告顶层是平铺结构（`<h2>` 和各种 card 组件作为兄弟元素并列），没有外层包裹 `<div>`，但 LLM 凭"印象"在末尾补了一个 `</div>` 当收尾。

### Badcase 2：惠民保"优于市场 85%" 幻觉

"特色保障分析"模块赫然写着"优于市场 85% 同类惠民保产品"。翻遍 Research Agent 拉到的全部素材——保险条款、投保须知、健康告知——**没有任何关于"市场排名"或"百分位"的数据**。

> 孤儿 `</div>` 让页面"塌掉"，这个 badcase 让页面"骗人"——而且骗得很体面，不翻数据源根本看不出来。

## 多 Agent 物理实现：三层 LangGraph 嵌套

### 三层结构

| 层 | 角色 | 拓扑 | 决策 |
|----|------|------|------|
| 外层 | StateGraph（边硬编码） | callback 必经节点 | 不依赖 LLM 决策 |
| 中层 | Host Agent（build_domain_agent_v3） | blueprint 声明式配置 | ReAct 循环 |
| 内层 | Research Agent + Verify Agent | CompiledSubAgent | 各自独立 LangGraph 图 |

### `task` 工具：SubAgent 注入机制

LangGraph 里没有"直接调另一个 agent"的原生操作，所有异构执行必须包装成工具。`create_task_tool` 做的事：

1. 把 Research Agent 和 Verify Agent 按 name 注册到 `agents` 字典
2. 创建一个 `task(description, subagent_type)` 工具
3. 把 `task` 工具加到 Host Agent 的工具列表

Host Agent 看到的是这样一个**多态工具**：
```
task(description: str, subagent_type: str)
  ├── subagent_type="chacha_research_agent": 保险产品研究助手
  └── subagent_type="verify_agent": 报告验证
```

### `task` 内部三件事

- **上下文隔离**：每次调用都用新 thread_id + 全新 messages，SubAgent 看不到 Host 的对话历史，也看不到兄弟 SubAgent 之前跑过什么。避免 Verify Agent 被 Research Agent 的"我觉得这段挺好"之类的自述污染
- **单一返回值**：Host Agent 只收到一条 ToolMessage，SubAgent 内部的多轮工具调用、中间推理对它不可见
- **files 合并**：SubAgent 写的 `state["files"]` 通过 `Command.update` 合并回 Host 的 `state["files"]`。跨 SubAgent 共享数据的主通道

## state["files"] 与 /audit/ 数据契约

### state["files"]：跨 Agent 共享的虚拟文件系统

Research Agent 的 `write_file` 工具并不直接写物理磁盘——它通过 `Command(update={"files": {...}})` 把内容写进 LangGraph state 的 `files` 字段。Verify Agent 启动时的 `structural_check` 节点调 `extract_report_from_files(state)` 从 `state["files"]["report.html"]` 取 HTML。

Research Agent 和 Verify Agent **不需要通过显式的参数传递来交换 HTML**——`state["files"]` 作为共享 state 就是它们之间的通道。

### /audit/：生成原料（工具调用记录）

Verify Agent 要判"数据是否忠实"，光看 HTML 不够——必须对比 HTML 里的每个数字和 Research Agent 当初拿到的原始数据供给。AuditWrapperMiddleware 包装所有工具调用，把 Research Agent 每次调 `download`、`read_disk_file`、`web_search` 的输入输出写到 `/audit/` 目录：

```
/audit/
  ├── download_insurance_product_materials_<ts>.json   ← 产品素材列表
  ├── read_disk_file_<ts>.json                         ← 每次读素材
  ├── web_search_<ts>.json                             ← 网络搜索结果
```

| 位置 | 写入者 | 读取者 | 生命周期 |
|------|--------|--------|----------|
| `state["files"]` | write_file 工具 via Command.update | 任何能访问 state 的 SubAgent | 随 checkpointer 持久化 |
| `/audit/` | AuditWrapperMiddleware 包装所有工具调用 | Verify Agent 通过 read_file | 随 checkpointer 持久化 |

> `files` = 生成的产物（HTML、中间结果）。`/audit/` = 生成的原料（工具调用的输入输出）。Verify Agent 用 `ls /audit/` + `read_file` 就能读到 Research Agent 期间的全部工具调用记录。

## Research Agent 的 prompt 契约

### 4.1 合规用语硬规则（监管红线）

```
<compliance_wording>
- 禁止: "0免赔""零免赔""无免赔"   → 合规: "0免赔额""免赔额为0"
- 禁止: "100%全赔""多少都能赔"     → 合规: "责任内,赔付比例100%"
- 禁止: "储蓄险"                   → 合规: "储蓄型保险"
- 禁止: "确诊即赔"                 → 合规: "首次确诊责任内疾病可赔"
...
</compliance_wording>
```

监管敏感词绝不允许出现，硬约束清单。

### 4.2 事实性保证的 8 条规则

针对幻觉问题：

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

## Verify Agent 两层校验

### structural_check（程序化校验）

纯 Python，基于 `html.parser.HTMLParser` 自定义的 `StructureParser`，检查确定性规则：

| 规则 | 检查内容 |
|------|----------|
| rule1 | `<style>` 标签不应出现在片段中 |
| rule3 | `<h2>` 之间必须有实质内容（防止连续空 h2） |
| rule4 | `<h2>` 文本不得手动加序号（"1. ""① "等） |
| rule5 | 标签完全闭合 / 无孤儿闭合标签 / 无交叉嵌套 |
| rule6 | `<h2>` 必须在顶层，不能被非组件 `<div>` 包裹 |
| rule7 | 禁止内容重复 |

**毫秒级响应，零假阳性**。前面那个孤儿 `</div>` badcase 就是被 rule5 的 TAG_ORPHAN 直接命中。

### llm_verify（语义 + 事实校验）

消费 `/audit/` 下的原始数据供给 + 生成的 HTML，产出结构化 JSON。惠民保 badcase 的处理示例：

```json
{
  "fact_accuracy_score": 3,
  "html_format_score": 5,
  "fact_accuracy_issues": [{
    "module": "特色保障分析",
    "desc": "存在无数据支撑的市场排名表述",
    "evidence": "报告中写'优于市场85%同类惠民保产品'，但数据供给中没有任何关于市场排名或百分比的数据",
    "fix_hint": "删除'优于市场85%同类惠民保产品'的表述，或改为基于条款的客观描述如'保障责任较为全面'"
  }]
}
```

**两个节点分工原则**：能用程序判定的，不让 LLM 看。LLM 的 token 预算全部投给真正擅长的事实性判断，不浪费在数"有几个未闭合标签"这种机械活上。

**模型选型不对称**：Verify Agent 的模型和 Research Agent 的模型最好是不同选型，可以减轻"同一模型既当运动员又当裁判"带来的偏置。

## 强制闭环：靠 Host Agent 的 prompt 守纪律

### 修正动作由谁做？路 A vs 路 B

直觉有两条路：

- **路 A**：再派一次 Research Agent 让它重新生成
- **路 B**：Host Agent 自己 patch——直接按 fix_hint 在已有 HTML 上做局部编辑

**DIPG 走的是路 B**，这是体系性设计选择：

- Research Agent **不擅长改，只擅长生成**。它的 prompt 和工具链都是为"理解需求 → 拉素材 → 综合产出整份报告"设计的。一旦再派给它"按以下意见修正"，它会重新进入研究模式，容易全盘重写——把好的部分一起改掉
- Verify Agent 给的是已经精确定位过的 fix_hint（含 module 名、evidence 行号、具体修正动作），修正动作此时已经退化成"在已有文档里找到 X,改成 Y"这种轻量编辑

### 三个 Agent 调用的不对称分工

| Agent | 在闭环里被调用的次数 | 职责 |
|-------|---------------------|------|
| Research Agent | 只在第 1 轮被调一次（从零生成） | 创造 |
| Verify Agent | 每轮被调一次 | 校验 + 提 fix_hint |
| Host Agent | 全程在线 | 编排 + 自己按 fix_hint 精准修正 HTML |

### 两条硬性 prompt 约束

1. **"HTML 只能由 chacha_research_agent 产出,你不可自行编写"**——Host 不可从零写整份
2. **"仅按修正意见精准编辑报告,不做任何额外更改"**——Host 可以而且应该做局部 patch，但只限于 verify 提到的点

两条结合起来才是完整语义：Host 不创造，只修正；修正只动 verify 指出的地方。

### 5 轮异常兜底

正常情况下 Verify 意见应在 1~3 轮内被 Host 完全 patch 完，循环自然结束。跑到 4、5 轮已经是少数。**5 轮仍未通过通常不是生成/校验本身的问题，而是意外情况**（比如素材里缺了某个关键数据，Host 修不出 Verify 想要的事实，双方拉锯）。这时候应该停下来，而不是继续 LLM 互卷。到上限时，Host 暂停并把分歧点抛给下游（`error_code` 透传到 callback），由业务侧决定怎么处理。

## 把视野再拉大：三级 Harness 嵌套

整个 DIPG 系统实际上是**三级嵌套的 Harness 反馈回路**，跨越了线下/线上、离线/实时四个象限：

| 层级 | 时间尺度 | 做什么 | 角色 |
|------|---------|--------|------|
| **Level 3** | 线下（周/月） | 迭代 verify 能力 | 让 verify 越来越强（召回更准、误报更少） |
| **Level 2** | 线上（按品预生成） | DIPG 主干 | 离线 verify 把关主交付 + 沉淀 prompt |
| **Level 1** | 线上（用户请求时） | 兜底 | 仅在"品未开启"或"DB 暂未写入"时触发，常态下 C 端看不到 |

每一层 loop 时间尺度差了一到两个数量级，但它们共享：

- 同一个 Verify Agent（Level 3 迭代它，Level 2 使用它）
- 同一份 Research Agent 的 prompt chacha_prompt.py（Level 2 蒸馏出规则，Level 1 跟着升级）
- 同一套 `/audit/` 数据契约
- 同一组 benchmark 样本（线上 badcase 回流补充）

## 让生成过程更可靠：错误回灌 prompt

### 两重价值的区别

| 价值 | 作用对象 | 生效时机 |
|------|---------|---------|
| **把关**（直接价值） | 当次生成的 HTML | 离线生成时立即生效：不合格的产物不刷入 DB |
| **回灌**（间接价值） | 后续所有生成（含实时兜底） | 下次生成时生效：Research Agent "一次过"的概率更高 |

> 离线链路本身不依赖回灌——哪怕回灌机制完全不存在，离线链路凭 Verify Agent 把关也足以保证交付质量。但有了回灌，离线链路的 verify-修正闭环收敛更快，实时兜底链路的出错率也随之下降。

### 回灌流程：半自动提炼

举一个具体例子。早期 LLM 经常把"集团/母公司"的数据（总资产、世界 500 强排名）直接套用到"子公司/产品"上——比如某子公司被写成"世界 500 强第 25 位"，而那其实是其集团的排名。离线 Verify Agent 反复抓到这类实体对齐错误，修正意见高频出现。我们把它抽象成一条通用规则写进 Research Agent 的 prompt：

```
实体对齐(信源优先级原则的子条款):严禁混用主体。禁止将"集团/母公司"的数据(如总资产、世界 500 强排名)直接套用到"子公司/产品"上,除非明确说明是"依托于集团"。
```

惠民保"优于市场 85%"的 badcase 也走了同样的路径。Verify Agent 反复抓到"数据供给中不存在市场排名数据，但 HTML 里出现了具体百分位"的 issue，聚合后写进 Research Agent 的 prompt：

```
禁止盲目对比:没有竞品数据不得使用"优于市场 XX%"等市场排名表述。缺少明确数据支撑时,使用基于条款本身的客观特色描述替代。
```

至此，这个 badcase 走完了从"Verify 抓到 → Host 修正 → 回灌 prompt → 下次不犯"的完整闭环。

### 回灌的必要性

只有把关、没有回灌会怎样？——离线链路会无限跑下去，每次都要 Verify Agent 抓一堆相同的错，然后 Host Agent 按一堆相同的 fix_hint 反复 patch。**计算成本浪费，且不收敛**。

有了回灌，Verify Agent 发现的每条 issue 都成了 Research Agent prompt 的"弱监督信号"。当信号累积到足够量，就蒸馏成硬规则，进入 Research Agent 的默认纪律。**Verify Agent 不只是质检员，它同时在替 Research Agent 的 prompt 产出训练信号**——这就是 4.3 节"规则从哪来"的完整答案。

## 5 条踩坑经验

### 经验 1：不要让 LLM 实时产物直出给 C 端用户

当产物质量事关用户体验，且 LLM 难以一次过时，在链路架构上就应该把"实时直出"排除在主路径之外。改为"离线生成 + Harness 把关 + 刷入数据/存储层 + 按需直出"，实时只留作兜底。

### 经验 2：生成器代码 / prompt 在两条链路之间严格同源

离线链路的所有改进（包括 Verify Agent 发现回灌 prompt、新加的合规规则等）能自动传导到实时兜底链路——**前提是两条链路共用同一份 Research Agent 代码和同一份 Research prompt**。一旦分叉，后续收益就断了。

### 经验 3：能用确定性程序判定的，不要留给 LLM 判

LLM 不擅长数标签、对正则。把这类 check 交给 `HTMLParser` + 规则函数，LLM 的 token 投给语义层判断。两层分工明确，token 效率和准确率都更高。

### 经验 4：verify 必须看得到生产原料

事实性校验不是对 HTML 做语言学分析，而是对"HTML 数值 vs 数据源"做对齐。`/audit/` 这类审计通道是事实性校验的前提。

### 经验 5：（隐含）三轮可达 + 5 轮兜底

正常 1-3 轮内闭环收敛。5 轮上限是异常情况的安全网（双方拉锯、素材缺失），到上限就停，不要让 LLM 互卷。

## 可迁移模式

这个模式可以迁移到其他"AI 产物直接面对用户"的场景：

- **AI 生成的图表、图片、视频**：离线跑合规 + 质量 verify，合格才入 CDN；实时兜底只在极少数未覆盖场景下触发
- **AI 写的文档、摘要**：离线跑事实 + 风格 verify，合格才入产品；实时兜底场景有限
- **AI 生成的营销素材、广告词**：离线跑监管 + 事实 verify，合格才投放

## 参考阅读（原作者推荐）

- Claude Opus 4.8 发布：更强判断力、更长自主工作时间，Claude Code 迎来动态工作流
- 从 Prompt、Context 到 Harness，工程的三次进化与终局之战
- 我用 Claude 搭了个自动新闻简报，30 天后比我刷了一年的信息还有用
- 我用 7 天把 AI Agent 的 Token 账单砍掉 87%（附代码）
- QQ 音乐 Harness Engineering 实践

## 系列关系

本文是**蚂蚁集团 Harness Engineering 系列**的第 2 篇：

- 第 1 篇：《Harness Engineering:为 AI 打造可持续迭代环境的实践》—— HelixVerify（线下 Harness, 114 次迭代把风险样本召回率从 8% 提升到 98.86%）
- 第 2 篇（本文）：DIPG（线上 AIGC 闭环 Harness, host-generate-verify-modify）

联系作者：晓灰，xiaohui.wyh@antgroup.com
