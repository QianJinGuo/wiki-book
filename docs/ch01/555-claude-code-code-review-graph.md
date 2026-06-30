# 开源 Claude Code 本地代码知识图谱：code-review-graph 完整上手攻略

## Ch01.555 开源 Claude Code 本地代码知识图谱：code-review-graph 完整上手攻略

> 📊 Level ⭐⭐ | 6.6KB | `entities/code-review-graph-upper-intermediate-guide-20260513.md`

# 开源 Claude Code 本地代码知识图谱：code-review-graph 完整上手攻略
你有没有遇到过这种情况：在 Claude Code 里问一句「这个认证流程是怎么跑的？」、「我改这个类会影响哪里？」或者「帮我 review 一下最近的改动」，它就开始一轮又一轮地搜索、读取、拼上下文。
在小项目里，这种方式问题不大。文件数量少，调用链简单，AI 临时读几轮也能凑出答案。但只要项目变成 monorepo，或者后端服务开始拆成多个模块，AI 每次重新理解上下文的成本就会变得非常明显。
时间一长，你会发现一个很现实的问题：AI 对代码库的理解，很难持续积累。
本文要讲的，就是如何用 code-review-graph 给本地代码仓库建立一张知识图谱，再通过 MCP 接入 Claude Code。这样 Claude Code 不再只会反复读文件，而是能像查地图一样查询代码结构、依赖关系、核心节点和影响范围。

## 相关实体
- [Code Review Graph](ch01/620-code-review-graph-claude-code-6-8-token.md)
- [Claude Code Self Repair Hooks Memory Config](ch04/310-ai.md)
- [Claude Code Hackathon Winners 2026](ch01/786-claude-code-hackathon-winners-2026.md)
- [Claude Code Harness Deep Understanding](ch01/379-claude-code-harness-deep-understanding.md)
- [Claude Code Agent View Huashu](ch03/065-claude-code-agent-view-huashu.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/code-review-graph-upper-intermediate-guide-20260513.md)

## 深度分析

code-review-graph 解决的是一个根本性的工程问题：AI 编程工具在处理大型代码库时，缺少持久化、结构化的项目记忆。当项目规模从几十个文件扩展到数千个文件时，传统的「搜索 → 读取 → 猜测关系」工作方式会导致上下文窗口被大量无意义的信息填满，而真正相关的调用链反而被稀释。

从技术实现看，code-review-graph 的核心在于将代码解析为 AST（抽象语法树）而非仅做文本索引。Tree-sitter 作为解析器生成器，能够准确识别函数定义、函数调用、类、导入语句等代码实体的边界，并将它们转化为图谱中的节点与边。这种结构化的关系表示使得「谁调用了这个函数」「这个类被哪些文件引用」这类查询成为可能，而不是依赖模糊的关键词匹配。

blast-radius（影响半径）分析是该工具的核心价值输出。它解决的是代码评审中「改这个函数会影响到哪里」这个高频问题。传统的 Code Review 依赖人工判断或全量扫描，而 blast-radius 分析能够追踪调用链、依赖链，并定位相关测试文件，输出最小必要的评审上下文。这种「先缩小范围，再做判断」的思路，与人类工程师处理复杂代码变更时的思维模式高度一致。

本地 SQLite 存储是另一个关键设计选择。代码不离开本地机器，不上传云端，这对于企业内网项目、私有仓库、敏感业务代码来说，大幅降低了使用门槛。增量更新机制（基于 SHA-256 哈希只重新解析变化的文件）使得 2900 个文件的项目可以在 2 秒内完成索引，这意味着图谱可以持续跟踪代码状态，而不只是一次性快照。

从更宏观的视角看，code-review-graph 代表了 AI 编程工具的一种范式转变：从「模型临时理解代码」到「模型查询结构化代码记忆」。这与传统的 RAG（检索增强生成）思路有本质区别——不是把文档片段塞进上下文，而是让模型能够主动遍历和查询代码之间的关系图谱。当这种能力与 MCP 协议结合，AI 编程的下一步就不只是让模型更强，而是让它拥有持续积累的项目级理解。

## 实践启示

对于维护 monorepo 或多模块后端服务的团队，建议优先尝试 code-review-graph。这类项目的调用链复杂度最高，临时读取的成本也最明显，图谱带来的上下文精简效果最为突出。首次配置可以从单仓库开始，验证 blast-radius 分析的准确性后再推广到其他项目。

增量更新机制使得 watch 模式适合长期开启。开发过程中保持图谱实时更新，可以让每次 Code Review 都基于最新代码状态，而不需要手动触发重建。对于同时维护多个仓库的团队，daemon 模式（crg-daemon）可以统一管理多个项目的图谱，避免每个项目单独维护的繁琐。

MCP 工具的理解不需要记住全部，核心是 get_impact_radius_tool（blast-radius 分析）、query_graph_tool（关系查询）和 semantic_search_nodes_tool（语义搜索）这三个。在 Claude Code 里，大多数场景下只需描述任务，Claude Code 会自动选择合适的 MCP 工具；但当发现 AI 仍然大量使用 Grep/Read 扫文件时，需要检查 MCP 配置是否正确加载。

项目中的生成文件、第三方代码、vendor 目录应通过 .code-review-graphignore 排除，避免这些文件进入图谱污染搜索结果。对于 git 仓库，code-review-graph 默认只索引被 git 追踪的文件，.gitignore 内容通常自动跳过，.code-review-graphignore 更适合处理那些已被 git 追踪但不需要进入图谱的文件。

对于只有几十行代码的单文件脚本项目，图谱构建的价值有限，不必强行使用。code-review-graph 的适用场景是：多文件、多模块、多调用链的中大型项目，特别是需要频繁做 Code Review 或重构的团队。工具的价值在复杂项目中会指数级放大，在简单项目中反而可能显得多余。

---

