---
title: "Claude模型的上下文工程新规"
source_url: "https://mp.weixin.qq.com/s/KgY_4cXCw5p8lG85hWou7Q"
source_account: "若飞 / 架构师 (JiaGouX)"
ingested: 2026-07-28
sha256: "f5eb2dcd3ba25ccde7481c3ad679190cc5e98c8119b197246895a2b740f99978"
type: raw-article
tags:
  - context-engineering
  - claude-code
  - system-prompt
  - anthropic
  - harness-engineering
  - prompt-optimization
  - agent-architecture
  - progressive-disclosure
  - evaluation
score_v: 8
score_c: 6
score_vc: 48
decision: supplementary
entity: harness-engineering
---

# Claude模型的上下文工程新规

> 模型能力变化以后，旧上下文里的每一项责任，都要重新确认由谁承担。有的内容可以删除，有的只是换了位置，还有一些边界从一开始就不该由提示词单独负责。

## 核心命题

Anthropic 官方披露 Claude Code 面向 Opus 5/Fable 5 等新模型删除超过 80% 系统提示词，在内部编码评测中没有测到损失。但这句话有四个边界：
1. **产品**是 Claude Code
2. **对象**是系统提示词（不含工具描述/Skills/CLAUDE.md/记忆等）
3. **使用的**是指定的新模型
4. **验证手段**是 Anthropic 内部编码评测

核心工程问题：模型能力变化后，旧上下文里的每一项责任都要重新确认由谁承担。

## 一次请求的三层上下文装配

提出「最小充分工作集」理念，以结算页文案修改为例，将装配分三层：

| 层级 | 内容 | 特点 |
|------|------|------|
| **常驻层** (Always-on) | 产品身份、稳定行为、仓库长期约定 | 跨任务复用，和产品/模型绑定 |
| **按需层** (On-demand) | Skills、参考资料、当前代码、测试 | 渐进式披露，按任务触发 |
| **强制层** (Hard-control) | 工具校验、权限、审批、审计 | 执行层生效，不进入上下文 |

三层放之四海皆准：季度复盘、高铁行程规划、数据库迁移都适用同一套装配逻辑。

## 六处责任迁移（Anthropic 官方变化）

| 变化 | 旧做法 | 新做法 |
|------|--------|--------|
| 系统提示词 | 硬编码行为禁令 | 模型结合仓库现场判断 |
| 工具描述 | 大量调用示例 | 接口设计让参数自己说话 |
| Skills | 常驻上下文 | 按任务加载（渐进式披露） |
| 重复说明 | 多处出现 | 唯一事实源 |
| 记忆 | 与 CLAUDE.md 混用 | 分离，记忆带版本/时效 |
| 规格 | 简短文字 | 代码+测试+HTML 原型 |

## 五条新规

1. **同一产品，也会因模型而异** — 旧模型、新模型、低成本模型的判断力不同，不宜共享同样详细的行为提示
2. **一条信息，只有一个主要责任** — 每条规则最好只有一个事实源，避免版本漂移
3. **按需加载离不开触发条件** — Skill 需明确：解决什么任务、哪些信号触发、入口在哪、读什么资料、留什么证据
4. **接口问题先回到接口** — 排查顺序：工具名→参数→枚举→默认值→错误信息→权限边界
5. **精简之后，还要留下证据** — 改了哪一层、用哪组任务比较、哪些失败算退化、怎样回到旧版本

## 上下文装配单（context_contract 模板）

```yaml
context_contract:
  task_class: checkout-ui-change
  model_profile: claude-opus-5
  always_on:
    - product-role
    - repo-gotchas
  on_demand:
    - skill: verify-ui
      when: ui-or-test-behavior-changes
  references:
    - apps/checkout/checkout.html
    - apps/checkout/checkout.spec.ts
  hard_controls:
    - sandbox
    - production-write-denied
  evidence:
    - targeted-tests
    - ui-text-assertion
  owner: frontend-platform
  review_after: "2026-09-01"
  rollback_to: context/v12
```

起步可只保留六个字段：task_class、model_profile、on_demand、hard_controls、evidence、owner。

## 评测四类信号

| 信号 | 问题 |
|------|------|
| 任务做对 | 功能完成？测试通过？Diff 符合风格？ |
| 过程变差 | 无效调用？重复搜索？成本翻倍？ |
| 旧失败回来 | 删除规则后旧问题重现？ |
| 高风险边界被碰 | 越权写入？生产访问？审批绕过？ |

建议 20-50 个真实任务，按模型轴（当前/候选/降级）× 任务轴（日常/跨模块/工具边界/高风险）交叉组织。一次只改一个主要变量。

## 延伸：非编码场景
- **季度复盘**：团队术语常驻，本季度数据按需加载，敏感脱敏由系统执行
- **高铁行程**：座位偏好长期保留，实时余票按次查询，付款前确认由系统执行
- **数据库迁移**：SLO/合规常驻，拓扑/压测结果按需加载，灰度/回滚由控制面执行

## 关联
- → [[entities/harness-engineering|Harness Engineering：第三代工程范式]] — 本文的 Context Engineering 深化了实体中「第 6 来源」的 Context vs Harness 对照表，新增三层装配模型和 context_contract 实践模板
- → [[entities/claude-code-80-prompt-trim-thariq-context-engineering-2026|Claude Code 80% 提示词删减]] — 同一主题的补充视角
