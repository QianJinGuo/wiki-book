---
title: "别再幻想用 Spec 替代写代码"
source: wechat
url: https://mp.weixin.qq.com/s/GxCAP6SjYPQ-WOFseZzGKA
ingest_date: 2026-07-04
vxc: 49
stars: 3
sha256: 5e3334d300eee165796504e4f20ae29e85b9393076b8de1c0f4d48a8dab3c355
---

# 别再幻想用 Spec 替代写代码

**来源**: 高可用架构

**发布日期**: 2026-03-23

**原文链接**: https://mp.weixin.qq.com/s/GxCAP6SjYPQ-WOFseZzGKA

---

本文本质上是把下面这幅漫画展开成了一篇完整的博文：

漫画大意：

1️⃣ 总有一天我们甚至不再需要程序员了。我们只需要写好规格说明书（Spec），程序就会自动生成。

2️⃣ “噢哇，你说的太对了！我们要做的就是写出一份详尽、精确的 Spec，然后‘砰’的一声，我们就不再需要程序员了！”

“没错！”

3️⃣ “那你知不知道，在业界，一份足以用来生成程序的、既详尽又精准的项目 Spec 规格说明书，叫什么名字？”

“呃……不知道……”

4️⃣ “代码。”

“这玩意儿就叫代码。”

这则漫画的笑点在于，许多人认为“写文档”比“写代码”简单，但实际上，如果你能把逻辑描述得足以让机器完美运行，那个描述过程本身就是编程。

很长一段时间以来，我不觉得自己需要写这样一篇文章。每当有人提出"能不能从 Spec 自动生成代码"的想法，我把上面这张图甩给他们就够了。

但现在，Agentic Coding 的倡导者们声称找到了一种"反重力"的方法，纯粹从 Spec 文档就能生成代码。不仅如此，他们还把概念搅得很混，所以我觉得有必要对上面那幅漫画做一些展开说明，解释为什么他们的说法站不住脚。

在我看来，他们的鼓吹建立在两个常见的误解之上：

误解 1：Spec 文档比对应的代码更简单

当他们面向"信徒"推销 Agentic Coding 时，就会拿这个误解当卖点。这些信徒把 Agentic Coding 当作新一代的外包，他们幻想着工程师只需要当管理者，写好 Spec 文档，然后扔给一群 Agent 去干活。但这套逻辑能成立，前提是"描述工作"比"亲自做工作"更便宜，而事实并非如此。

误解 2：写 Spec 一定比写代码更深思熟虑

当他们面向"怀疑者"推销 Agentic Coding 时，就会拿这个误解当挡箭牌。怀疑者担心 Agentic Coding 会产出无法维护的垃圾代码，而他们的反驳是：先写 Spec 再生成代码，这个过程会倒逼质量提升，促进更好的工程实践。

接下来，我会用一个具体例子来说明为什么这两个都是误解。

## 披着散文外衣的代码

我先从 OpenAI 的 Symphony 项目说起。OpenAI 把它当作"从 Spec 文档生成项目"的标杆案例。

Symphony 是一个 Agent 编排器，号称完全由一份"Spec"（SPEC.md）生成。我之所以给"Spec"加引号，是因为这份文件与其说是 Spec，不如说是用 Markdown 写的伪代码。只要稍微深入看一下，你就会发现它包含这样的内容，用大段文字列出数据库字段：

4.1.6 Live Session（Agent 会话元数据） 编码 Agent 子进程运行时跟踪的状态。

字段：

session_id (string, <thread_id>-<turn_id>)  
thread_id (string)  
turn_id (string)  
codex_app_server_pid (string or null)  
last_codex_event (string/enum or null)  
last_codex_timestamp (timestamp or null)  
last_codex_message (summarized payload)  
codex_input_tokens (integer)  
codex_output_tokens (integer)  
codex_total_tokens (integer)  
last_reported_input_tokens (integer)  
last_reported_output_tokens (integer)  
last_reported_total_tokens (integer)  
turn_count (integer)

