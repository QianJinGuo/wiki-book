# Prompting Amazon Nova 2 for content moderation

## Ch01.397 Prompting Amazon Nova 2 for content moderation

> 📊 Level ⭐⭐ | 9.3KB | `entities/prompting-amazon-nova-2-for-content-moderation.md`

## 核心要点
- Amazon Nova 2 内容审核实战指南
- Prompt engineering 在内容审核中的应用
- Structured（XML/JSON）与 Free-form 两种 prompt 策略对比
- Nova 2 Lite 三项公开基准测试平均 F1 75.70%，优于同期对照模型
## 相关实体
- [刚刚Opus 47发布相比46核心变化与Claude Code搭配最佳实践](ch03/073-claude-code.md)
- [Build An Enterprise Observability Solution For Amazon Quick](ch11/020-build-an-enterprise-observability-solution-for-amazon-quick.md)
- [Opus 4 7 Launch Claude Code Best Practices Wechat](ch03/073-claude-code.md)
- [Restrict Access To Sensitive Documents In Your Amazon Quick Knowledge Bases For  2](ch11/197-amazon-quick.md)
- [Real Time Voice Agents With Stream Vision Agents And Amazon Nova 2 Sonic](ch04/502-agent.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/prompting-amazon-nova-2-for-content-moderation.md)

- [你的ai代码越写越乱，他72小时合了14个pr每个都更好——差距只在一个机制](ch01/510-garry-tan.md)

## 深度分析
### AILuminate 分类体系：12 类危害Taxonomy
Amazon 选择了 MLCommons AILuminate Assessment Standard v1.1 作为政策定义框架，将内容危害分为三大组别：

- **Physical（物理性危害）**：暴力犯罪、自杀与自残行为
- **Non-Physical（非物理性危害）**：非暴力犯罪、仇恨内容、隐私侵犯
- **Contextual（情境性危害）**：专业领域无资质建议（医疗、金融、法律、选举）
这个分类体系的结构值得注意：它不依赖单一的二分类（有害/无害），而是通过 **Category Code + Group** 的双层结构，让审核策略可以按组别分配不同的处理流程。例如 Physical 组可以触发更严格的自动删除，而 Contextual 组通常更适合进入人工复核队列。

### 两种 Prompt 策略的本质差异
文章详细展示了 Structured 和 Free-form 两种 prompt 设计范式，两者的核心区别不在于格式，而在于 **输出确定性 vs 输出灵活性的权衡**。
**Structured prompts（XML/JSON）** 强制模型输出带有明确 tag 包裹的结构化结果：

- XML 模式：用 `<POLICY_VIOLATION>`、`<CATEGORY_LIST>`、`<EXPLAIN>` 等标签封装每一个字段
- JSON 模式：直接在 prompt 末尾加 `"IMPORTANT: Do not add any additional text or explanation. Your response must contain ONLY the JSON object, nothing else."`
前者的设计意图是让下游系统通过正则或 XML parser 直接提取字段；后者的 `"ONLY the JSON object"` 约束是关键——实验表明，没有这个约束时模型会在 JSON 外包裹一层自然语言描述，导致 parser 失败。
**Free-form prompts** 则完全放弃了格式约束，改为用自然语言指令引导模型调整输出粒度：Yes/No 分类、Category+Reasoning 分析、Severity Rating（none/low/medium/high）三种任务可以用同一套 Policy 定义、不同的问句措辞来完成。这意味着一个审核 pipeline 可以通过 **改写 prompt 中的请求句式** 来支持不同的 review 工作流，而无需重新设计输出 schema。

### 基准测试结果的关键解读
Nova 2 Lite 交出了一份值得关注的成绩单：
| 模型 | Avg F1 | Aegis F1 | WildGuard F1 | Jigsaw F1 |
|------|--------|----------|--------------|-----------|
| Nova 2 Lite | **75.70%** | **85.84%** | 84.73% | 56.53% |
| Model A | 74.69% | 81.56% | 84.71% | 57.80% |
| Model B | 74.19% | 80.23% | 83.48% | 58.86% |
| Model C | 74.88% | 82.94% | 83.82% | 57.87% |
几个值得关注的细节：
**Aegis 上的 Precision/Recall 平衡问题**。Model B 在 Aegis 上达到了 91.16% 的 precision，但 recall 只有 71.64%——意味着接近 **30% 的有害内容被漏放**。这是一个典型的 precision-recall tradeoff 在生产中的真实案例。文章指出的核心矛盾：审核系统如果 over-flagging 会浪费人工复核资源并可能误伤用户，但如果 under-flagging 则直接导致有害内容扩散。这个 tradeoff 的正确解法不是追求单方面极致，而是 **按危害类别设置不同阈值**：CSAM、CBRNE 等高危类别应优先保 recall，而低风险类别可以更偏 precision。
**Jigsaw 为什么全面偏低**。所有模型在 Jigsaw 上都跌落到 56-59% 区间，而 Aegis/WildGuard 都在 80%+。文章的解释是 Jigsaw 的 toxicity 定义更具主观性和上下文依赖性。这揭示了一个重要的工程结论：当审核类别定义越模糊、越依赖语境判断，LLM 的优势越小；反之，当类别定义清晰、边界明确（如明确的政策条款 vs 主观"有毒"判断），LLM 的表现差异更大。

