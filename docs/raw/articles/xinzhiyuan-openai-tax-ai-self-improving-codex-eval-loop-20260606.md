---
title: "OpenAI Tax AI 自我进化：Codex Eval 闭环 6 周 25%→86% + Symphony + MOSS"
created: "2026-06-06"
updated: "2026-06-06"
type: raw
source_url: "https://mp.weixin.qq.com/s/xAHmDUEgvHeilq1cXISxaQ"
source_name: "新智元 WeChat MP"
author: "新智元"
ingested: "2026-06-06"
sha256: "9619b95b961bcfdcaf256d9708bb2be534d29e9a39f4546e1a12083c61e46687"
char_count: 3635
tags: [agent, self-improvement, codex, eval-loop, tax-ai, openai, symphony, harness, production-case, recursive-self-improvement]
sources: [raw/articles/agent-self-improvement-six-mechanisms]
review_value: 7
review_confidence: 7
review_recommendation: worth-reading
review_stars: 4
---
  
新智元报道  
【新智元导读】
没人重训模型，没人重写代码，OpenAI的AI系统六周内自己把准确率从25%拉到86%。Codex自己定位bug、写修复、跑测试，AI自我进化已在生产环境跑起来了。
最近，OpenAI悄悄干了一件细思极恐的事。
一个AI系统，没人重新训练模型，没人重写代码，六周内自己把准确率从25%拉到了86%。
在官方博客中，OpenAI把「怎么让AI自己变强」的完整方法论，白纸黑字全写出来了。
结合今年2月GPT-5.3-Codex「参与构建自身」、4月Symphony开源、5月MOSS源码级自我改写，一条被OpenAI藏了半年的暗线，终于浮出水面。
AI自我进化，已经在生产环境里跑起来了。
180→15小时，6周准确率翻三倍
这个AI报税系统叫Tax AI，OpenAI和Thrive Holdings联合做的，服务于Crete会计师联盟旗下30多家事务所。
先看一个人的故事。
去年，Crete的一位资深会计师花了整整180小时准备客户税表。
今年，同样的工作量，15个小时搞定。
省下来的时间她做了件以前根本不可能的事，逐一给每位客户打电话，亲自讲解报税细节。剩下的精力，全拿来开拓新客户。
整个赛季，Tax AI处理了7000份税表，准确率最高97%，产能提升约50%。
但真正炸裂的不是这些数字，是增长曲线。
六周前只能处理最简单的W-2和1099表格，连K-1都搞不定。六周后，字段完成准确率从25%飙到86%。
系统越用越强，而且在加速。
Bug自己修，测试报告自己写
怎么做到的？
Thrive Holdings的老板Joshua Kushner，同时也是OpenAI最大投资方之一。
去年12月，OpenAI入股了Thrive Holdings，直接把工程团队派驻到会计师的办公桌旁边。
看着真实的税表、真实的客户数据、真实的报错，一起打磨了六个月。
传统AI产品改进是这样的，上线，出bug，用户投诉，工程师排查，改代码，重新部署。
整个循环慢得要命，每一步都卡在人身上。
Tax AI用了三招，就把这个循环的大部分环节自动化了。
第一招，让从业者的每次纠错变成结构化数据。
会计师审核Tax AI的输出时，每改一个字段，系统完整记录三件事，AI预测了什么、会计师改成了什么、最终报税用了什么。
关键在于，系统把每次修改都当作改进的起点，而不是终点。
第二招，生产环境里的每一步都留痕。
从源文件上传，到字段提取，到引用溯源，到税务引擎映射，到会计师纠正，到最终报税。
整条链路的每个节点都有trace。
出错的时候，可以精确定位到底是OCR读错了手写笔记，还是字段映射逻辑有gap，还是压根不支持这种表格类型。
第三招，用Codex把发现变成修复。
当系统发现某类错误反复出现，比如Tax AI总是漏掉租赁房产的「公平出租天数」字段，而会计师每次都手动补上。
这个pattern就会被打包成一个有明确成功标准的工程任务，扔给Codex。
Codex拿到的不是一个模糊的bug报告。
它拿到的是完整的生产trace、出错的源文件样本、期望输出、相关代码路径，外加一套专门针对这个问题的eval测试集。
然后Codex自己检查提取逻辑、映射规则、评分器，提出修复方案，跑targeted eval验证，再跑回归测试确认没引入新问题，最后生成一个PR等人类工程师review。
如果证据模糊，任务会路由回产品团队，而不是硬塞进流程。
你没看错。bug修完了，还自带测试报告。
效果立竿见影。租赁房产相关字段处理，从几乎不可用到90%精确率和召回率，六周。
而这六周积累下来的抽象能力和eval规范，又让后续支持Schedule C和Schedule A变得更快。
系统越用，能处理的问题越复杂。越复杂的问题被解决，每份税表省下的人工时间越多。
这是一条加速曲线。
AI进入自我改进时代
2月，OpenAI发布GPT-5.3-Codex的时候写道：「GPT-5.3-Codex是我们第一个在创造自身过程中发挥了关键作用的模型。」
Codex团队用这个模型的早期版本来调试自己的训练流程、管理部署、诊断测试结果。
模型参与了自己的构建。
4月，OpenAI开源了Symphony，一个把Codex和Linear项目管理工具连起来的编排层。
起因很现实。OpenAI的工程师发现，一个人同时管3到5个Codex会话就已经是极限了，再多就陷入上下文切换的泥潭。
人的注意力，成了Agent产能的天花板。
而Symphony的思路很暴力，别管Agent了，管工作本身。
它监控issue tracker，给每个ticket分配一个独立的Agent工作空间，Agent自己干活、跑CI、生成PR。工程师只负责review产出物。
当Agent失败了，工程师不去改prompt让它「再试一次」，而是去想「它缺了什么能力、什么上下文、什么结构」。然后修harness，不是修prompt。
OpenAI内部用Symphony之后，部分团队的工程产出直接翻倍。
同样是4月，学术界也跟上了。ICLR 2026在里约专门办了一个「AI递归自我改进」的workshop。
紧接着5月，一篇叫MOSS的研究把这件事推到了更极端的位置。它让Agent不只改prompt或workflow配置，而是直接改写自己的源代码。
在OpenClaw平台上，MOSS在一个无人干预的进化周期内，把四个任务的平均评分从0.25拉到了0.61。
论文地址：https://arxiv.org/abs/2605.22794
Tax AI不是孤例。「Agent自我改进」已经成了2026年上半年最密集的技术主线。
模型层面，GPT-5.3-Codex参与自身构建。 
工程层面，Symphony加上Tax AI的生产闭环。 
学术层面，MOSS实现源码级自我改写。
不动模型权重，照样越来越强
这里有个关键区分。
过去大家谈AI进化，说的是fine-tuning，是RLHF，是改模型权重。那条路需要海量数据、大量GPU、专业团队，门槛极高。
现在OpenAI展示的这条路完全不同。
模型权重纹丝不动。
改的是模型周围的一切。提取逻辑、映射规则、eval标准、工作流配置，甚至Agent自己的代码。
打个比方，模型是引擎，harness是车身。即便不用换引擎也能让车跑得更快，改底盘调悬挂就行。
如此一来，自我改进的门槛就被大幅拉低了。
你不需要自己训练模型，只需要三件事，设计好eval体系、留好生产trace、让一个足够强的coding agent去跑「发现→定位→修复→验证」的闭环。
模型智能是起点
系统智能才是终局
回到Tax AI。
如果你只看「AI帮人报税」这个表层叙事，竞争壁垒看起来很薄，换个大模型接上去似乎也能干。
但如果你看到的是底层那套自我改进的闭环，结论完全不同。
Tax AI的全部知识产权归Thrive Holdings所有。OpenAI派了半年工程师，最后连IP都没留。
这在硅谷大厂的AI合作里极其罕见。
Thrive Capital是OpenAI最大投资方之一，去年12月OpenAI反手入股Thrive Holdings，不给现金，给工程师、给模型、给深度集成，最后产品归你。
OpenAI图什么？
答案就藏在Tax AI的增长曲线里。
每处理一份税表，每收到一次会计师的纠正，系统就多了一份改进自己的证据。这个飞轮一旦转起来，OpenAI就拿到了一个完整的、经过生产验证的Agent自我进化范式。
一个报税产品的IP不值钱。一套可复制的自我改进方法论，才是真正的战略资产。
现在范式跑通了。Thrive Holdings已经在把同样的闭环复制到记账、审计、IT运维。
而另一边，Anthropic也没闲着。
Conway，那个7x24小时永不下线的Agent平台，底下搭的是Memory Files持久记忆加上Dreams异步整合。
说白了，也是在给Agent装上一个能自我维护、自我进化的「永久大脑」。
两条路线，殊途同归。
OpenAI用Codex驱动的eval闭环，让Agent在生产中自己修bug。Anthropic用文件记忆加梦境机制，让Agent在会话间自己整理经验。
方法不同，赌的是同一件事，Agent能不能从「一次性工具」变成「越用越强的系统」。
在通往ASI的路上，模型智能只是起点。
真正的终局，是系统智能，一个能从环境中持续学习、持续进化、持续变强的整体。
参考资料：
https://openai.com/index/building-self-improving-tax-agents-with-codex/
编辑：摩西
秒追ASI
⭐
点赞、转发、在看一键三连
⭐
点亮星标，锁定新智元极速推送！

---
## 元信息
- **来源 URL**: https://mp.weixin.qq.com/s/xAHmDUEgvHeilq1cXISxaQ
- **抓取时间**: 2026-06-06
- **抓取方式**: urllib + js_content 提取
- **公众号**: 新智元
