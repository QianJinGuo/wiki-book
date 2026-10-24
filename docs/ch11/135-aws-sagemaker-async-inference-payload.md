# AWS SageMaker Async Inference 内联 Payload 支持

> 📊 Level ⭐⭐⭐⭐ | 11.4KB

## 核心变更

`InvokeEndpointAsync` API 新增 `Body` 参数，允许在 API 请求体内直接传入推理 payload，无需先上传到 S3。

**关键约束：**
- `Body` 和 `InputLocation` **互斥**，API 拒绝同时设置
- 最大内联大小：**128,000 bytes**（原始 payload）
- 超出限制或违反互斥规则 → **同步返回** `ValidationError`
- 输出行为不变：仍写入 S3 `OutputLocation`

## Before / After 对比

**Before（必须 S3 上传）：**
```python
import boto3, json, uuid

s3 = boto3.client("s3")
sagemaker_runtime = boto3.client("sagemaker-runtime")

payload = json.dumps({"inputs": "your prompt here"}).encode("utf-8")

# 1. Upload to S3
input_key = f"async-input/{uuid.uuid4()}.json"
s3.put_object(Bucket="my-async-bucket", Key=input_key, Body=payload)

# 2. Invoke with S3 URI
response = sagemaker_runtime.invoke_endpoint_async(
    EndpointName="my-async-endpoint",
    InputLocation=f"s3://my-async-bucket/{input_key}",
    ContentType="application/json",
)
```

**After（内联 Body）：**
```python
import boto3, json

sagemaker_runtime = boto3.client("sagemaker-runtime")
payload = json.dumps({"inputs": "your prompt here"}).encode("utf-8")

response = sagemaker_runtime.invoke_endpoint_async(
    EndpointName="my-async-endpoint",
    Body=payload,  # 直接内联
    ContentType="application/json",
)
```

## 适用场景

| 场景 | 推荐 |
|------|------|
| 小 payload（< 128KB）需要长处理时间 | **使用新 Body 参数** |
| 大 payload（图片、音频、多 MB 文档） | 继续用 S3 InputLocation |
| 突发/批处理工作负载 | 内联方式简化运维，移除 S3 依赖 |

## Before 模式额外要求

- S3 客户端 + 输入桶预置
- 调用方需 `s3:PutObject` IAM 权限
- UUID 或类似命名方案防 key 冲突
- 过期输入对象的清理策略

新 Body 模式**全部消除**这些运维负担。

## 可用区域

**31 个商业区域**（2026-06-17 发布时）：BOM, PDX, YUL, IAD, CMH, SFO, LHR, ICN, SYD, HKG, YYC, GRU, QRO, DUB, CDG, FRA, ZRH, ARN, ZAZ, NRT, KIX, SIN, CGK, MEL, KUL, BKK, HYD, TPE, CPT, MXP, TLV

## 端点兼容性

- 与现有 async 端点**完全兼容**，无需模型/容器变更
- 端点自动缩放到零、异步处理模型保持不变

## 错误处理

- **同步错误**（直接返回）：size 超出、Body+InputLocation 同时设置
- **异步错误**：通过 SNS notification 投递，与现有模式一致

## 深度分析

### 变更的实质：从调用链上摘掉一次写操作

这项变更常被描述成"少写几行代码"，但代码行数是副产品，真正的变化是每次调用少了一个网络写操作和一个 IAM 授权面。Before 模式下，客户端必须先在 S3 上 `put_object` 生成一次性输入对象，再把它的 URI 当作 `InputLocation` 传进去；这意味着调用方角色上必须挂着输入桶路径的 `s3:PutObject`，还需要预置输入桶、配套生命周期策略与跨账号访问模式，以及一套 UUID 式命名方案来避免 key 冲突和一份过期对象清理策略。 这些都是每条调用都常驻的运维负担，而不只是首次接入成本。内联 `Body` 把这四件事同时归零，并减去一次 S3 PUT 往返；对 fan-out 与批处理流量，这个延迟节约随调用量线性叠加。

### 真正的决策轴：可追溯性与可重放性

官方决策表把"需要把输入留在 S3 里做审计或重放"单列成一行并指向 `InputLocation`，这不是补充说明，而是这次权衡的落点。 内联 payload 不落 S3，一旦异步处理失败，输入端就没有一个持久对象可供重新提交——重放必须依赖客户端自己保留那份字节；而 `InputLocation` 工作负载在桶里天然留下一份可审计的输入工件。因此 128,000 字节的上限只是表层约束，深层约束是"这条调用是否需要一份可独立取用的输入凭证"。凡是涉及合规取证、结果复现、事后逐条归因的场景，省下的那次 PUT 换来的正是审计能力的损失；反过来，纯提示词转发、结构化数据转换这类输入即弃的调用，保留输入对象几乎没有价值。

