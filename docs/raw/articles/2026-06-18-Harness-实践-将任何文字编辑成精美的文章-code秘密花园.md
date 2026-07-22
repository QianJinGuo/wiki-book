sha256: e72946bb33e563e6bf2c377e03fc482f0c505b3a35695e4492ef68e18f70ee53
---

一篇普通的文字，变成有排版、有配色、有节奏感的精美文章。

不需要专业的设计师，只需要给 Agent 装上一个 Skill。

《Attention Is All You Need》逐层拆解 — 30 分钟的技术长文，Tufte 主题，数据墨水风格。

《深⼊解析 Codex 智能体循环》— Sottsass 主题，颜色碰撞，视觉效果拉满。

《提示词缓存对 Agent 有多重要？》— Bayer 主题，包豪斯三原色，几何感很强。

《Skill 是如何进化的？》— Freddie 主题，交互式学习体验。

大家好，欢迎来到 code秘密花园 ，我是花园老师（ConardLi）。

## 一、视频 Skill 的反馈

上一篇《  Harness 实践：让 Agent 自动制作知识讲解视频  》发出之后，收到很多反馈。

有同学说效果很惊艳，有同学说流程很清晰，但让我印象最深的是这类评论：

"这不只是一个 Skill，这是一套完整的工程方法。"

说得很对。

视频 Skill 之所以能稳定产出，就是因为它背后有一套精心设计的 Harness：

分阶段的执行编排、文件化的状态记忆、强制的人工检查点、独立的 Reviewer 质检、最小切片的修复机制。

这次，我想验证一个更重要的观点： 好的 Harness 是可以迁移的 。

今天我们用几乎同一套骨架，做一件完全不同的事 — 把任何文字编辑成精美的网页文章。

## 二、这次为什么做 Beautiful Article

### 2.1 从 Claude 的一篇博客说起

Claude 官方最近发了一篇文章，叫《The unreasonable effectiveness of HTML》。

https://claude.com/blog/using-claude-code-the-unreasonable-effectiveness-of-html

核心观点是：Markdown 写文章很简单，但面对复杂报告、图表、交互、视觉结构时不够用。

由于 AI 能力的增强，人们不用再关心复杂的语法时，HTML 的优势就很明显了：

- 信息密度高 — 表格、SVG、代码片段、公式可以混排；

- 视觉结构化 — 标题层级、颜色、间距都可以精确控制；

- 可交互 — 折叠、Tab、复制按钮、可调控件；

- 易分享 — 一个文件发出去，对方直接打开，不需要装任何东西。

### 2.2 但是：HTML 很强 ≠ 该让 AI 裸写 HTML

问题来了。HTML 很强，但这不意味着应该让 AI 自由裸写 HTML。

当内容很长、视觉元素很丰富的时候，让 AI 裸写 HTML/CSS 可能会遇到很多问题：

- 单文件巨大，后续很难做更改和维护

- 效果不可控，很难稳定按照你的要求产出内容

- 让文字失去 “文章” 感，看起来像网页应用

这和视频 Skill 的痛点是 相同的 — 模型有能力，但你需要一套系统来驾驭这个过程，下面看看这套流程是怎么设计的

## 三、Beautiful Article Skill

为此，我开发了一个全新的 Skill，叫 Beautiful Article 。

它也已经和花园老师之前开源的所有其他 Skill 一起发布到 Garden Skills 仓库里了：

https://github.com/ConardLi/garden-skills

### 3.1 执行流程：从素材到文章的 8 个 Phase

整个 Skill 把 "从任意素材到精美文章" 切成了 8 个阶段，中间卡了 3 个强制人工检查点。

Phase 0  Intake            判断是否进入本 Skill + 初步文章类型  
   ▼  
Phase 1  Source → Markdown URL/PDF/DOCX/MD/文本 → source.md + extraction-notes.md  
   ▼  
