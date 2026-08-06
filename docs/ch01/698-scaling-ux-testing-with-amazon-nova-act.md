# Scaling UX Testing with Amazon Nova Act

## Ch01.698 Scaling UX Testing with Amazon Nova Act

> 📊 Level ⭐⭐ | 8.8KB | `entities/scaling-ux-testing-with-amazon-nova-act-a-new-approach-to-us.md`

# Scaling UX Testing with Amazon Nova Act

> **v×c score**: 49 | stars=4
> **来源**: https://aws.amazon.com/blogs/machine-learning/scaling-ux-testing-with-amazon-nova-act-a-new-approach-to-user-flow-analysis
> **发布**: AWS China ML (2026-07-14)

## 摘要

本方案展示如何利用 Amazon Nova Act（多模态基础模型，能够通过视觉理解并与浏览器界面交互）构建云端部署的 UX 测试平台。传统 UX 测试面临三大困境：人工测试无法规模化、自动化脚本在界面变更时频繁断裂、全面覆盖多设备多场景的成本高昂。该方案通过四个层次的架构（文档处理层、编排层、执行层、分析层）实现了从文档到测试用例自动生成、Nova Act 智能体并行执行用户流程、自动化分析生成可操作洞察的完整闭环。与传统的 Selenium/Playwright 脚本方案不同，Nova Act 通过视觉理解（分析截图、识别交互元素）来适应界面变化，模仿人类测试员的推理方式。

## 核心要点

- **四层架构**：文档处理层（Amazon Bedrock Knowledge Base + Claude 4.5 Sonnet 生成测试场景）→ 编排层（DynamoDB + Lambda + ECS）→ 执行层（Nova Act 智能体并行执行）→ 分析层（自动化结果分析 + React Dashboard）
- **Nova Act 的核心差异化**：基于视觉理解的浏览器交互（而非 DOM 选择器），能够像人类一样"看"页面布局并做上下文决策
- **三级指令粒度**：从高层用户目标到详细步骤，Nova Act 在不同粒度级别上执行，便于对比分析指令细节度对执行成功率的影响
- **两种测试流生成方式**：从文档自动生成（输入 tasks.json + 知识库检索）+ 手动定义（直接写入 DynamoDB）
- **执行结果**：summary metrics（JSON）、interaction logs（HTML 报告含截图和推理过程）、analysis dashboard
- **关键能力**：持久化认证会话、结构化数据提取（Pydantic schema）、文件上传/下载测试

## 深度分析

### Nova Act 的真正创新：从"脚本执行"到"视觉理解"

传统 UI 自动化（Selenium、Playwright）基于 DOM 选择器（XPath、CSS Selector、ID）定位元素。这意味着：界面结构一旦变更（改个 class 名、重组 DOM 层级、从 SPA 换 SSR），脚本就断裂。维护脚本的成本往往超过编写脚本的成本。

Nova Act 的工作方式完全不同：它通过分析网页截图理解页面布局，通过视觉线索识别交互元素，然后做出上下文决策。这意味着它不依赖 DOM 结构——只要人眼能看出"这是一个搜索框"，Nova Act 理论上也能。这与 [Amazon Nova Act HIPAA 合规](../ch04/576-amazon-nova-act-is-now-hipaa-eligible.html) 中强调的视觉基础模型能力一致。

关键理解：Nova Act 不是"在传统自动化上加一个 AI 层"，而是从根本上改变了自动化测试的原子单位——从"用选择器定位元素"变为"用视觉理解识别意图"。

### 文档驱动测试生成：从隐式知识到显式测试

该方案的一个核心设计是"从文档自动生成测试场景"。用户只需要提供（1）应用文档/用户指南/功能说明和（2）用户任务列表（如"通过搜索购买咖啡机"、"通过菜单导航购买咖啡机"），系统就会通过 Claude 4.5 Sonnet 生成三级粒度的测试指令。

这个设计解决了传统测试中的一个根本问题：测试场景的知识分布在产品经理、设计师、开发者的头脑中，很少被系统化地转成可执行的测试用例。"文档→测试用例"的自动转化实际上是把组织的隐式产品知识显式化为可执行的验证流程。

