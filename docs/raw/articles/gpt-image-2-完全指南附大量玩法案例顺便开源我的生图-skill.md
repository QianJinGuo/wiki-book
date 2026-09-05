---
title: GPT-Image-2 完全指南！附大量玩法案例，顺便开源我的生图 Skill ～
source_url: https://mp.weixin.qq.com/s/0yVKN5cu8oOOBhRZHkyYPg
publish_date: 2026-05-10
tags: [wechat, article, claude, openai, gpt, agent, rag]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: 2acc6847db34210877178196ff81faa7392d7cf8eb8d69f593fa120e2f0aa506
---
---
source: wechat
source_url: https://mp.weixin.qq.com/s/0yVKN5cu8oOOBhRZHkyYPg
ingested: 2026-05-09
feed_name: code秘密花园
wechat_mp_fakeid: MP_WXS_3940303428
source_published: 2026-04-28
---
# GPT-Image-2 完全指南！附大量玩法案例，顺便开源我的生图 Skill ～
2026 年 4 月 21 日，OpenAI 发布了  ` GPT-Image-2  ` ，在 ChatGPT 中被称为 Images 2.0。 
在 Arena.AI 的 Text-to-Image 排 
行榜上，  ` GPT-Image-2  ` 以 1512 分登顶，比第二名谷歌的 Nano-Banana-2 高出 242 分。Arena.AI 官方评价说：从未有任何模型能以如此悬殊的优势排名第一。 
作为 Nano-Banana-2 一直以来的忠实粉丝（之前文章配图大部分为 Nano-Banana 生成的），我可以毫不夸张的说，  ` GPT-Image-2  ` 是迄今为止最强大的图像生成模型，大部分情况下效果碾压 Nano-Banana。 
大家好，我是花园老师（ConardLi），欢迎来到 code秘密花园。 
今天，我们将从多个角度讲透  ` GPT-Image-2  ` ： 
  * ` GPT-Image-2  ` 究竟强在哪？ 
  * ` GPT-Image-2  ` 哪里可以用？ 
  * ` GPT-Image-2  ` 有哪些有意思的玩法？ 
  * ` GPT-Image-2  ` 使用的最佳实践？ 
同时，我将介绍我开源的 GPT-IMAGE-2 玩法网站： 
https://gpt-image2.mmh1.top/ 
以及我开源的 GPT-IMAGE-2 生图 Skill： 
https://github.com/ConardLi/garden-skills/ 
##  一、GPT-Image-2 究竟强在哪？ 
经过我的大量实践，我发现 GPT-Image-2 的强主要体现在下面几个方面： 
** 第一是文字渲染。  **
过去很多 AI 图最明显的问题就是图里文字乱掉，英文还好，中文、日文、韩文、印地语等多语言更容易翻车（Nano-Banana 在文字较多的时候经常会出现问题）。 
GPT-Image-2 明显把 “图中文字” 当成核心能力来做了，适合做海报、封面、菜单、招牌、PPT 风格图、UI 标签和信息图。 
* * *
** 第二是指令遵循。  **
你可以给它非常具体的要求：主体放哪里、背景是什么、文案怎么排、风格偏杂志还是电商、哪些元素不能变。 
虽然它无法保证像 Figma 一样的软件像素级可控，但比上一代更接近 “按 brief 出图” 的感觉。 
* * *
** 第三是编辑能力。  **
GPT-Image-2 支持图像输入和图像编辑，并且会以高保真方式处理输入图片。 
这意味着它更适合做产品换背景、局部替换、风格统一、Logo/包装保留、人物或物体的参考图延展。 
* * *
##  二、GPT-Image-2 哪里可以用？ 
###  官方渠道 
最直接的入口是 ChatGPT，Plus、Pro、Business 等付费订阅可以直接使用： 
https://chatgpt.com/ 
* * *
另外，GPT-Image-2 还直接整合进了 OpenAI 的 Codex 开发环境。 
这意味着开发者可以在写代码的同时，用自然语言让 AI 生成 UI 界面图、游戏贴图、应用图标等视觉资产。 
https://openai.com/zh-Hans-CN/codex/ 
* * *
###  三方平台 
Lovart 是目前最热门的 AI 设计的平台，已经第一时间接入了 GPT-Image-2。 
https://www.lovart.ai/zh/home 
它的核心产品叫 ChatCanvas — 一个支持视觉反馈的 AI 设计协作画布。你可以把 GPT-Image-2 的生成能力和其他模型串联使用，在同一个画布上完成从草图到成品的全流程。 
###  API 调用 
首先是官方渠道，开发者可以在 OpenAI 的 Image API 里用 model: "gpt-image-2" 调 images.generate 或 images.edit。 
https://developers.openai.com/api/docs/guides/image-generation?api=image 
这适合把图像生成接进自己的产品，比如营销工具、电商后台、设计平台、内容生产系统或内部自动化工作流。 
* * *
如果你不想直接对接 OpenAI 的 API，还有更灵活的选择。 
** OpenRouter  ** 是目前最热门的模型路由平台，已上线 GPT-Image-2（通过  ` openai/gpt-5.4-image-2  ` 模型名调用）。它的优势是统一 API 格式、自动负载均衡、支持多模型切换。 
https://openrouter.ai/openai/gpt-5.4-image-2 
** 302.AI  ** 是国内开发者更熟悉的平台，它按用量付费，支付简单，无需订阅，小白推荐。 
https://302.ai/product/detail/gpt-image-2 
##  三、GPT-Image-2 有哪些有意思的玩法？ 
###  案例网站 
由于 GPT-Image-2 的玩法非常丰富，为了方便搭建能更好的把它用起来，我专门为 GPT-Image-2 建立了一个使用指南网站： 
https://gpt-image2.mmh1.top/ 
我实际跑了大量案例 — 覆盖多个分类、大量结构化模板 — 然后把这些案例全部收录到网站中了： 
> 🔗 网站地址：https://gpt-image2.mmh1.top/ 
这个站不是一个简单的图库。每张图点开后，你能看到： 
  * 完整的生成 prompt（可一键复制） 
  * 它用了哪个模板 
  * 模板里哪些字段是你可以改的 
  * 怎么对着 Agent 说一句话就能复现这张图 
