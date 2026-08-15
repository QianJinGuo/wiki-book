# TReNDS 自动化根因分析（Strands Agents + Bedrock）

## Ch11.248 TReNDS 自动化根因分析（Strands Agents + Bedrock）

> 📊 Level ⭐⭐ | 5.3KB | `entities/how-trends-automates-root-cause-analysis-with-amazon-bedrock.md`

# TReNDS 自动化根因分析（Strands Agents + Bedrock）

Georgia State University 的 TReNDS 中心（TReNDS Center，佐治亚理工/埃默里联合神经影像中心）在 AWS EKS 上运行研究应用，日志经 FluentBit 汇入 CloudWatch。工程师定位故障根因通常要打开日志、读堆栈、找源码文件、手动追踪执行路径——简单错误 15-30 分钟，跨服务复杂问题更久。该团队把这段"调查过程"本身交给 foundation model + 工具编排完成：模型不只是总结错误信息，而是拉取周边日志上下文、读取源码、产出结构化分析。

## 架构：事件驱动的 RCA Agent

```
EKS 应用 → FluentBit → CloudWatch Logs
                          │ 订阅过滤（ERROR/Exception/FATAL/CRITICAL 模式）
                          ▼
                    Lambda（Strands Agent，Bedrock FM）
                          │ 工具调用：fetch_source_code / fetch_log_context
                          ▼
                    SNS → 团队通知
```

CloudWatch 订阅过滤器监控错误级日志模式，命中即触发 Lambda。Lambda 运行由 [Strands Agents](../ch04/788-strands-agents.html) SDK + [Amazon Bedrock](../ch04/658-amazon-bedrock-agentcore.html) 驱动的 agent：FM 做实际推理，SDK 负责工具调用编排——定义可用工具，模型自己决定何时、如何调用。给定堆栈追踪，agent 可能抓取相关源码文件、发现需要更多上下文、搜索相关错误处理逻辑、产出结构化分析，全程无需硬编码调查路径。

## 关键工具设计：docstring 驱动模型选择

核心工具是源码检索——堆栈追踪引用文件路径和行号，没有实际实现 agent 只能做日志模式匹配；能读源码才能追踪执行路径、定位具体失败代码。用 Strands Agents SDK 的 `@tool` 装饰器定义自定义工具：

```python
@tool
def fetch_source_code(file_path: str, repo: str) -> str:
    """Fetch a source file from a GitHub repository.

    Args:
        file_path: Path to the file in the repository
        repo: Repository in 'owner/repo' format
    """
    response = requests.get(
        f"https://api.github.com/repos/{repo}/contents/{file_path}",
        headers={"Authorization": f"token {github_token}"}
    )
    ...
```

**docstring 和类型提示决定工具可用性**——Strands 用它们告诉模型工具做什么、参数是什么，模型据此决定何时调用。这是 agent 工具设计的通用模式：工具语义（docstring + type hints）是模型选择工具的信号源。

## 上下文窗口化检索

订阅过滤器投递的匹配日志行通常不够用。第二个 `@tool` 按 `logStream`（标识出错容器的 ID）拉取同流周边日志，给 agent 完整堆栈和请求上下文，避免其他并发请求的噪音：

```python
@tool
def fetch_log_context(log_group: str, log_stream: str, timestamp: int,
                      window_seconds: int = 30) -> str:
    """Fetch log lines from the same log stream surrounding an error."""
    response = logs_client.filter_log_events(
        logGroupName=log_group,
        logStreamNames=[log_stream],
        startTime=timestamp - (window_seconds * 1000),
        ...
    )
```

时间窗口（±30s）限定检索范围——错误前后时间窗内的同流日志，兼顾上下文完整性与噪音控制。Lambda 事件解码标准模式（base64 + gzip 解压）后提取 log group 名与匹配事件传给 agent。

## 数据驻留与合规

TReNDS 处理健康相关研究数据（可能涉及 HIPAA），数据驻留是重要约束。Bedrock 在 AWS 账户内处理请求，日志与源码留在同一环境，AI 分析不发送数据到外部端点。架构上此模式对任何发日志到 CloudWatch 的工作负载适用（ECS/Lambda/EC2/on-premises 均可），不限于 EKS + FluentBit。

## 与相关实体的关系

- [快手 RCA Agent](../ch03/037-agent.html)：同样面向根因分析自动化，快手版更侧重 LLM 推理链与人工确认闭环，本文侧重事件触发（CloudWatch 订阅过滤）+ 工具检索设计
- [Agentic Incident Triage](ch11/239-amazon-quick.html)：事件分类/分诊场景，本文是深度调查（源码级）场景
- [Agent 可观测性](../ch03/037-agent.html)：本文是"用 agent 做应用可观测性"的反向用例
- [AgentCore Harness](../ch04/586-amazon-bedrock-agentcore-harness-ga-api-agent.html)：同 AWS Agent 生态

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/how-trends-automates-root-cause-analysis-with-amazon-bedrock.md)

---

