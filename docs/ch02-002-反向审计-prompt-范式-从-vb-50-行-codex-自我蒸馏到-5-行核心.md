## Ch02.002 反向审计 Prompt 范式 — 从 VB 50 行 Codex 自我蒸馏到 5 行核心

> 📊 Level ⭐⭐ | 25.5KB | `entities/reverse-audit-prompt-paradigm-codex-5-line-version.md`

## 概述

小黑（AI Native 软件工程，2026-06-11）拆解 OpenAI Codex 团队 Vaibhav Srivastav (VB) 在 X 上挂出的"50 行 Codex 自我蒸馏 prompt"（让 Codex 把过去 30 天工作自动蒸馏成 skill/subagent/automation），通过**亲身实测**发现：在国内开发者复刻这条 prompt 时普遍跑空——Codex 给出的"重复工作流候选"只是把关键词重新分类了一遍，**对已有的 skill 完全失明**。根因是 **3 条前置缺失**（worker 边界 / skill description 触发词 / producer 链路回执），任何一条缺失都会让这条 prompt 退化成"关键词分类器"。文章最终砍出**一条 5 行的"反向审计"骨架版本**——把"agent 应该反过来看自己的历史痕迹"这个核心视角剥到只剩三个问题。这是从"传统 prompt 工程（让 agent 听指令做事）"到"agent 自评（让 agent 审计自己的能力链路）"的**范式转换**。

## VB 50 行 prompt 完整复刻（中文圈疯传版）

VB（OpenAI Codex 团队）原文在 X 公开后，量子位翻译 → 新浪/51CTO/CSDN/各公众号一周内全转。核心叙事："一条 prompt 让 Codex 把你过去 30 天的工作蒸馏成 skill/subagent/automation"。

prompt 结构（3 部分）：

1. **证据来源声明**（前 1/3）：让 Codex 按优先级读取——
   - Recent Codex sessions and task summaries
   - Codex Memories and rollout summaries
   - Chronicle（Windows 端屏幕级活动记录）
   - Existing skills, custom agents, automations（**复用优先于重复造**）
2. **判断标准**（中 1/3）：什么样的工作流值得 package——出现过 2+ 次、有稳定输入输出、能改进速度/质量/一致性、不被现有覆盖
3. **产出格式**（后 1/3）：先 shortlist（workflow/证据/confidence/推荐形式/理由），再创建高置信项，最后说明跳过项和证据不足项

**选择形式**：skill（可复用工作流）/ custom subagent（隔离 context 的专家任务）/ automation（定期 check/report/reminder）/ skip（一次性或证据不足）。

## VB prompt 调用的 3 套 Codex 内部机制

理解 VB prompt 的前提是知道它不是普通 prompt 工程——它**调用 Codex 内部 3 套真实存在的官方机制**：

| 机制 | 来源 | VB prompt 中的对应表述 | 关键设计 |
|------|------|----------------------|---------|
| **Codex Skills** | OpenAI Agent Skills 官方文档 | "skill: a reusable workflow or playbook" / "extend existing instead of duplicating" | 项目级/用户级能力包，靠 `name + description` **隐式匹配** |
| **Custom Subagent** | openai/codex#11701 + reach_vb/status/2052090279344120278 | "custom subagent: a bounded specialist role suitable for delegation" | **不会自动 spawn**，需 prompt 明确要求；隔离 context 干活，只回结论 |
| **Sessions / Memories / Chronicle** | Codex 自身 + Windows 发布说明 reach_vb/status/2029260173823332857 | "Use available evidence in this order" | 灵魂在这里——**让 Codex 看你留下了什么痕迹，而不是问你"在做什么"** |

**VB prompt 的精妙之处**：这 3 套机制是 OpenAI 内部用户的**默认前置**——他们用 Codex 自动加载了 skills，用 Codex 自带 sessions/memories，知道 subagent 可以怎么 spawn。这条 prompt 让 Codex **反过来扫一遍**，看哪些重复工作该沉淀。

> 与 [Skill 设计模式](ch07-002-skill.html) 在"skill 是知识注入而非工具生成"维度同源，但本文聚焦**触发失败诊断**而非模式选择。

## 跑空根因：3 条前置缺失（缺一不可）

小黑亲身实测：把 VB 50 行 prompt 贴进自己的 Codex → Codex 列了"每周复盘/PR 审查/文档自动化"等候选清单，**置信度评分、证据描述一应俱全**——但这些 skill 他**早就有**，只是 Codex **看不见**（skill description 写得太弱，触发失败）。