当前 worker 生命周期内启动的编码 Agent 轮次数。 ……或者用文字去"描述"本质上就是代码的逻辑：

8.3 并发控制 全局限制：

available_slots = max(max_concurrent_agents - running_count, 0)

按状态限制：

- max_concurrent_agents_by_state[state] if present（状态键已规范化）

- 否则回退到全局限制

运行时在 running map 中按当前跟踪状态统计 issue 数量。

8.4 重试与退避 重试条目创建：

- 取消同一 issue 的任何现有重试计时器。

- 存储 attempt、identifier、error、due_at_ms 和新的计时器句柄。

退避公式：

- worker 正常退出后的常规重试使用 1000 ms 的短固定延迟。

- 故障驱动的重试使用 delay = min(10000 2^(attempt - 1), agent.max_retry_backoff_ms)。

- 幂次上限由配置的最大重试退避决定（默认 300000 / 5 分钟）。

重试处理行为：

- 获取活跃候选 issue（非全部 issue）。

- 按 issue_id 查找特定 issue。

- 如未找到，释放 claim。

- 

如找到且仍符合候选条件：

- 

如果有可用 slot 则调度。

- 

否则以"no available orchestrator slots"错误重新入队。

- 

如找到但不再活跃，释放 claim。 ……或者专门为了"喂"模型而加的章节，比如：

6.4 配置字段摘要（速查表）

本节有意设计为冗余，以便编码 Agent 能快速实现配置层。

- tracker.kind: string, required, currently linear

- tracker.endpoint: string, default
  https://api.linear.app/graphql
  [1]
  when tracker.kind=linear

- …

……甚至直接就是代码  1  ：

- 参考算法（语言无关） 16.1 服务启动

function start_service():  
  configure_logging()  
  start_observability_outputs()  
  start_workflow_watch(on_change=reload_and_reapply_workflow)  

  state = {  
    poll_interval_ms: get_config_poll_interval_ms(),  
    max_concurrent_agents: get_config_max_concurrent_agents(),  
    running: {},  
    claimed: set(),  
    retry_attempts: {},  
    completed: set(),  
    codex_totals: {input_tokens: 0, output_tokens: 0, total_tokens: 0, seconds_running: 0},  
    codex_rate_limits: null  
  }  

  validation = validate_dispatch_config()  
  if validation is not ok:  
    log_validation_error(validation)  
    fail_startup(validation)  

  startup_terminal_workspace_cleanup()  
  schedule_tick(delay_ms=0)  

  event_loop(state)

Agentic Coding 的倡导者把 Spec 当作代码的替代品来推销，但这份 Spec 读起来就像代码（有些地方就是代码），我觉得这很不诚实。

别误会：我不是说 Spec 里不应该包含伪代码或参考实现，这两者在 Spec 工作中都很常见。但问题是，当你的 Spec 读起来就像代码的时候，你就没法再说"Spec 可以替代代码"了。

我拿 Symphony 举例，正是因为它完美地体现了第一个误解：

误解 1：Spec 文档比对应的代码更简单

如果你想让一份 Spec 精确到能够可靠地生成可运行的实现，你就不得不把这份文档写成代码，或者写成高度接近代码的东西（比如极其结构化、形式化的英文）。到头来，Spec 本身的复杂度并不比代码低。

Dijkstra 解释过为什么这是不可避免的：

选择接口并不只是把工作一分为二，因为跨接口协作和通信本身也需要额外的工作量。我们还从学到，改变接口很容易导致接口两端工作量都增加。这就是为什么人们越来越偏好所谓的"窄接口"。因此，虽然改用人类的自然语言来与机器通信会大大加重机器的负担，但我们必须质疑一个假设：这样做真的能让人的工作变得更简单吗？

