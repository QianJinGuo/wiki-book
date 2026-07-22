---
title: "AI Skill 也会\"退休\"，企业到底怎么管？— winty Skill 生命周期 6 阶段治理（创建/审核/发布/灰度/运行/废弃 + 数据化迁移规则 + Dashboard + 真实遗忘事故复盘）"
source_url: https://mp.weixin.qq.com/s/uP58qSBTCXlGUkv5YlqzRA
publisher: 前端Q
author: winty
publish_date: 2026-06-17
ingested: 2026-06-17
sha256: 090d398443a78c80f1f52762f283d45d67fce6993ddef1d831f3bdda6434a54c
tags: [wechat, article, winty, skill-hub, skill-lifecycle, skill-governance, skill-治理, creation, review, release, canary, live, deprecation, retired, 4-class-review, data-driven-migration, abort-trigger, 30-day-migration, lifecycle-dashboard, db-migrate-advisor-incident, scenario-proposal-template, frontendq]
type: raw
---

# AI Skill 也会"退休"，企业到底怎么管？

> 来自 winty（前端Q）2026-06-17 发布
> Skill Hub 系列续作第 3 篇（前两篇：Skill Hub 组织资产 + Skill 质量门禁 4 关）

## 开篇比喻

我经常打一个比方：

> **普通文档像便利贴，Skill 更像企业里的微服务。**

便利贴写完贴墙上就完事了，没人会问它"什么时候该被替换"、"调用方有没有迁移"、"谁在维护它"。

但微服务不一样。它有版本，有 owner，有 SLA，有上线流程，有废弃流程。

**企业级 Skill 也应该这么对待。**

我研究 Hermes 的过程中，发现一个有意思的现象：很多团队会很认真地写 Skill，但写完之后就没人管了。半年之后，Hub 里堆着上百个 Skill，没人知道哪些还在用、哪些已经过期、哪些其实重复了。

**这就是缺乏生命周期治理的典型后果。**

这一篇把企业 Skill 的全生命周期讲透，分成 6 个阶段：

1. 创建（Creation）
2. 审核（Review）
3. 发布（Release）
4. 灰度（Canary）
5. 运行（Live）
6. 废弃（Deprecation）

**每个阶段都有自己关心的事，规则不能混。**

## 阶段 1：创建（Creation）

Skill 生命周期的起点，是有人提出"我要写一个 Skill"。

这一步的关键不是技术，而是 **判断是否真的需要新 Skill**。

我见过太多企业 Skill Hub 进入"垃圾仓库"状态：每个人都在写新的，没人 review 是不是已经有同名同义的，最后出现 5 个差不多的"代码评审 Skill"，互相不知道对方存在。

所以创建阶段第一件事是 **重复性检查**：

- 同名 Skill 是否已存在？
- 类似功能 Skill 是否已存在？
- 是否可以基于现有 Skill 扩展，而不是新建？

这个检查可以自动化：每次提交新 Skill，先做语义搜索，把高相似度的已有 Skill 列出来。

如果重复性高，引导作者：

- 加入现有 Skill 的 owner 列表，一起维护
- 给现有 Skill 提 PR
- 而不是开新分支

第二件事是 **场景描述模板**。

要求新 Skill 的发起人填一份场景描述，至少包含：

```yaml
proposal:
  name: incident-triage
  proposer: zhang@team-sre
  trigger_scenario: |
    描述这个 Skill 解决什么真实场景，
    最近一个月这种场景出现过几次，
    现在没有 Skill 时大家是怎么处理的
  expected_value: |
    上线之后预期能改变什么，
    从什么样的现状变成什么样
  similar_existing_skills:
    - <可能重叠的现有 skill 列表>
  estimated_effort: 2 weeks
```

**没有这份提案，不接受新建 Skill。**

这个机制看起来挺重，但实际效果是：**50% 的新 Skill 提案在这一步会被打回（因为已经有了）**。

> 阻止重复，是 Hub 健康的最基础动作。

## 阶段 2：审核（Review）

新 Skill 写完之后进入审核。

这一步不是只看代码，而是看 **四个维度**：

### 业务对齐审核

由 Skill 的领域专家来看：

- 触发条件是不是真实场景？
- Steps 顺序合不合理？
- Verification 能不能真的验证业务正确？
- Pitfalls 是不是真实踩过的坑？

**业务对齐审核必须由业务方做，平台团队代替不了。**

### 工程质量审核

由平台团队做：

- 结构是否符合规范
- frontmatter 是否完整
- 是否能通过自动门禁
- 测试集质量如何

### 安全合规审核

特别针对涉及敏感操作的 Skill：

- 涉及生产环境吗？
- 涉及用户数据吗？
- 涉及支付 / 订单 / 风控吗？
- 是否有合理的"人工确认"机制？

