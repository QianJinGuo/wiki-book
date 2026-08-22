# Agent 终章（Harness 成本篇）：一次百炼账单降低 88% 实战

## Ch06.012 Agent 终章（Harness 成本篇）：一次百炼账单降低 88% 实战

> 📊 Level ⭐⭐ | 15.0KB | `entities/agent-终章harness-成本篇一次百炼账单降低-88-实战.md`

# Agent 终章（Harness 成本篇）：一次百炼账单降低 88% 实战

阿里技术景钊（曹建新指导、陈威 idea）基于百炼 qwen3.7-max 生产实践写成的 Agent Token 成本优化全景实战，最终把一次 20 轮会话的输入费用从 ¥9.84 降到 ¥1.16（降幅 88.2%）。核心命题：**优化 token 不是外挂技巧，就是 Harness 实践——模型只负责生成，Harness 决定哪些内容要发、哪些过程要隔离、什么时候该停、用什么模型**。

## 核心洞察：几个字撬动几十 M Token

一次 prompt 发给 agent 往往只有几个字，但水面下是大头：工作守则（system prompt）、几十个工具 schema、每轮对话历史、工具查回结果。故障诊断/成本分析 agent 一个模糊需求会铺开多维度找线索，一来一回 30-40 轮，烧掉几十 M token。**三个元凶**：循环反复跑、历史每轮全量重发、工具结果不断往上下文堆。

一次三轮对话示例中，固定前缀（工作守则 + skills + 常驻工具 + MCP schema）×6 = 120k token，占总量 209.4k 的 57%，而用户输入仅 0.3k。**固定前缀每轮全量重发是最大的成本来源**。

## 建立度量标准（先有尺子再下刀）

三条链路交叉验证，防止"为了省成本牺牲质量"：

1. **自研采集**：每次 LLM API 返回的 token 字段写入本地。`cache_hit_rate = cached_tokens / prompt_tokens`，接口未返回 usage 时记为空而非 0。`cache_mode` 从响应推断：有 `cache_type: "ephemeral"` 为显式缓存，有 `cached_tokens` 无 `cache_type` 为隐式缓存。
2. **自建 Langfuse**：一次调用上报为一条 Generation，一个 Agent 任务 = 一条 Trace，Subagent 独立 Trace 通过 `parent_task_id` 跳回父级。`usage_details` 按 OpenAI completion schema 拆分，异步队列不阻塞主 loop。
3. **自建评测 Agent**：从工具轨迹标记重复调用/连续失败等异常，轻量模型从相关性、工具效率、重复操作、错误恢复、完整性五维评分。低分任务自动沉淀诊断包，形成持续改进闭环。6 月与 7 月总分基本持平（证明优化未降质）。

## 六刀优化（一次 agent loop 请求生命周期）

### 第一刀·少发：缩小每轮请求输入体积

- **随模型进化删教学文本**：早期 system prompt 里的 ReACT 循环说明、tool_use 格式教学、few-shot 示例约 1.2K token。最新模型已在海量 agent trace 上训练内化这些范式，删除后工具调用准确率和任务完成率无下降。
- **System prompt 每轮重建，不写进历史**：system 占 context 5-10%（200K window）。OpenAI 接口原生不支持 system 字段，全靠框架自己处理；Anthropic 原生支持 system 字段则无此问题。
- **工具 schema 按需读取（Deferred Tools）**：常驻工具 + 多个 MCP server 完整工具占的 context 可能比 system prompt 还大。Anthropic/OpenAI 原生支持该语义，但**百炼不支持**（实测 Chat Completions 和 Responses API 均静默忽略 `defer_loading`/`tool_search`）。因此在 harness 层自实现：把工具分常驻池（Read/Edit/Bash/Grep/Glob/Write 每轮带完整 schema）和延迟池（MCP/WebSearch/DB 系列只留一行目录在 prompt，最多 50 行"工具名—一句话提示"）。激活路径 A=模型 ToolSearch，路径 B=Skill 激活自动扫描。工具召回不动前面任何内容 → 缓存照常命中。
- **常驻工具标准化**：常驻工具按 Claude Code 工具定义保持出入参一致。因为 Claude Code 是最流行的 coding 工具，其工具定义早已刻入 LLM 训练，模仿它既省 token 又避免工具调用失败（自定义同名 Read 出入参不一致会导致 LLM 第一次就出错）。
- **Skills 去重（同一份只激活一次）**：一份 skill 正文动辄几千 token，连续 5 轮激活就占 5 次。改为全文只注入一次固定在历史作锚点，后续重复激活只在上下文尾部补一条 ~150 字符短提醒（"指令已在上文，本轮仍生效"）。谁先激活谁持有全文，后来的拿短回执。按 5 次计算这部分少写近 80%。
- **重复 Read 去重**：维护已读路径集合（文件系统 mtime），每批工具执行前检查：已读过/同批重复 → 不执行，返回"Skipped duplicate read"。一个文件一轮只付一份全文 + 两条 ~50 字符错误，而非三份全文。
- **MCP 迁往 CLI + Skills（把 schema 从根上干掉）**：MCP 形态即使延迟加载，目录每工具仍留一行、reveal 时完整 schema 至少付一次费，且 MCP 工具结果是模型没法过滤的 JSON 块全量进历史。更根本：一个 MCP server = 在运行时教模型一套新接口格式，教学成本每次按 token 付。实测 MongoDB MCP 24 个工具描述近一万字符、76 处参数注解，每轮 2-3K token 固定开销。迁移到 CLI + Skills 后：tools 数组字节级不变、输出可 head/grep/jq 过滤、对缓存友好。**MCP 2026-07-28 规范无状态化（退役 initialize 握手、tools/list 确定性排序可声明 ttlMs 缓存）+ Anthropic Code execution with MCP（单任务 150k→2k，降 98.7%）全是 CLI 化套路**。

