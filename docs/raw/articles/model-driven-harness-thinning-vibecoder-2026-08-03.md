---
source_url: "https://mp.weixin.qq.com/s/eH2s3EKNDvcn48pgbGqsTw"
source_author: "VibeCoder"
source_title: "模型推动Harness变化：五个开源项目正在改写 Agent 管控"
source_date: "2026-08-03"
source_publication: "Vibe编码"
ingested: "2026-08-03"
sha256: "81facb5d743476f7afbe7b1d53defe599e8514eb111044956ee36ed72055b27a"
---

随着模型能力的提升，Fable5，gpt-5.6-sol，Kimi-K3 等模型出炉后，用户发现一些 harness 的管控逻辑正在变薄，比如 Claude 在 Opus5 出来以后，把 Claude Code 的系统提示词删掉了 80%，也有网上的反馈称，在 gpt-5.6-sol 顶级模型使用过程中，superpowers 这种知名的 harness 流程反而变成了负优化，模型本身就有强大的质量管控和规划编排意识，强大的流程和提示词干预反而让整体效果下降，浪费 token。

Superpowers、Spec Kit 的 issue 和 Reddit 讨论里，已经出现详细计划写到上千行、简单任务烧完预算、关闭全流程后速度明显恢复的反馈。但这些反馈还缺少固定任务、模型版本和 reasoning effort 的严格对照，不能直接升级成"重型 Harness 已经全面失效"。

我把 Superpowers、ECC、GSD、OpenSpec、Spec Kit 最近的 release、提交、文档和高互动讨论摆在一起看，得到的结论很明确：**正在退场的是大量常驻说明和重复编排，正在增厚的是状态、验证、权限、恢复与预算控制。**

## 一个容易说错的"80%"

网上流传最广的说法，是 Claude Code 在 Opus 5 时代删掉了 80% 系统提示词。本地对 105 个可比历史版本的测量，确实找到了接近这个比例的变化：核心行为提示从 25,695 字符降到 4,650，减少 81.9%；完整 System Prompt 减少 77.9%。

问题在于，完整 prompt 只减少 4.5%，Tools 反倒增加 24.9%。很多规则从全局 prose 搬进工具契约、Skills、ToolSearch、自动记忆、reference 和 verifier。最大结构断点也发生在 Claude Code 2.1.153 到 2.1.154，和 Opus 4.7 到 4.8 的路由变化同时出现，时间早于 Fable 5。所以准确口径应当是：常驻行为提示缩短约 80%，总控制上下文没有同步缩水。

目前只能确认它与模型代际切换强相关，无法证明由某个新模型单独触发。

这张图概括了真正的变化。身份、目标、权限、安全和少量不变量留在常驻内核；工具说明与领域知识变成按需加载；计划和 checkpoint 写入外部状态；测试、审查和熔断守在输出端。**控制没有消失，只是换了位置。**

## 五个项目，走出了五条减负路线

**Superpowers 的动作最直接**。v6.1 release notes 明确把降低每会话 token 成本写成目标，压缩 using-superpowers，删除现代 agent 已能自行处理的通用工具映射。Codex 的 SessionStart bootstrap 也被移除，因为 Codex 已能可靠发现原生 Skills。v6.0 还把每任务两个 reviewer 合并为一个 reviewer 的两次 verdict，项目内部评测报告称相近质量下速度约翻倍、token 接近减半。

它没有追求盲目变短。TDD 的解释段落被删后，压力场景里的 test-first 行为从 8/10 降到 5/10，维护者又把有效论据压进更短的 rationalization table。这个案例很关键：**该优化的是"行为增益除以上下文成本"，不是字符数。**

**ECC 的库继续变厚，安装面可以很薄**。当前项目拥有大量 agents、skills 和兼容命令，同时提供 minimal/core profile、minimal|standard|strict hook profile、按组件安装和 low-context 路径。Capability Surface Selection 给出的原则很实用：确定性不变量放 rules，昂贵 playbook 放按需 skill，简单动作交给 script，长期结构化服务才使用 MCP。

**GSD 没有砍掉主循环，却最接近 capability-aware harness**。它保留 Discuss、Plan、Execute、Verify、Ship，也把冷启动时平铺 86 个 Skills 改成 6 个 namespace router，自报 skill listing 从约 2,150 tokens 降到 120。更重要的是，当前配置会按角色和预算把 Codex 路由到 Sol、Terra、Luna，并把 Fable 5 留给长、多步、高价值的节点；短 mapper、快速 audit、单文件检查会跳过昂贵 advisor。

