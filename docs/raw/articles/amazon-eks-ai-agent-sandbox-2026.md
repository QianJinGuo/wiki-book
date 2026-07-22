---
title: "在 Amazon EKS 上构建安全的 AI Agent 沙箱"
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/amazon-eks-build-security-ai-agent
ingested: 2026-07-15
feed_name: AWS China Blog
source_published: 2026-07-15
type: article
source_type: rss
sha256: "e02cfff7e65a535a31559cf0f6230b215374eff32027746ea9100f9d962d8a03"
---

# 在 Amazon EKS 上构建安全的 AI Agent 沙箱

摘要：本文介绍了一种 AI Agent 的沙箱方案：用于多租户 AI Agent 平台（不同用户的会话需要完全隔离）、编程助手的代码执行沙箱（OpenClaw、Hermes 之类）、合规环境下需要可审计的工作负载隔离，以及任何需要规模化执行不可信代码的场景。

**目录**

01 背景

02 方案描述

03 部署指南

04 关键性能数据

05 总结

06 参考资料

* * *

## **1\. 背景**

2025 年以来，能够自主编写和执行代码的 AI Agent 迅速从实验室走进了生产环境。AI Agent 在执行任务时往往需要访问敏感资源执行代码或与外部系统交互，这带来了前所未有的安全挑战。

### 1.1 已经发生的事故

2025 年 7 月，某在线平台的 AI Agent 删除了一个有 1206 条记录的生产数据库，然后生成假数据来掩盖痕迹。2026 年 2 月，某主流 AI编程助手在一个用户环境里执行了 “terraform destroy”，摧毁了 VPC、RDS 和 ECS 集群，2.5 年的学生数据丢失。同年 4 月，另一款 AI代码编辑器在 9 秒内通过某云平台 API 删除了生产数据库和所有备份。

安全研究方面，CVE-2026-XXXXX 展示了某 AI Agent 框架的三层沙箱被完全绕过（CVSS 10.0）；CVE-2026-XXXXX（CVSS 8.8）证明某开源 Agent网关的 WebSocket 接口可被利用来窃取 Gateway 认证令牌并实现远程代码执行；某知名安全研究机构在 2025 年 10 月演示了对三个生产级 Agent平台的 Prompt Injection → RCE 攻击链。

### 1.2 为什么传统容器不够用

标准的 Docker/runc 容器通过 Linux namespace 做隔离，但所有容器共享同一个宿主机内核。在多租户 Agent 场景下，一个用户的会话如果触发了内核漏洞，可以影响同节点上所有其他用户的会话。资源层面，一次失控的递归代码生成就能触发 OOM 或 fork bomb，波及同节点的全部工作负载。

我们需要的是：VM 级的内核隔离，但交付速度要像容器一样快——毫秒级启动、自动弹性伸缩、每个会话完全独立。

## **2\. 方案描述**

Agent 沙箱的生命周期与用户会话绑定，随用户上线创建、离线释放。部分场景对启动速度要求极高，例如用户发送一条消息后，沙箱需要在毫秒级完成初始化并开始执行代码，冷启动延迟直接影响用户体验。这要求底层支持 warm pool（预热待命的沙箱实例池）和 template（标准化沙箱模板，包含预装环境和配置），使沙箱创建尽可能走热路径。同时，沙箱之间必须保持严格的状态隔离，销毁后不能残留任何数据。

尽管业界不断推出了一些完全托管的 AI Agent 沙箱环境（比如 [Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/>)），但很多企业已经习惯了使用 Kubernetes 相关技术来规模化管理 Agent，并且希望对 Agent 拥有完全的控制权。因此，本文推出了一个基于 [Amazon EKS](<https://aws.amazon.com/cn/eks/>) 的方案。

### 2.1 整体架构

整体思路很直接：在 Amazon EKS 上用 Kata Containers + Cloud Hypervisor 给每个沙箱一个独立的 microVM，由 OpenSandbox Controller 维护一个预热池保证秒级交付，再由 Karpenter 做节点层面的弹性扩缩。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/07/amazon-eks-build-security-ai-agent-1.png>) [图1]  
---  
  
