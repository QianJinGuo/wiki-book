# Securing AI Agents: AWS × Cisco AI Defense 给 MCP / A2A 加上企业级护栏

## Ch07.027 Securing AI Agents: AWS × Cisco AI Defense 给 MCP / A2A 加上企业级护栏

> 📊 Level ⭐⭐ | 10.2KB | `entities/securing-ai-agents-how-aws-and-cisco-ai-defense-scale-mcp-and-a2a.md`

# Securing AI Agents: AWS × Cisco AI Defense 给 MCP / A2A 加上企业级护栏

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/securing-ai-agents-how-aws-and-cisco-ai-defense-scale-mcp-and-a2a.md)

## 摘要

AWS 和 Cisco AI Defense 在 2026 年 5 月发布合作方案，针对 MCP（Model Context Protocol，2024-11 推出）、A2A（Agent-to-Agent Protocol，2025-04 推出）和新近兴起的 Agent Skills 在企业基础设施中的规模化部署提供安全护栏。核心交付物是 AWS 主导的开源项目 **AI Registry** 与 Cisco AI Defense 的扫描能力集成——在统一控制平面下完成可见性、供应链扫描、合规审计三件大事，把"人工数周评审"压缩为"自动扫描 + 必要时人工复核"。

## 核心要点

- **协议普及速度**：MCP 半年内被企业广泛采用，企业常管理数十到数百个 MCP servers
- **三大安全缺口**：可见性盲区（不知道部署了哪些 Agent / Tools）、安全评审瓶颈（人工流程数周级）、合规审计缺位（无自主 Agent 审计踪迹）
- **核心风险**：未审核的 MCP server、A2A agent、Skills 可能访问敏感系统、违反 SOX/GDPR 合规要求、引入可被利用的漏洞
- **AI Registry 定位**：AWS 主导的开源项目，作为统一控制平面注册和发现所有 MCP server、AI agent、Agent Skill
- **三层防护**：可见性（统一注册）→ 供应链安全（自动扫描）→ 合规审计（自动标签 + 人工复核）
- **Cisco AI Defense 集成**：每个新 MCP/A2A 组件注册时自动扫描，发现问题自动标记为 `security-pending disabled`，必须管理员审核才能启用
- **自服务开通**：自动化扫描配合人工复核，把"人工、慢速"流程变成"自动、内置护栏"流程
- **业内引用**：Akshay Bhargava（Cisco AI Product VP）——「安全是企业 AI 采用的基础要求」

## 深度分析

### 企业 AI Agent 部署的"三盲区"

AWS/Cisco 把企业 AI 部署的核心痛点归纳为三个盲区，每个盲区都有具体的合规和运营后果：

**盲区 1：工具蔓延与可见性缺失**
- 现象：团队 ad-hoc 在云端和本地基础设施上添加 server / agent，安全团队几乎不可能维护全局视图
- 后果：企业不知道有哪些工具可用、哪些 agent 在通信、谁在使用、是否存在安全风险
- 根因：MCP/A2A 的低门槛让"添加一个新 server"变成几行配置，不需要安全团队参与

**盲区 2：供应链安全不可扩展**
- 现象：第三方 MCP server 和 A2A agent 可能包含漏洞、恶意代码、不安全模式
- 后果：手动审查在数量级上完全跟不上部署速度
- 根因：MCP 生态还在早期，没有"应用商店级"的安全审核机制

**盲区 3：合规审计缺位**
- 现象：传统 SOX/GDPR 等合规框架要求审计踪迹，但自主 AI Agent 没有这种设计
- 后果：审计失败带来监管暴露，合规团队难以量化
- 根因：Agent 决策路径是黑盒，合规团队不知道"哪个 Agent 在什么时候访问了什么数据"

### AI Registry + Cisco AI Defense 的三层防护

合作方案的技术核心是把"注册-发现-扫描-审计"四步流水线化：

**层 1：统一注册与发现（AI Registry）**
- 每个 MCP server、AI agent、Agent Skill 必须在统一控制平面注册
- 提供完整可见性：哪些工具可用 / 哪些 agent 互相通信 / 谁在使用 / 是否有安全风险
- 这是"零信任"在 AI 资产上的具体实现——不注册不能使用

**层 2：自动供应链扫描（Cisco AI Defense）**
- 当新 server/agent 添加到注册表时，安全扫描自动执行
- 扫描器分析每个 MCP tool、A2A agent card、Agent Skill，生成详细安全报告
- 发现问题自动标记为 `security-pending disabled`，需要管理员审核
- 适用于所有场景：数据库访问 MCP server、跨基础设施多步工作流 A2A agent 等

**层 3：合规审计 + 自服务开通**
- 自动化扫描 + 人工复核（仅在发现安全漏洞时）实现"内置护栏的自服务开通"
- 把"人工、慢速"流程变成"自动、快速"流程
- 显著加速新 MCP server、agent、Skills 的引入

### 行业意义：企业 AI 安全的"标准化时刻"

这个合作的真正意义不在具体产品，而在它**定义了一个范式**：

