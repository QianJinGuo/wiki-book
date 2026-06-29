# Claude Code 安全审查的隐性盲点：Model Anchoring Bias 实证分析

## Ch01.351 Claude Code 安全审查的隐性盲点：Model Anchoring Bias 实证分析

> 📊 Level ⭐⭐ | 10.4KB | `entities/claude-code-security-review-bias-brainoverflow-2026-06.md`

## Claude Code 安全审查的隐性盲点：Model Anchoring Bias 实证分析

> 原文存档：[原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-security-review-bias-brainoverflow-2026-06.md)

## 概述

brainoverflow 2026-06-01 对 Anthropic 2026-05 发布的 Claude Code Security Guidance Plugin 进行的实证实验，揭示 AI 编码助手安全审查工具的**结构性盲点**：model anchoring bias 在 same-session 审查中显著抑制漏洞发现（Fail-open 认证问题 F1 整轮被静默），diff 范围 plugin 漏掉跨 commit 漏洞链（Write + scoped python3 组合 F3）。

## Claude Code 三种安全审查机制

| 工具 | 计划 | 审查者视角 |
|------|------|----------|
| `/security-review` | 全部 | 完整分支，同 session 或新 session（用户选择） |
| **Security guidance plugin**（2026-05 新发布） | 全部 | 当前 turn 的 git diff，新模型 context |
| Code Review | Team / Enterprise | 完整代码库，多 agent，PR 上跑独立模型 |

新 plugin 的明确设计目标：**规避 model anchoring bias**。Anthropic 文档直说：plugin 不用"写代码的那个 Claude"自评，而是"全新 context + 安全导向 prompt，从 diff 开始找问题"。

## 三个种子漏洞（按复杂度排序）

- **F1: Fail-open 认证（简单）** — `TELEGRAM_ALLOWED_USERS` 环境变量缺失时，allowlist 为空集，整个 if 跳过 → 任意 Telegram 用户通过。正确默认应是 deny-all。
- **F2: 不受限的 subprocess 权限（中等）** — `--allowedTools` 包含 `Bash(python3:*)` 无路径限制，配合 `process_notes` skill 链达任意代码执行。
- **F3: Write + scoped python3 = write-then-execute 链（困难）** — `python3:.claude/scripts/*` 看似受限，但 `Write` 权限仍开放，可写 payload 到 `.claude/scripts/` 再 python3 执行。**漏洞只在两个权限并存时存在，单独看都不危险。**

## 四个测试

| Test | 工具 | Setup | 验证 |
|------|------|-------|------|
| T1 | `/security-review` | 同 session（写代码的 session） | H1: model bias 是否压制发现？ |
| T2 | `/security-review` | 新 session，无历史 | H1 control: 冷审查者能否全捕？ |
| T3 | Security guidance plugin | `Write` + `python3:*` 同时出现在 diff | H2: 完全可见的链是否抓到？ |
| T4 | Security guidance plugin | `Write` 已存在，仅 `python3 scripts/*` 新增 | H2: 跨 commit 的链是否漏掉？ |

## 核心发现

### H1 验证（Model Bias 真实存在）

- **T1 (同 session)**: F1 Fail-open 认证 **Not surfaced** — 完全静默
- **T2 (冷 session)**: F1 检出为 **High (0.95)**

**结论**：same-session 安全审查在 model bias 下显著压制"作者已认定安全"的发现。冷启动审查者才是有效的"第二双眼睛"。

### H2 验证（Diff 范围审查的天然盲点）

- **T3** (完全可见的链): plugin 抓到部分
- **T4** (跨 commit 链): plugin **漏掉** — 看不到 `Write` 权限的前置历史，就无法识别组合风险

**结论**：diff-scoped 审查的 token 经济性决策（Opus 4.7 全代码库 review 太贵）带来固有盲点 — **任何"权限组合 + 历史 code"形成的漏洞在 diff 视角下都是不可见的**。

## 三个独有贡献

1. **H1 + H2 双假设的实验设计** — 不是单一案例，而是构造了 3 个种子漏洞 + 4 个测试 + 2 个对照的完整实验协议
2. **Fail-open 默认的安全反模式** — 揭示了"环境变量缺失 = 默认放行"这类容易被模型 bias 掩盖的语义级漏洞
3. **Diff 范围审查的固有权限组合盲点** — 提示未来 AI 安全工具需要在"成本可控"与"上下文完整"之间找新的平衡（如 sliding window、pre-existing 权限索引、cross-commit stateful review）

## 工程启示

