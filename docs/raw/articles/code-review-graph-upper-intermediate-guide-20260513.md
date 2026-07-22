---
title: 开源 Claude Code 本地代码知识图谱：code-review-graph 完整上手攻略
source_url: https://mp.weixin.qq.com/s/D2WBfa_FDfgz2n6sndLIVg
publish_date: 2026-05-13
tags: [wechat, article, claude, kiro, gemini]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 871439c943f06921e7edbc45811fe146bc9536bab92d7c6a3ed0d7aa41ed31ef
---
# 开源 Claude Code 本地代码知识图谱：code-review-graph 完整上手攻略
原创 兔兔AGI 技术极简主义
2026年5月13日 16:30 江苏
你有没有遇到过这种情况：在 Claude Code 里问一句「这个认证流程是怎么跑的？」、「我改这个类会影响哪里？」或者「帮我 review 一下最近的改动」，它就开始一轮又一轮地搜索、读取、拼上下文。
在小项目里，这种方式问题不大。文件数量少，调用链简单，AI 临时读几轮也能凑出答案。但只要项目变成 monorepo，或者后端服务开始拆成多个模块，AI 每次重新理解上下文的成本就会变得非常明显。
时间一长，你会发现一个很现实的问题：AI 对代码库的理解，很难持续积累。
本文要讲的，就是如何用 code-review-graph 给本地代码仓库建立一张知识图谱，再通过 MCP 接入 Claude Code。这样 Claude Code 不再只会反复读文件，而是能像查地图一样查询代码结构、依赖关系、核心节点和影响范围。
## 为什么 AI 需要一张代码地图
### 反复读代码，是 AI 编程的隐形成本
现在的 AI 编程工具很强，但它们在处理代码库时，仍然有一个天然短板：缺少稳定、结构化、可复用的项目记忆。
你让 Claude Code 改一个接口，它需要先理解相关文件；你让它做一次 Code Review，它也需要先判断哪些文件可能受影响。这个过程本质上就是不断把代码重新塞进上下文，让模型现场理解。
对于小项目，这种方式可以接受。可一旦项目有几千、上万个文件，问题就来了：每次任务都重新扫描，既慢，也贵，还容易把注意力带偏。
最典型的情况是，你只改了一个底层函数，AI 却读了一堆无关页面、配置、脚手架代码。上下文窗口看起来被填满了，但真正有用的信息并不多。
### 本地知识图谱 + MCP 解决了什么
所谓本地代码知识图谱，本质上是把仓库里的代码、文档、图片、模块关系、调用关系、语义关系，抽象成节点和边。
函数是节点，类是节点，文档可以是节点，截图也可以是节点。调用关系、继承关系、导入关系、文档引用、功能关联，则变成节点之间的边。
这样一来，Claude Code 面对的就不再是一堆散落的文件，而是一张可以查询、遍历、聚类、追踪路径的图。
MCP，也就是 Model Context Protocol，则负责把这张图暴露给 Claude Code。你可以把它理解成：AI 工具连接本地能力的一套标准接口。
流程大概是这样：
本地仓库
 ↓
code-review-graph 构建图谱
 ↓
本地图数据
 ↓
MCP Server
 ↓
