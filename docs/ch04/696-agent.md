# 协同文档下的 Agent 透明化编辑：可回滚、可对比的协作闭环

## Ch04.696 协同文档下的 Agent 透明化编辑：可回滚、可对比的协作闭环

> 📊 Level ⭐⭐ | 4.4KB | `entities/vivo-agent-transparent-collaborative-editing.md`

# 协同文档下的 Agent 透明化编辑：可回滚、可对比的协作闭环

> 来源：vivo互联网技术（Ding Junjie）AI 编辑器二期调研实践 | 主题全库零覆盖

当 AI 以惊人速度编辑多人协同文档时，真正的难题不是"AI 能不能写得好"，而是如何确保 AI 与人类精细化编辑和谐共存、不破坏协同信任感。这不仅是模型问题，更是协同架构挑战：关键在于明确 Agent 在协同系统中的"身份"，并通过可回滚、可对比的机制把 AI 编辑纳入透明、可控的协作闭环。

## Agent 身份三模式

Undo/Redo 是上世纪 70 年代的经典 UI 约定，但 Agent 踏入协同文档后失灵——改动不再只源于"我"。对比三种身份模式：
- **独立 Peer**：Agent 作为独立协作者接入——归属权清晰、撤销天然独立，但占用协同席位、权限和同步复杂度高。
- **附属 Cursor**：Agent 绑定当前用户作辅助编辑者——权限简单、体验顺滑，但无额外标记则 AI 和人撤销流混在一起。
- **模拟用户**：直接以用户身份修改——接入成本最低，但破坏信任、无法追溯自己 vs AI 改动。

**最终取舍**：倾向附属模式，但每次改动必须有独立"身份证明"（会话 ID/运行轮次/消息批次）。既不让 Agent 独立出现制造"虚拟同事"，也不完全伪装成用户——系统才能区分用户输入、AI 编辑成果、AI 编辑后自动补齐的结构。

## 透明化编辑：事实链而非结果快照

Agent 修改大刀阔斧、跨结构重写。方案是可观测对比、一键撤回。工具入口层通过 `editor.chain().changedByAI({ runId, sessionId, messageId }).run()` 沿同一条"身份边界"处理。

- **语义化差异对比**：字符级 diff 对富文本是灾难（把一次段落重写拆成无数细碎增删），改用两层差异对比策略，用户看到"AI 在哪里动了刀"而非底层操作日志。
- **事实链**：在 ProseMirror 中 Step 是最小变更单元，序列化为 stepsJson。同一 runKey 只保存一份 baseJson，后续每个 message 只追加自己的 stepsJson——一轮 Agent 编辑变成 baseJson + ordered stepsJson 的可回放事实链。

**三层心智模型**（记录/展示/决策分离）：记录层保存机器可还原的"事实"；展示层把事实回放成 beforeDoc/afterDoc 并翻译成用户可读语义差异；决策层基于同一条"事实链"执行接受/拒绝/回滚。

## run 级精准撤回

单人编辑器撤销是时间栈，但多人协同 + Agent 编辑场景不适用——时间上最后发生的操作不一定想撤销。典型场景：用户 A 触发 AI 改 2-3 段，同时人类用户在 4 段补一句话，用户 A 点"撤回 AI 修改"，若全局撤回会误伤人类补充内容。

**撤回语义拆为两类**（按身份边界区分 AI 与人类编辑），撤回边界必须与差异对比边界一致。实现上，AI 编辑入口先把事务从普通编辑历史"摘出来"写入边界信息；事务进入 Yjs 侧后 UndoManager 利用同一组元数据过滤。

## 相关实体

- [知识库问答 @文档：从 DOM 方案到 ProseMirror 落地](https://github.com/QianJinGuo/wiki/blob/main/entities/prosemirror-knowledge-base-mention-vivo.md)（vivo 同系列，编辑器底层）
- [2 小时 0 行手写代码 VSCode 插件](../ch01/1233-claude.html)（AI 产出可审计资产）
- [Harness Engineering](../ch05/065-harness-engineering.html)

---

