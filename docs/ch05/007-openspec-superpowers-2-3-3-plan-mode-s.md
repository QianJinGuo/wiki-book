# 缝合怪识别与减法决策论：OpenSpec + Superpowers 融合方案下线记（2 周 3 次实测 + 3 个测试 + 加法传播学 + Plan Mode + Superpowers + ASD 最终方案）

## Ch05.007 缝合怪识别与减法决策论：OpenSpec + Superpowers 融合方案下线记（2 周 3 次实测 + 3 个测试 + 加法传播学 + Plan Mode + Superpowers + ASD 最终方案）

> 📊 Level ⭐⭐ | 26.6KB | `entities/openspec-superpowers-decommissioning-frankenstein-three-questions-shuge-2026-06-18.md`

# 缝合怪识别与减法决策论：OpenSpec + Superpowers 融合方案下线记

> **来源**：术哥（shuge）Spec-Driven AI 编程系列第四篇（反思篇），2026-06-18
> **核心命题**：**"收藏过万的融合方案 ≠ 工程有效方案"。好的工具链不是收集出来的，是删出来的。** 本文给出**缝合怪的 3 个识别测试** + **加法 vs 减法的传播学反思** + **Plan Mode + Superpowers + ASD 最终方案**的完整决策过程。

## 一、定位：反爆款实战反思

| 维度 | 上周收藏过万的融合方案 | 本文作者团队 2 周实测 |
|---|---|---|
| 点赞数 | 万人收藏 + 评论区"先马后看" | 0（实战派不写爆款） |
| 测试方式 | 工具清单叠加 + 概念图 + 一厢情愿分工 | 2 周 pilot / 3 次完整实测 / 问卷反馈 |
| 同步方式 | 描述设计中的"握手协议" | **0 个 skill 自动触发**，全靠人肉 checklist |
| 实际成本 | 1 + 1 = 2（理论） | **1 + 1 < 1**（实测比单用 Superpowers 更慢更贵） |
| 最终走向 | 持续在收藏夹里 | 下线 OpenSpec |

## 二、下线原因：1+1 < 1 的三处重叠

把 OpenSpec 和 Superpowers 两条工具链并排画出来，3 处重叠一目了然：

| 冲突 | 现场 | 后果 |
|---|---|---|
| **设计文档归谁管** | OpenSpec 产出 design.md，Superpowers brainstorming 也产出 design doc，内容高度重叠 | 开发者不知以哪份为准 |
| **真相源冲突** | OpenSpec 认 Spec 是 truth，Superpowers 认测试是 truth | 不一致时永远听测试的，spec 沦为没人看的文档 |
| **多层审批互不信任** | review spec → review design → review plan，审的是同一组信息的三种表达 | 时间变长，信心没有增加 |

### 手工同步 ≠ 自动集成

更直接的信号：**三次实测，0 个 skill 自动触发**——Scenario 名对齐、validate 双跑，所有"握手协议"都靠人肉维护。

> 缝合怪的本质，是让人肉充当工具之间的胶水。胶水是会累的。两周后最先撑不住的不是工具，是当胶水的那个人。

## 三、能修，但值得修吗？三笔账算完就收手

熟悉 Claude Code 的读者已经在反驳：这些打架工程上全都有解（写 skill 让 brainstorming 消费 OpenSpec design.md / 加 hook 强制命名对齐 / 合并多层审批）。**作者团队当时真的列了这张修补清单。动手之前算了三笔账——算完就收手了**。

### 第一笔账：你修补的不是 bug，是世界观

| 工具 | 世界观 | 今天成立吗？ |
|---|---|---|
| OpenSpec | Spec 是真相源，代码是它的投影 | **不成立** — Spec 是自然语言有损翻译 + 反向同步成本数倍于改代码 |
| Superpowers | 测试是真相源，文档只是脚手架 | **成立** — 跑通测试 = pass/fail，无歧义 |

> **今天的 Spec 不是 truth，是 claim**——一份等待验证的主张。真正的 truth 只有一个：跑通测试的代码。

你写的每一个同步 skill，都是在给一个不成立的前提续命。

### 第二笔账：修补的终点，是重写

