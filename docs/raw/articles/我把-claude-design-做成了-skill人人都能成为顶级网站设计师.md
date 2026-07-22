---
title: 我把 Claude Design 做成了 Skill，人人都能成为顶级网站设计师
source_url: https://mp.weixin.qq.com/s/sffWcLKPkXob2STrhkYBYg
publish_date: 2026-05-09
tags: [wechat, article, claude, agent, harness]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: d2b5d65626a0e8bf7951bf4af6bd57dce5a654d6ec7e8a9479098f15b894df8e
---
# 我把 Claude Design 做成了 Skill，人人都能成为顶级网站设计师
##  一、Claude Design 是什么？
2026 年 4 月 17 日，Anthropic 发布了 Claude Design。
这个产品上线当天，Figma 股价大跌。
Claude Design 由 Opus 4.7 驱动，提供给 Pro、Max、Team、Enterprise 订阅者使用。
它的界面很简洁：左边聊天，右边画布。
你描述你想要什么，它就在右边画出来。
你可以通过对话、行内评论、直接编辑、甚至它自动生成的调节滑杆去反复修改。
听起来像一个 "AI 版 Figma" ？
Anthropic 设计团队的 Ryan Mather 发推说了一句关键的话：
> 不要用对待画布工具的方式来用 Claude Design，它更像 Claude Code。
这句话是理解 Claude Design 的关键。
传统设计工具的逻辑是 —  ** 人在画布上操作，AI 辅助加速  ** 。
Claude Design 反过来 —  ** AI 是主要的生成者，人是主要的审阅者  ** 。
这个区别落到产品上，产生了几个具体差异。
** 第一，输出是可运行的代码。  **
链接可以点，标签可以切，版本可以 DIFF。这跟 "生成一张漂亮的 UI 图" 完全是两码事。
** 第二，它理解你的代码库。  **
你上传代码库之后，它会读组件结构、框架模式、文件组织。
** 第三，它会主动提问、给多方案、自检自纠。  **
整套协作模式跟以前任何设计工具都不一样。
Ryan Mather 一个人同时负责 Anthropic 的 7 条产品线。这在两个月前不可能。
有团队反馈说，以前在别的工具里需要 20 多轮提示才能搞定的复杂交互，在 Claude Design 里 2 轮就搞定了。
用这个工具和直接用 Claude Code 编写网页有啥区别呢？
其实关键的变量还是：  ** 提示词工程  ** 。
Claude Design 之所以强，一半归功于 Opus 4.7 的模型能力，另一半归功于那套精心设计的系统提示词。
Claude Design 发布不到 24 小时，安全大佬 Pliny the Liberator 就在 X 分享它的完整系统提示词。
接下来我们就来仔细拆解这套提示词，到底有哪些是我们值得借鉴的地方。
* * *
##  二、拆解 Claude Design 的系统提示词
Claude Design 的系统提示词大约 420 行，信息密度极高。我们把里面最核心、最有价值的设计理念提炼出来，逐一解读。
###  2.1 角色定位：设计师 + 工匠 + 产品经理
> You are an expert designer working with the user as a manager. You produce design artifacts on behalf of the user using HTML.
开头第一句，定义了一个非常精妙的协作关系：  ** AI 是设计师，用户是产品经理  ** 。
注意它没有说 "你是一个 AI 助手"。它说 "你是一个专家设计师，用户是你的经理"。
这个微妙的角色倒转带来两个效果：AI 会更主动地做决策（设计师该有的判断力），同时会在关键节点征求用户意见（向经理汇报）。
紧接着下一句也很关键：
> HTML is your tool, but your medium and output format vary. You must embody an expert in that domain: animator, UX designer, slide designer, prototyper, etc.
HTML 是工具，但你的身份要随任务切换。做动画时你是动效设计师，做原型时你是 UX 设计师，做幻灯片时你是 Deck 设计师。这意味着 AI 不会用"做网页"的思维去做一切——比如不会给幻灯片加导航栏，不会给动画加页脚。
很多人写提示词时，角色定义停留在 "你是一个前端开发者"。
Claude Design 告诉我们：  ** 好的角色定位应该是动态的  ** — 根据具体任务切换专业身份。
* * *
###  2.2 工作流：先问后做，尽早出活
Claude Design 定义了一套六步流程：
1. 理解需求（问清楚再动手）
2. 探索现有资源
3. 制定计划
4. 搭建文件结构
5. 完成并验证
6. 极简总结
这里面有两个值得注意的细节。
** 第一个：什么时候问，什么时候直接做？  **
提示词明确给出了判断标准：
>   * make a deck for the attached PRD → ask questions
>   * make a deck with this PRD for Eng All Hands, 10 minutes → no questions; enough info was provided
>   * turn this screenshot into an interactive prototype → ask questions only if intended behavior is unclear from images
>
这套判断逻辑背后的原则是：  ** 信息充足就干活，信息不足才提问  ** 。
这听起来很常识，但绝大多数提示词做不到这一点——要么永远先问一大堆，要么从不提问直接硬干。
Claude Design 还给出了提问的具体建议：至少问 10 个问题、提供多选和自由输入的选项、覆盖变体方向、视觉偏好等。
** 第二个：极简总结的要求。  **
> Summarize EXTREMELY BRIEFLY — caveats and next steps only.
只说注意事项和下一步，不赘述自己做了什么。
这个原则同样精辟 — 代码已经在那里了，你为什么还要用文字复述一遍你做了什么？
* * *
###  2.3 去除 AI 味的秘诀
这是整份提示词中我认为最有价值的部分之一。
Claude Design 给出了一份明确的 "避免 AI 味的清单"：
* 不要过度使用渐变背景
* 不要随便使用 Emoij
* 不要用带左侧彩色边框的圆角卡片
* 不要用 SVG 硬画复杂图形（用占位符，索取真实素材）
* 不要用烂大街的字体：Inter、Roboto、Arial、Fraunces、system-ui
* 不要堆砌无意义的数据和图标（"data slop"）
这份清单堪称一面照妖镜。
回想一下你见过的 AI 生成网页 — 是不是清一色的紫粉蓝渐变、Inter 字体、大圆角卡片、emoji 充当图标、假数据满天飞？
这些元素单独看都没什么问题，但当 AI 反复使用它们，就形成了一种强烈的"AI 味"。
就像一篇文章通篇 "此外"、"值得注意的是"、"综上所述"、"不是xxx、而是 xxx"，你一眼就知道是 AI 写的。
Claude Design 通过显式列出这些雷区，强迫 AI 跳出舒适区。
与之配套的还有一个字体推荐表——重点放在 "你绝对不要用什么字体"，同时提供更好的替代选择。
比如推荐 Plus Jakarta Sans、Space Grotesk、Sora、Newsreader 等相对小众但品质出色的字体。
###  2.4 oklch 色彩系统：有理论支撑的配色策略
> Color usage: try to use colors from brand / design system, if you have one. If it's too restrictive, use oklch to define harmonious colors that match the existing palette. Avoid inventing new colors from scratch.
提示词的配色策略分三层：
1. 优先用品牌色
2. 不够用时，用 oklch 色彩空间派生和谐的衍生色
3. 绝对不要凭空发明新的色相
为什么是 oklch？
传统的 HSL 色彩空间有个致命缺陷：  ** 感知不均匀  ** 。
同样的亮度值，黄色看起来比蓝色亮得多。
这导致 AI 用 HSL 随机生成的配色经常看起来不和谐——技术上"正确"，视觉上却刺眼。
oklch 是一个  ** 感知均匀的色彩空间  ** 。
在 oklch 中，相同的亮度值代表人眼感受到的相同亮度。
这意味着你只需要保持亮度（L）和色度（C）不变，改变色相角（h），就能自动得到和谐的色彩搭配。
* * *
###  2.5 内容原则："一千个 No 换一个 Yes"
> Do not add filler content. Never pad a design with placeholder text, dummy sections, or informational material just to fill space. Every element should earn its place.
> One thousand no's for every yes.
这句话出自乔布斯。用在这里恰如其分。
AI 做设计时有一个根深蒂固的倾向：  ** 填满空间  ** 。
给它做一个落地页，它恨不得塞进 hero、特性介绍、客户评价、数据展示、FAQ、联系方式 …… 全都有，但是全都很平庸。
Claude Design 的应对策略很直接：
* 每个元素必须证明自己存在的理由
* 想加内容？先问用户
* 页面看起来空？那是布局问题，用版式和留白解决，不是靠塞内容
这背后的设计哲学是：  ** 留白也是设计  ** 。一个大胆的留白，比十个平庸的板块更有表现力。
* * *
###  2.6 验证闭环：不信任自己的输出
Claude Design 的验证机制非常严谨：
1. 完成后调用  ` done  ` ，展示给用户并检查控制台错误
2. 如果有错误，修复后再次调用  ` done  `
3. 确认无误后，调用  ` fork_verifier_agent  ` — 启动一个独立的子代理，在自己的 iframe 里做全面检查（截图、布局、JS 探测）
注意第三步：它会 fork 出另一个独立的 Agent 来做检查，避免 "自己审自己" 的确认偏误。
这里和我们之前分享过的 Claude Code 在 Harness 上的实践有同样的理念。
AI 检查自己的输出时，容易陷入"确认偏误" — 它倾向于认为自己做得没问题。
用一个全新的上下文来做验证，能有效打破这种偏误。
* * *
###  2.7 其他亮点速览
** 上下文管理：  ** 提示词引入了  ` snip  ` 工具，允许 AI 标记已完成的对话段落为"可删除"。当上下文压力增大时，这些段落会被移除，腾出空间。这解决了长对话中上下文窗口溢出的问题 — AI 会主动 "忘掉" 不再需要的信息。
** PPT编号规范：  ** 提示词特别强调PPT编号必须是 1-indexed（从 1 开始），并解释原因 — "人类不会说第 0 张幻灯片"。这个细节看似琐碎，但它反映了一个重要原则：  ** AI 的输出应该适配人类的思维模型，而非机器的实现细节  ** 。
** 设计系统先行：  ** 在写第一行代码之前，AI 必须先定义设计系统 — 配色方案、字体、间距、圆角、阴影、动效风格。把这些 Token 化的决策前置，能有效保持全局一致性。这也是专业设计师的标准做法。
** Tweaks 面板：  ** 这是一个聪明的 UI 模式 — 在设计中内置一个可调参面板，让用户实时切换配色、字体、间距等参数。它把"选择"的权力交给用户，同时降低了沟通成本。
* * *
##  三、把 Claude Design 的精华提炼成 Skill
###  3.1 为什么要做这个 Skill？
Claude Design 是 Anthropic 的商业产品，基于 Opus 4.7 驱动，功能强大，但是有几个问题：
* 国内用户使用困难（最大的问题，花园老师已经被封了三个账号了，彻底放弃官方渠道了...）。
* 没有 API，你无法把它集成到自己的工作流中。
* 封闭性，你不能自定义它的行为逻辑。
但它的系统提示词暴露了一个事实：
** Claude Design 的核心竞争力，很大程度上来自那套精心设计的 Prompt Engineering  ** 。
Opus 4.7 的模型能力是基础，但让它稳定输出高水平设计的，是那 420 行提示词。
这意味着我们可以做一件事：把这套提示词的核心理念提炼出来，封装成一个可复用的 Skill，应用到 Codex、Curosr 或其他支持 SKILL 的工具中。
这就是  ` web-design-engineer  ` Skill 的由来。
* * *
###  3.2 Skill 的设计思路
我的 Skill 约 400 行，结构如下：
** 1\. 角色定义  **
    此技能将 Agent 定位为顶尖的设计工程师，可以创造优雅、精致的 Web 作品。  
    核心理念：目标直指"惊艳"，远超"能用"的底线。每个像素都有意义，每个交互都经过深思熟虑。  
