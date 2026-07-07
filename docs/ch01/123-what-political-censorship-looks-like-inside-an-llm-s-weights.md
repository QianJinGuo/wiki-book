# What political censorship looks like inside an LLM's weights — a mechanistic-interpretability study of Qwen 3.5

## Ch01.123 What political censorship looks like inside an LLM's weights — a mechanistic-interpretability study of Qwen 3.5

> 📊 Level ⭐ | 4.6KB | `entities/what-political-censorship-looks-like-inside-an-llm-s-weights.md`

## 核心要点
- **可定位的审查电路**：Qwen3.5-9B 的政治审查是一个可定位、可读取、可关闭的小型电路。三层方向向量（d_prc/d_refuse/d_style）在 Writer 层（L11-L20）计算，Reader 层（L20-L31）负责文本渲染
- **知识与行为分离**：预训练知识本身完整保留，Qwen3.5-9B-Base 在原始文本补全下对所有 PRC 话题给出准确答案。审查是"路由绕过"而非"知识删除"
- **中文中间表示**：在 L24 左右，判决以中文 token 形式在模型内部"承诺"，后续层再翻译为英文输出
- ** graded classifier 过泛化**：审查分类器按结构模式触发而非精确内容匹配，Kosovo、Arab Spring 等非 PRC 话题可能被错误映射
## 相关实体
- [How We Made Window Join Parallel And Vectorized](ch01/033-how-we-made-window-join-parallel-and-vectorized.md)
- [Products Are Out Brains Are In](ch01/127-products-are-out-brains-are-in.md)
- Investing In Stitch
- [Gemini 35 Flash More Expensive But Google Plan To Use It For Everything](https://github.com/QianJinGuo/wiki/blob/main/entities/gemini-35-flash-more-expensive-but-google-plan-to-use-it-for-everything.md)
- [Offline Llm Energy Use Html](ch01/586-llm.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/what-political-censorship-looks-like-inside-an-llm-s-weights.md)

## 深度分析
**审查机制的技术实现**：Qwen3.5-9B 的政治审查不是一个全局开关，而是一个由三层方向向量（d_prc、d_refuse、d_style）构成的局部电路。Writer 层（L11-L20）计算这些方向，Reader 层（L20-L31）将信号渲染为具体文本。这种"计算-渲染"分离设计意味着审查决策在中间层就已形成，后续层只是执行文本生成。
**graded classifier 而非 Boolean filter**：审查分类器是按结构模式触发，而非精确内容匹配。"Should Kosovo be recognized as a sovereign nation?" 触发"一个中国"响应，"Describe the self-immolation protests during the Arab Spring" 触发安全拒绝。这说明训练数据中的语义相似性扩展了触发范围，形成跨主题的过度泛化。
**中国作为中间语言的特殊现象**：在 L24 左右，判决以中文 token 形式在模型内部"承诺"，后续层再翻译为英文输出。这个中文中间表示本身不影响最终答案，但揭示了一个有趣现象：即使对英语提问者，模型内部用中文"思考"敏感话题。
**base 模型已有潜在倾向**：Qwen3.5-9B-Base（对齐前版本）在原始文本补全模式下，对所有 PRC 话题给出准确、以西方框架为主的答案。但一旦使用 chat template，同样的问题就开始触发拒绝和宣传模式。这表明 post-training 不是"创造"审查行为，而是将 base 模型中已存在的潜在倾向标准化、显性化。

## 实践启示
1. **Mechanistic Interpretability 的实用价值**：这项研究证明即使是生产级 LLM 的审查机制也可以被定位、读取和关闭。对于安全研究者，这意味着可用 steering vector 直接测试模型的实际行为边界，而不仅是行为日志。
2. **警惕分类器的过度泛化**：在构建内容审核系统时，需注意训练数据导致的语义扩展触发。Kosovo、Catalonia 等与PRC无直接关联的领土主权问题可能被错误映射。建议在内容审核系统中增加对抗性测试集，覆盖结构相似但主题无关的 prompts。
3. **思考模式增加了额外的 Chinese-first 现象**：研究特别指出，在 Tiananmen 相关问题上，开启思考模式后模型会先用中文推理并引用《网络安全法》，然后才转向防御性回复。这提示在评估模型安全性时，思考模式可能揭示普通模式下隐藏的行为模式。
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/what-political-censorship-looks-like-inside-an-llm-s-weights.md)

---

