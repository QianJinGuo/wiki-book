# 京东健康OPC团队的产品全流程Skill探索

## Ch01.878 京东健康OPC团队的产品全流程Skill探索

> 📊 Level ⭐⭐ | 4.2KB | `entities/京东健康opc团队的产品全流程skill探索.md`

# 京东健康OPC团队的产品全流程Skill探索

# 京东健康OPC团队的产品全流程Skill探索

---
source: wechat
source_url: https://mp.weixin.qq.com/s/k9adgO1QynvscitSSVA6pg
ingested: 2026-07-05
source_published: 2026年6月26日 17:26
---

# 京东健康OPC团队的产品全流程Skill探索

**

一、背景和适用场景

**  
  

京东健康正在探索OPC（One Person Company）下模式的高效交付，在 OPC 团队中，没有专职产品角色，这意味着团队不仅要关注「把需求做完」，还必须回答几个更前置的问题：

  * 这个问题是否真的值得做？

  * 证据来自用户、数据、业务，还是只是个人判断？

  * 当前方案是不是唯一方案？

  * 需求边界是否清楚？

  * 当前迭代是否真的有产研资源承接？

  * 上线后如何判断成功或失败？

  * 风险、进展和结果如何对不同对象同步？

Anthropic 开源的 Product Management Skills （https://github.com/anthropics/knowledge-work-plugins/tree/main/product-management/skills）正好可以承接这些问题。它本质上是一套**产研共同决策框架** ：把从发现问题到上线复盘的过程，拆成一组可重复使用的动作，帮助 OPC 在缺少专职产品角色的情况下，仍然保持清晰、可追溯、可评审的产品流程。

本文把这套实践适配到 OPC 的工作场景，快速补齐OPC团队的产品能力，跑通从需求发现、定义、排期、开发到上线复盘的全过程。

**

二、流程总览

**  
  

###  2.1 安装 Skill

这套实践在 Anthropic 原生环境中对应 product-management plugin；在 JoyCode 或 Codex 中，需要接入 `product-management/skills` 下的 8 个 Skill。在对话框输入以下提示词即可安装：

  *   *   *   * 

    
    
    从 https://github.com/anthropics/knowledge-work-plugins/tree/main/product-management/skills安装以下 skills：synthesize-research、metrics-review、competitive-brief、product-brainstorming、write-spec、roadmap-update、sprint-planning、stakeholder-update。

### 2.2 一条判断链

8 个 Skill 最常见的使用顺序如下：

这条链的内在逻辑是：

  1. **先判断问题是否值得做** （问题判断）；

  2. **再把方向打磨成可执行需求** （需求定义）；

  3. **再把需求放进优先级、容量和依赖约束** （排期执行）；

  4. **最后用指标验证结果，并完成同步** （上线复盘）。

可以把它当成一套轻量工作协议：**任何需求只要进入开发，就至少要经过「证据、假设、边界、排期、验收、复盘」六个环节。**

****

**

三、第一阶段：问题判断

**  
  

> **本阶段目标** ：判断「这个问题是否足够重要」，而不是证明「我们想做的方案是对的」。

需求刚出现时，不要急着写 PRD，也不要直接进入技术方案。第一步是判断问题本身是否成立。

### 3.1 使用哪些 Skill

### 3.2 怎么接入需求上下文

Anthropic 的做法不是让团队手工整理一份完整报告后再交给 AI，而是把现有材料按来源接入到 Skill 工作流里。以 synthesize-research 为例，它支持三类输入：

  * **直接粘贴** ：访谈记录、会议纪要、问卷开放题、工单摘要。

  * **上传文件** ：研究文档、表格、录音转写摘要、调研结果。

  * **连接工具** ：从知识库、用户反馈系统、产品分析工具、会议转写工具中拉取上下文。

在 Anthropic 的插件设计里，这些工具用通用占位符表示：

### 我们无法直接使用这些海外工具的连接器，但思路完全可以复用：**把内部系统的材料映射到同样的证据类别** 。

### 关键是**不要把材料无差别丢进去** 。每份材料进入 Skill 前，至少要带上 5 个字段：

  *   *   *   *   *   * 

  

-> [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/京东健康opc团队的产品全流程skill探索.md)

---

