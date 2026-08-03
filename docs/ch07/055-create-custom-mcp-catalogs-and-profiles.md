# Create Custom MCP Catalogs and Profiles

## Ch07.055 Create Custom MCP Catalogs and Profiles

> 📊 Level ⭐⭐ | 7.9KB | `entities/create-custom-mcp-catalogs-and-profiles.md`

# Create Custom MCP Catalogs and Profiles
→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/create-custom-mcp-catalogs-and-profiles.md)

## 摘要
Docker 宣布 Custom Catalogs 与 MCP Profiles 正式 GA（General Availability），为 MCP 服务器的组织级管理提供两个互补的抽象：Catalogs 把组织批准的可信服务器集合封装为可分发、不可变的 OCI artifact，Profiles 则让个人按工作场景定义可移植的服务器分组与配置。二者共同回应了 MCP 规模化落地中的核心命题——工具接入已经标准化，真正的挑战是"协调"（coordination）。

## 核心要点
- **Custom Catalogs 正式 GA**：组织可将 Docker MCP Catalog、社区来源与内部自建 server 组合为一份"已批准的服务器清单"，成员在组织边界内即可集中发现与使用可信工具，无需在公网自行搜索评估。
- **创建流程全 CLI 可完成**：先为自建 server 编写 metadata YAML（name/title/type/image/description），再用 `docker mcp catalog create` 混合引用 `catalog://` 官方条目与 `file://` 本地定义，`catalog show` 校验内容，`catalog push` 分发。
- **Profiles 是可移植的命名分组**：一个 Profile 即一组可连接到 agent session 的 MCP 服务器，coding / planning / research 各建一个，切换工作模式只需把 client reassign 到对应 Profile，只把需要的工具留在 context 里。
- **Profiles 提供配置持久化层**：server 的可配置项（如 Markitdown 可访问的路径）可定义一次反复复用；还能按 tool 粒度启用/禁用（如 GitHub server 只开 `get_me`），其余 tool 不进 session、不占 context window。
- **共享即 OCI push/pull**：Profiles 与 Catalogs 一样可推送到容器 registry 供团队拉取；未来 agent skill 也可引用 Profile，把它当作依赖拉入所需服务器与配置。
- **设计分工明确**：Catalogs 定义"组织推荐什么"（golden path 与 guardrails），Profiles 定义"个人如何工作"（自由组合与实验），整体追求 portable、composable、scalable 的系统特性。
- **路线图**：governance and policy controls、可发现性与共享改进、Profile-scoped secrets 与配置（替代项目级 mcp.json）、与 agent skills 结合的 best practices。

## 深度分析
### 企业 MCP 治理的结构性需求
MCP 协议标准化了"如何接入工具"，却从未回答"哪些工具可信、由谁批准"。组织规模化采用 MCP 时反复听到同一个诉求：团队需要一份可信的 MCP 服务器清单，其中必须包含内部自建服务器。Custom Catalogs 正是对这一结构性缺口的回应——平台团队把审批过的服务器（官方 Catalog + 社区来源 + 自建）打包成一个可发布的 catalog 实体，开发者无需理解内部审批流程，即可在组织边界内集中发现可信工具；文章甚至点破：随着 MCP 采用增长，挑战不再是"能否访问工具"，而是"如何协调"。

### Profiles：上下文隔离与配置状态层
当 agent 连接多个 MCP 服务器时，所有导出的 tool 都会进入 context window，工具一多，上下文额度便迅速被耗尽。Profiles 通过两层机制解决这一实际问题：一是命名分组与 client reassign——coding 与 planning 各对应一组服务器，切换工作模式只需把 client 重新指过去，仅当前需要的工具留在 context；二是 tool 级开关与配置持久化——只启用 GitHub server 的 `get_me` 而禁用其余工具，把 Markitdown 的访问路径存进 Profile，"一次配置、反复复用"。这套"薄交互面 + 按意图组织工具"的思路与 `MCP 12 生产模式` 高度呼应，只是落到了终端用户层。

### OCI 分发模型：继承容器 registry 的安全语义
把 Catalog 与 Profile 都做成 OCI artifact，最有价值的一点是"免费继承"容器镜像已有的分发与访问控制体系——私有 Catalog 只需按老办法管理 Docker Hub（或任意 OCI registry）的仓库级权限，无需引入新基础设施、无需学习新系统。该模式还可自然扩展：换用私有容器 registry，或通过 streamable HTTP 引用自托管的远程 MCP server。这与 [混合云 MCP 运维场景](ch07/001-mcp.html) 中"基础设施团队提供标准化 server"的分层思路同源：把分发层接在既有的企业容器安全体系之上，采纳成本趋近于零。

### 平台与个人的分工边界
文章收尾给出了整套设计的分界线：Catalogs 回答"组织推荐什么"，Profiles 回答"个人如何工作"。平台团队通过发布 golden path 确立标准与 guardrails，开发者则保留适应、实验与自由组合 Profiles 的空间。这一分离让治理不至于沦为管控——标准统一在分发层，灵活保留在使用层，从而让 MCP 在组织内"更容易采用、更安全地管理、更有效地扩展"。对 in-house 服务器而言，暴露更丰富的配置选项还能让同一 server 跨项目复用、按上下文重配置，产出更可预测。

## 实践启示
1. **平台/基础设施团队**：从自定义 Catalog 起步，先把内部自建 MCP server 纳入可信清单，再逐步引入社区 server 作为可选扩展；Catalog 的迭代节奏应与内部工具审批流程对齐，用 `docker mcp catalog push` 把 golden path 发布为 OCI artifact。
2. **开发者**：养成按工作场景创建 Profile 的习惯——coding、planning、research 各一个，切换时只需 reassign client 而非重配 server；工具数量增长后，这一习惯直接决定 context window 的健康度。
3. **开发者**：善用 Profile 的配置持久化，把 Markitdown 这类带路径/权限配置的 server 参数存一次、处处复用；对自己 in-house 的 server，主动暴露更丰富的配置选项以支持跨项目复用。
4. **安全/治理团队**：私有 Catalog 的访问控制可直接复用现有 registry 仓库权限模型，零新增基础设施；同时跟踪路线图中的 governance and policy controls，把 MCP 使用约束到已批准的 Catalog 与可信 server 来源。
5. **安全/治理团队**：留意 Profile-scoped secrets 与配置的演进——它有望替代项目级 `mcp.json`，为敏感工具凭据提供更细粒度的隔离边界。
6. **全员**：关注 Profile 与 agent skills 的结合方向——skill 引用 Profile 并拉取其服务器与配置，可把"已验证的工具组合"变成可组合的依赖单元，值得在团队内先行试点。

## 相关实体
- `MCP 12 生产模式` — 12 种 Agent 连接外部工具的工程模式，与 Catalogs/Profiles 的薄交互面、按意图组织工具设计互补
- [AWS DevOps Agent × MCP Server](ch07/001-mcp.html) — 混合云 MCP 运维闭环实践，体现基础设施标准化与业务侧自由组合的分层原则
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/tool-use-mcp-patterns.md) — 工具使用与 MCP 模式总览

---

