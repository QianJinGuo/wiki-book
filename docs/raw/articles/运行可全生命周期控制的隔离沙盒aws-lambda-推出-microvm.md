---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/run-isolated-sandboxes-with-full-lifecycle-control-aws-lambda-introduces-microvms/
ingested: 2026-06-26
feed_name: AWS China Blog
source_published: 2026-06-22T09:06:59Z
sha256: f97b77aec6df4b70d790cdd18a52fa82a5042c71077ed751ce8e97624e3b2a02
---

# 运行可全生命周期控制的隔离沙盒：AWS Lambda 推出 MicroVM

今天，我们宣布推出 AWS Lambda MicroVMs，这是 [AWS Lambda](<https://aws.amazon.com/lambda/>) 中一款全新的无服务器计算基础组件，可让您在隔离的有状态执行环境中运行用户或人工智能生成的代码。您可以获得虚拟机级别的隔离、近乎即时的启动和恢复能力，以及对环境生命周期和状态的直接控制能力，所有这些都无需管理基础设施，也无需积累虚拟化技术方面的复杂专业知识。Lambda MicroVMs 由 [Firecracker](<https://firecracker-microvm.github.io/>) 提供支持，后者同样是轻量虚拟化技术，为每月超 15 万亿次 Lambda 函数调用提供支持。  
  
**为什么客户需要该服务  
**过去几年里，一类新的多租户应用程序快速兴起，这类应用程序均存在统一需求：需要为每一位终端用户分配独立专属执行环境，安全运行应用程序开发者未编写的自定义代码。人工智能编码助手、交互式代码环境、数据分析平台、漏洞扫描器以及运行用户提供的脚本的游戏服务器都符合这种模式。当下想要建立该能力，需要做出艰难的取舍：虚拟机可提供强大的隔离能力，但需要几分钟才能启动。容器可以在几秒钟内启动，但其共享内核架构需要大量的自定义强化才能安全包含不可信的代码。函数即服务针对事件驱动的请求响应工作负载进行了优化，但不适配需要跨用户交互保持环境状态的长时间运行的交互式会话。开发者只有两条路可选：要么在性能与隔离能力之间权衡，要么投入大量工程资源来构建和运行定制虚拟化基础设施，在实现隔离执行的同时保障终端用户的低延迟体验。这需要深厚的专业知识，并且会大量挤占产品核心功能的研发人力。

Lambda MicroVMs 正是为填补这一行业空白打造的。每一台 MicroVM 都为单一终端用户或会话提供独立的隔离环境，该环境可快速启动，在会话期间保留内存与磁盘状态，并在用户离开时自动暂停运行，以降低闲置成本。由于该产品采用支持 AWS Lambda 函数的 Firecracker 轻量化虚拟化技术，因此您可以继承大规模运行该堆栈的服务的成熟运维体系。

**操作演示  
**首先，我导航到 AWS Lambda 控制台，Lambda MicroVMs 现已显示在左侧的导航菜单中。我需要先创建一个 MicroVM 映像。

我将一个 Flask Web 应用程序及其 Dockerfile 打包成一个压缩文件，然后将其上传到 [Amazon Simple Storage Service（Amazon S3）](<https://aws.amazon.com/s3/>)存储桶。

我的 Flask API — app.py
    
    
    import logging
    
    from flask import Flask, jsonify
    
    app = Flask(__name__)
    logging.basicConfig(level=logging.INFO)
    
    
    @app.route("/")
    def hello():
        app.logger.info("Received request to hello world endpoint")
        return jsonify(message="Hello, World!")
    
    
    if __name__ == "__main__":
        app.run(host="0.0.0.0", port=5000)
    

我的 Dockerfile
    
    
    FROM public.ecr.aws/lambda/microvms:al2023-minimal
    RUN dnf install -y python3 python3-pip && dnf clean all
    
    WORKDIR /app
    
    COPY requirements.txt .
    RUN pip install --no-cache-dir -r requirements.txt
    
    COPY app.py .
    
    EXPOSE 5000
    
    CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
    
    

我使用以下命令创建我的 MicroVM 映像。
    
    
    aws lambda-microvms create-microvm-image \
    --code-artifact uri=<path/to/s3/artifact.zip> --name <VM_image_name> \
    --base-image-arn arn:aws:lambda:us-east-1:aws:microvm-image:al2023-1 \
    --build-role-arn <IAM role ARN>

您也可以在 AWS 管理控制台中创建 MicroVM 映像，如上图所示。我运行命令后，Lambda 检索了压缩文件，运行了 Dockerfile，初始化了应用程序，并生成了正在运行的磁盘和内存状态的 Firecracker 快照。在 `/aws/lambda/microvms/<image-name>` 下实时生成流式传输到 [Amazon CloudWatch](<https://aws.amazon.com/cloudwatch/>) 的日志，映像准备就绪时，会以其 [Amazon 资源名称（ARN）](<https://docs.aws.amazon.com/IAM/latest/UserGuide/reference-arns.html>)和版本号显示在控制台中。
    
    
    aws lambda-microvms run-microvm \
    --image-identifier arn:aws:lambda:<region>:<acct>:microvm-image:my-image \
    --execution-role-arn arn:aws:iam::<acct>:role/MicroVMExecutionRole \
    --idle-policy '{"maxIdleDurationSeconds":900,"suspendedDurationSeconds":300,"autoResumeEnabled":true}'
    

也可以通过 AWS 管理控制台或 CLI 启动。我传入了映像 ARN 资源和一个闲置策略，该策略配置为在闲置 15 分钟后自动暂停，并在收到新请求时自动恢复运行。无需进行联网设置。Lambda 为这台 MicroVM 分配了一个唯一的 ID，返回了专用的端点 URL，并启动了一个新的 MicroVM，启动时我的 Flask 应用程序处于运行状态，因为它是从快照恢复的。启动完成时，我的 Flask 应用程序已经在运行。只需一次 API 调用，即可获得完全初始化、引导式的计算环境。

为了发送流量，我使用 CLI 生成了一个短期有效的身份验证令牌，并使用 `X-aws-proxy-auth` 标头将其附加到纯 HTTPS 请求中。该请求立即到达了我的 Flask 应用程序。然后，我使 MicroVM 保持闲置状态，时长超过设定的暂停阈值，此时系统将暂停 MicroVM，并对其内存和磁盘状态生成快照并存储。然后，我再次发起请求， MicroVM 恢复运行，应用程序状态完全不受影响。从客户端角度来看，完全感知不到暂停过程。

**工作原理  
**在底层实现上，Lambda MicroVMs 可提供三项功能，在此之前，没有任何一款 AWS 计算服务可以同时提供这些功能。第一项是虚拟机级安全隔离，该功能依托 Firecracker 实现。每个会话都在自己的专用 MicroVM 中运行，用户之间不共享内核，也不共享资源，因此一个用户提供的不可信代码将限制在其自身的执行环境中，无法访问其他环境或底层系统。第二项是快速启动和恢复。采用“先映像，然后启动”的模型：您可以通过在 Amazon S3 中提供 Dockerfile 和打包为压缩构件的代码来创建 MicroVM 映像，然后，Lambda 将运行您的 Dockerfile，初始化您的应用程序，并生成运行环境的内存和磁盘状态的 Firecracker 快照。后续从该映像启动的每个 MicroVM 都将从预初始化的快照中恢复，而不是冷启动，这意味着启动和闲置恢复都可以实现近乎即时的启动延迟。即使是数 GB 的交互式会话，恢复速度也足够迅捷，终端用户几乎感知不到延迟。第三项是有状态执行。正在运行的 MicroVM 会在用户会话中保留内存、磁盘和正在运行的进程。MicroVM 可以在闲置期间暂停（内存和磁盘状态将保留不变），并在流量到达时恢复运行。用户恢复会话后，已安装的软件包、加载的模型和工作文件集随时可用。MicroVM 支持长达 8 小时的总运行时长，并且可以在可配置的闲置窗口后自动暂停，这使开发人员能够轻松构建各类差异化产品，例如可在几分钟内完成的软件漏洞扫描、可持续运行数小时的数据分析应用程序、以及具有较长闲置时间的交互式编码会话。由于 Lambda MicroVM 是从预初始化快照启动的，因此在初始化期间生成独特内容、建立网络连接或加载临时数据的应用程序可能需要与服务提供的挂钩集成以实现兼容性。

Lambda MicroVMS 是 AWS Lambda 内的一项全新资源，配有独立的 API 接口。Lambda 函数仍然是事件驱动的请求响应类工作负载的适当选择，而 Lambda MicroVMs 专为多租户应用程序构建，可满足为每一位终端用户、每一个会话分配独立隔离环境，以执行用户或 AI 生成的不可信代码的需求。二者互为补充。使用 Lambda 函数作为事件驱动主链路的应用程序可在需要隔离运行不可信代码的步骤调用 Lambda MicroVMs。您只需提供应用程序，该服务会提供执行环境。

**现已推出  
**AWS Lambda MicroVMs 目前已在以下[区域](<https://aws.amazon.com/about-aws/global-infrastructure/regions_az/>)推出：美国东部（弗吉尼亚州北部、俄亥俄州）、美国西部（俄勒冈州）、欧洲地区（爱尔兰）和亚太地区（东京）。当前仅支持 ARM64 架构，单台 MicroVM 最高可配置 16 vCPU、32GB 内存和 32GB 磁盘空间。闲置的 MicroVM 可以通过 API 调用明确暂停，也可以通过生命周期策略自动暂停，这样可以降低运行成本，同时保留完整状态以便快速恢复。有关定价详情，请参阅 [AWS Lambda 定价页面](<https://aws.amazon.com/lambda/pricing/>)。

要开始使用，请访问 [AWS Lambda 控制台](<https://console.aws.amazon.com/lambda/>)，或者在 [Lambda MicroVMs 产品页面](<https://aws.amazon.com/lambda/lambda-microvms>)上了解更多信息。有关文档，请参阅 [Lambda MicroVMs 开发人员指南](<https://docs.aws.amazon.com/lambda/latest/dg/lambda-microvms-guide.html>)。
