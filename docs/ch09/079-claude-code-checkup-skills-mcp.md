# Claude Code /checkup 功能：清理 Skills/MCP 提升性能

## Ch09.079 Claude Code /checkup 功能：清理 Skills/MCP 提升性能

> 📊 Level ⭐⭐ | 8.6KB | `entities/claude-code-checkup-feature-boris-cherny-2026.md`

# Claude Code /checkup 功能：清理 Skills/MCP 提升性能

> **/checkup** 是 Claude Code 团队在 2026 年 7 月推出的新命令，用于对 Claude Code 环境进行全面体检（healthcheck），清理积灰的 Skills、MCP 服务器、插件和过度膨胀的 CLAUDE.md。由 Claude Code 之父 Boris Cherny 亲自宣布，旨在解决 Agent 工具生态快速膨胀带来的"配置腐烂"问题。

## 摘要

重度使用 Claude Code 的用户通常会积累大量 Skills、MCP 工具、插件和 hooks。每次开启新 session 时，所有这些配置都会被加载，其中不少已经过时或不再使用。这些"数字灰尘"不仅拖慢启动速度，还可能导致冲突和意外行为。/checkup 命令正是为了解决这一系统性问题而设计的——它扫描完整环境，识别并帮助清理冗余配置，为每个 session 省下可观的上下文空间。

## 背景

### 配置腐烂（Configuration Rot）问题

2025-2026 年间，Skills、MCP、subagents 的生态膨胀速度极快。开发者见到有用的东西就安装，安装后很快遗忘。每个人的 Claude Code 配置都在悄悄"腐烂"——过时的 Skill 定义、不再使用的 MCP 服务器连接、重复加载的大型 CLAUDE.md、相互冲突的插件配置。每个新 session 都要原封不动地加载这些冗余配置，白白消耗上下文窗口。

### Boris Cherny 的亲自验证

Boris 本人第一时间运行了 /checkup，结果令人警醒：

- `claude` 命令本身已经损坏（一次测试把启动器覆盖了）
- 38 个项目 Skills 在 2345 个 session 中一次都没被用过
- CLAUDE.md 每个 session 要白白加载约 10K tokens

清理完毕后，每个 session 能节省约 **5.5K tokens**。连 Claude Code 之父自己的安装都已经"烂成了这样"，普通用户的情况可想而知。

## 核心功能：七项体检清单

运行一次 /checkup，它会完整扫描环境配置，帮助用户执行以下七项操作：

1. **清理未使用的 Skills / MCP / 插件**：找出那些从未被使用的配置项并将其移除，释放上下文空间
2. **CLAUDE.md 去重**：将本地的 CLAUDE.md 和仓库中签入的版本做一次去重，消除重复指令
3. **拆分大型 CLAUDE.md**：将根目录中越来越大的 CLAUDE.md 拆分成嵌套的 CLAUDE.md + Skills 结构，实现按需加载
4. **停用慢速 Hooks**：识别并关闭那些每次运行都在拖累响应速度的 hooks
5. **自动升级**：将 Claude Code 升级到最新版本
6. **默认启用 Auto Mode**：不再需要每次手动确认操作
7. **智能预批准**：将那些经常被用户拒绝但实际上无害的只读命令添加到预批准列表

所有改动都会先与用户确认，不会自作主张。CLAUDE.md 的修改会保留在工作区中，用户可以先用 `git diff` 检查再提交。

## 用户实测体验

一位开发者自行测试了 /checkup，结果如下：

- 一个残留的重复安装
- 4 个从未使用过的个人 Skills
- 20 个仅在本地禁用的 Lark 系列 Skills
- 一个闲置的 WeChat MCP 连接

清理完毕后每个 session 约节省 830 tokens。相比之下，Boris 的 5.5K 节省量说明重度的配置腐烂远比表面看到的更严重。

## 深度分析

### "配置腐烂"是 Agent 原生开发环境的系统性挑战

