# Unlocking the Cloudflare app ecosystem with OAuth for all

> 📊 Level ⭐⭐⭐ | 11.3KB

> **Background**：Cloudflare 官方博客，宣布为所有开发者提供 OAuth 授权能力，使第三方应用能安全地访问 Cloudflare 平台资源。这是 Cloudflare 开发者平台战略的关键一步，尤其对 Agentic 工具的委托访问具有重要意义。

## 摘要

Cloudflare 服务着全球 20% 的网站，其 API 生态长期以来依赖手动准入的少量合作伙伴 OAuth 集成（如 Wrangler、PlanetScale）。此次"OAuth for All"发布将 OAuth 授权能力开放给所有开发者，支持自管理 OAuth 客户端创建。背后的技术升级涉及从 Hydra 1.x 到 2.x 的大规模迁移，采用了蓝绿部署策略和队列化撤销机制来确保零停机升级。

## 核心要点

### 从受限到开放

- **之前**：仅少量手动准入的合作伙伴可通过 OAuth 访问 Cloudflare API
- **之后**：所有开发者均可创建自管理 OAuth 客户端
- **动机**：开发者平台增长 + Agentic 工具对委托访问的需求推动了开放

### 自管理 OAuth 能力

开发者现在可以提供标准 OAuth 流程：
- **用户直接授权**：客户授予有范围的访问权限
- **细粒度权限控制**：精确控制第三方应用可执行的操作
- **清晰的同意体验**：明确展示请求访问的应用及其权限
- **便捷的撤销机制**：通过 Dashboard 随时控制哪些应用有权访问数据
- **防钓鱼保护**：应用所有权更可见，防止 OAuth 钓鱼攻击

## 技术实现深度分析

### OAuth 引擎升级：Hydra 1.x → 2.x

