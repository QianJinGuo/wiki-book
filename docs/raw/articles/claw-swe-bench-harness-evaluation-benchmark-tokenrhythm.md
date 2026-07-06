---
source_url: "https://mp.weixin.qq.com/s/iCty7MvtQDZzJNhV9nCZIA"
title: "打破SWE-bench唯分数论，首个独立测量harness的基准开源了"
source: "机器之心"
ingested: 2026-06-15
sha256: "b5d7b8c1a2e3f4d5061728394a5b6c7d8e9f0a1b2c3d4e5f60718293a4b5c6d"
type: raw
tags: [sweb-bench, harness-evaluation, benchmark, coding-agent, openclaw, claw-swe-bench, tokenrhythm]
---

打破SWE-bench唯分数论，首个独立测量harness的基准开源了

编辑｜杨文

编程 Agent 的评测，一直是本糊涂账。

SWE-bench 如今已成事实标准，几乎每家发布新模型或新 Agent 框架，都会拿出一个 SWE-bench 分数来证明自己有多强。

但这些数字真的能直接横向比较吗？

LLM Agent 的能力，本质上是模型和 harness 共同决定的，同一个模型换一套 harness，在 SWE-bench、Terminal-bench 等评测上的分数能相差十几甚至二十多个百分点，差距堪比换一代模型。

也就是说，一个 SWE-bench 分数背后，同时藏着三个变量：底层用的是哪个大模型、把大模型包装成 Agent 的 harness 是怎么设计的、评测用的是哪批任务。

SWE-agent、AutoCodeRover、OpenHands、mini-SWE-agent，每个系统都有自己的提示词模板、工具接口、最大轮数、超时策略和停止逻辑。模型、harness、任务集，三个变量打包在一起，很难判断 A 比 B 高出的那几个点，是模型更强、harness 设计更优，还是任务集选得更有利。

另一方面，OpenClaw 这类原本面向通用工具调用场景的 Agent，根本进不去 SWE-bench 的评分流程，「通用 Agent 到底有没有写代码能力」这个问题，也因此长期处于无法验证的状态。

近日，基元律动联合无问芯穹，清华大学、北京大学、SEE 基金等机构发了篇论文，并完全开源代码和数据，试图把这笔糊涂账理清楚。

论文链接：https://arxiv.org/pdf/2606.12344v1
GitHub：https://github.com/opensquilla/claw-swe-bench
Hugging Face：https://huggingface.co/datasets/TokenRhythm/Claw-SWE-Bench

论文提出了一套 claw for coding 适配器，第一次让 OpenClaw 这类通用 Agent，能够在 SWE-bench 式的真实代码任务上交出可评分的答卷。

在这套适配器之上，他们构建了 Claw-SWE-Bench，一个覆盖 8 种编程语言、43 个真实代码仓库、350 个 GitHub issue 修复任务的多语言基准，外加一个专门给学术圈和小团队用的轻量版 Lite-80。

该基准强制要求所有系统在统一的 prompt、预算和评分流程下汇报 API 总成本，让准确率和运行代价能够在同一张表里被直接解读。

这也是 SWE-bench 式基准中，第一次让 harness 作为可独立测量的变量加以控制。

而在搭建评测环境的过程中，他们还顺手发现并修复了 SWE-Bench-Multilingual 官方数据集里的一处答案泄露问题，并已向上游提交了修复 PR。

基元律动由原华为诺亚方舟实验室主任、盘古大模型负责人王云鹤创立，离职仅两个月便完成首轮融资。

Claw-SWE-Bench，正是其首个对外亮相的技术成果。

适配器解决了什么？

OpenClaw 这类通用 Agent，本来面向的是更广泛的工具使用场景。它可以调用工具、读写文件、执行命令、保留会话状态，也可以生成自然语言解释。

但 SWE-bench 的评分中，系统必须提交一个可应用到代码仓库的 diff patch，评估器只看 patch 和测试结果，对自然语言回答和 Agent 的交互轨迹一概不理。这种差异，源自于测评方式本身的限制，并不真实反映 Agent 的能力。

这种差异带来几个直接问题。

其一，SWE-bench 需要一个干净、可复现的 Docker 工作区，通用 Agent 则依赖自己的运行环境、工具配置、API 访问和会话状态。

