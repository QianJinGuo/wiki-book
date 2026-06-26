# harness-design-long-running-apps

## Ch05.017 harness-design-long-running-apps

> 📊 Level ⭐⭐ | 19.8KB | `entities/harness-design-long-running-apps.md`

## 正文
在过去几个月里，我一直在同时处理两个彼此关联的问题：如何让 Claude 产出高质量的前端设计，以及如何让它在无人干预的情况下构建完整应用。这项工作起源于我们更早之前在 frontend design skill 和 long-running coding agent harness 上的探索。当时，我和同事们已经通过提示工程与 harness 设计，让 Claude 的表现明显超越了 baseline，但这两条路线最终都碰到了天花板。
为了突破这些上限，我开始寻找能够同时适用于两个差异很大的领域的 AI 工程方法：一个领域由主观审美主导，另一个则由可验证的正确性与可用性定义。受生成对抗网络（Generative Adversarial Networks, GANs）的启发，我设计了一个由 generator（生成器） 和 evaluator（评估器） 组成的多代理结构。要构建一个既能稳定打分、又具备"品味"的评估器，前提是先建立一套标准，把"这个设计好吗？"这种主观判断转化为具体、可评分的条目。
随后，我把这些方法应用到了长时间自主编码（long-running autonomous coding）上，并继承了我们早期 harness 工作中的两个经验：第一，把构建任务拆解成可处理的小块；第二，使用结构化工件（structured artifacts）在不同会话之间交接上下文。最终结果是一个由 planner、generator 和 evaluator 组成的三代理架构，它能够在持续数小时的自主编码会话中产出内容丰富的全栈应用。

## 为什么"天真实现"行不通
我们此前已经展示过，harness 设计会对长时间运行的 agentic coding 效果产生显著影响。在更早的一次实验中，我们使用了一个 initializer agent 把产品规格拆解成任务清单，再由一个 coding agent 按"每次实现一个功能"的方式完成任务，并通过工件交接在不同 session 之间延续上下文。更广泛的开发者社区也逐渐收敛到了类似的洞见，比如 Ralph Wiggum 方法，就是通过 hooks 或脚本让 agent 持续处于迭代循环中。
但有些问题始终没有消失。任务一旦复杂起来，agent 仍然很容易随着时间推移而逐渐偏航。在拆解这个问题时，我们观察到两种常见失效模式。
第一种，是模型在上下文窗口逐渐被填满时，往往会在长任务中失去连贯性（参见我们关于 context engineering 的文章）。有些模型还会表现出"context anxiety（上下文焦虑）"：当它们接近自己认为的上下文上限时，就会过早开始收尾。context reset（上下文重置）——也就是彻底清空上下文窗口、重新启动一个新 agent，并配合一个结构化交接文档，把前一个 agent 的状态和下一步计划一起传过去——可以同时解决这两个问题。
这与 compaction（压缩）不同。所谓 compaction，是把对话较早的部分在原地压缩总结，让同一个 agent 基于缩短后的历史继续工作。虽然 compaction 能保留连续性，但它并没有给 agent 一个真正的"干净起点"，因此上下文焦虑依然可能存在。reset 的优点是给模型一个真正干净的上下文，代价则是交接工件必须携带足够状态，让下一个 agent 能无缝接续工作。在我们早期测试中，Claude Sonnet 4.5 的上下文焦虑明显到仅靠 compaction 无法支撑高质量的长任务表现，因此 context reset 成了 harness 设计中的关键组成部分。它确实解决了核心问题，但也为每次 harness 运行增加了编排复杂度、token 开销和额外延迟。
第二个问题，是我们此前还没有专门解决的：自我评估（self-evaluation）。当你让 agent 评价自己产出的结果时，它往往会信心满满地夸奖自己的工作——即使在人类看来，质量其实相当平庸。这个问题在设计这类主观任务上尤其明显，因为它没有像软件测试那样的二元可验证检查。一个布局究竟是"精致"还是"普通"本身就是判断题，而 agent 在评价自己作品时，几乎总会往偏正面的方向打分。
然而，即使在那些有明确可验证结果的任务里，agent 也仍然会表现出糟糕判断，进而妨碍任务完成。把"做事的 agent"和"评判的 agent"拆开，是解决这个问题的一根强杠杆。单靠这种分离，并不会立刻消除宽松倾向，因为 evaluator 本身仍然是一个倾向于对 LLM 产出手下留情的 LLM。但把一个独立 evaluator 调成"持怀疑态度"，远比让 generator 对自己苛刻要现实得多；一旦这种外部反馈存在，generator 就有了可以据以迭代的具体依据。

