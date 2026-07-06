# Agent Loop 工程手册 8 个未解问题 + SELF Protocol 治理薄壳：腾讯陈进的二手解读与单 Agent 实验

## Ch04.154 Agent Loop 工程手册 8 个未解问题 + SELF Protocol 治理薄壳：腾讯陈进的二手解读与单 Agent 实验

> 📊 Level ⭐⭐ | 13.1KB | `entities/agent-loop-engineering-handbook-8-questions-chen-jin-tencent-self-2026.md`

# Agent Loop 工程手册 8 个未解问题 + SELF Protocol 治理薄壳

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/agent-loop-engineering-handbook-8-questions-chen-jin-tencent-self-2026.md)

## 一句话定位

腾讯云开发者陈进（2026-06-16）读完 Peter Steinberger / Boris Cherny 提出的"Agent Loop"工程手册（Reddit/X 讨论量 220 万）后，**整理出 4 个设计法、6 种多 Agent 拓扑、8 个未解问题**，并将自己 30 天单 Agent 实验的 **SELF Protocol**（治理审查层薄壳）作为"答题草稿"开源邀拍砖。

> **重要诚实声明**：本文是**二手解读**（作者未接触 Peter Steinberger / Boris Cherny 原始全文），且 SELF Protocol 是**单样本、单 Agent、无对照组**的实验数据。

## Agent Loop 核心主张

**别再死磕 Prompt 怎么写了，去设计一个能让 AI 自己转起来的"循环（Loop）"。**

- 过去用 AI 像手动挡：每路口换挡踩离合，一句句喂 Prompt
- Agent Loop 像自动驾驶：你只管输入目的地（目标）和限速（护栏），车自己开

## Agent Loop 7 件套

| 术语 | 大白话 | 解决什么 |
|------|--------|---------|
| Automations | 定时闹钟自动开跑 | 不用人每次手动点"开始" |
| Worktrees | 给每个 Agent 一个隔离工位 | 多 Agent 并行不打架（不互相覆盖文件） |
| Skills | 攒下来的"操作手册" | 不用每次从零教 AI |
| Plugins/Connectors | 外接工具（GitHub/Slack/MCP） | 让 Agent 真的能动手 |
| Sub-agents | 一个干活、一个验收 | 防止 AI 自己给自己打高分 |
| Memory | 外挂笔记本 | 突破"聊几句就忘" |
| Guardrails | 限速 + 油量表 | 防止失控烧钱/原地打转 |

## 4 个核心设计法

### ① Stopping Condition 优先于 Prompt
- 别说"把代码改好"（太模糊，AI 会把"我感觉改好了"当成"真改好了"）
- 要说"写一个能复现 bug 的测试，然后让它通过"（可验证）
- **可验证的目标才是真护栏**

### ② Context 是"组装出来的"
不是写一段固定 Prompt，而是根据当前状态动态拼出来——上一轮失败日志、当前文件树、最近 N 条调用记录，全自动拼进下一轮 Prompt。你不再是"写 Prompt 的人"，而是"设计 Context 怎么自动生长"的人。

### ③ 失败是输入，不是终点
跑挂了？把错误堆栈、报错截图、上次 Diff 全自动喂回去当下一轮的输入。**这跟传统编程"出错就停"是反过来的思路**。

### ④ 多 Agent 协作有 6 种"拓扑"
顺序流水线 / 协调者-工作者 / 扇出合并 / 生成-验证 / 共享状态 / 辩论对抗。每种都对应一类典型场景。相当于给"多 Agent 怎么搭"建了一个模式词典。

## 8 个未解问题（核心价值）

### 1. 软目标停止条件怎么办？
LLM 当 judge 互打分会漂移——**上午 0.85，下午同样的输出 0.6**。SELF 土办法：诚实分级 disclaimer（论文级/工件级/计划级三档），强制显式标注"我没法验证"。

### 2. Maker-Checker 同病相怜
两个 Agent 同底模，盲区高度重合。**亲身试过：Agent A 写代码、Agent B 验收，B 把 A 的 off-by-one 代码全都标 PASS**。应该用不同模型当 Checker？还是用规则引擎/单元测试当硬验收？

### 3. 护栏写在哪一层？
焊死在 Loop 框架里（紧凑但难改）vs 可插拔独立层（灵活但易忘开）。**作者就忘开过一次，一晚上烧了几十块测试 token**。SELF 分法：认知类可插拔（常需迭代）+ 资源类焊死（应写死）。

### 4. 记忆给多大？
太大失焦（什么都翻一遍），太小等于没解。SELF 三层（l0/l1/l2）按需展开。**按 token budget 截断？按相关性打分？按时间衰减？**

### 5. 理解力腐蚀
手册自己警告"过度依赖导致理解力腐蚀"。**作者体感：搭的循环跑两周后突然发现不太记得每一步在做什么**。重度 AI 自动化后怎么对冲？

### 6. 拓扑选型踩坑
**试过"辩论对抗"做风险评估，结果两个 Agent 互相说服反而比单 Agent 更糊涂——一起越聊越自信，最后一致同意一个错的结论**。哪些拓扑是看着美用着崩的？

### 7. 防 AI 一本正经地胡说
**Loop 跑得越自动，AI 错得也越自信**。SELF pre-publish 审查清单（链接真假/数据出处/未核实结论）实测拦下过 1 次编造。**接外部检索？独立 fact-checker Agent？白名单只让输出特定结构？**