其二，SWE-bench 只读取 model_patch 字段，而通用 Agent 原生输出的可能是最终回答、结构化消息或日志。

其三，通用 Agent 在执行过程中可能生成各种缓存、元数据、会话文件，一旦这些内容混进 git diff，便会污染最终提交给评估器的 patch。

因此，OpenClaw 无法原生进入 SWE-bench 评分流程，并不说明它没有写代码能力。更准确地说，是我们需要将通用 Agent 的行为转化成 SWE-bench 可以读取、应用和评分的标准化内容。

Claw-SWE-Bench 的解决思路是引入一个 adapter（适配器）层。

OpenClaw 式 harness 与 SWE-bench 之间不匹配。适配器将通用 Agent 交互转换为可由 SWE-bench 评分的补丁预测，同时通过外部控制确保公平性、可比性和成本可追踪。

不同 harness 通过统一接口接入评测流程，Agent 无需在最终回答里手写 diff，而是在 /testbed 工作区里真实编辑仓库文件。运行结束后，runner 从 Git 状态中导出代码补丁。

这套适配器是不是真的有用，研究者进行了一组 bare adapter 和 full adapter 的对照实验。

同样以 GLM 5.1 为底座模型，在全部 350 个实例上，bare adapter 只做最小集成，把 OpenClaw 放进 Docker 环境，发送任务描述，然后让模型直接在最终回复中输出一段 unified diff 文本。结果，bare adapter 的 Pass@1 仅为 19.1%，patch 应用失败率高达 69.1%。

full adapter 则要求 Agent 通过工具直接编辑仓库文件，再由 runner 从 Git 状态中导出代码补丁。Pass@1 随即提升至 73.4%，应用失败率降至 1.5% 以下。

这也说明，一个通用 Agent 可能已具备解决代码任务的潜力，但若缺少合适的评测接口，其能力会被 patch 格式、工作区污染、输出解析等工程细节所掩盖。而 adapter 本身就是能力释放的一部分。

一个多语言 benchmark

在适配器的基础上，研究者又构建了 Claw-SWE-Bench，以此解决「评什么、怎么评得公平」。

完整版本包含 350 个真实 GitHub issue 修复任务，覆盖 8 种编程语言、43 个代码仓库，其中 300 个非 Python 实例来自 SWE-bench-Multilingual，覆盖 Java、Go、Rust、JavaScript/TypeScript、C/C++、Ruby、PHP，另外 50 个经过人工校验的 Python 实例来自 SWE-bench-Verified-Mini。

为了让不同 harness 之间的差异真正可比，Claw-SWE-Bench 还在外层固定了一套评测条件。所有 harness 使用同一份 prompt 模板、同一个任务集、同一套 Docker 运行环境，以及每个实例相同的 3600 秒超时预算。

prompt 里的任务描述、操作规则完全一致，差异只来自 harness 自身的内部实现。

如此一来，不同 harness 之间的 Pass@1 差异，才能被真正归因到 harness 设计上，而非外部条件不同造成的假象。

由于完整版本包含 350 个实例，这样规模的评测成本过高，适合正式报告，但不适合日常高频迭代。

为此，研究者还构建了一个轻量版本 Claw-SWE-Bench Lite，从 8 种语言中各选 10 个实例，共 80 个实例，专门留给学术团队、开源社区和资源有限的小团队，用来做日常的 prompt 调整、模型替换、adapter 调试和回归测试。

Lite 不是随机抽样。它控制了语言分布、难度四分位和仓库覆盖，并以 17 个校准列拟合 full-350 的行为，这 17 个校准列同时覆盖模型变化和 harness 变化。

结果显示，Lite-80 的成本约为 full-350 的 22.9%。在 17 个校准列上，full-350 平均 Pass@1 为 0.639，Lite-80 为 0.643，只差约 0.4 个百分点。

Lite 还覆盖了 full-350 中 43 个仓库里的 34 个，覆盖率达到 79%。

花四分之一左右的成本，就能拿到一个和完整评测几乎一致的反馈信号，这对学术团队和小公司来说相当友好。

此外，在构建这套多语言任务集的过程中，团队还顺手发现了一个问题。

检查 SWE-bench-Multilingual 的容器时发现，部分实例中 base_commit 之后的 Git 历史仍然可见，Agent 如果通过 git log 或 git show 看到未来的修复提交，分数就会被人为抬高。

