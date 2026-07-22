---
title: 开源 AI 知识管理搭档 Obsidian + Claude Code 完整集成指南
source_url: https://mp.weixin.qq.com/s/57U6XeKCGtVkQXnNqg9DJQ
publish_date: 2026-05-08
tags: [wechat, article, claude, agent, rag, gemini]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: 7cae35b61217e9fab7892c2e69013239436515a59a23c0d8ff54543fb04e299a
---

```
**查询所有项目配置**：
```dataview
TABLE project, stack, status
FROM ""
WHERE type = "claude-config"
SORT project ASC
```
**列出所有 Claude 计划（按最近更新）**：
```dataview
TABLE file.mtime as "最后修改"
FROM "claude-global/plans"
SORT file.mtime DESC
```
## Obsidian CLI 的突破性进展
Obsidian 1.12 引入的 CLI，可以说把整个集成方式往前推了一大步。现在像 Claude Code、Codex、Gemini CLI 这类工具，都可以直接「使用」 Obsidian，而不只是简单地读文件。
有开发者在一个 4,000+ 文件、16GB 的仓库上做过测试，结果很直观：
- **找孤立笔记**：从十几秒降到不到 1 秒（大约 50 倍提升）
- **全仓搜索**：也有明显加速
本质上，它解决的是一个老问题：以前 AI 只能用 grep 这种方式「硬扫文件」，现在可以直接利用 Obsidian 的索引能力。
如果把几种接入方式简单排一下：
1. **Obsidian CLI** → 最快、最省 token
2. **REST API（社区插件）** → 灵活，但多一层调用
3. **文件系统（grep / glob）** → 最慢，也最耗 token
另外一个值得关注的点是：Obsidian 官方也在逐步完善 Claude 相关能力（比如专门的 skills），让 Claude 能更自然地编辑 .md 、.canvas 这类文件。
## 社区最佳实践
社区里有个挺有共识的原则：
> **AI 负责读取，人负责书写**
意思是，你的 vault 应该记录的是 **你自己的思考**。Claude 用来读这些内容、补充上下文，但不应该把生成的内容一股脑写进去，把 vault 变成「AI 输出的集合」。
更清晰一点的做法是：把 Claude 的输出（比如计划、会话、记忆）放在 ~/.claude/，而 vault 本身只保留真正有价值的知识和思考。
在这个思路下，一些自定义命令也挺有意思：
- **/my-world** — 加载整个 vault 的上下文
- **/today** — 从每日笔记出发做当天规划
- **/close** — 做一天的总结和反思
- **/trace** — 回溯一个想法是怎么一步步演变的
- **/ghost** — 用你的语气，基于已有内容来回答
## 社区资源
### 博客文章（偏方法和实践）
- Chase AI — Claude Code + Obsidian Persistent Memory： https://www.chaseai.io/blog/claude-code-obsidian-persistent-memory
- WhyTryAI — Build Your Second Brain： https://www.whytryai.com/p/claude-code-obsidian
- Noah Vincent — AI Second Brain Setup： https://noahvnct.substack.com/p/how-to-build-your-ai-second-brain
- Niclas Dern — My Obsidian + Claude Code Setup： https://niclasdern.substack.com/p/my-obsidian-claude-code-setup
- Kyle Gao — Using Claude Code with Obsidian： https://kyleygao.com/blog/2025/using-claude-code-with-obsidian/
- Kenneth Reitz — Obsidian Vaults and Claude Code： https://kennethreitz.org/essays/2026-03-06-obsidian_vaults_and_claude_code
- Sebastian Steins — Symlinks for Obsidian： https://www.ssp.sh/brain/add-external-folders-git-blog-book-to-my-obsidian-vault-via-symlink/
- XDA — Claude Code Inside Obsidian： https://www.xda-developers.com/claude-code-inside-obsidian-and-it-was-eye-opening/
- Awesome Claude — 3 Ways to Use Obsidian with Claude Code： https://awesomeclaude.ai/how-to/use-obsidian-with-claude-code
### GitHub（模板 & 工具）
- 带目标管理的 starter： https://github.com/ballred/obsidian-claude-pkm
- 可演化的第二大脑模板： https://github.com/huytieu/COG-second-brain
- 基于 Git 的同步方案： https://github.com/ksanderer/claude-vault
- 预配置的 Vault 结构： https://github.com/heyitsnoah/claudesidian
### 引用链接
[1] ballred/obsidian-claude-pkm: https://github.com/ballred/obsidian-claude-pkm
[2] IPARAG 结构: https://noahvnct.substack.com/p/how-to-build-your-ai-second-brain
[3] obsidian-claude-code-mcp: https://github.com/iansinnott/obsidian-claude-code-mcp
[4] Claudesidian MCP: https://github.com/ProfSynapse/claudesidian-mcp
[5] QMD: https://github.com/tobi/qmd
[6] File Explorer++: https://github.com/kelszo/obsidian-file-explorer-plus
[7] File Ignore: https://obsidian-file-ignore.kkuk.dev/
[8] Dataview: https://github.com/blacksmithgu/obsidian-dataview
[9] Templater: https://www.obsidianstats.com/plugins/templater-obsidian
[10] Claudian: https://github.com/YishenTu/claudian
[11] Agent Client: https://github.com/RAIT-09/obsidian-agent-client
[12] Claude Sidebar: https://github.com/derek-larson14/obsidian-claude-sidebar
[13] Folder Note: https://lostpaul.github.io/obsidian-folder-notes/
[14] File Hider: https://github.com/Eldritch-Oliver/file-hider
[15] Hide Folders: https://github.com/JonasDoesThings/obsidian-hide-folders