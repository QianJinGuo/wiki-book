---
title: "Subagents 详解：Claude Code 如何避免上下文污染"
source_url: https://mp.weixin.qq.com/s/qy_zaCZTCs1Ql3BIFmBMgg
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
source_type: wechat
provenance_state: extracted
sha256: 4c8677b280cf2e2e060b25f8ae2afbfe9ce9d2f41eb73e0f63d94a80c3b8a4d6
---
---
<p style="font-size: 0px; line-height: 0; margin: 0px; visibility: visible;">
 <span style="visibility: visible;">
 </span>
</p>
<section powered-by="werss" style='font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 15px; line-height: 1.75; text-align: left; visibility: visible;'>
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
   <mp-common-profile class="js_uneditable custom_select_card mp_profile_iframe mp_common_widget js_wx_tap_highlight" data-alias="JiaGouX" data-biz_account_status="0" data-from="0" data-headimg="http://mmbiz.qpic.cn/mmbiz_png/sXiaukvjR0RCNb3RYsCgx02T4J55ia2SnemY7uJHsDChxq6jAibbATlIKDgzLxz0zekXWjblzCDcL86AjbMNp02Tg/300?wx_fmt=png&amp;wxfrom=19" data-id="MzAwNjQwNzU2NQ==" data-index="0" data-is_biz_ban="0" data-isban="0" data-nickname="架构师" data-origin_num="126" data-pluginname="mpprofile" data-signature="专业架构师，专注高质量架构干货分享。三高架构（高可用、高性能、高稳定）、大数据、机器学习、Java架构、系统架构、分布式架构、人工智能等的架构讨论交流，以及结合互联网技术的架构调整，大规模架构实战分享。欢迎有想法、乐于分享的架构师交流学习。" data-verify_status="2" style="visibility: visible;">
   </mp-common-profile>
  </span>
 </section>
 <p style="color: rgb(62, 62, 62); font-size: 16px; white-space: normal; background-color: rgb(255, 255, 255); margin-bottom: 0px; visibility: visible;">
  <span style="visibility: visible;">
   <br style="visibility: visible;"/>
  </span>
 </p>
 <h1 data-heading="true" style="visibility: visible;">
  <span style='color: rgba(0, 0, 0, 0.9); font-size: 17px; font-family: mp-quote, "PingFang SC", system-ui, -apple-system, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; line-height: 1.6; letter-spacing: 0.034em; font-style: normal; font-weight: normal; visibility: visible;'>
   <br style="visibility: visible;"/>
  </span>
 </h1>
 <hr style="transform-origin: 0px 0px; transform: scale(1, 0.5); height: 1px; border: medium; margin: 2em 0px; background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0)); visibility: visible;"/>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   昨天在梳理 Agent Harness 的上下文管理，我一直在想一个很小但很真实的场景：
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   一个 Claude Code 会话跑了半小时，模型读了几十个文件，查了很多次
  </span>
  <code style="font-size: 90%; color: rgb(221, 17, 68); background: rgba(27, 31, 35, 0.05); padding: 3px 5px; border-radius: 4px; visibility: visible;">
   <span style="visibility: visible;">
    grep
   </span>
  </code>
  <span style="visibility: visible;">
   、
  </span>
  <code style="font-size: 90%; color: rgb(221, 17, 68); background: rgba(27, 31, 35, 0.05); padding: 3px 5px; border-radius: 4px; visibility: visible;">
   <span style="visibility: visible;">
    find
   </span>
  </code>
  <span style="visibility: visible;">
   、
  </span>
  <code style="font-size: 90%; color: rgb(221, 17, 68); background: rgba(27, 31, 35, 0.05); padding: 3px 5px; border-radius: 4px; visibility: visible;">
   <span style="visibility: visible;">
    ls
   </span>
  </code>
  <span style="visibility: visible;">
   ，中间还跑过测试、看过日志、改过方案。等真正要写代码或做决策时，窗口里已经塞满了你再也不会回头看的中间过程。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   这不是「上下文窗口不够大」这么简单。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   更靠谱的说法是，很多长会话把探索过程、任务状态、文件事实和最终判断全混在了同一个窗口里。窗口看起来很热闹，真正有用的工作集反而越来越脏。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   后来看到 Daniel San 那条关于 Claude Code Subagents 的帖子，正好把这个问题落到了一个很具体的机制上：会污染主窗口的探索过程，扔到独立的子代理里跑，主代理只拿回结果。
  </span>
 </p>
</section>
<section powered-by="werss" style="text-align: center; visibility: visible;">
 <img src="https://mmbiz.qpic.cn/mmbiz_png/Fnx2G2wYdEJFxmspFFS7umPePw34QvWAiaeJuHictUdQD3XpKT1fUG6GVCyTQ7ztJChHgUsBFkgCNnaywy5ptYbhvIPkYFEX36PuBUYnOiaNDw/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=0" style="height: auto !important; visibility: visible !important; width: 680px !important;"/>
