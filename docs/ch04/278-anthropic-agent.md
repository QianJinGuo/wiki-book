# Anthropic 长时运行 Agent 架构：对抗式设计 + 合同谈判 + 审美量化

## Ch04.278 Anthropic 长时运行 Agent 架构：对抗式设计 + 合同谈判 + 审美量化

> 📊 Level ⭐⭐ | 9.4KB | `entities/anthropic-long-running-agent-adversarial-architecture.md`

## 背景数据
| 指标 | 一年前（Opus 3.7）| 现在（Opus 4.6）| 提升 |
|------|------|------|------|
| 连续运行时间 | ~1 小时 | ~12 小时 | **10x** |
Claude Code 之父 Boris：一年前 Claude 连写 Bash 命令都费劲，每次任务顶多 20 分钟；现在 Claude Code 能有效运行**数天**。

## 三大失败根因
### 1. 上下文焦虑（Context）
随着 Token 消耗接近上限，模型表现出「上下文焦虑」——为了强行结束对话，会草率收尾并故意忽略技术细节。

### 2. 规划缺陷（Planning）
基础模型很难自发进行多步规划：要么一次性写完所有代码，要么执行中途突然停滞，留下无法运行的半成品。

### 3. 自我评判陷阱（Self-judgment）
模型不擅长评判自己的工作——觉得自己写出的东西看起来挺美就直接汇报"任务已完成"，哪怕逻辑根本没通。

## Agent SDK：结构化管理框架
```
[核心智能体循环] <---> [MCP 服务器工具]
        |
        +---> [子智能体委派系统]
        +---> [渐进式披露技能]
        +---> [确定性文件系统状态 / 权限]
```
关键设计：

- **渐进式披露（Progressive Disclosure）**：最初只加载技能定义，按需加载完整说明，减缓上下文窗口拥挤
- **程序化工具调用**：Agent 即时编写脚本批量处理数据，不把海量信息塞进对话背景
- **文件系统 > 模型记忆**：核心状态用本地磁盘 JSON/Markdown 持久化，比依赖上下文更可靠

## 对抗式架构（GAN-style）
参考 GAN 思路，将任务分配给三个相互独立的人格：
```
宏观规划者 ──合同谈判──> 代码生成器
      │                         │
      │                         │
      └───── 阶段性冲刺 ────────┘
                  │
                  ↓
            视觉评论家（Playwright / 隔离提示词）
```
核心洞察：

- 突破「谄媚效应」：调教严厉批评者比调教完美创作者容易得多
- **合同谈判机制**：生成器和评估器在磁盘上反复协商"什么才叫功能完成"。评估器认为有漏洞就直接拒绝签署合同。双方达成书面一致后，构建才真正开始

## 审美量化
评估器使用严格评分表（设计/原创性/工艺/功能性），并调用 Playwright 实际启动应用，像真人一样点击按钮、查看截图，对照参考网站对比。如果界面不好看，强制推倒重来。

## 案例：RetroForge（对抗架构 vs 普通循环）
| 维度 | 普通循环 | 对抗架构 |
|------|---------|---------|
| 运行时间 | 短 | **6 小时** |
| 调色板 | 颜色选择器全黑块 | **54 色复古调色板** |
| 物理引擎 | 无 | **完整物理引擎** |
| AI 集成 | 无 | **嵌套 AI 关卡助手** |
| 错误发现 | 标准流水线无法发现 | 评估器实时捕捉 |

## 5 条实战建议
1. **永远隔离评估**：不要让同一 Agent 会话审查自己的代码，必须实现有对抗压力的隔离评估循环
2. **文件系统持久化核心状态**：文本摘要压缩会引入逻辑漂移，核心状态用文件系统存储
3. **结构化交接**：通过本地磁盘存储配置细节和任务合同，新会话迅速找回状态而不重读数千行对话
4. **固化主观标准**：强迫自己写下审美评分准则，将主观品味转化为可执行操作
5. **审计原始执行记录**：像调试传统程序一样手动研究 Agent 执行日志，发现技术判断何时背离人类意图

## 深度分析
### 对抗架构的深层逻辑
GAN 风格的对抗式架构之所以有效，根本原因在于突破了「谄媚效应」——模型对自身输出的评判天然存在盲区。通过引入独立的评估器人格，生成器和评论家之间形成真正的博弈关系。合同谈判机制将这种博弈从隐式推向显式：每一阶段交接都必须有书面认可，否则流程无法推进。这种机制强迫模型直面自身缺陷，而不是用模糊的自评掩盖问题。