因此，研究团队在非 Python 多语言任务中移除了 base_commit 之后仍可达的 Git 历史，并把这一清理逻辑变成了 Claw-SWE-Bench 评测流程的标准步骤，同时把这一问题反馈给了上游 SWE-bench-Multilingual 项目。

清理之后，9 个模型在 300 个 Multilingual 实例上的 Pass@1 没有一个上升，Claude Opus 4.7 下降最多，从 84.7% 降到 76.7%，降了 8.0 个百分点；Kimi 2.6 下降 5.0 个百分点，Qwen 3.6-flash 下降 2.0 个百分点。

两组横扫实验，把关键变量逐一拆开

在统一的适配器和评测协议之下，论文做了两组横扫实验。

固定 harness，换模型

第一组实验固定 OpenClaw 这个 harness，只更换底层模型，在 9 个模型上做横扫。

结果显示，模型选择依然举足轻重。GPT 5.5 最高，Pass@1 为 78.0%，Claude Opus 4.7 为 77.1%，GLM 5.1 为 73.4%，最低的 Seed 2.0-mini 为 48.6%。最高和最低之间相差 29.4 个百分点。

这组实验真正有意思的结论在成本侧。GPT 5.5 跑完 350 个实例的总 API 费用是 1399 美元，Claude Opus 4.7 是 1082 美元，两者 Pass@1 只相差不到 1 个百分点。

DeepSeek-V4 Flash 以 70.3% 的 Pass@1 完成评测，总成本只要 8.2 美元。DeepSeek-V4 Pro 以 71.7% 的成绩花了 81 美元，Qwen 3.6-flash 以 66.0% 花了 71 美元。

同样是七成左右的解决率，成本可以差出两个数量级。如果评测报告只写一个 Pass@1，完全看不出这个维度的差异。

固定模型，换 harness

第二组实验则固定模型，在 GLM 5.1 和 Qwen 3.6-flash 上分别对 OpenClaw、Hermes-agent、ZeroClaw、GenericAgent、Nanobot 这五个 harness 做横扫。

prompt、任务集、运行预算等其它条件全部保持一致，唯一的变量就是 harness 内部的 agent loop、工具集和停止策略。

结果是，在 GLM 5.1 上，五个 harness 的 Pass@1 分布在 60.9% 到 73.4% 之间，差距达 12.5 个百分点。

在 Qwen 3.6-flash 上，从 Generic 的 38.6% 到 OpenClaw 的 66.0%，差距扩大到 27.4 个百分点。

同一个模型，换一套 harness，结果能相差一个模型档位甚至更多，这说明在编程 Agent 里，harness 会显著影响最终能力。

论文进一步用 Pareto 前沿图呈现了成本分布。

横轴是 350 个实例完整运行的总 API 成本，纵轴是 Pass@1，Pareto 曲线连接那些「没有任何其他组合既更便宜又更准确」的工作点。

我们可以看到，generic × Qwen 3.6-flash 成本最低，约 14.5 美元，但 Pass@1 只有 38.6%，实用价值有限。

ZeroClaw × Qwen 3.6-flash 花 49 美元可达 58.3%，OpenClaw × Qwen 3.6-flash 花 71 美元能到 66.0%，OpenClaw × GLM 5.1 花 277 美元可达 73.4%。

这类对比把评测从「谁分数最高」推进到「什么组合在成本和准确率之间最值得选用」。对研究团队、开源社区和小公司来说，这个视角尤为重要。真实研发通常不是一次性冲榜，更多时候是在预算约束下反复试错、调参、回归和验证。

结语

AI 编程 Agent 的竞争，已经不只发生在模型层。真正决定它能否进入真实软件工程流程的，还有工程实现、系统架构和成本控制。

然而，这些维度在当前以单一 Pass@1 数字为核心的行业话语里，几乎是隐形的。

一个系统分数更高，究竟是因为模型更强，还是 harness 设计更好，抑或是任务集选得更有利，外界很难看清。

因此，未来的编程 Agent 评测，不能只报告 Pass@1，也不能默认把所有提升都归因于模型。harness 设计、工具接口、运行预算、缓存策略与成本核算，都应当进入评测表。否则，我们所看到的数字，充其量只是故事的一半。
