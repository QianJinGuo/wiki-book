---
tags: [wechat, article, claude, openai]
title: "AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第二篇"
url: https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-2/
source: rss
feed_name: AWS China ML
sha256: b9aa29f711bb368c079498a149fd5a4d266c41ba0d975fa9f49ed510223ed3cc
---
<div style="line-height: 1.6;font-size: 16px"> 
 <p>
 <!-- 摘要区 --></p> 
 <p style="background-color: #fafafa;padding: 20px;border-radius: 8px;margin-bottom: 30px;font-size: 16px;color: #5f6368">摘要：基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构。全系列 6 篇，涵盖 Replatform 与 Refactor 两种策略。本篇为第二篇：环境准备与代码获取，安装依赖工具、配置 AWS 环境、克隆项目代码、了解 cdk.json 配置项，以及初始化 CDK。</p> 
 <p>
 <!-- 目录区 --></p> 
 <div style="background-color: #f0f7ff;border: 1px solid #d0e3f7;padding: 20px;border-radius: 8px"> 
 <p><strong style="font-size: 18px;color: #333">目录</strong></p> 
 <div style="line-height: 1.8;margin: 0;padding: 0"> 
 <div style="margin: 0;padding: 0">
 <span style="color: #999;margin-right: 8px">01</span>
 <a style="color: #333;text-decoration: none" href="#section1">一、环境准备</a>
 </div> 
 <div style="margin: 0;padding: 0">
 <span style="color: #999;margin-right: 8px">02</span>
 <a style="color: #333;text-decoration: none" href="#section2">二、获取代码</a>
 </div> 
 <div style="margin: 0;padding: 0">
 <span style="color: #999;margin-right: 8px">03</span>
 <a style="color: #333;text-decoration: none" href="#section3">三、CDK 初始化（Bootstrap）</a>
 </div> 
 <div style="margin: 0;padding: 0">
 <span style="color: #999;margin-right: 8px">04</span>
 <a style="color: #333;text-decoration: none" href="#section4">相关链接</a>
 </div> 
 </div> 
 </div> 
 <div style="height: 50px"></div> 
 <!-- 横线 -->
 <p></p> 
 <hr style="border: none;border-top: 1px solid #ccc;margin: 10px 0;width: 100%;margin-bottom: 30px"> 
 <p>
 <!-- 正文 --></p> 
 <div style="height: 30px"></div> 
 <h2 id="section1">一、环境准备</h2> 
 <p style="color: #5f6368;font-size: 16px">在开始部署之前，需要准备好开发环境。以下步骤假设你使用的是 Amazon Linux 2023 或类似的 Linux 环境（比如 AWS CloudShell 或 <a href="https://aws.amazon.com/cn/ec2/">Amazon EC2</a> 实例）。</p> 
 <div style="height: 10px"></div> 
 <h3>第一步：设置 AWS 账号和区域环境变量</h3> 
 <p style="color: #5f6368;font-size: 16px">先告诉系统你要部署到哪个 AWS 账号的哪个区域。</p> 
 <div class="hide-language"> 
 <pre class="unlimited-height-code"><code class="lang-powershell">export TARGET_REGION=us-west-2
export CDK_DEFAULT_REGION=$TARGET_REGION
export CDK_DEFAULT_ACCOUNT=$(aws sts get-caller-identity --query Account --output text)
export PATH="$HOME/.local/bin:$PATH"
mkdir -p ~/openclaw-$TARGET_REGION &amp;&amp; cd ~/openclaw-$TARGET_REGION
</code></pre> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：AWS CDK 需要知道部署目标（账号 + 区域）才能工作。创建一个专属工作目录便于管理，如果以后想部署到多个区域，每个区域一个目录互不干扰。</p> 
 <div style="height: 10px"></div> 
 <h3>第二步：安装基础依赖</h3> 
 <div class="hide-language"> 
 <pre class="unlimited-height-code"><code class="lang-powershell">sudo dnf update -y
