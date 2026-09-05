---
source_url: https://mp.weixin.qq.com/s/ISwjIw5lj7JlcQJV7BOx5g
ingested: 2026-07-16
sha256: 12a4f7f98ac5ebca6a7212c44a544c8f30320d8e0d918434bcd4b7d02f67370a
source_published: 2026-07-16
title: "Agent 治理：用 Hook 堵住 LLM 的偷懒、越权与失忆"
author: xiangnzhang
feed_name: 腾讯技术工程
---

> 本文是 DECO（腾讯一站式数据工程 Agent 智能协作平台）实践系列之一，聚焦护栏层：用 Agent 框架的 Hook 切面，在代码层确定性兜底 prompt 管不住的三类问题。

## 引子：两个真实案例

**案例一**：用户让 Agent 改一张核心表的 ETL——1200 多行长 SQL。Agent 写到一半"偷懒"，跳过一大段逻辑写了省略号。这份带省略号的脚本一旦上线，下游几十张表数据全错。

**案例二**：Agent 还在"方案设计"阶段，用户没点头，就径直调了发布工具，把还在讨论的表结构推上了生产。

根因不是模型能力不够，而是它"图省事"或"自作主张"，具体三种表现：

1. **LLM 偷懒** — 长脚本截断、占位略写、复印式重写到 token 耗尽
2. **越权操作** — 模型无法区分查询和发布的可逆性差异
3. **上下文失忆** — 模型用最短路径完成任务，跳过"看起来不必要"的检查

**"在 prompt 里多写几句 ⚠️ 禁止"根本管不住。**

## Hook 链：在关键切面挂载护栏逻辑

Agent 框架普遍提供 Hook（Callback）机制：在模型调用和工具调用的执行前/后暴露切面。

| 切面 | 触发时机 | DECO 用途 |
|------|---------|----------|
| Before Tool | 工具执行前 | 长脚本回写加载全文、危险操作 HITL |
| After Tool | 工具执行后，结果回 LLM 前 | 长脚本拉取后替换为引用句柄 |
| Before/After Model | 每次请求 LLM 前/后 | 响应用户取消等 |
| Before/After Agent | Agent 运行前/后 | 对话持久化等 |

**设计原则**：基础设施和推理逻辑解耦 — Hook 独立运作，模型的 ReAct 循环不用感知。

## 长文本完整性护栏：让长脚本进出 LLM 都不出错

### 核心方案：读写两侧 Offload + 引用句柄

LLM 永远不直接接触脚本全文。两端都用 Hook 拦截 + 沙箱文件做"中转站"：

**拉取侧 Offload（afterTool）**：Hook 拦截含 `scriptContent` 的响应，全文写入沙箱只读快照，响应中替换为引用句柄：

```
<offloaded to /sandbox/{taskName}.remote.etl (read-only snapshot, length=N chars).
To start editing, run copy_file(...) first, then str_replace.>
```

**写回侧 Onload（beforeTool）**：Hook 从文件读回全文覆盖 `scriptContent`，再转发给工具。

### 效果

| 指标 | 治理前 | 治理后 |
|------|--------|--------|
| SQL 进出上下文 | 原样进出 | 全量落盘，自动换引用句柄 |
| 修改任务输出 token | 每轮重传整段 SQL | **直降约 90%** |
| SQL 复印自截断 | 概率近 100% | 物理消除（只走 str_replace 小步改） |

### 关键设计

- **响应形态适配**：单条 Map 和数组都支持，任一条失败仅该条降级
- **失败降级**：落盘失败 → 返回原内容（承担风险，不阻塞）
- **scriptFilePath 框架协议**：工具声明互补参数，下层无感知
- **只读快照 / 工作副本分离**：LLM 必须显式 `copy_file` 才能编辑

## 危险操作确认（HITL）：用 beforeTool 卡住不可逆操作

配置驱动的危险工具守卫挂在 `beforeTool` 切面上：

```yaml
deco:
  dangerous-tools:
    - name: packCommit
      required-state: confirm_pack
      confirmation:
        title: "请确认发布方式"
        options:
          - {id: direct, label: "直接发布（免审批）", value: direct}
          - {id: approval, label: "提交审批", value: approval, hasInput: true,
             inputPlaceholder: "请输入审批人RTX"}
          - {id: draft, label: "保存草稿", value: draft}
          - {id: edit_more, label: "我再改改", value: edit_more}
```

无论 Agent 是自作主张还是被诱导，没有人工确认，`packCommit`/`deployCommit` 在框架层物理走不通。

## 上下文联动闭环：让 LLM 不再"需要查的就不查"

范式：**Hook 采集事实 → 写 state → Attachment 注入下一轮 prompt**

两层解耦：
- **采集是确定性的**：工具调用一定触发 Hook，Hook 一定做完检查
- **注入是时机正确的**：分析结果只在下一轮 prompt 才需要，不污染当前轮

### 案例：RiskAnalysisHook

改表后自动分析下游风险。Agent 调 `upsertTable` 改字段后，Hook 在 `afterTool` 触发风险分析，结果注入下一轮 prompt，LLM 自动输出风险提示。

### 案例：PythonImageHook

Python 脚本产出的图表自动发现并呈现。通过 beforeTool 文件快照对比，发现新产出图片后生成预签名 URL，Attachment 注入后前端渲染内联图片。

## 行业对比

| 场景 | 框架原生覆盖 | DECO 自研原因 |
|------|------------|-------------|
| 长文本读侧 offload | ADK ArtifactService, LangGraph offload middleware | 写侧 onload 需自研（scriptFilePath 协议） |
| HITL | ADK ToolConfirmation, LangGraph HITL Middleware | 需要多选项+输入框+变更预览+配置驱动 |
| 上下文断裂 | ADK ArtifactService（被动 load） | Hook→state→Attachment 主动 push |

## 结语

**prompt 定意图，Skill 定规矩，框架 Hook 定边界 — 能用确定性兜底的，别交给模型。**