从上往下看，EKS 提供托管的 K8s 控制平面；数据平面用的是 c5.metal 裸金属实例，直接暴露 /dev/kvm 做硬件虚拟化，不需要嵌套虚拟化这种性能损耗大的方式。每个沙箱 Pod 通过 Kata Containers 3.31.0 + Cloud Hypervisor 跑在独立的 microVM 里，有自己的 guest kernel。OpenSandbox Controller 通过 Pool / BatchSandbox 两个 CRD 管理预热池的生命周期。Karpenter 1.12.1 负责节点层面的弹性——搭配 Pause Pod 预热机制，确保裸金属节点的慢启动不会阻塞沙箱交付。

### 2.2 为什么选择 Cloud Hypervisor

Kata Containers 支持多种 VMM 后端，我们选了 Cloud Hypervisor（CLH）。它是用 Rust 写的，专为云原生容器场景设计，代码量比 QEMU 小一个数量级。实际跑下来，单个 Pod 的内存开销大约 130MB，比 QEMU 的 160MB 省了 30MB——当你在一台 c5.metal 上跑几十个沙箱的时候，这个差距就很明显了。CLH 原生支持 virtio-fs 做文件系统直通，不走 9p 那套老协议。安全方面，每个 VMM 线程有独立的 seccomp filter，加上 Rust 的内存安全特性，攻击面很小。冷启动大约在 800ms 级别（Hypervisor 初始化约 200ms，Guest Kernel 启动约 300ms，kata-agent 就绪约 300ms）。

### 2.3 MicroVM 隔离模型

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/07/amazon-eks-build-security-ai-agent-2.png>) [图2]  
---  
  
每个沙箱跑在自己的 microVM 里，有独立的 Guest Kernel，和宿主机的 Host Kernel 完全隔离。即使用户代码触发了内核漏洞，爆炸半径也被限制在单个 VM 内，不会跨越到其他会话或宿主机。文件系统也是完全独立的，不存在跨 VM 访问的可能。资源边界由 KVM 在硬件层面强制执行——CPU、内存、IO 都有硬隔离。网络方面，每个 microVM 通过 virtio-net 桥接到 VPC CNI，拿到的就是一个标准的 Pod IP，对上层应用完全透明。

### 2.4 三层自动扩缩容

c5.metal 裸金属实例从启动到可用需要分钟级时间，这对要求毫秒级交付的沙箱场景来说太慢了。为了解决这个矛盾，我们设计了三层缓冲：第一层是基线——一个 Managed Nodegroup 常驻一台 c5.metal，上面跑着池里的 bufferMin 个 Pod，保证日常请求秒级响应。第二层是预热——通过 Karpenter + 低优先级 Pause Pod 占位，迫使 Karpenter 提前拉起热备节点；当有真实 Pod 需要调度时，高优先级的沙箱 Pod 会抢占 Pause Pod 的位置，几秒钟内就能拿到资源。第三层是突发——如果预热节点也被用完了，Karpenter 会按需启动新的 c5.metal，空闲 30 分钟后自动回收。

自动扩容决策链路：
    
    
    Pool available < bufferMin
      → Controller 创建新 Pod (Pending)
        → Scheduler: 现有节点有空间?
          ├─ 是 → Pod Running (~3.1s cold start) → 正常回填
          └─ 否 → 预热节点有 pause Pod?
               ├─ 是 → 抢占 pause Pod → Pod Running (~3.1s)
               │       → Karpenter 异步为被驱逐的 pause Pod 补充新预热节点
               └─ 否 → Karpenter 启动新 c5.metal (~5-8 min)
                      → kata-deploy DaemonSet 安装 Kata runtime (~3-5 min)
                      → Pod Running (~3.1s)
    

### 2.5 OpenSandbox 池管理

OpenSandbox 是一个开源的沙箱管理平台，它定义了一套统一的沙箱协议（覆盖生命周期管理和代码执行两类 API），并在此之上提供了相当丰富的接入方式：多语言 SDK（Python、Java/Kotlin、JavaScript/TypeScript、C#/.NET、Go）、命令行工具 osb，以及一个 MCP Server，可以直接被 Claude Code、Cursor 这类客户端调用。运行时层面它同时支持本地 Docker 和大规模分布式的 Kubernetes 调度，并内置了 Command、Filesystem、Code Interpreter 等开箱即用的沙箱环境。也就是说，应用层完全可以用一行 `Sandbox.create(...)` 这样的 SDK 调用来申领和操作沙箱，底层走的是什么运行时对调用方是透明的。

本文聚焦的是它的 Kubernetes 运行时——OpenSandbox Controller 把”预热一批沙箱、按需快速分配”这套池化逻辑封装成了 Pool 和 BatchSandbox 两个 CRD，让我们能用声明式的方式管理沙箱生命周期，而不必自己从头实现一套池化控制器。

