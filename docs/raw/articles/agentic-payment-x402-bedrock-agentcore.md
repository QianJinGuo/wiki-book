---
title: "让 AI 代理自己付钱：基于 Amazon Bedrock AgentCore 与 x402 的 Agentic Payment"
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/ai-agent-based-on-amazon-bedrock-agentcore-x402-agentic-payment-solution/
ingested: 2026-06-01
feed_name: AWS
source_published: 2026-06-01T06:04:02Z
type: article
sha256: aad285644938d384f111e9d3b529fde66f21d636d9badb9116a5a49b8c8bca7a
tags: [agentic-payment, x402, bedrock, aws, protocol]
---
# 让 AI 代理自己付钱：基于Amazon Bedrock AgentCore与 x402 的Agentic Payment 方案

摘要：当 AI 代理（AI Agent）需要消费付费 API、付费 MCP 服务器或付费内容时，传统的人工审批和包月订阅模式跟不上代理按调用、按内容结算的节奏，支付环节成了代理工作流里最容易卡住的部分。  
本文结合 Amazon Bedrock AgentCore Payments（Preview）与 x402 协议，配合 Amazon CloudFront、AWS Lambda@Edge、Amazon S3 组成的卖方基础设施，设计出一套代理自主完成微支付、卖方按调用收费的端到端方案，覆盖服务组件详情、业务流程与详细架构。  
注：Amazon Bedrock AgentCore Payments 目前以 Preview 形式提供，接口和支持的链 / Payment Connector 在正式 GA 前可能调整。本文示例基于 2026 年 5 月版 API。

**目录**

01 一、背景：代理还不能自己付钱

02 二、x402 协议简介

03 三、Amazon Bedrock AgentCore Payments

04 四、业务场景：代理替用户下单买一份需要付费内容

05 五、详细架构：一次完整业务请求示例

06 六、关于换链、换协议的扩展性

07 七、方案部署前要准备什么

08 八、方案截图

09 九、小结

10 十、结语

* * *

## **一、背景：代理还不能自己付钱**

越来越多的代理已经能独立完成多步任务，但只要任务走到“要付钱”这一步，流程往往就得停下来等人工介入。所以问题不在代理本身，而在现有支付基础设施。信用卡、对公汇款、按月订阅这些方式是给人用的，光是单笔交易的最低手续费就常常高过代理实际要花的费用。

