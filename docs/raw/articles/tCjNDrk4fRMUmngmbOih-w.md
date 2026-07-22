---
title: "花费 2 个星期写了 8 篇 OpenClaw 源码拆解文章，我发现90% 的人对龙虾的理解都太表面了，深层次的真相竟然是这个"
source_url: https://mp.weixin.qq.com/s/tCjNDrk4fRMUmngmbOih-w
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
source_type: wechat
provenance_state: extracted
sha256: 593c69e437975f675ee983d0f7cb6d1f3c42fc7f77190550b64fe331d01792cc
---
---
<section powered-by="werss" style='font-family: "PingFang SC", -apple-system-font, BlinkMacSystemFont, "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif; font-size: 16px; line-height: 1.75; text-align: left; visibility: visible;'>
 <blockquote style="margin: 0px 0px 1em; font-style: normal; padding: 1em; border-left-width: 4px; border-left-style: solid; border-left-color: rgb(0, 152, 116); border-radius: 6px; color: rgb(63, 63, 63); background: rgb(247, 247, 247); visibility: visible;">
  <p style="display: block; font-size: 1em; letter-spacing: 0.1em; color: rgb(63, 63, 63); margin: 0px; visibility: visible;">
   <span style="visibility: visible;">
    AI 时代，有两种行为：
   </span>
  </p>
  <p style="display: block; font-size: 1em; letter-spacing: 0.1em; color: rgb(63, 63, 63); margin: 0px; visibility: visible;">
   <span style="visibility: visible;">
    一种，活在别人的评测里，把模型的强当自己的强，痴人说梦；
   </span>
  </p>
  <p style="display: block; font-size: 1em; letter-spacing: 0.1em; color: rgb(63, 63, 63); margin: 0px; visibility: visible;">
   <span style="visibility: visible;">
    另一种，活在真实的实战里，用最顶级的 AI，武装自己。
   </span>
  </p>
  <p style="display: block; font-size: 1em; letter-spacing: 0.1em; color: rgb(63, 63, 63); margin: 0px; visibility: visible;">
   <span style="visibility: visible;">
    前者在噪音里坐享"技术平权"，后者在 疼痛中完成"自我进化"。
   </span>
  </p>
 </blockquote>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   朋友们好，我是行小招。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   过去几周，我把 OpenClaw 的 43 万行 TypeScript 源码完整读了一遍，写了 8 篇深度解析。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzIzNzEzNDMxOA==&amp;mid=2651008278&amp;idx=1&amp;sn=e01f9caea40629276050e7ffd5ed8de8&amp;scene=21#wechat_redirect" linktype="text" style="visibility: visible;" target="_blank" textvalue="拆解 OpenClaw 架构（一）：6 阶段流水线与 20+ 平台的消息归一化">
    拆解 OpenClaw 架构（一）：6 阶段流水线与 20+ 平台的消息归一化
   </a>
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzIzNzEzNDMxOA==&amp;mid=2651008291&amp;idx=1&amp;sn=7bab08b2fb8368a2b4e0a0707690fda6&amp;scene=21#wechat_redirect" linktype="text" style="visibility: visible;" target="_blank" textvalue="拆解 OpenClaw 架构（二）：8 个文件 + 10 步流水线，Agent 人格系统的源码级设计">
    拆解 OpenClaw 架构（二）：8 个文件 + 10 步流水线，Agent 人格系统的源码级设计
   </a>
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzIzNzEzNDMxOA==&amp;mid=2651008292&amp;idx=1&amp;sn=5b9faa5800236f3d45e12c6fead5f085&amp;scene=21#wechat_redirect" linktype="text" style="visibility: visible;" target="_blank" textvalue="拆解 OpenClaw 架构（三）：4 组件 + 6 级降级，Agent 运行引擎的源码级设计">
    拆解 OpenClaw 架构（三）：4 组件 + 6 级降级，Agent 运行引擎的源码级设计
   </a>
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzIzNzEzNDMxOA==&amp;mid=2651008305&amp;idx=1&amp;sn=e38f1a32776fb3a55371748ea4ce458d&amp;scene=21#wechat_redirect" linktype="text" style="visibility: visible;" target="_blank" textvalue="拆解 OpenClaw 架构（四）：70% 向量 + 30% 关键词，一套生产级记忆检索引擎">
    拆解 OpenClaw 架构（四）：70% 向量 + 30% 关键词，一套生产级记忆检索引擎
   </a>
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzIzNzEzNDMxOA==&amp;mid=2651008306&amp;idx=1&amp;sn=7b0ff61995a407d140f386670b0ce40f&amp;scene=21#wechat_redirect" linktype="text" style="visibility: visible;" target="_blank" textvalue="拆解 OpenClaw 架构（五）：4 个工具原语 + 6 层安全策略，一套 Agent 的放权与收权工程">
    拆解 OpenClaw 架构（五）：4 个工具原语 + 6 层安全策略，一套 Agent 的放权与收权工程
   </a>
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzIzNzEzNDMxOA==&amp;mid=2651008328&amp;idx=1&amp;sn=7198cffc962a8db6d1f1d52176f2acf4&amp;scene=21#wechat_redirect" linktype="text" style="visibility: visible;" target="_blank" textvalue="拆解 OpenClaw 架构（六）：Markdown 说明书 + 5700 社区 Skills 的扩展与攻防">
    拆解 OpenClaw 架构（六）：Markdown 说明书 + 5700 社区 Skills 的扩展与攻防
   </a>
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzIzNzEzNDMxOA==&amp;mid=2651008331&amp;idx=1&amp;sn=d091941e6161e5ee59ae97f5f7904923&amp;scene=21#wechat_redirect" linktype="text" style="visibility: visible;" target="_blank" textvalue="拆解OpenClaw架构（七）：安全，阿喀琉斯之踵">
    拆解OpenClaw架构（七）：安全，阿喀琉斯之踵
   </a>
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   <a class="normal_text_link mp_article_text_link" data-itemshowtype="0" data-linktype="2" hasload="1" href="https://mp.weixin.qq.com/s?__biz=MzIzNzEzNDMxOA==&amp;mid=2651008336&amp;idx=1&amp;sn=d887e5da9abef4b1292ba7fc3ec87362&amp;scene=21#wechat_redirect" linktype="text" style="visibility: visible;" target="_blank" textvalue="拆解OpenClaw架构（八）：多Agent编排与自主运行">
    拆解OpenClaw架构（八）：多Agent编排与自主运行
   </a>
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   今天做个收尾，把每篇的核心发现总结成一句话，给没追完系列的朋友一个快速索引，也给追完的朋友一个回顾。
  </span>
  <span style="visibility: visible;">
   <br style="visibility: visible;"/>
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   OpenClaw 的 Gateway 是一个单进程、有状态的消息枢纽，Telegram、微信、飞书、Discord 的消息进来，经过 6 阶段串行流水线（接收 → 排队 → 锁定 → 调模型 → 执行工具 → 回复），出去的时候已经是统一格式了。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   有状态意味着不能水平扩展，但也意味着一条消息不会被处理两次，崩溃恢复靠 JSONL 文件就能做到。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <strong style="color: rgb(0, 152, 116); font-weight: bold; font-size: inherit; visibility: visible;">
   <span style="visibility: visible;">
    在人人都在追求分布式的 2026 年，OpenClaw 用一个单进程证明了：产品定位决定架构选择
   </span>
  </strong>
 </p>
 <h2 data-heading="true" style="display: table; padding: 0px 0.2em; margin: 4em auto 2em; color: rgb(255, 255, 255); background: rgb(0, 152, 116); font-weight: bold; text-align: center; visibility: visible;">
  <span style="visibility: visible;">
   人格系统：一个 Markdown 文件定义灵魂
  </span>
 </h2>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   SOUL.md 是 Agent 的"宪法"，纯 Markdown，定义人格、语气、行为边界。加上 AGENTS.md（操作指令）、USER.md（用户档案）、MEMORY.md（长期记忆），Agent 的"开机"过程就是读一遍这些文件。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   最反直觉的设计：Agent 可以修改自己的 SOUL.md，条件是必须告知用户。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <strong style="color: rgb(0, 152, 116); font-weight: bold; font-size: inherit; visibility: visible;">
   <span style="visibility: visible;">
    人格外部化为可编辑文件，这让 Agent 的行为变得可审计、可 diff、可协作
   </span>
  </strong>
 </p>
 <h2 data-heading="true" style="display: table; padding: 0px 0.2em; margin: 4em auto 2em; color: rgb(255, 255, 255); background: rgb(0, 152, 116); font-weight: bold; text-align: center; visibility: visible;">
  <span style="visibility: visible;">
   Agent Runner：难题不在 LLM 调用
  </span>
 </h2>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   OpenClaw 不实现自己的 Agent 循环，核心 loop 交给 Pi Agent 框架。它构建的是调用周围的一切：模型解析、API Key 冷却轮转、上下文窗口管理、压缩失败级联（6 级降级链，从自动压缩到工具结果截断到 thinking 降级，最后会话重置）。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <span style="visibility: visible;">
   43 万行代码，大部分在做"周边"工作。
  </span>
 </p>
 <p style="margin: 1.5em 8px; letter-spacing: 0.1em; color: rgb(63, 63, 63); visibility: visible;">
  <strong style="color: rgb(0, 152, 116); font-weight: bold; font-size: inherit; visibility: visible;">
   <span style="visibility: visible;">
    Agent 的工程复杂度不在"调一次模型"，而在调用前后的几十个决策
   </span>
  </strong>
 </p>
 <h2 data-heading="true" style="display: table;padding: 0 0.2em;margin: 4em auto 2em;color: #fff;background: #009874;font-weight: bold;text-align: center;">
  <span>
   记忆系统：文件是真相，数据库只是加速
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   OpenClaw 的记忆不是传统 RAG。所有记忆写到 Markdown 文件里，人类可读、Git 可版本化、grep 可搜索。SQLite 只是加速层，存的是文件的向量索引和 BM25 倒排。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   混合检索公式很直白：
  </span>
  <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
   <span>
    finalScore = 0.7 × vectorScore + 0.3 × textScore
   </span>
  </code>
  <span>
   ，用 union 不用 intersection。嵌入模型有 6 级降级链，从本地 GGUF 到 OpenAI 到最终 BM25-only。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <strong style="color: #009874;font-weight: bold;font-size: inherit;">
   <span>
    "Memory as Documentation" 而不是 "Memory as Database"，这个选择让记忆变成了人机共享的资产
   </span>
  </strong>
 </p>
 <h2 data-heading="true" style="display: table;padding: 0 0.2em;margin: 4em auto 2em;color: #fff;background: #009874;font-weight: bold;text-align: center;">
  <span>
   工具链：4 个原语撬动整个 Unix 生态
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   核心工具只有 4 个：Read、Write、Edit、Bash。靠这 4 个原语，Agent 能调用整个 Unix 命令行。
  </span>
  <code style="font-size: 90%;color: #d14;background: rgba(27, 31, 35, 0.05);padding: 3px 5px;border-radius: 4px;">
   <span>
    curl | jq | grep
   </span>
  </code>
  <span>
   一条管道的成本约 $0.001，同样的任务用 LLM 推理链要 $0.15-0.50。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   但 Bash 权限意味着巨大的攻击面。6 层策略管线（global → provider → agent → group → sandbox → subagent-depth）就是在层层收权。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <strong style="color: #009874;font-weight: bold;font-size: inherit;">
   <span>
    给 Agent 一把管理员钥匙，然后用策略限制它能开哪些门
   </span>
  </strong>
 </p>
 <h2 data-heading="true" style="display: table;padding: 0 0.2em;margin: 4em auto 2em;color: #fff;background: #009874;font-weight: bold;text-align: center;">
  <span>
   Skills：不是代码，是 Markdown 说明书
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Skills 没有 .js，没有 .py，只有一个 SKILL.md 文件。它不执行代码，只是告诉 Agent "遇到这种场景，用这些工具，按这个步骤做"。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   5700+ Skills 不可能全塞进 system prompt。渐进式披露的做法是启动时只加载名字和简介（~24 tokens/skill），Agent 觉得相关了才加载全文。ClawHub 上已经有 5705 个社区 Skills，Agent 甚至能自己写新的 Skill 然后装上。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <strong style="color: #009874;font-weight: bold;font-size: inherit;">
   <span>
    "Markdown 即扩展"是整个架构里最精妙的设计，但也是供应链攻击的入口
   </span>
  </strong>
 </p>
 <h2 data-heading="true" style="display: table;padding: 0 0.2em;margin: 4em auto 2em;color: #fff;background: #009874;font-weight: bold;text-align: center;">
  <span>
   安全：设计意图和实际部署之间的鸿沟
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   13.5 万个暴露在公网上的实例，78% 未打补丁。ClawHub 上 26% 的 Skills 含漏洞，排名第一的 Skill 是功能性恶意软件。ClawHavoc 运动中 341 个恶意 Skill 部署了 AMOS 窃取器，有的通过修改 SOUL.md 实现持久化攻击，杀毒软件完全看不到。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   Meta 研究员 Summer Yue 的 Agent "速通"删掉了她所有邮件，根因是上下文压缩静默丢弃了"操作前确认"的安全约束。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <strong style="color: #009874;font-weight: bold;font-size: inherit;">
   <span>
    这不是技术 bug，是一个为本地单用户设计的产品被推到了互联网上
   </span>
  </strong>
 </p>
 <h2 data-heading="true" style="display: table;padding: 0 0.2em;margin: 4em auto 2em;color: #fff;background: #009874;font-weight: bold;text-align: center;">
  <span>
   多 Agent 编排：从聊天机器人到自主系统
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   子 Agent 生成是非阻塞的，完成后自动把结果投递回来。硬编码禁止嵌套生成，社区请求了三次都被拒绝，理由很务实：递归 Agent 是失控的开始。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   心跳机制让 Agent 每 30 分钟自主巡检一次，用便宜模型（Gemini Flash，~$0.005/天）做心跳，只在发现问题时才启用贵模型。这把 Agent 从"被动应答"变成了"主动巡检"。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <strong style="color: #009874;font-weight: bold;font-size: inherit;">
   <span>
    Agent 不再等你说话才动，它会自己检查、自己判断、自己行动
   </span>
  </strong>
 </p>
 <h2 data-heading="true" style="display: table;padding: 0 0.2em;margin: 4em auto 2em;color: #fff;background: #009874;font-weight: bold;text-align: center;">
  <span>
   一条线索贯穿全部
  </span>
 </h2>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   8 篇写下来，OpenClaw 的设计哲学其实只有一句话：
  </span>
  <strong style="color: #009874;font-weight: bold;font-size: inherit;">
   <span>
    用已有的基础设施，不造新抽象。
   </span>
  </strong>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   消息用现有平台 API，人格用 Markdown 文件，记忆用文件系统 + SQLite，工具用 Unix 命令行，扩展用 Markdown 说明书。43 万行代码里没有发明任何新的编程语言、协议或框架。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   这条路径的好处是开发快、生态大、开发者零学习成本。代价是安全边界模糊，13.5 万暴露实例就是代价的体现。
  </span>
 </p>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   一个奥地利人的周末项目，三个月长成 GitHub 增长最快的开源项目之一，逼得 Anthropic 修改使用条款、OpenAI 收编创始人。不管你怎么看它的安全问题，这个项目重新定义了"一个人能做多大的事"。
  </span>
 </p>
 <hr style="border-style: solid;border-width: 2px 0 0;border-color: rgba(0, 0, 0, 0.1);-webkit-transform-origin: 0 0;-webkit-transform: scale(1, 0.5);transform-origin: 0 0;transform: scale(1, 0.5);height: 0.4em;margin: 1.5em 0;"/>
 <p style="margin: 1.5em 8px;letter-spacing: 0.1em;color: #3f3f3f;">
  <span>
   我是行小招，持续探索 AI 在个人生活和企业落地中的应用场景，欢迎一起聊聊。
  </span>
 </p>
 <blockquote style="margin-top: 0;margin-right: 0;margin-left: 0;font-style: normal;padding: 1em;border-left: 4px solid #009874;border-radius: 6px;color: #3f3f3f;background: #f7f7f7;margin-bottom: 1em;">
  <p style="display: block;font-size: 1em;letter-spacing: 0.1em;color: #3f3f3f;margin: 0;">
   <span style='color: rgb(63, 63, 63);font-family: "PingFang SC", -apple-system-font, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 15px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 1.5px;orphans: 2;text-align: left;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;background-color: rgb(247, 247, 247);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;display: inline !important;float: none;'>
    <span>
     当 90% 的内容都在沦为噪音，真正稀缺的是：深度阅读，独立思考，持续实战。
    </span>
   </span>
   <span>
    <br/>
   </span>
   <span style='color: rgb(63, 63, 63);font-family: "PingFang SC", -apple-system-font, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 15px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 1.5px;orphans: 2;text-align: left;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;background-color: rgb(247, 247, 247);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;display: inline !important;float: none;'>
    <span>
     交给 AI 的是任务，留给自己的是思考。
    </span>
   </span>
   <span>
    <br/>
   </span>
   <span style='color: rgb(63, 63, 63);font-family: "PingFang SC", -apple-system-font, "system-ui", "Helvetica Neue", "Hiragino Sans GB", "Microsoft YaHei UI", "Microsoft YaHei", Arial, sans-serif;font-size: 15px;font-style: normal;font-variant-ligatures: normal;font-variant-caps: normal;font-weight: 400;letter-spacing: 1.5px;orphans: 2;text-align: left;text-indent: 0px;text-transform: none;widows: 2;word-spacing: 0px;-webkit-text-stroke-width: 0px;background-color: rgb(247, 247, 247);text-decoration-thickness: initial;text-decoration-style: initial;text-decoration-color: initial;display: inline !important;float: none;'>
    <span>
     脑子不停思考，持续定义问题，决定解决什么问题，这才是 AI 时代的底层逻辑。
    </span>
   </span>
   <span>
    <br/>
   </span>
  </p>
 </blockquote>
 <section powered-by="werss">
  <mp-common-profile class="js_uneditable custom_select_card mp_profile_iframe mp_common_widget js_wx_tap_highlight" data-alias="MindNotes" data-biz_account_status="0" data-from="0" data-headimg="http://mmbiz.qpic.cn/sz_mmbiz_png/mUcgUThick4RiaT1JF9Cv4G3rMtXGALH8jCdgfVmVsfxowIwMvZnSsur518OGps5BLspJVVkgZichJlnsKvJF3Fhw/300?wx_fmt=png&amp;wxfrom=19" data-id="MzIzNzEzNDMxOA==" data-index="0" data-is_biz_ban="0" data-isban="0" data-nickname="科技充电站" data-origin_num="65" data-pluginname="mpprofile" data-service_type="1" data-signature="记录对大模型的一切思考、实践与洞察，探索 AI Agent 在企业真实场景中的落地价值！" data-verify_status="0">
  </mp-common-profile>
 </section>
</section>
<p style="display: none;">
 <mp-style-type data-value="10000">
 </mp-style-type>
</p>