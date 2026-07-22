---
sha256: 222f747fa905ec177bc6ede6b69099e871ead112ab32e276be2e739e94c27b49
source: "https://mp.weixin.qq.com/s/zsy5sCkqCGA5_vTs2Qvxpg"
title: "告别复杂接入流程：用 AI Agent Skill 驱动云监控可观测接入"
author: 铖朴、珂帆
publisher: 阿里云云原生
date: 2026-06-07
type: article
ingested: 2026-06-07
review_value: 8
review_confidence: 9
review_recommendation: strong
review_stars: 4
---

# 告别复杂接入流程：用 AI Agent Skill 驱动云监控可观测接入

> 作者：铖朴、珂帆（阿里云云原生） · 发布：2026-06-07

随着云原生架构的普及和 AI 应用的快速增长，企业需要管理的应用类型日益丰富——从传统 Java 微服务到 AI Agent，从 Golang 后端到各类 AI 网关组件。可观测平台的接入配置涉及一系列参数和步骤，对运维效率提出了更高要求。

**阿里云云监控 CMS（CloudMonitor Service）2.0** 作为阿里云统一的可观测管理平台，整合了：
- 应用监控（**APM**）
- 前端监控（**RUM**）
- Prometheus 服务
- 告警管理

为了让用户在终端环境下也能高效完成可观测接入，CMS 团队推出了 **`aliyun cms2` CLI 工具**。更进一步，通过将 CLI 能力封装为 **`alibabacloud-cms-manage` Skill**，实现了**基于 AI Agent 的智能化可观测接入**——用户只需用自然语言描述需求，AI Agent 即可自动编排 CLI 命令完成全流程。

## CMS CLI 概览

`aliyun cms2` 是**阿里云 CLI** 的子命令插件，覆盖 CMS 2.0 各模块的命令行操作：

```bash
# 确认 CLI 已安装且版本 >= 3.3.15
$ aliyun version
3.3.20

# 验证 cms2 插件可用
$ aliyun cms2 --help

# 配置凭证（如尚未配置）
$ aliyun configure
```

## 应用接入能力

### APM 与 AI 可观测

CMS CLI 的 APM 模块支持多种语言的应用接入，同时提供：
- **ack-onepilot**（K8s 容器）
- 手动自研探针
- 原生 **OpenTelemetry**

**AI 可观测**：CMS 2.0 为主流 AI 框架提供了**开箱即用**的接入体验。

### CLI 6 步接入流程

无论接入应用的语言和接入方式，CLI 接入均遵循以下 6 步：

```bash
# Step 1: 获取账号 ID
$ aliyun sts get-caller-identity --force -o json
# → AccountId: 1108xxxxxxxxxxxx

# Step 2: 初始化 APM 基础设施（幂等）
$ aliyun cms2 apm configuration create \
    --workspace default-cms-1108xxxxxxxxxxxx-cn-hangzhou \
    --region cn-hangzhou

# Step 3: 获取接入凭证（LicenseKey、Endpoint 等）
$ aliyun cms2 apm configuration get \
    --workspace default-cms-1108xxxxxxxxxxxx-cn-hangzhou \
    --region cn-hangzhou -o json
# 返回 authToken / privateDomain / project / publicDomain

# Step 4: 注册应用服务
$ aliyun cms2 apm service create \
    --workspace default-cms-1108xxxxxxxxxxxx-cn-hangzhou \
    --region cn-hangzhou \
    --body '{"serviceName":"my-app","serviceType":"TRACE","attributes":"{\"language\":\"java\"}"}' \
    < /dev/null
# → serviceId: a]***@*********************7f1

# Step 5: 获取接入配置模板（以 Java OTel 为例）
$ aliyun cms2 integration addon get --addon-name apm-java-batch --env-type Client -o json

# Step 6: 验证接入
$ aliyun cms2 apm service list \
    --workspace default-cms-1108xxxxxxxxxxxx-cn-hangzhou \
    --service-name my-app --region cn-hangzhou
```

**问题**：6 步操作、多个参数传递，对非高频使用 CLI 的运维人员**门槛仍较高**。

## 通过 AI Agent Skill 实现智能化接入

### alibabacloud-cms-manage Skill

CMS 团队将完整的 CLI 操作知识封装为**开箱即用的 Skill**——`alibabacloud-cms-manage`，其核心思路是**将 CLI 操作流程转化为 AI Agent 可执行的结构化工作流**。

**用户无需记忆命令和参数**，只需用自然语言描述需求即可完成接入。

**Skill 链接**：https://skills.aliyun.com/skills/alibabacloud-cms-manage

### 工作机制