### 上下文管理的工程本质
渐进式披露技能表面上是一种节省 Token 的技巧，但其深层逻辑是将上下文管理从「被动压缩」转向「主动调度」。传统的上下文压缩（如摘要生成）会引入逻辑漂移——随着时间推移，压缩后的信息与原始状态逐渐偏离。渐进式披露则通过按需加载完整说明，保持信息的原始完整性。这与文件系统持久化核心状态的思路一脉相承：不要相信模型能准确总结复杂状态，要把状态外部化到可靠介质中。

### 审美量化的认识论意义
审美评分表的存在揭示了一个重要事实：主观标准一旦被显式化，就变成了可执行的约束条件。评估器拿着评分表调用 Playwright 实际运行应用，这个行为本身就是将抽象品味转化为具体技术验证的过程。关键不在于评分表本身有多精确，而在于它建立了一个人类可以介入、可以争议、可以修正的评估接口。

### 长时运行的隐性成本
从 1 小时到 12 小时的提升并非无代价。合同谈判机制要求每个阶段都要有明确的书面交付物，这意味着流程开销显著增加。在资源受限或需求简单的场景下，普通循环可能更高效。对抗架构是一种针对复杂长时任务的专项优化，而非银弹。

## 实践启示
### 何时引入对抗评估
对抗式架构适合以下场景：任务周期超过 2 小时、交付物有明确的质量标准、存在可量化的评估指标。如果任务只需 10-20 分钟就能完成，引入评估器只会增加不必要的开销。

### 文件系统持久化的边界
核心状态用文件系统存储，但不要把所有东西都往磁盘堆。对于每个任务周期内的高频中间状态，频繁的磁盘 I/O 可能成为瓶颈。合理的策略是：核心状态（任务进度、合同、关键决策）持久化到磁盘；高频中间状态保留在内存或缓存中。

### 合同谈判的粒度控制
合同不必覆盖每个微小步骤。实践中有两种策略：一是按功能模块签署大合同（如「登录功能完成」），二是按时间盒签署小合同（如「2 小时内完成 X」）。前者适合确定性高的任务，后者适合探索性强的任务。RetroForge 案例中 6 小时的运行时间暗示其采用的是大合同粒度。

### 渐进式披露的实现要点
技能定义的加载时机比加载内容更重要。最佳实践是：将技能定义为「能力承诺」而非「实现细节」——先告诉模型这个技能能做什么，等真正需要时再加载具体参数和约束。这样可以最大化上下文窗口的利用效率。

### 执行审计的最小实践
即使不构建完整的对抗架构，也可以通过记录日志获得部分收益。最小化的做法是：在每个阶段切换时，记录当前状态快照、已完成的决策、以及未解决的疑问。这样即使模型在后续会话中「失忆」，也能通过回溯日志恢复上下文。

## 关联
- [Anthropic Long Running Agent Architecture 6H Retroforge](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/anthropic-long-running-agent-architecture-6h-retroforge.md) — 原始文章存档
- `Agent Eval Wallezhang Yaml Driven Agent Evaluation Framework` — Agent 评测框架（YAML 驱动）
- `Perplexity Internal Skill Design Guide` — Perplexity 内部 Skill 设计指南（对抗压力也是核心主题）

## 相关实体
- [刚刚Opus 4.7发布，相比4.6核心变化，与Claude Code搭配最佳实践](../ch03/076-claude-code.html)
- [Anthropic puts Claude agents on a meter across its subscriptions](ch04/385-anthropic-claude-agent.html)
- [从 Anthropic 到 Google：Agent Skills 进入设计模式阶段](ch04/365-anthropic-google-agent-skills.html)
- [LBS-IntentBench — 首个真实出行隐式意图评测基准](ch04/269-lbs-intentbench.html)
- [Introducing Claude for Small Business](../ch01/028-introducing-claude-for-small-business.html)
- [Introducing Claude for Small Business](../ch01/028-introducing-claude-for-small-business.html)
- [Xero Announces Integration with Anthropic's Claude](../ch01/1286-anthropic.html)
- [Mythos for Offensive Security: XBOW's Evaluation](../ch12/030-mythos.html)
- [Anthropic 首次揭秘下一代 Claude 怎么造](../ch01/605-anthropic-claude.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/anthropic-to-share-mythos-cyber-flaw-findings-with-global-finance-watchdog-1.md)

- [Agent 原理、架构与工程实践](../ch03/046-agent.html)
- [claude opus 4.8: the system card](../ch01/1287-claude-opus-4-8.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/evaluation-benchmarks-extended.md)

---

