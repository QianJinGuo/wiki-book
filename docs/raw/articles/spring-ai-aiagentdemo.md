---
title: AI实践｜基于 Spring AI 从0到1构建 AI Agent
source_url: https://mp.weixin.qq.com/s/SWVnXUpnf1eig_jBOpNsvw
publish_date: 2026-04-25
tags: [wechat, article, openai, agent, harness, rag, llm]
review_value: 7
review_confidence: 7
review_recommendation: neutral
ingested: 2026-05-16
sha256: 1db2ab41a0896ac851e86ac4a668d0ff9b4e4297f9db09e9b4c02d95e818960a
---

请对以下文本进行摘要总结，提取核心要点：
{{input}}
```
SkillManager 在启动时扫描 classpath:skill/*.md，解析元数据后由 SkillTool 将每个技能转换为 ToolCallback 注册到 Agent。
4.2 Command：用户主动调用的快捷指令
Command 文件是纯 Prompt 模板，文件名即为命令名。用户通过 REST API（POST /api/command/execute）主动指定命令名来执行。
4.3 核心区别对比
| 维度 | Command | Skill |
|---|---|---|
| 设计理念 | 用户快捷指令 | LLM 可调用的工具 |
| 文件格式 | 纯 Prompt 模板 | Front Matter（name + description）+ Prompt |
| 是否注册为工具 | ❌ 不注册 | ✅ 注册为 ToolCallback |
| 调用触发方 | 用户主动指定命令名 | LLM 根据 description 自主决策 |
一句话总结：Command 是"用户告诉 Agent 做什么"，Skill 是"Agent 自己判断该做什么"。
五、SubAgent：独立记忆的子代理
有些任务需要独立的上下文。SubAgent 的核心是记忆隔离：每个 SubAgent 拥有独立的 ChatMemory 实例，与主 Agent 的记忆完全隔离。
```java
public SubAgent(String id, String name, String systemPrompt, ChatClient chatClient) {
    this.memory = ChatMemory.forSubAgent();  // 独立记忆！
    this.memory.setSystemPrompt(systemPrompt);
}
```
SubAgent 共享主 Agent 的 ChatClient（即共享同一个大模型连接），但对话历史完全独立。
SubAgent 的能力通过 3 个工具暴露给主 Agent：
| 工具 | 参数 | 说明 |
|---|---|---|
| create_sub_agent | name、system_prompt、task | 创建 SubAgent 并执行首个任务 |
| chat_with_sub_agent | agent_id、message | 与已有 SubAgent 继续对话 |
| destroy_sub_agent | agent_id | 销毁 SubAgent，释放资源 |
六、MCP：连接一切外部服务
MCP（Model Context Protocol）是 Anthropic 提出的开放协议，让 AI 应用能够标准化地连接外部工具和数据源。本项目同时实现了 MCP Server（对外暴露能力）和 MCP Client（连接外部服务）。
6.1 MCP Server：对外暴露知识库检索能力
通过 SimpleMcpServer 对外提供知识库检索工具 knowledge_query，支持 keyword、category、maxResults 参数。内部调用 RagService 执行检索。
6.2 MCP Client：动态连接外部 MCP 服务
```java
public ToolCallback[] connect(String serverUrl) {
    McpSyncClient mcpClient;
    McpSchema.InitializeResult initResult;
    // 优先尝试 Streamable HTTP，失败后回退到 SSE
    try {
        mcpClient = connectWithStreamableHttp(serverUrl);
        initResult = mcpClient.initialize();
    } catch (Exception streamableException) {
        mcpClient = connectWithSse(serverUrl);
        initResult = mcpClient.initialize();
    }
    // 自动发现远程工具
    SyncMcpToolCallbackProvider provider = SyncMcpToolCallbackProvider.builder()
            .mcpClients(mcpClient).build();
    ToolCallback[] toolCallbacks = provider.getToolCallbacks();
    store.add(serverUrl);
    return toolCallbacks;
}
```
关键特性：
- 传输协议自动适配：优先 Streamable HTTP（2025-03-26 规范），失败自动回退 SSE（2024-11-05 规范）
- 工具自动发现：连接成功后自动获取远程工具，转换为 ToolCallback 注册到 Agent
- 持久化与自动恢复：URL 持久化到 mcp-servers.json，应用重启时自动重连
结尾感言
LLM就像一个问答黑箱，不管内部支持多丰富的能力，对使用者本质只有一个能力："你问，我答"。
使用者做的事情几乎是一致的：调整输入给LLM的内容，尽量让其输出预期内的内容。而对于"调整输入内容"这一块看似轻巧，实际上正是工程化发展的源泉，从Prompt Engineering到Context Engineering到Harness Engineering本质解决的就是"有限的上下文窗口中该放什么内容"。
脑暴枚举目前上下文窗口可能放的内容有：系统提示词、工具定义、历史对话、参考文档等。目前AI Agent正高速发展，最终浪淘沙到尽头什么会是最终答案不由而知，但是其中工具定义可能会走到最后。至少目前而言Function Calling是Harness的大地基，实际上很多能力的实现都是基于Function Calling，比如Skill本质就是一种Tool，而RAG、SubAgent与外部MCP服务等能力在工程实践中也大量被做成一种Tool由LLM决策调用。
阿里云开发者