如果命中以上任一项，必须额外走安全团队审核。

### 性能与成本审核

很多团队忽略这一步：

- 这个 Skill 平均消耗多少 Token？
- 平均执行多长时间？
- 高频调用时 Token 成本是多少？

> 我见过一个 Skill 因为写得太啰嗦，每次调用花 2 万 Token，上线之后一周烧掉团队半年预算。

**性能与成本审核能帮你避免这种事。**

## 阶段 3：发布（Release）

审核通过后进入发布。

发布不是直接全量上线，而是分四档：

| 档位 | 含义 | 谁能用 |
|------|------|--------|
| internal | 团队内部使用 | Skill owner 团队 |
| preview | 预览版 | 已订阅 preview 的团队 |
| canary | 灰度 | 抽样调用方 |
| stable | 稳定 | 全量 |

不同档位适合不同情况：

- 极简 Skill / 风险低：可以直接进 canary
- 复杂 Skill / 跨团队：建议先 internal → preview → canary
- 涉敏感操作：必须从 internal 开始

每一档之间的迁移都需要数据支持。

我建议这样的迁移规则：

```
internal → preview:
  - 累计调用 ≥ 50 次
  - L3 通过率 ≥ 75%
  - 至少 1 次 owner 复盘
  
preview → canary:
  - 累计调用 ≥ 200 次
  - L3 通过率 ≥ 80%
  - 用户主动纠正 < 10%
  
canary → stable:
  - 灰度 ≥ 7 天
  - 累计调用 ≥ 1000 次
  - 无 P0 / P1 事故
  - 所有指标稳定
```

**这套数据化迁移规则的好处是：升档变成"客观满足条件"，而不是"老板拍脑袋"。**

## 阶段 4：灰度（Canary）

灰度是企业级 Skill 上线的核心动作。

很多团队做"灰度"只是把 feature flag 拨一半，根本没真正监控数据。

合格的灰度至少要做四件事：

### 1. 选灰度群体

不能随机选。要选 **能反馈的群体**。

比如：

- 同一个团队内灰度，确保问题能被快速反馈
- 选成熟用户，避免新手把 Skill 问题误认为自己用错了
- 灰度群体规模建议 5%-20%，太小看不出问题，太大风险大

### 2. 监控关键指标

灰度期间必须监控：

- 调用成功率
- L3 业务正确率（抽样人工评估）
- 平均执行步骤数
- 平均 Token 消耗
- 用户主动纠正比例
- 新增的失败模式

任何指标显著恶化，自动暂停灰度。

### 3. 设定明确的 abort 触发条件

事先约定哪些情况要立刻 abort：

- 调用失败率上涨 > 10%
- L3 通过率下降 > 5pt
- 用户主动纠正比例 > 15%
- 出现 P1 及以上事故

碰到任一触发条件，自动回滚到上一稳定版本。

> 不要等老板拍板。等老板拍板就晚了。

### 4. 灰度期满判定

灰度期间表现稳定 ≥ 7 天，才能升档。

判定要严格：

```
canary 升 stable 检查清单：
- [ ] 灰度持续 ≥ 7 天
- [ ] 累计调用 ≥ 阈值（视 Skill 而定）
- [ ] 无 P0 / P1 事故
- [ ] 所有指标 7 天内无显著恶化趋势
- [ ] 至少 3 个不同调用方反馈正面
- [ ] 平台团队 review 通过
```

**全部 ✅ 才能升档。**

## 阶段 5：运行（Live）

Skill 上线之后的运行阶段，不是"啥都不用管"。

这一段最容易被忽略，但风险最大，因为：

- 模型在升级
- 工具在变化
- 业务在演进
- 调用模式在变

**如果不持续监控，一个月后这个 Skill 可能已经悄悄退化了。**

### 持续监控

监控指标基本和灰度期一样，但是 **常驻**：

- 调用量
- 成功率
- 步骤数
- Token 消耗
- 用户主动纠正比例
- 失败模式分布

### 异常告警

任何指标显著漂移，自动告警给 owner。

**我经验里特别要盯三个**：

- **步骤数无故变多**：往往是 Skill 开始绕路
- **Token 消耗突然上涨**：往往是模型行为变了
- **同一类失败模式集中出现**：往往是某个上游变了

### 定期复盘

每月或每季度，对每个 Skill 做一次系统复盘：

- 这段时间调用了多少次
- 表现怎么样
- 用户反馈如何
- 是否有改进空间
- 是否有合并 / 拆分必要

复盘结果要落到行动项：

- 加 patch
- 升 minor
- 启动 major 重构
- 标记 deprecated

## 阶段 6：废弃（Deprecation）

废弃是最容易被偷懒的阶段。

