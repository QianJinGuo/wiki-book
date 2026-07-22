---
title: "Boris Cherny 新访谈：开发工具正在从 IDE 变成 Agent 控制台"
source_url: https://mp.weixin.qq.com/s/iqSixiNP9lxNKg7aVfHFCQ
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
source_type: wechat
provenance_state: extracted
sha256: fcdb47337a25336e9f95a6415ed07a302c4932b25aaaa796964a02b55ef702ae
---
---
<p style="font-size: 0px; line-height: 0; margin: 0px; visibility: visible;">
 <span style="visibility: visible;">
 </span>
</p>
<section powered-by="werss" style='font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 15px; line-height: 1.75; text-align: left; visibility: visible;'>
 <fieldset style="margin: 0.8em 33.5px 0.3em; color: rgb(62, 62, 62); font-size: 16px; white-space: normal; max-width: 100%; box-sizing: border-box; min-width: 0px; line-height: 25.6px; border-width: initial; border-style: initial; border-color: currentcolor; text-align: center; background-color: rgb(255, 255, 255); overflow-wrap: break-word !important; visibility: visible;">
  <section powered-by="werss" style="padding: 10px 1.2em 10px 0.8em; max-width: 100%; color: rgb(255, 255, 254); line-height: 1.2; font-size: 18px; font-weight: bold; vertical-align: top; display: inline-block; background-color: rgb(255, 100, 80); box-sizing: border-box !important; overflow-wrap: break-word !important; visibility: visible;">
   <span style="visibility: visible;">
    架构师（JiaGouX）
   </span>
  </section>
  <section powered-by="werss" style="margin-right: auto; margin-left: auto; padding: 9px 4px 14px; max-width: 100%; box-sizing: border-box; border-radius: 8px; border-width: 4px; border-style: solid; border-color: rgb(255, 100, 80); color: rgb(255, 100, 80); letter-spacing: 3px; font-size: 20px; overflow-wrap: break-word !important; visibility: visible;">
   <span style="visibility: visible;">
    我们都是架构师！
   </span>
   <span style="visibility: visible;">
    <br style="visibility: visible;"/>
   </span>
   <span style="visibility: visible;">
    架构未来，你来不来？
   </span>
  </section>
  <p style="margin-right: auto; margin-left: auto; max-width: 100%; box-sizing: border-box; min-height: 1em; width: 0px; height: 10px; border-top-width: 0.6em; border-top-style: solid; border-top-color: rgb(255, 100, 80); border-bottom-color: rgb(255, 100, 80); overflow-wrap: break-word !important; border-right-width: 0.7em !important; border-right-style: solid !important; border-right-color: transparent !important; border-left-width: 0.7em !important; border-left-style: solid !important; border-left-color: transparent !important; visibility: visible;">
   <span style="visibility: visible;">
    <br style="visibility: visible;"/>
   </span>
  </p>
 </fieldset>
 <section powered-by="werss" style="margin-bottom: 0px; visibility: visible;">
  <span style="visibility: visible;">
   <mp-common-profile class="js_uneditable custom_select_card mp_profile_iframe mp_common_widget js_wx_tap_highlight" data-alias="JiaGouX" data-biz_account_status="0" data-from="0" data-headimg="http://mmbiz.qpic.cn/mmbiz_png/sXiaukvjR0RCNb3RYsCgx02T4J55ia2SnemY7uJHsDChxq6jAibbATlIKDgzLxz0zekXWjblzCDcL86AjbMNp02Tg/300?wx_fmt=png&amp;wxfrom=19" data-id="MzAwNjQwNzU2NQ==" data-index="0" data-is_biz_ban="0" data-isban="0" data-nickname="架构师" data-origin_num="125" data-pluginname="mpprofile" data-signature="专业架构师，专注高质量架构干货分享。三高架构（高可用、高性能、高稳定）、大数据、机器学习、Java架构、系统架构、分布式架构、人工智能等的架构讨论交流，以及结合互联网技术的架构调整，大规模架构实战分享。欢迎有想法、乐于分享的架构师交流学习。" data-verify_status="2" style="visibility: visible;">
   </mp-common-profile>
  </span>
 </section>
 <p style="color: rgb(62, 62, 62); font-size: 16px; white-space: normal; background-color: rgb(255, 255, 255); margin-bottom: 0px; visibility: visible;">
  <span style="visibility: visible;">
   <br style="visibility: visible;"/>
  </span>
 </p>
 <hr style="transform-origin: 0px 0px; transform: scale(1, 0.5); height: 1px; border: medium; margin: 2em 0px; background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0)); visibility: visible;"/>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   今天，看了 Boris Cherny 在 Sequoia AI Ascent 2026 上这场访谈，又顺手把前面几篇
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650409043&amp;idx=1&amp;sn=6453858afff384ca9e3709c07f61c1c3&amp;scene=21#wechat_redirect" link-id="91e3" linktype="text" style="visibility: visible;" target="_blank" textvalue="Claude Code">
    Claude Code
   </a>
   、
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650409084&amp;idx=1&amp;sn=b8db9f9925f5dba578cfc7044981f25a&amp;scene=21#wechat_redirect" link-id="56a5" linktype="text" style="visibility: visible;" target="_blank" textvalue="Harness">
    Harness
   </a>
   、
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650409162&amp;idx=1&amp;sn=62556a10e227bcb8d977a4f3e0006c8b&amp;scene=21#wechat_redirect" link-id="480b" linktype="text" style="visibility: visible;" target="_blank" textvalue="上下文">
    上下文
   </a>
   和
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650409252&amp;idx=1&amp;sn=3be9425812905ebca39f5e5c3b16fb2f&amp;scene=21#wechat_redirect" link-id="93da" linktype="text" style="visibility: visible;" target="_blank" textvalue="Skills">
    Skills
   </a>
   的稿子翻回来对了一下。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   老实说，看完之后第一感受是：这件事好像不太能只放在“AI 写代码更快了”这个框里理解。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   访谈里当然有不少容易传播的点。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   Claude Code 怎么从 Anthropic Labs 那个三人小组长出来，前半年为什么几乎没有 PMF，为什么 Opus 4 之后曲线突然起飞，Boris 现在又是怎么从手机管理几百个 Agent、一天合掉几十个 PR。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   这些都值得看。
  </span>
 </p>
</section>
<section powered-by="werss" style="text-align: center; visibility: visible;">
 <img src="https://mmbiz.qpic.cn/sz_mmbiz_png/Fnx2G2wYdEIuKib06syduuy82kkq4YU5PAolZOz08KpcKXI1oeeMzqpQkIZOsXicjfUzStrEnzyP65HSpBicyQDvwsYVjTcr9giaWt9lNmnSf3g/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=0" style="height: auto !important; visibility: visible !important; width: 680px !important;"/>