- **安全审查要冷启动**：任何安全敏感的代码提交，**强制用新 session** 跑 `/security-review`，不要在写代码的同 session 跑
- **Plugin 只能做"新 diff 引入的回归"**：跨 commit 的累积风险必须人工审计或设计 new-tooling
- **Permission set 是攻击面**：`Write` + 任意 `Bash(scope)` 的组合在 N+1 个 commit 后都可能形成可利用链 — `--allowedTools` 应作为 SAST 扫描的目标

## 相关主题

- Anthropic Claude Code Security Plugin (pending entity)（待建）
- LLM 安全审计 (pending concept)（待建）
- Agent Harness Security (pending concept)（待建）

## 深度分析

**Model anchoring bias 是同 session 审查的结构性缺陷，非参数问题。** T1 vs T2 的对照揭示了一个深刻事实：当 Claude 在同一 session 中既写代码又审代码时，它会把对话历史中每一个设计决策当作已验证的前提，而不是质疑对象。Fail-open 认证漏洞（F1）在 same-session 审查中被完全静默，不是因为"它没看到"，而是因为"它认为既然 spec 说了 allowlist，那就应该工作"——这是 session context 塑造的语义信任，而非模型能力问题。这意味着 model anchoring bias 不能通过增大模型或改进 prompt 来解决，必须从架构上切断写代码和审代码的上下文共享。

**Diff-scoped 审查的本质是 token 经济性决策，固化了上下文边界。** T3/T4 的结果揭示了 plugin 设计背后的隐性 tradeoff：Opus 4.7 全代码库 review 太贵，所以只审 diff。但"当前 turn 的 git diff"意味着跨 commit 的权限组合在时间维度上不可见。Write + scoped python3 组合（F3）单独看都是"合理硬化"，放在一起才是漏洞。Diff 视角把两个时间点上的决策解耦了，导致跨越时间的漏洞链在单次审查中永远不可见。这个问题无法通过改进 prompt 或增大模型解决，需要跨时间的 stateful 审查机制。

**Fail-open 默认值是语义级漏洞，被模型 bias 掩盖的典型模式。** F1 的核心问题不是"allowlist 为空"这个状态，而是环境变量缺失时系统的默认行为是"allow-all"而非"deny-all"。这类漏洞在传统代码审计中靠约定和 linter 捕获，但在 AI 辅助编程中，因为模型的"理解意图" bias，即使冷 session 也要到 0.95 confidence 才肯报出 High——说明语义级安全假设的验证比表面看起来更难自动化。

**H1+H2 双假设实验设计是 AI 安全工具评估的方法论范式。** 论文的贡献不只是发现了两个 blind spot，而是一套可复用的实验协议：构造多复杂度种子漏洞 → 双假设对照 → 分层验证。这套方法比单一案例测试更能揭示工具的结构性局限。对 AI 安全工具的评估应该标准化：不止测"能发现什么"，更要测"在哪些场景下会系统性失效"。

**Vibe coding 会放大 model anchoring bias 的破坏力。** 当用户依赖 vibe coding 快速产出代码时，设计决策的推理链全部在模型 context 中内化——这意味着 subsequent security review 面临的是"已被自我验证的决策历史"。实验中最有意思的 side observation：commit message 中命名被移除的权限，Claude 直接读出了 restore 路径——模型读到的所有上下文都在 shaping 它的输出，包括你认为是"元数据"的部分。这个发现对 vibe coding 安全审计的启示是：凡是被模型在生成时读到的东西，都可能在审查时被误认为指令。

## 实践启示
- **安全审查必须冷启动**：任何安全敏感的代码提交，强制用新 session 跑 `/security-review`，禁止在写代码的同 session 跑。Anthropic 应在 tool 层面内置 session 历史检测并警告，而非依赖用户已知。Session hooks 是短期可实现的工程解法。
- **Plugin 只适合单 commit 新引入回归**：跨 commit 的累积风险必须走全代码库 review 或人工审计，diff-scoped 工具对组合型漏洞链不可见。
- **Permission set 是攻击面**：`Write` + 任意 `Bash(scope)` 的组合在 N+1 个 commit 后都可能形成可利用链，`--allowedTools` 应作为 SAST 扫描的目标，而非仅在运行时检查。
- **H1+H2 双假设实验设计值得标准化**：评估任何 AI 安全工具时，不仅测"能发现什么"，更要设计"哪些场景下会系统性失效"的对照实验。
- **完全自主化代码审查无法替代人类判断**：AI 安全工具扩展了审查范围，但最有效的使用方式是"理解工具能看见什么 + 主动寻找工具看不见的"。Trust and verify。

---

