# 最新Claude Code创始人：编程已经解决了，Harness重要性持续降低，CC未来只有100行代码

## Ch01.487 最新Claude Code创始人：编程已经解决了，Harness重要性持续降低，CC未来只有100行代码

> 📊 Level ⭐⭐ | 7.2KB | `entities/claude-code-founder-harness-100-lines.md`

> -> [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-founder-harness-100-lines.md)

## Summary
Claude Code创始人关于Harness和编程未来的观点。

## Key Points
- Claude Code创始人观点
- Harness重要性降低
- 未来100行代码愿景
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/claude-code-founder-harness-100-lines.md)

## 相关实体
- [Claude Code 之父最新访谈：编程已经结束、harness 将消失，Claude Code 将只有 100 行代码，loop 才是未来](../ch01-239-claude-code-之父最新访谈-编程已经结束-harness-将消失-claude-code-将只有-100-行代)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](../ch01-367-claude-code-harness-deep-understanding)
- [深入理解 Claude Code 源码中的 Agent Harness 构建之道](../ch01-167-深入理解-claude-code-源码中的-agent-harness-构建之道)
- 深度解析 Claude Code 在 Prompt / Context / Harness 的设计与实践
- Claude Code vs OpenClaw Agent 记忆系统对比
- [开源 AI 知识管理搭档 Obsidian + Claude Code 完整集成指南](../ch03-076-开源-ai-知识管理搭档-obsidian-claude-code-完整集成指南)

- Harness Component Expiry Evidence
- Harness Component Expiry Build To Delete
## 深度分析
### 1. Product Overhang 是创新窗口，不是等完美再做事
Boris 团队在 2024 年底判断模型能力已经「溢出」现有产品边界，选择在能力还未完全成熟时就启动产品构建。这是一种逆向思考方式——与其等待模型完美，不如在溢出节点就开始释放潜力。他们的判断从一开始就是确定的：「六个月内不会有 PMF，因为是在为下一代模型建产品」。这种预建未来产品的思维，与传统 MVP 思维完全相反，却是 AI 产品开发的特有节奏 。

### 2. Loop 机制揭示了 Agent 级联架构的规模临界点
Boris 平均每天同时运行几百个 Agent，每晚还有几千个做深度异步任务。Loop 作为一等公民（cron 调度定期任务）的设计，本质是将单体 Agent 拆解为可编排的分布式单元。这个量级上的质变在于：人类从「管理单个 Agent」退到「管理 Agent 拓扑结构」，而拓扑本身由任务语义驱动而非人工指派。对比 [Generator-Evaluator 架构](../ch01-677-anthropic) 中三代理结构的单体设计，Boris 的架构已经是完全不同的规模化阶段 。

### 3. 全科型团队的实质是专业壁垒的重组
「工程经理、产品经理、设计师、数据科学家、财务、用户研究员每个人都在写代码」——这不是说编码变得容易，而是说业务理解力成为了新的核心壁垒。最好的会计软件未来作者不一定是工程师，因为业务知识才是难点。这与 [12 个 Harness 设计模式](../ch04-090-深度拆解-claude-code-12-个可复用的-agentic-harness-设计模式) 中提到的「分层记忆结构」逻辑一致：专业化壁垒从代码层转移到知识层 。

### 4. SaaS 护城河重排揭示了 AI 的真实影响半径
Boris 的护城河分析框架是迄今最清晰的 AI 商业影响地图：切换成本降低（AI 可以帮你迁移）、流程壁垒削弱（ Opus 4.7 可以自主迭代优化），但网络效应、规模经济、稀缺资源不变。这意味着 AI 对不同类型护城河的影响是非对称的——企业在重新评估战略时，首先应该识别自己的护城河类型，而非泛泛谈论 AI 威胁 。

### 5. Harness 递减定律：产品层正在被模型能力「蒸发」
Boris 预测 Claude Code 未来只有 100 行代码，因为安全机制（防 prompt 注入、静态校验、权限模式、人工审批）都是模型能力不足时的补丁。这个判断的深层含义是：Harness 的价值在于填补模型不确定性，一旦模型足够可靠，Harness 就变成了纯粹的效率拖累。这条定律同样适用于 [Harness Engineering](../ch04-422-harness-engineering-让-coding-agent-可靠完成长程任务) 的所有实践者 。

## 实践启示
### 1. 建立「模型能力-产品层」的对标节奏
每发布一次大版本模型，主动审视当前产品层中哪些安全机制可以降级或移除。不是一次性清空，而是建立持续的对标节奏。例如：在 Opus 4 发布后的使用量陡增，就是一个可复用的观察信号——当模型迭代后用户行为发生突变，就是 Harness 可以简化的时机。

### 2. 用 Loop 重新设计后台任务拓扑
不要把 Loop 看成「定时脚本」，而是将其理解为 Agent 的编排单元。实践步骤：①将日常工作中重复性高的任务拆解为最小原子；②为每个原子配置一个 Loop；③用 cron 表达式定义执行频率；④监控执行结果持续优化。从每天 3-5 个 Loop 开始，逐步扩展到几十个，让任务拓扑自己生长。

### 3. 团队评估核心转向「业务理解深度+AI调度能力」
在招聘和晋升评估中，逐步将「编码能力」降权，将「业务问题拆解为 AI 可执行任务的能力」升权。具体做法：对现有岗位重新绘制「AI 可替代比例热图」，高替代比例岗位优先重组；同时为团队设计 AI-native 的工作流培训，而非教他们学代码。

### 4. 架构设计坚持「最小化产品层」原则
在做任何 Agent 架构设计时，默认假设模型会变强，所以产品层应该保持最小化和可移除性。避免在 Harness 侧沉淀过多领域特定逻辑（这些逻辑会变成迁移负担）。参考  中的三代理架构教训——scaffold 的复杂度上限由当前模型能力决定，而非由业务需求决定。

### 5. 战略评估先画护城河类型矩阵
面对 AI 冲击时，先问：这个业务的护城河属于哪一类（切换成本 / 流程壁垒 / 网络效应 / 规模经济 / 稀缺资源）？如果主要是前两类，AI 威胁是真实的，应该加速 AI Native 转型；如果主要是后三类，防御优先级更高，不应被 AI 焦虑带偏。这个框架可以直接用在融资材料、董事会讨论和战略规划中。

## 关联阅读
---

---

