# DECO — 腾讯数据工程 Agent Hook 护栏层实践

## Ch04.612 DECO — 腾讯数据工程 Agent Hook 护栏层实践

> 📊 Level ⭐⭐ | 3.5KB | `entities/deco-agent-hook-governance-tencent-2026.md`

> 腾讯 DECO（Data Engineering Agent 引擎）的护栏层实践，用 Agent 框架的 Hook 切面在代码层确定性兜底三类问题：长文本偷懒、越权操作、上下文失忆。

## 三类治理问题

腾讯 DECO 团队识别出 prompt 无法管控的三类 LLM 行为：

1. **LLM 偷懒** — 长 SQL/ETL 脚本被截断、占位略写、复印式重写到 token 耗尽
2. **越权操作** — 模型无法区分"查询"和"发布"的可逆性差异
3. **上下文失忆** — 模型跳过"看起来不必要"的检查步骤

## Hook 链护栏体系

基于 Agent 框架的 Callback 切面（beforeTool/afterTool/beforeModel/afterModel），DECO 挂了十余个 Hook。

### 长文本完整性护栏（读写两侧 Offload）

核心方案：LLM 永远不直接接触脚本全文。两端都用 Hook 拦截 + 沙箱文件做"中转站"。

- **拉取侧 Offload（afterTool）**：Hook 拦截含 scriptContent 的响应，全文写入沙箱只读快照，替换为引用句柄
- **写回侧 Onload（beforeTool）**：Hook 从文件读回全文覆盖入参

效果：修改任务工具调用输出 token **直降约 90%**，复印自截断从近 100% 物理消除。

### 危险操作 HITL（beforeTool Guard）

配置驱动的**危险工具守卫**：每个危险操作配置 required-state key 和确认对话框，没拿到用户明确授权，工具在框架层物理走不通。

确认框支持多选项 + 带输入控件（审批人、回刷日期），变更预览在确认前展示。

### 上下文联动闭环（Hook → state → Attachment）

范式：**Hook 采集事实 → 写 state → Attachment 注入下一轮 prompt**。

- **RiskAnalysisHook**：Agent 改表后在 afterTool 触发下游风险分析，结果自动注入下轮
- **PythonImageHook**：Python 脚本产出的图表自动发现，生成预签名 URL 供前端渲染

## 行业定位

DECO 的护栏体系与主流框架对比：

| 能力 | 框架原生 | DECO 差异 |
|------|---------|----------|
| 读侧 offload | ADK ArtifactService, LangGraph offload | **写侧 onload** 自研（scriptFilePath 协议） |
| HITL | ADK ToolConfirmation, LangGraph HITL | 多选项+输入框+变更预览+配置驱动 |
| 上下文断裂 | ADK artifacts（被动 load） | Hook→state→Attachment **主动 push** |

## 关联条目

- [Harness Engineering 阿里 Java 实践](../ch05/052-harness-engineering.html) — 企业级 Harness 工程另一视角
- [腾讯混元 Hy3 Agent 产品](../ch01/119-hy3-preview.html) — 腾讯同系的 Agent 产品发展
- [腾讯 K8s + Ray AI Workload 调度](../ch11/272-k8s-ray-ai-workload.html) — 腾讯另一生产级 AI 系统实践

## 退出

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/deco-agent-hook-governance-tencent-2026-07-16.md)

---

