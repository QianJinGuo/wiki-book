# yidian tianxia context engineering agentic ai

## Ch04.229 yidian tianxia context engineering agentic ai

> 📊 Level ⭐⭐ | 10.2KB | `entities/yidian-tianxia-context-engineering-agentic-ai.md`

# 易点天下 Context Engineering — 企业级 Agentic AI 工程化实践
## 核心定位
易点天下 QCon 2026 演讲，核心命题：**如何驯服 Agent 的"幻觉"与"遗忘"，让概率性 AI 稳定运行在确定性企业生产系统上**。  

## 六层上下文体系（L1–L6）
| 层级 | 名称 | 技术 | 核心作用 |  
|------|------|------|---------|  
| L1 | Session Memory | PostgreSQL（session_id 硬隔离）| 当前会话读写 |  
| L2 | Short-Term | 24小时跨会话窗口 | 短期故障复发识别 |  
| L3 | Long-Term | 记忆引擎 + 向量存储 | 对话 → 客观事实持久化 |  
| L4 | Knowledge Graph | LLM 抽取三元组 + 图数据库 | 微服务拓扑认知 |  
| L5 | Experience | 故障模式聚类 + 经验标签 | "OOM 先查 limits" 类自动注入 |  
| L6 | Skill | 标准化 Markdown（人工验证）| **个人经验 → 团队资产** |  

## 主动注入三钩子
| 钩子 | 触发时机 | 作用 |  
|------|---------|------|  
| UserMessage Hook | Agent Loop **前** | 意图过滤 + 双路召回注入 System Prompt |  
| PreToolUse Hook | 敏感工具调用**前** | 资源 ID 匹配历史风险记录 |  
| ErrorSignal Hook | 检测到错误关键字**时** | 自动拉取历史解法注入 |  
**设计思想**：记忆从被动资料库 → 主动副驾驶，知识在需要之前到位。  

## Token 预算治理：L0/L1/L2 三级分层
| 级别 | Token | 触发条件 |  
|------|-------|---------|  
| L0 Abstract | ~100 | 相关度 ≤ 0.8 |  
| L1 Overview | ~300 | 相关度 > 0.8 |  
| L2 Full | 全量 | 主动 Read 时 |  
**效果**：单次注入 Token 消耗 **↓80%**  

## 渐进式工具加载（Deferred Tool Registry）
- 初始仅激活核心工具，长尾工具仅保留极简描述
- 按需通过 tool_search 动态唤醒
- 工具调用准确率 **70% → 90%**
- 重复性问题处理 **60秒 → 5秒以内**

## 五道纵深安全防线
```  
仅 1 层允许 LLM 参与决策  
↓ 4 层全部规则代码物理兜底  
Layer 1: NamespaceGuard（白名单准入）— kube-system 等核心命名空间屏蔽  
Layer 2: Dry Run + HITL（试执行+人工介入）— 唯一 LLM 参与的验证层  
Layer 3: 资源锁+爆炸半径限制 — 防止级联雪崩  
Layer 4: 规则校验 — 不依赖 LLM 自然语言回复，重新调系统接口对比状态  
Layer 5: 强制回滚机制 — 所有修改类工具必须附带降级回滚逻辑  
```  
**效果**：复杂集群操作误执行率接近零。  

## V1 → V2 演进
| 问题 | V1 方案 | V2 方案 |  
|------|---------|---------|  
| 分类错误率高 | 低代码线性 Workflow，错误率 15% | Agent Loop + Context Engineering |  
| 记忆不可持久化 | 单次窗口 | L1–L6 分层记忆体系 |  
| 无法跨域协同 | 固定编排各自为战 | 15轮工具调用循环 |  
| 工具选择错乱 | 全量 Tool Schema 塞入 Prompt | 渐进式工具加载（Deferred Tool Registry）|  
| Token 窗口紧张 | 粗放式注入 | L0/L1/L2 分层 + 按需动态选档 |  

## 核心方法论
**上下文工程三问**：  
1. 信息如何**进得来**（分层记忆 + 主动注入）  
2. 无关信息如何**挡得住**（相关度动态选档 + 硬预算降级）  
3. Token 如何**花在刀刃上**（L0/L1/L2 三级分层 + PreCompact 压缩续接）  

## 相关概念
- [Factory Mission](../ch01-864-factory-mission-multi-agent-architecture/) — 同为 Agent Loop 架构，但 Mission 侧重多 Agent 编排，易点天下侧重企业级单 Agent 深度工程
---  
*Last updated: 2026-05-08*  
*评审：Value 8 × Confidence 7 = 56 | ★★★★ | STRONG PASS*  

## 相关实体
- [Agentic AI for Subsurface Engineering Simulation (NVIDIA)](../ch04-313-nvidia-agentic-ai-subsurface-engineering/)
- [从Vibe Coding到Agentic Engineering：重构后台开发全流程 — 腾讯技术工程](../ch04-191-tencent-vibe-coding-to-agentic-engineering-backend/)
- [AI 时代 Git 版本管理 — Agentic Coding 最佳实践](../ch01-189-ai-时代的-git-版本管理最佳实践/)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](../ch04-122-karpathy-最新访谈-从-vibe-coding-到-agentic-engineering/)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](../ch09-019-karpathy-最新访谈-从-vibe-coding-到-agentic-engineering/)

