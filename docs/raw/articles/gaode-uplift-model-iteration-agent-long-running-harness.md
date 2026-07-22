---
title: "面向复杂算法任务的 AI Agent：Long-Running Harness 架构设计与模型迭代应用"
created: 2026-06-09
updated: 2026-06-09
type: article
source_url: "https://mp.weixin.qq.com/s/LHPA3qlEsKOlrSsDPEnAyA"
ingested: 2026-06-09
sha256: "$(echo 'gaode_uplift_content' | shasum -a 256 | cut -d' ' -f1 | head -c 16)"
review_value: 9
review_confidence: 9
---

> 来源：高德技术
> 作者：信息业务中心
> 原文：https://mp.weixin.qq.com/s/LHPA3qlEsKOlrSsDPEnAyA

## 本期导读

高德营销算法团队构建的 AI Agent 系统：只需输入一句话目标（如"训练发券模型，目标击败 online baseline"），便能自主完成"提出假设 → 拼接样本 → 训练模型 → 离线评估 → 迭代决策"的全链路闭环。

**效益：** 过去工程师完成一次完整模型迭代通常需要 3–5 天；该 Agent 系统可在1–2 天内无人值守地跑通同等流程，工程师介入次数 = 0。

## 一、它是什么

一个 AI Agent 系统，专做一件事：替算法工程师跑完 **Uplift 模型迭代的完整生命周期**（Uplift 模型预测的是"给用户发券能多撬动多少 GMV"，是营销算法的核心资产）。

**输入：** 一段自然语言（例: "训练旅游 uplift 模型, 目标 sim 胜率 > 50%"）

**输出：** 1-2 天后给你一个训练完的模型 + AUUC 评估报告 + 整个过程的审计日志。

**它管的事：**
1. 想清楚: 决定本轮假设方向 (改样本 / 改模型架构 / 调参数 / 加特征 四选一)
2. 写 SQL: 从各业务线源表口径里, 拼出训练样本
3. 跑数据: 在数据开发平台上调度 30+ 天的 backfill 出训练集、测试集
4. 训练模型: 在训练平台上发布 pipeline、跑 GPU 训练、拉日志
5. 评估: AUC/AUUC/离线仿真对比 online baseline
6. 审核自己: 每一步出错了, 自己查日志、定根因、改代码、重跗
7. 存档: 整个过程每一步都落进事件日志, 进程崩了能从断点续上

## 二、三个核心能力

### 能力 1: 不知疲倦, 不丢进度

每个有副作用的步骤 (跑 SQL、提交训练、抓日志) 都被记成一个"任务"；任务状态变化 (开始 / 完成 / 失败) 即时写入本地数据库——append-only, 向 git 提交记录, 永远不删。

**为什么这事重要:** 一次完整迭代要 1-2 天 wall clock。中间任何一刻——你合上 laptop 睡觉、SSO token 过期、进程被 kill -9、电脑突然死机——下次重启时, 系统扫一遍记录, 从最近一个"已完成"的步骤继续往下跑, 不会重新提交浪费 GPU 配额。

**实际案例：** 跑到第 9 小时 laptop 睡眠了, 第 11 小时唤醒, 整个训练在云上自己跑完了——系统重启后直接用之前的训练任务 ID 拿结果继续, 工程师介入次数 = 0。

### 能力 2: 能审稿自己, 能修自己的错

8 个 LLM Agent 各管一摊——Planner 想方向、SampleDesigner 出 SQL、Coder 写代码、Critic 审稿、LogTriage 查根因、Repair 出补丁——之间通过 explicit handoff 互相交接。

**关键设计:** Critic 不靠"另一个 LLM 当裁判" (学术 benchmark 报告 80% 的 Agent 实验结果是 LLM 编造的), 而是直接跑确定性 Python assert——读真实数据库行数、查真实训练指标、读真实评估 CSV——任何一条 assert 失败, 触发 LogTriage→Repair 闭环。

**实际案例：** 美食业务源表的某个 JOIN key 字段在该业务上 100% 为空, 直接套酒店模板会得到 0 行训练样本。Critic 跑数据库 COUNT 发现行数严重不足直接拦下; LogTriage 查上游表口径文档发现该字段不适用; Repair 改 JOIN key 到另一个字段; 重跗出 7 位数行——全程无人干预。

### 能力 3: 能跟企业平台对话, 卡住会等人

两个通道并行——能用 API 的全走 API; 只有浏览器界面的操作走 Playwright 自动化 + 一个三分浏览器子 Agent (Planner / Actor / Validator), 录制成功脚本后按"前端版本指纹"缓存, 下次直接回放。

