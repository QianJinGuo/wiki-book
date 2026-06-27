# Agent 可靠性的工程解法：从 Skillify 看持续改进机制

## Ch04.055 Agent 可靠性的工程解法：从 Skillify 看持续改进机制

> 📊 Level ⭐⭐ | 22.1KB | `entities/agent-reliability-engineering-skillify-continuous-improvement.md`

## 概述
YC 总裁 Garry Tan 的 OpenClaw 一周内两次失败：日历查询和时区计算。两次都是 Agent 有现成工具却选择自己推理——该用脚本的地方用了模型。Garry Tan 的解法是 skillify：一套 10 步检查清单，将每次失败固化为确定性测试，让同样的错误结构上不可能再发生。

## 两次失败的核心机制
### 失败 1：传感器失效
3,146 个本地日历文件已索引，grep 100ms 内能找到答案。Agent 却绕了五分钟远路：调用 live calendar API → 被拒 → email search → 嘈杂无结论 → 再调 API → 再被拒 → 最后才搜本地。
**根因**：工作分类错位。日历 grep 是确定性工作（deterministic work），同样输入同样输出，不需要模型。但 Agent 在判断空间（latent space）里完成这件事——启动推理、发起 API、解释结果，而一个三行脚本 100ms 就够了。
**这是第一类错误**：在错误的 latent space 里做了正确的事。

### 失败 2："28 分钟"
Agent 说"下一个会议在 28 分钟后"。实际是 88 分钟——Agent 心算 UTC→PT 时区转换，差了一小时。而 `context-now.mjs` 脚本 50ms 输出精确结果，Agent 就是不运行它。
**根因相同**：确定性工作（时间戳相减）在判断空间完成。模型在做心算，而脚本有答案。

### 共同本质
Agent 有现成工具，却选择自己推理。vibes-based reliability 的本质缺陷：依赖 prompt、依赖更大模型、依赖"请不要幻觉"——对话变复杂时这些都会衰减。Agent 没有对 bug 的记忆，没有对 bug 的测试，没有任何东西阻止它再次发生。

## Skillify 10 步法
### Step 1：SKILL.md——契约
Skill 是 markdown 文件，定义名称、触发条件、硬规则。不是告诉 Agent 做什么（what），而是提供过程（process）。对于日历失败：
```
name: calendar-recall
硬规则：Live calendar APIs are ONLY for events in the FUTURE or the LAST 48 HOURS. Everything historical goes through the local knowledge base first.
```

### Step 2：Deterministic code——脚本
Agent 读取 SKILL.md，理解日历搜索是确定性工作，自己生成脚本来处理。100ms 以内，零 LLM 调用，零网络，只有本地文件。

### Step 3：Unit tests——确定性函数测试
vitest 风格。Garry Tan 有 **179 个单元测试**，跨 5 个套件，运行时间不到 2 秒。捕获的 bug 包括：Unicode 字符导致事件静默丢弃、闰年日期返回 null、DST 边界 minutesUntil 跳 60 分钟——正是"28 分钟"问题的根因，现在结构上不可能再发生。

### Step 4：Integration tests——真实数据验证
命中真实端点和真实数据。真实数据有格式错误的事件行、缺少时区字段、Windows 行尾、跨越午夜的事件——这些 fixture 太干净时会漏掉。
**规则**：如果你发现自己手动检查脚本在真实数据上是否正确，那个检查应该是集成测试。

### Step 5：LLM evals——判断质量评估
LLM-as-judge 评估判断类输出（"这个日历摘要有用吗？"）。每天运行 35 个 eval，验证 Agent 是否运行了正确工具而非自己推理。
**最诚实的 eval 启发式**：搜索对话历史中你说"fucking shit"或"wtf"的时刻——那些是你缺少的测试用例。

### Step 6：Resolver trigger——路由表
AGENTS.md 中的触发表：当任务类型 X 出现时，加载 skill Y。
```
Trigger Pattern | Skill | Priority
"historical calendar" | calendar-recall | high
"what time is" | context-now | high
```
**捕获的 bug**：新 skill 写好了但忘记加到 resolver。比根本没有 skill 更糟糕——你以为系统处理了，实际上没有。

### Step 7：Resolver eval——路由验证
测试 resolver 表是否实际生效。两种失败模式：

- **假阴性**：skill 应该触发但没有（触发描述错误或缺失）
- **假阳性**：错误 skill 触发（触发器重叠）
三层验证：结构测试（表是否正确）+ LLM 路由测试（模型是否选对 skill）。两层都很重要。