</section>
<section powered-by="werss" style='font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 15px; line-height: 1.75; text-align: left; visibility: visible;'>
 <figure style="margin: 1.5em 8px; color: rgb(63, 63, 63); visibility: visible;">
  <figcaption style="text-align: center; color: rgb(136, 136, 136); font-size: 0.8em; visibility: visible;">
   <span style="visibility: visible;">
    产品悬置：能力溢出之后，产品形态才突然成立
   </span>
  </figcaption>
 </figure>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   这张图可以先帮我们抓住一个背景：Claude Code 的爆发，不太像传统 SaaS 那种一步步验证需求、慢慢打磨 PMF 的路径。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   它更像是先赌模型能力会越过某个点，然后提前把产品形态放在那里。前半年不好用，不代表方向错了；等模型能力上来，原来有点超前的交互，突然就成立了。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   但我更想顺着它再往里聊一层。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   如果只读成“Boris 不亲手写代码了”，这件事很容易滑向职业焦虑那一类讨论。可放到我们这几个月一直在梳理的那条线里，
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650409084&amp;idx=1&amp;sn=b8db9f9925f5dba578cfc7044981f25a&amp;scene=21#wechat_redirect" link-id="a3ae" linktype="text" style="visibility: visible;" target="_blank" textvalue="Agent Harness">
    Agent Harness
   </a>
   、
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650409162&amp;idx=1&amp;sn=62556a10e227bcb8d977a4f3e0006c8b&amp;scene=21#wechat_redirect" link-id="fd42" linktype="text" style="visibility: visible;" target="_blank" textvalue="上下文工作集">
    上下文工作集
   </a>
   、
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650409171&amp;idx=1&amp;sn=f1205a72f8219032770c1144307d1efa&amp;scene=21#wechat_redirect" link-id="3ef3" linktype="text" style="visibility: visible;" target="_blank" textvalue="Subagents">
    Subagents
   </a>
   、
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408639&amp;idx=1&amp;sn=ad325d5fa3dd0e112d62b0e34ea3c48a&amp;scene=21#wechat_redirect" link-id="6651" linktype="text" style="visibility: visible;" target="_blank" textvalue="Skills">
    Skills
   </a>
   、
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650409178&amp;idx=1&amp;sn=6ab1bf7946b83e32b5e660b0db411982&amp;scene=21#wechat_redirect" link-id="1b15" linktype="text" style="visibility: visible;" target="_blank" textvalue="过程资产">
    过程资产
   </a>
   ，它其实指向一个更偏工程的问题：
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <strong style="color: rgb(9, 85, 217); font-weight: bold; font-size: inherit; visibility: visible;">
   <span style="visibility: visible;">
    开发工具的中心，正在从 IDE 里的光标，慢慢挪到管理 Agent 工作流的那块控制台上。
   </span>
  </strong>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   以前我们问的是：
   <span style="font-weight: bold; visibility: visible;">
    AI 能不能帮工程师更快地写代码。
   </span>
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   现在问题慢慢变成：人怎么把目标讲清楚，Agent 怎么持续执行，系统怎么记录过程，风险动作怎么审批，最后结果怎么验证和回滚。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   这就不只是 Claude Code 一家的产品变化了。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   更像是软件工程控制点的一次迁移。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   巧的是，同一场大会上 Karpathy 那场关于 Software 3.0 的演讲，从另一个角度说的也是这件事：执行层被模型快速突破之后，方向层反而更难了。我们 5 月 1 日那篇《
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650409219&amp;idx=1&amp;sn=faa35c5f162f4830e1c90933fc95bad1&amp;scene=21#wechat_redirect" link-id="16da" linktype="text" style="visibility: visible;" target="_blank" textvalue="Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering">
    Karpathy 最新访谈：从 Vibe Coding 到 Agentic Engineering
   </a>
   》就是顺着这条线写的，这次 Boris 的访谈算是在工程实践这一侧给它补了个具体注脚。
  </span>
 </p>
 <hr style="transform-origin: 0px 0px; transform: scale(1, 0.5); height: 1px; border: medium; margin: 2em 0px; background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0)); visibility: visible;"/>
 <h2 data-heading="true" style="display: table; margin: 4em auto 2em; color: rgb(255, 255, 255); background: rgb(9, 85, 217); font-weight: bold; text-align: center; padding: 0.3em 1.2em; font-size: 19.5px; border-radius: 8px 24px; box-shadow: rgba(0, 0, 0, 0.06) 0px 2px 6px; visibility: visible;">
  <span>
   太长不看版
  </span>
 </h2>
 <ul class="list-paddingleft-1" style="margin-left: 0;color: #3f3f3f;list-style: none;padding-left: 1.5em;">
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • Boris Cherny 那句 “coding is solved” 要拆开理解。代码生成在主流场景里确实变强了，但工程里的治理、验证、责任边界还在。
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • Claude Code 的变化不只是补全代码，而是把 Agent 放进仓库、终端、Git、CI、PR 这些真实链路里。
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • 我最想继续看的词是 Loop。它让 Agent 从一次回答，变成持续观察、执行、修复和汇报的工作进程。
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • 这和我们前面写的 Claude Code 源码、长任务、Prompt Caching、上下文工作集、Subagents、Harness、Skills、过程资产是同一条线。
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • 下一代开发工具可能不只是 IDE，也不只是 Terminal，而是能管理 Agent 工作流的控制台。
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • 工程师的价值不会因为少写代码消失，但会更多落到目标、边界、验证、风险和系统所有权上。
    </span>
   </section>
  </li>
 </ul>
 <hr style="border-style: solid;border-width: 2px 0 0;border-color: rgba(0, 0, 0, 0.1);-webkit-transform-origin: 0 0;-webkit-transform: scale(1, 0.5);transform-origin: 0 0;transform: scale(1, 0.5);height: 1px;border: none;margin: 2em 0;background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));"/>
 <h2 data-heading="true" style="display: table;margin: 4em auto 2em;color: #fff;background: rgba(9, 85, 217, 1);font-weight: bold;text-align: center;padding: 0.3em 1.2em;font-size: 19.5px;border-radius: 8px 24px 8px 24px;box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);">
  <span>
   写代码少了，不等于工程少了
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Boris 在访谈里有一句被引用得很多：
   <span style="font-weight: bold;">
    对他自己来说，coding 已经 100% solved。
   </span>
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这句话传播力很强，也很容易引起争论。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   我觉得还是先把它拆开看比较好。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Claude Code 自己的代码库主栈是 TypeScript 和 React，正好踩在模型最熟悉的那块分布里。Boris 又在 Anthropic 内部用着最新模型、最新工具、最新流程，整个团队的工作方式都是围着 Claude Code 重新搭起来的。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   在这个环境里，他把大部分代码执行交给 Agent，是合情合理的。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   但换到另一些场景，事情就没这么简单。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   比如一个跑了三十年的 C++ 系统，一个强合规的银行核心，一个嵌入式固件项目，或者一个上线窗口非常窄的生产系统，问题就不只是“代码能不能生成”了。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   它还要回答：
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   历史设计为什么是今天这样。
  </span>
  <span>
   <br/>
  </span>
  <span>
   哪些边界不能动。
  </span>
  <span>
   <br/>
  </span>
  <span>
   变更怎么过审。
  </span>
  <span>
   <br/>
  </span>
  <span>
   数据风险怎么隔离。
  </span>
  <span>
   <br/>
  </span>
  <span>
   失败以后谁来负责。
  </span>
  <span>
   <br/>
  </span>
  <span>
   线上事故怎么回滚。
  </span>
  <span>
   <br/>
  </span>
  <span>
   审计记录怎么留下来。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   所以我更愿意把这句话说得保守一点：
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <strong style="color: rgba(9, 85, 217, 1);font-weight: bold;font-size: inherit;">
   <span>
    代码生成正在快速变便宜，软件工程没有因此变简单。
   </span>
  </strong>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   很多时候反而是反过来的，Agent 能做的越多，治理问题暴露得越早。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   弱一点的补全工具，最多写坏几行代码。一个能读仓库、改文件、跑命令、连 Slack、查数据库、修 CI、开 PR 的 Agent，已经不是普通插件了。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   它更像一个新的工程参与者。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这时候只问“模型会不会写代码”，就不够了。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   更贴近工程的问题是：它在什么边界里写，怎么知道写对了，错了又怎么停下来。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这层意思其实我们在《
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650409030&amp;idx=1&amp;sn=e435a8b1fca46cea3e5514f0541d3a17&amp;scene=21#wechat_redirect" link-id="afaf" linktype="text" style="" target="_blank" textvalue="你的AI-First对了吗? 让我们一起看看你的软件工程成熟度">
    你的AI-First对了吗? 让我们一起看看你的软件工程成熟度
   </a>
   》里已经聊过了。模型能力越往上走，差距反而越多落到“工程那一面”。Boris 这次访谈更像是把它推到了一个更日常的现场。
  </span>
 </p>
</section>
<section powered-by="werss" style="text-align: center;">
 <img src="https://mmbiz.qpic.cn/mmbiz_png/Fnx2G2wYdEK0mNrXUKm50oFp1lv2FudbdAibcFniaw29ffeMYGiaoWEdzxcaZNRyMnN0JibTiaKavvIvucxu7NDdcjS86b54EGa1fCkcGazRwFm0/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=1" style="height: auto !important; visibility: visible !important; width: 680px !important;"/>
