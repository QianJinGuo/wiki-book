---
tags: [wechat, article, claude, openai]
title: "将 AWS DevOps Agent 智能运维能力延伸到中国区"
url: https://aws.amazon.com/cn/blogs/china/aws-devops-agent-intelligent-operations/
source: rss
feed_name: AWS China Blog
sha256: c496cf12fa8a6af4a812bc1b28a6ccd78ebcc390e2ffe2312cb27675ae55a1b3
---
<div style="line-height: 1.6;font-size: 16px"> 
 <p style="background-color: #fafafa;padding: 20px;border-radius: 8px;margin-bottom: 30px;font-size: 16px;color: #5f6368">摘要：AWS DevOps Agent 是 AI 驱动的智能运维助手，但目前仅在 AWS Commercial 分区（aws 分区）可用，不支持中国区（aws-cn 分区）。本文介绍一种基于 MCP（Model Context Protocol）协议的桥接方案，通过在 Commercial 分区部署 MCP Server 作为中间层，实现 DevOps Agent 对中国区资源的跨分区运维管理。</p> 
 <div style="background-color: #f0f7ff;border: 1px solid #d0e3f7;padding: 20px;border-radius: 8px"> 
  <p><strong style="font-size: 18px;color: #333">目录</strong></p> 
  <div style="line-height: 1.8;margin: 0;padding: 0"> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">01</span>
    <a style="color: #333;text-decoration: none" href="#section1">一、引言</a>
   </div> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">02</span>
    <a style="color: #333;text-decoration: none" href="#section2">二、为什么不能直接用？—— 分区隔离约束</a>
   </div> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">03</span>
    <a style="color: #333;text-decoration: none" href="#section3">三、方案选型：MCP 协议桥接</a>
   </div> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">04</span>
    <a style="color: #333;text-decoration: none" href="#section4">四、架构设计</a>
   </div> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">05</span>
    <a style="color: #333;text-decoration: none" href="#section5">五、关键实现步骤</a>
   </div> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">06</span>
    <a style="color: #333;text-decoration: none" href="#section6">六、安全设计</a>
   </div> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">07</span>
    <a style="color: #333;text-decoration: none" href="#section7">七、效果验证</a>
   </div> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">08</span>
    <a style="color: #333;text-decoration: none" href="#section8">八、总结</a>
   </div> 
  </div> 
 </div> 
 <div style="height: 50px"></div> 
 <hr style="border: none;border-top: 1px solid #ccc;margin: 10px 0;width: 100%;margin-bottom: 30px"> 
 <div style="height: 30px"></div> 
 <h2 id="section1"><strong>一、引言</strong></h2> 
 <p style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/devops-agent/" target="_blank" rel="noopener">AWS DevOps Agent</a> 是一款 AI 驱动的全天候智能运维助手。它能够自动响应告警、排查故障根因、生成修复建议，并持续评估系统可靠性以预防事故。对于运维团队而言，DevOps Agent 意味着更快的 MTTR（平均恢复时间）和更少的凌晨被叫醒。</p> 
 <p style="color: #5f6368;font-size: 16px">然而，DevOps Agent 目前仅在 Commercial 分区的 <a href="https://docs.aws.amazon.com/devopsagent/latest/userguide/about-aws-devops-agent-supported-regions.html" target="_blank" rel="noopener">6 个 Region 提供服务</a>。值得注意的是，Agent Space 具备<a href="https://docs.aws.amazon.com/devopsagent/latest/userguide/about-aws-devops-agent-supported-regions.html" target="_blank" rel="noopener">跨 Region 监控能力</a>——即使在 us-east-1 创建 Agent Space，也可以管理同一分区内任意 Region 的资源（例如香港 ap-east-1）。但这种跨 Region 能力仅限于同一分区内；对于 AWS 中国区（aws-cn 分区），由于分区隔离的硬约束，DevOps Agent 无法直接访问。</p> 
 <p style="color: #5f6368;font-size: 16px">本文将介绍一种经过验证的桥接方案：通过 MCP 协议，让运行在 Commercial 分区的 DevOps Agent 能够远程管理中国区资源——无需等待服务正式落地中国区。</p> 
 <div style="height: 30px"></div> 
 <h2 id="section2"><strong>二、为什么不能直接用？—— 分区隔离约束</strong></h2> 
 <p style="color: #5f6368;font-size: 16px">在探讨解决方案之前，有必要理解为什么”简单地把 Agent 指向中国区”这条路走不通。</p> 
 <div style="height: 10px"></div> 
 <h3>2.1 分区是硬边界</h3> 
 <p style="color: #5f6368;font-size: 16px">AWS Commercial 分区（aws 分区）和 AWS 中国分区（aws-cn 分区）是两个完全独立的 partition。这意味着：</p> 
 <ul style="color: #5f6368;font-size: 16px"> 
  <li style="color: #5f6368;font-size: 16px">IAM 信任策略不能跨分区建立：你无法在 aws-cn 的 IAM Role 中信任一个 aws 分区的 Principal。尝试这样做会直接失败（<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">CREATE_FAILED</code>）。</li> 
  <li style="color: #5f6368;font-size: 16px">DevOps Agent 的 Secondary Account 机制依赖跨账号 AssumeRole：这是 Agent 管理多账号资源的标准方式，但对 aws-cn 分区物理不可行。</li> 
  <li style="color: #5f6368;font-size: 16px">IAM Roles Anywhere 解决不了根本问题：它能简化凭证管理（用证书替代长期 AK/SK），但不能让 DevOps Agent 直接调用 aws-cn 的 API endpoint。API 调用路径仍然需要桥接。</li> 
 </ul> 
 <p style="color: #5f6368;font-size: 16px">简言之，这不是一个配置问题，而是架构层面的硬约束。我们需要一个”中间人”来跨越这道边界。</p> 
 <div style="height: 30px"></div> 
 <h2 id="section3"><strong>三、方案选型：MCP 协议桥接</strong></h2> 
 <div style="height: 10px"></div> 
 <h3>3.1 什么是 MCP</h3> 
 <p style="color: #5f6368;font-size: 16px"><a href="https://modelcontextprotocol.io/" target="_blank" rel="noopener">MCP（Model Context Protocol）</a> 是一个标准化的协议，定义了 AI Agent 与外部工具之间的通信方式。你可以把它理解为 AI Agent 世界的”USB 接口”——任何遵循 MCP 协议的工具（MCP Server）都可以被 Agent（MCP Client）即插即用。</p> 
 <div style="height: 10px"></div> 
 <h3>3.2 为什么选择 MCP 桥接</h3> 
 <p style="color: #5f6368;font-size: 16px">DevOps Agent 原生支持作为 MCP Client 连接外部 MCP Server：</p> 
 <ul style="color: #5f6368;font-size: 16px"> 
  <li style="color: #5f6368;font-size: 16px">支持 Streamable HTTP transport</li> 
  <li style="color: #5f6368;font-size: 16px">支持多种认证方式（OAuth 2.0、API Key、Bearer Token）</li> 
  <li style="color: #5f6368;font-size: 16px">提供工具白名单机制，可精确控制暴露哪些能力</li> 
 </ul> 
 <p style="color: #5f6368;font-size: 16px">这意味着我们可以部署一个 MCP Server，让它：</p> 
 <p style="color: #5f6368;font-size: 16px">1. 对外暴露标准 MCP 接口给 DevOps Agent</p> 
 <p style="color: #5f6368;font-size: 16px">2. 对内使用 aws-cn 凭证调用中国区 API</p> 
 <p style="color: #5f6368;font-size: 16px">Agent 自身不需要持有中国区凭证，只需要知道如何与 MCP Server 通信。</p> 
 <div style="height: 10px"></div> 
 <h3>3.3 选择 awslabs/aws-api-mcp-server</h3> 
 <p style="color: #5f6368;font-size: 16px">我们选择 AWS 官方维护的 <a href="https://github.com/awslabs/mcp/tree/main/src/aws-api-mcp-server" target="_blank" rel="noopener">awslabs/aws-api-mcp-server</a> 作为 MCP Server 实现，原因是：</p> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
  <tbody> 
   <tr style="background-color: #232f3e;color: #fff"> 
    <td style="padding: 12px;border: 1px solid #ddd">特性</td> 
    <td style="padding: 12px;border: 1px solid #ddd">价值</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd"><code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">call_aws</code> 单工具设计</td> 
    <td style="padding: 12px;border: 1px solid #ddd">一个工具覆盖所有 AWS CLI 命令，无需为每个服务单独注册</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd"><code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">suggest_aws_commands</code></td> 
    <td style="padding: 12px;border: 1px solid #ddd">根据自然语言推荐 CLI 命令，覆盖模型知识截止后的新 API</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd"><code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">READ_OPERATIONS_ONLY</code></td> 
    <td style="padding: 12px;border: 1px solid #ddd">内置只读保护，比对 Service Authorization Reference 自动拦截写操作</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd"><code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">REQUIRE_MUTATION_CONSENT</code></td> 
    <td style="padding: 12px;border: 1px solid #ddd">写操作需用户确认，支持渐进式开放权限</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">官方维护</td> 
    <td style="padding: 12px;border: 1px solid #ddd">持续更新，安全性有保障</td> 
   </tr> 
  </tbody> 
 </table> 
 <div style="height: 10px"></div> 
 <h3>3.4 认证方案：ALB Header API Key</h3> 
 <p style="color: #5f6368;font-size: 16px">一个需要解决的问题是认证。<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">aws-api-mcp-server</code> 在 Streamable HTTP 模式下 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">AUTH_TYPE</code> 仅支持 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">oauth</code> 或 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">no-auth</code>，不支持原生 API Key 认证。</p> 
 <p style="color: #232f3e;font-size: 16px"><strong>3.4.1 我们的解法是认证下沉到 ALB</strong></p> 
 <ul style="color: #5f6368;font-size: 16px"> 
  <li style="color: #5f6368;font-size: 16px">MCP Server 自身设为 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">AUTH_TYPE=no-auth</code></li> 
  <li style="color: #5f6368;font-size: 16px">在 ALB Listener Rule 中匹配 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">X-API-Key</code> header</li> 
  <li style="color: #5f6368;font-size: 16px">匹配成功 → 转发到 MCP Server；不匹配 → 返回 401 Unauthorized</li> 
  <li style="color: #5f6368;font-size: 16px">DevOps Agent 注册时使用 API Key 方式，header 自动附加 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">X-API-Key</code></li> 
 </ul> 
 <p style="color: #5f6368;font-size: 16px">这种方式简单、可靠，且不引入额外的认证基础设施（如 Cognito）。</p> 
 <div style="height: 30px"></div> 
 <h2 id="section4"><strong>四、架构设计</strong></h2> 
 <div style="height: 10px"></div> 
 <h3>4.1 整体架构</h3> 
 <table style="margin: 20px 0;width: 600px"> 
  <tbody> 
   <tr> 
    <td style="text-align: center;padding: 20px;background-color: #f9f9f9;border-radius: 8px;width: 600px"><a href="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/07/aws-devops-agent-intelligent-operations-1.jpg"><img style="width: 560px" src="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/07/aws-devops-agent-intelligent-operations-1.jpg" alt=""></a></td> 
   </tr> 
  </tbody> 
 </table> 
 <div style="height: 10px"></div> 
 <h3>4.2 数据流</h3> 
 <ol style="color: #5f6368;font-size: 16px"> 
  <li style="color: #5f6368;font-size: 16px">用户在 DevOps Agent 控制台提问（如”查一下 cn-north-1 有哪些运行中的 EC2″）</li> 
  <li style="color: #5f6368;font-size: 16px">Agent 决定调用 MCP Server 的 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">call_aws</code> 工具</li> 
  <li style="color: #5f6368;font-size: 16px">请求经 ALB（校验 API Key）转发到 EC2 上的 MCP Server</li> 
  <li style="color: #5f6368;font-size: 16px">MCP Server 使用本地 aws-cn profile 的凭证，执行 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">aws ec2 describe-instances --region cn-north-1</code></li> 
  <li style="color: #5f6368;font-size: 16px">结果沿原路返回，Agent 解析并以自然语言呈现给用户</li> 
 </ol> 
 <div style="height: 10px"></div> 
 <h3>4.3 部署位置与凭证方案</h3> 
 <p style="color: #5f6368;font-size: 16px">本文方案将 MCP Server 部署在 Commercial 分区（us-east-1），通过 IAM Roles Anywhere 获取中国区临时凭证，优先保障快速验证和 DevOps Agent 连接稳定性。生产环境中，建议根据安全合规要求选择以下凭证方案：</p> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
  <tbody> 
   <tr style="background-color: #232f3e;color: #fff"> 
    <td style="padding: 12px;border: 1px solid #ddd">维度</td> 
    <td style="padding: 12px;border: 1px solid #ddd">IAM Roles Anywhere（MCP Server 部署在 Commercial 分区）</td> 
    <td style="padding: 12px;border: 1px solid #ddd">EC2/ECS Role（MCP Server 部署在中国区）</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">凭证类型</td> 
    <td style="padding: 12px;border: 1px solid #ddd">临时凭证（STS，默认 1 小时 TTL）</td> 
    <td style="padding: 12px;border: 1px solid #ddd">自动轮转，无需管理</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">凭证是否出境</td> 
    <td style="padding: 12px;border: 1px solid #ddd">是（临时凭证在 Commercial 分区侧使用）</td> 
    <td style="padding: 12px;border: 1px solid #ddd">否（凭证不离开中国区）</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">额外依赖</td> 
    <td style="padding: 12px;border: 1px solid #ddd">PKI 基础设施（CA、证书签发、CRL 吊销）</td> 
    <td style="padding: 12px;border: 1px solid #ddd">无</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">网络路径</td> 
    <td style="padding: 12px;border: 1px solid #ddd">Agent → Commercial 分区 MCP Server（稳定）→ 跨境 → aws-cn API</td> 
    <td style="padding: 12px;border: 1px solid #ddd">Agent → 跨境 → 中国区 MCP Server → aws-cn API（本地调用）</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">域名与证书</td> 
    <td style="padding: 12px;border: 1px solid #ddd">ACM 自动管理</td> 
    <td style="padding: 12px;border: 1px solid #ddd">中国区需自行管理证书（ICP 备案视情况而定）</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">运维复杂度</td> 
    <td style="padding: 12px;border: 1px solid #ddd">中（需维护证书生命周期）</td> 
    <td style="padding: 12px;border: 1px solid #ddd">低（IAM Role 原生集成）</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">适合场景</td> 
    <td style="padding: 12px;border: 1px solid #ddd">不方便迁移 MCP Server，但需消除长期凭证</td> 
    <td style="padding: 12px;border: 1px solid #ddd">合规要求高，或中国区已有成熟基础设施</td> 
   </tr> 
  </tbody> 
 </table> 
 <div style="height: 30px"></div> 
 <h2 id="section5"><strong>五、关键实现步骤</strong></h2> 
 <div style="height: 10px"></div> 
 <h3>5.1 部署 MCP Server</h3> 
 <p style="color: #5f6368;font-size: 16px">在 EC2 上安装并启动 <a href="https://github.com/awslabs/mcp/tree/main/src/aws-api-mcp-server" target="_blank" rel="noopener">awslabs/aws-api-mcp-server</a>：</p> 
 <p style="color: #5f6368;font-size: 16px"># 安装<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384"> uv</code>（<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">Python </code>包管理工具）</p> 
 <div class="hide-language"> 
  <pre class="unlimited-height-code"><code class="lang-powershell">curl -LsSf https://astral.sh/uv/install.sh | sh
