# AWS 正式发布 Lambda MicroVMs：面向 AI 时代的无服务器安全代码执行环境

> 📊 Level ⭐⭐⭐⭐ | 15.5KB

→ [原文存档](https://aws.amazon.com/cn/blogs/china/aws-launch-lambda-microvms-ai-serverless-security-environment)

## AWS 正式发布 Lambda MicroVMs：面向 AI 时代的无服务器安全代码执行环境

摘要：当用户和 AI 生成的代码越来越多，一个绕不开的问题摆在每个平台面前：这些不可信的代码，到底该在哪里安全地运行？2026 年 6 月 22 日，AWS 给出了新答案——Lambda MicroVMs。
  
**目录**

01 一句话理解

02 一、痛点：不可能三角

03 二、三大核心能力

04 三、架构原理

05 四、典型使用场景

06 五、与同类服务的关系

07 六、动手上路

08 写在最后

09 结语

* * *

## **一句话理解**

Lambda MicroVMs 是 AWS Lambda 中一种全新的无服务器计算原语：为每个用户或会话提供一台专属的、有状态的、虚拟机级隔离的轻量执行环境——启动近乎瞬时，空闲自动挂起，完全无需管理基础设施。

## **一、痛点：不可能三角**

过去几年涌现出一类新的多租户应用——AI 编程助手、交互式代码环境、数据分析平台、漏洞扫描器、运行用户脚本的游戏服务器——它们有一个共同需求：为每个终端用户分配一个专属的执行环境，去安全地运行开发者自己并没有编写的代码。

而要在今天构建这种能力，意味着一个”不可能三角”：

方案 | 隔离 | 启动速度 | 状态保持

---|---|---|---  
虚拟机（EC2） | 强 | 分钟级 | 有

容器（ECS/EKS） | 共享内核 | 秒级 | 无

函数（Lambda Function） | 容器可复用 | 毫秒级 | 无

  
开发者要么在性能与隔离之间妥协，要么投入大量工程资源去自建一套定制的虚拟化基础设施。

**Lambda MicroVMs 打破了这个三角**

方案 | 隔离 | 启动速度 | 状态保持

---|---|---|---  
Lambda MicroVM | VM 级 | 近乎瞬时 | 最长 8 小时

  
## **二、三大核心能力**

### 2.1 虚拟机级隔离

每个 MicroVM 是一个独立的 Firecracker 虚拟机——正是支撑 Lambda 每月超过 15 万亿次函数调用的同一套技术。

  * 不同 MicroVM 之间无共享内核、无共享资源
  * 一个用户的不可信代码被完全限制在自己的环境内
  * 每个 MicroVM 拥有独立的 HTTPS endpoint，网络层天然隔离

### 2.2 近乎瞬时的启动与恢复

采用”先镜像、再启动”（image-then-launch）模型：

  * 你提供 Dockerfile → Lambda 构建并初始化应用 → 对运行态打 Firecracker 快照（snapshot）
  * 后续每次启动都从预初始化快照恢复，而非冷启动
  * 空闲恢复同理——即使是多 GB 的交互式会话，恢复也快到让用户无感

### 2.3 有状态执行

运行中的 MicroVM 持续保留内存、磁盘、运行中的进程：

  * 已安装的包、已加载的模型、正在处理的文件——跨交互持续存在
  * 空闲时自动挂起（状态完整快照保存），请求到来时自动恢复
  * 最长 8 小时运行时间，支持可配置的空闲策略
  * 用户回来时无感恢复——这次暂停从未发生过

## **三、架构原理**

### 3.1 底层：Firecracker 快照 + 专属 URL

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/02/aws-launch-lambda-microvms-ai-serverless-security-environment-01.png>)
---  
  
**3.1.1 关键设计要点**

  * 每个 VM 有固定 URL——亲和性不靠”智能路由”，而是你记住”谁对应谁”
  * 镜像 = 已初始化快照——所有 MicroVM 从同一个快照启动，应用已在运行状态
  * 挂起 ≠ 销毁——空闲时内存和磁盘以快照保存，URL 不变，下次请求自动恢复
  * 销毁 = 彻底清除——VM 终止后数据随之消失，无残留风险

### 3.2 租户隔离：由你定义粒度

Lambda MicroVMs 提供的是隔离原语——具体按什么粒度隔离，由你的应用逻辑决定：

隔离策略 | 做法  
---|---  
每用户一个 VM | 用户首次来 → 创建 VM → 存映射到 DB → 后续请求路由到同一 URL

每会话一个 VM | 每次新会话创建 VM，会话结束销毁

每任务一个 VM | 每个独立任务（如一次扫描）分配一个 VM，跑完即销毁

  
## **四、典型使用场景**

场景 | 为什么选 MicroVM  
---|---  
AI 编程助手的代码沙箱 | AI 生成的代码需要隔离执行，用户间不能互相影响

交互式数据分析平台 | 用户上传数据和脚本，需要长时间运行 + 状态保持

安全漏洞扫描引擎 | 每次扫描在隔离环境内运行，防止横向移动

游戏服务器（用户自定义脚本） | 用户提交的脚本需要沙箱隔离

多租户 SaaS 插件系统 | 第三方插件代码需要强隔离 + 独立资源限制

云端 IDE / Notebook | 每个用户一个完整的开发环境，来去自如

  
## **五、与同类服务的关系**

### 5.1 Lambda MicroVMs vs Lambda Functions：互补

维度 | Lambda Functions | Lambda MicroVMs

---|---|---  
定位 | 事件驱动、request-response 短任务 | 多租户隔离环境（跑用户/AI 代码）
运行时间 | 最长 15 分钟 | 最长 8 小时 + 挂起/恢复

