---
tags: [wechat, article, claude, openai]
title: "AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第五篇"
url: https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-5/
source: rss
feed_name: AWS China ML
sha256: b82def90bbad83f70fcef72133d9217168d35b3b9e0789e704ba049e8a1056ad
---
<div style="line-height: 1.6;font-size: 16px"> 
 <p>
 <!-- 摘要区 --></p> 
 <p style="background-color: #fafafa;padding: 20px;border-radius: 8px;margin-bottom: 30px;font-size: 16px;color: #5f6368">摘要：基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构。全系列 6 篇，涵盖 Replatform 与 Refactor 两种策略。本篇为第五篇：配置消息渠道与端到端验证，配置 Telegram / 飞书 Bot、发送第一条消息、查看监控大盘和日志。</p> 
 <p>
 <!-- 目录区 --></p> 
 <div style="background-color: #f0f7ff;border: 1px solid #d0e3f7;padding: 20px;border-radius: 8px"> 
 <p><strong style="font-size: 18px;color: #333">目录</strong></p> 
 <div style="line-height: 1.8;margin: 0;padding: 0"> 
 <div style="margin: 0;padding: 0">
 <span style="color: #999;margin-right: 8px">01</span>
 <a style="color: #333;text-decoration: none" href="#section1">七、配置消息渠道</a>
 </div> 
 <div style="margin: 0;padding: 0">
 <span style="color: #999;margin-right: 8px">02</span>
 <a style="color: #333;text-decoration: none" href="#section2">八、发送消息验证</a>
 </div> 
 <div style="margin: 0;padding: 0">
 <span style="color: #999;margin-right: 8px">03</span>
 <a style="color: #333;text-decoration: none" href="#section3">九、查看监控和日志</a>
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
 <h2 id="section1">七、配置消息渠道</h2> 
 <p style="color: #5f6368;font-size: 16px">基础设施和运行时都部署完了，现在需要把 IM 渠道的消息推送接到我们的 <a href="https://aws.amazon.com/cn/api-gateway/">Amazon API Gateway</a> 上。这一步对应的是 Refactor 中”消息接入”维度的改造 — 传统 OpenClaw 的 Gateway 直接监听端口，现在改为通过 webhook 回调的方式接入。</p> 
 <p style="color: #5f6368;font-size: 16px">本步骤至少选一个渠道配置。</p> 
 <p style="color: #5f6368;font-size: 16px">选哪个渠道？Telegram 配置步骤最少；飞书适合国内企业环境但步骤多。本节先讲 Telegram，飞书见后半部分。</p> 
 <h3>选项 A：配置 Telegram</h3> 
 <p style="color: #5f6368;font-size: 16px">A1：用 BotFather 创建 Telegram Bot</p> 
 <ul style="color: #5f6368;font-size: 16px"> 
 <li style="color: #5f6368;font-size: 16px">在 Telegram 中搜索 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">@BotFather</code>（官方账号，带蓝色对勾）并开启对话</li> 
 <li style="color: #5f6368;font-size: 16px">发送 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">/newbot</code></li> 
 <li style="color: #5f6368;font-size: 16px">BotFather 提示：请起个显示名字（Name），例如 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">OpenClaw Demo</code></li> 
 <li style="color: #5f6368;font-size: 16px">BotFather 提示：请起个 username，必须以 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">bot</code> 结尾，全局唯一，例如 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">my_openclaw_demo_bot</code></li> 
 <li style="color: #5f6368;font-size: 16px">成功后 BotFather 会回复一段包含 Token 的消息，格式类似：</li> 
 </ul> 
 <p style="color: #5f6368;font-size: 16px"><code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">123456789:AAFD39kkdpWt3ywyRZergyOLMaJhac60qc</code></p> 
 <ul style="color: #5f6368;font-size: 16px"> 
 <li style="color: #5f6368;font-size: 16px">把这个 Token 复制保存（后面要用）</li> 
 </ul> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：BotFather 是 Telegram 官方的 Bot 管理入口。Token 相当于 Bot 的身份凭证，请像密码一样妥善保管，不要提交到公开代码仓库。</p> 
 <p style="color: #5f6368;font-size: 16px">A2：把 Token 存入 AWS Secrets Manager</p> 
 <div class="hide-language"> 
 <pre class="unlimited-height-code"><code class="lang-powershell">aws secretsmanager update-secret \
 --secret-id openclaw/channels/telegram \
 --secret-string 'YOUR_BOT_TOKEN' \
 --region $TARGET_REGION
