---
title: "拆解 Claude Code 记忆系统：渐进式加载 + 双向链接构成的 Markdown 知识图谱"
source_url: "https://mp.weixin.qq.com/s/yjX2iUT9R0W4REKoksHSGQ"
source_account: "AnthroTech AI"
source_type: "wechat"
ingested: "2026-08-27"
sha256: "6ab9713f7191013b20eefe592c1e973687581fc0e729ffe6f58a7b39f74dd4b1"
tags: [claude-code, memory, agent-memory, markdown, knowledge-graph, bidirectional-link, progressive-loading, harness]
type: raw
---

# 拆解 Claude Code 记忆系统：渐进式加载 + 双向链接构成的 Markdown 知识图谱

> 来源：AnthroTech AI | 2026-08-27 入库 | v=7 c=5 v×c=35 Raw only

基于对 Claude Code 运行时记忆文件的直接检视 + 实操体会整理（非源码分析，靠提示词技巧套取上下文信息）。

## 可信度分级
- ✅ 有文件结构和运行说明佐证，可放心引用
- 🔶 基于证据的合理推测，没找到直接文档确认
- ❓ 属于外层运行时（harness）内部实现，完全看不到

核心观察：Claude 记忆系统里，"判断该不该记"大概率是**模型自己决定**的，而"存在哪、怎么读、加时间戳"这些基础设施是 **harness 管的**。两件事分开看。

## 一、核心思路：把记忆当代码仓库管
Claude Code 记忆不是藏在 SQLite 的神秘 blob，就是硬盘上的一叠 Markdown 文件，用文本编辑器即可打开。原则：
- 一个文件只记一件事（每条记忆独立 .md，删改互不影响）
- 索引和正文分开（MEMORY.md 每行指向一条记忆正文；会话开始只加载索引不加载正文）
- 用到才去读
- 每条记忆说清"是什么、为什么、怎么用"
- 召回带时间戳警告（"N 天前快照，用前核实"）
- 不同项目记忆互不干扰（靠工作目录路径隔离）

## 二、文件位置
`<用户目录>\.claude\projects\<项目键>\memory\`，只有两类文件：MEMORY.md（索引，每行一条，新会话全文塞进上下文）+ 其余每个 .md（一条记忆正文，用到才加载）。

## 三、项目隔离
按工作目录**绝对路径**隔离。路径字符串做 sanitize，非字母数字字符统一替换成 `-`，得到"项目键"。例：`C:\Dev\Sample_App\core_lib` → `C--Dev-Sample-App-core-lib`。🔶 规则从真实文件反推（`:\ _` 确认变 `-`，其他特殊字符未验证）。❓ 是否存在跨项目"全局记忆"层未观测到证据。

## 四、记忆分四种类型（每条必须归属其一）
| type | 记什么 | 额外要求 |
|---|---|---|
| user | 你是谁：角色、专长、偏好 | — |
| feedback | 你给的工作指导（纠正、确认做法） | 必须写 Why 和 How to apply |
| project | 进行中的目标、约束（必须是从代码/git 看不出来的） | 相对日期转绝对日期 |
| reference | 外部资源链接：URL、看板、工单号 | — |

明确不该塞的：代码结构、修 bug 历史、git 日志、CLAUDE.md 已写过的；只在当前对话用得上、跨会话无价值的信息。若让模型记这类内容，它会反问"这里面不显而易见的点是什么？"——然后只记那个。

## 五、一条记忆的文件
feedback 类典型：
```yaml
---
name: feedback-code-style
description: "Prefer composition over inheritance here; run the linter before commit"
metadata:
  node_type: memory
  type: feedback
  originSessionId: <会话UUID>
  modified: <ISO-8601时间戳>
---
正文……
**Why:** 降低耦合，方便单独测试。
**How to apply:** 每次提交前跑 lint 和单测。
参见 [[user-profile]]
```
字段来源区分：name/description/type/正文/[[链接]] — ✅ 模型自己写的；node_type/originSessionId/modified — 🔶 看起来是 harness 保存时自动补上（含精确时间戳和会话 UUID）。实际文件 metadata 字段比精简说明文档多 → "模型写的语义字段" 和 "系统维护的基础设施字段" 是两层。

索引行格式：`- [标题](文件名.md) — 一句话钩子`

## 六、什么时候写记忆
**没有自动触发器**——写不写、何时写是模型对话中自己判断的，不是事件驱动、不是后台守护进程。推断流程：对话出现信息 → 判断跨会话还有用吗（无用跳过）→ 代码/git/CLAUDE.md 已有吗（有跳过）→ 已有记忆覆盖吗（有更新/无新建）→ 无论新建更新都同步 MEMORY.md 索引行。实操：想让模型**一定**记住，直接说"记住……"最稳；拒绝也能阻止写入。

## 七、记忆怎么被召回（两层）
- **第一层：会话启动时——总是发生**。MEMORY.md 索引被全文注入上下文。
- **第二层：对话运行中——按需召回**。harness 根据 description 字段判断某条记忆是否相关，相关就把**正文**塞进 system-reminder，附带时效警告"这是 N 天前的快照，涉及 file:line，用前先核实"。模型也可主动 Read/Grep 记忆目录。❓ 召回具体算法（语义相似度/关键词打分）是 harness 内部实现，看不到。

## 八、怎么维护
写入前先去重（检查同名文件，有则更新）；发现错误就删；双向链接 `[[name]]` 把记忆串成知识图谱；时效护栏（每次召回带"N 天前/先核实"警告）；`consolidate-memory` 技能（手动触发的整理工具，扫描记忆库合并重复、修正过时、精简索引）。

## 九、工具层面：没有专用 API
操作记忆全用通用文件工具，没有"记忆专用接口"：新建=Write（写 .md 再更新 MEMORY.md）；查找=Read/Glob/Grep；修改=Edit/Write（优先更新已有文件）；删除=Shell（rm，只在确认错误时删）。memory\ 目录已存在，不需手动 mkdir。

## 十、这套设计好在哪
文件化纯 Markdown（能 git 管理/diff/人直接看懂）、一条记忆一个文件（改删链接互不影响）、索引常驻+正文按需（省 token）、description 驱动召回（摘要比全文匹配更准）、时效护栏（防把过期信息当事实）、类型化+Why/How（记可执行的东西）、双向链接（记忆串成图不是孤岛）、项目隔离（互不污染）、自我纠错（后来证据推翻之前认知）。

## 十一、还不能确定
❓ 召回算法内部实现看不到；🔶 node_type/originSessionId/modified 是 harness 自动写（未直接确认）；🔶 路径净化规则从样例反推未覆盖所有特殊字符；❓ 是否存在全局记忆层无证据；✅ 写入无自动触发全靠模型判断（可能漏记/多记，"直接说记住"最可靠）。