回顾数学史就能看出这种质疑多么合理。希腊数学因为始终停留在口头描述和图形演示上而走进了死胡同；伊"代数"在符号化方面做了一次怯懦的尝试后，又退回了修辞风格，随之消亡；经院哲学不过是用口头语言追求精确的一次徒劳尝试！最终拯救我们的，是 Vieta、Descartes、Leibniz 以及后来的 Boole 等人精心设计的形式化符号系统。

Agentic Coding 的实践者们正在用惨痛代价学到同一个教训：你没法绕开工程劳动所需的"窄接口"（也就是代码）；你只能把它改头换面，变成表面上看起来不同、但实际上要求同等精度的另一种东西。

## 不稳定

退一步说，就算你接受"用 Spec 生成代码"这个前提，它也不能可靠地工作！我实际按照 Symphony 的 README 试了一下：

告诉你喜欢的编码 Agent，用你选择的编程语言来构建 Symphony：

Implement Symphony according to the following spec: https://github.com/openai/symphony/blob/main/SPEC.md  [2]

我让 Claude Code 用我选择的语言来构建 Symphony，Haskell  2  （看我博客名字就知道了），结果并没有成功。你可以在我的 Gabriella439/symphony-haskell 仓库里看到结果。

生成的代码不仅有好几个 bug（我不得不反复提示 Claude 去修复，修复记录都在 commit 历史里），而且即使在表面上"成功"的时候（没有报错），codex Agent 也只是在那里空转，对下面这个简单的 Linear 工单毫无进展：

创建一个新的空仓库 不需要创建 GitHub 项目。只需创建一个空的 git 仓库

换句话说，Symphony 那份"用口头语言追求精确的徒劳尝试"（借用 Dijkstra 的话），仍然做不到可靠地生成能用的实现[^3]。

这个问题不止出现在 Symphony 身上：即使是像 YAML 这样家喻户晓的规范，也存在同样的问题。YAML Spec 极其详细、被广泛采用、还自带一致性测试套件，可绝大多数 YAML 的实现仍然无法完全符合这份 Spec。

Symphony 当然可以尝试通过扩充 Spec 来解决不稳定性，但它的 Spec 已经很长了，篇幅达到配套 Elixir 实现代码量的六分之一！如果继续膨胀下去，他们就会重演 Borges 短篇小说《论科学的精确性》中的荒诞场景：

……在那个帝国，制图学达到了如此完美的程度，以至于一个省的地图占据了整座城市，帝国的地图占据了整个省。后来，这些不合理的地图仍不能令人满意，于是制图师公会绘制了一幅与帝国等大的地图，上面的每一个点都与帝国的对应点一一重合。后代人不再像先辈那样热衷于制图学，他们觉得这幅巨大的地图毫无用处，便冷酷地将它弃于烈日与严冬之中。在西部的沙漠里，至今还能看到那幅地图的残片，供动物和乞丐栖身；整片国土上再无其他地理学的遗迹。

## AI 味的垃圾

按理说，写 Spec 应该是比写代码更难的事情。我们之所以在动手编码前先写 Spec，是为了强迫自己用审慎和批判的眼光审视项目，因为一旦开始写代码，人就会切换到"执行模式"，被行动的惯性驱动着往前冲。

那为什么我说下面这条是误解呢？

误解 2：写 Spec 一定比写代码更深思熟虑

问题在于，当下整个行业都在推动削减和贬低技术劳动力，这种"深思熟虑"已经不能当作理所当然的前提了。如果你一开始就告诉人们"写 Spec 应该比写代码更轻松"，那你就注定会翻车。在追求交付速度的压力下，没有人会去做 Spec 写作所要求的那种费力、不讨好的深度思考工作。这就是为什么会出现像 Symphony 这种东西，表面看上去是一份 Spec，但经不起任何仔细推敲。

事实上，Symphony 的 Spec 读起来就像 AI 生成的垃圾。第 10.5 节是一个尤其典型的例子，比如以下摘录：

linear_graphql 扩展契约：

- 目的：使用 Symphony 为当前会话配置的 tracker 认证，对 Linear 执行原始 GraphQL 查询或变更。

