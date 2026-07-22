# How Dropbox uses MCP and Dash to close the design-to-code security gap

## Ch01.159 How Dropbox uses MCP and Dash to close the design-to-code security gap

> 📊 Level ⭐ | 3.6KB | `entities/dropbox-mcp-dash-design-code-security.md`

# How Dropbox uses MCP and Dash to close the design-to-code security gap

> Source: [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/dropbox-mcp-dash-design-code-security.md)

## 核心要点

- **来源**: https://dropbox.tech/security/dropbox-mcp-dash-design-code-security
- **评分**: v=7, c=6, v×c=42, stars=4
- **评估理由**: Solid technical case study from Dropbox addressing a real problem (design-to-code security gap) with concrete data (12% link-back rate, 54% delay >1 month). Provides actionable insights on using MCP and Dash to bridge threat models and code review. However, the article appears truncated mid-sentence

## 内容提炼

Markdown Content:
Every security team knows the drill: a new feature goes through design review, a threat model is produced, mitigations are agreed upon, and then development begins. In many cases, by the time implementation reaches code review, the process where engineers review code changes before they go live, the original security requirements are no longer visible in the workflow. A threat model, which outlines potential security risks and the protections a feature should include, often lives in a separate document or system from the code itself.

This separation creates a challenge. Implementation often happens weeks or months after the original security review, making it difficult for reviewers to verify that the agreed-upon security requirements were actually implemented. At Dropbox, we wanted to understand how often this gap appears in practice.

That led us to build a system that combines three technologies: Model Context Protocol, foundational large language models (which we’ll refer to as foundational models), and Dash, the AI capabilities within Dropbox that make it easier to find and understand your team’s content. Together, these technologies automatically retrieve r

## 关键洞察

- ## Using Dash and MCP as a context bridge
- ## Implementing design-to-code traceability
- Using Dash’s semantic search—the same retrieval capability that powers its user-facing search—we successfully linked 80% of design reviews to their implementing code changes
- Only 12% of those code changes explicitly reference the design review
- % of connections were recoverable only through semantic search, meaning most of the relationship between design reviews and implementation would be invisible through manual references alone
- ## Design principles and what’s next

## 实践启示

- 文章的核心论点可在生产环境验证
- 与现有实体的差异化角度：本文来自 dropbox.tech 视角
- 引用源：[Dropbox Mcp Dash Design Code Security](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/dropbox-mcp-dash-design-code-security.md)
## 相关实体
- [what is urban density design? a clear guide to how cities ge](ch01/1237-what-is-urban-density-design-a-clear-guide-to-how-cities-ge.html)
- [how to create websites with great ux designs: principles and](ch01/138-how-to-create-websites-with-great-ux-designs-principles-and.html)
- [how we made window join parallel and vectorized](ch01/035-how-we-made-window-join-parallel-and-vectorized.html)

---

