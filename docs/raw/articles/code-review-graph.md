---
title: code-review-graph：Claude Code 本地知识图谱，减少 6.8 倍代码审查 Token
source_url: https://mp.weixin.qq.com/s/jc5RZB9eIYSAmEUMfMxtkg
publish_date: 2026-04-25
tags: [wechat, article, claude, gemini]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: 411b825f4932b111bb710f715ff9a942da33f90928c60ec3e0282d3cc1f9f7ac
---
# code-review-graph：Claude Code 本地知识图谱，减少 6.8 倍代码审查 Token
> 来源：微信公众号「AI开源提效指南」  
> URL：https://mp.weixin.qq.com/s/jc5RZB9eIYSAmEUMfMxtkg  
> 发布时间：2026年4月9日 22:30  
> SHA-256：`3efa514c6791a5bc44b0c186003c2b6d9be9c903b246a859254c0b9ff563a0f5`
## 核心概述
code-review-graph 是一个本地知识图谱工具，专为 Claude Code 等 AI 编码助手设计。
设计理念：**"停止浪费 Token，开始更智能地审查"**。简单来说 code-review-graph 修复了 AI 编码工具每次任务都重新读取整个代码库的问题。
核心价值：
- 构建代码的结构化地图
- 使用 Tree-sitter 追踪增量变更
- 通过 MCP 给 AI 助手提供精确上下文
- 只读取需要的内容
## 核心特性
### Token 效率提升
| 场景 | Token 减少倍数 |
|------|---------------|
| 代码审查 | 6.8 |
| 日常编码任务 | 49 |
| 平均减少 | 8.2 |
### 支持 19 种语言 + Notebook
主流语言: Python、TypeScript/TSX、JavaScript、Vue、Go、Rust、Java
其他语言: Scala、C#、Ruby、Kotlin、Swift、PHP、Solidity、C/C++、Dart、R、Perl、Lua
Notebook: Jupyter/Databricks (.ipynb) 多语言单元格支持（Python、R、SQL）
### 智能影响分析 — Blast Radius（爆炸半径）分析
- 当文件变更时，图谱追踪每个调用者、依赖项和可能受影响的测试
- AI 只读取这些文件，而非扫描整个项目
- **100% 召回率** — 从不错过真正受影响的文件
### 增量更新
- 每次 git 提交或文件保存时，钩子自动触发
- 图谱对变更文件进行 diff，通过 SHA-256 哈希检查找到依赖项
- 2900 个文件的项目，重新索引**仅需不到 2 秒**
### 大型单体仓库优化
- 27,700+ 个文件被排除在审查上下文之外
- 仅约 15 个文件实际被读取
- 在大型单体仓库中，Token 浪费最痛苦，图谱能切断噪音
## 工作原理
### 架构图
```
你的代码库
    ↓
Tree-sitter AST 解析
    ↓
图谱节点（函数、类、导入）+ 边（调用、继承、测试覆盖）
    ↓
MCP 查询
    ↓
AI 助手只读取必要内容
```
### 增量更新流程
```
文件变更 → 钩子触发 → diff 变更文件
    ↓
找到依赖项（SHA-256 哈希检查）
    ↓
仅重新解析变更内容
    ↓
图谱更新完成（<2 秒）
```
## 性能基准测试
所有数据来自对 6 个真实开源仓库的自动化评估（共 13 次提交）。
### Token 效率对比
| 仓库 | 提交数 | 平均 Naive Tokens | 平均 Graph Tokens | 减少倍数 |
|------|--------|-------------------|-------------------|----------|
| express | 2 | 693 | 983 | 0.7x |
| fastapi | 2 | 4,944 | 614 | 8.1x |
| flask | 2 | 44,751 | 4,252 | 9.1x |
| gin | 3 | 21,972 | 1,153 | 16.4x |
| httpx | 2 | 12,044 | 1,728 | 6.9x |
| nextjs | 2 | 9,882 | 1,249 | 8.0x |
| **平均** | **13** | — | — | **8.2x** |
> **注意**：express 显示 <1x 是因为小型包的单文件变更中，图谱上下文（元数据、边、审查指导）可能超过原始文件大小。图谱方法在多文件变更时优势明显。
### 影响分析准确率
| 仓库 | 平均 F1 | 平均精确率 | 召回率 |
|------|---------|------------|--------|
| express | 0.667 | 0.50 | **1.0** |
| fastapi | 0.584 | 0.42 | **1.0** |
| flask | 0.475 | 0.34 | **1.0** |
| gin | 0.429 | 0.29 | **1.0** |
| httpx | 0.762 | 0.63 | **1.0** |
| nextjs | 0.331 | 0.20 | **1.0** |
| **平均** | **0.54** | **0.38** | **1.0** |
100% 召回率是保守权衡，宁可标记过多文件，也不错过破坏性依赖。
### 构建性能
| 仓库 | 文件数 | 节点数 | 边数 | 流检测 | 搜索延迟 |
|------|--------|--------|------|--------|----------|
| express | 141 | 1,910 | 17,553 | 106ms | 0.7ms |
| fastapi | 1,122 | 6,285 | 27,117 | 128ms | 1.5ms |
| flask | 83 | 1,446 | 7,974 | 95ms | 0.7ms |
| gin | 99 | 1,286 | 16,762 | 111ms | 0.5ms |
| httpx | 60 | 1,253 | 7,896 | 96ms | 0.4ms |
## 快速开始
### 安装
```bash
pip install code-review-graph  # 或：pipx install code-review-graph
code-review-graph install      # 自动检测并配置所有支持的平台
code-review-graph build       # 解析代码库
```
`install` 一条命令完成：检测 AI 编码工具 → 写入 MCP 配置 → 注入图谱感知指令 → 检测 uvx/pip 安装方式。
### 支持的平台
| 平台 | 命令 |
|------|------|
| Cursor | `code-review-graph install --platform cursor` |
| Claude Code | `code-review-graph install --platform claude-code` |
| Windsurf/Zed/Continue/OpenCode/Antigravity | 自动检测 |
> ⚠️ 需要 Python 3.10+。推荐安装 uv，MCP 配置优先使用 uvx。
### 使用
打开项目后，对 AI 助手说：
```
Build the code review graph for this project
```
初始构建：500 个文件约需 10 秒，之后自动增量更新。
## 22 个 MCP 工具
| 工具 | 描述 |
|------|------|
| `build_or_update_graph_tool` | 构建或增量更新图谱 |
| `get_impact_radius_tool` | 变更文件的爆炸半径 |
| `get_review_context_tool` | Token 优化的审查上下文 |
| `query_graph_tool` | 调用者/被调用者/测试/导入/继承查询 |
| `semantic_search_nodes_tool` | 按名称或含义搜索代码实体 |
| `embed_graph_tool` | 计算向量嵌入用于语义搜索 |
| `list_graph_stats_tool` | 图谱大小和健康状态 |
| `find_large_functions_tool` | 查找超过行数阈值的函数/类 |
| `list_flows_tool` | 列出执行流，按关键性排序 |
| `get_flow_tool` | 获取单个执行流的详情 |
| `get_affected_flows_tool` | 查找受变更文件影响的流 |
| `list_communities_tool` | 列出检测到的代码社区 |
| `get_community_tool` | 获取单个社区的详情 |
| `get_architecture_overview_tool` | 从社区结构获取架构概览 |
| `detect_changes_tool` | 代码审查的风险评分变更影响分析 |
| `refactor_tool` | 重命名预览、死代码检测、建议 |
| `apply_refactor_tool` | 应用先前预览的重构 |
| `generate_wiki_tool` | 从社区生成 Markdown Wiki |
| `get_wiki_page_tool` | 检索特定 Wiki 页面 |
| `list_repos_tool` | 列出已注册的仓库 |
| `cross_repo_search_tool` | 跨所有已注册仓库搜索 |
### 5 个 MCP Prompts 工作流模板
`review_changes`（审查变更）、`architecture_map`（架构映射）、`debug_issue`（调试问题）、`onboard_developer`（开发者入职）、`pre_merge_check`（合并前检查）
## 功能特性一览
| 功能 | 详情 |
|------|------|
| 增量更新 | 仅重新解析变更文件，后续更新 <2 秒 |
| 19 种语言 + Notebook | Python/TS/JS/Go/Rust/Java 等 |
| 爆炸半径分析 | 精确显示变更影响的函数、类、文件 |
| 自动更新钩子 | 每次文件编辑和 git 提交自动更新 |
| 语义搜索 | 可选向量嵌入（sentence-transformers/Google Gemini/MiniMax） |
| 交互式可视化 | D3.js 力导向图，支持边类型切换和搜索 |
| 本地存储 | SQLite 在 `.code-review-graph/`，无需外部数据库 |
| Watch 模式 | 工作时持续更新图谱 |
| 执行流追踪 | 从入口点追踪调用链，按关键性排序 |
| 社区检测 | Leiden 算法或文件分组聚类相关代码 |
| 架构概览 | 自动生成架构图，带耦合警告 |
| 风险评分审查 | `detect_changes` 将 diff 映射到受影响函数、流和测试缺口 |
| 重构工具 | 重命名预览、死代码检测、社区驱动建议 |
| Wiki 生成 | 从社区结构自动生成 Markdown Wiki |
| 多仓库注册表 | 注册多个仓库，跨所有仓库搜索 |
| MCP Prompts | 5 个工作流模板 |
| 全文搜索 | FTS5 驱动的混合搜索，结合关键词和向量相似度 |
## CLI 参考
```bash
# 安装
code-review-graph install --platform <name>
# 图谱管理
code-review-graph build      # 解析整个代码库
code-review-graph update      # 增量更新（仅变更文件）
code-review-graph status      # 图谱统计信息
code-review-graph watch       # 文件变更时自动更新
code-review-graph visualize   # 生成交互式 HTML 图谱
# 高级功能
code-review-graph wiki              # 从社区生成 Markdown Wiki
code-review-graph detect-changes    # 风险评分的变更影响分析
code-review-graph register <path>   # 注册仓库到多仓库注册表
code-review-graph unregister <id>   # 从注册表移除
code-review-graph repos             # 列出已注册的仓库
code-review-graph eval              # 运行评估基准测试
code-review-graph serve             # 启动 MCP 服务器
```
## 配置
### 排除路径
创建 `.code-review-graphignore` 文件：
```
generated/**
*.generated.ts
vendor/**
node_modules/**
```
### 可选依赖组
```bash
pip install code-review-graph[embeddings]        # 本地向量嵌入
pip install code-review-graph[google-embeddings] # Google Gemini 嵌入
pip install code-review-graph[communities]       # 社区检测
pip install code-review-graph[eval]              # 评估基准测试
pip install code-review-graph[wiki]              # Wiki 生成
pip install code-review-graph[all]               # 所有可选依赖
```
## 参考
- 官方网站: https://code-review-graph.com
- GitHub 仓库: https://github.com/tirth8205/code-review-graph