**OpenSpec 在减少入口，保留工件协议**。2026 年 7 月，它的 Codex 集成改成 skills-only，退休 managed custom prompts。需求清楚时可以跳过 explore，schema、artifact dependency 和 CLI state 仍然是权威。它减少了"模型每次先读什么"，没有放弃跨会话状态。

**Spec Kit 的加载在变懒，控制图还在增厚**。constitution、specify、plan、tasks、implement 主链仍在；Skills scaffolding、workflow engine、gates、loop、fan-out/fan-in、pause/resume 继续增加。Discussion #1672 有 23 个 reactions，其中一次非严格 Gemini CLI 测试显示，Skills 相比 commands 的总 token 少 13.3%，active input 少 34.8%。它没有质量对照，只能说明 progressive disclosure 值得认真测。

五个项目没有同时走向"无流程"。共同方向是：**少暴露入口，少做冷启动注入，把能力放到需要时再取；保留可执行的控制，把重复教学和重复复核压掉。**

## 为什么强模型会被重型 Harness 拖慢

我认为根因并非 prompt 单纯太长。更大的问题，是**两个 controller 同时指挥同一项工作**。模型已经能拆任务，Harness 又强制 brainstorm 和详细 plan；计划阶段把代码写了一遍，执行阶段重新生成；模型本来会自检，外部 workflow 又让多个 reviewer 从头读取；每个子 agent 为了获得干净上下文，再次支付仓库发现、规则加载和 handoff 编码的成本。

Superpowers #512 报告了 1,750 多行计划和 50 美元以上 planning 成本；#951 要求按请求切换简单与完整 workflow。2026 年 7 月两篇 Codex Reddit 讨论，也集中询问 Superpowers 是否拖慢 GPT-5.6 和是否只是在消耗 token。

这些材料足够把负优化列为正式风险，不足以证明普遍因果。任务难度、缓存、MCP、服务状态、模型快照和 reasoning effort 都可能改变结果。还有反例：Superpowers #446 的用户认为 Codex 能稳定触发 Skills，Claude/Opus 反倒不稳定。模型能力与外部控制的遵循度不是同一个指标。

## 三档模式比全开或全关更实用

更好的默认策略，是先判断任务风险、歧义、时长和可逆性，再选择最低足够强度。

- **Bare** 适合单文件、小修和快速回滚：让模型原生执行，只保留仓库规则与终态测试。
- **Light** 适合边界清楚的多文件任务：一页短 spec、明确验收标准，加一次最终复核。systematic debugging、verification 这类与模型原生规划正交的能力，可以按需启用。
- **Full** 留给长时、含糊、跨系统或高风险任务：工件状态、decision log、checkpoint、scoped reviewer、预算与 circuit breaker 都有价值。

只要失败、歧义或风险上升，再从 Bare 升到 Light，或从 Light 升到 Full。这个路由不能简单写成"Sol 就关闭 Harness"。同一模型换一个 effort、工具协议、上下文压力或宿主版本，表现都可能不同。GSD 当前的可取之处，正是它开始按照角色和预算分配模型，而非给所有节点统一叠最高计算量。

## 该删什么，该保留什么

会随模型增强而快速贬值的，是长篇"如何思考"、通用工具教学、重复示例、无条件 brainstorm、在计划里写完整代码，以及多轮同构 review。

不会随模型增强而消失的，是持久状态、权限、安全、可执行验收、审计、恢复、预算上限和不可逆操作审批。支付迁移、生产删除、公开发布这类任务，无论模型多强，都需要确定性的门禁和回滚路径。

如果要验证一套 Harness 是否值得保留，我只会做三组高决策价值对照：Native、Light、Full。固定模型快照、effort、仓库起点和预算，比较首次通过率、有效交付、token、延迟、人工复核量和回滚风险。Full 在简单任务上如果稳定呈现同质量但更贵，就停止穷举，把实验预算移到 Bare 升级 Light 的边界。

## 总结

模型越强，Harness 越需要克制。Superpowers 已经在压缩 bootstrap、合并复核；GSD 在做两级能力索引和模型分层；OpenSpec、Spec Kit 转向原生 Skills；ECC 把常驻、按需和确定性脚本分开。它们都在削减重复控制，却没有放弃治理。

我的判断是，下一代 Harness 的竞争点已经从"思考教程写得多严密"，转向能否准确决定何时不介入、何时加载能力、何时保存状态、何时验证、何时熔断。真正值得追求的目标也不该是 prompt 最短。对工程系统来说，最好的 Harness 是存在感很低，出问题时又能留下证据、止住风险、恢复现场。

**薄常驻提示，厚按需控制面**，这才是模型能力继续提升后更稳的方向。