# 安装 IAM Roles Anywhere credential helper
curl -LsSf https://rolesanywhere.amazonaws.com/releases/1.1.1/X86_64/Linux/aws_signing_helper \
  -o /usr/local/bin/aws_signing_helper
chmod +x /usr/local/bin/aws_signing_helper
# 通过 uvx 启动 MCP Server（或配置为 systemd 服务）
uvx awslabs.aws-api-mcp-server@latest
</code></pre> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">以 systemd 服务形式运行时，完整配置如下：</p> 
 <div class="hide-language"> 
  <pre class="unlimited-height-code"><code class="lang-powershell">[Unit]
Description=AWS API MCP Server (aws-cn bridge)
After=network-online.target
Wants=network-online.target
[Service]
Type=simple
User=root
Environment="HOME=/home/ec2-user"
Environment="PATH=/root/.local/bin:/usr/local/bin:/usr/bin:/bin"
Environment="AWS_API_MCP_TRANSPORT=streamable-http"
Environment="AWS_API_MCP_HOST=0.0.0.0"
Environment="AWS_API_MCP_PORT=8000"
Environment="AWS_API_MCP_ALLOWED_HOSTS=your-mcp-server.example.com"
Environment="AWS_API_MCP_ALLOWED_ORIGINS=*"
Environment="AWS_API_MCP_PROFILE_NAME=cn-profile"
Environment="READ_OPERATIONS_ONLY=true"
Environment="AUTH_TYPE=no-auth"
Environment="AWS_CONFIG_FILE=/home/ec2-user/.aws/config"
ExecStart=/root/.local/bin/uvx awslabs.aws-api-mcp-server@latest
Restart=on-failure
RestartSec=5
StandardOutput=append:/var/log/mcp-cn-bridge.log
StandardError=append:/var/log/mcp-cn-bridge.log
[Install]
WantedBy=multi-user.target
</code></pre> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">MCP Server 通过 boto3 的 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">credential_process</code> 机制获取中国区临时凭证。具体流程是在 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">~/.aws/config</code> 中配置 <a href="https://docs.aws.amazon.com/rolesanywhere/latest/userguide/credential-helper.html" target="_blank" rel="noopener">IAM Roles Anywhere credential helper</a>：</p> 
 <div class="hide-language"> 
  <pre class="unlimited-height-code"><code class="lang-powershell">[profile cn-profile]
