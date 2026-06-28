## Ch06.022 Your documentation is still in your Mum's filing cabinet

> 📊 Level ⭐⭐ | 6.7KB | `entities/documentation-organisation-humans-ai.md`

# Your documentation is still in your Mum's filing cabinet

> **来源**: [https://gerireid.com/blog/organising-documentation-for-humans-and-ai/](https://gerireid.com/blog/organising-documentation-for-humans-and-ai/)

## 摘要

Gerí Reid 从一个简单的观察出发：大多数文档仍然按照 1970 年代 Xerox PARC 发明的桌面隐喻组织——文件夹套文件夹的树状结构。但知识很少服从这种层级关系。一个组件的无障碍决策可能同时影响设计、工程、内容和客服——你把它放在哪个文件夹里？AI 检索系统的出现使这一问题变得无可回避：AI 不关心你把东西存在哪里，它通过意义、上下文和关系来发现信息。文档的未来不是更大的文件柜和更好的标签，而是可以从多个方向发现的知识网络。

## 核心要点

### 文件柜隐喻的遗产

现代 GUI 直接借用了物理办公室概念——文档、文件夹、归档系统——因为它们对办公室工作者来说很熟悉。但五十年后，30 岁以下的人中有多少真正使用过物理文件柜？Reid 记述了一位同事将所有文件直接保存在 Mac 桌面上，通过空间位置和肌肉记忆来导航——他甚至没有意识到文件实际上存储在桌面文件夹的目录结构中。这揭示了一个深层问题：我们的数字工具强加了一种用户可能并不自然的组织心智模型。

### 信息觅食理论

Peter Pirolli 和 Stuart Card 的 [Information Foraging](https://www.nngroup.com/articles/information-foraging/) 理论将人类描述为"信息觅食者"——像獾觅食小无脊椎动物一样，人类寻找有用信息可能在附近的线索，并不断决定是否继续搜索。这解释了为什么文档用户常常：

- 优先搜索而非浏览
- 探索几层后就停止
- 直接问同事
- 创建重复文档

信息往往存在，但人们本能地找不到它的位置。对建档者来说合理的层级结构，对使用者来说可能深藏在"冬季毛衣和登山袜"之间。

### AI 暴露了问题

现代 AI 检索系统不依赖文件夹结构。一个 design token 页面可以因为它提到了颜色对比度而被检索到，而不是因为它位于 `Design System → Foundations → Accessibility → Colour` 路径下。AI 使一个早已存在但被人类习惯性绕过的问题变得无可回避：**文件夹是存储机制，不是知识架构**。

### 无障碍设计的隐含智慧

无障碍设计的一个反复出现的主题是：信息不应依赖单一路径。我们不单独依赖颜色、形状或视觉位置来传达意义。同样的原则适用于文档——当人们可以通过搜索、导航、链接、元数据和相关内容到达信息时，信息变得更容易发现。无障碍设计可能一直在指向文档组织的正确方向。

## 深度分析

### 从树到图：知识组织的范式转移

Reid 引用了 Chase McCoy 的 [Design systems as knowledge graphs](https://chsmc.org/2021/08/systems-as-knowledge-graphs/) 一文，该文论证设计系统本质上是互联知识的集合，而非孤立资产的组合。理解概念之间的关系往往比知道任何单条信息存在哪里更有价值。

这与 知识图谱 和 语义 Web 的理念一脉相承。1990 年代早期的 Semantic File Systems 研究就提出，信息应通过属性和意义（而非物理位置）来检索。三十年后，我们仍然在与同样的问题搏斗——只是现在有了 AI 作为催化剂。

### Obsidian 与双链笔记的启示

Reid 提到使用 Obsidian 做笔记的体验：标签和链接创建了一个关系图谱，而不是强迫笔记进入刚性层级结构。这比任何文件夹结构都更接近知识的实际运作方式。这与本 wiki 的设计理念高度一致——通过 wikilinks 和 tags 建立多向连接，而非依赖单一的目录层级。

### 对 AI-native 文档系统的启示

当前的 AI 检索（RAG）系统在语义搜索层面已经优于传统文件夹浏览，但文档的"AI 可发现性"仍需要人为优化：

- **清晰的结构和有意义的标题**：AI 需要上下文信号来正确检索
- **有用的元数据和描述**：frontmatter、tags、categories 为 AI 提供检索维度
- **概念间的强关系**：wikilinks、双向链接、related content 构建了 AI 可遍历的知识图谱
- **一致的语言**：术语一致性直接影响语义检索的准确率

这些特性同时帮助人类和 AI 发现信息——这是文档组织中罕见的双赢。

### 与 Design Systems 的交叉

Reid 的 UX 背景使她自然地将文档问题与 design systems 联系起来。组件的无障碍决策同时属于设计、工程、内容和客服领域——这正是知识图谱优于树状结构的典型案例。每个组件应该是图谱中的一个节点，连接到所有相关领域，而非被困在某个单一文件夹中。

## 实践启示

- **文档架构师**：放弃"找到完美位置"的执念，转而投资多路径发现——搜索、元数据、标签、交叉引用、相关内容
- **AI 工程师**：在构建 RAG 系统时，不仅依赖语义向量搜索，还应利用文档的结构化元数据（tags、links、hierarchy）作为检索信号
- **设计系统团队**：将设计系统视为知识图谱而非资产库——组件之间的关系（依赖、替代、组合）与组件本身同样重要
- **工具选择**：优先支持双向链接、标签系统和图谱可视化的工具（如 Obsidian、Logseq），而非仅提供文件夹结构的传统 wiki

## 相关实体

- 知识图谱 — 以关系为核心的知识表示方法
- [Design Systems — 设计系统的理论与实践](ch04-040-hermes-agent-self-evolving-source-analysis.html)
- [Consistency, But in Excellence](ch01-616-consistency-but-in-excellence-not-appearance.html) — 系统化 vs 个体卓越的张力
- [RAG (Retrieval-Augmented Generation) — AI 检索增强生成](ch04-430-agent-lbs-intentbench.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/documentation-organisation-humans-ai.md)

---
