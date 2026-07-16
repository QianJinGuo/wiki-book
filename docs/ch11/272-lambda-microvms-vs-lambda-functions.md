# Lambda MicroVMs vs Lambda Functions：全方位深度对比

## Ch11.272 Lambda MicroVMs vs Lambda Functions：全方位深度对比

> 📊 Level ⭐⭐ | 2.6KB | `entities/lambda-microvms-vs-lambda-functions全方位深度对比.md`

# Lambda MicroVMs vs Lambda Functions：全方位深度对比

2026年6月22日 AWS 正式发布了 Lambda MicroVMs——一个基于 Firecracker 虚拟化技术的全新 Serverless 计算原语，与 Lambda Functions 同属 AWS Lambda 产品家族，但解决完全不同类别的问题。

## 核心差异

| 维度 | Lambda Functions | Lambda MicroVMs |
|------|-----------------|-----------------|
| 定位 | 事件驱动的无状态计算 | 多租户隔离的有状态沙箱 |
| 执行模型 | 请求-响应，单次调用 | 长期运行独立 VM，支持持续交互 |
| 最长运行时间 | 15 分钟 | 8 小时（支持挂起/恢复） |
| 隔离级别 | 共享内核容器 | 独立 Firecracker VM，无共享内核 |
| 状态保持 | 无状态 | 有状态（内存+磁盘跨交互保持） |
| 编程模型 | Handler 函数，事件触发 | 任意 HTTP 服务，Dockerfile 定义环境 |
| 网络 | 通过 API Gateway/ALB 暴露 | 每个 VM 独立 URL，支持 HTTP/2、gRPC、WebSocket、SSE |
| 规格上限 | 10 GB 内存，6 vCPU | 16 vCPU，32 GB 内存，32 GB 磁盘 |
| 计费 | 按请求数 + GB-秒 | 按 vCPU-秒 + 内存GB-秒 + 快照存储 + 数据传输 |

## 关键洞察

MicroVMs 为每个会话分配完全独立的 Firecracker VM——独立内核、独立内存空间、独立磁盘状态。这意味着即使某个用户的代码中包含恶意内容，也无法影响其他用户的环境或底层系统。

对于需要运行来源不可控的代码（用户上传的脚本、AI 生成的代码、第三方插件），MicroVMs 提供的 VM 级隔离不是"nice to have"，而是安全底线。对于漏洞扫描、AI 代理沙箱、CI/CD 流水线中执行第三方代码等场景，这种级别的隔离是刚需。

MicroVMs 支持"挂起-恢复"机制——当用户不活跃时，VM 自动挂起，计算费用停止，完整的内存和磁盘快照被保留。当下一个请求到达时，VM 从快照恢复，体验接近笔记本电脑的"合盖-开盖"。

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/lambda-microvms-vs-lambda-functions全方位深度对比.md)

---