使用代理支付要解决的问题其实很具体。金额通常不大，几美分甚至几厘；整个支付要在一次交互里完成，不能再绕开账户注册和凭证交换；另一方面钱包要让代理用得上，但又必须被组织管住，预算、时间窗、审计这几件少一样都不行；最后每一笔支出还得留得下证据，事后说得清楚。把这些需求整体梳理，需要三成配合：机器之间能直接谈的支付协议、代理可以安全调用的托管钱包、卖方能低成本挂价和验签的基础设施。本文里这三层分别对应 x402 协议、[Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/>) Payments，以及 [Amazon CloudFront](<https://aws.amazon.com/cn/cloudfront/>) 加 [AWS Lambda](<https://aws.amazon.com/cn/lambda/>)@Edge 这一类边缘计算服务。重点讲中间一层，并通过一个参考实现把这三层串联起来。

举一个真实的代理支付流程：一个金融研究代理可能需要订阅几家行情 API 拉实时报价、调用付费的 MCP 服务器跑一段量化指标计算、再去某个内容平台买一份行业研报作为依据。这些资源各自的供应商不同、定价不同、单笔金额从几厘到几美元不等。如果每接入一家就要走一次开户、签合同、领 API Key、对账这一整套流程，代理就只能停下来等待人工审核；如果让代理直接拿着信用卡或某把私钥去结算，组织又没办法管住预算和审计。代理支付要解决的，正是这两难之间的空缺：让代理有能力在一次任务里直接付钱，同时让组织保留对“花谁的钱、能花多少、花在哪儿”的控制，确保支付的安全。

一旦做通，对企业有三层直接的好处。第一是代理能真的把任务跑完，不会因为下一步要付钱就停下来；第二是效率高—钱包托管、预算硬约束、代理身份、审计闭环这几件，原本各自都是要立项做的事，托管服务把它们打包，从原来需要数月的工程量压缩到数天；第三是风险有上限，代理就算被攻破，能花掉的钱也被服务端的预算锁住，代码层绕不过去，最坏情况可以在事前预防。这几点后面在对象模型和架构图里都会涉及。

## **二、x402 协议简介**

x402 由 Coinbase 发起、x402 Foundation 维护，把 HTTP 402 Payment Required 状态码用作机器对机器的支付握手。一次典型交互大致是这样的：

  * 代理正常请求资源；
  * 卖方发现资源需要付费，返回 x402 并附上支付要求（收款地址、金额、币种、有效期、目标链）；
  * 代理据此签一张离线授权（EIP-3009 TransferWithAuthorization）；
  * 代理带签名重试；
  * 卖方校验签名，通过 Facilitator 在链上完成 USDC 结算（在 Base 这类 L2 上，单笔结算通常在亚秒级完成，Gas 成本约在亚美分量级，具体随网络拥塞波动）。



整个过程在一次 HTTP 的交互里就完成，双方之间不用预先开账户、不用交换 API Key、也不用对账单。不过 x402 只回答了“双方怎么谈”这一半问题，另一半——“代理在组织内部怎么安全地把这笔钱付出去”——它没管。这部分恰好是 [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) AgentCore Payments 要解决的。

## **三、Amazon Bedrock AgentCore Payments**

### 3.1 服务定位：从协议到生产之间还差什么

如果团队选择直接让代理使用x402协议，会发现协议本身只解决了一半的问题，另一半要自己补齐，至少有四点需要完善。第一是钱包密钥放在哪。容器、AWS Lambda、Pod 里不能直接放私钥，改用 [AWS KMS](<https://aws.amazon.com/cn/kms/>)、HSM 或自建托管都各有成本，密钥生命周期、灾备和合规评审都要重新走一遍。第二是怎么把支出真正卡住。大语言模型可以被提示词指示做事，例如把“每次最多 1 USDC”写进 system prompt，prompt injection 很容易绕过；靠谱的做法是把预算边界放到服务端来强制。第三是代理的身份怎么接。代理不是人类，所以以用户为中心的传统身份模型套不上去，需要一套可审计、可撤销、按最小权限发的身份机制，还要在运行时按任务临时降权。第四是审计证据怎么记录。每笔支出都要能追到代理、钱包、会话、签名、链上交易，应用日志分散在容器、网关、链上不同位置，事后从日志里拼出完整链路并不容易。

Amazon Bedrock AgentCore Payments 作为一项完全托管的服务，把这四点都覆盖—钱包由服务托管，签名按需调用；预算控制在服务端强制约束；代理身份直接对接 [AWS IAM](<https://aws.amazon.com/cn/iam/>)服务；支付决策和链上证据自动落到审计日志里。对使用方来说，从“代理能谈支付”到“代理能安全地把钱付出去”之间的鸿沟，也就从原来要花几个月写的代码，缩短到简单的调几个 API即可解决。

更具体一点说，传统支付方式的最低手续费会吃掉单次调用的实际费用，而内容供应商也越来越倾向于对机器或代理访问设置付费墙，代理要做的是按调用、按内容去买，而不是签一份按月计费的合同。Amazon Bedrock AgentCore Payments 正是为这种模式而生，让代理可以在受控的范围内为付费 API、Model Context Protocol（MCP）服务器以及受保护内容完成支付，并且原生支持微交易（micropayment）。

### 3.2 Amazon Bedrock AgentCore Payments 提供的能力

Amazon Bedrock AgentCore Payments 的核心能力包括：

  * 托管钱包配置：代理自动获得一个范围受限的嵌入式钱包，开发者不处理私钥，也不需要自己搭密钥托管方案。
  * 原生 x402 支付执行：代理收到 HTTP 402 请求时，Amazon Bedrock AgentCore Payments 会评估支付条款、签发 USDC 微支付、重试请求，整条链路在托管运行环境内内完成，代理的代码不需要签名逻辑。
  * 基于 Policy 的支出限额管理：财务和合规团队可以为每个代理、每个 Payment Session 设定支出限额，运行时由服务端强制，代理代码绕不过。
  * 统一审计追踪：每笔支付决策都会被记录，关联代理身份、钱包、Payment Session、签名和链上交易哈希，形成完整的问责链路。



在底层，Amazon Bedrock AgentCore Payments 通过 Payment Connector 对接 Coinbase Developer Platform（CDP）、Stripe Privy 这一类钱包后端，x402 协议握手所需要的签名动作都发生在服务端，代理本身拿不到私钥。

### 3.3 在 Amazon Bedrock AgentCore 中的位置

Amazon Bedrock AgentCore 是 AWS 为生产级代理提供的一套托管基础设施，主要组件包括：

  * Amazon Bedrock AgentCore Runtime：代理容器运行时，自动伸缩；
  * Amazon Bedrock AgentCore Gateway：面向外部工具和 MCP Server 的 API 网关，带 SigV4 与限流；
  * Amazon Bedrock AgentCore Identity：工作负载身份与凭证管理；
  * Amazon Bedrock AgentCore Memory：多轮会话记忆；
  * Amazon Bedrock AgentCore Observability：追踪、日志、指标；
  * Amazon Bedrock AgentCore Payments：代理支付。



这几个组件的思路是一致的——把需要基础设施层重复要做的事变成托管服务，让支付开发者把精力放在代理的业务逻辑上。Amazon Bedrock AgentCore Payments 负责的正是“代理要花钱”的痛点解决。

### 3.4 核心对象模型

Amazon Bedrock AgentCore Payments 把代理支付这件事抽象成 5 个对象——Payment Manager、Payment Instrument、Payment Session、Payment Credential Provider、Payment Connector。其中代理在运行时直接会用到的只有前 3 个，后两个属于一次性配置，创建 Payment Manager 时被引用一次后就被固化，运行时代理看不到。下面就以代理实际使用的这 3 个为主线来讲。

Payment Manager 是账户下的顶级资源，相当于代理支付的“账本根”。它里面写着授权器配置（AWS_IAM 或 CUSTOM_JWT）和运行时 IAM 角色。其下面挂着的 Payment Instrument、Payment Session 以及每一笔支付记录都归Payment Manager 管，做审计和报表也以它为最小的聚合单位。一个 AWS 账户里可以开多个 Payment Manager，通常用来分隔测试和生产、不同业务线。

Payment Instrument 是对钱包的一个引用，而不是钱包本身。一个 Payment Manager 下可以挂多个 Payment Instrument，每个对应一条链。CreatePaymentInstrument 接口返回的是一个 instrument_id 字符串，私钥始终留在 CDP 或 Privy 这类钱包后端里。代理代码只认这个 instrument_id，并不需要知道背后是哪家钱包提供商。换提供商或者增加一条新链的时候，改一下 Payment Instrument 的绑定就可以，代理代码不用动。

Payment Session 代表一次支付的上下文，可以配置 maxSpendAmount、币种和有效期。一旦 Payment Session 过期或者花超，同一个 Payment Session 里后续的 ProcessPayment 调用就会被直接拒掉；如果遇到已经扣款但签名失败的情况，服务端会自动回滚。maxSpendAmount 是在服务端校验的，不是代理代码里的“软约束”，也是这套方案最终能给到企业的那条“硬上限”。每一个 Payment Session 同时也是一笔独立的授信记录，做分账和对账非常自然。

代理在运行时手里只有这 3 个 ID——Payment Manager ARN、Payment Instrument ID、Payment Session ID，既看不到私钥，也看不到 Payment Connector 和 Payment Credential Provider 的具体内容。

另外剩下的两个一次性配置：1）Payment Credential Provider 用来保存对接钱包后端所需的凭证（例如 CDP API Key、Privy 应用凭证），底层落在 [AWS Secrets Manager](<https://aws.amazon.com/cn/secrets-manager/>) 里，通过 ARN 被引用，不会以明文形式出现在 Payments API 调用中；2）Payment Connector 则是钱包后端的适配器，每个 Payment Connector 绑定一个 Payment Credential Provider，目前支持 Coinbase CDP（MPC 钱包）和 Stripe Privy（嵌入式钱包）两种后端。

Amazon Bedrock AgentCore Payments 把对象拆成几层，好处是 IAM 权限可以按对象独立收紧。管理角色（ManagementRole）可以创建和管理 Payment Manager、Payment Instrument、Payment Session，但不能调用 ProcessPayment，这条在策略里是显式 DENY；支付角色（ProcessPaymentRole）则相反，可以在 Payment Session 的预算之内调 ProcessPayment，但不能创建新的 Payment Session、不能改预算、也不能换钱包。这样一来，“搭架构的人”和“花钱的人”就在 IAM 层面被分开了，正好对应传统金融合规里的职责分离要求。代理在这里扮演的是“花钱的人”，拿到的只是最小权限集，就算被攻破，能造成的最大损失也就是当前这个 Payment Session 的 maxSpendAmount。

一个典型的组合：一个 Payment Manager 对应一条业务线，下面挂两三个 Payment Instrument，分别对应不同的结算链或币种（比如 USDC on Base、USDC on Arbitrum），每个 Payment Instrument 下面再按支付场景开不同的 Payment Session——“单次购买 0.01 USDC”、“本次任务上限 1 USDC”、“当月累计 100 USDC”。代理手里持有的只是当次任务对应的那 3 个 ID。Payment Manager 和 Payment Instrument 的生命周期由运维和财务控制，Payment Session 的生命周期则交给业务系统去管。

## **四、业务场景：代理替用户下单买一份需要付费内容**

### 4.1 场景

用户在前端选中一份付费内容（一份数据报告、一次 API 查询、或者一个模型推理结果），点一下“获取”，剩下的下单、付款、取回内容这几步都由代理代替他完成。用户只在最开始确认一次，后面的环节不需要再干预。卖方（Seller）要求先付款再交付；金额是微支付；签名和转账都不经用户的手，由代理来做；用户或其所在公司则希望代理只在预先授权的范围里花钱，事后每一笔都能查到。下面分别看卖方和付款方（Payer）这两侧各自要做的事。

### 4.2 卖方侧：发布目录、挂价签、验凭证

卖方要让代理“看见”自己的资源目录，有两种思路。一种是把资源目录放到 Coinbase 提供的 x402 Bazaar MCP server 上，那是个集中的 x402 端点目录，代理可以直接搜索、对接；另一种是自建 Amazon Bedrock AgentCore Gateway（本方案走的是这条，更适合那些希望对自己的目录、定价和访问控制保留完整所有权的内容方）。在本方案里，卖方写好的 OpenAPI 规范会被 Amazon Bedrock AgentCore Gateway 自动转换成一份 MCP 工具列表，代理访问 Gateway 的 /mcp/tools 端点就能拿到这份列表。每个MCP工具条目里包含资源名、描述、类别、标签、是否需要付费（requires_payment）、参考价格等元数据。对卖方来说，配置一次目录，任何支持 MCP 的代理都能找到并调用，不再需要为每个客户单独开户、分发 API Key。

挂价签是第二步。代理真正请求某个付费资源的时候，卖方按 x402 协议返回 402 Payment Required，并在响应头里给出本次交易的具体条款——收款地址、金额（USDC）、目标链、授权有效期、资源描述。MCP 目录里给的是参考价，而 402 头里的才是本次的最终条款；这种分开的设计也给按用户、按调用频次做动态定价留出了业务扩展空间。

验凭证是第三步。代理带着签名重新请求时，卖方校验这个签名，通过 Facilitator 在链上完成 USDC 结算，然后把内容返回给代理。因为支付和内容交付是绑在一起的，如果验签失败或者链上结算没成功，内容就不会被放行。

本方案在卖方侧用 Amazon CloudFront、AWS Lambda@Edge、[Amazon S3](<https://aws.amazon.com/cn/s3/>) 加上 Amazon Bedrock AgentCore Gateway 来分别承担这三件事：1）Amazon Bedrock AgentCore Gateway 负责把 OpenAPI 转换成 MCP 工具目录并对外暴露；2）Amazon CloudFront 作为全球入口，提供加速、[AWS WAF](<https://aws.amazon.com/cn/waf/>) 和 DDoS 防护；AWS Lambda@Edge 在边缘执行“价签 + 验签”逻辑，请求里没有带签名头就返回 Http head 402，带了签名就验签，并通过 Facilitator 在 Base Sepolia 上完成结算；3）Amazon S3 存放真正的付费内容，只有 AWS Lambda@Edge 放行之后才会被回源；x402 Facilitator 这一侧则负责代付 Gas、把签名提交到链上。

AWS Lambda@Edge 的 x402 应答构造代码：
    
    
    // 当请求未携带 X-PAYMENT 头时，返回 x402 + 支付要求
    function create402Response(
      uri: string,
      requirements: PaymentRequirements,
      errorMessage?: string
    ): CloudFrontRequestResult {
      const paymentRequired: PaymentRequired = {
        x402Version: 2,
        error: errorMessage || 'Payment required to access this resource',
        resource: {
          url: uri,
          description: `Protected resource at ${uri}`,
          mimeType: 'application/json',
        },
        accepts: [requirements],   // 收款地址、金额、目标链、有效期
        extensions: {},
      };
    
      return {
        status: '402',
        statusDescription: 'Payment Required',
        headers: {
          'content-type': [{ key: 'Content-Type', value: 'application/json' }],
          'x-payment-required': [{
            key: 'X-PAYMENT-REQUIRED',
            value: Buffer.from(JSON.stringify(paymentRequired)).toString('base64'),
          }],
        },
        body: JSON.stringify({
          error: 'Payment Required',
          x402Version: 2,
        }),
      };
    }
    

当代理带签名重新请求时，同一个 AWS Lambda@Edge 函数会从 X-PAYMENT 头里取出签名证明，先调 Facilitator 的 /verify 接口做离线签名校验，再调 /settle 接口在 测试链Base Sepolia 上提交 USDC 转账，最后把链上交易哈希放进 X-PAYMENT-RESPONSE 头，跟内容一起返回。整个 402 协商对存放内容的 Amazon S3 是完全透明的——Amazon S3 桶不参与支付逻辑，只有在 AWS Lambda@Edge 放行之后才会被回源。对卖方来说，这套组合的好处是显而易见的：不需要自己维护服务器，不需要搭账户系统，也不用接入信用卡网关，就能把任意数字内容挂上目录、标上价、收到钱。

### 4.3 付款方侧：Amazon Bedrock AgentCore Payments 如何满足支付需求

用户或者公司希望代理只在预先约定好的范围内做事，归到底有五个问题：谁能花、花谁的钱、能花多少、能花多久、花完了怎么对账。这五个问题在 Amazon Bedrock AgentCore Payments 里分别由 Payment Manager、Payment Instrument、Payment Session、IAM 角色和 Audit Log 来回答。把上一节的卖方侧接上去，流程如下：

  * 用户点击“获取内容”，控制面按业务规则创建一个 Payment Session，设置 maxSpendAmount = 0.01 USDC，有效期 60 分钟。
  * 代理先查 MCP 目录，读取资源清单、requires_payment、参考价格，结合本次预算决定要不要下单、下哪个单。
  * 代理发起访问请求，拿到 x402 响应，从头里取出本次交易的 x402 条款。
  * 代理调用 ProcessPayment，把 Payment Manager ARN、Payment Session ID、Payment Instrument ID 和 x402 payload 传过去。代理不解析 payload，也不构造签名。
  * 服务端校验 Payment Session（是否过期、是否超额、是否授权给本代理），通过 Payment Connector 让钱包完成 EIP-3009 签名，返回签名证明；若扣款已发但签名失败自动回滚。
  * 代理把签名证明放进 X-PAYMENT 头，重试请求。
  * 卖方验签、结算，把内容返回。代理把内容交付给用户，并附上链上交易哈希作为收据。



代理调用 ProcessPayment 的代码如下：
    
    
    import boto3, uuid
    
    dp = boto3.client("bedrock-agentcore", region_name=config.aws_region)
    
    # x402_payload 来自卖方 x402 响应头的 X-PAYMENT-REQUIRED；
    # 代理不解析、不构造签名，原样透传给服务端
    response = dp.process_payment(
        userId=config.user_id,
        paymentManagerArn=config.payment_manager_arn,
        paymentSessionId=config.payment_session_id,
        paymentInstrumentId=config.payment_instrument_id,
        paymentType="CRYPTO_X402",
        paymentInput={
            "cryptoX402": {
                "version": str(x402_version),
                "payload": x402_payload,
            }
        },
        clientToken=str(uuid.uuid4()),
    )
    
    if response["status"] == "PROOF_GENERATED":
        proof = response["paymentOutput"]["cryptoX402"]
        # 把 proof 放进 X-PAYMENT 头，重试原请求
    

代理代码里既看不到私钥，也看不到 EIP-3009 的签名构造，更没有办法绕过 maxSpendAmount——这些都是 Amazon Bedrock AgentCore Payments 服务端在 process_payment 返回之前替它完成的。

注意先查 MCP 目录这一步并不是多余的。MCP 回答的是“有什么、卖多少钱”，属于发现这一层；x402 配合 Amazon Bedrock AgentCore Payments 回答的则是“怎么付、怎么授权、怎么对账”，属于交易这一层。两者结合，代理可以先读目录再决定下单，而不是见到 x402 请求就立刻付钱，确保更安全。

### 4.4 把两侧连接到一起

把两侧拼到一起，流程如下：浏览器调用 Web UI；Web UI 通过 [Amazon API Gateway](<https://aws.amazon.com/cn/api-gateway/>) 加上一个 AWS Lambda Proxy 函数，把请求转给 Amazon Bedrock AgentCore Runtime 里的代理；代理一边通过 Amazon Bedrock AgentCore Gateway 查 MCP 目录，一边通过 Amazon CloudFront 访问卖方资源；遇到 Http head 402 就调用 Amazon Bedrock AgentCore Payments 完成签名，再带着签名去重新请求，由 AWS Lambda@Edge 完成验签，并通过 Facilitator 在链上结算；结算成功之后内容从 Amazon S3 回源返回。两侧之间唯一的接口是 x402 协议，因此卖方可以换内容存储、换链、换 Facilitator，代理这一侧也可以换 LLM、换钱包服务商、换预算策略，只要 x402 协议不变，对方就不会受到影响。

## **五、详细架构：一次完整业务请求示例**

### 5.1 详细架构图

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/01/ai-agent-based-on-amazon-bedrock-agentcore-x402-agentic-payment-solution-1.png>) [图1 代理支付端到端组件图：浏览器、Web UI、Amazon Bedrock AgentCore、卖方基础设施、x402 Facilitator、Base Sepolia]  
---  
  
关注点：

  * Payment Credential Provider 放在 Amazon Bedrock AgentCore Identity / AWS Secrets Manager 里。它通过 ARN 被 Payment Connector 引用，代理和管理面都不会直接看到明文凭证。
  * Payment Connector 是虚线关系。它在创建 Payment Manager 时被引用一次并被 Payment Manager “内化”，之后运行时代理只面对 Payment Manager / Payment Instrument / Payment Session，而看不到 Payment Connector ID。
  * 代理只有 3 个 ID。Payment Manager ARN / Payment Instrument ID / Payment Session ID，对应“哪条业务线 / 哪张钱包 / 本次能花多少”。
  * 私钥始终在 CDP MPC 侧。Amazon Bedrock AgentCore Payments 持有的是调用 CDP 签名的授权凭证，不是私钥本身。
  * 卖方侧的 Amazon Bedrock AgentCore Gateway 在 AWS Lambda@Edge 之前，负责把卖方的 OpenAPI 变成 MCP 工具目录供代理发现；真正的 x402 协商和链上结算仍在 Amazon CloudFront 加 AWS Lambda@Edge 加 Facilitator 这条路径上。



### 5.2 数据流程图

**5.2.1 Buyer 侧（付款方）数据流程图**

Buyer 侧把代理拿到 Http head 402 之后的逻辑展开：从 ProcessPayment 调用 → Session 校验 → 凭证拉取 → 钱包签名 → 带签名重试。横轴是参与方，纵轴是步骤。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/01/ai-agent-based-on-amazon-bedrock-agentcore-x402-agentic-payment-solution-2.png>) [图2 Buyer 侧-付款方数据流程图]  
---  
  
**5.2.2 Seller 侧（卖方）数据流程图**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/01/ai-agent-based-on-amazon-bedrock-agentcore-x402-agentic-payment-solution-3.png>) [图3 Seller侧卖方数据流程图]  
---  
  
  * Credential Provider 放在 AgentCore Identity / Secrets Manager 里。它通过 ARN 被 Connector 引用，代理和管理面都不会直接看到明文凭证。
  * Connector 是虚线关系。它在创建 Manager 时被引用一次并被 Manager “内化”，之后运行时代理只面对 Manager / Instrument / Session，看不到 Connector ID。
  * 代理手里只有 3 个 ID。Manager ARN / Instrument ID / Session ID，对应”哪条业务线 / 哪张钱包 / 本次能花多少”。
  * 私钥始终在 CDP MPC 侧。AgentCore Payments 持有的是调用 CDP 签名的授权凭证，不是私钥本身。
  * Seller 侧的 AgentCore Gateway 在 Lambda@Edge 之前，负责把卖方的 OpenAPI 变成 MCP 工具目录供代理发现；真正的 x402 协商和链上结算仍在 Amazon CloudFront + Lambda@Edge + Facilitator 这条路径上。



### 5.3 付款方与卖方执行时序

下面分别从付款方和卖方两个视角呈现一次完整请求的执行时序。付款方视角看代理如何在 Amazon Bedrock AgentCore Payments 内部完成签名；卖方视角看 AWS Lambda@Edge 与 Facilitator 如何完成验签和链上结算。

**5.3.1 付款方执行时序**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/01/ai-agent-based-on-amazon-bedrock-agentcore-x402-agentic-payment-solution-4.png>) [图4 付款方执行时序图]  
---  
  
**5.3.2 卖方执行时序**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/01/ai-agent-based-on-amazon-bedrock-agentcore-x402-agentic-payment-solution-5.png>) [图5 卖方执行时序图：从 x402 应答到链上结算]  
---  
  
卖方时序图：

  1. 用户触发请求。用户在 Web UI 选内容、点 Request，前端把意图（内容 ID、用户标识）经 Amazon API Gateway 送到一个 AWS Lambda Proxy 函数。
  2. 代理接管。AWS Lambda Proxy 函数把请求转给 Amazon Bedrock AgentCore Runtime 里的代理容器，代理基于 Strands Agents SDK 运行，模型选用 Amazon Bedrock 上的 Claude Sonnet。此时代理只持有 3 个 ID：Payment Manager ARN、Payment Instrument ID、Payment Session ID。
  3. 查目录与参考价。代理访问卖方侧 Amazon Bedrock AgentCore Gateway 的 /mcp/tools 端点，拿到可用资源清单，每条包含 requires_payment、category、参考价格等元数据。代理结合本次 Payment Session 预算选定要购买的资源。
  4. 尝试获取内容。代理向 Amazon CloudFront 发起 GET 请求。AWS Lambda@Edge 检测到请求没有支付签名，按 x402 协议返回 402 Http head，响应头里放 base64 编码的 PaymentRequired 对象（其中包括本次交易的金额、收款地址、目标链、USDC 合约地址、有效期）。
  5. 代理转交支付。代理从响应头中取出 payload，原样交给 Amazon Bedrock AgentCore Payments 的 ProcessPayment API，传入 Payment Manager ARN、Payment Session ID、Payment Instrument ID 和 x402 payload。代理本身不解析 payload、不构造签名。
  6. Payment Session 校验。Amazon Bedrock AgentCore Payments 服务端先校验 Payment Session：是否未过期、是否未超额、是否归属于本代理。任一校验失败直接拒付，不进入签名环节。
  7. 取钱包凭证。为了确保代理进程内不出现任何凭证，签名前需要从 Amazon Bedrock AgentCore Identity 取得一次性的凭证令牌。Payment Session 校验通过后，Amazon Bedrock AgentCore Payments 通过 Payment Connector 调用 Amazon Bedrock AgentCore Identity 的 GetResourcePaymentToken，从 Payment Credential Provider（底层是 AWS Secrets Manager）取出对接 CDP 的凭证令牌。整个过程代理进程内没有任何凭证流转。
  8. 钱包签名。Amazon Bedrock AgentCore Payments 携凭证令牌调用 CDP，让 MPC 钱包对 EIP-3009 TransferWithAuthorization 做 EIP-712 离线签名。而私钥始终留在 CDP MPC 侧。签名完成后返回 PROOF_GENERATED 状态和签名证明；若扣款已发但签名失败，则自动回滚。
  9. 代理带签名重试。代理把签名证明放进 X-PAYMENT（x402 v2）或 PAYMENT-SIGNATURE（v1）头，重新请求同一个 URL。
  10. 边缘验签与链上结算。AWS Lambda@Edge 校验 payload 与 authorization 参数，调 x402 Facilitator 的 /verify 做签名校验，再调 /settle 在 测试链Base Sepolia 上提交 transferWithAuthorization 交易。
  11. 内容交付。结算成功后放行到 Amazon S3 origin 取内容，Amazon CloudFront 返回 http head 200 + 内容 + X-PAYMENT-RESPONSE 头（带链上交易哈希）。代理把内容交给 Web UI，UI 展示内容并给出区块浏览器链接；Payments Audit Log 同时落下本次支付决策的完整记录。



整个端到端的耗时通常在数秒量级，其中最主要的影响来自区块链网络（例如 Base Sepolia）的节点响应和出块时间，其次才是跨地域调用以及 AWS Lambda@Edge 冷启动带来的延迟。注意在生产环境里，需要针对 RPC 的重试机制提前设计。

### 5.4 钱包、预算、身份、审计——分别落在哪一步

前面提到代理支付要解决的四类生产问题——钱包、预算、身份、审计——在这条链路里并不是集中在某一个组件里解决的，而是分散落在不同的步骤上。顺着上面 11 步回溯，每一类都能对上：

权限最小化体现在第 2 步和第 5 步。代理在第 2 步接管请求时只持有 3 个 ID 和一个运行时角色（ProcessPaymentRole），到了第 5 步调用 ProcessPayment 时也只能传这 3 个 ID，并没有创建 Payment Session、修改预算或者更换钱包的权限。即便代理被提示词攻击或者逻辑被绕过，能造成的最大损失也只是当前这个 Payment Session 的 maxSpendAmount。

预算的硬约束体现在第 6 步。对 maxSpendAmount 的检查是在 Amazon Bedrock AgentCore Payments 服务端的 Payment Session 校验里完成的，并不在代理代码里执行。无论是 prompt injection、工具调用死循环还是恶意 prompt，都影响不了这一步的判断。这和那种“写在 system prompt 里的软约束”有本质上的区别。

钱包托管体现在第 7、8 步。凭证令牌从 Amazon Bedrock AgentCore Identity 里取出之后，只在 Amazon Bedrock AgentCore Payments 服务端的生命周期里被使用，私钥则始终留在 CDP MPC 那一侧。代理进程从头到尾既看不到私钥，也看不到对接 CDP 用的凭证。

审计证据则分散在第 8 步和第 11 步。支付决策本身——谁付的、用哪张钱包、哪个 Payment Session、什么金额、签名内容——在第 8 步会落入 Payments Audit Log；链上交易哈希在第 11 步作为最终结算证据被返回，并永久沉淀到链上。代理这一侧的工具调用则由 [Amazon CloudWatch](<https://aws.amazon.com/cn/cloudwatch/>) 记录。三处合在一起，才构成一条完整的证据链，不需要事后再从分散的日志里去拼。

## **六、关于换链、换协议的扩展性**

还有两个扩展问题：这套方案是不是只能跑在 Base Sepolia 上？x402 之外的支付方式能不能接进来？对象模型和协议抽象其实给这两个都留了空间，但各自的约束并不一样。

### 6.1 链：协议本身链无关，当前仅在测试网 Base Sepolia 进行功能演示

x402 在协议层用 CAIP-2（Chain Agnostic Improvement Proposal）来表达网络标识，eip155: 前缀覆盖所有 EVM 链，命名空间本身也支持 Solana、Cosmos、Bitcoin 等。当前的参考实现之所以钉在 Base Sepolia，主要是三处硬编码——卖方侧的 Facilitator URL、USDC 合约地址，以及付款方侧 Payment Instrument 绑定的网络。把这三处抽成多链配置就可以切到其它链。真正的约束其实在另外两点：

  * Facilitator 可用性。每条链需要一个能做离线签名校验加上链结算的 Facilitator。x402 公共 Facilitator 目前主推 Base 生态，其它链或者等官方扩充，或者自建（x402 规范开源）。
  * EIP-3009 支持度。x402 当前的 exact scheme 依赖代币实现 EIP-3009 transferWithAuthorization。USDC 在主流链上原生支持 EIP-3009，但 DAI、WETH 等不一定。如果目标资产不支持，要等 x402 规范补新 scheme，或选择其它稳定币。未来随着 ERC-4337 的普及，x402 的 Facilitator 在理念上可与 Paymaster / Bundler 结合，由基础设施代付 Gas 并执行任意资产逻辑，这将进一步拓宽代理支付的资产边界。



总结，Amazon Bedrock AgentCore Payments 作为托管服务，在 Preview 阶段会逐步扩展支持的链和 Payment Connector，上面这两件事最终都由托管服务来兜底，不需要使用方自己去为每条链单独配置一遍。

### 6.2 协议：x402 是第一个实现，不是唯一选择

参考实现里把代理侧的工具分成了两层：核心支付能力内置在代理代码里——识别 x402、调用 ProcessPayment、带签名重试，而服务目录则通过 MCP 在运行时动态发现。这种分层带来的好处是：换协议时不用重写代理的业务逻辑，只要改动两点——一是在 MCP 目录里给每条工具加一个 payment.protocol 字段，声明这个资源走的是哪种支付协议（x402、Stripe、SEPA、L402，或者未来的 x402-v3）；二是把代理侧的核心工具从“只认 x402”改成“根据 protocol 字段分发到对应的 handler”，每种协议各写一个 handler 模块就行。这样一来，卖方就可以按内容类型自由选择协议——比如高频 API 走 x402、订阅制内容走 Stripe、跨境转账走 SEPA——代理则按目录里的声明自动路由，业务代码里不需要把任何具体协议硬编码进去。x402 只是这套架构里第一个落地的实现，并不是架构本身的限制。

## **七、方案部署前要准备什么**

**注意：**

在部署之前，有一条安全提示需要提前声明：默认部署的 Web UI（基于 Amazon CloudFront 加 Amazon API Gateway）并没有内置任何身份认证，也就是说，任何拿到 URL 的人都可以触发代理调用，并实实在在消耗钱包里的资金。在 Base Sepolia 测试网上做 demo 当然没问题，但只要切换到主网，或者绑定上真实的资金，就必须先加上身份认证——比如接入 Amazon Cognito、用 API Key，或者打开 Amazon API Gateway 的 IAM 授权——同时把 URL 当作敏感信息来管理。

另外还需要先确认下面几类准备工作都已经就位。

钱包与链上资产：

  * Coinbase Developer Platform（CDP）账户与 API Key，用作 MPC 钱包后端；如果走 Stripe Privy 路线则准备 Privy 应用凭证。
  * 目标链上的测试或生产 USDC 余额。在 Base Sepolia 上做 demo 的话，通过 Coinbase / Circle 水龙头领取即可；切到主网前需要评估充值、对账、风控流程。



组织内部角色与流程：

  * 财务或业务方：谁来定义 Payment Manager、Payment Instrument、Payment Session 这三层的预算策略。
  * 运维或安全团队：谁来持有 ManagementRole，谁负责 Payment Credential Provider 的凭证轮换。
  * 合规或审计团队：谁来定义审计日志的保留策略、对账频率、异常检测指标。



成本与配额提示。这套方案在 Preview 阶段的成本与配额，具体数字以 AWS 官方定价页面与配额页面为准，部署前建议复核：

  * Amazon Bedrock AgentCore Payments：Preview 期间按 ProcessPayment 调用次数与维护中的 Payment Manager / Payment Instrument / Payment Session 资源计费，托管钱包签名调用是该服务的主要成本项。
  * Amazon Bedrock AgentCore Runtime / Amazon Bedrock AgentCore Gateway / Amazon Bedrock AgentCore Identity：分别按代理容器运行时长、Gateway 请求数与 Identity 调用数计费。
  * Amazon CloudFront 加 AWS Lambda@Edge：按 Amazon CloudFront 请求与 AWS Lambda@Edge 调用次数乘以执行时长计费。
  * Amazon Bedrock 推理：按 token 计费，是单次请求里最大的可变成本，可通过 prompt 设计与缓存控制。
  * 链上费用：USDC 单笔金额（卖方收入）加 Base L2 Gas 费，与 AWS 计费分离。
  * 配额：每个 AWS 账号的 Payment Manager / Payment Instrument / Payment Session 数量在 Preview 阶段有限制；ProcessPayment 调用 QPS 也有上限。如需大规模放量，提前与 AWS 客户经理沟通申请配额上调。



## **八、方案截图**

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/01/ai-agent-based-on-amazon-bedrock-agentcore-x402-agentic-payment-solution-6.png>) [图6 方案介绍页]  
---  
  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/01/ai-agent-based-on-amazon-bedrock-agentcore-x402-agentic-payment-solution-7.png>) [图7 Payer 方演示页面]  
