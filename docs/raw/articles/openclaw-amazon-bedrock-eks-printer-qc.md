---
source: rss
source_url: N/A
ingested: 2026-06-01
sha256: fb252616ad625134
---

# Printer Packaging Inspection
## Overview
Visually inspect packaging photos to identify all accessories and flag missing items by comparing against the standard accessory list and reference images.
## Standard Accessory List
| # | 配件 | 标识特征 |
|---|------|---------|
| 1 | 电源线 | 黑色AC线缆，一端Schuko插头，一端C13接口 |
| 2 | 料架支撑 | 黑色L形金属支架，带横向圆管 |
| 3 | 缓冲 | 黑色矩形透明塑料盒，内有弹簧/缓冲结构 |
| 4 | 工具包 | 透明密封袋，内含内六角扳手、螺丝刀等工具 |
| 5 | 测试耗材 | 品牌PLA线材卷，带黑色注意标签 |
| 6 | 通讯线袋 | 透明袋，内含说明卡和485通讯线（45cm+100cm各一） |
| 7 | 说明书 | 纸质快速入门指南，装于透明袋 |
## Reference Images
**正常包装（所有配件齐全）：**
![正常包装](正常.jpeg)
泡沫格布局：
- 左上：说明书袋
- 左下：测试耗材线材卷
- 右上：料架支撑（L形支架）
- 右中上：工具包（透明工具袋）
- **右中：缓冲器（黑色矩形透明盒）← 关键检测点**
- 右中条形槽：导轨/横梁配件
- 右下：电源线 + 通讯线袋
---
**异常包装（缺少缓冲器）：**
![缺少缓冲器](异常.jpeg)
缺陷特征：右中泡沫凹槽为**空**，正常情况下应有黑色矩形透明缓冲盒。
## Component Reference
| 配件 | 参考图 |
|------|--------|
| 测试耗材 | ![](测试耗材.jpeg) |
| 电源线 | ![](电源线.jpeg) |
| 工具包 | ![](工具包.jpeg) |
| 缓冲器 | ![](缓冲器.jpeg) |
| 料架支撑 | ![](料架支撑.jpeg) |
| 通讯线袋 | ![](通讯线.jpeg) |
## Inspection Steps
1. **定位泡沫格布局** — 识别俯视开箱图中各凹槽区域
2. **逐项对照** — 按标准配件列表逐一确认是否可见
3. **重点检查右中凹槽** — 缓冲器是高频漏放配件，该槽为空即判定漏放
4. **输出报告** — 使用下方格式
## Output Format
```
 ****包装质检报告
━━━━━━━━━━━━━━━━━━━━━━
 图像：俯视开箱图 / 识别到 X 个配件
✅ 已确认配件：
• 料架支撑 ✓
• 工具包 ✓
• 测试耗材 ✓
• 电源线 ✓
• 通讯线袋 ✓
• 说明书 ✓
❌ 漏放配件：
1. 【高】缓冲器 — 右中泡沫凹槽为空
⚠️ 需人工复核：
• （如有遮挡或不确定项）
 漏放位置：右侧泡沫格中部凹槽
```
## Priority Classification
- **高优先级**：缓冲器、工具包、料架支撑（功能性配件）
- **中优先级**：电源线、测试耗材、通讯线袋
- **低优先级**：说明书
## Common Mistakes
| 错误 | 处理 |
|------|------|
| 缓冲器被工具包遮挡 | 标记"⚠️ 需复核"，不直接判漏放 |
| 图片角度不佳看不清右中槽 | 要求补拍该区域特写 |
| 工具包透明袋内容物不清 | 只需确认袋子存在，不需清点袋内工具 |
````

设计亮点：

1.  description写得极其具体：\`Use when\` + 触发词（unboxing images / packaging QC / accessory verification）。Agent 匹配 Skill的唯一依据就是这段；
2.  强制先读基准图：用”在回复用户任何内容之前，必须”这类强约束词，避免Agent上来就猜；
3.  拿不准就停：CRITICAL JUDGMENT RULE 显式告诉 Agent “不要猜测为’有'”，这是减少幻觉的最简单也最有效的手段；
4.  相对路径 + base\_dir：SKILL.md 不硬编码绝对路径，OpenClaw 会在 Agent 上下文注入 \`base\_dir\`，跨环境部署无需修改；

### 3.3 让 Agent “知道”Skill 存在

装好 Skill 后，我们立刻在飞书上验证——上传一张包装图，只说一句”帮我检查下”：

机器人回复： 我没有叫creality\*\*\*-packaging-inspection的技能——我的可用技能列表里没有这个。

但 `openclaw skills list` 明明显示`✓ ready`。遇到了OpenClaw一个很关键的设计点：Skill 不会自动加载进 Agent 的 Context。查workspace里的 `AGENTS.md`（Agent的基础 System Prompt），关于Skill的部分只有一句：

Skills provide your tools. When you need one, check its SKILL.md.

“你要用的时候自己去 `skills` /目录翻一下”。但 LLM 不会”自己翻”——它只会基于当前 Context 里看到的信息做决策。这本质上和RAG的召回问题一样：没被放进Context的东西，LLM 永远”不存在”。我们修改下将Skill清单追加到 `AGENTS.md` 末尾：

```
kubectl exec -n openclaw-default $POD -c openclaw -- \
  sh -c 'cat >> /home/node/.openclaw/workspace/AGENTS.md <<EOF

