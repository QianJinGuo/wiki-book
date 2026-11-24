# Loop 的产品视角——项目中心从人挪到 Agent 系统

> 📊 Level ⭐⭐⭐ | 10.5KB

## 核心论点

钟十六（前阶跃 Agent 产品负责人）提出：**项目中心会从人变成 Agent 系统**。当 Loop 真正跑通后，发动机不再是人的每一步推动，而是 Agent 系统自行运转，人只在关键路口被请来拍板。

## Loop 的两层价值

- **内层**：多 Agent workflow 把一次复杂任务做得更闭环——执行 Agent + 验证 Agent，把"做了"变成"做到、验过、能交付"
- **外层**：目标、状态、触发和记忆——它知道自己为什么做、现在做到哪、什么时候回来、哪些反馈要记住、哪些人类判断以后可以作为默认规则

## 实证案例：定制刻字项链小生意的 Discord 运营

本文最独特的贡献是一个**完整的端到端案例**，展示了 Loop 在真实场景中如何运作：

1. 店主给 Dittos Loop 一段自然语言指令（"帮我盯着群里的问题反馈..."）
2. Agent 先返回执行方案（"你看一眼，没问题我就开始"），不是直接动手
3. 多 Agent 分工：扫群归类 / 验证 Bug / 改代码 / 起草回复
4. 验证分离：修好了要另一个分身验过才放行（maker/checker 分离）
5. 32 分钟后：PR 已提、测试已过、14 条消息回了 9 条、5 条整理成表等拍板
6. 店主 3 条指令（合并/立项/改折扣），Agent 逐条执行并回执

## 关键产品洞察

**Loop vs 定时任务**：普通定时任务只是到点再跑一次；Loop 会带着人和环境的反馈，一轮轮变得更强，也更对齐用户的喜好。

**经验的复利**：Loop 沉淀下来的不是"干完的活"，而是人的每一次判断。一个项目的经验开始在 loop 之间流动——网站监控 loop 发现的故障进入反馈 loop 的回复口径，物流 loop 捞出的延期变成客服 loop 的背景。

**Project OS 愿景**：用户将大目标和项目给出，系统自动构建出一套在自己运转、围绕目标持续进化的任务系统。人从停不下来的中心走出来，站到这些系统的上方。

