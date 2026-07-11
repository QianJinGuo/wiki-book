# 火山引擎 AI 搜索千万级 Agent 架构演进 — 从 ReAct 三节点到 Unified Policy

## Ch04.655 火山引擎 AI 搜索千万级 Agent 架构演进 — 从 ReAct 三节点到 Unified Policy

> 📊 Level ⭐⭐⭐ | 8.2KB | `entities/volcano-engine-ai-search-million-agent-architecture-up-react.md`

# 火山引擎 AI 搜索千万级 Agent 架构演进 — 从 ReAct 三节点到 Unified Policy

火山引擎 AI 搜索团队分享了其 Agent 架构从 ReAct 三节点演进到 Unified Policy Agent（UP-ReAct）的实践历程。该系统支持千万级并发用户，是生产级 Agent 架构设计的典型案例。

## 核心问题

随着规模增长，ReAct 三节点架构暴露出三个关键问题：

- **Context Thrashing**：长链 Agent 执行中上下文反复加载/卸载，同一份业务状态在 Thought→Action→Iteration 节点间反复序列化与反序列化，导致 Prompt 长度指数级膨胀、显存占用飙升、模型注意力严重稀释
- **TTFT 退化**：三节点 DAG 架构下每次有效工具调用需要经历 3 次独立决策流转，首 Token 生成时间（TTFT）从理论最优值劣化为 3 倍放大，在大规模并发下变得不可接受
- **Control Flow 碎片化**：多 Agent 协作时控制流分散在各节点，新工具接入需要在 DAG 中硬编码 If-Else 特判逻辑，系统从优雅架构退化为布满补丁的"屎山代码"

## 深度分析

### 从 Prompt Engineering 到 System Engineering 的行业共识

火山引擎 AI 搜索团队的架构演进并非孤立实践，而是与 OpenAI、Anthropic 等顶级团队在生产级 Agent 设计上达成共识的体现：

1. **Workflow 与 Agent 必须严格分层**——预定义路径、硬规则校验锁死在 Workflow 中；Agent 只负责在环境反馈中做动态策略决策。不要用 LLM 做普通的 switch-case。
2. **万物皆 Tool（Contract）**——工具不再仅仅是 API 调用，而是 Agent 与外部世界的"强契约"。工具的输入 Schema、输出质量、容错能力比 Agent 自身的推理能力更决定系统下限。
3. **上下文管理的独立化**——全量加载不可行；按需加载（Progressive Exposure）和状态压缩（Compaction）成为长程任务的生命线。
4. **生产级工程评测（Eval）**——代码判分、中间态阻断率、工具调用准确率构成多维度 Eval 体系，替代"回答得好不好"的模糊衡量。

### Workflow + Unified Policy Agent 的架构解耦

核心设计是将 AI 搜索链路一分为二：

**Workflow 层（确定性骨架）**：接管所有无需 LLM 决策的前置工作——风控校验、意图路由分类、用户画像预加载、基础倒排索引召回。例如电商搜索中"必须先过滤无库存商品"是绝对业务红利规则，硬编码在 Workflow 中远比指望 Agent 每次都"想起"调用过滤工具可靠得多。

**Agent 层（动态决策中枢）**：复杂请求穿透 Workflow 后进入 Agent，它被剥离得极其纯粹——仅基于当前收敛后的上下文，决定下一步采取什么动作。不再承担任何"干脏活"的静态任务。

### Unified Policy：三合一决策中枢

UP-ReAct 无情地砍掉了 Thought、Action、Iteration 三个散装节点，将其统一收敛为单一的 **Policy 节点**。单次前向传递完成三件事：

1. **全局规划（Planning）**：基于目标分析当前缺失的信息
2. **动作选择（Action Selection）**：直接输出结构化 JSON Schema 决策指令，而非先输出自然语言再由正则提取
3. **终止判定（Termination）**：判断目标是否满足，满足则生成最终态输出

