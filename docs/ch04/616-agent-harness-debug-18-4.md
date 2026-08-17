# Agent Harness 开始自动修复：系统级 Debug 最高提升 18.4 点

## Ch04.616 Agent Harness 开始自动修复：系统级 Debug 最高提升 18.4 点

> 📊 Level ⭐⭐ | 5.7KB | `entities/agent-harness-auto-repair-debug-184.md`

# Agent Harness 开始自动修复：系统级 Debug 最高提升 18.4 点

很多 LLM agent 的失败看起来像是模型没想明白：工具调错了、上下文漏了、答案提前交了。但在复杂任务里，问题往往不在模型本身，而在模型外部的 agent harness——执行环境、工具接口、上下文与记忆、生命周期编排、可观测性、验证与治理策略共同决定了模型每一步能看到什么、能做什么、何时停止。论文 *From Failed Trajectories to Reliable LLM Agents* 提出的 HarnessFix，核心判断是失败轨迹不应只被当作打分反馈，而应被当作结构化证据，用来定位哪一步失败、哪段 harness 机制造成了失败、应该用多大范围的修改去修复它。

作者在 GAIA、SWE-Bench Verified、AppWorld 和 Terminal-Bench 2.0 Verified 四个 benchmark 上评估 HarnessFix，报告相对初始 harness 的提升为 6.3 到 18.4 个百分点，平均比 human-designed harness 高 6.3 个百分点，也比自动 self-evolution/repair baseline 高 6.9 个百分点。

## 为什么只改 prompt 不够：harness 的 7 层职责

agent 系统的行为在运行时由 prompt、工具描述、检索上下文、控制器、验证器和环境反馈共同塑造，一次失败轨迹里模型消息、工具调用、环境观察和中间状态交织，很难直接对应到某个 prompt 模板或编排代码。动机研究分析了 30 个流行开源 LLM agent 仓库和约 57,780 条开发记录，其中 26,174 条（45.3%）被归为 harness 相关，覆盖 Execution、Tool Interface、Context/Memory、Lifecycle、Observability、Verification 和 Governance 共 7 层职责，其中 Lifecycle、Tool Interface 和 Observability 几乎出现在全部 30 个仓库中。这解释了为什么 outcome-driven 的自进化方法容易改得过宽——只看最终成功率，未必知道失败证据在哪里，更未必知道该改工具接口、上下文构造、完成条件还是验证脚本。

## HTIR：把轨迹变成可归因证据

HarnessFix 的第一步是构造 Harness-aware Trace Intermediate Representation（HTIR）：把轨迹拆成 TraceStep（保存请求/响应消息、角色、执行状态及对外部 artifact 的影响），重建 TraceLink（数据流链接和控制流链接），并建立 implementation anchor——把可疑 runtime step 锚定到可编辑的 harness artifact（prompt 模板、工具规范、适配器、控制器、日志钩子或验证脚本），让失败归因从「这次执行错了」推进到「应该修哪类机制」。以 AppWorld 为例，工具文档要求 user_email 但请求省略该字段、API 返回 success 却无预期状态变化、completion guard 仍允许 finalization——HTIR 把数据流、控制流和缺失的副作用串起来，诊断指向具体的 harness 缺陷。

## 从 flaw record 到有边界的修复

修复阶段并不让 agent 自由编辑整个仓库，而是把多条失败轨迹中反复出现的诊断合并成 flaw record，再映射到 scoped repair operators：Tool Interface 层对应 tool-schema narrowing、argument validation、error-message repair；Lifecycle 层对应 loop guarding、verification-gated finalization；Verification 层对应 expected/actual state comparison、effect-evidence completion guarding 等。修复 specification 明确目标、可编辑 artifact、禁止触碰的范围和必须满足的行为，validation agent 检查补丁是否在范围内、是否降低目标 flaw 出现频率、是否引入不可接受回归。对跨 prompt、工具、状态和验证逻辑的系统，「先诊断、再限域修复」的顺序比盲目搜索更稳。

## 实验结果与边界

诊断质量支持上述解释：Full HTIR 在人工标注诊断集上达到 85.0% step accuracy、83.8% cause accuracy、81.3% implementation anchor accuracy 和 86.2% harness-layer macro-F1，raw trace 对应指标只有 55.0%、53.8%、50.0%、58.4%。消融实验显示 prompt-only repair、去掉 trace-grounded diagnosis、去掉 scoped repair operators 都会降低表现；跨模型迁移实验中，用 GPT-5 mini 修好的 GAIA harness 在 Claude Sonnet 4.5、DeepSeek V3.2、Qwen3.5 Plus 和 Gemini 3 Pro 上仍带来 5.5 到 9.5 个百分点提升，说明部分修复针对的是模型共享的 harness 机制。边界在于：它依赖可获得的轨迹、可定位的 harness artifact 和可执行的验证集——缺乏可观测性或没有可靠回归检查时，修复质量会受限。

## 相关实体

- [Agent 自改进闭环](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-self-improvement-loops.md)
- [Agent 可观测性](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-observability.md)
- [Agent Harness 生产可观测性](../ch05/042-agent-harness.html)
- [Harness 工程框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)
- [评测 Harness 设计](https://github.com/QianJinGuo/wiki/blob/main/concepts/evaluation-harness-design.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agent-harness开始自动修复系统级debug最高提升184点.md)

---