sudo dnf install -y python3.12-pip screen nodejs20 docker
</code></pre> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：</p> 
 <ul style="color: #5f6368;font-size: 16px"> 
 <li style="color: #5f6368;font-size: 16px">Python 3.12：CDK 应用用 Python 编写</li> 
 <li style="color: #5f6368;font-size: 16px">Node.js 20：CDK CLI 工具需要 Node.js 运行</li> 
 <li style="color: #5f6368;font-size: 16px">Docker：本文用 CodeBuild 模式构建镜像，实际不会用到本地 Docker。安装它是为了环境完整性和后续可能的本地调试</li> 
 <li style="color: #5f6368;font-size: 16px">screen：部署过程比较长，用 screen 可以防止 SSH 断开导致中断</li> 
 </ul> 
 <div style="height: 10px"></div> 
 <h3>第三步：启动 Docker 服务</h3> 
 <div class="hide-language"> 
 <pre class="unlimited-height-code"><code class="lang-powershell">sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
newgrp docker
docker -v
</code></pre> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：让当前用户不用 sudo 就能运行 docker 命令。最后 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">docker -v</code> 验证能正常使用。</p> 
 <div style="height: 10px"></div> 
 <h3>第四步：配置 <a href="https://aws.amazon.com/cn/xray/">AWS X-Ray</a> 日志权限</h3> 
 <div class="hide-language"> 
 <pre class="unlimited-height-code"><code class="lang-powershell">aws logs put-resource-policy \
 --policy-name XRayLogGroupPolicy \
 --policy-document '{"Version":"2012-10-17","Statement":[{"Effect":"Allow","Principal":{"Service":"xray.amazonaws.com"},"Action":["logs:CreateLogGroup","logs:CreateLogStream","logs:PutLogEvents","logs:PutRetentionPolicy"],"Resource":"*"}]}' \
 --region $TARGET_REGION
aws xray update-trace-segment-destination \
 --destination CloudWatchLogs \
 --region $TARGET_REGION
</code></pre> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：什么是 AWS X-Ray？AWS X-Ray 是分布式追踪服务，能完整记录一次用户请求经过的所有组件（API Gateway → Router Lambda → AgentCore 容器 → Bedrock → Guardrails）及每段耗时。这对于迁移后的多组件架构尤为重要 — 原来单进程时出问题看一份日志就行，现在十几个组件串联，X-Ray 能把整条链路串起来，哪里慢、哪里错一目了然。</p> 
 <p style="color: #5f6368;font-size: 16px">这两条命令做什么？第一条授权 X-Ray 服务往 <a href="https://aws.amazon.com/cn/cloudwatch/">Amazon CloudWatch</a> Logs 写追踪数据；第二条把 X-Ray 追踪数据的输出目标设为 CloudWatch Logs，这样日志和追踪数据都在一个地方，排错更方便。</p> 
 <div style="height: 10px"></div> 
 <h3>第五步：检查并开通 Amazon Bedrock Claude 模型访问</h3> 
 <div class="hide-language"> 
 <pre class="unlimited-height-code"><code class="lang-powershell">aws bedrock list-foundation-models \
 --region $TARGET_REGION \
 --query "modelSummaries[?contains(modelId,'claude')].[modelId]" \
 --output table
</code></pre> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：Amazon Bedrock 的模型访问是账号级别的设置，每个 AWS 账号首次使用 Bedrock 时都要手动开通想用的模型，否则调用会返回 AccessDeniedException。</p> 
 <p style="color: #5f6368;font-size: 16px">上面命令的作用：列出当前区域你已经能访问的 Claude 模型。如果列表为空或缺少你要用的模型（本项目默认用 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">global.anthropic.claude-sonnet-4-6</code>），需要到 Bedrock 控制台开通。</p> 
 <p style="color: #5f6368;font-size: 16px">如何开通模型访问（控制台操作）</p> 
 <ol style="color: #5f6368;font-size: 16px"> 
 <li style="color: #5f6368;font-size: 16px">进入 Amazon Bedrock 控制台（确保区域切到你部署的目标区域）</li> 
 <li style="color: #5f6368;font-size: 16px">左侧菜单找到 Model access（模型访问）</li> 
 <li style="color: #5f6368;font-size: 16px">点击 Modify model access 或 Enable specific models</li> 
 <li style="color: #5f6368;font-size: 16px">勾选 Anthropic 下的 Claude Sonnet 4（或项目配置的其他模型）</li> 
 <li style="color: #5f6368;font-size: 16px">Anthropic 模型需要填一个简短的用例说明表单（What’s your industry / use case 等）</li> 
 <li style="color: #5f6368;font-size: 16px">提交后等待状态变成 Access granted</li> 
 </ol> 
 <p style="color: #5f6368;font-size: 16px">Claude 系列模型现在通常几秒到几分钟就能开通。如果命令已经能列出 Claude 模型，说明已经开通过，可以跳过控制台操作。</p> 
 <div style="height: 10px"></div> 
 <h3>第六步：安装 AWS CDK 和 AgentCore Starter Toolkit</h3> 
 <div class="hide-language"> 
 <pre class="unlimited-height-code"><code class="lang-powershell">sudo npm install -g aws-cdk
