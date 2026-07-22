---
title: claude-code-agent-view-huashu
source_url: https://mp.weixin.qq.com/s/panfFxjQOFdV-RM0KAtUsw
publish_date: 2026-05-13
tags: [wechat, article, claude, agent, rag, gemini]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 3d2a28d2c4939f3f51ce5e77259b947cfa0a5dcd5c9e68ab6f0333d2d25000be
---
> 花叔：AI 编程进入多 Agent 阶段后，真正稀缺的不是执行力，而是人类的注意力、判断力和调度力。
我看了下自己过去4个月的Claude Code用量。
**131亿token，606个独立会话，38个项目。活跃日日均同时开7个session。**
4-20那天，单日6388条消息。
先给爱杠的朋友打个预防针。这$13,222是按Anthropic公开API价格、折算cache命中之后算出来的「等价API费用」，假设我真按API付费就要这么多。但我其实是 **Max 20x档（200美元/月）的订阅会员**，订阅费已经覆盖了绝大部分用量，真正超出额度需要按API单独结算的部分加起来不算多。Anthropic的prompt cache设计还在结算之前帮我省了大概5倍。
我提这个，主要是想说个现状，就是：
**我已经被多agent工作流淹没好几个月了。**
今天Claude Code v2.1.139上的Agent View，算是给被淹没的人发的救生圈。
## 一、Agent View是什么
用Anthropic Claude Code工程lead Thariq的话来说：**「给Claude Code的tmux」。**
如果你不熟tmux，大概画面是这样的：一个终端窗口里能塞下N个会话，可以来回切，可以让某个会话在后台跑，可以一眼看到谁忙完了、谁还在等输入。Agent View在这个基础上加了AI语境：每个会话是一个Claude，状态自动分类成「等输入 / 跑着 / 跑完了」三栏。
**打开方式：**
| 动作 | 命令 |
|------|------|
| 打开Agent View | `claude agents`，或在任意会话里按 ← 左箭头 |
| 后台启动一个新任务 | `claude --bg "task description"` 或在会话内输入 `/bg` |
| 切换/进入某个会话 | 上下选 + Enter |
| 给等输入的会话回复 | 选中 + space |
| 杀掉会话 | 选中 + Ctrl+X |
后台会话持久化到磁盘，关掉终端窗口它还活着。每个后台会话会被自动放进独立的git worktree里，不会互相打架。
## 二、它解决的不是AI的问题，是人的问题
Agent View本质是个产品功能。它不让Claude Code变聪明。它想要解决的问题是：当你同时让N个Claude在干N件事时，你这个人类的注意力怎么分配。
**Claude Code里三个容易混淆的概念：**
| 层 | 是什么 | 服务对象 |
|----|--------|----------|
| subagent | 一个session里，主agent派出去的临时助手 | AI自己 |
| agent team | 一个session里的固定协作小组，Leader + Teammates | AI自己 |
| agent view | 跨多个独立Claude实例的可视化面板 | 人类 |
subagent和team是AI内部的并行，Agent View是人的dashboard。
## 三、Agent View的诞生路径
Agent View看起来像个突然冒出来的功能，但它其实把Anthropic内部本来就在用的工作流产品化了。
Claude Code项目负责人Boris Cherny日常会开5个终端tab、5-10个浏览器session再加移动端，并行管十几个Claude Code。这不是特例，是CC团队的常态。
以及，在Agent View上线之前，已经有一大堆第三方社区在解决类似问题了。这是经典的 **Sherlocking时刻**——平台方把已经成熟的第三方功能纳入官方产品。Anthropic稍微温和一点，因为多数第三方工具能同时管几种AI编程命令行（Claude Code + Codex + Gemini），Agent View只服务Claude Code自己。
## 四、Agent view的几个功能细节
1. **会话和终端窗口解绑**。后台Claude由一个常驻后台的「监工程序」盯着，关掉终端继续跑。注意：电脑睡眠或重启后后台会话不会自动恢复，要用 `claude respawn --all` 手动拉回来。
2. **每个后台agent都在独立git worktree里干活**。派一个后台agent，就把整个代码项目「复制」一份给它，落在 `.claude/worktrees/<会话名>/` 路径下。N个agent同时跑不会打架。副作用：第一次用容易被吓一跳——主目录刷新看不到任何改动。三种处理方式：
   - 直接进 `.claude/worktrees/<会话名>/` 看产物
   - 等跑完再手动复制或用git合并
   - 偏门hack：用 `cat > file << EOF` shell命令绕过隔离直接写主目录（不推荐，但内容创作场景可加速）
3. **每行状态摘要是Haiku生成的**。面板上「fix login bug · 3 files changed · awaiting your input」这类描述是Anthropic最小的模型Haiku每15秒重新生成一次的总结。
4. **/loop集成**。后台会话支持按schedule自己迭代，面板里这类会话会带 ✢ 图标。
## 写在最后
- 单session用户：先试试 `claude --bg` 把长任务丢后台，然后按 ← 看面板。
- 多窗口用户：装上v2.1.139，把原来手开的窗口换成 `claude agents` 里的会话。最大收益是worktree隔离。
- 第三方工具用户（Crystal/claude-squad/Vibe Kanban）：Agent View只管Claude，如果单一vendor可迁，混着用则第三方还有位置。
**最后一句：别因为派活变简单，就一次派8件。AI派任务的边际成本是0，你review任务的边际成本不是。**
## 参考来源
- 官方博客：https://claude.com/blog/agent-view-in-claude-code
- 官方文档：https://code.claude.com/docs/en/agent-view
- Release v2.1.139：https://github.com/anthropics/claude-code/releases/tag/v2.1.139
- Thariq Shihipar原推：https://x.com/trq212/status/2053979505346425179
- Addy Osmani《Your parallel Agent limit》：https://addyosmani.com/blog/cognitive-parallel-agents/
- Boris Cherny工作流：https://newsletter.pragmaticengineer.com/p/building-claude-code-with-boris-cherny