## 前端设计：让主观质量变得可评分
我最先在前端设计上做实验，因为自我评估问题在那里最明显。在没有任何额外干预时，Claude 往往会滑向安全、可预测的布局：技术上能用，但视觉上平平无奇。
有两个洞见塑造了我为前端设计构建的 harness。第一，虽然审美不可能被完全压缩成一个分数——个体偏好永远会不同——但我们仍然可以通过编码设计原则与偏好的评分标准来提升它。"这个设计漂亮吗？"很难稳定回答，但"这个设计是否遵循了我们关于好设计的原则？"就给了 Claude 一个更具体、可判断的标准。第二，把"前端生成"和"前端打分"拆开，可以形成一个反馈回路，持续推动 generator 产出更强的结果。
基于这两个洞见，我写了四个评分维度，并把它们同时放进 generator 和 evaluator 的提示词里：

- **Design quality（设计质量）**：设计是否呈现为一个统一整体，而不是零散部件的拼接？在这个维度上表现优秀，意味着颜色、字体、布局、图像以及其他细节共同构成了清晰的情绪和身份感。
- **Originality（原创性）**：设计里是否能看到定制化决策，还是说它只是模板布局、组件库默认值和典型 AI 生成模式的重复？一个真正的人类设计师应该能辨认出其中有明确、有意识的创作选择。未经修改的 stock components（现成组件），或者"白底卡片配紫色渐变"这类典型 AI 痕迹，在这个维度都会判失败。
- **Craft（工艺）**：技术执行质量，比如字体层级、间距一致性、配色和谐度、对比度等。这更像能力检查，而不是创造力检查。多数"还算合理"的实现默认都能在这里过关；如果在这个维度上失败，说明基本功出了问题。
- **Functionality（功能性）**：与审美无关的可用性。用户能否理解这个界面是做什么的、能否找到主要操作、能否无需猜测就完成任务？
我刻意把 design quality 和 originality 的权重设得高于 craft 和 functionality。Claude 在 craft 和 functionality 上通常已经有不错的默认得分，因为这些所需的技术能力对模型来说往往是天然具备的。但在 design 和 originality 上，Claude 经常只能给出"顶多不难看"的平淡结果。这套标准会明确惩罚高度通用化的 "AI slop（AI 味十足的流水线产物）" 模式，而提高 design 和 originality 的权重，也会迫使模型在审美上承担更多风险。
我用少样本示例（few-shot examples）和详细的分项打分来校准 evaluator。这保证了 evaluator 的判断能更贴近我的偏好，也减少了不同轮次之间的评分漂移。
我在 Claude Agent SDK 上构建了这个循环，因为它让编排过程相当直接：先由一个 generator agent 根据用户提示生成 HTML/CSS/JS 前端；再给 evaluator 接入 Playwright MCP，让它能够直接操作正在运行的页面，然后针对每个维度打分并写出详细 critique（批评意见）。在实际运行中，evaluator 会自己浏览页面、截图并仔细研究实现，然后产出评估。接着，这些反馈又会回流给 generator，作为下一轮迭代的输入。每次生成我会跑 5 到 15 轮迭代，通常每一轮都会让 generator 在 evaluator 的批评下走向更有辨识度的方向。
在多次运行中，evaluator 的评估结果通常会随着迭代逐步提升，随后进入平台期，但仍然存在继续提升的空间。有些生成结果是渐进式精修出来的，也有些会在中途突然发生明显的审美转向。
这些评分标准的措辞，还以一种我原本没有完全预料到的方式影响了 generator。比如，当我加入"最好的设计应该达到 museum quality（博物馆级）"这种表述时，产出的设计就开始朝某种特定视觉风格收敛。这说明，与评分标准关联的提示词语言，本身就在塑造输出的气质。
有一个很有代表性的例子。我让模型为一家荷兰艺术博物馆制作网站。到第九轮时，它已经生成了一个暗色调、颇为干净的虚构博物馆 landing page。到了第十轮，它却完全推翻了原先路线，把网站重新想象成一种"空间体验"：一个带棋盘地面的 3D 房间，使用 CSS 透视渲染；画作以自由排布的方式挂在墙上；用户不是通过滚动或点击，而是通过"门洞"在不同展厅之间穿行。这种创意跳跃，是我此前从单次生成里从未见过的。

