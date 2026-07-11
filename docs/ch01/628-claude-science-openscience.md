# Claude Science 开源平替 OpenScience

## Ch01.628 Claude Science 开源平替 OpenScience

> 📊 Level ⭐⭐ | 7.3KB | `entities/claude-science-开源平替-open-science-2026.md`

# Claude Science 开源平替 OpenScience

Anthropic 的 Claude Science 上线不到一周，YC 孵化的 AI 科研团队发布「Claude Science 开源平替版」OpenScience。

OpenScience 覆盖文献检索、假设生成、代码实验到论文撰写的全流程 AI 科研工作台，不绑定任何单一模型厂商，支持 DeepSeek、GLM 等多种模型。与 [Claude Science](../ch03/075-claude-code.html) 形成开源替代方案。

## 核心功能对比

### Claude Science 的定位与限制

[Claude Science](../ch03/075-claude-code.html) 是 Anthropic 推出的面向科学家的 AI 工作平台，提供研究人员常用的工具链集成：文献检索、Jupyter 代码执行、R 统计分析、SSH 集群任务提交、论文撰写等。其核心集成包括：

- **数据库与工具链**：内置 60+ 科学数据库连接器和预配置技能包，覆盖基因组学、单细胞分析、蛋白质组学、结构生物学、化学信息学等常见科研领域。用户用自然语言提问，专业 Agent 自动跨库查询 UniProt、PDB、Ensembl、ChEMBL、GEO 等数据库
- **执行架构**：多智能体架构——主 Agent 负责整体规划，子 Agent 并行处理不同任务，Reviewer Agent 负责事实核查（检查引用、验证计算结果、标注潜在错误）
- **算力支持**：通过 SSH 连接或 Modal 账户按需调用云端 GPU，从单卡扩展到数百卡，敏感数据不出用户系统

但 Claude Science 存在三个硬限制：仅支持 macOS 和 Linux、仅面向 Pro/Max/Team/Enterprise 付费用户、在平台上只能用 Claude 自家模型

### OpenScience 的开源替代方案

OpenScience 由 YC 2026 冬季批次毕业的 Synthetic Sciences 团队（2025 年成立于旧金山）打造，核心定位是成为「模型不可知（model-agnostic）」的科学 AI 平台。其根本性区别在于：

- **多模型支持**：Anthropic、OpenAI、Google、DeepSeek、GLM 甚至本地 Ollama 模型——只要有 API Key 都能直接接入。支持按请求切模型，同一工作台内不同步骤可使用不同模型，无需改配置
- **隐私优先**：Key 留在本地，请求直连模型提供商，不经过任何中间服务器。敏感数据一个字节不出用户机器
- **开源协议**：采用 Apache 2.0 协议，仅需一行命令即可安装
- **更丰富的技能包**：内置 250+ 研究技能包（是 Claude Science 的 4 倍多），覆盖 ML、计算生物学、化学信息学等方向，全部可读、可编辑、可扩展

## 深度分析

### 1. 「模型不可知」策略的竞争意义

OpenScience 最核心的设计决策是模型不可知架构。这不仅降低了使用门槛（国内科研团队不需要购买 Claude 订阅），更在战略层面构建了对抗模型供应商锁定的护城河。当科学 AI 平台可以自由切换底层模型时，用户不会被任何单一模型厂商的定价、政策或能力变化所绑架。这与 [Backend for Agent](../ch03/045-agent.html) 强调的「基础设施抽象」理念一致——AI 科研工具的竞争正在从「模型能力」转向「平台生态」

### 2. 数据飞轮与「研究品味」

Synthetic Sciences 团队的核心判断是：科学基础模型需要具备真正的「研究品味（research taste）」，这种品味靠单纯堆参数堆不出来，必须产品和模型两条腿走路——用产品收集高质量的科研过程数据，再用这些数据训练出有品味的模型。OpenScience 正是这条路线落地的第一个产品

这种「产品→数据→模型→更好的产品」飞轮，与 [Claude Code 的遥测数据策略](ch01/1166-anthropic-claude-code.html) 有异曲同工之处，但 OpenScience 是开源产品，其数据收集策略更加透明。

### 3. 科研 AI 的「研二学生」定位

Anthropic 在 Claude Science 技术文档中引用哈佛物理学家 Matthew Schwartz 的评价：当前 AI 的科研能力大约相当于一名研二学生——能干活、不喊累，但每一步都需要导师盯着

这一判断为科研 AI 的能力边界设定了现实预期。Claude Science 的内测用户已在实践中验证了这一能力层级：艾伦研究所的神经科学家 Jérôme Lecoq 用它搭建了多智能体「计算评审模板」，包含约 20 个自定义技能，让子 Agent 读数千篇论文、提取核心观点和定量数据，再逐章生成综述。以前写一篇综述要两年，现在手上已有大约 10 篇超过 100 页的综述，且引用全部经过 Reviewer Agent 核验

### 4. 开源社区的反应与「先活下来」策略

OpenScience 发布后直接冲上 X 热搜，社区反应热烈。但一个耐人寻味的细节是：OpenScience 在 GitHub 页面底部焊死了免责声明——"OpenScience is an independent project. It is not affiliated with, endorsed by, or sponsored by Anthropic." 这是对之前 OpenClaw 几度更名事件的直接回应，反映了开源平替项目在「致敬」与「侵权」边界上的审慎策略

## 实践启示

1. **科研团队的模型选择策略**：在选择 AI 科研平台时，优先考虑模型不可知架构——这避免了被单一模型供应商锁定，也能利用不同模型在不同任务上的相对优势（如 DeepSeek 在数学推理、Claude 在代码生成上的特长）。

2. **开源 vs 闭源的科学 AI 路线**：Claude Science 和 OpenScience 代表了两种路线——深度集成但封闭 vs 灵活扩展但开放。对于需要定制化研究流程的团队，开源路线提供更大的可编辑性和可扩展性。

3. **隐私与合规考量**：对于涉及敏感数据（如患者基因组数据、未公开研究数据）的科研团队，支持本地模型 + 本地 Key 的 OpenScience 路线在合规性上更有优势。

4. **AI 科研能力边界管理**：将 AI 定位为「研二学生」而非独立研究者——让 AI 负责信息检索、数据整理、初稿生成等辅助工作，关键判断和方向决策仍需人类主导。这种分工在艾伦研究所和 UCSF 的案例中都被证明是有效的。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/claude-science-开源平替-deepseek-glm-2026.md)

---

