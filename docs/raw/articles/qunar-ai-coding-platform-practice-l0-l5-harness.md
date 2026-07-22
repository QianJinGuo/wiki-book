---
title: "去哪儿网AI Coding研发平台实践：从工具试点到范式升级"
source_url: "https://mp.weixin.qq.com/s/Ug_fMuGkQmM4tECUbpfXOg"
author: "李佳奇（去哪儿旅行基础架构负责人/技术总监）"
feed_name: "AI Coding 深度实践"
publish_date: 2026-06-24
created: 2026-07-05
ingested: 2026-07-05
tags: [ai-coding, harness-engineering, enterprise, qunar, maturity-model, qdo, devcenter, metrics, skills, l0-l5, wechat]
type: article
review_value: 9
review_confidence: 9
review_recommendation: strong
review_stars: 5
sha256: cb79108ba6bcf05c4f9f778f6c6f3fea7641cb752790a6ed2e34d1223e59ddd3
---

# 去哪儿网AI Coding研发平台实践：一份值得所有技术管理者读三遍的样本

> 内容来源：去哪儿旅行基础架构负责人/技术总监 李佳奇的技术大会分享。
> 主题：从工具试点到范式升级——去哪儿网是如何把 AI Coding 从"个人玩具"做成"组织能力"的。

## 背景

去哪儿作为一家典型的大型 OTA（在线旅游）公司，在 2025 年做了一个激进的决定——**全面落地 AI Coding**。结果：数万 PD 级业务提效、近亿级业务价值。

核心问题：当公司决定 All in AI Coding 时，作为基础架构团队，到底应该先做什么？回答：**先回答"度量"这件事。**

## AI Coding 度量体系

### 过程指标 vs 效果指标

| 过程指标（易误导） | 效果指标（真价值） |
|-----------------|-----------------|
| 出码率 90% | 研发效率提升（可进入计划阶段） |
| AI 生成了 100 万行代码 | 业务价值贡献 |

**AI R&D Metrics = Volume x Maturity**

量的度量：出码率、出码量、团队覆盖率、需求覆盖率
质的度量：Coding 自动化水平（L1-L3）、Harness 等级（Refined）

### AI Coding 自动化水平 L0-L5

借用自动驾驶分级体系，业界最清晰的 AI Coding 阶段定义：

| 等级 | 名称 | AI Coding 定义 |
|------|------|---------------|
| L0 | 全手动 | 研发过程完全由人完成 |
| L1 | 代码补全与辅助 | AI 补全变量/函数/样板代码；人承担主要编码和决策 |
| L2 | 部分自动生成 | AI 根据注释/API/上下文生成模块级代码；人负责监控和测试 |
| L3 | 有条件自动化 | 人提供需求/API规范/编码规范；AI 生成可运行代码并测试，阻塞时请求人工 |
| L4 | 高度自动化 | AI 承担大部分编码/测试/集成/交付流水线；人负责目标设定和质量验证 |
| L5 | 完全自动化 | 从需求理解到上线主要由 AI 完成，仅在异常时介入 |

### AI 研发 Harness 水平定义

**Harness = AI 研发过程控制能力。** 衡量 AI 在研发流程中是否被稳定触发、被约束、被隔离、被审查。

**四把锁**：
1. **AI 触发机制** — Skills / Workflow / Agent 让 AI 能力流程化调用
2. **约束与门禁** — 输入模板、编码规范、质量标准、准入条件、失败拦截规则
3. **安全隔离环境** — 沙箱或虚拟环境
4. **人工审查节点** — 需求、设计、合入、灰度、发布等关键节点保留人工确认权

12 个核心研发环节各有 AI 参与控制点（需求文档到生产发布）。

## 整体落地路径

**Step 1**：AI Coding 工具引入和推广（Claude Code、Codex、Cursor）
**Step 2**：基建建设与 AI 接入适配（Skills 网关、统一仓库、安全治理）
**Step 3**：研发自动化平台建设（天弦 QDO，多 Agent 多 Skills 全链路编排）
**Step 4**：全流程数字化采集和分析（QunarDevCenter）

底层闭环：Tool > Infra > Automation > Insight，严格依赖关系。

## QunarDevCenter

面向 AI Coding 落地的数据采集、CLI 代理管理与大模型接入工具。

**四大能力**：
1. Session 数据采集（Claude Code、Codex 会话记录）
2. 多端数据接入（Cursor、Copilot、OpenCode 等）
3. 本地过滤上报（仅上传公司 GitLab 相关会话，安全红线）
4. 模型与 Thinking 支持

**数据流程**：发现 Session 文件（扫描 jsonl/SQLite）> 扫描过滤（mtime/size 缓存、sha1 解析、gitRemote 白名单）> 调度上传（限速、错误策略、持久化 SQLite）

**三张核心表**：session_upload_objects（原始内容+元数据）、session_meta_info（会话级元信息）、ai_gen_code_change（AI 代码变更记录）

**出码率计算**：生产基线对比——两次 tag 间所有 commit，通过 Git Blame 区分 AI vs 用户。

**自动化水平 Insight**：三维度 T（绝对时长）/ M（用户消息数）/ C（用户输入字符数），越小越好。映射 L1-L3 等级。

## 天弦 QDO

AI Coding 编排引擎。场景：一句话需求、异常修复、Workflow、线上诊断、JDK 升级、Skill 市场。

**JDK 自动升级案例**：累计 211 个应用，编译通过率 93%。规则（OpenRewrite）+ Agent + 流水线 6 步闭环。

**整体架构**：Skill 接入层 > Agent 执行层 > QDO 调度层 > 用户交互层。三种 Coding 模式：交互式、自动化、批处理。

## 经验总结

1. 先度量，再规模
2. Harness 决定上限 — 约束/隔离/审查组成的工程体系比模型更重要
3. L0-L5 分级是团队共同语言
4. 出码率必须可下钻到文件级别
5. 数据驱动文化 + 公开看板 = 组织级加速器
6. AI Coding 终极形态是组织能力复利
