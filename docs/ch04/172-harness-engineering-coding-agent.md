# Harness Engineering：让 Coding Agent 可靠完成长程任务

## Ch04.172 Harness Engineering：让 Coding Agent 可靠完成长程任务

> 📊 Level ⭐⭐ | 12.4KB | `entities/harness-engineering-long-term-agent-tasks.md`

## 核心定义
**Harness Engineering**：为 AI Coding Agent 构建「缰绳」，使其在安全边界内被稳定地约束、引导和复用。核心目标是让 Agent 能够可靠完成涉及成百上千文件、跨越多个会话、消耗数千万 Token 量级的**长程任务**。
四大核心原则：
1. **任务拆解** — 拆成合理粒度子任务，控制单次执行复杂度
2. **并行执行** — 多 Agent 同时跑不同子任务，压缩整体耗时
3. **可续传** — File As Progress 状态持久化，消除中断沉没成本
4. **有完成条件** — 客观可程序化验证的子任务成功标准

## 三大困难点
| 困难 | 根因 | 对应原则 |
|------|------|----------|
| 上下文耗尽 | 上下文窗口有限，压缩叠加导致细节丢失 | 任务拆解 |
| 中断要重来 | Agent 无跨会话记忆，中断=从头开始 | 可续传 |
| 规模行为不可控 | 规模放大后局部失败、格式不一致 | 完成条件 |

## 关键技巧
### 任务粒度
- 经验公式：3000 行代码是一个经验上限（Claude Sonnet 200K 窗口，2-3x 工作集）
- 同目录文件尽量放同一组，利用局部上下文共享

### 子任务 CLI 化与并发调度
- 子任务作为独立 CLI 进程执行，不在 Agent 对话中嵌套调用
- `dispatch.js` 首批启动，`poll.js` 循环补位（随到随补，不等齐再发）
- 调度参数统一：`--root`/`--concurrency`/`--dry-run`/`--retry-failed`

### File As Progress
- 所有进度状态持久化到文件系统，不依赖 Agent 记忆
- 中断恢复时 Agent 只读文件，不读历史上下文

### 任务状态机
```
TODO → IN_PROGRESS → DONE | FAILED | SKIPPED
```
精细化：`TODO → ANALYZING → ANALYZED → EXECUTING → EXECUTED → VERIFYING → DONE`
关键：仅凭当前状态就能决定下一步做什么，不依赖历史回放。
IN_PROGRESS 残留处理：检查产出物完整性，而非状态本身。

### 多轮重试分层
- **内层**：会话恢复（同一 conversationId 续传）
- **中层**：带反馈重试（新会话 + 错误上下文，限 2-3 次）
- **外层**：主 Agent 重新调度（FAILED 文件重新分组）

## 真实落地案例
### 全量 Code Review
- 21 个前端模块全量审查，批量修复
- Evaluator Agent 独立校验（不同会话，消除自我说服效应）
- 进度 TSV 持久化，支持断点续传

### JS to TS 迁移
- 按依赖拓扑序排优先级（叶子文件先迁移）
- 完全程序化验证（Babel AST 对比 + tsc 类型检查）
- 局部失败不影响整体构建（TS 项目可混用 JS/TS）

## Meta-Skill：Skill for Skill
将长程任务编排经验本身做成 Skill（`long-term-task-orchestration`），教 Agent 自己生产长程任务执行框架。骨架结构：
```
<skill-name>/
├── SKILL.md                      # Phase 定义 + 会话恢复检测 + 完成标准
├── scripts/
│   ├── discover.js               # 扫描目标，生成任务清单（幂等）
│   ├── dispatch.js               # 读清单，分组，并发调度 subagent
│   ├── build-prompt.js           # 程序化构建子任务 Prompt
│   ├── poll.js                   # 轮询子任务状态 + 补位启动
│   ├── merge.js                  # 收集子任务结果，合并为最终产物
│   └── status.js                 # 查询整体进度
├── references/
│   ├── phase0_setup.md           # 环境配置指令
│   ├── phase1_analyze.md         # 分析规划指令
│   ├── phase2_dispatch.md        # 批量执行指令
│   └── phase3_finalize.md        # 收尾验证指令
└── evals/
    └── evals.json                # 评估用例
```
仓库地址：https://github.com/hixuanxuan/long-running-agent-tasks

## 核心理念
- **任务边界清晰**：子任务之间不共享状态、不交叉引用；依赖分析 → 拓扑排序；冲突 → 物理隔离（Git Worktree）
- **错误在最小范围内解决**：子任务内闭环，不将错误带到后续阶段
- **允许局部失败**：1000 个文件中 5 个失败不应阻塞其他 995 个
- **Harness 是动态边界**：随着模型能力提升，曾经需要脚本控制的环节可能被自主处理，但「确定哪些该交给模型、哪些留在框架里」的判断本身不会消失
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/harness-engineering-long-term-agent-tasks.md)

## 深度分析
### 1. 3000 行经验上限的精确推导：Token 消耗的量化拆解
文章给出了一个经验公式：3000 行代码是 Claude Sonnet 200K 窗口下单子任务的 Token 上限。这个数字背后有完整的量化推导：Prompt 模板约 1K Token；源码内容约 30K-60K Token（每行 10-20 Token）；Agent 多轮读写、推理、修复的过程约 60K-180K Token。三项相加约 90K-240K Token，给 2-3x 工作集留有余量。这一推导过程本身就是一个可迁移的方法论：任何长程任务规划前，都应先对 Token 消耗做分项估算，而非凭感觉定粒度。

