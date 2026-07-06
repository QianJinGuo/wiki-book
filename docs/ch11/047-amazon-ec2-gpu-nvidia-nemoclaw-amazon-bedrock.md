# 在 Amazon EC2 GPU 实例上部署 NVIDIA NemoClaw — 以 Amazon Bedrock 作为推理后端的生产级参考架构

## Ch11.047 在 Amazon EC2 GPU 实例上部署 NVIDIA NemoClaw — 以 Amazon Bedrock 作为推理后端的生产级参考架构

> 📊 Level ⭐⭐ | 12.9KB | `entities/在-amazon-ec2-gpu-实例上部署-nvidia-nemoclaw-以-amazon-bedrock-作为推理.md`

## 核心要点

- NVIDIA NemoClaw 安全沙箱架构（Landlock/seccomp/网络命名空间三层隔离）
- AWS EC2 GPU 实例 + Amazon Bedrock 混合推理架构
- LLM Router Blueprint 实现请求级别智能路由
- 生产化加固与成本优化考量

## 相关实体
- [Eks Gpu Operator Custom Driver Cuda Workload](https://github.com/QianJinGuo/wiki/blob/main/entities/eks-gpu-operator-custom-driver-cuda-workload.md)
- [Using Amazon Bedrock Agentcore Openclaw Multi 2](https://github.com/QianJinGuo/wiki/blob/main/entities/using-amazon-bedrock-agentcore-openclaw-multi-2.md)
- [Mcp Serveramazon Bedrock Agentcorequick Suite](https://github.com/QianJinGuo/wiki/blob/main/entities/mcp-serveramazon-bedrock-agentcorequick-suite.md)
- [Building Multi Tenant Agents With Amazon Bedrock Agentcore](https://github.com/QianJinGuo/wiki/blob/main/entities/building-multi-tenant-agents-with-amazon-bedrock-agentcore.md)
- [Introducing Os Level Actions In Amazon Bedrock Agentcore Browser](https://github.com/QianJinGuo/wiki/blob/main/entities/introducing-os-level-actions-in-amazon-bedrock-agentcore-browser.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/在-amazon-ec2-gpu-实例上部署-nvidia-nemoclaw-以-amazon-bedrock-作为推理.md)

- [Scale Robot Reinforcement Learning With Nvidia Isaac Lab On ](https://github.com/QianJinGuo/wiki/blob/main/entities/scale-robot-reinforcement-learning-with-nvidia-isaac-lab-on-.md)
- [在 Amazon Eks 上使用 Nvidia Gpu Operator 管理自定义 Gpu 驱动与 Cuda 工作负载](https://github.com/QianJinGuo/wiki/blob/main/entities/在-amazon-eks-上使用-nvidia-gpu-operator-管理自定义-gpu-驱动与-cuda-工作负载.md)
- [Nvidia Nemotron 3 Ultra Now Available On Amazon Sagemaker Ju](https://github.com/QianJinGuo/wiki/blob/main/entities/nvidia-nemotron-3-ultra-now-available-on-amazon-sagemaker-ju.md)
- [miro-amazon-bedrock-bug-routing](https://github.com/QianJinGuo/wiki/blob/main/entities/miro-amazon-bedrock-bug-routing.md)

## 深度分析

### 1. 架构设计的本质：决策与代理的分离

本文最核心的架构洞察不是"混合推理"，而是**决策与代理的清晰分层**。NVIDIA LLM Router v2 做了一个很有意思的设计选择：只做分类（返回模型名字符串），不实际转发请求。而 dispatch 层负责把 Router 的推荐翻译成实际 backend。这种"重决策 + 轻代理"的分层让 Router 算法可以很重（意图分类、CLIP embedding、神经网络训练），同时保持接入层简单可演进。

这个设计对工程实践的启示是：当你在设计一个 AI 代理或路由系统时，应该把"判断做什么"和"实际执行"拆成两个独立模块。前者更容易迭代、实验、审计；后者更稳定，只需要适配前者的输出。

### 2. NemoClaw 的安全模型：纵深防御而非单点信任

NemoClaw 的沙箱本身已经提供了 Landlock + seccomp + 网络命名空间的三层隔离，但本文揭示了一个更完整的四层 AWS 原生防御体系：

| 层级 | 机制 | 控制粒度 | 本质 |
|------|------|----------|------|
| L1 | VPC Security Group | IP/端口 | 谁能连进来 |
| L2 | IAM Role + boto3 SigV4 | API 操作 | agent 能调什么云服务 |
| L3 | NemoClaw network policy | host+path+method | sandbox 能出去找谁 |
| L4 | Dispatch 路由策略 | 请求特征 | 哪类请求走哪个 backend |

值得注意的是 L3 与 L4 的互补关系：VPC SG 允许 `0.0.0.0/0:443` 出站，但 NemoClaw policy 可以阻止访问 `https://exfil.attacker.com`——这是 L4/L7 互补防御的典型例子。L4 dispatch 层的特殊之处在于它**不阻止请求，而是改变目的地**，这使得数据治理（某些请求必须留在 VPC 内）可以在不重构 agent 代码的前提下实现。

### 3. GPU 选型的工程权衡

本文给出了清晰的 GPU 选型矩阵，但背后的决策逻辑值得深入理解。g6e.xlarge (L40S 48GB) 能同时跑 vLLM (16GB) + Qwen Router (6GB) + 并发缓冲 (25GB)，这是本文混合架构成立的硬件基础。如果选 g5.xlarge/g6.xlarge (24GB)，则显存不足以同时运行两个 GPU 进程，只能跑一个，这意味着要么放弃本地 vLLM，要么把 Router 部署到另一台机器——增加了架构复杂度。

对于实际部署，关键问题是：**你的流量分布是否值得这套混合架构？** 本文给出了明确的判断标准：高 QPS 简单请求占比大（例如 FAQ、模板回复、内部知识查询）时，本地 8B 模型边际成本接近 GPU 电费水平，混合架构有价值；如果请求复杂度普遍较高，或者 QPS 不足以充分利用 GPU，直接用 Bedrock 更简单且效果一样。

### 4. 成本模型的关键变量

混合架构的成本优化潜力取决于**分流比例**。以 100K 次/月对话为例（每次 200 输入 + 80 输出 token）：

- 全 Bedrock Sonnet 4.5：约 $84/月
- 全本地 vLLM：GPU 额外成本 $0（因为 GPU 已经在跑）
- 混合 70/30（70% 简单请求路由到本地）：约 $25 Bedrock 费用 + $0 本地费用，节省约 70%

但这个估算有一个隐含前提：**本地 vLLM 的 GPU 时间是被其他进程（Router Qwen）已经消耗之后还有余量**。如果 vLLM 单独占用 GPU 跑满，额外成本确实为 $0；但如果 vLLM 本身就需要独占 GPU（没有其他进程在用），那问题变成"这 GPU 用来跑 vLLM 还是干别的"——这是一个机会成本的问题。

另一个值得关注的成本维度是**开发环境**：用 EC2 Stop/Start 而非持续运行，非工作时间只付 EBS 存储费，可节省 65-75%。这是云计算经济学的基本原则，但在此架构下尤为重要，因为整个软件栈（vLLM、Router、dispatch、sandbox）冷启动约 5-8 分钟即可恢复，属于可接受的范围。

### 5. dispatch 层的"可演进性"设计

dispatch 层用 ~80 行 Python 实现了一个薄薄的翻译层，它的存在有两个深层价值：

**第一，保持 Router 与 NVIDIA 官方示例一致**。如果直接改 Router 的 `MAP_INTENT_TO_PIPELINE` 配置让 Router 直接推荐 Bedrock 模型 ID，虽然 dispatch 层会更薄，但 Router 的 Gradio demo 和 Jupyter notebook 也会跟着用 Bedrock 模型，与 NVIDIA 官方示例 ID 不一致——这会影响团队对 Router 的评估和后续升级。

**第二，dispatch 层的 header 注入提供了可观测性**。每次请求的 `X-NV-Router-Suggested` / `X-Dispatch-Backend` / `X-Dispatch-Model` 三个 header 让路由决策对外可见，这是成本归因和审计的基础设施。生产环境应该把这些日志接到 CloudWatch Logs Insights 并设置计数指标，这是 L4 可观测性的起点。

## 实践启示

### 1. 评估混合架构是否适合你的场景

在采用这套架构之前，先问自己三个问题：

**a) 我的简单请求占比有多大？** 如果 70% 以上的请求是 FAQ、模板化回复等简单任务，混合架构才有显著成本价值。如果大多数请求都需要复杂推理，Router 的分类开销和 dispatch 的代理开销可能得不偿失。

**b) 我是否有数据治理需求？** 如果部分请求必须留在 VPC 内不能出公网，dispatch 层的规则覆盖机制提供了无需重构 agent 代码的解决路径——这是一个独特价值。

**c) 我的团队能投入多少运维精力？** 这套架构涉及 EC2 GPU 管理、vLLM 服务、NVIDIA Router 服务、NemoClaw sandbox、dispatch 代理层、Bedrock 调用至少 6 个组件。如果团队运维投入有限，直接用 Bedrock 是更简单有效的选择。

### 2. 上生产的四项必做清单

**a) 用 systemd 管理 dispatch 进程**。本文用 `nohup + 后台运行` 演示，但生产环境需要 systemd unit 文件实现自动重启、日志归集、依赖管理。

**b) 收紧 IAM 权限到具体 modelArn**。不要用 `AmazonBedrockFullAccess`，应该用 `bedrock:InvokeModel` + 具体 modelArn 列表，把权限限定在实际使用的模型范围内。

**c) 接入 CloudWatch Metrics 和 Logs**。dispatch 层的 header 注入是 L4 可观测性的基础，应该把 `Decision=LOCAL / Decision=BEDROCK` 计数接入 CloudWatch Metrics，把路由日志接入 CloudWatch Logs，为成本归因和异常检测提供数据。

**d) 设置 GPU 监控告警**。DCGM + CloudWatch Agent 已经部署，应该为 GPU 温度 > 85°C、status check failed、显存占用 > 90% 设置 CloudWatch Alarm。

### 3. 从意图分类到神经网络路由的升级路径

本文用 Intent-based routing（Qwen3-1.7B 做语义分类）起步，这是正确的工程选择——零训练、决策可解释、调试方便。但 NVIDIA Router 支持的 Auto-routing（CLIP embedding + 神经网络）提供了更强大的能力：按"成本/延迟/质量"联合优化，而不是固定意图分类。

升级路径应该是：**先用 Intent-based 模式跑通整个链路、积累流量分布数据，然后用自家流量数据训练 NN auto-router**。这个升级不需要改 dispatch 层，只需要改 Router 的配置——这是分层架构的优势：决策模块可以独立演进，代理模块保持稳定。

### 4. dispatch 层规则覆盖的战术价值

dispatch 层有一个被低估的能力：**规则覆盖**。当检测到特定 prompt 模式（包含 PII、敏感字段）时，可以强制路由到本地 backend，覆盖默认的 Router 决策。这在数据治理场景下特别有价值——例如内部 HR agent 处理员工信息时，Router 可能推荐 Bedrock，但规则覆盖强制走本地不出网。

实现方式是在 dispatch 层的 `ROUTING_MAP` 之前加一个规则引擎：

```python
def dispatch(messages, max_tokens=200):

    # 规则覆盖：检测 PII 或敏感模式
    content = str(messages)
    if contains_pii(content) or is_sensitive_domain(content):
        return call_local(messages, max_tokens), "rule-override", "LOCAL", local_model

    # 否则走 Router 决策
    suggestion = _post_json(ROUTER_URL, {"messages": messages, "stream": False})[...]
    ...
```

这个能力把"安全"从基础设施层（L1-L3）延伸到了应用层（L4），且不需要修改 agent 代码。

### 5. 多 backend 扩展的维度

本文演示了 3 个 backend（本地 vLLM、Bedrock Nemotron、Bedrock Claude），但 dispatch 层的 `ROUTING_MAP` 设计支持任意扩展。扩展时应该考虑的维度：

| 新增 backend 类型 | 适用场景 | 添加复杂度 |
|-----------------|----------|----------|
| Amazon Nova Lite/Pro | 高性价比简单任务 | 低：Bedrock 同质接口 |
| Moonshot Kimi | 中文长上下文 | 低：Bedrock 同质接口 |
| DeepSeek R1 | 复杂推理 | 中：需要评估跨区域延迟 |
| 自托管 NIM 容器 | 特定模型完全自控 | 高：需要管理 GPU 容量 |
| OpenAI 兼容 endpoint | 快速接入第三方模型 | 中：需要管理 API key |

扩展的关键是保持 dispatch 层的**薄转发**特性——每加一个 backend 只需要在 `ROUTING_MAP` 加一条映射，不要在 dispatch 层里塞业务逻辑。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/在-amazon-ec2-gpu-实例上部署-nvidia-nemoclaw-以-amazon-bedrock-作为推理.md)

---

