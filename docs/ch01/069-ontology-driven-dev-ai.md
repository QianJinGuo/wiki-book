# ontology-driven-dev：把业务语义钉成 AI 原生应用地基的本体建模开发法

> 📊 Level ⭐ | 3.1KB

## ontology-driven-dev：业务语义作为可被机器消费的正式资产

开源项目（github.com/sharptoolbox/ontology-driven-dev，作者人月聊IT）针对的墙：大模型写业务系统"看着能跑"，但需求改一句话不知道代码改哪几处，二期后需求文档、数据模型、代码三张皮。根因判断：**"业务语义"从头到尾没被当成可被机器消费的正式资产**——需求是散文、代码是程序，中间"业务由哪些对象、行为、规则、角色构成"的共识从未沉淀，模型每轮生成都是重新猜。

解法朴素而硬：在需求和代码之间钉死一层**本体模型**，让需求变成模型、模型生成代码、运行时 AI 读同一份模型。做成可交给 AI 助手执行的技能包（Skill），在 WorkBuddy、Claude Code、Codex、Cursor 里运行。

## 三步法 + 五份规范 + 七模型

**强顺序三阶段管线**（不能跳步）：①需求探索——一句话煲成符合《软件需求编写规范 V9.0》的规格说明书，内部八个子阶段**每个结束必须停下等人确认**；②本体建模——把已确认语义翻译成七份 YAML 模型；③应用构建——落成能登录/录入/审批/查询、侧挂 AI 助理的可运行系统。**"强制人工确认"贯穿全程：AI 可以快，但每步业务真相由人拍板。**

技术底座故意选"最没脾气"的组合：Flask + SQLite + React，单体、无 ORM、同步调用；工具调用全审计日志。

## 诚实边界（作者主动声明）

面向单体同步部署的中小型业务系统（合同/资产/CRM 类）；v9.0 明确移除事件驱动架构；M7 声明不是 BI 指标模型；非功能需求（性能/容量/可用性）不在七模型内；**价值建立在"使用者愿意先花时间把业务想清楚"的前提上**——八阶段人工确认不是零成本，需求本身模糊则救不了。

## 定位

与 [Anthropic Skill 模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-14-skill-patterns-best-practices.md) 的 skill-as-workflow 思路同构，但把 skill 的对象从"AI 如何做事"换成了"业务本身长什么样"；其"语义资产层"主张是 [Context Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/context-engineering.md) 在需求工程侧的延伸。人工确认门禁与 Harness 验证思想同源。

→ [原文存档](https://mp.weixin.qq.com/s/oexhixlqSPDcS2L2rfaeTA)

---

