---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/ai-intelligent-code-agent-deploy-practice
ingested: 2026-08-29
feed_name: AWS China Blog
source_published: 2026-08-25
sha256: afd12a7c4683ee1c7c882b10f28882c47fa8800c2b716a14c3818aaa789bfee6
---

# 地理空间 AI 智能体（Code Agent）中国区部署实践

摘要：在农业遥感监测、自然资源调查、城市规划、碳汇核算、保险定损等领域，企业客户日益需要对卫星影像进行快速分析。传统工作流要求 GIS 专业人员编写 Python 代码处理遥感数据，门槛高、周期长、成本大。亚马逊云科技开源项目 sample-geospatial-code-agent（https://github.com/aws-samples/sample-geospatial-code-agent）提供了一套 AI 智能体方案，让非技术用户也能通过自然语言完成专业级遥感分析。该方案采用 Code Agent 架构——LLM 直接生成 Python 脚本执行，中间数据留在内存不回传上下文，相比传统 Tool Agent 在遥感分析场景中速度更快、成本更低。但原项目基于海外区服务生态构建，其底图方案（Google/CARTO 瓦片）和部分托管服务无法在中国区直接运行，需要针对中国区进行适配。  
  
**目录**

01 一、背景介绍

02 二、解决方案

03 三、具体方案实现

04 四、效果展示

05 五、总结

06 六、参考文档

* * *

## **一、背景介绍**

