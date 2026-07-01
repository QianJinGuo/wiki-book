# Martin Fowler AI 研发提醒：Harness 承重层

## Ch05.021 Martin Fowler AI 研发提醒：Harness 承重层

> 📊 Level ⭐⭐ | 17.8KB | `entities/martin-fowler-ai-rd-harness-nondeterminism-devnote.md`

## 核心洞察
Martin Fowler 在 Pragmatic Engineer 播客访谈中指出：**软件工程过去几十年都建立在一台确定性机器上，现在我们把一个非确定性的协作者接进了研发链路。** 这个视角将 AI 研发的各种新概念（Vibe Coding、Agentic Engineering、Harness Engineering 等）统一到了一个核心问题下：当 AI 开始读仓库、改文件、调工具、跑测试、开 PR、查日志、修 CI 时，整个研发系统怎么消化这种非确定性。

## 关键论点
### 1. 非确定性进入研发链路
- 软件工程建立在确定性机器上，LLM 是概率性系统，本质上是非确定性的
- AI 同一目标可能用不同路径完成；解释失败可能看似合理却未经验证；改一处可能顺手改旁边多处
- 讨论从"提示词写得好不好"进入真正的软件工程

### 2. Vibe Coding 的边界
- **适用场景**：探索、原型、一次性脚本、临时工具
- **长期资产问题**：学习循环被掐断——人只看 prompt，不 review、不理解
- **Karpathy 转向**：从 Vibe Coding 转向 Agentic Engineering，背后是方法、纪律和经验
- **核心区别**：Vibe Coding 解决怎么把东西做出来；Agentic Engineering 关心做出来后人能不能继续拥有它

### 3. 测试和重构不是旧时代包袱
- AI 生成越快，确定性反馈越值钱
- 小切片目的：限制模型一次性发散的半径
- **Fowler 原则**：不要让 LLM 做可以确定性计算的事
  - 能由程序算出来的让程序算
  - 能由重构工具完成的让重构工具做
  - 能由测试/类型/策略挡住的别只靠 prompt

### 4. Harness 是非确定性适配层
**Harness = 把非确定性能力接入工程系统的适配层/承重层**  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
LangChain 定义：Agent = Model + Harness（模型出智能，Harness 让智能真正能用上）  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
OpenAI Harness Engineering 核心实践：

- 计划是第一等工程资产，执行计划和决策日志要进仓库
- 文档 Agent 看不见就等于不存在
- 架构规则要交给 linter 和 CI 机械执行
- 技术债靠持续小 PR 清，不攒大坑
- 人的品味和边界要编码到仓库里
Fowler/Thoughtworks Harness Engineering 四要素：  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]

- **guides**（事前引导）：规则、文档、工具描述、架构边界、任务模板
- **sensors**（事后感知）：测试、lint、日志、指标、评估器、错误分类
- **garbage collection**（持续清理）：旧补丁、文档订正、不适合新模型的护栏

### 5. 最危险的是系统相信 AI 没犯错
- AI 错得很像对：会解释、会道歉、会把错误包装成"已修复"
- 安全感只能来自外部反馈：测试、类型检查、依赖边界、审批流程、可审计出口
- **Simon Willison lethal trifecta**：私有数据 + 不可信内容 + 对外通信 同时出现 → prompt injection 可能变数据外泄

### 6. 工程师进入中间循环
Annie Vella 研究：supervisory engineering work（监督式工程工作）

- 内循环：写代码、跑测试、调试
- 外循环：提交、review、CI/CD、发布、观测
- **中间循环（新增）**：定义任务、组织上下文、监督执行、评估输出、把错纠正为规则
工程师从控制光标 → 进入目标、边界、验证和系统演进的中间循环  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]

### 7. 六件小事
1. **把任务切小**：独立验证的小任务下手  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
2. **把知识放回仓库**：让 Agent 能拿到上下文  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
3. **让验证先跑起来**：测试、类型约束、lint、架构边界检查  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
4. **权限按风险分层**：读/写/执行/删除/合并分级  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
5. **错误要分类**：参数错误、环境错误、权限错误、超时、供应商错误等  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
6. **把经验写回 Harness**：每次失败后，往系统里多塞一点确定性  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]

