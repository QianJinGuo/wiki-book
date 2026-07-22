---
title: "Hermes Agent /goal 长任务运行时架构拆解：状态持久化、Judge 闭环与自主续航"
source_url: https://mp.weixin.qq.com/s/m2rYnwSzjJl2mLl3ia6hWA
author: AI 小老六
publish_date: 2026-05-19
tags: [wechat, article, hermes-agent, agent, runtime, goal, engineering]
created: 2026-05-19
sha256: 9819ead7b0dd01694b9f2b5c32eaa9556fe1643a0a8b063a8651b2e4260fc1d1
---
# Hermes Agent /goal 长任务运行时架构拆解：状态持久化、Judge 闭环与自主续航
## 核心洞察
Agent 长任务最让人烦的地方，往往不是它不会做，而是它太容易停下来。Hermes Agent v0.13.0 的 /goal 解决的不是一个"让模型更聪明"的泛问题，而是一个更具体的工程问题：怎样把一次目标变成一个可持续推进、可暂停、可恢复、可判定完成的运行时流程。
**四个关键部件**：外部状态、生命周期管理、Judge 判定、继续执行队列。合在一起，才让 Agent 从"等用户说继续"变成"知道自己还没干完"。
## 长任务瓶颈：不在 Token，而在会话记忆
当任务在同一会话里滚动几十轮，上下文变厚后，模型更容易把噪声当成线索，把未完成事项压到注意力边缘。这段质量下滑区域叫做 **Dumb Zone**。
Ralph Loop 的方向很朴素：**不要把长期记忆放在聊天记录里**。文件系统和 Git 比模型上下文更适合承载长期状态。Agent 每一轮从干净的输入开始，通过代码、文档、测试结果和提交记录接住上一轮的进展。会话可以丢，工作目录不能丢。
## /goal 本质：目标控制平面
| 运行时部件 | 负责的问题 | Hermes 中的体现 |
|-----------|-----------|----------------|
| 目标状态 | 当前要完成什么，剩余多少轮，是否暂停 | `GoalState` |
| 生命周期接口 | 目标如何开始、暂停、恢复、清理、完成 | `GoalManager` |
| 完成判定 | 最近一轮是否足够满足目标 | `judge_goal()` |
| 继续调度 | 未完成时如何触发下一轮 | CLI pending input / Gateway FIFO |
| 目标细化 | 执行中如何追加验收标准 | `/subgoal` |
**核心设计**：目标被系统外化了，后续每一轮都由运行时重新注入必要信息，Agent 不需要在聊天里"记住自己还有一个目标"。
## GoalState：把目标写进数据库
```python
@dataclass
class GoalState:
    goal: str
    status: str = "active"  # active | paused | done | cleared
    turns_used: int = 0
    max_turns: int = 20
    created_at: float = 0.0
    last_turn_at: float = 0.0
    last_verdict: Optional[str] = None
    last_reason: Optional[str] = None
    paused_reason: Optional[str] = None
    consecutive_parse_failures: int = 0
    subgoals: List[str] = field(default_factory=list)
```
**解决的问题**：
1. **跨会话持久化**：今天设置的目标，中途关掉终端，明天 `/goal resume` 接着跑
2. **执行有预算**：`max_turns` 默认 20 轮，避免目标无限循环
3. **记住失败模式**：`consecutive_parse_failures` 超过阈值自动暂停，不再烧钱
4. **目标可细化**：`subgoals` 让用户在执行过程中补充约束，不必推翻原目标重来
## GoalManager：状态机生命周期
```python
class GoalManager:
    def set(goal: str, *, max_turns: int = 20) -> GoalState
    def pause(reason: str = "user-paused") -> GoalState
    def resume(*, reset_budget: bool = True) -> GoalState
    def clear() -> None
    def mark_done(reason: str) -> None
    def add_subgoal(text: str) -> str
    def remove_subgoal(index_1based: int) -> str
    def clear_subgoals() -> int
    def evaluate_after_turn(last_response: str) -> Decision
    def status_line() -> str
    def next_continuation_prompt() -> str
```
**`paused` 态是关键缓冲层**：网络抖动、预算耗尽、用户临时插话、Judge 配置异常，都不该把目标直接判死。
## Judge 闭环：宁可多跑一轮，也别提前庆功
Judge 每轮结束后判断是否继续，只输出窄 JSON：
```json
{"done": false, "reason": "仍有测试失败，需要继续修复"}
```
**判定规则故意偏保守**——只有三类情况认为完成：
1. Agent 明确确认目标已经完成
2. 最终交付物已经产生，且能看出满足目标
3. 目标无法继续推进，需要外部输入
```python
JUDGE_SYSTEM_PROMPT = """
A goal is DONE only when:
- The response explicitly confirms the goal was completed, OR
- The response clearly shows the final deliverable was produced, OR
- The response explains the goal is unachievable / blocked / needs user input
Otherwise the goal is NOT done: CONTINUE.
"""
```
**false positive 控制原则**：误判完成的代价通常比多跑一轮更高。
## fail-open：Judge 挂了，任务不该跟着死
| 异常场景 | 处理方式 | 设计意图 |
|---------|---------|---------|
| Judge API 调用失败 | 返回 continue | 外部依赖偶发失败时不中断主任务 |
| 最近一轮响应为空 | 返回 continue | 没有足够证据时不判完成 |
| Judge 返回非 JSON | 计数并重试 | 容忍短期格式漂移 |
| 连续解析失败达到阈值 | 自动暂停 | 避免配置错误导致无意义循环 |
| 轮次预算耗尽 | 自动暂停 | 防止失控续跑 |
## CLI 与 Gateway：自动继续不能抢用户的话
用户输入始终优先于自动续跑提示。CLI 里继续提示进入 `_pending_input` 队列；Gateway 场景通过 adapter FIFO 排队。
## 与 Codex CLI / Claude Code 的差异
| 能力维度 | Hermes Agent | Codex CLI | Claude Code |
|---------|-------------|-----------|-------------|
| 目标状态 | SessionDB 持久化 | session-based | session-based |
| 子目标 | 支持 /subgoal | 未突出 | 未突出 |
| Judge 模型 | 可配置 provider/model | 固定策略 | 固定策略 |
| 多平台 | CLI + 20+ Gateway | 主要 CLI | 主要官方环境 |
| 异常处理 | fail-open + 解析失败计数 + 自动暂停 | 有继续策略 | 有继续策略 |
**真正拉开距离的是持久化**：对于跨天、跨终端、跨聊天平台的长任务，状态持久化不是加分项，而是基础设施。
## 适合 /goal 的任务 vs 不适合的
| 适合使用 /goal | 不适合使用 /goal |
|--------------|-----------------|
| 大型重构、依赖迁移、补测试 | 一两轮就能完成的小改动 |
| 安全漏洞修复、审计整改 | 需要高频人工选择的产品讨论 |
| 性能优化（有明确指标）| 目标暂时说不清的探索性研究 |
| 长时间构建、报告生成、资料整理 | 需要实时确认权限或风险的操作 |
**好目标的四要素**：任务对象 + 完成条件 + 验证方式 + 边界约束。
示例：`/goal 将 auth.ts 的用户校验逻辑迁移到 AuthService，保持现有 public API 不变；补齐空密码、过期 token、重复登录三个用例；运行 pnpm lint 和 pnpm test 全部通过后停止。`
## Judge 模型选型
Judge 模型不必昂贵，但必须稳定。可为 `goal_judge` 单独配置快速廉价模型（如 `google/gemini-3-flash-preview`），主任务模型负责写代码读文档，Judge 只做窄判定。真正需要关注的是格式稳定性。
## 总结
/goal 把 Agent 的交互单位从"回复"改成了"完成条件"。用户和 Agent 之间的契约从"回答我这一轮"变成了"持续工作，直到满足这个条件"。
它让 Agent 不再只是一轮对话里的聪明助手，而开始像一个有状态的执行进程：有目标，有预算，有暂停恢复，有完成判定，也有失败保护。这才是长程 Agent 真正需要的底座。
## 参考资料
- Hermes Agent v0.13.0 Release Notes: https://github.com/NousResearch/hermes-agent/blob/main/RELEASE_v0.13.0.md
- Claude Code /goal: https://code.claude.com/docs/en/goal
- Codex /goal: https://developers.openai.com/codex/use-cases/follow-goals