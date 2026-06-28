## Ch06.019 腾讯云Agent Memory：Mermaid无限画布×上下文卸载

> 📊 Level ⭐⭐ | 7.9KB | `entities/tencentdb-agent-memory-context-offloading.md`

# 腾讯云Agent Memory：Mermaid无限画布×上下文卸载

腾讯云开源的 Agent 记忆管理方案，核心思路是"短期记忆压缩 = 上下文卸载 + Mermaid 无限画布"。通过将工具结果卸载到外部文件系统，仅在上下文保留 Mermaid 结构图作为导航入口，实现 Token 节省最高 61.38%、成功率提升最高 51.52%。GitHub: https://github.com/Tencent/TencentDB-Agent-Memory

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/tencentdb-agent-memory-context-offloading.md)

## 摘要

Agent 在长任务中面临的核心矛盾：上下文窗口有限，但工具调用产生的结果无限膨胀。腾讯云的解法不是简单的"摘要替代原文"，而是建立四层记忆折叠架构：原文（refs/*.md）→ 工具调用级摘要（offload-*.jsonl）→ 任务节点级 Mermaid 图（mmds/*.mmd）→ 当前上下文注入。关键创新在于用 Mermaid Flowchart 作为"无限画布"——不是让上下文窗口无限变大，而是让上下文之外的信息仍然可见、可定位、可恢复。

## 核心要点

### 核心方案

- **上下文卸载**：完整工具结果写入外部文件系统，上下文只保留摘要和索引
- **Mermaid 无限画布**：将任务执行过程转化为可导航的结构化记忆图

### 实验结果

| 评测集 | 任务类型 | 成功率提升 | Token 节省 |
|--------|---------|-----------|-----------|
| SWEbench | 代码修复 | +9.93% | 最高 33.09% |
| Toolathlon | 复杂长任务 | 20%→35% (+75%) | 最高 26.18% |
| WideSearch | 网页搜索 | +51.52% | 最高 61.38% |
| AA-LCR | 长文总结 | +7.95% | 30.98% |

### 四层记忆折叠架构

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

### 压缩三原则

1. 符号必须是通用知识（所有主流 LLM 都能理解）
2. 符号生成不能过于复杂（生成端和理解端语义要一致）
3. 表达要足够自由（不被格式束缚）

## 深度分析

### 1. "压缩不是让 Agent 少知道，而是让 Agent 少背负"——记忆架构的认知科学基础

这句话是整个方案的理论核心。传统上下文管理的思路是"删除不重要信息"（摘要替代原文），但这假设了一个前提：我们能预先知道 Agent 后续推理需要什么信息。腾讯云的反直觉洞察是：**信息可以离开上下文窗口，但不能离开 Agent 的可达范围。** 这本质上是在构建一个"外部工作记忆"系统——类比人类的工作记忆：我们不会把所有细节都放在意识中，但我们可以通过线索（入口/索引）快速定位和恢复需要的细节。

### 2. Mermaid 作为 LLM 可读的结构化记忆载体

选择 Mermaid 而非自定义格式，体现了"符号必须是通用知识"的原则。Mermaid 的四个优势精准对应了 Agent 记忆的需求：文本化（LLM 可直接读写）、结构化（表达节点/边/状态/依赖）、可视化（人类可渲染检查）、可更新（Agent 可持续修改）。**Flowchart 比 StateDiagram 效果好约 15%** 的实验结果，进一步验证了设计直觉——Agent 的探索式执行（并行搜索/失败回退/交叉引用）更接近流程图而非状态机。

### 3. 四层折叠架构是"层次化注意力"的工程实现

鸟瞰（Overview）→ 聚焦（Focus）→ 下钻（Detail）的三层注意力机制，直接映射到四层架构的 L3→L2→L1→L0 召回路径。这不是简单的分层存储，而是**认知效率的工程优化**：Agent 大部分时候只需要鸟瞰级信息做决策，只在需要时才下钻到细节。这解释了为什么 WideSearch（网页搜索）场景 Token 节省最高——搜索任务天然需要先"鸟瞰"结果再"聚焦"关键页面。

### 4. 上下文卸载和无限画布的互补性

单独使用上下文卸载：Agent 只看到一堆文件和摘要，缺少结构——"档案柜有了，但找不到东西"。单独使用无限画布：信息压缩太狠，Agent 需要细节时找不到证据——"有地图但没有原始材料"。**两者的组合才是完整的**：Mermaid 图提供导航结构（"在哪里"），卸载文件提供原始证据（"是什么"）。消融实验证实：仅上下文卸载 +5% 成功率，完整方案 +9.9%——MMD 贡献了接近一半的提升。

### 5. 与 AgentCore Memory 的设计哲学差异

AWS AgentCore Memory 的核心抽象是"actor + namespace + strategy"——按身份和策略组织记忆，强调隔离和治理。腾讯云 Agent Memory 的核心抽象是"层次化折叠 + Mermaid 导航"——按认知需求组织记忆，强调效率和可达性。前者偏安全，后者偏性能。两者并不矛盾：AgentCore Memory 解决"谁的记忆、谁能访问"，TencentDB Agent Memory 解决"记忆太多怎么办"。在一个完整的 Agent 系统中，两者应该是互补而非替代关系。

## 实践启示

1. **不要只做摘要，要做结构化导航**：简单的"原文→摘要"压缩在长任务中不够用。Agent 需要的不是更短的文本，而是可导航的结构入口。Mermaid 图（或类似的结构化表示）应该成为 Agent 记忆管理的标配。
2. **保留原文，但不要放在上下文中**：卸载不是删除。所有原始工具结果都应保留在文件系统中，上下文只放索引和摘要。这样 Agent 可以在需要时通过 node_id 精确召回原始证据。
3. **选择压缩格式时，优先选 LLM 原生可读的**：Mermaid 之所以有效，是因为 LLM 可以直接读写，不需要额外的编解码层。自定义二进制格式虽然更紧凑，但引入了编解码误差和工具依赖。
4. **Flowchart 优于 StateDiagram 用于 Agent 执行追踪**：如果你的 Agent 是探索式执行（搜索/汇总/回退），用 Flowchart 记录轨迹；如果是严格生命周期驱动的（订单/审批），用 StateDiagram。选错了约损失 15% 性能。
5. **从 SWEbench 类场景开始验证记忆方案**：代码修复任务是最适合验证记忆管理的场景——它需要长上下文、多步骤推理、精确的原始证据召回。如果方案在 SWEbench 上有效，大概率在其他长任务场景也有效。

### 相关实体

- [Agentops Operationalize Agentic Ai At Scale With Amazon Bedr](ch04-215-build-an-ai-powered-equipment-repair-assistant-using-amazon.html)
- [存之有序治之有矩Agent 记忆系统的工程实践与演进](ch01-707-存之有序-治之有矩-agent-记忆系统的工程实践与演进.html)
- [你不知道的 Agent原理架构与工程实践 V2](ch04-455-你不知道的-agent-原理-架构与工程实践.html)
- [Karpathy 最新访谈从 Vibe Coding 到 Agentic Engineering](ch04-125-agent-pilotdeck-token-70.html)
- [Youre Building Agent Security In The Wrong Order](ch04-310-ai.html)

---