1. **"注册制"成为企业 AI 部署的事实标准**：未来每个企业部署 AI Agent 都需要某种形式的注册表，无论叫 AI Registry、Agent Catalog 还是 Tool Inventory
2. **"安全厂商 × 云厂商"合作模式被验证**：Cisco（安全巨头）+ AWS（云巨头）的合作模式可能成为模板，未来 Palo Alto + Azure、Check Point + GCP 都会跟进
3. **"扫描 + 人工复核"成为合规基线**：企业 AI 部署的合规要求从"事后审计"升级为"事前扫描 + 事中标记 + 事后追溯"
4. **MCP/A2A 从"开发者协议"升级为"企业协议"**：随着安全护栏的成熟，MCP/A2A 不再只是 Anthropic / Google 的实验性协议，而是企业级基础设施

### 与 [U Of T Ai Worm Cleverhans Research](/ch12-043-u-of-t-ai-worm-cleverhans-lab-展示可自适应的-ai-蠕虫威胁/) 的连接

U of T CleverHans 团队展示的 AI Worm 揭示的威胁场景，与本文描述的"自服务开通 + 安全护栏"形成直接对照：

- **U of T 视角**：AI Agent 在企业外部被武器化作为攻击工具
- **AWS/Cisco 视角**：AI Agent 在企业内部需要被注册、扫描、审计

两个视角共同勾勒出"AI 安全双轨制"：外部威胁需要 AI 行为检测（见 U of T 文章），内部部署需要 AI 资产可见性（见本文）。企业 AI 安全战略必须同时覆盖这两条战线。

### MCP Gateway Registry 的具体价值

AWS 在合作中开源的 **MCP Gateway Registry** 提供"agent 和 server 治理的统一控制平面"，这是合作中最值得开发者关注的部分：

- **统一注册**：避免 server/agent 在不同部门孤立注册
- **版本管理**：跟踪每个 server/agent 的版本、配置变更
- **权限控制**：基于角色限制谁能调用哪个 server
- **审计日志**：所有调用留痕，支持合规审计
- **策略执行**：统一的工具白名单、调用频率限制

这与 [Qy_Zacztcs1Ql3Bifmbmgg](/ch04-276-claude-code-subagent-详解-把探索过程关进独立工作区/) 中 Claude Code Subagent 的 `description` 路由机制形成有趣对照——Subagent 是"agent → 工具"的小尺度路由，MCP Gateway Registry 是"agent → 工具"的企业级路由。两者本质上是同一种抽象在不同尺度的实现。

## 实践启示

- **企业 AI 战略必须包含"AI 资产清单"**：没有 AI 资产清单就没有 AI 风险管理。AI Registry 应该作为企业 AI 平台的第一块基石
- **MCP server 管理需要类 API Gateway 思维**：每个 MCP server 都是一个潜在攻击向量，需要集中治理而不是 ad-hoc 添加
- **"扫描 + 人工复核"是合规基线**：纯自动扫描会有误报，纯人工审查不可扩展。两者的结合是当前最务实的路径
- **关注 MCP / A2A 协议的安全规范演进**：协议本身的安全设计（如 token 传递、调用链追溯）会直接影响企业架构决策
- **多厂商合作模式可能成为企业 AI 安全事实标准**：单家厂商无法同时覆盖"协议层 + 基础设施层 + 安全扫描层"，需要生态合作
- **安全是架构设计的核心而非事后补丁**：在 Agent 部署的初期就把安全护栏纳入设计，比后期补漏成本低一个数量级
- **MCP Gateway Registry 应该优先内部建设**：在依赖外部开源项目前，评估是否可以基于开源版本定制内部版本，避免供应商锁定

## 相关实体

- [U Of T Ai Worm Cleverhans Research](/ch12-043-u-of-t-ai-worm-cleverhans-lab-展示可自适应的-ai-蠕虫威胁/)
- [Qy_Zacztcs1Ql3Bifmbmgg](/ch04-276-claude-code-subagent-详解-把探索过程关进独立工作区/)
- [Claude Code Harness Deep Understanding](/ch01-367-claude-code-harness-deep-understanding/)
- [Harness Engineering Core Patterns Claude Code](/ch01-698-深入浅出-harness-engineering-之核心模式与理念/)
- [Ai Agent Engineer Learning Roadmap Backend 2026](/ch04-450-ai-agent-工程师学习路线-面向资深后端-大数据工程师的能力地图/)
- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](/ch04-268-agentops-operationalize-agentic-ai-at-scale-with-amazon-bed/)
- [Agent Security Architecture](/ch04-359-introducing-aimap-security-testing-for-ai-agent-bishop-f/)
- Mcp Protocol Ecosystem
- [Llm Security Red Teaming](/ch01-912-red-teaming-after-mythos-zico-kolter-matt-fredrikson-gr/)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/securing-ai-agents-how-aws-and-cisco-ai-defense-scale-mcp-and-a2a.md)
- [电商 ai 操作系统崛起：从「工具人」到「all in one」+ 行业 knowhow skill 化 + 5 巨头](/ch07-028-电商-ai-操作系统崛起-从-工具人-到-all-in-one-行业-knowhow-skill-化-5-巨头/)

---