</section>
<section powered-by="werss" style='font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 15px; line-height: 1.75; text-align: left;'>
 <figure style="margin: 1.5em 8px;color: #3f3f3f;">
  <figcaption style="text-align: center;color: #888;font-size: 0.8em;">
   <span>
    软件版的活字印刷术
   </span>
  </figcaption>
 </figure>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Boris 用过印刷术这个类比，我觉得方向是能理解的：当构建软件的成本下降，软件创造会从少数人的专业技能，慢慢变成更多人的基础能力。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   但这不等于专业工程会消失。印刷术普及之后，写作没有消失，编辑、出版、版权和审查反而变复杂了。软件也类似，代码更容易生成之后，系统设计、质量控制和责任边界会更重要。
  </span>
 </p>
 <h2 data-heading="true" style="display: table;margin: 4em auto 2em;color: #fff;background: rgba(9, 85, 217, 1);font-weight: bold;text-align: center;padding: 0.3em 1.2em;font-size: 19.5px;border-radius: 8px 24px 8px 24px;box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);">
  <span>
   Claude Code 这次让我重新看了一眼“工具”这个词
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   过去几年，AI 编程工具很大一部分想象还是围绕光标展开。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   人在 IDE 里停下，模型补下一行。人在函数里写注释，模型补函数体。人在报错处问一句，模型解释原因。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这个阶段里，人是中心，模型是贴在旁边的加速器。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Claude Code 的结构往前走了一步。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Anthropic 官方对它的定位是
   <span style="color: rgb(0, 82, 255);font-weight: bold;">
    agentic coding system
   </span>
   。它可以读取代码库，跨文件修改，运行测试，并在修改文件或执行命令前请求明确权限。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这几个词放在一起，意思就变了。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   它不是“猜下一行”。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   它是在一个真实工作空间里行动。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   旧的开发路径大概是：
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   人理解需求。
  </span>
  <span>
   <br/>
  </span>
  <span>
   人打开文件。
  </span>
  <span>
   <br/>
  </span>
  <span>
   人写代码。
  </span>
  <span>
   <br/>
  </span>
  <span>
   人跑测试。
  </span>
  <span>
   <br/>
  </span>
  <span>
   人修 bug。
  </span>
  <span>
   <br/>
  </span>
  <span>
   人提交 PR。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   新的路径更接近：
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   人定义目标。
  </span>
  <span>
   <br/>
  </span>
  <span>
   Agent 读取上下文。
  </span>
  <span>
   <br/>
  </span>
  <span>
   Agent 制定计划。
  </span>
  <span>
   <br/>
  </span>
  <span>
   Agent 修改代码。
  </span>
  <span>
   <br/>
  </span>
  <span>
   Agent 运行测试。
  </span>
  <span>
   <br/>
  </span>
  <span>
   Agent 根据失败继续修。
  </span>
  <span>
   <br/>
  </span>
  <span>
   人审查 diff、命令、风险和最终结果。
  </span>
  <span>
   <br/>
  </span>
  <span>
   人决定是否合并。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这里最关键的变化，不是代码作者换了。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   而是人的控制点换了。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   过去开发者主要控制文件、函数、命令和光标。现在很多时候，开发者控制的是目标、约束、权限、预算、验证和审查。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   所以
   <span style="color: rgb(0, 82, 255);font-weight: bold;">
    “程序员变成管理 Agent”
   </span>
   这句话有道理，但如果只停在这层，还是会漏掉一部分变化。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   更准确一点说，软件开发的交互界面，正在从编辑器交互，变成工作流控制。
  </span>
 </p>
</section>
<section powered-by="werss" style="text-align: center;">
 <img src="https://mmbiz.qpic.cn/sz_mmbiz_png/Fnx2G2wYdEKmMQiaQF9qibxQDaCDicswCvaNKaH7x2OPgYib0ecSXTnlSGvIAIK4JLlzUibWnbf3b2NA8zYhomibYPTVKa5zjeeyVmOUXTQPNnhxo/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=2" style="height: auto !important; visibility: visible !important; width: 680px !important;"/>
</section>
<section powered-by="werss" style='font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 15px; line-height: 1.75; text-align: left;'>
 <figure style="margin: 1.5em 8px;color: #3f3f3f;">
  <figcaption style="text-align: center;color: #888;font-size: 0.8em;">
   <span>
    从输入预测到自主代理
   </span>
  </figcaption>
 </figure>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这张图把差别说得比较直观：
   <span style="color: rgb(0, 82, 255);font-weight: bold;">
    “系统架构师”
   </span>
   。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   输入预测时代，模型更像一个跟着光标走的补全器。自主代理时代，它开始自己读上下文、找文件、跑命令、修失败、再把结果交给人审查。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这时候“工具”这个词也要变一下。它不是一个浮在 IDE 旁边的按钮，而是一整套让 Agent 能进入工程链路的运行环境。
  </span>
 </p>
 <h2 data-heading="true" style="display: table;margin: 4em auto 2em;color: #fff;background: rgba(9, 85, 217, 1);font-weight: bold;text-align: center;padding: 0.3em 1.2em;font-size: 19.5px;border-radius: 8px 24px 8px 24px;box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);">
  <span>
   关于Loop
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Boris 讲了很多很容易被传播的数字。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   几百个 Agent。
  </span>
  <span>
   <br/>
  </span>
  <span>
   几千个夜间任务。
  </span>
  <span>
   <br/>
  </span>
  <span>
   一天处理 150 个 PR。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这些数字当然会先抓住注意力。
  </span>
 </p>
</section>
<section powered-by="werss" style="text-align: center;">
 <img src="https://mmbiz.qpic.cn/mmbiz_png/Fnx2G2wYdEIVlPfiaYl4uKiaFODWN5gBBCAMSBsibCFtibcmlm9xjhW1LbiaYr8bN81UbcHPsbAlUJrADZQYdgGCfghOPiclfc5z3ofCGGkWmXLW8/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=3" style="height: auto !important; visibility: visible !important; width: 680px !important;"/>
</section>
<section powered-by="werss" style='font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 15px; line-height: 1.75; text-align: left;'>
 <figure style="margin: 1.5em 8px;color: #3f3f3f;">
  <figcaption style="text-align: center;color: #888;font-size: 0.8em;">
   <span>
    重构个人工作流：告别键盘
   </span>
  </figcaption>
 </figure>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   <span style="font-weight: bold;">
    但放到架构视角里，我更想多看一眼的是 Loop。
   </span>
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   他现在很多任务已经不是“一次 prompt 得到一次回答”。比如盯 PR，自动修 CI，自动 rebase；比如持续观察某个测试是不是 flaky；比如每隔一段时间从 Twitter 把对 Claude Code 的反馈拉回来，聚类整理之后再发给他。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这些事都不是聊天。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   它们更像长期跑着的工作进程。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   普通 AI 对话是：
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   我问一次。
  </span>
  <span>
   <br/>
  </span>
  <span>
   你答一次。
  </span>
  <span>
   <br/>
  </span>
  <span>
   上下文停在那里。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Agent Loop 是：
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   我定义目标。
  </span>
  <span>
   <br/>
  </span>
  <span>
   你定期观察。
  </span>
  <span>
   <br/>
  </span>
  <span>
   你持续执行。
  </span>
  <span>
   <br/>
  </span>
  <span>
   你发现异常。
  </span>
  <span>
   <br/>
  </span>
  <span>
   你尝试修复。
  </span>
  <span>
   <br/>
  </span>
  <span>
   你记录过程。
  </span>
  <span>
   <br/>
  </span>
  <span>
   你把关键结果推给我。
  </span>
  <span>
   <br/>
  </span>
  <span>
   我只在需要判断、审批、取舍的时候介入。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这个变化很重要。
  </span>
 </p>
</section>
<section powered-by="werss" style="text-align: center;">
 <img src="https://mmbiz.qpic.cn/mmbiz_png/Fnx2G2wYdEIoKPzQibr7Z3QRfkK2jpntQT5k827reL1G0tGMAOhM2mxsnJLbCVaU57twiaKTGWk5C5Wr7XDia8lKGMlriaKSwYwvUBviasKMUAfA/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=4" style="height: auto !important; visibility: visible !important; width: 680px !important;"/>
</section>
<section powered-by="werss" style='font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 15px; line-height: 1.75; text-align: left;'>
 <figure style="margin: 1.5em 8px;color: #3f3f3f;">
  <figcaption style="text-align: center;color: #888;font-size: 0.8em;">
   <span>
    用 Loop 构建长期运行的代理系统
   </span>
  </figcaption>
 </figure>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   因为一旦 Agent 变成长期进程，开发工具展示“模型说了什么”就不太够了。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   它还要让人看见：
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Agent 正在做什么。
  </span>
  <span>
   <br/>
  </span>
  <span>
   跑到哪一步。
  </span>
  <span>
   <br/>
  </span>
  <span>
   失败几次。
  </span>
  <span>
   <br/>
  </span>
  <span>
   改了哪些文件。
  </span>
  <span>
   <br/>
  </span>
  <span>
   调用了哪些工具。
  </span>
  <span>
   <br/>
  </span>
  <span>
   花了多少 Token。
  </span>
  <span>
   <br/>
  </span>
  <span>
   有没有触碰危险资源。
  </span>
  <span>
   <br/>
  </span>
  <span>
   哪些动作需要人工确认。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这就把 IDE 推到了一个新位置。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   以前 IDE 是写代码的地方。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   以后它很可能变成 Agent 工作流的观察台、调度台和审查台。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这也是我说“Agent 控制台”的原因。
  </span>
 </p>
</section>
<section powered-by="werss" style="text-align: center;">
 <img src="https://mmbiz.qpic.cn/sz_mmbiz_png/Fnx2G2wYdEJAQ8ZsPyIDxppzSUkdldmE2Cokuz9ibUTSqCFm6biblSS4ojv6ibuM0Gk0PmyF8an3ib8RvL8wYXkAFl7uVgoibD9CnfUMlEGTUCuU/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=5" style="height: auto !important; visibility: visible !important; width: 680px !important;"/>
