# Harness Engineering: 让 Coding Agent 可靠完成长程任务

> 📊 Level ⭐⭐⭐ | 9.8KB | `entities/harness-engineering-让-coding-agent-可靠完成长程任务.md`

## 摘要
本文从实际落地经验出发，系统阐述了 Harness Engineering（缰绳工程）在 Coding Agent 长程任务中的应用。文章识别出长程任务的三大核心困难——上下文耗尽、中断无法恢复、规模放大后行为不可控，并围绕效果、速度、成本三个维度提出了任务拆解、并行执行、File As Progress 状态持久化、多层重试等核心设计原则。

最终，作者将这套编排经验沉淀为 `long-term-task-orchestration` meta-skill，实现了"用 Agent 生产能反复做长程任务的工具"，工程师只需自然语言描述任务目标即可自动生成完整的执行框架。

## 核心要点
- **长程任务的三大特征**：规模大（成百上千文件）、运行时间长（跨多个会话）、Token 消耗极高（几千万到上亿级别）
- **上下文耗尽**是根本性问题：模型上下文窗口有限，上下文压缩会逐轮丢失信息，Agent 在长会话中会出现"上下文焦虑"导致提前收尾
- **四大核心原则**：任务拆解（解决上下文耗尽）、并行执行（解决速度）、可续传（解决中断重来）、有完成条件（解决行为不可控）
- **子任务 CLI 化**是关键设计：每个子任务作为独立 CLI 进程执行，保证 Prompt 确定性、消除上下文累积、并发数量可控
- **File As Progress** 是最核心的设计：所有进度状态持久化到文件系统，中断后只需读文件就能从断点续传
- **状态机设计遵循自描述性**：仅凭当前状态就能决定下一步做什么，不需要回放历史
- **多轮重试分三层**：内层恢复会话（续传）、中层带反馈重试（针对性修复）、外层主 Agent 决策是否重新 dispatch
- **meta-skill 实现 Skill for Skill**：将长程任务编排经验本身做成可复用的元技能，让 Agent 自动生成新的长程任务 Skill

## 深度分析

### 任务边界设计：三种依赖模式的应对策略
任务边界清晰是长程任务可独立执行的前提。文章根据任务间关系的不同，给出了三种边界实现方式：无依赖的直接并行、有依赖的拓扑排序、有冲突的物理隔离。

对于有冲突的情况，推荐使用 Git Worktree 物理隔离，让每个子任务在独立工作区操作，冲突推迟到合并阶段处理。关键洞察是：在静止状态上解冲突（所有子任务完成后）效果远好于在多个 Agent 同时修改的竞态中实时协调。Agent Teams 的网状协作结构是最后选项，因为通信开销和不确定性显著。

### CLI 化子任务设计：Prompt 确定性与 Token 效率
子任务不在 Agent 对话里嵌套调用，而是作为独立 CLI 进程执行。每个子任务是一次独立的 Agent 会话，由 `build-prompt.js` 脚本程序化组装 Prompt。

这一设计解决了主 Agent "自由发挥"导致的 Prompt 失真问题。文章举例：主 Agent 会把文件内容全部贴入 Prompt 而非让 subAgent 自己读文件，导致 subAgent 失去渐进式发现代码结构的机会，审查效果打折扣。CLI 化同时消除了主会话中前 29 个子任务对话历史的累积浪费。

### File As Progress 与状态机的精密配合
File As Progress 是长程任务编排中最核心的设计——所有进度状态持久化到文件系统，不依赖 Agent 记忆。每完成一步操作立即写入文件，不攒批，因为 Agent 随时可能被中断。

状态机设计遵循"仅凭当前状态就能决定下一步做什么"的自描述性原则。文章以 JS to TS 迁移为例展示了细粒度状态的价值：`ANALYZING → ANALYZED → EXECUTING → EXECUTED → VERIFYING → DONE`，每多一个状态就多一个可精确恢复的断点。同时强调状态不是越多越好——10 秒跑完的子任务，TODO/DONE/FAILED 三个状态就足够了。