隔离 | 共享内核容器（跨调用可复用） | 独立 VM，无共享内核

状态 | 无状态 | 完整保留：内存+磁盘+进程

编程模型 | Handler 函数 | 完整 Dockerfile，任意进程

网络 | 共享入口 | 每 VM 独立 HTTPS URL

协议 | HTTP(S) | HTTP/2、gRPC、WebSocket

规格 | 最高 10 GB 内存 | 16 vCPU / 32 GB 内存 / 32 GB 磁盘

适合不可信代码 | 非设计目标 | 核心设计目标

  
二者相得益彰：用 Lambda 函数搭建事件驱动主干，在需要隔离执行的环节调用 MicroVM。

### 5.2 Lambda MicroVMs vs Bedrock AgentCore：不同层级

| Lambda MicroVMs | Bedrock AgentCore  
---|---|---  
本质

---
## 深度分析

### 1. "不可能三角"被打破的方式：把初始化成本从运行时挪到构建时

EC2、容器、Lambda 函数各自的短板（隔离弱、状态无、启动慢）并非独立缺陷，而是三者把"环境初始化"与"请求处理"绑定在同一时间线上。MicroVM 的关键动作是采用 image-then-launch 模型：镜像本身就是一个已初始化、应用已在运行态的 Firecracker 快照，后续每次"启动"实质是快照恢复而非冷启动。这属于时间维度上的预计算——用一次性构建成本换取近乎瞬时的重复启动，使隔离强度与启动速度不再互斥。

### 2. 有状态执行把"状态管理责任"从应用层下沉到平台层

传统 FaaS 以无状态为前提，代价是所有会话状态必须外推到数据库、缓存等应用自管组件。MicroVM 把内存、磁盘、运行中进程整体纳入托管生命周期：空闲即快照挂起、请求即快照还原，用户侧表现为"暂停从未发生"。这意味着编程模型从 Handler 函数回退到完整 Dockerfile + 任意进程——平台接管了原本最难自治的部分，应用层只需关心业务逻辑。

### 3. 会话亲和性用"笨办法"而非智能路由，是有意的架构取舍

每个 VM 固定 URL，谁对应谁由应用自己记（映射存 DB）。这个反直觉设计让平台保持无状态、可水平扩展，把会话→VM 的映射、重建与回收全部留给应用层；平台只承诺两件事：隔离原语 + 稳定端点。理解这一点才能正确设计上层系统——不要期待平台替你做路由决策。

### 4. 在 AWS 计算版图中的生态位：补齐"不可信代码执行"这一层

与 Lambda Functions 是互补关系（事件驱动主干 + 隔离执行节点），与 Bedrock AgentCore 是不同层级（底层计算原语 vs 上层 Agent 框架）——AgentCore 解决"Agent 怎么跑起来"，MicroVM 解决"Agent 产出的代码怎么安全执行"。此前团队基于 Firecracker 自建多租户隔离池的路线（参见 [Firecracker Bedrock Agentcore Multi Tenant](https://github.com/QianJinGuo/wiki-public/blob/main/entities/firecracker-bedrock-agentcore-multi-tenant.md)），如今被收敛为几次 API 调用，自建虚拟化栈的工程重量被平台吸收。

### 5. 计费模型与 Lambda 函数的经济学根本不同

Baseline 持续计费 + active duration 意味着"空闲 ≠ 免费"，只是打了折；这与 Lambda 函数纯按调用计费的模型不同。隔离粒度（每用户 / 每会话 / 每任务一个 VM）的选择直接决定 VM 存活时长分布，进而决定成本曲线——粒度不仅是安全决策，也是财务决策。

## 实践启示

1. **先做隔离粒度决策**：长交互场景（AI 编程助手、云端 IDE）选每用户一个 VM 以复用状态；一次性任务（漏洞扫描）选每任务一个 VM，跑完即毁、无残留风险。粒度选错，成本和体验会同时恶化。

2. **把 user→VM 映射表当作核心架构组件来设计**：亲和性靠应用层 DB 存映射，需要预先设计映射的存储、故障重建、VM 回收与过期清理逻辑，而不是依赖平台路由。

3. **"运行用户/AI 生成代码"的功能应默认落在 VM 级隔离内**：共享内核容器的隔离等级不足以承载真正不可信的代码；这正是 [Agent Sandbox](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/agent-sandbox.md) 讨论的沙箱基座在云上的托管化实现，也不必再走 [Cloud Ai Infrastructure](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/cloud-ai-infrastructure.md) 式的自建路线。

4. **按层选型而非单服务硬扛**：Agent 编排交给 AgentCore 或框架层，不可信代码的隔离执行交给 MicroVM，事件驱动短任务用普通 Lambda 函数，三者各司其职、互相调用。选型细节可对照 [Lambda Microvms Vs Bedrock Agentcore Ai Agent Comparison](https://github.com/QianJinGuo/wiki-public/blob/main/entities/lambda-microvms-vs-bedrock-agentcore-ai-agent-comparison.md) 与第三方解读 [Theburningmonk Com 2026 06 What You Need To Know About Lambda Microvms](https://github.com/QianJinGuo/wiki-public/blob/main/entities/theburningmonk-com-2026-06-what-you-need-to-know-about-lambda-microvms.md)。

5. **提前评估 ARM64-only 与区域约束**：当前规格仅提供 ARM64 架构，镜像构建需保证依赖与二进制兼容；可用区域限于美东、美西、爱尔兰、东京，中国区落地需确认路线图。

## 关联
- 相关概念: [Harness Engineering](https://github.com/QianJinGuo/wiki-public/blob/main/concepts/harness-engineering-framework.md)

---