### 2. CLI 化的核心价值不在并发，而在 Prompt 的确定性
将子任务从"主 Agent 对话内嵌套调用"改为"独立 CLI 进程"，通常被理解为是为了实现并发提速。但更根本的价值是消除了主 Agent 在长会话中对子任务指令的"自由发挥"——文章记录了一个具体案例：主 Agent 把"让 subagent 读文件"理解成了"把文件内容贴进 Prompt"，导致 subagent 失去了渐进式发现代码结构的机会，审查质量大幅下降。CLI 化 + `build-prompt.js` 程序化构建，从机制上杜绝了这种语义偏移，是并发之外的更关键收益。

### 3. File As Progress 的双通道设计：人机分离的恢复需求
进度状态同时写两套载体——给人看的高可扫终端摘要（数字、比例、异常），给 Agent 读的结构化状态文件（任务 ID、状态、产出路径、失败原因）。这个设计的深层逻辑是：人恢复时需要"现在跑到哪了"的直观感知；Agent 恢复时需要"从哪继续"的精确指令，两者数据结构完全异构。强行合并不仅制造冗余，还会导致 Agent 解析噪声增加。很多团队实现了持久化但忽略了双通道设计，是长程任务恢复失败的常见隐蔽原因。

### 4. IN_PROGRESS 残留处理的判断依据：产出物而非状态
Agent 在执行过程中被中断时，状态会停留在 IN_PROGRESS，但实际进程已不存在。恢复逻辑的关键不是"状态是什么"，而是"产出物是否存在且合法"。具体判断分三步：文件是否存在、内容能否通过合法性校验、内容完整则状态直接更新为 DONE，否则清理工作区（Git Worktree 的 `git worktree remove` 或 `git checkout`）后重置为 TODO。这套逻辑的精妙之处在于：Agent 不需要知道"中断时正在做什么"，只需要知道"做完没有"。

### 5. "允许局部失败"中的 DONE_WITH_WARNINGS 状态：务实工程的重要一笔
1000 个文件中 5 个处理失败，传统做法是 revert + 标记 FAILED。但文章引入了"能搞定但不完美"的第三种状态 DONE_WITH_WARNINGS：编译通过、业务逻辑未被破坏，只是留下了 `// @ts-ignore` 或少量 `any`。这种设计承认了 Agent 在复杂泛型推断等极端场景下的能力上限，避免了"99% 搞定但反复重跑"的 Token 浪费。这是 Harness 工程中"务实主义"与"完美主义"之间最具体的设计权衡。

## 实践启示
**1. 在启动任何涉及 20+ 文件的长程任务前，先跑 3-5 组样本估算实际 Token 消耗。** 估算公式：Prompt 模板 + 源码 Token（行数 × 每行 Token） + 推理消耗（源码 Token × 2-3 倍系数）。若单任务经常逼近上下文窗口 80%，应缩小粒度；若只用 30-40%，可适当放大减少调度开销。
**2. 将子任务 Prompt 构建强制 CLI 化，即使当前任务规模不需要并发。** `build-prompt.js` 程序化构建的 Prompt 比主 Agent 转述的 Prompt 更稳定，消除的不仅是 Token 浪费，更是"自由发挥"带来的隐性质量风险。当任务规模扩大需要并发时，CLI 化的基础设施已就位。
**3. 恢复逻辑必须基于产出物状态而非任务状态——这是长程任务可靠性的核心。** 具体实现：每个子任务明确定义"完成后会产出什么文件"，完成后立即写入；恢复时检查文件存在性和内容合法性，而非状态字段。Git Worktree 隔离可大幅简化半成品清理（直接丢弃 Worktree 目录）。
**4. 分层重试策略的配置建议：内层恢复会话不设上限（只kill异常进程），中层带反馈重试限制 2-3 次，外层重新调度前先分析失败原因。** 若 FAILED 文件超过总数的 5%，优先排查任务规则本身是否有问题，而非立即重跑；盲目重跑只是浪费 Token。

- [Harness Engineering - 让 Coding Agent 可靠完成长程任务](../ch05/050-harness-engineering.html)
- [Harness Engineering: 让 Coding Agent 可靠完成长程任务](../ch05/050-harness-engineering.html)
- [Agent生产级Harness工程指南](../ch05/050-harness-engineering.html)
- [Agent架构关键变化：Harness正在成为新后端](../ch05/018-harness.html)
- [Agent Harness 组件解析](../ch05/039-agent-harness.html)

## 相关实体
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](../ch01/468-claude-code-harness-deep-understanding.html)
- [AI Coding Agent 记忆系统](ch04/314-ai-coding-agent.html)
- [你不知道的 Agent 原理架构与工程实践](ch04/332-agent-principle-architecture-engineering-practice.html)
- [柚漫剧 AI 全流程提效拆解](../ch05/079-ai.html)
- [Agent Skill 设计模式](ch04/382-agent-skills.html)
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [Coding Harness 工程本质](https://github.com/QianJinGuo/wiki/blob/main/concepts/coding-harness-engineering.md)
- [Thin Harness Fat Skills](../ch05/072-thin-harness-fat-skills-ai.html)
- [Design Patterns for AI Agents 2026](ch04/094-design-patterns-for-ai-agents-2026-4-5-reflection.html)

- [两万字详解Claude Code源码核心机制](../ch03/075-claude-code.html)
- [Agent Harness 架构](../ch05/039-agent-harness.html)
- [Agent 自我改进的六条路](../ch03/045-agent.html)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](ch04/126-karpathy-vibe-coding-agentic-engineering.html)
- [Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台](../ch03/045-agent.html)
- [Harness如何支撑Agent在生产环境稳定运行？](../ch05/018-harness.html)
- [Agent架构关键变化：Harness正在成为新后端](../ch05/018-harness.html)

---