OpenSandbox Controller 通过两个 CRD 管理沙箱生命周期：

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/07/amazon-eks-build-security-ai-agent-3.png>) [图3]  
---  
  
Pool CRD 定义预热池的行为：`bufferMin` 和 `bufferMax` 控制空闲 Pod 数量的范围，当可用 Pod 低于 bufferMin 时自动回填；`poolMin` / `poolMax` 是池总量的硬性上下限。

BatchSandbox CRD 是请求沙箱的入口。指定 `poolRef` 的话，Controller 会直接从预热池里 claim 一个已经跑着的 Pod，延迟大约 230ms；不指定 `poolRef` 就走冷启动路径，需要约 3,100ms。

**沙箱生命周期**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/07/amazon-eks-build-security-ai-agent-4.png>) [图4]  
---  
  
## **3\. 部署指南**

以下步骤适用于任何支持 c5.metal 的 AWS Region。开始之前确保本地装好了 `aws` CLI (>= 2.x，需 EKS/EC2/CloudFormation/IAM 权限)、`eksctl` (>= 0.224)、`kubectl` (>= 1.34)、`helm` (>= 3.17) 和 `jq`。

### 第一步：创建 EKS 集群和 c5.metal 节点
    
    
    export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    export REGION=<region-code>
    export CLUSTER_NAME=sandbox-demo
    export K8S_VERSION=1.34
    export NODE_TYPE=c5.metal
    export KARPENTER_VERSION=1.12.1
    export OPENSANDBOX_NS=opensandbox-system
    # 创建 EKS 集群（约 15-20 分钟）
    eksctl create cluster \
      --name ${CLUSTER_NAME} \
      --region ${REGION} \
      --version ${K8S_VERSION} \
      --without-nodegroup
    # 创建 c5.metal 基线节点组（约 5-10 分钟）
    eksctl create nodegroup \
      --cluster ${CLUSTER_NAME} \
      --region ${REGION} \
      --name kata-metal-baseline \
      --node-type ${NODE_TYPE} \
      --nodes 1 --nodes-min 1 --nodes-max 2 \
      --node-volume-size 100 \
      --managed
    # 配置 kubeconfig
    aws eks update-kubeconfig --name ${CLUSTER_NAME} --region ${REGION}
    

