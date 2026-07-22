---
title: "Skill 想进生产？先闯这 4 道死关"
source: wechat
source_url: https://mp.weixin.qq.com/s/Ye1ACGgs9R48koOYGKwBYw
author: winty (前端Q)
account: 前端Q
account_description: "专注分享AI知识和各类前端资源"
published: 2026-06-16T19:21:00+08:00
ingested: 2026-06-16
sha256: 18bbfb725cbda6eb661547224329d269e3dc50ac47acbd82b430f425c13a4af6
tags: [skill, skill-hub, skill-governance, quality-gate, 质量门禁, 生产发布, version-management, hermes-agent, winty, ai-rollout-pattern]
content_type: methodology-framework
language: zh-CN
---

## 第二道关：版本升级门禁

入了 Hub 之后，每次版本升级要走这道关。

> **一个 Skill 改了一版，凭什么能合并主分支？**

这是 Skill Hub 的核心治理点。它的存在就是为了让"改 Skill"这件事变得不能太随便。

### 门禁规则的分级

不同改动有不同门禁：

| 改动类型 | 门禁等级 | 例子 |
|----------|---------|------|
| patch | 轻量 | 修措辞、加 Pitfall、补 Example |
| minor | 中等 | 新增 step、加 Input、调整判断条件 |
| major | 重 | 删 step、改默认行为、改 status |

### 轻量门禁（patch）

- 必须有改动动机说明
- PR 通过 owner 同意即可
- 不强制跑评估，但跑了更好

### 中等门禁（minor）

- 必须有改动动机
- 必须跑完整评估
- 必须生成 v(N-1) → v(N) 对比报告
- 任何指标回退 > 3 pt 自动打回
- 至少 1 个 reviewer 同意

### 重门禁（major）

- 必须有改动动机和迁移说明
- 必须跑完整评估
- 必须跑稳定性扰动测试
- 必须人眼复核 regression set
- 没有 P0 regression 才能继续
- Token 增长不能超过 25%
- 必须 owner + 平台 reviewer 双签

### CI 编码示例

```yaml
on_skill_pr:
  - extract_change_type: patch | minor | major
  - if patch:
      - require_owner_approval
  - if minor:
      - require_evaluation
      - generate_compare_report
      - block_if_regression > 3pt
      - require_one_reviewer
  - if major:
      - require_evaluation
      - require_robustness_test
      - require_regression_review
      - block_if_p0_regression
      - require_owner_and_platform_signoff
```

**这套分级很重要**：

- 轻量改动不要被流程压垮（避免改 Pitfall 都要排队）
- 高风险改动不要轻易放行（避免 major 也"快速上线"）

---

## 第三道关：生产发布门禁

通过版本升级门禁，新版只是合到主分支。

> **但 合并 ≠ 全量上线。**

生产发布是另一个完全独立的门禁。

### 生产发布的常见状态

| 状态 | 含义 | 谁能用 |
|------|------|--------|
| draft | 写完没合并 | 作者 |
| experimental | 已合并但未上线 | 沙盒 / 指定团队 |
| canary | 灰度中 | 部分团队 |
| stable | 全量上线 | 所有人 |
| deprecated | 已废弃 | 不建议使用 |
| retired | 完全下线 | 不可用 |

每两个状态之间都有门禁。

### experimental → canary 门禁

- 入 Hub 门禁通过
- 至少有一个真实业务场景验证
- 评估结果稳定
- owner + 平台双签

### canary → stable 门禁

- 灰度至少 7 天
- 灰度期间无 P0 / P1 事故
- 用户主动纠正比例 < 10%
- 失败率没有显著上升
- 所有指标稳定（不只是没下降，而是趋势平稳）

### stable → deprecated 门禁

- 有替代方案（不能没有替代直接废弃）
- 提前 30 天通知所有调用方
- deprecated 期间仍可调用，但有警告
- 30 天后转 retired

### 任何状态 → retired 门禁

- 所有调用方都已迁移
- 已 deprecated 至少 30 天
- 最近 7 天调用量 = 0

**这套状态机给企业里的 Skill 演进一个清晰的轨道。**

---

## 自动门禁与人工审核怎么搭配

很多人会问：这套规则是不是要全自动？

> **我的答案是：90% 自动 + 10% 人工。**

自动负责把规则化的检查跑完，人工负责处理"规则之外"的情况。

### 自动负责的事