</section>
<section powered-by="werss" style='font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 15px; line-height: 1.75; text-align: left;'>
 <figure style="margin: 1.5em 8px;color: #3f3f3f;">
  <figcaption style="text-align: center;color: #888;font-size: 0.8em;">
   <span>
    未来已来，等待执行
   </span>
  </figcaption>
 </figure>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这张图我挺喜欢。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   它没有把 Agent 写成一个万能按钮，而是把重点放在三件事上：
   <span style="color: rgb(0, 82, 255);font-weight: bold;">
    重构工作流，升级团队拓扑，重新聚焦领域。
   </span>
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   看起来像几行命令，但我看到的不是
   <span style="font-weight: bold;">
    “敲一下，未来就自动执行”。
   </span>
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   我读到的反而是另一层意思：
   <span style="color: rgb(0, 82, 255);font-weight: bold;">
    AI 走到 Agent 这一步，最后还是要回到人怎么组织工作。
   </span>
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这就让我想到我们《架构师》一直挂在嘴边的那几句话：
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: rgb(63, 63, 63);text-align: center;">
  <span>
   <span style="font-weight: bold;">
    我们都是架构师。
   </span>
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: rgb(63, 63, 63);text-align: center;">
  <span>
   <span style="font-weight: bold;">
    架构未来，你来不来？
   </span>
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   以前说“我们都是架构师”，多少还有一点理想化。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   毕竟很多人会觉得，
   <span style="font-weight: bold;">
    架构是架构师、技术负责人、平台团队的事，和每天写需求、改 Bug、做交付的人隔着一层。
   </span>
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   但 Agent 进来以后，这层距离在变短。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   你让它做什么，不只是写一句 Prompt。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   你要把需求拆到它能理解的程度，把上下文交给它，把边界说清楚，把风险点留给人看，把结果接回团队原来的流程里。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这里面每一步，其实都是架构。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   模型可以帮我们省掉很多手工活，但它不会天然知道一个团队最在乎什么，也不会替我们承担一次错误上线、一次权限放大、一次领域误解带来的后果。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   所以“架构未来，你来不来？”放在这里，更像是在提醒我们自己：
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   <span style="color: rgb(0, 82, 255);font-weight: bold;">
    未来不是等模型变强以后自然发生的。它需要一群做工程的人，一点点把人、Agent、流程、权限和领域知识重新摆好。
   </span>
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   能不能摆得顺，可能就是接下来几年软件团队拉开差距的地方。
  </span>
 </p>
 <h2 data-heading="true" style="display: table;margin: 4em auto 2em;color: #fff;background: rgba(9, 85, 217, 1);font-weight: bold;text-align: center;padding: 0.3em 1.2em;font-size: 19.5px;border-radius: 8px 24px 8px 24px;box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);">
  <span>
   这条线和前面几篇正好接上了
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   回头看最近一段时间我们在《架构师》里梳理的内容，Boris 这场访谈像是一个汇合点。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   4 月初我们拆 Claude Code 源码《
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408943&amp;idx=1&amp;sn=99626f852eba63c7a5134c976b9f031d&amp;scene=21#wechat_redirect" link-id="3f10" linktype="text" style="" target="_blank" textvalue="Claude Code 源码架构解析：从启动、Prompt 到权限管道">
    Claude Code 源码架构解析：从启动、Prompt 到权限管道
   </a>
   》时，主要在看一个本地 Agent Runtime 怎么启动，怎么装配 Prompt，怎么进入主循环，怎么把权限管道挡在工具调用前面。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   那时更关心的是：
   <span style="font-weight: bold;">
    Claude Code 为什么能跑起来。
   </span>
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   之后写长任务《
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408950&amp;idx=1&amp;sn=8c14e4b7726dd478644e0a8e1acfbad4&amp;scene=21#wechat_redirect" link-id="89ba" linktype="text" style="" target="_blank" textvalue="Claude Code 长任务为什么不容易跑偏">
    Claude Code 长任务为什么不容易跑偏
   </a>
   》、Prompt Caching《
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650409101&amp;idx=1&amp;sn=5c1ac7bd71b07c4767c19dc53d5a6c13&amp;scene=21#wechat_redirect" link-id="9672" linktype="text" style="" target="_blank" textvalue="Claude Code 为什么缓存命中率能做到 92%">
    Claude Code 为什么缓存命中率能做到 92%
   </a>
   》、上下文工作集《
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650409162&amp;idx=1&amp;sn=62556a10e227bcb8d977a4f3e0006c8b&amp;scene=21#wechat_redirect" link-id="be0e" linktype="text" style="" target="_blank" textvalue="Agent Harness 上下文管理：聊天记录还是工作集？">
    Agent Harness 上下文管理：聊天记录还是工作集？
   </a>
   》和 Subagents《
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650409171&amp;idx=1&amp;sn=f1205a72f8219032770c1144307d1efa&amp;scene=21#wechat_redirect" link-id="c031" linktype="text" style="" target="_blank" textvalue="Subagents 详解：Claude Code 如何避免上下文污染">
    Subagents 详解：Claude Code 如何避免上下文污染
   </a>
   》，思路慢慢往外走了一层。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Agent 不是靠一次聪明回答完成复杂任务，而是靠上下文、状态、压缩、隔离和验证，把一个任务撑到最后。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   再往后看 Harness，《
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408973&amp;idx=1&amp;sn=e147f34daa2d9e3ea431d985b08486e5&amp;scene=21#wechat_redirect" link-id="c967" linktype="text" style="" target="_blank" textvalue="模型差距在缩小，Harness 差距在放大">
    模型差距在缩小，Harness 差距在放大
   </a>
   》和《
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650409084&amp;idx=1&amp;sn=b8db9f9925f5dba578cfc7044981f25a&amp;scene=21#wechat_redirect" link-id="33df" linktype="text" style="" target="_blank" textvalue="Agent Harness 综述">
    Agent Harness 综述
   </a>
   》这两篇里，我的理解又变了一次。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   同一个模型放进不同 Coding Agent，体感差距往往不在模型本身，而在模型外面那套运行底座：工具怎么定义，上下文怎么取，状态怎么留，权限怎么管，失败怎么恢复。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   到 前两天《
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650409226&amp;idx=1&amp;sn=44b6970c052445e3bdb3023d28c73d51&amp;scene=21#wechat_redirect" link-id="15f2" linktype="text" style="" target="_blank" textvalue='从 30 分钟手搓 Agent，到 Harness 成为"新后端"'>
    从 30 分钟手搓 Agent，到 Harness 成为"新后端"
   </a>
   》时，这个问题已经接到了后端边界。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Agent 会读状态、写状态、开任务、查日志、恢复失败。后端如果继续把它当一个普通的外部 API 调用方来看，会越来越吃力。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Cursor 的 Harness 复盘《
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650409236&amp;idx=1&amp;sn=71ae43ca6ec5b3cb1f82c258b1542271&amp;scene=21#wechat_redirect" link-id="3c0a" linktype="text" style="" target="_blank" textvalue="Cursor 复盘 Harness：模型决定能力上限，Harness 决定生产下限">
    Cursor 复盘 Harness：模型决定能力上限，Harness 决定生产下限
   </a>
   》又帮我们补了一层运营视角。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Harness 一旦承重，就要像线上系统一样持续评估、观测、回滚，也要在模型升级之后及时清掉那些已经过时的补丁。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这两天再看 Boris 讲 Loop、并行 Agent、手机里的 session、Anthropic 内部流程，前面这些线索就被放进了同一张图里。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   源码里的主循环、上下文工作集、Subagents、Harness、Skills、过程资产，并不是几件分散的事。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   它们都在给 Agent 补同一套底座。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   所以这篇我不太想停在访谈摘要那一层。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   更想顺着前面这条线再往下走一步：
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <strong style="color: rgba(9, 85, 217, 1);font-weight: bold;font-size: inherit;">
   <span>
    当 Agent 从“回答者”变成“执行者”，软件工程要补一套新的工作系统。
   </span>
  </strong>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Boris 这场访谈，把这个问题推到了更日常的工作方式里。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   它不是只发生在未来某个宏大的时刻，而是先从修 CI、整理反馈、开 PR、写 SQL、查数据、改文档这些不起眼的事情开始。
  </span>
 </p>
 <h2 data-heading="true" style="display: table;margin: 4em auto 2em;color: #fff;background: rgba(9, 85, 217, 1);font-weight: bold;text-align: center;padding: 0.3em 1.2em;font-size: 19.5px;border-radius: 8px 24px 8px 24px;box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);">
  <span>
   SaaS 不会简单消失，但入口会被重排
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Boris 还谈了 SaaS 护城河。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   他借用 Hamilton Helmer 的 Seven Powers 框架，说 AI 会削弱 switching cost 和 process power，网络效应、规模经济、独占资源这些仍然有效。
  </span>
 </p>
</section>
<section powered-by="werss" style="text-align: center;">
 <img src="https://mmbiz.qpic.cn/sz_mmbiz_png/Fnx2G2wYdELw0LKGkibcnzk3ma3L3jc8FPI50ygCtmnRJIibbw5ZDRhxKK4YDocsTCeje9EnsocMQ4Wsx3jNzIlyW32QviaDstzbd9L7nojPu8/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=6" style="height: auto !important; visibility: visible !important; width: 680px !important;"/>
