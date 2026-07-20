# claude-apprentice v1.0：32 文件设计取舍与 5 层架构工程实现

## Ch09.072 claude-apprentice v1.0：32 文件设计取舍与 5 层架构工程实现

> 📊 Level ⭐⭐ | 9.0KB | `entities/claude-apprentice-v1.0-5-layer-arch-32-files.md`

# claude-apprentice v1.0：32 文件设计取舍与 5 层架构工程实现

> 基于造物手稿的 claude-apprentice v1.0 发布日志，深入讲解 32 个核心文件的设计取舍与背后踩坑。

## 摘要

claude-apprentice 是一个提升 Claude Code 协作效率的开源工具，其 v1.0 版本包含 32 个核心文件，按 5 层架构组织：Prompt/L1 → Context/L2 → Harness/L3 → Loop/L4 → Memory/L5。 核心设计包括 CLAUDE.md 从 200 行压缩到 53 行的知识下沉策略、PROPOSE→APPLY→SHIP→ARCHIVE 的四阶段 Spec 驱动工作流、8 条种子错题本机制，以及 6 维度代码评审体系。 该工具已在 GitHub 和 npm 公开发布，v1.1 已增加 SSOT 治理和双版本号策略。

## 核心要点

1. **5 层架构落地为 32 文件系统**：Prompt/L1（3 文件）→ Context/L2（8 文件）→ Harness/L3（11 文件）→ Loop/L4（1 文件）→ Memory/L5（1 文件）+ CLI/脚本（8 文件），Harness 层最厚
2. **CLAUDE.md 知识下沉策略**：从 200 行压缩到 53 行，子文件分层承载，CLI 加载时间降低 60%
3. **Spec 驱动工作流**：PROPOSE→APPLY→SHIP→ARCHIVE 四阶段生命周期，将软件工程的规格先行方法论引入 AI 协作
4. **错题本机制**：learned-lessons.md 以 Symptom → Root Cause → Rule 格式记录 8 条种子错题，来自 50 小时真实 Claude Code 使用
5. **6 维度代码评审**：Security(18项)/Correctness(5)/Performance(4)/Design(4)/Maintainability(6)/Convention(3)，4 档严重级别

## 深度分析

### 5 层架构的设计哲学：从"提问"到"记忆"的分层抽象

claude-apprentice 的 5 层架构是对人机协作中信息流向的系统化建模：

| 层级 | 名称 | 文件数 | 核心职责 |
|------|------|--------|---------|
| L1 | Prompt 层 | 3 | 用户提问的模板与入口 |
| L2 | Context 层 | 8 | 项目上下文与硬性规则 |
| L3 | Harness 层 | 11 | 工作流、Specs、技能封装 |
| L4 | Loop 层 | 1 | 自动循环（安全边界） |
| L5 | Memory 层 | 1 | 经验积累与错题本 |

这种分层与 [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) 中的"知识分层"思想高度一致——信息按照从易变到稳定的方向流动，上层依赖下层但不反向依赖。Harness 层（L3）最厚，体现了将最佳实践封装为可复用模组的工程追求。

### CLAUDE.md 压缩：知识下沉的量化收益

从 200→53 行的 CLAUDE.md 压缩是"少即是多"的工程实践典范：
- **加载时间降 60%**：每次 Claude Code 启动时需读取 CLAUDE.md，更短的入口文件意味着更快的响应速度
- **子文件分层承载**：将硬性规则拆到 rules/，技能定义拆到 skills/，工作流定义拆到 workflow/
- **按需加载**：Claude 仅在需要时才读取子文件，而非全部加载到上下文窗口

这一设计理念与 [Agent Harness 上下文管理](../ch05/039-agent-harness.html) 中讨论的"上下文分层"技术完全一致——通过将信息从热（高频访问）到冷（低频访问）进行分级，优化上下文窗口利用率。

### Spec 驱动工作流：软件工程方法论在 AI 协作中的落地

PROPOSE→APPLY→SHIP→ARCHIVE 四阶段生命周期将传统软件工程中的规格先行方法论引入 AI 协作：

1. **PROPOSE**：AI 提出实现方案，人类审阅并确认方向
2. **APPLY**：AI 执行具体代码变更
3. **SHIP**：代码评审通过后合并
4. **ARCHIVE**：完成任务的 spec 归档为知识积累