Cloudflare 使用开源 OAuth 引擎 [Hydra](https://github.com/ory/hydra) 驱动 OAuth 系统。随着平台增长和 Agentic 工作流普及，需要进行重大升级。团队采取了**两阶段顺序升级**策略：

**阶段一：升级到 Hydra 1.x 最新版**

面临的核心挑战：
1. 数据库 schema 迁移会在关键表上创建排他锁，阻塞活跃用户的 OAuth 操作
2. 添加新列和移动列到新表导致兼容性问题
3. 旧版 SDK 执行 `SELECT *` 操作，与 schema 变更产生反序列化冲突

解决方案：
- 重写 SQL 迁移使用 `CREATE INDEX CONCURRENTLY` 避免锁表
- 构建自定义 Hydra 版本，显式选择列而非 `SELECT *`

**阶段二：升级到 Hydra 2.x**

评估了三种方案：
1. **原地升级**：不可行——schema 变更过大
2. **蓝绿部署（禁用写入）**：可用但在升级期间用户无法新授权或撤销
3. **蓝绿部署（保持写入）**（最终选择）：允许部分写入丢失，但保障关键操作

### 蓝绿部署的关键设计

为在升级期间保持系统可用，团队设计了精巧的机制：

**减少 Token 写入**：通过延长 Token 过期时间到数小时，减少升级窗口内的新 Token 请求量。

**队列化撤销保障**：使用 [Cloudflare Queues](https://developers.cloudflare.com/queues/) 构建队列系统——撤销事件被写入队列，在切换到绿色版本后重放所有撤销事件。这是关键设计，否则用户已撤销的应用访问可能在升级后被意外恢复。

**Refresh Token 合并**：升级到 1.x 后发现 Hydra 的严格 refresh token 失效行为（一个复用的 refresh token 会使整个 token 链失效）影响 Wrangler 和 MCP 客户端。通过在 Worker 层添加 refresh token 合并行为——短暂缓存请求以检测重试并短路响应。Hydra 2.x 的可配置"refresh token grace period"从根本上解决了此问题。

## 对 Agent 生态的意义

OAuth 标准化对 AI Agent 生态具有深远影响：

1. **Agent 委托访问**：Agent 可以通过标准 OAuth 流程安全地访问 Cloudflare 资源，无需共享长期 API token
2. **用户主权**：用户可以精确控制 Agent 的权限范围，随时撤销访问
3. **操作可审计**：所有 Agent 操作通过 OAuth token 可追溯
4. **生态催化**：标准化授权降低了构建 Cloudflare 集成工具的门槛，促进工具链繁荣

对于构建 Cloudflare 管理 Agent 的开发者来说，OAuth for All 意味着不再需要为每个用户分发 API token，而是通过标准 OAuth 流程实现安全的委托访问——这是 Agentic 工具走向生产级的关键基础设施。

## 深度分析

### 委托授权：Agent 时代真正缺的那块原语

API token 的设计前提是"人持有、人使用、人判断"——不透明的长期凭据，授权范围在创建时写死，之后无人再看。把它粘贴进 agent 的 config，等于把一整个人的身份永久授予一个无人值守进程：范围无法随任务收窄，使用无法归因，泄露后只能整条吊销。Cloudflare 开放 OAuth 之前的处境正是如此——第三方只能靠少数手动准入的集成拿到 OAuth，自建集成被迫退回 API token，官方对这条退路的定性是"更难管理，且对许多委托式流程根本不适配"。

OAuth 把"一个凭据"拆成四件可独立控制的事：**谁在请求**（client 身份与所有权）、**用户同意了哪一档范围**、**有效期多长**、**如何撤回**。这四项恰好是 agent 落地最缺的粒度。[临时账号](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cloudflare-temporary-accounts-ai-agents.md) 在资源层做隔离（用完即焚的账号），OAuth 在授权层做隔离（带 scope 的短期令牌），二者是同一目标的两个切面：让 agent 的可达半径小于人的可达半径。

### 安全模型位移：从"信任集成方"到"信任同意屏 + 作用域令牌"

旧模型的隐含假设是"能拿到 token 的集成方可信"，所以门槛设在商务侧——人工审核少数伙伴。新模型不再要求信任集成方，只要求用户信任三件事：同意屏说清了请求什么权限、令牌真被 scope 限住、撤销立刻生效。Cloudflare 的开放顺序印证了这个成本结构：先改 consent 展示，再补 dashboard 撤销，再让 app ownership 更可见以防 OAuth 钓鱼，最后才放开自管理 client——官方直言早期的 permissions model、同意体验与滥用缓解手段"还不够成熟"。 换言之，OAuth 开放的门槛从来不是"授权码流程能跑通"，而是"滥用面已被收住"。

位移不消除风险，只是把风险搬到两个新位置。其一是 **confused deputy**：第三方以自己的 client 身份加用户的 token 发起调用，若 scope 粗到"能改整个 zone 的 DNS"，应用被攻破即等于用户被攻破，用户当初同意的那"一个应用"成了攻击者的代理。其二是 **token passthrough**：agent 把用户的 access token 原样转交给下游 MCP server 或子 agent，audience 校验随之失效，下游无从判断这张票开给谁。OAuth 保证"谁同意了什么范围"，不保证"令牌在第几跳被转手"——这一段只能靠 audience 绑定与逐跳换取新令牌来补。

### 生态经济学：准入门槛从商务谈判降到工程动作

自管理 client 的真正杠杆不是技术，而是把"能否发布一个 Cloudflare 集成"从谈判变成一次自助创建。此前第三方集成数量被人工准入锁死；开放后长尾集成的边际成本趋近于零，代价是平台的 review 负担从"审核 N 个伙伴"变成"用一套标准化同意屏、撤销入口、防钓鱼标识去承接全部未知集成"。这是平台生态的经典交换：用统一的信任 UI 承担信任成本，换集成数量的规模效应。

平移到 [MCP](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/model-context-protocol-mcp.md) 是同一个问题：remote MCP server 要代表用户访问上游 SaaS，就必须回答"我是谁的代理"。OAuth 给的是授权层答案（consent + scoped token），但 **principal 问题**没有解——agent 以用户身份行动时，审计日志记的是用户，责任却分散在用户、agent 开发者、模型三方。这也是 token 级授权必须与 [agent 身份可移植性](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-identity-portability.md) 一起看的原因：前者管"能做什么"，后者管"是谁在做、做完算谁的"。[Agent 安全架构](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-security-architecture.md) 中把这两层混为一谈的设计，通常要到审计阶段才暴露问题。

### 失败模式清单：设计时要防的坑

1. **令牌泄漏进日志与 prompt**：典型路径是 agent 把请求头或环境变量整个 dump 进上下文，再随 trace 上传。规约是让 token 只在 transport 层可见，永不进入模型可见字符串。
2. **Scope creep**：图省事申请"全权限" client，短期跑通，长期等于把 OAuth 退化回 API token。应按任务而非按应用申请 scope。
3. **无人值守 agent 的 refresh token**：Cloudflare 升级时踩到的真实坑——Hydra 1.x 下一个被复用的 refresh token 会让整条 token 链失效，而 Wrangler 与 MCP 客户端请求量高，一次重试就可能踢掉整个会话；官方先在 Worker 层做 refresh token 合并（短暂缓存以识别重试），2.x 的 grace period 才根治。自建 agent 应假设"刷新会被并发触发"并做 single-flight 合并。
4. **撤销延迟**：撤销若只写前端而不同步到令牌校验路径，窗口期内旧令牌仍可用。Cloudflare 在蓝绿切换时用队列重放撤销事件，正因为"已撤销的访问被意外恢复"不可接受。
5. **多 agent 共用一份凭据**：一旦共享，撤销与归因同时失效——既无法只停掉一个失控的 agent，也无法判断是谁干的。

## 实践启示

1. **SaaS 集成开发**：现在可以构建基于 OAuth 的 Cloudflare 集成，替代 API token 方案
2. **内部开发平台**：企业可构建内部工具通过 OAuth 访问 Cloudflare，统一权限管理
3. **Agentic 工具链**：AI Agent 可通过 OAuth 获取受限的 Cloudflare API 访问，支持自动化运维
4. **迁移注意**：使用 Wrangler 或 MCP 客户端的团队应关注 refresh token 行为变化

## 相关实体

- [Cloudflare Temporary Accounts Ai Agents](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cloudflare-temporary-accounts-ai-agents.md)

→ [原文存档](https://blog.cloudflare.com/oauth-for-all/)

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

