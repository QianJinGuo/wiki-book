# DeepSeek视觉原语论文：当所有人在堆图像分辨率时，它在堆「指代精度」！

## Ch01.343 DeepSeek视觉原语论文：当所有人在堆图像分辨率时，它在堆「指代精度」！

> 📊 Level ⭐⭐ | 10.6KB | `entities/deepseek视觉原语论文当所有人在堆图像分辨率时它在堆指代精度.md`

#  DeepSeek视觉原语论文：当所有人在堆图像分辨率时，它在堆「指代精度」！
原创  花叔  花叔  [ 花叔 ](/ch01-<javascript:void\(0\/);>)
超长预警，这篇文章总字数9000+，预计阅读时长20分钟。如果你觉得太长读不下去的话，不用喊元宝了，这是最核心的四条总结：
1、DeepSeek今天（4月30日）发了多模态论文 Thinking with Visual Primitives，离 V4 论文整 6 天。核心是「视觉原语」：让模型一边推理一边输出坐标，把「点」和「边界框」当作思考的最小单元，相当于让 AI 一边想一边「用手指着图说话」

2、DeepSeek是七大 coding agent 玩家里最后一个把视觉接入主力产品的旗舰（OpenAI、Anthropic、Qwen、Kimi、GLM 都比它早），但补课方式反共识：主流派在堆图像分辨率，DeepSeek 在堆指代精度

3、效率夸张到离谱。一张 800×800 图，Claude-Sonnet-4.6 要 ~870 个 KV cache 条目，Gemini-3-Flash 要 ~1100 个，DeepSeek 这个新模型只要 ~90 个。整体压缩比 7056 倍，平均分还小幅领先所有 frontier 模型

4、最猛的成绩不在常规 VQA。在拓扑推理（迷宫导航 / 路径追踪）上 DeepSeek 领先 frontier 模型 16 到 26 个百分点。论文原话：「所有 frontier 模型在拓扑推理任务上均表现欠佳」。一句话礼貌地踩了所有人

说起来，赶在五一长假之前丢个重磅论文，这风格还真挺特么DeepSeek的，熟悉的味道又回来了。以及，这次内容真的太长了，建议你可以先收藏了，假期里无聊的时候慢慢读，我这五一期间尽量...尽量不卷了，不给各位增加阅读负担。

## 相关实体
- [Pi Mono Github](/ch01-608-pi-mono-github/)
- [From Prompt To Harness Claude Official](/ch01-664-从-prompt-到-harness-claude-官方学习资料/)
- [Cursor Harness Model Production Floor](/ch01-235-cursor-harness-model-production-floor/)
- [Vibe Coding Agentic Engineering Convergence Simon Willison](/ch01-247-vibe-coding-and-agentic-engineering-convergence-simon-willi/)
- [刚刚Opus 47发布相比46核心变化与Claude Code搭配最佳实践 V2](/ch01-347-opus-4-7-发布-相比-4-6-核心变化与-claude-code-搭配最佳实践/)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/deepseek视觉原语论文当所有人在堆图像分辨率时它在堆指代精度.md)

- [一个文件让 ai coding 效率翻倍：agents.md 实践指南](/ch04-230-一个文件让-ai-coding-效率翻倍-agents-md-实践指南/)

- MOC
## 深度分析

主流多模态模型在视觉能力上的竞争维度，长期被锁定在「看得更清楚」这一条路上——通过高分辨率切割、动态分块将图像 token 数量不断推高，以求在 VQA 任务上刷新 benchmark 分数。Anthropic 将 Opus 4.7 的图像内部分辨率从 1568px 提升到 2576px，Google 的 Gemini 从初代发布起就走 natively multimodal 路线，这些动作都在强化一个隐含前提：视觉推理的瓶颈在于感知清晰度。DeepSeek 这篇论文的核心反驳是「看见 ≠ 看清楚 ≠ 说清楚指哪个」，论文原文直接点破：「The inherent ambiguity of natural language often fails to provide precise, unambiguous pointers to complex spatial layouts, leading to logical collapse in tasks requiring rigorous grounding.」这个 Reference Gap（指代鸿沟）才是真正卡住多模态推理的地方，而非 Perception Gap（感知鸿沟）。

DeepSeek 提出的视觉原语范式，本质上是将视觉 grounding 从「事后验证」（post-hoc verification）转变为「思考的内在媒介」（intrinsic medium of thought）。在此之前，Visual CoT、CogCom、GRIT 等工作都将 grounding 当作模型先想完、再用框来确认答案是否正确的工具——这是脚注式的使用。DeepSeek 的范式里，坐标是边推理边出现的，「指」和「想」是同一件事：「我看到左边的皮卡丘」这句话后面跟着的是 `<|ref|>皮卡丘<|/ref|><|box|>[[215,483,368,711]<|/box|>]`，坐标是思考过程的组成部分，而非附注。论文里两个关键术语精确地描述了这个区别：先前工作是 post-hoc verification，DeepSeek 让视觉原语成为 intrinsic medium of thought。这一区别在拓扑推理任务上造成了 16-26 个百分点的差距，因为这类任务要求模型在每一步推理中都维持精确的空间状态，无法承受「中间偏左」这类模糊表述的累积误差。

