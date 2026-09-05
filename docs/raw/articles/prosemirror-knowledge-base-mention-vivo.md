---
title: "知识库问答 @文档：从 DOM 方案到 ProseMirror 落地（vivo 互联网项目团队）"
source_url: "https://mp.weixin.qq.com/s/7db3l9s9MfMonr0BYwyouQ"
publish_date: 2026-06-04
tags: [wechat, article, prosemirror, rich-text-editor, agent, knowledge-base, mention, dom, schema, plugin, decoration, suggestion, vivo]
review_value: 8
review_confidence: 8
review_recommendation: strong
sha256: fb13f42571ba88fc85c435bd7f6b7534b58c3e820615d3a0ebc7163f92f8ee2b
---
# 知识库问答 @文档：从 DOM 方案到 ProseMirror 落地
> 作者：vivo 互联网项目团队 · Ding Junjie
> 原文：https://mp.weixin.qq.com/s/7db3l9s9MfMonr0BYwyouQ
> 背景：知识库问答输入框的 @文档 mention 能力 —— 表面是"输入 @ 后选一个文档"，实则是编辑器稳定性的工程问题

## 一句话定位
**从 DOM 方案转向 ProseMirror** 是因为"文本 + 原子节点"混排后，复杂度会从"能不能插进去"转移到"能不能一直稳定"——光标恢复、IME、`innerHTML` 污染 undo 栈、临时交互态混入文档，每一项都让裸 `contenteditable` 不可维护。

## 为什么不用 DOM 方案
直觉路径：
1. `contenteditable` 容器监听输入
2. 识别光标前的 `@query`
3. 弹出候选并插入一个不可编辑的引用节点

进入深水区后暴露的坑：
- **光标位置**在嵌套节点里很难稳定恢复
- **IME** 组合输入期间改 DOM 容易打断候选或错位
- **`innerHTML`** 纠正结构会污染 undo/redo 栈
- **临时交互态**（高亮、弹窗锚点）混进文档后很难维护

> 关键判断：方案选择取决于**复杂度在哪一层**。当交互从"插得进去"变成"一直稳定"，抽象层级必须提升。

## ProseMirror 架构（与 @文档 落地）
围绕**不可变文档（doc）+ 事务（Transaction）**构建，配合 `EditorState` / `EditorView`，通过 `Schema` / `Plugin` / `NodeView` / `Decoration` 扩展点协同，处理跨浏览器 `contenteditable` / 选区 / IME / 光标映射。

输入框 schema 三件套：
| 节点 | 作用 |
|---|---|
| `textNode` | 基础文本 |
| `docrefNode` | @到的文档（原子行内引用） |
| `hardBreakNode` | 换行（`<br>`） |

> **易忽略**：第三件 `hardBreakNode` 经常被遗漏，导致换行行为不可预期。

### `docrefNode` 关键设计
```ts
const docrefNode: NodeSpec = {
  inline: true,
  group: 'inline',
  atom: true,            // 原子节点：不可被光标拆开编辑
  selectable: true,      // 可选中
  attrs: {
    id:    { default: '' },     // 文档唯一 id（用来查内容）
    label: { default: '' },     // 展示文本（一般=文档标题）
    mtype: { default: 'doc' },  // 类型：未来 @ 更多东西时区分样式
  },
  toDOM(node) { ... return ['mention', attrs, label] },
  parseDOM: [{ tag: 'mention', getAttrs(dom) { ... } }],
}
```
- `atom: true` 防止光标进入引用内部
- `attrs` 三个字段：id 查内容 / label 展示 / mtype 区分未来 mention 类型（VAPD/任务/…）
- `parseDOM` 处理 `no-access` 类型（无权限时降级显示 label，id 留空）

## 交互链路：触发 → 显示 → 确认
### 1. 触发（监听）
- 行首或空格后输入 `@`，进入"活跃查询"态
- 在 `state.apply` 中调用 `findSuggestionMatch` 匹配触发串
- 得到 `range` / `query` / `text`

### 2. 显示（弹窗 + Decoration）
- **关键设计**：`@` 后的"查询高亮块"是临时态，最终会被选中的 mention 替换 —— **不写入 schema**
- 用 `Decoration.inline` 而不是节点，因为 `Decoration` 只在渲染层出现，**不影响文档结构 / 不污染历史栈**
- `data-decoration-id` 绑定插件状态，便于精准定位弹窗

```ts
return DecorationSet.create(state.doc, [
  Decoration.inline(range.from, range.to, {
    nodeName: 'span',
    class: isEmpty ? 'pm-mention-query is-empty' : 'pm-mention-query',
    'data-decoration-id': decorationId,
    'data-decoration-content': '输入文档名称',
  }),
])
```

### 3. 确认（插入 docref）
- 弹窗点击候选 → 触发 `select(item)` → 经 `createDocSuggestRenderer` 的 `onSelect` 抛出
- 外层 `createMentionPlugin` 的 `onSelect` 接住并调用 `insertDocRef({ id, label, subtitle })`
- 插入 `docref` 原子节点 + Hair Space + 光标置于其后

```ts
createMentionPlugin({
  getItems: async q => /* 拉取 { id, label, subtitle }[] */,
  onSelect: item => {
    handleSelectSuggestion({
      id: String(item.id),
      label: item.label,
      subtitle: item.subtitle,
    })
  },
})

function handleSelectSuggestion(attrs: DocRefAttrs) {
  insertDocRef(attrs)  // 创建 docref 原子节点 + Hair Space
}
```

## Suggestion = ProseMirror 的"插件中的插件"
- 由 `Plugin` 实现，提供匹配 + 装饰
- `createMentionPlugin` 作为组合层对接弹窗渲染（`SuggestRenderer`）
- 弹窗样式与交互集中在渲染层（`createDocSuggestRenderer` 返回 `{ onBeforeStart, onStart, onBeforeUpdate, onUpdate, onExit, onKeyDown }`）
- 定位：`onStart/onUpdate` 接收 `props.clientRect()` 用于精准锚定

## 关键工程教训（结语）
1. **光标不乱跳**：原子节点 + 不可变事务是底层保障
2. **输入法不中断**：不要在 IME 组合期间改 DOM —— 用 `Decoration` 在渲染层处理活跃态
3. **撤销/重做可预期**：临时态永远不进 schema（`Decoration` 而非节点）
4. **异步检索不串结果**：debounce + 请求 token 校验 + 在事务边界内更新
5. **文档内容与临时态拆分到不同层**：doc = schema 节点；活跃态 = Decoration

## 与"经验修补"的区别
> "主链路闭环 + 关键稳定性收敛" —— 不是所有问题都一次性解决，但把复杂度从"经验修补"推进到了"结构化治理"。

> 最核心的收获：把问题讲清楚、把边界拆清楚，编辑器能力才有机会长期演进。

## 适用场景
- mention（@人、@文档、@任务）
- 标签引用（#tag）
- 变量插入（`{{var}}`）
- 任何"文本 + 原子节点"混排的富文本

## 提到但未深聊
- IME 处理细节（`compositionstart`/`compositionupdate`/`compositionend` 边界）
- 多用户协同（Yjs / Automerge 与 ProseMirror 集成）
- 与 VAPD AgentKit 的关系（vivo 内部 Agent 前端通用库）

→ [[entities/prosemirror-knowledge-base-mention|深度实体页]]