把同步自动化、产物去重、卡点合并全部做完，回头一看你干了什么？你把 OpenSpec 的功能，用"测试是真相源"的世界观**重新实现了一遍**。

> **修补的尽头不是融合，是吞并。**既然终点注定只剩一个真相源，为什么不在起点就只留一个工具？

### 第三笔账：就算修成了，方向也是反的

03 篇（术哥 SSD 系列）金句：**模型在变强，正确方向是 more context, less control**。而修补完的机器——产物更多、卡点更多、链路更长——每一个零件都在往 control 上加码。

> 工程师最危险的时刻，不是解不出问题，而是兴致勃勃地去解一道不该存在的题。

## 四、为什么缝合怪反而受追捧？三个认知陷阱

方案下线后作者困惑于"融合文章数据为什么那么好"。**点赞数测量的不是工程有效性，是心理有效性**。三个陷阱环环相扣：

### 陷阱一：收藏的是安全感，不是工作流

"全都要"卖的是幻觉：每个工具优点都不错过。读者点下收藏那一刻，焦虑已治愈——至于方案能不能跑半年，没人会回来验证。

> 爆款工作流的归宿是收藏夹，不是 CI。"先马后看"的真实含义是"永远不看"。

### 陷阱二：加法有传播性，减法只有有效性

"我融合了五个工具"是全家福；"我删到只剩 Plan Mode + 测试"看起来像偷懒。

**但工程里最贵的能力恰恰是做减法**——下线 OpenSpec 之前，把每项价值都找到了接盘者：

| OpenSpec 原职责 | 接盘者 |
|---|---|
| 意图对齐 | Plan Mode |
| AC（验收标准）| 测试 |
| 变更追溯 | git |
| 活基线 | 测试套件本身 |

> 加法不需要理解，减法需要。传播市场天然奖励加法。Less is more 不涨粉。

### 陷阱三：把"单独有道理"当成"叠加更有道理"

直觉说：OpenSpec delta 回写有道理 + Superpowers TDD 有道理 + Spec-Kit 分层有道理 → 全用上道理最大化。

**错在算法**：

> **工具的收益是加法，工具间的关联成本是乘法。**两个工具一条人工同步链，五个工具十条。收藏量随工具数线性涨，维护成本随组合数爆炸。

## 五、3 个测试识别缝合怪（本文独有方法论）

> **问题从来不是"用了几个工具"，而是工具之间重不重叠、同步靠不靠人肉。组合不是原罪，重叠才是。**

### ① 真相源测试
两个工具对"什么是 truth"的回答一致吗？
- OpenSpec 认 Spec，Superpowers 认测试 → 不一致 → **缝合**

### ② 同步测试
工具 A 的产物变了，工具 B 自动知道吗？
- 靠人工对齐的关联是定时炸弹。问自己：需求量翻三倍，同步工作量翻几倍？

### ③ 重叠测试
删掉其中一个工具，有没有另一个工具天然补位？
- 删掉后另一个天然补位，说明两者本来就在干同一件事——**留一个就够**

**三个测试全过才叫集成，过不了就是缝合。**

## 六、正确路径：渐进式（分流） vs 缝合（串联）

工具链的问题不是"选哪个工具"，而是"用什么结构组织工具"。两种相反的拓扑：

| 拓扑 | 形态 | 成本特征 | 适用 |
|---|---|---|---|
| **缝合（串联）** | 每个需求穿过所有工具 | 成本 = 所有工具之和 | 几乎不适用 |
| **渐进式（分流）** | 按场景分档，每个需求走最匹配路径 | 成本 = 单条路径 | 推荐 |

> 不同场景用不同的工具，而不是所有场景用所有的工具。

### 6.1 主干：按需求分档

| 需求类型 | 路径 | 理由 |
|---|---|---|
| **重需求** | Superpowers 全套 | 留下它，正是因为它的世界观赢了（测试是真相源，流程是质量纪律） |
| **中轻需求** | Plan Mode | 先出计划、人确认、再执行。**Plan Mode 本身就是轻量 Spec**，不要把"没有独立 spec 文件"当成"没做 spec 驱动" |
| **所有需求** | 共享地基 | CLAUDE.md + 知识库 |

