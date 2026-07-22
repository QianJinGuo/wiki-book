---
title: "PI Agent: 17维评分体系揭秘"
source: ""
tags: [pi-agent, agent-engineering, evaluation]
created: 2026-05-20
sha256: 01381fad007c60d737620d0b032c4b96790c37028530bf07d6f4d45775030981
---
---
# 从 pi-main 源码拆解：顶尖 AI Agent 的工程设计（17 维度全解）
> 来源：[微信文章](https://mp.weixin.qq.com/s/h8HZyoyOOX2Aodfngq25FA) | 作者：未来程式 | 发布：2026-05-10
pi（一个开源的 AI 编程引擎）用不到 5000 行核心代码回答了这些问题。它的代码不是最漂亮的，但它的工程决策异常扎实——17 个维度的设计选择，每一条都踩过坑。
今天我把这 17 个维度全部拆开讲，给你一张可直接照抄的 Agent 设计清单。
## 一、任务规划：单体还是多体，这是个伪命题
很多人一上来就纠结要不要做 Planner，要不要做 Router，要不要上多 Agent 架构。pi 告诉你：**不要。**
pi 默认是单体 ReAct Agent，没有内置的 Planner/Router 节点。它的任务规划能力是通过 **Extension API** 开放的——如果你想让 Agent 调用子 Agent，你把"调用子 Agent"这件事封装成一个普通工具，插进工具列表，剩下的交给 LLM 自己决定什么时候用。
> 抄什么：前期做单体，预留"能注册新工具的扩展口"。等单 Agent 实在 hold 不住了，再上多 Agent。
## 二、核心主循环：双层 while 里的工程美学
```javascript
while (true) { // 外层：等待 followUp，维持会话
  let hasMoreToolCalls = true;
  while (hasMoreToolCalls || pendingMessages.length > 0) { // 内层：ReAct 闭环
    if (pendingMessages.length > 0) {
      currentContext.messages.push(...pendingMessages); // 注入 Steering 消息
      pendingMessages = [];
    }
    const message = await streamAssistantResponse(...);
    const toolCalls = message.content.filter(c => c.type === "toolCall");
    const executedToolBatch = await executeToolCalls(...);
    hasMoreToolCalls = !executedToolBatch.terminate; // 工具可主动喊停
  }
  const followUpMessages = await config.getFollowUpMessages?.() ?? [];
  if (followUpMessages.length === 0) break; // 无后续则退出会话
  pendingMessages = followUpMessages;
}
```
双层 while 不是炫技。**外层解决的是"会话什么时候真正结束"，内层解决的是"这一轮 ReAct 什么时候做完"**，两个退出条件分离，逻辑就干净了。
最容易被忽视的细节：`terminate` 信号。工具执行完后可以返回 `terminate=true`，告诉引擎"别再调模型了，这一轮到此为止"。这比让 LLM 自己输出"done"要可靠 100 倍。
> 抄什么：双层分离 + terminate 信号，这是做 HITL 的最小化模板。
## 三、反思与自我纠错：别急着写 Critic Agent
pi 的纠错机制藏在统一返回结构里：
```javascript
try {
  const result = await prepared.tool.execute(...);
  return { result, isError: false };
} catch (error) {
  return {
    result: { content: [{ type: "text", text: String(error) }], details: {} },
    isError: true, // LLM 看到这个标志，会自动触发重试推理
  };
}
```
工具的"成功"和"失败"都是数据。LLM 在 ReAct 循环里看到 `isError: true` 会自动触发反思："刚才哪一步出问题了？我怎么修？"——这是 LLM 自己的推理能力在驱动纠错，不需要额外的 Critic。
> 抄什么：统一 `{ content, isError }` 返回格式，这是最低成本的自修复方案。
## 四、工具系统：三件事决定 Agent 体验上限
**第一件事：Schema 用 TypeBox，不是 if-else。**
```javascript
const bashSchema = Type.Object({
  command: Type.String({ description: "Bash command to execute" }),
  timeout: Type.Optional(Type.Number()),
});
```
声明式 Schema 的好处是：参数校验是自动化的，工具文档是自描述的。
**第二件事：大输出必须截断，附上 Temp 文件路径。**
```javascript
text += `\n\n[Showing lines ${start}-${end} of ${total}. Full output: ${fullOutputPath}]`;
```
**第三件事：并行还是串行，让工具自己声明。**
```javascript
const hasSequentialTool = toolCalls.some(tc => tool.executionMode === "sequential");
if (hasSequentialTool) return executeToolCallsSequential(...);
return executeToolCallsParallel(...);
```
每个工具声明自己的 `executionMode`，引擎自动判断。
> 抄什么：TypeBox Schema + 大输出截断 + executionMode 字段，这三样是工具系统的最小必要集合。
## 五、输出格式：Provider 原生 Function Calling 的局限
pi 在输出解析上完全信任 Provider 原生 Function Calling，没有额外的 Schema 校验层。
主流模型（Claude GPT-4）足够稳定，但如果接入国产小模型，Function Calling 格式经常飘，参数填错位是常态。pi 的参数校验失败后走 `isError` 路径，LLM 会重试。
> 抄什么：如果只用大厂模型，原生 Function Calling 够用；如果要兼容小模型，在 `validateToolArguments` 前面加一层宽松解析。
## 六、记忆与上下文压缩：被严重低估的设计
pi 的记忆系统分两层：**JSONL 事件流 + 结构化压缩摘要。**
事件流是 append-only 的 JSONL，每行一个事件（message / model_change / compaction 等）。崩溃不丢数据，天然支持回放和分支。
压缩摘要触发条件：
```javascript
return contextTokens > contextWindow - settings.reserveTokens; // 默认留 16384 Token
```
触发后强制结构化提取为：
```
## Goal / ## Constraints
## Progress (Done + InProgress + Blocked)
## Key Decisions / ## Next Steps / ## Critical Context
```
更精妙的是迭代更新逻辑：有旧摘要用 UPDATE prompt，保留历史信息；没旧摘要用全量 SUMMARIZATION prompt。实测迭代更新比全量重写节省 **50%+ Token**。
> 抄什么：JSONL 事件流 + 结构化摘要格式 + 迭代更新逻辑，这是记忆系统的最佳实践。
## 七、状态管理与会话分支：JSONL 的工程魅力
pi 的会话以 JSONL 格式持久化，每行是一个独立事件。分支时会产生 `BranchSummaryMessage`：
```typescript
export interface BranchSummaryMessage {
  role: "branchSummary";
  summary: string;
  fromId: string;    // 记录分支来自哪个历史节点
  timestamp: number;
}
```
这是做"实验性探索"的工程基础——让 Agent 尝试一个方向，失败了可以回到主分支重来，而不用重来整个会话。
> 抄什么：会话存 JSONL，不要存 JSON 数组。append-only 的设计是工程可靠性的基石。
## 八、人机协同：异步方向盘的正确姿势
消息异步注入，不阻塞主循环：
```javascript
async steer(text: string): Promise<void> {
  this.agent.steer({ role: "user", content: [{ type: "text", text }] });
}
```
消息被塞进 `pendingMessages`，主循环在当前 tool call 执行完毕后自动 pickup，继续运行。
停止也是异步的，靠 AbortController，且从顶层 Session 一路透传到最底层工具（不是层层封装，是直接传递引用）。
> 抄什么：steer 是异步的，AbortController 必须透传到底层。这两件事做对了，HITL 就对了一半。
## 九、提示词结构：时空锚点是零成本的防幻觉
pi 的 system prompt 分区：
```
Available tools: ${toolsList}     // 仅列出已启用的工具
Guidelines: ${guidelines}         // 规则随工具动态生成
Current date: ${date}            // 时空锚点，防幻觉
Current working directory: ${cwd}
```
"Current date"和"Current working directory"是最容易忽视的时空锚点——LLM 在没有时间锚点的情况下容易产生时间幻觉。
> 抄什么：时空锚点必须加，Guidelines 必须按工具动态生成。
## 十、提示词动态组装：Skill 命令是提效利器
pi 支持 Skill 机制：用户在输入框里敲 `/skill:debug`，系统自动展开为对应的 Prompt 模板：
```javascript
let expandedText = this._expandSkillCommand(text); // /skill:debug → 读取文件内容
expandedText = expandPromptTemplate(expandedText, [...this.promptTemplates]);
```
> 抄什么：Skill/模板系统是降低用户输入成本、提升 Prompt 标准化的关键机制，值得投入。
## 十一、多模态支持：优雅降级比报错更重要
```javascript
if (!model || model.input.includes("image")) {
  const resized = await resizeImage({ type: "image", data: base64, mimeType });
  return [{ type: "image", data: resized.data, mimeType: resized.mimeType }];
}
return "[Current model does not support images. The image will be omitted.]";
```
两个关键：**自动 resize**（缩放到 2000x2000 以内）+ **优雅降级**（不支持图片的模型返回提示文本，而不是报错）。
> 抄什么：图片必须检查 `model.input.includes("image")`，不支持就降级，不报错。
## 十二、模型路由：中途热切换的秘密
pi 支持在对话中途热切换模型，不需要重启会话：
```javascript
this.sessionManager.appendModelChange(model.provider, model.id); // 写入事件流
this.settingsManager.setDefaultModelAndProvider(model.provider, model.id);
```
模型切换事件会写入 JSONL，确保重放时模型上下文一致。
自动重试逻辑覆盖： `/overloaded|rate.?limit|429|500|502|503|504|timeout/i`
> 抄什么：模型切换写入事件流，确保重放一致性；错误重试正则要覆盖全。
## 十三、安全与权限：pi 最大的设计缺口
pi 在安全上是有明显短板的。有进程树清理、有超时保护；但**没有**：
- 文件路径 Jail（Agent 理论上可以操作任意目录）
- 命令白名单/黑名单（`rm -rf /` 这种危险命令没有拦截）
- 敏感信息脱敏（API Key 等不会自动过滤）
> 抄什么：如果你的 Agent 要在生产环境跑，bash 工具层必须加 `allowedPaths` 校验，禁止操作敏感目录。引擎不做假设，基础设施来兜底。
## 十四、可观测性：JSONL 是基础，结构化才是目标
pi 的可观测性停留在 JSONL 回放阶段，没有 OTEL，没有结构化成本追踪。Token 有计算 (`calculateContextTokens`)，但没有格式化输出到日志或 UI。
> 抄什么：即使不上 OTEL，也要每次 LLM 响应后计算并展示费用，格式化为 `{model, inputTokens, outputTokens, cost}`，写入日志文件。
## 十五、扩展性：两个钩子定义了整个插件系统
pi 的 Extension API 核心只有两个生命周期钩子：
```javascript
beforeToolCall: async ({ toolCall, args }) => {
  return await runner.emitToolCall({ toolName: toolCall.name, input: args });
},
afterToolCall: async ({ toolCall, result, isError }) => {
  return await runner.emitToolResult({ toolName: toolCall.name, content: result.content, isError });
}
```
SubAgent 模式（调用子 Agent）就是通过这两个钩子封装成普通工具来实现的，不是核心引擎内置，是插件自己扩展的。这验证了"轻核心、重扩展"的设计哲学。
> 抄什么：`beforeToolCall + afterToolCall` 是插件系统的最小必要集合。
## 十六、评估体系：pi 最致命的短板
整个 pi 代码库里，找不到自动化 Evals，没有 Golden Set，没有回归测试框架。
10-20 个黄金用例（一个任务 + 期望的工具调用序列）是用最低成本防止退化的方案。
> 抄什么：从第一天起建立 Golden Set，哪怕只有 10 条。这件事越早做越低成本，越晚做越要命。
## 十七、成本控制：压缩是核心，其他靠估算
```typescript
export const DEFAULT_COMPACTION_SETTINGS = {
  enabled: true,
  reserveTokens: 16384,   // 模型上下文窗口保留 16K Token 空间
  keepRecentTokens: 20000, // 压缩后保留最近 20K Token 历史
};
```
> 抄什么：参考 pi 的压缩策略作为成本控制核心；补充每次 LLM 响应后计算费用并展示。
## 总结：pi 的设计哲学
pi 的设计哲学很简单：**轻核心、重扩展**。核心引擎只做最小必要的事情，复杂能力通过 Extension API 交给插件。
把核心做轻，稳定性才有保障；把扩展口留足，未来演进不需要重构。
---
## 相关工程实践
- [[agent-harness-engineering|Agent Harness 工程]] — 双层 while 循环、terminate 信号设计
- [[multi-agent-collaboration|Multi-Agent 协作模式]] — SubAgent 通过 Extension API 封装的工程实现
- [[context-window-management|上下文窗口管理]] — JSONL 事件流 + 结构化摘要的压缩策略
- [[human-in-the-loop|Human-in-the-Loop]] — 异步 steer + AbortController 透传
- [[golden-set-evals|Golden Set Evals]] — 评估体系建设