- 结构合规扫描（缺字段、命名规则）
- 安全扫描（明文密钥、未注册工具）
- 评估跑分（L1/L2/L3/L4 自动算）
- 对比报告（v1 vs v2）
- 状态机迁移（按规则推进）
- 灰度监控（指标自动告警）

### 人工负责的事

- 改动动机是否真的合理
- regression 是不是真的可接受
- 高风险变更要不要特批
- deprecated 时迁移路径是否清晰
- 跨团队冲突时的仲裁

**人工部分，必须留有清晰的"决策记录"**。我建议每一个特批都要写："为什么我决定让它过，依据是什么。"否则等下次出事故，连复盘都复不动。

---

## 一个企业级 Skill 入库 PR 的完整流程

```
[作者] 提交 PR for incident-triage v1.3.0 (minor)
  ↓
[CI] 触发自动门禁
  - 结构扫描 ✅
  - 安全扫描 ✅
  - 跑评估（3 次）
  - 生成 compare report
  - 检查回退阈值
  ↓
报告自动贴到 PR 评论
  ↓
[Reviewer] owner 审核
  - 看动机说明
  - 看对比报告
  - 看 regression set
  - approve 或 request changes
  ↓
合并到 main 分支 → status: experimental
  ↓
[平台团队] 在沙盒环境跑一组真实场景
  ↓
[Owner] 申请进入 canary
  ↓
[CI] 灰度门禁
  - feature flag 设置
  - 监控告警挂上
  ↓
[Owner] 灰度 7 天
  - 监控指标
  - 收集用户反馈
  ↓
[Owner] 申请转 stable
  ↓
[CI] stable 门禁
  - 灰度期间数据检查
  - 无 P0 事故
  ↓
全量上线 → status: stable
```

这个流程看起来比传统软件还重，但企业级 Skill 应该被这样对待。

**它不是一份可有可无的笔记，它是一段每天会被 AI 反复执行的"程序"。**

整套流程的关键不是"步骤多"，而是"**每个步骤都有明确把关的人和明确的过/不过判断**"。少一道把关，门禁就漏一格。

---

## 真实场景：被门禁拦下的 Skill

我讲一个真实例子。

某团队提交了 incident-triage v1.4.0 PR，改动是新增"自动重启服务"作为一个可选 step。

进入门禁后：

- 结构扫描：✅
- 安全扫描：⚠ 警告 restart_service 是高危操作
- 评估：overall +3pt，但 L4 -8pt（因为新增的重启动作触发了一些禁飞区）
- 对比：P0 cases 出现了 2 例 regression
- 自动判断：minor 但触发 major 检查（因为 L4 回退超阈值）

CI 自动给 PR 加上了 major-required 和 regression 两个标签，并贴了详细对比报告。

owner 看完之后，做了三件事：

1. 把"自动重启"改成"重启需要用户确认"
2. 在 Steps 里加 Verification：重启后必须等服务健康再继续
3. 在 Pitfalls 里加："重启不是默认动作，只在确认无其他可恢复路径时使用"

重新跑评估：

- L4 -8pt → -1pt（接近 v1）
- P0 regression 0 例
- overall +5pt

通过 minor 门禁，进入 experimental，再经过 7 天灰度，最终 stable。**整个过程没出事故。**

> **这就是质量门禁的真实价值：它不是为了挡新版本，而是为了挡那些"看起来没问题但其实会出事"的新版本。**

---

## 我的判断

质量门禁这件事，最难的不是规则设计，而是规则执行。

很多团队规则写了一大堆，但碰到"老板赶时间上线"就破例。**破一次，门禁就形同虚设。**

我自己的几个执行原则：

1. **门禁的破例必须留下决策记录**：谁批的、依据是什么、要承担什么后果
2. **平台团队对门禁有最终解释权**：业务方不能单方面绕过
3. **每季度复盘门禁拦下来的事故和误报**：让规则越用越准

**只要这三点立起来，门禁就能真正发挥价值。**

下一篇我会聊 Skill 的"**生命周期治理**"——一个 Skill 从被创建，到被使用、被审核、被发布、被灰度、最后被废弃，这一整套全生命周期里，企业要做哪些事。门禁是某一时刻的把关，生命周期治理是从摇篮到坟墓的管理。

---

## 进一步阅读

- DevOps Quality Gates 实践
- Anthropic：Production-grade agent development
- Hermes Agent 安全扫描相关源码