</section>
<section powered-by="werss" style='font-family: -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 15px; line-height: 1.75; text-align: left; visibility: visible;'>
 <figure style="margin: 1.5em 8px; color: rgb(63, 63, 63); visibility: visible;">
  <figcaption style="text-align: center; color: rgb(136, 136, 136); font-size: 0.8em; visibility: visible;">
   <span style="visibility: visible;">
    Subagent 把探索过程留在独立窗口，只把结果交回主会话
   </span>
  </figcaption>
 </figure>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   正好在想这件事，就多看了两眼。它有意思的地方倒不是 Subagent 又多了一种用法，而是把这几天一直在聊的那条线，落到了一个很具体的动作上。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   前面写过，多智能体架构先看上下文边界。也聊过，Agent Harness 里的上下文，不太适合继续当聊天记录看，更像一个随时维护的工作集。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   Subagents 正好卡在这两个问题中间。它的价值倒不在于让系统「看起来更像团队」，更多是把那些必须发生、但留在主窗口里就是污染的探索过程，放到独立工作区里跑完。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   回头看这两个月 Claude Code 的相关讨论，主线其实在悄悄换：从「模型会不会写代码」，慢慢挪到「上下文、权限、工具、知识和验证边界能不能管住」。Subagents 算是其中一块拼图。
  </span>
 </p>
 <hr style="transform-origin: 0px 0px; transform: scale(1, 0.5); height: 1px; border: medium; margin: 2em 0px; background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0)); visibility: visible;"/>
 <h2 data-heading="true" style="display: table; margin: 4em auto 2em; color: rgb(255, 255, 255); background: rgb(9, 85, 217); font-weight: bold; text-align: center; padding: 0.3em 1.2em; font-size: 19.5px; border-radius: 8px 24px; box-shadow: rgba(0, 0, 0, 0.06) 0px 2px 6px; visibility: visible;">
  <span style="visibility: visible;">
   太长不看
  </span>
 </h2>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   先放结论。
  </span>
 </p>
 <ul class="list-paddingleft-1" style="margin-left: 0px; color: rgb(63, 63, 63); list-style: none; padding-left: 1.5em; visibility: visible;">
  <li style="display: block; color: rgb(63, 63, 63); margin: 0.5em 8px; visibility: visible;">
   <section powered-by="werss" style="visibility: visible;">
    <span style="visibility: visible;">
     • Claude Code 的 Subagent 更适合理解成独立工作区，不要先把它想成「多一个人帮忙」。
    </span>
   </section>
  </li>
  <li style="display: block; color: rgb(63, 63, 63); margin: 0.5em 8px; visibility: visible;">
   <section powered-by="werss" style="visibility: visible;">
    <span style="visibility: visible;">
     • 它最有价值的地方是隔离、压缩、并行：子代理自己搜索、读取、验证，主会话只拿回结论。
    </span>
   </section>
  </li>
  <li style="display: block; color: rgb(63, 63, 63); margin: 0.5em 8px; visibility: visible;">
   <section powered-by="werss" style="visibility: visible;">
    <span style="visibility: visible;">
     • 长会话里最容易污染上下文的，往往不是最终代码，而是一次性的搜索结果、测试日志、目录列表和排查分支。
    </span>
   </section>
  </li>
  <li style="display: block; color: rgb(63, 63, 63); margin: 0.5em 8px; visibility: visible;">
   <section powered-by="werss" style="visibility: visible;">
    <span style="visibility: visible;">
     • Claude Code 自带 Explore、Plan 这类内置子代理，已经帮你把最脏的探索阶段挡在主窗口之外。
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • 默认的 fresh subagent 适合把探索过程隔离出去；fork subagent 适合在必要时继承父会话完整背景，但它会放弃一部分输入隔离。
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     •
    </span>
    <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
     <span>
      description
     </span>
    </code>
    <span>
     不是装饰字段，它是路由契约。写得越清楚，Claude Code 越容易把任务派给对的子代理。
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • Subagents 不是万能架构。上下文切不干净、需要反复协商、多个阶段高度共享状态的任务，留在主循环里反而更稳。
    </span>
   </section>
  </li>
 </ul>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   所以从我的角度看，Subagent 与其当成「多智能体的表演」，不如当成 Agent Harness 的一种上下文卫生工具，定位会更稳。
  </span>
 </p>
 <hr style="border-style: solid;border-width: 2px 0 0;border-color: rgba(0, 0, 0, 0.1);-webkit-transform-origin: 0 0;-webkit-transform: scale(1, 0.5);transform-origin: 0 0;transform: scale(1, 0.5);height: 1px;border: none;margin: 2em 0;background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));"/>
 <h2 data-heading="true" style="display: table;margin: 4em auto 2em;color: #fff;background: rgba(9, 85, 217, 1);font-weight: bold;text-align: center;padding: 0.3em 1.2em;font-size: 19.5px;border-radius: 8px 24px 8px 24px;box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);">
  <span>
   同一条线索
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这两个月翻 Claude Code 相关的讨论，会看到不少表面不同、底子相近的经验。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Kaxil Naik 有条长帖讲得很扎实。他是 Apache Airflow 的 PMC member 和 core committer，也在 Astronomer 做工程管理。他现在的工作流里，Skills、Hooks、MCP、CLI、Subagents、Agent teams 都在用。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   帖子里他没有去比哪个模型最强，结论反而落在一句话上：Harness matters more than the model。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   放到本文的语境里大致是这意思：模型能力当然重要，但长任务能不能稳定跑下去，更多看外面那层 harness。规则怎么沉淀，工具怎么暴露，权限怎么限制，失败怎么被发现，探索过程怎么隔离，这些细节往往才是分水岭。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   同一条帖里他还提到一个挺扎心的点：Agent 失败很多时候不是「程序崩了」，而是「看起来挺对，差点就发出去了」。这也是我自己用得越久越警惕的地方。Subagents 当然能提速，但我更看重它让每一段工作有边界、有证据、有回收结果，最后仍然回到人来判断。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   还有一条流传不少的帖子也说到类似意思：项目一大，就需要 separation of concerns。
  </span>
  <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
   <span>
    CLAUDE.md
   </span>
  </code>
  <span>
   放标准和约束，skills 放可复用流程，hooks 放自动检查，Subagents 放隔离任务。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   听上去像方法论，做起来其实很工程。如果所有东西都堆在同一段对话里，Agent 早晚会变成一锅粥。问题往往不在模型不懂，而在你给它的工作区已经没有边界。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Metabase 团队那篇复盘也是同一条线：在一个 50 万行的 Clojure 后端代码库上，他们做了 10 个 custom subagents。原因不复杂，大代码库每个子系统都有自己的习惯和坑，Claude 每次为了理解一个子系统都要重新搜索、读取、摸索，这些探索会很快吃掉主上下文。他们的解法不是再加一个更全能的 Agent，而是按领域把工作边界拆成更具体的子代理。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   把这些材料放在一起看，我反倒不太想把本文写成一篇 Subagents 功能介绍。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   更值得留意的是另一层信号：2026 年了， AI 编程工作流越来越像在给模型设计一套运行时。模型负责推理，外面这层 harness 负责把环境整理成它能稳定工作的样子。这个分工，去年还不太说得清，现在大家都在补。
  </span>
 </p>
 <hr style="border-style: solid;border-width: 2px 0 0;border-color: rgba(0, 0, 0, 0.1);-webkit-transform-origin: 0 0;-webkit-transform: scale(1, 0.5);transform-origin: 0 0;transform: scale(1, 0.5);height: 1px;border: none;margin: 2em 0;background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));"/>
 <h2 data-heading="true" style="display: table;margin: 4em auto 2em;color: #fff;background: rgba(9, 85, 217, 1);font-weight: bold;text-align: center;padding: 0.3em 1.2em;font-size: 19.5px;border-radius: 8px 24px 8px 24px;box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);">
  <span>
   长会话为什么会变脏
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   做过稍长一点 Claude Code 任务的人，大概都有过类似体感。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   刚开始，窗口很清爽。用户目标、项目结构、关键文件、约束条件都还清楚。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   跑着跑着，模型开始探索：
  </span>
 </p>
 <pre style="background: #fff;color: #000;font-size: 90%;overflow-x: auto;border-radius: 8px;line-height: 1.5;margin: 10px 8px;border: 1px solid rgba(0, 0, 0, 0.04);padding: 0 !important;"><span style="display: flex;padding: 10px 14px 0;"><svg aria-label="插图" height="13px" role="img" version="1.1" viewbox="0 0 450 130" width="45px" x="0px" xmlns="http://www.w3.org/2000/svg" y="0px"><ellipse cx="50" cy="65" fill="rgb(237,108,96)" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2"></ellipse><ellipse cx="225" cy="65" fill="rgb(247,193,81)" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2"></ellipse><ellipse cx="400" cy="65" fill="rgb(100,200,86)" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2"></ellipse></svg></span><code style="font-size: 90%;border-radius: 4px;display: -webkit-box;padding: 0.5em 1em 1em;overflow-x: auto;text-indent: 0;color: inherit;background: none;white-space: nowrap;margin: 0;font-family: 'Fira Code', Menlo, Operator Mono, Consolas, Monaco, monospace;"><span>grep -R</span><span style="font-weight: 400;color: #00f;"><span> "AuthService"</span></span><span> .</span><span><br/></span><span>find . -name</span><span style="font-weight: 400;color: #00f;"><span> "*.ts"</span></span><span style="color: #808;"><span><br/></span><span>ls</span></span><span> packages/api/src</span><span><br/></span><span>npm</span><span style="color: #808;"><span> test</span></span><span> -- auth</span></code></pre>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这些动作没有问题。甚至可以说，它们是 Agent 真正能干活的前提。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   问题在于，每一次工具调用的输入和输出，都会进入会话历史。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   短任务里这不算什么。模型看一眼目录，读两个文件，做一个小修复，窗口足够用。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   任务一长，情况就变了。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   几十次搜索结果、重复的目录列表、被截断的日志、已经排除掉的代码路径，全都堆在同一段上下文里。真正有价值的信息，反而被低密度内容稀释。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Daniel San 在原帖里给了一个很直观的数字：半小时之后，你可能已经积累了 80k token 的噪音，这些信息你再也不会回头去看一遍。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   更麻烦的是压缩。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   当上下文接近上限，系统会做 compaction，把前面的内容压成摘要。压缩本身不是坏事，但如果窗口里大部分都是一次性探索痕迹，摘要就很容易把「无用噪音」和「关键事实」混在一起。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   最后主 Agent 看到的是一段看似完整、实际变薄的历史。关键决策的依据可能在压缩中被磨掉，剩下的只是一个貌似合理的总结。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这也是前面说「上下文不能当聊天记录」的原因。聊天记录只管保存发生过什么，工作集得关心的是下一轮推理到底需要什么。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Subagent 正好挡住了其中一类污染：那些必须做、但做完之后不值得长期留在主窗口里的探索过程。
  </span>
 </p>
 <hr style="border-style: solid;border-width: 2px 0 0;border-color: rgba(0, 0, 0, 0.1);-webkit-transform-origin: 0 0;-webkit-transform: scale(1, 0.5);transform-origin: 0 0;transform: scale(1, 0.5);height: 1px;border: none;margin: 2em 0;background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));"/>
 <h2 data-heading="true" style="display: table;margin: 4em auto 2em;color: #fff;background: rgba(9, 85, 217, 1);font-weight: bold;text-align: center;padding: 0.3em 1.2em;font-size: 19.5px;border-radius: 8px 24px 8px 24px;box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);">
  <span>
   Subagent 的价值不是「多开一个 Agent」
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Claude Code 官方文档里对 Subagent 的描述其实很直白：当一个 side task 会把主会话塞满搜索结果、日志或文件内容，而且这些东西后面不一定会再引用时，就让 Subagent 在自己的上下文里完成工作，只把 summary 返回主会话。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这句话基本把边界讲完了。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   我自己更倾向于把它当成「一次独立的工作区调用」来理解：子代理有自己的上下文窗口、自己的系统提示词、自己的工具集合和权限范围。主代理把任务派出去，它独立把活儿干完，最后只交回一份总结。
  </span>
 </p>
</section>
<section powered-by="werss" style="text-align: center;">
 <img src="https://mmbiz.qpic.cn/sz_mmbiz_png/Fnx2G2wYdEKuYHibvtia5qA6Mw8ZiaDyzGzJz3otQA6XOPT5WvJDEiauDtyKvBIINsT21hAgkjrdmY1yATLjJrzNbNT9d8voJfPpPF5wLyic56Ro/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=1" style="height: auto !important; visibility: visible !important; width: 680px !important;"/>
