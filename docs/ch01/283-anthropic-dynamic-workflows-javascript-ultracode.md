# Anthropic Dynamic Workflows 深度实战：JavaScript 编排脚本 + ultracode 模式 + /deep-research + 保存复用

> 📊 Level ⭐⭐⭐ | 7.7KB

→ [原文存档](https://mp.weixin.qq.com/s/KmlyQ0UxWyoZ2ha9i0nx-g)

## 深度分析

### 两篇来源拼出的完整图景

第 1 来源给出本体与上手路径，第 2 来源补齐原语与模式。合成框架：Claude 现场写一段 JavaScript 编排脚本后台运行，脚本只管调度、不碰文件系统与 shell，主 Agent 睡到最后才读结果。与 subagent/skill 的分野在"谁握着计划"——subagent 逐轮判断、skill 按 prompt 走、workflow 由脚本决定下一步；subagent 的 10 份中间结果全部涌回对话上下文，workflow 只回传一份汇总。

### 三种原语与六种模式：编排的最小词汇表

agent(prompt, opts) 开上下文干净的子 Agent、可用 JSON Schema 约束输出；parallel(...) 是栅栏，全部跑完才放行；pipeline(items, ...) 流水过工序、先完成先走。开几个 Agent、用哪档模型由 Claude 按任务自定。六模式归三族：分流（分类即处理）、并行（扇出+汇总、生成+筛选、锦标赛）、制衡（对抗验证——验者与行者互不通气，结论只在"反驳失败"后算数）。

### 结构性解药：偷懒、自夸、跑偏

单上下文扛长任务有三样毛病：审 50 个文件到 35 个就宣布干完（偷懒）、验证自己的产出偏袒旧结论（自夸）、摘要反复压缩丢失约束（跑偏）。结构性解法：隔离让没人握着整个任务，独立验证 Agent 让验活与干活分家，短窗口摁住跑偏。 /deep-research 即实例：多角度搜索、交叉核对来源、逐条表决，未过验证的结论直接剔除。

### ultracode 与失败面：何时值得烧 token

/effort ultracode 拉满推理并授权自动判断何时起 Workflow，复杂请求可拆成连续几个。 代价是 token 消耗明显更高，唯一判断标准：是否真需要比"一个上下文窗口"更多的算力——50 文件审计值得上，两行 bug 是杀鸡用牛刀。 失败面在扇出+汇总：parallel 栅栏若把全部分支产物回灌主上下文，就退化成 subagent 式臃肿；prompt 含 workflow 关键词即可能触发。

### 沉淀与定位：编排权从人移向模型

面板按 s 保存到 ~/.claude/workflows，沉淀的是一整套编排逻辑而非流程图；保存的是模板而非死脚本，重跑按任务自适应；运行有 ID 可恢复。 这条线指向同一结局：编排正从"人设计架构"挪向"模型自己决定"，人只说清什么算成功、信任边界在哪。

### 关联实体

- [龙虾装上了可以用来干啥分享下我的 Openclaw 多智能体团队搭建经验 V2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/龙虾装上了可以用来干啥分享下我的-openclaw-多智能体团队搭建经验-v2.md)
- [两万字详解Claude Code源码核心机制](https://github.com/QianJinGuo/wiki-public/blob/main/entities/两万字详解claude-code源码核心机制.md)
- [你不知道的 Agent原理架构与工程实践 V2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/你不知道的-agent原理架构与工程实践-v2.md)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/openclaw-完全指南这可能是全网最新最全的系统化教程了32w字建议收藏-v2.md)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/entities/karpathy-最新访谈从-vibe-coding-到-agentic-engineering.md)
- [构建基于多智能体架构的深度思考交易系统 V2](https://github.com/QianJinGuo/wiki-public/blob/main/entities/构建基于多智能体架构的深度思考交易系统-v2.md)
- [Agentic Workflow Patterns](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agentic-workflow-patterns.md)
- [Multi Agent Context Isolation](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/multi-agent-context-isolation.md)
- [Context Window Economics](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-window-economics.md)

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/mlops-training-inference.md)

---

## 第 2 来源 — 动态工作流六种编排模式详解 + agent/parallel/pipeline 原语（2026-06）

> Source: [原文存档](https://mp.weixin.qq.com/s/oppul-tJ8_X5ZRLX6NMzPg)
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

→ [第2原文存档](https://mp.weixin.qq.com/s/oppul-tJ8_X5ZRLX6NMzPg)

---