</code></pre> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">把上面的 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">YOUR_BOT_TOKEN</code> 替换成 BotFather 给你的真实 Token。</p> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：在 Phase 1 部署时，<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">openclaw/channels/telegram</code> 这个 Secret 就已经创建了但里面是空占位值，现在把真实 Token 填进去。容器和 Router Lambda 会从 Secrets Manager 读取这个 Token 与 Telegram 通信。这也是迁移中安全维度的改进 — 传统 OpenClaw 把 API 密钥存在本地的 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">auth-profiles.json</code> 文件里，现在统一由 AWS Secrets Manager 加密管理。</p> 
 <p style="color: #5f6368;font-size: 16px">这一步必须在运行 setup-telegram.sh 之前完成，因为脚本会从 Secrets Manager 读取 Token 来注册 webhook。</p> 
 <p style="color: #5f6368;font-size: 16px">A3：运行 Telegram 配置脚本</p> 
 <div class="hide-language"> 
 <pre class="unlimited-height-code"><code class="lang-powershell">./scripts/setup-telegram.sh
</code></pre> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">脚本会自动：</p> 
 <ol style="color: #5f6368;font-size: 16px"> 
 <li style="color: #5f6368;font-size: 16px">从 Secrets Manager 读取你刚存的 Token</li> 
 <li style="color: #5f6368;font-size: 16px">从 <a href="https://aws.amazon.com/cn/cloudformation/">AWS CloudFormation</a> 读取 API Gateway URL</li> 
 <li style="color: #5f6368;font-size: 16px">调用 Telegram <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">setWebhook</code> API，把 webhook 指向 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">{ApiUrl}/webhook/telegram</code>，同时传入 secret_token 用于后续的签名验证</li> 
 <li style="color: #5f6368;font-size: 16px">提示你输入 Telegram user ID（纯数字，不是 username），自动写入 DynamoDB 白名单</li> 
 </ol> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：如何找到自己的 Telegram user ID？有两种方法：</p> 
 <p style="color: #5f6368;font-size: 16px">① 在 Telegram 里搜索 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">@userinfobot</code>，给它发任意消息，它会回复你的数字 user ID</p> 
 <p style="color: #5f6368;font-size: 16px">② 或者先给你的新 Bot 发一条消息（会被系统拒绝，但拒绝消息里会显示你的 user ID）</p> 
 <p style="color: #5f6368;font-size: 16px">为什么需要白名单？默认 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">registration_open=false</code>，只有 DynamoDB 里有 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">ALLOW#telegram:xxx</code> 记录的用户才能用 Bot。这样你的 Bot 不会被陌生人滥用。后续想加更多用户，用 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">./scripts/manage-allowlist.sh add telegram:user_id</code>。</p> 
 <h3>选项 B：配置飞书</h3> 
 <p style="color: #5f6368;font-size: 16px">B1：创建飞书自建应用</p> 
 <ol style="color: #5f6368;font-size: 16px"> 
 <li style="color: #5f6368;font-size: 16px">打开飞书开放平台 <a href="https://open.feishu.cn/app" target="_blank" rel="noopener">https://open.feishu.cn/app</a>（需要企业飞书账号）</li> 
 <li style="color: #5f6368;font-size: 16px">点击”创建企业自建应用”，填写应用名称、描述、图标</li> 
 <li style="color: #5f6368;font-size: 16px">创建后进入应用详情页，在左侧菜单找到”添加应用能力”，添加机器人能力</li> 
 </ol> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：飞书的 Bot 能力挂在”自建应用”下，一个应用可以开启多种能力（机器人、网页应用、小程序等），这里我们只需要机器人。</p> 
 <p style="color: #5f6368;font-size: 16px">B2：配置权限</p> 
 <p style="color: #5f6368;font-size: 16px">在应用详情页 → 权限管理，添加以下 5 个权限：</p> 
 <ul style="color: #5f6368;font-size: 16px"> 
 <li style="color: #5f6368;font-size: 16px"><code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">im:message</code> — 接收用户消息</li> 
 <li style="color: #5f6368;font-size: 16px"><code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">im:message:send_as_bot</code> — 以机器人身份发消息</li> 
 <li style="color: #5f6368;font-size: 16px"><code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">im:message.content:readonly</code> — 读取消息内容</li> 
 <li style="color: #5f6368;font-size: 16px"><code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">im:chat:readonly</code> — 读取群组信息</li> 
 <li style="color: #5f6368;font-size: 16px"><code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">im:resource</code> — 下载图片/文件</li> 
 </ul> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：这些权限是 Bot 能收发消息和处理图片的基础。飞书的权限比较细粒度，需要逐个开启。</p> 
 <p style="color: #5f6368;font-size: 16px">B3：配置事件订阅</p> 
 <p style="color: #5f6368;font-size: 16px">在应用详情页 → 事件订阅：</p> 
 <ol style="color: #5f6368;font-size: 16px"> 
 <li style="color: #5f6368;font-size: 16px">先开启加密策略：生成 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">Encrypt Key</code> 和 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">Verification Token</code>，保存备用（后面要填入 Secrets Manager）</li> 
 <li style="color: #5f6368;font-size: 16px">请求地址填入：<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">{API_URL}webhook/feishu</code>（API_URL 从 CloudFormation <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">OpenClawRouter</code> stack 的 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">ApiUrl</code> 输出获取）</li> 
 <li style="color: #5f6368;font-size: 16px">订阅模式选择”将事件发送至开发者服务器”</li> 
 <li style="color: #5f6368;font-size: 16px">添加事件： 
 <ul style="color: #5f6368;font-size: 16px"> 
 <li style="color: #5f6368;font-size: 16px"><code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">im.message.receive_v1</code>（必须）— 接收用户消息</li> 
 <li style="color: #5f6368;font-size: 16px"><code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">im.chat.member.bot.added_v1</code>（推荐）— 机器人被加入群</li> 
 <li style="color: #5f6368;font-size: 16px"><code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">im.chat.member.bot.deleted_v1</code>（推荐）— 机器人被移出群</li> 
 </ul> </li> 
 </ol> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：飞书的 webhook 事件是 AES-256-CBC 加密的（需要 Encrypt Key 解密），Verification Token 用来验证请求确实来自飞书。Router Lambda 已经内置了解密和验证逻辑。</p> 
 <p style="color: #5f6368;font-size: 16px">B4：发布应用</p> 
 <p style="color: #5f6368;font-size: 16px">在应用详情页 → 版本管理与发布，提交发布申请并等待企业管理员审批通过。</p> 
 <div style="background-color: #fff3cd;border-left: 4px solid #ffc107;padding: 15px 20px;border-radius: 4px;margin: 20px 0;color: #5f6368;font-size: 16px">
 重要：没发布的应用只有开发者自己能看到，其他用户在飞书里搜不到你的 Bot。必须发布后才能实际使用。
 </div> 
 <p style="color: #5f6368;font-size: 16px">B5：运行飞书配置脚本</p> 
 <div class="hide-language"> 
 <pre class="unlimited-height-code"><code class="lang-powershell">./scripts/setup-feishu.sh