## 与现有知识库关联
- [Martin Fowler AI 研发 Harness](ch04/150-ai.md) — 同一主题的另一个来源
- Karpathy Vibe Coding → Agentic Engineering — Vibe Coding 边界问题
- [Cursor Harness 复盘](ch05/009-harness.md) — Harness 工程实践
- [Harness Engineering 框架](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-engineering-framework.md) — guides/sensors/garbage collection 框架
- [告别氛围编程](ch04/150-ai.md) — Harness 团队级实践

## 原始存档
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重.md)

## 元数据
- **来源**: WeChat（架构师/JiaGouX）
- **原始发布**: 2026-05-07
- **评分**: review_value=8, review_confidence=8, score=64

## 相关实体

- [Harness不是目的，知识才是护城河 —— 一个AI工程交付团队的知识沉淀实践](ch04/150-ai.md)

- [腾讯 AI Team 知识沉淀体系（Harness Engineering 实践）](ch04/150-ai.md)

## 深度分析
### 1. 非确定性建模的本质意义
Fowler 将 AI 研发的核心挑战定性为"非确定性协作者进入研发链路"，这个建模的价值在于：它把纷繁的 AI 编程新概念统一到了一个一致的理论框架下，而不是堆砌一堆独立概念。Vibe Coding、Agentic Engineering、Harness Engineering 这些热词，本质上是在回答同一个底层问题的不同侧面——如何在一个引入非确定性变量的工程系统里维持可预测性和可控制性。  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
这种建模还帮助我们区分了什么是真正的工程问题，什么是表面热度。比如"提示词工程"在这个框架下只是上下文组织的一个子集，而不是核心解法——因为非确定性问题不能单靠优化 prompt 来解决，必须在系统层面建立韧性。

### 2. Harness 的三层结构与工程对等
Fowler/Thoughtworks 提出的 guides/sensors/garbage collection 三层结构，实际上是在为非确定性系统建立一套等价的工程控制机制：事前约束（guides）、事中感知（sensors）、事后清理（garbage collection）。这三层与传统软件工程的对应关系：

- **事前约束** ≈ 架构规范 + 代码审查 + 类型系统
- **事中感知** ≈ 自动化测试 + CI/CD 质量门禁
- **事后清理** ≈ 技术债管理 + 文档维护
关键差异在于：传统工程里这些控制机制作用在确定性系统上，而 Harness 要控制的是一个每次执行路径都可能不同的模型行为。这意味着 guides 必须足够精确以限制模型发散半径，sensors 必须足够细粒度以捕捉异常模式，garbage collection 必须足够及时以防止旧规则在新模型上失效。  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]

### 3. 中间循环的工程角色重定义
Annie Vella 研究的"监督式工程工作"揭示了一个重要的角色演进：工程师不再主要是代码生产者，而是变成了目标定义者、上下文组织者、输出评估者和系统演化管理者。这个中间循环的定义，实际上是在回答"在人主导的工程和 AI 主导的执行之间，人应该站在哪里"这个根本问题。  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
答案不是站在光标旁边控制每一步，而是站在更高的抽象层级：定义目标、组织上下文、监督执行、评估输出、把经验写回规则。这个角色定位要求工程师从执行者转型为架构师和治理者——这不是一个自然的角色转换，需要刻意练习。

### 4. 六件小事的系统性解读
Fowler 提出的六件小事，单独看每件都不复杂，但组合起来形成了一个完整的非确定性适配系统：  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
把任务切小 → 降低单次执行的不确定性总量  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
把知识放回仓库 → 确保 Agent 能获取上下文（文档对 Agent 不可见 = 不存在）  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
让验证先跑起来 → 建立确定性反馈层  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
权限按风险分层 → 建立变更影响边界  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
错误要分类 → 建立可调试性  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
把经验写回 Harness → 将非确定性转化为确定性积累  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
这六件小事构成一个闭环：任务小→知识全→验证跑→权限清→错误明→经验积累→下次任务更小更确定。这是一个自增强的系统演进路径。

### 5. Vibe Coding 的本质矛盾
Vibe Coding 的核心矛盾在于学习循环的断裂。当人只看 prompt 不 review、不理解代码时，AI 生成的学习价值被完全抛弃了。软件工程的一条核心原则是：系统必须能被其维护者理解。而 Vibe Coding 在快速出原型的同时，系统地制造了不可理解的代码——这在原型阶段可以接受，但一旦转化为长期资产，就成了维护噩梦。  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
Fowler 对 Vibe Coding 的态度是务实的：它适合探索、原型、一次性脚本，但不适合长期资产。这个边界的本质不是技术限制，而是工程所有权的哲学问题：你能不能真正"拥有"一个你理解不了的系统？