在农业遥感监测、自然资源调查、城市规划、碳汇核算、保险定损等领域，企业客户日益需要对卫星影像进行快速分析。传统[工作流](<https://aws.amazon.com/cn/what-is/workflow/>)要求 GIS 专业人员编写 [Python](<https://aws.amazon.com/cn/what-is/python/>) 代码处理遥感数据，门槛高、周期长、成本大。亚马逊云科技[开源](<https://aws.amazon.com/cn/what-is/open-source/>)项目 sample-geospatial-code-agent（<https://github.com/aws-samples/sample-geospatial-code-agent>）提供了一套 [AI](<https://aws.amazon.com/cn/what-is/artificial-intelligence/>) 智能体方案，让非技术用户也能通过自然语言完成专业级遥感分析。

该方案采用 Code Agent 架构——[LLM](<https://aws.amazon.com/cn/what-is/large-language-model/>) 直接生成 Python 脚本执行，中间数据留在内存不回传上下文，相比传统 Tool Agent 在遥感分析场景中速度更快、成本更低。

但原项目基于海外区服务生态构建，其底图方案（Google/CARTO 瓦片）和部分托管服务无法在中国区直接运行，需要针对中国区进行适配。

## **二、解决方案**

采用 [Amazon ECS](<https://docs.amazonaws.cn/ecs/>) \+ [ALB](<https://docs.amazonaws.cn/elasticloadbalancing/>) \+ [CloudFront](<https://docs.amazonaws.cn/cloudfront/>) 架构，底图适配天地图（CGCS2000 ≈ WGS-84，无偏移）。适配工作：

  * [容器化](<https://aws.amazon.com/cn/what-is/containerization/>)部署：ECS Fargate + ALB + CloudFront
  * 底图适配：天地图 WMTS（CGCS2000 坐标系）
  * 地理编码：天地图 [API](<https://aws.amazon.com/cn/what-is/api/>)
  * LLM 推理：[Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) Minimax M2.5
  * 凭证管理：敏感凭证统一环境变量注入（ECS 由 Secrets Manager）



### 底图方案：为什么选择天地图

  * 高德/腾讯：GCJ-02，偏移 100-700 米
  * 百度：BD-09，二次偏移
  * 天地图：CGCS2000 ≈ WGS-84，直接叠加无偏移



## **三、具体方案实现**

### 3.1 前置条件

  * 亚马逊云科技中国区账号、天地图账号、[ECS](<https://docs.amazonaws.cn/ecs/>)+[ECR](<https://docs.amazonaws.cn/ecr/>)



### 3.2 主要代码改造点

**Step 1：代码入口（webmain.py 替代 AgentCore）**

新增 FastAPI Web 服务入口，实现与 AgentCore 兼容的 API。核心代码：
    
    
    # webmain.py
    import json, os, sys, hmac, hashlib, time, tempfile
    from pathlib import Path
    from fastapi import FastAPI, HTTPException, Request, Depends
    from fastapi.responses import StreamingResponse, FileResponse
    from fastapi.staticfiles import StaticFiles
    from starlette.middleware.gzip import GZipMiddleware
    BASE_DIR = Path(__file__).parent
    DOWNLOAD_DIR = Path(tempfile.gettempdir()) / "geo-agent-files"
    DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
    def load_config():
        """config.json 只存非敏感配置，敏感凭证从环境变量读取"""
        config_path = Path(os.getenv("CONFIG_PATH", BASE_DIR / "config.json"))
        file_cfg = json.load(open(config_path)) if config_path.is_file() else {}
        return {
            "aws": {
                "access_key_id": os.getenv("AWS_ACCESS_KEY_ID", ""),
                "secret_access_key": os.getenv("AWS_SECRET_ACCESS_KEY", ""),
                "region_name": file_cfg.get("aws",{}).get("region_name","us-east-1"),
            },
            "bedrock": {"model_id": file_cfg.get("bedrock",{}).get("model_id","minimax.minimax-m2.5")},
            "tianditu": {"api_key": os.getenv("TIANDITU_API_KEY", "")},
            "auth": {"users": json.loads(os.getenv("AUTH_USERS", "{}"))},
        }
    CONFIG = load_config()
    os.environ["AWS_ACCESS_KEY_ID"] = CONFIG["aws"]["access_key_id"]
    os.environ["AWS_SECRET_ACCESS_KEY"] = CONFIG["aws"]["secret_access_key"]
    os.environ["AWS_DEFAULT_REGION"] = CONFIG["aws"]["region_name"]
    os.environ["TIANDITU_API_KEY"] = CONFIG["tianditu"]["api_key"]
    _TOKEN_SECRET = (CONFIG["aws"]["secret_access_key"] or "default-secret").encode()
    _TOKEN_EXPIRY = 86400 * 7  # 7 天
    def _sign_token(username):
        expire = int(time.time()) + _TOKEN_EXPIRY
        msg = f"{username}.{expire}".encode()
        sig = hmac.new(_TOKEN_SECRET, msg, hashlib.sha256).hexdigest()[:32]
        return f"{username}.{expire}.{sig}"
    app = FastAPI()
    app.add_middleware(GZipMiddleware, minimum_size=1000)
    @app.post("/login")
    async def login(request: Request):
        """简易登录（替代 Cognito）"""
        data = await request.json()
        username, password = data.get("username",""), data.get("password","")
        auth_users = CONFIG["auth"]["users"]
        if not auth_users:
            return {"token": _sign_token("anonymous")}
        if auth_users.get(username) == password:
            return {"token": _sign_token(username)}
        raise HTTPException(status_code=401, detail="用户名或密码错误")
    @app.post("/invocations")
    async def invoke_agent(request: Request):
        """SSE 流式响应，与 AgentCore 接口兼容"""
        payload = await request.json()
        agent = GeospatialAgent(
            payload.get("coordinates"),
            payload.get("sessionId", "local"),
            payload.get("history"),
            payload.get("model_id", CONFIG["bedrock"]["model_id"]),
        )
        async def stream():
            async for msg in agent.stream_async(payload["message"]):
                yield f"data: {json.dumps(msg, ensure_ascii=False)}\n\n"
        return StreamingResponse(stream(), media_type="text/event-stream")
    @app.get("/download/{filename}")
    async def download_file(filename: str):
        """本地文件下载（替代 S3 pre-signed URL）"""
        path = DOWNLOAD_DIR / filename
        if not path.exists():
            raise HTTPException(status_code=404)
        return FileResponse(path)
    # 前端静态文件托管
    FRONTEND = BASE_DIR / "user-interface" / "dist"
    if FRONTEND.exists():
        app.mount("/", StaticFiles(directory=str(FRONTEND), html=True))
    

**关键改造点**

  * load_config()：config.json 只存非敏感配置，敏感凭证始终从环境变量读取
  * /login：简易用户名密码认证，返回 HMAC 签名 Token（7 天有效期）
  * /invocations：SSE 流式推送，Agent 每产生消息即推送前端
  * /download/{filename}：Agent 将分析结果拷贝到本地目录，前端通过 HTTP 下载



**Step 2：天地图底图配置**

修改 MapView.tsx，替换底图为天地图 WMTS：
    
    
    // 矢量底图（CGCS2000，无偏移）
    http​://t{0-7}.tianditu.gov.cn/vec_w/wmts?...&tk=
    // 影像底图
    http​://t{0-7}.tianditu.gov.cn/img_w/wmts?...&tk=
    // 中文标注
    http​://t{0-7}.tianditu.gov.cn/cva_w/wmts?...&tk=
    

**Step 3：天地图地理编码**

修改 satellite_data.py 中的 geocode()：
    
    
    TIANDITU_KEY = os.getenv("TIANDITU_API_KEY", "")
    def geocode(location_name: str):
        url = "http://api.tianditu.gov.cn/geocoder"
        params = {"ds": json.dumps({"keyWord": location_name}), "tk": TIANDITU_KEY}
        resp = requests.get(url, params=params).json()
        if resp.get("status") == "0":
            return (resp["location"]["lat"], resp["location"]["lon"])
        return None
    

**Step 4：配置文件（config.json）**

config.json 只存非敏感配置，敏感凭证通过环境变量注入：
    
    
    {
        "aws": {"region_name": "us-east-1"},
        "bedrock": {"model_id": "minimax.minimax-m2.5"}
    }
    

### 3.3 ECS 服务配置

**Step 5：构建容器镜像**

在中国区 EC2 上构建 Docker 镜像时，默认访问 Debian 官方源和 PyPI 速度极慢（GDAL 安装可能需要 30 分钟以上）。需要替换为国内镜像源：
    
    
    FROM public.ecr.aws/docker/library/node:22-bookworm-slim AS frontend
    WORKDIR /build
    COPY user-interface/package.json user-interface/package-lock.json ./
    RUN npm ci
    COPY user-interface/ ./
    RUN npm run build
    FROM public.ecr.aws/docker/library/python:3.11-slim
    # 替换 apt 源为阿里云镜像（中国区加速）
    RUN sed -i 's|deb.debian.org|mirrors.aliyun.com|g' /etc/apt/sources.list.d/debian.sources \
        && sed -i 's|security.debian.org|mirrors.aliyun.com|g' /etc/apt/sources.list.d/debian.sources
    RUN apt-get update && apt-get install -y --no-install-recommends \
        curl gcc g++ gdal-bin libgdal-dev libgeos-dev libproj-dev \
        && rm -rf /var/lib/apt/lists/*
    WORKDIR /app
    COPY requirements.txt .
    RUN pip install --no-cache-dir -i https://mirrors.aliyun.com/pypi/simple/ \
        --trusted-host mirrors.aliyun.com -r requirements.txt
    COPY agent/ ./agent/
    COPY webmain.py config.json ./
    COPY --from=frontend /build/dist ./user-interface/dist/
    ENV PYTHONPATH=/app/agent
    RUN useradd --create-home appuser
    USER appuser
    EXPOSE 5000
    CMD ["uvicorn", "webmain:app", "--host", "0.0.0.0", "--port", "5000", \
         "--proxy-headers", "--timeout-keep-alive", "300"]
    

**关键优化点**

  * 基础镜像：使用 public.ecr.aws 替代 Docker Hub（中国区无法直接访问 registry-1.docker.io）
  * apt 镜像源：mirrors.aliyun.com 替代 deb.debian.org，GDAL 安装从 30 分钟降至 1-2 分钟
  * pip 镜像源：阿里云 PyPI 镜像，Python 依赖安装提速 5-10 倍
  * 多阶段构建：前端（Node.js）和后端（Python）分离构建，最终镜像不含 Node.js 运行时
  * uvicorn keep-alive 300s：匹配 ALB idle timeout，避免 SSE 长连接被中途断开



**Step 6：创建 Secrets Manager 密钥**

敏感凭证存入 [Secrets Manager](<https://docs.amazonaws.cn/secretsmanager/>)：
    
    
    aws secretsmanager create-secret \
      --name geo-agent/config \
      --secret-string '{
        "aws_access_key_id": "<AK>",
        "aws_secret_access_key": "<SK>",
        "tianditu_api_key": "<TIANDITU_KEY>",
        "auth_users": "{\"admin\":\"password\"}"
      }' --region cn-north-1
    

**Step 7：配置 ecsTaskExecutionRole 权限**

ECS Task 启动时需从 Secrets Manager 拉取凭证，必须给 Execution Role 添加权限：
    
    
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": "secretsmanager:GetSecretValue",
          "Resource": "<SECRET_ARN>"
        },
        {
          "Effect": "Allow",
          "Action": ["ecr:GetAuthorizationToken","ecr:BatchCheckLayerAvailability",
                     "ecr:GetDownloadUrlForLayer","ecr:BatchGetImage"],
          "Resource": "*"
        },
        {
          "Effect": "Allow",
          "Action": ["logs:CreateLogStream","logs:PutLogEvents"],
          "Resource": "arn:aws-cn:logs:cn-north-1:<ACCOUNT>:log-group:/ecs/geo-agent:*"
        }
      ]
    }
    

附加到角色：
    
    
    aws iam put-role-policy \
      --role-name ecsTaskExecutionRole \
      --policy-name geo-agent-execution-policy \
      --policy-document file://secrets-policy.json
    

说明：无此权限 Task 启动报 ResourceInitializationError。Task Role 不需要 SM 权限（凭证已注入为环境变量）。

**Step 8：Task Definition**

完整 Task Definition JSON（保存为 task-definition.json，通过 aws ecs register-task-definition –cli-input-json file://task-definition.json 注册）：
    
    
    {
      "family": "geo-agent",
      "networkMode": "awsvpc",
      "requiresCompatibilities": ["FARGATE"],
      "runtimePlatform": {
        "cpuArchitecture": "ARM64",
        "operatingSystemFamily": "LINUX"
      },
      "cpu": "2048",
      "memory": "8192",
      "executionRoleArn": "arn:aws-cn:iam::<ACCOUNT_ID>:role/ecsTaskExecutionRole",
      "taskRoleArn": "arn:aws-cn:iam::<ACCOUNT_ID>:role/ecsTaskRole",
      "containerDefinitions": [{
        "name": "geo-agent",
        "image": "<ACCOUNT_ID>.dkr.ecr.cn-northwest-1.amazonaws.com.cn/geo-agent:latest",
        "portMappings": [{"containerPort": 5000, "protocol": "tcp"}],
        "essential": true,
        "secrets": [
          {"name":"AWS_ACCESS_KEY_ID","valueFrom":"<SECRET_ARN>:aws_access_key_id::"},
          {"name":"AWS_SECRET_ACCESS_KEY","valueFrom":"<SECRET_ARN>:aws_secret_access_key::"},
          {"name":"TIANDITU_API_KEY","valueFrom":"<SECRET_ARN>:tianditu_api_key::"},
          {"name":"AUTH_USERS","valueFrom":"<SECRET_ARN>:auth_users::"}
        ],
        "environment": [
          {"name":"AWS_DEFAULT_REGION","value":"us-east-1"},
          {"name":"BEDROCK_MODEL_ID","value":"minimax.minimax-m2.5"}
        ],
        "logConfiguration": {
          "logDriver": "awslogs",
          "options": {
            "awslogs-group": "/ecs/geo-agent",
            "awslogs-region": "cn-northwest-1",
            "awslogs-stream-prefix": "ecs"
          }
        },
        "healthCheck": {
          "command": ["CMD-SHELL", "curl -f http://localhost:5000/healthz || exit 1"],
          "interval": 30,
          "timeout": 5,
          "retries": 3,
          "startPeriod": 60
        }
      }]
    }
    

### 3.4 Agent 代码关键改造

**1\. System Prompt 增强**

原项目 System Prompt 仅两行描述，在使用 Minimax M2.5 等模型时，Agent 无法正确区分 visualize_map_raster_layer（叠加地图）和 visualize_image（仅聊天显示）。增加明确的工具使用规则，确保分析结果正确叠加到地图上。

**2\. 添加文件系统 Toolkit**

strands-code-agent 的 CodeAgent 有严格的 import 白名单，默认不允许 import os、pathlib 等模块。需要显式添加 FILESYSTEM_TOOLKIT，包含 os、pathlib、tempfile、shutil、json、glob 等模块。

**3\. 大面积自动降采样**

原项目对数据下载分辨率无限制，Sentinel-2 默认 10m 分辨率。用户选择大范围多边形时（如 100km×100km），数据量可达数百 MB，导致超时或 OOM。增加自动降采样逻辑，限制最大像素数为 400 万：
    
    
    MAX_PIXELS = 4_000_000  # 最大约 2000x2000 像素
    def fetch_scene_bands(..., resolution=None):
        polygon = Polygon(polygon_coordinates)
        if resolution is None:
            west, south, east, north = polygon.bounds
            width_m = abs(east - west) * 111_000 * cos(radians(...))
            height_m = abs(north - south) * 111_000
            estimated_pixels = (width_m / 10) * (height_m / 10)
            if estimated_pixels > MAX_PIXELS:
                scale_factor = sqrt(estimated_pixels / MAX_PIXELS)
                resolution = 10 * scale_factor
    

### 3.5 中国区网络时延专项处理

中国区部署面临跨境网络和国内审查两大挑战，需要在多个层面做超时和网络适配：

**1\. ALB Idle Timeout 调整**

默认 60 秒的 idle timeout 对遥感分析场景不够——Agent 执行代码期间可能有 60-180 秒无 SSE 数据发送，ALB 会主动断连。必须调高至 300 秒。
    
    
    aws elbv2 modify-load-balancer-attributes \
      --load-balancer-arn "$ALB_ARN" \
      --attributes Key=idle_timeout.timeout_seconds,Value=300
    

**2\. 跨境 Bedrock 调用**

容器运行在中国区（cn-northwest-1），调用海外 Bedrock（us-east-1）经过公网，延迟 200ms-2s，偶发超时。应对措施：

  * uvicorn –timeout-keep-alive 300：保持长连接不被服务端主动关闭
  * ECS Task 安全组出站：必须开放 TCP 443（Bedrock endpoint IP 不固定）
  * SSE 流式响应：即使中间有等待也能保持 HTTP 连接不被断开



**3\. 卫星数据跨境下载优化**

Element84 STAC API 和 Sentinel-2 COG [数据存储](<https://aws.amazon.com/cn/what-is/data-store/>)在 us-west-2 S3，从中国区下载速度约 1-5 MB/s。应对措施：

  * 自动降采样：限制单次下载数据量不超过约 50MB
  * 前端初始 zoom 调高至 8：引导用户选择合理大小的分析区域
  * fitBounds 自适应缩放：多边形选中后根据实际大小决定缩放级别，避免用户误画超大范围



**4.天地图瓦片多节点[负载均衡](<https://aws.amazon.com/cn/what-is/load-balancing/>)**

天地图 WMTS 服务使用 HTTP 协议，配置 t0-t7 八个节点负载均衡，降低单节点压力。注意 API Key 需设置为“浏览器端”类型，白名单填写 ALB 域名或设为“不限制”。

## **四、效果展示**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/08/25/ai-intelligent-code-agent-deploy-practice-1.png>) [图 1：植被分析 — 输入]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/08/25/ai-intelligent-code-agent-deploy-practice-2.png>) [图 2：植被分析 — 报告]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/08/25/ai-intelligent-code-agent-deploy-practice-3.png>) [图 3：植被分析 — 饼图]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/08/25/ai-intelligent-code-agent-deploy-practice-4.png>) [图 4：水体分析 — 输入]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/08/25/ai-intelligent-code-agent-deploy-practice-5.png>) [图 5：水体分析 — 报告]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/08/25/ai-intelligent-code-agent-deploy-practice-6.png>) [图 6：地表温度分析 — 输入]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/08/25/ai-intelligent-code-agent-deploy-practice-7.png>) [图 7：地表温度分析 — 报告]  
---  
  
## **五、总结**

本文介绍了将开源项目 sample-geospatial-code-agent 部署到亚马逊云科技中国区的完整实践。核心技术选型：

  * 底图方案：天地图 WMTS（CGCS2000 ≈ WGS-84，无偏移），确保遥感影像精确叠加
  * 部署架构：ECS Fargate + ALB，容器化交付、弹性伸缩
  * 凭证管理：Secrets Manager 注入环境变量，敏感信息不入镜像
  * LLM 推理：跨境调用海外区 Bedrock，配合 ALB 300s 超时和 SSE 流式响应保障长连接稳定性
  * 中国区网络优化：国内镜像源加速构建、自动降采样控制数据量、多节点负载均衡



通过以上适配，非技术用户可以在中国区通过自然语言完成专业级遥感分析，实现与海外区一致的使用体验。

**下一步行动：**

**相关产品：**

  * [Amazon ECS](<https://aws.amazon.com/cn/ecs/?p=bl_pr_ecs_l=1>) — 完全托管的容器编排服务
  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=2>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon Secrets Manager](<https://aws.amazon.com/cn/secrets-manager/?p=bl_pr_secrets-manager_l=3>) — 密钥管理
  * [Amazon S3](<https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=4>) — 适用于 AI、分析和存档的几乎无限的安全对象存储
  * [Amazon Fargate](<https://aws.amazon.com/cn/fargate/?p=bl_pr_fargate_l=5>) — 适用于容器的无服务器计算



**相关文章：**

  * [5 分钟拉起、90 秒自愈、成本 1/8——基于 Firecracker microVM 与 Bedrock AgentCore 的生产级多租户 AI Agent 平台 OpenClaw Pool](<https://aws.amazon.com/cn/blogs/china/5-self-healing-cost-based-on-firecracker-microvm-bedrock-agentcore/?p=bl_ar_l=1>)
  * [用 Kiro Skill 打造你的专属 AI 工作流：以会议纪要自动生成为例](<https://aws.amazon.com/cn/blogs/china/kiro-skill-build-custom-ai-workflow-meeting-minutes-auto-generate/?p=bl_ar_l=2>)
  * [让 Kiro 和 Claude Code 响应 IM 消息：用 ACP Bridge 打造异步 AI 编程工作流](<https://aws.amazon.com/cn/blogs/china/enable-kiro-and-claude-code-for-im-with-acp-bridge-async-ai-workflow/?p=bl_ar_l=3>)
  * [使用Amazon SageMaker Hyperpod Cluster部署whisper模型](<https://aws.amazon.com/cn/blogs/china/using-amazon-sagemaker-hyperpod-cluster-deploy-whisper-model/?p=bl_ar_l=4>)
  * [OpenClaw 安全和功能增强实践](<https://aws.amazon.com/cn/blogs/china/openclaw-security-and-feature-enhancement-practices/?p=bl_ar_l=5>)



## **六、参考文档**

  1. [sample-geospatial-code-agent](<https://github.com/aws-samples/sample-geospatial-code-agent>)
  2. [Strands Agents SDK](<https://strandsagents.com/>)
  3. [天地图服务接口](<http://lbs.tianditu.gov.cn/server/MapService.html>)
  4. [Amazon ECS](<https://docs.amazonaws.cn/ecs/>)
  5. [Secrets Manager](<https://docs.amazonaws.cn/secretsmanager/>)



[立即咨询 →](<https://aws.amazon.com/cn/contact-us/idp-ai/>)[ 从 AI 规划到落地实施，我们的专家团队为你全程护航。](<https://aws.amazon.com/cn/contact-us/idp-ai/>)

*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 董杰

西云数据解决方案架构师，曾就职于多家外企、知名民企，主要负责支持企业客户上云，专注于亚马逊云科技解决方案设计和技术咨询，15+年软件开发、项目交付、售前咨询等丰富的行业实践建议。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