</code></pre> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">脚本会交互式提示你输入 4 个凭证（都能在飞书开发者后台找到）：</p> 
 <ul style="color: #5f6368;font-size: 16px"> 
 <li style="color: #5f6368;font-size: 16px">App ID：凭证与基础信息 → App ID</li> 
 <li style="color: #5f6368;font-size: 16px">App Secret：凭证与基础信息 → App Secret</li> 
 <li style="color: #5f6368;font-size: 16px">Verification Token：事件订阅 → 加密策略</li> 
 <li style="color: #5f6368;font-size: 16px">Encrypt Key：事件订阅 → 加密策略</li> 
 </ul> 
 <p style="color: #5f6368;font-size: 16px">然后脚本会：</p> 
 <ul style="color: #5f6368;font-size: 16px"> 
 <li style="color: #5f6368;font-size: 16px">把 4 个凭证以 JSON 格式存入 Secrets Manager（<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">openclaw/channels/feishu</code>）</li> 
 <li style="color: #5f6368;font-size: 16px">提示你输入自己的飞书 open_id（格式 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">ou_xxxxxxxx</code>），加入白名单</li> 
 </ul> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：如何找到自己的 open_id？先给 Bot 发一条消息，因为你还没在白名单里，系统会拒绝并在日志里记录你的 open_id，可以去 CloudWatch <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">/openclaw/lambda/router</code> Log Group 查看。</p> 
 <div style="height: 10px"></div> 
 <h2 id="section2">八、发送消息验证</h2> 
 <p style="color: #5f6368;font-size: 16px">到这一步，整个迁移改造已经完成。现在来验证端到端的消息链路是否打通。下面的时序图展示了一条消息从用户发出到 AI 回复的完整旅程 — 这也是迁移后架构的实际运行路径：</p> 
 <table style="margin: 20px 0;width: 600px"> 
 <tbody> 
 <tr> 
 <td style="text-align: center;padding: 20px;background-color: #f9f9f9;border-radius: 8px;width: 600px"><a href="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/07/using-amazon-bedrock-agentcore-openclaw-multi-5-1.png"><img style="width: 560px" src="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/07/using-amazon-bedrock-agentcore-openclaw-multi-5-1.png" alt=""></a><p></p> <p style="color: #666;font-size: 14px;margin-top: 10px;margin-bottom: 0;width: 560px">[图1]</p> </td> 
 </tr> 
 </tbody> 
 </table> 
 <p style="color: #232f3e;font-size: 16px"><strong style="color: #232f3e">容器内部：microVM 里的三个进程</strong></p> 
 <p style="color: #5f6368;font-size: 16px">上面的时序图把容器简化为一个节点。实际上每个 microVM 内部运行着三个进程，各司其职：</p> 
 <table style="margin: 20px 0;width: 600px"> 
 <tbody> 
 <tr> 
 <td style="text-align: center;padding: 20px;background-color: #f9f9f9;border-radius: 8px;width: 600px"><a href="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/07/using-amazon-bedrock-agentcore-openclaw-multi-5-2.png"><img style="width: 560px" src="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/07/using-amazon-bedrock-agentcore-openclaw-multi-5-2.png" alt=""></a><p></p> <p style="color: #666;font-size: 14px;margin-top: 10px;margin-bottom: 0;width: 560px">[图2]</p> </td> 
 </tr> 
 </tbody> 
 </table> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
 <tbody> 
 <tr style="background-color: #232f3e;color: #fff"> 
 <th style="padding: 12px;border: 1px solid #ddd">进程</th> 
 <th style="padding: 12px;border: 1px solid #ddd">角色</th> 
 <th style="padding: 12px;border: 1px solid #ddd">职责</th> 
 </tr> 
 <tr style="background-color: #f9f9f9"> 
 <td style="padding: 12px;border: 1px solid #ddd">Contract Server</td> 
 <td style="padding: 12px;border: 1px solid #ddd">管家</td> 
 <td style="padding: 12px;border: 1px solid #ddd">microVM 的入口进程。负责健康检查（<code>/ping</code>）、请求路由（<code>/invocations</code>）、工作区同步（S3 <img src="https://s.w.org/images/core/emoji/14.0.0/72x72/2194.png" alt="↔" class="wp-smiley" style="height: 1em; max-height: 1em;"> 本地）、STS 限制版凭证管理（每 45 分钟刷新）。OpenClaw 启动前，由内置的 Lightweight Agent 临时应答</td> 
 </tr> 
 <tr> 
 <td style="padding: 12px;border: 1px solid #ddd">OpenClaw</td> 
 <td style="padding: 12px;border: 1px solid #ddd">主力</td> 
 <td style="padding: 12px;border: 1px solid #ddd">真正的 AI Agent 进程。启动后接管所有用户请求，执行 17 个内置工具和 5 个预装社区技能</td> 
 </tr> 
 <tr style="background-color: #f9f9f9"> 
 <td style="padding: 12px;border: 1px solid #ddd">Bedrock Proxy</td> 
 <td style="padding: 12px;border: 1px solid #ddd">翻译官</td> 
 <td style="padding: 12px;border: 1px solid #ddd">OpenClaw 原生使用 OpenAI 格式的 API 调用，Proxy 将其转换为 Amazon Bedrock ConverseStream API 格式，同时注入 Guardrails 配置</td> 
 </tr> 
 </tbody> 
 </table> 
 <p style="color: #5f6368;font-size: 16px">第一步：给 Bot 发送第一条消息</p> 
 <p style="color: #5f6368;font-size: 16px">在 Telegram 中找到你的 Bot，发送：</p> 
 <div class="hide-language"> 
 <pre class="unlimited-height-code"><code class="lang-powershell">你好，介绍一下你自己
