# 无障碍设计师 vibe coding：当所有同事都在用 AI 写代码时

> 📊 Level ⭐⭐⭐ | 12.0KB

> 原文存档：[原文存档](http://ericwbailey.website/published/the-case-for-an-accessibility-designer-vibe-coding-when-all-his-coworkers-are-also-vibe-coding/)

## 概述

GitHub accessibility designer **Eric Bailey** 2026-06-15 发表的内部反思：当团队 100% 转向 LLM-first 工作流（GitHub 自家 app 也是 LLM-driven），且个人 token 使用被追踪排名时，**无障碍设计师也被结构性强制 vibe coding**。作者坦诚：作为详细 spec 写得好但 JS 写不好的人，借助 LLM 现在能直接做出产品级无障碍增强。

文章核心张力：**Emotionally（"有人拿枪指着我的头"+ 三万亿柴油机碳排放）vs Professionally（必须用 LLM 才能贡献业务）**。这反映 LLM 在 2026 年企业内部已从"个人选择"变为"结构性要求"。

## "Vibe coding" 的真实定义（作者版本）

作者澄清：**vibe coding ≠ 简单英语提示词**。完整定义包括：

- 简单的英语语言请求
- 更技术性的 plans
- 纠正性 instruction files（instruction 文档）
- 脚本
- **skills**
- 其他适用的技术

**作者 NOT 在做**：直接写代码。

## 实际产出（GitHub App 无障碍改进）

通过 vibe coding 实现的真实产品增强：

| 改进 | 类别 |
|------|------|
| 互动列表（interactive lists） | 组件级 UX |
| Treeviews + F6 导航 | 键盘可达性 |
| Typeahead 节点选择 | 效率 |
| aria-label 构造逻辑 | 屏幕阅读器体验 |

**关键洞察**：作者强调他做的不是"技术合规但实际不可用"的产品，而是**真正提升无障碍体验的设计师级判断**。无障碍设计师的判断力 = 把"应用状态/配置无关的最显著信息放在最前面"的规则化能力。

## 关键贡献

1. **首次从企业内部身份视角（无障碍设计师）描述 vibe coding**：与"软件工程师 vibe coding"叙事不同，无障碍设计师代表**非编码专业人员的 LLM 工作流适配**，是 LLM 时代"工作身份重构"的早期信号。

2. **Token 使用被追踪/排名 = 新型绩效管理**：作者提到 token 使用被追踪排名，意味着企业内部 LLM 化已不仅是技术变革，**也是 HR/绩效管理变革**。这是 2026 年新兴的"AI 时代员工评估"问题。

3. **"vibe coding = LLM 时代的 T 型技能扩散"**：作者总结 — vibe coding 让他这个"详细 spec 写得好 + JS 写不好"的人能产出完整产品增强。LLM 实质上让**单一技能的专家**（spec 写作者、设计判断者）**跨过编码门槛**，直接产出。

## 一句话定位

**当企业 100% 转向 LLM-first 工作流，非编码专业人员的 vibe coding 不再是"个人选择"而是"结构性要求"** —— GitHub 无障碍设计师的第一手内部反思

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki-public/blob/main/moc/coding-agent-practice.md)

---
## 深度分析

### 结构性强制：LLM 从"个人选择"变为"组织装置"

作者反复强调自己不是"入乡随俗"式地主动拥抱 vibe coding，而是被结构性 compel：项目本身 100% LLM-forward，个人 token 使用量被追踪并排名。这意味着采纳 LLM 已经越过技术选型层，进入绩效度量层——不使用 LLM 的人不是"效率低"，而是"不可见"。这与 [vibe coding 范式](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/vibe-coding-paradigm.md) 一文把 vibe coding 当作个人生产力工具的叙事形成鲜明对照：在 GitHub 内部，vibe coding 是准入条件而非选项。

值得注意的细节是：token 追踪排名与"谁在贡献"的认定绑定。作者作为无障碍设计师，只有通过 vibe coding 才能进入贡献流，因此组织指标实际上重新定义了"谁算工程师"。非编码身份的专业人员被制度性地推过编码门槛——这是对"AI 时代员工评估"问题最直接的一手观察。

### 时间压缩改写了无障碍工作的经济学

