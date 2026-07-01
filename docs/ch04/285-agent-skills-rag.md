# 使用 Agent Skills 做知识库检索，能比传统 RAG 效果更好吗？

## Ch04.285 使用 Agent Skills 做知识库检索，能比传统 RAG 效果更好吗？

> 📊 Level ⭐⭐ | 8.8KB | `entities/使用-agent-skills-做知识库检索能比传统-rag-效果更好吗.md`

## 核心要点
- Skills 是 Anthropic 推出的 Agent 领域行业标准，本质是一个文件夹，内含使用说明（SKILL.md）、参考文档（reference）、可执行脚本（script）
- 渐进式加载策略：启动时仅加载 Skill 基本描述，触发时才按需读取详细文档，避免无谓的 Token 消耗
- 用 Skills 模式做知识检索：不预建向量库，本地目录级渐进式检索，可视为"Agentic RAG"
- 优势在于大模型参与分词和上下文匹配决策，而非单纯向量匹配后做总结
- 缺陷：首次检索 PDF 等特殊格式效率低；多轮检索后 AI 可能忘记调用 Skill；Token 消耗较大
- 可通过 Skill Creator 自动分析已有文档站并生成定制检索 Skill 

## 深度分析
### 传统 RAG 的结构性困境
传统 Chunk + Embedding RAG 模式的核心缺陷在于"预索引"的刚性。作者在文中坦承自己对这套方案的偏见源于真实的调优痛苦——调优过程极其折腾，最终效果仍难保证。这并非个别现象，而是向量检索范式本身的结构性局限：分块大小固定、语义边界难以对齐、Embedding 模型对领域术语的理解有限、检索结果依赖向量相似度而非真实语义匹配 。
LlamaIndex 创始人 Jerry Liu 的判断佐证了这一判断：RAG 本身没死，但固定 Chunk + Embedding 那套模式已走到尽头。如果 Agent 能动态扩展文件周围的上下文，过度考虑数据块大小就失去了意义 。这一转变的本质是从"检索后总结"（Retrieve-then-Read）到"自主式检索+理解"（Agentic Retrieve）的范式跃迁。

### Skills 渐进式披露架构的创新价值
Anthropic Skills 的渐进式加载策略在此场景中展现了独特的优势：启动时只加载 Skill 基本描述，AI 根据用户需求自主判断调用哪个 Skill，决定后再读取详细说明和参考文档 。这套机制恰好解决了一个知识检索的核心矛盾：上下文窗口有限 vs. 知识库规模庞大的张力。
通过将"领域定位 → 文件定位 → 内容定位"三层结构分别封装在不同层次的文档中，AI 可以像人类专家一样"先大致知道该查哪个领域，再精准打开相关文件，最后定位到具体段落" 。这与人类检索知识的行为模式高度吻合——先按主题缩小范围，再按文件类型选择合适的读取策略，最后结合上下文理解内容。

### 技术实现的关键设计原则
该方案有两点关键设计原则值得关注。其一是渐进式检索：尽量少读但读准，优先查"最可能有答案"的文件，读取时仅读取相关行，必要时再扩展范围，避免无意义的 Token 消耗 。其二是保持简单可控：用户只需告诉系统知识库位置，其余检索策略由 Skill 自动完成 。
针对不同文件类型，Skill 采用了差异化策略：Markdown/文本直接定位匹配段落；PDF 编写代码调用专门解析能力按页/章节提取；Excel 则只读取与问题相关的表、行、列，而非将整份表格加载进来 。这一精细化策略显著优于传统 RAG 的"整块加载+向量检索"模式。

### 当前方案的局限与边界
方案并非银弹，存在若干已知限制。PDF 首次处理需要调用脚本转换，效率较低（建议预处理为纯文本规避）；多轮检索后 AI 可能"忘记调用 Skill"，丢失关键处理步骤；Token 消耗相对较大，因为 AI 控制整个检索过程，首次未找到答案时会持续尝试新参数或文件进行检索 。
这些限制的根本原因在于：当前方案仍然依赖 AI 的推理能力来驱动检索策略，而 AI 的推理具有不可预测性。与预建向量库相比，动态检索方案的上限更高（更精准），但下限也更低（不稳定）。

## 实践启示
**1. 知识库建设优先考虑按领域分目录**
文件夹尽量按领域划分，每个文件夹下只包含特定领域的文件，并在每个文件夹放置目录索引文件 `data_structure.md` 描述每个文件的用途。这不仅是信息架构的最佳实践，也为 AI 提供了"渐进式定位"的结构基础 。
**2. 对已有文档站先尝试 Skill Creator 而非从头构建 RAG**
如果已有固定格式的本地文档站（md/mdx 文件），直接用 Skill Creator 让 AI 分析文档站结构并自动生成定制检索 Skill，效果好且速度快。先用纯文本文档验证效果，再逐步引入 PDF/Excel 等特殊格式 。
**3. 评估是否迁移的时机信号**
当你的 RAG 调优已经花费大量精力但效果仍不稳定；当你的知识库需要跨多种异构格式联合查询；当你的场景需要"多轮递进式检索"而非一次性查询——满足以上任一条件时，值得评估 Skills 模式的迁移方案。
**4. 警惕 Token 消耗与首次延迟**
对于高频、实时性要求高的知识查询场景，当前方案的 Token 消耗和首次 PDF 转换延迟是主要瓶颈。建议：预处理阶段将所有 PDF 提前转换为 Markdown，保持知识库的纯文本状态 。
**5. 复用开源 Skill 降低起步成本**
文中提供的开源 Skill（https://github.com/ConardLi/rag-skill/）可作为起点，根据自身知识库结构进行微调，而非从零构建 。

## 相关资源
- [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/使用-agent-skills-做知识库检索能比传统-rag-效果更好吗.md)
- rag-skill 开源实现：https://github.com/ConardLi/rag-skill/

## 相关实体
- [LLM-as-a-Verifier: A General-Purpose Verification Framework](ch01/890-llm.md)
- [你不知道的 Agent：原理、架构与工程实践](ch04/503-agent.md)
- [告别“氛围编程”：基于 Harness 治理和 SDD 的团队级 AI 研发范式演进与实践](ch04/150-ai.md)
- [看 AgentRun 如何玩转记忆存储，最佳实践来了！](ch04/503-agent.md)
- [Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering](ch04/503-agent.md)
- [RAG深度解析：分块、向量化、召回、重排，才是"蒸馏同事skill"的关键](ch04/245-skill.md)
- [别再把上下文当聊天记录](https://github.com/QianJinGuo/wiki/blob/main/entities/别再把上下文当聊天记录.md)
- [一文带你弄懂 AI 圈爆火的新概念：Harness Engineering](ch05/061-harness-engineering.md)
- [龙虾装上了，可以用来干啥？分享下我的 OpenClaw 多智能体团队搭建经验！](ch11/209-openclaw.md)

- [Hermes Agent /goal 长任务运行时架构](ch04/503-agent.md)
- [LLM agent脚手架如何具备自进化能力？——以hermes agent为例](ch04/503-agent.md)
- [LoongSuite GenAI 可观测语义规范](ch04/150-ai.md)
- [低代码 Agent、框架 Agent、自研 Agent 决策框架](ch04/503-agent.md)
- [三器合一：gstack + Superpowers + OpenSpec 工程化 AI 编程实战](ch04/150-ai.md)

---

