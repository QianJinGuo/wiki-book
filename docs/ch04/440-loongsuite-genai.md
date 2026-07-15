# LoongSuite GenAI 可观测语义规范

## Ch04.440 LoongSuite GenAI 可观测语义规范

> 📊 Level ⭐⭐ | 6.6KB | `entities/loongsuite-genai-semconv.md`

## 核心贡献
### Entry/Step Span 架构
解决 Agent 长程任务 Trace 冗长问题：Entry Span 还原原始输入，Step Span 逐轮展开 ReAct 循环。已落地 OpenClaw、QwenPaw、Hermes Agent。

### Skill 语义
gen_ai.skill.* 属性（name/id/description/version）附着在 execute_tool Span 上，实现业务功能域聚合分析。

### Token 级推理观测
业界首个 Token 级推理引擎可观测：per-token 调度时间、batch 负载、Top-K 候选分布。案例验证慢 Token 定位和精度问题定界。

### GenAI Utils
统一 Invocation + Context Manager 编程模型，插桩库只需数据提取，规范升级只改一处。支持 DashScope、Dify、AgentScope、Mem0、MCP、Agno、Google ADK、LangChain。

## 深度分析
### 为什么现有 OTel SemConv 不足以支撑 AI Agent 可观测
传统 OTel HTTP Span 模型无法映射 AI Agent 的长程任务。一轮 ReAct 循环可能跨越数百个内部调用——模型推理、工具选择、记忆回溯——全部压缩在一条扁平 Trace 里，排查问题时无从下手。LoongSuite 引入 Entry/Step 分层：Entry Span 站在 Agent 入口锚定用户意图，Step Span 按 ReAct 阶段展开父子关系，让 trace 从"一团乱麻"变成"可折叠的目录树"。

### Skill 作为独立观测粒度的意义
Tool 是原子操作（send_email、query_db），Agent 是自主决策单元，Skill 则是介于两者之间的业务功能聚合点。一个 Skill 可能调用多个 Tool，但其语义是单一业务意图（"处理退款"、"核查资质"）。gen_ai.skill.* 属性让观测数据可以按业务域而非技术实现进行聚合，打通了可观测到业务分析的直接路径。

### Token 级可观测的工程挑战
per-token 粒度的数据量巨大——一个 2048 token 的输出就产生 2048 个数据点。LoongSuite 解决路径：采集 Top-K 候选分布而非全量分布，结合 batch 负载聚合降低存储开销，同时保留调度时间这一关键指标。这种"降采样但不丢失关键信号"的思路，是工程可行性的关键。

### LoongSuite 定位：厂商增强还是上游标准
团队明确目标是贡献至 OTel 上游。当前阶段以 LoongSuite 品牌运营，定位为厂商增强扩展。这个策略的价值在于：先在内部验证可行性再向上游提案，降低了标准化的风险。对社区而言，当前的厂商增强路径是一个务实的渐进式标准化路径。

## 实践启示
### 对于 Agent 框架开发者
如果你的框架还未支持 Entry/Step Span 分层，当 Trace Span 数量超过 100 时就应该考虑引入。Entry Span 记录原始输入输出（prompt/response），Step Span 按 ReAct phase 组织，每个 phase 的模型调用、工具调用、状态变迁都作为子 Span 挂在对应 Step 下。这个结构让 trace 排查从 O(N) 线性扫描变成 O(log N) 目录查找。

### 对于可观测平台团队
gen_ai.skill.* 属性的落地成本极低——只需在 execute_tool Span 上附加四个字符串属性，不需要新增 Span 类型。对于已有 OTel 埋点的系统，这是一个零破坏的增量能力。平台侧可以基于 skill name 做业务域聚合，直接导出 Skill 级别的 SLA / 耗时分布，而不需要额外的业务埋点。

### 对于推理引擎团队
Token 级可观测的第一个落地点是慢 Token 定位。当一个 token 的调度时间异常高（prefill 抢占 decode 资源），在 Span 层面表现为该 token 的耗时突增。配合 batch 负载指标，可以快速判断是 PD 分离架构下的资源干扰还是模型自身的 badcase。这是定位"答非所问"BOS Token 类问题的直接手段。

### 对于规范制定者
LoongSuite 当前支持 8+ 框架的 Invocation 统一抽象值得参考——它证明了跨框架语义对齐的可行性。但要注意，Invocation 数据类的设计必须足够抽象（只提取共性字段），否则每次框架 API 变化都会导致映射断裂。建议在贡献上游前，先在3个以上不同框架上验证抽象的完备性。

## 关联实体
- [Hermes 可观测性](https://github.com/QianJinGuo/wiki/blob/main/entities/hermes-observability.md) — LoongSuite 已支持 Hermes Agent 插桩
- 遵循 [OpenTelemetry](https://opentelemetry.io/) GenAI SemConv 标准，LoongSuite 是厂商增强扩展
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — 可观测是 Harness 的关键维度
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/loongsuite-genai-semconv-alibaba.md)

## 相关实体
- [Harness Engineering实践做了一个平台让AI一晚上自动评测和优化你的系统](../ch05/112-harness-engineering.html)
- [Claude Code Agent 工程设计](../ch03/068-claude-code-agent.html)
- [你不知道的 Agent 原理架构与工程实践](ch04/339-agent-principle-architecture-engineering-practice.html)
- [Coding Harness 工程本质](https://github.com/QianJinGuo/wiki/blob/main/concepts/coding-harness-engineering.md)
- [Ralph Loop 不够用：长时间 Agent 还缺这 3 件事](../ch03/046-agent.html)

- [在 RDS PostgreSQL 中实现 RaBitQ 量化](https://github.com/QianJinGuo/wiki/blob/main/entities/在-rds-postgresql-中实现-rabitq-量化.md)
- [Codeindex · 让大模型更好地理解你的代码](../ch01/409-codeindex.html)
- [使用 Agent Skills 做知识库检索，能比传统 RAG 效果更好吗？](ch04/391-agent-skills.html)
- [Claude Code 之父最新访谈：编程已经结束、harness 将消失、Claude Code 将只有 100 行代码、loop 才是未来](../ch03/076-claude-code.html)

---