</section>
<section powered-by="werss" style='font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 15px; line-height: 1.75; text-align: left;'>
 <figure style="margin: 1.5em 8px;color: #3f3f3f;">
  <figcaption style="text-align: center;color: #888;font-size: 0.8em;">
   <span>
    商业护城河的消亡与重塑
   </span>
  </figcaption>
 </figure>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这句话如果直接简化成“SaaS 要完了”，会少掉很多企业软件里的现实约束。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   我更愿意这样理解：
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <strong style="color: rgba(9, 85, 217, 1);font-weight: bold;font-size: inherit;">
   <span>
    很多 SaaS 不会消失，但会从人的前台入口，退到 Agent 的后台能力层。
   </span>
  </strong>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   过去人每天打开 CRM、Jira、Notion、Google Docs、Excel、ERP、BI，在不同界面之间切来切去。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Agent 出现以后，用户可能只在一个工作台里说：
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   查一下这个客户最近三个月的沟通记录。
  </span>
  <span>
   <br/>
  </span>
  <span>
   把风险点列出来。
  </span>
  <span>
   <br/>
  </span>
  <span>
   更新 CRM。
  </span>
  <span>
   <br/>
  </span>
  <span>
   生成跟进计划。
  </span>
  <span>
   <br/>
  </span>
  <span>
   同步到 Slack。
  </span>
  <span>
   <br/>
  </span>
  <span>
   月底汇总到经营报表。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这时候 Salesforce 还在，Jira 还在，Google Docs 还在，数据库也还在。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   变化是：人不一定再直接操作它们。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Agent 成了入口。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这也是为什么 MCP 和 Computer Use 都重要。
  </span>
 </p>
</section>
<section powered-by="werss" style="text-align: center;">
 <img src="https://mmbiz.qpic.cn/sz_mmbiz_png/Fnx2G2wYdEKMVOJQuYLJup3qrnvFcK1YZic7CzWwDu8RiaJlF4wAR7VJ6W4NskHPStnPT7Z9OkwE81oVMVlchBqtzFGBrQZCSLBII3yRhbmoE/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=7" style="height: auto !important; visibility: visible !important; width: 680px !important;"/>
</section>
<section powered-by="werss" style='font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 15px; line-height: 1.75; text-align: left;'>
 <figure style="margin: 1.5em 8px;color: #3f3f3f;">
  <figcaption style="text-align: center;color: #888;font-size: 0.8em;">
   <span>
    MCP、API 与 Computer Use 正在重塑知识工作入口
   </span>
  </figcaption>
 </figure>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   有稳定接口的系统，通过 MCP、API、CLI 暴露能力。没有接口、没有文档、甚至只能点界面的老系统，短期可能要靠 Computer Use 兜底。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   但不管是哪条路，核心都是一样的：
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   外部系统要变成 Agent 可理解、可调用、可审计、可治理的能力。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   过去企业软件竞争的是界面、流程、模板、审批体验。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   以后很多场景会竞争能力目录、权限边界、数据质量、审计记录和被 Agent 调用时的可靠性。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   能被安全调用的系统，会继续留在工作流里。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   只能靠人点界面的系统，存在感可能会慢慢往后退。
  </span>
 </p>
</section>
<section powered-by="werss" style="text-align: center;">
 <img src="https://mmbiz.qpic.cn/mmbiz_png/Fnx2G2wYdEL8HWlKu3ia35jYsxdiaXxHzFfylcGQOa8K4HH5FuM2gTdoBma9MoCvfbYIBPTtKWoT4qRgyxtmXBbp05WV7YhD6CJRoBonibVOlE/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=8" style="height: auto !important; visibility: visible !important; width: 680px !important;"/>
</section>
<section powered-by="werss" style='font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 15px; line-height: 1.75; text-align: left;'>
 <figure style="margin: 1.5em 8px;color: #3f3f3f;">
  <figcaption style="text-align: center;color: #888;font-size: 0.8em;">
   <span>
    SaaS 价值正在被重新估价
   </span>
  </figcaption>
 </figure>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这里我会稍微保守一点。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   AI 会降低软件构建成本，但企业软件的价值不只在“功能能不能做出来”。数据口径、权限体系、审计链路、业务关系、合同和组织习惯，这些东西不会一夜之间消失。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   所以更像是价值重排：单纯靠功能堆叠的 SaaS 压力会更大，能掌握数据、流程、领域结果和合规责任的系统，位置反而会更清楚。
  </span>
 </p>
</section>
<section powered-by="werss" style="text-align: center;">
 <img src="https://mmbiz.qpic.cn/sz_mmbiz_png/Fnx2G2wYdEJCIZgOZtgb2cqbOlXdAZcLh7kOXKnj8uhGG5PE9FFW85bFS9U1icZCgTUhosBp7qj8Nf0uLkZ0sO7ib2ViccnKPtZ4AC0Q2BlwT4/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=9" style="height: auto !important; visibility: visible !important; width: 680px !important;"/>
</section>
<section powered-by="werss" style='font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 15px; line-height: 1.75; text-align: left;'>
 <figure style="margin: 1.5em 8px;color: #3f3f3f;">
  <figcaption style="text-align: center;color: #888;font-size: 0.8em;">
   <span>
    创业者的黄金时代：小团队的速度优势被放大
   </span>
  </figcaption>
 </figure>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这也是为什么 Boris 会提到小团队的机会。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   我不想把它写成“大公司一定输，小公司一定赢”。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   现实没这么简单。但有一点很明显：当构建成本下降，小团队从 0 到 1 的速度会变快；而大组织要改流程、改权限、改考核、改协作习惯，速度不会跟模型升级一样快。
  </span>
 </p>
 <h2 data-heading="true" style="display: table;margin: 4em auto 2em;color: #fff;background: rgba(9, 85, 217, 1);font-weight: bold;text-align: center;padding: 0.3em 1.2em;font-size: 19.5px;border-radius: 8px 24px 8px 24px;box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);">
  <span>
   模型升级很快，组织升级没那么快
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Boris 有个判断我觉得很值得琢磨。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Anthropic 内部真正领先的地方，不一定是模型本身，而是组织流程。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   他提到，Anthropic 内部已经把 Claude 用到很多环节。Agent 会通过 Slack 和其他人的 Agent 沟通。SQL 由模型写，代码也大量由模型生成。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这类说法要打个边界。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   外部团队不能直接把 Anthropic 的内部状态照搬到银行、医院、制造业、政务系统，甚至也不能照搬到一个已经运转十年的中大型 SaaS 公司。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Anthropic 的优势不只是用了 Claude。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   它的组织、产品、模型、权限、团队文化和工具链，都是围绕这件事长出来的。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   很多公司现在的问题是：模型接进来了，组织没变。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   工程师还是按老流程排需求、写代码、提测、上线、修线上问题。AI 只是某个环节里的辅助工具。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这样也会有提升，但和 Boris 描述的那种工作方式，不是一回事。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   如果 Agent 真要进入组织，就会冒出一堆新问题：
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   哪些任务可以交给 Agent 常驻。
  </span>
  <span>
   <br/>
  </span>
  <span>
   哪些任务只能由人触发。
  </span>
  <span>
   <br/>
  </span>
  <span>
   Agent 能不能直接开 PR。
  </span>
  <span>
   <br/>
  </span>
  <span>
   谁审查 Agent 的输出。
  </span>
  <span>
   <br/>
  </span>
  <span>
   Agent 之间能不能互相发消息。
  </span>
  <span>
   <br/>
  </span>
  <span>
   跨团队问题谁来兜底。
  </span>
  <span>
   <br/>
  </span>
  <span>
   失败日志归谁看。
  </span>
  <span>
   <br/>
  </span>
  <span>
   成本预算按人算，还是按任务算。
  </span>
  <span>
   <br/>
  </span>
  <span>
   一个 Loop 跑坏了，谁有权限停掉它。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这些不是模型能力问题。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   <span style="color: rgb(0, 82, 255);font-weight: bold;">
    这是组织设计问题。
   </span>
  </span>
 </p>
 <figure style="margin: 1.5em 8px;color: #3f3f3f;">
  <span>
   <br/>
  </span>
 </figure>
</section>
<section powered-by="werss" style="text-align: center;">
 <img src="https://mmbiz.qpic.cn/sz_mmbiz_png/Fnx2G2wYdEIOMiakWMBdyTMRXUzTaJQVHZy9EUrblrk75qZgyaKcRgF9DEYOD3QTAy1s7QwWDsHjicAQvx4SZ6TfXiahkbx4WuQGXRLR6yDxdU/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=10" style="height: auto !important; visibility: visible !important; width: 680px !important;"/>