### Step 8：Check-resolvable + DRY audit
check-resolvable 遍历整个链：AGENTS.md resolver → SKILL.md → script/cron。如果脚本可工作但没有从 resolver 路径到达，则无法触达，LLM 永远不会知道使用它。
**第一次运行结果**：40 多个 skill 中有 **6 个无法触达**——系统能力的 15% 是暗的。
DRY audit 检查重叠：calendar-recall / calendar-check / google-calendar / calendar-sync 四个 skill 在同一时间域，零重叠，每个有自己的 lane。

### Step 9：E2E smoke test——端到端验证
最后一道防线：问 Agent "我什么时候去新加坡？" 验证它运行了 calendar-recall.mjs 并正确格式化答案。前 8 步都通过但各部分衔接失败的情况，smoke test 捕获。

### Step 10：Brain filing rules——知识库组织
Garry Tan 发现 13 个 brain-writing skill 中有 **10 个归档到错误目录**——各自硬编码路径而不咨询 resolver。filing rules 文档记录常见错误模式。Skill 在创建任何页面之前读取规则，自那以后零错误归档。

## 三个关键机制
### 机制 1：自举循环（Bootstrapping Loop）
Latent space 构建确定性工具 → 确定性工具约束 latent space。Agent 用判断写了 `calendar-recall.mjs`，然后 skill 强制 Agent 运行那个脚本而非自己做推理。**模型的智能创造了约束，约束反过来限制模型在不该推理的地方犯错。**

### 机制 2：从 "vibes-based" 到 "structurally impossible"
Skillify 将可靠性从"Agent 应该记住做这件事"转变为"Agent **结构上不可能不做**这件事"。Skill 说"先搜索本地"，脚本执行搜索，Agent 没有选择。
这体现了 Harness Engineering 的核心悖论：**约束越严格，自主权越大**。日历固化为确定性脚本后，Agent 不再需要"思考"这个问题，认知资源用在真正需要判断的地方。如同高速公路护栏——正因为有护栏，你才敢踩到 120 码。

### 机制 3：可验证性是改进的前提
Jason Wei："改进系统的能力与你验证其输出的容易程度成正比。"
10 步清单将 vague multi-step workflows 变成 structured data that we can log and grade。Agent 系统从"黑盒"变成"可观测、可调试、可优化"的工程系统。

## 三个关键权衡
### 权衡 1：灵活性 vs 确定性
事务性任务（transactional）→ 完全确定化。创意性任务（creative）→ 提供框架但保留判断空间。**把需要精确的工作放在确定性脚本中，把需要智能的工作留给模型。**

### 权衡 2：Skill 数量 vs 系统复杂度
40 个 skill 中 6 个不可触达 = 15% 系统能力在黑暗中。DRY audit 的深层含义是**认知负担管理**——太多 skill，Agent 开始混淆；太少 skill，每个变得太复杂。
OpenAI 的"garbage collection"思路值得借鉴：后台定期运行清理 Agent 扫描不一致和违规。对抗熵增需要 gbrain doctor 每周运行，持续而非一次性。

### 权衡 3：Skill 生命周期管理
每个 skill 都是对当前模型能力边界的假设。Anthropic 的演进经验：context reset 先被淘汰，sprint 分解随后被淘汰，evaluator 仍然有价值。正确的做法：**逐一移除旧组件，测试质量是否真的下降**，而不是继续叠加新组件。Skill 腐朽有 Context Rot 式、数据漂移式、架构错位式三种形态。

## 相关概念
- [GBrain 自进化体系](../ch01-499-llm-wiki-obsidian-wiki-gbrain-self-organization-self-evoluti/) — skillify 是 gbrain 自演化的核心机制
- [Harness Engineering](../ch05-049-harness-engineering-系统梳理/) — 传感器失效是 latent space 工作分类错位的体现
- [Harness 从 Prompt 到工程体系](../ch01-664-从-prompt-到-harness-claude-官方学习资料/) — 约束与自主权的辩证关系
- [AIAIGC峰会嘉宾阵容](../ch04-416-aiaigc峰会嘉宾阵容/)
- [OpenClaw 完全指南：这可能是全网最新最全的系统化教程了！（3.2W字，建议收藏）](../ch04-429-openclaw-完全指南-这可能是全网最新最全的系统化教程了-3-2w字-建议收藏/)
- [从提需求到部署发布全AI全自动化后研发效能全面跃升](../ch09-065-从提需求到部署发布-全ai全自动化后-研发效能全面跃升/)
- [Hermes Agent vs OpenClaw 对比分析](../ch04-188-hermes-agent-为什么火了-和-openclaw-龙虾比一比/)
- [AutoClaw 使用体验：自带 66 个 Skill、可接入聊天工具、安全性高](../ch04-257-autoclaw-使用体验-自带-66-个-skill-可接入聊天工具-安全性高/)
- [Harness Engineering 实战：AI Coding 率从 25% 提升至 90%](../ch05-031-harness-engineering-实战-ai-coding-率从-25-提升至-90/)
- AI 领域专家学习路径
- [OpenCLAW 完全指南](../ch04-199-openclaw-完全指南/)
- [Agent 上下文窗口管理对比](../ch04-149-agent-上下文窗口管理对比/)
- [OpenClaw Agent 可观测性体系 — Session 审计日志 + OTEL + SLS](../ch04-338-你的-ai-agent-真的在受控运行吗/)
- [IMClaw：通过微信/飞书操控ClaudeCode/Codex/GeminiCLI/Pi Agent蜂群](../ch01-328-imclaw-通过微信-飞书操控claudecode-codex-geminicli-pi-agent蜂群/)
- Harness Engineering 七层框架

