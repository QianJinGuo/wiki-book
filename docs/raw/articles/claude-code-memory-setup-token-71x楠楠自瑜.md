---
title: Claude Code 实践：token 效率提高 71.5 倍的工作流
source_url: https://mp.weixin.qq.com/s/UKDFPzcYv0coW9P0n_3jSg
publish_date: 2026-05-13
tags: [wechat, article, claude]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 5cdcce7f8d1fec2b5111a2f26bfd5d2c10302015d8cecbd729379bb8b87ab276
---
# Claude Code 实践：token 效率提高 71.5 倍的工作流
**作者**：楠楠自瑜  
**平台**：微信  
**原始链接**：https://mp.weixin.qq.com/s/UKDFPzcYv0coW9P0n_3jSg  
**抓取日期**：2026-05-13  
**来源**：cnutshell
---
每个用过 Claude Code 的开发人员都有过这种体会：关闭一个会话时感觉挺好的，第二天早上打开一个新的会话，Claude 像是"失忆"了一样。你得在新的会话中跟 Claude 重新解释项目的技术决策，然后 Claude 重新读取项目文件，在能解决问题之前，就已经用掉很多 token。每天重复这么几次，会浪费大量的 token。
**解决方案**：这篇文章分享一个名为 claude-code-memory-setup 的 GitHub 仓库。这个仓库通过组合两个免费工具为 Claude Code 建立持久化记忆系统，可以让 token 消耗降低至原来的 1.4%。
## 1. 本质上是一个两层结构
### 第一层：Obsidian 作为声明性记忆
- 为所有项目创建单一的 Obsidian 仓库
- Obsidian 仓库包含原子化的 Zettelkasten 风格笔记、会话日志、架构决策等
- Obsidian 仓库根目录下包含一个 CLAUDE.md 文件，告诉 Claude Code 如何读写这个仓库
- 通过 /resume 和 /save 命令实现会话间记忆传递
  - /resume 让 Claude 在回答任何问题之前读取最后几个会话日志和当前项目的决策文件
  - /save 写入一个新的会话日志，并可选择运行 git commit
- 解决"昨天做了什么"的失忆问题，不需要重复解释
### 第二层：Graphify 作为结构性记忆
- Graphify 是一个免费的 CLI 工具，它使用 tree-sitter（支持 20 多种语言）在本地解析代码库，生成知识图谱
- 将代码结构转换为可查询的 JSON 文件，Claude Code 查询这个文件，不需要重新读取源文件
- 对于一个包含 126 个 TypeScript 文件的项目，生成的图谱大小为 172KB，包含 332 个节点和 258 条边，查询成本从 20,000+ token 降至约 280 token
- 通过与 git hook 配对，可以在每次提交自动更新知识图谱
## 2. 工作流程
1. 打开 Claude Code -> /resume 加载 Obsidian 上下文
2. Claude 查询 graph.json 理解代码结构
3. 工作完成后 -> /save 写入日志
4. git commit 自动重建图谱
## 3. 记忆 vs 提示词
- 超越提示词工程：给 AI 提供持久化记忆和代码结构地图
- 记忆复合效应：提示词是短暂的，记忆是累积的
## 4. 实际价值
- 对于 token 付费用户：显著降低成本
- 对于限额用户：避免早早耗完配额
- 保留决策历史：凌晨 2 点解决的 bug 不再消失在聊天历史中
## 引用链接
- claude-code-memory-setup: https://github.com/lucasrosati/claude-code-memory-setup