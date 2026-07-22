# Unlocking the Cloudflare app ecosystem with OAuth for all

## Ch12.090 Unlocking the Cloudflare app ecosystem with OAuth for all

> 📊 Level ⭐⭐ | 5.6KB | `entities/cloudflare-oauth-for-all.md`

# Unlocking the Cloudflare app ecosystem with OAuth for all

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

## 实践启示

1. **SaaS 集成开发**：现在可以构建基于 OAuth 的 Cloudflare 集成，替代 API token 方案
2. **内部开发平台**：企业可构建内部工具通过 OAuth 访问 Cloudflare，统一权限管理
3. **Agentic 工具链**：AI Agent 可通过 OAuth 获取受限的 Cloudflare API 访问，支持自动化运维
4. **迁移注意**：使用 Wrangler 或 MCP 客户端的团队应关注 refresh token 行为变化

## 相关实体

- [Cloudflare Temporary Accounts Ai Agents](../ch04/030-ai-agent.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/cloudflare-oauth-for-all.md)

---