这种"先规格后实现"的模式避免了 AI 在方向未明确时盲目编写代码，减少了返工成本。与 [Claude Code Loop Engineering](ch09/144-claude-code-loop-engineering.html) 中的"验证-执行"循环互补。

### 错题本机制：系统化的经验积累

8 条种子错题覆盖了 Java 后端开发中的常见陷阱：

| 编号 | 主题 | 来源版本 | 类型 |
|------|------|---------|------|
| L-001 | 测试 mock 边界 | v5.2 | 测试 |
| L-002 | FOR UPDATE 锁范围 | v5.2 | 并发 |
| L-003 | 事务边界 | v5.3 | 数据一致性 |
| L-004 | 异常吞咽 | v5.3 | 错误处理 |
| L-005 | DTO/PO 混用 | v5.4 | 架构 |
| L-006 | 命名不一致 | v5.5 | 规范 |
| L-007 | 命名风格 | v5.5 | 规范 |
| L-008 | 扫描命令自指噪声 | v5.7 | 工具 |

错题本的设计借鉴了**事后复盘**（post-mortem）的工程文化，将失败转化为可复用的知识资产。这种 Symptom → Root Cause → Rule 的格式使得 AI 在遇到类似症状时可以快速匹配已知的 root cause 和修复规则。

### 6 维度代码评审：从形式到实质的多层把关

40 项评审检查项按 6 维度组织，4 档严重级别（CRITICAL/HIGH/MEDIUM/LOW），覆盖从安全问题（18 项占比最高）到编码规范的全谱系。 Security 维度占比最高（18/40），反映了安全优先的设计理念——AI 生成的代码在安全性上需要比人类代码更严格的审查。

### 与传统工具的对比定位

与 [兔兔AGI Loop Engineering](ch09/144-claude-code-loop-engineering.html) 和 [黄佳 8 关卡](../ch03/076-claude-code.html) 互补：
- Loop Engineering：方法论层面，讲"怎么做"（循环执行+验证）
- 8 关卡：企业门禁层面，讲"怎么卡"（质量门禁流程）
- **claude-apprentice**：工程实现层面，讲"具体用什么文件/工具/规则"

三者的关系类似于开发规范（方法论）→ CI 门禁（流程）→ 脚手架代码（实现）。

## 实践启示

1. **CLAUDE.md 应精简到 50-100 行**：超过 200 行的 CLAUDE.md 不仅加载慢，还会降低 Claude 对关键指令的关注度。采用"入口文件 + 子文件分层"策略，将细节下沉到专用文件中按需加载。

2. **建立团队级错题本**：将 3 个月以上的真实 Claude Code 协作经验整理为 Symptom → Root Cause → Rule 格式的错题本，新成员接入时可快速复用历史经验，减少重复踩坑。

3. **Spec 先行可减少 50%+ 返工**：在让 AI 写代码之前，先通过 PROPOSE 阶段确认实现方案——人类审阅方向和风险，AI 执行具体实现。这比"先写再看"的效率高得多。

4. **代码评审维度应安全优先**：AI 生成代码的安全风险高于人类编写的代码（AI 可能引入不安全的依赖、错误处理缺失等）。代码评审模板中 Security 检查项应至少占 40%。

5. **Harness 层是最值得投入的工程环节**：claude-apprentice 中 Harness 层（L3）11 个文件占比最高。封装为可复用的工作流、技能和规则模板，比每次都让 AI 重新"理解"上下文更高效。

6. **定期复盘更新错题本**：错题本不是一次性的——每月的复盘会议应回顾近期协作中出现的新的反模式，持续扩充错题本。L-001 到 L-008 只是一个起点。

## 相关实体

- [Claude Code Loop Engineering](ch09/144-claude-code-loop-engineering.html) — 兔兔AGI 的 Loop Engineering 方法论
- [黄佳 8 关卡](../ch03/076-claude-code.html) — 企业级 AI 代码质量门禁框架
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — 分层 Harness 工程的通用理论
- [Agent Harness 上下文管理](../ch05/039-agent-harness.html) — 上下文分层与工作集管理技术
- [OpenSpec/Solo Spec 驱动开发](../ch05/050-openspec.html) — 规格先行在 AI 开发中的应用

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-apprentice-v1.0-32-files-design-zaowushougao-2026.md)

---