cdk --version
pip3.12 install bedrock-agentcore-starter-toolkit --break-system-packages
echo 'export PATH="$HOME/.local/bin:$PATH"' &gt;&gt; ~/.bashrc
agentcore --help
</code></pre> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：</p> 
 <ul style="color: #5f6368;font-size: 16px"> 
 <li style="color: #5f6368;font-size: 16px">AWS CDK：用于部署 Phase 1 和 Phase 3 的基础设施代码</li> 
 <li style="color: #5f6368;font-size: 16px">AgentCore Starter Toolkit：CDK 不直接管理 AgentCore Runtime，需要通过这个工具在 Phase 2 创建 Runtime 和构建镜像</li> 
 </ul> 
 <div style="height: 10px"></div> 
 <h3>第七步：运行环境检查脚本</h3> 
 <div class="hide-language"> 
 <pre class="unlimited-height-code"><code class="lang-powershell">cat &gt; check.sh /dev/null; then echo "<img src="https://s.w.org/images/core/emoji/14.0.0/72x72/2705.png" alt="✅" class="wp-smiley" style="height: 1em; max-height: 1em;"> $1"; ((PASS++)); else echo "<img src="https://s.w.org/images/core/emoji/14.0.0/72x72/274c.png" alt="❌" class="wp-smiley" style="height: 1em; max-height: 1em;"> $1"; ((FAIL++)); fi
}
check "AWS CLI v2" "aws --version 2&gt;&amp;1 | grep -q 'aws-cli/2'"
check "AWS 凭证" "aws sts get-caller-identity"
check "Node.js &gt;= 18" "node -e 'var v=parseInt(process.version.slice(1));process.exit(v&gt;=18?0:1)'"
check "Python &gt;= 3.11" "python3.12 -c 'import sys; exit(0 if sys.version_info &gt;= (3,11) else 1)'"
check "Docker" "docker version"
check "AWS CDK v2" "cdk --version 2&gt;&amp;1 | grep -q '^2'"
check "agentcore CLI" "agentcore --help"
echo ""
echo "通过: $PASS / 失败: $FAIL"
[ $FAIL -eq 0 ] &amp;&amp; echo "???? 环境就绪！" || echo "<img src="https://s.w.org/images/core/emoji/14.0.0/72x72/26a0.png" alt="⚠" class="wp-smiley" style="height: 1em; max-height: 1em;"> 请修复上述失败项"
EOF
bash check.sh
</code></pre> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：一次性检查 7 项必备工具是否正常。全部通过才能进入下一步，避免后面部署时才发现某个工具没装。</p> 
 <div style="height: 30px"></div> 
 <h2 id="section2">二、获取代码</h2> 
 <h3>第一步：克隆项目代码</h3> 
 <div class="hide-language"> 
 <pre class="unlimited-height-code"><code class="lang-powershell">git clone https://github.com/aws-samples/sample-host-openclaw-on-amazon-bedrock-agentcore.git
cd sample-host-openclaw-on-amazon-bedrock-agentcore
</code></pre> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：从 AWS Samples 官方仓库克隆完整的项目代码（包含 CDK 基础设施、容器代码、Lambda 函数、部署脚本）。</p> 
 <div style="height: 10px"></div> 
 <h3>第二步：设置部署区域</h3> 
 <div class="hide-language"> 
 <pre class="unlimited-height-code"><code class="lang-powershell">sed -i "s/\"region\": \"\"/\"region\": \"${TARGET_REGION}\"/" cdk.json
