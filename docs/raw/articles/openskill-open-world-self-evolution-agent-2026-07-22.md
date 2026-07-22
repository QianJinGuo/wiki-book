---
title: "深读 OpenSkill：不给答案不看测试，Agent 自进化"
source_url: "https://mp.weixin.qq.com/s/SJ4UCnNzVG_sOj9Y0gKV1A"
source_account: "系统与旷野"
author: "系统与旷野"
ingested: 2026-07-22
type: raw-article
tags: [openskill, self-evolution, open-world, skill-creation, virtual-verifier, skillsbench]
review_value: 7
review_confidence: 5
review_vxc: 35
review_decision: raw-only
sha256: 238c230411413ec2fa47560972198356dd2f8b290f56ca51be05da4d5d8484e0
---

# 深读 OpenSkill：不给答案不看测试，Agent 自进化

> **来源**：系统与旷野
> **评分**：v=7, c=5, v×c=35 → **Raw only**
> **论文**：OpenSkill: Open-World Self-Evolution for LLM Agents

## 核心设定

Agent 只有任务说明、执行环境、基础模型、工具访问和开放世界资源。**不能**看隐藏答案、测试、reward、verifier 输出或 solution trace。

两个耦合目标：构造 skill content + 构造 verification signal。

## 三阶段流程

1. **知识检索**：根据任务和环境检索外部资料（技能知识 + 验证锚点）
2. **Skill 创建 + 虚拟验证**：生成 1-4 个 skill → sandbox 执行 → Virtual Verifier 生成 pytest suite → 失败后诊断（bug vs 知识缺口）→ 最多 3 轮迭代
3. **评估**：skill 冻结后才解锁 GT tests，评估最终任务完成度

## 结果

| Target Agent | No Skill | Best Auto | OpenSkill | Human Ref |
|-------------|----------|-----------|-----------|-----------|
| Opus 4.6 | 25.5% | 34.7% | **43.6%** | 44.5% |
| GPT 5.2 | 25.0% | 33.3% | **42.1%** | 44.8% |

8/11 和 7/11 领域 best or tied-best。

## Virtual Verifier

Precision 56.9%, Recall 80.5%, Overall agreement 60.7%。覆盖 88.9% GT test intents (120/135)。不是完美裁判，但提供了足够有用的中间信号。

Failures: near-miss 误判、领域知识不足（化学/代码翻译）导致 FP；assertion 太严、pytest 不适配（CVE patch/proof assistant）导致 FN。

## 跨模型迁移

Opus 4.6 生成的 skill 给 Haiku 4.5/Qwen 3 Coder/DeepSeek V3/Mistral Large 3，提升 +5.5 到 +14.8pp。Skill 学到的是任务知识而非模型调用习惯。

## 成本

单任务 ~1.14M tokens / 131 分钟。全量 84 任务 ~140 小时 / 97M tokens / ~$1800。

## 工程启示

- Skill 应尽量成为显式 artifact（可读、可编辑、可迁移）
- 自造测试是练习场，不是真实世界
- 信息隔离审计：过滤 benchmark name、GT tests 不挂载、verifier 独立 session
