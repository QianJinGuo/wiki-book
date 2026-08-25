---
source_url: /Users/jinguo/.hermes/cache/documents/doc_af6047ca70e9_Agent_Gym.pdf
source: pdf
title: "Agent Gym: A Framework for Continuous Evaluation and Evolution of LLM Agents Through Human-in-the-Loop Feedback"
ingested: 2026-08-25
type: raw-article
tags: [agent-gym, llm-agent, continuous-evaluation, agent-evolution, human-in-the-loop, rule-engine, constitution, external-correction, domain-agnostic, google-cloud, adk, spec-to-note]
sha256: 6c50b946e5ab61d94d88a2544e27788e0e6155f11cc8023e3373796a689c65ba
---

# Agent Gym: A Framework for Continuous Evaluation and Evolution of LLM Agents Through Human-in-the-Loop Feedback

> Pouya Ghiasnezhad Omran, Michael Zimmermann, Duncan Cambridge, Ashmita Kapoor, Tanya Dixit（Google Cloud）
> arXiv:2608.15591v1 [cs.AI] 16 Aug 2026
> 开源参考实现：github.com/google/adk-samples/tree/main/python/agents/invoice-processing（发票处理场景）

## 核心问题：静态智能体困境

生产环境部署的 LLM agent 面临根本张力：agent 行为在部署时冻结，而它必须处理的业务规则和边缘案例持续演化。现有方法解决 agent 构建和一次性评估，但缺少**不修改 agent 源代码**的持续部署后行为修正机制。市场上多数方案需要密集收集日志和 traces、由工程团队重新审视 agent 设计——过程沉重、漫长，抵消了 agentic 转型的经济价值。

三类生产失败：**边缘案例失败**（agent 遇到训练中未见的文档配置/监管例外）、**系统性误解**（agent 在一整类案例中一致误用业务规则）、**漂移与规则演化**（业务规则随时间变化，agent 无机制吸收）。

传统"领域专家(SME)发现问题→修正 agent 行为"路径穿过软件工程瓶颈：SME 非正式描述→工程师解释→改代码/Prompt→重部署→SME 验证。缓慢、有损、易错、难扩展。

评测挑战：传统框架对比 agent 输出与标注 ground truth，但生产中新案例可能没有 ground truth，且即使有参考数据也未必捕获应支配决策的细微业务规则。

## Agent Gym 框架

模块化、领域无关框架，把任何现有 LLM agent 包进**持续评估-演化循环**。提供六个可组合能力——**Act、Evaluate、Investigate、Correct、Learn、Observe**——组织在三个架构区。

### 三条架构区（Figure 1）

- **Zone 1 宪法架构**：领域配置层，含 master data 规范（YAML）+ 重建规则书（Markdown），共同作为系统宪法。可由领域专家手动编写，或由 bootstrap agent（四阶段 LLM 流水线，分析 acting agent 源码+样例输出）生成
- **Zone 2 运行时推理管道**：三个顺序阶段处理每个 case——acting agent 产出初始输出 → investigation agent 对照宪法校验合规 → ALF 引擎基于学习规则应用针对性修正
- **Zone 3 学习演化循环**：会话式学习 agent 让 SME 审阅 case、识别错误模式、通过程序化安全循环发现新修正规则（保证规则在批准前正确）

### 五个设计原则

1. **Agent 是黑盒**：框架对 agent 内部架构零假设，只观察输入输出行为，任何 agent 可被包装而无需修改
2. **修正是分层而非侵入**：发现错误时在独立下游层修正，保留原始输出、追加修正输出，可审计可独立回滚
3. **领域知识在配置而非代码**：所有领域信息在声明式配置层，新领域只改配置、框架代码不动
4. **人类治理循环**：系统提出的每条修正规则必须经 SME 审阅、批准、验证才加入生产规则库(ALF)
5. **治理必须分级**：运行时规则发现与宪法修改严格分离职责；案例级 ALF 修正规则由领域 SME 发现验证，核心宪法和 acting agent 逻辑的永久修改需多利益相关者管理审批

## 运行时推理管道