cat cdk.json
</code></pre> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：把 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">cdk.json</code> 里空的区域字段替换成你的目标区域。<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">cdk.json</code> 是 CDK 的配置文件，里面还有模型 ID、每日预算、会话超时等可调参数。</p> 
 <div style="height: 10px"></div> 
 <h3>第三步：创建 Python 虚拟环境并安装依赖</h3> 
 <div class="hide-language"> 
 <pre class="unlimited-height-code"><code class="lang-powershell">python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip install boto3
python -c "import boto3; import aws_cdk; print('Dependencies installed successfully')"
</code></pre> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：虚拟环境（venv）可以把项目依赖和系统 Python 隔离开，避免污染系统环境。<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">requirements.txt</code> 里列了 CDK 需要的 Python 包（主要是 aws-cdk-lib 和 cdk-nag）。最后一行验证依赖都装好了。</p> 
 <div style="height: 10px"></div> 
 <h3>了解 cdk.json 配置项</h3> 
 <p style="color: #5f6368;font-size: 16px">在进入部署之前，先了解项目的配置。<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">cdk.json</code> 的 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">context</code> 对象是项目所有可调参数的集中地。Stack 代码通过 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">self.node.try_get_context("xxx")</code> 读取这些值。这里只是让你了解有哪些配置，本次部署你不需要修改任何配置项。</p> 
 <p style="color: #5f6368;font-size: 16px"><strong>部署目标配置</strong></p> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
 <tbody> 
 <tr style="background-color: #232f3e;color: #fff"> 
 <th style="padding: 12px;border: 1px solid #ddd">配置项</th> 
 <th style="padding: 12px;border: 1px solid #ddd">当前值</th> 
 <th style="padding: 12px;border: 1px solid #ddd">作用</th> 
 </tr> 
 <tr style="background-color: #f9f9f9"> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>account</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">（空）</td> 
 <td style="padding: 12px;border: 1px solid #ddd">AWS 账号 ID。为空时读取环境变量 <code>CDK_DEFAULT_ACCOUNT</code></td> 
 </tr> 
 <tr> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>region</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">部署区域</td> 
 <td style="padding: 12px;border: 1px solid #ddd">部署区域。为空时读取 <code>CDK_DEFAULT_REGION</code>。已通过上一步的 sed 命令填入</td> 
 </tr> 
 <tr style="background-color: #f9f9f9"> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>availability_zones</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">[]</td> 
 <td style="padding: 12px;border: 1px solid #ddd">VPC 使用的可用区列表。留空则 CDK 自动选 2 个。仅当目标区域 AgentCore 有 AZ 限制时才需要手动指定</td> 
 </tr> 
 </tbody> 
 </table> 
 <p style="color: #5f6368;font-size: 16px"><strong>Amazon Bedrock 模型配置</strong></p> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
 <tbody> 
 <tr style="background-color: #232f3e;color: #fff"> 
 <th style="padding: 12px;border: 1px solid #ddd">配置项</th> 
 <th style="padding: 12px;border: 1px solid #ddd">当前值</th> 
 <th style="padding: 12px;border: 1px solid #ddd">作用</th> 
 </tr> 
 <tr style="background-color: #f9f9f9"> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>default_model_id</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">global.anthropic.claude-sonnet-4-6</td> 
 <td style="padding: 12px;border: 1px solid #ddd">主 Agent 使用的 Claude 模型。<code>global.</code> 前缀表示跨区域推理（Cross Region Inference），Amazon Bedrock 会自动将请求路由到可用区域</td> 
 </tr> 
 <tr> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>subagent_model_id</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">（空）</td> 
 <td style="padding: 12px;border: 1px solid #ddd">子代理模型。空值表示复用主模型。可设置成更便宜/更快的模型省成本</td> 
 </tr> 
 </tbody> 
 </table> 
 <p style="color: #5f6368;font-size: 16px"><strong>AgentCore Runtime 运行配置</strong></p> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
 <tbody> 
 <tr style="background-color: #232f3e;color: #fff"> 
 <th style="padding: 12px;border: 1px solid #ddd">配置项</th> 
 <th style="padding: 12px;border: 1px solid #ddd">当前值</th> 
 <th style="padding: 12px;border: 1px solid #ddd">作用</th> 
 </tr> 
 <tr style="background-color: #f9f9f9"> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>runtime_id</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">openclaw_agent-21FHcrBssV</td> 
 <td style="padding: 12px;border: 1px solid #ddd">AgentCore Runtime ID。Phase 2 部署后由 deploy.sh 自动写入，Phase 3 的 Stack 会读取这个值</td> 
 </tr> 
 <tr> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>runtime_endpoint_id</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">DEFAULT</td> 
 <td style="padding: 12px;border: 1px solid #ddd">Runtime Endpoint ID。Starter Toolkit 默认创建的 Endpoint 名就叫 DEFAULT</td> 
 </tr> 
 <tr style="background-color: #f9f9f9"> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>image_version</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">70</td> 
 <td style="padding: 12px;border: 1px solid #ddd">容器镜像版本号。改这个值 + 重新部署，会强制 AgentCore 重新拉取镜像</td> 
 </tr> 
 <tr> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>session_idle_timeout</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">1800（30 分钟）</td> 
 <td style="padding: 12px;border: 1px solid #ddd">会话空闲超时（秒），超时后 AgentCore 销毁 microVM。官方默认 900 秒（15 分钟）</td> 
 </tr> 
 <tr style="background-color: #f9f9f9"> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>session_max_lifetime</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">28800（8 小时）</td> 
 <td style="padding: 12px;border: 1px solid #ddd">会话最大生命周期（秒），上限 28800（8 小时）</td> 
 </tr> 
 <tr> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>workspace_sync_interval_seconds</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">300（5 分钟）</td> 
 <td style="padding: 12px;border: 1px solid #ddd">容器内 <code>.openclaw/</code> 工作区同步到 S3 的间隔（秒）。这是数据持久化迁移的关键参数</td> 
 </tr> 
 <tr style="background-color: #f9f9f9"> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>enable_browser</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">true</td> 
 <td style="padding: 12px;border: 1px solid #ddd">是否开启 AgentCore Browser（无头浏览器）。仅在支持的区域生效</td> 
 </tr> 
 </tbody> 
 </table> 
 <p style="color: #5f6368;font-size: 16px"><strong>AWS Lambda 配置</strong></p> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
 <tbody> 
 <tr style="background-color: #232f3e;color: #fff"> 
 <th style="padding: 12px;border: 1px solid #ddd">配置项</th> 
 <th style="padding: 12px;border: 1px solid #ddd">当前值</th> 
 <th style="padding: 12px;border: 1px solid #ddd">作用</th> 
 </tr> 
 <tr style="background-color: #f9f9f9"> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>router_lambda_timeout_seconds</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">600</td> 
 <td style="padding: 12px;border: 1px solid #ddd">Router Lambda 超时（秒）。冷启动时 Lightweight Agent 约 10-15 秒响应，加上 Bedrock 推理时间，整个请求可能超过 30 秒，所以设 600 秒留足余量</td> 
 </tr> 
 <tr> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>router_lambda_memory_mb</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">256</td> 
 <td style="padding: 12px;border: 1px solid #ddd">Router Lambda 内存，影响 CPU 配额</td> 
 </tr> 
 <tr style="background-color: #f9f9f9"> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>cron_lambda_timeout_seconds</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">900</td> 
 <td style="padding: 12px;border: 1px solid #ddd">定时任务 Lambda 超时（秒）。需要够长以完成预热、消息处理、回复推送</td> 
 </tr> 
 <tr> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>cron_lambda_memory_mb</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">256</td> 
 <td style="padding: 12px;border: 1px solid #ddd">定时任务 Lambda 内存</td> 
 </tr> 
 <tr style="background-color: #f9f9f9"> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>cron_lead_time_minutes</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">5</td> 
 <td style="padding: 12px;border: 1px solid #ddd">定时任务预热提前量：任务触发前 5 分钟先启动容器（减少冷启动等待）</td> 
 </tr> 
 </tbody> 
 </table> 
 <p style="color: #5f6368;font-size: 16px"><strong>预算和告警配置</strong></p> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
 <tbody> 
 <tr style="background-color: #232f3e;color: #fff"> 
 <th style="padding: 12px;border: 1px solid #ddd">配置项</th> 
 <th style="padding: 12px;border: 1px solid #ddd">当前值</th> 
 <th style="padding: 12px;border: 1px solid #ddd">作用</th> 
 </tr> 
 <tr style="background-color: #f9f9f9"> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>daily_token_budget</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">1000000</td> 
 <td style="padding: 12px;border: 1px solid #ddd">Token 预算告警阈值（100 万）。注意：虽然配置项名叫 daily，但实际 alarm 的检查周期是 1 小时，即 1 小时内 Token 总量超过此值就触发告警</td> 
 </tr> 
 <tr> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>daily_cost_budget_usd</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">5</td> 
 <td style="padding: 12px;border: 1px solid #ddd">成本预算告警阈值（美元）。同上，实际检查周期是 1 小时</td> 
 </tr> 
 <tr style="background-color: #f9f9f9"> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>anomaly_band_width</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">2</td> 
 <td style="padding: 12px;border: 1px solid #ddd">Token 异常检测带宽（标准差倍数）</td> 
 </tr> 
 </tbody> 
 </table> 
 <p style="color: #5f6368;font-size: 16px"><strong>数据保留配置</strong></p> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
 <tbody> 
 <tr style="background-color: #232f3e;color: #fff"> 
 <th style="padding: 12px;border: 1px solid #ddd">配置项</th> 
 <th style="padding: 12px;border: 1px solid #ddd">当前值</th> 
 <th style="padding: 12px;border: 1px solid #ddd">作用</th> 
 </tr> 
 <tr style="background-color: #f9f9f9"> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>cloudwatch_log_retention_days</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">30</td> 
 <td style="padding: 12px;border: 1px solid #ddd">CloudWatch 日志保留天数</td> 
 </tr> 
 <tr> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>token_ttl_days</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">90</td> 
 <td style="padding: 12px;border: 1px solid #ddd">Amazon DynamoDB Token 用量记录的 TTL（生存时间，Time to Live），90 天自动删除</td> 
 </tr> 
 <tr style="background-color: #f9f9f9"> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>user_files_ttl_days</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">365</td> 
 <td style="padding: 12px;border: 1px solid #ddd">S3 用户文件的生命周期（365 天后自动过期）</td> 
 </tr> 
 </tbody> 
 </table> 
 <p style="color: #5f6368;font-size: 16px"><strong>安全和开关</strong></p> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
 <tbody> 
 <tr style="background-color: #232f3e;color: #fff"> 
 <th style="padding: 12px;border: 1px solid #ddd">配置项</th> 
 <th style="padding: 12px;border: 1px solid #ddd">当前值</th> 
 <th style="padding: 12px;border: 1px solid #ddd">作用</th> 
 </tr> 
 <tr style="background-color: #f9f9f9"> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>registration_open</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">false</td> 
 <td style="padding: 12px;border: 1px solid #ddd">是否开放自助注册。false 表示只有白名单（DynamoDB 中有 ALLOW# 记录）的用户才能使用 Bot</td> 
 </tr> 
 <tr> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>enable_cloudtrail</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">false</td> 
 <td style="padding: 12px;border: 1px solid #ddd">是否部署专用 AWS CloudTrail Trail。默认关闭（多数账号已有组织级 Trail）</td> 
 </tr> 
 <tr style="background-color: #f9f9f9"> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>enable_guardrails</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">（未设置，视为 true）</td> 
 <td style="padding: 12px;border: 1px solid #ddd">是否启用 Amazon Bedrock Guardrails 内容过滤。代码逻辑是：未设置或设为 true 时启用，设为 false 时不创建 Guardrail。具体过滤规则在 <code>stacks/guardrails_stack.py</code> 中定义</td> 
 </tr> 
 <tr> 
 <td style="padding: 12px;border: 1px solid #ddd"><code>guardrails_pii_action</code></td> 
 <td style="padding: 12px;border: 1px solid #ddd">（未设置，默认 ANONYMIZE）</td> 
 <td style="padding: 12px;border: 1px solid #ddd">PII 检测动作。ANONYMIZE 表示匿名化替换，BLOCK 表示直接阻断</td> 
 </tr> 
 </tbody> 
 </table> 
 <p style="color: #5f6368;font-size: 16px"><strong>CDK 框架配置（不需要改）</strong></p> 
 <p style="color: #5f6368;font-size: 16px">以 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">@aws-cdk/</code> 开头的配置是 CDK 框架自身的行为开关（比如最小化 IAM 策略、使用 IMDSv2 等），这些是最佳实践默认值，一般不要改动。</p> 
 <div style="height: 30px"></div> 
 <h2 id="section3">三、CDK 初始化（Bootstrap）</h2> 
 <h3>第一步：初始化 CDK 工作台</h3> 
 <div class="hide-language"> 
 <pre class="unlimited-height-code"><code class="lang-powershell">cdk bootstrap aws://$CDK_DEFAULT_ACCOUNT/$CDK_DEFAULT_REGION