### 第二刀·发得便宜：让已发的尽量命中缓存折扣

**KV Cache 原理**：prefill（算力最密集）后生成 token 只查已有 K/V。命中后 GPU 跳过 prefill，百炼计费：显式缓存 = 标准输入价 ×10%（创建时 ×125%），隐式 = ×20%（无创建费但命中不可预期）。

百炼显式缓存四规则：内容至少 1,024 Token、单次最多 4 个标记、有效期 5 分钟且命中续期、Tools 定义参与 system 前缀缓存计算。**为什么不能全依赖隐式**：官方不保证命中率，同场景实测隐式加权 0.800 但会单轮骤降至 0.00 全量 miss；显式加权 0.898、无灾难脱靶。

- **System prompt 按稳定性分层**：用 `__SYSTEM_PROMPT_DYNAMIC_BOUNDARY__` 切成静态区（Constant 跨会话不变 / SessionStable 会话内禁止变化 / MidConversation 跨 reveal 稳定）和动态区（每轮可变）。万一某层变，左侧前缀仍命中，只有右侧连同 messages 失效——控制爆炸半径。工具列表先固定排序再截断（A,B,C→B,A,C 即使工具没变字节也变了会失效）。时间放本轮 user 消息末尾（新内容不破坏缓存）。
- **缓存断点标在请求尾部**：`cache_control` 标记放 messages 最后一条消息上，整段前缀（sys+tools+历史）进入缓存。从 messages 末尾往前找第一条有文字消息，累计字符 ≥4096（百炼下限 1024 Token）才标，在其最后一个 text 块加 `{"cache_control":{"type":"ephemeral"}}`。第 1 轮全量创建 ×125%，第 2 轮起旧前缀命中 ×10%、仅 Δ 创建。

### 第三刀·少想：让模型不要思考太多

prompt 里加"少想多干"没用（prompt 只是建议）。改为**从请求参数控制**：

- **不需要推理的调用直接关 thinking**：标题生成、意图分类、查询富化、轮后建议、字段提取、简单压缩——输入不长输出很短答案空间窄，直接关闭。主 Agent Loop、需判断的 Subagent 才开启。
- **thinking_budget 设上限**：给主 Agent 和推理型 Subagent 选 4,096，最终回答再预留 4,096。这是故障诊断样本上扫出的拐点：从不思考提高到 4K 工具选择和根因判断明显变好，继续放 8K/16K reasoning 越长任务完成率却不涨。

### 第四刀·SubAgent：探索过程不进主上下文，只回传结论

主 Agent 自己查日志/监控/搜索时，有用结论可能只有一句但探索过程几百行日志、十几次搜索、几条走错的路全进上下文，上下文窗口动不动塞满然后 compact（故障诊断场景 compact 浪费几分钟）。引入 Subagent 只带结论回来。

新 Subagent 拿到自己 system prompt + 主 Agent 写的任务说明，独立 Agent Loop 完成调查，完整结果落到文件；主 Agent 默认只收到不超过 600 字符摘要和结果路径，需复核证据才按路径读。**主上下文少重发 token ≈ 父级剩余轮数 ×（探索过程 - 回传摘要）**。