继承了 Claude Design 的动态角色切换思路 — 根据任务自动变身为 UX 设计师、动效设计师、数据可视化专家。
** 2\. 六步工作流（改良版）  **
我在 Claude Design 的基础上做了调整：
步骤  |  Claude Design  |  我的 Skill
---|---|---
第一步  |  理解需求  |  理解需求（附带详细的提问/不提问场景判断表）
第二步  |  探索资源  |  获取设计上下文（分四个优先级）
第三步  |  计划  |  ** 动手前先宣告设计系统  ** （要求用 Markdown 列出所有设计决策）
第四步  |  搭建文件  |  ** 尽早展示 v0 半成品  ** （带假设和占位符的最小可展示版本）
第五步  |  完成  |  完整构建
第六步  |  总结  |  验证
重点说说第三步和第四步。
** 第三步：宣告设计系统。  **
Claude Design 的提示词里提到了设计系统，但没有强制要求在编码前用自然语言宣告出来。
我加了这个约束。
原因很简单：如果 AI 在脑子里默默决定了配色方案然后开始写代码，你第一次看到的就是一个完整的页面。
此时如果方向错了，推翻重来的成本很高。提前宣告出来，用户可以在动手前就纠偏。
* * *
** 第四步：v0 半成品策略。  **
灵感同样来自 Claude Design 的 "show file to the user early" 理念，但我把它提炼成了更明确的方法论。
v0 包含核心结构 + 配色字体 token + 关键模块占位，不包含内容细节和完整组件库。
带假设和占位符的 v0，比花 3 倍时间打磨出来的 "完美 v1" 更有价值 — 后者一旦方向错了就要全推翻。
* * *
** 3\. 反 AI 味清淡（扩展版）  **
在 Claude Design 的基础上，我补充了更多条目：
* 千篇一律的渐变按钮 + 大圆角卡片组合
* 凭空编造的客户 logo 墙、虚假的好评数
* 无意义的 stats / 数字 / 图标堆砌
同时明确了 emoji 的使用规范：
> 默认不用 emoji。只有当目标设计系统/品牌本身就用 emoji 时才使用。
没图标时用占位符 — 拿 emoji 当 icon 替身是一种敷衍。
* * *
** 4\. 占位符哲学  **
这是我在 Claude Design 基础上提炼出的一个完整方法论：
    没有图标、图片、组件时，画占位符比硬画假图更专业。  
    - 图标缺失 → 方块 + 标签（如 [icon]、▢）  
    - 头像缺失 → 首字母圆形色块  
    - 图片缺失 → 带 ratio 信息的占位卡  
    - Logo 缺失 → 品牌名文字 + 简单几何形  
    占位符传递的信号是"这里需要真材料"。  
    假图传递的信号是"我糊弄完了"。  
