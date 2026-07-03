# WorkBuddy专家团提示词全曝光：多Agent协作原来是这样产品化的

## Ch01.230 WorkBuddy专家团提示词全曝光：多Agent协作原来是这样产品化的

> 📊 Level ⭐ | 2.5KB | `entities/workbuddy专家团提示词全曝光多agent协作原来是这样产品化的.md`

# WorkBuddy专家团提示词全曝光：多Agent协作原来是这样产品化的

之前的一篇文章 我们拆解了Workbuddy的上下文工程，包括其系统提示词的组装，会话压缩和记忆机制，有兴趣的同学可以去看看：

[ WorkBuddy VS 钉钉悟空 VS 字节 Aily：桌面 Agent 的工程设计 ](<https://mp.weixin.qq.com/s?__biz=Mzg2MzcyODQ5MQ==&mid=2247502374&idx=1&sn=85a454861112d2f44240d3610d99ecaa&scene=21#wechat_redirect>)

这些都是Agent底层的运行机制，模型如何思考，调用工具和管理上下文。

Workbuddy还有更上层的设计，就是  ** 专家  ** 和  ** 专家团  ** ，这层设计直接面对用户，用户不需要你知道底层的提示词，有多少工具，上下文规则，只需要选择一个专家或者专家团，就可以开始干活。

这篇文章，我们就来拆解下WorkBuddy的专家和专家团，看看它们到底是什么，以及它们是如何工作的。

先给出一个核心结论：

WorkBuddy的专家，就是封装好的单个Agent，Workbuddy的专家团，是封装好的多Agent协作流程：

在常规的Agent开发框架中，我们通常拥有一个Agent管理模块，用于新建Agent并配置其提示词、工具、Skills等基础能力，

WorkBuddy 的专家，就是把这些能力包装成了用户可以直接选择的专家角色。

同理，一个成熟的 Agent 系统里，通常也会有多 Agent 调度机制，比如主 Agent 拆任务、子 Agent 执行任务、主 Agent 汇总结果。

WorkBuddy 的专家团，就是把这种多 Agent 协作方式产品化了。

所以这篇文章不是简单介绍 WorkBuddy 的功能，而是想看看：一个 Agent 产品，如何把底层能力包装成用户能理解、能使用、能直接交付结果的专家系统。

##  WorkBuddy专家是什么

与其纸上谈兵，不如直接打开WorkBuddy，我们一起来拆解下它的专家设计

我们找了两个专家  ` 用户体验架构师  ` 和  ` 长文档写作和改稿专家  `

我们先看下第一个 用户体验架构师

我们问了一个很简单的问题：

---

