# 面向复杂算法任务的 AI Agent：高德 Long-Running Harness 架构与 Uplift 模型迭代应用

## Ch05.047 面向复杂算法任务的 AI Agent：高德 Long-Running Harness 架构与 Uplift 模型迭代应用

> 📊 Level ⭐⭐ | 10.5KB | `entities/gaode-uplift-model-iteration-agent-harness.md`

> 原文归档：[原文归档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/gaode-uplift-model-iteration-agent-long-running-harness.md)

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

- [高德 Marketing AutoResearch](../ch04-078-高德-marketing-autoresearch-营销增长-ai-native-经营托管框架) — 同属营销算法团队，本文聚焦 Uplift 模型迭代自动化，对方聚焦营销决策托管
- [高德 AI 伴行架构](../ch04-044-ai伴行技术解析-基于空间智能的高可用agent架构实践) — 空间智能场景的 Agent 架构
- [阿里 LoongSuite Pilot 观测审计](../ch09-005-让-coding-agent-从黑盒到透明-阿里云-agent-观测审计数据采集实践-loongsuite-pilot) — 企业级 Agent 可观测性方案
- [Agent Harness Engineering Survey 2026](../ch04-069-agent-harness-engineering-a-survey) — 业界 harness 范式综述

## 核心论点

### test-time compute allocation per hypothesis

这套系统本质上是把过去算法工程师手工迭代的过程，转译为 **test-time compute allocation**——推理便宜，实验昂贵；让 inference 多花一些，换 experiment 少跑几遍。

### 企业 AI vs Kaggle 沙盒

会自治的 Agent 不难做；知道什么时候应该停下来等人的 Agent 才是 production-grade。企业平台不开放、规则零碎、权限分割——这些都是沙盒环境不会遇到的真实挑战。

### 从模型能力到平台接缝

"企业 LLM Agent 的下一个台阶不在模型能力，而在让模型与企业平台之间的接缝消失。"当 Critic 直接读数据库、状态日志直接绑训练任务 ID、浏览器 Agent 直接驾驶 UI——模型本身能不能 30%还是 36%拿金牌，已经不是瓶颈。

## 深度分析

### 1. Uplift Model + Agent Harness 的结合
高德将 uplift model（因果推断中的增量效应模型）与 agent harness 结合——harness 控制实验分配和效果度量，uplift model 评估干预的因果效应。

### 2. 从 A/B 测试到 uplift model
传统 A/B 测试只看平均效应，uplift model 看个体层面的增量效应——对 agent 系统的个性化优化尤其重要。

### 3. Harness 作为实验基础设施
Agent harness 不只控制行为，还作为实验基础设施——控制变量、分配实验组、度量效果。

## 实践启示

### 1. Agent 优化：从平均效应到个体效应
不要只优化 agent 的平均表现——用 uplift model 识别哪些用户/场景从优化中获益最多。

### 2. Harness 内置实验能力
在 harness 中内置 A/B 测试和 uplift 分析能力——让优化决策基于因果推断而非相关性。

### 3. 迭代速度 > 单次优化幅度
快速迭代小幅优化比慢速大幅重构更有效——harness 的实验能力支撑快速迭代。
## 相关实体

- [高德路线规划双路线：mobilitybench（agent 基准）+ transitlm（端到端 rllm）](../ch01-854-高德路线规划双路线-mobilitybench-agent-基准-transitlm-端到端-rllm)

---

