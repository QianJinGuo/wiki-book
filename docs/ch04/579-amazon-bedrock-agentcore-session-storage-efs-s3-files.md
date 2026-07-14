# Amazon Bedrock AgentCore 数据持久化文件系统：Session Storage、EFS、S3 Files

## Ch04.579 Amazon Bedrock AgentCore 数据持久化文件系统：Session Storage、EFS、S3 Files

> 📊 Level ⭐⭐ | 3.8KB | `entities/amazon-bedrock-agentcore-data-persistence-file-system-session-storage-efs-s3.md`

# Amazon Bedrock AgentCore 数据持久化文件系统：Session Storage、EFS、S3 Files

Amazon Bedrock AgentCore 提供了**三种持久化文件系统方案**，覆盖不同的 Agent 持久化需求：Managed Session Storage、Amazon EFS、Amazon S3 Files。这三种方案在私有性、共享范围、访问方式上有各有侧重——从按用户私有、到多方共享、再到文件与对象两端访问。会话结束也不会丢失数据。

## 三种方案对比

| 特性 | Managed Session Storage | Amazon EFS | Amazon S3 Files |
|------|------------------------|------------|-----------------|
| 访问范围 | 按用户私有 | 多方共享 | 文件与对象两端访问 |
| 数据持久性 | 会话保持 | 持久 | 持久 |
| 典型场景 | 用户会话数据 | 团队共享知识库 | 大规模文件存储 |
| 性能 | 低延迟 | 高吞吐 | 高可用 |

Managed Session Storage 适合需要按用户隔离的对话上下文和会话级缓存；Amazon EFS 适合需要跨多个 Agent 或用户共享的持久化知识库；Amazon S3 Files 适合大规模文件存储和需要同时通过对象存储接口访问的场景。

## 使用场景

AgentCore 的数据持久化文件系统在以下场景中尤为关键：

- **长周期 Agent 任务**：跨多轮对话维护 Agent 的内部状态和进度，不会因会话中断而丢失数据
- **多 Agent 协作**：多个子 Agent 通过共享 EFS 文件系统读写同一份中间数据
- **知识库持续积累**：Agent 在运行中产生的知识片段持久化到 Session Storage 或 S3，供后续轮次使用
- **审计与回放**：Agent 的完整执行历史持久化，支持事后审计和调试

这些场景与 [AgentCore 运行时深度分析](ch04/527-amazon-bedrock-agentcore.html) 中覆盖的 Agent 生命周期管理直接衔接。而 [AgentCore 记忆哲学](ch04/527-amazon-bedrock-agentcore.html) 则从更底层的记忆系统角度讨论了数据持久性的设计理念。

## 性能测试

文章包含了对三种方案的性能对比测试数据，从延迟、吞吐量、并发连接数等维度提供了基准参考。对于需要在高并发场景下选择合适持久化方案的工程团队具有实际指导意义。

## 与相关实体

- [AWS Bedrock AgentCore](../ch11/246-aws-bedrock-agentcore.html) — AgentCore 整体架构
- [突破上下文窗口壁垒](ch04/527-amazon-bedrock-agentcore.html) — AgentCore 上下文管理
- [结构化记忆与元数据过滤](ch04/620-data-agent.html) — AgentCore 记忆系统
- [Agent 记忆工程税](ch04/099-agent-memory.html) — 记忆系统的工程挑战

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/amazon-bedrock-agentcore-数据持久化文件系统session-storage-和-amazon-e.md)

---