/checkup 的诞生揭示了一个被长期忽视的问题：**Agent 原生开发环境（如 Claude Code、Codex、Cursor）缺乏传统的"系统健康管理"机制**。传统 IDE（VS Code、IntelliJ）有完善的扩展管理面板、性能分析器、设置同步等基础设施，但 Agent 开发环境目前仍处于"早期 Linux 时代"——用户手动安装、手动配置、没有系统化的健康监测。

这与 [Hermes Agent](../ch03/090-hermes-agent.html) 的"配置文件即代码"理念形成对比：Hermes 通过 profile 系统实现了配置的版本化和隔离管理，而 Claude Code 的 /checkup 则从另一个方向（自动诊断 + 清理）解决问题。两种思路本质上都是应对 Agent 工具生态膨胀的必然选择。

### 5.5K Tokens 的经济学意义

Boris 清理出的 5.5K tokens 每个 session 的价值不应被低估。在 2026 年的主流 LLM 定价下，5.5K tokens 约等于 $0.01-0.02 的推理成本。对于日活跃用户（每天 10+ 个 session），这意味着每月节省 $3-6 的直接成本，加上 session 启动速度提升和推理质量改善的间接收益。对于 Claude Code 的企业用户（数百个开发者），这种优化可以直接转化为数千美元/月的成本节省。

### 从"手动维护"到"自动健康检查"的范式转变

/checkup 代表了 Agent 工具链运维从 **reactive（被动修复）** 到 **proactive（主动预防）** 的关键转变。传统的"出了问题再查"模式在 Agent 环境中特别低效——因为配置问题通常表现为"模型行为异常"（工具调用错误、上下文溢出），用户很难将问题根源追溯到某个积灰的 Skill 或过时的 MCP 配置。自动健康检查机制让问题在变成"模型行为退化"之前就被发现和修复。

### 对 Agent 工具供应链的启示

/checkup 的能力边界也展示了 Agent 工具供应链管理的一个新方向——不仅仅是"安装和更新"，还包括"用量追踪、废弃检测、自动清理"。这类似于 npm 的 `npm audit` 或 Rust 的 `cargo audit`，但针对的是 Agent 配置生态而非代码依赖。未来可能出现标准化的 Agent 配置审计协议。

## 实践启示

1. **定期运行 /checkup**：建议每周至少运行一次 /checkup，或在新项目开始时运行。配置腐烂是渐进式的，定期检查比大规模清理更轻松。

2. **采用模块化 CLAUDE.md 设计**：避免将所有指令塞进一个 CLAUDE.md。将其拆分为多个 Skills，每个 Skills 聚焦一个职责领域，利用 Claude Code 的按需加载机制降低基线上下文消耗。

3. **追踪 MCP/Skills 的实际使用频率**：定期检查哪些工具从未被使用，果断移除。Boris 本人有 38 个 Skills 在 2345 个 session 中零使用，这个数据说明"安装后遗忘"是普遍现象。

4. **利用 Git 管理 Agent 配置**：将 CLAUDE.md、Skills 配置纳入版本控制，这样 /checkup 的改动可以方便地 review（`git diff`）和回滚。这也是 [Hermes Agent](../ch03/090-hermes-agent.html) profile 系统的核心设计思路。

5. **关注 Session 启动后提示的 Context 使用率**：如果启动后上下文使用率接近 30-40%，说明环境中有大量冗余配置，应立即运行 /checkup 诊断。

6. **企业用户应建立 Agent 配置审计制度**：在多开发者团队中，建立定期的 Agent 环境审计（检查 Skills/MCP 的使用情况和兼容性），可以避免团队间配置碎片化和冲突。

## 相关实体

- [Hermes Agent 上手](../ch03/090-hermes-agent.html)
- [ConardLi Skills 开源项目](../ch07/036-skills-7k-star.html)
- [MCP Tool Design Tradeoffs](../ch01/890-anthropic.html)
- [Agent Harness Context Management](../ch05/039-agent-harness.html)
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- Agent Tools 生态系统

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-推出-checkup-功能能给爹省钱.md)

---

