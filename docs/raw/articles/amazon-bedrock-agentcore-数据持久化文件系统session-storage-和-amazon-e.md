---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/amazon-bedrock-agentcore-file-system-session-storage-amazon-efs-s3-files
ingested: 2026-07-07
feed_name: AWS China Blog
source_published: 2026-07-07
sha256: 65081fb08c0c63390d3072739523c4f329ec0e4ee7e344df023fccef75ca1ef7
---

# Amazon Bedrock AgentCore 数据持久化文件系统：Session Storage 和 Amazon EFS / S3 Files

摘要：AgentCore 提供的三种持久化文件系统——Managed Session Storage、Amazon EFS、Amazon S3 Files，从按用户私有，到多方共享，再到文件与对象两端访问，覆盖了 Agent 的持久化需求，会话结束也不会丢失数据。

**目录**

01 一、前言

02 二、数据持久化文件系统方案

03 三、使用场景

04 四、性能测试

05 五、对比方案

06 六、实际应用

07 七、总结

* * *

## **一、前言**

Agent正在个人和企业应用快速渗透，[Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/>)提供了企业级快速扩展的Agent运行平台，多种Agent场景运行在其之上，例如电商数据搜索、个人助手、广告投放、电商推荐、量化交易等等。

通常Agent不会运行太久，任务结束，会话也随之终止。Agent运行在沙盒里，一般是微虚拟机，隔离安全级别很高，无状态会话终止，所有数据随之清空。但是，有些场景下，沙盒会话状态需要保持。例如，长时间运行任务，超过沙盒最长保持时间，需要重新运行完全一样的沙盒环境。这就需要使用沙盒快照恢复功能，保存沙盒文件系统所有数据，以及内存状态，创建新会话时从快照恢复成完全一样的沙盒。此种场景适合保持任务状态的会话。还有另外一种场景，无需保存所有数据和内存，只需要持久化保存应用数据，例如生成的代码，或者分析结果，数据需要保存在Agent会话以外的地方，在重新创建会话后可以从持久化数据读取即可。

数据持久化有几种选择：

  * 数据库



通常使用Key Value NoSQL，结构灵活，满足快速读写需求。但是，对于长代码，通常使用文本形式保存，图片视频也不适合保存在数据库，数据库并非为此而设计。

  * 外部记忆



例如[Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) Agentcore Memory，mem0开源记忆组件，适合保存会话历史、用户偏好、会话摘要、情节记忆。不同Agent会话可以从记忆中获取之前保存数据，以实现用户个性化等功能。记忆数据结构类似以下：
    
    
    /strategy/{memoryStrategyId}/actor/{actorId}/session/{sessionId}/
    

对于大的文本或者图片视频，这种目录结构的数据组织方式不能完全满足需求。

  * 持久化文件系统



每个microVM沙盒就是个小型虚拟机，有自己的操作系统，可以读写microVM文件系统。但是，随着会话结束，沙盒销毁，microVM会话的文件也被清除。因此，Agent需要外部文件系统实现持久化存储。Agent需要POSIX文件系统标准接口，使用通用文件读写工具，像本地文件一样操作。外部文件系统的通过挂接点，挂接到Agent MicroVM，Agent执行文件操作命令，例如Linux命令cat, echo，访问位于外部持久化存储的文件。基于文件系统的原生访问方式，无需经过大模型，速度极大提高，还无需Token消耗。

## **二、数据持久化文件系统方案**

