# Markdown 不会过时

## Ch01.605 Markdown 不会过时

> 📊 Level ⭐⭐ | 6.0KB | `entities/markdown-ai-era-ifanr-20260513.md`

## Thariq 的 HTML 主张 vs Markdown
Claude Code 工程师 Thariq 提出新观点：不用 Markdown，HTML 才是未来。观点在 X 上获得千万次浏览，Karpathy 转发并评论。
Karpathy 的看法：音频是大语言模型最好的输入，视觉是最好的输出；在 HTML 之后还有交互动画、神经网络直接生成的视频、以及最终某种人机之间真正的感知融合。

## 为什么 Markdown 最适合 AI

## 相关实体
- [Www.Infoworld 4171274 Anthropic Puts Claude Agents On A Meter Across Its Subscri](ch04/503-agent.md)
- [Claude Code Self Repair Hooks Memory Config](ch04/310-ai.md)
- [Skill Factory Yueheng](ch04/245-skill.md)
- [Code Review Graph](ch01/620-code-review-graph-claude-code-6-8-token.md)
- [300万人在存的Claude提示词](ch01/380-claude.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/markdown-ai-era-ifanr-20260513.md)

## 深度分析

**Markdown 的持久生命力来自"结构信号局部化"而非格式本身**。文章指出，一个标题只需 `#`，加粗只需 `**`，不需要看很远上下文就能判断 token 的语义角色。这与 Transformer 的局部注意力机制天然契合——模型在生成或理解 Markdown 时，不需要维持对远处闭合标签的"记忆负担"。HTML 的 `<div>` 要等到 `</div>` 才闭合，语义跨度长，模型生成时出错概率更高。这是 AI 原生格式与历史格式在设计上的本质差异。

**Markdown 在 AI 时代的地位是"协议而非界面"这一判断具有深远含义**。协议意味着标准化、稳定性和跨系统互操作，而界面意味着瞬态、可替代和面向终端用户。Markdown 作为 AI 工作记忆的载体、Agent 之间传递信息的格式，不需要"好看"，只需要"结构清晰、机器可读、人类可校验"。HTML 或未来更丰富的渲染格式与 Markdown 是互补而非竞争关系。

**RLHF 奖励信号强化了 Markdown 在 AI 输出中的主导地位**。标注员在评估模型回答质量时，倾向于给结构清晰、分点明确、一目了然的回答更高分数——而这类回答在纯文本环境下往往就是 Markdown 格式。这意味着即使没有刻意训练模型输出 Markdown，RLHF 过程也会自发地将 Markdown 格式与"高质量回答"建立关联。这是一个自我强化的正反馈循环：更多 Markdown 数据训练 → 模型学会 Markdown 格式 → RLHF 奖励 Markdown 格式 → 用户看到更多 Markdown 输出。

**PDF 和 Word (DOCX) 在 AI 场景的根本缺陷是"为人类视觉设计而非为机器理解设计"**。PDF 的字符坐标定位、Word 的 XML 样式噪声，都在 AI 处理时引入大量无语义信息的 token 消耗。相比之下，Markdown 的每个标记（`#`、`**`、`-`、` ``` `）都携带明确的语义角色，没有冗余信息。这解释了为什么几乎所有主流 LLM 的系统提示都要求输出 Markdown 格式——这是 token 效率与语义清晰度的最优平衡点。

**Karpathy 的格式演进图谱揭示了一个递进规律：AI 的输入/输出格式在不断向更高带宽发展**。音频（最高带宽，最自然）→ 视觉（高带宽）→ HTML（结构化）→ Markdown（纯文本结构）→ 纯文本，每一步降级都是为了兼容当前技术边界。但核心结论是：Markdown 作为 AI 系统间内部通信的协议层，不受这一演进影响——它刚好处于"够用且稳定"的技术甜蜜点。

## 实践启示

**在设计 AI Agent 的输出格式时，默认使用 Markdown，并在系统提示词中明确要求 Markdown 输出**。这不仅能获得更结构化的响应，还能降低解析成本（无需处理 PDF 坐标或 Word XML）。对于需要返回多个字段的场景，使用 Markdown 表格（`| col1 | col2 |`）比 JSON 在 token 效率和可读性上都更优。

**在构建知识库或文档系统时，优先使用 Markdown 而非 Notion、Confluence 等闭源格式**。闭源格式的导出成本高、版本迁移风险大，而纯文本 Markdown 可在任意编辑器打开，未来无论格式如何演进，都可以通过脚本进行批量转换。这是"面向未来"的技术债务管理策略。

**若需要向 AI 传递复杂的结构化信息（如 UI 组件树、交互原型），优先考虑将信息编码为 Markdown 兼容的文本描述，而非直接传 HTML**。HTML 的保留标签和嵌套结构会与 AI 的生成过程产生干扰，而 Markdown 的子集（表格、列表、代码块）足以描述大多数结构化信息，且 AI 能原生理解和生成。

**在使用 Embedding 进行知识库检索时，Markdown 分块（按标题/段落）比 HTML 分块效果更好**。因为 Markdown 的 `#` 和 `##` 天然就是语义边界，Embedding 模型在训练时接触的 Markdown 格式数据也更多，按结构边界切分能更好地保留语义完整性，提升召回准确率。

**关注 Karpathy 格式演进图谱中的趋势，但聚焦当前工程可落地的部分**。音频/视觉交互是未来方向，但当前阶段，Markdown 作为 AI 工作语言的地位在 3-5 年内不会动摇。团队应投资于 Markdown 格式的自动化测试和渲染优化，而非过早押注下一代格式。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/markdown-ai-era-ifanr-20260513.md)

---

