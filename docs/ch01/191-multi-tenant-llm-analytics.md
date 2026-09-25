# Multi-tenant LLM Analytics 三层安全架构

> 📊 Level ⭐⭐⭐ | 10.7KB

PAR Technology 为餐饮行业 300+ 企业构建生产级多租户 Text-to-SQL Agent。核心挑战：同一数据库、同一问题、不同租户必须返回不同数据（加盟商看 $84K，品牌经理看 $9.2M）。文章提出三层独立确定性安全架构，使 LLM 在安全边界内运行而非充当安全执行者。

## 核心问题：为什么不能依赖 LLM 做行级安全

LLM 是概率生成器，不是确定性策略引擎。即使连续一万次正确过滤 business_id，第一万零一次可能静默遗漏。多租户合规场景不能建立在"可能每次都不同"的系统上。

## 三层架构

### Layer 1: 完整性保护的请求签名（API 入口）

每个 API 调用通过 AWS SigV4 签名，将 Tenant ID、Business ID、Admin ID 加密绑定到调用者凭证。修改任何值立即失效签名。验证通过后，三个 ID 拼接为复合会话键，锚定后续所有操作。

攻击场景：拦截请求替换 Tenant ID -> 签名校验失败 -> 请求在到达应用层前被拒绝。

### Layer 2: 语义输入验证（认证后、数据访问前）

Reasoning Engine 在数据被触碰前验证用户问题是否映射到系统支持的、定义明确的业务指标。模糊问题被拦截并要求澄清。

关键洞察：非确定性模型被问精确问题时自由度远小于被问模糊问题时。Layer 2 在 Layer 3 完全关闭空间之前先收窄它。

### Layer 3: Split-Plane SQL 架构（SQL 生成阶段）

**3a — 安全层（确定性，不涉及 LLM）**：系统用复合会话键程序化生成 SQL CTE，预过滤底层表到仅该用户有权查看的行。品牌经理 CTE 包含 200 个 location，加盟商 CTE 只包含 2 个。这是服务器端确定性操作，不依赖任何用户输入或 LLM 输出。

**3b — 智能层（LLM 参与）**：模型只接收预过滤 CTE 的 schema（列名和数据类型），看不到底层 Databricks 表。其唯一任务是针对这些范围化 schema 生成分析 SQL。最终查询 = 程序化 CTE + 模型生成 SQL 拼接执行。

**攻击场景 1 — 租户 ID 注入**：请求 Business 544 数据 -> CTE 中不存在 544 -> SQL 执行失败 -> 访问拒绝。数据从一开始就不存在。

**攻击场景 2 — 越狱指令**：模型不知道 customers 表存在 -> 生成 SQL 引用不存在的表 -> 执行失败。不是护栏拦截，是数据根本不在沙箱中。

## 生产验证

- 50,000+ 查询零跨租户数据泄露
- 安全与分析质量正相关：用户反馈持续优化 Reasoning Engine
- 多 Agent 架构建议：将安全控制提升到基础设施层，而非嵌入单个 Agent

## 三个独有贡献

1. **Split-Plane SQL 模式** — LLM 只看到预过滤 CTE schema 而非原始数据库，程序化 CTE 与模型 SQL 拼接执行
2. **三层独立确定性架构** — 每层独立运作，Layer 3 在 Layer 1/2 被绕过时仍强制行级安全
3. **"数据从不存在"安全范式** — 越狱/注入攻击失败不是因为护栏拦截，而是目标数据根本不在 LLM 可见的沙箱中

## 差异化对比

| 维度 | 本文（PAR Technology） | 通用 LLM Agent 安全 |
|------|----------------------|-------------------|
| 安全范式 | 确定性三层 + LLM 在沙箱内 | Guardrail / prompt injection 防御 |
| 行级安全 | CTE 预过滤，不依赖 LLM | 依赖 prompt 指令或后置过滤 |
| 越狱防御 | 数据不存在 > 护栏拦截 | 系统 prompt + content filter |
| 生产验证 | 50K+ 查询零泄露 | 多数停留在 PoC |

## 深度分析

### 为什么确定性边界优于提示词防御