Phase 2  Editorial Planning 一份 plan.md（Brief / Outline / Theme / Assets 四段）  
   ▼  
Phase 3  Plan Checkpoint   ★Checkpoint 1 必须停  
   ▼  
Phase 4  First Spread      首屏 + 第一节 + 一个代表性视觉块  
         └ ★Checkpoint 2 必须停  
   ▼  
Phase 5  Full Article Build 生成完整网页文章  
   ▼  
Phase 6  Final Review      三视角终审  
   ▼  
Phase 7  Repair            最小切片修复  
   ▼  
Phase 8  Delivery          ★Checkpoint 3 必须停 → 交付 article.html

### 3.2 先认识底层：Reacticle 组件协议

这里需要注意的是，在上面的开发过程，Agent 编写的并不是原始的 HTML，而是一套我们特殊定制的底层组件协议，我们给它命名叫：

Reacticle = React + Article。

一句话定位：

Markdown 让 人 轻松写文章；

Reacticle 让 AI 可控地生成长文 HTML。

它给 AI 定义了一套专门用来写文章的、 被约束的、语义化的 React 组件契约 。

https://github.com/ConardLi/reacticle

三个关键设计

语义组件词汇表

Reacticle 提供了一组专门用于编写 “文章” 的组件，基本可以平替 Markdown 的所有语法：

Article / Hero / Lead / Section / Subsection / Table / Quote / Formula / CodeBlock / Image / TOC / Conclusion …

AI 只负责 "组合" 这些组件，结构和排版由库保证。

不需要 AI 去想 "这里用 div 还是 section"、"标题用 h2 还是 h3"、"间距设多少" — 这些全被组件封装掉了。

结果就是：稳定、不崩版。

Raw  自由层（受契约约束）

但只有组件会不会太死板？有些视觉效果组件做不了怎么办？

Reacticle 提供了一个逃生舱叫  Raw  。

任意 HTML/SVG/CSS/React 都能塞进  Raw

你想画一个自定义的时序图、做一个交互式的滑块、放一个 Canvas 动画，都可以。

但有一条硬约束：

Raw 里的所有样式必须消费我们约束好的主题 token 。

这样，我们给模型提供了自由的同时，还约束了各个主题效果的稳定性。

Reacticle 目前有 11 套编辑级主题：

每套主题都同时是 两份东西 ：

- 一份 CSS token 包 — 定义颜色、字体、间距、阴影等所有视觉变量；

- 一份给 AI 读的 Markdown — 告诉 AI 这套主题该用什么配图风格、什么代码高亮、什么 Raw 惯用法、什么是 反模式 。

比如 Tufte 主题的 profile 会告诉 AI：

"这个主题追求数据墨水比，不要用渐变、不要用阴影、图表要极简、正文是主角。"

https://rearticle.mmh1.top/#/gallery/caffeine-half-life

比如 Sottsass 主题的 profile 会告诉 AI：

"这是 Memphis 风格，可以用撞色、可以用黑描边、可以有轻微旋转的元素、但不要太正经。"

https://rearticle.mmh1.top/#/gallery/color-clash

Reacticle 和 Skill 的关系

Reacticle 是 运行时协议

类比乐高积木，管的是 "输出表面稳不稳"。

它不规定你怎么写作、怎么规划、怎么审阅。

怎么从素材规划、生成、审阅、交付 那套方法论和 Harness，住在  beautiful-article  Skill 里

类比拼装积木的说明书，管的是 "整个生产过程稳不稳" 。

这套流程背后还有一系列设计原则：

文件化记忆、渐进加载上下文、分节点质检、最小切片修复……。

我们放到实战之后再展开

到时候你会发现，它们和上一篇视频 Skill 的骨架几乎一模一样。

## 四、环境搭建

下面，我们来实际演示一下这个 Skill 的使用。

对于国内的同学，我依然优先推荐的是 MiniMax + Claude Code 这套组合。

