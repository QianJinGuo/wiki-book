---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/ai-efficiency-boost-practice-amazon-quick-tool-build-ai
ingested: 2026-07-10
feed_name: AWS China Blog
source_published: 2026-07-10
sha256: 2b50d1daee3c20ec1a76fd2c14c7a729693304c3c5780bd223ed551c3830de94
---

# 项目经理的 AI 提效实践——Amazon Quick × 飞书：打通碎片化工具链，构建 AI 整合入口

摘要：本文记录了一名技术项目经理将飞书接入 Amazon Quick 的完整实践过程。Amazon Quick 通过 MCP 协议支持自定义工具接入，飞书官方发布了对应的 MCP Server（@larksuiteoapi/lark-mcp）。本文对比了三种接入方案，详细介绍了个人用户快捷有效方案（本地 OpenAPI MCP）的原理、配置步骤与常见问题，并分享了飞书 × Outlook 双端会议、群消息生成进度报告、飞书今日速览三个已验证的实战场景。

**目录**

01 背景：项目经理的工具碎片化困境

02 我研究了哪些方案

03 本地 OpenAPI MCP 原理

04 前置准备

05 配置步骤

06 连通测试

07 进阶：通过 Kiro 扩展飞书能力

08 这是我现在每天在用的几个场景

09 遇到问题与解决方案

10 总结

11 参考资料

* * *

## **1\. 背景：项目经理的工具碎片化困境**

我是一名技术项目经理，日常工作的样子大概是这样的：

早上打开电脑，先查飞书日历看今天有几个会，然后切到 Outlook 给外部客户确认会议邀请，再回到飞书群看有没有新的项目消息，最后打开多维表格更新进度。这一套流程，光是”在几个系统之间切来切去”就消耗了不少精力。

