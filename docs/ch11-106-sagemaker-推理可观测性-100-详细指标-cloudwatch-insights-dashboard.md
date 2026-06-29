# SageMaker 推理可观测性：100+ 详细指标 + CloudWatch Insights Dashboard

## Ch11.106 SageMaker 推理可观测性：100+ 详细指标 + CloudWatch Insights Dashboard

> 📊 Level ⭐⭐ | 9.3KB | `entities/sagemaker-inference-observability-cloudwatch-insights.md`

## SageMaker 推理可观测性：100+ 详细指标 + CloudWatch Insights Dashboard

> **Background**：本文基于 AWS 官方博客文章，系统梳理 SageMaker AI 推理端点的详细可观测性能力——涵盖 100+ OpenTelemetry 指标、内置 Insights Dashboard（Performance/Capacity/Reliability 三视图）、PromQL 对接 Grafana 等完整方案。

## 核心架构

SageMaker 推理端点原生发射 OpenTelemetry 格式指标到 CloudWatch，覆盖两大端点架构：

- **Single-model endpoints (SME)** — 单模型独占实例，简单但每模型需独立 GPU 节点
- **Inference Component (IC) endpoints** — 多模型共享 GPU 基础设施，每个 IC 定义模型资源需求 + 独立扩缩策略，是生产推荐架构

指标通过 SageMaker Insights Dashboard 在 CloudWatch 控制台中可视化，支持 PromQL 查询，无需自建 Grafana/Prometheus。

## 100+ 详细指标覆盖范围

| 类别 | 关键指标 | 说明 |
|------|---------|------|
| GPU 健康 | GPU 利用率、GPU 内存、每加速器指标 | 实例级 GPU 资源监控 |
| Token 级延迟 | TTFT (Time to First Token)、ITL (Inter-Token Latency) | vLLM/SGLang 框架特有 |
| KV Cache 压力 | KV Cache 使用率百分比 | 早期预警系统，40-50% 时应触发扩缩 |
| 流量分布 | 每实例/IC 请求流、AZ 过滤 | 检测路由或放置问题 |
| 引擎压力 | 活跃请求数、队列等待 | 推理引擎内部队列状态 |
| 冷启动诊断 | 模型下载/GPU 加载/容器启动 三阶段 | 水平堆叠条形图，定位瓶颈阶段 |
| ICE 诊断 | 容量不足错误时间、端点、实例类型、AZ | 区域级容量耗尽检测 |

## Insights Dashboard 三视图

### Performance Tab

核心监控界面，回答"一切正常吗？"和"如果不正常，哪个组件是问题？"

- **六边形健康可视化** — 每个资源一个六边形，绿色=OK、白色=无告警、红色=告警中
- **Token Streaming Panel** — TTFT/ITL 时间序列，P50/P99 切换
- **Latency Breakdown** — 分离 Model Latency vs Overhead Latency
- **Engine & Request Pressure** — KV Cache 压力早期预警
- **Traffic Distribution** — 每实例/IC 请求流 + AZ 过滤
- **Token Throughput** — 实际 tokens/秒，input/output 分离

### Capacity Tab

回答"资源够吗？"和"哪里有余量？"

- GPU/GPU Memory/CPU/CPU Memory/Disk 五维资源利用率
- 趋势面板：GPU Memory 持续上升 → 接近容量上限；突然下降 → 模型崩溃或卸载

### Reliability Tab

回答"AZ 故障能活下来吗？"和"扩缩事件正常吗？"

- **AZ 分布** — 均匀分布 = 低风险；集中在 1-2 AZ = 中风险；某 AZ 0 实例 = 高风险
- **冷启动解剖** — 模型下载(蓝)/GPU 加载(紫)/容器启动(橙) 三阶段堆叠条形图
- **ICE 诊断** — 容量不足错误的精确追踪

## 启用方式

- **新端点**：默认开启（`EnableDetailedObservability` 默认 `true`）
- **现有端点**：创建新 endpoint config + `MetricsConfig` flag，然后 update endpoint
- **OTel 增强**：CloudWatch 控制台 → Settings → 开启 OTel metric enrichment（账户级/区域级一次性设置）
- **指标频率**：默认 60s，可通过 `MetricsPublishFrequencyInSeconds` 调整为亚分钟级

## PromQL 对接 Grafana

1. 获取 PromQL endpoint URL（SageMaker Console → Endpoints → Connect to your observability tool）
2. Grafana 添加 Amazon Managed Service for Prometheus 数据源
3. 导入预建 Dashboard 模板 JSON
4. 自定义 PromQL 查询，如：
   - `vllm:kv_cache_usage_perc{endpoint="...", ic="..."}` — KV Cache 使用率
   - `histogram_quantile(0.99, rate(vllm:time_to_first_token_seconds{...}[5m]))` — TTFT P99

