## Ch02.012 Skills赏析：使用skills-refiner提升skill质量

> 📊 Level ⭐⭐ | 10.8KB | `entities/skills-refiner-design-quality-evaluation-framework.md`

## 断言测试的结构性盲区
skill-creator 提供了创建-测试-断言迭代的完整循环，但断言测试有结构性盲区——一个 skill 可以通过所有测试用例，同时存在以下问题：

- **定位偏差**：description 决定何时激活，过宽导致误触发，过窄导致忽略
- **上下文工程浪费**：instructions 层包含 Claude 已内化的通用知识
- **低可移植性**：依赖特定工作流或工具调用链，换环境就失效
- **边界模糊**：与其他 skill 存在重叠，或对某些输入默默降级
断言测试通过，证明 skill 在已知场景下按预期执行。它证明不了 skill 设计是否正确。

## skills-refiner 两阶段框架
### 第一阶段：诊断与精炼（Diagnose & Refine）
诊断对象：Skill 仓库、单个 skill、工作流框架、eval 集。
诊断不是打分，而是定位真实状态：真正解决什么问题、边界在哪、哪些设计选择有实质作用、哪些只是表面修饰、哪些是隐患。
精炼是诊断的直接下游：哪些应当保留，哪些应当改进，哪些应当简化或重新划定范围，哪些应当去掉。

### 第二阶段：提取与整合（Extract & Integrate）
当给出目标 Skill 仓库（target_repo）时启动。
关注这个 Skill/Skills 仓库对目标仓库有什么价值——哪些可以直接采纳，哪些需要重新设计，哪些应当放弃，整合后哪些部分面临最大风险。

## 六维评估框架
- **定位**：skill 真正解决什么问题，边界在哪
- **机制**：哪些设计选择真正驱动了它的行为
- **价值**：什么是真正强的和可复用的，什么只是表面修饰
- **风险**：什么是脆弱的或难以维护的
- **改进**：具体的提升方向
- **集成**：哪些可以直接用，哪些需要重新设计，哪些应当放弃

## 证据纪律原则
分析必须区分三类判断：

- **直接证据**：文件中直接可读的内容
- **合理推断**：基于可见证据的有理由但非确定的判断
- **未解决的不确定性**：证据不足以支撑的问题，应明确标注
不能用宏观判断掩盖证据的局限。

## 目的决定标准
工程和工作流类 skill → 结构严谨性、上下文工程质量、可维护性、跨仓可移植性
研究分析类 skill → 推理质量和证据纪律
写作或教学类 skill → 清晰度和输出质感
用工程标准去诊断创意写作 skill，结论通常是错的。

## 与 skill-creator 的分工
| 工具 | 职责 |
|------|------|
| skill-creator | 创建、A/B 测试、断言迭代、description 优化、打包分发 |
| skills-refiner | 设计判断：定位是否准确、上下文工程有无浪费、可移植性、边界清晰度 |
典型路径：skill-creator 创建并迭代 → 测试通过后 skills-refiner 做设计诊断 → 把改进点带回 skill-creator 做下一轮迭代。

## 安装
```bash
npx skills add yknothing/skills-refiner
```

## 深度分析
skills-refiner 的核心贡献在于它填补了 skill-creator 的质量盲区。skill-creator 是一个**创建工具**，擅长快速迭代和测试，但它无法回答"这个 skill 本身设计得好不好"——这是两个不同维度的问题。

### 设计质量 vs. 功能正确性
断言测试只能证明功能正确性，即"skill 能不能用"。但设计质量涉及更深层的问题：这个 skill 是否被正确地放在上下文中？它的激活边界是否清晰？它的上下文工程是否有冗余？这些问题在测试通过后依然存在。
skills-refiner 的两阶段框架（诊断→精炼 / 提取→整合）本质上是一个**元评估（meta-evaluation）过程**：它不是评估 skill 的输出，而是评估 skill 本身的设计决策。