前 LLM 时代的无障碍工作是一场围绕工时的谈判：在法定底线之上"能塞多少塞多少"，因为没有商业 case 支持 `lang` 属性这类"看不见的投入"。后 LLM 时代，修复一个传统上根本排不上资源队列的组件，从"不可能立项"变成"几天甚至几小时"。作者自己定位为"只是在做本职工作"，但组织视角下这已经是"额外的投入"——时间压缩把组织的抗拒成本降到了可以忽略的程度。

这实际上提出了一种新的无障碍推进策略：不再靠说服和预算审批，而是靠把修复成本压到低于"说不"的成本。这与 [specification-driven 开发](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/sdd-specification-driven-development-harness.md) 的思路暗合——把专家判断前置成 spec，让生成环节承担体力部分。

### 隐形纠偏：instruction/skills 作为政治资本的替代品

作者在过程中持续沉淀 corrective instructions 和 skills，引导 LLM 输出"默认无障碍"的结果。他的洞察有两层：其一，这让他"隐形地、指数级放大"了原本近乎西西弗斯式的努力；其二，也是更微妙的——**对视觉零影响的结构性修复绕开了合规与审美之间的正面冲突**。他"死守的山头更少了"，政治资本消耗大幅降低。

这是文章最容易被忽略的管理学含义：当修复以机器可读的 instruction 而非人工重写的形式存在，冲突被转化为对机器的"外交式纠偏"。代价同样真实——指令体系依赖组织默许，一旦有人"对某个写法反感并写下反向指令"，整套杠杆就会失效。领域专家对 AI 生成物的影响力，本质上是一种可被随时收回的临时授权。

### 生产 ≠ 学习：黑盒奉承的技能幻觉

作者刻意区分"产出能力"与"学习能力"：他确实造出了以前受限于 JavaScript 能力而做不出的逻辑与结构，但也坦承这种工作方式**不带来他所期望的根基性技能**，"只是越来越擅长哄一个黑盒吐出 jackpot"。这与 Karpathy 从 vibe coding 到 agentic engineering 的论证 指出的技能退化风险一致，但多了一层从业者自省：作者清楚自己的产出是真实的，同时清楚支撑产出的能力是不可迁移的。

另一重张力是宏观的：LLM 在"多数代码本就不可访问"的语料上训练，写无障碍修复实际上是在对抗模型的系统性偏见，需要消耗更多算力；而 LLM 开发整体正在让互联网更不可访问。作者承认自己的努力是杯水车薪，且短期的无障碍改善与长期的气候致残效应之间存在他无法逃脱的道德负债。

## 实践启示

1. **把专家判断写成 instruction/skill，而不是写进代码评审意见。** 作者的核心工作流是沉淀 corrective instructions 引导 LLM 默认输出无障碍结果——领域知识一旦固化为可复用指令，就不再依赖每次人工把关，且能随生成规模指数放大。

2. **非编码专业人员的产品化路径 = 详细 spec + 纠偏指令。** "spec 写得好 + 代码写不好"的人完全可以产出生产级增强，前提是把 spec 写成 LLM 可执行的粒度（plans、instruction files、skills），而非停留在自然语言描述。

3. **用时间压缩代替说服来推进"没有商业 case"的质量工作。** 当修复成本从"立项级"降到"小时级"，组织的抗拒会自行瓦解；与其为质量争取预算，不如先把做这件事的单位成本打下来。

4. **优先做"视觉零影响"的结构性修复以规避组织摩擦。** aria-label 构造逻辑、F6 导航、treeview 这类对视觉层不可见的改进，既满足合规又不动审美，是政治资本最省的介入点；相比之下改视觉的合规修复才需要正面冲突。

5. **警惕"产出增长"掩盖"技能停滞"。** 作者明确不把 vibe coding 的产出当作学习：靠提示词换取的结果不构成可迁移能力。个体应把 LLM 产出与刻意的基础技能练习分开记账，避免"黑盒奉承"成为唯一熟练的技能。

6. **评估 LLM-first 工作流时，把"采用指标"当作组织设计变量而非技术指标。** token 追踪排名重塑了"谁算贡献者"，会结构性排挤不适用该工作流的角色；设计这类度量时需问一句：我们是在度量产出，还是在强制一种工作身份？

---
## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)
- 相关: Agent 架构

---