##  Available Workspace Skills

These skills are installed in ~/.openclaw/workspace/skills/. When a
user request matches a skill trigger, read its SKILL.md first, then
follow its steps.

- **creality***-packaging-inspection** — Use when inspecting Creality***
  printer packaging photos to identify all accessories and detect
  missing items. Triggers: unboxing images, packaging QC, accessory
  verification, 包装质检, 配件检查, 缺件识别.
  - Read: ~/.openclaw/workspace/skills/creality***-packaging-inspection/SKILL.md

When users upload images related to printer packaging, you MUST
invoke the creality***-packaging-inspection skill.
EOF'
```

开新会话再测试，Agent 正常触发。我们用两个极端样例来验证 Skill 的实际判断能力。

**场景 1：空托盘（所有配件都漏放）**

质检员拍一张只有黑色泡沫托盘、没有任何配件的照片发给飞书机器人：

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/26/amazon-eks-practice-assistant-4.jpg)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/26/amazon-eks-practice-assistant-4.jpg)

\[图4\]

用户上传一张没有任何配件的空泡沫托盘图，机器人正确识别为「已确认配件 0 件 / 漏放配件 7 件」，逐槽给出漏放项，并在结论中明确标注”这是一个空托盘”。每个漏放项都带优先级标签（高/中），便于后续处理排序。

**场景 2：配件基本齐全但缺显示器（真实产线常见缺件场景）**

质检员拍一张 6 件配件到位、但显示器忘放（右中矩形槽空）的照片：

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/26/amazon-eks-practice-assistant-5.jpg)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/26/amazon-eks-practice-assistant-5.jpg)

\[图5\]

用户上传一张”看起来基本齐全”的包装图，机器人仍然准确识别出右中矩形槽缺少显示器，并标记为「高优先级」漏放项。整判断耗时约 5 秒，与资深质检员的目检结果完全一致。

这就是 Skill 方法论的核心价值：把资深质检员的判断规则（”空槽要看见黑色泡沫底”、”显示器槽要看到银色铝箔反光”）固化到 SKILL.md，让每个新员工都能输出资深水准的质检报告。不需要跟师傅学几周，不需要记住 7 个槽位的细节特征——规则都在 Skill 里，Agent 负责执行，人类负责复核高风险项。

## **4\. 4 经验总结**

在将OpenClaw部署到Amazon EKS Auto Mode并对接Bedrock + 飞书的过程中，我们遇到了一些典型问题。本节将这些经验整理成最佳实践，帮助开发者少走弯路。

### 4.1 EKS Auto Mode 部署经验

问题 1：EKS Auto Mode节点创建失败，Pod一直 Pending。

原因：EKS Auto Mode要求Cluster IAM Role 的Trust Policy必须包含sts:TagSession权限，这和传统EKS的要求不同。

解决方案：CloudFormation模板中显式添加：

```
ClusterRole:
  Type: AWS::IAM::Role
  Properties:
    AssumeRolePolicyDocument:
      Statement:
        - Effect: Allow
          Principal:
            Service: eks.amazonaws.com
          Action:
            - sts:AssumeRole
            - sts:TagSession    # EKS Auto Mode 必须
```

问题 2：VPC Endpoint不通，Pod访问Bedrock/EFS/STS全部超时。

原因：EKS Auto Mode自动创建的Pod Security Group没有固定ID，VPC Endpoint 的SG无法精确放行。

解决方案：VPC Endpoint SG放行整个VPC CIDR段：

```
VPCEndpointSG:
  Type: AWS::EC2::SecurityGroup
  Properties:
    SecurityGroupIngress:
      - IpProtocol: tcp
        FromPort: 443
        ToPort: 443
        CidrIp: !Ref VpcCidr   # 10.0.0.0/16，覆盖所有 Pod
```

问题 3：Port-forward不稳定，kubectl port-forward经常broken pipe。

解决方案：直接kubectl exec进Pod跑TUI比port-forward稳定得多，并且免公网暴露：

```
POD=$(kubectl get pod -n openclaw-default -l app=openclaw \
       -o jsonpath='{.items[0].metadata.name}')