**派发原则**（是否会产生大量主 Agent 后面用不到的过程）：查多个目录/日志/数据源、独立方向、只读探索、过程长只需结论 → 拆出去；一次工具调用能回答、下一步依赖上一步、主 Agent 最终要通读原文、多人同改一文件 → 留主 Agent。**并发 agent 不自动省 token**——三份上下文和工具调用仍都要付费，只有几个方向互不重叠且都能压成短结论才适合一起派。

委派说明必须写成能独立执行的六要素：背景/目标/范围/已知事实/边界/返回。结果回传也限六要素：状态/结论/证据/未确认项/下一步/结果路径。完整日志留文件（冷存储），摘要才是进主上下文的热数据。

### 第五刀·Hook：在循环边界拦截，避免无效轮次

模型输入不稳定，会泄露非标准 OpenAI Function tool 格式、空回答等。定义 hook 拦截（从 github 各家 issue 抓通用规则 + 业务实测产生）：

- **一条 SSE 内重复**：边接收边按句检查新增内容，同一正常句子完整出现第三次即停（来源于 DeepSeek flash 0731 把一句话重复 685 次）。
- **多 Turn 说同样的话/重复调同工具**：给回答前 500 字符生成指纹与最近三 Turn 比较，相似度 >80% 视为无进展。前两次提醒换方法，连续第三次结束。
- **一直调工具但无效**：同一组工具参数连续 8 Turn 提醒；连续 5 Turn 工具结果全报错/空要求换思路；Shell 命令累计失败 4 次改路径；用户连续 3 次没响应确认说明人已离开。
- **空回答和假动作不进历史**：只输出 reasoning 无正文/工具调用、连续"让我查询"却未执行，当无效回答不保存，hook 注入要求直接调工具，纠正三次仍空则结束。兜底：大段 prompt 复述/自我指令丢弃并注入生成用户可读总结。

### 第六刀·模型分流：不是每个任务都需要最贵的模型

`ModelRegistry` 设四个角色指针（后端 gRPC 下发、客户端缓存磁盘），LLM 调用不直接指定模型名而通过角色指针间接引用：

- `default_chat_alias` → 旗舰模型（主循环/Subagent）
- `classify_alias` → Flash（分类/标题/富化/内存更新/质量评估首轮/context 压缩降级），成本通常只有旗舰 1/10-1/20
- `responses_alias` → 场景模型（Responses 工具）
- `file_extract_alias` → 长文本模型（文件提取）

Subagent 也按角色分流：`explore`/`data-query` 走 classifyAlias，`general-purpose`/`plan`/`verification`/`code-review` 走 defaultChatAlias。K8s Agent 更彻底：四角色全指向 Flash（查 Pod/事件/日志/Prometheus 指标高度模式化），单次诊断费降到约 1/15。

## 88% 降幅怎么算的

假设 20 轮会话，每轮输入 `S + i×Δ`（S=固定前缀，Δ=每轮新增）。无缓存 20 轮共发 `20S + 210Δ`（820k）。只加缓存：实际仍发 820k 但大部分按折扣计费（等价全价 151k，¥1.81，降 81.6%）。裁剪 + 缓存：发送量降到 532k（等价 96.9k，¥1.16，降 88.2%）。**88% 是"少发"和"发得便宜"叠出来的，不是单一优化**。

## 结语：成本优化就是 Harness 实践

成本优化不是外挂式 token 技巧，**就是 Harness 实践**——模型只负责生成，Harness 决定发什么、隔离什么、何时停、用什么模型。Agent Loop 成本没有单一解法：前缀少一点、缓存多命中、探索少带回来、无效轮次少跑一次，单看都不惊人，但会在每一轮每次任务重复，差距就是这样乘出来的。**让 agent 长期跑得起、跑得高效，才是 Harness 真正要解决的问题**。

> 与 [腾讯 Token 优化实战](../ch03/019-agent.html) 互补：腾讯侧强调 Context Rot 三段生命周期与"最小上下文/清晰理想态/动态选型"框架，本实体提供阿里百炼侧的六刀可执行工程量（deferred tools、CLI 替代 MCP、缓存断点、thinking_budget、Subagent 隔离、模型分流）+ 88% 测算方法。

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/agent-终章harness-成本篇一次百炼账单降低-88-实战.md)

---