---  
  
解释：

1\. 首先buyer从中间的Catalog选择item（以Research report，定价0.005 USDC）

2.点击“Start payment flow”。右侧会展示每个步骤的详细信息。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/06/01/ai-agent-based-on-amazon-bedrock-agentcore-x402-agentic-payment-solution-8.png>) [图8 Seller 方演示页面]  
---  
  
解释：

  1. 可以看到最后一笔收款记录 在Block=42136698上From xxdaa3地址。
  2. 余额为21.027 usdc（增加了0.005）



## **九、小结**

文章开头覆盖代理支付的四项要求：金额要小、一次交互内完成、钱包可管、决策可追溯。这套方案在每一层给出的回答：x402 把支付变成 HTTP 请求的一部分，USDC 在 L2 上的单笔结算成本可以压到亚美分量级，让传统卡组织吃不下的微支付区间真正成立。

Amazon Bedrock AgentCore Payments 把钱包托管、预算硬约束、代理身份、审计闭环这几件事打包成 5 个对象，代理在运行时只接触 Payment Manager、Payment Instrument、Payment Session 这 3 个，并在 IAM 层面做职责分离，由服务端强制 maxSpendAmount，让风险有了一条可量化的上限；Amazon CloudFront 加 AWS Lambda@Edge 加 Amazon S3 加 Amazon Bedrock AgentCore Gateway 的卖方组合，几乎不需要维护就能挂目录、收 USDC 微支付。