**根因**是 3 条前置缺失，**不是装一条就好，缺一不可**——任何一条缺失，prompt 都会退化成"看起来在审计你，其实只是把你的关键词重新分类了一遍"。

### 缺失 1：AGENTS.md 没有 worker 边界

AGENTS.md 是 agents.md 公开 spec 定义的"agent 看的项目级 README"——Codex 发现会优先读，作为后续所有任务的项目上下文前缀。

**反例**：
```markdown
# AGENTS.md
This project uses TypeScript and pnpm.
- Run `pnpm install` to set up.
- Run `pnpm test` to run tests.
- Follow the code style in eslint.config.js.
```

这是把 README 改了个名字——告诉 agent"装什么、测什么、风格怎么写"，**没告诉 agent "这个 repo 里有哪些角色、谁负责什么、谁不该碰什么、做完一件事的产物长什么样"**。

**worker 边界的作用**：给 agent 一个**反向审计的坐标系**。VB prompt 里"playbook"的潜台词是"同一个角色反复跑同一个流程"——如果 AGENTS.md 没区分"研究 worker/评分 worker/reviewer"，Codex 做蒸馏时就没有"角色"维度可用。它能看到的只是"过去 30 天发生过 47 次任务"，看不到"这 47 次任务里有 12 次本来应该 reviewer 介入但没介入"。

没有坐标系，prompt 跑出来的"重复工作流"永远是**任务表面的相似性**（"都是写文档""都是改测试"），而不是**结构性的缺位**。

### 缺失 2：skill description 没有触发词

OpenAI 官方 Codex Skills 文档有一句话："**Codex 初始只会读 skill 的 name、description 和路径，不会读完整的 SKILL.md**。它要等到运行时基于 description 判定'这个任务该不该用这个 skill'之后，才会去 load 完整内容。而且初始 skills 列表有上下文预算（~8000 字符），skill 多了，description 会被压缩，部分 skill 甚至会被省略"。

**含义**：skill 触发完全押在 description 上。description 写得抽象、宽泛、没把触发词前置——这个 skill 就是"**装了但没用**"。

**反例 vs 正例**：

```yaml
## 反例：100% 不会被触发
name: investment-research
description: A skill for conducting investment research tasks.
## → 跟用户实际会说的话（"帮我看下机器人产业最近的玩家排名"）
##   一个词都对不上
```

```yaml
## 正例：把触发词前置 + 写清不适用范围
name: investment-research
description: |
  当用户要求生成产业研报、行业网页、公司榜单、证据评分、
  机器人/具身智能/AI 应用方向调研、React 投研驾驶舱、
  SQLite 证据账本、worker 并发研究、强证据厚内容报告时触发。
  不适用于：单个公司的财务三表分析、纯数据爬取任务。
## → 用户真的会说"产业研报"/"公司榜单"/"证据评分" → 触发成功
```

**两个关键动作**：
1. **把触发词前置**（用户会真的说的话）
2. **写清不适用范围**（让 Codex 知道边界，避免误触发）

**与 VB prompt 的关联**：VB 那条 "extend existing instead of duplicating" 假设你的 skill description 是健康的、Codex 能识别"这个工作流已经有 skill 在做"。**如果你 50% 的 skill 都长成 "A skill for X tasks" 这种废话 description，Codex 根本看不见这些 skill 的存在**——它给你的"重复工作流候选"里，会出现一大堆你已经有 skill 在跑但 Codex 不知道的项目。

> 与 [Agent Skill 进阶模式与治理](ch01-319-agent-skill-进阶模式与治理.html) 在"description 是触发信号源"维度同源——但本文给的是**反模式 → 正模式**的具体对照，可作 description 写作 checklist。

### 缺失 3：producer 链路没在写结构化回执

VB prompt 的证据基础是 "Codex sessions、Memories、rollout summaries、Chronicle"——**这些是 Codex 自己写的**。在 VB 的语境里"证据"是默认存在。

但有自定义 producer 链路的人（worker/reviewer/validator/handoff 文件/可点击回执）——**这些东西 Codex 一概看不见**。它能看见的只有标准 Codex sessions 一层。

更要命：**很多人手里这套 producer 链路，自己根本没在写回执**。

**回执 ≠ 日志**，是结构化的、可被反向读出的：