## 定价

- 详细指标本身不额外收费
- OpenTelemetry 指标摄入 CloudWatch：$0.50/GB
- OTel 增强指标同样 $0.50/GB

## 前置条件

- AWS 账户 + 至少一个 SageMaker 实时推理端点
- IAM 权限：`sagemaker:CreateEndpointConfig`、`sagemaker:UpdateEndpoint`、`cloudwatch:GetMetricData`
- vLLM 或 SGLang 容器框架（Token 级指标必须）

## 与现有 MLOps 实体的差异化

本实体聚焦 **SageMaker 原生推理可观测性**——100+ OpenTelemetry 指标 + 内置 Dashboard + PromQL 对接，是一个完整的 AWS 生态方案。与其他 MLOps/推理实体的区别：

| 维度 | 本实体 | 通用 MLOps 实体 |
|------|--------|----------------|
| 范围 | SageMaker 推理端点专用 | 跨平台通用 |
| 指标深度 | Token 级 (TTFT/ITL) + KV Cache | 通常只到请求级 |
| 可视化 | 内置 CloudWatch Insights Dashboard | 需自建 Grafana |
| 冷启动 | 三阶段分解诊断 | 通常只有总耗时 |

## 深度分析

**Token 级指标是 LLM 推理可观测性的分水岭**：传统推理监控只关注请求级指标（延迟、吞吐、错误率），但 LLM 推理的流式输出特性要求更细粒度的监控——TTFT（首 token 延迟）决定用户体验的"响应感"，ITL（token 间延迟）决定输出的"流畅度"。SageMaker 将这些指标原生集成到 CloudWatch，而非依赖用户自建 vLLM metrics 导出，大幅降低了 LLM 推理监控的工程门槛。

**KV Cache 压力指标是容量规划的"早期预警系统"**：KV Cache 使用率是 LLM 推理特有的资源瓶颈——当使用率超过 40-50% 时，推理引擎开始拒绝新请求或降级服务质量。SageMaker 将这一指标纳入原生监控，使得运维团队可以在用户感知到问题之前触发扩缩。这比传统的"请求失败后扩容"模式提前了数分钟。

**三视图设计体现了"分层诊断"的运维哲学**：Performance（一切正常吗？）→ Capacity（资源够吗？）→ Reliability（AZ 故障能活吗？）三个视图对应了运维诊断的三个层次——从"发现问题"到"定位原因"到"评估风险"。这种分层设计比单一 dashboard 更高效，因为它引导运维人员按照诊断逻辑逐步深入。

**冷启动三阶段分解是调试利器**：模型下载（蓝）→ GPU 加载（紫）→ 容器启动（橙）的三阶段堆叠条形图，将冷启动从"一个黑盒延迟"分解为"三个可定位的瓶颈"。这对于优化 cold start 至关重要——如果瓶颈在模型下载，需要优化模型打包；如果在 GPU 加载，需要检查 CUDA 初始化。

**"详细指标不额外收费"是 AWS 的生态锁定策略**：SageMaker 的 100+ 详细指标本身免费，但指标摄入 CloudWatch 按 $0.50/GB 收费。对于高频采样（亚分钟级）的大规模推理集群，这笔费用可能显著——但它也创造了从 SageMaker 迁移到自建方案的切换成本。

## 实践启示

1. **LLM 推理监控必须覆盖 Token 级指标**：如果你在用 SageMaker 部署 LLM，确保启用详细可观测性（新端点默认开启）。重点关注 TTFT P99 和 ITL P99——这两个指标直接决定用户体验。

2. **设置 KV Cache 使用率告警**：在 CloudWatch 中为 `vllm:kv_cache_usage_perc` 设置告警阈值（建议 40% 警告、60% 严重）。当 KV Cache 压力上升时，提前扩容而不是等待请求失败。

3. **用 Reliability Tab 评估 AZ 风险**：定期检查 AZ 分布——如果推理实例集中在 1-2 个 AZ，单个 AZ 故障会导致显著的服务降级。目标：每个 AZ 至少有 25% 的推理容量。

4. **用冷启动分解定位优化方向**：如果冷启动时间过长，用三阶段分解图定位瓶颈——模型下载（优化模型打包/使用 FSx for Lustre）、GPU 加载（检查 CUDA 版本兼容性）、容器启动（优化 Docker 镜像层）。

5. **监控 OTel 指标摄入成本**：详细指标免费但摄入收费 ($0.50/GB)。对于大规模集群，评估指标频率（默认 60s）是否需要调整——亚分钟级采样会线性增加成本。

---

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/monitor-and-debug-generative-ai-inference-with-sagemaker-det.md)

---

