---
source_url: https://mp.weixin.qq.com/s/BqRjAd27bT17pMUbAGtmsg
source: wechat
title: "腾讯 WorkBuddy 团队论文：如何从「修 Bug」走向「完成工作」— WorkBuddy Bench"
ingested: 2026-08-05
type: raw-article
tags: [workbuddy-bench, agent-evaluation, benchmark, tencent, delivery-validation, artifacts]
sha256: 79e1c99337021e5e53f8d64b2d111673fe533e9fa4406c4479a5ed7046c13c43
---

# 腾讯 WorkBuddy 团队论文：如何从「修 Bug」走向「完成工作」— WorkBuddy Bench

> 作者：若飞（架构师/JiaGouX 公众号，2026-08-05 投喂）。腾讯 WorkBuddy 团队论文《WorkBuddy Bench》深度拆解。

## 核心问题：Agent 的"完成"由什么证明？

"假完成"现象：Agent 找到失败测试改几行代码目标用例绿了，第二天联调发现跨时区订单没覆盖、接口少兼容字段、发布说明引用旧配置——修了一个 Bug 却没把工作交到下一个人手里。月度分析写完工作簿没更新；架构方案讲得顺但迁移顺序和回滚条件没落下来；行程看起来完整但时间冲突/预订状态/预算散在聊天记录里。

**Prompt、Context、Harness、Loop、Graph 管运行；WorkBuddy Bench 补的是验收端。**

## 完成四层

| 层次 | 看到了什么 | 还缺什么 |
|------|-----------|---------|
| 回答 | 一段解释/方案/代码片段 | 没有进入真实工作区 |
| 动作 | 改了文件、调用了工具 | 不确定结果是否完整交付 |
| 交付 | 留下补丁/网页/报表/PoC | 还要核对状态与约束 |
| 完成 | 交付物可用、状态一致、证据可复核 | 可以进入交接/发布/下一步 |

## 任务形态设计

与 SWE-bench 的区别：不直接复用公开 Issue，而是从历史 commit、PR、真实 CVE 或业务场景反向还原任务，改写为同事间的短请求。Code 任务换成开发/算法/产品/QA/运维五种角色提需求，省略目标文件/根因/参考 diff/字段结构/部分边界条件。

"请求可以留白，工作区不能没有线索"——缺少的信息既不在请求里也不在代码/数据/文档/接口中时，Agent 只能猜，评测失去稳定依据。

隐私处理：借的是任务分布（汇总后的任务分类/请求结构/难度分布），不是生产会话本身，避免公开用户数据。

## 任务包封装（可复跑）

```
task/
├── instruction.md # 自然语言请求
├── task.toml      # 类别、难度、资源与超时
├── environment/   # Docker 与 Agent 可见的工作区
├── tests/         # 任务结束后执行的评测资产
└── gold.patch     # Code 任务可选的诊断参考
```

固定关键边界：起点（从哪个版本/文件/状态开始）、可见性（哪些评测资产暂时不可见）、工具/网络/资源权限、结果写到哪里、验收程序。对应研发：instruction.md≈需求卡、task.toml≈执行策略与资源限制、environment≈固定版本开发环境、tests≈CI/验收规则、results≈构建产物/日志/发布证据。

防污染：通过重新构造请求关闭"搜索题面就能找到答案"路径 + 数据集版本更新管理发布后暴露。隐藏测试只在求解期间不可见，公开后任务目录/环境/测试/评测代码/参考解全部开放。

## 四赛道与验收边界

| 赛道 | 任务数 | 验收方式 |
|------|--------|---------|
| Code | 80（18 细分类目，5 角色） | 找到契约：gold patch 验证 + 接口/字段检查 |
| Web | 70（35 从零 + 35 分布） | 留下工件：规则检查 + LLM/VLM 判断 + Agent Judge 实操 |
| Office | 50（xlsx/csv/PDF/文档/JSON/MD/文件树） | 保持一致：确定性规则（权重 0.70-0.95）+ LLM Judge 读固定证据 |
| Security | 60（38 红队 + 22 蓝队，真实 CVE） | 形成证据：确定性程序评分 + 五层反作弊 |

Code 任务来源：34 个真实上游 commit 开源仓库快照、24 个 clean-room 重实现、22 个合成工作区。候选任务进公开集前先跑两次验证：未修改基线得分不能高于 0.3（防"什么都不做也能过"）；应用 gold patch 后必须得 1.0（确认存在可行解）。