当用户在 **Claude Code** 中描述需求时，AI Agent 按以下流程工作：
1. 解析用户自然语言意图
2. 派生所需参数（账号 ID、regionId、集群信息等）
3. 自动编排 CLI 命令序列
4. 执行并验证

### 安全机制：两阶段确认协议

对于可能影响用户集群的操作（如安装组件、Patch Deployment），Skill 严格执行**两阶段确认**：

- **只读命令**（`get`、`list`）和 **CMS 后端资源创建**（`apm configuration create`）**无需确认**，Agent 可直接执行
- **Patch 集群资源**（如 `kubectl patch deployment`）**需要用户明确 yes/no 确认**

## 使用效果演示：K8s 容器自动接入

**场景**：ACK 集群中 LangChain 应用自动接入。`ack-onepilot` 通过 DaemonSet 在集群节点运行 Agent Pod，当 Deployment 标注指定 Label 后**自动注入探针，无需修改应用代码或 Dockerfile**。

### 完整交互过程

**用户**：帮我把 ACK 集群里的 LangChain 应用 `customer-support-agent` 接入 CMS 监控

**AI Agent**：
```
检测到容器接入场景，正在获取集群信息...
$ aliyun sts get-caller-identity --force -o json
# → AccountId: 1108xxxxxxxxxxxx
$ aliyun cs describe-clusters
# → clusterId: c8d3f***********, region_id: cn-hangzhou

正在初始化 APM 基础设施并获取凭证...
$ aliyun cms2 apm configuration create \
    --workspace default-cms-1108xxxxxxxxxxxx-cn-hangzhou --region cn-hangzhou
# → 成功
$ aliyun cms2 apm configuration get \
    --workspace default-cms-1108xxxxxxxxxxxx-cn-hangzhou --region cn-hangzhou -o json
# → LicenseKey: a]***@***************4b70
$ aliyun cms2 apm service create \
    --workspace default-cms-1108xxxxxxxxxxxx-cn-hangzhou --region cn-hangzhou \
    --body '{"serviceName":"customer-support-agent","serviceType":"TRACE","attributes":"{\"language\":\"python\"}"}' \
    < /dev/null
# → serviceId: a]***@*********************7f1

正在检查 ack-onepilot 组件状态...
$ kubectl get pods -n ack-onepilot
# NAME                      READY   STATUS    RESTARTS   AGE
# ack-onepilot-7d8f9        1/1     Running   0          5d
# ack-onepilot 已安装且正常运行。正在查找目标 Deployment...
$ kubectl get deployment --all-namespaces | grep customer-support
# default   customer-support-agent   3/3     3    3    12d

找到目标 Deployment default/customer-support-agent（3 副本）。
执行计划 — Patch K8s Deployment
请确认执行（yes / no）。
```

**用户**：yes

**AI Agent**：
```
正在执行 Patch...
$ kubectl patch deployment customer-support-agent -n default \
    --type=strategic -p '{
      "spec":{"template":{"metadata":{"labels":{
        "aliyun.com/app-language":"python",
        "armsPilotAutoEnable":"on",
        "armsPilotCreateAppName":"customer-support-agent",
        "armsPilotAppWorkspace":"default-cms-1108xxxxxxxxxxxx-cn-hangzhou"
      }}}}}'
# deployment.apps/customer-support-agent patched

正在验证滚动更新...
$ kubectl rollout status deployment/customer-support-agent -n default --timeout=120s
# deployment "customer-support-agent" successfully rolled out

接入完成！应用已通过 ack-onepilot 自动注入 Python 探针，2-3 分钟后即可在 CMS 控制台
看到 LLM 调用耗时、Token 使用量、Agent 链路等监控数据。
```

### 自动化覆盖的步骤

整个过程中，用户只提供了一句自然语言描述。AI Agent 自动完成了：
1. 账号获取
2. 集群信息派生（无需手动提供 regionId）
3. 基础设施初始化
4. 凭证获取
5. 服务注册
6. 组件状态检查
7. Deployment 查找
8. 通过两阶段确认让用户审核 Patch 内容后再执行

**对比**：手动操作需要执行 **8+ 条命令**，Skill 将接入体验从"**记命令、查参数、拼 JSON**"简化为**一句话**。

## 参考资料

- **阿里云 CLI**：https://github.com/aliyun/aliyun-cli
- **alibabacloud-cms-manage Skill**：https://skills.aliyun.com/skills/alibabacloud-cms-manage
- **CMS 控制台**：https://cmsnext.console.aliyun.com/
- **APM 应用监控文档**：https://help.aliyun.com/zh/cms/cloudmonitor-2-0/
- **阿里云 CLI 安装指南**：https://help.aliyun.com/zh/cli/install-update-alibaba-cloud-cli