[Amazon Quick](<https://aws.amazon.com/cn/quick/>) 是 AWS 推出的面向工作的 AI 助手。它通过原生连接器（内置 40+ 主流应用，涵盖 Slack、Teams、Outlook、Gmail 等）和 MCP 扩展（支持自定义接入任意服务）连接外部工具，代表你执行操作——把”给建议”变成”真的把活干了”。

接上 Outlook、Teams 之后，我可以直接告诉 Quick：”帮我发封邮件给 XX，把昨天会议的结论告诉他。” 然后 Quick 就去做了。

飞书是我工作的核心，自然也想把它接进来。但飞书目前不在 Quick 官方连接器清单里。

好在飞书官方发布了 MCP Server（`@larksuiteoapi/lark-mcp`），通过 MCP 即可将其接入 Quick。本文记录的就是我研究这件事的过程——踩了哪些坑、选了哪个方案、怎么一步一步配的。

## **2\. 我研究了哪些方案**

在开始制定方案之前，我先查了[飞书官方提供的 Agent 集成能力概述](<https://open.feishu.cn/document/mcp_open_tools/overview-of-lark-agent-integration-capabilities>)，发现飞书提供了几种不同的接入路径，适合不同场景（涉及的 MCP、本地 OpenAPI MCP、飞书 CLI 等概念，详见第 3 节）：

方案 | 适用场景 | 部署维护 | 能力覆盖  
---|---|---|---  
方案一：本地 OpenAPI MCP`@larksuiteoapi/lark-mcp` | 个人使用 |  最简单：飞书侧创建应用并配置权限，Quick 侧简单填写参数 | 日历、文档、多维表格、Bot 消息发送，约 21 个工具；搭配 Kiro 可扩展至 lark-cli 全量能力  
方案二：lark-cli + AgentCore 托管[lark-mcp-on-agentcore](<https://github.com/ddpie/lark-mcp-on-agentcore>) | 团队共用 |  较复杂，需 AWS 账号和基础设施部署 | 200+ 工具，23 个 Skill，覆盖最全（含妙记、邮件完整 CRUD 等）；每人以自己飞书身份操作  
方案三：lark-cli 自建 MCP Wrapper | 个人使用 |  中等，需编写 Node.js Wrapper + 维护 lark-cli token | 7 个 IM 工具（发消息、查消息、回复、搜索等），以用户身份操作；扩展需自行修改代码  
  
我的诉求很简单：

  * 个人日常使用：不需要团队级部署，自己配好自己用
  * 快速上手：配置步骤简单，不需要写代码或维护服务
  * 覆盖核心场景：日历、文档、多维表格、消息发送满足 80% 的日常需求
  * 无需额外基础设施：不依赖云服务或外部服务器，本地运行即可



方案二需要 AWS 账号和部署基础设施，不适合个人使用。方案三需要自己写代码，维护成本不低。方案一是我的选择，够用且零维护。

方案一能力补充：当遇到本地 OpenAPI MCP 不支持的功能（如读取群消息历史、@我 的消息、妙记等），若本地已安装 Kiro 并配置了 lark-cli，可通过 Quick ACP → Kiro 按需扩展，无需额外部署。详见第 7 节「进阶：通过 Kiro 扩展飞书能力」。

## **3\. 本地 OpenAPI MCP 原理**

配置之前，有几个概念值得先搞清楚，能省去很多排查时间。

### 3.1 它是什么，怎么运行

`@larksuiteoapi/lark-mcp` 是飞书官方发布的 MCP Server，将飞书数百个 OpenAPI 接口用 MCP 协议封装好，打包发布到 npm。通过一行 `npx` 命令即可在本地启动，Amazon Quick 通过 MCP 协议与之通信，再由它调用飞书 OpenAPI 完成实际操作：
    
    
    Amazon Quick
        ↓ MCP 协议
    本地 OpenAPI MCP（飞书官方 MCP Server）
        ↓ HTTPS REST
    飞书 OpenAPI（Calendar API、IM API 等）
    ​
    

分层 | 需要做什么 | 详见  
---|---|---  
Amazon Quick | MCP 设置页添加配置，通过 `-t` 参数指定工具集 | 第 5 节·配置步骤  
本地 OpenAPI MCP | 确保本地安装 Node.js，MCP 通过 `npx` 自动运行 | 第 4 节·前置准备  
飞书 OpenAPI | 创建自建应用、开通权限、配置 OAuth 重定向 URL | 第 4 节·前置准备  
  
### 3.2 两种身份：应用身份 vs 用户身份

这是我踩得最狠的一个坑。配完之后发现读不到自己的日历，折腾了半天才搞清楚——原来是身份问题。

| 应用身份（tenant_access_token） | 用户身份（user_access_token）  
---|---|---  
凭证 | App ID + App Secret | OAuth 登录获取的用户令牌  
代表谁 | 你创建的飞书自建应用 | 你本人的飞书账号  
能访问什么 | 应用被显式邀请/授权的内容 | 你个人账号能看到的一切（私信、个人日历、私有文档等）  
类比 | 公司工牌 | 本人人脸识别  
  
两者缺一不可：飞书先验证应用有没有权限，再验证用户是否授权。

关于 `--token-mode`：lark-mcp 默认的 token-mode 是 `auto`，AI 推理时可能选用应用身份，导致读不到你的个人私信、个人日历等私有数据。要访问个人数据，必须显式设置 `--token-mode user_access_token`（详见配置步骤）。

### 3.3 飞书 MCP 工具集调用

Quick 在调用本地 OpenAPI MCP 时，需要在 Arguments 中明确指定加载哪些工具集，飞书 MCP Server 才会将对应工具暴露给 AI。lark-mcp 通过 Preset 机制管理工具分组，不同场景按需选择。

不加 `-t` 参数时，自动加载 `preset.default`（19 个工具，涵盖消息、文档、多维表格、Wiki 等）。如需日历、任务等额外能力，通过 `-t` 参数按需叠加。

官方共 8 个 Preset（来源：[官方 GitHub](<https://github.com/larksuite/lark-openapi-mcp/blob/main/docs/reference/tool-presets/presets-zh.md>)）：

Preset | 说明  
---|---  
`preset.default` | 默认，消息、文档、多维表格、Wiki、联系人等 19 个工具  
`preset.light` | 最小化轻量集成：搜索群/文档/多维表格、发消息、读文档  
`preset.im.default` | 即时消息：创建群、获取群成员、发/读消息  
`preset.base.default` | 多维表格基础操作：创建、字段查询、记录增删改查  
`preset.base.batch` | 多维表格批量操作：批量创建/更新记录  
`preset.doc.default` | 文档：读取、导入、搜索、知识库节点  
`preset.task.default` | 任务管理：创建/修改任务、添加成员和提醒  
`preset.calendar.default` | 飞书日历：创建/修改/获取日程、查询忙闲  
  
视频会议链接不需要单独工具，在创建日历事件时加 `"vchat": {"vc_type": "vc"}` 字段，飞书会自动生成会议链接。

关键陷阱：加了 -t 之后，preset.default 不再自动加载，必须显式列出

配置方式 | 实际加载的工具  
---|---  
不加 `-t` | `preset.default`（19 个工具）  
`-t preset.calendar.default` | 只有日历工具，默认 19 个丢失   
`-t preset.default,preset.calendar.default` | 默认 19 个 + 日历   
  
## **4\. 前置准备**

### 4.1 创建飞书应用

  1. 打开[飞书开放平台](<https://open.feishu.cn/>) → 开发者后台 → 创建应用
  2. 选择「自建应用」，记录 App ID 和 App Secret
  3. 在「权限管理」中开通所需权限（见下方权限清单）



### 4.2 配置重定向 URL

1\. 飞书开放平台 → 你的应用 → 安全设置

2\. 在「重定向 URL」中添加：http://localhost:3000/callback

3\. 保存

跳过这步，后续 OAuth 授权会报错 “重定向 URL 有误（错误码 20029）”。

### 4.3 开通权限

根据你需要的功能开通对应权限：

功能 | 权限 | 用途  
---|---|---  
发消息 | `contact:user.id:readonly` | 通过邮箱查询用户 open_id  
发消息 | `im:message:send_as_bot` | 以机器人身份发送消息  
日历 | `calendar:calendar` | 读写飞书日历  
视频会议 | `vc:meeting` | 创建/管理视频会议  
云文档 | `docx:document:readonly` | 读取文档内容  
知识库 | `wiki:wiki:readonly` | 读取 Wiki 节点  
多维表格 | `bitable:app` | 读写多维表格  
  
权限改动后需要在开放平台重新发布应用版本才会生效。

### 4.4 安装 Node.js

lark-mcp 通过 `npx` 运行，需要本地有 Node.js 环境。建议从 [Node.js 官网](<https://nodejs.org/>)安装 LTS 版本，安装后用 `node -v` 和 `npm -v` 验证。

无需手动安装 lark-mcp：在 Quick 中配置完成后，首次运行时 `npx -y` 命令会自动从 npm 下载并执行 `@larksuiteoapi/lark-mcp` 包，无需提前 `git clone` 或 `npm install`。

## **5\. 配置步骤**

### 5.1 在 Quick 中添加飞书 MCP

打开 Settings → Capabilities → MCP → + Add MCP，填写以下内容：

  * Name：Feishu（或飞书）
  * Command：`npx`
  * Arguments：`-y @larksuiteoapi/lark-mcp mcp -a <AppID> -s <AppSecret>`



将 `<AppID>` 和 `<AppSecret>` 替换为你在飞书开放平台创建的应用凭证。

保存后，Quick 会加载默认 19 个工具（消息、云文档、多维表格等）。

### 5.2 按需启用工具集（可选）

默认工具集不含日历。如需启用，在 Arguments 的 `-a <AppID> -s <AppSecret>` 后追加 `-t` 参数。

注意：加了 -t 之后，preset.default 不再自动加载，必须显式列出

以下内容填入 Quick MCP 配置界面的 Arguments 字段（不是终端命令）：
    
    
    -y @larksuiteoapi/lark-mcp mcp -a <AppID> -s <AppSecret> -t preset.default,preset.calendar.default
    ​
    

常用 Preset：

Preset | 包含功能  
---|---  
`preset.default` | 消息、云文档、多维表格、Wiki（默认 19 个工具）  
`preset.calendar.default` | 飞书日历（创建/查看/修改日程、查询忙闲）  
`preset.im.default` | 消息/群组  
`preset.doc.default` | 云文档（读取/导入/搜索/知识库）  
`preset.base.default` | 多维表格基础操作  
`preset.base.batch` | 多维表格批量操作  
  
视频会议无需单独 Preset，创建日历事件时加 `"vchat": {"vc_type": "vc"}` 字段即可自动生成飞书 VC 链接。

### 5.3 启用用户身份

默认只用应用身份，无法访问你的个人日历、私信等私有数据。要访问个人数据，需要两步：

① 在 Quick MCP 配置界面的 Arguments 字段末尾加上 `--oauth --token-mode user_access_token`：
    
    
    -y @larksuiteoapi/lark-mcp mcp -a <AppID> -s <AppSecret> -t preset.default,preset.calendar.default --oauth --token-mode user_access_token
    

② 在终端执行一次 OAuth 授权（每台设备只需做一次，后续自动刷新，无需反复登录）：
    
    
    npx -y @larksuiteoapi/lark-mcp login -a <AppID> -s <AppSecret>
    

浏览器会弹出飞书授权页 → 点「同意授权」→ 完成。

原理详见第 3 节「两种身份」。

### 5.4 重启 Quick

Cmd+Q 完全退出 Quick → 重新打开，等待工具加载完成。

国际版 Lark 用户需额外在 Arguments 中加 `--domain https://open.larksuite.com`，且应用须在国际版开放平台创建（国内版与国际版应用不互通）。

## **6\. 连通测试**

在 Quick 对话框里测试：
    
    
    查看我的飞书日历，今天有什么日程？​

或：
    
    
    帮我在飞书日历里创建一个明天下午 3 点的测试会议

验证用户身份是否生效：让 Quick 读取飞书主日历，若返回的 `summary` 显示你的飞书名字，说明 user_access_token 已正确启用。

## **7\. 进阶：通过 Kiro 扩展飞书能力**

用了一段时间之后，我发现方案一覆盖不到所有场景——比如我想读取飞书群里最近的消息，或者让 Quick 帮我扫描 @我 的内容，这些 MCP 暂时不支持。

于是我研究了另一条路：通过 Quick ACP 调度本地 Kiro 来补充这些能力。

Quick ACP（Agent Communication Protocol）目前支持接入 Kiro、Claude Code、Codex、Copilot、Gemini、Cursor 等主流编码 Agent，均有内置预设，可在 Settings → Capabilities → MCP → ACP Agents 中一键添加。

我目前使用 Kiro 进行功能扩展，以下配置步骤以 Kiro 为例。

### 7.1 安装 Kiro CLI
    
    
    # 安装 Kiro CLI
    curl -fsSL https://cli.kiro.dev/install | bash
    ​
    # 添加到 PATH（安装完成后按提示执行）
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.zshrc
    source ~/.zshrc
    ​
    # 验证
    kiro-cli
    ​
    

### 7.2 在 Kiro 中配置 lark-cli

打开 Kiro，在对话框中输入：
    
    
    帮我安装飞书 CLI：https://open.feishu.cn/document/no_class/mcp-archive/feishu-cli-installation-guide.md
    

Kiro 会自动完成 lark-cli 的安装和飞书 OAuth 授权。

### 7.3 将 Kiro 接入 Quick

在 Quick 中：Settings → Capabilities → MCP → 点击「+ Add Coding Agent」→ 选择 Kiro。

**注意：**

如果 Kiro 显示灰色”Not installed”，需先完成 7.1 的 PATH 配置并重启 Quick。

### 7.4 使用

配置完成后，在 Quick 中直接用自然语言描述需求，Quick 会自动调度 Kiro 完成飞书操作：

「读取飞书群『XXX』最近 50 条消息，帮我整理成工作周报」

## **8\. 这是我现在每天在用的几个场景**

配完之后，我把它用到了下面几件事上，都已经验证可用。

### 8.1 场景一：飞书 × Outlook 双端会议，一次搞定

以前的痛点：内部用飞书日历，外部合作方用 Outlook。每次开会，要在飞书建日程、生成 VC 链接，再去 Outlook 发邀请，还要把链接手动粘贴进去——来回切三次。

现在的做法：一句话告诉 Quick：

「帮我在飞书创建明天下午 3点的产品评审会，生成 VC 链接，同时发 Outlook 邀请给 test01@amazon.com，把飞书会议链接放在邀请说明里」

Quick 会自动顺序完成：

  1. 在飞书日历创建带 VC 链接的日程（`vchat: {vc_type: "vc"}`）
  2. 创建 Outlook 日历邀请，将飞书 VC 链接附在会议说明里
  3. 邀请发送给指定参会者



外部参会者收到 Outlook 邀请，点击会议说明里的飞书链接直接入会。两个系统，一句话搞定。

### 8.2 场景二：从飞书群消息生成项目进度报告

以前的痛点：项目组日常在飞书群进行沟通，进展就散落在飞书群聊中，每次需要手动翻记录、整理汇报材料。

现在的做法：通过 Quick ACP 调度本地 Kiro（需已安装 lark-cli，详见上节「进阶：通过 Kiro 扩展飞书能力」），告诉 Quick：

「读取飞书群『XXX 项目』2026年6月1日至6月7日的消息，整理成项目进度报告，包含主要讨论话题、关键决策和待办事项」

Quick 调度 Kiro，由 Kiro 使用 lark-cli 读取群消息，返回原始数据，Quick 再整理成结构化报告。

自动生成包含时间线、决策记录、待办事项的进度报告，无需手动翻群记录。

### 8.3 场景三：飞书今日速览

以前的痛点：每天开始工作时需要分别打开飞书查日历、看消息、找 @我 的内容，耗时且容易遗漏。

现在的做法：告诉 Quick：

「帮我生成今天的飞书速览，包括今日日程、最近群消息和 @我 的消息」

Quick 通过 Kiro + lark-cli 一次性扫描：

  * 今日飞书日历日程
  * 最近 5 个活跃群各取最新 5 条消息
  * 最近 @我 的消息（`lark-cli im +messages-search --is-at-me`）
  * 书签/收藏列表



30 秒内生成飞书工作日报，无需打开飞书客户端。

## **9\. 遇到问题与解决方案**

### 9.1 界面崩溃（React Error #31，白屏）

触发场景：使用飞书日历工具时，Quick 弹出工具审批确认卡片，界面崩溃白屏。

错误信息：
    
    
    Minified React error #31: Objects are not valid as a React child
    args[]=object with keys {calendar_id}
    ​
    

根本原因：Quick Desktop 的 `ToolApprovalCard` 组件渲染工具参数时，未对嵌套对象（如 `{ calendar_id: "..." }`）做序列化处理，直接渲染到 `<span>` 导致 React 崩溃。

解决方法：将飞书工具的审批方式从「Ask each time」改为自动允许：

  1. 打开 Settings → Capabilities → MCP → Feishu → Manage Permissions
  2. 找到所有飞书日历工具（CalendarEvent Create/Get/Patch、Calendar Primary、Freebusy List）
  3. 将每个工具权限从 「Ask each time」 改为 「Allow when…」，输入框填 always（无条件允许，绕过审批卡片）
  4. 5 个工具都设置完毕即可



设置后飞书日历工具正常使用，不再触发崩溃。

### 9.2 OAuth 授权失败（重定向 URL 有误，错误码 20029）

原因：飞书应用未配置 OAuth 回调地址。

解决方法：在飞书开放平台 → 应用 → 安全设置 → 重定向 URL 中添加 `http://localhost:3000/callback`，然后重新运行 `login` 命令。

## **10\. 总结**

本文聚焦一个具体场景：技术项目经理在飞书与 Outlook、Teams 等工具并行使用的环境下，如何通过 Amazon Quick 构建统一的 AI 工作入口，消除跨系统切换带来的效率损耗。

飞书不在 Quick 官方连接器清单中，是这一场景的核心挑战。本文的独特之处在于：不止于”把飞书接进来”，而是在系统研究飞书官方接入方案的基础上，选取了对个人用户最可行的路径——本地 OpenAPI MCP，并记录了从配置到实战的完整过程，包括两个高频踩坑点（身份模式设置、Preset 加载陷阱）和一条扩展路径（Quick ACP → Kiro + lark-cli）。

实践结果表明，该方案以较低的配置成本，覆盖了日历、文档、多维表格等日常核心场景，并可与 Outlook 等原生连接器协同，实现跨系统操作（如飞书日历与 Outlook 邀请的同步创建）。飞书 MCP 工具目前仍在持续演进，本文所述配置基于当前版本，建议参阅官方文档获取最新信息。

**下一步行动：**

**相关产品：**

  * [Amazon Quick](<https://aws.amazon.com/cn/quick/?p=bl_pr_quick_l=1>) — 人工智能助手，用于研究、业务洞察、自动化和无代码应用程序构建



**相关文章：**

  * [自己的工具自己控：MCP Server、Amazon Bedrock AgentCore、Quick Suite集成指南](<https://aws.amazon.com/cn/blogs/china/tool-mcp-server-amazon-bedrock-agentcore-quick/?p=bl_ar_l=1>)
  * [三剑合璧Quick Suite + Agent Core + Kiro联动实践：海外物流报价助手实战](<https://aws.amazon.com/cn/blogs/china/quick-suite-agent-core-kiro-logistics-quote-assistant/?p=bl_ar_l=2>)
  * [基于 Amazon Bedrock AgentCore Runtime 部署 Apache Doris MCP Server为 Quick Suite 等 AI 客户端提供原生数据分析能力](<https://aws.amazon.com/cn/blogs/china/runtime-deploy-apache-doris-mcp-server-quick-suite-ai-analytics/?p=bl_ar_l=3>)
  * [从数据库连接到自然语言查询：Amazon QuickSuite 数据分析全流程实践](<https://aws.amazon.com/cn/blogs/china/amazon-quicksuite-data-analysis-end-to-end-practice/?p=bl_ar_l=4>)
  * [基于 Amazon Connect 数据湖与 Quick 构建联络中心智能分析平台](<https://aws.amazon.com/cn/blogs/china/based-on-amazon-connect-data-lake-quick-build-intelligent-analytics-platform/?p=bl_ar_l=5>)



## **11\. 参考资料**

资料 | 链接  
---|---  
飞书 OpenAPI MCP 概述（官方文档） | <https://open.feishu.cn/document/uAjLw4CM/ukTMukTMukTM/mcp_integration/mcp_introduction>  
lark-mcp GitHub 仓库 | <https://github.com/larksuite/lark-openapi-mcp>  
lark-mcp Preset 完整列表 | <https://github.com/larksuite/lark-openapi-mcp/blob/main/docs/reference/tool-presets/presets-zh.md>  
lark-mcp npm 包 | <https://www.npmjs.com/package/@larksuiteoapi/lark-mcp>  
Amazon Quick MCP 集成（官方文档） | <https://docs.aws.amazon.com/quick/latest/userguide/mcp-integration.html>  
飞书开放平台 | [https://open.feishu.cn](<https://open.feishu.cn/>)  
  
*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 倪晓峻

倪晓峻: 亚马逊云科技客户解决方案经理，负责帮助客户加速云计算旅程，参与项目管理、咨询与设计工作，具有超过十五年以上企业客户服务经验。在企业级解决方案，混合云架构，运营集成等领域有着广泛的实践经验。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