</section>
<section powered-by="werss" style='font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 15px; line-height: 1.75; text-align: left;'>
 <figure style="margin: 1.5em 8px;color: #3f3f3f;">
  <figcaption style="text-align: center;color: #888;font-size: 0.8em;">
   <span>
    组织结构的演化：从专业孤岛到跨学科融合
   </span>
  </figcaption>
 </figure>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Claude Code 团队里，工程经理、产品经理、设计师、数据科学家、财务、用户研究都在写代码。这个细节很有意思。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   它不是说每个人都要变成传统意义上的软件工程师，而是说代码正在变成团队里更多角色共同使用的一种表达方式。以前靠工单和口头描述转一圈的事情，现在有些角色可以自己先跑出一个可验证的原型。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这会改变团队拓扑。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   过去是专业孤岛之间互相交接。以后更像是每个角色都保留自己的专业深度，同时具备一点把想法落成软件的能力。
  </span>
 </p>
 <figure style="margin: 1.5em 8px;color: #3f3f3f;">
  <span>
   <br/>
  </span>
 </figure>
</section>
<section powered-by="werss" style="text-align: center;">
 <img src="https://mmbiz.qpic.cn/mmbiz_png/Fnx2G2wYdEKysthOr2U6ibnZ7LZFOQJ6VLPW8WoKAjcV5LwRMvorZpe7lQxLgUgEy4JtRicGzZc5wJH3yUgFBMalFPyTUic3FA5ic8N3tAb6Bvk/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=11" style="height: auto !important; visibility: visible !important; width: 680px !important;"/>
</section>
<section powered-by="werss" style='font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 15px; line-height: 1.75; text-align: left;'>
 <figure style="margin: 1.5em 8px;color: #3f3f3f;">
  <figcaption style="text-align: center;color: #888;font-size: 0.8em;">
   <span>
    真正的鸿沟不在技术，而在组织架构与业务流程
   </span>
  </figcaption>
 </figure>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   模型升级可能几周一次。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   组织升级往往按季度、按年算。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   所以“大家都能拿到同一个模型”，不代表差距会很快抹平。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   更慢的是流程、责任、权限、文化和评估体系。
  </span>
 </p>
 <h2 data-heading="true" style="display: table;margin: 4em auto 2em;color: #fff;background: rgba(9, 85, 217, 1);font-weight: bold;text-align: center;padding: 0.3em 1.2em;font-size: 19.5px;border-radius: 8px 24px 8px 24px;box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);">
  <span>
   最后还是回到工程师/架构师自己
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   我不太愿意把这类访谈直接写成职业替代故事。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Boris 自己今年 2 月在 X 上回应过类似问题，原话大致是："Someone has to prompt the Claudes, talk to customers, coordinate with other teams, decide what to build next. Engineering is changing and great engineers are more important than ever." Simon Willison 当时也把这条转到了自己的 weblog 上。换成更日常的说法就是：总得有人去 prompt Claude，去跟客户聊，去协调团队，去决定下一步做什么；工程在变，但优秀工程师反而更重要。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这句话更贴近我自己的体会。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   <span style="color: rgb(0, 82, 255);font-weight: bold;">
    因为写代码只是工程工作的一部分。
   </span>
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   更难的往往是：
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   什么问题值得做。
  </span>
  <span>
   <br/>
  </span>
  <span>
   需求背后真正约束是什么。
  </span>
  <span>
   <br/>
  </span>
  <span>
   哪些方案现在能落地。
  </span>
  <span>
   <br/>
  </span>
  <span>
   哪些风险不能接受。
  </span>
  <span>
   <br/>
  </span>
  <span>
   这个变更会不会影响旧用户。
  </span>
  <span>
   <br/>
  </span>
  <span>
   哪个指标能证明它真的变好。
  </span>
  <span>
   <br/>
  </span>
  <span>
   什么时候该停下来。
  </span>
  <span>
   <br/>
  </span>
  <span>
   什么时候要推翻重来。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Agent 可以生成代码，但它很难
   <span style="color: rgb(0, 82, 255);font-weight: bold;">
    自动
   </span>
   <span style="color: rgb(0, 82, 255);">
    拥有这些上下文。
   </span>
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   尤其在复杂业务里，最值钱的不是“知道某个 API 怎么写”，而是知道这套系统为什么长成这样，哪些历史约束还没消失，哪些业务规则不能靠表面文档理解。
  </span>
 </p>
</section>
<section powered-by="werss" style="text-align: center;">
 <img src="https://mmbiz.qpic.cn/mmbiz_png/Fnx2G2wYdEL6LzRwCmHdJHPClF8r2S4f40S80QibxiaE9mmnmXTHdPrGYiaEHuPUHoiaK9uelBQY7WmCAJcHCalL12MyoWCVWJ6ltWxg3oFYKkg/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=12" style="height: auto !important; visibility: visible !important; width: 680px !important;"/>
</section>
<section powered-by="werss" style='font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 15px; line-height: 1.75; text-align: left;'>
 <figure style="margin: 1.5em 8px;color: #3f3f3f;">
  <figcaption style="text-align: center;color: #888;font-size: 0.8em;">
   <span>
    领域专家的胜利：深度业务知识加自主代理
   </span>
  </figcaption>
 </figure>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这一点和图里的会计软件例子很像。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   未来最懂会计软件的人，未必是最会写前端和后端的人，而可能是一个熟悉税务逻辑、业务流程和用户痛点的资深会计，再加上一套足够好用的 Agent 工作系统。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这不是在贬低工程能力。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   恰恰相反，越是这种场景，工程能力越要往系统边界、数据模型、权限、验证和长期可维护性上走。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   所以工程师能力会从“亲手生产代码”，更多转向“拥有系统结果”。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这听起来有点抽象，换成日常工作，会越来越体现在这些地方：
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   把一个含糊需求整理成 Agent 可以执行的规格。
  </span>
  <span>
   <br/>
  </span>
  <span>
   把大任务切成几个互不污染的工作单元。
  </span>
  <span>
   <br/>
  </span>
  <span>
   判断 Agent 的方案是否漏了关键边界。
  </span>
  <span>
   <br/>
  </span>
  <span>
   设计测试和评估，让结果自己说话。
  </span>
  <span>
   <br/>
  </span>
  <span>
   看懂 diff 背后的架构影响。
  </span>
  <span>
   <br/>
  </span>
  <span>
   区分哪些动作可以自动，哪些需要人工确认。
  </span>
  <span>
   <br/>
  </span>
  <span>
   把一次成功经验沉淀成团队 Skill 或 Runbook。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这些能力过去也重要。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   只是过去它们经常被大量手写代码的工作量盖住。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   现在代码生成变快，这些判断反而露出来了。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这对很多工程师来说，需要一点时间适应。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   毕竟亲手写出代码，是我们进入这一行很重要的成就感来源。把越来越多执行交给 Agent，不只是效率变化，也会改变工程师对自己角色的理解。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   但换个角度看，这也可能是一件好事。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   样板代码、重复修改、机械排障、低风险迁移慢慢被 Agent 接过去以后，人可以把更多精力放回那些更难、也更有价值的问题：
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   要做什么。
  </span>
  <span>
   <br/>
  </span>
  <span>
   为什么做。
  </span>
  <span>
   <br/>
  </span>
  <span>
   边界在哪。
  </span>
  <span>
   <br/>
  </span>
  <span>
   怎么证明它对。
  </span>
  <span>
   <br/>
  </span>
  <span>
   出错时怎么收回来。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这才是 Claude Code 这次给我的提醒。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   我不太想把重点放在“以后还写不写代码”上。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   更值得研究的，是软件工程正在从代码生产，慢慢走向 Agent 工作系统的设计。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Karpathy 在那场演讲末尾有一句话我隔几天就会想起来一次：“你可以外包思考，但你不能外包理解。”用在 Boris 这条线上同样合适。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这条线，才刚刚开始。
  </span>
 </p>
 <hr style="border-style: solid;border-width: 2px 0 0;border-color: rgba(0, 0, 0, 0.1);-webkit-transform-origin: 0 0;-webkit-transform: scale(1, 0.5);transform-origin: 0 0;transform: scale(1, 0.5);height: 1px;border: none;margin: 2em 0;background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));"/>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   原视频链接：
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   https://www.youtube.com/watch?v=SlGRN8jh2RI
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   参考资料：
  </span>
 </p>
 <ul class="list-paddingleft-1" style="margin-left: 0;color: #3f3f3f;list-style: none;padding-left: 1.5em;">
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • Andrej Karpathy：《Sequoia Ascent 2026: Software 3.0, Agentic Engineering, and Jagged Intelligence》，https://karpathy.bearblog.dev/sequoia-ascent-2026/
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • Anthropic Claude Code 产品页，https://www.anthropic.com/product/claude-code
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • Anthropic Claude Code MCP 文档，https://docs.anthropic.com/en/docs/claude-code/mcp
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • ITPro：Claude Code creator Boris Cherny says software engineers are "more important than ever"，https://www.itpro.com/software/development/claude-code-creator-boris-cherny-says-software-engineers-are-more-important-than-ever-as-ai-transforms-the-profession-but-anthropic-ceo-dario-amodei-still-thinks-full-automation-is-coming
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • Simon Willison：A quote from Boris Cherny，https://simonwillison.net/2026/Feb/14/boris/
    </span>
   </section>
  </li>
 </ul>
