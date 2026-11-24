# 缝合怪识别与减法决策论：OpenSpec + Superpowers 融合方案下线记（2 周 3 次实测 + 3 个测试 + 加法传播学 + Plan Mode + Superpowers + ASD 最终方案）

> 📊 Level ⭐⭐⭐⭐⭐ | 35.2KB

## 缝合怪识别与减法决策论：OpenSpec + Superpowers 融合方案下线记

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
| [Ssd Spec Driven Development Harness Asd Shuge 2026 06 17](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ssd-spec-driven-development-harness-asd-shuge-2026-06-17.md) | **同作者昨日（6/17）ASD 实战文** | 116 行深度文档：4 条设计约束 + ASD 三层架构 + 8 步闸门管道 + 5 Agent Skill；本文是其次日（6/18）的反思篇，专攻"缝合怪识别 + 减法决策论" |
| [Openspec 四步法深度复盘 流程完整不等于代码正确](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openspec-四步法深度复盘-流程完整不等于代码正确.md) | **同主题批判视角** | OpenSpec 流程完整 ≠ 代码正确（与本文"流程完整不等于工程有效"同脉） |
| [Three Tools Comet Openspec Superpowers Ai Coding Shuge 2026 06 17](https://github.com/QianJinGuo/wiki-public/blob/main/entities/three-tools-comet-openspec-superpowers-ai-coding-shuge-2026-06-17.md) | **同作者 6/17 三件套** | 术哥 6/17 OpenSpec+Superpowers+Comet 三件套（420 行）；与本文 6/18 OpenSpec+Superpowers **主动下线**形成强烈对照 — 同作者 24 小时内从"整合"到"拆分"的决策弧 |
| [Three Tools In One Gstack Superpowers Openspec Engineering Ai Coding](https://github.com/QianJinGuo/wiki-public/blob/main/entities/three-tools-in-one-gstack-superpowers-openspec-engineering-ai-coding.md) | **同三件套范式** | gstack + Superpowers + OpenSpec 三器合一工程化（114 行） |
| [Ai Production Development Workflow Openspec Superpowers Gstack](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ai-production-development-workflow-openspec-superpowers-gstack.md) | **gstack 三件套** | 同上 gstack 三件套另一角度（233 行） |
| [Claude Code Superpowers Workflow By Xinlingyuanyuanyuan](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-superpowers-workflow-by-xinlingyuanyuanyuan.md) | **Superpowers 单独实战** | Superpowers 工作流详细解读（无 OpenSpec） |
| [Claude Code Skills Superpowers Practice](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-code-skills-superpowers-practice.md) | **Superpowers 技能实践** | Superpowers Skills 实践 |
| [Spec Kit Bmad Sdd Practice Yexiaocha](https://github.com/QianJinGuo/wiki-public/blob/main/entities/spec-kit-bmad-sdd-practice-yexiaocha.md) | **Spec-Kit + BMAD** | Spec-Kit + BMAD SDD 实践（不同 SDD 流派） |
| [Spec As Aios Anti Entropy Architecture Gaode Ai Native Series 2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/spec-as-aios-anti-entropy-architecture-gaode-ai-native-series-2.md) | **Spec-as-AIOS** | 高德 Spec-as-AIOS 反熵架构（Spec 即操作系统的不同视角） |
| [Openspec Spec Driven Development Trae Solo](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openspec-spec-driven-development-trae-solo.md) | **OpenSpec 单独实战** | OpenSpec + TRAE 单独使用 |
| [Harness Engineering Alibaba Java Case Study](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-alibaba-java-case-study.md) | **阿里 Harness 工程** | 阿里 Harness 工程实践（与 SDD 互补） |
| [Harness Pilot Claude Code Plugin Yangtong 2026 06 17](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-pilot-claude-code-plugin-yangtong-2026-06-17.md) | **Harness Pilot** | Claude Code Harness 插件 |

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

## 深度分析

### 缝合输给原生集成的深层原因：状态所有权与仲裁机制

真相源测试与同步测试看似只是工作流体检，实为一般性的架构判据——它们追问的其实是同一件事的两面：**一块状态允许多少个所有者，以及所有权发生变更时靠什么机制通知所有利益相关方**。原生集成之所以稳定，并非因为工具作者更用心，而是集成发生在同一真相源边界内部：设计决策、实现与验证共享同一套一致性机制，跨边界的引用由机器（编译器、类型系统、测试）强制兑现。缝合则相反，它把两个对同一工件各自声称权威的系统接上同一条链路，接缝处没有任何机器可执行的仲裁协议——冲突每次都要开庭，而法官永远是人。融合方案里那份精心设计的"握手协议"，本质上就是想用散文补写这份缺失的仲裁协议；但协议只有被某个运行中的进程强制执行时才真正存在，而这套组合里唯一在运行的进程是人肉 checklist，于是协议只是方案文档里的一段愿望。同步测试真正度量的，正是这种人工仲裁的规模弹性：需求量翻三倍、同步工作量翻几倍——凡弹性大于一的接缝，都是缝合出来的接缝。这一原理在传统软件工程里早有对应物：各自持有数据库的微服务、双写的数据管道、各存一份的配置中心，失败模式完全一致——不是哪个组件坏了，而是同一事实存在两个各自漂移的表示。OpenSpec 与 Superpowers 的失败因此不是 AI 工具链的新问题，而是"同一状态、多个所有者"这一古老反模式在新场景的复现；两条测试的价值在于把该反模式的检测点从线上事故提前到了选型会议，把昂贵的运行期证据换成了廉价的准入期提问。

### spec 的下线不是消亡，而是迁址：从活文档到冻结主张

最终方案里最容易被忽略的细节，是 spec 并没有消失，而是被重新安置：审完即冻结，活基线的角色移交给测试套件，变更历史移交给 git。这一安排暗含一个比"删工具"深刻得多的原理——文档失效的根源不是写得不好，而是被要求扮演它无法扮演的角色：系统的活状态。任何以自然语言书写的工件都无法自动跟随代码演进，强行让它扮演活状态，等于给漂移发放许可证；反过来，一旦承认文档只是某个时点的 claim，冻结反而成为它的最佳状态——不可变、有版本、可追溯，与版本控制的设计哲学完全同构。更深一层，"真相源唯一"并不要求组织里只有一份文档，只要求活状态只有一个机器可校验的表示；这两件事常被混为一谈，导致人们要么不敢删文档，要么误以为删文档等于删知识。迁移后的分工是：意图先落在计划与对话里，确认后冻结为带 AC 编号的主张，测试套件持有活状态，git 持有历史。这给所有"文档要不要维护"的争论一个可操作的判据：先问它承载的是 claim 还是 state——claim 应该冻结归档，state 必须交给机器可执行的工件，而一份文档的悲剧几乎总是从冒充后者开始的。

### 三笔账的通用化：任何工具投资的止损判据

三笔账的深层结构是三个按抽象层级递进的追问。前提层问：这套工具立足的主张今天还成立吗；终点层问：把所有可行修补做完之后，所得之物与在幸存前提下从零重写的产物有何区别；方向层问：修完的机器与底层能力曲线是同向还是逆向。改写成止损判据便是：任一层给出否定答案，修补立即停止。提问顺序本身携带信息：前提层最便宜也最致命，必须先问——为不成立的前提写的每一个同步 skill，都是在给幻觉续命；终点层揭示修补只是重写的慢速版本，与其花一个月走到吞并，不如在起点只留一个工具；方向层说明即使工程全胜，也可能交付一台方向相反的完美机器。这套框架最有价值的重构是关于沉没成本：修补清单上每一项都真实可行，而可行性恰恰是陷阱——"能修"回答可行性，"该修"回答价值，把前者当成行动理由，就是兴致勃勃地去解一道不该存在的题。下线决策的正确输入不是"过去投入了多少"，而是"从今天起每条路径的边际成本"。组织为什么总是缺这层判断？因为激励偏向营救叙事：修补成功的项目有故事、有汇报、有可见产出，而三问之后无事发生的决策没有可展示的痕迹。把三笔账写成决策记录里必须逐条回答的字段，等于把事前验尸（pre-mortem）制度化——决策文档替沉默的减法留下了唯一可见的证据链，这是把不可见的避免转化为可见记录的唯一办法。

### 加法传播学与减法沉默：harness 工程采纳的社会学

加法方案在传播市场占优不是口味偶然，而是信号结构使然。对读者，加法清单便宜：每个工具的优点可以分别想象、分别收藏，评估成本趋近于零；减法昂贵：判断"删掉什么还剩什么"要求读者已具备那份判断力——而那恰是他们尚未拥有之物，于是收藏代替了理解。对推荐者，加法风险被组合稀释：五个组件个个来历清白，方案失败时无人单独负责；减法者独木支撑，删错的个人成本远高于加错。于是市场结构性淘汰工程价值最高、受众最需要的内容：能欣赏减法文章的人不需要它，需要它的人无法把减法与偷懒区分开。同作者一天之内从三件套整合文转向下线反思文的决策弧，正是这种知识不对称的缩影——组合知识可以展示，伤疤知识只能讲述，而传播市场只为可展示的知识付费。组织内部的采纳动力学与此同构：评审会上加一层流程等于展示勤奋，删一层流程则需先花声誉论证被删者的冗余；加法者免费获得认真的印象，减法者需自证并非偷懒，长期博弈的结果是流程只增不减。对策不是抱怨市场，而是给减法发明可检验的格式：接盘者表让每一项被删职责都配一个已存在的接盘者，减法由此从"我觉得多余"变成可逐条核验的主张集合。落到 harness 工程的采纳流程：应要求提交接盘者表而非工具清单；衡量 harness 改造的指标应是删除量而非安装量；新流程准入评审的默认问题应是"它替掉了谁"。组织级 harness 实践的对照样本见 [Harness Engineering Alibaba Java Case Study](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-alibaba-java-case-study.md) 与 [Harness Pilot Claude Code Plugin Yangtong 2026 06 17](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-pilot-claude-code-plugin-yangtong-2026-06-17.md)。

### 三测试框架的普适化：插件与集成栈的准入与退役协议

把三测试从个案中抽出，得到与具体工具无关的双向协议。装之前作为准入清单：向栈 S 引入组件 C 之前依次问——C 是否对 S 中已有工件主张第二种权威（真相源）；C 的产物发生变化时 S 是否无需人介入即得知（同步）；S 现有成员是否已天然覆盖 C 的核心职能（重叠）。三问的价值首先在于成本不对称：回答它们只需几分钟，拒绝回答的代价是两周试点之后被迫得出同一结论。其次是评估顺序的倒转：惯常问"这个工具新增什么"，三问问"这个工具主张拥有什么"——特征清单是加法语言，谁都能再多一项；所有权却是排他的，一处主张必与在位者相撞，因此所有权问题暴露的冲突是功能比较永远无法揭示的。装之后同一组问题反向运行即为退役清单：对存量栈做审计，凡某组件的存在理由只剩"给另外两个组件当胶水"，它就是首批下线候选；重叠测试反向读出正是接盘者表——删掉它，谁天然补位？由此三笔账与三测试在深处汇合：同一套所有权问题服务两个时刻，装之前决定是否引入，删之前决定由谁接盘。对本 wiki 覆盖的整类决策——MCP 服务器的取舍、agent 插件的堆叠、记忆系统的选型、eval harness 的组合——凡属"组件产出工件、另一些组件消费工件"的栈，协议直接适用；即使三问全过，还须补最后一条分档检查：新组件应挂进渐进式拓扑的某条既有车道，而不是把所有需求重新串成一条更长的流水线。同主题的批判视角可对照 [Openspec 四步法深度复盘 流程完整不等于代码正确](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openspec-四步法深度复盘-流程完整不等于代码正确.md)，从整合到拆分的完整决策弧见 [Three Tools Comet Openspec Superpowers Ai Coding Shuge 2026 06 17](https://github.com/QianJinGuo/wiki-public/blob/main/entities/three-tools-comet-openspec-superpowers-ai-coding-shuge-2026-06-17.md)。

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

→ [原文存档](https://mp.weixin.qq.com/s/tw6nPi8NIYxd55yiPafSig)

**同作者系列**：
- 03 篇（SSD 实战 / 6/17）：[Ssd Spec Driven Development Harness Asd Shuge 2026 06 17](https://github.com/QianJinGuo/wiki-public/blob/main/entities/ssd-spec-driven-development-harness-asd-shuge-2026-06-17.md)
- 04 篇（本反思 / 6/18）：本文
- 预告：05 篇 — 业界工具全景对比（Spec Kit / OpenSpec / Kiro / Plan Mode）+ 下线 OpenSpec 的完整决策过程

#缝合怪 #减法决策论 #OpenSpec #Superpowers #ASD #Spec驱动开发

---

