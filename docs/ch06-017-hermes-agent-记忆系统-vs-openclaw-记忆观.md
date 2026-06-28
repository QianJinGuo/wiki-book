## Ch06.017 Hermes Agent 记忆系统 vs OpenClaw 记忆观

> 📊 Level ⭐⭐ | 8.5KB | `entities/hermes-agent-memory-system.md`

## 四层分框架
| 层级 | 存储 | 容量 | 定位 |  
|------|------|------|------|  
| **热记忆** | MEMORY.md + USER.md | 2,200 + 1,375 字符 | 每轮都该知道的事实和偏好 |  
| **会话检索** | session_search (SQLite + FTS5) | 无硬上限 | 档案室，"上次那个问题" |  
| **程序性记忆** | Skills | 无硬上限 | SOP，"这类任务下次怎么做" |  
| **深层用户建模** | Honcho（外部） | 可选 | 跨平台/跨设备长周期画像 |  
> 和 [Agent Memory 架构本质](ch04-146-how-ai-agent-memory-works.html) 的"write-manage-read 三链路闭环"角度不同，Hermes 更侧重**运行时成本控制和分层治理**。

## 核心设计：cache-aware
**不轻易改系统提示词**。会话中途记忆写入先落盘，不立刻修改当前 system prompt——保护 prompt cache。牺牲即时性，换缓存命中和提示词结构稳定。
**压缩前 memory flush**：长会话压缩前，模型先提取"值得长期保存的事实"写入 durable memory，再压缩历史。**记忆压缩不是把历史变短，而是把任务状态迁移到更稳定的位置。**
**记忆是提示词供应链**：写入前检查提示词注入、凭证泄露、SSH 后门等模式——因为 memory 内容未来可能进入 system prompt。
这和 Agent Harness 上下文管理：工作集视角 的判断一致：**窗口里留下来的，不应该是发生过的一切，而应该是下一轮推理真的要用的工作集**。

## vs OpenClaw：不是谁有记忆，而是谁把记忆放对了位置
| | OpenClaw | Hermes |  
|--|---------|--------|  
| **重心** | Gateway / workspace / 多 Agent / 工作区隔离 | cache-aware 执行型 runtime |  
| **记忆厚在** | Memory plane + workspace | 热记忆 + 会话检索 + Skills |  
| **哲学** | 长期状态放进工作区和记忆平面管理 | 先保护提示词稳定性，资产分到各层 |  
**真正被修正的记忆观**：不是"把更多东西存下来、搜回来、塞给模型，Agent 就会越来越好用"。更多记忆会带来更多成本——破坏缓存、召回质量瓶颈、错误经验固化。

## 给自研 Agent 的三问
1. **什么配得上热记忆？** → 用户偏好/环境事实/稳定约定；任务进度/TODO/流水账不进
2. **历史有没有档案层？** → 完整事件+关键词搜索+按 session 聚合+摘要召回，而非全塞进 memory
3. **压缩前有没有状态迁移？** → 长任务压缩前先做 durable state extraction

## 深度分析
Hermes 的记忆系统本质上是一套**分层成本治理**架构，而非单一的大容量记忆存储。其核心洞察是：记忆的代价不仅在于存储，更在于它进入推理上下文的路径成本。
**热记忆的精准克制**：MEMORY.md + USER.md 的 2,200 + 1,375 字符限制看似严格，实则刻意为之。用字符而非 token 限制，规避了对特定模型 tokenizer 的依赖，实现真正的存储无关性。更关键的是，这两块内容在会话期间作为 frozen snapshot 注入系统提示词——写入时落盘但不修改已构建的 prompt，保护的是 prompt cache 的命中稳定性。
**记忆压缩即状态迁移**：传统视角将压缩理解为"把历史变短"，Hermes 的压缩前 memory flush 机制揭示了另一种范式：压缩前先做 durable state extraction，把值得长期保存的事实（用户偏好、修正、重复模式）迁移到更稳定的热记忆层，再压缩旧历史。这意味着压缩的质量标准不是信息密度，而是**状态位置是否正确**。
**session_search 的设计哲学**：档案室不等于随身备忘录。FTS5 搜索 + 按 session 聚合 + 父会话关系解析 + 便宜模型 focused summary，构成了一条清晰的召回链路。热记忆回答"每轮都要知道什么"，session_search 回答"上次那个问题怎么找回来"——两者定位不重叠，不互相替代。
**Skills 作为程序性记忆的注入策略**：skills index 轻量注入主上下文，真正需要时才加载完整 skill。这解决了 SOP 类知识"存得住但用不上"的问题——关键不是数量，而是按需获取的能力。

## 实践启示
1. **用字符限制作热记忆边界，而非 token**：解耦对特定模型 tokenizer 的依赖，容量预测更稳定。MEMORY.md 和 USER.md 的分工（事实 vs 偏好）值得直接借鉴。
2. **会话中途记忆落盘不修修改 prompt**：任何 memory write 先落盘，会话结束或明确触发点再统一重建 system prompt。保护 prompt cache 的收益远大于即时更新的体验收益。
3. **压缩前必须有一轮状态提取**：在历史被摘要磨薄之前，用独立模型调用 + 仅开放 memory 工具的方式，显式提取 durable facts。别让压缩算法决定什么该留下。
4. **热记忆内容必须通过安全检查**：memory 内容可能进入 system prompt，提示词注入、凭证泄露、SSH 后门等模式必须在写入前被扫描——记忆是提示词供应链的一部分。
5. **区分"环境事实"和"任务流水账"**：前者（环境配置、用户偏好、稳定约定）值得进热记忆；后者（任务进度、中间 TODO、流水账）留在 session_search 层，不要因为"怕忘记"就往热记忆里塞。
6. **深层用户建模守住缓存边界**：Honcho 等外部画像系统在第一轮注入 system prompt，后续轮次通过消息附件动态提供——稳定前缀不动，缓存命中率不降。
7. **给自研 Agent 的三问清单**：

   - 什么配得上热记忆？→ 用户偏好/环境事实/稳定约定
   - 历史有没有档案层？→ 完整事件+关键词搜索+session 聚合+摘要召回
   - 压缩前有没有状态迁移？→ durable state extraction 先于压缩执行

## 与相关条目的关系
- [Agent Memory 模块化框架与评测](ch01-238-agent-memory-模块化框架与评测-memory-in-the-llm-era-4-模块-10-方案对比.html) — 学术视角（ICLR 2026），四组件统一框架
-  — write-manage-read 三链路闭环，六维度记忆单元
- OpenClaw 架构解析 — OpenClaw 薄抽象+显式控制流原始设计
-  — 工作集视角，session/harness/sandbox 解耦

## 关联阅读
- [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hermes-agent-memory-system-vs-openclaw.md)
- [深度拆解 Hermes Agent 记忆系统](/ch06-memory/)
- [memory agent systems cobanov](ch04-458-memory-agent-systems-cobanov.html)
- [AI Agent 记忆系统架构](ch04-145-how-ai-agent-memory-works.html)
-

- [ai agent memory systems](ch04-487-hidden-technical-debt-of-ai-systems-agent-harness.html)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/hermes-agent-memory-system-architecture.md)

- [Agent Memory 架构解析](ch04-111-3-0-agent-agent-agent-5-6.html)

---
