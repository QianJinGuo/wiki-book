# ProseMirror @文档 mention：知识库 Agent 输入框的工程化实现

## Ch04.228 ProseMirror @文档 mention：知识库 Agent 输入框的工程化实现

> 📊 Level ⭐⭐ | 10.2KB | `entities/prosemirror-knowledge-base-mention.md`

# ProseMirror @文档 mention：知识库 Agent 输入框的工程化实现
> "对于知识库 agent 来说，@ 能力就好似厨师的调味盘 —— 允许用户在和 AI 协作时自由组织意图和上下文" —— vivo 互联网项目团队 Ding Junjie

这是一份难得的**"踩坑 → 选型 → 工程化落地"完整复盘**：知识库问答场景下，如何用 ProseMirror 实现稳定可用的 @文档 mention 能力。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/prosemirror-knowledge-base-mention-vivo.md)

## 核心命题
**@文档 表面是"输入 @ 后选一个文档"，实则是编辑器稳定性的工程问题**。当交互从"插得进去"变成"一直稳定"，抽象层级必须从裸 `contenteditable` 提升到 ProseMirror 这类不可变文档模型。

## 为什么不用 DOM 方案
直觉路径（用 `contenteditable` + `@` 监听 + 候选弹窗）做出来的版本会暴露 4 类坑：

| 坑 | 表现 |
|---|---|
| **光标恢复** | 嵌套节点里光标位置很难稳定恢复 |
| **IME** | 组合输入期间改 DOM 容易打断候选或错位 |
| **`innerHTML` 修复** | 纠正结构会污染 undo/redo 栈 |
| **临时交互态** | 高亮、弹窗锚点混进文档后很难维护 |

> 这 4 项任意一项都会让"轻量方案"在生产里崩盘。**复杂度不在"能不能插"，在"能不能一直稳定"。** 

## 三个关键设计决策
### 决策 1：Schema 拆成三件套（不是两件套）
```
textNode       ← 基础文本
docrefNode     ← @到的文档（原子行内引用）
hardBreakNode  ← 换行（= <br>）← 最容易遗漏
```
- `hardBreakNode` 经常被遗漏，导致换行行为不可预期
- **原则**：schema 必须**穷尽**编辑器的合法结构 

### 决策 2：原子 + 不可变 = docref 的安全边界
```ts
const docrefNode: NodeSpec = {
  inline: true,
  group: 'inline',
  atom: true,         // 关键：光标不能进入引用内部
  selectable: true,   // 可选中
  attrs: {
    id:    { default: '' },     // 文档唯一 id
    label: { default: '' },     // 展示文本
    mtype: { default: 'doc' },  // 类型：未来 @ 更多东西时区分样式
  },
  toDOM(node) { return ['mention', attrs, label] },
  parseDOM: [{ tag: 'mention', getAttrs(dom) { ... } }],
}
```
- `atom: true` 防止光标进入引用内部
- `mtype` 字段为未来扩展（@VAPD、@任务）留好样式钩子
- `parseDOM` 处理 `no-access` 降级显示 

### 决策 3：临时态用 Decoration，**不进 schema**
@ 后的"查询高亮块"是临时态 —— 最终会被选中的 mention 替换。如果用节点实现：
- 会污染 undo/redo 栈（"搜索中的中间态"被压进历史）
- 文档结构变得臃肿

正确做法：
```ts
Decoration.inline(range.from, range.to, {
  nodeName: 'span',
  class: 'pm-mention-query',
  'data-decoration-id': decorationId,        // 绑定插件状态
  'data-decoration-content': '输入文档名称',  // 用于弹窗定位
})
```
- `Decoration` 只在渲染层出现，**不影响文档结构**
- `data-decoration-id` 解决"装饰节点 ↔ 插件状态"双向绑定问题 

## 交互三阶段（事务边界内可控）
| 阶段 | 关键调用 | 风险点 |
|---|---|---|
| **触发** | `state.apply` → `findSuggestionMatch` → `range/query/text` | IME 组合期不能改 DOM |
| **显示** | `createDocSuggestRenderer` 返回 `{ onBeforeStart, onStart, onBeforeUpdate, onUpdate, onExit, onKeyDown }` | 弹窗定位用 `props.clientRect()` |
| **确认** | `select(item)` → `onSelect` → `insertDocRef(attrs)` | 必须**一次事务**插入 + 移光标 |

> `onSelect` 路径：`弹窗 select(item)` → `createDocSuggestRenderer.onSelect` 抛出 → 外层 `createMentionPlugin.onSelect` 接住 → `insertDocRef({ id, label, subtitle })` 

## Suggestion = "插件中的插件"
- **不是 ProseMirror 核心** —— 由 `Plugin` 实现，提供匹配 + 装饰
- `createMentionPlugin` 作为**组合层**对接弹窗渲染
- 弹窗样式与交互集中在渲染层

> 这是一种很有借鉴价值的模式：**核心能力 = ProseMirror 插件，组合层 = 业务插件，渲染层 = 框架无关**。 