## 实践启示
### 立即可落地的六件事
**优先级 1：把验证先跑起来（投入产出比最高）**  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
现有团队最容易启动的是"让验证先跑起来"。具体做法：在任何 Agent 修改之前，先确保有可以独立运行的测试用例。哪怕是一个简单的类型检查或 lint 规则，都能在 Agent 出错时提供一个确定的反馈点。这个启动成本极低，但收益是立刻的——它把"AI 错得很像对"这个问题暴露出来，而不是让错误潜伏到更后面的阶段。  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
**优先级 2：把任务切小（最容易被忽视）**  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
大部分团队在引入 AI 编程时，希望 AI 一次性完成一个大功能。这种做法实际上是在最大化非确定性总量——任务越大，模型发散的可能性越高，正确路径的概率越低。正确的做法是把大任务分解成多个独立可验证的小任务，每个任务都有清晰的验收标准。这个分解工作本来是工程的核心技能，现在变得更关键了。  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
**优先级 3：知识放回仓库（最容易遗忘）**  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
工程师习惯在 Slack、文档、Google Docs 里记录知识，但这些知识对 Agent 不可见。Fowler 强调"文档 Agent 看不见就等于不存在"，这句话的执行含义是：所有希望 AI 遵循的规则，都必须写到仓库里（代码、配置、架构文档），而不是外部工具里。具体来说：架构决策记录在 ADR 里，接口规范写在代码或契约文件里，边界规则编码到 linter 规则里。

### 中期需要建立的能力
**建立错误分类体系**  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
当 Agent 执行出错时，能快速判断是参数错误、环境错误、权限错误、超时还是供应商错误，是后续调试的第一步。错误分类不是一次性工作，而是需要随着 Agent 使用场景的扩展而持续细化。建议为每个高频错误类型建立标准响应流程，并把这些流程编码到 Harness 里。  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
**建立权限按风险分层机制**  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
不是所有 Agent 操作都同等风险。建立读/写/执行/删除/合并的分级权限体系，小任务给低权限，大任务需要审批。这个机制的价值不仅在于安全，还在于它让团队对 AI 的使用有清晰的心里边界——知道 AI 能做什么、不能做什么，在什么情况下需要人工介入。  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
**建立经验积累到规则的闭环**  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
每次 Agent 失败后，问两个问题：（1）这次失败是因为什么规则缺失？（2）下次怎么让同样的错误被提前拦住？把答案写成新的测试用例、新的 linter 规则或新的护栏。这些确定性规则积累得越多，Agent 下次执行的可靠性就越高。这是 Harness 的 garbage collection 机制的核心：不是清理垃圾，而是把经验转化为规则。

### 长期需要思考的方向
**从"人与 AI 协同"到"人设计 AI 协同系统"**  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
Fowler 的框架实际上在说：人的角色从执行者变成了系统设计者。这意味着工程团队需要开始思考：如何设计一个多 Agent 协作的系统？如何在系统层面建立韧性而不是依赖单个 Agent 的可靠性？这些是传统软件工程没有回答过的问题，需要新的工具、方法和组织实践。  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
**重新思考团队知识管理**  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
当 Agent 可以读取仓库里的所有知识时，知识的组织方式变成了竞争优势。一个组织良好、文档完整、规则清晰的仓库，Agent 的使用效率会显著高于一个混乱的仓库。这意味着团队知识管理不再只是人的资源，而是 AI 的基础设施。投资建设这个基础设施，是一个长期竞争力杠杆。  ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
--- 
> [!contradiction] 参见

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/martin-fowler-ai-rd-harness-nondeterminism.md) ^[martin-fowler-的-ai-研发提醒非确定性进了研发链路harness-才真正开始承重]
> Karpathy 访谈 持相反观点：Karpathy 认为 Vibe Coding 在特定场景下是合理的第一步，Fowler 的框架可能过于强调工程约束而低估了快速探索的价值。实际项目中需要根据场景权衡，不宜用单一框架套用所有情况。

---

