---
title: "AutoHarness 走到哪了：学界业界的能力调研"
source_url: "https://mp.weixin.qq.com/s/J9FKvVCUjfgj_N3uE35GwQ"
source_account: "VibeCoder (Vibe编码)"
ingested: 2026-07-28
type: raw-article
tags:
  - auto-harness
  - harness-engineering
  - agent-self-improvement
  - agent-evolution
  - AHE
  - reasoning-bank
  - TTHE
  - adaptive-harness
  - safety
  - agent-infrastructure
score_v: 8
score_c: 5
score_vc: 40
decision: raw
---

# AutoHarness 走到哪了：学界业界的能力调研

> Agent 的下一轮竞争，正在从模型能力转向 Harness 能力。Harness 不只是一段 system prompt，还包括 memory、skills、工具描述、middleware、planner、subagent、测试、沙箱、权限、发布和回滚。它决定模型看见什么、如何行动、遇到错误如何修正，以及哪些副作用可以发生。

## 核心研究综述

### AutoHarness (DeepMind)
- 把环境规则编译成 Python 代码
- TextArena 145 个游戏中合法动作率达 100%
- 16 个单人游戏中 Harness-as-Policy 平均奖励 0.870
- 方案适合 SQL schema、API 参数、状态机动作和部署命令
- 能解决动作是否合法，无法自动保证任务成功，未证明开放世界 Agent 可安全重写整套控制程序

### ReasoningBank (Google Research)
- 演化对象是经验而非 Harness 本身
- Gemini-2.5-Flash 配合结构化记忆后：WebArena 提升 8.3pp，SWE-bench Verified 提升 4.6pp，平均少走约 3 步
- 经验层容易审阅和撤销
- 要求记录来源、适用范围、模型版本、过期时间与反例，避免错误记忆长期污染

### AHE (Auto-Harness Evolution)
- 搜索面覆盖 system prompt、memory、skills、tools 和 middleware
- Terminal-Bench 2：pass@1 从 69.7% 提升到 77.0%
- SWE-bench Verified：75.2% → 75.6%（小幅提升），但 tokens/trial 下降约 12%
- Harness 的价值有时体现在更少上下文和更稳定执行，而非明显提高分数
- **工程缺口**：归因记录 ≠ 因果证明；Best-of-N 若所有 challenger 更差仍可能选变体；无完整闭环（原子发布、密封验收）
- AHE 更适合做 Harness PR 生成器

### 其他方案
- **HARBOR**：已有配置开关时做受约束贝叶斯优化
- **TTHE**：把演化移到测试时，在 BIRD、LiveCodeBench、SWE-bench Verified、DS-1000 等 hard slice 上报告提升；需补 prequential 测试
- **Adaptive Auto-Harness**：解决长期膨胀（prompt 2KB→68KB，skills 12→34）；Git Harness tree 保存不同任务族专用版本，solve-time 路由
- **Meta-Harness**：现有组件表达不了新机制时开放代码搜索；完整轨迹对搜索关键（消融：只给分数/摘要远弱于完整轨迹）
- **Gated Semantic Quality-Diversity**：LLM 提案，确定性代码采样/显著性检验/账本/sealed test；最终测试集只在演化结束后打开一次

## 生产架构：两条循环，三层权限

### 两条循环
- **演化循环**（低频）：Trace → Diagnose → Patch → Eval，拥有受限写权限，提出 memory/prompt/skill/router/tool wrapper 候选
- **适配循环**（请求路径）：Task → Route → Harness → Solve，从已批准 Registry 选择版本，默认只读

### 三层权限
1. **候选生成器** — 负责提案
2. **独立记分器** — 负责回归、隐藏集、安全和成本验收
3. **不可变安全内核** — 身份、密钥、sandbox、网络出口、租户边界与最终 validator

## 生产效果：四类收益与真实案例

### 公开证据支持的四类收益
1. 明确规则场景中的合法性与约束遵循
2. 特定任务、切片和模型上的成功率或得分提升
3. token、上下文长度或步骤数下降
4. 长期任务流中的专用 Harness 积累与路由

### 真实产品案例
- **Anthropic Retro Game Maker**：planner/generator/evaluator 连续迭代，6 小时、$200（solo 仅 20 分、$9）
- **OpenAI 内部产品**：约 5 个月、约 100 万行代码、约 1,500 个 PR，Harness 工程已进入真实开发流程

## 安全发布挑战
- **Anthropic Claude Code 复盘**：reasoning effort、idle thinking 清理、system prompt 变化都带来回归
- **AgentSecBench**：区分文字提醒 vs 结构隔离；provenance projection、capability restriction、output validation 才是可执行边界

## 八周落地计划
| 阶段 | 工作 |
|------|------|
| 第 1—2 周 | 选低风险任务族，冻结模型/工具/环境，建 RunManifest 和完整 Trace |
| 第 3—4 周 | 只生成候选不更新 active，首轮允许修改 memory/skill/prompt/router |
| 第 5—6 周 | 划分 development/regression/hidden holdout/metamorphic/security，proposer 看不到隐藏集 |
| 第 7—8 周 | offline replay → shadow → 1% canary 渐进发布，安全/SLO/成本/回归超阈值自动回滚 |

## 四条红线（安全底线）
1. 不让 evolver 修改身份、权限、密钥和网络出口
2. 不让 proposer 读取或修改 hidden holdout
3. 不让生成候选的模型自行裁定有效
4. 不根据单一 benchmark 直接全量发布

## 选型指南
- 规则可形式化 → AutoHarness 生成 verifier/policy
- 历史经验复用 → ReasoningBank 式 memory
- 已有配置开关 → HARBOR 约束贝叶斯优化
- 失败能定位到组件 → AHE 小变更包
- 现有组件表达不了新机制 → Meta-Harness 代码搜索

## 现有局限
代理指标 Goodhart、归因与因果混淆、同批适配、选择器误判、评测成本、供应链风险、模型升级失配、公开复现不完整

## 关键洞察
- 单一 benchmark 和一次短测不足以决定发布
- 最现实目标：Agent 自动提出变更 → 系统验证大部分证据 → 受限流量试运行 → 最终发布权留给外部控制与人
- Harness 工程已在头部公司进入真实开发流程（OpenAI 百万行代码实践）

→ **关联**: 本综述与 [[entities/harness-engineering|Harness Engineering：第三代工程范式]] 的「未来演进」中 Automated Harness Engineering 预测一致，是这一方向当前研究进展的快照。
→ **关联**: 本综述的「演化循环/适配循环」架构与 [[entities/spec-kit-openspec-superpowers-hybrid-harness|Spec Kit 三层 Harness]] 的「Harness 层 → Skill 层 → Spec 层」形成互补——前者关注 Harness 如何自我进化，后者关注 Harness 如何分层组织