### 多层重试策略：分层失败处理的工程实践
失败处理采用三层结构，每层有明确的判断依据和停止边界。内层通过 `conversationId` 恢复会话实现续传；中层开新会话带错误信息针对性修复（限制 2-3 次）；外层由主 Agent 决策是否重新 dispatch。

关键设计原则是：判断走哪层，看产出文件的状态，不依赖解析 Agent 的文本输出。文件是否存在、内容是否合法，是稳定的、可程序化检查的依据。同时需区分"确实失败"与"不完美的通过"——99% 搞定的文件不应被反复重跑浪费 Token。

### 调度架构：随到随补与双通道输出
dispatch 架构由 `dispatch.js`（首批启动）和 `poll.js`（监控补位）分阶段协作。核心调度策略是"随到随补"——哪个坑位空了就立刻补上新任务，不等齐再发。

输出设计采用双通道：终端输出给人看（简洁可扫视的进度概览），结构化完整状态写到文件给 Agent 读。这一设计同时满足了工程师的实时监控需求和 Agent 的恢复需求。

## 实践启示
1. **任务粒度设计应综合三个因素**：模型上下文窗口大小（Claude Sonnet 有效窗口约 200K Token）、单个文件平均规模（代码文件约 10-20 Token/行）、任务推理复杂度（理解代码意图比简单改写消耗更高）。跑样本检验子任务 Token 消耗是否逼近上下文窗口 80%，逼近则偏粗，低于 30% 则可放大。同目录文件应尽量放在一起处理，因为它们共享 import 和类型依赖。
2. **Evaluator Agent 必须与执行 Agent 隔离会话**。同一会话内 Agent 的历史推理过程会形成"自我说服"效应，倾向于认为自己之前的产出正确。跨模型评估（如 Sonnet 做 Code Review，GPT 做置信度判断 Grader）能引入不同视角进一步降低偏见。Evaluator 的 Prompt 要带有挑战性语气，主动挑毛病而非寻找优点。
3. **区分"确实失败"与"不完美的通过"两种情形**。编译通过且业务逻辑未被破坏但未达到 100% 理想状态（如 TS strict 迁移留下少量 `// @ts-ignore`），应标记为 DONE_WITH_WARNINGS 照常合入，而非 revert 整个文件标记 FAILED。后者会导致大量"99% 搞定"的文件被反复重跑浪费 Token。
4. **利用 meta-skill 自动生成 Long Term Task Skill 骨架**。当任务类型是"对大量同类目标执行相同操作并逐个验证结果"时，用 `long-term-task-orchestration` meta-skill 自动生成 Phase 设计、scripts 目录、状态管理和恢复逻辑，工程师只需用自然语言描述任务目标。
5. **并发数应设计为可动态调整的参数**。通过 `--concurrency` 参数控制，资源充裕时开 10 路并发，资源紧张或遇到 API 限流时降到 3 路。而非在对话内让 Agent 自己决定并发数（模型往往过于谨慎）。
6. **IN_PROGRESS 状态的残留处理需要特别注意**。Agent 中断后状态停留在 IN_PROGRESS 但实际无 Agent 处理。恢复时需检查产出文件是否存在且合法，若通过则更新为 DONE；若不存在或不合法则清理工作区（推荐用 `git worktree remove`）并重置为 TODO。

## 相关实体
- [Harness Engineering耗时一周我是如何将应用的Ai Coding率提升至90的](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering耗时一周我是如何将应用的ai-coding率提升至90的.md)
- [Anthropic 官方 Agent Harness 平台Claude Managed Agents 完整指南](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-官方-agent-harness-平台claude-managed-agents-完整指南.md)
- [Agent架构关键变化Harness正在成为新后端](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent架构关键变化harness正在成为新后端.md)
- [Harness Engineering Reliable Long Term Agent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/harness-engineering-reliable-long-term-agent.md)
- [Huggingface Ai Agent Glossary Model Scaffolding Harness Tool Skill Subagent](https://github.com/QianJinGuo/wiki-public/blob/main/entities/huggingface-ai-agent-glossary-model-scaffolding-harness-tool-skill-subagent.md)
- [Agent Harness Context Management Working Set](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-context-management-working-set.md)

→ [原文存档](https://mp.weixi)

---