Amazon Bedrock Agentcore支持多种持久化文件系统，Managed Session Storage, [Amazon EFS](<https://aws.amazon.com/cn/efs/>)和S3 Files。

  * 托管 Session Storage



Manged Session Storage 是完全托管的Agentcore Runtime持久化存储，AgentCore 透明地处理所有存储操作，每个会话使用独立的持久化存储空间，即使Agentcore Runtime Session超时或者关闭，Session Storage的文件仍然存在。下次Session启动，使用相同的Session ID，就能访问同样的托管存储。

  * 自定义文件系统 Amazon EFS & S3 Files



[Amazon S3](<https://aws.amazon.com/cn/s3/>) Files 是 S3 推出的原生文件系统能力，把 S3 桶以标准 NFS的形式挂载出来，让应用像读写本地文件一样操作 S3上的对象。它最大的特点是双向同步：通过文件接口写入的内容会自动同步到后端 S3 桶，桶里的对象也能在挂载点上看到，文件与 S3 API两端皆可访问。适合写少读多、追加为主的数据，如共享脚本、配置模板、工具二进制——它们既要被 Agent 当文件直接读写，又要能在 Agent之外用 S3 API 统一管理。

Amazon EFS 是全托管的弹性 NFS 文件系统，挂载到主机或容器后，与普通 NFS 完全一致，提供完整的 POSIX语义（目录、硬链接、符号链接、advisory file locking），支持多个客户端并发读写同一份数据，容量按用量弹性伸缩、无需预置。相比 S3 Files，EFS在随机读写和频繁读写场景下表现更稳，适合需要多方共享且高并发读写的数据，如共享数据集、模型权重、知识库以及多 Agent协作的工作区。

AgentCore Runtime现在支持 Bring-Your-Own File System：可以将 Amazon S3 Files 或 Amazon EFS使用 access point 直接挂载到 Agentcore Runtime，Agent 启动后通过标准文件操作读写——无需自定义 mount 代码、无需特权容器、无需在 Agent 启动前编排下载流程。

与 managed session storage 的定位区分：

  * managed session storage 解决单 session 内的文件持久化；
  * BYO file system 解决跨 session、跨 microVM 生命周期、跨多个 Agent 的共享数据需求——如 skills 库、prompt 模板、参考数据集、知识库、项目文件。



两种挂载方式：

1\. S3 Files：通过文件操作和 S3 API 双路访问，变更自动同步到 S3 bucket；

2\. EFS access point：共享 NFS 文件系统。两者均提供亚毫秒延迟和 NFS close-to-open 一致性。

实际应用中，根据Agent场景进行选择。例如，AI代码场景，需要快速把代码持久化，可以选择更高性能EFS。对于图片和视频文件，相比性能，需要更低存储成本，可以考虑S3。如果需要更高性能，但是又需要较低成本，也可以考虑S3 + FSx for Lustre 高性能缓存文件系统，此文件系统一般用于大规模数据训练等场景。

## **三、使用场景**

三种文件系统对应不同的需求，选型主要看两点：数据是私有还是共享，是否需要 VPC。下表先做总览，随后分场景展开说明。

维度 | Session Storage | Amazon EFS | Amazon S3 Files  
---|---|---|---  
隔离性 | 按 session 私有 | 多方共享 | 多方共享  
是否需要 VPC | 不需要 | 需要 | 需要  
持久化 | 会话关闭仍然保持数据 | 永久 | 永久，双向同步 S3  
适合 | 私有项目/代码/会话状态 | 共享数据集/工具/多Agent协作 | 文件+S3双路、写少读多  
  
### 3.1 场景一：C 端大并发

先看一个典型场景。 C 端 AI 编码产品，线上同时有几万名用户，每个用户都有自己的工作区——源码、依赖、`.git` 目录，彼此不可见，会话停止后下次还能继续。这类私有持久化，容易想到的做法是用 EFS：为每个用户分配一个 Access Point，各自独立的 rootDirectory，再配一个独立的 POSIX UID，在 NFS 层面进行隔离。

但这条路并不可行。EFS 的 Access Point 每个文件系统约有 10000 个上限，超过一万用户无法容纳。即便不计成本，AgentCore 的文件系统配置是绑定在 Runtime 上、而非按 session 生效的，同一个 Runtime 下所有 session 共享同一组挂载，无法在调用时按用户动态切换 Access Point。若进一步改为每个用户单独一个 Runtime，则要管理几万个 Runtime，运维成本与冷启动开销都难以承受。

因此，C 端大并发的私有持久化，更合适的选择是 Managed Session Storage。它以 `runtimeSessionId` 天然隔离，一个用户对应一个 session id 即一份独立存储，由服务端托管，无需 VPC，也无需维护 Access Point，可弹性扩展到任意用户规模。配置仅需一行：
    
    
    --filesystem-configurations '[{"sessionStorage":{"mountPath":"/mnt/workspace"}}]'
    

### 3.2 场景二：多租户与团队共享

另一类需求恰好相反：数据本身就需要被多个 session、多个 Agent，乃至外部业务系统共同读写，例如共享数据集、知识库、团队协作工作区、公共工具库。这类场景应当使用 BYO 文件系统。EFS 提供完整 POSIX 语义与高并发读写，适合频繁读写的协作数据；S3 Files 在共享之外还能与 S3 桶双向同步，文件接口与 S3 API 两端皆可访问，更适合写少读多的脚本、配置与工具。

### 3.3 场景三：混合存储

实际项目中，私有与共享往往并存。以一个多用户编码 Agent 为例（代码见 [github.com/milan9527/agentcorefilesystem](<https://github.com/milan9527/agentcorefilesystem>)）：用户的项目源码私有、需隔离，团队参考数据集需共享读写，公共脚本与工具则希望文件接口与 S3 API 两端皆可维护。这三类数据恰好对应三种文件系统，可在同一个 Runtime 上一次挂载——私有项目放 `/mnt/workspace`（Session Storage），共享数据集放 `/mnt/datasets`（EFS），公共工具放 `/mnt/tools`（S3 Files）。下图为这种混合模式的参考架构。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/07/amazon-bedrock-agentcore-file-system-session-storage-amazon-efs-s3-files-1.png>) [图1 AgentCore Runtime 混合持久化文件系统参考架构]  
---  
  
实现上只需在创建（或更新）Runtime 时，把三类挂载一并写进 `filesystemConfigurations`。需要注意，BYO 文件系统（EFS、S3 Files）要求 Runtime 运行在 VPC 模式下，而 Session Storage 不需要；当两类混用时，整个 Runtime 以 VPC 模式部署即可。配置如下：
    
    
    import boto3
    client = boto3.client("bedrock-agentcore-control", region_name="us-east-1")
    
    client.create_agent_runtime(
        agentRuntimeName="coding-agent",
        roleArn="arn:aws:iam::<account>:role/AgentExecutionRole",
        networkConfiguration={                       # BYO 文件系统要求 VPC 模式
            "networkMode": "VPC",
            "networkModeConfig": {
                "subnets": ["<subnet-1>", "<subnet-2>"],
                "securityGroups": ["<sg-id>"]}},
        agentRuntimeArtifact={"containerConfiguration": {"containerUri": "<ecr-image>"}},
        filesystemConfigurations=[
            {"sessionStorage":     {"mountPath": "/mnt/workspace"}},   # 私有，按 session 隔离
            {"efsAccessPoint":     {"accessPointArn": "<efs-ap-arn>",
                                    "mountPath": "/mnt/datasets"}},     # 共享数据集
            {"s3FilesAccessPoint": {"accessPointArn": "<s3files-ap-arn>",
                                    "mountPath": "/mnt/tools"}},        # 共享工具，双向同步 S3
        ],
    )
    

Runtime 启动后，三个挂载点对 Agent 而言就是三个普通目录，行为差异完全被屏蔽。在 session 内执行 `df -h` 可以看到它们已分别挂好：
    
    
    $ df -h
    Filesystem        Size  Used Avail Use% Mounted on
    /dev/loop0        8.8G  789M  7.6G  10% /
    127.0.0.1:/export 1.0G     0  1.0G   0% /mnt/workspace   # Session Storage
    127.0.0.1:/       8.0E     0  8.0E   0% /mnt/datasets    # EFS
    127.0.0.1:/       8.0E     0  8.0E   0% /mnt/tools       # S3 Files
    

三者的读写语义各不相同：用户 A 写到 `/mnt/workspace` 的文件，用户 B 看不到（Session Storage 按 session 隔离）；写到 `/mnt/datasets` 的文件，其他用户立刻可见（EFS 共享）；写到 `/mnt/tools` 的文件除共享外还会同步回 S3 桶，可在 Agent 之外用 S3 API 管理。Agent 代码无需关心背后是哪种存储，按约定写到对应目录即可。需要提醒的是，EFS 与 S3 Files 共享不做 session 隔离；若共享层也需按租户隔离，可参考本文实际应用部分基于 bind mount 的做法。

## **四、性能测试**

选型的主要依据是隔离与共享，性能并非关键矛盾——实测下来三种文件系统都不慢。测试基于现成的 `InvokeAgentRuntimeCommand` 数据面 API，将一个纯标准库实现的引擎上传到 session 内运行，不修改镜像、不重新部署。block size 取两档：1 MiB 衡量带宽，4 KB 衡量随机 IOPS，每档均覆盖顺序读、随机读、顺序写、随机写四类负载。

### 4.1 1 MiB 大块：吞吐量

单位 MiB/s（1 MiB 块下 IOPS 数值与 MiB/s 相同）。

文件系统 | seq read | rand read | seq write | rand write  
---|---|---|---|---  
Session Storage | 14853 | 12629 | 6544 | 6170  
Amazon EFS | 10940 | 9542 | 5146 | 4678  
S3 Files | 8600 | 7919 | 5938 | 5205  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/07/amazon-bedrock-agentcore-file-system-session-storage-amazon-efs-s3-files-2.png>) [图2 1 MiB 大块吞吐对比]  
---  
  
1 MiB 大块下，随机写与顺序写水平相当，三者随机写吞吐均在 4.6 至 6.2 GiB/s 区间，Session Storage 最高，EFS 与 S3 Files 紧随其后，差距不大，足以满足代码落盘、结果存储等写入需求。读取方面 Session Storage 因本地直连领先，EFS 居中，S3 Files 略低但完全够用。

### 4.2 4 KB 小块：随机 IOPS

单位 K IOPS，更能反映随机访问能力的差异。

文件系统 | seq read | rand read | seq write | rand write  
---|---|---|---|---  
Session Storage | 903K | 400K | 608K | 416K  
Amazon EFS | 802K | 394K | 608K | 415K  
S3 Files | 765K | 199K | 605K | n/a  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/07/amazon-bedrock-agentcore-file-system-session-storage-amazon-efs-s3-files-3.png>) [图3 4 KB 小块 IOPS 对比]  
---  
  
4 KB 下顺序读写三者依然接近；随机读 Session Storage 与 EFS 均在 40 万 IOPS 上下，S3 Files 约为一半（20 万左右），仍可使用。表中 S3 Files 随机写标记为 n/a：在对单个大文件持续高强度随机写、并开启强制刷盘的极端压测中，S3 Files 会因与 S3 桶双向同步刷新底层 NFS 句柄而中断。解决办法：重随机写负载交给 Session Storage 或 EFS，S3 Files 用于共享脚本、配置与工具。

### 4.3 延迟

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/07/amazon-bedrock-agentcore-file-system-session-storage-amazon-efs-s3-files-4.png>) [图4 读延迟 p50 / p99]  
---  
  
