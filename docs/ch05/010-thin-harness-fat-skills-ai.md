# Thin Harness, Fat Skills：AI工程架构的本质

> 📊 Level ⭐⭐ | 7.5KB

## 核心理念：Latent vs Deterministic 空间分离

AI应用有两个完全不同的空间：Latent 空间和 Deterministic 空间。前者是模型的领地——判断、阅读、综合、推理，擅长但不确定；后者是代码的领地——SQL、编译、算术、文件操作，精确可复现。核心错误在于把确定性任务扔给LLM，把不确定性任务交给人去做。一个典型反例是用LLM安排800人座位表，这种确定性编排问题让模型反复纠结座位冲突，而代码本可以线性求解 。

## Thin Harness, Fat Skills 架构

### Fat Skills（Markdown 技能文件）

技能文件是永久升级资产，随使用自动复合进化。每次运行流程：运行 Skill 得到结果 → 判断质量 → 固化好的结果到 Skill 文件 → 下次使用时复合知识。新模型发布时，所有 Skill 自动受益，因为 Skill 是结构化知识而非硬编码判断。铁律：同一个问题问两次即失败——第一次问模型，第二次必须固化到 Skill 文件 。

### Fat Code（确定性逻辑）

用代码处理确定性事务：SQL 查询、文件操作、编译/类型检查。代码不"智能"，但代码稳定、可复现、可测试 。

### Thin Harness（~200行轻量框架）

案例对比：Playwright CLI 响应只需 100ms，而 Chrome MCP 需要 2-5 秒（延迟峰值 15 秒+），结论是 Playwright CLI 比 Chrome MCP 快 75 倍。Harness 只负责加载 Skill、路由任务、调用确定性代码，不包含任何业务逻辑 。

## 深度分析

### 1. 案例证据：Skill 固化的收益是可测量的

原文给出的两个真实案例把"复合进化"从口号变成了数字。YC 创始人活动评分通过 Fat Skills 固化高质量反馈流程，"还好"评价从 12% 降到 4%；Maria Santos 的日记化洞察则揭示了反方向的偏差——目标设定为"AI Datadog"式的全面观测，实际却是 80% 的提交集中在计费模块。两个案例合起来说明：Skill 固化既是改进机制也是测量机制，它把"预期用法"与"实际用法"之间的落差暴露出来，为下一轮迭代提供依据。这与本页核心理念的空间分离互补——Latent 空间的判断与综合，必须落回 Deterministic 空间的评分与日志，才能进入可复利的进化循环，也正是 [Agent Self Improvement Loops](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-self-improvement-loops.md) 所刻画的自改进闭环。

### 2. 薄度不是风格偏好，而是延迟预算的推论

约 200 行的 Harness 之"薄"可以从延迟约束推导出来：Harness 位于所有调用的关键路径上，每增加一层路由或抽象，每次往返就多一分延迟。Playwright CLI 100ms 对 Chrome MCP 2-5 秒（峰值 15 秒+）的 75 倍差距意味着，工具选择本身就是架构决策而非实现细节。把延迟当作一阶设计约束（类似 p99 预算）看待，结论自然是：工具原语保持少而快，复杂度上移到 Skill 层封装。Harness 职责收缩到加载 Skill、路由任务、调用确定性代码三件事，正是这一约束下的最小形态，与 [Coding Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/coding-harness-engineering.md) 的主题直接相关；工具形态随场景更替（CLI 与 MCP 之争）的演化线索，则可对照 [Claude Code Tool Design Evolution](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/claude-code-tool-design-evolution.md)。

### 3. "两次法则"是把个人经验转化为组织资产的触发器