### 8. 成本压缩
多 Agent 并行 + 长循环，token 烧得快。**模型分级？Prompt 压缩？缓存中间结果？**

## SELF Protocol：30 天治理薄壳

**定位**：Agent Loop 教"怎么让 AI 自己转起来"，**SELF 是"转起来怎么不跑偏"的那一层薄壳**——前者是骨架，后者是润滑层；前者解决能不能转，后者解决转得稳不稳。

### 是什么 / 不是什么

| 维度 | SELF Protocol |
|------|--------------|
| 是什么 | 一层很薄的"白盒治理" Markdown 约定 + 少量 Python 脚本 · ~1500 行 · 单 Agent 实测 30+ 天 |
| 不是什么 | ❌ 不是新框架（不替代 Claude Harness/Agent Loop）/ ❌ 不接管你的 LLM 和工具集 / ❌ 不是产品，是一份开放协议 |
| 设计目标 | 让任何"已经在跑 Loop 的 Agent"加一层认知护栏 |
| 当前形态 | Knot Skill 33837 · v1.6.7 · Close Beta |

### 三大模块（被真实坑逼出来的）

1. **白盒记忆治理**：Markdown 三层分级（l0/l1/l2）+ 答关键问题前强制翻笔记 → 治"失忆型胡答"
2. **pre-publish 审查**：链接真假 / 数据出处 / 未核实结论清单 → 治"一本正经的胡说"
3. **失败转技能**：踩坑 → 沉淀成可复用规矩 → 治"重复掉同一个坑"

### 30+ 天真实数据（单样本 · 公开邀拍砖）

- 268 次 LLM 调用
- 20 个失败案例
- 314 条学习记录
- 实测拦下"编造数据"事故 1 次（在自动周报循环里）
- **同类失败仍在反复犯**（说明本身有盲区）—— 这是诚实，不是宣传

### Safe-Launch 安全承诺
- 默认只读体检模式（5 分钟、零写入）
- 4 档入口按风险递增（只读 → 一次性 → 候选写入需拍板 → 长期托管）
- 输入"关闭 SELF"即停（零变更）
- 不污染既有 skill / 不默认建 cron

## SELF Protocol 对照 Loop 5 件套

| Loop 5 件套 | Loop 做法 | SELF 补强 | 诚实评估 |
|------------|----------|----------|---------|
| Memory | Markdown/DB 突破上下文 | 三层分级 l0/l1/l2 + 答前强制翻笔记 | 30 天有效但仍有失焦 |
| Sub-agents | Maker-Checker | 单 Agent 内置"小查"角色卡 pre-publish 清单 | 比无验收强，但同模型盲区共存 |
| Guardrails | 资源类（迭代/预算/无进展） | 加认知类（不胡说/不失忆/不污染）+ 发布出口拦截 | 拦下过编造数据 1 次 |
| Skills | 攒可复用指令 | 失败转技能 | 30 天攒 9 条，同类失败仍在反复 |
| Stopping Condition | 可验证硬目标 | 软目标诚实分级 disclaimer | 治不了软目标本身，但不会假装"完成了" |

## 关键洞察提炼

1. **二手解读的价值不在"原创"，在"用大白话翻译 + 公开邀拍砖"**——把硅谷一线讨论（220 万曝光量）翻译成中文工程社区可消化的 7 件套 + 4 设计法 + 6 拓扑。
2. **SELF Protocol 的核心贡献是"把失败摊开"**：30 天单 Agent 268 LLM calls / 20 失败 / 314 学习记录全部公开——这种诚实姿态在中文 AI 社区里罕见。
3. **8 个未解问题是真正的开放问题**，不是 8 个"答案"——作者在结尾直接说"任意一题选你最有感的回一下都行，评论区见"。**这是中文 AI 工程社区最该有的姿态**。
4. **同模型盲区是 Maker-Checker 的致命缺陷**（题 2）——这是 Anthropic、OpenAI 都没公开解决的核心问题。
5. **Token 成本是 Loop 落地的隐藏杀手**（题 8）——手册没讲怎么压，作者用 3 条土办法但承认不解渴。

## 与其他 Loop/Harness 实体的关系

→ [Loop Engineering（Addy Osmani 若飞）](../ch05/006-loop-engineering.md) — 同样是 Loop 范式但面向**开发循环**（commit-iterate-fix）而非 **Agent 自循环**（prompt-tool-output-loop）
→ [Harness Engineering Survey 2026](../ch05/092-harness-engineering.md) — 同样社区层面的 Agent 工程化范式整理，但**侧重 12 组件分类**
→ [Harness Architecture Production Guide](../ch05/038-agent-harness.md) — Harness 12 组件 vs Agent Loop 7 件套（不同抽象层级）
→ [腾讯 Skill 写作 Playbook](ch04/262-skill.md) — 同样腾讯系但讲 **Skill 写作**（如何写好一个 Skill）
→ [从 Prompt 到 Harness 工程三次进化](../ch05/009-harness.md) — 同样腾讯系但讲**进化论**（从 Prompt 到 Harness 的迁移）
→ [Harness Observability Production](../ch05/038-agent-harness.md) — 同样讲 Harness 但侧重**可观测性**

## 与其他腾讯系 entity 的对比定位

本文是腾讯云开发者公众号 2026-06 系列 harness/agent 工程化文章的**反思层**（用未解问题倒推实践），与**实操层**（Skill 写作 Playbook）/ **进化论层**（Prompt→Harness 三次进化）/ **可观测性层**互补。

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/memory-context-systems.md)

---