region = cn-north-1
credential_process = /usr/local/bin/aws_signing_helper credential-process \
  --certificate /home/ec2-user/.aws/roles-anywhere/client.crt \
  --private-key /home/ec2-user/.aws/roles-anywhere/client.key \
  --trust-anchor-arn &lt;your-trust-anchor-arn&gt; \
  --profile-arn &lt;your-profile-arn&gt; \
  --role-arn &lt;your-role-arn&gt; \
  --endpoint https://rolesanywhere.cn-north-1.amazonaws.com.cn \
  --region cn-north-1
</code></pre> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">其中中国区侧需要预先创建以下资源（参考 <a href="https://docs.aws.amazon.com/rolesanywhere/latest/userguide/getting-started.html" target="_blank" rel="noopener">IAM Roles Anywhere Getting Started</a>）：</p> 
 <p style="color: #5f6368;font-size: 16px">1. Trust Anchor — 绑定你的 CA 证书（自签 CA 或 ACM Private CA）</p> 
 <p style="color: #5f6368;font-size: 16px">2. IAM Role — 信任 rolesanywhere.amazonaws.com，附加只读权限</p> 
 <p style="color: #5f6368;font-size: 16px">3. Profile — 关联 IAM Role，设置凭证有效期（如 3600 秒）</p> 
 <p style="color: #5f6368;font-size: 16px">客户端证书和私钥由 <a href="https://github.com/aws/rolesanywhere-credential-helper" target="_blank" rel="noopener">aws_signing_helper</a> 使用，每次被 boto3 调用时向中国区 IAM Roles Anywhere 换取临时 STS 凭证（默认 1 小时 TTL，过期自动刷新）。</p> 
 <p style="color: #232f3e;font-size: 16px"><strong>5.1.1 需要注意的坑</strong></p> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
  <tbody> 
   <tr style="background-color: #232f3e;color: #fff"> 
    <td style="padding: 12px;border: 1px solid #ddd">问题</td> 
    <td style="padding: 12px;border: 1px solid #ddd">原因</td> 
    <td style="padding: 12px;border: 1px solid #ddd">解决方式</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd"><code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">ProfileNotFound</code></td> 
    <td style="padding: 12px;border: 1px solid #ddd">systemd 默认 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">HOME=/</code>，读不到用户目录的 config（含 credential_process）</td> 
    <td style="padding: 12px;border: 1px solid #ddd">显式设置 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">HOME</code> 和 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">AWS_CONFIG_FILE</code></td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd"><code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">Invalid Host header</code> (400)</td> 
    <td style="padding: 12px;border: 1px solid #ddd">MCP Server 对 Host header 做白名单校验</td> 
    <td style="padding: 12px;border: 1px solid #ddd">设置 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">AWS_API_MCP_ALLOWED_HOSTS</code> 为你的域名</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">ALB 健康检查失败</td> 
    <td style="padding: 12px;border: 1px solid #ddd">MCP Server 没有 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">/health</code> 端点</td> 
    <td style="padding: 12px;border: 1px solid #ddd">健康检查路径改为 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">/mcp</code>，matcher 设为 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">406</code></td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd"><code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">uvx: not found</code></td> 
    <td style="padding: 12px;border: 1px solid #ddd">systemd PATH 不含 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">~/.local/bin</code></td> 
    <td style="padding: 12px;border: 1px solid #ddd">在 service unit 中显式设置完整 PATH</td> 
   </tr> 
  </tbody> 
 </table> 
 <div style="height: 10px"></div> 
 <h3>5.2 配置 ALB 认证</h3> 
 <div class="hide-language"> 
  <pre class="unlimited-height-code"><code class="lang-powershell">ALB Listener Rule 配置：
  Priority 10:
    Condition: HTTP Header X-API-Key == &lt;your-api-key&gt;
    Action: Forward to Target Group
  Default:
    Action: Fixed Response 401 "Unauthorized"