网站支持两种浏览模式 — 瀑布流和按分类查看，你可以快速翻到自己感兴趣的类型。 
###  典型案例 
下面挑几个我觉得比较有代表性的方向，每个都是 GPT-Image-2 比较能发挥的场景。 
** 1\. UI 界面样机  **
GPT-Image-2 在生成 "看起来像真实截图" 的 UI 界面方面效果非常不错。我跑了一系列 UI 样机的 prompt，包括直播电商界面、社交平台动态页、短视频封面、聊天对话界面等等。 
看完这些图，可能真的会感叹一句：  ** 有图有真相的时代结束了...  **
** 2\. 海报与品牌视觉  **
包括品牌主海报、Campaign KV、Web Banner、杂志封面等。 
https://gpt-image2.mmh1.top/ 
你可以在 prompt 里指定品牌名、slogan、配色方案、人物站位，它给出的结果在排版合理性上比以前强了不少。 
我测了 Nike × LeBron James 运动海报、Apple Vision Pro 产品季 KV、《时代》杂志风格封面等，都能比较好地完成。 
** 3\. 信息图与数据可视化  **
GPT-Image-2 的文字渲染能力让信息图变得非常稳定了。 
https://gpt-image2.mmh1.top/ 
你可以拿它做便当格布局（bento grid）、手绘风信息图、步骤教程图、KPI 仪表盘等风格。 
像 "iPhone 16 Pro 全方位解析" 这种高密度多模块的图，它也能把各个区块的中文标签渲染清楚。 
** 4\. 学术配图  **
这个方向可能出乎你的意料。 
GPT-Image-2 可以生成论文级别的方法总览图（pipeline figure）、神经网络架构图、机理示意图、Graphical Abstract 等。 
风格上偏白底、出版物字体、低饱和工程色，看起来像正经投稿论文里的 figure。 
我分别跑了 CS/CV/ML 方向的 pipeline 图、工程方向的机理图、以及答辩首页的研究总览图，效果都还不错。 
** 5\. 漫画与角色  **
四格漫画、跨页分镜、角色设定表、角色关系图 — 这些以前需要画师才能搞定的东西，GPT-Image-2 也能交出像样的结果了。 
https://gpt-image2.mmh1.top/ 
我试了"程序员与合并不了的周一"四格漫画、仙侠少年的 8 格跨页彩色分镜、《三体》核心人物关系图等。 
人物一致性虽然还不完美，但作为快速出概念、跑 MVP 来说够用了。 
** 6\. 技术架构图  **
是的，GPT-Image-2 还能画系统架构图、流程图、时序图、ER 图、状态机、思维导图、网络拓扑图。 
https://gpt-image2.mmh1.top/ 
当然，这些图是 PNG 位图，不是可编辑的 SVG。 
所以它更适合用在文档配图、技术分享的 PPT、或者快速表达一个架构思路的场景，而不是替代 draw.io / Excalidraw。 
** 7\. 头像与贴纸  **
风格化头像、角色网格肖像、3D 拟物图标、贴纸套装、历史人物系列 — 这个方向很适合拿来玩。 
https://gpt-image2.mmh1.top/ 
上面列的只是一部分方向。完整的几百个案例，覆盖地图、产品视觉、绘本、极简氛围图、包装设计等 18 个分类，都在网站上可以免费查看： 
** https://gpt-image2.mmh1.top/  **
##  四、GPT-Image-2 使用的最佳实践？ 
你可能已经注意到了，上面这些案例有个共同特点：prompt 都比较长、结构化程度很高。 
如果你直接对 GPT-Image-2 说 "帮我画个海报"，出来的效果肯定不如上面这些。区别在哪？在于 prompt 的工程化程度。 
这就引出了我做的另一个东西 —  ** GPT-Image-2 生图 Skill  ** 。 
###  我的生图 Skill 介绍？ 
简单说，Skill 是一套给 AI Agent 看的 "工作手册"。 
你把一个 Skill 放到 Agent 的工作环境里（比如 Claude Code、Cursor、Codex），Agent 就会按照 Skill 定义的流程来干活。对于生图这件事，流程是： 
  1. 判断当前运行模式（有 API Key 吗？宿主有图像工具吗？） 
  2. 分析用户的需求属于哪个视觉类型 
  3. 找到对应的结构化模板 
  4. 把用户输入填进模板里 
  5. 渲染出一个高质量 prompt 
  6. 调用图像工具出图（或者把 prompt 直接给你） 