### 错误语义分层：同步拒绝 vs 异步失败

大小超限与 `Body`/`InputLocation` 互斥这两个违规返回同步 `ValidationError`，而处理阶段的错误仍走 SNS 异步投递，与既有模式一致。 这个分层决定了客户端重试逻辑必须分两条路径：入队阶段的失败是"确定没进队列"，可立即修正参数后重试或直接上抛，不需要退避；异步阶段的失败是"已被接受但没算出来"，且发生在没有输入对象可回查的情况下，重试只能由仍持有原始 payload 的调用方重新发起。也就是说，把"请求要么入队要么不入队"显式化，是这次变更对可靠性设计最大的贡献——它把一部分原本混杂在异步回调里的失败前移到了同步 API 边界上。

### 边界工程：128,000 字节是硬悬崖

128,000 是原始字节的硬上限，且是同步校验，没有截断、分片或压缩协商的余地。 混合负载因此必须显式按大小分支：JSON 提示词与结构化数据落在内联一侧，图片、音频、多 MB 文档落在 `InputLocation` 一侧。 工程上有两个容易踩的点：一是 CJK 字符与 base64 编码会把"看起来很小"的文本放大到字节口径之上，判断必须用编码后的 `len(payload)` 而非字符数；二是需要确认这 128,000 字节是否同时计入 `InvokeEndpointAsync` 的请求体限制——若两套限制叠加，实际可用预算会更紧，接入前应做一次真实的边界探测而不是按文档数字外推。

### 成本与兼容性：输入路径消失，输出路径不变

成本端省掉的是每次内联调用的 S3 PUT 请求费与输入桶的存储/生命周期开销，验证场景下还省掉一整个输入桶；但输出依然写入 `OutputLocation`，所以输出桶、轮询或 SNS 通知、以及围绕输出对象的 S3 访问模式完全没有变化。 兼容性上，该特性面向已有 async 端点设计，无需改模型或容器，端点自动缩放到零的异步处理模型保持不变，现有 `InputLocation` 工作流不受影响，两种输入在被接受后走相同处理路径、模型收到的请求也相同——迁移面因此被限制在客户端一侧。 这与知识库里 [SQS+Lambda 异步管道](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-bedrock-serverless-async-inference-sqs-lambda.md) 的取向不同：那条架构中 S3 上的持久输入对象本身就是管道的一环（队列消息只承载引用），内联化在那个语境下不是优化而是破坏设计。把两者并置就能看清，"输入对象"在异步架构里同时承担传输载体与状态载体两种角色，只有后者不可省略。

## 实践启示

1. **先按字节量分叉，再谈简化**
   在客户端把 `len(payload_bytes)` 做成显式分支：不超过 128,000 走 `Body`，否则走 `InputLocation`；不要用"我们主要都是小请求"来赌边界。

2. **把可重放性当作选路的第一个问题，而不是 128KB**
   先问"这条调用失败后，我能否不看客户端本地状态就重新提交"。答案若是否，就必须保留 `InputLocation`，或在客户端自行持久化 payload 并承担这份状态管理。

3. **客户端重试逻辑分两档写**
   同步 `ValidationError` 立即失败并修正参数，不重试不退避；只有 SNS 侧异步失败才需要重新持有 payload 发起提交。

4. **回收 IAM 与输入桶，让简化真正落地**
   内联化之后把输入路径的 `s3:PutObject`、输入桶与其生命周期策略、UUID 命名与清理代码一并删除，否则只是多了一条永不执行的代码路径和一份仍在授予的权限。

5. **输出侧不要跟着改**
   `OutputLocation` 与 SNS/轮询逻辑保持原样，把改动范围严格锁在输入侧，避免把一次客户端替换升级成端到端重构。

6. **在架构复核清单里补一条"输入是否兼作状态载体"**
   参考 [异步调用模式](https://github.com/QianJinGuo/wiki-public/blob/main/entities/asynchronous-agent-invocation-patterns-serverless-pipelines.md) 与 [Bedrock 异步多模态推理](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-bedrock-serverless-async-inference-multimodal.md)：若输入对象同时充当管道状态（典型如队列只存引用），内联化削掉的是状态而非负担，必须先重新设计状态存放位置。

## 与知识库的连接

- → [原文存档](https://aws.amazon.com/blogs/machine-learning/amazon-sagemaker-ai-async-inference-now-supports-inline-request-payloads/)
- 异步推理架构参考：[SQS+Lambda 异步管道](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-bedrock-serverless-async-inference-sqs-lambda.md)
- SageMaker 工具链：[SageMaker SFT/DPO 工具调用](https://github.com/QianJinGuo/wiki-public/blob/main/entities/aws-sagemaker-sft-dpo-tool-calling.md)

---