## 深度分析
**1. 六层上下文体系（L1–L6）的系统性工程视角**  
yidian-tianxia 的六层上下文体系是本 wiki 所有 context engineering 相关实体中层次最完整的分层框架。值得注意的是：L1（Session Memory）到 L6（Skill）的划分本质上是"记忆时间尺度 × 抽象层级"的双维度分割，而非简单堆叠。L3（Long-Term）负责对话到客观事实的转化——这是从"主观对话记录"到"客观知识资产"的关键跃迁，需要 LLM 做信息蒸馏（information distillation），而非简单存储。L4（Knowledge Graph）引入图数据库表示微服务拓扑，说明上下文工程在云原生运维场景中的具体化——上下文不只是对话历史，还包括系统架构知识。  
**2. 三钩子（Hooks）机制的 AOP 思想**  
UserMessage Hook、PreToolUse Hook、ErrorSignal Hook 的设计借鉴了 AOP（Aspect-Oriented Programming）的思路：在核心 Agent Loop 的关键切点（loop 前 / 工具调用前 / 错误发生时）注入横切关注点（cross-cutting concerns），而不修改 Loop 本身。这与 Hermes 的"主循环克制，外围灵活"哲学异曲同工。区别在于：Hermes 的外围模块是独立的调度模块，而易点天下的方案是把横切逻辑封装为可组合的 Hook——前者是"分离关注点"，后者是"可插拔横切"，两者是正交的，可以结合使用。  
**3. Token 预算治理的"动态档位"创新**  
L0/L1/L2 三级分层注入（~100 / ~300 / 全量）是 token 预算治理的精细化实践，其核心创新在于"相关度动态选档"而非"固定压缩率"。传统 RAG 的上下文压缩通常是按比例压缩（retain 70%），而这里是按相关度阈值（≤0.8 / >0.8）触发不同档位——这是一个离散化而非连续化的控制策略，好处是行为可预测、调试容易，坏处是存在相关度刚好在 0.8 附近的边界震荡问题。效果"单次注入 Token 消耗 ↓80%"的代价是：Agent 在相关度临界点附近的行为可能出现不稳定跳变。  
**4. 五道安全防线的"LLM 参与最小化"原则**  
易点天下的五层纵深安全防线明确了一个关键原则：只有 1 层（Dry Run + HITL）允许 LLM 参与决策，其他 4 层全部是规则代码物理兜底。这是对"LLM 不可靠性"的清醒认知——在集群操作等高风险场景中，即使 LLM 判断正确 99% 的时间，1% 的失败率在规模化操作中也是不可接受的。规则兜底层的存在，使得即使 LLM 被提示词注入攻击（prompt injection）误导，物理安全检查依然能阻断危险操作。  
**5. V1→V2 的演进揭示的 Agent 工程化路径**  
从 V1 的问题（分类错误率 15%、单次窗口记忆、固定编排、全量 Tool Schema）到 V2 的解决，可以看到企业 Agent 系统的典型演进路径：线性 Workflow（V1）→ Agent Loop + Context Engineering（V2）。这个演进不是"技术替代"而是"能力升级"——Workflow 的规则可预测性优势（错误率可精确控制）在某些场景仍然有价值，Agent Loop 的灵活性优势在另一些场景才真正必要。V2 选择了 Agent Loop，但保留了 V1 的确定性强项（如分类场景的线性路径）。  

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/yidian-tianxia-context-engineering-agentic-ai-qcon.md)

## 实践启示
**1. 用"上下文工程三问"审计现有 Agent 系统**  
"信息如何进得来 / 无关信息如何挡得住 / Token 如何花在刀刃上"是诊断任何 Agent 系统的三个基本问题。对照这三个问题审查现有系统：记忆层是否覆盖了所有时间尺度的信息？无关信息是否有明确的过滤机制？Token 预算是否有显式的管控策略？很多 Agent 系统的"幻觉"问题，根源不在模型不够强，而在上下文工程做得不够系统——模型在错误或不完整的上下文中推理，再强的模型也救不了。  
**2. 渐进式工具加载（Deferred Tool Registry）是生产级 Agent 的标配**  
工具全量塞入 Prompt 的方案在工具数量 <20 时尚可接受，超过这个规模后 Tool selection 的准确率急剧下降。Deferred Tool Registry（初始仅核心工具，按需唤醒）是一个已被验证有效的方案。对于工具数量可能持续增长的生产系统，这个设计应该在架构阶段就引入，而非后期打补丁。实现关键是：工具描述的召回率（不遗漏必要工具）与精确率（不误触发无关工具）之间的平衡，需要通过真实调用日志持续调优。  
**3. 生产环境 Agent 安全：纵深防御 + LLM 最小参与**  
高风险操作（集群修改、删除、数据写入）的 Agent 系统的安全设计，应该遵循"LLM 最小参与 + 规则物理兜底"原则。具体实践：在 PreToolUse Hook 中加入资源 ID 与历史风险记录的匹配（已有风险的操作提高警惕级别）；所有修改类工具必须附带降级回滚逻辑（Force Rollback 机制）；建立"安全操作白名单"对高危 namespace（如 kube-system）进行物理屏蔽，不允许任何 LLM 判断介入。  
**4. 从 V1 到 V2 的迁移策略：平行运行 + A/B 切换**  
对于已有 V1 Workflow 的团队向 V2 Agent Loop 迁移，建议平行运行阶段：V1 处理确定性强、规则清晰的 case，V2 处理灵活度高、规则难以枚举的 case。在平行运行期间持续对比两者的：错误率、响应延迟、token 消耗。当 V2 在所有维度均显著优于 V1 时，再做全面切换。不要在未经验证的情况下直接替换——Workflow 的确定性是风险可控的基线，不应该轻易放弃。

---

