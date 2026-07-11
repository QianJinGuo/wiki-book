# 让 Kiro 和 Claude Code 响应 IM 消息：用 ACP Bridge 打造异步 AI 编程工作流 | 亚马逊AWS官方博客

## Ch09.111 让 Kiro 和 Claude Code 响应 IM 消息：用 ACP Bridge 打造异步 AI 编程工作流 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 6.1KB | `entities/enable-kiro-and-claude-code-for-im-with-acp-bridge-async-ai-workflow.md`

## 概述
让 Kiro 和 Claude Code 响应 IM 消息：用 ACP Bridge 打造异步 AI 编程工作流 by awschina on 17 3月 2026 in How-To Permalink Share 摘要：AI 编程助手如 Kiro CLI、Claude Code 能力日益强大，但使用场景局限于本地终端，难以满足移动办公和团队协作需求。本文介绍 ACP Bridge——一个将本地 CLI 编程助手通过 ACP 协议暴露为 HTTP 服务的桥接工具，结合 OpenClaw Gateway 和 AWS 基础设施，实现从 Discord 消息触发异步 AI 编程任务的完整闭环。 目录 01 一、背景 02 二、挑战：本地 CLI 工具的协作困境 03 三、技术背景： ACP 协议与 OpenClaw 04 四、整体架构 05 五、安全注意事项 06 六、核心模块解析 07 七、

## 核心技术
Kiro CLI、Kiro IDE、Kiro MCP Skills、Amazon Bedrock、Claude Code、Amazon Bedrock

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/enable-kiro-and-claude-code-for-im-with-acp-bridge-async-ai-workflow/)

## 相关实体
- [AI 驱动的跨云网络搭建：用 Claude Code 和 Kiro CLI 实现 AWS-腾讯云 IPSec VPN 双隧道互联 | 亚马逊AWS官方博客](../ch03/075-claude-code.html)
- [开源 AI 知识管理搭档 Obsidian + Claude Code 完整集成指南](../ch03/002-obsidian-claude-code.html)
- [打造可靠的 AI 编程环境：Claude Code Hooks 完整开发者指南](../ch03/075-claude-code.html)
- [使用 Kiro CLI 和 Agent Client Protocol 构建飞书 AI 聊天机器人 | 亚马逊AWS官方博客](../ch03/045-agent.html)
- [用 Kiro构建 AI：基于 AWS 基础设施快速构建企业级 Agentic AI 平台 | 亚马逊AWS官方博客](../ch04/551-agentic-ai.html)
- [使用 Kiro AI IDE 开发 AWS CDK 部署架构：从模糊需求到三层堆栈的协作实战 | 亚马逊AWS官方博客](../ch05/082-ai.html)

## 深度分析
### 1. ACP 协议：CLI AI Agent 的标准化桥梁
ACP（Agent Client Protocol）基于 stdio JSON-RPC 实现双向通信，支持结构化事件流（thinking/tool_call/text/status），是连接本地 CLI 工具与外部系统的关键协议层

### 2. Kiro 与 Claude Code 的 ACP 集成差异
Kiro CLI 原生支持 ACP 协议，`kiro-cli acp --trust-all-tools` 直接走 stdio JSON-RPC；而 Claude Code 需要通过 claude-agent-acp 适配器层接入，多一层转换意味着多一层复杂度与故障点

### 3. 进程池生命周期与 Session 解耦
ACP Bridge 为每个 (agent, session_id) 对维护独立 CLI 子进程，进程生命周期与 OpenClaw 会话完全解耦——这是与 acpx 插件的本质区别，解决了会话重置导致进程中断的核心痛点

### 4. 异步任务队列与 Webhook 推送机制
ACP Bridge 提交任务立即返回 job_id，后台异步执行，完成后通过 webhook POST 到 OpenClaw /tools/invoke，再由 OpenClaw 推送结果到 Discord——完整闭环避免了 acpx 同步阻塞导致的超时或卡死

### 5. 安全架构：最小权限与网络隔离
IAM 最小权限（仅 Bedrock 调用权限）、VPC 内网部署（无公网 IP）、IP 白名单 + Bearer Token 双重认证、OpenClaw 与 ACP Bridge 分离部署——安全设计从一开始就需要融入架构而非事后补救

## 实践启示
### 1. 优先选择原生 ACP 支持的工具
在 CLI AI Agent 选型时，Kiro 等原生支持 ACP 协议的工具集成成本更低、行为更可预测，应优先于需要适配器层的方案

### 2. 异步任务队列是远程协作的关键
将同步阻塞的 CLI 调用转换为异步任务提交+回调推送模式，是实现移动办公和团队协作的核心，必须在架构层面设计任务队列和结果推送机制

### 3. 安全隔离要从小处着手
OpenClaw Gateway 与 ACP Bridge 分离部署、IAM 最小权限、网络隔离（VPC 内网、无公网 IP）、IP 白名单+Token 双重认证，这些基础安全措施应在部署初期就纳入架构考量

### 4. 进程池的 TTL 和上限保证系统韧性
配置 `max_processes: 20` 和 `max_per_agent: 10` 全局进程上限，设置 `session_ttl_hours: 24` 的空闲清理机制，配合每 60 秒的 job 状态巡查和 10 分钟超时标记，是构建稳定长期运行系统的必要保障

### 5. DynamoDB 持久化是生产级扩展方向
从内存 dict 升级到 DynamoDB 持久化任务队列，利用其按需付费、自动扩展、TTL 自动清理等特性，为企业级部署奠定基础

---