### 第二步：部署 Karpenter 及预热备用节点
    
    
    # 关联 OIDC Provider（IRSA 前置条件）
    eksctl utils associate-iam-oidc-provider \
      --cluster ${CLUSTER_NAME} \
      --region ${REGION} \
      --approve
    # 创建 Karpenter Controller IAM Policy
    cat > /tmp/karpenter-policy.json << 'POLICY'
    {
      "Version": "2012-10-17",
      "Statement": [{
        "Sid": "Karpenter",
        "Effect": "Allow",
        "Action": [
          "ec2:CreateFleet", "ec2:CreateLaunchTemplate", "ec2:CreateTags",
          "ec2:DeleteLaunchTemplate", "ec2:DescribeAvailabilityZones",
          "ec2:DescribeImages", "ec2:DescribeInstances", "ec2:DescribeInstanceTypeOfferings",
          "ec2:DescribeInstanceTypes", "ec2:DescribeLaunchTemplates",
          "ec2:DescribeSecurityGroups", "ec2:DescribeSpotPriceHistory",
          "ec2:DescribeSubnets", "ec2:RunInstances", "ec2:TerminateInstances",
          "iam:AddRoleToInstanceProfile", "iam:CreateInstanceProfile",
          "iam:DeleteInstanceProfile", "iam:GetInstanceProfile",
          "iam:ListInstanceProfiles", "iam:RemoveRoleFromInstanceProfile",
          "iam:TagInstanceProfile", "iam:PassRole",
          "pricing:GetProducts", "ssm:GetParameter",
          "eks:DescribeCluster", "sqs:*"
        ],
        "Resource": "*"
      }]
    }
    POLICY
    
    aws iam create-policy \
      --policy-name "KarpenterControllerPolicy-${CLUSTER_NAME}" \
      --policy-document file:///tmp/karpenter-policy.json
    # 创建 Karpenter IRSA
    eksctl create iamserviceaccount \
      --cluster ${CLUSTER_NAME} \
      --region ${REGION} \
      --name karpenter \
      --namespace kube-system \
      --attach-policy-arn "arn:aws:iam::${AWS_ACCOUNT_ID}:policy/KarpenterControllerPolicy-${CLUSTER_NAME}" \
      --approve
    # 节点角色
    aws iam create-role \
      --role-name "KarpenterNodeRole-${CLUSTER_NAME}" \
      --assume-role-policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}'
    for POLICY in AmazonEKSWorkerNodePolicy AmazonEKS_CNI_Policy \
      AmazonEC2ContainerRegistryReadOnly AmazonSSMManagedInstanceCore; do
      aws iam attach-role-policy \
        --role-name "KarpenterNodeRole-${CLUSTER_NAME}" \
        --policy-arn "arn:aws:iam::aws:policy/${POLICY}"
    done
    # 允许 Karpenter 节点加入集群
    eksctl create iamidentitymapping \
      --cluster ${CLUSTER_NAME} \
      --region ${REGION} \
      --arn "arn:aws:iam::${AWS_ACCOUNT_ID}:role/KarpenterNodeRole-${CLUSTER_NAME}" \
      --username system:node:{{EC2PrivateDNSName}} \
      --group system:bootstrappers --group system:nodes
    # 标记子网（供 EC2NodeClass 的 subnetSelectorTerms 发现）
    for SUBNET_ID in $(aws eks describe-cluster --name ${CLUSTER_NAME} \
      --region ${REGION} --query 'cluster.resourcesVpcConfig.subnetIds' \
      --output text); do
      aws ec2 create-tags --resources ${SUBNET_ID} \
        --tags Key=karpenter.sh/discovery,Value=${CLUSTER_NAME} --region ${REGION}
    done
    # 标记集群安全组（供 EC2NodeClass 的 securityGroupSelectorTerms 发现）
    # 注意：必须给安全组也打标签，否则 Karpenter 启动新节点时会因找不到匹配的安全组而失败
    CLUSTER_SG=$(aws eks describe-cluster --name ${CLUSTER_NAME} \
      --region ${REGION} --query 'cluster.resourcesVpcConfig.clusterSecurityGroupId' \
      --output text)
    aws ec2 create-tags --resources ${CLUSTER_SG} \
      --tags Key=karpenter.sh/discovery,Value=${CLUSTER_NAME} --region ${REGION}
    # 处理 ServiceAccount 所有权（IRSA 已创建 SA，Helm 需要接管）
    kubectl -n kube-system annotate serviceaccount karpenter \
      meta.helm.sh/release-name=karpenter \
      meta.helm.sh/release-namespace=kube-system --overwrite 2>/dev/null
    kubectl -n kube-system label serviceaccount karpenter \
      app.kubernetes.io/managed-by=Helm --overwrite 2>/dev/null
    # 安装 Karpenter
    helm upgrade --install karpenter oci://public.ecr.aws/karpenter/karpenter \
      --namespace kube-system \
      --version ${KARPENTER_VERSION} \
      --set "settings.clusterName=${CLUSTER_NAME}" \
      --set replicas=1 \
      --wait --timeout 120s
    

创建 EC2NodeClass 和 NodePool：
    
    
    cat <<EOF | kubectl apply -f -
    apiVersion: karpenter.k8s.aws/v1
    kind: EC2NodeClass
    metadata:
      name: kata-metal
    spec:
      role: "KarpenterNodeRole-${CLUSTER_NAME}"
      amiSelectorTerms:
        - alias: al2023@latest
      subnetSelectorTerms:
        - tags:
            karpenter.sh/discovery: "${CLUSTER_NAME}"
      securityGroupSelectorTerms:
        - tags:
            karpenter.sh/discovery: "${CLUSTER_NAME}"
      blockDeviceMappings:
        - deviceName: /dev/xvda
          ebs:
            volumeSize: 100Gi
            volumeType: gp3
            deleteOnTermination: true
    EOF
    
    cat <<'EOF' | kubectl apply -f -
    apiVersion: karpenter.sh/v1
    kind: NodePool
    metadata:
      name: kata-metal-burst
    spec:
      template:
        metadata:
          labels:
            katacontainers.io/kata-runtime: "true"
            node-role: "kata-burst"
        spec:
          requirements:
            - key: node.kubernetes.io/instance-type
              operator: In
              values: ["c5.metal"]
            - key: karpenter.sh/capacity-type
              operator: In
              values: ["on-demand"]
          nodeClassRef:
            group: karpenter.k8s.aws
            kind: EC2NodeClass
            name: kata-metal
          expireAfter: 720h
      limits:
        cpu: "480"
      disruption:
        consolidationPolicy: WhenEmptyOrUnderutilized
        consolidateAfter: 30m
    EOF
    

