# Agent Loop 架构三层模型：Loop + Skill + Orchestrator

## Ch07.047 Agent Loop 架构三层模型：Loop + Skill + Orchestrator

> 📊 Level ⭐⭐ | 7.7KB | `entities/inngest-cto-agent-loop-architecture-three-layers-2026-06-27.md`

> → [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/inngest-cto-agent-loop-architecture-three-layers-2026-06-27.md)

## 核心命题

所有人都在问"loop 到底是什么"，但很少有人追问：这个 loop 到底运行在哪里？

耐久性不只是 loop 的一个属性，它属于支撑 loop 的整个执行层。要构建 agent loop 架构，耐久编排是基础。

## 三层架构

### 第一层：Loop = cron + 决策者

loop 按计划或触发器运行，评估状态，决定下一步。cron 是心跳，LLM 是决策者，步骤是耐久执行层用来 checkpoint 进度。

```typescript
export const infraHealthCheck = inngest.createFunction(
  { id: "infra-health-check" },
  { cron: "*/30 * * * *" },
  async ({ step }) => {
    const metrics = await step.run("fetch-service-metrics", async () => {
      return await fetchServiceMetrics();
    });
    const assessment = await step.run("assess-health", async () => {
      return await callLLM({ prompt: `...${JSON.stringify(metrics)}` });
    });
    if (assessment.status === "degraded" || assessment.status === "critical") {
      await step.invoke("triage-incident", { function: incidentTriage, data: { metrics, assessment } });
    }
  }
);
```

### 第二层：Skill = 耐久 workflow

skill 不是提示词，是耐久 workflow。它可以有多个步骤、可以重试、可以组合、也可以独立部署。Van Horn 说："loop 是管道，它调用的 skill 才是资产。"

每一层系统每学会一个新 skill，每个 loop 的能力都会增强——这是复利。

### 第三层：Orchestrator = 执行引擎

orchestrator 运行一切：调度 cron、执行步骤、管理重试、执行并发限制、存储运行历史、热部署新 function。

大多数人把 agent 理解成"LLM + tools"。三层架构把它重新表述为"loops + skills + orchestration"。LLM 和 tools 在 loop 内部，可以替换或调整，架构保持不变。

## 耐久执行六要素

| 需求 | 含义 | while loop 为什么不行 |
|------|------|---------------------|
| Independent step retry | 第 3 个 step 失败只重试第 3 个 | loop 重启从头执行所有内容 |
| Sub-agent lifecycle | 创建子任务等几小时，父取消子也取消 | 没有父子生命周期管理 |
| Guaranteed event delivery | agent 下线时的 event 恢复后也处理 | 进程不运行时 event 丢失 |
| Post-hoc observability | 事后看到每个 step/决策/重试 | 只依赖短暂日志 |
| Hot-deploy without downtime | 部署新版本不杀运行中的任务 | 进程重启杀所有任务 |
| Concurrency control | 限制某 skill 同时最多 N 个实例 | 没有内置并发原语 |

"放进容器里跑"只能给你 uptime，不能给你正确性。容器崩溃后重启，所有进行中的 loop 都从头开始。

## 自建 Skill 的 Agent

agent 不只是运行在 loop 里，它会编写新的 loop 并注册到编排引擎。每个部署后的 function 都是一个耐久 skill——这就是 **orchestration-aware agent**。

完整流程：
1. **人提需求**——"服务总在夜里出现延迟尖峰，没人注意到"
2. **agent 编写 skill**——两个多步骤 function：health check loop + incident triage skill
3. **agent 部署**——sidecar 进程拾取，新 function 自动注册，立即上线
4. **skill 自主运行**——每 30 分钟触发，没有人在 loop 里
5. **agent 基于信号迭代**——独立 review loop 读取运行历史，评估表现，更新 skill

关键洞察：**agent 是短暂的，它的产物是耐久的。** 杀掉 agent 进程再重启，skill 继续运行。替换底层模型，skill 继续运行。

## step 级 checkpoint 的双重价值

1. **正确性**——恢复时从上一个成功步骤继续，不从头开始
2. **省钱**——LLM 调用可以被 checkpoint，避免重复调用。乘以系统里 10-30 个 agent，开销很快上去

## 复利 Loop

引用 Satya Nadella：护城河不是模型，而是 loop。两类资本——人力资本和 token capital——会一起复利。

- 每个耐久 skill = 被编码成可执行基础设施的组织知识
- review loop = 爬坡机器，不是 deck 里的飞轮图
- 如果 skill 在进程重启后就死掉，复利会归零
- 耐久 function 不关心是哪一个 LLM 在调用它

## 可观测性 = 信任层

当写代码的不是人时，可观测性不是锦上添花，而是信任层。

每个 `step.run()` 都是 checkpoint，每个 checkpoint 都可观测。开发者需要能看到 agent 部署了什么、调试哪里坏了、审计凌晨 3 点运行了什么。

## Loop 在哪里断裂

Van Horn 框架 Stage 5 的五个挑战：

- 监督其他 loop 的 loop
- 按计划运行，不只由人触发
- 能在进程重启/部署/崩溃后继续运行
- 能创建 sub-agent 并等待几小时
- 事后可观测

这不是提示词问题，这是基础设施问题。

## 与现有知识的关联

- [Inngest 产品概述](ch04/069-ai.md)——本文是 CTO 的架构愿景，产品概述侧重功能特性
- [Loop Engineering (Addy Osmani)](ch05/006-loop-engineering.md)——Osmani 拆解 loop 内部构成模块，本文把 loop 放进耐久执行层
- [Loop Engineering 反馈控制系统](ch05/006-loop-engineering.md)——反馈控制的前提是耐久执行层提供可靠 checkpoint
- [Agent Loop 工程手册](ch01/216-0.md)——8 问框架与本文三层模型互补
- [Harness Engineering 框架](ch05/085-harness.md)——三层中 Orchestrator 层对应 Harness 的运行时职责
- [Self-Harness](ch04/069-ai.md)——自建 Skill agent 是 Self-Harness 的工程实现路径
- [Agentic Environment Engineering](ch01/216-0.md)——Environment 决定反馈质量，Orchestrator 决定执行耐久性

---