## 扩展到全栈编码
在拿到这些发现之后，我把这种受 GAN 启发的模式扩展到了全栈开发上。generator-evaluator 循环天然对应软件开发生命周期：代码审查和 QA，在结构上就和设计场景中的 evaluator 处于同样的位置。

## 架构设计
在我们之前那篇关于 long-running harness 的文章里，我们已经解决了多 session 编码的一致性问题：通过一个 initializer agent、一个按"每次处理一个功能"方式工作的 coding agent，以及跨 session 的 context reset。到了 Opus 4.5，这种行为大体上已经不再明显，所以我得以在这个 harness 里完全移除 context reset。整个构建过程由多个 agent 在一个连续 session 中完成，同时借助 Claude Agent SDK 的自动 compaction 机制处理上下文增长。
在这项工作中，我沿用了原始 harness 的基础，并构建了一个三代理系统：

- **Planner**：把用户 1-4 句简单提示扩展成完整产品规格。要求它在 scope 上更有野心，关注产品背景和高层技术设计，而不是过早指定实现细节。同时要求它主动寻找把 AI 功能编入产品规格的机会。
- **Generator**：按 sprint 工作，每次从规格中选一个功能来实现。使用 React、Vite、FastAPI 和 PostgreSQL 技术栈。要求 generator 在每轮结束时先自评，再把工作交给 QA。
- **Evaluator**：通过 Playwright MCP 像真实用户那样点击运行中的应用，测试 UI 功能、API 端点和数据库状态。依据发现的 bug 和从前端实验迁移过来的评分标准，对每个 sprint 打分。每个维度都有硬性阈值，只要其中任何一个低于阈值，该 sprint 就失败。
在每个 sprint 开始之前，generator 和 evaluator 会先协商一份 sprint contract（冲刺契约）：在还没写任何代码之前，先共同定义好这一小块工作的 "done（完成标准）"到底是什么。

## 运行结果对照
**复古游戏制作器实验：**
| Harness | Duration | Cost |
|---------|----------|------|
| 单代理 | 20 分钟 | $9 |
| 完整 harness | 6 小时 | $200 |
单代理版本：乍看应用似乎符合预期，但实际操作时问题层出不穷——布局浪费空间、工作流僵硬、entity 不响应输入、entity 定义和游戏 runtime 之间的连线断了。
harness 版本：planner 把一句 prompt 扩展成 10 个 sprint、16 个功能点的规格。除了核心编辑器和 play mode，还加入了 sprite 动画系统、行为模板、音效和音乐、AI 辅助 sprite 生成器、AI 关卡设计器，以及带可分享链接的游戏导出功能。sprite editor 更丰富，play mode 真正能玩。
evaluator 发现了大量具体 bug，例如：

- Rectangle fill tool 只在拖拽起点和终点放置 tile，而不真正填充中间区域
- Delete 键处理逻辑条件写错（`selection` 和 `selectedEntityId` 同时存在的要求不对）
- FastAPI 路由顺序错误（`PUT /frames/reorder` 被 `/{frame_id}` 路由先匹配）
Claude 原生不是一个好的 QA agent——它倾向于表面测试而不深挖边界，识别出真实问题后又容易自我说服"不重要"。调优 evaluator 需要反复迭代。

## 迭代与简化
harness 的每个组件都编码了一个"模型自己做不到什么"的假设。随着模型能力提升，这些假设可能过时。
**Opus 4.6 发布后**（更强的规划能力、更长的上下文、更可靠的代码审查），作者采用更系统的方法：每次只移除一个组件，观察对最终结果的影响。
去掉 sprint 结构：Opus 4.6 已经能原生处理任务拆解，不再需要这种额外拆解。但 planner 和 evaluator 仍然保留——没有 planner 时 generator 会明显低估 scope；evaluator 在 generator 能力边界附近的任务中仍然能捕捉大量有意义的问题。
**数字音频工作站（DAW）实验：**
| Agent & Phase | Duration | Cost |
|--------------|----------|------|
| Planner | 4.7 分钟 | $0.46 |
| Build Round 1 | 2h 7min | $71.08 |
| QA Round 1 | 8.8 分钟 | $3.24 |
| Build Round 2 | 1h 2min | $36.89 |
| QA Round 2 | 6.8 分钟 | $3.09 |
| Build Round 3 | 10.9 分钟 | $5.88 |
| QA Round 3 | 9.6 分钟 | $4.06 |
| **Total V2 Harness** | **3h 50min** | **$124.70** |
Generator 在没有 sprint 拆解的情况下连续稳定运行了两小时以上——这是 Opus 4.5 当初做不到的。但 QA agent 仍然发现了功能缺口：录音只是空壳按钮、clip 无法拖动、效果器可视化仍只是数字滑杆。
最终应用具备了一个可用音乐制作程序的核心部件：浏览器内 arrangement view、mixer、transport，以及通过 prompting 拼出完整歌曲的能力。