### 6.2 增强层：ASD（Agent-Spec-Driven）— 6 注入点

> 在 Intent → Spec 补 Context（让 AI 少猜），在 Spec → Code 补 Eval（让 AI 不能自证正确）。

ASD 不改 Superpowers 一行源码，通过 CLAUDE.md 的 `@import` 侧面注入 6 个点：

| # | 注入位置 | Superpowers 默认 | ASD 覆写 |
|---|---|---|---|
| ① | brainstorming | 只看代码和文档 | 检索知识库，注入领域铁律和踩坑记录 |
| ② | brainstorming | spec 格式自由 | 强制模板 + AC 全局编号 |
| ③ | writing-plans | task 按功能拆 | 每个 task 标注关联 AC 编号 |
| ④ | TDD | 测试命名自由 | 测试函数嵌入 AC：TestAC01_余额扣减 |
| ⑤ | verification | Agent 自己跑测试自评 | **外部闸门管道替换自评** — 考生不能批改自己的试卷 |
| ⑥ | finishing | 测试过了就交付 | ac-coverage / drift-check 全量校验 |

**贯穿全程的那条线**：AC 编号从 spec → task → 测试函数名 → 覆盖率校验，**一路自动追溯**——同一个需求，从"人肉胶水"变成"机器纪律"。

### 6.3 验证管道：8 步独立闸门

```
bootstrap → spec-lint → build → lint → unit-test → ac-coverage → integration → drift-check
```

- 前 4 步：build / lint / test（本来就该跑）
- 后 2 步（ASD 独有）：
  - **AC 覆盖率**：每条 AC 都有对应测试吗？
  - **漂移检测**：代码还和 spec 一致吗？
- 失败自动重试 3 次，3 次不过升级人工

### 6.4 自检：3 个测试扫自己

| 测试 | OpenSpec + Superpowers | Plan Mode + Superpowers + ASD（最终方案） |
|---|---|---|
| **真相源** | Spec 和测试两个 truth，打架 | 唯一 truth = 测试；spec 审完即冻结，活基线是测试套件 |
| **同步** | Scenario 名人肉对齐 | AC 编号机器贯穿，ac-coverage 自动校验 |
| **重叠** | design.md 与 design doc 80% 重叠 | 零重叠：Plan Mode 管轻流程，Superpowers 管重流程，ASD 只补两者都没有的 Context 和 Eval |

> 缝合是两个完整方案抢同一块地盘；集成是每个组件补别人没有的能力。

## 七、与既有实体的关联