</code></pre> 
 </div> 
 <ul style="color: #5f6368;font-size: 16px"> 
  <li style="color: #5f6368;font-size: 16px">ALB Security Group 仅放行 <a href="https://docs.aws.amazon.com/devopsagent/latest/userguide/aws-devops-agent-security.html" target="_blank" rel="noopener">DevOps Agent 出口 IP</a>，拒绝其他来源访问</li> 
  <li style="color: #5f6368;font-size: 16px">使用 ACM 管理 HTTPS 证书（<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">your-mcp-server.example.com</code>）</li> 
  <li style="color: #5f6368;font-size: 16px">Route 53 A 记录指向 ALB alias</li> 
 </ul> 
 <div style="height: 10px"></div> 
 <h3>5.3 注册到 DevOps Agent</h3> 
 <p style="color: #5f6368;font-size: 16px">通过 CLI 完成注册：</p> 
 <p style="color: #232f3e;font-size: 16px"><strong>5.3.1 Step 1：注册 MCP Server</strong></p> 
 <div class="hide-language"> 
  <pre class="unlimited-height-code"><code class="lang-powershell">aws devops-agent register-service \
  --service mcpserver \
  --service-details '{
    "mcpserver": {
      "name": "aws-cn-bridge",
      "endpoint": "https://your-domain.example.com/mcp",
      "description": "Bridge to AWS China via MCP",
      "authorizationConfig": {
        "apiKey": {
          "apiKeyName": "api-key",
          "apiKeyValue": "&lt;your-api-key&gt;",
          "apiKeyHeader": "X-API-Key"
        }
      }
    }
  }' \
  --name "aws-cn-bridge" \
  --region us-east-1
