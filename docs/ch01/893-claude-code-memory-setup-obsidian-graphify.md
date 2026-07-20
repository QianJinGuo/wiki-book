# Claude Code Memory Setup (Obsidian + Graphify)

## Ch01.893 Claude Code Memory Setup (Obsidian + Graphify)

> 📊 Level ⭐⭐ | 4.6KB | `entities/claude-code-memory-setup-obsidian-graphify.md`

# Claude Code Memory Setup (Obsidian + Graphify)
**作者**：楠楠自瑜
**平台**：微信
**原始链接**：https://mp.weixin.qq.com/s/UKDFPzcYv0coW9P0n_3jSg
**GitHub**：lucasrosati/claude-code-memory-setup
**评分**：v=7, c=8, score=56
**入库日期**：2026-05-13
---

## 概要
通过组合 Obsidian（声明性记忆）+ Graphify（结构性记忆）为 Claude Code 建立持久化记忆系统，将查询 token 成本从 20,000+ 降至约 280，实现 71.5 倍效率提升。

## 核心要点
### 两层记忆架构
- **Obsidian（声明性记忆）**：Zettelkasten 风格原子笔记、会话日志、架构决策；通过 /resume 和 /save 命令在会话间传递记忆
- **Graphify（结构性记忆）**：基于 tree-sitter 的代码知识图谱生成 CLI，支持 20+ 编程语言；126 个 TypeScript 文件 → 172KB 图谱（332 节点、258 条边）

### 关键效果指标
| 指标 | 数值 |
|------|------|
| Token 消耗降低 | 降至原来的 1.4%（71.5 倍） |
| 查询 token | 从 20,000+ 降至约 280 |
| 图谱大小 | 172KB / 126 文件 |
| 节点数 | 332 |
| 边数 | 258 |

### 工作流
```
Claude Code 启动 → /resume 加载 Obsidian 上下文
→ 查询 graph.json 理解代码结构
→ /save 写入会话日志
→ git commit 触发 git hook 重建图谱
```

## 技术背景
- Graphify 使用 tree-sitter 解析代码，支持 20+ 语言
- git hook 集成实现每次提交自动更新知识图谱
- CLAUDE.md 放在 Obsidian 仓库根目录，告诉 Claude Code 如何读写该仓库

## 价值分析
- **对 token 付费用户**：显著降低成本
- **对限额用户**：避免早早耗完配额
- **保留决策历史**：避免凌晨解决的 bug消失在聊天记录中

## 深度分析
两层记忆架构的设计体现了"声明性记忆 + 结构性记忆"的互补逻辑。Obsidian 作为声明性记忆层，通过 Zettelkasten 风格的原子笔记记录决策上下文和会话历史，解决的是"昨天做了什么"的短期跨会话问题；Graphify 作为结构性记忆层，通过 tree-sitter 解析代码库生成知识图谱，解决的是"代码结构是什么"的长期项目理解问题。
**token 成本结构分析**：传统方式下，Claude Code 每个新会话都需要重新读取项目文件来理解代码结构，对于 126 个 TypeScript 文件的项目，每次全量读取消耗 20,000+ token。通过 Graphify 生成 172KB 的 JSON 图谱（332 节点、258 条边）后，查询成本降至约 280 token，实现 71.5 倍效率提升。这个差异在大规模团队协作或长周期项目中会形成显著的成本累积。
**git hook 自动化的设计**：每次 git commit 触发图谱自动重建，确保知识图谱始终反映最新代码状态。这个设计将记忆更新从主动操作变为被动行为，降低了维护成本。

## 实践启示
- **适用场景优先**：对于日均新建会话次数多、代码库规模中等（50-200 文件级）的个人开发者或小团队，价值最显著；大型代码库可能需要更复杂的图谱分层策略
- **CLAUDE.md 是入口**：Obsidian 仓库根目录的 CLAUDE.md 文件是 Claude Code 理解记忆系统工作方式的唯一文档，编写清晰的使用说明至关重要
- **图谱更新策略**：对于超大型代码库，可以考虑按模块或按需生成图谱，而非全量每次重建，以平衡新鲜度和生成成本
- **长期价值**：保留决策历史的额外收益在于项目复盘和能力传承——新成员加入时可以快速理解过去的技术决策上下文

## 相关项目
- lucasrosati/claude-code-memory-setup
- Graphify
- Obsidian
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-memory-setup-token-71x楠楠自瑜.md)

## 相关实体
- [Claude Code vs OpenClaw Agent 记忆系统对比](../ch03/076-claude-code.html)
- [Claude Code vs OpenClaw 记忆系统 — 向量数据库必要性反思](../ch03/076-claude-code.html)
- [开源 AI 知识管理搭档 Obsidian + Claude Code 完整集成指南](../ch03/075-obsidian-claude-code.html)
- [obsidian claude code integration guide](../ch09/128-obsidian-claude-code-integration-guide.html)
- [Obsidian + Claude Code 集成指南](../ch09/128-obsidian-claude-code-integration-guide.html)
- [CLAUDE.md 12 条规则：Karpathy 扩展模板](../ch09/084-claude-code-1.html)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/memory-context-systems.md)

---