### 4.1 Claude Code

首先我们选择 Claude Code 作为我们的核心执行 Agent。

注：如果你本地使用 Cursor、Codex 以及其他支持 Skill 的 Agent 都是可以的。

安装命令：

curl -fsSL https://claude.ai/install.sh | bash

装好之后，在终端里输入：

claude -v

可以测试是否正常安装成功。

### 4.2 MiniMax M3

这次我把模型换成了最新发布的 M3，当 Harnees 已经调教的非常好之后，选择一个能力强的模型就至关重要了。

MiniMax M3 号称首个 Coding Agentic 达到 SOTA、1M Context、原生多模态 三项能力兼备的模型。

这几个能力单独看都不新鲜，但放在实际的生产场景里组合起来就很关键了。

在我个人使用体验上，相比上一篇教程里用的 M2.7，M3 在长上下文理解和复杂指令的遵循上有明显提升。

对于我们这次这种多步骤、多检查点、需要反复回读文件的长任务场景，M3 是非常适合的。

依然推荐大家搭配 Token Plan 来使用，我自己现在使用的是 Max 极速版。

量大管饱速度快、天然契合 Claude Code，也不用担心封号风险，在一些场景下非常接近原生 Claude Code 的体验了。

订阅完成后，会生成一个 API Key ，这个提前存好后面会用到：

### 4.3 CC Switch

CC Switch 是一个桌面配置工具，可以让我们的 Agent（Claude Code、Codex、Gemini CLI）切换为任意的自定义模型。

在这套流程里，我主要用它来配置 MiniMax 的 Token Plan。

直接到它的 Github Release 页面就可以下载指定系统（如 MacOS）的安装包：

https://github.com/farion1231/cc-switch/releases/

点击右上角 ”+” ，选择预设的 MiniMax 供应商：

然后填写上一步保存的 API Key：

然后把模型名称全部改为  MiniMax-M3  ，然后直接点击保存就可以使用了：

回到首页，点击 “启用”：

下面，我们打开终端输入 claude ，就可以直接使用了：

### 4.4 安装 Skill

访问 garden-skills 仓库：https://github.com/ConardLi/garden-skills/，找到  beautiful-article  Skill，下载安装包：

下载完成后解压得到 Skill 具体目录，然后放进工作目录的  .claude/skills/  文件夹。

启动 Claude Code，输入  /beautiful-article  ，能智能提示出来就说明配置成功。

## 五、实战：把一篇文章编辑成精美网页文章

下面用 Claude Code + MiniMax M3 走一遍完整流程。

然后，我还是选一篇 Anthropic 的技术博客作为输入素材：

### 5.1 启动 Claude Code

进入项目目录，启动 Claude Code：

claude --dangerously-skip-permissions

老规矩，  --dangerously-skip-permissions  只在可信目录用。

### 5.2 投喂素材，启动 Skill（Phase 0–1）

把文章 URL 丢给它，告诉它用  /beautiful-article  ：

读取这篇文章：https://claude.com/blog/lessons-from-building-claude-code-prompt-caching-is-everything  
按照 /beautiful-article 要求，帮我产出一篇精美的中文文章。

Agent 在读取我们的 Skill 后，首先开始识别输入是什么、目标语言是什么、任务边界是什么。

比如这里它判断素材是一篇 Claude 博客文章，目标是中文文章，预期文章类型更接近  longform  ，也就是信息保留比较高的完整长文。

然后它抓到网页正文后，开始产出几个文件：

任务完成后，我们看到本地工作目录多了几份文件：

- source.md：原始素材的 Markdown 版本。无论输入是网页、PDF、文档还是一段文字，都会先被统一整理成这份文件，后面所有写作都以它为事实来源。

- source.zh.md：由于我们要做的是中文版，它会先产出一份地道翻译版  source.zh.md  作为事实底座，后续基于翻译版编写。