## 5 条工程教训
1. **光标不乱跳**：原子节点 + 不可变事务是底层保障
2. **输入法不中断**：IME 组合期间不碰 DOM，用 `Decoration` 处理活跃态
3. **撤销/重做可预期**：临时态永远不进 schema
4. **异步检索不串结果**：debounce + 请求 token 校验 + 在事务边界内更新
5. **文档内容与临时态拆到不同层**：doc = schema 节点；活跃态 = Decoration

## 主链路闭环 vs 经验修补
> "这次方案的完成度，可以概括为'主链路闭环 + 关键稳定性收敛'。
> 它并不意味着所有问题都被一次性解决，但至少把复杂度从'经验修补'推进到了'结构化治理'。"

> 最核心的收获：**把问题讲清楚、把边界拆清楚，编辑器能力才有机会长期演进**。 

## 适用场景
- mention（@人、@文档、@任务）
- 标签引用（#tag）
- 变量插入（`{{var}}`）
- 任何"文本 + 原子节点"混排的富文本

## 通用启示（harness / agent 输入层）
- **"@ 能力"本质是 Agent 上下文组合层**：用户自由组织意图与上下文，类似厨师的调味盘
- **临时态与持久态必须分层**：Agent UI 里大量"选中态 / 高亮态 / 弹窗锚点"如果混进 document，会污染整个对话历史
- **schema 决定上限**：写不出 `hardBreakNode` 这种小事，会让"换行"成为长期 bug 来源

## 深度分析
- **抽象层级跃迁是本案例的方法论核心**：从 `contenteditable` 到 ProseMirror 不是"换了一个库"，而是把编辑器的复杂度从"开发者手动维护 DOM 状态"提升到"不可变文档 + 事务 + 状态机"三层分层。这是从经验修补走向结构化治理的分水岭。 

- **Schema 三件套穷尽性原则是防坑第一步**：`hardBreakNode` 被遗漏导致换行行为不可预期这件事，折射出一个更深层的工程哲学——Schema 必须穷尽编辑器的合法结构，不能靠运行时打补丁。这个原则适用于任何复杂输入场景的 harness 设计。 

- **Decoration 模式解决了"临时态污染文档"的结构性问题**：@ 触发后的查询高亮块使用 `Decoration.inline` 而不是节点，意味着它只存在于渲染层，不进入 undo/redo 栈。这个设计将"活跃交互态"和"持久文档内容"严格分层，是 Agent 输入框这类混合态场景的标准范式。 

- **Suggestion 插件的组合层模式具有跨场景复用价值**：`createMentionPlugin`（业务组合层）+ `SuggestRenderer`（渲染层）的分离，让弹窗样式和交互逻辑与核心编辑器完全解耦。这套模式可以迁移到任何 @mentions、#tags、`{{var}}` 等触发式输入场景。 

- **事务边界内完成确认是稳定性的最终保障**：`insertDocRef` 必须一次事务内完成"插入节点 + 移动光标"，不能拆分。任何跨事务的部分状态都会导致 undo/redo 错乱或光标丢失——这在复杂编辑器里是灾难性的。 

## 实践启示
- **构建 Agent 输入层时，Schema 设计优先于交互实现**：先穷举所有合法节点类型（textNode / 原子引用节点 / hardBreakNode），再实现交互。先把"能放什么"定义清楚，再解决"怎么放进去"的问题。这个顺序反了会导致严重的运行时稳定性问题。 

- **所有临时 UI 态（弹窗 / 高亮 / 候选列表）必须放在渲染层，用 Decoration 或等效机制实现，不能混入 document schema**：一旦临时态进了 schema，就会污染 undo/redo 栈，导致"撤销一个打字操作却撤销了弹窗交互"的灾难。 

- **IME（输入法）场景必须有独立的防抖路径**：在 `compositionstart` / `compositionupdate` / `compositionend` 期间禁止任何 DOM 写操作，用状态机管理输入法组合期。这个细节在中文 / 日文 / 韩文 Agent 输入场景里是硬性门槛。 

- **触发 → 显示 → 确认三阶段链路必须在同一事务边界内完成状态同步**：触发阶段 `findSuggestionMatch` 获取 range，弹窗显示依赖 `data-decoration-id` 与插件状态的双向绑定，确认阶段 `insertDocRef` 一次事务完成。这三个阶段的任何跨边界都会引入竞态。 

- **@文档 mention 能力可以视为 Agent harness 的"上下文组合协议"**：用户通过 @ 自由组织意图和上下文，harness 需要设计好上下文节点的解释和序列化方式。建议参考 [Agent Skill Writing](ch04/245-skill.md) 中的 Skill 格式设计上下文引用的渐进式披露机制。 

- **编辑器稳定性的治理思路可以推广到整个 Agent 系统架构**：把复杂度从"经验修补"推进到"结构化治理"，核心是把问题讲清楚、把边界拆清楚。这正是 [Agent Architecture Harness New Backend](ch03/044-agent.md) 所描述的"harness 成为新后端"趋势在输入层的具体落地。 

## 相关对照
- [Impeccable](ch05/001-impeccable.md) —— harness 之上"设计能力层"
- [vivo AI 导购在官网落地实践](ch04/150-ai.md) —— 同作者团队
- [Agent Skill 编写指南](ch04/245-skill.md) —— Skill 格式 + 渐进式披露
- [Harness 成为新后端](ch03/044-agent.md)

---