延迟同样接近，三者 p50 均在 0.12ms 以内，p99 在 0.2ms 以内。综合来看，对于大部分场景，三种文件系统都可以满足性能需求，主要仍是考虑隔离与共享。

## **五、对比方案**

将隔离性、是否需要 VPC、性能与适用场景综合起来，选型可以归纳为三条：

  1. 私有、按用户或会话隔离、C 端大并发、需要高随机写，选 Managed Session Storage；
  2. 跨 session、跨 Agent 共享，需要完整 POSIX 与高随机写，选 Amazon EFS；
  3. 需要文件与 S3 API 两端访问、写少读多，选 Amazon S3 Files。三者也可同时挂载，私有与共享并存。



## **六、实际应用**

### 6.1 应用一：基于 EFS 的沙箱数据持久化与多租户隔离

下面介绍一个真实的客户案例。客户在自有的 Kubernetes 平台上运行 Agent 沙箱，数据此前已写在共享文件系统上。现在要将沙箱迁移到 AgentCore Runtime，有三个要求：

  * 业务 Pod 与 Agent Runtime 共享同一份文件，Pod 准备输入、Agent 写回输出，双向可见，并支持并发读写；
  * 不同租户的 session 之间必须隔离，A 租户不能访问 B 租户的文件；
  * 原有业务已按 NFS 的目录方式构建，重构代价过大，迁移应尽量贴合既有的「共享文件系统 + 目录划分」模式。



