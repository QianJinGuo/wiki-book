# Skill Hub MVP：可评估、可回滚、可发布的 Agent Skill 治理平台

## Ch04.656 Skill Hub MVP：可评估、可回滚、可发布的 Agent Skill 治理平台

> 📊 Level ⭐⭐ | 2.7KB | `entities/skill-hub-mvp-evaluation-rollback-release.md`

# Skill Hub MVP：可评估、可回滚、可发布的 Agent Skill 治理平台

winty 的 Skill Hub MVP 实现（~400 行 Python），将 Skill 的注册、版本评估、跨版本对比、自动门禁、灰度路由、一键回滚核心闭环完整跑通。不依赖商用工具或外部数据库，mock LLM 调用，聚焦于工程治理结构。

## 六组件架构

| 组件 | 职责 | 核心接口 |
|------|------|----------|
| **SkillRegistry** | 文件系统版本管理 | register(name, version, content) / load_skill(name, version) |
| **EvalEngine** | 跑评估出 4 层指标 | evaluate(name, version, test_set) → EvalMetrics |
| **CompareService** | 版本对比 + Blocker 检测 | compare(v1_metrics, v2_metrics) → CompareReport |
| **PromotionGate** | 自动门禁决策 | can_promote_to_canary(metrics) / can_promote_to_stable(compare, days) |
| **CanaryRouter** | 按调用方灰度路由 | resolve_version(skill, caller) → version |
| **RollbackService** | 一键回滚 | promote(skill, version) / rollback(skill) → prev_version |

## 文件系统存储结构

```
hub/
  skills/{name}/{version}/skill.md
  skills/{name}/state.json   # {"stable": "1.0.0", "canary": "1.1.0"}
  evaluations/{name}/{version}.json
```

阶段 1（Skill < 30、团队 < 3）完全够用，规模上来再换数据库，模型不变。

## 门禁规则（CI 强制阻断）

- L3/L4 回退 > 3 个百分点 → 拦截
- L4 < 90% 硬底线 → 拦截
- Token 增幅 > 25% → 拦截
- 灰度天数 < 7 → 不能 promote 到 stable

## 与 DevOps 的类比

Skill Hub 解决的是"**AI 经验到生产**"的链路（Skill → 评估 → 灰度 → 回滚 → 监控），与 DevOps 解决"代码到生产"的链路一脉相承。主体从"代码"变成了"Skill"，但工程治理逻辑不变。唯一不同的是 Skill 的评估取代了传统测试，成为整套体系的核心。

## 与其他实体的关系

- → [企业级 Skill 8 块最小骨架 + 8 条 checklist](ch04/267-skill.html) — 同作者 winty，侧重 Skill 本身的设计规范
- → [Skill Hell：Agent Skill 工程落地](ch04/352-skill-hell-agent-skill.html) — Skill 工程化的实践挑战
- → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/skill-hub-mvp-evaluation-rollback-release.md)

---