</section>
<section powered-by="werss" style="font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 15px;line-height: 1.75;text-align: left;">
 <figure style="margin: 1.5em 8px;color: #3f3f3f;">
  <figcaption style="text-align: center;color: #888;font-size: 0.8em;">
   <span>
    主 Agent 把探索、计划、审查交给不同 Subagent，最后只收回结果
   </span>
  </figcaption>
 </figure>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这件事真正值钱的地方，可以分成三层来看。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   第一层是隔离。子代理有自己的上下文窗口。它为了查清某个问题，可以读 20 个文件、跑 30 次搜索、看一堆日志。主会话完全不用看这些过程，只接收最后相关的结论、证据和风险。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   第二层是压缩。子代理返回的是最终结果，不是完整探索轨迹。一段低密度过程被自然压成了高密度信号。按原帖的说法，原本主窗口里 50 次工具调用的过程，最后只剩 3 行结论，其余中间状态全部丢弃。这里的省 token 是其次，主要是保护主 Agent 的注意力。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   第三层是并行。如果几条调查路径互不依赖，就可以并行跑。一个子代理看认证模块，一个看数据库迁移，一个看 API 调用链，最后由主 Agent 汇总。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   不过 Subagent 也不是哪里都好用。我自己用下来的体会是，它最适合「独立调查、结果回收」这一类任务。如果一项任务需要频繁来回讨论，或者规划、实现、测试之间共享大量中间状态，硬切出去反而会增加交接成本。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   跟前面聊 Sub-Agent VS Agent Team 时的判断是一致的：能按上下文边界切开的，才适合交给 Subagent；切不开的时候，多一个 Agent 不见得是好事。
  </span>
 </p>
 <hr style="border-style: solid;border-width: 2px 0 0;border-color: rgba(0, 0, 0, 0.1);-webkit-transform-origin: 0 0;-webkit-transform: scale(1, 0.5);transform-origin: 0 0;transform: scale(1, 0.5);height: 1px;border: none;margin: 2em 0;background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));"/>
 <h2 data-heading="true" style="display: table;margin: 4em auto 2em;color: #fff;background: rgba(9, 85, 217, 1);font-weight: bold;text-align: center;padding: 0.3em 1.2em;font-size: 19.5px;border-radius: 8px 24px 8px 24px;box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);">
  <span>
   一个 Subagent 文件长什么样
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Claude Code 的 Subagent 可以用一个带 frontmatter 的 Markdown 文件定义。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   原帖给了一个代码审查的例子，大致是这种形态：
  </span>
 </p>
 <pre style="background: #fff;color: #000;font-size: 90%;overflow-x: auto;border-radius: 8px;line-height: 1.5;margin: 10px 8px;border: 1px solid rgba(0, 0, 0, 0.04);padding: 0 !important;"><span style="display: flex;padding: 10px 14px 0;"><svg aria-label="插图" height="13px" role="img" version="1.1" viewbox="0 0 450 130" width="45px" x="0px" xmlns="http://www.w3.org/2000/svg" y="0px"><ellipse cx="50" cy="65" fill="rgb(237,108,96)" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2"></ellipse><ellipse cx="225" cy="65" fill="rgb(247,193,81)" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2"></ellipse><ellipse cx="400" cy="65" fill="rgb(100,200,86)" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2"></ellipse></svg></span><code style="font-size: 90%;border-radius: 4px;display: -webkit-box;padding: 0.5em 1em 1em;overflow-x: auto;text-indent: 0;color: inherit;background: none;white-space: nowrap;margin: 0;font-family: 'Fira Code', Menlo, Operator Mono, Consolas, Monaco, monospace;"><span>---</span><span><br/></span><span>name: code-reviewer</span><span><br/></span><span>description: Review code quality, security, and maintainability after code changes.</span><span><br/></span><span>tools: Read, Grep, Glob, Bash</span><span style="font-weight: 700;color: #48b;"><span><br/></span><span>model: sonnet</span><span><br/></span><span>---</span></span><span><br/></span><span><br/></span><span>You are a senior code reviewer.</span><span><br/></span><span><br/></span><span>When invoked:</span><span style="color: #f40;"><span><br/></span><span>1.</span></span><span> Run git diff to inspect recent changes</span><span style="color: #f40;"><span><br/></span><span>2.</span></span><span> Focus only on modified files</span><span style="color: #f40;"><span><br/></span><span>3.</span></span><span> Start the review immediately</span></code></pre>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Claude Code 会自动扫描这些文件，根据
  </span>
  <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
   <span>
    description
   </span>
  </code>
  <span>
   决定什么时候调用哪个子代理。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   文件可以放在不同位置，按从高到低的优先级大致是：
  </span>
 </p>
 <ul class="list-paddingleft-1" style="margin-left: 0;color: #3f3f3f;list-style: none;padding-left: 1.5em;">
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • 组织级 managed settings：跨团队统一下发；
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     •
    </span>
    <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
     <span>
      --agents
     </span>
    </code>
    <span>
     CLI flag：当前会话临时注入；
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     •
    </span>
    <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
     <span>
      .claude/agents/
     </span>
    </code>
    <span>
     ：项目级，适合纳入版本控制，团队共享；
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     •
    </span>
    <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
     <span>
      ~/.claude/agents/
     </span>
    </code>
    <span>
     ：个人级，跨项目可用；
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • 插件目录：随插件分发。
    </span>
   </section>
  </li>
 </ul>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   如果多个子代理同名，优先级更高的位置会生效。
  </span>
 </p>
</section>
<section powered-by="werss" style="text-align: center;">
 <img src="https://mmbiz.qpic.cn/mmbiz_png/Fnx2G2wYdEJUtEfrzw8V05N68IYxyJ6k1oROahYBNEO4G1YT2SuDxNkVeCpOibgrJdPAiaaiaRL1ib49iaticRic5u4pN7V70ekDWo5qmQTNKP4Nhg/640?wx_fmt=png&amp;from=appmsg&amp;watermark=1&amp;tp=webp&amp;wxfrom=5&amp;wx_lazy=1#imgIndex=2" style="height: auto !important; visibility: visible !important; width: 680px !important;"/>