**与工程视角的关系**：本文与 [Loop Engineering 综合实体](https://github.com/QianJinGuo/wiki-public/blob/main/entities/loop-engineering-addy-osmani-challengehub.md) 互补——该实体侧重工程组件（worktree/skill/connector/sub-agent/state file），本文补充产品/PM 视角（人与 Loop 的关系变化、经验的跨 loop 流动、普通人友好的设计原则）。也与 [反馈控制系统实体](https://github.com/QianJinGuo/wiki-public/blob/main/entities/loop-engineering-feedback-control-system.md) 中"人的位置"讨论形成对照。

## Dittos Loop For Codex

开源 Codex 插件：https://github.com/502399493zjw-lgtm/dittosloop-for-codex

设计原则：
1. **loopable**：Agent 能自己发现任务适合变成 Loop
2. **一句话编译成 Loop**：用户的一句话被解析为目标、验证方式、触发条件、记忆规则

## 深度分析

### 「项目中心」迁移的产品逻辑：人的带宽 vs 系统的带宽

钟十六的核心主张不只是"Agent 更强了"，而是一个架构决策：**任务单元能拉多长，中心就应该放在哪**。当 Agent 能闭环完成的单元从"一步"延长到"一整轮爬楼-分类-复现-修复-回复"，继续把中心留在人身上就成了带宽瓶颈——人变成所有分支汇合的串行点。产品上的解法是引入一种显式的"判断请求接口"：系统拿不准时回头发起一次请求，人给个方向，它继续跑。这在工程上对应 [反馈控制系统](https://github.com/QianJinGuo/wiki-public/blob/main/entities/loop-engineering-feedback-control-system.md) 里的升级门（escalation gate），在产品上的意义是**把人的参与从"持续在场"压缩为"按需出庭"**——发动机换了，但方向盘仍留关键档位给人。

### maker/checker 分离：验证是放行条件，不是质量仪式

案例里最能体现工程成熟度的一幕：刻字预览 Bug 第一版没修干净，改代码的分身说"修好了"不算数，必须另一个分身复现验证过才放行。这不是多加一道质检仪式，而是**把"声称完成"与"确认完成"做成结构性分离**——自我报告在利益上不可信（执行者天然倾向宣布成功），放行权必须交给无利害关系的第三方路径。多分身分工（扫群归类 / 验证 Bug / 改代码 / 起草回复）则遵循 [orchestrator-worker 模式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/orchestrator-worker-architecture.md)：每个分身上下文单一、职责可验证。更关键的是后续的风险分级路由：14 条该回的消息自动回了 9 条，剩下 5 条（涉及退款/加急/折扣）整理成表等人拍板——**自动化边界不是按能力划的，是按"出错代价是否可逆"划的**。这与 [验证驱动开发](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/verifier-driven-development.md) 的原则完全同构。

### 记忆让循环从「重复执行」变成「复利增长」

Loop 与定时任务的分界线，本文给了一个干净的判据：**这一轮的输出是否改变下一轮的行为**。定时任务到点再跑一次，状态归零；Loop 把人的每一次判断"收下、记住、下次自己就用上"——反馈被持久化成了规则资产，而非对话历史里的遗迹。更进一步的是经验的**跨 loop 流动**：网站监控 loop 发现的下单故障进入反馈 loop 的回复口径，物流 loop 反复捞出的延期变成客服 loop 主动说明的背景。这意味着 loop 之间的接口不是数据管道，而是"口径/背景"这类语义资产——单个 loop 是执行单元，loop 网络才是学习系统。这与 [Agent 记忆架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-memory-architecture.md) 中"判断要落成可复用规则"的主张，以及 [Agent 自进化循环](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-self-improvement-loops.md) 的复利叙事互相印证，也正是 [阿里技术概念解析](https://github.com/QianJinGuo/wiki-public/blob/main/entities/loop-engineering-concept-analysis-feixue-ali-2026.md) 中"内外双环"框架里外环（目标/状态/记忆）价值的商业版注脚。

### 「一句话编译成 Loop」：产品层的编译器抽象

两个设计原则合起来看是一个完整的产品抽象。**loopable 探测**解决"什么该变成 Loop"：用户反复做同一种判断、在等条件发生、在盯反馈——这三个信号本身就是循环结构的特征，Agent 应主动提议"要不要我以后持续帮你盯着"，把固化 Loop 的成本降到一次确认。**一句话编译**解决"变成什么样的 Loop"：把自然语言解析成目标、每轮动作、验证方式、何时问人、记什么、何时停六要素——本质上是把一句 prompt **编译成一份可执行的 harness 配置**，与 [harness-loop 架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-loop-architecture.md) 中"配置先于运行"的思路一致。终点是 Project OS：用户给出大目标和项目，系统自动构建围绕目标持续进化的任务系统。顺带一提其 AGI 观的冷静之处——AGI 未必先以无所不知的超级大脑出现，可能先以"你身边一群各自在跑、各管一摊的任务系统"出现，这把宏大叙事拉回了普通人可用的产品形态。

## 实践启示

1. **先问任务单元能拉多长，再决定中心放哪**：把项目中心放在 Agent 能闭环的最长单元处，人只保留不可逆/高风险决策点（合并、立项、定价、折扣）。判断"还需不需要人在场"时，逐项列出人在当前流程里实际做的动作，把纯执行类动作全部移出人的职责。
2. **把 maker/checker 做成结构性分离，而不是提示词约定**：任何"声称完成"必须有独立的验证路径放行——验证分身与执行分身在上下文上隔离，且验证通过是合入/回复的硬前置条件，不是可选项。
3. **自动化边界按出错代价划分，不按能力划分**：能自动修的自动修，涉及退款、加急、折扣这类可逆性差或需要担责的决策，整理成结构化表格等人逐条拍板——宁可多等人一次，不替人做不可逆决定。
4. **把人的拍板收敛成"可逐条执行并回执"的指令格式**：店主 3 条指令（合并/立项/改折扣）逐条执行、逐条回执，人拍板之后的执行成本被压到零。给 Agent 的反馈也应当被设计成这种格式，否则判断给了也留不下。
5. **用"这轮改变了下轮什么"来区分 Loop 与定时任务**：如果一轮运行不会改变下一轮的行为（没有反馈持久化），那只是 cron。设计每个 Loop 时明确三件事：这轮学到了什么、存在哪、下轮在哪生效；评估 Loop 价值看它沉淀了多少"下次直接用上"的规则，而不是跑了多少次。
6. **面向普通人的 Agent 产品要主动探测 loopable 信号**：当用户重复同一种判断、在等条件发生、在盯反馈时，Agent 应主动提议"要不要持续帮你盯着"，并能把一句话编译成目标/验证/触发/记忆四要素齐备的可运行 Loop——让固化经验的成本低于容忍重复的成本。

→ [原文存档](https://mp.weixin.qq.com/s/a9KVtosK59Oc8vmBx0969g)

---