### Acting Agent
被观察的系统。唯一结构要求：产出 JSON artifacts 作为输出。处理输入文档，每 case 产出输出 artifact 文件夹（含中间结果和最终结构化输出）。

### Investigation Agent（三层调查架构，Table 2）
无需任何 ground truth 即可对照规则书校验 agent 决策，适用于包括新案例的一切 case：
- **Layer 1 确定性检查**：数据源校验（验证 acting agent 字段值来自正确来源：extraction vs preprocessing）、绕过检测（agent 跳过必需校验步骤）。无 LLM 调用
- **Layer 2 LLM 规则发现**：初始化时把规则书发给 LLM，发现并分类校验规则为结构化组；规则用 SHA-256 哈希缓存，后续运行跳过重新发现除非规则书改变
- **Layer 3 保守交叉验证**：超保守层逐组评估规则；检测到潜在违规时三重检查机制再跑两次，只有三次独立运行都确认的违规才报告，大幅降低假阳性

**成本控制**：内容哈希缓存（Layer 2 首次调用后摊销到零）、节过滤上下文（只提规则书相关节而非全文）、批量分组（确定性规则组合并为一次批量 LLM 调用）、三重检查早期退出（合规 case 只触发单次 LLM 调用）。稳态调查成本由 Layer 1 确定性检查主导。

产出每 case 合规分 0-100%：Fully_Compliant(≥80%) / Partial_Violation(60-80%) / Major_Violation(<60%)。重大违规暂停管道，防止非合规输出进入修正阶段。

### ALF — 自适应学习框架（修正引擎）
检测与修正分离：检测完全确定性，修正按需用 LLM。
- **检测**：每条 ALF 规则用 21 种条件操作符库（相等/包含/正则/数值比较/列表成员/null 检查/前缀匹配/动态字段引用）对 agent 输出求值，AND 逻辑连接，无 LLM 参与、完全可复现。动态字段引用（如 `_DYNAMIC_preprocessing.vendor_name_`）运行时解析
- **修正**：三级动作模型——Tier 1 确定性字段编辑（正确值已知常量）、Tier 2 手术式修补（LLM 确定特定字段正确值）、Tier 3 管道继续（agent 过早终止时 LLM 从恢复点继续完整产出修订输出）
- **聚合**：多规则匹配时 Collect-Plan-Execute 管道（收集全部匹配规则→按 tier 合并成修订计划→固定顺序执行：Tier3→Tier2→Tier1）。基于作用域的互斥保证每个作用域至多一条规则触发，无论多少规则匹配每 case 至多两次 LLM 调用。每次修正完整审计（评估了哪些规则/哪些匹配/修订计划/完整 LLM 元数据）

## 学习与演化循环

Learning Agent 让 SME 审阅 agent 输出、用自然语言描述期望修正、协作发现新 ALF 规则。四个子模块：**Case Loader**（展示单 case 输出、分阶段校验结果、提取数据、修正历史）、**Rule Discoverer**（接受 SME 自然语言反馈，在 case 数据/现有规则/规则书上下文中用 LLM 生成候选条件，遵循保守领域原则：够窄只匹配目标 case、够广覆盖相似未来 case）、**Impact Assessor**（对现有 case 样本确定性评估，报告 target matches/collateral matches/safe non-matches）、**Rule Writer**（校验 schema、查冲突、备份规则库、持久化批准规则含元数据：谁批准/何时/为哪些 case 设计/关联规则书节）。

**程序化安全循环（关键创新，Figure 3）**：在代码中强制而非 prompt 指令，LLM 无法绕过。每条候选规则经过迭代校验循环：①Schema 校验（JSON 结构对照 ALF schema）②目标匹配验证（条件对目标 case 求值，失败则 LLM 保守拓宽条件）③附带影响评估（条件对 case 样本确定性求值，发现非预期匹配则 LLM 自动加窄条件：vendor name/amount range/service category）。循环最多三次；三次后仍有附带影响则带警告呈现给 SME。任何时刻规则不经过明确人工批准不应用。规则生命周期管理：enabled 标志（可停用不删除保审计）、时间戳备份可回滚、冲突检测（重复标识符/同作用域优先级冲突/作用域重叠）、结构化元数据（severity/root cause/规则书节）。