</section>
<section powered-by="werss" style="font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 15px;line-height: 1.75;text-align: left;">
 <figure style="margin: 1.5em 8px;color: #3f3f3f;">
  <figcaption style="text-align: center;color: #888;font-size: 0.8em;">
   <span>
    Subagent 放在哪里，决定它服务谁
   </span>
  </figcaption>
 </figure>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   手工写文件是一种方式，也可以直接用 Claude Code 的
  </span>
  <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
   <span>
    /agents
   </span>
  </code>
  <span>
   界面来创建、查看和管理。对团队来说，我更喜欢先把项目级 agent 放进
  </span>
  <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
   <span>
    .claude/agents/
   </span>
  </code>
  <span>
   ，等模式稳定以后再沉淀成团队规范。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这里最值得留意的不是文件格式，而是
  </span>
  <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
   <span>
    description
   </span>
  </code>
  <span>
   。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   很多人会把它当成普通说明。放在 Agent 系统里，它其实是路由信号。Claude Code 要判断什么时候该调用哪个子代理，靠的就是这段描述。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   描述写得太宽，比如「help with code」，就容易变成什么都能接、什么都接不稳。描述写得太窄，又可能永远触发不了。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   我会把它写成三类信息：
  </span>
 </p>
 <ul class="list-paddingleft-1" style="margin-left: 0;color: #3f3f3f;list-style: none;padding-left: 1.5em;">
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • 这个子代理负责什么问题；
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • 什么时候应该调用它；
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • 它不负责什么。
    </span>
   </section>
  </li>
 </ul>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   比如一个更稳的审查代理，可以把描述写成：
  </span>
 </p>
 <pre style="background: #fff;color: #000;font-size: 90%;overflow-x: auto;border-radius: 8px;line-height: 1.5;margin: 10px 8px;border: 1px solid rgba(0, 0, 0, 0.04);padding: 0 !important;"><span style="display: flex;padding: 10px 14px 0;"><svg aria-label="插图" height="13px" role="img" version="1.1" viewbox="0 0 450 130" width="45px" x="0px" xmlns="http://www.w3.org/2000/svg" y="0px"><ellipse cx="50" cy="65" fill="rgb(237,108,96)" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2"></ellipse><ellipse cx="225" cy="65" fill="rgb(247,193,81)" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2"></ellipse><ellipse cx="400" cy="65" fill="rgb(100,200,86)" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2"></ellipse></svg></span><code style="font-size: 90%;border-radius: 4px;display: -webkit-box;padding: 0.5em 1em 1em;overflow-x: auto;text-indent: 0;color: inherit;background: none;white-space: nowrap;margin: 0;font-family: 'Fira Code', Menlo, Operator Mono, Consolas, Monaco, monospace;"><span>description: Review modified backend code for security, correctness, and maintainability. Use after implementation, not for planning or feature design.</span></code></pre>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这比「code reviewer」四个字有用得多。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   因为它不仅告诉模型「这是审查」，还告诉模型「实现后使用」「不负责规划」。边界越清楚，路由越稳。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这一点也能接上 Kaxil 那条帖子里的判断：好的 skill、hook、subagent，其实都是在把工程判断编码下来。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   以前这些判断藏在人的脑子里，靠 code review、口头提醒、团队习惯来传。现在它们慢慢挪到了 Markdown、工具描述、hooks 和 agent 配置里。这部分东西的权重，在 Agent 工作流里只会越来越高。
  </span>
 </p>
 <hr style="border-style: solid;border-width: 2px 0 0;border-color: rgba(0, 0, 0, 0.1);-webkit-transform-origin: 0 0;-webkit-transform: scale(1, 0.5);transform-origin: 0 0;transform: scale(1, 0.5);height: 1px;border: none;margin: 2em 0;background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));"/>
 <h2 data-heading="true" style="display: table;margin: 4em auto 2em;color: #fff;background: rgba(9, 85, 217, 1);font-weight: bold;text-align: center;padding: 0.3em 1.2em;font-size: 19.5px;border-radius: 8px 24px 8px 24px;box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);">
  <span>
   内置 Explore 和 Plan：把脏活挡在主窗口外
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   不一定要先自己写一堆 Subagent 才能享受到隔离的好处。Claude Code 已经自带了几个最常用的内置子代理，开箱即用，原帖里重点提到两个：Explore 和 Plan。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Explore 负责搜索和理解代码库，不做修改。它会在自己的窗口里跑 grep、find、ls、glob 这一类命令，主会话只拿到「相关结果」。那些没匹配上的、看了又排除的、扫了一眼就过的中间噪音，全部留在子代理的窗口里。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Plan 负责在 plan mode 下做上下文调查。它读取文件、理解架构、梳理约束，然后输出一份分步实施方案。中间过程主 Agent 完全看不到，只看到最终的计划文档。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这两个内置子代理背后的设计，挺值得借鉴。长任务里最「脏」的部分，往往在探索阶段，倒不一定在执行阶段。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   执行阶段会留下比较明确的产出：改了哪些文件、跑了哪些测试、还剩什么问题。探索阶段则相反，会产生大量临时路径：看过但无关的文件、试过但排除的方向、搜出来又没用的匹配项。这些东西对当下探索有价值，对后续主任务价值很低。让它们在子代理的独立窗口里出现，结束后只返回几条干净结论，主窗口才不会被磨花。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这一点和写系统时处理日志的逻辑很像。日志要有，但不会全塞进业务对象里。该查的时候能查，做决策时只带摘要。
  </span>
 </p>
 <hr style="border-style: solid;border-width: 2px 0 0;border-color: rgba(0, 0, 0, 0.1);-webkit-transform-origin: 0 0;-webkit-transform: scale(1, 0.5);transform-origin: 0 0;transform: scale(1, 0.5);height: 1px;border: none;margin: 2em 0;background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));"/>
 <h2 data-heading="true" style="display: table;margin: 4em auto 2em;color: #fff;background: rgba(9, 85, 217, 1);font-weight: bold;text-align: center;padding: 0.3em 1.2em;font-size: 19.5px;border-radius: 8px 24px 8px 24px;box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);">
  <span>
   Fork 很强，但别把它当默认
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Subagent 默认是 fresh context。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   它只拿到主 Agent 给它的任务描述，在独立窗口里完成工作。这样最干净，也最符合「隔离探索过程」的目标。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   但原帖重点提到一个新能力：fork。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   如果主会话已经投入了很多上下文，比如很长的项目理解、历史讨论和约束条件，子代理从空白开始可能要重新构建背景，成本高，也容易漏掉关键前提。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这时可以用：
  </span>
 </p>
 <pre style="background: #fff;color: #000;font-size: 90%;overflow-x: auto;border-radius: 8px;line-height: 1.5;margin: 10px 8px;border: 1px solid rgba(0, 0, 0, 0.04);padding: 0 !important;"><span style="display: flex;padding: 10px 14px 0;"><svg aria-label="插图" height="13px" role="img" version="1.1" viewbox="0 0 450 130" width="45px" x="0px" xmlns="http://www.w3.org/2000/svg" y="0px"><ellipse cx="50" cy="65" fill="rgb(237,108,96)" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2"></ellipse><ellipse cx="225" cy="65" fill="rgb(247,193,81)" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2"></ellipse><ellipse cx="400" cy="65" fill="rgb(100,200,86)" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2"></ellipse></svg></span><code style="font-size: 90%;border-radius: 4px;display: -webkit-box;padding: 0.5em 1em 1em;overflow-x: auto;text-indent: 0;color: inherit;background: none;white-space: nowrap;margin: 0;font-family: 'Fira Code', Menlo, Operator Mono, Consolas, Monaco, monospace;"><span style="color: #808;"><span>export</span></span><span> CLAUDE_CODE_FORK_SUBAGENT=1</span></code></pre>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   设置之后，所有新启动的子代理都默认 fork 父会话的完整上下文。也可以更精细一点，只在需要时通过
  </span>
  <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
   <span>
    /fork
   </span>
  </code>
  <span>
   斜杠命令按需复制。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   官方文档里说明了这一点：forked subagent 需要 Claude Code v2.1.117 或之后版本，仍属于 experimental。它会继承父会话到当前为止的完整上下文，看到相同的系统提示词、工具、模型和消息历史。它自己的工具调用仍然留在子代理里，最终只把结果返回主会话。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Daniel San 还提到 fork 的一个隐藏好处：fork 出来的子代理跟父代理共享 prompt cache 前缀，第二个之后的子代理在输入 token 上的成本可以低大概 10 倍。这对并行跑多个分支方案很重要。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   总结一下 fork 出来的子代理的特性：
  </span>
 </p>
 <ul class="list-paddingleft-1" style="margin-left: 0;color: #3f3f3f;list-style: none;padding-left: 1.5em;">
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • 继承复制时刻父代理的完整对话历史；
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • 与父代理共享 prompt cache 前缀，输入 token 成本显著降低；
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • 工具调用仍然隔离在子代理内部，不污染父会话；
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • 只把最终总结回写到父会话。
    </span>
   </section>
  </li>
 </ul>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这解决了一个很真实的问题：
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   有些子任务如果不继承背景，根本没法独立完成。比如你已经和主 Agent 梳理了半天迁移方案，现在想让几个分支方案并行验证。让每个子代理从零读项目，反而浪费。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   但我不会把 fork 当默认。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   原因也很简单：fork 复制的不只是有用背景，也会复制噪音。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   如果父窗口已经很脏，fork 只是把这份脏工作集复制给更多子代理。每个子代理看似「知道得更多」，实际可能一起被旧状态、无关日志和过期判断拖住。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   所以我更倾向于这样用：
  </span>
 </p>
 <section powered-by="werss" style="font-family: -apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif;font-size: 15px;line-height: 1.75;text-align: left;max-width: 100%;overflow: auto;-webkit-overflow-scrolling: touch;">
  <table style="color: #3f3f3f;margin-top: 0 !important;">
   <thead>
    <tr>
     <th align="left" style="border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;background: rgba(0, 0, 0, 0.05);text-align: left;">
      <section powered-by="werss">
       <span>
        场景
       </span>
      </section>
     </th>
     <th align="left" style="border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;background: rgba(0, 0, 0, 0.05);text-align: left;">
      <section powered-by="werss">
       <span>
        更适合的方式
       </span>
      </section>
     </th>
    </tr>
   </thead>
   <tbody>
    <tr>
     <td align="left" style="border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;text-align: left;">
      <section powered-by="werss">
       <span>
        查找代码模式、搜索影响面、阅读一批文件
       </span>
      </section>
     </td>
     <td align="left" style="border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;text-align: left;">
      <section powered-by="werss">
       <span>
        fresh Subagent
       </span>
      </section>
     </td>
    </tr>
    <tr>
     <td align="left" style="border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;text-align: left;">
      <section powered-by="werss">
       <span>
        安全审查、性能审查、测试覆盖率检查
       </span>
      </section>
     </td>
     <td align="left" style="border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;text-align: left;">
      <section powered-by="werss">
       <span>
        fresh Subagent + 明确任务描述
       </span>
      </section>
     </td>
    </tr>
    <tr>
     <td align="left" style="border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;text-align: left;">
      <section powered-by="werss">
       <span>
        已经有很长项目背景，子任务必须继承这些约束
       </span>
      </section>
     </td>
     <td align="left" style="border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;text-align: left;">
      <section powered-by="werss">
       <span>
        按需 fork
       </span>
      </section>
     </td>
    </tr>
    <tr>
     <td align="left" style="border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;text-align: left;">
      <section powered-by="werss">
       <span>
        想从同一个起点并行比较几个方案
       </span>
      </section>
     </td>
     <td align="left" style="border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;text-align: left;">
      <section powered-by="werss">
       <span>
        fork 可以考虑
       </span>
      </section>
     </td>
    </tr>
    <tr>
     <td align="left" style="border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;text-align: left;">
      <section powered-by="werss">
       <span>
        子任务之间需要持续共享中间状态
       </span>
      </section>
     </td>
     <td align="left" style="border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;text-align: left;">
      <section powered-by="werss">
       <span>
        不适合普通 Subagent，考虑主循环或共享状态结构
       </span>
      </section>
     </td>
    </tr>
    <tr>
     <td align="left" style="border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;text-align: left;">
      <section powered-by="werss">
       <span>
        父窗口已经很乱，只是想并行加速
       </span>
      </section>
     </td>
     <td align="left" style="border: 1px solid #dfdfdf;padding: 0.25em 0.5em;color: #3f3f3f;word-break: keep-all;text-align: left;">
      <section powered-by="werss">
       <span>
        先清理主任务，再考虑拆分
       </span>
      </section>
     </td>
    </tr>
   </tbody>
  </table>
 </section>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   说回到我自己怎么用：能用最小上下文说清的任务，尽量就不开 fork。fork 留给那些「不继承背景就完成不了」的子任务比较合适，别拿来当上下文管理的默认手段。
  </span>
 </p>
 <hr style="border-style: solid;border-width: 2px 0 0;border-color: rgba(0, 0, 0, 0.1);-webkit-transform-origin: 0 0;-webkit-transform: scale(1, 0.5);transform-origin: 0 0;transform: scale(1, 0.5);height: 1px;border: none;margin: 2em 0;background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));"/>
 <h2 data-heading="true" style="display: table;margin: 4em auto 2em;color: #fff;background: rgba(9, 85, 217, 1);font-weight: bold;text-align: center;padding: 0.3em 1.2em;font-size: 19.5px;border-radius: 8px 24px 8px 24px;box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);">
  <span>
   看见上下文：context-timeline 钩子
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Subagent 跑起来之后还有一个现实问题：从控制台你很难看清主代理上下文的状态，更看不清并行运行的几个子代理在做什么。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Daniel San 自己开发了一个 hook 来解决这件事，叫
  </span>
  <strong style="color: rgba(9, 85, 217, 1);font-weight: bold;font-size: inherit;">
   <span>
    context-timeline
   </span>
  </strong>
  <span>
   。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   安装命令很简单：
  </span>
 </p>
 <pre style="background: #fff;color: #000;font-size: 90%;overflow-x: auto;border-radius: 8px;line-height: 1.5;margin: 10px 8px;border: 1px solid rgba(0, 0, 0, 0.04);padding: 0 !important;"><span style="display: flex;padding: 10px 14px 0;"><svg aria-label="插图" height="13px" role="img" version="1.1" viewbox="0 0 450 130" width="45px" x="0px" xmlns="http://www.w3.org/2000/svg" y="0px"><ellipse cx="50" cy="65" fill="rgb(237,108,96)" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2"></ellipse><ellipse cx="225" cy="65" fill="rgb(247,193,81)" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2"></ellipse><ellipse cx="400" cy="65" fill="rgb(100,200,86)" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2"></ellipse></svg></span><code style="font-size: 90%;border-radius: 4px;display: -webkit-box;padding: 0.5em 1em 1em;overflow-x: auto;text-indent: 0;color: inherit;background: none;white-space: nowrap;margin: 0;font-family: 'Fira Code', Menlo, Operator Mono, Consolas, Monaco, monospace;"><span>npx claude-code-templates@latest --hook monitoring/context-timeline</span></code></pre>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   它做的事不复杂：会话一开启就启动，用时间轴的方式展示主代理的上下文窗口，以及子代理如何在各自独立窗口里运行。每个正在跑的子代理状态都实时显示，等它执行完毕，返回给主代理的内容也会同步呈现。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这种工具看起来不起眼，但对长会话的可观测性很有帮助。当你能清楚看到「主窗口现在有什么」「子代理在跑什么」「它最终交回了什么」，你才能真正信任这套委派关系。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   如果不打算装新工具，至少也建议在 Claude Code 里养成一个习惯：定期用
  </span>
  <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
   <span>
    /context
   </span>
  </code>
  <span>
   这类命令观察主窗口的占用，发现某段时间塞了大量探索痕迹，就主动把它委派出去。
  </span>
 </p>
 <hr style="border-style: solid;border-width: 2px 0 0;border-color: rgba(0, 0, 0, 0.1);-webkit-transform-origin: 0 0;-webkit-transform: scale(1, 0.5);transform-origin: 0 0;transform: scale(1, 0.5);height: 1px;border: none;margin: 2em 0;background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));"/>
 <h2 data-heading="true" style="display: table;margin: 4em auto 2em;color: #fff;background: rgba(9, 85, 217, 1);font-weight: bold;text-align: center;padding: 0.3em 1.2em;font-size: 19.5px;border-radius: 8px 24px 8px 24px;box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);">
  <span>
   我自己常放的几个 Subagents
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   如果要往项目里真的放几个
  </span>
  <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
   <span>
    .claude/agents/
   </span>
  </code>
  <span>
   ，我倾向于先从很少的几个开始。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   第一类是代码审查。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   它适合独立，因为审查者不需要知道主 Agent 的所有中间想法，只需要看到 diff、相关文件、项目规则和测试结果。返回时最好带文件路径、问题等级、证据和建议，不要只写「整体没问题」。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   第二类是影响面分析。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   比如改一个接口、删一个字段、迁移一个配置项。子代理可以专门搜索引用、调用链、测试覆盖和文档残留。它的输出是「哪些地方受影响」，不是「我读了哪些文件」。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   第三类是测试诊断。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   测试失败时，主 Agent 往往会被日志淹没。让子代理单独看失败日志、定位可能原因、给出最小复现路径，再把结论还给主 Agent，会干净很多。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   第四类是文档一致性检查。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   代码改完后，另一个子代理去看 README、AGENTS.md、配置说明、示例命令有没有过期。这类工作边界清楚，也不需要和主 Agent 长时间共享状态。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   但我不会一开始就建十几个。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Subagent 也是接口。接口太多，路由就会变复杂，维护成本也会上来。先放两三个高频、边界清楚、收益稳定的，跑一段时间再加。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   一个我比较喜欢的 Subagent 模板，会刻意写清四件事：
  </span>
 </p>
 <pre style="background: #fff;color: #000;font-size: 90%;overflow-x: auto;border-radius: 8px;line-height: 1.5;margin: 10px 8px;border: 1px solid rgba(0, 0, 0, 0.04);padding: 0 !important;"><span style="display: flex;padding: 10px 14px 0;"><svg aria-label="插图" height="13px" role="img" version="1.1" viewbox="0 0 450 130" width="45px" x="0px" xmlns="http://www.w3.org/2000/svg" y="0px"><ellipse cx="50" cy="65" fill="rgb(237,108,96)" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2"></ellipse><ellipse cx="225" cy="65" fill="rgb(247,193,81)" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2"></ellipse><ellipse cx="400" cy="65" fill="rgb(100,200,86)" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2"></ellipse></svg></span><code style="font-size: 90%;border-radius: 4px;display: -webkit-box;padding: 0.5em 1em 1em;overflow-x: auto;text-indent: 0;color: inherit;background: none;white-space: nowrap;margin: 0;font-family: 'Fira Code', Menlo, Operator Mono, Consolas, Monaco, monospace;"><span>---</span><span><br/></span><span>name: backend-impact-analyzer</span><span><br/></span><span>description: Analyze the impact of backend API or schema changes. Use before implementation or after changing shared contracts. Do not modify files.</span><span><br/></span><span>tools: Read, Grep, Glob</span><span style="font-weight: 700;color: #48b;"><span><br/></span><span>model: sonnet</span><span><br/></span><span>---</span></span><span><br/></span><span><br/></span><span>You analyze impact scope for backend changes.</span><span><br/></span><span><br/></span><span>Return:</span><span style="color: #f40;"><span><br/></span><span>1.</span></span><span> Affected files and why they matter</span><span style="color: #f40;"><span><br/></span><span>2.</span></span><span> Compatibility risks</span><span style="color: #f40;"><span><br/></span><span>3.</span></span><span> Tests that should be added or updated</span><span style="color: #f40;"><span><br/></span><span>4.</span></span><span> Unknowns that require human or main-agent confirmation</span><span><br/></span><span><br/></span><span>Do not edit files.</span><span><br/></span><span>Do not propose broad refactors.</span></code></pre>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这里有几个细节：
  </span>
 </p>
 <ul class="list-paddingleft-1" style="margin-left: 0;color: #3f3f3f;list-style: none;padding-left: 1.5em;">
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     •
    </span>
    <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
     <span>
      Do not modify files
     </span>
    </code>
    <span>
     写进描述和正文，避免分析代理越权执行；
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • 工具集只给
    </span>
    <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
     <span>
      Read, Grep, Glob
     </span>
    </code>
    <span>
     ，从权限层面就堵住「顺手改一改」的可能；
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • 输出格式要求「受影响文件、兼容风险、测试、未知项」，方便主 Agent 继续用；
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • 明确不要做大重构，减少子代理跑偏。
    </span>
   </section>
  </li>
 </ul>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这类约束看起来啰嗦，但对 Agent 很有用。不显式写出来，它常常会自己补一套更模糊的版本。
  </span>
 </p>
 <hr style="border-style: solid;border-width: 2px 0 0;border-color: rgba(0, 0, 0, 0.1);-webkit-transform-origin: 0 0;-webkit-transform: scale(1, 0.5);transform-origin: 0 0;transform: scale(1, 0.5);height: 1px;border: none;margin: 2em 0;background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));"/>
 <h2 data-heading="true" style="display: table;margin: 4em auto 2em;color: #fff;background: rgba(9, 85, 217, 1);font-weight: bold;text-align: center;padding: 0.3em 1.2em;font-size: 19.5px;border-radius: 8px 24px 8px 24px;box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);">
  <span>
   最容易踩的坑
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Subagent 本身不复杂，真正容易出问题的是使用姿势。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <strong style="color: rgba(9, 85, 217, 1);font-weight: bold;font-size: inherit;">
   <span>
    第一个坑，是把委派写得太含糊。
   </span>
  </strong>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   「帮我看一下这个模块有没有问题」这种任务，子代理大概率会发散。更好的写法是：「只检查认证模块最近 diff 中的安全风险，重点看 token 校验、权限绕过和敏感日志，返回 P0/P1/P2 级别问题。」
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   任务越具体，子代理越像工具。任务越含糊，子代理越像另一个会跑偏的聊天窗口。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <strong style="color: rgba(9, 85, 217, 1);font-weight: bold;font-size: inherit;">
   <span>
    第二个坑，是让子代理返回太多过程。
   </span>
  </strong>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   如果子代理把所有搜索结果、完整日志、读过的文件都倒回主窗口，隔离价值就没了。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   主 Agent 需要的是结论、证据、下一步动作。必要时带 2 到 3 个文件锚点就够了。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <strong style="color: rgba(9, 85, 217, 1);font-weight: bold;font-size: inherit;">
   <span>
    第三个坑，是把需要共享状态的任务硬切出去。
   </span>
  </strong>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   比如一个复杂重构，前端、后端、测试、文档每一步都互相影响。你强行拆成四个彼此隔离的 Subagents，最后会花更多成本做合并和纠偏。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这种任务也可以并行，但要先设计共享状态层、契约和回滚点。普通 Subagent 更适合「独立调查，结果回收」。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <strong style="color: rgba(9, 85, 217, 1);font-weight: bold;font-size: inherit;">
   <span>
    第四个坑，是 fork 上瘾。
   </span>
  </strong>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   fork 很强，但它解决的是「必要背景继承」，不是「上下文管理」。一个长期依赖 fork 的工作流，往往说明任务委派还不够清楚，或者稳定知识还没有沉淀到文件、规则和工具里。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   更好的方向，是把可复用背景写进
  </span>
  <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
   <span>
    .claude/agents/
   </span>
  </code>
  <span>
   、AGENTS.md、项目文档、测试和脚本。让子代理按需读取，而不是每次复制整段父会话。
  </span>
 </p>
 <hr style="border-style: solid;border-width: 2px 0 0;border-color: rgba(0, 0, 0, 0.1);-webkit-transform-origin: 0 0;-webkit-transform: scale(1, 0.5);transform-origin: 0 0;transform: scale(1, 0.5);height: 1px;border: none;margin: 2em 0;background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));"/>
 <h2 data-heading="true" style="display: table;margin: 4em auto 2em;color: #fff;background: rgba(9, 85, 217, 1);font-weight: bold;text-align: center;padding: 0.3em 1.2em;font-size: 19.5px;border-radius: 8px 24px 8px 24px;box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);">
  <span>
   总的来看
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   把最近几篇放在一起看，线索其实很一致。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650409155&amp;idx=1&amp;sn=9f539bb63197dd513ab0901cd55b1112&amp;scene=21#wechat_redirect" link-id="3ced" linktype="text" style="" target="_blank" textvalue="多智能体架构先看上下文边界">
    多智能体架构先看上下文边界
   </a>
   。上下文管理要把聊天记录改造成工作集。Subagent 则是其中一个相当实用的执行机制：一次性探索放进独立窗口，主窗口只留下结果。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   所以 Subagent 不只是 Claude Code 的一个功能点。它背后是 Agent 系统在补的一层能力：模型负责推理，外面这层 harness 负责管理工作区。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   哪些内容进窗口，哪些内容留在窗口外，哪些探索可以丢弃，哪些状态必须持久化，哪些任务适合 fork，哪些任务只能共享状态。这些问题不会因为模型窗口变大而消失。窗口越大，反而越需要打理。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   更大的窗口很容易给人一种错觉：什么都能塞，什么都先留着。但长任务真正需要的不是「记住一切」，而是在每一轮调用前，把该看的东西摆到模型面前，把不该干扰它的东西挡在外面。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这也是 Kaxil 那句 Harness matters more than the model 让我多看了好几眼的原因。模型当然重要。只是到了长任务、多人协作、大代码库和生产系统里，模型外面的结构会越来越决定下限。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   如果说 2025 年很多人还在比较模型聪不聪明，2026 年更值得盯的，可能是这些看起来朴素的东西：
  </span>
 </p>
 <ul class="list-paddingleft-1" style="margin-left: 0;color: #3f3f3f;list-style: none;padding-left: 1.5em;">
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     •
    </span>
    <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
     <span>
      .claude/agents/
     </span>
    </code>
    <span>
     里的子代理边界；
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     •
    </span>
    <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
     <span>
      CLAUDE.md
     </span>
    </code>
    <span>
     里的项目规则；
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • hooks 里的硬约束；
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • MCP 和 CLI 里的工具契约；
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • compaction、fork、summary、memory 这些上下文管理策略；
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • 人类工程师最后怎么 review、怎么承担责任。
    </span>
   </section>
  </li>
 </ul>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这些东西不热闹，但它们让 Agent 从「能演示」走向「能长期用」。
  </span>
 </p>
 <hr style="border-style: solid;border-width: 2px 0 0;border-color: rgba(0, 0, 0, 0.1);-webkit-transform-origin: 0 0;-webkit-transform: scale(1, 0.5);transform-origin: 0 0;transform: scale(1, 0.5);height: 1px;border: none;margin: 2em 0;background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));"/>
 <h2 data-heading="true" style="display: table;margin: 4em auto 2em;color: #fff;background: rgba(9, 85, 217, 1);font-weight: bold;text-align: center;padding: 0.3em 1.2em;font-size: 19.5px;border-radius: 8px 24px 8px 24px;box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);">
  <span>
   写在最后
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   如果现在要在 Claude Code 里上手 Subagents，我自己不会一上来就搭一套复杂的 Agent Team，也不会一口气写一堆角色。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   更稳妥的起点，是几个最朴素的子代理：一个只做代码审查，一个只做影响面搜索，一个只做测试失败诊断。先把它们扔进
  </span>
  <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
   <span>
    .claude/agents/
   </span>
  </code>
  <span>
   里跑一跑，观察两件事就够了：
  </span>
 </p>
 <ul class="list-paddingleft-1" style="margin-left: 0;color: #3f3f3f;list-style: none;padding-left: 1.5em;">
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • 主会话是不是少了大量无用搜索和日志；
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • 子代理返回的结论，主 Agent 能不能直接接着用。
    </span>
   </section>
  </li>
 </ul>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这两件事如果都成立，基本可以确认它在帮你改善上下文工作集。坦率说，我自己在 description 这一项上就反复改过好几版，到现在也不能说调到了最稳的状态。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   至于 fork、prompt cache、context-timeline 这些能力，可以放到后面再补。它们都很有价值，但前提是先把最基础的边界切对。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   回头看，长任务跑不稳，原因往往不是少了一个更聪明的模型，更多是窗口里堆了太多本该用完就丢的东西。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   参考来源：
  </span>
 </p>
 <ul class="list-paddingleft-1" style="margin-left: 0;color: #3f3f3f;list-style: none;padding-left: 1.5em;">
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • Daniel San，
    </span>
    <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
     <span>
      Keep your Claude Code context clean with Subagents
     </span>
    </code>
    <span>
     ，2026-04-27 03:35，https://x.com/dani_avila7/status/2048486242321662189
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • Claude Code Docs，
    </span>
    <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
     <span>
      Create custom subagents
     </span>
    </code>
    <span>
     ，https://code.claude.com/docs/en/sub-agents
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • Kaxil Naik，
    </span>
    <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
     <span>
      I Haven't Written a Line of Code in 4 Months (But I Ship More Than Ever)
     </span>
    </code>
    <span>
     ，2026-03-27，https://x.com/kaxil/status/2037503513350005134
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • tut_ml，关于 Claude Code separation of concerns 的推文，2026-03-01，https://x.com/tut_ml/status/2028073256683794535
    </span>
   </section>
  </li>
  <li style="display: block;color: #3f3f3f;margin: 0.5em 8px;">
   <section powered-by="werss">
    <span>
     • Metabase，
    </span>
    <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
     <span>
      How we built ten custom subagents to tame a 500K-line Clojure codebase
     </span>
    </code>
    <span>
     ，2026-04-16，https://www.metabase.com/blog/ten-custom-subagents
    </span>
   </section>
  </li>
 </ul>
