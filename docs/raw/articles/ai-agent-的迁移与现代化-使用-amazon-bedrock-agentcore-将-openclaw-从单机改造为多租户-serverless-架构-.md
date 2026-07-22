---
title: ai agent 的迁移与现代化 使用 amazon bedrock agentcore 将 openclaw 从单机改造为多租户 serverless 架构 
source_url: https://aws.amazon.com/cn/s3/
tags: [aws-china-blog, agentic-ai, context-engineering]
ingested: 2026-05-21
sha256: e6083992089f809e8bdde3226b65943ecddf3127f66f46e2ae7c83755ff6fa3b
---
<div style="line-height: 1.6;font-size: 16px"> 
 <p>
  <!-- 摘要区 --></p> 
 <p style="background-color: #fafafa;padding: 20px;border-radius: 8px;margin-bottom: 30px;font-size: 16px;color: #5f6368">摘要：基于 AWS 示例项目，展示如何将 OpenClaw 迁移为基于 Amazon Bedrock AgentCore 的多租户 Serverless 架构。全系列 6 篇，涵盖 Replatform 与 Refactor 两种策略。本篇为第六篇：清理资源与总结展望，删除部署资源、迁移前后对比回顾，以及进一步探索方向。</p> 
 <p>
  <!-- 目录区 --></p> 
 <div style="background-color: #f0f7ff;border: 1px solid #d0e3f7;padding: 20px;border-radius: 8px"> 
  <p><strong style="font-size: 18px;color: #333">目录</strong></p> 
  <div style="line-height: 1.8;margin: 0;padding: 0"> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">01</span>
    <a style="color: #333;text-decoration: none" href="#section1">十、清理资源</a>
   </div> 
   <div style="margin: 0;padding: 0">
    <span style="color: #999;margin-right: 8px">02</span>
    <a style="color: #333;text-decoration: none" href="#section2">十一、总结与展望</a>
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
 <h2 id="section1">十、清理资源</h2> 
 <p style="color: #5f6368;font-size: 16px">部署完成后，建议删除所有资源避免持续产生费用。</p> 
 <p style="color: #5f6368;font-size: 16px">第一步：删除 AgentCore Runtime</p> 
 <div class="hide-language"> 
  <pre class="unlimited-height-code"><code class="lang-powershell">agentcore destroy --agent openclaw_agent
</code></pre> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：先删 Runtime，否则 CDK 删除 AgentCore Stack 时会因为依赖关系失败。</p> 
 <p style="color: #5f6368;font-size: 16px">第二步：删除 CDK Stack</p> 
 <div class="hide-language"> 
  <pre class="unlimited-height-code"><code class="lang-powershell">cd ~/openclaw-$TARGET_REGION/sample-host-openclaw-on-amazon-bedrock-agentcore
