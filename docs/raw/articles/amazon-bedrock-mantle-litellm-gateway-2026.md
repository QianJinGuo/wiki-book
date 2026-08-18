---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/access-amazon-bedrock-inference-mantle-litellm-gateway
ingested: 2026-08-19
feed_name: AWS China Blog
source_published: 2026-08-12
sha256: 172669fc7f2404711504625eeffe3e9fcd8c96b9068a9d98ff774501c80521e9
---

# 接入 Amazon Bedrock 新一代推理引擎 Mantle：用 LiteLLM 网关统一调用 GPT-5.6 与 Claude

摘要：Mantle 是[Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) 的新一代推理引擎，OpenAI 的[GPT](<https://aws.amazon.com/cn/what-is/gpt/>)-5.6（Sol / Terra / Luna）等模型由它提供服务，通过 OpenAI 兼容的 `bedrock-mantle` 端点对外暴露。它与承载 Claude 的经典 `bedrock-runtime` 端点在协议上并不一致：前者用 Chat Completions / Responses，后者用 Converse / InvokeModel。本文用一台 EC2 上的 LiteLLM 网关（测试形态，生产化建议见文中）把两个端点收敛到同一个入口，实测供出 9 个模型（[GPT](<https://aws.amazon.com/cn/what-is/gpt/>)-5.6 三变体、[GPT](<https://aws.amazon.com/cn/what-is/gpt/>)-5.5、[GPT](<https://aws.amazon.com/cn/what-is/gpt/>)-5.4、gpt-oss 两款、Claude 两款），客户端只认一个地址、一个 key，网关侧完全用 EC2 实例角色做 SigV4 认证，不落盘任何[API](<https://aws.amazon.com/cn/what-is/api/>) key。文中还给出一个 92 行的 pre-call 钩子，解决 Codex 客户端与 Mantle 的请求体不兼容问题，让 Codex 和 opencode 共用同一套网关。  
  
**目录**

01 一、引言：先认识 Mantle

02 二、先看最终效果

03 三、三步部署到你自己的 AWS

04 四、为什么用 `bedrock_mantle/` 而不是 `openai/`

05 五、让 Codex 与 opencode 共存：一个 92 行的钩子

06 六、成本

07 七、小结

08 八、参考链接

09 九、附录：钩子完整代码

* * *

## **一、引言：先认识 Mantle**

### 1.1 Mantle 是什么

Mantle 是[Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) 的新一代推理引擎（next-generation inference engine）。理解它时有一个概念区分很关键，官方文档也反复强调：

  * 引擎（engine） —— 指 Mantle 本身，是底层的服务基础设施，采用 Model Deployment Account 隔离设计；
  * 端点（endpoint） —— 指 `bedrock-mantle`，是该引擎对外的 OpenAI 兼容 HTTPS [API](<https://aws.amazon.com/cn/what-is/api/>)，即应用真正调用的地址（`https://bedrock-mantle.{region}.api.aws`）。



Mantle 有三个值得关注的特性：

  * 零运维人员访问（Zero Operator Access）。 参照 AWS Nitro System 的思路从零设计，在技术上排除了运维人员访问客户数据的手段 —— AWS、客户、模型提供方三方都无法接触推理的 prompt 与 completion。
  * OpenAI 兼容[API](<https://aws.amazon.com/cn/what-is/api/>)。 可直接使用 OpenAI 的[Python](<https://aws.amazon.com/cn/what-is/python/>) / TypeScript [SDK](<https://aws.amazon.com/cn/what-is/sdk/>)，迁移时只需改 base URL 和模型 ID；同时暴露 Chat Completions 与 Responses 两套[API](<https://aws.amazon.com/cn/what-is/api/>)。
  * 为 Agent 流量设计。 Agent 负载天然突发——一次用户请求可能触发上百次模型调用。Mantle 池化容量吸收峰值，同时隔离各客户吞吐；并支持带显式 cache breakpoint 的 prompt caching，缓存输入按一折计费、可复用至少 30 分钟。



### 1.2 接入时会遇到的三个不对齐

2026 年 7 月，[GPT](<https://aws.amazon.com/cn/what-is/gpt/>)-5.6 三个变体在[Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) 正式可用。对已经在用 Claude 的团队，这本该是”多一个模型可选”的好事，但真正接入时会遇到三处不对齐：

  * 端点不对齐。 [GPT](<https://aws.amazon.com/cn/what-is/gpt/>)-5.6 由 Mantle 提供服务，走 `bedrock-mantle`；Claude 走经典的 `bedrock-runtime`（Converse / InvokeModel，可使用 Guardrails 等 Bedrock 原生能力）。两个端点、两套 base URL。
  * 协议不对齐。 同一个端点下按模型分派不同协议：[GPT](<https://aws.amazon.com/cn/what-is/gpt/>)-5.x 只支持 Responses [API](<https://aws.amazon.com/cn/what-is/api/>)（字段 `input`），gpt-oss 系列只支持 Chat Completions（字段 `messages`）。业务代码要发两种请求体。
  * 模型 ID 查不到。 `aws bedrock list-foundation-models` 里看不到[GPT](<https://aws.amazon.com/cn/what-is/gpt/>)-5.6 —— 该[API](<https://aws.amazon.com/cn/what-is/api/>) 只列 `bedrock-runtime` 上的基础模型。用旧[API](<https://aws.amazon.com/cn/what-is/api/>) 查，很容易误判成”Bedrock 上没有[GPT](<https://aws.amazon.com/cn/what-is/gpt/>)-5”。



**补充：** Mantle 端点上也有 Claude（ `anthropic.claude-opus-5`、 `claude-sonnet-5` 等 6 个），但它们走的是第三套协议 —— Anthropic 原生的 Messages API（ `/anthropic/v1/messages`），既不支持 Chat Completions 也不支持 Responses。本文让 Claude 走 `bedrock-runtime`，因为该路径同时可用 Guardrails 等原生功能。 

再叠加客户端侧的现实：一个团队里往往同时存在多种编码 Agent（opencode、Codex [CLI](<https://aws.amazon.com/cn/what-is/cli/>)、自研脚本），它们对 OpenAI 兼容协议的实现细节并不一致。如果让每个客户端各自去对接 Bedrock，你会得到 N 份重复的认证逻辑和 N 处需要单独修的兼容问题。

一句话： 把差异收敛到网关里，客户端只需要知道”一个地址 + 一个 key + 一个模型名”。

本文用 LiteLLM 做这个网关，落在一台 EC2 上，用 docker compose 起两个容器。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/08/10/access-amazon-bedrock-inference-mantle-litellm-gateway-1.png>) [图 1]  
---  
  
三类客户端经同一个 LiteLLM 网关，分别路由到 bedrock-runtime（Claude）与 bedrock-mantle（[GPT](<https://aws.amazon.com/cn/what-is/gpt/>)-5.6）；网关到 Bedrock 用 EC2 实例角色 SigV4 认证，无[API](<https://aws.amazon.com/cn/what-is/api/>) key 落盘。

## **二、先看最终效果**

部署完成后，同一个网关地址、同一个 key，供出跨两个 Bedrock 端点的 9 个模型。以下是经网关实测的结果：

网关模型名 | 路由前缀 | 后端端点 | 客户端可用端点  
---|---|---|---  
`gpt-5.6-sol` / `-terra` / `-luna` | `bedrock_mantle/` | Mantle | `/v1/responses` 与 `/v1/chat/completions`  
`gpt-5.5` / `gpt-5.4` | `bedrock_mantle/` | Mantle | `/v1/responses` 与 `/v1/chat/completions`  
`gpt-oss-120b` / `gpt-oss-20b` | `bedrock_mantle/` | Mantle | `/v1/chat/completions`  
`claude-sonnet-4-5` / `claude-haiku-4-5` | `bedrock/` | Runtime | `/v1/chat/completions`  
  
有一处值得注意：直接调 Mantle 时，[GPT](<https://aws.amazon.com/cn/what-is/gpt/>)-5.x 只认 Responses [API](<https://aws.amazon.com/cn/what-is/api/>)，用 Chat Completions 会被拒绝（`does not support the '/v1/chat/completions' API`）。但经过网关后，[GPT](<https://aws.amazon.com/cn/what-is/gpt/>)-5.x 用 `/v1/chat/completions` 也能调通 —— LiteLLM v1.90 会自动把 chat 请求转换成 Responses 调用。这意味着客户端可以统一用 chat 协议，不必关心后端的协议分野。

调 Claude（Chat Completions，字段 `messages`）：
    
    
    curl http://<PROXY_HOST>/v1/chat/completions \
      -H "Authorization: Bearer <VIRTUAL_KEY>" \
      -H 'Content-Type: application/json' \
      -d '{"model":"claude-sonnet-4-5","messages":[{"role":"user","content":"你好"}]}'
    

调[GPT](<https://aws.amazon.com/cn/what-is/gpt/>)-5.6（Responses [API](<https://aws.amazon.com/cn/what-is/api/>)，字段 `input`）：
    
    
    curl http://<PROXY_HOST>/v1/responses \
      -H "Authorization: Bearer <VIRTUAL_KEY>" \
      -H 'Content-Type: application/json' \
      -d '{"model":"gpt-5.6-sol","input":"你好"}'
    

实际返回（Sol，272K 上下文）：
    
    
    {
      "model": "gpt-5.6-sol",
      "status": "completed",
      "output": [{"content": [{"type": "output_text", "text": "你好！有什么我可以帮你的吗？"}]}],
      "usage": {"input_tokens": 7, "output_tokens": 13, "total_tokens": 20}
    }
    

opencode 里直接选模型：
    
    
    opencode run -m litellm-east1/gpt-5.6-sol "重构这个函数"
    opencode run -m litellm-east1/claude-sonnet-4-5 "解释这段代码"
    

Codex [CLI](<https://aws.amazon.com/cn/what-is/cli/>) 里指定 provider：
    
    
    codex exec -m gpt-5.6-sol -c model_provider=litellm-east1 "写单元测试"
    

三类客户端、两套后端协议，对使用者是同一个入口。

## **三、三步部署到你自己的 AWS**

前提： 一个 AWS 账号，已在目标区域（本文用 `us-east-1`）开通 Bedrock 的 Claude 与 OpenAI 模型访问权限；本地有 AWS [CLI](<https://aws.amazon.com/cn/what-is/cli/>)。

区域说明： [GPT](<https://aws.amazon.com/cn/what-is/gpt/>)-5.6 Sol 目前在 `us-east-1`、`us-east-2` 可用，Terra 与 Luna 另有 `us-west-2`。以官方[模型卡](<https://docs.aws.amazon.com/bedrock/latest/userguide/models-endpoint-availability.html>)为准。

版本要求： LiteLLM 镜像必须 ≥ v1.89。`bedrock_mantle` 的 Responses 实现是该版本才引入的，旧版本会因为找不到原生路由而落入请求转换递归，报 `functools.partial() got multiple values for keyword argument 'acompletion'`。本文用 `v1.90.2`。

### 3.1 第一步：创建 IAM 角色（关键：mantle 需要单独的 action）

网关调 Bedrock 用 EC2 实例角色，不需要任何[API](<https://aws.amazon.com/cn/what-is/api/>) key。除了常规的 `bedrock:InvokeModel`，mantle 端点需要额外的 `bedrock-mantle:CreateInference`，这一点容易漏 —— 漏了会报 `not authorized to perform: bedrock-mantle:CreateInference`。
    
    
    REGION=us-east-1
    ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
    
    # 1. 信任策略
    cat > /tmp/trust.json <<'EOF'
    {"Version":"2012-10-17","Statement":[{"Effect":"Allow",
     "Principal":{"Service":"ec2.amazonaws.com"},"Action":"sts:AssumeRole"}]}
    EOF
    
    # 2. Bedrock 推理权限（bedrock-runtime + bedrock-mantle 两套 action）
    cat > /tmp/bedrock.json <<EOF
    {"Version":"2012-10-17","Statement":[
     {"Effect":"Allow",
      "Action":["bedrock:InvokeModel","bedrock:InvokeModelWithResponseStream",
                "bedrock:Converse","bedrock:ConverseStream"],
      "Resource":["arn:aws:bedrock:*::foundation-model/*",
                  "arn:aws:bedrock:*:${ACCOUNT}:inference-profile/*"]},
     {"Effect":"Allow",
      "Action":["bedrock-mantle:CreateInference","bedrock-mantle:CreateModelInference",
                "bedrock-mantle:ListModels","bedrock-mantle:GetModel"],
      "Resource":"*"}]}
    EOF
    
    # 3. 建角色与实例配置文件
    aws iam create-role --role-name litellm-gateway-role \
      --assume-role-policy-document file:///tmp/trust.json
    aws iam put-role-policy --role-name litellm-gateway-role \
      --policy-name bedrock-invoke --policy-document file:///tmp/bedrock.json
    aws iam create-instance-profile --instance-profile-name litellm-gateway-profile
    aws iam add-role-to-instance-profile \
      --instance-profile-name litellm-gateway-profile --role-name litellm-gateway-role
    

### 3.2 第二步：启动 EC2 并写好 compose 配置

安全组只放行你自己的出口 IP（22/80）。启动实例时把实例配置文件挂上，并且把 IMDS 跳数设为 2 —— 容器内的进程要访问实例元数据拿临时凭证，默认跳数 1 会让 Docker 里的请求拿不到凭证。
    
    
    aws ec2 run-instances --region $REGION \
      --image-id $(aws ssm get-parameter --region $REGION \
          --name /aws/service/ami-amazon-linux-latest/al2023-ami-kernel-default-x86_64 \
          --query Parameter.Value --output text) \
      --instance-type t3.large \
      --key-name <YOUR_KEYPAIR> \
      --subnet-id <YOUR_PUBLIC_SUBNET> \
      --security-group-ids <YOUR_SG> \
      --associate-public-ip-address \
      --iam-instance-profile Name=litellm-gateway-profile \
      --metadata-options "HttpTokens=required,HttpPutResponseHopLimit=2,HttpEndpoint=enabled" \
      --block-device-mappings 'DeviceName=/dev/xvda,Ebs={VolumeSize=30,VolumeType=gp3,Encrypted=true}' \
      --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=litellm-gateway}]'
    

登录实例，在 `/opt/litellm/` 下准备三个文件。

`.env`（两个 key 自己生成，salt key 一旦设定不要再改，否则库里加密的凭证无法解密）：
    
    
    sudo mkdir -p /opt/litellm && cd /opt/litellm
    sudo tee .env >/dev/null <<EOF
    LITELLM_MASTER_KEY=sk-$(openssl rand -hex 24)
    LITELLM_SALT_KEY=sk-$(openssl rand -hex 24)
    PG_PASSWORD=$(openssl rand -hex 20)
    EOF
    sudo chmod 600 .env
    

`config.yaml` —— 注意两类模型的路由前缀不同，这是全文最关键的一处配置：
    
    
    model_list:
      # Claude：bedrock/ 前缀 -> bedrock-runtime
      - model_name: claude-sonnet-4-5
        litellm_params:
          model: bedrock/us.anthropic.claude-sonnet-4-5-20250929-v1:0
          aws_region_name: us-east-1
      - model_name: claude-haiku-4-5
        litellm_params:
          model: bedrock/us.anthropic.claude-haiku-4-5-20251001-v1:0
          aws_region_name: us-east-1
    
      # GPT-5.x：bedrock_mantle/ 前缀 -> Mantle 引擎，无需 api_key
      - model_name: gpt-5.6-sol
        litellm_params:
          model: bedrock_mantle/openai.gpt-5.6-sol
          aws_region_name: us-east-1
      - model_name: gpt-5.6-terra
        litellm_params:
          model: bedrock_mantle/openai.gpt-5.6-terra
          aws_region_name: us-east-1
      - model_name: gpt-5.6-luna
        litellm_params:
          model: bedrock_mantle/openai.gpt-5.6-luna
          aws_region_name: us-east-1
      - model_name: gpt-5.5
        litellm_params:
          model: bedrock_mantle/openai.gpt-5.5
          aws_region_name: us-east-1
      - model_name: gpt-5.4
        litellm_params:
          model: bedrock_mantle/openai.gpt-5.4
          aws_region_name: us-east-1
    
      # gpt-oss：同在 Mantle 上，但只支持 Chat Completions
      - model_name: gpt-oss-120b
        litellm_params:
          model: bedrock_mantle/openai.gpt-oss-120b
          aws_region_name: us-east-1
      - model_name: gpt-oss-20b
        litellm_params:
          model: bedrock_mantle/openai.gpt-oss-20b
          aws_region_name: us-east-1
    
    litellm_settings:
      drop_params: true
    
    general_settings:
      master_key: os.environ/LITELLM_MASTER_KEY
    

`docker-compose.yml`：
    
    
    services:
      litellm:
        image: docker.litellm.ai/berriai/litellm-database:v1.90.2
        container_name: litellm
        restart: unless-stopped
        ports:
          - "80:4000"
        volumes:
          - ./config.yaml:/app/config.yaml:ro
        environment:
          LITELLM_MASTER_KEY: ${LITELLM_MASTER_KEY}
          LITELLM_SALT_KEY: ${LITELLM_SALT_KEY}
          DATABASE_URL: postgresql://litellm:${PG_PASSWORD}@postgres:5432/litellm
          STORE_MODEL_IN_DB: "True"
        command: ["--config", "/app/config.yaml"]
        depends_on:
          postgres: {condition: service_healthy}
    
      postgres:
        image: postgres:16
        container_name: litellm-postgres
        restart: unless-stopped
        environment:
          POSTGRES_USER: litellm
          POSTGRES_PASSWORD: ${PG_PASSWORD}
          POSTGRES_DB: litellm
        volumes: [pgdata:/var/lib/postgresql/data]
        healthcheck:
          test: ["CMD-SHELL", "pg_isready -U litellm -d litellm"]
          interval: 5s
          retries: 20
    
    volumes:
      pgdata:
    

重要：上面的 Postgres 配置仅适用于测试与验证环境。   
本文把数据库与网关放在同一台 EC2 上、数据落在本地命名卷，目的是让你用最少的步骤把链路跑通。这个形态有两个明确的短板：数据与计算不分离（实例或 EBS 卷损毁，库里的虚拟 key、用量记录、UI 添加的模型配置一并丢失），没有任何冗余（容器或实例重启期间服务完全不可用，且无备份可回滚）。   
而这个库并不是”可丢弃的缓存” —— LiteLLM 把虚拟 key、预算与限流配置、逐 key 用量与花费、以及通过 UI/API 添加的模型（ `STORE_MODEL_IN_DB=True`）都存在里面。丢库意味着所有下发给客户端的 key 全部失效、用量与成本归集断档。   
生产环境建议： 

  * 数据库外置。 改用 Amazon RDS for PostgreSQL 或 Aurora PostgreSQL，把 `DATABASE_URL` 指向它，compose 里删掉 `postgres` 服务。计算与数据解耦后，网关变成无状态节点，可随时替换、扩容。
  * 开启多可用区与自动备份。 RDS 的 Multi-AZ 部署在实例故障时自动切换；自动备份 + 时间点恢复（PITR）覆盖误删数据的场景。
  * 网关侧做冗余。 单台 EC2 是单点。生产可放到 Auto Scaling 组 + ALB 后面，或直接用 Amazon EKS / ECS 跑多副本 —— 网关无状态后横向扩展没有障碍。
  * 凭证托管。 `.env` 里的 master key、salt key、数据库密码改用 AWS Secrets Manager 管理并启用轮转，而不是明文留在实例磁盘上。
  * `LITELLM_SALT_KEY` 必须与数据库同生命周期保管。 库里的凭证是用它加密的，salt key 丢失或变更会导致已存数据无法解密 —— 迁移数据库时务必一并迁移它。



如果只是本地验证或团队内小范围试用，保持现状即可，但至少配上定时 `pg_dump` 备份。

注： Amazon Linux 2023 的仓库里没有 `docker-compose-plugin`，需要手动装：
    
    
    sudo dnf install -y docker && sudo systemctl enable --now docker
    sudo mkdir -p /usr/local/lib/docker/cli-plugins
    sudo curl -sSL https://github.com/docker/compose/releases/download/v2.32.4/docker-compose-linux-x86_64 \
      -o /usr/local/lib/docker/cli-plugins/docker-compose
    sudo chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

### 3.3 第三步：起服务并签发虚拟 key
    
    
    cd /opt/litellm
    sudo docker compose --env-file /opt/litellm/.env up -d
    
    # 等就绪（首次启动要跑数据库迁移，约 1 分钟）
    until curl -sf http://localhost/health/liveliness >/dev/null; do sleep 5; done
    curl -s http://localhost/health/readiness   # 期望 {"status":"healthy","db":"connected"}
    

给客户端签一个受限的虚拟 key，而不是把 master key 发下去。虚拟 key 可以限定模型白名单、预算和限流，且只能调推理路由：
    
    
    curl -X POST http://localhost/key/generate \
      -H "Authorization: Bearer <MASTER_KEY>" \
      -H 'Content-Type: application/json' \
      -d '{"models":["gpt-5.6-sol","gpt-5.6-terra","gpt-5.6-luna","gpt-5.5","gpt-5.4",
                     "gpt-oss-120b","gpt-oss-20b","claude-sonnet-4-5","claude-haiku-4-5"],
           "max_budget":50,"rpm_limit":100,"key_alias":"coding-agents"}'
    

**注意：**

`models` 字段是整体替换而非追加。以后新增模型时要把已有的一并列全，否则旧模型会掉出白名单，客户端报 `key not allowed to access model`。

到这里网关已经可用。Web UI 在 `http://<PROXY_HOST>/ui`，用户名 `admin`、密码是 master key，可以在界面上加模型、发 key、看用量。

## **四、为什么用`bedrock_mantle/` 而不是 `openai/`**

接 mantle 端点有两种写法，差别不只是”风格”，而是要不要多维护一份长期凭证。

先明确一件事：`bedrock_mantle/` 这个前缀是 LiteLLM 的路由约定（下划线），不是 AWS 的标识。AWS 侧的字符串是连字符的 `bedrock-mantle`（只出现在端点主机名里），而真正的模型 ID 是 `openai.gpt-5.6-sol`。直接打 AWS 端点时不加前缀，只有经过 LiteLLM 时才需要。

| `bedrock_mantle/openai.gpt-5.6-sol` | `openai/openai.gpt-5.6-sol` \+ `api_base`  
---|---|---  
后端认证 | EC2 实例角色 SigV4，无需 key | 必须 Bedrock [API](<https://aws.amazon.com/cn/what-is/api/>) key  
凭证生命周期 | 临时凭证（`ASIA` 前缀），自动轮转，只在内存 | 短期 key 最长 12 小时；长期 key 需自行轮转，且必须落盘  
`/v1/chat/completions` | 支持（v1.90 会自动转成 Responses 调用） | 不支持，只能走 `/v1/responses`  
LiteLLM 版本 | ≥ 1.89 | 任意  
  
第二种写法之所以能工作，是因为 `openai/` 前缀让 LiteLLM 走 OpenAI 兼容客户端，再由 `api_base` 把请求指到 mantle 端点。流量确实进了 Bedrock，但这个客户端必须带一个 bearer token 才能认证，它不会去用实例角色 —— 实测不填 `api_key` 直接返回 `401 Invalid bearer token`。

所以选择很清楚：只要版本够，就用 `bedrock_mantle/`。 少一份需要生成、存储、轮转、还会过期的凭证，就少一类事故。第二种写法留给不便升级的老环境。

顺带一个容易踩的 UI 陷阱：v1.90.2 的 Web UI 里，Provider 下拉框没有 “[Amazon Bedrock Mantle](<https://aws.amazon.com/cn/bedrock/>)” 选项（枚举在前端代码里，但没渲染进列表）。变通做法是 Provider 选 “[Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>)”，然后在 LiteLLM Model Name 里手写完整的 `bedrock_mantle/openai.gpt-5.6-sol`。但这样 UI 会写入 `custom_llm_provider: bedrock`，它的优先级高于 model 字符串里的前缀，会把请求错误地路由到普通 bedrock 路径。补救方式是调 `/model/update` 把该字段改成 `bedrock_mantle`：
    
    
    curl -X POST http://<PROXY_HOST>/model/update \
      -H "Authorization: Bearer <MASTER_KEY>" -H 'Content-Type: application/json' \
      -d '{"model_name":"gpt-5.6-sol",
           "model_info":{"id":"<列表里的 model_id>"},
           "litellm_params":{"model":"bedrock_mantle/openai.gpt-5.6-sol",
                             "aws_region_name":"us-east-1",
                             "custom_llm_provider":"bedrock_mantle"}}'
    

还有一个不用管的报错：UI 上的 Test Connection 按钮对[GPT](<https://aws.amazon.com/cn/what-is/gpt/>)-5.x 永远失败，报 `functools.partial() got multiple values for keyword argument 'acompletion'`。原因是健康检查的代码硬编码走 chat 路径，属于 LiteLLM 的缺陷，与你的配置无关 —— 模型经 `/v1/responses` 是正常的。用真实请求验证，不要用那个按钮。

## **五、让 Codex 与 opencode 共存：一个 92 行的钩子**

如果你的团队只用 opencode 这类基于标准[AI](<https://aws.amazon.com/cn/what-is/artificial-intelligence/>) [SDK](<https://aws.amazon.com/cn/what-is/sdk/>) 的客户端，上面的配置就够了。但一旦把 Codex [CLI](<https://aws.amazon.com/cn/what-is/cli/>) 指向同一个网关，会看到 Bedrock 直接拒绝请求：
    
    
    400 validation_error: invalid request body:
    Invalid 'input': value did not match any expected variant
    

原因是两个客户端组装工具的方式不同：

  * opencode（`@ai-sdk/openai`）把工具放在顶层 `tools` 字段 —— 标准 OpenAI Responses schema，mantle 接受。
  * Codex（≥26.707，“Responses Lite” 序列化）把工具列表打包成 `input` 数组里的一个私有变体项：`{"type":"additional_tools","role":"developer","tools":[...]}`。而 mantle 的 `input` 只认 `message` / `reasoning` / `function_call` 这些标准类型，遇到 `additional_tools` 会拒绝整个请求体。



这不能靠配置解决。`drop_params` 只作用于顶层参数，碰不到 `input` 数组内部的元素 —— 实测加上 `drop_params` 与 `additional_drop_params` 后依然 400。

可行的办法是一个 pre-call 钩子：在请求进 mantle 之前，把 `additional_tools` 项从 `input` 里摘出来，合并进顶层 `tools`。完整代码见附录，这里说三个设计要点：

1\. 作用域守卫，保证混用安全。 钩子只在 `input` 里真的出现 `additional_tools` 时才改写，其余请求原样返回：
    
    
    if not found:
        # No additional_tools item present → non-Codex or already standard.
        return data
    

这是”Codex 和 opencode 共用一个网关”能成立的关键 —— opencode 的请求根本不会触发改写。

2\. 空 `tools` 的项也必须摘掉。 Codex 在后续轮次会重发 `additional_tools`，但 `tools` 是空列表（工具已在前面轮次建立）。空的也是非标准变体，mantle 一样拒绝。所以代码里把”是否发现该项”（`found`）和”该项是否带工具”（`extra_tools`）分开跟踪——只按后者判断会导致每个后续轮次都 400。

3\. 失败不阻断请求。 整段包在 `try/except` 里，改写出错时记日志并放行原始请求，不会因为这个钩子把流量打死。

部署（Docker compose 环境）：
    
    
    # 1. 文件放到宿主机
    sudo cp codex_additional_tools_flatten.py /opt/litellm/
    
    # 2. docker-compose.yml 的 litellm 服务下增加挂载
    #      - ./codex_additional_tools_flatten.py:/app/codex_additional_tools_flatten.py:ro
    
    # 3. config.yaml 的 litellm_settings 下注册 callback
    #    callbacks:
    #      - codex_additional_tools_flatten.codex_additional_tools_flatten_instance
    
    # 4. 必须用 up -d 重建（restart 不会挂载新卷）
    sudo docker compose --env-file /opt/litellm/.env up -d
    

注： 挂载点要在 `/app` 下，因为容器的工作目录是 `/app`，Python 的 `sys.path` 首项是当前目录，这样才能 `import` 到。 如果是 Amazon EKS 部署，机制等价但更简单：把 `.py` 作为 configmap 的一个 key，挂进 pod 即可，不需要碰节点上的文件。 

验证前后对比：

请求 | 装钩子前 | 装钩子后  
---|---|---  
Codex（含 `additional_tools`） | 400 拒绝 | 200 正常返回  
opencode（标准顶层 `tools`） | 200 | 200（未受影响）  
  
最后一个客户端侧的坑，与网关无关但很费时间：opencode 按模型名决定打哪个端点。 公开模型名里含 `gpt-5.6` 这类标识时它发 `/v1/responses`，否则发 `/v1/chat/completions`。同样的 `litellm_params`，模型名叫 `gpt-5.6-sol-184` 能用，改叫 `sol-184style` 就失败。所以给 mantle 模型起名时要保留标准的 `gpt-5.6` 字样，不要用无关的别名。

## **六、成本**

网关本身很便宜，真正的成本在 token。以 `us-east-1` 按需价格计算：

  * 网关（EC2）：t3.large 按需 $0.0832/小时，730 小时/月约 $60.74；30 GiB gp3 加密卷 $2.40/月。合计约 $63/月。如果只在工作时段开机，或换成 Graviton 机型 / Savings Plan，还能再降。
  * 模型 token（每百万 token，输入/输出）：

模型 | 输入 | 输出 | 上下文 | 定位  
---|---|---|---|---  
[GPT](<https://aws.amazon.com/cn/what-is/gpt/>)-5.6 Sol | $5.50 | $33.00 | 272K | 旗舰，前沿推理与 Agentic 编码  
[GPT](<https://aws.amazon.com/cn/what-is/gpt/>)-5.6 Terra | $2.20 | $13.20 | 272K | 性能接近[GPT](<https://aws.amazon.com/cn/what-is/gpt/>)-5.5，价格约四成  
[GPT](<https://aws.amazon.com/cn/what-is/gpt/>)-5.6 Luna | $0.22 | $1.32 | 272K | 最便宜，适合高频轻量调用  
[GPT](<https://aws.amazon.com/cn/what-is/gpt/>)-5.5 | $5.50 | $33.00 | 272K | 上一代旗舰  
[GPT](<https://aws.amazon.com/cn/what-is/gpt/>)-5.4 | $2.75 | $16.50 | 272K | 上一代中档  
gpt-oss-120b | $0.15 | $0.60 | 131K | 开源权重，成本极低  
gpt-oss-20b | $0.07 | $0.30 | 131K | 开源权重，最轻量  
  
  * 按”100 万输入 + 20 万输出”估算，Sol 约 $12.10、Terra 约 $4.84、Luna 约 $0.48，gpt-oss-20b 约 $0.13 —— 首尾相差近百倍。这正是把多个档位都接进同一个网关的实际意义：让上层按任务难度选档，而不是一律用旗舰。同一个虚拟 key 下切换模型只需改一个模型名。
  * Postgres：本文的测试形态跑在同一台 EC2 上，无额外费用。生产环境若改用[Amazon RDS](<https://aws.amazon.com/cn/rds/>)（建议，见部署章节的说明），需另计实例、存储与 Multi-AZ 费用 —— 以 `db.t4g.medium` 单可用区起步为 $0.065/小时（约 $47/月，不含存储），Multi-AZ 约为其两倍，具体以[RDS 定价页](<https://aws.amazon.com/rds/postgresql/pricing/>)为准。



定价以 [Amazon Bedrock 官方定价页](<https://aws.amazon.com/bedrock/pricing/>)与 EC2 定价页为准；模型单价会调整（本文写作期间 Terra 与 Luna 就下调过一次）。 

## **七、小结**

  * 一个入口收敛两个端点：客户端只需要一个地址、一个受限 key，就能用上 Mantle 引擎上的[GPT](<https://aws.amazon.com/cn/what-is/gpt/>)-5.x / gpt-oss 与 bedrock-runtime 上的 Claude，共 9 个模型，无需关心背后是哪个端点、哪套协议。
  * 零 key 落盘：网关到 Bedrock 全程用 EC2 实例角色的临时凭证（ASIA 前缀、自动轮转、只在内存），比长期[API](<https://aws.amazon.com/cn/what-is/api/>) key 少一整类泄露与轮转负担。
  * 多客户端共存：一个 92 行的 pre-call 钩子把 Codex 的私有请求变体展平成标准 schema，且只改写命中的请求，Codex 与 opencode 共用同一套网关互不干扰。



适用场景：团队统一编码 Agent 的模型出口、按任务难度在 Sol / Terra / Luna / gpt-oss 之间做成本分级（首尾差近百倍）、给不同项目发独立虚拟 key 做预算与用量归集。

关于环境定位： 本文给出的是测试与验证形态 —— 单台 EC2、[数据库](<https://aws.amazon.com/cn/what-is/database/>)与网关同机、无冗余。走向生产时至少要做三件事：数据库外置到[Amazon RDS](<https://aws.amazon.com/cn/rds/>) 并开启 Multi-AZ 与自动备份、网关放到 Auto Scaling 组或[Amazon EKS](<https://aws.amazon.com/cn/eks/>)/ECS 跑多副本、凭证迁到[AWS Secrets Manager](<https://aws.amazon.com/cn/secrets-manager/>) 管理。详见部署章节中的说明。

现在就在你自己的 [AWS 账户](<https://console.aws.amazon.com/console/home/>)上动手试试吧。

**下一步行动：**

**相关产品：**

  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=1>) — 通过统一[API](<https://aws.amazon.com/cn/what-is/api/>) 使用多家提供商的基础模型，含 Anthropic Claude 与 OpenAI [GPT](<https://aws.amazon.com/cn/what-is/gpt/>) 系列
  * [Amazon EC2](<https://aws.amazon.com/cn/ec2/?p=bl_pr_ec2_l=2>) — 运行网关的弹性计算实例
  * [AWS IAM](<https://aws.amazon.com/iam/?p=bl_pr_eks_l=4>) — 用实例角色替代长期密钥，实现免密钥的服务间认证



**相关文章：**

  * [OpenAI GPT-5.6 Sol、Terra 和 Luna 现已在 Amazon Bedrock 上正式推出](<https://aws.amazon.com/cn/blogs/china/openai-gpt-5-6-sol-terra-and-luna-are-now-generally-available-on-amazon-bedrock/?p=bl_ar_l=1>)
  * [试用 Amazon Bedrock 中的新控制台体验，该体验针对兼容 Anthropic 和 OpenAI 的 API 进行了优化](<https://aws.amazon.com/cn/blogs/china/try-the-new-console-experience-in-amazon-bedrock-optimized-for-anthropic-and-openai-compatible-apis/?p=bl_ar_l=2>)
  * [开始在 Amazon Bedrock 上使用 OpenAI GPT-5.5、GPT-5.4 模型和 Codex](<https://aws.amazon.com/cn/blogs/china/get-started-with-openai-gpt-5-5-gpt-5-4-models-and-codex-on-amazon-bedrock/?p=bl_ar_l=3>)
  * [Amazon Bedrock 中推出 Anthropic Claude Opus 4.7 模型](<https://aws.amazon.com/cn/blogs/china/introducing-anthropics-claude-opus-4-7-model-in-amazon-bedrock/?p=bl_ar_l=4>)
  * [用 Hermes Agent 在 AWS 上搭建投研助手](<https://aws.amazon.com/cn/blogs/china/building-investment-research-assistant-with-hermes-agent-on-aws/?p=bl_ar_l=5>)



## **八、参考链接**

  1. [Amazon Bedrock — Endpoint availability by models](<https://docs.aws.amazon.com/bedrock/latest/userguide/models-endpoint-availability.html>) —— 各模型支持 `bedrock-runtime` 还是 `bedrock-mantle` 的权威对照表。
  2. [Amazon Bedrock — GPT-5.6 Sol 模型卡](<https://docs.aws.amazon.com/bedrock/latest/userguide/model-card-openai-gpt-56-sol.html>) —— 模型 ID、区域可用性、支持的[API](<https://aws.amazon.com/cn/what-is/api/>)。
  3. [Amazon Bedrock — Inference using Chat Completions API ](<https://docs.aws.amazon.com/bedrock/latest/userguide/inference-chat-completions-mantle.html>)—— mantle 与 runtime 两个端点的调用差异。
  4. [Amazon Bedrock — API keys](<https://docs.aws.amazon.com/bedrock/latest/userguide/api-keys.html>) —— 短期/长期[API](<https://aws.amazon.com/cn/what-is/api/>) key 的权限继承与 SCP 管控条件键。
  5. [Exploring the zero operator access design of Mantle](<https://aws.amazon.com/blogs/machine-learning/exploring-the-zero-operator-access-design-of-mantle/>) —— Mantle 引擎的零运维人员访问设计，参照 AWS Nitro System 的安全架构。
  6. [LiteLLM — Bedrock Mantle provider](<https://docs.litellm.ai/docs/providers/bedrock_mantle>) —— `bedrock_mantle/` 路由前缀与配置示例。



_本文中的区域可用性、模型 ID 与[API](<https://aws.amazon.com/cn/what-is/api/>) 细节请以 AWS 官方文档为准。_

_文中生成式[AI](<https://aws.amazon.com/cn/what-is/artificial-intelligence/>) 服务在 AWS 海外区域提供；AWS 中国区域由西云数据与光环新网运营，服务可用性请另行确认。_

## **九、附录：钩子完整代码**

`codex_additional_tools_flatten.py`（92 行）：
    
    
    """
    Codex `additional_tools` → top-level `tools` flatten hook for LiteLLM.
    
    Newer Codex (>=26.707, "Responses Lite" serialization) packs its tool list into
    a non-standard input item of shape:
    
        {"type": "additional_tools", "role": "developer", "tools": [ ... ]}
    
    Bedrock Mantle's Responses API (bedrock-mantle) only accepts the STANDARD OpenAI
    Responses schema, whose `input` items are message/reasoning/function_call/etc.
    `additional_tools` is a Codex-private variant, so Mantle rejects the whole body
    with `400 validation_error: Invalid 'input': value did not match any expected
    variant`.
    
    Verified out-of-band: Mantle DOES accept those same tools when placed in the
    standard top-level `tools` field (including Codex's `custom`/`namespace` tool
    types). So this hook rewrites the request pre-call:
    
      1. find every input item with type == "additional_tools"
      2. merge each one's `tools` into the top-level `data["tools"]`
      3. drop the additional_tools item(s) from `data["input"]`
    
    Scope guard:
      - Only touches `aresponses` calls whose input actually contains an
        `additional_tools` item. Every other request returns untouched.
      - Wrapped in try/except: a rewrite failure logs and passes the ORIGINAL data
        through rather than dropping the request.
    """
    from litellm._logging import verbose_logger
    from litellm.integrations.custom_logger import CustomLogger
    
    # call_types that carry a Responses-API body (data["input"] / data["tools"])
    _RESPONSES_CALL_TYPES = {"aresponses"}
    
    
    class CodexAdditionalToolsFlatten(CustomLogger):
        async def async_pre_call_hook(
            self, user_api_key_dict, cache, data, call_type
        ):
            if call_type not in _RESPONSES_CALL_TYPES:
                return data
            try:
                input_items = data.get("input")
                if not isinstance(input_items, list):
                    return data
                # Collect additional_tools items without mutating during iteration.
                # NOTE: `found` (did we see an additional_tools item?) is tracked
                # SEPARATELY from `extra_tools` (did that item carry any tools?).
                # A later Codex turn re-sends the additional_tools item with an
                # EMPTY tools list (tools already established earlier in the thread).
                # That empty item is still a non-standard variant Mantle rejects, so
                # it MUST be dropped from input even when there is nothing to merge —
                # keying the rewrite off `extra_tools` alone left the empty item in
                # place and produced 400 "Invalid 'input'" on every follow-up turn.
                found = False
                extra_tools = []
                kept_items = []
                for item in input_items:
                    if isinstance(item, dict) and item.get("type") == "additional_tools":
                        found = True
                        tools = item.get("tools")
                        if isinstance(tools, list):
                            extra_tools.extend(tools)
                        # drop the item (do not keep it in input)
                    else:
                        kept_items.append(item)
                if not found:
                    # No additional_tools item present → non-Codex or already standard.
                    return data
                # Drop the additional_tools item(s) from input unconditionally.
                data["input"] = kept_items
                # Merge any carried tools into top-level tools (preserve existing).
                if extra_tools:
                    existing = data.get("tools")
                    merged = (existing if isinstance(existing, list) else []) + extra_tools
                    data["tools"] = merged
                verbose_logger.info(
                    "CodexAdditionalToolsFlatten: removed additional_tools item(s), "
                    "flattened %d tool(s) into top-level tools (model=%s)"
                    % (len(extra_tools), str(data.get("model", "")))
                )
            except Exception as e:
                # Never fail a request over this rewrite — log and pass original through.
                verbose_logger.warning(
                    "CodexAdditionalToolsFlatten: flatten failed, passing through: %s" % e
                )
            return data
    
    
    # Module-level instance referenced by config.yaml callbacks:
    #   callbacks: ["codex_additional_tools_flatten.codex_additional_tools_flatten_instance"]
    codex_additional_tools_flatten_instance = CodexAdditionalToolsFlatten()
    

[立即咨询 →](<https://aws.amazon.com/cn/contact-us/idp-ai/>)[ 从 AI 规划到落地实施，我们的专家团队为你全程护航。](<https://aws.amazon.com/cn/contact-us/idp-ai/>)

*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 韩坤尧

亚马逊云科技解决方案架构师，负责基于亚马逊云科技方案架构的咨询、设计和评估。在运维、安全、网络方面有丰富的经验，目前侧重于AI/大数据领域的研究。在加入 AWS 之前曾就职于 Juniper、Cisco 等公司，担任高级系统工程师，主要服务于国内外企业客户。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