```markdown
## 00_GPT 可点击回执.md

## TASK
机器人产业研报 V1.3 内容厚度修复

## STATUS
PARTIAL_SUCCESS - 5 个公司榜单已加证据，2 个图表未答业务问题

## ARTIFACTS
- ./outputs/robotics_2026_06_10/01_人类总览.html
- ./outputs/robotics_2026_06_10/03_证据索引.md
- ./outputs/robotics_2026_06_10/99_receipts/...

## VALIDATOR_SCORE
内容厚度：73 / 100  (target: ≥ 85)
证据完整度：88 / 100
图表问答率：62 / 100  (target: ≥ 80)  ← 主要缺口

## NEXT
1. 重做 P3 图（机器人 BOM 价格趋势）
2. 给 P5 表加置信度列
3. 跑 V1.4 跑分对比
```

**有 VALIDATOR_SCORE 这种字段 → 反向审计有抓手**——Codex 看到 "图表问答率 = 62" 立刻知道"这个 skill 在『图表是否回答业务问题』这件事上反复掉分，应该回去修 skill 的 validator"。

**没有回执 → 只能看到表面"这件事发生过几次"，看不到"这件事每次都有同样的瑕疵"**。

**最难补的一条**：AGENTS.md 写好、skill description 写好都是一次性投入；**producer 链路写回执是每一次任务都要做的事**。

> 与 [Agent 可靠性工程与持续改进](ch04-054-agent-可靠性的工程解法-从-skillify-看持续改进机制.html) 的"产品级可观测"维度同源——本文聚焦"**可被反向审计的回执结构**"这一具体落地形态。

## 真正值钱的不是 prompt，是"反向审计"这个视角

把 3 条缺失串起来，会浮现一个反共识但很朴素的判断：

**VB 那条 50 行 prompt 的价值不在它的字数多、维度全、考虑细**——这些都只是表面工艺。它真正值钱的是一个**视角**：**让 agent 不去看"我现在该做什么"，而是去看"我过去做的事留下了什么痕迹，这些痕迹能不能反向告诉我我的能力包哪里漏了"**。

中文叫"**反向审计**"（reverse audit）更贴切——和传统 prompt 工程的方向是**反的**：

| 范式 | 假设 | 流程 | 适用阶段 |
|------|------|------|---------|
| **传统 prompt 工程** | 我对自己要什么很清楚 | "我给你一段指令，你按指令产出" | 单轮交互 / 短链路 |
| **反向审计 prompt** | agent 链路足够长，我不再清楚自己每一层"应该要什么" | "你看着我过去的产物，告诉我我的指令系统哪里在漏水" | 多 worker / 多 skill / 长链路 |

**为什么是范式变化**：传统 prompt 工程的有效性建立在"我对自己要什么很清楚"这个假设上。当 agent 链路足够长（有 worker/skill/reviewer/validator），你就不再清楚自己每一层"应该要什么"了。这时候你需要的不是更强的 prompt，是一个**能从自己历史里反向发现问题的 agent**。

**VB prompt 在 OpenAI 圈子能打的原因**：他们已经在 Codex 内部把反向链路建好了——skills、sessions、memories、Chronicle、AGENTS.md，五件套齐。中文圈复制 prompt 但没复制这套链路，自然跑空。

**与两年前 CoT 的类比**：CoT 真正起作用的前提是模型已经具备相应的中间推理能力，prompt 只是把那个能力**激活**；模型里没有的东西，prompt 喊破喉咙也喊不出来。**反向审计 prompt 是同一个道理**——它激活的是你 repo 里已经存在的能力链路。链路不在，prompt 只能让 agent 凭空编一份看起来很像审计的清单。

> 这是与 [Skill 工程化设计：把 Agent 当算法用](ch07-056-ai-skill.html) 在"agent 链路是激活对象"维度上的**范式共振**——本文给出的是诊断视角，后者给出的是生产视角。

## 5 行骨架版：把 50 行砍到只剩三个问题

> **扫描我最近 30 次任务的产物、回执、validator 记录、handoff 文件。回答三个问题：**
> 1. 哪几个 skill 本应该被触发但没被触发？证据路径是什么？
> 2. 哪些产物明显"变薄"或"重复出问题"？根因是 skill 没生效、worker 没跑、还是 validator 没拦住？
> 3. 这些证据应该沉淀进 skill description、AGENTS.md、还是新 validator？**给出具体的 patch 文案，不要 generic 建议**。

5 行。三个问题。三件具体动作。

**为什么砍得动**（与 VB 50 行逐段对照）：

