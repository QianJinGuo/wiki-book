# Multi-tenant LLM Analytics 三层安全架构

## Ch01.865 Multi-tenant LLM Analytics 三层安全架构

> 📊 Level ⭐⭐ | 4.7KB | `entities/multi-tenant-llm-analytics-row-level-security-aws.md`

# Multi-tenant LLM Analytics 三层安全架构

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

## Related

- [Agent 安全架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-security-architecture.md)
- [Harness Engineering Framework](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md)

-> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/multi-tenant-llm-analytics-row-level-security-aws.md)

---