> 我之前开源的 rag-skill、web-design-skill ，以及当前这个 gpt-image-2 skill 全部都打包开源到这个仓库中了：https://github.com/ConardLi/garden-skills/ 
Skill 的具体安装方式大家可以到 Github 上查看： 
https://github.com/ConardLi/garden-skills/blob/main/README.zh-CN.md 
这个 Skill 覆盖了 18 大类、79 个结构化模板。每个模板都是一份 Markdown 文件，里面定义了 JSON 或结构化自然语言模板、参数表、变体说明、典型案例。前面我们介绍的典型案例图，全部是用这套模板体系生成的。 
###  三种运行模式 
这个 Skill 设计了三种运行模式，适配不同的环境： 
** Mode A：Garden 本地模式  **
如果你有可以调用 gpt-image-2 的 API Key，Skill 会完整跑通整个流程 — 选模板、渲染 prompt、调用生图脚本、图片自动落盘。这是最 "全自动" 的模式。 
适合在 Claude Code、Cursor 等支持自定义工具，但是又不具备生图能力的 Agent 环境里使用。 
* * *
** Mode B：Host-Native 委托宿主  **
如果你在 Codex 这类环境里，Skill 就会退化成提示词工程指引 — 它帮你选模板、填参数、渲染出最终 prompt，然后交给宿主自带的图像工具去执行。 
这个模式的好处是不需要你自己配 API Key，直接用平台的能力就行。 
* * *
** Mode C：Advisor 顾问模式  **
如果你的 Agent 环境完全没有图像工具（比如纯文本的 Agent），你也没有 gpt-image-2 的 API Key，Skill 就会变成一个高质量的生图 prompt 顾问。它依然会帮你走完模板选择和参数填充的流程，最终把渲染好的 prompt 打印出来，你自己拿去 ChatGPT / Lovart 这些平台取用就可以。 
###  怎么用？ 
具体怎么装、怎么跑，取决于你用的 Agent 环境，下面我们按常见场景说一下。 
####  场景一：Codex 
Codex 自带图像生成工具，属于 Mode B。 
你只需要把 garden-skills 仓库中的 gpt-image-2 Skill 安装到你的 Codex 的工作目录（放到 .claude/skills 目录下）： 
然后直接对 Codex 说你想生成什么图，Codex 会读取 Skill 里的模板，帮你渲染 prompt，然后调用自己的图像工具出图。 
####  场景二：Claude Code / Cursor 等 Agent（自配 API） 
这类环境通常没有内置图像工具，但你可以自己配 OpenAI API Key。 
首先还是要把 garden-skills 仓库中的 gpt-image-2 Skill 安装到你的 Agent 的工作目录。然后配置如下环境变量： 
  * ENABLE_GARDEN_IMAGEGEN=true ，代表要启用本地的 API Key 来生成图片 
  * OPENAI_BASE_URL=xxx ，自定义的生图地址 
  * OPENAI_API_KEY=xxx ，自定义 API Key 