**关键设计:** 碰到 Agent 干不了的事 (例如申请数据表权限——属于企业治理) 主动暂停, 把当前状态标记成"等审批", 产出申请单, 等工程师 approve 后从同一个断点继续往下跑。

**为什么这事重要:** 企业 AI 跟 Kaggle 沙盒最大的区别就是平台不开放、规则零碎、权限分割。会自治的 Agent 不难做; 知道什么时候应该停下来等人的 Agent 才是 production-grade。

## 三、一次完整迭代案例

**酒店 Uplift 模型一次完整迭代：**

- T+00h: Planner 决策走 sample_change, 锁定 31 天观测样本 + 7 天 RCT 样本
- T+04h: 数据 DAG 跑完, 单步并行 ~31 个实例, 产出 ~26 万训练 / ~3 万验证，Critic 通过 treatment 平衡度校验
- T+09h: laptop 进入睡眠; 状态日志里此步骤标 started, 未 completed
- T+11h: 唤醒, 系统自动续接训练 (已在云上自己跑了 30 分钟)
- T+12h: 训练成功, Critic 通过模型指标校验
- T+18h: SSO 过期, 浏览器子 Agent 自动重新登录, 续接评估 CSV 拉取
- T+42h: 离线仿真 AUUC 较 online 基线数量级提升，Planner 决策 ACCEPT

**1 天 18 小时全程, 工程师介入次数 = 0; 期间 2 次 laptop 睡眠 + 1 次 SSO 过期, 全部自动恢复。**

## 四、整体工程指标

| 维度 | 数值 |
|------|------|
| 端到端跑通行业数 | 3 (酒店/美食/旅游), 充电就绪 |
| 端到端跑通迭代次数 | 4 |
| 单条假设迭代周期 | 1-2 天无人值守 vs 人工 3-5 天 |
| 单元测试通过率 | 16/16 (含进程崩溃续跑 + harness primitive 测试) |
| 工程师投入 | 同等任务下从 ~3 人天降到 ~1 人天 (-67%) |

## 五、与业界范式的对齐评估

### 5.1 业界定义的 10 个 harness primitives

业界已经把"造 Agent 该有哪些零件"讲清楚了——真正缺的是把这套范式跑在企业生产平台上的公开案例。

### 5.2 企业平台中几类典型的工程痛点

- **去重必须用外部任务 ID, 不能用 hash:** 数据调度平台某些 API 在部署没完成前会快照旧 SQL, 必须强制 poll 等部署生效
- **Critic 必须 grounded, 不能 LLM-as-judge:** 训练平台在样本量极小时会 silent failure 返回 AUC=0.0, LLM judge 会自圆其说"训练成功"
- **工具层必须有 UI-only 兜底:** 训练平台的代码发布只在浏览器里有, 没 Open API, 必须用 Playwright + 三分浏览器子 Agent 补上

### 5.3 Audit 驱动落地的三项能力

1. **Explicit Handoff:** 新增 Handoff(from_agent, to_agent, reason, payload) 数据结构, 转交链路在 journal 里能直接查
2. **MCP-style Tool Registry:** @tool(name, description, input_schema) 装饰器自动注册到全局 registry
3. **Tracing Spans:** 新增 spans 表 + 开闭 API, 支持 parent-child 嵌套和耗时记录, 跟 OpenTelemetry / OpenAI Agents SDK tracing 接得上

## 六、更多思考

**一个 framing: test-time compute**

这套系统本质上是把过去算法工程师手工迭代的过程, 转译为 **test-time compute allocation per hypothesis**——让 inference 多花一些, 换 experiment 少跑几遍。分析师预测 2030 年推理将占 AI compute 75%, 我们让算法团队从 2025 年就开始享受这条曲线。

**下一步**
- 短期: 充电行业首跑端到端跑通
- 中期: 补完 super-step 抽象 + time-travel checkpoint (一次回退到任意过去点)
- 长期: 覆盖更多业务行业, 单团队同时运行 ≥3 个并行迭代

## 参考文献

1. Anthropic. Introducing the Model Context Protocol. 2024-11. https://www.anthropic.com/news/model-context-protocol
2. Anthropic. Building Effective Agents. 2024-12. https://www.anthropic.com/research/building-effective-agents
3. Anthropic. Effective context engineering for AI agents. 2025-09-29.
4. Anthropic. Effective harnesses for long-running agents. 2025-11-26.
5. OpenAI. Agents SDK. 2025. https://openai.github.io/openai-agents-python/
6. MLR-Bench (arXiv 2505.19955). 报告 agent 实验结果"在 80% 的 case 中是 fabricated"。
7. Google. MLE-STAR (2025). MLE-Bench-Lite 63% 获奖, 36% 金牌。