</code></pre> 
 </div> 
 <p style="color: #232f3e;font-size: 16px"><strong>5.3.2 Step 2：关联到 Agent Space</strong></p> 
 <div class="hide-language"> 
  <pre class="unlimited-height-code"><code class="lang-powershell">aws devops-agent associate-service \
  --agent-space-id &lt;your-agent-space-id&gt; \
  --service-id &lt;service-id-from-step-1&gt; \
  --configuration '{
    "mcpserver": {
      "tools": ["call_aws", "suggest_aws_commands"]
    }
  }' \
  --region us-east-1
</code></pre> 
 </div> 
 <div style="background-color: #fff3cd;border-left: 4px solid #ffc107;padding: 15px 20px;border-radius: 4px;margin: 20px 0;color: #5f6368;font-size: 16px"> 
  <p><strong style="color: #333"><img src="https://s.w.org/images/core/emoji/14.0.0/72x72/26a0.png" alt="⚠" class="wp-smiley" style="height: 1em; max-height: 1em;"> 重要提示：</strong></p> 
  <p style="margin: 10px 0 0 0;font-size: 16px">执行 register-service 前，MCP Server 必须已启动且可达。DevOps Agent 会在注册时尝试连接验证，否则报 ValidationException。</p> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">也可以通过 DevOps Agent 控制台完成同样的操作：在 Capability Providers → MCP Server → Register 中填入 endpoint 和 API Key 信息，然后在 Agent Space 中添加该 MCP Server 并勾选需要暴露的工具。</p> 
 <div style="height: 30px"></div> 
 <h2 id="section6"><strong>六、安全设计</strong></h2> 
 <p style="color: #5f6368;font-size: 16px">本方案的安全保障分为多个层次：</p> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
  <tbody> 
   <tr style="background-color: #232f3e;color: #fff"> 
    <td style="padding: 12px;border: 1px solid #ddd">层</td> 
    <td style="padding: 12px;border: 1px solid #ddd">措施</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">网络</td> 
    <td style="padding: 12px;border: 1px solid #ddd">ALB Security Group 仅允许 <a href="https://docs.aws.amazon.com/devopsagent/latest/userguide/aws-devops-agent-security.html" target="_blank" rel="noopener">DevOps Agent 出口 IP</a>（AWS 官方公布的固定 IP 列表）</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">认证</td> 
    <td style="padding: 12px;border: 1px solid #ddd">ALB Listener Rule 匹配 X-API-Key header，不匹配直接返回 401</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">凭证存储</td> 
    <td style="padding: 12px;border: 1px solid #ddd">客户端证书+私钥存储在 Secrets Manager，通过 IAM Roles Anywhere 获取临时凭证</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">权限控制</td> 
    <td style="padding: 12px;border: 1px solid #ddd">MCP Server 启用 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">READ_OPERATIONS_ONLY</code>；中国区 IAM Role 遵循最小权限原则</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">审计</td> 
    <td style="padding: 12px;border: 1px solid #ddd">MCP Server 每次调用记录结构化日志，可对接 CloudWatch Logs</td> 
   </tr> 
  </tbody> 
 </table> 
 <div style="height: 10px"></div> 
 <h3>6.1 关于数据合规</h3> 
 <p style="color: #5f6368;font-size: 16px">需要注意：中国区资源的数据（如 EC2 实例信息、CloudWatch 指标等）会通过 Agent 流转到 Commercial 分区的 Bedrock 模型进行推理。如果你的场景涉及敏感数据，需评估是否符合数据出境合规要求。在只读模式下，流转的主要是元数据和监控指标，通常不涉及业务数据本身。</p> 
 <div style="height: 30px"></div> 
 <h2 id="section7"><strong>七、效果验证</strong></h2> 
 <p style="color: #5f6368;font-size: 16px">部署完成后，在 DevOps Agent 控制台发起对话：</p> 
 <p style="color: #5f6368;font-size: 16px">用户：查一下<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384"> cn-north-1 </code>有哪些运行中的<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384"> EC2 </code>实例</p> 
 <p style="color: #5f6368;font-size: 16px">Agent 的执行链路：</p> 
 <p style="color: #5f6368;font-size: 16px">1. 理解意图 → 决定调用 call_aws 工具</p> 
 <p style="color: #5f6368;font-size: 16px">2. 生成命令：aws ec2 describe-instances –region cn-north-1 –filters Name=instance-state-name,Values=running</p> 
 <p style="color: #5f6368;font-size: 16px">3. 通过 MCP Server 执行，获取结果</p> 
 <p style="color: #5f6368;font-size: 16px">4. 以自然语言呈现实例列表（Instance ID、类型、启动时间等）</p> 
 <p style="color: #5f6368;font-size: 16px">整个过程对用户透明——你只需用自然语言提问，Agent 自动处理跨分区的复杂性。</p> 
 <div style="height: 10px"></div> 
 <h3>7.1 关于计费</h3> 
 <p style="color: #5f6368;font-size: 16px">DevOps Agent 按 agent-second 计费（$0.0083/秒），仅在 Agent 活跃工作时产生费用。新客户有 2 个月免费试用额度。此外，Enterprise Support 客户可享受高达 75% 的 Support 费用抵扣。详情参考 <a href="https://aws.amazon.com/devops-agent/pricing/" target="_blank" rel="noopener">DevOps Agent 定价页面</a>。</p> 
 <div style="height: 30px"></div> 
 <h2 id="section8"><strong>八、总结</strong></h2> 
 <p style="color: #5f6368;font-size: 16px">通过 MCP 协议桥接，我们实现了一条可行的路径：让 <a href="https://aws.amazon.com/cn/devops-agent/">AWS DevOps Agent</a> 跨越分区隔离，管理中国区资源。核心思路是利用 DevOps Agent 原生的 MCP Client 能力，在 Commercial 分区部署一个 MCP Server 作为”翻译层”，将 Agent 的指令转化为对 aws-cn API 的调用。</p> 
 <p style="color: #5f6368;font-size: 16px">这个方案适合以下场景：</p> 
 <ul style="color: #5f6368;font-size: 16px"> 
  <li style="color: #5f6368;font-size: 16px">在中国区运行核心业务，同时希望利用 DevOps Agent 的 AI 运维能力</li> 
  <li style="color: #5f6368;font-size: 16px">需要统一的运维入口管理 Commercial 分区和中国区资源</li> 
  <li style="color: #5f6368;font-size: 16px">希望在 DevOps Agent 正式支持中国区之前，提前获得 AI 运维体验</li> 
 </ul> 
 <p style="color: #5f6368;font-size: 16px"><strong style="color: #333"><img src="https://s.w.org/images/core/emoji/14.0.0/72x72/27a1.png" alt="➡" class="wp-smiley" style="height: 1em; max-height: 1em;"> 下一步行动：</strong></p> 
 <p style="color: #5f6368;font-size: 16px"><strong>参考资源：</strong></p> 
 <ul style="color: #5f6368;font-size: 16px"> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://github.com/panlm/devops-agent-ui" target="_blank" rel="noopener">DevOps Agent 前端操作界面（GitHub）</a></li> 
 </ul> 
 <p style="color: #5f6368;font-size: 16px"><strong>相关产品：</strong></p> 
 <ul style="color: #5f6368;font-size: 16px"> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/devops-agent/?p=bl_pr_devops-agent_l=1">Amazon DevOps Agent</a> — 解决和预防事故的代理</li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=2">Amazon IAM</a> — 身份管理和访问权限</li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/ec2/?p=bl_pr_ec2_l=3">Amazon EC2</a> — 安全且可调整大小的计算容量</li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/cloudwatch/?p=bl_pr_cloudwatch_l=4">Amazon CloudWatch</a> — 可观测性工具</li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=5">Amazon Bedrock</a> — 用于构建生成式人工智能应用程序和代理的端到端平台</li> 
 </ul> 
 <p style="color: #5f6368;font-size: 16px"><strong>相关文章：</strong></p> 
 <ul style="color: #5f6368;font-size: 16px"> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/blogs/china/based-on-aws-devops-agent-build-ai