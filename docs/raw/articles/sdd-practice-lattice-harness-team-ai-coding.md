---
title: "爆肝长文：SDD 实战下篇，从渐进式 SDD 到 Lattice Harness：AI Coding 的团队级闭环"
source_url: "https://mp.weixin.qq.com/s/VlEVdzRsuX_uEyyVVfs9RQ"
author: "PrismSpec / Lattice 作者"
feed_name: "AI Coding 实战"
publish_date: 2026-07-02
created: 2026-07-05
ingested: 2026-07-05
tags: [sdd, spec-driven-development, harness-engineering, lattice, ai-coding, verification, context-engineering, loop, drift-check, wechat]
type: article
review_value: 8
review_confidence: 8
review_recommendation: strong
review_stars: 4
sha256: 9bd0ddd136ab19aad87999c5529964f6f8d02983de585b42d4838ff8b3505c31
---

# 爆肝长文：SDD 实战下篇，从渐进式 SDD 到 Lattice Harness：AI Coding 的团队级闭环

> **渐进式 Spec Coding 解决"别跑散"，Harness 把执行和裁判分开，Loop 解决"别从零开始"。**

如果说上篇讲的是"怎么让 AI Coding 不要从一句话需求直接跳到随机代码"，那这篇要继续回答另一个更难的问题：

**当团队已经有了 Spec，谁来证明这次交付真的做对了？**

上篇讲的是团队落地 Spec Coding 的第一阶段：先试工具，再从工具里抽方法。

## 五工程缺口

| 缺口 | 问题 | 需要补什么 |
|------|------|-----------|
| Context 缺口 | 关键业务规则没进来，Spec 方向仍然会错 | 可审计的项目上下文 |
| 裁判缺口 | 谁判断做对了，不能让生成者自证 | 独立 Verification |
| 追踪缺口 | 验收标准、测试、代码、证据没有链路 | 验收覆盖与过程证据 |
| 漂移缺口 | API、schema、错误码会和 Spec 腐化 | drift check |
| 学习缺口 | 失败停在终端，下次继续从零猜 | loop state 与 learn draft |

## Lattice：Repo-local AI Coding Control Plane

Lattice 是 PrismSpec 之上补充的 repo-local AI Coding control plane / harness。不做 IDE、不做云平台、不接管 Agent，只把团队交付需要的控制点变成仓库内可版本化的 contracts。

| 控制点 | Lattice 放在哪里 |
|--------|------------------|
| Spec | `spec.md`、`plan.md`、`review.md`、`verify.md` |
| Context | `lattice/context/README.md`、`knowledge/`、`Context Basis` |
| Orchestrator | `guide.sh`、`spec-status.sh`、`task-next.sh`、`task-complete.sh` |
| Verification | `pipeline.sh`、`gates/`、fresh command output |
| Evidence | `eval-runs/*.json`、summary、history、dashboard |
| Learning | loop state、escalation、learn draft、promotion |

### Context：不要把知识库做成 Prompt 杂货铺

- 只放 AI 推不出来的约束（业务不变量、历史事故、架构决策）
- Context Map（地图）→ Project Knowledge（知识）→ Context Basis（本次采用依据）
- 知识从真实交付蒸馏，不从上而下编目录

### Verification/Evidence：不要让 AI 自己证明自己正确

确定性 gate 优先：

| Gate | 解决的问题 |
|------|-----------|
| bootstrap | 环境是否具备基本执行条件 |
| spec-lint | Spec 结构是否完整，验收标准编号是否连续 |
| build | 项目是否能构建 |
| lint / type-check | 静态质量是否过线 |
| unit-test | 基础行为是否通过 |
| ac-coverage | 每条验收标准是否有测试追踪（AC-1, AC-2 编号） |
| drift-check | Spec 和代码是否开始漂移 |
| compliance | 是否有知识引用、澄清记录等过程证据 |

核心底线：**执行者不能做最终裁判。** 同一个 Agent 可以写代码、修失败、补测试，但不能只凭自己的解释宣布"已经通过"。

### Drift 检测

- 新增 error code → 检查是否在 Spec 的 Interface 部分注册过
- 新增 API route → 检查是否在 Spec 或 Context 中预期过
- 修改 DB schema → 检查是否对应 Spec 的 Data 或 Schema 部分变动
- drift 从 spec-lint 开始抓，不在 CI 中漏

### Loop：失败分类、升级、沉淀

Loop 不是无限自动修复，而是有边界、有裁判、有升级机制的状态机：

```
[执行] → [验证]
           ↓ fail
         [判定]
           ↓ pass → [完成]
           ↓ fail (可修复)
         [修复] → [验证] ...
```

关键状态 Judging：裁判环节必须独立存在——可以是确定性 gate、只读 reviewer 或人工确认。

Learn Draft：失败记录 → 人工或 reviewer 确认 → promote 到 knowledge/ → 沉淀为长期知识。

## 当前边界

- 语言覆盖：Go/Gin/GORM 较完整，Node/Python drift parser 待扩展
- 知识治理：learn draft 有审查审计，但语义冲突仍需 reviewer
- 自动裁判：优先依赖确定性命令，不把 LLM 主观打分当最终通过条件

## 三个带走

> **Spec 解决路径收敛，Harness 解决独立裁判。**
> **Context 要进入 Spec，完成声明要指向外部命令和证据。**
> **Loop 不是无限自修复，而是失败分类、升级和沉淀。**