</section>
<p style="font-size: 0px;line-height: 0;margin: 0px;">
 <span>
 </span>
</p>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 10px 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;-webkit-text-stroke-width: 0px;white-space: normal;text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;background-color: rgb(255, 255, 255);color: rgb(62, 62, 62);font-size: 16px;text-align: center;widows: 1;word-spacing: 2px;line-height: 2em;'>
 <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 13px;letter-spacing: 0.5px;color: rgb(0, 128, 255);">
  <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-family: "PingFang SC", -apple-system-font, system-ui, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;'>
   <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
    如喜欢本文，请点击右上角，把文章分享到朋友圈
   </span>
  </span>
 </span>
</p>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 10px 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;-webkit-text-stroke-width: 0px;white-space: normal;text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;background-color: rgb(255, 255, 255);color: rgb(62, 62, 62);font-size: 16px;text-align: center;widows: 1;word-spacing: 2px;line-height: 2em;'>
 <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 13px;letter-spacing: 0.5px;color: rgb(0, 128, 255);">
  <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-family: "PingFang SC", -apple-system-font, system-ui, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;'>
   <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
    如有想了解学习的技术点，请留言给若飞安排分享
   </span>
  </span>
 </span>
</p>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 10px 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;-webkit-text-stroke-width: 0px;white-space: normal;text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;background-color: rgb(255, 255, 255);color: rgb(62, 62, 62);font-size: 16px;text-align: center;widows: 1;word-spacing: 2px;line-height: 2em;'>
 <strong style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
  <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-family: "PingFang SC", -apple-system-font, system-ui, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 13px;letter-spacing: 0.5px;color: rgb(217, 33, 66);'>
   <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
    因公众号更改推送规则，请点“在看”并加“星标”第一时间获取精彩技术分享
   </span>
  </span>
 </strong>
</p>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 10px 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;-webkit-text-stroke-width: 0px;white-space: normal;text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;background-color: rgb(255, 255, 255);color: rgb(62, 62, 62);font-size: 16px;text-align: center;widows: 1;word-spacing: 2px;line-height: 2em;'>
 <strong style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;letter-spacing: 0.544px;font-family: 微软雅黑;font-size: 16.3636px;">
  <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   ·END·
  </span>
 </strong>
</p>
<pre style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;font-size: 15px;text-align: left;background-color: rgb(255, 255, 255);color: rgb(89, 89, 89);"><pre style="-webkit-tap-highlight-color: transparent;margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;color: rgb(89, 89, 89);font-size: 15px;letter-spacing: 0.544px;text-align: left;widows: 1;word-spacing: 1px;caret-color: rgb(0, 0, 0);background-color: rgb(255, 255, 255);"><p style='-webkit-tap-highlight-color: transparent;margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;color: rgb(0, 0, 0);font-family: Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, "PingFang SC", Cambria, Cochin, Georgia, Times, "Times New Roman", serif;font-size: 16px;white-space: normal;'><strong style="-webkit-tap-highlight-color: transparent;margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">相关阅读：</span></strong></p><ul class="list-paddingleft-1" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px 0px 0px 1.6em;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;color: rgb(0, 0, 0);font-family: Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, "PingFang SC", Cambria, Cochin, Georgia, Times, "Times New Roman", serif;font-size: 16px;letter-spacing: 0.544px;text-align: left;widows: 1;word-spacing: 1px;caret-color: rgb(0, 0, 0);background-color: rgb(255, 255, 255);width: 577.422px;'><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408930&amp;idx=1&amp;sn=2fd7f3701ae8688e7720f80bb8296936&amp;scene=21#wechat_redirect" link-id="a757" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="刚刚，Claude Code“代码泄露”背后：如何重新看 Agent Harness">刚刚，Claude Code“代码泄露”背后：如何重新看 Agent Harness</a></span></span></p></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408900&amp;idx=1&amp;sn=93bbae7c90fc03fb510f450c6fee97e0&amp;scene=21#wechat_redirect" link-id="54ca" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="大家都在讲 Harness，但它到底该怎么理解">大家都在讲 Harness，但它到底该怎么理解</a></span></span></p></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408891&amp;idx=1&amp;sn=639dc4a7c8482f6e1ac04d8d53c63459&amp;scene=21#wechat_redirect" link-id="e02a" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="模型越来越强，为什么大家却开始重写 Harness">模型越来越强，为什么大家却开始重写 Harness</a></span></span></p></li></ul><ul class="list-paddingleft-1" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px 0px 0px 1.6em;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;color: rgb(0, 0, 0);font-family: Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, "PingFang SC", Cambria, Cochin, Georgia, Times, "Times New Roman", serif;font-size: 16px;letter-spacing: 0.544px;text-align: left;widows: 1;word-spacing: 1px;caret-color: rgb(0, 0, 0);background-color: rgb(255, 255, 255);width: 577.422px;'><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408877&amp;idx=1&amp;sn=d27eb9e99ed526e342df775f0291cb2e&amp;scene=21#wechat_redirect" link-id="c236" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="如何让单个 Agent 做长任务不失真：Anthropic 给出了一套更工程化的答案">如何让单个 Agent 做长任务不失真：Anthropic 给出了一套更工程化的答案</a></span></span></p></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408884&amp;idx=1&amp;sn=6a2fa56f70f15cdd75eb5c2b12e687ef&amp;scene=21#wechat_redirect" link-id="8a3a" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="Claude Code高手的 8 个 Claude Code 实战习惯">Claude Code高手的 8 个 Claude Code 实战习惯</a></span></span></p></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408870&amp;idx=1&amp;sn=ba53595a44ab55396b36795fbc78791b&amp;scene=21#wechat_redirect" link-id="9591" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="别从 README 开始：一个架构师会怎样翻 Codex 仓库">别从 README 开始：一个架构师会怎样翻 Codex 仓库</a></span></span></p></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408860&amp;idx=1&amp;sn=b882b2ee97e3f798fea96e68d27c7071&amp;scene=21#wechat_redirect" link-id="bee5" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="Spec 不是代码的替代品，它是 AI Coding 的上下文管理层">Spec 不是代码的替代品，它是 AI Coding 的上下文管理层</a></span></span></p></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408848&amp;idx=1&amp;sn=aabf785116e9849dbd301a4f7c477181&amp;scene=21#wechat_redirect" link-id="9a81" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="如何让 Agents 自己设计、升级 Agents">如何让 Agents 自己设计、升级 Agents</a></span></span></p></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408832&amp;idx=1&amp;sn=ef00408738c853ea2e94be58c0612e51&amp;scene=21#wechat_redirect" link-id="f805" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="OpenAI怎么把开源项目维护做成工作流：Skills、AGENTS.md 和 CI 的一套组合拳">OpenAI怎么把开源项目维护做成工作流：Skills、AGENTS.md 和 CI 的一套组合拳</a></span></span></p></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408200&amp;idx=1&amp;sn=2f2cce7dfcbdb0766eac3590f777a17b&amp;scene=21#wechat_redirect" link-id="e8d6" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;font-size: 14px;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="Claude Skills 入门：把“会用 AI”变成“可复制的工程能力”">Claude Skills 入门：把“会用 AI”变成“可复制的工程能力”</a></span></span></p></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408189&amp;idx=1&amp;sn=7d4f7a442a22af37f95c46ff1048a3df&amp;scene=21#wechat_redirect" link-id="daab" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;font-size: 14px;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="一套可复制的 Claude Code 配置方案：CLAUDE.md、Rules、Commands、Hooks">一套可复制的 Claude Code 配置方案：CLAUDE.md、Rules、Commands、Hooks</a></span></span></p></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 1.75em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408183&amp;idx=1&amp;sn=0b6f1437465d3a61118db688cc889b17&amp;scene=21#wechat_redirect" link-id="bcea" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="Claude Code 最佳实践：把上下文变成生产力（团队可落地版）">Claude Code 最佳实践：把上下文变成生产力（团队可落地版）</a></span></span></section></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 1.75em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408169&amp;idx=1&amp;sn=7bba1377a31ffa0ce68932935c8d923a&amp;scene=21#wechat_redirect" link-id="8cfb" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="把 AI 当成新同事：Agent Coding 的上下文与验证体系">把 AI 当成新同事：Agent Coding 的上下文与验证体系</a></span></span></section></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 1.75em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408161&amp;idx=1&amp;sn=85aaff6f2f779e53b6ae9c5e1f003269&amp;scene=21#wechat_redirect" link-id="5fbf" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="一周写百万行的背后：Cursor长时间运行 Agent 的工程方法论">一周写百万行的背后：Cursor长时间运行 Agent 的工程方法论</a></span></span></section></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 1.75em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408141&amp;idx=1&amp;sn=e1e64ad73d25414957aa5206ca969fc3&amp;scene=21#wechat_redirect" link-id="0532" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="2026年生活重启指南">2026年生活重启指南</a></span></span></section></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 1.75em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408153&amp;idx=1&amp;sn=d33b48464de93a2573a0a0cb025ada9e&amp;scene=21#wechat_redirect" link-id="a4ba" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="我真不敢相信，AI 先加速的是工程师。">我真不敢相信，AI 先加速的是工程师。</a></span></span></section></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 1.75em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408128&amp;idx=1&amp;sn=1b6c640de61986d1364847bffb2cd28f&amp;scene=21#wechat_redirect" link-id="2e1e" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="扒一扒 Claude Cowork 系统提示词：Anthropic 如何打造数字同事">扒一扒 Claude Cowork 系统提示词：Anthropic 如何打造数字同事</a></span></span></section></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 1.75em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408114&amp;idx=1&amp;sn=29a754281cd07c16b6191c6d146c5837&amp;scene=21#wechat_redirect" link-id="048e" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="Cowork 安全架构深度解析：从 Claude Code 到 Cowork，Anthropic 如何把“可控”做成产品">Cowork 安全架构深度解析：从 Claude Code 到 Cowork，Anthropic 如何把“可控”做成产品</a></span></span></section></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 1.75em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408107&amp;idx=1&amp;sn=905552d68f5b174fd9548360bdea4448&amp;scene=21#wechat_redirect" link-id="70e8" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="Anthropic官方万字长文：AI Agent评估的系统化方法论">Anthropic官方万字长文：AI Agent评估的系统化方法论</a></span></span></section></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 1.75em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408084&amp;idx=1&amp;sn=82f274ba084f9c289e2d141aad0c088b&amp;scene=21#wechat_redirect" link-id="44c1" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="银弹还是枷锁？Claude Agent SDK 的架构真相">银弹还是枷锁？Claude Agent SDK 的架构真相</a></span></span></section></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 1.75em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408076&amp;idx=1&amp;sn=f139e90d699b528e80e79c558eed42ee&amp;scene=21#wechat_redirect" link-id="bf5b" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="Claude Code创始人亲授13条使用技巧">Claude Code创始人亲授13条使用技巧</a></span></span></section></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 1.75em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408028&amp;idx=1&amp;sn=3a8571a9fa0bd5d7e59cd66fc6187b3e&amp;scene=21#wechat_redirect" link-id="b20c" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="Claude Code 内部工具开源 code-simplifier：终结 AI 屎山代码的终极方案">Claude Code 内部工具开源 code-simplifier：终结 AI 屎山代码的终极方案</a></span></span></section></li></ul><ul class="list-paddingleft-1" style='-webkit-tap-highlight-color: transparent;margin: 0px;padding: 0px 0px 0px 1.6em;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;width: 577.422px;color: rgb(0, 0, 0);font-family: Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, "PingFang SC", Cambria, Cochin, Georgia, Times, "Times New Roman", serif;font-size: 16px;white-space: normal;'></ul></pre><ul class="list-paddingleft-1" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px 0px 0px 1.6em;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;width: 577.422px;color: rgb(0, 0, 0);font-family: Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, "PingFang SC", Cambria, Cochin, Georgia, Times, "Times New Roman", serif;font-size: 16px;white-space: normal;background-color: rgb(255, 255, 255);'></ul></pre>
<section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;background-color: rgb(255, 255, 255);letter-spacing: 0.578px;color: rgb(62, 62, 62);font-size: 16px;line-height: 25.6px;font-family: 微软雅黑;">
 <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 25.6px;">
  <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
    <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 25.6px;">
     <section powered-by="werss" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;color: rgb(63, 63, 63);font-family: Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, "PingFang SC", Cambria, Cochin, Georgia, Times, "Times New Roman", serif;letter-spacing: 0.544px;text-align: left;'>
      <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;color: rgb(160, 160, 160);font-family: 微软雅黑;letter-spacing: 0.544px;text-align: center;widows: 1;word-spacing: 2px;">
       <blockquote style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 1em 0px 20px;padding: 10px 20px 10px 15px;outline: 0px;border-left: 5px solid rgb(214, 219, 223);color: rgba(0, 0, 0, 0.55);font-size: 15px;text-indent: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;background-color: rgba(112, 138, 153, 0.098);">
        <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;text-align: left;">
         <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
          版权申明：内容来源网络，仅供学习研究，版权归原创者所有。如有侵权烦请告知，我们会立即删除并表示歉意。谢谢!
         </span>
        </p>
       </blockquote>
      </section>
     </section>
    </section>
    <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
     <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 20px 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
      <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;min-width: 0px;border-width: 0px;border-style: none;border-color: initial;font-size: 14px;">
       <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;min-width: 0px;border-width: 0px;border-style: initial;border-color: initial;font-size: 16.3636px;text-align: center;">
        <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;display: inline-block;">
         <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0em 0.5em 0.1em;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-weight: inherit;color: rgb(16, 146, 113);font-size: 1.8em;line-height: 1;">
          <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 20px;">
           <strong data-brushtype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px 50px 3px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;border-bottom: 1px solid rgb(2, 2, 2);border-top-color: rgb(2, 2, 2);border-right-color: rgb(2, 2, 2);border-left-color: rgb(2, 2, 2);display: block;line-height: 28px;">
            <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
             架构师
            </span>
           </strong>
          </span>
         </section>
         <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0.5em 1em;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 1em;font-weight: inherit;text-align: inherit;text-decoration: inherit;line-height: 1;color: rgb(120, 124, 129);">
          <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;">
           <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
            我们都是架构师！
           </span>
          </p>
          <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;">
           <span>
            <br/>
           </span>
          </p>
          <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;">
           <img src="https://mmbiz.qpic.cn/mmbiz/sXiaukvjR0RB58TtkIHwhn4lpsqLnZgian9d5tr1BibP7XpibGTFFib1nq9YuYq209XZUEfCOqMzepDOBbN9KD9wMSg/640?wx_fmt=jpeg&amp;wxfrom=5&amp;wx_lazy=1&amp;tp=webp#imgIndex=2" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0); margin: 0px; padding: 4px; outline: 0px; max-width: 100%; vertical-align: bottom; border-radius: 4px; border-width: 1px; border-style: solid; border-color: rgb(221, 221, 221); box-sizing: border-box !important; overflow-wrap: break-word !important; height: auto !important; width: 200px !important; visibility: visible !important;"/>
          </section>
         </section>
        </section>
       </section>
      </section>
     </section>
    </section>
   </section>
  </section>
 </section>
