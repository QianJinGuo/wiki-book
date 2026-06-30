# Claude Code 一周年回顾：Boris Cherny + Cat Wu 对话

## Ch09.022 Claude Code 一周年回顾：Boris Cherny + Cat Wu 对话

> 📊 Level ⭐⭐ | 16.2KB | `entities/claude-code-first-year-retrospective-agi-hunt.md`

# Claude Code 一周年回顾：Boris Cherny + Cat Wu 对话

> AGI Hunt 公众号 2026-06-10 整理，素材来自 Boris Cherny（Claude Code 负责人）+ Cat Wu（产品负责人）2026-06 录制的 1 周年回顾视频（YouTube 原片）。从 2025-02 Slack 内部演示"两个赞"到 2026-06 一周年，Claude Code 已经从终端 CLI 工具演化成"PM 在写代码、工程师在手机上写代码、Agent 在自动修 bug"的 AI 编程基础设施。
> → [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-first-year-retrospective-agi-hunt.md)
> 视频原片：[YouTube](https://www.youtube.com/watch?v=Hth_tLaC2j8)

## 摘要

文章是 Boris Cherny + Cat Wu 在 Claude Code 一周年时录制的视频文字稿，主题是回顾产品形态如何从"终端聊天工具"演化为"AI 编程基础设施"。覆盖 10 个章节：起点（两个赞）、验证机制（self-validating loop）、人人写代码（PM/设计师/数据科学家都在用）、Routines（同步 → 异步）、Auto Mode（用另一个模型做安全审查）、Loop 与手机编程、Context 极简主义、源码泄露风波（v2.1.88 npm source map 事件）、一年时间线、下一年展望。

## 核心要点

- **起点的反常识信号**：2025-02 Research Preview 内部演示只收到 2 个赞，但团队持续投入；2025-05-22 Claude 4 发布同日 Claude Code 正式发布，"从那天起一切开始加速"。
- **验证是 Agent 长时间自主运行的关键**：
  - 开发者想到的验证是单元测试、lint、类型检查。
  - Agent 层面的验证是"能自己跑起来、验证自己写的东西"——Opus 4 时 Boris 让 Claude 写功能并自测，Claude 打开了 Claude CLI 在 bash 里测试自己写的代码。
  - 现在是常规操作：iOS/Android 模拟器、桌面端 computer use 循环、桌面开发 Skill。
- **人人都在写代码**：PM（Cat 自己）、设计师 Megan 直接提 PR、财务团队跑预测、数据科学家屏幕上全是 Claude Code。Boris 总结："未来每个人都既是 PM 又是工程师"。
- **Routines 让 Agent 从同步工具变成异步基础设施**：Voice Mode 团队的 Routine 监控 GitHub issue 自动修复、5 小时无人回应的 bug 自动提交 PR。Cat 的亲身体验：她还没修的 bug，另一个 Claude 已经修了。
- **Auto Mode 用另一个模型做安全审查**：把权限判断交给 Sonnet 4.6，工程师不再逐条点同意。Boris 最初觉得"不靠谱"——结果出奇有效。反直觉的安全论点：人在 99% 请求时眼睛走神，auto mode 让人只关注真正重要的事情。
- **Agent View + Remote Control + Voice Mode 改变工作地点**：Boris 一半的工程工作在手机上完成。Loop / Routine 调度 Agent 取代 6 个 git checkout 终端标签。
- **Context 极简主义**：Boris + Cat 都主张"给模型最少的 system prompt 和 tools，让它自己去找 context"。"给模型太多 context 就像在微观管理它"。
- **源码泄露风波（v2.1.88）**：2026-03-31 npm 包意外发布 59.8MB JS source map，51.2 万行未混淆 TS 代码暴露，暴露 KAIROS 自主守护进程、Undercover Mode、内部代号（Tengu / Fennec / Capybara）等。引发 8100 个仓库被 DMCA 误伤、claw-code Python 重写版 2 小时 75000 star。
- **完整时间线**：2025-02 (CLI) → 2025-05 (正式发布) → 2025-09 (v2.0 / Checkpoints / VS Code 扩展 / Hooks / Agent SDK) → 2025-10 (网页端 / 沙箱 / Skills) → 2025-11 (Opus 4.5 / 67% 降价 / context compaction) → 2026-01 (v2.1.0 / 1096 commit) → 2026-02 (Opus 4.6 / Agent Teams / Remote Control) → 2026-03 (Voice Mode / /loop / auto mode / 源码泄露) → 2026-04 (桌面应用 / Routines 正式发布 / Opus 4.7) → 2026-05 (Agent View / Opus 4.8 / Dynamic Workflows)。

## 深度分析

### 一、两个赞的起点：AI 产品的早期反馈悖论

Claude Code 2025-02 内部演示只收到 2 个赞。两年后（2026-06），它已经成为 Anthropic 增长最快的产品之一。这个反常识的信号说明了 AI 产品开发中一个被广泛忽视的事实：

- **早期反馈衡量的是当下价值，不是未来价值**——演示的"新工具能完成基础任务"在 2025-02 看起来并不惊艳（用户还在消化 ChatGPT），但 1 年后基础任务已经被自动化，Claude Code 沉淀的 workflow 与 Skill 生态变得不可替代。
- **AI 产品的复合效应**——模型能力提升与用户工作流沉淀是两条独立曲线：模型每月升级（Claude 3.7 → 4.0 → 4.5 → 4.6 → 4.7 → 4.8），但 Skill / Routine / 验证回路是用户在使用中沉淀的资产，**两者叠加产生指数级复合**。
- **AI 工具的反馈周期**——传统工具的反馈是"今天能干什么"；AI 工具的反馈是"今天 + 模型升级后 + 用户技能沉淀后"能干什么。早期反馈对长期价值预测力很弱。

这与 [Karpathy: Software 3.0 与 vibe coding 时代的终结](ch04/503-agent.md) 中关于"AI 编程工具的最终形态是 agentic engineering"的判断同构——只有当 Agent 工具沉淀出"自我验证 + 异步调度 + 异步 Routine"的工程模式时，它的价值才会从"工具"升级为"基础设施"。

### 二、Self-Validating Loop：Agent 长期自主的真正关键

Boris 强调"过去一年最重要的理念是：每次 Claude 犯错不要告诉它下次怎么做，而是让它把经验写进 CLAUDE.md 或做成 Skill"。但他话锋一转——"真正让 Agent 长时间自主运行的，是 **验证**"。

**三层验证**：
1. **代码层面**——单元测试、lint、类型检查（传统软件工程的验证）。
2. **应用层面**——Claude 启动模拟器（iOS/Android/desktop），通过 computer use 走完用户流程，验证功能真的工作。
3. **流程层面**——发现预发布环境挂了，去读 Slack 确认，然后更新 Skill 防止下次再踩。

第三层是 Anthropic 真正的护城河：**Agent 通过 Skill 把"工程经验"沉淀为可重放的代码**。这与 [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 的核心命题完全一致——harness 不是单次 prompt，而是"输入约束 + 评估机制 + Skill 沉淀"的闭环。

### 三、Routines：Agent 同步 → 异步的关键跃迁

Routines 是文章最有产品洞察力的概念。Boris 原话：

> "Agent SDK 是 Claude Code 可编程化的第一步，但一开始大家不知道拿它干什么。Routine 是第一个'显而易见的应用场景'，它让 Claude **从同步工具变成了异步基础设施**。"

**为什么是跃迁**：
- 同步 Agent 是"我坐在那里等它干活"——人的注意力被 Agent 占用。
- 异步 Agent 是"我设个规则，Agent 在后台跑，结果回来了再处理"——人的注意力被释放。
- Cat 的亲身体验："我还没修的 bug，另一个 Claude 已经修了"——这是异步 Agent 时代的标志性叙事。

Routines 与 [24h Worker Agent](ch04/503-agent.md) 描述的"持续运行的 Agent"完全一致——Claude Code 的 Routine 是工业级实现。Routine 在产品形态上对应到：
- **监控型 Routine**：监听 GitHub issue / bug report，主动捡起修复。
- **批处理型 Routine**：定期跑数据处理 / 报告生成。
- **触发型 Routine**：在特定事件（PR 合并 / Slack 消息 / 定时器）触发 Agent 行动。

### 四、Auto Mode 的反直觉安全论点

Boris 说他最初觉得 auto mode"不靠谱——把 prompt 路由给一个模型判断安全性？不可能行的"——结果一试效果好。

**反直觉之处**：
- 传统安全思维：让人类逐条审查每条权限请求 = 严格 = 安全。
- 实际行为：99% 请求人类都点同意，眼睛走神 = 形式审查 = 实际不安全。
- Auto mode：用专门训练的 Sonnet 4.6 分类器持续学习；收集成千上万条 Agent 运行轨迹 + 红队 prompt 注入 + 内部攻击测试 + 真实发现 → eval。
- **结论**：auto mode 比人工形式审查更安全，因为它对所有请求都做实质性判断。

这与 [Agent Security 三步走: Harness + Governance + Identity](ch04/310-ai.md) 中"governance 必须可验证、可审计"的原则一致——Auto Mode 是 governance 的工业级实现。

### 五、Context 极简主义对 prompt engineering 的反叛

Boris + Cat 都明确表态：

> "以前 Sonnet 3.5 时代你得做 prompt engineering，Opus 4 时代你得做 context engineering。但现在的模型，这些都不需要了。"
> "给模型最少的 system prompt，最少的 tools，让模型自己去找需要的 context。给模型太多 context，就像在微观管理它。"

**反直觉的工程含义**：
- 早期 LLM 时代：context engineering 是关键技能。
- 当前 Opus 4.7+：过度工程化 context 反而限制模型的内在能力。
- **真正的工程**：保持 system prompt 极简、提供足够但不过度的 tools、让模型自己决策用什么 context。

这与 [From Prompt to Harness: Claude 官方](ch01/380-claude.md) 描述的"harness 不是更大 prompt，是更好结构"理念一致——harness engineering 的核心不是"塞更多 context"，而是"提供对的 tools + 对的评估 + 对的 Skill 沉淀机制"。

### 六、源码泄露风波的工程含义

v2.1.88 源码泄露是一起典型的人为工程事故，但也是一次意外的能力展示：

**事故侧**：
- 59.8MB JS source map 意外发布，51.2 万行未混淆 TS 代码暴露。
- 暴露 KAIROS（未发布自主守护进程，150+ 处引用，含 `autoDream` 空闲记忆整合）、Undercover Mode（员工操作非内部仓库时自动激活，去掉 Co-Authored-By）、内部代号（Tengu / Fennec / Capybara）、44 个隐藏功能开关。
- DMCA 误伤 8100 个仓库。
- 韩国开发者做 claw-code Python 重写版，2 小时 75000 star。

**能力侧（反向工程发现）**：
- 40+ 个注册工具
- 5 种 context 压缩策略
- 23 个 bash 安全检查
- 14 个缓存破坏向量

**根本原因**：Bun 默认生成 source map，但 `.npmignore` 没排除。这暴露了 npm 工具链在"build artifact 泄露"上的系统性脆弱——**所有使用 source map 的 JS 工具都应检查 `.npmignore` 与 package include 配置**。

**对 OpenClaw 等自托管 Agent 的启示**：
- 配置 / Skill / Script 都需要 `.gitignore` / `.npmignore` 审计。
- 任何"debug 模式"或"详细日志"在生产环境必须默认关闭。
- 内部代号、unreleased feature flag 不应出现在可分发的构建产物中。

### 七、下一年的形态：异步、并行、自主

Boris 明确表态："一年后的使用方式如果还跟现在一样，我反而会觉得奇怪。Agent 运行时间越来越长，越来越自主，同时跑几百上千个 Agent 早就不稀奇了。"

这指向三个趋势：
1. **异步 Agent 成为常态**——Routine、Loop、background task 取代"开 6 个终端标签来回切换"。
2. **多 Agent 编排成为标准**——Dynamic Workflows 让 Claude 编排成百上千个子 Agent 并行工作。
3. **开发者的角色变化**——从"我写代码"到"我与 Agent 对话"到"我与 Loop / Routine 对话"，未来可能是"我与 Swarm 对话"。

## 实践启示

- **不要被早期反馈误导**——AI 产品的早期 demo 价值与长期价值相关性很弱；坚持迭代 + 等待模型升级 + 沉淀 Skill 是关键。
- **建立 Self-Validating Loop**——让 Agent 自己跑测试、模拟器、computer use 验证功能真的工作，不要靠"看着对就行"。
- **把工程经验沉淀为 CLAUDE.md / Skill**——Agent 每次踩坑都应转化为可重放的代码资产，而不是单次修正。
- **从同步 Agent 升级到异步 Agent**——设置 Routine 处理"持续存在的任务"（监控、批处理、触发型响应），不要每件事都亲自启动。
- **Auto Mode 比人工形式审查更安全**——不要让用户在 99% 请求时机械点同意，把安全判断交给专门的模型 + eval 闭环。
- **坚持 Context 极简主义**——给模型最少的 system prompt 和 tools，让它自己找 context。
- **配置安全审计**——`.npmignore` / `.gitignore` / build artifact 排除是生产化必修课。
- **关注 Agent View / Remote Control**——未来 AI 编程不一定在桌面 IDE 上，远程、异步、语音可能是常态。
- **准备向"Loop / Routine / Swarm"对话转变**——开发者的核心技能会从"写代码"转向"编排 Agent 系统"。

## 关联实体

- [Boris Cherny: 从 IDE 到 Agent Console](ch04/503-agent.md)
- [Boris Cherny Interview 2026: 从 IDE 到 Agent Console](ch04/503-agent.md)
- [Boris Cherny 新访谈: 开发工具正在从 IDE 变成 Agent 控制台 v2](ch04/503-agent.md)
- [Boris Cherny 新访谈: 开发工具正在从 IDE 变成 Agent 控制台](ch04/503-agent.md)
- [Claude Code 一周年回顾 Boris+Cat 2026](ch03/073-claude-code.md)
- [OpenClaw × Boris Cherny: Agent Loop 设计模式](ch01/850-openclaw-boris-cherny-agent-loop-design-patterns.md)
- [Claude Code Prompt 源码分析](ch03/073-claude-code.md)
- [Claude Code Prompt 源码分析 fanone](ch03/073-claude-code.md)
- [Claude Code Prompt Context Harness](ch03/073-claude-code.md)
- [From Prompt to Harness: Claude 官方](ch01/380-claude.md)
- [Anthropic Prompt Caching 与 Claude Code](ch01/198-anthropic-prompt-caching-claude-code.md)
- [24h Worker Agent](ch04/503-agent.md)
- [Agent Security 三步走: Harness + Governance + Identity](ch04/310-ai.md)
- [AI Tool Poisoning Exposes a Major Flaw in Enterprise Agent Security](ch04/310-ai.md)
- [Karpathy: Software 3.0 与 vibe coding 时代的终结](ch04/503-agent.md)
- [Harness Engineering](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

---