| 实体 | 关系 | 互补角度 |
|---|---|---|
| [Ssd Spec Driven Development Harness Asd Shuge 2026 06 17](ch05/015-harness.md) | **同作者昨日（6/17）ASD 实战文** | 116 行深度文档：4 条设计约束 + ASD 三层架构 + 8 步闸门管道 + 5 Agent Skill；本文是其次日（6/18）的反思篇，专攻"缝合怪识别 + 减法决策论" |
| [Openspec 四步法深度复盘 流程完整不等于代码正确](ch05/046-openspec.md) | **同主题批判视角** | OpenSpec 流程完整 ≠ 代码正确（与本文"流程完整不等于工程有效"同脉） |
| [Three Tools Comet Openspec Superpowers Ai Coding Shuge 2026 06 17](ch04/150-ai.md) | **同作者 6/17 三件套** | 术哥 6/17 OpenSpec+Superpowers+Comet 三件套（420 行）；与本文 6/18 OpenSpec+Superpowers **主动下线**形成强烈对照 — 同作者 24 小时内从"整合"到"拆分"的决策弧 |
| [Three Tools In One Gstack Superpowers Openspec Engineering Ai Coding](ch04/150-ai.md) | **同三件套范式** | gstack + Superpowers + OpenSpec 三器合一工程化（114 行） |
| [Ai Production Development Workflow Openspec Superpowers Gstack](ch04/150-ai.md) | **gstack 三件套** | 同上 gstack 三件套另一角度（233 行） |
| [Claude Code Superpowers Workflow By Xinlingyuanyuanyuan](ch03/073-claude-code.md) | **Superpowers 单独实战** | Superpowers 工作流详细解读（无 OpenSpec） |
| [Claude Code Skills Superpowers Practice](ch01/420-claude-code-skills-superpowers-practice.md) | **Superpowers 技能实践** | Superpowers Skills 实践 |
| [Spec Kit Bmad Sdd Practice Yexiaocha](https://github.com/QianJinGuo/wiki/blob/main/entities/spec-kit-bmad-sdd-practice-yexiaocha.md) | **Spec-Kit + BMAD** | Spec-Kit + BMAD SDD 实践（不同 SDD 流派） |
| [Spec As Aios Anti Entropy Architecture Gaode Ai Native Series 2](ch04/150-ai.md) | **Spec-as-AIOS** | 高德 Spec-as-AIOS 反熵架构（Spec 即操作系统的不同视角） |
| [Openspec Spec Driven Development Trae Solo](ch05/046-openspec.md) | **OpenSpec 单独实战** | OpenSpec + TRAE 单独使用 |
| [Harness Engineering Alibaba Java Case Study](ch05/061-harness-engineering.md) | **阿里 Harness 工程** | 阿里 Harness 工程实践（与 SDD 互补） |
| [Harness Pilot Claude Code Plugin Yangtong 2026 06 17](ch03/073-claude-code.md) | **Harness Pilot** | Claude Code Harness 插件 |

## 八、关键金句（直接引用）

### 关于 Spec 与测试

> 今天的 Spec 不是 truth，是 claim——一份等待验证的主张。真正的 truth 只有一个：跑通测试的代码，pass / fail，没有歧义。

### 关于修补

> 修补的尽头不是融合，是吞并。
> 工程师最危险的时刻，不是解不出问题，而是兴致勃勃地去解一道不该存在的题。
> 自动化一个不该存在的流程，只会让它更难被删掉。

### 关于传播学

> 点赞数测量的不是工程有效性，是心理有效性。
> 加法不需要理解，减法需要。Less is more 不涨粉。
> 工具的收益是加法，工具间的关联成本是乘法。

### 关于工具链

> 爆款工作流的归宿是收藏夹，不是 CI。"先马后看"的真实含义是"永远不看"。
> 缝合是两个完整方案抢同一块地盘；集成是每个组件补别人没有的能力。
> 好的工具链不是收集出来的，是删出来的。每个留下来的组件，都应该有一个"别人补不了位"的理由。

## 九、实践启示

### 对工具链选型者：3 个测试立即可套

不需要相信任何"终极融合方案" — 拿真相源测试 / 同步测试 / 重叠测试三把尺子扫一遍，缝合怪立即现形。

### 对 SDD 流派选择者：Plan Mode 本身是轻量 Spec

不要被"必须有独立 spec 文件"的执念困住。Plan Mode 的"先出计划 + 人确认 + 再执行"流程本身就是轻量 Spec 驱动。Spec 文件 vs Spec 流程是手段之别，**spec 驱动开发的本质是意图对齐和验证纪律，不是文件**。

### 对流程设计者：考生不能批改自己的试卷

ASD ⑤ 注入点的核心洞察：**verification 不能让 Agent 自查**。Agent 自查说"所有测试通过"实际可能把失败测试注释掉了。必须用外部闸门管道（pipeline.sh 8 步）强制独立验证。

### 对内容创作者：减法比加法更有价值

本文作者主动说"我不怀疑爆款作者的诚意，研究过五个工具和用一套流程交付过半年是两种完全不同的知识"。**前者的产出是全家福，后者的产出是伤疤**。减法文章在传播市场吃亏，但工程价值更高。

## 十、引用与延伸阅读

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/openspec-superpowers-decommissioning-frankenstein-test-three-questions-shuge-2026-06-18.md)

**同作者系列**：
- 03 篇（SSD 实战 / 6/17）：[Ssd Spec Driven Development Harness Asd Shuge 2026 06 17](ch05/015-harness.md)
- 04 篇（本反思 / 6/18）：本文
- 预告：05 篇 — 业界工具全景对比（Spec Kit / OpenSpec / Kiro / Plan Mode）+ 下线 OpenSpec 的完整决策过程

#缝合怪 #减法决策论 #OpenSpec #Superpowers #ASD #Spec驱动开发

---