通过这一变化，时间复杂度从 O(3N) 降维至 O(N)——系统不仅少跑了冗余节点，更在语义层面明确了"大脑"的唯一性，彻底消灭了控制逻辑在多个 Prompt 中打架的乱象。

### 三个统一：控制 + 行为 + 状态

架构在系统抽象层面完成了深层次重塑：

**统一控制（Policy 独裁中心）**：Policy 取代松散议制成为决策中心。如果 Agent 抽风，直接 Dump Policy 状态日志即可定责。大幅降低了二次开发的认知负担。

**统一行为（万物皆 Tool）**：强制规定所有系统级别的主动行为必须被抽象封装为标准 Tool——包括 search_database_tool、exit_and_reply_tool、deep_think_tool、load_tenant_config_tool 等。当"退出"和"思考"都变成标准 API，动作空间变得完全可枚举且可校验。接入新能力只需注册一个新 Tool，无需修改核心 DAG 代码。

**统一状态（Context Manager）**：历史状态从业务代码中剥离，交由独立 Context Manager 统一接管。实现了三种内存管理策略：
- **基于预算的滑动窗口**：严控 Policy 单次看到的 Token 上限
- **语义去重与折叠**：连续多次返回同质化摘要时，自动启小模型将信息压缩为高密度核心特征
- **记忆分级驱逐**：中间工具调用的长 JSON 报错栈提取核心错误码后丢弃原始文本

### 实测效果数据

在未进行专属 Prompt 调优、未引入 RLHF 的同等起跑线下，新旧架构在真实电商评测大盘中的数据：

| 指标 | 旧 ReAct | UP-ReAct | 提升 |
|------|----------|----------|------|
| 首字返回时间（TTFT） | 14.045s | 9.8s | **-30.22%** |
| 推荐准确性评分 | 3.26 | 3.38 | +3.76% |
| 对话综合体感打分 | 3.76 | 4.32 | +14.78% |
| 全局综合得分 | 基准 | 基准+9.1% | **+9.1%** |

TTFT 降低 30% 的同时准确率不降反升，归因于 Context Manager 的"洗流与状态降噪"——排除了大量中间思考冗余文本干扰后，模型有限的注意力被聚焦在最核心的业务目标上。

## 实践启示

1. **Agent 架构的瓶颈不在模型能力，而在上下文工程**——千万级并发的教训表明，Context Thrashing 是比模型幻觉更致命的生产级问题。上下文管理的独立化和专业化是规模化 Agent 系统的前置条件。

2. **Workflow-Agent 分层是架构第一性原理**——不要把所有逻辑都塞进 Agent。确定性的业务规则（风控、权限、路由）应该锁死在 Workflow 层，Agent 只负责真正的动态决策。

3. **万物皆 Tool 的设计哲学简化了系统复杂度**——将"退出"、"思考"等系统行为也封装为 Tool，使 Agent 的动作空间可枚举、可校验、可扩展。这是对抗控制流碎片化的有效手段。

4. **速度与质量不是取舍关系**——UP-ReAct 证明了消除冗余中间步骤和上下文噪声后，系统可以同时更快、更准。关键在于 Context Manager 的"状态降噪"，而非模型本身的升级。

5. **Eval 体系需要从"回答质量"扩展为多维度**——代码判分、中间态阻断率、工具调用准确率构成更全面的生产级评估体系。单一指标驱动的优化在复杂 Agent 系统中可能适得其反。

## 相关实体

- [Agent Harness 架构](../ch05/039-agent-harness.html)
- [Agent 上下文管理架构模式](../ch03/045-agent.html)
- [Harness Engineering](../ch05/066-harness-engineering.html)
- [生产级 Agent 工程挑战](../ch05/018-harness.html)
- [上下文工程三记忆范式](https://github.com/QianJinGuo/wiki/blob/main/entities/context-engineering-three-memory-paradigms.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/火山引擎-ai-搜索千万级-agent-架构演进与实践从-react-三节点到-unified-policy.md)

---

