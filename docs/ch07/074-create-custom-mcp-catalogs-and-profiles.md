# Create Custom MCP Catalogs and Profiles

## Ch07.074 Create Custom MCP Catalogs and Profiles

> 📊 Level ⭐⭐ | 4.1KB | `entities/create-custom-mcp-catalogs-and-profiles.md`

## 核心要点
-
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/create-custom-mcp-catalogs-and-profiles.md)

## 深度分析
### 企业 MCP 治理的结构性需求
Custom Catalogs 的出现回应了 MCP 生态中的一个核心矛盾：协议标准化了工具的接入方式，但工具的分发与审批仍然缺乏统一机制。在组织内部，不同团队可能需要不同的 MCP 服务器集合——研发需要 Playwright/GitHub，运营需要 Notion/Atlassian，而敏感岗位可能只允许使用经过安全审计的内部服务。Custom Catalogs 允许平台团队将这些约束封装成一个可分发的 OCI artifact，让开发者无需理解内部审批流程即可获得可信工具集。

### Profiles 作为上下文隔离层
Profiles 的设计目标不仅是"分组"，更是**上下文隔离**。当 Agent 连接多个 MCP 服务器时，所有服务器的 tool 都会进入 context window——在 tool 数量较多时会迅速消耗宝贵的上下文额度。Profiles 通过让用户选择性地启用/禁用特定 tool，解决了这一实际问题。此外，Profiles 支持保存配置状态（如 Markitdown 的访问路径），实现"一次配置、反复复用"的工作流。这与 `MCP 12 生产模式` 中的"薄交互面"和"按意图组织工具"模式形成呼应——Profiles 本质上是这两个模式在终端用户层的具象化。

### OCI 分发模型的安全含义
将 Catalog 和 Profile 都作为 OCI artifact 分发，意味着它们天然继承了容器镜像的访问控制语义——私有 Catalog 只需在 Docker Hub（或任意 OCI registry）上设置仓库级权限，无需引入新的基础设施。这一设计将 MCP 的分发层与已有的企业容器安全体系打通，对于已有一套 Docker 镜像管理流程的组织，采纳成本几乎为零。

### 平台与个人的分工边界
文章的核心观点是：Custom Catalogs 定义"组织推荐什么"，Profiles 定义"个人如何工作"。这一分离让平台团队承担治理责任（可信服务器清单、版本稳定性），同时保留个人灵活度（工具组合、配置细节、跨项目迁移）。这种分层设计是[混合云 MCP 运维场景](ch07/046-aws-devops-agent-mcp-server.html)中同样适用的原则——基础设施团队提供标准化的 MCP server，而使用它们的 Agent workflow 由业务团队自行掌控。

## 实践启示
**对于平台/基础设施团队**：从自定义 Catalog 开始，先将内部自建的 MCP server 纳入可信清单，再逐步引入社区服务器作为可选扩展。Catalog 的迭代周期应与内部工具审批流程对齐。
**对于开发者**：养成按工作场景创建 Profile 的习惯——coding、planning、research 各一个Profile，切换时只需重连 client，而非重新配置 server。这一习惯在工具数量增长时尤为关键。
**对于安全/治理团队**：关注文章提到的下一步方向——governance and policy controls。若 Profile 能与 SSO/权限系统绑定，Profiles 有潜力成为 MCP 时代的"设备管理"层。

## 关联阅读
-  — 12 种 Agent 连接外部工具的工程模式，与 Catalogs/Profiles 的设计思路高度互补
-  — 混合云场景下的 MCP 实际运维闭环实践

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/tool-use-mcp-patterns.md)

---