对正在投入代理支付项目的团队，支付能力其实就是把代理从“能分析、能建议”推进到“能自主完成任务”的那一步。工程上能做到“代理在授权范围内自行付费、每一笔都有据可查”，原本要数月才能搭起来的支付底座可以被压缩到几天，让团队把更多精力放回业务逻辑本身。

随后建议跟进的方向：支持更多的链和非加密支付通路（例如 Stripe Privy 的 Payment Connector）、更细粒度的治理（动态预算、异常检测），以及代理与代理之间的支付协作（A2A 配合 x402）。

### 9.1 参考资源

  * [Amazon Bedrock AgentCore](<https://aws.amazon.com/bedrock/agentcore/>)
  * [Amazon Bedrock AgentCore Payments 官方文档](<https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/payments.html>)
  * [x402 协议规范](<https://www.x402.org/>)
  * [CAIP-2 Chain Agnostic Improvement Proposal](<https://chainagnostic.org/CAIPs/caip-2>)
  * [EIP-3009 Transfer With Authorization](<https://eips.ethereum.org/EIPS/eip-3009>)



## **十、结语**

**  
下一步行动：**

**相关产品：**

  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=1>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon Bedrock AgentCore](<https://aws.amazon.com/cn/bedrock/agentcore/?p=bl_pr_bedrock-agentcore_l=2>) — 加快代理投入生产的速度
  * [AWS Lambda](<https://aws.amazon.com/cn/lambda/?p=bl_pr_lambda_l=3>) — 无需服务器即可运行代码
  * [Amazon CloudFront](<https://aws.amazon.com/cn/cloudfront/?p=bl_pr_cloudfront_l=4>) — 全球内容分发网络
  * [Amazon S3](<https://aws.amazon.com/cn/s3/?p=bl_pr_s3_l=5>) — 适用于 AI、分析和存档的几乎无限的安全对象存储



**相关文章：**

  * [对抗 Agent 遗忘：Kollab 基于Amazon Bedrock AgentCore 的团队AI工作空间实践](<https://aws.amazon.com/cn/blogs/china/on-amazon-bedrock-agentcore-ai-practice/?p=bl_ar_l=1>)
  * [基于Amazon Quick与Amazon Bedrock AgentCore打造对话式 FinOps助手](<https://aws.amazon.com/cn/blogs/china/based-on-amazon-quick-amazon-bedrock-agentcore/?p=bl_ar_l=2>)
  * [用 Amazon Bedrock AgentCore Payment 构建自主支付 AI Agent: x402 协议实战](<https://aws.amazon.com/cn/blogs/china/amazon-bedrock-agentcore-payment-build-payment-ai/?p=bl_ar_l=3>)
  * [Zenjoy 基于 Amazon Bedrock 和 EKS 构建 AIOps Agent：打通 Prometheus、ES 与夜莺的智能化告警实战](<https://aws.amazon.com/cn/blogs/china/zenjoy-based-on-strands-amazon-bedrock-agentcore-build-eks/?p=bl_ar_l=4>)
  * [自己的工具自己控：MCP Server、Amazon Bedrock AgentCore、Quick Suite集成指南](<https://aws.amazon.com/cn/blogs/china/tool-mcp-server-amazon-bedrock-agentcore-quick/?p=bl_ar_l=5>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 刘春华

亚马逊云科技金融行业资深解决方案架构师。在资本市场、支付以及 Web3 领域拥有丰富的从业经验。目前主要负责金融行业解决方案的架构设计与创新。致力于 Agentic AI 与大语言模型在智能投研、量化交易等场景的落地，深耕分布式量化回测及高频交易架构的探索与实践，并结合 Web3（如稳定币支付、RWA 资产代币化）的创新能力，赋能金融机构实现技术突围与业务合规转型。

### 李祎

李祎，亚马逊云科技行业解决方案架构师，专注于 AI/ML 与金融科技领域。曾就职于雪球等公司，担任NLP 团队负责人，主导过推荐、搜索、风控等多个核心业务场景，并构建了金融预训练模型与金融知识图谱等基础能力，在自然语言处理领域积累了丰富的实战经验。目前主要负责 Agentic AI与大语言模型在金融行业的落地实践，覆盖智能投顾、KYC 客户尽调、智能理赔、量化投资等业务场景，并致力于结合亚马逊云科技的云服务能力，帮助金融客户实现技术创新与业务转型。

### 黄曦

亚马逊云科技金融行业解决方案架构师， 企业级敏捷教练，专注于为量化基金、券商等资本市场客户提供云原生架构设计与数字化转型方案，在高性能交易系统、量化策略回测平台、实时行情处理及低延迟架构等领域拥有深入的技术积累。

### 郑明明

亚马逊云科技解决方案架构师，服务于国内及全球多家头部金融机构，在 IT 与云计算领域有丰富的项目经验，对量化金融机构使用云计算有较为深入的探索和实践。

## 亚马逊云科技中国峰会

开发者挑战赛现场开启，基于真实业务场景亲手构建 Agent。 [](<https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p2&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d>) |   
---|---
