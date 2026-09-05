---
source_url: https://mp.weixin.qq.com/s/MSXKfefrqM31q-7WXIqCEg
title: "腾讯云Agent Memory节省61% Token提升52%成功率的诀窍：Mermaid无限画布×上下文卸载"
author: kentyhuang
account: 腾讯技术工程
published: 2026-05-22
source: wechat
tags: [agent-memory, context-offloading, mermaid, context-window, agent-framework, tencent]
created: 2026-05-23
sha256: 8dc7455fe2ec1b29c5dc86a78c375e4792a66ca1efaeb84b1e64605e5a73a9cc

---

# 腾讯云Agent Memory：Mermaid无限画布×上下文卸载

## 核心方案

**短期记忆压缩 = 上下文卸载 + Mermaid 无限画布**

- **上下文卸载**：完整工具结果写入外部文件系统，只在上下文保留摘要和索引
- **Mermaid 无限画布**：把任务执行过程转化为可导航的结构化记忆图

### 实验结果

| 评测集 | 任务类型 | 成功率提升 | Token 节省 |
|--------|---------|-----------|-----------|
| SWEbench | 代码修复 | +9.93% | 最高 33.09% |
| Toolathlon | 复杂长任务 | 20%→35% (+75%) | 最高 26.18% |
| WideSearch | 网页搜索 | +51.52% | 最高 61.38% |
| AA-LCR | 长文总结 | +7.95% | 30.98% |

GitHub: https://github.com/Tencent/TencentDB-Agent-Memory

## 一、压缩的艺术

### 语言压缩的本质

"一语胜千言"：好的压缩不是信息更少，而是信息密度更高。删除不影响理解的枝节，保留支撑后续推理的核心语义。

**压缩的三个原则**：
1. 符号必须是通用知识（所有主流 LLM 都能理解）
2. 符号生成不能过于复杂（生成端和理解端语义要一致）
3. 表达要足够自由（不被格式束缚）

### 大模型对符号的理解

- **记忆驱动压缩**（如 MBTI → INTJ）：不稳定，依赖模型见过这个符号
- **结构化表示压缩**（如 Mermaid）：更稳定，模型能从结构推理出语义

真正可用的压缩，不依赖模型"记住了什么符号"，而依赖模型"能够从符号中推理出什么结构"。

## 二、Mermaid 无限画布

### 为什么需要图结构

线性 summary 列表只表达"做过什么"，图结构表达"任务走到哪里、从哪里来、往哪里走"。

Mermaid 作为载体的优势：
- 文本化：本质是代码，LLM 可直接读写
- 结构化：表达节点、边、状态、依赖关系
- 可视化：人类可渲染成图检查
- 可更新：Agent 可持续添加、修改、合并节点
- 可寻址：节点可绑定 node_id、summary、result_ref

### Flowchart vs StateDiagram

在长任务上下文卸载场景中，**Flowchart 比 StateDiagram 效果好约 15%**。

StateDiagram 适合：严格生命周期驱动的对象（订单状态、审批流、TCP连接）
Flowchart 适合：Agent 高度自由的探索式执行过程（并行搜索、多源汇总、失败回退、交叉引用）

### 无限画布的含义

不是上下文窗口无限变大，而是**上下文之外的信息仍然可见、可定位、可恢复、可继续执行**。

Agent 不需要把所有历史细节都放进工作记忆，只需要保留足够清晰的结构入口和路径。

### 层次化注意力机制

1. **鸟瞰（Overview）**：看任务级别的概览，快速判断方向
2. **聚焦（Focus）**：打开对应任务画布，看任务内部结构
3. **下钻（Detail）**：在需要时追溯更细的摘要或原始材料

## 三、上下文卸载

### 什么是上下文卸载

不是所有信息都必须一直放在模型眼前。暂时不需要直接推理的内容，先搬到上下文窗口之外（文件系统、状态对象、日志文件、外部数据库）；上下文里只保留摘要、路径或索引。

### 单独使用上下文卸载或无限画布的问题

| 方案 | 问题 |
|------|------|
| 只有上下文卸载 | 档案柜有了，但缺少结构，Agent 只看到一堆文件和摘要 |
| 只有无限画布 | 信息压缩太狠，Agent 需要细节时找不到证据 |

## 四、四层记忆折叠架构

每次工具调用结束后，信息被拆成三种形态：

```
完整 tool result
    ↓
refs/*.md              保存原文（Level 0）
    ↓
offload-<sessionId>.jsonl  保存工具调用级 summary（Level 1）
    ↓
mmds/<task>.mmd       保存任务节点级 summary（Level 2）
    ↓
当前上下文             注入 active MMD 或 history metadata（Level 3）
```

### 召回路径

1. 用户说"继续刚才那个 bug"
2. Agent 从 metadata 找到任务入口
3. 打开 mmds/*.mmd，恢复任务地图
4. 如需要，通过 node_id 查 JSONL
5. 如还需要，读 refs/*.md 原文

### MMD 节点示例

```json
{
  "timestamp": "2026-04-16T22:19:53.895+08:00",
  "node_id": "003-N4",
  "tool_call": "exec({...})",
  "summary": "列出 timeseries 目录，发现 core.py/sampled.py/binned.py，core.py 含 required column 检查逻辑",
  "result_ref": "refs/2026-04-16T22-19-53.md",
  "tool_call_id": "toolu_bdrk_01HHx...",
  "score": 5,
  "offloaded": true
}
```

## 五、实验关键发现

### MMD 作用验证（消融实验）

| 方案 | SWEbench 成绩变化 | Token 节省 |
|------|------------------|-----------|
| 无插件 | 基线 | 基线 |
| 仅上下文卸载 | +5% | ~15% |
| 完整方案（+MMD） | +9.9% | 31-33% |

上下文卸载解决"内容太长"问题；MMD 进一步解决"结构容易丢"问题。

### 核心结论

**压缩不是让 Agent 少知道，而是让 Agent 少背负。信息可以离开上下文窗口，但不能离开 Agent 的可达范围。**

## 六、产品落地

- 短期记忆：解决任务中的上下文膨胀问题，适合办公提效、创作、研究、编程
- 长期个性化记忆：沉淀用户偏好、习惯、长期目标，按需注入

已在 Qclaw、Lighthouse、ClawPro 上线。