</section>
<p style="font-size: 0px;line-height: 0;margin: 0px;">
 <span>
 </span>
</p>
<section powered-by="werss" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px 0px 24px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;color: rgba(0, 0, 0, 0.9);font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;background-color: rgb(255, 255, 255);font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 15px;line-height: 1.75;text-align: left;visibility: visible;'>
 <h2 data-heading="true" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 4em auto 2em;padding: 0.3em 1.2em;outline: 0px;font-weight: bold;font-size: 19.5px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;display: table;color: rgb(255, 255, 255);background: rgb(9, 85, 217);text-align: center;border-radius: 8px 24px;box-shadow: rgba(0, 0, 0, 0.06) 0px 2px 6px;">
  <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   相关推文
  </span>
 </h2>
 <ul class="list-paddingleft-1" style="list-style-type: disc;">
  <li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0.5em 8px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;display: block;color: rgb(63, 63, 63);">
   <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
    <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
     • 《
     <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650409084&amp;idx=1&amp;sn=b8db9f9925f5dba578cfc7044981f25a&amp;scene=21#wechat_redirect" link-id="5971" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="Agent Harness 综述：同一个模型，为什么做出来的 Agent 差这么远">
      Agent Harness 综述：同一个模型，为什么做出来的 Agent 差这么远
     </a>
     》
    </span>
   </section>
  </li>
  <li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0.5em 8px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;display: block;color: rgb(63, 63, 63);">
   <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
    <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
     • 《
     <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408377&amp;idx=1&amp;sn=6be411740b1243bbe7cfe24890db5958&amp;scene=21#wechat_redirect" link-id="c064" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="MCP 退潮后，CLI 又成了王？一套更务实的判断框架">
      MCP 退潮后，CLI 又成了王？一套更务实的判断框架
     </a>
     》
    </span>
   </section>
  </li>
  <li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0.5em 8px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;display: block;color: rgb(63, 63, 63);">
   <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
    <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
     • 《
     <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650409130&amp;idx=1&amp;sn=29576ecf2bb5e765e21d4d42ff6d284e&amp;scene=21#wechat_redirect" link-id="5ab3" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="再看 Hermes Skills：Agent 如何自我进化？">
      再看 Hermes Skills：Agent 如何自我进化？
     </a>
     》
    </span>
   </section>
  </li>
  <li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0.5em 8px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;display: block;color: rgb(63, 63, 63);">
   <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
    <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
     • 《
     <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408950&amp;idx=1&amp;sn=8c14e4b7726dd478644e0a8e1acfbad4&amp;scene=21#wechat_redirect" link-id="8d6c" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="Agent 的下一步不是更长记忆，而是会维护过程资产">
      Agent 的下一步不是更长记忆，而是会维护过程资产
     </a>
     》
    </span>
   </section>
  </li>
  <li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0.5em 8px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;display: block;color: rgb(63, 63, 63);">
   <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
    <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
     • 《
     <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650409144&amp;idx=1&amp;sn=0d15111cf536be0d6aa1946d5a225ae9&amp;scene=21#wechat_redirect" link-id="b3de" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="如何为 Agent 设计产品？">
      如何为 Agent 设计产品？
     </a>
     》
    </span>
    <span>
     <br/>
    </span>
   </section>
  </li>
  <li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0.5em 8px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;display: block;color: rgb(63, 63, 63);">
   <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
    <span>
     <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650409162&amp;idx=1&amp;sn=62556a10e227bcb8d977a4f3e0006c8b&amp;scene=21#wechat_redirect" link-id="83f0" linktype="text" style='font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;letter-spacing: 0.544px;' target="_blank" textvalue="Agent Harness 上下文管理：聊天记录还是工作集？">
      Agent Harness 上下文管理：聊天记录还是工作集？
     </a>
    </span>
   </section>
  </li>
  <li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0.5em 8px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;display: block;color: rgb(63, 63, 63);">
   <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
    <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
     <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650409155&amp;idx=1&amp;sn=9f539bb63197dd513ab0901cd55b1112&amp;scene=21#wechat_redirect" link-id="27ca" linktype="text" style="" target="_blank" textvalue="Sub-Agent VS Agent Team：多智能体架构和上下文边界">
      Sub-Agent VS Agent Team：多智能体架构和上下文边界
     </a>
    </span>
   </section>
  </li>
 </ul>
 <hr style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 2em 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;transform-origin: 0px 0px;transform: scale(1, 0.5);height: 1px;border-width: medium;border-style: none;border-color: currentcolor;border-image: initial;background: linear-gradient(to right, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));"/>
 <p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 10px 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;-webkit-text-stroke-width: 0px;white-space: normal;text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;color: rgb(62, 62, 62);font-size: 16px;text-align: center;widows: 1;word-spacing: 2px;background-color: rgb(255, 255, 255);line-height: 2em;'>
  <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 13px;letter-spacing: 0.5px;color: rgb(0, 128, 255);">
   <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-family: "PingFang SC", -apple-system-font, system-ui, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;'>
    <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
     如喜欢本文，请点击右上角，把文章分享到朋友圈
    </span>
   </span>
  </span>
 </p>
 <p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 10px 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;-webkit-text-stroke-width: 0px;white-space: normal;text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;color: rgb(62, 62, 62);font-size: 16px;text-align: center;widows: 1;word-spacing: 2px;background-color: rgb(255, 255, 255);line-height: 2em;'>
  <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 13px;letter-spacing: 0.5px;color: rgb(0, 128, 255);">
   <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-family: "PingFang SC", -apple-system-font, system-ui, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;'>
    <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
     如有想了解学习的技术点，请留言给若飞安排分享
    </span>
   </span>
  </span>
 </p>
 <p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 10px 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;-webkit-text-stroke-width: 0px;white-space: normal;text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;color: rgb(62, 62, 62);font-size: 16px;text-align: center;widows: 1;word-spacing: 2px;background-color: rgb(255, 255, 255);line-height: 2em;'>
  <strong style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
   <span style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-family: "PingFang SC", -apple-system-font, system-ui, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 13px;letter-spacing: 0.5px;color: rgb(217, 33, 66);'>
    <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
     因公众号更改推送规则，请点“在看”并加“星标”第一时间获取精彩技术分享
    </span>
   </span>
  </strong>
 </p>
 <p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 10px 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;-webkit-text-stroke-width: 0px;white-space: normal;text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;color: rgb(62, 62, 62);font-size: 16px;text-align: center;widows: 1;word-spacing: 2px;background-color: rgb(255, 255, 255);line-height: 2em;'>
  <strong style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;letter-spacing: 0.544px;font-family: 微软雅黑;font-size: 16.3636px;">
   <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
    ·END·
   </span>
  </strong>
 </p>
 <pre style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;font-size: 15px;text-align: left;background-color: rgb(255, 255, 255);color: rgb(89, 89, 89);"><pre style="-webkit-tap-highlight-color: transparent;margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;color: rgb(89, 89, 89);font-size: 15px;letter-spacing: 0.544px;text-align: left;widows: 1;word-spacing: 1px;caret-color: rgb(0, 0, 0);background-color: rgb(255, 255, 255);"><p style='-webkit-tap-highlight-color: transparent;margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;color: rgb(0, 0, 0);font-family: Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, "PingFang SC", Cambria, Cochin, Georgia, Times, "Times New Roman", serif;font-size: 16px;white-space: normal;'><strong style="-webkit-tap-highlight-color: transparent;margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">相关阅读：</span></strong></p><ul class="list-paddingleft-1" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px 0px 0px 1.6em;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;color: rgb(0, 0, 0);font-family: Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, "PingFang SC", Cambria, Cochin, Georgia, Times, "Times New Roman", serif;font-size: 16px;letter-spacing: 0.544px;text-align: left;widows: 1;word-spacing: 1px;caret-color: rgb(0, 0, 0);background-color: rgb(255, 255, 255);width: 577.422px;'><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408930&amp;idx=1&amp;sn=2fd7f3701ae8688e7720f80bb8296936&amp;scene=21#wechat_redirect" link-id="c57b" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="刚刚，Claude Code“代码泄露”背后：如何重新看 Agent Harness">刚刚，Claude Code“代码泄露”背后：如何重新看 Agent Harness</a></span></span></p></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408900&amp;idx=1&amp;sn=93bbae7c90fc03fb510f450c6fee97e0&amp;scene=21#wechat_redirect" link-id="4e80" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="大家都在讲 Harness，但它到底该怎么理解">大家都在讲 Harness，但它到底该怎么理解</a></span></span></p></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408891&amp;idx=1&amp;sn=639dc4a7c8482f6e1ac04d8d53c63459&amp;scene=21#wechat_redirect" link-id="78ff" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="模型越来越强，为什么大家却开始重写 Harness">模型越来越强，为什么大家却开始重写 Harness</a></span></span></p></li></ul><ul class="list-paddingleft-1" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px 0px 0px 1.6em;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;color: rgb(0, 0, 0);font-family: Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, "PingFang SC", Cambria, Cochin, Georgia, Times, "Times New Roman", serif;font-size: 16px;letter-spacing: 0.544px;text-align: left;widows: 1;word-spacing: 1px;caret-color: rgb(0, 0, 0);background-color: rgb(255, 255, 255);width: 577.422px;'><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408877&amp;idx=1&amp;sn=d27eb9e99ed526e342df775f0291cb2e&amp;scene=21#wechat_redirect" link-id="b83d" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="如何让单个 Agent 做长任务不失真：Anthropic 给出了一套更工程化的答案">如何让单个 Agent 做长任务不失真：Anthropic 给出了一套更工程化的答案</a></span></span></p></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408884&amp;idx=1&amp;sn=6a2fa56f70f15cdd75eb5c2b12e687ef&amp;scene=21#wechat_redirect" link-id="4d42" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="Claude Code高手的 8 个 Claude Code 实战习惯">Claude Code高手的 8 个 Claude Code 实战习惯</a></span></span></p></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408870&amp;idx=1&amp;sn=ba53595a44ab55396b36795fbc78791b&amp;scene=21#wechat_redirect" link-id="2e66" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="别从 README 开始：一个架构师会怎样翻 Codex 仓库">别从 README 开始：一个架构师会怎样翻 Codex 仓库</a></span></span></p></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408860&amp;idx=1&amp;sn=b882b2ee97e3f798fea96e68d27c7071&amp;scene=21#wechat_redirect" link-id="40d7" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="Spec 不是代码的替代品，它是 AI Coding 的上下文管理层">Spec 不是代码的替代品，它是 AI Coding 的上下文管理层</a></span></span></p></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408848&amp;idx=1&amp;sn=aabf785116e9849dbd301a4f7c477181&amp;scene=21#wechat_redirect" link-id="ad2d" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="如何让 Agents 自己设计、升级 Agents">如何让 Agents 自己设计、升级 Agents</a></span></span></p></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408832&amp;idx=1&amp;sn=ef00408738c853ea2e94be58c0612e51&amp;scene=21#wechat_redirect" link-id="1473" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="OpenAI怎么把开源项目维护做成工作流：Skills、AGENTS.md 和 CI 的一套组合拳">OpenAI怎么把开源项目维护做成工作流：Skills、AGENTS.md 和 CI 的一套组合拳</a></span></span></p></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408200&amp;idx=1&amp;sn=2f2cce7dfcbdb0766eac3590f777a17b&amp;scene=21#wechat_redirect" link-id="9b0b" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;font-size: 14px;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="Claude Skills 入门：把“会用 AI”变成“可复制的工程能力”">Claude Skills 入门：把“会用 AI”变成“可复制的工程能力”</a></span></span></p></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><p style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408189&amp;idx=1&amp;sn=7d4f7a442a22af37f95c46ff1048a3df&amp;scene=21#wechat_redirect" link-id="6df6" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;font-size: 14px;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="一套可复制的 Claude Code 配置方案：CLAUDE.md、Rules、Commands、Hooks">一套可复制的 Claude Code 配置方案：CLAUDE.md、Rules、Commands、Hooks</a></span></span></p></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 1.75em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408183&amp;idx=1&amp;sn=0b6f1437465d3a61118db688cc889b17&amp;scene=21#wechat_redirect" link-id="439d" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="Claude Code 最佳实践：把上下文变成生产力（团队可落地版）">Claude Code 最佳实践：把上下文变成生产力（团队可落地版）</a></span></span></section></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 1.75em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408169&amp;idx=1&amp;sn=7bba1377a31ffa0ce68932935c8d923a&amp;scene=21#wechat_redirect" link-id="2e2c" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="把 AI 当成新同事：Agent Coding 的上下文与验证体系">把 AI 当成新同事：Agent Coding 的上下文与验证体系</a></span></span></section></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 1.75em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408161&amp;idx=1&amp;sn=85aaff6f2f779e53b6ae9c5e1f003269&amp;scene=21#wechat_redirect" link-id="e948" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="一周写百万行的背后：Cursor长时间运行 Agent 的工程方法论">一周写百万行的背后：Cursor长时间运行 Agent 的工程方法论</a></span></span></section></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 1.75em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408141&amp;idx=1&amp;sn=e1e64ad73d25414957aa5206ca969fc3&amp;scene=21#wechat_redirect" link-id="384e" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="2026年生活重启指南">2026年生活重启指南</a></span></span></section></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 1.75em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408153&amp;idx=1&amp;sn=d33b48464de93a2573a0a0cb025ada9e&amp;scene=21#wechat_redirect" link-id="400d" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="我真不敢相信，AI 先加速的是工程师。">我真不敢相信，AI 先加速的是工程师。</a></span></span></section></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 1.75em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408128&amp;idx=1&amp;sn=1b6c640de61986d1364847bffb2cd28f&amp;scene=21#wechat_redirect" link-id="c6ac" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="扒一扒 Claude Cowork 系统提示词：Anthropic 如何打造数字同事">扒一扒 Claude Cowork 系统提示词：Anthropic 如何打造数字同事</a></span></span></section></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 1.75em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408114&amp;idx=1&amp;sn=29a754281cd07c16b6191c6d146c5837&amp;scene=21#wechat_redirect" link-id="8784" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="Cowork 安全架构深度解析：从 Claude Code 到 Cowork，Anthropic 如何把“可控”做成产品">Cowork 安全架构深度解析：从 Claude Code 到 Cowork，Anthropic 如何把“可控”做成产品</a></span></span></section></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 1.75em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408107&amp;idx=1&amp;sn=905552d68f5b174fd9548360bdea4448&amp;scene=21#wechat_redirect" link-id="cb12" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="Anthropic官方万字长文：AI Agent评估的系统化方法论">Anthropic官方万字长文：AI Agent评估的系统化方法论</a></span></span></section></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 1.75em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408084&amp;idx=1&amp;sn=82f274ba084f9c289e2d141aad0c088b&amp;scene=21#wechat_redirect" link-id="34ad" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="银弹还是枷锁？Claude Agent SDK 的架构真相">银弹还是枷锁？Claude Agent SDK 的架构真相</a></span></span></section></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 1.75em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408076&amp;idx=1&amp;sn=f139e90d699b528e80e79c558eed42ee&amp;scene=21#wechat_redirect" link-id="3e23" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="Claude Code创始人亲授13条使用技巧">Claude Code创始人亲授13条使用技巧</a></span></span></section></li><li style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;line-height: 1.75em;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-size: 14px;"><span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;"><a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzAwNjQwNzU2NQ==&amp;mid=2650408028&amp;idx=1&amp;sn=3a8571a9fa0bd5d7e59cd66fc6187b3e&amp;scene=21#wechat_redirect" link-id="dcdf" linktype="text" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;color: rgb(87, 107, 149);text-decoration: none;-webkit-user-drag: none;cursor: default;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;" target="_blank" textvalue="Claude Code 内部工具开源 code-simplifier：终结 AI 屎山代码的终极方案">Claude Code 内部工具开源 code-simplifier：终结 AI 屎山代码的终极方案</a></span></span></section></li></ul><ul class="list-paddingleft-1" style='-webkit-tap-highlight-color: transparent;margin: 0px;padding: 0px 0px 0px 1.6em;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;width: 577.422px;color: rgb(0, 0, 0);font-family: Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, "PingFang SC", Cambria, Cochin, Georgia, Times, "Times New Roman", serif;font-size: 16px;white-space: normal;'></ul></pre><ul class="list-paddingleft-1" style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px 0px 0px 1.6em;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;width: 577.422px;color: rgb(0, 0, 0);font-family: Optima-Regular, Optima, PingFangSC-light, PingFangTC-light, "PingFang SC", Cambria, Cochin, Georgia, Times, "Times New Roman", serif;font-size: 16px;white-space: normal;background-color: rgb(255, 255, 255);'></ul></pre>
 <section powered-by="werss" style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;letter-spacing: 0.578px;color: rgb(62, 62, 62);font-size: 16px;line-height: 25.6px;background-color: rgb(255, 255, 255);font-family: 微软雅黑;">
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
            <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
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
</section>
<p style='-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;clear: both;min-height: 1em;color: rgba(0, 0, 0, 0.9);font-family: "PingFang SC", system-ui, -apple-system, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 0.544px;orphans: 2;text-align: justify;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;white-space: normal;text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;background-color: rgb(255, 255, 255);font-size: 0px;line-height: 0;'>
 <span style="-webkit-tap-highlight-color: rgba(0, 0, 0, 0);margin: 0px;padding: 0px;outline: 0px;max-width: 100%;box-sizing: border-box !important;overflow-wrap: break-word !important;">
 </span>
</p>
<p style="display: none;">
 <mp-style-type data-value="3">
 </mp-style-type>
</p>