最理想的方案是由 Session Storage 负责隔离、EFS 负责共享。但 Session Storage 是私有的，业务 Pod 无法访问，第一条要求即无法满足。因此隔离必须在 EFS 之上自行实现。对几种方案逐一做了权衡。

方案 A：每租户一套（EFS Access Point + Runtime）。为每个租户单独创建一个 Access Point，配置各自的 rootDirectory，并绑定一个独立 Runtime，隔离最为彻底，落到 NFS 层面。但每个 Runtime 都需自行维护一个 Access Point，租户增多后会触及 EFS Access Point 上限，运维与冷启动成本也难以控制，规模扩大后不可持续。

方案 B：单 EFS + 单 Access Point + 单 Runtime，隔离在应用层实现（最终采用）。EFS 以单个 Access Point 挂载到 Runtime 根目录，租户数仅受 EFS 容量限制，不受 Access Point 上限约束，扩展性最佳。隔离则借助 AgentCore 的原生特性，并在入口处配合 bind mount 完成。

具体落地分三步（代码见 [github.com/milan9527/AgentcoreMultiTenentsFileSystem](<http://github.com/milan9527/AgentcoreMultiTenentsFileSystem>)）：

  1. 共享。业务 Pod 挂载 EFS 根目录，负责准备与消费数据；Runtime 将同一个 EFS 以单 Access Point 挂载到 `/mnt/shared`，任一方写入，另一方即可见。目录约定为 `tenants/<tenant>/{input,output}/`。
  2. session 隔离，无需额外处理。AgentCore 每个 session 运行在独立的 Firecracker microVM 中，CPU、内存、文件系统彼此独立，属内核级隔离，session 结束即销毁，因此 session 之间天然互不可见。
  3. 租户数据隔离，这是真正要解决的问题。核心在于让单个 session 只能看到本租户的子目录，而非整个 EFS。做法是在 `/invocation` 入口处，根据 payload 中的 `tenant_id` 将对应子目录 bind mount 到 `/workspace`，此后所有操作均被限制在 /workspace 之内。


    
    
    # WorkspaceGuard —— /invocation 入口按 tenant_id 绑定
    mount --bind /mnt/shared/tenants/<tenant_id>  /workspace
    # resolve_path() 校验路径不逃逸 /workspace：
    #   拦截 ../ 路径遍历，拦截 tenant_id 注入，
    #   首次绑定租户后，同一 session 不可再切换到其它租户
    

下图为整体数据流：Pod 写入 input，携带 tenant_id 调用 InvokeAgentRuntime 创建 session，microVM 将本租户子目录 bind mount 到 /workspace，Agent 读取 input、写回 output，Pod 再消费 output。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/07/amazon-bedrock-agentcore-file-system-session-storage-amazon-efs-s3-files-5.png>) [图5 单 EFS + 单 Access Point + bind mount 的多租户隔离架构]  
---  
  
