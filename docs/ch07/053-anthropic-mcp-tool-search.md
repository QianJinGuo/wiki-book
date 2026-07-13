# Anthropic MCP 重新定义：Tool Search + 代码编排

## Ch07.053 Anthropic MCP 重新定义：Tool Search + 代码编排

> 📊 Level ⭐⭐ | 7.4KB | `entities/anthropic-mcp-revisited.md`

## 核心命题
Anthropic 官方回应社区对 MCP 的三大批评（贵、schema 臃肿、不可组合），明确 MCP 的真正地盘：**云端 Agent 标准化接入层**。

## 关键结论
1. **MCP vs CLI 成本差距缩小**：Tool Search 减少 85% 工具定义 token，综合效果从 32 倍差距缩至约 7 倍
2. **程序化调用**：工具返回结果在沙箱处理，Agent 循环/过滤/聚合，只返回最终结果，减少 37% token
3. **Cloudflare 代码编排**：2,500 API 端点只暴露 search + execute 2 个工具，工具定义 1K tokens
4. **Skills 转正**：MCP 管「能力」，Skills 管「编排」，两者共存
5. **发展图景**：本地 CLI + Skills，云端 MCP + Skills，简单场景直连 API

## MCP 三问题与解法
| 问题 | Anthropic 解法 |
|------|---------------|
| schema 臃肿（43 工具占 55K tokens） | Tool Search 按意图分组，减少 85% |
| 不可组合 | 程序化调用，Agent 写代码在沙箱处理 |
| token 贵（比 CLI 贵 32 倍） | 代码编排（2 工具覆盖 2500 端点）|

## 工具设计原则
- **Tool Search**：按意图分组工具（而非按 API 分），Agent 先描述需求，系统只拉匹配的几个工具
- **代码编排**：暴露 search + execute 两个高级抽象，而非暴露所有细粒度 API

## 深度分析
### MCP 的范式转变：从「工具超市」到「代码编排」
Anthropic 对 MCP 的重新定位，本质上是一次**架构哲学的翻转**。社区批评的三个问题——贵、schema 臃肿、不可组合——都指向同一个根因：把 MCP 当作「工具超市」来设计，每个 API 端点对应一个工具。结果是 43 个工具塞满上下文，token 爆炸，Agent 在工具里迷失。
Cloudflare 的实践给出了正确答案：2,500 个 API 端点只暴露 `search` + `execute` 两个工具，工具定义从不可能压缩到约 1K tokens。这个模式的本质，是把「该用什么工具」的决策权还给 Agent，而不是让人类在定义阶段就把所有路径穷举出来。

### Token 成本：从 32 倍到 7 倍的压缩
| 优化手段 | 效果 |
|---------|------|
| Tool Search | 工具定义 token 减少 85%（55K → ~10K） |
| 程序化调用 | 多步工作流 token 减少 37% |
| 综合效果 | MCP vs CLI 从 32 倍差距缩至约 7 倍 |
7 倍差距仍然显著，但在云端 Agent 场景下，**标准化接入的价值往往超过 token 成本差**。本地 CLI 的优势（--help 自描述、可组合 jq/pipe）在无文件系统、需跨平台认证的云端场景并不适用。

### Skills 与 MCP 的分工终于清晰
Anthropic 的明确定义结束了之前的混淆：
| 角色 | 职责 | 例子 |
|------|------|------|
| MCP | 管「能力」——连接外部系统 | Snowflake、Databricks MCP server |
| Skills | 管「编排」——告诉 Agent 怎么用这些连接 | 10 个 Skills 驱动 8 个 MCP servers |
这不是竞争关系，而是分层职责。Claude 数据插件的案例（10 Skills + 8 MCP servers）证明了分工的有效性。

### 发展图景的三层分工
```
本地开发环境 → CLI + Skills（轻量、快速、上下文干净）
云端生产环境 → MCP + Skills（标准化、跨平台、认证完备）
简单场景     → 直连 API（别过度工程）
```
MCP 的真正地盘是**云端 Agent 标准化接入层**——这里需要统一认证、跨平台一致性和生态锁定，CLI 的本地优势（可组合性、自描述）在这个场景不重要。

## 实践启示
### 给 MCP 服务器开发者的建议
1. **不要把每个 API 端点暴露为一个工具**：超过 50 个工具时，考虑用 `search` + `execute` 的代码编排模式压缩抽象层面
2. **按意图分组而非按 API 分组**：Tool Search 的效果依赖良好的意图分类，工具名和描述需要以 Agent 视角编写
3. **程序化调用是默认模式**：设计工具时假设结果会被 Agent 在沙箱里做循环/过滤/聚合，不要假设模型会逐个工具调用后直接返回结果

### 给 Agent 开发者的建议
1. **云端场景优先考虑 MCP，本地场景优先考虑 CLI**：不要因为「MCP 流行」就盲目在本地开发场景使用
2. **用 Skills 管编排，用 MCP 管能力**：在 Architecture Decision Record 里明确这个分工，避免职责重叠
3. **简单一对一场景直连 API**：10 Agent × 10 服务 = 100 个集成的 M×N 问题在没有标准化收益时不值得引入

### 工具选择的决策树
```
是否有复杂多步工作流？
  ├─ 是 → 考虑程序化调用（减少 37% token）
  └─ 否 → 继续
是否有超过 50 个 API 端点需要暴露？
  ├─ 是 → search + execute 代码编排模式
  └─ 否 → 继续
是本地开发还是云端生产？
  ├─ 本地 → CLI + Skills
  └─ 云端 → MCP + Skills
```

### 生态信号
- MCP SDK 月下载量从 1 亿 → 3 亿（不到一年 3x），用脚投票的趋势明确
- 第三方（Canva、Notion、Sentry）开始同时发布 MCP server + Skills，生态正在往分工协作方向成熟
- Anthropic 官方正在开发 Skills 从 MCP 服务器直接分发的扩展，API 升级时 Skills 自动更新

## 交叉引用
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/anthropic-mcp-revisited-tool-search-code-orchestration.md)
- [Agent Skill 编写指南](../ch04/264-agent-skill.html) — Skills 管「编排」，MCP 管「能力」，两者互补
- [Agent 上下文窗口管理对比](https://github.com/QianJinGuo/wiki/blob/main/entities/context-window-management.md) — MCP token 膨胀问题与上下文窗口管理相关
- [OpenClaw 架构解析](https://github.com/QianJinGuo/wiki/blob/main/concepts/openclaw-architecture.md) — OpenClaw 的 Tool/MessageBus 设计可对比 MCP 架构

## 相关实体
- [Anthropic 官方生产级 Agent 最佳实践：12 个可复用的 MCP 设计模式](../ch01/893-anthropic.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/tool-use-mcp-patterns.md)

---

