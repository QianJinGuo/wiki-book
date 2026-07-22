---
source: wechat
source_url: https://mp.weixin.qq.com/s/ym9xJ0RvE2OsHwu-XHStNA
ingested: 2026-07-05
feed_name: PaperWeekly
wechat_mp_fakeid: MP_WXS_3201788143
source_published: 2026-07-02
sha256: f80b7d40f881d3953c4d806e259ed3203fc19627f308a7a560b83e4acbd2b7dd
---

# HuggingFace热榜第一！清华上交推出MemSlides，精准锁定PPT局部修改

## 

AI 生成 PPT 往往“一改就乱全篇” 。清华、上交、北邮联合提出的 MemSlides 通过层次化记忆，让 Agent 实现了精准的局部修改 。

  


  


清华大学、上海交通大学、北京邮电大学合作完成的 MemSlides，面向 AI 幻灯片生成中的个性化与多轮修改问题，提出了一个记忆驱动的 Slides Agent 框架。

  


与只关注“一次性生成完整 PPT”的系统不同，MemSlides 试图让 Slides Agent 在生成、反馈、修改和再次生成之间形成可持续的记忆机制。

  


近期，MemSlides 登顶 HuggingFace Daily Papers [#1](<javascript:;>) Paper of the Day，并位列 Weekly 第 1、Monthly 第 10、Trending 第 32。

  


〓 图 1：MemSlides 登顶 Hugging Face Daily Papers [#1](<javascript:;>) Paper of the Day

  


  


项目 GitHub 已获得 400+ stars；Demo website 上线一周已有 70+ 已验证邮箱用户，今日已有十余次生成记录。

  


  


〓 图 2：项目 GitHub 页面截图

  


从榜单关注到研究问题：AI PPT 生成真正难在哪里

自动生成 PPT 正在成为大模型应用中的重要场景。

  


近年来的 presentation-generation agents 已经能够从论文、文档或用户请求中生成完整 slides，并通过多模态工具链完成规划、构建、评估和反思。

  


然而，真实使用中的痛点往往不是“能否生成第一版”，而是后续反复修改时能否保持稳定。

  


用户在不同任务中常常有稳定偏好：例如更喜欢怎样的内容密度、证据组织方式、标题风格、布局节奏、配色和模板。

  


同时，用户也会在某一套slides 的当前会话中提出临时约束，例如“后面的标题都用蓝色”或“从结果部分开始压缩文字”。

  


如果系统没有明确的记忆机制，这些信息要么被反复塞进 prompt，要么在多轮修改中逐渐丢失。

  


 _MemSlides 的核心问题是： Slides Agent 能否记住跨任务的用户偏好，保留当前会话中的临时约束，并在用户只想修改局部内容时避免整套 PPT 漂移？_

  
  


MemSlides 的总体框架：不是把历史对话全塞进 prompt

论文将个性化幻灯片生成定义为一个stateful, multi-turn authoring problem，而不是一次性的 source-to-slides conversion task。

  


系统先根据用户画像记忆、源材料和可选模板生成初始deck；当用户在第 t 轮给出反馈后，系统更新当前会话状态，并基于当前 deck、源材料、用户画像、模板和会话状态继续编辑。

  


这一建模的关键在于区分不同个性化信号的生命周期。用户画像记忆捕捉跨任务反复出现的偏好；任务时模板只约束当前job；会话状态则保存当前 deck 内临时有效的反馈、约束和编辑意图。

  


当这些信号冲突时，当前显式反馈应优先作用于当前 deck，其次是任务模板，最后才是长期用户画像。

  


MemSlides 进一步提出层次化记忆框架。

  


长期记忆保存跨 job 持续存在的信息，包括用户画像记忆和工具记忆。

  


工作记忆保存当前会话的动态状态，包括 active temporary preferences、carryover instructions、resolved targets、coverage status 和 snapshot rebinding hints 等。

  


〓 图3：MemSlides 整体框架。长期记忆保存用户画像与工具经验，工作记忆维护当前会话状态。

  
  


用户画像记忆：让个性化不是静态 prompt 前缀

在 MemSlides 中，用户画像记忆负责回答“deck 应该体现什么偏好”。

  


论文没有把个性化处理成一个固定 prompt prefix，而是把它表示为 persistent user profile 与当前会话 active temporary memory 的组合。

  


长期 profile 按 intent 和 presentation dimensions 组织，覆盖 theme、content、visual、layout、template 和 general 等维度。

  


当一个新任务开始时，系统会根据当前intent 选择匹配的 profile bucket，从用户请求中抽取约束，并将兼容的偏好路由到 working memory。

  


显式冲突的偏好会被当前请求覆盖，非冲突偏好则可以共同进入 active memory。

  


任务结束时，系统再进行 consolidation，只将稳定、可迁移的交互信号写回长期 profile，避免把一次性要求误存为长期偏好：

  


长期用户画像记忆：保存跨任务稳定偏好，例如内容密度、证据呈现、视觉风格和布局习惯。

  


〓 图4. 用户画像记忆生命周期。长期 profile 被路由到当前会话，并在任务结束后由稳定信号更新

  


  


当前会话 active memory：保存当前 deck 内仍需生效的临时要求。

  


profile consolidation：任务结束后只沉淀稳定信号，避免把临时偏好错误长期化。

  


  


〓 图5. 跨 job profile consolidation 质性案例。多轮局部反馈逐步沉淀为可复用的组织偏好

  


工作记忆：让多轮修改真正“记得前文”

工作记忆是 MemSlides 中 multi-turn 过程的关键。它保存前几轮反馈中仍然有效的临时偏好、carryover instructions，以及当前编辑状态。

  


这样，当一个偏好或者说“规则”在早期被提出、但要到后续插入或修改页面时才真正触发，系统仍然能够检索并应用该“规则”。

  


例如，用户可能先提出“后面新增页面的标题使用蓝色”，随后才要求新增某些 slides。

  


  


〓 图6. Working-memory title-color carryover 案例。早期提出的标题颜色规则在后续触发轮次被应用

  


  


没有工作记忆时，系统只能依赖局部上下文，很容易忘记这个 delayed preference；MemSlides 则会把该规则保存在 working memory 里，并在触发轮次将其带入执行过程。

  


  


  


〓 图7. Working-memory summary-box style carryover 案例。会话内样式约束在后续修改中继续生效

  
  


工具记忆：记住“怎么改得更稳”

如果说用户画像记忆决定“deck 应该长什么样”，工具记忆则决定“agent 应该如何更可靠地执行修改”。

  


在复杂的幻灯片编辑中，agent 即使理解了目标，也可能重复无效工具调用、扩大修改范围，或在验证前过早结束。

  


MemSlides 将工具执行经验作为可复用记忆保存下来，帮助系统在相似编辑任务中少走弯路。

  


论文将工具记忆组织为两个粒度：round-scope task experience 和 operation-scope tool-chain experience。

  


前者在 modify job 开始时进入 working memory，并随着 agent lessons、tool-error summaries 和自动抽取模式不断更新。

  


后者把 reasoning-tool-observation 链条切分成可复用片段，并在未来相似工具调用前检索注入。

  


Round-scope experience：面向一轮或一类修改任务的执行经验。

  


Operation-scope chain fragments：面向具体工具调用的细粒度经验片段。

  


目标：减少重复错误、降低 backtracking，并提高局部验证可靠性。

  


  


〓 图8. 工具记忆机制。任务级经验和操作级工具链经验共同支持更可靠的局部编辑

  


**  
****多轮局部修改：Plan-Act-Guard 与 scoped slide-local revision**

  


MemSlides 的另一个核心设计是 scoped slide-local revision。很多系统在收到局部反馈时，会重新读取或重写整张 deck，虽然可能满足目标修改，却也容易改变非目标区域。

  


MemSlides 将修改请求映射到最小有效 slide region，并将执行过程约束在明确 scope 内。

  


  


〓 图9. Localized modify execution。Working memory 为 Plan-Act-Guard 提供当前偏好、编辑状态和工具记忆信号

  


  


Plan 阶段构造 execution contract，记录推断出的修改范围、目标 slide path、active rule identifiers、selector hints 和 coverage requirements。

  


Act 阶段根据 contract 选择合适编辑工具，在目标区域应用最小有效编辑。

  


Guard 阶段检查 patch 是否绑定到正确 snapshot、目标覆盖是否完成，以及 finalize 是否过早。

  


  


〓 图10. 局部修改示例。MemSlides 将修改限制在目标区域，减少非目标内容漂移

  


这种机制使“完成修改”不再只是模型自己判断停止，而是一个带有局部范围、目标覆盖和验证约束的执行过程。

  


对用户来说，这意味着当他说“只改这一处”时，系统更有机会保留已经满意的页面内容，而不是反复重写整套 slides。

  


  


〓 图11. 工具记忆支持的局部编辑轨迹示例。系统检查目标 slide、应用局部 patch、验证修改并 finalize

  


**  
****实验结果：个性化与局部修改的双重验证**

  


论文从个性化生成和多轮局部修改两个方向评估 MemSlides。

  


对于初始生成阶段，研究构建了 multi-persona, multi-intent user profile bank，并使用 persona-alignment judgments 评估生成 deck 是否更符合用户角色和偏好。

  


结果显示，用户画像记忆在多个维度上提升 round-0 persona alignment，同时保持有竞争力的 PPT 质量。

  


对于局部修改，论文设计diagnostic matched-pair modify setting，使 matched pair 中唯一变化是是否注入工具记忆。

  


结果显示，工具记忆将 overall closed-loop completion 从 0.815 提升到 0.963，将 strict verification 从 0.310 提升到 0.534，并将 time to first correct edit 从 609.5 秒降低到 242.5 秒。

  


需要注意的是，论文并不声称工具记忆在每一个 pair 上都单调获胜。相反，pair-level 结果显示不同模型和任务难度下仍存在异质性。

  


## **关键结论概括：**

  * 用户画像记忆提升初始生成阶段的 persona alignment。

  * 工作记忆支持会话内 delayed preference carryover。

  * 工具记忆提升局部修改的 closed-loop completion、strict verification 和编辑效率。

  * 局部修改不仅要看任务是否成功，也要看是否减少非目标区域漂移。

  


  


**  
****实验分析  **

  


MemSlides 的意义不只是让 AI PPT 更好看，而是把 presentation authoring 重新定义为一个带记忆的交互式过程。

  


一个真正可用的 Slides Agent 需要知道哪些偏好是长期稳定的，哪些要求只属于当前任务，哪些执行经验能帮助未来修改更可靠。

  


与此同时，个性化记忆也带来治理问题。

  


论文在讨论中指出，持久化profile 可能编码敏感的用户习惯、组织风格约束或受众策略；错误的 memory consolidation 也可能把过时或偶然偏好带入未来任务。

  


因此，未来的个性化 presentation agents 应提供用户可见的记忆检查、编辑和删除机制，并避免保存不必要的敏感信息。

  


总体来看，MemSlides 为 AI 幻灯片生成提供了一种更接近真实写作和修改流程的交互范式：不是一次生成后结束，而是在长期偏好、当前上下文和局部编辑经验之间建立清晰分工，让 agent 能持续理解用户、稳定执行修改。

  


  


〓 图12. 模板引导生成示例。MemSlides 支持结合用户偏好与任务模板进行个性化生成

  


  


  


**相关资源**

**👇**

论文地址：

https://arxiv.org/abs/2606.17162

项目主页：

https://memslides.github.io/

Demo 地址：

https://memslides.com/

代码地址：

https://github.com/huohua325/Memslides

HuggingFace 地址：  


https://huggingface.co/papers/2606.17162

  


  


**更多阅读**

[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721201&idx=2&sn=f755ccb0fe42f91ef11084696e2e666f&scene=21#wechat_redirect>)[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721152&idx=1&sn=1997b2495d21b1b96568e1102c1ee353&scene=21#wechat_redirect>)[](<https://mp.weixin.qq.com/s?__biz=MzIwMTc4ODE0Mw==&mid=2247721067&idx=1&sn=a8a45c05f631722c62ca81ae16c01a97&scene=21#wechat_redirect>)  
  


**# 投 稿 通 道#**

**  让你的文字被更多人看到 **

  


  


如何才能让更多的优质内容以更短路径到达读者群体，缩短读者寻找优质内容的成本呢？**答案就是：你不认识的人。**

  


总有一些你不认识的人，知道你想知道的东西。PaperWeekly 或许可以成为一座桥梁，促使不同背景、不同方向的学者和学术灵感相互碰撞，迸发出更多的可能性。 

  


PaperWeekly 鼓励高校实验室或个人，在我们的平台上分享各类优质内容，可以是**最新论文解读** ，也可以是**学术热点剖析** 、**科研心得** 或**竞赛经验讲解** 等。我们的目的只有一个，让知识真正流动起来。

  


📝 **稿件基本要求：**

• 文章确系个人**原创作品** ，未曾在公开渠道发表，如为其他平台已发表或待发表的文章，请明确标注 

• 稿件建议以 **markdown**  格式撰写，文中配图以附件形式发送，要求图片清晰，无版权问题

• PaperWeekly 尊重原作者署名权，并将为每篇被采纳的原创首发稿件，提供**业内具有竞争力稿酬** ，具体依据文章阅读量和文章质量阶梯制结算

  


📬 **投稿通道：**

• 投稿邮箱：hr@paperweekly.site 

• 来稿请备注即时联系方式（微信），以便我们在稿件选用的第一时间联系作者

• 您也可以直接添加小编微信（**pwbot02** ）快速投稿，备注：姓名-投稿

  


**△长按添加PaperWeekly小编**

  


  


  


🔍

  


现在，在**「知乎」** 也能找到我们了

进入知乎首页搜索**「PaperWeekly」**

点击**「关注」** 订阅我们的专栏吧

  


  


·
