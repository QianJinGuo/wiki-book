# Agent 治理：用 Hook 堵住 LLM 的偷懒、越权与失忆

## Ch01.1059 Agent 治理：用 Hook 堵住 LLM 的偷懒、越权与失忆

> 📊 Level ⭐⭐ | 5.9KB | `entities/agent-治理-hook-llm偷懒越权失忆.md`

# Agent 治理：用 Hook 堵住 LLM 的偷懒、越权与失忆

腾讯 DECO（跑在生产上的数仓 Agent 引擎）实践系列之护栏层：用 Agent 框架的 Hook 切面，把 LLM 处理长文本时的「偷懒」（截断、略写、残缺）、对生产环境的「越权」（未确认发布、回刷）以及上下文传递中的「失忆」（改了表不查风险、产出了物不知汇报），在代码层确定性兜底——prompt 管不住的，框架来堵。

核心判断是：这三类问题不是模型能力不够，而是「图省事」或「自作主张」的结构性倾向。长 SQL 物理上超出 token 预算，危险操作是模型无法区分「查询」与「发布」的可逆性差异，被动探测是模型追求最短完成路径的自然倾向——唯一解法是在 Agent 框架层，让偷懒和越权的路径代码级强制走不通，让失忆的已知盲区确定性补齐。

## Hook 链：在关键切面挂载护栏逻辑

拦截切入口是 Agent 框架普遍提供的 Hook（Callback）机制：框架在「模型调用」和「工具调用」的执行前/后暴露切面，拦截逻辑挂载到切面上，到点自动回调，同一切面可挂多个、按序执行。核心切面包括 Before Tool（工具真正执行前，可改入参、可直接拦截）、After Tool（工具执行后、结果回给 LLM 前，可改返回值）、Before/After Model 与 Before/After Agent。设计原则是基础设施和推理逻辑解耦——Hook 切面上的逻辑独立运作，模型的 ReAct 循环不用感知。

## 长文本完整性护栏：读写两侧 offload + 引用句柄

数仓长 SQL 的偷懒是结构性问题，解法是「把 LLM 必须接触的长内容降到最少、每次接触的窗口压到最小、所有写入路径都做成小步增量改 + 强制校验」。具体做法是 LLM 永远不直接接触脚本全文：长内容全文留在沙箱，上下文里只有一句引用句柄；拉取侧 Offload Hook（afterTool）把 `scriptContent` 全文写入沙箱只读快照、响应替换为引用句柄，写回侧 Onload Hook（beforeTool）从沙箱读全文覆盖入参、剥离 `scriptFilePath` 字段。落地效果是修改任务工具调用输出 token 直降约 90%，「view → 重写」复印路径下近 100% 的自截断概率被物理消除。

失败语义按代价差异化：读侧 Offload 落盘失败则降级透传原内容（承担自截断风险、不阻断主流程），写侧 Onload 文件不存在则抛异常阻断工具调用（杜绝发布残缺脚本）。这与 [Agent 安全架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-security-architecture.md) 中「护栏必须在框架层而非 prompt 层」的思路一脉相承。行业对比上，ADK 与 LangGraph 都只有读侧 offload，DECO 的数仓场景需要两端对称 offload 并额外加固写侧。

## 危险操作确认（HITL）：beforeTool 卡住不可逆操作

prompt 是软约束，不是安全边界。任何「做了就回不去」的操作（发布、回刷、冻结/解冻、终止）都必须有代码级强制确认：HITL 本质是一个特殊的 beforeTool Hook——工具真正执行前判断「是不是危险操作、用户授权了没」，没授权就阻断。危险工具清单是配置驱动的（yaml），每个配一个授权标记（`requiredState` key）和确认对话框，支持带输入控件的选项（填审批人、填回刷日期），不只是 yes/no。确认动作只能由真实用户在前端触发，Agent 无论自作主张还是被诱导，`packCommit`/`deployCommit` 在框架层都物理走不通。

## 上下文联动闭环：Hook 采集 → state → Attachment 注入

「主动探测 = 额外一次 tool call = 多耗 token」，模型不会主动给自己加检查步骤，因此要把「副作用采集」和「上下文注入」解耦成两段：采集是确定性的（工具调用一定触发 Hook，不靠 LLM 记得去查），注入是时机正确的（结果只在下一轮 prompt 注入，不污染当前轮）。RiskAnalysisHook 挂在 afterTool 上，通过「带 `tableId` 参数的 upsertTable 才是改表」的精确判定触发下游风险分析；PythonImageHook 通过 before/afterTool 前后文件快照对比发现脚本新产出的图片，生成预签名 URL 注入前端渲染。这套机制把「LLM 需要主动查」降维为「框架主动 push」。

同一套 Hook 链上 DECO 实际挂了十余个 Hook，覆盖长文本护栏、危险操作护栏、工具返回处理、可观测与持久化、前端实时刷新、Hook→Attachment 联动、沙箱环境等横切关注点。一句话总结：prompt 定意图，Skill 定规矩，框架 Hook 定边界——能用确定性兜底的，别交给模型。

## 相关实体

- [Agent Hooks 可编程工作流](../ch03/037-agent.html)
- [腾讯 DECO Hook 治理](../ch04/746-deco-agent-hook.html)
- [Harness Gate 评估](https://github.com/QianJinGuo/wiki/blob/main/concepts/harness-gate-evaluation.md)
- [Agent 记忆架构](https://github.com/QianJinGuo/wiki/blob/main/concepts/agent-memory-architecture.md)

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agent-治理用-hook-堵住-llm-的偷懒越权与失忆.md)

---