- extraction-notes.md：抽取记录。比如哪些图片没拿到、网页里哪些内容可能缺失、哪些地方存在格式或语义不确定性，都会记在这里，方便后面人工判断。

### 5.3 编辑规划（Phase 2）

接下来它会生成  plan/plan.md  ，分四段：

- Brief ：目标读者、文章类型、信息保留比例、语气、主要观点、阅读目标。

- Outline ：Hero / Lead / 各 Section 列表 / 每节保留哪些信息 / 每节需不需要 Raw/Table/CodeBlock/Formula。

- Theme ：推荐哪个主题 + 理由。

- Assets ：配图策略与逐图计划。

这份文件就是后面所有开发的边界 — 文件化工作记忆 。

### 5.4 第一次人工确认 · Plan Checkpoint（Phase 3）

这是第一个 必须停 的检查点。

它会逐项问你 5 件事（Agent 会根据原文的类型给你推荐最适合的选项， 但不会替你做决定）：

- 文章类型 + 信息保留比例

Skill 内置了几套完全不同的文章类型

- 完整长文  longform · ~100%  ：适合原文质量高、值得完整归档的材料，尽量保留全部论证，只做编辑和排版增强。

- 研究报告  full-report · ~80%  ：适合调研、技术评估、正式分析，重点是执行摘要、关键发现、数据、风险和建议。

- 教学步骤  tutorial · 80-100%  ：适合“跟着做就能跑通”的内容，步骤、代码、验收点不能丢。

- 概念解释  explainer · ~80%  ：适合把一个机制、系统、算法讲明白，保留关键直觉和易错点，删掉旁枝。

- 对话访谈  dialogue · ~80%  ：适合播客、访谈、AMA，把口语冗余删掉，但保留说话人的语气和观点。

- 工程审阅  review · 60-80%  ：适合 PR、方案、事故、架构设计这类具体产物审阅，重点是发现、证据、影响和行动项。

- 观点评论  essay · 60-80%  ：适合评论、评测、叙事和专栏，重点不是面面俱到，而是一条清晰的观点线。

- 决策摘要  briefing · 40-60%  ：给忙人看的，结论先行，只保留关键事实、取舍和下一步。

- 交互式解释  interactive-explainer · ~25% 原文摘录  ：不是简单删掉 75%，而是把原文重构成可操作的学习页，用交互演示帮读者真正玩明白。

这一步本质上是在问：你希望读者完整读完、快速判断、跟着做、理解一个机制，还是被视觉带着走？答案不同，后面生成出来的文章形态会完全不一样，我们这次选择 100% 保留的完整长文风格。

- 主题

这次我们不听它的，选择一个个性点的 Bayer 主题：

- 版式宽度

选项：narrow / regular / wide / full。我们选择默认的 regular。

- 配图模式

选项：none（不用外部图片）/ user-assets（你提供）/ placeholders（先用占位图）/ ai-generated（AI 生成）。

注意：这只决定是否使用外部  Image  组件，HTML 内容的绘制不受影响，我们选择不实用外部图片。

确认完这几件事，它会根据我们的决策修订开发计划：

然后才会进入下一阶段。

### 5.5 封面 + 首章开发（Phase 4）

它先用  scaffold.sh  起一个 Vite + React + TS 的工作区，从 npm 装最新版 Reacticle。

然后只做一小块： 封面 + 首屏 + 第一节 + 一个代表性视觉块 。

这一步不会写完整篇文章，而是先定调。

开发完成后，它不会立刻完成，而是开一个 First Spread Reviewer SubAgent 来质检：

所有质检的过程，它会写入  first-spread-review.md  文档。

然后按照 fail 项逐一进行修复：

然后，我们就可以人工验收了，这一步的人工验收很有必要，首屏和第一节基本决定了整篇文章的气质：

### 5.6 第二次确认（Checkpoint 2）

然后进入 Checkpoint 2 ，独立确认 2 件事：

- 验收结论

