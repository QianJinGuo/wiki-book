# Harness Engineering - 让 Coding Agent 可靠完成长程任务

## Ch09.077 Harness Engineering - 让 Coding Agent 可靠完成长程任务

> 📊 Level ⭐⭐ | 7.5KB | `entities/harness-engineering-reliable-long-term-agent.md`

## 核心主题
Harness Engineering 方法论，让 Coding Agent 能够可靠地完成长程任务。

## 关键内容
### Harness 工程化
- **可靠性**: 长程任务的稳定执行
- **可观测性**: 任务执行过程的透明化
- **容错机制**: 异常情况的自动恢复

### 实践方法
1. **任务分解**: 长程任务的模块化拆分
2. **状态管理**: 执行状态的持久化与恢复
3. **验证机制**: 中间结果的自动验证
4. **反馈循环**: 执行过程中的自适应调整

## 深度分析
### 上下文耗尽：长程任务的根本制约
上下文窗口耗尽是 Coding Agent 面临的最本质限制。当处理文件数从 10 增加到 100，上下文中的历史信息不断累积，压缩轮次叠加，导致模型对早期上下文的理解质量持续下降。更危险的是"上下文焦虑"现象：模型感知到窗口接近上限时，会主动提前收尾、草草了事，明明还有文件未处理，却自行宣布"任务完成" 。这一问题的解决不能依赖更大的上下文窗口，而是必须通过任务拆解，让每个子任务在单次会话内完成，上下文里只保留当前任务所需信息 。

### 可续传机制：File As Progress 的设计哲学
"可续传"是长程任务区别于普通任务的核心特征。传统 Agent 架构依赖会话内记忆，一旦中断便从零开始。File As Progress 方案将所有进度状态持久化到文件系统，状态机描述每个子任务的生命周期（TODO → IN_PROGRESS → DONE/FAILED/SKIPPED），仅凭当前状态即可推导出下一步行动，无需回放历史 。恢复逻辑的关键在于 IN_PROGRESS 残留处理：通过检查产出物（文件是否存在、内容是否合法）来判断任务是"真的在跑"还是"跑到一半挂了"，而非依赖 Agent 的文本输出 。

### 并行执行与任务边界的三角权衡
任务边界的设计存在三个层次：无依赖直接并行（有冲突物理隔离）、有依赖拓扑排序。物理隔离方案（Git Worktree）中，所有子任务执行完毕后，工作区处于静止状态，Agent 面对的是一个确定的、不再变化的冲突集合，而不是多个 Agent 同时修改的竞态中实时协调，效果显著更好 。dispatch 调度架构采用"随到随补"策略，不等当前批次全部完成才启动下一批，哪个坑位空了就立刻补上新任务，使整体吞吐量最大化 。

### 多层重试：分层故障处理的成本博弈
重试策略分为三层：内层（恢复同一会话续传）、中层（带错误反馈的新会话重试）和外层（主 Agent 重新调度） 。判断走哪层的依据是产出文件状态，而非解析 Agent 文本输出。失败的局部任务不应阻塞其他任务，1000 个文件中 5 个失败不应导致其余 995 个停止合并 。两种失败需要区别处理：确实无法完成的回退人工，能搞定但不完美的可标记为 DONE_WITH_WARNINGS 照常合入 。

### 从经验到框架：Skill for Skill 的元技能路径
长程任务的编排经验被抽象为一套可复用的目录骨架（SKILL.md + scripts/ + references/ + evals/），并进一步封装为 `long-term-task-orchestration` 元技能，用于教 Agent 自动生成新的长程任务 Skill 。这是一种用 Agent 强化 Agent 的思路：不是让 Agent 做一次任务，而是让它生产能反复做这类任务的工具 。随着模型能力提升，原本需要脚本控制的环节可能逐步由模型自主处理，但"确定哪些交给模型、哪些留在框架里"这个判断本身不会消失 。

## 实践启示
1. **用 CLI 进程替代对话内嵌套调用子任务**：每个子任务作为独立 CLI 进程执行，由外部脚本（`dispatch.js`、`poll.js`）管理并发和状态。程序化构建 Prompt 消除主 Agent"转述偏差"，Token 消耗降低，且并发数量完全可控 。
2. **子任务粒度以 80% 上下文占用率为调优基准**：经验公式估算 3000 行代码是一个让单次子任务能在上下文窗口内完成的上限。检验标准是跑样本观察 Token 消耗是否经常逼近窗口 80%，频繁逼近则粒度偏粗 [^1] 。
3. **Evaluator 与执行 Agent 必须分属不同会话**：在同一会话内 Agent 的历史推理会形成"自我说服"效应，影响评价客观性。跨模型评估（如 Sonnet 执行 + GPT 评判）能引入不同视角，进一步降低偏见 。
4. **为每类长程任务建立标准 Phase 模板**：将执行经验沉淀为 Phase 定义（phase0_setup、phase1_analyze、phase2_dispatch、phase3_finalize），每个 Phase 对应独立的 reference 文件，Agent 只读当前 Phase 所需的指令，减少上下文干扰 。
5. **建立可量化的完成标准并程序化校验**：能用脚本判定的绝不交给 Agent（如 TypeScript 编译通过、构建成功、单元测试通过），程序化校验零 Token 消耗、结果完全确定、可以无限次重复执行 。

## 相关文章
- → [Agent Harness Architecture](/ch04-207-agent-harness-架构/)
- → [Qoder Skills Complete Guide](/ch07-029-qoder-skills-完全指南/)
- → Ahe Agentic Harness Engineering
---
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/harness-engineering-让-coding-agent-可靠完成长程任务.md)

## 相关实体
- [Harness Engineering：让 Coding Agent 可靠完成长程任务](/ch04-160-harness-engineering-让-coding-agent-可靠完成长程任务/)
- [Harness Engineering: 让 Coding Agent 可靠完成长程任务](/ch04-071-harness-engineering-让-coding-agent-可靠完成长程任务/)
- [Agent生产级Harness工程指南](/ch05-038-agent生产级harness工程指南/)
- [Agent架构关键变化：Harness正在成为新后端](/ch04-289-agent架构关键变化-harness正在成为新后端/)
- [Agent Harness 组件解析](/ch04-425-the-anatomy-of-an-agent-harness-解读/)
- [Cursor 复盘 Harness：模型决定能力上限，Harness 决定生产下限](/ch05-035-cursor-复盘-harness-模型决定能力上限-harness-决定生产下限/)
- MOC

---

