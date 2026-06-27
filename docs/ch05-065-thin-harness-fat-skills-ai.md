# Thin Harness, Fat Skills：AI工程架构的本质

## Ch05.065 Thin Harness, Fat Skills：AI工程架构的本质

> 📊 Level ⭐⭐ | 5.5KB | `entities/thin-harness-fat-skills.md`

## 核心理念：Latent vs Deterministic 空间分离

AI应用有两个完全不同的空间：Latent 空间和 Deterministic 空间。前者是模型的领地——判断、阅读、综合、推理，擅长但不确定；后者是代码的领地——SQL、编译、算术、文件操作，精确可复现。核心错误在于把确定性任务扔给LLM，把不确定性任务交给人去做。一个典型反例是用LLM安排800人座位表，这种确定性编排问题让模型反复纠结座位冲突，而代码本可以线性求解 。

## Thin Harness, Fat Skills 架构

### Fat Skills（Markdown 技能文件）

技能文件是永久升级资产，随使用自动复合进化。每次运行流程：运行 Skill 得到结果 → 判断质量 → 固化好的结果到 Skill 文件 → 下次使用时复合知识。新模型发布时，所有 Skill 自动受益，因为 Skill 是结构化知识而非硬编码判断。铁律：同一个问题问两次即失败——第一次问模型，第二次必须固化到 Skill 文件 。

### Fat Code（确定性逻辑）

用代码处理确定性事务：SQL 查询、文件操作、编译/类型检查。代码不"智能"，但代码稳定、可复现、可测试 。

### Thin Harness（~200行轻量框架）

案例对比：Playwright CLI 响应只需 100ms，而 Chrome MCP 需要 2-5 秒（延迟峰值 15 秒+），结论是 Playwright CLI 比 Chrome MCP 快 75 倍。Harness 只负责加载 Skill、路由任务、调用确定性代码，不包含任何业务逻辑 。

## 深度分析

**1. 架构分分离是 LLM 应用设计的核心洞察**：Latent/Deterministic 空间分离不是性能优化技巧，而是架构层面的根本性判断。Garry Tan 提出的"Thin Harness, Fat Skills"本质上在说：让模型的模糊能力（判断、推理、生成）与代码的精确能力（执行、存储、计算）在系统层面解耦。这与 Martin Fowler 提到的"非确定性进了研发链路，harness 才真正开始承重"一脉相承——确定性边界决定了系统的可信赖程度 。

**2. 技能文件是知识积累的复利载体**：Skill 文件相比硬编码工具的核心优势在于"复合进化"。每运行一次，Skill 文件沉淀高质量结果；新模型发布时，所有积累的 Skill 自动受益。这意味着投入技能工程（Skill Engineering）的回报是超线性叠加的，而非线性的工具数量增长 。

**3. 工具数量的膨胀是反模式**：文章明确批评"40+ 工具定义"——工具越多系统越难维护。应改用 Skill 封装复杂流程，而非无限扩展工具列表。这呼应了 Agent Harness 设计中"工具原语越少越好"的原则 。

**4. 外部调用延迟是系统瓶颈**：2-5 秒的 MCP 往返会拖垮整个系统，尤其在需要快速反馈的场景。Thin Harness 强调选择响应速度快的工具（Playwright CLI vs BrowserMCP），本质上是将延迟纳入架构约束 。

**5. Thin Harness 与 Claude Code 的设计同构**：Claude Code 的 REPL 充当 Harness（薄控制面），Skills 充当 Fat Skills（结构化技能文件），Tool Runtime 充当确定性逻辑执行。这套架构的核心洞察是：让模型做判断，让代码做执行，让 Skill 承载知识积累 。

## 实践启示

1. **建立 Latent/Deterministic 边界评估清单**：在设计任何 LLM 应用流程时，先明确每个步骤属于哪个空间。判断、推理、生成 → LLM；存储、计算、IO、编译 → 代码。出现混合地带就用 Skill 封装，不混用 。

2. **强制执行"两次法则"**：任何被问到两次的同类问题，必须固化到 Skill 文件或 cron 定时任务，不能第三次再问模型。这是技能工程的基础纪律 。

3. **优先测量外部工具延迟**：在选型阶段就将工具响应时间作为核心指标，避免 MCP 等慢速调用成为整个系统的瓶颈。Playwright CLI 的 100ms vs 15s 延迟差距足以颠覆用户体验 。

4. **以 Skill 而非工具数量衡量系统复杂度**：当工具数量超过 10 个时，重新审视是否可以用 Skill 封装替代。技能的复合进化比工具的堆叠更能带来长期价值 。

5. **用 Fat Code 保护关键路径**：对需要精确结果的操作（支付计算、数据写入、编译检查），完全排除 LLM 介入，由代码保证确定性，形成系统的确定性保护区 。

## 相关实体
- [Mac Multi Agent Coding Skills Hooks Harness](/ch05-026-mac-multi-agent-coding-skills-hooks-两层-harness-完全委托-0/)
- [Code As Agent Harness Survey](/ch09-046-code-as-agent-harness-综述/)
- [Cong 30 Fen Zhong Shou Gu Agent Dao Harness Cheng Wei Xin Hou Duan](/ch04-254-从-30-分钟手搓-agent-到-harness-成为-新后端/)
- [Claude Code Harness Deep Understanding](/ch01-367-claude-code-harness-deep-understanding/)
- [从 30 分钟手搓 Agent到 Harness 成为新后端](/ch04-388-从-30-分钟手搓-agent-到-harness-成为-新后端/)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/thin-harness-fat-skills.md)

---