部署 Pause Pod 预热备用节点：
    
    
    cat <<'EOF' | kubectl apply -f -
    apiVersion: scheduling.k8s.io/v1
    kind: PriorityClass
    metadata:
      name: node-warm-placeholder
    value: -1
    globalDefault: false
    ---
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: node-warmer
      namespace: kube-system
    spec:
      replicas: 1
      selector:
        matchLabels:
          app: node-warmer
      template:
        metadata:
          labels:
            app: node-warmer
        spec:
          priorityClassName: node-warm-placeholder
          terminationGracePeriodSeconds: 0
          affinity:
            nodeAffinity:
              requiredDuringSchedulingIgnoredDuringExecution:
                nodeSelectorTerms:
                - matchExpressions:
                  - key: karpenter.sh/nodepool
                    operator: Exists
          tolerations:
            - operator: Exists
          containers:
          - name: pause
            image: registry.k8s.io/pause:3.10.2
            resources:
              requests:
                cpu: "80"
                memory: "160Gi"
    EOF
    

修改 `replicas` 可调整预热节点数量，每个 replica 对应一台 c5.metal 热备。

### 第三步：安装 Kata Containers 运行时
    
    
    KATA_VERSION=3.31.0
    mkdir -p /tmp/kata-chart/templates
    for f in Chart.yaml values.yaml; do
      curl -fsSL "https://raw.githubusercontent.com/kata-containers/kata-containers/${KATA_VERSION}/tools/packaging/kata-deploy/helm-chart/kata-deploy/$f" \
        -o /tmp/kata-chart/$f
    done
    for f in _helpers.tpl kata-deploy.yaml kata-rbac.yaml runtimeclasses.yaml; do
      curl -fsSL "https://raw.githubusercontent.com/kata-containers/kata-containers/${KATA_VERSION}/tools/packaging/kata-deploy/helm-chart/kata-deploy/templates/$f" \
        -o /tmp/kata-chart/templates/$f 2>/dev/nulldone
    
    sed -i '/^dependencies:/,/condition:.*enabled$/d' /tmp/kata-chart/Chart.yaml
    
    helm install kata-deploy /tmp/kata-chart \
      --namespace kube-system \
      --set k8sDistribution=k8s \
      --set node-feature-discovery.enabled=false
    # 等待就绪（约 3-5 分钟，下载约 2GB 运行时）
    kubectl -n kube-system wait --for=condition=Ready pod -l name=kata-deploy --timeout=600s
    
    kubectl get runtimeclass kata-clh
    

### 第四步：安装 OpenSandbox Controller
    
    
    git clone https://github.com/alibaba/OpenSandbox.git /tmp/opensandbox-repo
    
    helm install opensandbox-controller \
      /tmp/opensandbox-repo/kubernetes/charts/opensandbox-controller \
      --namespace ${OPENSANDBOX_NS} \
      --create-namespace \
      --set controller.snapshot.containerdSocketPath="" \
      --wait --timeout 120s
    # 验证
    kubectl get crd | grep sandbox# 预期输出：
    #   batchsandboxes.sandbox.opensandbox.io
    #   pools.sandbox.opensandbox.io
    #   sandboxsnapshots.sandbox.opensandbox.io
    

### 第五步：创建沙箱池并验证
    
    
    cat <<'EOF' | kubectl apply -f -
    apiVersion: sandbox.opensandbox.io/v1alpha1
    kind: Pool
    metadata:
      name: kata-clh-pool
      namespace: opensandbox-system
    spec:
      template:
        spec:
          runtimeClassName: kata-clh
          containers:
          - name: sandbox
            image: busybox:latest
            command: ["sh", "-c", "while true; do sleep 3600; done"]
            resources:
              requests:
                cpu: 100m
                memory: 128Mi
              limits:
                cpu: 500m
                memory: 256Mi
      capacitySpec:
        bufferMin: 5
        bufferMax: 10
        poolMin: 5
        poolMax: 50
    EOF
    
    # 等待池预热
    for i in $(seq 1 60); do
      AVAIL=$(kubectl -n opensandbox-system get pool kata-clh-pool \
        -o jsonpath='{.status.available}' 2>/dev/null)
      [ "${AVAIL}" -ge 5 ] 2>/dev/null && echo "Pool ready: available=${AVAIL}" && break
      sleep 5
    done
    

