# Anthropic Dynamic Workflows 深度实战：JavaScript 编排脚本 + ultracode 模式 + /deep-research + 保存复用

## Ch11.172 Anthropic Dynamic Workflows 深度实战：JavaScript 编排脚本 + ultracode 模式 + /deep-research + 保存复用

> 📊 Level ⭐⭐ | 6.7KB | `entities/anthropic-dynamic-workflows-ultracode-deep-research-lyuyuebannzi.md`

# Anthropic Dynamic Workflows 深度实战：JavaScript 编排脚本 + ultracode 模式 + /deep-research + 保存复用

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/anthropic-dynamic-workflows-ultracode-deep-research-lyuyuebannzi.md)

## 深度分析

Anthropic Dynamic Workflows 深度实战：JavaScript 编排脚本 + ultracode 模式 + /deep-research + 保存复用 涉及agent领域的核心技术议题。
### 核心观点
1. # Anthropic Dynamic Workflows 深度实战：JavaScript 编排脚本 + ultracode 模式 + /deep-research + 保存复用
> 来源：林月半子的AI笔记（2026-06-05）
> **关系**：与现有 5+ 译本（机器之心 / Thariq / 玉澄 / 架构师 JiaGouX）的同源不同公众号报道。
2. 保留独家数据：ultracode 模式 + /deep-research + 3 步跑起来 + 编排者哲学（"AI 写编排代码 vs 人写编排代码"）。
3. ## 一、Dynamic Workflows 是什么？
4. 上周 Anthropic 发布了 Dynamic Workflows，24 小时不到就被人公开指控"抄袭"。
5. 一个叫 Sisyphus Labs 的团队直接在推特上@了 Anthropic，说 Claude Code 新推的 **ultracode 模式**跟他们做的 OMO 工具里的 ultrawork 和 atlas 功能几乎一模一样。

### 内容结构
- 一、Dynamic Workflows 是什么？
- 二、Dynamic Workflows 的核心机制
- 关键设计
- 三、与 Subagent / Skill 的核心区别
- 上下文占用差异
- 四、3 步跑起来你的第一个 Workflow
- 准备工作：确保功能已开启
- 触发方式一：在 prompt 里说 "workflow"

### 技术要点

- **agent架构**: 本文在agent方向提出的设计理念与实现路径
- **工程挑战**: 实际落地中面临的关键问题与应对策略
- **anthropic趋势**: 相关技术演进方向与新兴范式
### 关联实体

- [龙虾装上了可以用来干啥分享下我的 Openclaw 多智能体团队搭建经验 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/龙虾装上了可以用来干啥分享下我的-openclaw-多智能体团队搭建经验-v2.md)
- [两万字详解Claude Code源码核心机制](https://github.com/QianJinGuo/wiki/blob/main/entities/两万字详解claude-code源码核心机制.md)
- [你不知道的 Agent原理架构与工程实践 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/你不知道的-agent原理架构与工程实践-v2.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/openclaw-完全指南这可能是全网最新最全的系统化教程了32w字建议收藏-v2.md)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki/blob/main/entities/karpathy-最新访谈从-vibe-coding-到-agentic-engineering.md)
- [构建基于多智能体架构的深度思考交易系统 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/构建基于多智能体架构的深度思考交易系统-v2.md)

## 实践启示
1. **工程落地**: agent领域方案需关注可观测性、可维护性和成本效率
2. **技术选型**: 根据场景选择合适的技术栈，避免过度设计或盲目追新
3. **持续迭代**: 建立数据驱动的反馈闭环，持续优化系统表现
4. **风险管控**: 引入新技术需评估对现有系统稳定性的影响，做好降级预案

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/mlops-training-inference.md)

---

## 第 2 来源 — 动态工作流六种编排模式详解 + agent/parallel/pipeline 原语（2026-06）

> Source: [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/anthropic-dynamic-workflows-six-patterns-agent-parallel-pipeline.md)
> Author: 林月半子的AI笔记

本来源补充了第 1 来源未完整覆盖的 **六种编排模式** 和 **核心原语**。

### 核心增量

1. **三种编排原语**（JavaScript 代码级）：agent(prompt, opts)/parallel(...)/pipeline(items, ...)——第 1 来源未给出具体 API 形式

2. **六种编排模式**（第 1 来源未系统化列出）：

| 模式 | 机制 | 适用场景 |
|------|------|---------|
| 分类即处理 | 先分流，路由给专门 Agent | 工单 triage |
| 扇出+汇总 | 并行各跑，栅栏处汇总 | 审计/调研 |
| 对抗验证 | 一个提出，另一个专挑刺（不通气） | 根因排查/结论复核 |
| 生成+筛选 | 广撒网→按标准筛 | 取名/方案探索 |
| 锦标赛 | 多 Agent 同题竞赛，裁判两两选优 | 模型路由/方案择优 |
| 跑到收工为止 | 动手—检查—修复直到停止条件 | 排查/清扫式发现 |

3. **三个问题的系统化解法**：单上下文窗口的偷懒/自夸/跑偏 → 隔离子 Agent + 独立验证 Agent + 短上下文窗口

4. **/workflows 面板**：实时查看各阶段/子 Agent/token 消耗，可暂停/跳过/重试。可恢复（运行 ID + 缓存）。保存复用（按 s 存到 ~/.claude/workflows，分享给队友）。

5. **诚实判断标准**：是否真的需要比「一个上下文窗口」更多的算力？

### 关键差异

| 维度 | 第 1 来源 | 第 2 来源 |
|------|---------|---------|
| 六种编排模式 | 未系统列出 | **完整六模式表** |
| 原语 API | 未提及 | **agent()/parallel()/pipeline()** |
| token 消耗指引 | 未提及 | **诚实判断标准 + 何时不该用** |
| /workflows 面板 | /deep-research 模式 | **面板操作/保存/分享** |
| 三个问题 | 未提及 | **偷懒/自夸/跑偏系统化解法** |

→ [第2原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/anthropic-dynamic-workflows-six-patterns-agent-parallel-pipeline.md)

---

