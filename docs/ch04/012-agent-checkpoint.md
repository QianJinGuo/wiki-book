# Agent 长程任务断点续传：框架层 Checkpoint + 上层调度跨进程恢复

> 📊 Level ⭐⭐⭐ | 5.3KB | `entities/agent-long-task-intentional-resume-taobao-live-2026-09.md`

淘天集团-直播技术团队（绍清）基于 Spring AI Alibaba（SAA 1.1.2.0）的长程任务断点续传完整实践。方案采用"框架层 Checkpoint + 上层任务调度"两层架构，**不改框架源码**（公共依赖，改源码=维护私有 fork 升级成本极高），通过扩展 InterruptableAction + Hook 注入自定义逻辑实现进程内状态保存恢复，上层调度通过 MQ 摘流 + 任务表协调跨进程恢复。

## 三层中断场景

**用户主动中断**和**工具执行中断**属协作式中断（框架 Hook 在节点执行前后检测并保存 Checkpoint）；**系统级中断**属非协作式中断（上层调度配合 MQ 消息队列协调恢复）。恢复策略差异化：人机交互由用户触发（可见可控）、A2A 多 Agent 协同系统自动恢复、长程任务需断点续传。

对比蓝绿发布+摘流等待方案（避免中断而非恢复，长程任务时间不可控、发布周期受限、非发布场景无法覆盖）→ 选应用层断点续传覆盖更多场景更低成本。

## 框架层 Checkpoint 利用

SAA 每节点正常执行完毕自动保存 Checkpoint（不保存 __END__ 和异常场景）。恢复由 GraphRunnerContext 构造函数自动触发：metadata 检测到 checkPointId/HUMAN_FEEDBACK → initializeFromResume 从 BaseCheckpointSaver 恢复整体状态+nextNodeId+resumeFrom，通过 RunnableConfig.threadId 关联无需额外传 ID。

**关键注入点**：
- **GraphEnvironmentMonitor 关机检测**：下线脚本先 HTTP /check/shutdown/signal 置共享变量，Agent 当前节点完成后检测到触发中断保存 Checkpoint。
- **ResumeMessageOrderHook 修消息顺序 bug**：恢复时用户新消息被插入第一条致上下文错乱（框架 bug #4662 已社区修复），旧版本在 BEFORE_MODEL 拦截把 pendingUserMessage 追加到消息列表末尾，UpdatePolicy.REPLACE 返回。
- **多工具调用 Mock 返回**：模型返回多个工具 SAA 在 for 循环顺序执行中间不保存 Checkpoint（toolA 完 toolB 崩则三个全重跑，AgentToolNode 内置恢复能力无法利用）。折中：ToolRecordInterceptor 检测中断时未执行工具返回 mock（status=error）经 Checkpoint 保存，恢复时已完成不重复、mock 的重新执行。
- **HumanInterventionException 中断跳过**：工具需中断（权限/HITL）时抛异常，ObservationInterceptor 捕获设中断标记+SSE 通知+返回 mock；后续工具检测到标记直接跳过。支持权限不足/表单填写/对话框确认三场景。
- **子图会话 ID 后缀修复**：SAA 嵌套子图自动为 threadId 加 _subgraph 后缀（同 CheckpointSaver 时触发）致中断/恢复/日志不一致。解决：CheckpointAgentHook 把原始 threadId 记入 metadata，统一 ITool.getActualThreadId() 获取（优先级 ACTUAL_THREAD_ID→conversationId）。

## 上层调度跨进程恢复

框架层只解决进程内状态，无法处理重启/机器下线强制终止。**任务表**（agent_task）记录复杂长程任务请求信息（Agent 类型/业务关联键/会话 ID）+关键用户数据；简单单轮交互直接依赖框架层 Checkpoint 即可。**MQ 摘流**：应用回调下线脚本先摘流 MQ 再停止应用，offline_mq() 调 MQ 客户端 /mq-client/allConsumersOffline 将本实例消费者下线，防止即将关机机器消费新恢复任务变孤儿；摘流后已消费未执行消息（状态 WORKING）由新实例 MQ 重新消费触发恢复。恢复流程：读 DB 状态→从 Checkpoint 恢复框架状态→从中断节点继续执行。

## 与主播 Agent Harness 的关系
这是 [主播 Agent Harness 六元组](https://github.com/QianJinGuo/wiki-public/blob/main/entities/taobao-live-anchor-agent-harness-engineering-2026.md) 中"长程可中断要恢复"维度的独立深化专题：主播实体侧重 DAG PlanEngine 三层 Checkpoint（每轮/每子任务/计划变更），本文侧重 SAA 框架层 Checkpoint 深度利用 + 上层调度跨进程恢复的完整工程方法（覆盖系统重启/机器下线场景），两者互补。

## 相关实体
- [主播 Agent Harness 工程（六元组 + DAG PlanEngine）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/taobao-live-anchor-agent-harness-engineering-2026.md)
- [Agent Harness 生产可观测](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-observability-production.md)
- [DSH 实践指南（Harness 插件化）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-plan-x-deepseek-harness-dsh-practice-guide.md)

---