三步压缩链路是工程层面最值得关注的技术细节：ViT 切块（14×14 像素一个 patch，756×756 图切成 2916 个 patch token）→ 3×3 空间压缩（每 9 个相邻 patch 沿通道维度压成 1 个，2916 变成 324）→ Compressed Sparse Attention 再压缩（每 4 个 KV 条目压成 1 个，324 变成 81）。整体压缩比 7056 倍，从 571,536 像素到 81 个 KV 条目。这个数字的工程意义在于：KV cache 是推理成本的大头，条目数降一个量级意味着同等硬件可并行处理近 10 倍请求，或将图片分辨率拉到更高。DeepSeek 的路径是用「记得重要内容在第几页第几行」替代「把整本书带在身上」——坐标就是「第 372 页第二行」，一种远比原始像素更轻量的精确指代方式。

五阶段训练管线（Pretraining → Specialized SFT → Specialized RL → Unified RFT → On-Policy Distillation）里，最后阶段的 OPD 蒸馏是整个工程闭环里含金量最高的一笔。过程是这样的：先训两个专家模型 F_TwG（用框思考）和 F_TwP（用点思考），各自在专项任务上单独强化；然后用 RFT 把两个专家合体成统一模型 F，合体后在每个专项上的表现却都下降了——「a noticeable performance gap remains」；最后用 OPD 让统一模型 F 同时学习两个专家的输出分布，用 KL 散度加权和作为损失函数闭合差距。先专家化、再合体、合体差了再用蒸馏闭合，每一步都不偷懒。这种工程哲学在 DeepSeek 历篇论文里一以贯之：mHC 不是优化残差连接参数，是加一道只准收缩不准放大的数学护栏；OCR 2 不是改文本编码方式，是把长文本压成视觉信号。

论文揭示的三个局限（需要触发词才能启用视觉原语、极细粒度场景下 0-999 整数坐标精度不够、point 方式在全新拓扑场景上的跨任务泛化问题）都相当诚实，是研究的边界而非工程的不足。但最值得注意的彩蛋是：后训练数据里没有任何中文语料，模型依然能用中文做视觉推理——因为视觉原语（坐标）和语言无关，基座模型的多语言能力接管了语言部分，视觉原语接管了空间推理部分。这是一个漂亮的解耦，证明「用手指着思考」这个能力是可以跨语言迁移的。这也暗示下一代 DeepSeek 原生多模态基座，视觉原语将是其有别于其他旗舰的核心差异化能力。

## 实践启示

- **视觉理解已成为 coding agent 的必选项，而非锦上添花**：截一张报错截图让 AI 判断是否网络问题、截一张前端页面让 AI 定位布局崩溃——这些任务用文字描述根本说不清，「左边那个按钮的右边有个图标」描述完图早画好了。Anthropic 在 Agent SDK 文档里说得很直白：视觉反馈对于 UI 生成和测试类视觉任务「can be helpful」，这个判断在 2026 年已经显得过于保守了。

- **指代精度比感知分辨率更值得堆**：当其他旗舰在比「我的视觉模型能看 4K 图」时，DeepSeek 把比赛维度换成了「我的视觉模型能不能在思考时用手指着图说话」。对于 coding agent 而言，真正卡住人的从来不是看不清细节，而是「这个按钮的下面那个组件」这种空间关系描述不清楚的问题。一张 800×800 图 DeepSeek 只要 ~90 个 KV 条目而 Claude 要 ~870 个——这个 9 倍效率差距在规模化部署时会转换成可观的成本优势。

- **拓扑推理能力是当前多模态模型集体翻车的短板，也是差异化机会**：论文坦诚地写道「所有 frontier 模型在拓扑推理任务上均表现欠佳」，迷宫导航和路径追踪这两个需要模型长时间维持精确空间状态的任务，暴露了纯文本 CoT 的根本局限。coding agent 在处理复杂代码结构、模块依赖、路径追踪等任务时，视觉原语式的指代能力可能是关键破局点。

- **Anti-cheat 数据设计是训练出真正泛化能力的关键**：DeepSeek 为迷宫数据专门生成「貌似可解但实际不可解」的对抗样本，为路径追踪数据做「全部曲线同色」版本防止模型靠颜色作弊。这种设计思路值得借鉴：在构建训练数据时，不仅要让模型能做对，还要主动堵死所有可能的捷径，逼模型学到真正的能力而非「图像识别小聪明」。

- **复杂推理任务值得用「先专家化再合体」的管线**：DeepSeek 的五阶段训练里，先分开训 F_TwG 和 F_TwP 两个专家，再用 RFT 合体，最后用 OPD 蒸馏闭合差距。这套流程的本质是：不让不同能力的干扰在训练早期就发生，等各自成熟了再融合。在构建多能力集成的 agent 系统时，类似的分阶段专业化管线可能比端到端统一训练更有效。

---

