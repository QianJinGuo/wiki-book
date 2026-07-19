# 2 小时，0 行手写代码，我用 Claude 做了一个生产级 VSCode 插件

## Ch09.124 2 小时，0 行手写代码，我用 Claude 做了一个生产级 VSCode 插件

> 📊 Level ⭐⭐ | 6.0KB | `entities/2-小时0-行手写代码我用-claude-做了一个生产级-vscode-插件.md`

## 核心摘要

作者在零 VSCode 插件开发经验、零 Chrome Cookie 加密知识、零 UUAP SSO 了解的前提下，用 Claude AI 辅助在 2 小时内完成了一个生产级 VSCode 插件的开发。该插件能自动读取浏览器登录态、实时监控 Comate 模型用量、支持三色告警和失效自动恢复。

## 深度分析

### 1. AI 是陌生领域的知识倍增器，而非替代者

作者面对的三大盲区——VSCode 插件开发、Chrome Cookie 加密机制（v10 + AES-128-CBC + PBKDF2 + M118+ origin binding）、UUAP SSO 多域 cookie 分散——每一项都是独立的知识壁垒。Claude 的核心价值在于它能覆盖"广为人知但我不知道"的细节，例如 Chrome M118+ 的 32 字节 SHA256(host_key) origin binding，这种细节在传统独立开发中可能让人卡关数天。

### 2. 提供"足够的上下文"是 AI 辅助质量的决定性因素

作者总结的核心经验：差的提问（"插件跑不起来有错"）→ Claude 只能猜测；好的提问（完整 TS 报错或完整 cURL 命令）→ Claude 立刻精确定位。Claude 吞吐上下文的能力比你实际贴出来的信息量更关键——必须主动把报错、真实响应、期望行为、已有代码全部喂进去。这解释了为什么同样用 AI，有人 2 小时搞定，有人花 2 天还在原地。

### 3. AI 主动否定不可行方案是最高价值的贡献

当作者想用 Webview 登录方案时，Claude 直白指出两个致命问题：VSCode 扩展 API 不暴露 webview 的 cookie 读取能力 + SSO 系统普遍设 X-Frame-Options: DENY。如果 AI 只是迎合用户，可能会先写一堆 webview 代码，跑起来发现不行再推翻——浪费几小时。Claude 在"告诉你什么方案不可行"上的价值不亚于写代码。

### 4. 承认局限并设计 fallback 是成熟工程的标志

Claude 主动承认"浏览器自动读取偶尔会因为 SSO 多域 cookie 处理不全而失败"，并设计了 cURL 导入作为兜底，最终形成"三合一登录向导"：浏览器读取（推荐）→ cURL 导入（最稳）→ 手动粘贴（保底）。即使自动方式失败，用户 30 秒也能搞定。这种"承认我不能 100% 保证，并设计 fallback"的能力远超闭门造车。

### 5. 长上下文项目需维护状态文档防止 AI"重新猜"

项目后期（约 1 小时后），Claude 有时会重新"猜"之前已决定好的东西——如重写 `updateStatusBar` 时部分变量名与之前保存版本对不上。作者的应对是：每次让 AI 改一个模块时先把完整现状贴出来，或维护一份"当前代码状态"速记文档。这提示 AI 辅助长程任务时，上下文管理本身就是一种工程实践。

## 实践启示

1. **用完整报错代替模糊描述**：遇到错误时，复制粘贴完整 TypeScript/终端报错信息给 AI，而非"跑不起来"这样的描述。前者让 AI 立刻给出精确修复方案，后者只能得到一堆猜测。

2. **先让 AI 评估方案可行性再动手**：当你有一个想法时，先让 AI 分析"这个方案有哪些致命问题"，而不是直接让它写代码。如果 AI 直接否定你想要的路径，这往往是最节省时间的开始。

3. **始终用真实响应验证 AI 猜测的数据结构**：AI 第一版猜的 API 字段名（`quota`/`used_quota`）与实际（`monthly_quota_limit`/`monthly_used_quota`）完全不同。在生产环境中，这类字段名不匹配可能导致静默数据错误，永远用真实 API 响应验证 AI 的类型定义。

4. **面向不熟悉领域的项目，优先问"有没有已知的坑"**：涉及"广为人知但你不熟"的领域时，多问一句"这个方案有没有已知的坑/边界情况"。Cookie 作用域问题（不同域下同名 cookie 导致覆盖）就是这样被预防的。

5. **长项目建立"状态快照"机制**：超过 1 小时的多轮对话项目，维护一份当前代码状态速记文档，每次改模块前先贴出完整现状，防止 AI 重新发明已知结论。

## 关联阅读

## 相关实体
- [Claude Code Prompt Context Harness](ch09/060-claude-code-prompt.html)
- [Claude Vscode Plugin Zero Code](../ch01/1036-claude.html)
- [Doubao Seed 2 Lite Agent Multimodal](../ch03/046-agent.html)
- [刚刚Opus 47发布相比46核心变化与Claude Code搭配最佳实践 V2](../ch03/076-claude-code.html)
- [Agentscope Java Harness Framework Enterprise Distributed](../ch05/018-harness.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/2-小时0-行手写代码我用-claude-做了一个生产级-vscode-插件.md)

## 相关实体
- `Claude Code记忆` — AI辅助长程项目的上下文管理
- `OpenClaw团队` — AI辅助编码的工程实践

---