提示词防御把安全策略交给概率生成器执行：系统 prompt 写入 business_id 并要求模型"始终"过滤，但模型可能静默遗漏、幻觉过滤值，或在模糊 prompt 下自行扩大查询范围。文章指出，在消费者应用里非确定性只是不便，在处理敏感商业数据的多租户系统里它不足以构成安全边界——合规态势不能建立在"每次行为可能不同"的系统上。PAR 的解法是把策略执行从模型迁移到架构：签名验证、语义校验、CTE 预过滤全部是服务器端确定性操作。 确定性边界不承诺阻止模型犯错，而是让模型的任何错误都无法转化为跨租户访问——失败模式从"数据泄露"降级为"查询报错"。

### SigV4 → 语义验证 → Split-Plane SQL 三层纵深防御的失效模式分析

- **Layer 1（SigV4）**：针对请求伪造与传输篡改。三个 ID 被加密绑定到调用者凭证，任何修改立即失效签名；即使签名被绕过，复合会话键还要求三个 ID 作为一个预注册组合共同解析。
- **Layer 2（语义验证）**：针对模糊输入导致模型对 scope 做危险假设。非确定性模型被问模糊问题时自由度远大于被问精确问题时，Layer 2 在数据被触碰前先收窄这个自由度，同时提升质量与安全。
- **Layer 3（Split-Plane SQL）**：兜底前两层全部被绕过的最坏情况。CTE 由复合会话键程序化生成，不依赖任何用户输入或 LLM 输出；租户注入失败是因为 Business 544 的数据从一开始就不在沙箱中，越狱失败是因为模型根本不知道 customers 表存在。

关键设计是序列无关的兜底：Layer 3 即使在 Layer 1/2 被绕过时仍强制行级安全，与单点防御（只靠 guardrail 或 system prompt）形成本质区别。

### LLM 在安全边界内 vs 作为安全执行者的架构哲学

核心哲学是 LLM sits inside the architecture, not above it——模型在无法跨越的边界内运行，而不是站在边界位置决定谁能看什么。v1 里模型是用户与数据库之间唯一屏障，每次非确定性波动都是安全事件；生产架构里模型职责被压缩为"对预过滤 schema 生成分析 SQL"，它能漂移、幻觉、被操纵，但作用域被限制在临时沙箱内。 这与 [Agent 安全架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-architecture.md) 的信任边界思想一致，也呼应 [Agent Sandbox](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-sandbox.md) 的沙箱化原则：不信任生成器的输出，只信任构造生成环境的代码。

### 生产验证数据的意义

50,000+ 查询零跨租户泄露的意义不在绝对量级，而在证明三层架构在真实对抗环境下（300+ 企业、数千用户）可持续运转。文章还给出一个反直觉观察：安全与分析质量正相关——用户反馈持续优化 Reasoning Engine，系统"同时变得更安全、更智能"。 这否定了"加安全必须牺牲可用性"的预设：当安全控制（强制澄清模糊问题）本身提升查询准确性时，用户没有动机绕过它。作者也诚实标注边界：该架构为 PAR 的特定合规环境设计，落地者仍需按自身监管框架做渗透测试与安全评审。

## 实践启示

1. **永远不要让 LLM 充当行级安全的执行者**：把 business_id 放进 prompt 并要求模型"始终过滤"是 v1 的错误——概率生成器不适合做策略引擎，行级过滤必须在服务器端程序化完成。
2. **让攻击目标"不存在"优于"拦截"**：与其构建更聪明的护栏识别恶意 prompt，不如让模型只看到预过滤 CTE 的 schema——越狱一个不知道 customers 表存在的模型没有意义。设计数据沙箱而非内容过滤器。
3. **身份三元组在入口处加密绑定并全链路锚定**：Tenant/Business/Admin ID 在 API 入口与凭证绑定，拼接为复合会话键后锚定所有下游操作，防止会话间数据渗漏。
4. **用语义验证同时收窄安全与质量两个自由度**：在数据访问前强制问题映射到系统支持的、定义明确的业务指标，模糊问题停下澄清——同时减少 SQL 错误和 scope 蔓延。
5. **多 Agent 扩展时把安全控制提升到基础设施层**：身份验证、语义验证、数据过滤不嵌入单个 Agent，而是作为共享基础设施能力——Agent 数量增长时安全模型不变。
6. **配套控制不可缺位**：行级安全之外还需不可变审计日志、异常访问检测（2 店管理员突然请求 200 店数据）、rate limiting、密钥自动轮转等补充控制。

## Related

- [Agent 安全架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-architecture.md)
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

-> [原文存档](https://aws.amazon.com/blogs/machine-learning/multi-tenant-llm-analytics-with-row-level-security-how-we-built-a-secure-agent-on-aws/)

---