典型零分：Agent 一直修改测试文件直到超时；Agent 在大仓库里迷路改无关模块。数据：bug_fix 和 api_contract 平均分 0.47，feature_pipeline 0.94，testing 0.88——实现语义大体正确但遗漏必需字段/参数形状/输出格式，接口检查仍失败。

## 评测结果（八张榜榜首）

| 赛道 | CodeBuddy Code (cbc) | Claude Code (cc) |
|------|---------------------|------------------|
| Code | Claude Opus 4.8: 74.43 | Claude Opus 4.8: 77.90* |
| Web | Claude Opus 4.8: 68.14 | Claude Opus 4.8: 69.86 |
| Office | Claude Opus 4.8: 82.37 | GPT-5.5: 86.05 |
| Security | GLM-5.2: 76.32 | GLM-5.2: 80.86 |

关键观察：**没有一个模型包办四类工作**；同一个模型换 Harness 表现变化（GPT-5.5 Code 从 cbc 72.90 变 cc 76.63，GLM-5.2 从 71.54 变 77.06；Security 中 GPT-5.5 从 cbc 第六升 cc 第二，MiniMax-M3 从第二落第五）。HY-3 打开跨轮 reasoning passback 后 Code 在 cbc +3.82、cc +1.92。

评测记录必须保留：模型 + Harness 版本 + 数据集版本 + 工具权限 + 指令与运行协议（官方 Job 按"模型、Harness、数据集"组合）。成本与条件绑定：DeepSeek-V4-Flash cc 下平均输出 28.6k token 分数低 14.74，GPT-5.5 8.7k——tokenizer 不同，只适合观察同实验成本轮廓，不适合跨模型绝对效率结论。

## 五份小合同（团队自建 Agent 评测指南）

1. **任务合同**：目标、约束和停止点是什么（例：延迟购买不计入本次实验转化）
2. **现场合同**：基线、版本、数据和可见范围（固定 commit、工作簿版本或数据库快照）
3. **动作合同**：能用哪些工具，哪些动作需要审批（可改分支，不能直接改生产库）
4. **交付合同**：结果落在哪里，格式和状态怎样变化（PR/报表/工作簿/页面入口/安全报告）
5. **验收合同**：用什么规则和证据判断完成（测试/字段检查/跨文件一致性/运行状态）

## 换回日常：常见"假完成"→可交付结果

- 研发：测试绿了 → 补丁+回归测试+接口兼容+变更说明+未验证边界一致
- 架构：文档写完 → ADR/依赖/接口/迁移顺序/故障处理/回滚条件能对应
- 报表：总结生成了 → 原始数据/工作簿/报告/指标口径/状态文件同一版
- 生活：行程完整 → 日期/路线/预算/预订状态/提醒进入可用文件

与《Agent 能干活之后，谁来管执行权？》（ArbiterOS，管开工前授权）互补：WorkBuddy Bench 管动作结束后的验收——一个管开工前，一个管交付后。

## 官方仓库复现

Docker + Python 3.12+ + uv。流程：uv sync → cp .env.example .env → fetch-dataset.sh → 配置 model/harness/dataset → uv run run.sh --job。结果在 results/。失败复盘五类：找错对象（改了无关文件）/契约遗漏（字段参数格式不完整）/业务口径错（时间窗口状态归因错）/交付没落地（约定路径无成品）/证据不完整（复现边界交接材料不足）。

## 边界

Code 主要是 Python；Office 文本和文件优先（不覆盖 OCR/像素级版式/原生桌面 GUI）；开放发布会带来污染风险；模型裁判需持续校准。官方仓库/评测站/数据集：Tencent WorkBuddy Bench 论文 + 官方代码仓库 + 官方评测站 + 官方数据集。

## 关联
- 与 [[entities/mirrorcode-long-horizon-benchmark-epoch-ai-metr|MirrorCode]]（长时程编码基准）、[[raw/articles/lhtb-long-horizon-terminal-bench-musk-retweet-yucheng-shi-2026|LHTB]]（长时程终端）同为 Agent 评测基准新形态：MirrorCode/LHTB 测"能跑多久多远"，WorkBuddy Bench 测"交付物是否真的完成"
- 与 [[entities/arbiteros-governance-kernel-cuhk-2026|ArbiterOS]]（管执行前授权）互补：WorkBuddy Bench 管交付后验收
- 与 [[concepts/agent-evaluation-benchmarks|Agent 评估基准]] 概念互补