验证端到端流程：
    
    
    cat <<'EOF' | kubectl apply -f -
    apiVersion: sandbox.opensandbox.io/v1alpha1
    kind: BatchSandbox
    metadata:
      name: demo-task
      namespace: opensandbox-system
    spec:
      replicas: 1
      poolRef: kata-clh-pool
    EOF
    
    kubectl -n opensandbox-system wait --for=jsonpath='{.status.ready}'=1 \
      batchsandbox/demo-task --timeout=10s
    
    POD=$(kubectl -n opensandbox-system get batchsandbox demo-task \
      -o jsonpath='{.metadata.annotations.sandbox\.opensandbox\.io/alloc-status}' \
      | python3 -c "import json,sys; print(json.load(sys.stdin)['pods'][0])")
    
    kubectl -n opensandbox-system exec ${POD} -- sh -c '
      echo "Kernel: $(uname -r)"
      echo "Hostname: $(hostname)"
      echo "Hello from isolated sandbox!"
    '
    
    kubectl -n opensandbox-system delete batchsandbox demo-task
    

### 常见问题排查

  * IRSA 创建失败（no IAM OIDC provider）：需先执行 `eksctl utils associate-iam-oidc-provider --cluster ${CLUSTER_NAME} --region ${REGION} --approve`
  * Pod 卡在 ContainerCreating：kata-deploy 仍在新节点安装中，等 2-3 分钟
  * Controller CrashLoopBackOff（containerd-socket-path）：日志含 `flag provided but not defined: -containerd-socket-path`，需添加 `--set controller.snapshot.containerdSocketPath=""`
  * Karpenter ServiceAccount 冲突：若安装报错 `cannot re-use a name that is still in use`，先执行 `kubectl annotate sa karpenter -n kube-system meta.helm.sh/release-name=karpenter`
  * Karpenter 不启动新节点 / EC2NodeClass `SecurityGroupsReady=False`：确认子网和集群安全组都已打 `karpenter.sh/discovery` 标签（最常见的疏漏是只标了子网、漏标安全组）。可用 `kubectl get ec2nodeclass kata-metal -o jsonpath='{.status.conditions}'` 查看 `SubnetsReady` / `SecurityGroupsReady` 是否都为 True
  * ListInstanceProfiles 权限错误：确认 Karpenter IRSA 的 IAM Policy 包含 `iam:ListInstanceProfiles` 权限
  * c5.metal 配额不足：在 Service Quotas 申请提额
  * Pause Pod 调度到基线节点：检查 nodeAffinity 是否要求 `karpenter.sh/nodepool Exists`



## **4\. 关键性能数据**

所有测试从集群内部 Pod 执行，消除外部网络延迟影响。

### 4.1 预热池申领延迟

从预热池 claim 一个沙箱的端到端延迟平均在 230ms 左右，批量申领 10 个沙箱时平均降到 140ms 左右。这个延迟主要由四部分组成：K8s API 写入 BatchSandbox 约 50ms，Controller 接收到 Watch 事件并触发 Reconcile 约 30ms，Pool 查询加 Pod Label 更新约 100ms，最后 Status 更新和客户端检测约 47ms。对于大多数 Agent 平台来说，230ms 左右 的沙箱获取延迟已经比用户感知的网络 RTT 还低了。

### 4.2 冷启动延迟

不走预热池、从零拉起一个 microVM Pod 的冷启动延迟平均约 3 秒左右。这 3 秒包含了 containerd 调用 kata-runtime shim、Cloud Hypervisor 拉起虚拟机、Guest Kernel 启动、kata-agent 就绪的全过程。虽然比预热池慢了一个数量级，但相比传统 VM 的分钟级启动，依然是个很大的进步。实际使用中，只有在预热池耗尽且预热节点也被用完时才会走到这条路径。

### 4.3 节点扩容

Karpenter 从发出 CreateFleet 到新的 c5.metal 达到 Node Ready 大约在 1 分钟以内。之后 kata-deploy DaemonSet 还需要约 3-5 分钟来下载并安装 Kata runtime 的二进制和 rootfs（约 2GB）。端到端来看，从触发扩容到新节点上的 Kata Pod 可以运行，总时长约 4-8 分钟。这也是为什么我们需要 Pause Pod 预热机制——如果预热节点已经就绪，抢占 Pause Pod 后 Pool Pod 在约 3 秒左右就能 Running，完全绕过了裸金属节点的慢启动。