source .venv/bin/activate
cdk destroy --all
</code></pre> 
 </div> 
 <p style="color: #5f6368;font-size: 16px">为什么做这一步：一次性删除所有 8 个 CDK Stack。会提示确认，输入 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">y</code>。</p> 
 <p style="color: #5f6368;font-size: 16px">部分资源设置了 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">RETAIN</code> 保留策略（比如 S3 桶、KMS 密钥、DynamoDB 表），为了防止误删数据。删除 Stack 后这些资源会保留下来，需要手动在控制台删除。</p> 
 <p style="color: #5f6368;font-size: 16px">第三步：手动删除保留资源</p> 
 <p style="color: #5f6368;font-size: 16px">到对应控制台删除：</p> 
 <ul style="color: #5f6368;font-size: 16px"> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/s3/">Amazon S3</a>：<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">openclaw-user-files--</code>（先清空再删桶）</li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/dynamodb/">Amazon DynamoDB</a>：<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">openclaw-identity</code>、<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">TokenUsageTable</code>（或对应的生成名）</li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/kms/">AWS KMS</a>：<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">openclaw/secrets</code> 别名（注意 KMS 密钥需要排队 7-30 天才真正删除）</li> 
  <li style="color: #5f6368;font-size: 16px">Amazon ECR：<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">openclaw_agent</code> 镜像仓库</li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/secrets-manager/">AWS Secrets Manager</a>：<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">openclaw/*</code> 下的所有 Secret</li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/cloudwatch/">Amazon CloudWatch</a> Log Group：<code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">/openclaw/*</code> 和 <code style="background-color: #f5f5f5;padding: 2px 6px;border-radius: 3px;font-family: Consolas,monospace;font-size: 14px;color: #d63384">/aws/bedrock/*</code> 等</li> 
 </ul> 
 <div style="height: 30px"></div> 
 <h2 id="section2">十一、总结与展望</h2> 
 <p style="color: #5f6368;font-size: 16px">回顾整个过程，我们完成了一次典型的 Replatform + Refactor 混合迁移：把 OpenClaw 从一台 VPS 上的单进程应用，改造为基于 <a href="https://aws.amazon.com/cn/bedrock/">Amazon Bedrock</a> AgentCore Runtime 的多租户 Serverless 架构。</p> 
 <p style="color: #5f6368;font-size: 16px">迁移前后对比</p> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
  <tbody> 
   <tr style="background-color: #232f3e;color: #fff"> 
    <th style="padding: 12px;border: 1px solid #ddd">维度</th> 
    <th style="padding: 12px;border: 1px solid #ddd">迁移前</th> 
    <th style="padding: 12px;border: 1px solid #ddd">迁移后</th> 
    <th style="padding: 12px;border: 1px solid #ddd">策略</th> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">运行环境</td> 
    <td style="padding: 12px;border: 1px solid #ddd">VPS 上运行 <code>openclaw gateway</code> 单进程</td> 
    <td style="padding: 12px;border: 1px solid #ddd">AgentCore Runtime，Per-Session microVM（按会话微型虚拟机），按需启停</td> 
    <td style="padding: 12px;border: 1px solid #ddd">Replatform</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">用户隔离</td> 
    <td style="padding: 12px;border: 1px solid #ddd">所有用户共享进程和文件系统</td> 
    <td style="padding: 12px;border: 1px solid #ddd">每用户独立 microVM + STS scoped credentials（限制版临时凭证）</td> 
    <td style="padding: 12px;border: 1px solid #ddd">Refactor</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">数据持久化</td> 
    <td style="padding: 12px;border: 1px solid #ddd">本地 <code>~/.openclaw/</code> 目录</td> 
    <td style="padding: 12px;border: 1px solid #ddd">Amazon S3 + Workspace Sync（工作区同步），按用户前缀隔离</td> 
    <td style="padding: 12px;border: 1px solid #ddd">Refactor</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">安全</td> 
    <td style="padding: 12px;border: 1px solid #ddd">应用层自行实现</td> 
    <td style="padding: 12px;border: 1px solid #ddd">Amazon VPC + AWS KMS + Amazon Bedrock Guardrails + AWS STS + AWS Secrets Manager</td> 
    <td style="padding: 12px;border: 1px solid #ddd">Replatform</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">监控</td> 
    <td style="padding: 12px;border: 1px solid #ddd">本地日志文件</td> 
    <td style="padding: 12px;border: 1px solid #ddd">Amazon CloudWatch Dashboard + Alarm + AWS X-Ray + Token 统计</td> 
    <td style="padding: 12px;border: 1px solid #ddd">Replatform</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">扩缩容</td> 
    <td style="padding: 12px;border: 1px solid #ddd">手动扩容</td> 
    <td style="padding: 12px;border: 1px solid #ddd">AgentCore 按会话自动扩缩</td> 
    <td style="padding: 12px;border: 1px solid #ddd">Replatform</td> 
   </tr> 
  </tbody> 
 </table> 
 <p style="color: #5f6368;font-size: 16px">这个项目展示了一种将开源 AI Agent 框架迁移到 AWS 托管服务的参考路径。核心思路是：能用托管服务直接替换的（运行环境、模型调用、安全、监控）走 Replatform，需要重新设计架构的（多租户隔离、数据持久化、消息路由）走 Refactor。这种混合策略在实际迁移中比较常见 — 在关键维度做针对性的改造，同时尽可能复用已有的应用逻辑。</p> 
 <p style="color: #232f3e;font-size: 16px"><strong style="color: #232f3e">进一步探索</strong></p> 
 <table style="border-collapse: collapse;width: 100%;color: #5f6368"> 
  <tbody> 
   <tr style="background-color: #232f3e;color: #fff"> 
    <th style="padding: 12px;border: 1px solid #ddd">方向</th> 
    <th style="padding: 12px;border: 1px solid #ddd">说明</th> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">接入更多 IM 渠道</td> 
    <td style="padding: 12px;border: 1px solid #ddd">项目预留了 Slack、Discord、WhatsApp 的 Secret 槽位。Router Lambda 已内置 Slack 的 HMAC 签名验证逻辑，配置 Bot Token 后即可启用</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">自定义 Guardrails 规则</td> 
    <td style="padding: 12px;border: 1px solid #ddd">修改 <code>stacks/guardrails_stack.py</code> 中的过滤规则，适配你的业务场景。比如添加行业特定的主题拒绝规则，或调整 PII 检测的动作（ANONYMIZE vs BLOCK）</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">迁移已有工作区数据</td> 
    <td style="padding: 12px;border: 1px solid #ddd">如果你已经在使用 OpenClaw，可以将 <code>~/.openclaw/</code> 下的 Markdown 文件（MEMORY.md、USER.md 等）上传到 S3 用户桶对应的前缀下，实现数据迁移</td> 
   </tr> 
   <tr> 
    <td style="padding: 12px;border: 1px solid #ddd">多区域部署</td> 
    <td style="padding: 12px;border: 1px solid #ddd">本项目的 CDK 代码和部署脚本支持多区域部署。为每个区域创建独立的工作目录，设置不同的 <code>TARGET_REGION</code>，Dashboard 名称已加区域后缀避免冲突</td> 
   </tr> 
   <tr style="background-color: #f9f9f9"> 
    <td style="padding: 12px;border: 1px solid #ddd">成本优化</td> 
    <td style="padding: 12px;border: 1px solid #ddd">通过 <code>cdk.json</code> 调整 <code>session_idle_timeout</code>（缩短空闲超时减少 microVM 运行时间）、<code>subagent_model_id</code>（子代理用更便宜的模型）、<code>daily_token_budget</code>（设置更严格的预算告警）</td> 
   </tr> 
  </tbody> 
 </table> 
 <p style="color: #5f6368;font-size: 16px">完成！</p> 
 <p style="color: #5f6368;font-size: 16px">你已经完成了一次从单机到 Serverless 的 AI Agent 迁移和现代化改造。通过这次实操，你应该了解了：</p> 
 <ul> 
  <li style="color: #5f6368;font-size: 16px">如何用 AWS Migration &amp; Modernization 的 7R 框架分析一个开源项目的迁移策略</li> 
  <li style="color: #5f6368;font-size: 16px">Amazon Bedrock AgentCore Runtime 如何通过 Per-Session microVM 实现多租户隔离</li> 
  <li style="color: #5f6368;font-size: 16px">如何用 AWS CDK 编排复杂的多 Stack 基础设施，实现基础设施即代码</li> 
  <li style="color: #5f6368;font-size: 16px">Replatform + Refactor 混合策略在实际项目中的应用 — 在关键维度做针对性改造，同时复用已有应用逻辑</li> 
  <li style="color: #5f6368;font-size: 16px">OpenClaw 工作区数据（MEMORY.md、USER.md 等）如何从本地磁盘迁移到 S3 持久化存储</li> 
 </ul> 
 <p style="color: #5f6368;font-size: 16px"><strong>相关资源</strong></p> 
 <ul style="color: #5f6368;font-size: 16px"> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://github.com/aws-samples/sample-host-openclaw-on-amazon-bedrock-agentcore" target="_blank" rel="noopener">项目源码（GitHub）</a></li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/" target="_blank" rel="noopener">Amazon Bedrock AgentCore 开发者指南</a></li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://docs.aws.amazon.com/prescriptive-guidance/latest/large-migration-guide/migration-strategies.html" target="_blank" rel="noopener">AWS 迁移策略（7R）— Prescriptive Guidance</a></li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://github.com/openclaw/openclaw" target="_blank" rel="noopener">OpenClaw 开源项目</a></li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://docs.openclaw.ai/install/migrating" target="_blank" rel="noopener">OpenClaw 迁移指南（官方文档）</a></li> 
 </ul> 
 <p style="color: #5f6368;font-size: 16px"><strong style="color: #333"><img src="https://s.w.org/images/core/emoji/14.0.0/72x72/27a1.png" alt="➡" class="wp-smiley" style="height: 1em; max-height: 1em;"> 下一步行动：</strong></p> 
 <p style="color: #5f6368;font-size: 16px"><strong>相关产品：</strong></p> 
 <ul style="color: #5f6368;font-size: 16px"> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=1">Amazon Bedrock</a> — 用于构建生成式人工智能应用程序和代理的端到端平台</li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/bedrock/agentcore/?p=bl_pr_bedrock-agentcore_l=2">Amazon Bedrock AgentCore</a> — 加快代理投入生产的速度</li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=3">Amazon S3</a> — 适用于 AI、分析和存档的几乎无限的安全对象存储</li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/cdk/?p=bl_pr_cdk_l=4">Amazon CDK</a> — 基础设施即代码框架</li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/kms/?p=bl_pr_kms_l=5">Amazon KMS</a> — 托管式密钥管理</li> 
 </ul> 
 <p style="color: #5f6368;font-size: 16px"><strong>系列文章：</strong></p> 
 <ul> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-1/?p=bl_ar_l=1">第一篇：为什么要把 OpenClaw 从单机搬到 AWS</a></li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-2/?p=bl_ar_l=2">第二篇：环境准备与代码获取</a></li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-3/?p=bl_ar_l=3">第三篇：Phase 1 — 部署基础设施</a></li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-4/?p=bl_ar_l=4">第四篇：Phase 2 &amp; 3 — 部署 AgentCore Runtime 与业务层</a></li> 
  <li style="color: #5f6368;font-size: 16px"><a href="https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-5/?p=bl_ar_l=5">第五篇：配置消息渠道与端到端验证</a></li> 
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
    <img src="https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2025/11/14/lealiu.jpg" alt="" width="125">
   </div> 
   <h3 class="lb-h4">刘磊</h3> 
   <p style="color: #5f6368;font-size: 16px">亚马逊云科技合作伙伴解决方案架构师，致力于帮助初创企业在亚马逊云平台上实现业务部署以及GAI创新应用。在制造业和云计算领域有多年的实践经验，目前专注GAI在SAP和相关行业领域的解决方案。</p> 
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