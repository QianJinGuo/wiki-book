# 中国用户安全高性能访问海外 Bedrock

## Ch12.107 中国用户安全高性能访问海外 Bedrock

> 📊 Level ⭐⭐ | 3.2KB | `entities/user-security-high-performance-bedrock-aws-china.md`

# 中国用户安全高性能访问海外 Bedrock

> **Background**：基于 AWS China Blog 原创技术文章（2026-06-26），系统梳理中国用户访问海外 Amazon Bedrock 的三类场景与端到端私有化接入架构。

## 核心问题

中国开发团队访问海外 Amazon Bedrock 时面临三大挑战：

1. **网络体验不稳定** — 国际出口带宽、延迟、丢包不可控，流式补全和 Agent 多轮推理对链路质量敏感
2. **数据在公网传输** — 提示词包含企业敏感信息（RAG 文档、Skill、代码片段），公网传输存在监听风险
3. **缺少端到端私有通道** — 需要可控、独享、私密的链路

## 三类场景识别

| 场景 | 典型用户 | 接入特征 | 核心诉求 |
|------|---------|---------|---------|
| A：固定办公场所 | 企业数据中心/总部 | 有固定网络出口，可对接专线 | 最高稳定性与私密性 |
| B：远程/移动用户 | 远程办公、出差 | 可拨入企业 VPN | 沿用私有通道 |
| C：无 VPN 条件 | 临时、外部协作 | 无专线、无 VPN | 安全可控灵活接入 |

## 三条路径解决方案

### 路径 1：专线（DX / SD-WAN）直连 — 场景 A

固定办公场所通过 AWS Direct Connect 或 SD-WAN 建立专线连接，流量全程走私网。

### 路径 2：Client VPN 回传 — 场景 B

远程用户通过 AWS Client VPN 接回数据中心，复用专线链路。

### 路径 3：海外 EC2 代理 TLS 透传 — 场景 C（兜底）

确无 VPN 条件时，使用海外 EC2 代理做 TLS 透传。

**三条路径共同点**：最终都经 VPC Interface Endpoint 走 AWS PrivateLink，进入 AWS 后全程私有。

## 关键架构要素

- **VPC Interface Endpoint** — 所有路径的最终入口，确保 AWS 内部流量不暴露公网
- **PrivateLink** — AWS 私有链接技术，提供端到端加密和隔离
- **流量分类** — 按接入位置和移动性划分三类场景，每类对应独立路径
- **兜底策略** — TLS 透传代理作为最后手段，但仍通过 PrivateLink 进入 AWS

## 与其他 AWS 网络方案的差异化

本文聚焦**跨境 AI 推理场景**（Bedrock 流式补全、Agent 多轮推理），与一般的企业上云网络架构有本质区别：

- 对延迟和抖动更敏感（流式 token 逐字输出）
- 数据敏感度更高（提示词含企业核心知识）
- 需要端到端私有（不能有任何公网段）

## 相关主题

- AWS Direct Connect — 专线接入
- AWS Client VPN — 远程接入
- VPC Endpoint / PrivateLink — AWS 私有链接
- Amazon Bedrock — 海外 LLM 推理服务

---