选项：这一步可以大胆提出你的建议，标题方向、信息密度、主题观感、正文节奏、视觉块风格，哪一点你觉得不舒服都可以让它先调整好。

如果这一步已经偏了，后面写得越多，返工成本越高。

- 后续开发模式

A · 单 Agent 顺序（最稳、风格最统一）

B · 多 Agent 并行（最快、考研模型能力）。

### 5.7 完整生成 · Full Build（Phase 5）

确认后进入完整生成，我们选的 B 并行模式，会有多个 SubAgent 并行开发：

我们可以切换每个 SubAgent 查看具体的开发详情：

这种多 Agent 调度对模型能力要求就很高了，M3 在这块的表现比较稳

能准确理解每个 SubAgent 的边界，不会出现" 两个 Agent 改同一个文件 "或" 忘了合并某个 Section"的情况。

然后我们可以看到工作区的文件结构：

一节一文件是 Skill 的 铁律 ，这是多 Agent 并行的前提，也让后续维护更容易。

### 5.8 终审 + 修复（Phase 6–7）

所有 Section 写完后，Skill 会指导开三个独立的 SubAgent 进行质检，维度各不相同：

- Editorial Reviewer ：文章性、信息取舍、结构

- Visual Reviewer ：主题、Raw、配图、移动端

- Technical Reviewer ：构建、控制台、代码/公式、可访问性

如果这一步检出问题，会进入 最小切片修复 。

所有审核 + 修复的记录，全部都会记录到本地文件，这些文件不是给你看的，而是给 Agent 看的：

这些日志可以促使后续 Skill 的自进化，让它知道在之前的任务中，什么环节容易出问题。

### 5.9 交付（Checkpoint 3 + Phase 8）

终审改完后，进入最后一个 必须停 的检查点。它会问你最终的交付决策：

选项：通过 · 导出 HTML / 通过 · 同时导出 HTML + PDF / 还有局部修复 / 先停一停。

确认后，它会帮我们同时构建出一个 CSS+JS 全内联的单文件 HTML（断网可打开、可当文件分享） ：

以及一个更方便分享的 PDF 格式，两者内容效果完全一致。

然后你会发现，原来普通的文字，现在是一篇视觉效果精美、结构清晰、可离线阅读、可直接分享的长文。

## 六、好的 Harness 是可以迁移的

跑完实战，我们回过头看。

在上一篇视频教程里，我们讲过一个成熟的 Harness 通常包含六个核心部分：

核心部分
它解决的问题

上下文管理
模型到底看到了什么

工具系统
模型到底能做什么

执行编排
模型下一步该做什么

状态与记忆
系统如何跨步骤保持连续性

评估与观测
系统怎么知道自己做得对不对

约束与恢复
出错了怎么办，怎么避免跑偏

现在把视频 Skill 和文章 Skill 放在一起对照：

你会发现设计上非常相似，下面我们逐层展开说一下：

### 6.1 上下文管理：每个阶段只看该看的东西

上下文管理解决的是：模型当前应该看到哪些信息。

Skill 不会在启动时把所有规范、主题、组件文档一次性塞进去。

- Phase 1 只处理素材抽取（  source-to-markdown.md  ）；

- Phase 2 再看文章类型（  article-types.md  ）、信息密度（  plan-template.md  ）和主题选择（  theme-selection.md  ）；

- Phase 4/5 进入开发后，才读取组件协议（  component-policy.md  ）、Raw 规范（  raw-policy.md  ）和当前主题 profile。

如果一开始就把所有文档灌进去，模型注意力会被严重稀释。

渐进加载让每个阶段只看该看的东西。

长会话里还有一个细节：

每写一节前，Agent 都要回看当前 Section 的任务、组件协议、Raw 规范和主题约束。

靠文件把自己拉回正轨，减少写到后面风格和规则会偏移的问题。

### 6.2 工具系统：让 Agent 把文件系统用稳

