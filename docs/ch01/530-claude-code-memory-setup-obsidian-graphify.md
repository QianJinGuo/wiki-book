# Claude Code Memory Setup (Obsidian + Graphify)

> 📊 Level ⭐⭐ | 6.4KB | `entities/claude-code-memory-setup-obsidian-graphify.md`

# Claude Code Memory Setup (Obsidian + Graphify)

## 摘要

楠楠自瑜（微信文章，2026-05）介绍了 lucasrosati/claude-code-memory-setup：通过组合 Obsidian（声明性记忆）与 Graphify（结构性记忆）两个免费工具，为 Claude Code 建立持久化记忆系统，解决"新会话失忆"问题。实测将代码查询 token 成本从 20,000+ 降至约 280（71.5 倍），并把"记忆 vs 提示词"的对立提炼为记忆工程的核心论点。

## 核心要点

- **两层记忆架构**：Obsidian 承担声明性记忆（Zettelkasten 原子笔记、会话日志、架构决策），Graphify 承担结构性记忆（tree-sitter 解析生成的代码知识图谱），两层互补而非替代
- **Obsidian 层**：单一仓库承载所有项目笔记，根目录 CLAUDE.md 作为读写协议入口；`/resume` 在回答前加载最近会话日志与决策文件，`/save` 写入新日志并可触发 git commit
- **Graphify 层**：免费 CLI，基于 tree-sitter 支持 20+ 语言，本地解析生成可查询 JSON 图谱；126 个 TypeScript 文件 → 172KB 图谱（332 节点、258 条边）
- **成本效果**：查询成本从 20,000+ token 降至约 280 token，即原消耗的 1.4%，71.5 倍效率提升
- **git hook 自动化**：每次 git commit 自动重建知识图谱，将记忆更新从主动操作变为被动行为，降低维护负担
- **记忆 vs 提示词**：提示词是短暂的、每次会话重新组织；记忆是累积的、随项目演进增值——给 AI 提供持久记忆与结构地图，而非每次都重新解释
- **价值分层**：token 付费用户直接省钱，限额用户避免配额提前耗尽，团队获得可追溯的决策历史

## 深度分析

### 声明性记忆与结构性记忆的互补逻辑

这套设计的核心不是把记忆塞进一个容器，而是按"信息的生命周期与形态"分层：Obsidian 解决"昨天做了什么"——决策上下文、会话历史、凌晨两点修掉的 bug；Graphify 解决"代码长什么样"——模块依赖、函数调用关系这类高频变化的结构信息。声明性记忆回答 Why（为什么这样决策），结构性记忆回答 What/Where（代码里有什么、在哪），Claude Code 在两层之间检索即可重建完整的项目心智模型。

### token 成本结构：从全量重读到索引查询

71.5 倍提升的本质是改变了信息的获取方式。传统工作流中，每个新会话 Claude 都要重新读取项目文件来"理解"代码结构，126 个 TypeScript 文件的全量读取消耗 20,000+ token，且该成本随会话数线性累积。Graphify 把结构理解前移到离线阶段：tree-sitter 本地解析后输出 172KB 紧凑图谱，会话中只需查询 ~280 token 的 JSON。这类似于数据库索引——把昂贵的全表扫描替换为廉价的索引查询，代价是图谱粒度有限，无法承载源码级细节。

### git hook 与文件系统即记忆总线

整套系统没有引入数据库或向量存储，记忆全部以 Markdown 与 JSON 文件落地，git 仓库既是版本控制也是记忆总线：git hook 在每次提交后自动重建图谱，`/save` 把会话沉淀为日志文件。这一设计让记忆更新与既有开发流程（commit）耦合，几乎零额外操作成本；但图谱全量重建的策略在超大代码库下会退化，需要按模块或按需分层生成，平衡新鲜度与生成成本。

### 与向量数据库记忆方案的对比

与依赖向量数据库的 agent 记忆方案（embedding + 相似度检索）相比，本方案走的是"显式结构化 + 确定性检索"路线：记忆文件人类可读、可审计、可版本化，检索结果精确可复现，无需 embedding 服务与语义漂移管理。其边界同样明显——不支持语义模糊召回，跨主题联想依赖显式链接；而向量方案擅长语义相似但存在幻觉检索与冷启动问题。在代码结构这类强规则领域，结构化图谱往往比向量检索更精准且成本低一个数量级；两者并非互斥，可形成"图谱定结构、向量补语义"的混合记忆。

## 实践启示

1. **先搭声明层再补结构层**：Obsidian + CLAUDE.md + `/resume` `/save` 是零门槛起点，几天内即可见效；Graphify 图谱在代码库膨胀后再引入
2. **认真写 CLAUDE.md**：它是 Claude 理解记忆系统的唯一契约文档，写清楚仓库结构、读写规则、何时 `/save`，直接决定记忆质量
3. **把 `/save` 变成肌肉记忆**：会话结束即沉淀日志，避免"凌晨解决的 bug 消失在聊天记录中"；配合 git hook 让图谱自动跟上代码演化
4. **按代码库规模选择图谱策略**：50–200 文件级项目全量重建即可；更大代码库按模块生成图谱，避免每次 commit 的重建成本失控
5. **用成本数据驱动方案选型**：若项目以结构检索为主（代码导航、依赖理解），本方案优于向量数据库；若需要跨主题语义联想，再评估混合方案

## 相关实体

- [Graphify：软件工程知识图谱](https://github.com/QianJinGuo/wiki-public/blob/main/entities/graphify-software-engineering-knowledge-graph.md)
- [Claude Code vs OpenClaw 记忆：向量数据库是否必要](../ch03/057-claude-code.html)
- [Claude Code vs OpenClaw Agent 记忆系统对比](../ch03/057-claude-code.html)
- [开源 AI 知识管理搭档 Obsidian + Claude Code 完整集成指南](../ch03/002-obsidian-claude-code.html)
- [obsidian claude code integration guide](../ch03/002-obsidian-claude-code.html)
- [Obsidian + Claude Code 集成指南](../ch03/002-obsidian-claude-code.html)
- [CLAUDE.md 12 条规则：Karpathy 扩展模板](../ch03/057-claude-code.html)
- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/memory-context-systems.md)

→ [原文存档](https://mp.weixin.qq.com/s/UKDFPzcYv0coW9P0n_3jSg)

---

