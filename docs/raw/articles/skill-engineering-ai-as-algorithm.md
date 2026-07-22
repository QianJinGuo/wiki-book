---

title: "当我把AI变成一个\"算法\"：Skill工程化设计的心路历程"
sha256: 8973b6bf3bdc4af21560434240140b54cb0d39b3b10a6496e62b252231ad6601
source_url: https://mp.weixin.qq.com/s/bD10zbBeTtzMyEKqjIdT1w
author: peihanyu
publisher: 腾讯技术工程
published: 2026-05-13
created: 2026-05-14
type: raw
tags:
  - skill-engineering
  - agent-harness
  - cli
  - agent-as-algorithm
  - context-management
  - 确定性执行
review_value: 8
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
review_stars: 4
summary: 腾讯工程师"把Agent当算法用"的Skill工程化设计——痛点(规则200行AI叛逆/Token浪费/路径不确定)/修渠不改河/Agent大脑+CLI手脚架构/上下文管理死亡螺旋/CLI接管确定性事务，评分56。

---

## 核心设计原则：修渠不改河
> 不改变河的本性，但给它修好渠。
让 Agent 保留最擅长的"理解人话、做判断、组织表达"能力，把所有确定性的事——流程顺序、数据格式、API 调用、状态管理——全部从它脑子里拿出来，交给确定性程序。
Agent 不再是"什么都要自己想"的自由意志体，而是一个嵌入在精密轨道里的决策引擎：
- **输入**：用户的自然语言
- **输出**：结构化的 JSON 参数
- **推理之外的一切**：被轨道接管
---
## 第一根支柱：CLI 接管一切确定性事务
### AI 到底在哪里翻车？
**AI 翻车（不该让 AI 做）：**
- 拼 HTTP 请求时漏了 header
- 写 YAML 时缩进错了
- API 字段名拼写错误
**AI 擅长（该让 AI 做）：**
- 理解用户说的"帮我创建一个项目"
- 从三个选项里选出最合适的
- 用友好的语气回复"项目已创建"
### 决策：引入 CLI，让 Agent 只做"大脑"
| 角色 | Agent（大脑） | CLI（手脚） |
|------|--------------|-----------|
| **做什么** | 理解意图、收集参数、组织回复 | 调 API、写文件、管状态 |
| **沟通方式** | 只输出 JSON 参数 | 只返回 JSON 结果 |
| **不确定性** | 有（被限定在决策范围内） | 无（相同输入 = 相同输出） |
**旧方式**：Agent 自己拼 HTTP 请求 → 漏 header / 字段名拼错 / 认证 token 格式不对
**新方式**：Agent 只说 `"调用 create_project，参数：name=foo, host=bar.com"` → CLI 负责剩下一切
> Agent 的不确定性，被 CLI 的确定性包裹住了。
---
## 工具多了之后的死亡螺旋
当 Skill 背后有 5 个工具时，把每个工具的参数说明写在 SKILL.md 里没问题。但有 20 个？50 个？
常见方案和局限：
- **全量写进 SKILL.md** → AI 注意力有限，读不全
- **拆分成多个 Markdown** → 需要 AI 自己判断该读哪个
- **按需加载** → 动态加载机制复杂
### CLI 在这套系统里的深层角色
CLI 不只是"稳定执行"，更深的是：**接管了 Agent 的上下文管理**。
把 Agent 每次需要关注的信息压缩到最少，让它始终只看到当前步骤所需的最小上下文。
---
## 真正该问的问题
> 不是"怎么写更好的提示词"。
> 而是：**怎么设计一个让 AI 在每个时刻都只需要关注最少信息的执行环境？**
---
## 与现有文章的关系
- [[raw/articles/tencent-knowledge-harness-practice.md|Harness不是目的，知识才是护城河]] — 同一 publisher，但不同文章（知识沉淀 vs 工程化设计）
- [[raw/articles/hermes-skill-system-winty.md|Hermes Skill 系统]] — Skill 生命周期和检索机制
- [[raw/articles/browser-use-runtime-harness.md|Browser Use Runtime Harness]] — 运行时验证维度