</code></pre> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：CDK 部署时需要一个”工作台”来存放中间产物（<a href="https://aws.amazon.com/cn/cloudformation/">AWS CloudFormation</a> 模板、Lambda 代码包等）。bootstrap 命令会在你的 AWS 账号里创建一个叫 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">CDKToolkit</code> 的 Stack，包含一个 S3 桶、一个 ECR 仓库、几个 IAM 角色。</p> 
 <p style="color: #5f6368;font-size: 16px">每个账号 + 区域组合只需要执行一次，后续所有 CDK 项目都会共用这个工作台。</p> 
 <p style="color: #5f6368;font-size: 16px">验证方法：去 AWS 控制台的 CloudFormation 页面，应该能看到一个名为 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">CDKToolkit</code> 的 Stack，状态 CREATE_COMPLETE。</p> 
 <div style="height: 10px"></div> 
 <h3>第二步：预览将要创建的资源</h3> 
 <div class="hide-language"> 
 <pre class="unlimited-height-code"><code class="lang-powershell">cdk synth
</code></pre> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：把 Python CDK 代码”编译”成 CloudFormation 模板（YAML 格式），不会真的创建任何 AWS 资源。这一步主要是：</p> 
 <ul style="color: #5f6368;font-size: 16px"> 
 <li style="color: #5f6368;font-size: 16px">验证代码能正确生成模板</li> 
 <li style="color: #5f6368;font-size: 16px">运行 cdk-nag 安全检查（检查是否有明显的安全配置错误）</li> 
 <li style="color: #5f6368;font-size: 16px">生成的模板会在 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">cdk.out/</code> 目录下，可以查看每个 Stack 会创建哪些资源</li> 
 </ul> 
 <div style="height: 10px"></div> 
 <h3>第三步：应用部署补丁</h3> 
 <div class="hide-language"> 
 <pre class="unlimited-height-code"><code class="lang-powershell">sed -i '/# --- S3 Bucket for Per-User File Storage/i\ # AWS Marketplace — required for Bedrock model access verification\n self.execution_role.add_to_policy(\n iam.PolicyStatement(\n actions=[\n "aws-marketplace:ViewSubscriptions",\n "aws-marketplace:Subscribe",\n ],\n resources=["*"],\n )\n )\n' stacks/agentcore_stack.py
