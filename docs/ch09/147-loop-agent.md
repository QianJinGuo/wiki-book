# Loop 的产品视角——项目中心从人挪到 Agent 系统

## Ch09.147 Loop 的产品视角——项目中心从人挪到 Agent 系统

> 📊 Level ⭐⭐ | 4.0KB | `entities/dittos-loop-codex-product-pm-zhongshiliu-2026.md`

# Loop 的产品视角——项目中心从人挪到 Agent 系统

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

**与工程视角的关系**：本文与 [Loop Engineering 综合实体](../ch05/007-loop-engineering.html) 互补——该实体侧重工程组件（worktree/skill/connector/sub-agent/state file），本文补充产品/PM 视角（人与 Loop 的关系变化、经验的跨 loop 流动、普通人友好的设计原则）。也与 [反馈控制系统实体](../ch05/007-loop-engineering.html) 中"人的位置"讨论形成对照。

## Dittos Loop For Codex

开源 Codex 插件：https://github.com/502399493zjw-lgtm/dittosloop-for-codex

设计原则：
1. **loopable**：Agent 能自己发现任务适合变成 Loop
2. **一句话编译成 Loop**：用户的一句话被解析为目标、验证方式、触发条件、记忆规则

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/dittos-loop-codex-product-pm-zhongshiliu-2026.md)

---