该方案已在真实的 AgentCore 环境中验证通过：

EFS 成功挂载到 /mnt/shared；bind mount 生效（`isolated: true`）；租户 A、B 各自仅能读写自己的 /workspace；路径遍历被拦截（返回 “Path not allowed”）；同一 session 切换租户被拒绝（”Session bound to ‘tenant-A’, cannot switch”）。

实施过程中也积累了几点经验：EFS mount target 的 AZ 需与 Runtime 子网匹配，安全组放通 TCP 2049，执行角色需具备 `elasticfilesystem:ClientMount/ClientWrite` 权限；容器须以 root 运行才能执行 mount –bind；此外须采用 bedrock-agentcore SDK 的 BedrockAgentCoreApp 模式，纯 Flask 无法满足。

### 6.2 应用二：Claude Agent SDK 的文件持久化存储

以Claude Agent SDK 的文件存储机制为例，说明 Agent 的持久化数据放在 EFS。这是一个证券分析 Agent （代码见<https://github.com/milan9527/SecuritiesAgent> ），它基于 claude-agent-sdk 的 `query()` 运行在 AgentCore Runtime 上。

Claude Agent SDK 管理文件。Claude Agent SDK 并不把全部上下文塞进大模型，而是落到文件系统上，主要有三类：skill 存放在 `.claude/skills/<name>/SKILL.md`，按需加载（progressive disclosure）；session 的对话历史写入 `CLAUDE_CONFIG_DIR`，用于续聊；workspace 是 Agent 的工作目录，生成的代码、分析结果、中间文件都在其中。SDK 通过几个选项将它们串联起来：
    
    
    # orchestrator_agent.py —— 构建 ClaudeAgentOptions
    opts = dict(
        model=model_id,
        system_prompt=system_prompt,
        cwd=project_cwd,          # 指向 skills root，便于发现 .claude/skills
        add_dirs=[workspace],     # 将用户的持久化 workspace 纳入可读写目录
        setting_sources=["project"],
        skills="all",             # 加载全部 skill（含运行时新增）
        permission_mode="bypassPermissions",
    )
    async for message in query(prompt=prompt, options=ClaudeAgentOptions(**opts)):
        ...
    

skill 的根目录与 workspace 都来自同一个环境变量，运行时直接指向 EFS 挂载点即可：
    
    
    def resolve_skills_root():
        return os.environ.get("AGENTCORE_SKILLS_ROOT", "").strip() or _BAKED_SKILLS_ROOT
    
    # 首次启动将内置 skill seed 到 EFS，已存在的文件跳过，不覆盖用户改动
    def seed_skills_to(root):
        dst = os.path.join(root, ".claude", "skills")   # /mnt/skills/.claude/skills
    