很多团队的"废弃"就是把 Skill 删了，然后调用方一脸懵：突然某天 Agent 报错，查半天才发现 Skill 没了。

合格的废弃必须分四步走：

### 第一步：标记 deprecated

修改 frontmatter：

```yaml
status: deprecated
deprecated_since: 2026-04-30
sunset_date: 2026-05-30
replacement: incident-triage-v2
deprecation_reason: |
  v1 在多源 incident 场景下表现不稳定，
  已经被拆分为 incident-triage-frontend 和 incident-triage-backend，
  请迁移到对应的新 Skill。
```

**deprecated 之后，Skill 仍然可以调用，但 Hub 会在调用时打印警告。**

### 第二步：通知所有调用方

不要假设大家会主动看变更日志。

- 通过 Hub 系统给调用方发通知
- 在调用时附带迁移建议
- 提供迁移指南

### 第三步：迁移期

通常给 30 天迁移期。

期间：

- deprecated Skill 仍可用，但有警告
- 新调用方禁止使用
- 平台团队跟进每个调用方的迁移进度

### 第四步：retired 与归档

迁移期满后：

- 调用量 = 0 的，转 retired，从可调用列表删除
- 调用量 > 0 的，给 owner 发警告，再延期 14 天
- 14 天后强制下线

**retired 不等于删除，元数据仍保留在 Hub 里，作为历史记录。**

> 某种意义上，retired 的 Skill 就是组织 AI 系统的"考古档案"，未来如果有人想看"我们曾经怎么处理这类问题"，还能查到。

## 一个生命周期治理仪表板长什么样

整合上面所有阶段，企业 Skill Hub 应该有一个"生命周期仪表板"：

```
=== Skill Hub Lifecycle Dashboard ===

Status overview:
  draft:         12   (本周新增 3)
  experimental:  28   (有 5 个超期 14 天未升档)
  canary:         9   (有 1 个灰度满 7 天，待升档)
  stable:        87   (健康)
  deprecated:    11   (其中 4 个剩余迁移期 < 7 天)
  retired:       34   (已归档)

Health alerts:
  ⚠ skill-x: 步骤数 7 天内 +25%（疑似漂移）
  ⚠ skill-y: deprecated 但仍有 200 次/天调用，未迁移
  ⚠ skill-z: experimental 90 天，仍未升档（疑似遗忘）

Action queue:
  - 5 个 Skill 待 review
  - 3 个 Skill 等待灰度审批
  - 2 个 Skill 等待 stable 审批
  - 4 个 Skill 进入 retire 倒计时
```

这种仪表板的好处：

- Skill 不会被"遗忘"
- 健康问题能被及时发现
- 治理动作有 backlog 而不是凭记忆

> 仪表板不是"装饰"，而是把"长期治理"这件事从老板嘴上的口号，变成每周可以跟进的 backlog。这是 Hub 真正能跑很久的关键。

## 真实场景：被遗忘的"实验性 Skill"

讲一个真实例子。

某团队 1 月份创建了一个 Skill `db-migrate-advisor`，标记为 experimental，主要用于辅助数据库迁移。

写完之后没人继续推进，也没升档。但这个 Skill 仍然在 Hub 里能被调用。

到了 4 月份，公司一次大型数据迁移，有人发现 Hub 里有这个 Skill，就调用了。

**结果**：Skill 写的还是 1 月份的逻辑，期间数据库版本升级了，部分语法已经过时。Skill 引导工程师用了已废弃的迁移方式，**差点出事**。

复盘后做了三件事：

1. 给 experimental 加超期检查：超过 60 天未升档自动告警
2. 给 deprecated 加调用量监控：仍有调用且超期未迁移自动告警
3. 给 stable 加漂移监控：指标趋势明显恶化自动告警

> **这就是生命周期治理的真实价值。它不是"流程多"，它是"让东西不会被遗忘"。**

## 我的判断

我现在越来越觉得，Skill Hub 不是一个"仓库"，而是一个 **生态**。

仓库只关心"东西放进来了没"。

生态关心的是：

- 这个东西从哪来？
- 谁在维护它？
- 它现在健康吗？
- 别人在用它吗？
- 它什么时候该退场？

**把 Skill Hub 当生态来做，企业 AI 能力才能真正持续演进。**

下一篇我会进入更具体的实战层面：企业级 Skill Hub 的架构设计。前面我们讲的所有规范、门禁、生命周期，背后都需要一套架构来承载。这套架构怎么设计、怎么取舍、跟什么系统对接，下一篇说清楚。

## 可进一步阅读

- DevOps Service Lifecycle Management 经典实践
- Hermes Agent 文档中关于 Skill 状态的部分
- Kubernetes Resource Lifecycle 设计思想（很多模式可以借鉴）