- 可用性：仅在 tracker.kind == "linear" 且配置了有效的 Linear 认证时有意义。

- 首选输入形式：

{  
  "query": "single GraphQL query or mutation document",  
  "variables": {  
    "optional": "graphql variables object"  
  }  
}

- query 必须是非空字符串。

- query 必须恰好包含一个 GraphQL 操作。

- variables 是可选的，如果存在则必须是 JSON 对象。

- 实现也可以额外接受原始 GraphQL 查询字符串作为简写输入。

- 每次工具调用执行一个 GraphQL 操作。

- 如果提供的文档包含多个操作，应以无效输入拒绝该工具调用。

- operationName 的选择有意不在此扩展的范围内。

- 复用来自活跃 Symphony workflow/运行时配置的已配置 Linear 端点和认证；不要求编码 Agent 从磁盘读取原始 token。

- 

工具结果语义：

- 

传输成功 + 无顶层 GraphQL 错误 -> success=true 存在顶层 GraphQL 错误 -> success=false，但保留 GraphQL 响应体用于调试

- 

无效输入、认证缺失或传输失败 -> success=false，附带错误载荷

- 

将 GraphQL 响应或错误载荷作为结构化工具输出返回，以便模型在会话中检查。

这不过是一堆"看起来像 Spec"的句子堆砌在一起，读起来就像 Agent 的产出物：缺乏连贯性，没有目的感，也看不出作者对全局有任何理解。

即使这份 Spec 是人写的，它也必然是垃圾，因为作者优化的是交付速度，而不是连贯性或清晰度。在当下的工程环境中，我们再也不能想当然地认为一份 Spec 就是深思熟虑的产物了。

## 结论

Spec 从来就不是用来省时间的。如果你的目标是缩短交付时间，那你大概率直接写代码会更好，而不是先绕一圈写一份中间 Spec 文档。

更普遍地说，"垃圾进，垃圾出"的道理在这里同样适用。这个世界上不存在这样的好事：你给 Agent 一份含糊不清、缺乏细节的文档，Agent 就能替你把缺失的清晰度和细节补上。编码 Agent 不会读心术，就算它们会，如果你自己的思路本身就是混乱的，它们也帮不了你。

原文: https://haskellforall.com/2026/03/a-sufficiently-detailed-spec-is-code  [3]  CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/  [4]
Footnotes

- 如果你好奇为什么这些代码片段没有语法高亮，那是因为我原样保留了原始文档中的 GitHub 风格 Markdown。所有代码片段都被显式标注为 text（这是该文档为 AI 生成的众多迹象之一）。这很可能是模型在"遵循字面要求而非领会意图"。我猜实际发生的是：人类让 AI 把项目初稿转换成散文式的 Spec，然后 AI 觉得把代码片段标注为 text 就能让它们看起来更像"散文"而不是"代码"。

- 人们经常对我说"用更主流的语言生成代码效果会更好，别用 Haskell"。我的回答是：如果 Agent 生成 Haskell 代码都有困难，这恰恰说明 Agent 并不能可靠地泛化到训练数据之外。

References

- https://api.linear.app/graphql:
   https://api.linear.app/graphql

- https://github.com/openai/symphony/blob/main/SPEC.md:
   https://github.com/openai/symphony/blob/main/SPEC.md

- https://haskellforall.com/2026/03/a-sufficiently-detailed-spec-is-code:
   https://haskellforall.com/2026/03/a-sufficiently-detailed-spec-is-code

- https://creativecommons.org/licenses/by-sa/4.0/:
   https://creativecommons.org/licenses/by-sa/4.0/

## 参考阅读

- 实现复利工程：我是如何通过龙虾构建递归进化的 Agent 闭环

- 理解 Prompt Cache 与 Agent 的“上下文税”：AI时代架构纪律

- 8天，4万行代码：一个递归进化的agent编排器是如何“手搓”出自己的?

- 如何手搓一个 CLI：只需 80 行代码，彻底看清 AI 的底层逻辑