## 深度分析
### 自举循环的本质：智能制造约束，约束反过来限制智能
Skillify 最深刻的机制藏在 Step 2 和 Step 1 的循环里：Agent 在 latent space 里用判断构建了确定性脚本（calendar-recall.mjs），然后同一个 Agent 被 skill 强制运行那个脚本——而不是再做一次判断。这是 Bootstrap Loop 的完整形态：**模型的智能创造了约束，约束反过来限制模型在不该用智能的地方犯错**。
这个循环之所以有效，因为它解决了一个根本矛盾：Agent 的推理能力既是可靠性问题的来源，又是可靠性问题的解决方案。如果单纯让 Agent 凭" vibes"工作，它会在需要确定性的地方自己推理（犯第一类错误）；如果过度约束 Agent，它就失去了利用判断处理新问题的能力。Skillify 的自举循环让模型自己决定"哪里需要确定性"，然后把这个决定固化为结构性约束。
这意味着系统不是靠prompt"告诉"Agent 什么时候该推理、什么时候该用脚本——而是让 Agent 用推理能力自己写出判断标准，然后用这个标准约束自己。这比任何 prompt engineering 都更接近"让 Agent 真正理解什么时候该用工具"这个目标。

### "structurally impossible"比"shouldn't happen"更可靠
vibes-based reliability 的核心缺陷不是 Agent 不知道正确答案，而是 Agent **下次还可能选错**。Prompt 改变不了这个事实——你只能改变这次的概率，不能改变下次的概率。要让错误"结构上不可能再发生"，必须改变 Agent 可选的行动空间本身，而不是改变选择倾向。
Skillify 通过 SKILL.md（硬规则）+ 确定性脚本（不可绕过的执行路径）实现这一点。旧路径变得不可达：Agent 想做心算？脚本已经在那，skill 强制它调用脚本，它甚至没有机会做心算。这不是改变偏好，而是移除选项。
"structurally impossible"是 Harness Engineering 的终极目标。它意味着错误不再需要被"防止"，因为执行路径已经被物理性地隔离了失败的可能。这比任何事后检查或 prompt 提示都更根本。

### 可验证性是改进的充要条件
Jason Wei 的洞察"改进系统的能力与你验证其输出的容易程度成正比"在 Agent 可靠性领域有特殊含义。传统软件系统有明确的正确性标准（单元测试、集成测试），Agent 系统的挑战在于：判断类输出（"这个答案有用吗？"）没有 ground truth，所以无法用传统测试验证。
Skillify 的多层验证体系回答了这个问题：确定性函数用单元测试验证，真实数据用集成测试验证，判断质量用 LLM-as-judge 验证，路由逻辑用 resolver eval 验证，端到端用 smoke test 验证。每个失败模式都有对应的测试层，没有遗漏。
这个设计的深层含义是：当你能够对 Agent 的每一个能力进行独立的、可重复的验证时，改进就变成了一个工程问题——你可以测量、定位、修复、再测量。你从"感觉 Agent 好像变好了"变成"这个指标从 X% 提升到 Y%"。

### 熵增是 Agent 系统的内生力量
Skillify 的 Step 8（check-resolvable + DRY audit）和 Step 10（brain filing rules）揭示了一个被忽视的事实：Agent 系统不是静态的，它在每次对话中都在积累新的 skill 和新的路径。而这些新增内容会自然地腐坏——skill 创建了但没有注册到 resolver，路径存在但与真实数据脱节，归档规则存在但没人遵守。
Garry Tan 的发现：13 个 brain-writing skill 中有 10 个归档错误（各自硬编码路径而非咨询 resolver）。这不是因为规则不清楚，而是因为 Agent 在每次执行时都有"抄近路"的动机——只要这次能跑通，谁会去检查是否符合全局规范？
这意味着熵减必须是持续的，而不能是一次性的清理。gbrain doctor 每周运行一次，而非在发现问题时才运行。对于任何生产级 Agent 系统，必须建立定期的架构一致性检查机制，否则系统会逐渐退化到"理论上有很多 skill，实际上大部分不可达"的状态。