</section>
<section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;color: rgb(62, 62, 62);font-size: 16px;line-height: 25.6px;background-color: rgb(255, 255, 255);font-family: 微软雅黑;">
 <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 25.6px;">
  <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
    <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
     <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 20px 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box;overflow-wrap: break-word !important;">
      <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box;overflow-wrap: break-word !important;min-width: 0px;border-width: 0px;border-style: none;border-color: initial;font-size: 14px;">
       <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;color: rgb(62, 62, 62);font-family: 微软雅黑;font-size: 16.3636px;letter-spacing: 0.68px;text-align: center;white-space: normal;background-color: rgb(255, 255, 255);line-height: 25.6px;">
        <strong style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
         <strong style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
          <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
           关注
          </span>
         </strong>
         <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
          架构师(JiaGouX)，添加“星标”
         </span>
        </strong>
       </p>
       <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;color: rgb(62, 62, 62);font-family: 微软雅黑;font-size: 16.3636px;letter-spacing: 0.68px;text-align: center;white-space: normal;background-color: rgb(255, 255, 255);line-height: 25.6px;">
        <strong style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
         <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
          获取每天 AI 技术干货，一起成为牛逼架构师
         </span>
        </strong>
       </p>
       <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;color: rgb(62, 62, 62);font-family: 微软雅黑;font-size: 16.3636px;letter-spacing: 0.68px;text-align: center;white-space: normal;background-color: rgb(255, 255, 255);line-height: 25.6px;">
        <strong style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
         <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
          AI/Agent群请
         </span>
        </strong>
        <strong style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
         <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
          加若飞：
         </span>
        </strong>
        <strong style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
         <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;color: rgb(255, 76, 0);">
          <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
           1321113940
          </span>
         </span>
        </strong>
        <strong style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
         <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
          进群
         </span>
        </strong>
       </p>
       <p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;color: rgb(62, 62, 62);font-family: 微软雅黑;font-size: 16.3636px;letter-spacing: 0.68px;text-align: center;white-space: normal;background-color: rgb(255, 255, 255);line-height: 25.6px;">
        <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;">
         <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
          投稿、合作、版权等邮箱：
         </span>
         <strong style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
          <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;color: rgb(255, 0, 0);background-color: rgb(238, 236, 225);">
           <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
            admin@137x.com
           </span>
          </span>
         </strong>
        </span>
       </p>
      </section>
     </section>
    </section>
   </section>
  </section>
 </section>
</section>
<p style="display: none;">
 <mp-style-type data-value="3">
 </mp-style-type>
</p>