---
title: 精选 8 个 UI 设计师必备的 AI 智能体技能（Agent Skills）
source_url: https://mp.weixin.qq.com/s/9o-VhaqRtQRtge6q74K5TA
publish_date: 2026-05-09
tags: [wechat, article, claude, agent, openclaw]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 5464c10fa17b88e73ada385350ea999e9b4da9701583a21ada960b16607986ea
---
# 精选 8 个 UI 设计师必备的 AI 智能体技能（Agent Skills）
如果你在用 Claude Code 做设计，大概率遇到过这种情况，而且还不止一次。它写代码确实很强，但默认的思路更偏开发者，而不是设计师。让它做个落地页，功能是能跑的，但视觉上常常停留在「把  ` <h1> ` 做得比  ` <h2> ` 大一点」的水平。
没有合适的技能，Claude Code 很难真正理解设计语言。比如什么是「玻璃拟态（glassmorphism）」在代码里的落地方式，不同领域（健康、金融）该用什么配色，怎么搭配 Google 字体，什么时候该用骨架屏而不是加载圈，以及一个页面到底是「高端感」还是「偏大众」。
本文整理了  ** 8 个设计师值得安装的技能  ** ，可以当作一个最小工具集，把 Claude Code 从写代码的工具，变成真正能一起做设计的伙伴。
##  为什么要关注安装顺序
这些技能不是随便推荐的，我是按顺序排的，让每一个都建立在前一个的基础上。
技能 [ #1 ](<>) 先让 Claude 有设计感，技能 [ #2 ](<>) 让它用更合适的方式去实现，技能 [ #3 ](<>) 再给它一套现代组件库可以直接用，后面的也是在这个基础上往上叠加。
你当然可以一口气全部安装，但如果大概知道每个技能是干嘛的，用起来就会顺手很多。
##  1\. ui-ux-pro-max — 你的设计智能系统
这是最关键的一个。如果你只打算装一个，就选它。
` ui-ux-pro-max  ` 可以理解成塞进 Claude 里的一个「设计资料库」。它覆盖了常见的 UI 风格（比如玻璃拟态、极简、野兽派）、不同行业的配色方案、成套的字体搭配（还会解释为什么这样搭）、一整套 UX 规则（从点击区域到  ` z-index  ` ），以及常见的数据可视化类型。  ` React  ` 、  ` Vue  ` 、  ` Tailwind  ` 、  ` shadcn  ` 、  ` SwiftUI  ` 、  ` Flutter  ` 这些技术栈也都能配合用。
** 为什么值得装  ** ：有了它，你可以直接说一句  ` “做一个金融科技仪表盘”  ` ，Claude 就能很快给出一整套设计思路——配色、字体、风格方向，甚至会告诉你哪些坑要避开。相当于把「设计这一块」全给补齐了。
** 安装命令：  **
    npx skills add nextlevelbuilder/ui-ux-pro-max-skill@ui-ux-pro-max -g -y
** 开源地址：  **
    https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
###  ** 三步工作流程  **
** 步骤 1：先把设计系统跑出来  ** 。基本上新项目都从这一步开始。
    python3 skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness elegant" --design-system -p "Serenity Spa"
你会拿到一整套设计方向：比如玻璃拟态 + 柔和渐变、偏宁静优雅的风格、粉彩 + 鼠尾草绿 + 玫瑰金点缀、Cormorant Garamond + Lato 的字体组合，还有一份「别这么做」的清单（比如别用生硬阴影、霓虹色、过于激进的 CTA）。
** 步骤 2：按领域补细节  ** 。有具体方向之后，再去补某一块的细节。
    # 看 UX 细节  
    python3 skills/ui-ux-pro-max/scripts/search.py "animation accessibility" --domain ux  
    # 找字体替代方案  
    python3 skills/ui-ux-pro-max/scripts/search.py "luxury serif elegant" --domain typography
** 步骤 3：按技术栈落地  ** 。确定技术栈之后，再去拿对应实现方式。
    python3 skills/ui-ux-pro-max/scripts/search.py "layout responsive" --stack html-tailwind
###  💡 进阶技巧：把设计系统存下来
如果是多页面项目，不要每一页都重新生成一遍。直接把设计系统持久化下来：
    # 先建一套主设计系统  
    python3 skills/ui-ux-pro-max/scripts/search.py "SaaS fintech" --design-system --persist -p "FinDash"  
    # 给结账页加一层覆盖  
    python3 skills/ui-ux-pro-max/scripts/search.py "payment checkout secure" --design-system --persist -p "FinDash" --page "checkout"
这样会生成：
* •  ` design-system/MASTER.md  ` （全局规则）
* •  ` design-system/pages/checkout.md  ` （页面级覆盖）
之后直接跟 Claude 说：用  ` checkout.md  ` 做页面，没写到的地方就按  ` MASTER.md  ` 来。整体就会很干净，而且能一直保持一致。
##  2\. frontend-design — 官方设计模式
这是 Anthropic 自己做的前端设计技能，可以理解为一套「官方写法」：布局方式、组件结构、响应式处理，还有一整套现代 Web 的最佳实践。
** 为什么需要它  ** ：可以把它当成「标准答案」。  ` ui-ux-pro-max  ` 负责给方向（比如玻璃拟态 + 柔和渐变），而这个技能负责把这些想法按规范落地。比如更合理的 CSS Grid 布局、靠谱的响应式断点，以及在手机上不会崩的结构。
** 安装命令：  **
    npx skills add anthropics/skills@frontend-design -g -y
** 开源地址：  **
    https://github.com/anthropics/skills
当你在看 Claude 写的代码，觉得布局有点不对、响应式不太稳，或者只是想确认写法是不是主流做法的时候，用这个基本不会错。它和  ` ui-ux-pro-max  ` 是一前一后配合用的。
##  3\. shadcn-ui — 现代组件库
如果你最近用过 Linear、Vercel、Cal.com 这类产品，其实已经见过  ` shadcn/ui  ` 的风格了。它是目前很受欢迎的一套  ` React  ` 组件库，基于  ` Radix UI  ` 和  ` Tailwind CSS  ` 。这个技能主要就是教 Claude 怎么把它用对：主题、表单、数据表、命令面板这些都能直接上手。
** 为什么需要它  ** ：从零写一套仪表盘或者应用很慢，而  ` shadcn/ui  ` 本身就提供了一套好看、可访问、可定制的组件。这个技能的作用，是让 Claude 不只是「用上了组件」，而是能把它们调到符合你品牌风格，而不是停在默认样式。
** 安装命令：  **
    npx skills add giuseppe-trisciuoglio/developer-kit@shadcn-ui -g -y
** 开源地址：  **
    https://github.com/giuseppe-trisciuoglio/developer-kit
需要做更复杂的场景时，还可以再配合 Google 的那套技能一起用：
    npx skills add google-labs-code/stitch-skills@shadcn-ui -g -y
##  4\. web-accessibility — WCAG 合规
这个我会标成关键，不是因为「规范要求」，而是现在基本绕不开。很多企业项目默认就要 WCAG AA，一些行业（比如政府、医疗）甚至直接要求 AAA。抛开这些，无障碍本身就是更好的设计。
这个技能相当于给 Claude 一整套 WCAG 2.1 的检查能力：颜色对比、键盘操作、屏幕阅读器支持，还有该加的 ARIA 属性都会考虑到。
** 安装命令：  **
    npx skills add supercent-io/skills-template@web-accessibility -g -y
** 注意  ** ：如果找不到技能，可以使用下面的地址复制
    https://tessl.io/registry/skills/github/supercent-io/skills-template/web-accessibility
** 用法也很简单  ** ：上线前丢一句话就行：·  ` “帮我检查这个页面的 WCAG AA 合规性，并把问题修一下。”  `
它会把常见问题都过一遍：对比度够不够、有没有 alt 文本、表单标签是不是正确、键盘能不能正常操作、焦点是不是清晰，还有像  ` prefers-reduced-motion  ` 这种细节也会一起看。基本可以当成上线前的一次「无障碍自检」。
##  5\. web-design-guidelines — 设计规范检查
这是用得最多的一个技能。它是 Vercel Labs 官方做的，可以理解成一个「设计版 Linter」：会读你的代码，然后按最新的 Web 设计规范一条条检查。输出也很直观，直接标到  ` file:line  ` ，跟代码 Linter 一样。
** 为什么需要它  ** ：那种「上线后才发现间距不统一、按钮不符合规范、布局有点怪」的情况，其实很常见。这个技能就是在发布之前帮你把这些问题提前揪出来。相当于一次自动化的设计 review，而且用的还是最新规范。
** 安装命令：  **
    npx skills add vercel-labs/agent-skills@web-design-guidelines -g -y
** 开源地址：  **
    https://github.com/vercel-labs/agent-skills/tree/main/skills/web-design-guidelines
** 怎么用  ** ：写完页面或组件之后，直接让 Claude：  ` “按 Web 设计规范帮我检查这些文件”  ` 。它会把不符合的地方标出来，还带具体行号，照着改就行。
这个技能和无障碍检查（ [ #4 ](<>) ）很搭：先跑一遍 WCAG，再用这个补一轮设计规范检查，基本就把常见问题都覆盖了。
##  6\. ui-animation — 动效设计
动画这件事，很容易被忽略，但往往决定了一个产品是「还行」，还是「看起来很高级」。一些细微的交互、顺滑的过渡、滚动时自然的动效，这些就是拉开差距的地方。
这个技能基本把常用的动画方案都覆盖了：Framer Motion、GSAP、CSS 动画，还有像微交互、页面过渡、骨架加载（skeleton loaders）这些常见场景。
** 安装命令：  **
    npx skills add mblode/agent-skills@ui-animation -g -y
** 开源地址：  **
    https://github.com/mblode/agent-skills
它背后其实就是几条比较实用的原则：
* • 微交互尽量控制在 150–300ms
* • 多用弹簧（spring）来做动画，看起来更自然
* • 优先用  ` transform  ` 和  ` opacity  ` （别动  ` width  ` /  ` height  ` ，性能会很差）
* • 记得处理  ` prefers-reduced-motion  ` ，保证无障碍
什么时候用它？比如你想让 hover 有点「生命感」，页面切换更顺一点，引导流程更自然，或者在纠结用骨架屏还是 loading 动画时——基本都能用上。（一般来说，骨架屏更靠谱。）
##  7\. figma-implement-design — Figma 到代码
如果你平时主要在 Figma 里工作，这个技能基本是必备的。它是官方提供的 Figma → 代码工具，可以直接从 Dev Mode 里读取颜色、间距、字体这些设计信息，然后转成接近像素级还原的代码。
** 安装命令：  **
    npx skills add figma/mcp-server-guide@figma-implement-design -g -y
** 开源地址：  **
    https://github.com/figma/mcp-server-guide
** 怎么用  ** ：把 Figma 链接丢给 Claude 就行，比如：  ` “这是我的 Figma 链接：[url]，提取配色和字体，然后用 React + Tailwind 实现首屏”  ` 。它会把需要的设计信息都抓出来，再帮你写对应代码。
更好用的一种方式是和  ` ui-ux-pro-max  ` 搭配：你在 Figma 里做原型，用  ` ui-ux-pro-max  ` 先定好设计系统，然后把  ** 设计系统 + Figma 链接  ** 一起给 Claude。
这样一来，它一边从 Figma 提取具体细节，一边按你的设计系统来实现。如果两边有不一致（比如字体粗细用错了），它也能帮你发现。
##  8\. tailwind-design-system — Tailwind 模式
如果你在用 Tailwind（现在很多项目都是），这个技能挺关键的。它主要是帮 Claude 把 Tailwind 用「对」：间距怎么定、颜色怎么用、断点怎么设，还有组件该怎么组织，不至于越写越乱。
** 安装命令：  **
    npx skills add wshobson/agents@tailwind-design-system -g -y
** 开源地址：  **
    https://github.com/wshobson/agents
它适合用来搭设计系统、做可复用组件，也能把一些 Tailwind 的常见写法和习惯统一下来，让生成的代码更干净。
** 如果你用的不是 Tailwind（比如纯 CSS 或 CSS-in-JS），可以直接跳过  ** 。 这个技能就是为 Tailwind 工作流准备的。
##  快速安装：一次装齐 8 个
不想一条一条装？直接用这一段，一次搞定：
    # 核心设计智能  
    npx skills add nextlevelbuilder/ui-ux-pro-max-skill@ui-ux-pro-max -g -y  
    # 官方模式  
    npx skills add anthropics/skills@frontend-design -g -y  
    # 现代组件  
    npx skills add giuseppe-trisciuoglio/developer-kit@shadcn-ui -g -y  
    npx skills add google-labs-code/stitch-skills@shadcn-ui -g -y  
    # 无障碍性（关键）  
    npx skills add supercent-io/skills-template@web-accessibility -g -y  
    # 设计规范检查  
    npx skills add vercel-labs/agent-skills@web-design-guidelines -g -y  
    # 动画与打磨  
    npx skills add mblode/agent-skills@ui-animation -g -y  
    # Figma 集成  
    npx skills add figma/mcp-server-guide@figma-implement-design -g -y  
    # Tailwind 模式（如果使用 Tailwind）  
    npx skills add wshobson/agents@tailwind-design-system -g -y
整个过程大概几分钟。装完记得重启一下 Claude Code，让这些技能生效。
##  实战工作流：从概念到落地
我们用一个真实场景来走一遍——给一家高端水疗中心做一个落地页。
** 第一步：先把设计系统跑出来  **
    python3 skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness luxury elegant" --design-system -p "Serenity Spa"
你会拿到一整套设计方向：比如玻璃拟态、柔和粉彩、Cormorant Garamond + Lato，以及一份「别这么做」的清单（比如避免生硬阴影）。
** 第二步：搭页面结构  **
直接跟 Claude 说：
    用上面的设计系统做一个落地页：首屏（全高 + 柔和渐变）、3 列服务卡片（玻璃风格）、推荐轮播和 CTA。用 shadcn/ui。
这一步其实是多套技能在配合：布局走  ` frontend-design  ` ，组件用  ` shadcn-ui  ` ，样式由  ` tailwind-design-system  ` 统一。
** 第三步：接入 Figma（如果有设计稿）  **
把链接丢过去：
    这是 Figma 链接：[url]，提取首屏图、logo 和配色，然后把首屏对齐。
这一层主要是把视觉细节拉到更接近设计稿，而不是只停在「风格类似」。
** 第四步：补动效  **
比如：
    给首屏加淡入，服务卡片 hover 有缩放，推荐区用骨架加载。
这一步的重点是补「质感」，让页面看起来是活的，而不只是能用。
** 第五步：跑一遍无障碍检查  **
    帮我按 WCAG AA 检查一下，有问题直接修。
** 第六步：做设计规范检查  **
    按 Web 设计规范帮我再扫一遍这些文件。
这一轮主要是抓细节问题，比如间距、组件用法这些。Claude 会在这里调用：  ` web-design-guidelines  ` 。
** 第七步：最后再过一遍设计系统  **
再看一遍第一步的输出，重点盯「反模式」：有没有不该出现的阴影？颜色有没有跑偏？CTA 会不会太激进？
这整套流程，其实就是一个不断收敛的过程：先定方向 → 再做实现 → 再补细节 → 最后统一规范。一个落地页从概念到完工，基本都可以交给 Claude 来完成。
##  实战最佳实践
###  实用技巧
** 先跑设计系统，再做别的。  **
不管要做什么页面，先用  ` ui-ux-pro-max  ` 把设计系统跑出来。风格、配色、字体、反模式一次到位，然后把结果贴进 Claude 的提示里。基本能省掉一大堆来回沟通。
** 按技术栈来搜，别浪费 token。  **
如果你在写 React，就直接限定在 React，不用让它把 Vue、Svelte 那一套也带进来。
    python3 skills/ui-ux-pro-max/scripts/search.py "form validation" --stack react
常用的技术栈（stack）：  ` html-tailwind  ` 、  ` react  ` 、  ` nextjs  ` 、  ` vue  ` 、  ` svelte  ` 、  ` shadcn  ` 、  ` swiftui  ` 、  ` react-native  ` 、  ` flutter  ` 。
** 上线前跑一轮「常识检查」。  **
很多问题其实不是难，而是容易忘。简单过一遍：
* • 图标别用 emoji，换成 SVG（Heroicons / Lucide）
* • logo 用对了没
* • hover 不要把布局挤来挤去
* • 主题色直接用（比如  ` bg-primary  ` ）
* • 可点击元素有没有  ` cursor-pointer  `
* • 动画是不是在 150–300ms
* • 异步操作有没有 loading 状态
* • 明暗模式对比度是不是正常
* • 玻璃效果在浅色模式下还能不能看清
* • 无障碍有没有过一遍
** 记得定期更新技能。  **
这些技能是会进化的，新的模式、配色、UX 指南都会加进来。
    npx skills check   # 检查更新  
    npx skills update  # 更新所有技能
其实每个月跑一次就够了，花不了多少时间。
###  常见问题（FAQ）
** Q1：需要一次装完 8 个吗？还是可以先少装？  **
A：不用一开始全装。先从前 5 个就够用了：  ` ui-ux-pro-max  ` 、  ` frontend-design  ` 、  ` shadcn-ui  ` 、  ` web-accessibility  ` 、  ` web-design-guidelines  ` 。其他的等用到再加。
** Q2：怎么确认技能已经加载了？  **
A：直接问 Claude 一句：  ` “你现在有哪些设计技能？”  ` 如果都正常，它会把已加载的技能列出来。
** Q3：可以在 Cursor 或 Windsurf 里用吗？  **
A：可以，只要支持 Skills CLI，安装命令是一样的。
** Q4：这些技能能在 Claude 网页版用吗？  **
A：不行。目前只支持 Claude Code CLI 或 OpenClaw 这类环境。
** Q5：技能需要付费吗？  **
A：技能本身是免费的。你只需要支付 Claude 的 API 使用费用。
** Q6：我更习惯用 Figma Variables，而不是 design tokens，可以吗？  **
A：可以。Figma 相关技能会直接读取你在 Dev Mode 里定义的内容，不管是 Variables 还是 tokens。
** Q7：可以自己做技能吗？  **
A：可以，而且是比较推荐的。很多团队会把自己的设计规范、品牌体系做成技能，这样 Claude 生成的内容会一直保持一致。
##  结语
这 8 个技能，本质上改变了一件事：Claude 不再只是「会写代码」，而是开始「懂设计」。它补上的，是原本缺失的那一层——设计系统、配色逻辑、字体搭配、无障碍规范、设计检查、动效细节。过去这些需要人反复盯的地方，现在可以交给一套更稳定的流程来完成。
** 你的 AI 设计工具包：  **
1. 1\.  ** ui-ux-pro-max  ** — 定设计方向
2. 2\.  ** frontend-design  ** — 保证实现方式靠谱
3. 3\.  ** shadcn-ui  ** — 提供组件基础
4. 4\.  ** web-accessibility  ** — 补无障碍
5. 5\.  ** web-design-guidelines  ** — 做规范检查
6. 6\.  ** ui-animation  ** — 补细节和质感
7. 7\.  ** f  igma-implement-design  ** — 对齐设计稿
8. 8\.  ** tailwind-design-system  ** — 保证代码不失控（如果你用 Tailwind）
安装一次，后面每个项目都会受益。少一点来回修改，多一点一步到位。
** 参考资源：  **
* •  The Designer's Essential Skills for Claude Code: Your Installation Checklist  [1]
####  引用链接
` [1]  ` The Designer's Essential Skills for Claude Code: Your Installation Checklist:  _ https://nervegna.substack.com/p/the-designers-essential-skills-for  _
_
_
** 既然看到这里了，如果觉得有启发，随手点个赞、推荐、转发三连吧，你的支持是我持续分享干货的动力。  **