### 多模态扩展的战略价值
文章只用较少篇幅提到图像和视频帧审核能力，但这个方向的战略价值被低估了。Amazon Nova 2 支持 **image-plus-context（IPC）** 模式，即在同一 prompt 中传入图像 + 文字策略定义 + 输出格式要求。这意味着：

- 文本审核的 prompt template 可以 **零成本迁移到图像审核**，只需要加一个图像输入通道
- 策略定义的语义一致性可以在图文两种模态间共享，减少多模态审核时的策略漂移
对于已经部署了文本审核 pipeline 的团队，这是一个低摩擦的多模态扩展路径。

## 实践启示
### 1. 先定义 Policy，再选 Prompt 格式
这是整个 workflow 中最重要的一步。AILuminate 提供了开箱即用的 12 类定义，但大多数团队需要 **定制化改编**。关键原则：Policy 定义中的每个 Category 必须有具体的边界描述（而不是"仇恨内容是不当言论"这样的模糊表述），否则同一条内容在不同次审核中可能得到不同结果。建议每个 Category 至少包含：

- 包含什么（明确举例）
- 不包含什么（边界案例）
- 触发该 Category 的最小证据条件

### 2. Structured 为默认，Free-form 为例外
除非明确需要自由格式输出（人工复核辅助、探索性分析），**Structured XML/JSON 应该是生产环境的默认选择**。Structured 输出的可解析性使得下游自动化处理成为可能，而且 Few-shot example 的注入效果更稳定。如果团队选择 JSON 格式，`"IMPORTANT: Do not add any additional text"` 这句话是强制性的，不能省略。

### 3. 生产部署务必测试 Reasoning vs Non-Reasoning 模式
文章明确建议对于高吞吐 pipeline **关闭 reasoning mode**，以降低延迟和成本。但这是一个需要实测的决策，不是理论推断。建议的验证流程：
1. 用历史样本（标注好 ground truth）在两种模式下跑对照实验
2. 测量 F1 差距是否在业务可接受范围内（通常 <2% F1 差可以接受）
3. 如果非 reasoning 模式 F1 差距 > 阈值，保持 reasoning 开启并优化推理成本

### 4. 建立三级置信度路由
文章提到的 confidence-based routing 是生产级审核系统的标准架构：

- **高置信度 Safe → 自动放行**：模型明确判定无违规，且历史上该类别判断准确率高
- **高置信度 Violation → 自动删除或隔离**：如 CSAM、明确暴力威胁
- **低置信度/边界案例 → 人工复核队列**：模型输出不确定时，优先送人工而不是直接放行
这套路由机制的关键是 **持续测量模型在各 Category 上的准确率**，动态调整阈值，而不是设置一个全局的置信度截断值。

### 5. 定期 Prompt + Policy 迭代
文章建议"用代表性样本测试 → 审查结果 → 迭代 Policy 定义和 Few-shot examples"。这个循环应该制度化。建议：

- 每周抽取最近人工复核的边界案例，更新 Few-shot examples 库
- 每月统计各 Category 的 false positive/negative 率，针对性加强 Policy 定义
- 每季度审视 AILuminate taxonomy 更新，确保分类体系与业务政策同步

### 6. 多模态扩展的前置条件
如果团队计划从文本审核扩展到图像/视频帧审核，前置条件是：**Policy 定义已经足够成熟**。因为 Nova 2 的 IPC 模式直接复用文本的 Policy 语义，如果 Policy 定义本身模糊，图像审核会继承同样的歧义。建议在文本审核达到稳定的 precision/recall 平衡后再启动多模态扩展。

---

