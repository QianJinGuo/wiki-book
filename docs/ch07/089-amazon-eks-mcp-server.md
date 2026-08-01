# Amazon EKS MCP Server

## Ch07.089 Amazon EKS MCP Server

> 📊 Level ⭐⭐ | 2.0KB | `entities/amazon-eks-mcp-server.md`

# Amazon EKS MCP Server

> -> [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/构建-ai-驱动的-eks-集群健康诊断-saas-平台-从静态规则到-mcp-agent-自主分析.md)

## 概述

摘要：本文介绍了一个面向 Amazon EKS 用户的 AI 驱动集群健康诊断 SaaS 平台，该平台通过”确定性规则 + AI 关联分析 + MCP Agent 自主诊断”三层架构，实现从静态规则检查到 AI Agent 按需实时采集集群数据的智能化运维诊断，帮助用户快速定位集群配置风险并获得可执行的修复建议。 04 四、核心能力：结合 Amazon EKS MCP Server 的 AI 自主诊断 在日常支持 [Amazon Elastic Kubernetes Service ](<https://www.amazonaws.cn/eks/>)的过程中，我们经常会遇到一类典型场景：我们的集群运行了一段时间，Pod 偶尔调度失败、DNS 解析变慢、节点资源看起来还有余量但新 Pod 就是起不来。一线工程师提交问题工单时，往往只能描述表象，而根因可能藏在[Amazon VPC](<https://aws.amazon.com/cn/vpc/>) CNI 的 IP 预热策略、CoreDNS 的 ndots 配置、或者节点组跨 AZ 分布不均等多个因素的组合中。

## 主要内容

- **一、背景：EKS 集群运维排错的现实困境**
- **二、平台功能概览**
- 2.1 六维度健康评估
- 2.2 AI 深度分析
- 2.3 Agent 自主深度诊断
- **三、整体架构：异步事件驱动**
- 3.1 架构组件
- 3.2 请求生命周期

## 来源

- [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/构建-ai-驱动的-eks-集群健康诊断-saas-平台-从静态规则到-mcp-agent-自主分析.md)
- 原始链接: https://aws.amazon.com/cn/blogs/china/build-ai-eks-cluster-diagnosis-saas-platform

---

