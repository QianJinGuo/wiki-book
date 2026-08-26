# Agent Gym：人机协同的 LLM Agent 持续评估与演化框架（Google Cloud）

## Ch01.1044 Agent Gym：人机协同的 LLM Agent 持续评估与演化框架（Google Cloud）

> 📊 Level ⭐⭐ | 6.0KB | `entities/agent-gym-continuous-eval-evolution-google-2026.md`

# Agent Gym：人机协同的 LLM Agent 持续评估与演化框架（Google Cloud）

> Google Cloud 团队（Pouya Ghiasnezhad Omran 等）第一方论文（arXiv:2608.15591）。解决「静态智能体困境」：agent 行为在部署时冻结，而业务规则和边缘案例持续演化。Agent Gym 是模块化、领域无关框架，把任何现有 LLM agent 包进持续评估-演化循环，**在不修改 agent 源代码**的前提下实现持续评估、行为修正与演化。开源参考实现（发票处理，ADK + Gemini）。

## 六个能力 × 三条架构区

六个可组合能力——**Act、Evaluate、Investigate、Correct、Learn、Observe**——组织在三个架构区：
- **Zone 1 宪法架构**：master data 规范（YAML）+ 重建规则书（Markdown）作为系统宪法，由领域专家手动编写或 bootstrap agent 生成
- **Zone 2 运行时推理管道**：acting agent 产出初始输出 → investigation agent 对照宪法校验 → ALF 引擎应用针对性修正
- **Zone 3 学习演化循环**：会话式学习 agent 让 SME 审阅、识别错误模式、通过程序化安全循环发现新修正规则

五个设计原则：Agent 是黑盒（零内部架构假设）、修正是分层而非侵入（独立下游层，可审计可回滚）、领域知识在配置而非代码、人类治理循环、治理必须分级（案例级 ALF 规则 vs 核心宪法修改分权）。

## 核心机制：三层调查 + ALF 修正引擎 + 程序化安全循环

**Investigation Agent 三层调查架构**（无 ground truth 校验）：Layer 1 确定性检查（数据源校验+绕过检测，无 LLM）、Layer 2 LLM 规则发现（SHA-256 哈希缓存，后续运行摊销到零）、Layer 3 保守交叉验证（三重检查只报三次都确认的违规，降假阳性）。成本控制：内容哈希缓存/节过滤上下文/批量分组/三重检查早期退出，稳态调查成本由确定性检查主导。产出合规分 0-100%（≥80% 全合规 / 60-80% 部分违规 / <60% 重大违规暂停管道）。

**ALF 修正引擎**（检测与修正分离）：检测完全确定性——21 种条件操作符（相等/包含/正则/数值比较/列表成员/null/前缀/动态字段引用）AND 连接、完全可复现；修正三级动作——Tier 1 确定性字段编辑 / Tier 2 手术式修补（LLM）/ Tier 3 管道继续（LLM）。多规则时 Collect-Plan-Execute（Tier3→Tier2→Tier1 固定顺序，作用域互斥保证每 case 至多两次 LLM 调用）。每次修正完整审计。

**程序化安全循环**（关键创新）：在代码中强制而非 prompt，LLM 无法绕过。每条候选规则迭代校验：Schema 校验 → 目标匹配验证（失败则 LLM 保守拓宽）→ 附带影响评估（非预期匹配则自动加窄条件），循环最多三次，任何时刻不经过人工批准不应用。规则生命周期：enabled 标志/时间戳备份回滚/冲突检测/结构化元数据。

## 宪法驱动的 agent 创建与 Spec-to-Note Gap

宪法 artifacts 同时是治理工具和开发规范（双向关系）：宪法即规范（LLM 可用作代码生成 grounding）、bootstrap 与精炼循环（constitution→code→refined constitution 倒转常规流程）、共同演化（修正规则揭示 acting agent 应更新处，宪法进化成活文档）、新 agent 上船（只需 agent + 宪法，计算组件领域无关）。

**Spec-to-Note Gap**：自编码器视角的 agentic 系统透明度——规范(自然语言)→实现(代码/Prompt/工具)→LLM 审计者→透明度 note(自然语言)，形成自然语言上的自编码器；对照 spec 与 note 作为重构损失，暴露缺失能力、静默作用域蔓延、评测套件从未测量的行为。SME 接口：SME 读不懂 harness 但能读结构化 note，评论成为系统 tickets。

## 参考实现与局限

参考实现（发票处理，ADK+Gemini）：统一双模式 LlmAgent（18 个函数工具，推理+学习两模式），自包含 Python 模块。Acting pipeline 九阶段（Classifier→Extractor→Phase1-4 Validators→Transformer→Output Generator→Audit Logger），每阶段编号 JSON artifact 全可追踪。验证属性：领域适应性（换 master data YAML 即适配新文档）、运营就绪、自包含。

**局限**：bootstrap 目前手动；调查 agent LLM 成本随 case/规则组扩展（机制已大幅降低但量化是未来工作）；只在单一领域（发票）验证，多领域验证需确立领域无关性。**未来方向**：自动化规则建议、规则生命周期管理（晋升进 acting agent）、跨领域迁移、自动化 bootstrap、Spec-to-Note 作 release gate。

## 关联实体

- [自演化 Agent 综述](../ch04/289-self-evolving-agents.html) — agent 演化的系统综述
- [Agent 自我改进六机制](../ch03/006-agent.html) — agent 自我改进机制维度
- [Hermes 自演化（腾讯）](../ch03/099-hermes-agent.html) — 自演化 harness 实践
- [LangSmith Trace-Based 自改进](../ch03/006-agent.html) — 基于 trace 的 agent 自改进
- [原文存档（论文）](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agent-gym-continuous-eval-evolution-google-paper-2026.md)
- [原文存档（解读号）](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agent-gym-continuous-eval-evolution-xhs-2026.md)

---