## 评估引擎
ground truth 可用时提供量化准确度测量：确定性对比（按配置对比组逐字段匹配，数值字段财务容差默认 $0.02，文本字段归一化后精确匹配）+ 可选 LLM-as-judge（每 case 整体对齐判定：Aligned/Partially_Aligned/Not_Aligned）。

## 宪法驱动的 agent 创建
宪法 artifacts（规则书+master data）不仅是现有 agent 的治理工具，也可作为创建新 agent 的规范：**宪法即规范**（构成完整机器可解析的期望行为规范，LLM 可用作代码生成 grounding）、**bootstrap 与精炼循环**（bootstrap agent 从现有 agent 代码建初始宪法，或先由领域专家编写宪法再用它指导 agent 构建——倒转常规流程 code→constitution 为 constitution→code→refined constitution）、**共同演化**（学习循环产出的修正规则揭示 acting agent 逻辑应更新处，宪法捕获这些模式，随运营经验演化成活文档）、**新 agent 上船**（只需两个输入：acting agent 本身 + 描述其期望行为的宪法；计算组件领域无关无需修改）。

## Spec-to-Note Gap：Agentic 系统透明度的自编码器视角
现代 agentic 系统是 planner/tool/retriever/guardrail/多 agent 的组合。提出结构模式：规范（自然语言描述期望行为）→ 实现（代码/Prompt/工具/配置编码规范成可执行系统）→ LLM 审计者（检查实现 artifacts 生成自然语言透明度 note）。这形成自然语言上的**自编码器**：spec 是输入、实现系统是隐表示、透明度 note 是重构。对照 spec 与 note 作为**重构损失**，暴露缺失能力、静默作用域蔓延、评测套件从未测量的行为。SME 接口：SME 读不懂评测 harness，但能读结构化自然语言 note 并快速标记错误假设/漏掉的人群/监管边缘案例；note 上的评论成为系统 tickets。Open questions：如何度量审计者自身忠实度、何时重生成 note、能否把 gap 变成优化信号而非审阅辅助、对抗性 prompt 的审计者能否当 release-gate red-teamer。

## 参考实现（发票处理，ADK + Gemini）
统一双模式 agent——单个 LlmAgent 实例 + 18 个注册函数工具，支持推理（文档处理）和学习（SME 引导规则发现）两种模式，打包成自包含 Python 模块。Acting pipeline 九阶段：Classifier（识别文档类型）→ Extractor（LLM 抽取+ Pydantic schema 校验）→ Phase 1-4 Validators（渐进合规校验：intake/content/external(税号 checksum)/calculation）→ Transformer（标准化 line items）→ Output Generator（最终结构化决策）→ Audit Logger（合规轨迹）。每阶段产出编号 JSON artifact（01_classification.json…09_audit_log.json）全可追踪；early-exit 机制。Layer 3 三重检查用置信阈值 90%（违规）/70%（模糊，视为合规=保守偏置）。ALF 实现全部 21 操作符含动态字段引用。学习模式实现完整安全循环，auto-tightening 加 vendor name/amount range/rejection template text/service category 条件消除附带匹配。

**验证属性**：领域适应性（替换 master data YAML 和 acting pipeline 即适配新文档类型，下游组件自动调整）、运营就绪（ADK web 界面/命令行运行）、自包含（含测试 case/PDF 文档/ground truth/预配置规则的单包）。

## 局限与未来方向
**局限**：bootstrap 当前是手动流程（LLM 辅助 bootstrap agent 可减新领域宪法编写成本）；调查 agent LLM 校验成本随 case 和规则组数扩展（缓存/批量/节过滤/早期退出大幅降低但量化跨大规模部署的成本降低是未来工作）；参考实现只在单一领域验证，多领域验证需确立领域无关性。

**未来方向**：自动化规则建议（调查 agent 累积合规数据，识别复发违规模式主动呈现 SME）、多轮趋势分析、规则生命周期管理（周期审查/性能跟踪/合并/晋升进 acting agent——修正规则火到揭示系统性缺陷时晋升进 agent 永久逻辑并退休 ALF 规则）、跨领域迁移、自动化 bootstrap、Spec-to-Note 作 release gate。