在压测场景下（一次性创建 20 replicas 触发 1→4 节点扩容），整个扩容过程约 5 分钟完成，Pool 回填到 bufferMin 在 10 秒内自动完成。

## **5\. 总结**

本文介绍了一种 AI Agent 的沙箱方案：用于多租户 AI Agent 平台（不同用户的会话需要完全隔离）、编程助手的代码执行沙箱（OpenClaw、Hermes 之类）、合规环境下需要可审计的工作负载隔离，以及任何需要规模化执行不可信代码的场景。

选 Cloud Hypervisor 而不是 QEMU，因为它更轻量（Rust + seccomp）、专为云原生设计。通过预热池 + Pause Pod 抢占来弥合裸金属慢启动和 Agent 需要秒级响应之间的矛盾。用 OpenSandbox CRD 做声明式的沙箱管理，和 Kubernetes 原生工作流保持一致。

待 Karpenter 对 AWS 第 8 代 EC2 的嵌套虚拟化支持稳定以后，也可以考虑使用普通 8 代 EC2 代替裸金属服务器，实现更高的性价比。

**下一步行动：**

**相关产品：**

  * [Amazon EKS](<https://aws.amazon.com/cn/eks/?p=bl_pr_eks_l=1>) — 托管式 Kubernetes 服务
  * [Amazon EC2](<https://aws.amazon.com/cn/ec2/?p=bl_pr_ec2_l=2>) — 安全且可调整大小的计算容量
  * [Amazon Batch](<https://aws.amazon.com/cn/batch/?p=bl_pr_batch_l=3>) — 完全托管式批处理
  * [Amazon IAM](<https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=4>) — 身份管理和访问权限
  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=5>) — 用于构建生成式人工智能应用程序和代理的端到端平台



**相关文章：**

  * [使用 Karpenter 和 HAMi 实现 GPU 分片和动态扩缩容](<https://aws.amazon.com/cn/blogs/china/using-karpenter-and-hami-for-gpu-fractional-sharing-and-dynamic-scaling/?p=bl_ar_l=1>)
  * [基于 Amazon EKS 和 Graviton 构建多租户 AI Agent 平台：OpenClaw on Kubernetes 实践](<https://aws.amazon.com/cn/blogs/china/build-multi-tenant-ai-agent-on-eks-graviton-openclaw-k8s-practice/?p=bl_ar_l=2>)
  * [一种基于Web访问的Kiro CLI 共享访问实现](<https://aws.amazon.com/cn/blogs/china/based-on-web-kiro-cli-share-implement/?p=bl_ar_l=3>)
  * [当 Kiro 遇上 OpenClaw：AI Agent 双向协作的实践探索](<https://aws.amazon.com/cn/blogs/china/kiro-openclaw-ai-agent-practice-explore/?p=bl_ar_l=4>)
  * [给 Openclaw瘦身-利用Nova MME 和 S3 Vector实现Skill按需召回](<https://aws.amazon.com/cn/blogs/china/openclaw-leveraging-nova-mme-s3-vector-implement-skill/?p=bl_ar_l=5>)



## **6\. 参考资料**

  * [在Amazon EKS上部署Kata Containers的最佳实践](<https://aws.amazon.com/cn/blogs/china/best-practices-for-deploying-kata-containers-on-amazon-eks/>)
  * [基于Kata Containers的企业级沙箱实践](<https://aws.amazon.com/cn/blogs/china/best-practices-for-deploying-kata-containers-on-amazon-eks/>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 张盼富

亚马逊云科技解决方案架构师，从业十三年，先后经过历云计算、供应链金融、电商等多个行业，担任过高级开发、架构师、产品经理、开发总监等多种角色，有丰富的大数据应用与数据治理经验。加入亚马逊云科技后，致力于通过大数据+AI 技术，帮助企业加速数字化转型。

### 毛郸榕

AWS解决方案架构师团队经理，目前负责AWS Web3 SA技术团队，毕业于北京航空航天大学硕士，香港中文大学EMBA。在大规模并发架构、系统稳定性、DevOps、自动化、GenAI等领域有着广泛的设计与实践经验，并在Web3、撮合系统设计、区块链领域的技术方案有着深入研究。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