Claude Code 查询节点、关系、影响范围
有了这层能力之后，Claude Code 就可以先问图谱：
• 谁调用了这个函数？
• 这个类被哪些文件引用？
• 改这里会影响哪些路径？
• 最近一次提交的风险点在哪里？
• 哪些测试可能需要一起看？
这和传统的「搜索关键词 → 读取文件 → 猜测关系」完全不是一个工作方式。
## code-review-graph 工作原理
要理解 code-review-graph 的价值，先要理解它到底把代码变成了什么。
它不是简单做全文搜索，也不是给项目建一个普通索引。它做的是把代码库解析成一张结构化图谱：函数在哪里，类在哪里，谁调用了谁，哪些测试覆盖了哪些逻辑，这些关系都会被记录下来。
这样一来，Claude Code 不再只能靠「读文件」理解项目，而是可以先通过图谱判断：这次任务真正需要看的代码在哪里。
### 从代码到图谱：Tree-sitter、AST、节点与边
当你运行 code-review-graph build 时，它会先用 Tree-sitter 解析代码。
Tree-sitter 是一个解析器生成器，可以把源代码转成抽象语法树，也就是 AST。相比普通文本搜索，AST 能理解代码结构：哪里是函数定义，哪里是函数调用，哪里是类，哪里是导入语句。
code-review-graph 会从 AST 里提取这些信息，并构造成图谱里的节点和边：
• 节点：函数、类、导入语句、测试函数等代码实体。
• 边：调用关系、继承关系、测试覆盖关系等结构联系。
比如 A 函数调用了 B 函数，这就是一条调用边；某个测试文件覆盖了某个业务函数，这也是一条测试覆盖边。
这个图谱的意义在于，它把「代码长什么样」进一步变成了「代码之间有什么关系」。而代码评审最需要的，恰恰就是这种关系。
### 本地 SQLite 图谱：代码不离开你的机器
解析完成后，图谱会存储在项目本地的 .code-review-graph/ 目录里，底层使用 SQLite。
这点很关键。它不需要你把代码上传到云端，也不依赖外部服务。对于企业内网项目、私有仓库、敏感业务代码来说，这种本地化设计会让使用成本低很多。
你的代码始终留在自己的机器上，Claude Code 只是通过 MCP 拿到经过筛选的上下文。
这也是它和很多「云端代码理解服务」最大的区别：它更像是给本地开发环境补了一层结构化索引，而不是把代码交给另一个平台托管。
### blast-radius：让 AI 获取最小必要上下文
code-review-graph 最核心的能力，是 blast-radius 分析。
所谓 blast-radius，可以理解为一次改动会影响到的范围。你改了一个函数，它的调用者可能受影响；它依赖的函数可能需要一起看；相关测试也应该进入评审上下文。
一次影响范围分析大致会做这几件事：
1. 找到发生变更的文件和函数。
2. 追踪所有调用这个函数的地方。
3. 追踪这个函数调用的依赖。
4. 找到相关测试文件和测试函数。
5. 计算出受影响的最小文件集合。
最后，这份结果会通过 MCP 协议交给 Claude Code。Claude Code 拿到的就不再是整个项目，而是一份更聚焦的评审上下文。
这就是它的核心思路：先用图谱缩小问题范围，再让 AI 在正确范围内做判断。
### 增量更新：让图谱跟着代码走
图谱如果每次都要全量重建，那体验也不会好。
code-review-graph 的做法是增量更新：每次保存文件或发生 git commit 时，它会计算变更文件的 SHA-256 哈希，只重新解析变化的文件，再根据图谱关系局部更新相关节点。
根据实际使用经验，一个 2,900 文件的项目，重新索引可以在 2 秒内完成。
这意味着它不是一个「用一次就过期」的静态分析结果，而是可以随着你的开发过程持续更新。对 Claude Code 来说，这张图谱始终尽量接近当前代码状态。
## 快速上手指南
理解原理之后，我们进入实操。
### 1. 安装前准备
code-review-graph 需要 Python 3.10 或更高版本。
建议先在终端确认一下版本：
python --version
如果版本低于 3.10，先升级 Python。包管理工具可以用 pip，也可以用 pipx 做隔离安装；如果你习惯 uv，也可以继续沿用自己的 Python 工具链。
### 2. 快速安装与构建图谱
最简单的上手方式是三步：安装、配置、构建。
```bash
# 安装
pip install code-review-graph
# 或者用 pipx 隔离安装
pipx install code-review-graph
# 自动检测并配置支持的平台
code-review-graph install
# 在当前项目构建代码图谱
code-review-graph build
```
install 命令会自动检测你本机安装了哪些 AI 编程工具，并尝试为它们写入配置。
目前素材中列出的支持平台包括：
• Claude Code
• Cursor
• Codex
• Gemini CLI
• Kiro
• GitHub Copilot（VS Code）
• GitHub Copilot CLI
配置完成后，记得重启编辑器或 AI 工具，让 MCP 配置生效。
### 3. 只接入 Claude Code
如果你只想给 Claude Code 配置，可以直接指定平台：
```bash
code-review-graph install --platform claude-code
```
它会做几件事：
1. 写入 Claude Code 的 MCP 配置。
2. 注入图谱感知的规则和提示。
3. 安装平台原生 hooks 或 skills，如果当前环境支持。
配置文件通常会落在 ~/.claude.json 或项目内的 .claude/settings.json。
重启 Claude Code 后，可以直接对它说：
Build the code review graph for this project
Claude Code 会通过 MCP 调用对应工具，在当前项目里构建图谱。首次构建 500 个文件左右的项目，大约需要 10 秒。
### 4. 验证是否真的生效
配置写完，并不代表已经接入成功。
最直接的方法，是重新开一个 Claude Code 会话，然后问它：
如果我修改认证模块，会影响哪些调用路径？
如果 Claude Code 开始调用 get_impact_radius_tool、query_graph_tool、semantic_search_nodes 这类 MCP 工具，说明图谱已经正常接入了。
如果它还是大量使用 Grep、Read 之类的方式扫文件，那大概率是 MCP 没有正确加载，或者图谱本身没有构建成功。
## 常用技巧与最佳实践
### Claude Code 里的 Slash Commands
安装完成后，在 Claude Code 里可以使用几个快捷命令：
| 命令 | 功能 |
|------|------|
| /code-review-graph:build-graph | 构建或重建代码图谱 |
| /code-review-graph:review-delta | 评审自上次 commit 以来的变更 |
| /code-review-graph:review-pr | 完整 PR 评审，包含 blast-radius 分析 |
这几个命令的价值在于，不需要你手动判断该查哪些文件。Claude Code 会通过 MCP 触发图谱查询，再把结果用于评审。
实际使用时，我更建议先从 /code-review-graph:review-delta 开始。它的范围比较明确，适合日常开发中检查当前改动有没有影响其他调用链。
### 常用 CLI 工作流
除了 Claude Code 里的斜杠命令，你也可以直接使用 CLI：
```bash
# 构建图谱
code-review-graph build
# 增量更新，只解析变化的文件
code-review-graph update
# 查看图谱统计
code-review-graph status
# 监听模式，文件改动时自动更新
code-review-graph watch
# 生成交互式可视化图谱
code-review-graph visualize
# 导出为其他格式
code-review-graph visualize --format graphml
code-review-graph visualize --format svg
code-review-graph visualize --format obsidian
code-review-graph visualize --format cypher
# 风险评分的变更影响分析
code-review-graph detect-changes
# 启动 MCP 服务器
code-review-graph serve
```
其中 watch 很适合长期打开。它会监听文件变化，自动保持图谱更新，避免每次手动执行 update。
### MCP Tools 怎么理解
code-review-graph 暴露了不少 MCP 工具，但日常使用不需要记住全部。
你只需要理解几个核心工具的定位：
**核心工具：**
• get_minimal_context_tool：获取极简上下文，适合快速定位相关代码。
• get_impact_radius_tool：计算某个变更的 blast radius。
• get_review_context_tool：生成经过 token 优化的代码评审上下文。
• query_graph_tool：查询调用者、被调用者、测试、导入、继承关系。
• detect_changes_tool：对当前变更做风险评分和影响分析。
• semantic_search_nodes_tool：按名称或语义搜索代码实体。
**进阶工具：**
• traverse_graph_tool：从某个节点开始做 BFS 或 DFS 遍历。
• get_architecture_overview_tool：生成架构概览。
• get_hub_nodes_tool / get_bridge_nodes_tool：寻找架构热点和关键连接点。
• get_knowledge_gaps_tool：识别孤立节点、未测试热点等结构弱点。
不过在 Claude Code 里，大多数时候你不需要手动调用这些工具。你只要描述任务，Claude Code 会根据任务选择合适的 MCP 工具。
### 排除不需要索引的文件
如果项目里有生成文件、第三方代码、vendor 目录，可以用 .code-review-graphignore 排除。
在项目根目录创建 .code-review-graphignore：
```
generated/**
*.generated.ts
vendor/**
node_modules/**
```
如果当前项目是 git 仓库，code-review-graph 默认只索引被 git 追踪的文件。.gitignore 里的内容通常会自动跳过。.code-review-graphignore 更适合用来排除那些已经被 git 追踪，但你不希望进入图谱的文件。
### Windows 排障与配置示例
如果你在 Windows 上使用 Claude Code，遇到下面这类错误：
```
Invalid JSON: EOF while parsing
MCP error -32000: Connection closed
```
可以优先检查四件事：
1. 确保 fastmcp 版本 ≥ 3.2.4。
2. 不要在 MCP 配置里使用 cmd /c wrapper。
3. 直接调用 .exe 文件。
4. 设置 PYTHONUTF8=1 环境变量。
配置示例：
```json
{
  "mcpServers": {
    "code-review-graph": {
      "command": "C:\\path\\to\\venv\\Scripts\\code-review-graph.exe",
      "args": ["serve"],
      "env": { "PYTHONUTF8": "1" }
    }
  }
}
```
### 多仓库与长期使用
如果你维护多个项目，可以使用 daemon 模式统一管理：
```bash
# 注册仓库
crg-daemon add ~/project-a --alias proj-a
crg-daemon add ~/project-b
# 启动守护进程
crg-daemon start
# 查看状态
crg-daemon status
# 查看日志
crg-daemon logs --repo proj-a -f
# 停止守护进程
crg-daemon stop
```
Daemon 会持续监听多个仓库的变化，自动更新图谱。对于同时维护多个服务、多个包、多个仓库的团队，这种方式会比每个项目手动 build 更省心。
## 结语
Claude Code 这类 AI 编程工具的问题，不是不会读代码，而是太依赖临时读取。
当项目越来越大，临时读取就会变成一种隐形成本：慢、贵、不稳定，而且很难稳定复用上一次理解过的上下文。
它不一定适合所有场景。如果你只是改一个很小的单文件脚本，或者项目本身只有几十行代码，图谱构建带来的结构元数据可能反而显得多余。
但只要项目进入多文件、多模块、多调用链阶段，它的价值就会变得明显。
AI 编程的下一步，不只是让模型更强，而是让它拥有更好的项目记忆和结构化上下文。
GitHub 地址：https://github.com/tirth8205/code-review-graph