工具系统解决的是：模型能调用哪些能力，以及这些能力怎么被组织起来。

Skill 主要用的还是 Agent 自带的能力：抓取资料、读写文件、执行脚本、跑本地构建、打开浏览器预览。

关键在于，Skill 给这些能力套了一层稳定的工作区结构。

第一步，所有输入都会先整理成  source.md  。

URL、PDF、DOCX、Markdown、纯文本，最后都会回到同一份 source 文件上。

需要中文写作时，再生成  source.zh.md  ；

抽取过程中的风险、缺失和不确定项，写进  extraction-notes.md  。

第二步，进入开发阶段后，脚手架会创建标准的工作区。

source/  、  plan/  、  review/  、  article/sections/  、  article/raw-blocks/  都有固定职责，Agent 不需要临时发明项目结构。

第三步，是并行安全。

完整文章可能有很多节，如果开多个 Agent 并行写，每个 Agent 只负责一个  section  文件；

大型 Raw 放到独立的  raw-blocks/  ；

Article.tsx  只交给主 Agent 组装和排序。

这样多 Agent 可以同时工作，又不会一起改同一个文件。

每节内容彼此隔离，最后由主 Agent 合成一篇完整文章。

### 6.3 执行编排：先规划，再定调，再放量

执行编排解决的是：模型下一步该做什么。

视频 Skill 把 "文章→视频" 切成 4 阶段（内容编写 → 开发 → 音频 → 录屏），卡 2 个人工检查点（Plan / Audio）。

文章 Skill 把 "素材→文章" 切成 8 个 Phase，卡 3 个检查点（Plan / First Spread / Delivery）。

阶段数不同、检查点位置不同，但 骨架一样 ：

- 把一个复杂任务拆成线性流程，在关键节点强制停下来让人拍板。

- 先做小部分让人工确认基调和问题，再大刀阔斧的开发后续章节。l

还有一条铁律： 检查点禁止替用户做主 。

每个决策项必须独立列出、独立等用户答复。

可以推荐（"我推荐 Tufte 主题，因为这篇数据多"），但不能说"已经替你选了 Tufte，不对告诉我" — 后者等于偷渡默认值。

### 6.4 状态与记忆：关键决策必须落盘

状态与记忆解决的是：系统如何跨步骤保持连续性。

长任务里，Agent 很容易忘掉前面确认过的方向。所以 Skill 会把关键状态写进文件。

source.md  和  source.zh.md  是事实底座，  extraction-notes.md  记录抽取风险，  plan.md  记录文章类型、目标读者、信息保留比例、章节结构、主题和配图策略。

这些文件就是 Agent 的工作记忆。

写到后面的章节时，它不用凭印象回忆前面怎么定的，直接回读文件就行。

这样可以减少长会话里最常见的问题：前面确认过的方向，写着写着又变了。

### 6.5 评估与观测：审核要放在关键节点

评估与观测解决的是：系统怎么知道自己做得对不对。

这一层很关键，Agent 写完一节，很容易觉得“结构清楚、视觉不错、内容完整”，但真实问题可能藏在细节里：

信息保留比例不够、主题气质跑偏、Raw 只是装饰、移动端挤在一起、某节和前后文接不上...

所以文章 Skill 给几个关键产出都设置了质检点：

产出
质检重点

source.md
原文有没有抓完整，标题层级、表格、代码、引用有没有丢，翻译有没有改变术语和数字

plan.md
文章类型和信息保留比例是否匹配，Outline 有没有漏掉必须保留的信息，主题和配图策略是否合理

First Spread
首屏气质、标题方向、正文密度、主题观感、第一节节奏、代表性 Raw 是否成立

每个 Section
是否完成本节任务，信息保留是否到位，和前后节是否衔接，组件和 Raw 有没有乱用

Final Review
从内容、视觉、技术三个角度终审：文章是否顺、风格是否统一、移动端是否可读、构建和单文件 HTML 是否正常