sed -i 's/dashboard_name="OpenClaw-Operations"/dashboard_name=f"OpenClaw-Operations-{region}"/' stacks/observability_stack.py
sed -i 's/dashboard_name="OpenClaw-Token-Analytics"/dashboard_name=f"OpenClaw-Token-Analytics-{self.region}"/' stacks/token_monitoring_stack.py
</code></pre> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：两处小补丁：</p> 
 <ul style="color: #5f6368;font-size: 16px"> 
 <li style="color: #5f6368;font-size: 16px">第一条（第一个 sed）：给 AgentCore 执行角色添加 AWS Marketplace 权限，Amazon Bedrock 某些模型的访问验证需要这个权限</li> 
 <li style="color: #5f6368;font-size: 16px">第二、三条（后两个 sed）：给两个 CloudWatch Dashboard 的名称加上区域后缀，防止在多区域部署时名称冲突</li> 
 </ul> 
 <div style="height: 30px"></div> 
 <h2 id="section4">相关链接</h2> 
 <p style="color: #5f6368;font-size: 16px"><strong style="color: #333"><img src="https://s.w.org/images/core/emoji/14.0.0/72x72/27a1.png" alt="➡" class="wp-smiley" style="height: 1em; max-height: 1em;"> 下一步行动：</strong></p> 
 <p style="color: #5f6368;font-size: 16px"><strong>相关产品：</strong></p> 
 <ul style="color: #5f6368;font-size: 16px"> 
 <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/cdk/?p=bl_pr_cdk_l=1">Amazon CDK</a> — 基础设施即代码框架</li> 
 <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=2">Amazon Bedrock</a> — 用于构建生成式人工智能应用程序和代理的端到端平台</li> 
 <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/lambda/?p=bl_pr_lambda_l=3">AWS Lambda</a> — 无需服务器即可运行代码</li> 
 <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/xray/?p=bl_pr_x-ray_l=4">Amazon X-Ray</a> — 分布式应用调试</li> 
 <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/cloudwatch/?p=bl_pr_cloudwatch_l=5">Amazon CloudWatch</a> — 可观测性工具</li> 
 </ul> 
 <p style="color: #5f6368;font-size: 16px"><strong>系列文章：</strong></p> 
 <ul style="color: #5f6368;font-size: 16px"> 
 <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-1/?p=bl_ar_l=1">第一篇：为什么要把 OpenClaw 从单机搬到 AWS</a></li> 
 <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-3/?p=bl_ar_l=2">第三篇：Phase 1 — 部署基础设施</a></li> 
 <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-4/?p=bl_ar_l=3">第四篇：Phase 2 &amp; 3 — 部署 AgentCore Runtime 与业务层</a></li> 
 <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-5/?p=bl_ar_l=4">第五篇：配置消息渠道与端到端验证</a></li> 
 <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-6/?p=bl_ar_l=5">第六篇：清理资源与总结展望</a></li> 
 </ul> 
 <p>
 <!-- 免责声明 --></p> 
 <p style="background-color: #f9f9f9;padding: 20px;border-radius: 8px;margin: 30px 0;color: #5f6368;font-size: 16px">*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。</p> 
 <p>
 <!-- 本篇作者 --></p> 
 <div style="height: 30px"></div> 
 <h2>本篇作者</h2> 
 <div style="height: 20px"></div> 
 <footer> 
 <div class="blog-author-box" style="border: none;padding: 0"> 
 <div class="blog-author-image">
 <img src="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2025/09/23/youding.jpg" alt="" width="125">
 </div> 
 <h3 class="lb-h4">丁有冬</h3> 
 <p style="color: #5f6368;font-size: 16px">亚马逊云科技合作伙伴解决方案架构师，在企业架构设计、咨询服务以及项目管理方面具有丰富的实践经验。目前主要负责 AWS（中国）合作伙伴的方案架构咨询和设计工作，致力于 AWS 云服务在国内的应用推广以及帮助合作伙伴构建更高效的 AWS 云服务解决方案。</p> 
 </div> 
 <div class="blog-author-box" style="border: none;padding: 0"> 
 <div class="blog-author-image">
 <img src="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/07/fengepei.jpg" alt="" width="125">
 </div> 
 <h3 class="lb-h4">裴峰</h3> 
 <p style="color: #5f6368;font-size: 16px">亚马逊云科技合作伙伴解决方案架构师，主要负责合作伙伴架构咨询和方案设计，同时致力于 AWS 云服务在国内的应用及推广，有多年大型企业数据中心网络架构设计实战经验。</p> 
 </div> 
 </footer> 
 <p>
 <!-- 横线 --></p> 
 <hr style="border: none;border-top: 1px solid #ccc;margin: 40px 0;width: 100%"> 
 <p>
 <!-- AWS架构师中心 --></p> 
 <table width="100%"> 
 <tbody> 
 <tr> 
 <td width="480"> <h2>AWS 架构师中心：云端创新的引领者</h2> <p style="color: #5f6368;font-size: 16px">探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用</p> <p><strong><a href="https://aws.amazon.com/cn/solutions/architect-center/"><img class="alignleft" src="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2025/11/13/sa-button.png" width="60"></a></strong></p></td> 
 <td width="460"><img class="alignright" src="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2025/11/13/sa.png"></td> 
 </tr> 
 </tbody> 
 </table> 
</div>