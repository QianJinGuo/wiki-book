---
title: "长期运行的 Agent 怎么管：Hermes 治理分层与 5 张卡"
source_url: "https://mp.weixin.qq.com/s/DsJvu1qSpS0tQlrrcn-pCg"
author: "若飞"
feed_name: "架构师（JiaGouX）"
publish_date: 2026-06-01
created: 2026-06-01
ingested: 2026-06-01
tags:
  - hermes
  - agent
  - governance
  - memory
  - skills
  - gepa
  - wechat
type: article
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 4
sha256: c75bc5552c059e09d6db4dd6d78b152ef4ca9cb3d788aec287d2c2ded2c1a1d1
---

# 长期运行的 Agent 怎么管：Hermes 治理分层与 5 张卡

> 来源：[架构师（JiaGouX）](https://mp.weixin.qq.com/s/DsJvu1qSpS0tQlrrcn-pCg)｜作者：若飞｜2026-06-01

## 核心论点：don't automate slop

若飞重看 Hermes Agent 时，开篇引用 Shann 转述 Teknium 的话："don't automate slop"——流程还没跑明白，先别急着让 Agent 把它自动化。一个松散的流程接上 Agent 后，不会自动变严谨，只会跑得更快、产物更多、问题更容易被推到后面。

这构成了整篇文章的 thesis：当 Agent 开始长期运行并自己积累记忆、流程和技能时，**问题不是它能不能做事，而是做久了以后现场还能不能被人看懂、接手和修正**。

## 治理视角：四层 setup 反着看

Hermes 的官方扩展路径是"主 Agent → 专职 Agent → orchestrator → cron + 事件"，若飞认为这条路径很顺但**不能照抄**。他主张**反着看**：

- 越往后越热闹，越要先回头看第一层
- 规模会放大质量：质量好，规模是杠杆；质量差，规模就是麻烦
- 决定系统能否成立的，是最开始的窄场景验证

### Level 1 四个验收点

在让 Agent 进入多 Agent 编排之前，主 Agent 必须先在窄场景里跑稳：

1. **输入是否稳定**——竞品扫描、X 列表、固定站点？输入每次都变，输出不稳并不奇怪
2. **输出谁来收**——摘要 / 风险点 / 引用原文 / 公众号素材？收件人不同，格式就不同
3. **失败怎么留下来**——这次没抓到哪些站点、哪些链接打不开、哪些判断只是推测
4. **哪些动作要人点头**——读文档可放开；发消息、改配置、删文件、创建 cron 要慢

这四个验收点不是"Agent 能力问题"，是**准入流程问题**。没有这一关，cron + subagents 只会把半成品定时推过来，把模糊流程拆成几个模糊流程。

## 记忆预算：少放进 prompt，其余按需取

若飞引用 witcheer 的对比：OpenClaw 像"存很多再搜索"，Hermes 像"少放进 prompt，其余按需取"。这是两种记忆观：

- **OpenClaw 思路**：让 Agent 记得越多越好（项目偏好、聊天历史、临时结论、用户习惯）
- **Hermes 思路**：常驻层很小（MEMORY.md 2,200 字符、USER.md 1,375 字符，frozen snapshot 进入 system prompt），历史放到 SQLite + FTS5 的 session search

### 关键洞察：记忆更像预算，不像仓库

每写进一条长期记忆，都在花未来的：
- 注意力预算
- 上下文预算  
- 判断预算

旧项目里的偏好会影响新项目里的判断；一次救火时的临时绕路可能被写成长期经验；过期命令半年后又翻出来继续用——这些都是"记忆太多"的具体代价。

### 四层信息隔离

身份、项目规则、长期记忆、历史检索**不是一类东西**，必须分开：

| 层 | 机制 | 回答的问题 | Herms 载体 |
|----|------|----------|------------|
| 身份层 | 长期风格、语气、边界 | "这个 Agent 是谁" | SOUL.md |
| 项目规则层 | 架构约定、命令、端口、部署 | "这个项目怎么做事" | AGENTS.md |
| 长期记忆层 | 少量事实 | "哪些信息下次自动带上" | MEMORY.md / USER.md |
| 历史检索层 | 会话存档 | "以前聊过什么，需要时再查" | session_search (SQLite + FTS5) |

**反例**：把一次项目救火的临时命令写进身份层 → 下一次变成长期偏好；把团队规范塞进用户偏好 → 换项目带偏；把所有历史压进常驻记忆 → 模型每次背着旧包袱做新判断。

## Skill 库治理：过程资产也会变旧

Skill 一旦变多，最怕的不是"没有"，而是"很多但没人敢信"：

- 旧 Skill 不知道还能不能用
- 两个 Skill 做同一件事步骤却互相冲突
- 临时救火的 Skill 被长期复用
- 第三方 Skill 里有危险命令或悄悄扩大权限边界

### Skill 准入标准（若飞版）

- 没有明确触发条件 → 先不沉淀
- 没有输入边界 → 先不沉淀
- 没有验证方式 → 先不沉淀
- 会改系统状态、发消息、删东西 → 先过权限审查

### Hermes Curator 的工程价值

Curator 并不炫——它只是后台看 agent-created skills 的使用情况：
- 默认 30 天不用进入 stale
- 默认 90 天不用归档

但这个机制承认了一件事：**过程资产也会变旧**。一个会创建资产的系统，如果不会让资产退场，最后一定会被自己的资产拖慢。

## GEPA 边界：让改 Skill 有证据链

GEPA（hermes-agent-self-evolution）的核心价值不在"Agent 自己变强了"，而在**让改 Skill 这件事有了证据链**：

- 读取执行轨迹
- 分析失败原因
- 生成候选变体
- 经过评估 + 约束门 + PR review

### 当前实现边界

- **已实现**：Phase 1（Skill files）
- **还在计划**：tool descriptions、system prompt sections、tool implementation code、continuous improvement loop

### 可信度判据

若飞明确表态："我不会直接相信它'学会了'。我会先看它改了什么、为什么改、评估怎么跑、失败样本在哪、人怎么审、怎么回滚。"

这与 Claude Code 自我修复的思路一致——错误要能被看见，反馈要能进入流程，修改要经过测试、权限和人工 review。

## 5 张卡：团队 Agent 工作流的自检框架

这是本文**最核心的原创贡献**。若飞把团队自己的 Agent 工作流分成 5 张卡（不一定真写 5 个文件，但脑子里要分开）：

| 卡 | 内容 |
|----|------|
| **身份卡** | 这个 Agent 长期是什么角色、哪些语气/偏好/边界不能被项目污染 |
| **项目卡** | 当前仓库、业务、命令、端口、部署和验收规则 |
| **记忆卡** | 少量长期事实，能进来，也能被修正 |
| **Skill 卡** | 可复用流程，有触发条件、步骤、坑和验证 |
| **运行卡** | cron、消息入口、权限、日志、trace、失败重试和回滚 |

### 自检问题（5 个）

1. 身份、项目规则、任务状态、历史档案、过程资产，是不是分开放了？
2. Memory 有没有写入门槛？几类信息更新频率和风险完全不同
3. Skill 有没有准入和退场？3 个月没人用是继续挂着还是降权/合并/归档？
4. 自动化有没有先过 Level 1？主 Agent 跑不稳就拆专职 Agent + cron
5. 团队能不能看见 Agent 做了什么？工具调用摘要、权限审批、日志、trace、diff、测试结果是"可信度仪表盘"

## 4 周试跑路径

若飞给出的落地路径：

- **第 1 周**：只让一个主 Agent 跑窄场景（输入固定 + 输出固定），不急着写 Skill，先看哪里犯错
- **第 2 周**：只沉淀一个 Skill，写小一点（触发条件、来源、链接、推测、验证）
- **第 3 周**：再考虑 cron，cron 只拉起任务不替人做最终判断
- **第 4 周**：再决定是否拆子 Agent，能拆的前提是边界已稳定

> "主 Agent 跑不稳，就不写 Skill。Skill 没验证，就不上 cron。cron 没跑出稳定结果，就不拆子 Agent。"

## 收束

若飞最后把 Hermes 重新定位为"把长期 Agent 会遇到的麻烦一次性摊开的样本"：

- 要有身份，但身份不能被项目规则污染
- 要有记忆，但记忆不能无限膨胀
- 要有 Skills，但 Skills 不能只增不减
- 要能自动化，但自动化不能放大低质量流程
- 要能改进自己，但每一次改进都要留下证据

文章结尾的提醒："别把低质量流程自动化放大。先把一个 Agent 养稳。再让它长大。"

## 参考来源

- Akshay Pachaar 原文：https://x.com/akshay_pachaar/status/2054564519280804028
- Shann / Teknium Hermes 四层 setup：https://digg.com/ai/beogxlbm
- witcheer memory 取舍：https://x.com/witcheer/status/2035024543526359134
- Haseeb 迁移 Hermes 反馈：https://x.com/hosseeb/status/2043467761024942567
- Hermes 官方文档：https://hermes-agent.nousresearch.com/docs/
- Hermes Memory：https://hermes-agent.nousresearch.com/docs/user-guide/features/memory
- Hermes Skills：https://hermes-agent.nousresearch.com/docs/user-guide/features/skills
- Hermes Curator：https://hermes-agent.nousresearch.com/docs/user-guide/features/curator
- Hermes SOUL.md / Personality：https://hermes-agent.nousresearch.com/docs/user-guide/features/personality
- Hermes Security：https://hermes-agent.nousresearch.com/docs/user-guide/security
- hermes-agent-self-evolution：https://github.com/NousResearch/hermes-agent-self-evolution
- GEPA：https://github.com/gepa-ai/gepa
