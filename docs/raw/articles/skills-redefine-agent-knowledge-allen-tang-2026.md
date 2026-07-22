---
title: "一文搞懂 Skills：Anthropic 用它重新定义了'怎么给 Agent 喂知识'"
source: wechat
source_url: https://mp.weixin.qq.com/s/fuhenGVN36CHTvj3LW_D_Q
author: AllenTang
feed_name: 架构师带你玩转AI
review_value: 8
review_confidence: 8
review_recommendation: worth-reading
review_stars: 4
date: 2026-06-29
created: 2026-06-29
updated: 2026-06-29
tags: [skills, claude-code, anthropic, context-engineering, knowledge-management, progressive-disclosure, agent-harness]
type: article
provenance_state: extracted
sha256: 65dbf919ae8d9b448092b788c0821f912dffbc4f705fe06ffc4caa1f335667a5
---

# 一文搞懂 Skills：Anthropic 用它重新定义了"怎么给 Agent 喂知识"

## 四种喂法的进化线

| 喂法 | 机制 | 优点 | 致命短板 |
|------|------|------|----------|
| **Prompt** | 当场说 | 灵活即时 | 一次性，说完就忘 |
| **RAG** | 提前存进知识库，用时检索 | 知识可沉淀复用 | 得提前猜要用什么，存多存少都出问题 |
| **CLAUDE.md** | 每次自动注入 | 常驻稳定 | 越堆越长，噪音淹没关键内容 |
| **Skills** | 按需取，渐进式披露 | 无限积累不干扰 | — |

## ETH Zurich 实证研究（2026-02）

- 机器生成的 CLAUDE.md 类上下文文件：任务成功率**降低约 3%**
- 人精心写的：也只**提升约 4%**
- 无论哪种：推理成本**涨 20% 以上**

原因：文件被当成背景无差别灌入，大量内容是模型"本来就知道"或"读代码就能看出"的，等于往上下文灌噪音。

## Skills 的范式反转：从"提前给"到"按需取"

前三种喂法的共同死穴：**都是"提前给"**。Prompt 当场提前说，RAG 提前存进库，CLAUDE.md 提前写好每次灌。它们都预设你得在 AI 干活前准备好知识——但"提前"本身就是原罪：猜不准需要什么、需要多少，永远在"给少了"和"给多了"之间两头受气。

Skills 把这件事彻底反过来：**不在干活前提前喂知识，让 AI 在干活中需要时自己去取。**

## 渐进式披露（Progressive Disclosure）三层机制

1. **第一层：目录** — 每个 skill 一行简介（元数据），系统启动时只加载所有 skill 的目录。Anthropic 实测 17 个官方 skill，每个目录只占 ~80 token，全部加起来才一千多 token。
2. **第二层：正文** — 任务匹配到某个 skill 简介时，才加载该 skill 完整正文。其他 skill 正文一字不进。
3. **第三层：参考文件** — 正文中引用的更深细节，只有真的需要时才单独加载。

效果：平时 Claude 眼前只有轻飘飘的目录；只有任务真正需要某块知识时，才精准地一层层取出。**装一百个 skill 也不会互相干扰。**

## Skills ≠ markdown：可执行的能力

一个 skill 不是一份文档，是**一个文件夹，里面能装可执行代码**。

Anthropic 的 docx skill 例子：除了说明，还塞了脚本，包含"生成文档必须显式设置纸张大小（底层库默认 A4）""绝不用 unicode 字符当项目符号"等踩坑经验。

关键设计：脚本本身和它处理的数据**全程不进入 Claude 的上下文**，只有最终结果进。把复杂确定性操作从"模型用脑子硬想"卸载成"运行一段代码"——更可靠，几乎不占脑容量。

**纯 markdown = 文字描述的知识（占上下文）；Skill = 可执行的能力（不占上下文）。**

## 判断用哪个的决策规则

> 当你纠结用哪种喂法时，先问自己——我是想给 Claude **一段背景知识**，还是想教它一套**该怎么做的本事**。

- **背景知识**（项目是干嘛的、有哪些资料）→ Projects、CLAUDE.md
- **做事的本事**（代码审查流程、文档生成规范）→ Skill——可复用、按需调用，不该每次重讲，也不该一直占着脑子

## 核心金句

> 能力可以无限多，在场的永远刚刚好。

Anthropic 用 Skills 重新定义的不是"知识的格式"，是**"知识被调用的时机"**。在旧范式里，知识越多模型越不堪重负；在 Skills 范式里，知识可以无限攒在文件夹里，却始终只有当下需要的那一点出现在模型眼前。