| VB 50 行段落 | 5 行版本处理 | 理由 |
|--------------|-------------|------|
| 证据来源声明（前 1/3） | 删 | 你已知道路径（你直接指） |
| 判断标准（中 1/3） | 删 | "要不要建"是 5 行版本读者自己决定的事，不该让 agent 替 |
| 产出格式（后 1/3） | 删 | 5 行版本要的是"哪里漏了"，不是"请你创建这些 skill" |
| 核心视角：让 agent 反向审计能力链路 | **保留** | 整个 5 行版本的灵魂 |

**5 行版本 ≠ VB prompt 的简化版**——它是**另一个 prompt**，专门解决"我手里有一堆 skill 但我不知道哪些在裸跑"。

## 50 行 VB 版 vs 5 行反向审计版能审计什么对比

| 维度 | VB 50 行版 | 5 行反向审计版 |
|------|------------|---------------|
| **主要目的** | 沉淀新 skill / subagent / automation | 诊断已有 skill / worker / validator 是否在跑 |
| **证据基础** | Codex sessions、Memories、Chronicle、已有 skill | 自己的 producer 链路产物 / 回执 / validator 记录 |
| **输出形态** | shortlist + 自动创建高置信项 | 诊断报告 + 具体 patch 文案（**不自动创建**） |
| **需要前置** | Codex 自带历史齐全 | AGENTS.md 有 worker 边界 + 回执在写 |
| **适用对象** | OpenAI 内部用户 / 纯 Codex 用户 | 有自定义 worker / skill / producer 链路的人 |
| **致命缺陷** | 在前置不全的 repo 里会退化成关键词分类器 | 在没有回执链路的 repo 里跑不出任何有效结论 |

**最后一行最关键**——两个 prompt 的失败模式完全不同：VB 是"看起来跑了，其实是凑数"，5 行版本是"直接跑不出来，agent 会明确告诉你没有证据可看"。**后者其实更友好**，因为它主动暴露 producer 链路问题，而不是用一份漂亮的清单帮你盖住。

## 5 行版本的使用时刻（3 种）

| 时刻 | 触发条件 | 期望产出 |
|------|---------|---------|
| **1. 产物质量持续下滑** | 单独看每份还过得去，放一起明显比上个月薄；validator 分数在 70 多分徘徊；reviewer 问题翻来覆去就那几条 | 把"感觉哪里不对但说不清"具象成"这两个 skill 的 description 触发风险评分 80/75，下面是建议的 patch 文案" |
| **2. 刚装了一批新 skill 想验证** | 让 agent 扫最近 30 次任务，看新 skill 实际触发率；装 5 个新 skill 但最近 30 次任务里 4 个一次都没触发 → 不是 skill 不好，是 description 写错了 | 新 skill 触发率清单 + 触发失败的具体 description 字段 |
| **3. 能力交付前自检** | skill 系统要交到别人手里之前，自己跑一遍反向审计，把所有漏的洞补上再交出去 | patch 文案清单（人类筛一道再落到 repo） |

**5 行版本不能解决的事**（诚实摆出）：

1. **不能替你写新 skill**——告诉你"这里缺一个评分 worker"，但不会替你写出来。是诊断工具不是生成工具
2. **不能在没有回执的 repo 里跑出任何有效结论**——30 天任务里只有 README 和 git log，agent 能看到的最多就是 commit 信息
3. **不能替代 reviewer**——reviewer 是单任务实时检查站，5 行版本是跨任务事后诊断。两者解决的根本不是同一个问题
4. **跑出来的 patch 文案必须人类筛一道**——作者实测 60% 直接可用 / 30% 改 1-2 词 / 10% 完全 agent 脑补的触发词（"我从来没说过这种话，但它觉得我会说"）

## 深度分析

### 核心观点：反向审计是范式转换，不是 prompt 优化

传统 prompt 工程的有效性建立在"我对自己要什么很清楚"这个假设上；当 agent 链路足够长（有 worker/skill/reviewer/validator），你就不再清楚每一层"应该要什么"了。**反向审计 prompt 激活的不是模型的新能力，而是 repo 里已经存在但长期被忽视的能力链路**——VB prompt 在 OpenAI 圈子能跑通，是因为他们的 Codex 已经把 skills/sessions/memories/Chronicle/AGENTS.md 五件套建好；中文圈复制 prompt 但没复制链路，自然跑空。

### 技术要点：3 条前置缺失是架构问题，不是配置问题

worker 边界、skill description 触发词、producer 链路回执——这三条缺失任何一条都会让 prompt 退化成"关键词分类器"，而且它们是**递进依赖关系**：