配好环境变量后，Skill 进入 Mode A，完整跑通 "模板 → prompt → 调脚本 → 出图落盘" 的全流程。 
然后你对 Agent 说想生成什么图就行了，Skill 会自动处理后面的一切。 
任务完成后，它会帮你把图片和原始提示词生成到一个本地固定目录中： 
####  场景三：ChatGPT Web / Lovart / 任何有生图能力的对话界面 
这个场景下你可以把 Skill 当作 prompt 工程的参考手册。 
依然同第二步一样，在 Claude Code / Cursor 等 Agent 中配置好这个 Skill，但是不需要配置任何环境变量。 
然后，你就可以直接和 Agent 发出你的绘图需求，Agent 会帮你返回结构化的提示词： 
然后你可以把这段提示词粘贴到 ChatGPT 或 Lovart 的对话框里直接使用。 
这样做虽然多了一步手动操作，但 prompt 质量会比随手写高不少。 
###  模板体系一览 
整个 Skill 的模板按 18 个分类组织，完整列表： 
分类  |  模板数  |  案例数  |  典型方向   
---|---|---|---  
学术配图  |  9  |  18  |  pipeline 图、架构图、Graphical Abstract、答辩首页   
素材资产  |  2  |  4  |  拟物图标集、游戏截图 mockup   
头像人设  |  5  |  10  |  风格迁移头像、角色网格、3D 图标、贴纸、历史系列   
品牌包装  |  4  |  8  |  品牌识别板、吉祥物套装、化妆品包装、饮料标签   
图像编辑  |  5  |  10  |  背景替换、局部替换、杂物去除、产品精修、人像修改   
网格拼贴  |  4  |  8  |  2×2 套装、lookbook、多风格拼贴、动漫立项板   
信息图  |  6  |  12  |  手绘风、便当格、对比图、步骤教程、KPI 仪表盘   
地图  |  4  |  8  |  美食地图、旅行路线、城市风貌、门店分布   
人物肖像  |  4  |  8  |  商务肖像、创始人大片、虚拟主播、角色设定表   
海报活动  |  4  |  8  |  品牌海报、Campaign KV、Web Banner、杂志封面   
产品视觉  |  5  |  10  |  爆炸视图、白底主图、影棚大片、礼盒展示、生活场景   
场景插画  |  4  |  8  |  治愈日常、概念大场景、绘本内页、极简氛围   
演示文档  |  4  |  8  |  高密度讲解 Slide、政策风、商业报告页、教学示意图   
叙事序列  |  5  |  10  |  四格漫画、漫画分镜、动漫 KV、人物关系图、步骤流程   
技术架构图  |  7  |  14  |  系统架构、流程图、时序图、状态机、ER 图、思维导图、拓扑   
字体排版  |  2  |  4  |  大字主张海报、中英双语版式   
UI 样机  |  5  |  10  |  直播电商、社交平台、落地页、聊天界面、短视频封面   
编辑工作流  |  5  |  10  |  背景替换、局部替换、杂物去除、精修、人像编辑   
全部模板和案例都在 Skill 仓库和案例网站上可以直接查看和使用。 
##  最后 
如果你也对 GPT-Image-2 生图感兴趣，可以做两件事： 
  1. 去案例网站（https://gpt-image2.mmh1.top/）翻翻，找到你感兴趣的方向，直接复制 prompt 试试 
  2. 如果你在用 Codex / Claude Code / Cursor 之类的 Agent 环境，把 garden-skills（https://github.com/ConardLi/garden-skills/）拉下来配一下，以后说句话就能出图 
模板和案例会持续更新，欢迎 star 和贡献。有问题可以在 GitHub 上开 issue。 
* * *
> 如果你想第一时间收到 GPT-Image-2 的新玩法更新，可以 Star 我的 GitHub 仓库：https://github.com/ConardLi/garden-skills/