### 六维评估的内在逻辑
六个维度之间存在隐含的递进关系：
1. **定位**（Scope）→ 这是最根本的问题：skill 解决的是什么，不解决的是什么
2. **机制**（Mechanism）→ 基于定位，理解哪些设计选择驱动了行为
3. **价值**（Value）→ 区分核心价值与表面装饰
4. **风险**（Risk）→ 识别脆弱点和维护负担
5. **改进**（Improvement）→ 基于上述分析给出具体方向
6. **集成**（Integration）→ 考虑在实际仓库中的可用性
这个顺序是有意义的：不能先讨论改进，而要先理解定位和机制。

### 证据纪律的核心价值
"证据纪律"原则是我认为整个框架中最有价值的部分。它明确要求区分三种不同类型的判断：

- **直接证据**：文件可直接读取的内容
- **合理推断**：基于证据的有根据推测
- **未解决的不确定性**：明确标注证据不足之处
这直接对抗了 LLM 输出中常见的"幻觉自信"问题——当分析者无法区分自己是在陈述事实还是在推断时，结论的质量是不可靠的。

### 目的决定标准的相对性
"目的决定标准"看起来像是一句正确的废话，但实际上它有重要的实践意义：它要求评估者**先理解 skill 的目的，再选择评估维度**，而不是用一套通用标准去套所有 skill。
这对 skill 设计的启示是：在创建 skill 之前，应该先明确它的**目的类型**（工程类 / 研究分析类 / 写作教学类），因为这会直接影响后续所有设计决策。

## 实践启示
### 对 skill 创建者的建议
1. **不要用测试通过替代设计审查**：断言测试是必要条件，不是充分条件。skill 通过所有测试后，还应该用 skills-refiner 做一次设计诊断。
2. **先定位，再写 instructions**：description 决定了激活边界，这比 instructions 的内容质量更重要。先把"这个 skill 解决什么问题、不解决什么问题"想清楚，再开始写 instructions。
3. **区分上下文工程中的冗余内容**：instructions 中如果包含 Claude 已内化的通用知识，这是上下文工程的浪费。应该把这部分内容剥离，让 instructions 只包含 model 不知道的特定信息。

### 对 skill 评估者的建议
1. **建立评估前的目的确认流程**：在开始评估之前，先确认 skill 的目的类型，再选择对应的评估维度。用工程标准评估写作 skill，结论通常是错的。
2. **保持证据纪律**：在分析时明确标注每项判断的证据类型。不要用宏观结论掩盖证据的局限性。
3. **关注边界而非中间**：skill 在典型输入下的表现通常是可以预期的，真正的风险在于边界情况——过宽的激活条件、低可移植性、与其他 skill 的重叠。

### 对组织或团队的建议
1. **建立 skill 设计的双人审核机制**：一人负责功能正确性（skill-creator 流程），一人负责设计质量（skills-refiner 流程）。这两个角色不应当由同一人承担，因为关注点不同。
2. **维护 skill 仓库的分层评估**：定期对仓库中的 skill 做六维评估，识别需要重构或废弃的 skill，保持仓库的整体质量。
3. **集成到 CI/CD 流程**：如果团队使用 skill-creator 流程，可以将 skills-refiner 作为 assertion 测试之后的第二次 gate，只有通过设计诊断的 skill 才能进入正式仓库。
→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/skills-refiner-design-quality-evaluation-framework.md)

## 相关实体
- [LBS-IntentBench — 首个真实出行隐式意图评测基准](ch04-246-lbs-intentbench-首个真实出行隐式意图评测基准.html)
- [Perplexity 内部 Skill 设计指南：四维体系与维护方法论](ch07-018-perplexity-skill.html)
- [AI Skill 测评指标体系](ch01-383-ai-skill-测评指标体系.html)
- 上下文工程 - 三种Memory方案对比

- [AgentEval：YAML驱动的Agent评测框架](ch04-141-git-ai.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/lightfield-introducing-skills.md)

- [AI Agent 工程师能力地图](ch04-139-apache-rocketmq-5-5-0-litetopic-ai-agent.html)

---
