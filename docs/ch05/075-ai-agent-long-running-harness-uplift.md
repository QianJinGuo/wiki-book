# 面向复杂算法任务的 AI Agent：高德 Long-Running Harness 架构与 Uplift 模型迭代应用

> 📊 Level ⭐⭐⭐⭐ | 14.2KB

> 原文归档：[原文归档](https://mp.weixin.qq.com/s/LHPA3qlEsKOlrSsDPEnAyA)

高德信息业务中心营销算法团队构建的 **AI Agent 系统**，专注 Uplift 模型（预测"给用户发券能多撬动多少 GMV"）迭代的完整生命周期自动化。输入一句自然语言目标，1-2 天后输出训练完的模型 + AUUC 评估报告 + 审计日志，工程师介入次数 = 0。

## 一句话

**从 3-5 天人工迭代到 1-2 天无人值守，工程师投入降低 67%——通过 5 层 Long-Running Harness + 8 个 LLM Agent 协作 + 3 个核心能力（不丢进度/自审自修/企业平台适配），实现算法工程的真正自动化。**

## 五层架构

```
L5: 业务层 (Uplift 模型迭代生命周期)
L4: 多 Agent 协作层 (8 个 LLM Sub-Agents)
L3: 工具适配层 (API SDK + Playwright + 浏览器子 Agent)
L2: 长跑引擎层 (状态日志、断点续跑、任务去重)
L1: 基础设施层 (数据平台、训练平台、Git 存档)
```

## 三个核心能力

### 能力 1: 不知疲倦，不丢进度

**任务级状态持久化：** 每个有副作用的步骤都被记成一个"任务"，状态变化 (start/done/fail) 即时写入本地数据库——append-only，向 git 提交记录。

**断点续跑机制:** 一次完整迭代要 1-2 天 wall clock，中间可能 laptop 睡眠、SSO token 过期、进程被 kill -9。下次重启时系统扫一遍记录，从最近一个"已完成"的步骤继续往下跑，进行中的步骤直接用之前存的外部任务 ID 续 polling，不会重新提交浪费 GPU 配额。

**实际案例:** 跑到第 9 小时 laptop 睡眠了，第 11 小时唤醒，整个训练在云上自己跑完了——系统重启后直接用之前的训练任务 ID 拿结果继续，工程师介入次数 = 0。

### 能力 2: 能审稿自己，能修自己的错

**8 个 LLM Agent 协作:** Planner→SampleDesigner→Coder→Critic→LogTriage→Repair，通过 explicit handoff 互相交接。

**关键设计：Critic 不靠 LLM-as-judge**

学术 benchmark 报告 80% 的 Agent 实验结果是 LLM 编造的。本系统强制把"对错判断"交给 Python 解释器跑真实 assert（读数据库行数、查训练指标、读评估 CSV），任何一条 assert 失败触发 LogTriage→Repair 闭环。

**实际案例:** 美食业务源表某 JOIN key 字段 100% 为空，直接套酒店模板会得 0 行样本。Critic 跑 COUNT 发现行数严重不足直接拦下→LogTriage 查上游表口径发现该字段不适用→Repair 改 JOIN key→重跗出 7 位数行——全程无人干预。

### 能力 3: 能跟企业平台对话，卡住会等人

**双通道并行:**
- API 走 SDK
- UI-only 操作走 Playwright 自动化 + 三分浏览器子 Agent (Planner/Actor/Validator)
- 录制成功脚本按"前端版本指纹"缓存，下次直接回放；网页改版失效就重新生成

**企业治理适配:** 碰到 Agent 干不了的事（例如申请数据表权限）主动暂停，把状态标记成"等审批"，等工程师 approve 后从同一断点继续。

**实际案例:** 某次跑 OBS 子任务连续多日产出 0 行，Critic 拦下→LogTriage 定位到调度账号没读某张标签表权限（企业身份治理问题，Agent 无法自行解决）→系统暂停产出申请单→工程师审批后自动恢复。

## 完整迭代案例（时间线）

| 时间 | 事件 |
|------|------|
| T+00h | Planner 决策 sample_change，锁定 31 天观测 + 7 天 RCT |
| T+04h | 数据 DAG 跑完，产出 ~26万训练/~3万验证，Critic 通过 |
| T+09h | laptop 睡眠，状态日志标 started |
| T+11h | 唤醒，自动续接训练（已自跑 30 分钟） |
| T+12h | 训练成功，Critic 通过 |
| T+18h | SSO 过期，浏览器子 Agent 自动重登，续接 CSV 拉取 |
| T+42h | 离线仿真 AUUC 数量级提升，Planner ACCEPT |

**1 天 18 小时全程，工程师介入次数 = 0**（期间 2 次 laptop 睡眠 + 1 次 SSO 过期，全部自动恢复）。

## 整体工程指标

| 维度 | 数值 |
|------|------|
| 端到端跑通行业数 | 3 (酒店/美食/旅游), 充电就绪 |
| 端到端跑通迭代次数 | 4 |
| 单条假设迭代周期 | 1-2 天无人值守 vs 人工 3-5 天 |
| 单元测试通过率 | 16/16 (含进程崩溃续跑 + harness primitive 测试) |
| 工程师投入降低 | ~3 人天 → ~1 人天 (-67%) |

## 业界范式对齐与企业实践

### 10 个 harness primitives 实现对照

业界已经把"造 Agent 该有哪些零件"讲清楚了，真正缺的是把这套范式跑在企业生产平台上的公开案例。本系统对 10 个 primitives 做了诚实 audit。

### 企业平台典型痛点与补丁

1. **去重必须用外部任务 ID，不能用 hash:** 数据调度平台部署完成前会快照旧 SQL，必须强制 poll 等部署生效

2. **Critic 必须 grounded，不能 LLM-as-judge:** 训练平台样本量极小时会 silent failure 返回 AUC=0.0，LLM judge 会自圆其说"成功"

3. **工具层必须有 UI-only 兜底:** 训练平台代码发布只在浏览器里有，没 Open API，必须 Playwright + 三分浏览器子 Agent 补上

### Audit 驱动落地的三项能力

1. **Explicit Handoff:** 新增 `Handoff(from_agent, to_agent, reason, payload)` 数据结构，转交链路在 journal 里直接可查

2. **MCP-style Tool Registry:** `@tool(name, description, input_schema)` 装饰器自动注册到全局 registry，支持 MCP 兼容的 `tools/list` 接口

3. **Tracing Spans:** 新增 spans 表 + 开闭 API，支持 parent-child 嵌套和耗时记录，跟 OpenTelemetry / OpenAI Agents SDK tracing 接得上

## 与已有实体的关联

- [高德 Marketing AutoResearch](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gaode-marketing-autoresearch-ai-native-practice.md) — 同属营销算法团队，本文聚焦 Uplift 模型迭代自动化，对方聚焦营销决策托管
- [高德 AI 伴行架构](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gaode-ai-companion-agent-architecture.md) — 空间智能场景的 Agent 架构
- [阿里 LoongSuite Pilot 观测审计](https://github.com/QianJinGuo/wiki-public/blob/main/entities/alibaba-agent-observability-audit-loongsuite-pilot-coding-agent-blackbox-to-transparent.md) — 企业级 Agent 可观测性方案
- [Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-engineering-survey-2026.md) — 业界 harness 范式综述

## 核心论点

### test-time compute allocation per hypothesis

这套系统本质上是把过去算法工程师手工迭代的过程，转译为 **test-time compute allocation**——推理便宜，实验昂贵；让 inference 多花一些，换 experiment 少跑几遍。

### 企业 AI vs Kaggle 沙盒

会自治的 Agent 不难做；知道什么时候应该停下来等人的 Agent 才是 production-grade。企业平台不开放、规则零碎、权限分割——这些都是沙盒环境不会遇到的真实挑战。

### 从模型能力到平台接缝

"企业 LLM Agent 的下一个台阶不在模型能力，而在让模型与企业平台之间的接缝消失。"当 Critic 直接读数据库、状态日志直接绑训练任务 ID、浏览器 Agent 直接驾驶 UI——模型本身能不能 30%还是 36%拿金牌，已经不是瓶颈。

## 深度分析

### 1. Uplift 建模：长跑 harness 内的因果增量估计

Uplift 模型回答的是反事实问题——同一用户"发券 vs 不发券"的 GMV 差值。该系统把这条因果估计流水线整体嵌入 Long-Running Harness：Planner 锁定 31 天观测 + 7 天 RCT 样本，Critic 做 treatment 平衡度校验，离线仿真 AUUC 对比 online baseline 通过后才 ACCEPT。harness 不只让 agent 不丢进度，更把"实验设计—执行—度量—决策"固化成可断点续跑、可审计复算的状态机，让原本依赖工程师经验的隐性流程变成显式机器流程。

### 2. 五层架构：实验分配与效果度量的机制保障

L1 基础设施层提供实验的物理执行面（数据平台、训练平台、Git 存档）；L2 长跑引擎层用任务级 append-only 状态日志，把 1-2 天 wall clock 里的任何中断（laptop 睡眠、SSO 过期、kill -9）转成可续跑断点，并用外部任务 ID 而非 hash 去重——规避调度平台部署生效前快照旧 SQL 的重复提交。没有 L2 的持久化语义，26 万训练样本这类长任务根本无法无人值守。

### 3. 完整迭代案例：闭环自审是机制而非叙事

时间线上两次险情全部被机器消化：T+09h laptop 睡眠时该步骤停在 started 未 completed，T+11h 唤醒后凭训练任务 ID 续接已在云上自跑 30 分钟的训练；T+18h SSO 过期由浏览器子 Agent 自动重登续接 CSV 拉取。而美食业务 JOIN key 100% 为空这类"套模板必得 0 行"的静默失败，靠 Critic 的确定性 Python assert（真实 COUNT 行数）而非 LLM-as-judge 拦下，再经 LogTriage 查上游口径、Repair 改 JOIN key，重跑出 7 位数行。42 小时工程师介入 = 0 的前提，是每步判断都落在可机检的真值上。

### 4. 10 个 harness primitives：企业落地的对齐清单

业界（Anthropic 的 harness 实践文章、OpenAI Agents SDK、MCP）已定义好"造 Agent 该有哪些零件"，缺的是企业生产平台上的公开案例。本系统做了诚实 audit 并补齐三项：Explicit Handoff 把 sub-agent 转交变成 journal 里可查的数据结构；MCP-style Tool Registry 用 @tool 装饰器自动注册并暴露 tools/list；Tracing Spans 与 OpenTelemetry 接轨。范式综述见 [Agent Harness Engineering Survey 2026](https://github.com/QianJinGuo/wiki-public/blob/main/entities/agent-harness-engineering-survey-2026.md)。

### 5. test-time compute per hypothesis 与 Kaggle 沙盒的分野

原文把系统 framing 为"让 inference 多花一些，换 experiment 少跑几遍"：单条假设 1-2 天无人值守 vs 人工 3-5 天、工程师投入 -67%，本质是算法团队提前享受"2030 年推理占 AI compute 75%"的曲线。与 Kaggle 沙盒比拼单次模型能力不同，生产系统比的是"知道什么时候停下等人"——数据表权限申请这类治理动作主动暂停标记"等审批"。会自治不难，production-grade 难在自治与守规的边界。

## 实践启示

1. 每个有副作用的步骤记成 append-only 任务，去重用外部任务 ID 而非 hash——调度平台部署生效前会快照旧 SQL，重复提交会浪费 GPU 配额。
2. 自审判断交给确定性 Python assert（真实行数/训练指标/评估 CSV），不用 LLM-as-judge——样本量极小时平台会 silent failure 返回 AUC=0.0，LLM judge 会自圆其说。
3. UI-only 操作备好 Playwright + 三分浏览器子 Agent（Planner/Actor/Validator），成功脚本按"前端版本指纹"缓存回放，网页改版失效就重新生成。
4. 碰到企业治理动作（如数据表权限申请）主动暂停标记"等审批"并产出申请单，审批后从同一断点续跑——不要让 Agent 自行绕过权限。
5. 用单条假设迭代周期衡量自动化收益：1-2 天无人值守 vs 人工 3-5 天、工程师投入 -67%，比单次模型分数更接近 harness 的真实价值。

## 相关实体

- [高德路线规划双路线：mobilitybench（agent 基准）+ transitlm（端到端 rllm）](https://github.com/QianJinGuo/wiki-public/blob/main/entities/gaode-routing-dual-pathway-mobilitybench-transitlm-2026.md)

---

