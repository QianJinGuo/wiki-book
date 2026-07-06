# Claude Code 实践：token 效率提高 71.5 倍的工作流

## Ch03.081 Claude Code 实践：token 效率提高 71.5 倍的工作流

> 📊 Level ⭐⭐ | 9.4KB | `entities/claude-code-memory-setup-token-71x楠楠自瑜.md`

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

## 深度分析
### 两层记忆架构的设计哲学
这个方案的核心价值在于将"记忆"分为两个正交维度：**声明性记忆**（Obsidian/Zettelkasten）和**结构性记忆**（Graphify/tree-sitter）。前者解决"昨天做了什么"，后者解决"代码是怎么组织的"。这种分离设计的洞见在于：上下文窗口应该只包含当前任务相关的上下文，而非整个代码库的原始内容。

### Token 效率的量化路径
文章报告的 71.5 倍效率提升来自一个具体案例：126 个 TypeScript 文件、172KB 图谱（332 节点 + 258 边）、查询成本从 20,000+ token 降至约 280 token。这意味着：
1. **图谱压缩率**：原始文件大小 vs 图谱 JSON 的有效信息密度
2. **选择性加载**：只查询当前任务相关的子图，而非解析整个仓库
3. **结构先于内容**：Claude 先理解代码结构（模块边界、依赖关系），再按需读取具体实现

### Zettelkasten 方法在 AI 记忆系统中的适用性
Zettelkasten（原子化笔记+唯一ID+双向链接）的设计初衷是人类知识工作者的长期积累。移植到 AI 记忆系统后，其核心原则依然有效：每个会话日志应该是原子化的、可独立引用的、带有时间戳的决策记录。CLAUDE.md 作为索引文件，告诉 AI 如何导航这个知识库，而非将所有历史塞进上下文。

### 与官方记忆方案的对比
Claude Code 官方提供了 `/claude-cache` 和项目级记忆功能，但这个方案提供了更细粒度的控制：

- **官方方案**：基于会话历史的隐式记忆，依赖模型recall
- **此方案**：显式的结构化记忆，图谱+笔记，AI 按需查询
对于大型代码库（50+ 文件），结构化记忆的效率优势更明显，因为官方方案的隐式记忆仍然需要模型处理完整的上下文窗口。

## 实践启示
### 1. 建立项目记忆的工作流优先级
对于新项目，从第一天起就建立两层记忆结构：
1. **Obsidian 仓库**：包含 CLAUDE.md（索引）、会话日志目录（按日期）、架构决策目录（ADR）
2. **Graphify 图谱**：配置 tree-sitter 支持的语言，设置 git hook 自动更新
对于已有项目，可以渐进式建立：先用 Obsidian 记录会话决策，配合 Graphify 生成初始图谱。

### 2. 会话边界设计
/reset 和 /save 的使用场景需要明确区分：

- **需要保持上下文连续性时**：避免 /reset，让对话历史自然累积
- **需要明确任务边界时**：用 /save 写入结构化日志，明确标记任务完成
- **每个工作日结束时**：强制 /save，确保第二天 /resume 能恢复关键上下文

### 3. 图谱维护策略
Graphify 图谱与 git commit 绑定的设计确保了"代码变了，图谱也跟着变"。实践中需要注意：

- 大型仓库（500+ 文件）的图谱可能过大，需要按模块拆分或设置更新频率
- 对于快速迭代的代码，图谱更新频率应与代码变更频率匹配
- 图谱质量比数量重要：332 节点覆盖关键结构比 1000+ 节点包含噪音更有价值

### 4. 成本敏感的团队适用场景
对于 token 预算受限的团队（如使用 Claude Max 或有月度配额限制的开发者），此方案可以将有限配额分配给：

- 真正的代码生成和调试任务
- 而非重复读取相同文件
- 将 token 节省用于更长上下文窗口处理更复杂任务

### 5. 与 CLAUDE.md 的协同
CLAUDE.md 文件在此方案中承担双重角色：
1. **给 AI 的使用说明**：如何读写 Obsidian 仓库、如何调用 /resume 和 /save
2. **项目规范的结构化表达**：架构决策、编码规范、安全边界
建议 CLAUDE.md 保持简洁（<500 字），详细规范放在单独文档中，CLAUDE.md 只引用路径。

## 引用链接
- claude-code-memory-setup: https://github.com/lucasrosati/claude-code-memory-setup
- Graphify: https://github.com/lucasrosati/graphify
## 相关实体
- [Claude Code Self Repair Hooks Memory Config](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-self-repair-hooks-memory-config.md)
- [Claude Code Memory Setup Obsidian Graphify](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-memory-setup-obsidian-graphify.md)
- [开源 Ai 知识管理搭档 Obsidian Claude Code 完整集成指南 V2](https://github.com/QianJinGuo/wiki/blob/main/entities/开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南-v2.md)
- [Claude Code Prompt Source Analysis](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-prompt-source-analysis.md)
- [Claude Code Tool Design Evolution Anthropic](https://github.com/QianJinGuo/wiki/blob/main/entities/claude-code-tool-design-evolution-anthropic.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-code-memory-setup-token-71x楠楠自瑜.md)

## 相关实体
- `官方Memory Setup` — 同一工作流的官方版本
- `Hermes自我进化` — AI记忆系统的架构设计
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/memory-context-systems.md)

---

