# 去哪儿网 AI Coding 研发平台实践：L0-L5 自动化分级 + Harness 四把锁 + QunarDevCenter + 天弦 QDO

## Ch05.097 去哪儿网 AI Coding 研发平台实践：L0-L5 自动化分级 + Harness 四把锁 + QunarDevCenter + 天弦 QDO

> 📊 Level ⭐⭐ | 3.6KB | `entities/qunar-ai-coding-platform-practice-l0-l5-harness.md`

## 核心概述

去哪儿旅行（Qunar）基础架构负责人李佳奇的技术大会分享，完整还原一个数千人研发组织全面落地 AI Coding 的路径。核心框架包括：AI Coding L0-L5 自动化分级体系、Harness 四把锁控制模型、QunarDevCenter 数据采集平台、天弦 QDO 编排引擎。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/qunar-ai-coding-platform-practice-l0-l5-harness.md)

## AI Coding L0-L5 自动化分级

借用自动驾驶分级，业界最清晰的 AI Coding 阶段定义：
- **L0** 全手动
- **L1** 代码补全与辅助（Copilot 级别）
- **L2** 部分自动生成（模块级）
- **L3** 有条件自动化（需求→可运行代码，阻塞求援）
- **L4** 高度自动化（AI 承担大部分交付流水线）
- **L5** 完全自动化（需求到上线 AI 完成）

## Harness 四把锁

Harness = AI 研发过程控制能力。核心不是模型多强，而是约束/隔离/审查组成的工程体系：

1. AI 触发机制（Skills/Workflow/Agent 流程化调用）
2. 约束与门禁（模板、规范、质量标准、准入拦截）
3. 安全隔离环境（沙箱/虚拟环境）
4. 人工审查节点（12 个环节各有关口）

## 度量体系

**AI R&D Metrics = Volume x Maturity**

| 量的指标 | 质的指标 |
|---------|---------|
| 出码率、出码量 | Coding 自动化水平（L1-L3） |
| 团队覆盖率、需求覆盖率 | Harness 等级（Refined） |

出码率计算：生产基线对比——两次 tag 间所有 commit 中 Git Blame 区分 AI vs 人类。

自动化水平 Insight：T（绝对时长）/ M（用户消息数）/ C（用户输入字符数）三维度越小越好。

## QunarDevCenter

AI Coding 数据采集平台：Session 数据采集（jsonl/SQLite）→ 扫描过滤（mtime/size 缓存、sha1、gitRemote 白名单）→ 调度上传。三张核心表设计覆盖原始内容、会话元数据、AI 代码变更。

## 天弦 QDO

AI 研发自动化编排引擎。JDK 自动升级案例：211 个应用，编译通过率 93%。

架构分层：Skill 接入 > Agent 执行 > QDO 调度 > 用户交互。三种 Coding 模式：交互式、自动化、批处理。

## 关键经验

- **先度量，再规模** — 没有度量就没有改进方向
- **Harness 决定上限** — 约束/隔离/审查比模型选择更重要
- **出码率必须可下钻** — 到部门/项目/人/session/文件级别
- **数据驱动透明文化** — 公开看板形成组织加速器
- **AI Coding 终极形态** — 从个人提效到组织能力复利

## 相关实体

- [Agent Harness 架构](ch05/039-agent-harness.html) — Harness Engineering 概念框架
- [Enterprise Readiness Maturity Model](../ch11/218-enterprise-readiness-maturity-model.html) — 企业成熟度模型
- [从 SDD 到 Lattice Harness](ch05/100-ai-coding.html) — 另一团队级 AI Coding harness 实践
- [AI Infra 全景 9 层架构](../ch01/1204-ai-infra.html) — AI 基础设施全景

---