** 5\. 配色 × 字体配对参考表  **
这是完全新增的内容。我提供了几套经过验证的视觉风格起点：
风格  |  主色  |  字体组合  |  适用场景
---|---|---|---
优雅杂志风  |  oklch 暖棕  |  Newsreader + Outfit  |  内容平台、博客
高端品牌  |  oklch 近黑  |  Sora + Plus Jakarta Sans  |  奢侈品、咨询
活泼消费  |  oklch 珊瑚  |  Plus Jakarta Sans + Outfit  |  电商、社交
极简专业  |  oklch 青蓝  |  Outfit + Space Grotesk  |  数据产品、B2B
手作温度  |  oklch 焦糖  |  Caveat + Newsreader  |  餐饮、教育
这些配对的核心逻辑是：给 AI 一个有品位的起点，比让它自由发挥好得多。
当用户没有提供任何设计上下文时，AI 从这些经验证的组合出发，比默认的 Inter + 蓝色按钮好上几个档次。
* * *
** 6\. 技术硬规则  **
继承了 Claude Design 的三条绝对不能违反的规则：
1. 禁止  ` const styles = {...}  ` ——多组件环境中的全局样式对象命名冲突是个真实的坑。
2. 跨 babel 脚本不共享作用域——必须显式挂到  ` window  ` 上。
3. 禁止  ` scrollIntoView  ` — 在 iframe 嵌入环境中会破坏外部滚动。
这些都是被真实 bug 验证过的规则，每一条都有具体的技术原因。
* * *
** 7\. 附赠的高级模式库  **
Skill 附带一个  ` references/advanced-patterns.md  ` 文件，包含：
* 响应式幻灯片引擎模板
* 设备模拟框架（iPhone / 浏览器窗口）
* 动画时间线引擎
* 设计画布（多方案对比）
* oklch 色彩系统代码
* Chart.js 数据可视化模板
这些模板的定位类似于 Claude Design 的  ` copy_starter_component  ` — 给 AI 提供高质量的起点脚手架，而非让它从零开始手搓。
##  四、实战对比：Skill 到底带来了多少提升？
说了这么多理论，到底有没有用？
我用同一个提示词，分别在有 Skill 和没有 Skill 的情况下生成了两个页面，来看看实际效果。
注：以下测试使用的环境是 Cursor + Claude Opus 4.7
* * *
###  4.1 DEMO 1：太空探索博物馆
** 提示词（完全相同）：  **
> 帮我做一个 "太空探索博物馆" 的线上展览首页。这是一个虚构的博物馆，专门展示人类太空探索的里程碑。页面需要包含：一个震撼的全屏 Hero 区域、4 个核心展览介绍（如 "登月时代"、"空间站生活"、"火星计划"、"深空探索"）、一个时间线展示人类太空探索大事记（至少 6 个节点）、参观预约 CTA 区域、页脚。整体风格要沉浸感强、有宇宙的深邃感。
####  无 Skill 版本
模型（Claude Opus 4.7）本身已经很强。
无 Skill 版本用了 Orbitron + Noto Serif SC 的字体组合，有 Canvas 星空背景、CSS 绘制的行星、轨道环、流星动画。
整体观感已经很不错了 — 深色背景、发光效果、渐变文字，太空感是有的。
但仔细看，有几个典型的"AI 设计"痕迹：
1. ** 配色偏向 AI 默认审美。  ** 青色（ [ #7cf0ff ](<>) ）、紫色（ [ #b388ff ](<>) ）、粉色（ [ #ff7ad4 ](<>) ）这套三色渐变组合，在 AI 生成的太空主题网页中非常常见。不是不好看，是太常见了。
2. ** 字体选择偏传统。  ** Orbitron 是一个非常"直觉"的太空字体选择 — 几乎所有 AI 做太空主题都会用它。辨识度不够。
3. ** 布局相对标准化。  ** Hero → 卡片网格 → 时间线 → CTA → 页脚，是一个教科书式的落地页结构。安全，但缺少惊喜。
4. ** 视觉效果靠堆砌。  ** 大量 box-shadow 发光效果、多层渐变背景、CSS 行星动画 — 视觉冲击有，但设计感不够克制。
####  有 Skill 版本
带 Skill 的版本，差异在几个层面上体现出来。
** 配色体系完全不同。  ** 用了 oklch 色彩空间定义整套色彩系统 —  ` var(--ink)  ` 是  ` oklch(0.10 0.015 250)  ` ，  ` var(--ember)  ` 是  ` oklch(0.78 0.13 65)  ` 。整个色彩方案更加克制和高级，没有浓烈的霓虹感，取而代之的是一种接近杂志印刷品质的深沉色调。
** 字体选择更考究。  ** Instrument Serif + Space Grotesk + JetBrains Mono 三件套。Instrument Serif 的衬线字做大标题，有杂志编辑质感；Space Grotesk 做正文，技术感但不冰冷；JetBrains Mono 做辅助信息（坐标、编号），自带科技叙事。
** 排版手法更成熟。  ** 标题用了文字逐行入场动画（  ` rise  ` keyframe），每行有微妙的延迟差。Hero 区域底部有一条信息栏 — 左侧坐标数据、中间描述性文案、右侧行动按钮 — 用 grid 三栏布局分配。这种编辑感的排版方式很明显受到了高端杂志和设计工作室网站的影响。
** 细节更精致。  ** 导航栏 logo 是三个同心圆 + 一个 ember 色小圆点（用 CSS  ` ::before  ` 和  ` ::after  ` 实现），有天体轨道的隐喻。页面右上角有一组实时坐标数据（  ` ISS — LIVE TELEMETRY  ` ），作为装饰性信息元素。整个页面用  ` clamp()  ` 做流式排版，间距全部用 CSS 自定义属性管理。
** 最关键的区别：克制感。  ** 无 Skill 版本的设计语言是"把所有酷炫的效果都用上"。有 Skill 版本的设计语言是"每个元素都经过取舍"。前者像一个热情的初级设计师，后者像一个有经验的设计总监。
###  4.2 DEMO 2：独立摄影师个人网站
第二个测试更能说明问题，因为提示词非常简洁：
> 帮我做一个独立摄影师的个人作品集网站首页。
仅此一句。这考验的是 AI 在信息极度匮乏时的自主决策能力。
####  无 Skill 版本
首先是无 Skill 版本，发完提示词就直接开干了：
这次没有了足够的背景信息，虽然效果还不错，但 AI 味就有点重了：
1. 烂大街的深色霓虹调性 背景用纯黑或深灰，再用青蓝色或紫粉色的高饱和度发光阴影勾勒边框和文字。这是 AI 最常用的手段。
2. 卡片和导航栏大量使用半透明背景。
3. 文案里强行塞满“潜空间、创成式、算力、硅基、参数”等词汇，看起来高端但缺乏人味，失去了摄影师原本“慢、真、自由”的情感内核”的情感连接情感”的真实质感。
####  有 Skill 版本
有 Skill 版本最首要的区别就是它没有直接开干，而是向我询问了几个关键问题：
然后再看看最终实现的效果：
它虚构了一个名为 Mira Høst 的北欧摄影师，为她设计了一整套视觉系统：
* ** 配色：  ** 暖色纸张底色（  ` --paper: [ #f2efe8 ](<>) ` ）+ 深色墨色（  ` --ink: [ #161513 ](<>) ` ）。整个色盘只有两个极端加上它们之间的灰调，极度克制。
* ** 字体：  ** Instrument Serif（展示标题）+ Space Grotesk（界面元素）。Instrument Serif 的斜体被大量用于营造优雅感。
* ** 布局语言：  ** 杂志编排式的。左右两侧有固定的竖排文字（"Issue 07 · MMXXV" 和 "© Mira Høst Studio"），用  ` mix-blend-mode: difference  ` 确保在深浅背景上都可读。
* ** Hero 处理：  ** 使用 Unsplash 的风景照片，叠加了电影感的渐变蒙版和胶片噪点纹理。照片有一个极慢的 Ken Burns 动画（24 秒一个周期），模拟胶片放映机的缓慢推移。
* ** 导航设计：  ** 没有传统的导航栏，用了一个  ` mix-blend-mode: difference  ` 的顶部信息条，在深色 Hero 和浅色正文之间无缝过渡。
整个页面从上到下，有一种翻阅高端摄影画册的感觉。每个板块之间用编号（01、02、03...）和 eyebrow 文字分隔，像杂志的章节标记。照片的展示使用了不对称的网格布局，刻意打破整齐感。
* * *
###  4.3 对比的结论
需要强调的是：  ** 无 Skill 版本已经很好了。  **
Claude Opus 这个级别的模型，裸跑出来的网页也远超多数人的手写水平。
色彩搭配和谐、布局合理、代码规范、交互完整。
Skill 带来的提升，打个比方：无 Skill 版是一个 85 分的好学生作品，有 Skill 版是一个 95 分的设计师作品。
从"好用"到"好看"，从 "完整" 到 "精致"，从 "合格" 到 "有风格"。
这 10 分的差距，恰恰来自 Skill 里那些看似琐碎的约束和引导 — 不用 Inter、用 oklch 配色、先宣告设计系统、克制内容填充、用高品质字体配对做起点。
每一条规则的效果可能微小。但叠加在一起，量变产生质变。
##  五、附录
###  获取 Skill
Skill 的完整代码、原始参考的 Claude Design 的提示词、几个 DEMO 网站，我都已经打包到一起开源了。
https://github.com/ConardLi/web-design-skill
大家需要的自取：https://github.com/ConardLi/web-design-skill
* * *
##  最后
最后推荐下我的 Easy Agent 开源项目。
https://github.com/ConardLi/easy-agent
目标是在这个过程中和大家一起学习 Claude Code 的 Harness 是如何做的，然后从零编写一个 Agent。
最终完整跟下来的同学都能具备从零开发企业级 Agent 的能力。
如果你也在尝试从传统领域到 AI Agent 开发的转型，这个项目不容错过呀 ...
仓库在这：https://github.com/ConardLi/easy-agent
目前已经完成了前面 16 个阶段的开发，每个章节的详细教程会在《AI秘密花园》星球同步更新。
如果有需要大家可以订阅我的知识星球（公众号
* * *
文本用到的 Skill、Claude Design 原始提示词、DEMO 网站：https://github.com/ConardLi/web-design-skill
如果本期教程对你有所帮助，来个免费的点赞、收藏、关注吧，后续我会持续分享更多有价值的 AI 教程，感谢你的阅读 💗。