"同一个问题问两次即失败"的深层含义不止于节省对话成本：第二次提问是一个明确信号，说明该知识具备复用价值，应当从个人记忆迁出到 Skill 文件或 cron 定时任务。知识因此不再依赖某个人的记忆，而是沉淀在仓库里，团队任何成员或任何 agent 会话都能继承，与 [Ai Team Knowledge Harness](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/ai-team-knowledge-harness.md) 关注的组织级知识沉淀相呼应。再加上 Skill 是 Markdown 结构化知识而非硬编码判断，新模型发布时全部存量 Skill 自动受益——投资沉淀在"知识"上而非"绑定某代模型的提示词"上，模型升级不会让积累作废，这是该架构能长期抗时间衰减的关键。

### 4. 座位表与 40+ 工具：边界违反的两种形态

文章的两个反例指向同一个边界问题的两个方向。800 人座位表反例是把确定性编排错交给模型——代码本可线性求解，模型却在座位冲突上反复纠结；40+ 工具定义反例则是把本应沉淀为 Skill 的复杂流程堆进了 Harness 的工具层，工具越多系统越难维护。前者是任务委派的越界，后者是层次安排的越界，共同后果都是让本应"薄"的控制面承重。诊断方法因此可以统一成一问：这块复杂度属于模型判断、代码执行还是知识沉淀？答案不在三者之内的复杂度，就是架构异味。

## 实践启示

1. **建立 Latent/Deterministic 边界评估清单**：在设计任何 LLM 应用流程时，先明确每个步骤属于哪个空间。判断、推理、生成 → LLM；存储、计算、IO、编译 → 代码。出现混合地带就用 Skill 封装，不混用 。

2. **强制执行"两次法则"**：任何被问到两次的同类问题，必须固化到 Skill 文件或 cron 定时任务，不能第三次再问模型。这是技能工程的基础纪律 。

3. **优先测量外部工具延迟**：在选型阶段就将工具响应时间作为核心指标，避免 MCP 等慢速调用成为整个系统的瓶颈。Playwright CLI 的 100ms vs 15s 延迟差距足以颠覆用户体验 。

4. **以 Skill 而非工具数量衡量系统复杂度**：当工具数量超过 10 个时，重新审视是否可以用 Skill 封装替代。技能的复合进化比工具的堆叠更能带来长期价值 。

5. **用 Fat Code 保护关键路径**：对需要精确结果的操作（支付计算、数据写入、编译检查），完全排除 LLM 介入，由代码保证确定性，形成系统的确定性保护区 。
6. **把"预期 vs 实际"的偏差测量制度化**：像 Maria Santos 的日记化洞察那样，用评分、日志等确定性手段记录 AI 系统的真实使用模式；当实际与预期差异巨大（例如 80% 提交集中在计费模块）时，优先把高频真实路径固化为 Skill，而不是按原计划扩张功能。

7. **给 Harness 设定显式延迟预算**：把工具响应时间当作架构约束写进选型标准（例如关键路径单次往返不超过几百毫秒）；超出预算的调用（如 2-5 秒的 MCP 往返）要么替换成更快的 CLI 形态，要么移出关键路径做异步化处理。

## 相关实体
- [Mac Multi Agent Coding Skills Hooks Harness](https://github.com/QianJinGuo/wiki-public/blob/main/entities/mac-multi-agent-coding-skills-hooks-harness.md)
- [Code As Agent Harness Survey](https://github.com/QianJinGuo/wiki-public/blob/main/entities/code-as-agent-harness-survey.md)
- [Cong 30 Fen Zhong Shou Gu Agent Dao Harness Cheng Wei Xin Hou Duan](https://github.com/QianJinGuo/wiki-public/blob/main/entities/cong-30-fen-zhong-shou-gu-agent-dao-harness-cheng-wei-xin-hou-duan.md)
- Claude Code Harness Deep Understanding
- [从 30 分钟手搓 Agent到 Harness 成为新后端](https://github.com/QianJinGuo/wiki-public/blob/main/entities/从-30-分钟手搓-agent到-harness-成为新后端.md)

→ [原文存档](https://mp.weixin.qq.com/s/FgV_r2sz_LJNhy5TGeLorQ)

---

