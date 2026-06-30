# Announcing Claude Managed Agents on Cloudflare

## Ch01.101 Announcing Claude Managed Agents on Cloudflare

> 📊 Level ⭐ | 5.4KB | `entities/announcing-claude-managed-agents-on-cloudflare.md`

## 核心要点
- Cloudflare 与 Anthropic 合作，将 Claude Managed Agents 集成到 Cloudflare Sandboxes 环境 
- Claude Agent 的核心推理循环运行在 Anthropic 平台（"大脑"），代码执行等基础设施运行在 Cloudflare（"手"），实现"脑手分离"架构 
- 提供轻量级 V8 isolate 沙箱，毫秒级启动，支持大规模并发，显著降低成本 
- 通过出站代理实现零信任安全模型，防止数据外泄，支持私有服务安全连接 
- 开箱即用内置 Browser Run、Email、自定义工具扩展等能力 

## 深度分析
1. **"脑手分离"架构重新定义 Agent 基础设施边界** — Anthropic 将 Claude Managed Agents 的核心推理循环保留在自有平台，而将代码执行沙箱完全委托给 Cloudflare。这种"decoupling the brain from the hands"的模式让开发者既能利用 Claude 强大的推理能力，又可掌控执行环境的安全与合规策略。这标志着 AI Agent 基础设施开始走向专业化分工：模型层与运行时层分离各自优化。
2. **轻量级 isolate 沙箱解决 Agent 大规模部署成本困境** — 传统 microVM 每个 Agent 都需要独立完整虚拟机，资源消耗大、启动慢、成本高。Cloudflare 的 V8 isolate 方案允许在单个 VM 上并发运行数千个隔离的 Agent 上下文，毫秒级启动。这为"每个客户运行数十个 Agent、每个员工同时运行数十个 Agent"的规模化场景提供了经济可行的技术路径。
3. **零信任出站代理将安全边界延伸到 Agent 执行层** — 通过可定制的出站代理动态注入凭证（而非硬编码在 Agent 环境中），结合服务级别 Allowlist 和元数据驱动的细粒度策略，实现了对 Agent 外部交互的全程可观测与控制。这一设计将 Cloudflare 在网络安全领域积累的零信任能力首次系统性地引入 AI Agent 安全框架。
4. **Browser Run 集成标志着 Agent 开始具备可观测的 Web 交互能力** — 内置的 `browser_search`、`browser_execute`、`screenshot`、`browse` 等工具，配合会话录制和审计日志，使 Agent 的 Web 行为完全可追踪。这对于需要 Agent 执行复杂 Web 操作的场景（自动化测试、竞争情报采集、实时价格监控等）具有重要的工程价值。
5. **Cloudflare 开发者平台生态的 Agent 化整合** — 从 Browser Run、Email、Workers AI 到 R2 存储、Cloudflare Mesh/Workers VPC，这些原本独立的服务通过统一的 Agent SDK 和工具定义框架（Zod schema）被系统性地编排进 Agent 能力矩阵。这意味着 Agent 开发不再需要从零构建基础设施，而可以直接利用现成的云端服务生态。

## 实践启示
1. **快速启动生产级 Agent 部署** — 利用 GitHub 上的默认部署模板（cloudflare/claude-managed-agents），在几分钟内完成从零到生产环境的搭建，无需手动配置复杂的云基础设施。
2. **根据工作负载类型选择沙箱策略** — 需要快速、便宜、大规模扩展时选择 V8 isolate（毫秒级启动、低成本）；需要完整 Linux 环境、运行 Docker/系统级工具时选择 microVM（Cloudflare Containers）。两者可通过配置无缝切换。
3. **优先配置出站代理安全策略** — 在 Agent 投入生产前，务必通过可定制代理配置凭证注入规则和服务暴露策略，防止敏感数据外泄。这是将 Agent 连接到内部系统时的首要安全步骤。
4. **充分利用内置工具减少自研成本** — Browser Run（浏览器控制）、Email（收件箱）、`call_service`（私有服务连接）、`image_generate`（Workers AI 图像生成）等内置工具均已与 Claude Agent 深度集成，启用即可使用，大幅降低自建工具链的工程投入。
5. **通过自定义工具扩展构建差异化能力** — fork 仓库后，仅需在 `custom-tools.js` 中用 Zod 定义输入 schema 并实现 `run` 函数，即可将 R2 存储、Cloudflare Workers、第三方 API 等任何服务包装为 Agent 工具。这种低代码扩展方式适合在通用能力之上构建垂直场景的竞争壁垒。
## 相关实体
- [Anthropic Puts Claude Agents On A Meter Across Its](ch04/503-agent.md)
- [Claude Managed Agents Self Hosted Sandbox Mcp Tunnels Enterprise](ch04/503-agent.md)
- [Claude Managed Agents](ch04/525-claude-managed-agents.md)
- [Anthropic Claude Managed Agents Platform Launch](ch04/338-anthropic-claude-managed-agents-platform-launch.md)
- [Anthropic Claude Managed Agents Platform 2026](ch04/503-agent.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/announcing-claude-managed-agents-on-cloudflare.md)

---