kubectl exec -it -n openclaw-default $POD -c openclaw -- \
  env HOME=/home/node openclaw tui
```

### 4.2 OpenClaw 版本选型

问题 1：OpenClaw 2026.5.2 飞书插件死循环重启，日志持续报 \_\_dirname is not defined in ES module scope。

原因：这是OpenClaw上游2026.5.x系列的已知打包bug，feishu插件在 ESM 模式下触发\_\_dirname 未定义。容器内 /app/dist/ 是overlay层，任何in-place patch都会在重启后被还原。

解决方案：回滚到社区验证过的 2026.4.15 稳定版本：

```
kubectl set image deployment/openclaw -n openclaw-default \
  openclaw=ghcr.io/openclaw/openclaw:2026.4.15 \
  init-config=ghcr.io/openclaw/openclaw:2026.4.15
```

建议：生产环境严禁使用:latest tag，必须固定到社区验证过的具体版本。

问题 2：Pod 重启后TUI状态栏显示model: unknown。

原因：initContainer的openclaw config set每条都是独立进程重写config 文件，Gateway主进程启动时读到某一个中间态 config。

解决方案：initContainer内必须一次性完整写齐所有配置，包括：

```
openclaw config set gateway.mode local
openclaw config set gateway.bind lan
openclaw config set gateway.port 18789
openclaw config set gateway.auth.mode token
openclaw config set gateway.auth.token "<token>"
openclaw config set gateway.controlUi.dangerouslyAllowHostHeaderOriginFallback true
openclaw config set gateway.controlUi.allowedOrigins '["http://localhost:18789","http://127.0.0.1:18789"]'
openclaw models set amazon-bedrock/us.anthropic.claude-sonnet-4-6
openclaw plugins enable amazon-bedrock || true    # 关键：不加这行 TUI 拿不到 model 元数据
```

## **5、成本分析**

场景：POC日均200次质检请求 × 2张图片，月运行30天 × 24小时。

序号

费用类别

实际运行资源

月用量

官方单价（us-east-1）

月费用（USD）

1

Amazon EKS Auto Mode

1 个 EKS 集群

730 h

$0.10/h

$73

2

Amazon EC2（计算节点）

c6a.large

730 h

$0.0765/h

$55.85

3

Amazon Bedrock(Claude Sonnet 4.6)

200 次/天 × 30 天 × 7004 tokens = 42.024M

input:42.024M tokensoutput:3.6M tokens

input:$3/1Moutput:$15/1M

$180

4

NAT Gateway（2 个，跨 AZ 高可用）

2 × us-east-1a/b

2 × 730 h

$0.045/h  $0.045/GB

$65.70

5

VPC

4 个 × 2 AZ

8 × 730 h

$0.01/h  $0.01/GB

$58

6

EFS

Skill 资源

$0.30/GB-月

$0.01

合计

$438.56

**后续降本建议**

*   非工作时段 scale 到 0：`kubectl scale deployment openclaw --replicas=0`，只保留 EFS（几乎免费）
*   生产量大时切换到 Claude Haiku 4 完成图片识别的第一道筛查，复杂判断才升级到 Sonnet 4.6
*   Cluster 跨多个租户共享 Pod（OpenClaw 支持多租户命名空间）

## **6、结论**

本文展示了如何基于OpenClaw + Amazon EKS Auto Mode + Amazon Bedrock的组合，在客户AWS账户内部署一个完整的视觉质检AI Agent。覆盖了从CloudFormation基础设施自动化、OpenClaw容器化、自定义 Skill 开发与安装、飞书Channel 接入、Agent 架构选型到成本优化的完整实施路径。

**核心贡献**

1.  方法论创新：验证了OpenClaw Skill机制在垂直规则化判断任务上的性价比优势——相比Fine-tune和RAG，Skill 的迭代速度（改 Markdown立即生效）、调试友好度（人可读）、跨模型迁移性（无状态）都是碾压级别。
2.  架构优势：Amazon EKS Auto Mode + Amazon Bedrock VPC Endpoint 的组合，让客户既享受了Kubernetes的编排能力和模型的私有化推理，又避免了传统Kubernetes的运维复杂度和自建模型的资源投入。
3.  业务价值：打印机出厂包装质检从”人工看 30 秒 + 经验判断”升级为”发图 5 秒出标准化报告”，准确率对齐资深质检员，通过已有的飞书入口触达产线员工，无需学习新系统。

**Skill vs Fine-tune vs RAG 选型建议**

维度

Skill

Fine-tune

RAG

1

准备成本

几小时写 SKILL.md

几千到几万条标注数据

建索引 + 切分 + 嵌入

2

迭代速度

改 Markdown 立即生效

重训几小时到几天

重建索引几分钟到几小时

3

适合场景

SOP 类、规则清晰

通用能力提升、风格固化

大量事实性知识检索

4

跨模型迁移

✅ 无状态

❌ 绑死模型版本

✅ 无状态

5

调试友好度

✅ 人可读

❌ 黑盒

⚠️ 看召回结果

**Skill 适用的三个前提**

1.  任务有明确的步骤化判断规则（SOP 类、质检类）
2.  可以用参考样本锚定特征（如本文的正常/异常对比图）
3.  用户场景可以按业务分群（为多 Agent 扩展留空间）

实践价值：如果您面临类似的”规则化视觉判断”、”标准化流程自动化”等场景，希望减少人工重复劳动、降低新员工培训成本、建立可追溯的数字化记录，本文的OpenClaw + Bedrock 方案可以作为快速启动模板：

*   快速上线：从零到能跑，CloudFormation + 一键脚本，1-2 天内完成 POC
*   零 Node 运维：EKS Auto Mode 托管节点、存储、扩缩容、补丁更新
*   成本可控：按 Pod 运行时间 + Bedrock Token 实际用量计费，闲时 Scale 到 0
*   隐私合规：数据全程在VPC Endpoint 内闭环，不出AWS 账户
*   业务自主迭代：规则变更只需改 SKILL.md，不依赖研发发版

随着大模型能力持续提升和企业 AI 落地场景不断扩展，基于Agent + Skill的轻量化领域知识注入模式，将成为垂直行业数字化转型的重要支撑。我们相信通过持续打磨Skill设计方法论和部署工程实践，能为更多制造、质检、巡检类场景提供高效、精准、可快速迭代的智能化解决方案。

**➡️ 下一步行动：**

**相关产品：**

*   [Amazon EKS](https://aws.amazon.com/cn/eks/?p=bl_pr_eks_l=1) — 托管式 Kubernetes 服务
*   [Amazon Bedrock](https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=2) — 用于构建生成式人工智能应用程序和代理的端到端平台
*   [Amazon VPC](https://aws.amazon.com/cn/vpc/?p=bl_pr_vpc_l=3) — 隔离云网络
*   [Amazon EFS](https://aws.amazon.com/cn/efs/?p=bl_pr_efs_l=4) — 弹性文件存储
*   [Amazon CloudFormation](https://aws.amazon.com/cn/cloudformation/?p=bl_pr_cloudformation_l=5) — 基础设施即代码服务

**相关文章：**

*   [Multi-Agent 架构在零售供应链运营中的实践：贯穿数据、洞察与行动](https://aws.amazon.com/cn/blogs/china/multi-agent-architecture-retail-practice/?p=bl_ar_l=1)
*   [从应用到 Agent：开发范式正在发生什么变化？](https://aws.amazon.com/cn/blogs/china/application-agent-development/?p=bl_ar_l=2)
*   [构建专业化 AI 而不牺牲通用智能：Nova Forge 数据混合实战](https://aws.amazon.com/cn/blogs/china/building-specialized-ai-without-sacrificing-general-intelligence-nova-forge-data-mixing-in-practice/?p=bl_ar_l=3)
*   [快时尚电商行业智能体设计思路与应用实践（七）Amazon Bedrock AgentCore Runtime 深度解析和场景分析](https://aws.amazon.com/cn/blogs/china/amazon-bedrock-agentcore-runtime-deep-dive-and-scenario-analysis/?p=bl_ar_l=4)
*   [基于 AWS DevOps Agent 构建 AI 驱动的运维分析系统](https://aws.amazon.com/cn/blogs/china/based-on-aws-devops-agent-build-ai-operations-analytics-system/?p=bl_ar_l=5)

## **7\. 参考文档**

1.  [OpenClaw 官方文档](https://openclaw.ai/)
2.  [Amazon Bedrock 用户指南](https://docs.aws.amazon.com/bedrock/)
3.  [Amazon EKS Auto Mode](https://docs.aws.amazon.com/eks/latest/userguide/automode.html)
4.  [Claude on Bedrock](https://docs.aws.amazon.com/bedrock/latest/userguide/models-supported.html)
5.  [OpenClaw Feishu Channel 文档](https://github.com/openclaw/openclaw/blob/main/docs/channels/feishu.md)
6.  [Amazon EKS VPC Endpoint 配置](https://docs.aws.amazon.com/eks/latest/userguide/vpc-interface-endpoints.html)
7.  [Amazon EFS CSI Driver](https://docs.aws.amazon.com/eks/latest/userguide/efs-csi.html)
8.  [blog参考源码](https://github.com/tianpeijun/openclaw)

\*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

* * *

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/summit-tag3.png)

## 亚马逊云科技中国峰会

开发者挑战赛现场开启，基于真实业务场景亲手构建 Agent。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/25/yuyuecanhui.png)](https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p2&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d)

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/14/2026_Summits_Commercial_Banner_1440x657.png)
