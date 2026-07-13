# Google Antigravity agents get full context with GitLab Orbit

## Ch04.486 Google Antigravity agents get full context with GitLab Orbit

> 📊 Level ⭐⭐ | 5.5KB | `entities/gitlab-orbit-google-antigravity.md`

# Google Antigravity agents get full context with GitLab Orbit

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/gitlab-orbit-google-antigravity.md)

## 摘要

GitLab Orbit 是 GitLab 的生命周期上下文图谱引擎，现已通过 [MCP（Model Context Protocol）](https://modelcontextprotocol.io/) 集成到 [Google Antigravity](https://antigravity.google/docs/mcp) 平台。该集成使 Antigravity Agent 能够结构化查询 GitLab 实例中的项目、流水线、合并请求、漏洞和源代码，解决了编码 Agent 缺乏全局上下文的核心痛点。在早期内部测试中，接入 Orbit 的 Agent 响应速度快 11 倍、token 消耗减少 4.5 倍、幻觉减少 45 倍。

## 核心要点

### Agent 上下文缺失问题

没有 Orbit 的 Antigravity Agent 只能看到文件和终端，无法理解更广泛的系统：哪些服务依赖被修改的代码、其他地方是否标记了类似漏洞、谁审查过类似变更。这些上下文存在于 DevSecOps 平台中，此前需要自定义脚本或手动复制粘贴。

### GitLab Orbit 技术架构

Orbit 索引 GitLab 实例，构建包含以下实体关系的知识图谱：

- **节点类型**：Groups、Projects、Users、Work Items、Merge Requests、Pipelines、Vulnerabilities、Source Code
- **MCP 工具**：`query_graph`（执行结构化查询）、`get_graph_schema`（返回可用节点类型、属性和关系）
- **查询语言**：JSON DSL，返回类型化结果
- **索引范围**：Ruby、Java、Kotlin、Python、TypeScript、JavaScript、Rust、C# 的默认分支
- **刷新频率**：变更后数分钟内重新索引

### 三大关键用户旅程

**1. 爆炸半径分析（Blast Radius Analysis）**

重构共享 auth 库前，Agent 可通过一次查询返回：依赖该模块的所有 importer、涉及这些文件的所有进行中 MR、以及各自的 owner。工程师在编辑一行代码前就能看到冲突点和协作对象。

**2. 入职与代码库探索（Onboarding & Codebase Exploration）**

开发者请求服务的依赖、入口文件和本周 MR，Agent 查询知识图谱后生成 **Walkthrough Artifact**——可保留的可扫描地图，而非滚动消失的聊天回答。Orbit 分钟级重索引确保地图反映当前状态。

**3. 依赖映射与图像生成（Dependency Mapping + Image Generation）**

技术负责人查询组内服务依赖结构，由 Agent 使用 [Nano Banana Pro](https://deepmind.google/models/gemini-image/pro/) 渲染为架构图。节点和边来自实时图谱，而非过时的文档。可按条件过滤（如仅有未解决安全发现的服务），且查询受权限控制，图表可安全共享。

### 集成方式

通过 Antigravity MCP Store 一键安装：Settings → Customization → MCP → Add MCP → 选择 GitLab Orbit → GitLab OAuth 认证。无需配置文件或终端操作。

### 商业模型

- GitLab Premium 和 Ultimate 层级可用
- MCP 查询消耗 [GitLab Credits](https://docs.gitlab.com/subscriptions/gitlab_credits/)
- `get_graph_schema` 调用免费
- 与 [Duo Agent Platform](https://about.gitlab.com/gitlab-duo-agent-platform/) 共享同一知识图谱引擎

## 深度分析

### MCP 作为 Agent 工具生态的标准协议

此集成是 MCP 生态扩展的典型案例。GitLab 通过 MCP 暴露结构化查询能力，而非构建专属 Agent——这意味着任何支持 MCP 的 Agent 平台（Antigravity、Claude Desktop 等）都可接入。MCP Store 作为「集成枢纽」的模式正在形成。

### 知识图谱 vs 文件系统

传统编码 Agent 基于文件系统工作（读文件、写文件、跑终端命令）。Orbit 引入了**关系型上下文层**——Agent 理解的不再是孤立文件，而是项目-依赖-人员-漏洞的网络。这从根本上改变了 Agent 的推理能力。

### 幻觉减少 45 倍的机制

Agent 幻觉的主要来源是缺乏事实锚点。知识图谱提供了可验证的事实基础——Agent 不再「猜测」依赖关系或代码所有权，而是查询获得。这是 RAG（检索增强生成）在代码领域的深化应用。

## 实践启示

- **编码 Agent 的下一个瓶颈是上下文，不是推理能力**——Orbit 的 11x 响应速度提升来自减少不必要的探索
- **MCP 生态正在形成网络效应**——工具只需实现一次 MCP 接口，即可被所有兼容平台消费
- **权限感知的图谱查询**解决了企业安全顾虑——查询结果自动过滤为用户可访问范围
- **Walkthrough Artifact** 概念值得借鉴——Agent 输出应是可持久化的知识资产，而非一次性对话

## 相关实体

- [MCP Tools](https://github.com/QianJinGuo/wiki/blob/main/concepts/learning/chap-16-tools-mcp.md)：Orbit 集成的底层协议
- [Agentic RAG](https://github.com/QianJinGuo/wiki/blob/main/concepts/agentic-rag-patterns.md)：知识图谱驱动的幻觉减少机制

---

