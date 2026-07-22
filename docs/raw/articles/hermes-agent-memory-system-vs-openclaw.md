---
title: Hermes Agent 记忆系统深度拆解
source_url: https://mp.weixin.qq.com/s/0n5aw2I0yoyHS7W5fQ6ydA
publish_date: 2026-04-30
tags: [wechat, article, agent, openclaw]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: cbef34060f02db368c48d1e5422ccc0b82a4aa393cba053aa6d3f3216d09e521
---
# Hermes Agent 记忆系统深度拆解
> Source: https://mp.weixin.qq.com/s/0n5aw2I0yoyHS7W5fQ6ydA
> Author: 架构师（微信公众号，JiaGouX）
> Published: 2026-04-30
> Reference: Manthan Gupta — Fixes What OpenClaw Got Wrong
## 文章摘要
核心论点：Hermes 没有做"更强大的记忆"，而是把记忆的**成本账**算得更细。它把不同类型的信息放入成本和用途完全不同的机制，避免把所有东西混在一个越来越大的 memory 口袋里。
## Hermes 四层记忆体系
| 层级 | 存储位置 | 默认容量 | 定位 |
|------|---------|--------|------|
| **热记忆** | MEMORY.md + USER.md | 2,200 + 1,375 字符 | 每轮都该知道的事实和偏好 |
| **会话检索** | session_search (SQLite + FTS5) | 无硬上限 | 档案室，"上次那个问题怎么处理的" |
| **程序性记忆** | Skills (~/.hermes/skills/) | 无硬上限 | SOP，这类任务下次怎么做 |
| **深层用户建模** | Honcho（外部 provider） | 可选 | 跨平台/跨设备长周期画像 |
**容量设计细节**：MEMORY.md 和 USER.md 用**字符限制**而非 token 限制，不需要依赖某个模型的 tokenizer，实现朴素但稳定、可预测、少耦合。
## 核心设计原则
### 1. 不轻易改系统提示词
MEMORY.md 和 USER.md 在会话开始时作为 **frozen snapshot** 注入系统提示词。会话中途写入新内容，新内容会**立刻落盘**，但**不会立刻改掉当前会话已经构建好的 system prompt**。
**原因**：保护 prompt cache。如果前面的系统提示词部分频繁变化，模型供应商侧的 prompt caching 就很难命中。
**取舍**：牺牲一点即时性，换来更稳定的缓存命中和更可控的提示词结构。
### 2. memory 工具设计
```json
{ "add", "replace", "remove" }
```
- **没有复杂的"读"动作**：当前记忆在会话开始时已注入，模型不需要再读一遍。
- **replace 和 remove 用子字符串匹配**：模型不需要记住内部 ID，只需要拿现有条目里一段唯一文本来操作。
- **安全边界**：写入前检查危险内容——提示词注入、凭证泄露、SSH 后门暗示、不可见 Unicode 字符。
> **记忆是提示词供应链的一部分**。普通日志里混进恶意文本，影响范围有限；长期记忆里混进"忽略之前所有指令"，会在后续很多会话里反复污染系统状态。
### 3. 压缩前的 memory flush
长会话一定会遇到压缩。Hermes 在压缩**前**先做一次 memory flush：
1. 给模型专门指令：会话即将被压缩，请先保存值得长期记住的内容（用户偏好、修正、重复模式，**不要**保存一次性任务细节）
2. 运行一次额外模型调用，只开放 memory 工具
3. 把稳定事实写入 durable memory（MEMORY.md / USER.md）
4. 压缩旧历史，重建 prompt cache
5. 新热记忆进入新的稳定提示词快照
**流程**：长会话 → 压缩前保存稳定事实 → 压缩旧历史 → 重建提示词 → 带着更新后热记忆继续
> **记忆压缩不能只理解成把历史变短，而是把任务状态迁移到更稳定的位置。**
### 4. session_search：档案室不等于随身备忘录
当模型需要回忆以前聊过什么时：
1. FTS5 在历史消息里搜索
2. 按 session 聚合结果
3. 解析父子会话关系（parent_session_id）
4. 加载最相关的会话
5. 在匹配点附近截断 transcript
6. 用便宜的辅助模型做 focused summary
7. 把压缩后的回顾交还给主模型
**边界清晰**：MEMORY.md 负责"我每次都要知道什么"；session_search 负责"用户说上次那个问题时，我怎么找回来"。
> **档案室很重要，但没人会把档案室背在身上。**
### 5. Skills：Agent 也要记住做事方法
Skills 放在 ~/.hermes/skills/，称为 **procedural memory**（程序性记忆）。
- 事实记忆回答"环境是什么、用户偏好是什么"
- 会话检索回答"以前发生过什么"
- Skills 回答"下次遇到类似任务，应该怎么做"
**注入策略**：注入的是紧凑的 skills index，真正需要时再加载完整 skill。主上下文只保留当前推理需要的高密度信息。
> Skills 是 Agent Runtime 里的 SOP。它的价值不在"越来越有灵性"，而在于把团队和系统已经验证过的做事方法，变成可检索、可更新、可审查的运行时资产。
### 6. Honcho：深层用户建模也要守住缓存边界
- **第一轮**：预取到的 Honcho 上下文织入系统提示词
- **后续轮次**：不改稳定 system prompt，把 Honcho recall 附加到当前用户消息附近，API 调用时动态提供
**好处**：稳定前缀继续稳定 → prompt cache 继续发挥作用 → 深层用户建模不破坏缓存
**谨慎点**：深层用户建模带来更重的治理问题——用户是否知道哪些信息被保存，怎么删除，跨平台同步时权限怎么处理，外部 provider 出错时如何回滚。
## Hermes vs OpenClaw 系统重心差异
| | OpenClaw | Hermes |
|--|---------|--------|
| **系统重心** | Gateway、workspace、入口治理、多 Agent、工作区隔离、可控执行、可审计 | cache-aware 执行型 runtime |
| **记忆厚在** | Memory plane + workspace | 热记忆 + 会话检索 + Skills |
| **哲学** | 把长期状态放进工作区和记忆平面里管理 | 先保护提示词稳定性，再把长期资产拆到各层 |
**不是谁更好，而是各自的擅长领域不同**：
- 目标是多入口、长期在线、强治理的 Agent Gateway → OpenClaw 那套控制面和工作区边界很有价值
- 目标是本地执行型 Agent，强调缓存成本、长任务连续性、过程经验沉淀 → Hermes 的分层值得研究
**真正被修正的不是"OpenClaw 没有记忆"，而是一种很容易出现的记忆观**：
> 只要把更多东西存下来、搜回来、塞给模型，Agent 就会越来越好用。
这句话有一半是对的（长期 Agent 确实需要记忆），但另一半绕不开：更多记忆会带来更多成本——全部塞进提示词会破坏缓存；全部交给历史搜索，召回质量和摘要质量就成了瓶颈；流程经验留在 transcript 里下次难以稳定复用；错误经验沉淀成 skill 又会在未来反复误导 Agent。
**共同方向**：Agent 不能只靠一个越来越长的聊天历史活着。它需要窗口外的状态层，也需要能把状态分门别类放好。
## 给自研 Agent 的三个小问题
1. **什么信息配得上进入热记忆？** → 用户偏好、环境事实、稳定约定可以进；任务进度、完成日志、一次性 TODO 留在别的层。一旦进入 system prompt，按提示词供应链做输入校验和安全扫描。
2. **历史会话有没有档案层？** → 保存完整事件或消息，提供关键词搜索、按 session 聚合、局部截断和摘要召回。用户问"上次那个问题"时，系统应该能查。
3. **压缩前有没有状态迁移动作？** → 长任务压缩前，最好有一轮明确的 durable state extraction。别等历史已经被摘要磨薄了，才发现关键事实没留下来。