</code></pre> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：第一条消息会触发冷启动：AgentCore Runtime 为你的会话创建一个新的 microVM，大约 10-15 秒后由 Lightweight Agent 先响应。后续消息不需要重新创建 microVM，响应速度取决于 AI 回复的复杂度（简单问题几秒，复杂问题可能十几秒）。</p> 
 <p style="color: #5f6368;font-size: 16px">第二步：测试常用功能</p> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
 <tbody> 
 <tr style="background-color: #232f3e;color: #fff"> 
 <th style="padding: 12px;border: 1px solid #ddd">发送什么</th> 
 <th style="padding: 12px;border: 1px solid #ddd">测试什么能力</th> 
 <th style="padding: 12px;border: 1px solid #ddd">涉及的迁移改造点</th> 
 </tr> 
 <tr style="background-color: #f9f9f9"> 
 <td style="padding: 12px;border: 1px solid #ddd">“帮我搜一下今天北京天气”</td> 
 <td style="padding: 12px;border: 1px solid #ddd">web_search 工具（NAT Gateway 出网）</td> 
 <td style="padding: 12px;border: 1px solid #ddd">网络架构（VPC + NAT）</td> 
 </tr> 
 <tr> 
 <td style="padding: 12px;border: 1px solid #ddd">发一张图片并问”这是什么”</td> 
 <td style="padding: 12px;border: 1px solid #ddd">图片上传 + Bedrock 多模态</td> 
 <td style="padding: 12px;border: 1px solid #ddd">S3 存储 + 模型调用 Replatform</td> 
 </tr> 
 <tr style="background-color: #f9f9f9"> 
 <td style="padding: 12px;border: 1px solid #ddd">“帮我把这段文字存到 notes.md”</td> 
 <td style="padding: 12px;border: 1px solid #ddd">write_user_file 工具（S3 用户文件）</td> 
 <td style="padding: 12px;border: 1px solid #ddd">数据持久化 Refactor</td> 
 </tr> 
 <tr> 
 <td style="padding: 12px;border: 1px solid #ddd">“列出我的文件”</td> 
 <td style="padding: 12px;border: 1px solid #ddd">list_user_files 工具</td> 
 <td style="padding: 12px;border: 1px solid #ddd">Per-User S3 前缀隔离</td> 
 </tr> 
 <tr style="background-color: #f9f9f9"> 
 <td style="padding: 12px;border: 1px solid #ddd">“每天早上 8 点提醒我喝水”</td> 
 <td style="padding: 12px;border: 1px solid #ddd">create_schedule 工具（EventBridge 定时任务）</td> 
 <td style="padding: 12px;border: 1px solid #ddd">定时任务 Refactor</td> 
 </tr> 
 </tbody> 
 </table> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：每种测试对应架构中的一个组件，验证整个迁移链路是否打通。</p> 
 <div style="height: 10px"></div> 
 <h2 id="section3">九、查看监控和日志</h2> 
 <p style="color: #5f6368;font-size: 16px">监控是 Replatform 带来的直观运维体验提升。迁移后，所有组件的日志、指标、告警都集中在 Amazon CloudWatch 里，通过统一的 Dashboard 即可掌握系统运行状态。</p> 
 <p style="color: #5f6368;font-size: 16px">第一步：查看 Router Lambda 日志</p> 
 <p style="color: #5f6368;font-size: 16px">去 CloudWatch → Log groups → <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">/openclaw/lambda/router</code></p> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：这里能看到每条消息的完整处理过程：webhook 验证、用户查询、调用 AgentCore、响应返回。排错时第一站。</p> 
 <p style="color: #5f6368;font-size: 16px">第二步：查看 AgentCore 容器日志</p> 
 <p style="color: #5f6368;font-size: 16px">去 CloudWatch → Log groups → 搜 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">bedrock-agentcore/runtimes/openclaw_agent</code></p> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：容器内部的运行日志：Contract Server 启动过程、Proxy 调用 Bedrock、OpenClaw 工具执行等。</p> 
 <p style="color: #5f6368;font-size: 16px">第三步：查看用量大盘</p> 
 <p style="color: #5f6368;font-size: 16px">去 CloudWatch → Dashboards → <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">OpenClaw-Token-Analytics-</code></p> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：看到你刚才对话消耗了多少 Token、估算成本。用量大盘的数据来自 Bedrock 调用日志 → Token Metrics Lambda → DynamoDB + CloudWatch 指标。</p> 
 <p style="color: #5f6368;font-size: 16px">第四步：查看 <a href="https://aws.amazon.com/cn/dynamodb/">Amazon DynamoDB</a> 数据</p> 
 <p style="color: #5f6368;font-size: 16px">去 DynamoDB 控制台 → <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">openclaw-identity</code> 表 → Explore items</p> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：能看到几种记录：<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">CHANNEL#telegram:xxx</code>（渠道映射）、<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">USER#xxx</code>（用户信息）、<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">SESSION</code>（当前会话）、<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">ALLOW#</code>（白名单）、<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">CRON#</code>（定时任务）。</p> 
 <p>
 <!-- 结语 --></p> 
 <div style="height: 30px"></div> 
 <h2 id="section4">相关链接</h2> 
 <p style="color: #5f6368;font-size: 16px"><strong style="color: #333"><img src="https://s.w.org/images/core/emoji/14.0.0/72x72/27a1.png" alt="➡" class="wp-smiley" style="height: 1em; max-height: 1em;"> 下一步行动：</strong></p> 
 <p style="color: #5f6368;font-size: 16px"><strong>相关产品：</strong></p> 
 <ul style="color: #5f6368;font-size: 16px"> 
 <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=1">Amazon Bedrock</a> — 用于构建生成式人工智能应用程序和代理的端到端平台</li> 
 <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=2">Amazon S3</a> — 适用于 AI、分析和存档的几乎无限的安全对象存储</li> 
 <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/cloudwatch/?p=bl_pr_cloudwatch_l=3">Amazon CloudWatch</a> — 可观测性工具</li> 
 <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/secrets-manager/?p=bl_pr_secrets-manager_l=4">Amazon Secrets Manager</a> — 密钥管理</li> 
 <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/dynamodb/?p=bl_pr_dynamodb_l=5">Amazon DynamoDB</a> — 无服务器分布式 NoSQL 数据库</li> 
 </ul> 
 <p style="color: #5f6368;font-size: 16px"><strong>系列文章：</strong></p> 
 <ul> 
 <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-1/?p=bl_ar_l=1">第一篇：为什么要把 OpenClaw 从单机搬到 AWS</a></li> 
 <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-2/?p=bl_ar_l=2">第二篇：环境准备与代码获取</a></li> 
 <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-3/?p=bl_ar_l=3">第三篇：Phase 1 — 部署基础设施</a></li> 
 <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-4/?p=bl_ar_l=4">第四篇：Phase 2 &amp; 3 — 部署 AgentCore Runtime 与业务层</a></li> 
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
 <img src="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/03/27/xudas.jpg" alt="" width="125">
 </div> 
 <h3 class="lb-h4">徐达</h3> 
 <p style="color: #5f6368;font-size: 16px">亚马逊云科技资深解决方案架构师，致力于帮助初创企业在亚马逊云平台上实现业务部署。在呼叫中心及网络通信和云计算领域有多年的实践经验，拥有亚马逊云科技多项专业技术认证以及呼叫中心技术相关认证。</p> 
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