## 关键经验
1. **亲自试验模型，读 traces，围绕想要的结果调优**
2. **把问题拆解并为不同方面配置专门 agent**，往往能挖出额外提升空间
3. **新模型发布时重新审视现有 harness**：剥掉不再承重的部分，加入新的组件去实现以前做不到的能力
> 随着模型进步，"有趣的 harness 组合空间"并不会缩小。它只是会迁移。而 AI 工程师真正有趣的工作，就是持续去找到下一个新颖的组合方式。

## 深度分析
本文是 Anthropic 关于 AI Agent harness 工程的实战复盘，核心贡献在于展示了"主观任务如何通过结构化评估变得可优化"。这一洞见对整个 agent 领域有广泛意义。
**Generator-Evaluator 架构的普遍性**：作者从 GAN 获得灵感，但实际构建的是一个更接近"生成-评审"的软件工程工作流，而非真正的对抗训练。GAN 中 generator 和 discriminator 共同训练、共享梯度；而在本文设置里，evaluator 是一个独立的、经过调优的 agent，不参与 generator 的参数更新。这实际上是一种"外部反馈回路"，其有效性依赖于 evaluator 的评分标准设计质量，而非对抗优化。
**Context reset vs. compaction 的取舍**：文章清晰地辨析了两种上下文管理策略的差异。Compaction 保留了连续性，适合短中期任务；reset 提供干净起点，但增加协调成本。Opus 4.5 的上下文焦虑问题在 4.6 被部分缓解，说明模型层面也在适应更长上下文场景。这个趋势意味着 harness 设计者需要持续跟踪模型能力变化，及时移除过时的"补偿性"设计。
**主观评估的量化转译**：四个评分维度（design quality、originality、craft、functionality）的设计体现了将模糊标准操作化的思路。关键洞察是：权重设置会反向影响 generator 的行为——提高 design quality 和 originality 权重会惩罚"安全产出"，迫使模型承担审美风险。这说明在构建 agent 系统时，"评估函数的设计就是系统行为的塑造"。
**Harness 的生命周期管理**：文章描述了一个值得关注的工程实践——在新模型发布后用"单组件移除法"验证每个组件的必要性。这是一种系统化的技术债清理机制，避免 harness 随模型能力提升而变得冗余复杂。

## 实践启示
1. **对于主观任务，先建立评分标准再设计 harness**：没有可操作的评分标准，就没有稳定的 evaluator，也就没有可靠的反馈回路。从具体的、可描述的设计原则入手，而非"让它做得好一点"。
2. **在长任务中预设 context reset 节点**：即使当前模型上下文窗口足够大，也应该在架构层面设计 reset 能力。上下文焦虑是模型层面的行为特征，不完全可预测，提前设计 reset 可以防止极端情况下的任务失败。
3. **每 1-2 个模型版本做一次 harness 组件审计**：组件的必要性随模型能力变化。Opus 4.6 移除了 sprint 结构但保留了 planner 和 evaluator，说明某些组件是补偿模型短板的，过时后应移除以降低成本。
4. **Evaluator 的调优优先级高于 Generator**：在同等工程时间内，优化 evaluator 的评分准确性（通过 few-shot examples、硬性阈值）带来的系统提升往往超过优化 generator 的提示词。
## 相关实体
- [Anthropic 14 Skill Patterns Best Practices](../ch01-677-anthropic)
- [Anthropic 官方生产级 Agent 最佳实践12 个可复用的 Mcp 设计模式](../ch01-677-anthropic)
- [Tencent Skill Writing Complete Playbook Jackjchou](../ch04-118-鹅厂-skill-写作完整-playbook-14-章节-end-to-end-实战-工程化评估-腾讯一线踩坑)
- [Anthropic 12 Mcp Production Patterns](../ch01-677-anthropic)
- [Anthropic Dreaming Claude Managed Agents Ovz5V7Jjkqdksu9Xmxwt8W](../ch01-677-anthropic)

---