从架构角度看，这是 Agentic RAG 模式 的一个延伸应用：知识库不只是"回答问题"，而是"生成测试场景"。这与 [淘宝 RAG 全链路](ch01/1268-rag.html) 中的"从知识到行动"的思路异曲同工。

### 三层粒度设计：对抗指令模糊性的工程实践

Nova Act 方案引入了一个精妙的设计维度：三级指令粒度。同一任务在不同粒度下执行，结果用于对比分析：

- **高层级**（如"通过搜索购买一台高评分的 304 不锈钢咖啡机"）— 测试 Nova Act 的推理能力
- **中层级**（如"在搜索框输入'咖啡机'、按评分排序、找 304 不锈钢款"）— 测试场景覆盖
- **低层级**（如"点击搜索框、输入'咖啡机'、点击搜索按钮..."）— 等同于传统脚本

这个设计非常务实：它承认 AI Agent 存在"理解偏差"（高层级任务可能误解用户的真实意图），但同时提供退路（低层级指令确保关键路径不会因模型理解偏差而失败）。在实际使用中，团队可以根据测试目的选择粒度——回归测试用低层级确保精准，探索性测试用高层级发现意外问题。

### 分析层的价值：从执行结果到设计决策

方案中最容易被忽视但最具有长期价值的部分是分析层。它利用 Bedrock 分析执行日志、计算可用性分数、识别不同粒度级别的摩擦点。这意味着：

- 测试结果不只是"通过/失败"，而是量化的 UX 质量指标
- 通过对比不同粒度级别的执行差异，可以定位"是界面设计问题还是 Agent 理解问题"
- Dashboard 为不同受众（产品经理、设计师、开发者）提供差异化的视图

这种"从自动化测试到设计决策支持"的闭环，将 UX 测试从一个"发布前的质量关卡"升级为"持续的产品设计优化循环"。

## 实践启示

1. **视觉理解模型更适合界面频繁变更的场景**：如果你的应用处于快速迭代期（每周发布），Nova Act 的视觉方案比 Selenium/Playwright 更划算——脚本维护成本将显著降低。

2. **测试场景应从文档自动生成而非手动编写**：初始部署时，投入时间整理产品文档和用户任务列表（而非写测试脚本），让 AI 从中生成测试场景。这减少了初期投入，且文档更新时会自动反映到测试覆盖。

3. **三级粒度指令策略是务实的折中**：关键路径测试使用详细指令（避免模型理解偏差），探索性测试使用高层级意图（发现设计问题），回归测试使用中等粒度（平衡覆盖和执行效率）。

4. **区分基础设施失败和 Agent 失败**：在分析层中单独追踪 ECS 超时、网络错误等基础设施信号，避免 Agent 成功率被非相关因素拉低。

5. **持久化浏览器会话是高级场景的关键**：如果测试涉及登录态操作，务必配置 `user_data_dir` 持久化认证会话，否则每次 Nova Act 启动都会面临登录流程，增加失败概率和测试时间。

6. **Nova Act 的推理链日志是 UX 设计的金矿**：每个操作的 reasoning 输出（为什么点这里、为什么没点那里）直接反映了"用户按照这个界面设计会如何理解页面"，可用于发现界面语义歧义和导航盲点。

## 相关实体

- [Amazon Nova Act HIPAA 合规](../ch04/576-amazon-nova-act-is-now-hipaa-eligible.html)
- Agentic RAG 模式
- [Amazon Bedrock AgentCore 浏览器能力](../ch04/640-amazon-bedrock-agentcore.html)
- [RAG 全链路实践](ch01/1268-rag.html)
- [Agent Harness 运行时模式](../ch05/042-agent-harness.html)
- [Bedrock Claude 缓存策略](../ch11/069-amazon-bedrock-claude-prompt-cache.html)
- [Bedrock 商业智能 Agent](../ch04/640-amazon-bedrock-agentcore.html)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/scaling-ux-testing-with-amazon-nova-act-a-new-approach-to-us.md)

---