## 实践启示
### 立即可行的行动
**1. 从最贵的失败开始 skillify**
不是所有错误都值得同等投入。先识别 Agent 系统中每次失败成本最高的场景——那些"说起来是个小 bug，但修一次要好几天"的错误。在这些场景上优先应用 10 步法。Garry Tan 的日历查询和时区计算失败都是高频、低认知价值但高挫败感的场景，正是 skillify 的最佳候选。
**2. 建立 check-resolvable 作为基础建设**
在构建超过 20 个 skill 之后，必须运行 check-resolvable。它会发现系统中"暗掉"的能力——skill 存在但 Agent 永远触达不到的部分。越早建立这个检查机制，暗能力的比例越低（从 15% 到接近 0%）。这个工具本身的价值远超 skillify 的其他步骤，因为它解决的是"你以为自己有这个能力但实际上没有"的问题。
**3. 用"fucking shit"启发式发现缺失的 eval**
当你或用户在使用 Agent 时说出"wtf"或"这怎么又错了"的那一刻，你发现了一个现有测试套件完全没有覆盖的失败模式。把这个场景立即转化为 eval 或单元测试。这是发现 eval 覆盖盲区最有效的方法，因为它来自真实失败而非假设。
**4. 区分确定性工作和判断性工作作为第一优先级**
在写任何 skill 之前，先明确：这个任务是确定性的（同样输入同样输出）还是判断性的（需要评估质量）？确定性工作必须强制走脚本，判断性工作才值得用 Agent。如果混淆了这两类，skillify 的其他步骤都是在错误的基础上叠加。

### 中期系统建设
**5. 维护 skill 生命周期的"尸检"机制**
当模型能力升级（如从 Sonnet 4.5 到 Opus 4.6）时，不要假设旧 skill 仍然必要。Anthropic 的做法是逐一移除旧组件并测试质量是否真的下降——这应该成为每个 Agent 系统升级的标准流程。Skill 腐朽有三种形态：Context Rot 式（Agent 长期运行后执行质量下降）、数据漂移式（真实数据格式改变但 fixture 没更新）、架构错位式（模型能力提升导致旧约束不再需要）。每种形态需要不同的修复策略。
**6. 推行 skill 的 DRY audit 作为常规节拍**
每新增 10 个 skill，必须有一次 DRY audit。它的核心问题不是"有没有重复代码"，而是"有没有重叠的触发条件导致 Agent 随机选择 skill"。Calendar 域的四个 skill（calendar-recall / calendar-check / google-calendar / calendar-sync）是 DRY audit 的标准范例：同一个时间域，零重叠，每个有自己的 lane。如果 audit 发现两个 skill 可以合并，优先合并而非保留——因为你永远不确定哪个 Agent 会在哪个时刻选择哪一个。
**7. 建设 Agent 系统的"可观测性"基础设施**
单元测试覆盖率、集成测试通过率、LLM eval 分数、resolver eval 覆盖率、smoke test 通过率——这些指标应该被持续监控。任何一个指标的显著下降都应该触发 alert。这不是 ops 团队的工作，而是 Agent 系统本身的呼吸指标。

### 长期架构原则
**8. 把 skillify 作为 Agent 协作的默认协议**
Garry Tan 的"skillify it"不只是故障响应协议，而是一种人机协作语言。当一个临时解决方案被证明有效时，说"skillify it"意味着：把这个变成一个具有 SKILL.md、确定性代码、完整测试套件、resolver 条目的持久能力。这个协议让人从"每次都要重新指导 Agent"中解放出来，也让 Agent 从"每次都要重新发明轮子"中解放出来。
**9. 约束越严格，自主权越大——接受这个悖论**
Harness Engineering 的核心悖论在实践中经常被误解：增加约束不是减少 Agent 的能力，而是保护 Agent 的认知资源不被浪费在低价值任务上。把日历查询固化为确定性脚本后，Agent 不再需要"思考"这个问题，它的注意力可以集中在真正需要判断的地方。护栏让人敢开 120 码，同样，严格的 skill 边界让 Agent 敢在真正需要智能的地方全力推理。不要因为"看起来限制了 Agent"就回避确定性化——要把它理解为对 Agent 判断力的解放。

## Related

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/agent-reliability-engineering-skillify-continuous-improvement.md)

- [Agent 原理、架构与工程实践](../ch04-435-agent-engineering-principles-architecture-practice/)

---