为了平衡效率和质量，执行方式也有区分。

Plan 阶段上下文还热，由主 Agent 直接对照清单自查；

First Spread 和 Final Review 是关键节点，所有检查都使用独立的 SubAgent；

还有一条硬规则：拿到质检结论后，先修复，再汇报。

不能把 “发现了什么问题” 当成完成，真正完成的是 “问题已经被修掉”。

### 6.6 约束与恢复：给 AI 一个稳定的输出框架

约束与恢复解决的是：怎么避免跑偏，以及跑偏后怎么修。

文章 Skill 的核心约束是 Reacticle 组件协议。

AI 写文章时，正文用  Article / Section / Table / Quote / CodeBlock  这类语义组件承载；

复杂视觉放进  Raw  ，但 Raw 也必须消费主题的风格约束。

这样既有自由度，也能守住整体风格。

修复时依然保留了视频 Skill 的最小切片修复的思路。

某节信息太薄，就补那一节；某个 Raw 太花，就改那个 Raw；首屏气质不对，就改 Hero / Lead / Summary。

这能保护已经正确的部分，避免一次局部反馈把整篇文章重新搞坏。

### 6.7 自进化：让日志反过来改进 Skill

Skill 的自进化是最近的热点话题，我在设计这个新的 Skill 时也考虑了这个问题，怎么让 Skill 能越用越好呢？

我的做法是，所有关键点质检审查和修复记录会落到本地文件里

比如  review/first-spread-review.md  、  review/final-review.md  、  review/repair-log.md  。

这些文件不只给人看，也给 Agent 看。

同类任务跑多了以后，Agent 可以回看这些记录，分析之前哪些环节最容易出问题：

目录需要是不是容易写错，Raw 是否经常过度设计，某类文章类型的信息保留比例是否需要调整。

这些问题沉淀下来以后，就可以反过来促使 Agent 优化 Skill 的规则、检查清单和默认策略。

所以 Skill 会随着真实任务继续进化。

## 七、最后

### 7.1 升华一下

跑完这次实战，再回头看这套文章 Skill，会发现真正值得复用的不是某一段提示词，也不是某一个组件。

真正值得复用的是这套工作方法：

- 把复杂任务拆成阶段；

- 把关键决策变成检查点；

- 把上下文写进文件；

- 把输出表面收进协议；

- 把质量问题交给审核；

- 把修复限制在最小切片；

- 把审核和修复日志沉淀下来，反过来改进下一次流程。

这就是 Harness 的价值。

它让 Agent 从“能做出一次效果”，变成“能稳定生产一类结果”。

做 Harness 也不一定要从零搭一个 Agent。把一个垂直任务用 Skill 做稳、做好，本身就是在做 Harness。

今天这套流程用来把文章做成网页长文，换一个场景，也可以是：

- 周报 — 每周素材 → 结构化周报 HTML

- 播客 Shownotes — 音频转录 → 精美笔记

- 课程讲义 — 教案 → 可交互讲义

- 技术文档 — API Spec → 漂亮的开发者文档

- 产品发布页 — PRD → 单页展示稿

只要任务足够复杂，需要状态、流程、检查点和交付标准，这套骨架就有迁移价值。

最后留下来的，也不只是一个  article.html  。

还有一条被验证过的生产路径。

### 7.2 资源链接

- Reacticle：https://github.com/ConardLi/reacticle

- beautiful-article Skill：https://github.com/ConardLi/garden-skills

- Showcase / Gallery：https://rearticle.mmh1.top/#/gallery

- CC Switch：https://github.com/farion1231/cc-switch/issues

- MiniMax：https://platform.minimaxi.com/subscribe/token-plan

- Claude Code：https://claude.com/product/claude-code

欢迎拿一篇自己的文章试试。

如果本期教程对你有所帮助，留下一个免费的三连吧！