- AGENTS.md 没有 worker 边界 → Codex 做蒸馏时没有"角色"维度可用，只能看到任务表面的相似性，看不到结构性的缺位
- skill description 没有触发词 → Codex 根本看不见这些 skill 的存在，给出的"重复工作流候选"里会大量出现已有 skill 在跑但 Codex 不知道的项目
- producer 链路没写结构化回执 → 只能看到"这件事发生过几次"，看不到"这件事每次都有同样的瑕疵"

这三条里最难补的是第 3 条——前两条是一次性投入，**producer 链路写回执是每一次任务都要做的事**。

### 实践价值：5 行骨架版的核心价值是暴露问题而不是生成方案

5 行反向审计版本和 VB 50 行版本的**失败模式完全不同**：VB 是"看起来跑了，其实是凑数"；5 行版本是"直接跑不出来，agent 会明确告诉你没有证据可看"。**后者其实更友好**——它主动暴露 producer 链路问题，而不是用一份漂亮的清单帮你盖住。patch 文案 60% 直接可用 / 30% 改 1-2 词 / 10% 完全 agent 脑补（"我从来没说过这种话，但它觉得我会说"）这一经验值，是人类必须参与 review 的根本原因。

---

## 实践启示

1. **不要复制粘贴 VB 50 行 prompt**——前置缺失会让它退化成关键词分类器。先审计自己的 repo 是否满足 3 条前置（worker 边界 / 触发词 description / producer 回执）
2. **先修 AGENTS.md**——加 worker 边界（明确角色分工）比写 50 条 skill 更基础
3. **description 是触发的全部**——把"装了但没用"的 skill 优先重写（用"用户会真的说的话"作为触发词 + 写清不适用范围）
4. **结构化回执是反向审计的基石**——每条任务都应该有 STATUS / VALIDATOR_SCORE / NEXT 三个字段，不只是 git log
5. **5 行版本是诊断起点**——不要期望跑完就有 3 个新 skill 装好；它告诉你"哪里漏了"，创建动作交给人类
6. **人类筛 patch 文案**——60/30/10% 比例是经验值，agent 生成的触发词 10% 是幻觉
7. **范式转换的边界**——传统 prompt 工程在单轮交互中仍有效；只有 agent 链路长起来后，反向审计才显示出边际收益

## 相关实体

- **同 skill description / 触发信号**：
  - [Agent Skill 进阶模式与治理](ch01-319-agent-skill-进阶模式与治理.html)（description + name + 触发机制）
  - [Skill 设计模式](ch07-002-skill.html)（5 种核心模式 + 1 特殊模式）
  - [Anthropic 官方技能最佳实践 14 模式](ch04-030-agent-memory-architecture-past-influence-future-ruofei.html)（5 类设计模式）
  - [AI Skill Evolution Framework（skill 评估与度量）](ch07-010-ai-skill-evolution底层逻辑.html)
  - [Anthropic+Google Agent Skills 设计模式](ch04-178-sdd-codeagent.html)
- [**同 Codex / OpenAI**：](ch01-818-一文看懂-openai-开源的-codex-编排规范-symphony.html)
  - [Codex Goal 代理运行时](ch04-094-sap-unveils-the-autonomous-enterprise.html)
  - [Codex Goal 六小时运行](ch09-052-codex-goal-six-hour-run.html)
  - Codex 上下文工程
  - [OpenAI Codex JasonLiu maxxing 攻略](ch09-111-unlocking-ai-flexibility-in-europe-a-guide-to-cross-region.html)
  - [GPT-5.4 Codex Interconnects](ch01-508-gpt-5-4-codex-评测-interconnects-的-agent-使用体验.html)
- [**同 AGENTS.md / 角色边界**：](ch04-230-一个文件让-ai-coding-效率翻倍-agents-md-实践指南.html)
  - [Agent 可靠性工程与持续改进](ch04-054-agent-可靠性的工程解法-从-skillify-看持续改进机制.html)
  - [Skill 工程化设计：把 Agent 当算法用](ch07-056-ai-skill.html)
- **同 prompt 工程 / 范式**：
  - [Claude Managed Agents](ch04-421-claude-managed-agents.html)（prompt 工程的边界探索）
  - [AI 蜜罐：对抗 AI 智能体](ch01-060-agent-token.html)
- MOC

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/ai-native-software-engineering-codex-reverse-audit-5-line-prompt.md)

---