这几类数据适合放在 EFS 。

  * 需要跨 session、跨 Agent 共享并长期保留——运行时导入或 AI 生成的 skill，后续所有 session、所有子 Agent都应能复用，因此必须放在 microVM 生命周期之外的共享文件系统上。Session Storage 按 session 私有，无法满足跨 Agent 共享，而 EFS 天然支持多方共享与永久持久。
  * 标准 POSIX 读写——Claude CLI 与 SDK 以普通文件 IO 读写 SKILL.md 与 transcript，要求完整 POSIX 语义，EFS 直接满足，Agent 代码无需改动。
  * session 续聊——transcript 写入 EFS 上的 `CLAUDE_CONFIG_DIR` 后，代码通过 `get_session_info()` 判断走 resume 续接历史还是新建 session，历史不会随 microVM 销毁而丢失。



配置上，将 EFS Access Point 挂载到 `/mnt/skills`，再用环境变量指向它：
    
    
    filesystemConfigurations=[{
       "efsAccessPoint": {
          "accessPointArn": "arn:aws:elasticfilesystem:...:access-point/fsap-056c4a9dac04b3e6c",
          "mountPath": "/mnt/skills"}}]
    # 容器环境变量： AGENTCORE_SKILLS_ROOT=/mnt/skills
    

容器以非 root（uid 1000）运行。一方面 Claude CLI 拒绝 root 危险权限 `--dangerously-skip-permissions`，另一方面 uid 1000 恰好与 EFS Access Point 的 POSIX 用户（1000:1000）对齐，确保写入文件的归属正确。

## **七、总结**

AgentCore 提供的三种持久化文件系统——Managed Session Storage、Amazon EFS、Amazon S3 Files，从按用户私有，到多方共享，再到文件与对象两端访问，覆盖了 Agent 的持久化需求，会话结束也不会丢失数据。性能上三者均表现良好，按场景选择即可：

  * C 端大并发选 Session Storage，无需为每个用户单独管理，避免触及 Access Point 上限；
  * 多租户与团队共享选 EFS；
  * 写少读多且需与 S3 打通的场景选 S3 Files；
  * 必要时三者同时挂载。再配合 bind mount 等手段，还能在共享的 EFS 之上实现租户级隔离。



无论哪种业务场景，都可以让 Agent 像读写本地文件一样，安全、高效地使用持久化存储。

**下一步行动：**

**相关产品：**

  * [Amazon EFS](<https://aws.amazon.com/cn/efs/?p=bl_pr_efs_l=1>) — 弹性文件存储
  * [Amazon S3](<https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=2>) — 适用于 AI、分析和存档的几乎无限的安全对象存储
  * [Amazon VPC](<https://aws.amazon.com/cn/vpc/?p=bl_pr_vpc_l=3>) — 隔离云网络
  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=4>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/?p=bl_pr_bedrock-agentcore_l=5>) — 加快代理投入生产的速度



**相关文章：**

  * [向量存储成本降低 85%：用 Amazon S3 Vectors 构建企业级多平台统一知识库](<https://aws.amazon.com/cn/blogs/china/build-enterprise-grade-multi-platform-unified-knowledge-base-with-amazon-s3-vectors/?p=bl_ar_l=1>)
  * [推出 S3 Files：使 S3 存储桶能够以文件系统形式直接访问](<https://aws.amazon.com/cn/blogs/china/launching-s3-files-making-s3-buckets-accessible-as-file-systems/?p=bl_ar_l=2>)
  * [当 OpenClaw 学会”团队记忆”：一个面向多客户服务的企业级共享记忆系统设计](<https://aws.amazon.com/cn/blogs/china/openclaw-service-enterprise-share-system-design/?p=bl_ar_l=3>)
  * [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第三篇](<https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-3/?p=bl_ar_l=4>)
  * [当 AI Agent 学会”忘记”：Amazon Bedrock AgentCore Memory 的记忆哲学”](<https://aws.amazon.com/cn/blogs/china/when-ai-agents-learn-to-forget-amazon-bedrock-agentcore-memory-philosophy/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

###  章平

 亚马逊云科技数据库架构师。2014 年起就职于亚马逊云科技，先后加入技术支持和解决方案团队，致力于客户业务在云上高效落地。对于各类云计算产品和技术，特别是在数据库和大数据方面，拥有丰富的技术实践和行业解决方案经验。此前曾就职于 Sun，Oracle，Intel 等 IT 企业。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
