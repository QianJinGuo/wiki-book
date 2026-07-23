# Dify集成Amazon Bedrock AgentCore Browser  实现更强大的信息获取和分析能力 | 亚马逊AWS官方博客

## Ch11.022 Dify集成Amazon Bedrock AgentCore Browser  实现更强大的信息获取和分析能力 | 亚马逊AWS官方博客

> 📊 Level ⭐⭐ | 20.7KB | `entities/amazon-bedrock-agentcore-browser-information-retrieval-and-analysis-capabilities.md`

## 概述
Dify集成Amazon Bedrock AgentCore Browser 实现更强大的信息获取和分析能力 by awschina on 03 12月 2025 in Artificial Intelligence Permalink Share 在AI应用开发领域，Dify作为一个开源的LLM应用开发平台，为开发者提供了快速构建AI应用的能力。然而，当涉及到复杂的网页信息获取和动态内容交互时，传统的工具往往力不从心。Amazon Bedrock AgentCore Browser的出现，为Dify生态带来了全新的突破。本文将深入探讨如何将AgentCore Browser集成到Dify平台，实现更加智能和强大的网页交互能力。 一、Dify现有生态的挑战 在当前的Dify生态中，开发者在处理复杂网页交互时面临着诸多挑战： 动态内容渲染困难： 许多现代网站使用JavaScript动态加载内容，传统的HTTP请求工具无法获取这些动态渲染的信息 复杂交互能力缺失： 需要填写表单、执行JavaScript脚本、处理多步骤操作等场景，现有工具难以胜任 状态管理问题： 在多步骤的workflow中，无法维持持久的浏览器会话状态，导致效率低下 安全性顾虑： 本地运行浏览器可能带来安全风险，且难以实现资源隔离和管理 这些挑战限制了Dify用户在构建需要深度网页交互的AI应用时的能力，急需一个专业、安全、高效的解决方案。 二、Amazon Bedrock AgentCore Browser：专为AI Agent设计的云端浏览器 Amazon Bedrock AgentCore Browser是AWS推出的一项创新服务，它为AI Agent提供了一个安全、托管的云端浏览器环境。与传统的网页抓取工具不同，AgentCore Browser专门针对AI Agent的需求进行了优化。 核心能力 完整的浏览器功能： 基于Chromium内核，完整支持JavaScript渲染、CSS样式处理，能够准确获取动态加载的网页内容 丰富的交互操作： 支持页面导航、内容提取、表单填写、脚本执行、网页搜索等多种操作，满足复杂场景需求 会话持久化： 提供长生命周期的浏览器会话，可以在多个步骤之间保持状态，支持需要登录、多步骤交互的场景 云端托管与安全隔离： 完全托管的云端环境，自动处理资源分配、安全隔离、环境清理，无需担心本地资源占用和安全问题 智能反爬虫处理： 集成Web Bot Auth协议，通过加密身份验证减少CAPTCHA干扰，让AI Agent能够更顺畅地访问网站内容 可观测性支持： 提供实时的浏览器状态查看能力，通过AgentCore Browser Viewer等工具，开发者可以直观地看到浏览器的当前页面和执行状态 三、集成架构：将AgentCore Browser引入Dify生态 为了让Dify用户能够充分利用AgentCore Browser的强大能力，我们设计了一套完整的集成方案，通过Dify插件机制将AgentCore Browser无缝接入到Dify的工作流中。 集成组件 Agent Core Browser Session Manager ： 负责启动和管理远程浏览器会话，创建独立的沙盒环境，确保多个任务之间的隔离性 Agent Core Browser Tool ： 封装了丰富的浏览器操作接口，包括页面导航、内容提取、表单操作、脚本执行等功能，以工具的形式暴露给Dify 集成优势 显式会话管理： 在Dify Workflow中可以显式地启动和关闭浏览器环境，在多步骤执行中长期复用同一会话，避免重复初始化 Agent 节点集成： 可以将Browser Tool集成到Dify的Agent节点中，利用大模型的智能规划能力，自动完成复杂的多步骤浏览器操作 多轮会话支持： 在ChatFlow的多轮对话中，可以保持浏览器会话，支持人工介入进行登录、验证码输入等操作 跨步骤状态保持： 浏览器会话可以跨越Workflow的多个节点，实现复杂的业务流程，如先登录网站、再访问特定页面、最后提取数据。 此外，AgentCore Browser还为需要人类交互的场景提供了交互能力，可以通过访问某个session的实时页面进行交互(如扫码登录等)， 除了通过AWS Console上进行交互以外，本文实践中也构建了一个独立部署的 AgentCore Browser Viewer 项目 。 可以支持直接跳转到一个独立的可视化的浏览器界面，便于调试和验证 四、实际应用场景：GitHub仓库深度分析 让我们通过一个实际案例来展示AgentCore Browser在Dify中的应用价值。在这个场景中，我们构建了一个完整的Workflow，实现对GitHub仓库的自动化信息获取和深度分析。 场景描述 这个Workflow展示了一个完整的信息获取和分析流程： 会话初始化： 通过Browser Session Manager启动远程浏览器环境，创建持久化会话 智能信息获取： 使用Agent节点配合Browser Tool，访问目标GitHub仓库页面，自动提取项目描述、Star数量、Issue状态、贡献者信息等关键数据 深度内容分析： Agent可以自主导航到README、文档等页面，理解项目的技术架构和应用场景 结构化输出： 将获取的信息整理成结构化格式，可以进一步用于生成报告或通过邮件发送 应用场景示例截图： 图：使用 AgentCore Browser 进行 GitHub 仓库分析的 Dify Workflow 分析结构化输出示例： JSON { "static_info":{ "description":"Easy, fast, and cheap LLM serving for everyone", "tags":"llm,serving,inference,pytorch,ai,machine-learning" }, "metric_info":{ "stars":63400, "forks":11400, "open_pr_count":1267, "merged_pr_count":11328, "open_issue_count":1913, "closed_issue_count":10093 }, "pr_list":[ "https://github.com/vllm-project/vllm/pull/28949", "https://github.com/vllm-project/vllm/pull/26985", … ], "crucial_change":{ "README_Change":"", "release_Change":"v0.11.1 released on 2025-11-18T23:03:42Z by khluu. Notes: 'Notes to be filled..'" }, "pr_insight_list":[ { "type":"Chore", "importance":"Minor", "meaning":"抑制vLLM服务器启动时model_hosting_container_standards库产生的冗余INFO级别日志输出，通过将该库的日志级别设置为ERROR来减少控制台噪音，同时保留重要的错误信息。这是一个日志清理改进，提升用户体验但不影响核心功能。" }, { "type":"Refactor", "importance":"Medium", "meaning":"将 torch.cuda.Event 替换为更通用的 torch.Event API，提升硬件兼容性。这是一个重构改进，让 vLLM 能够更好地支持非 CUDA 平台（如 XPU、CPU 等），减少了对特定硬件的依赖。虽然是 API 层面的替换，但对于扩展 vLLM 的硬件支持范围具有重要意义，特别是在多元化硬件加速器的趋势下。代码审查中也指出了 XPU 模块中 monkey-patching 的安全性问题，建议在使用后恢复原始函数以避免副作用。" }, … ] } 技术亮点 动态内容完整获取： GitHub页面的许多元素是通过JavaScript动态加载的，AgentCore Browser能够完整渲染页面，确保所有信息都能被准确提取 智能导航能力： Agent可以根据任务目标自主决定访问哪些页面，点击哪些链接，实现真正的智能化信息获取 实时状态监控： 通过AgentCore Browser Viewer，开发者可以实时查看浏览器当前的页面状态，便于调试和优化workflow 可扩展性强： 同样的模式可以应用到其他网站，如电商价格监控、新闻聚合、竞品分析等各种场景 可以通过下面GIF了解上述的技术亮点： 五、技术实现要点 会话生命周期管理 AgentCore Browser采用长生命周期的会话设计，每个会话都拥有独立的浏览器环境。在Dify集成中，我们通过AWS Parameter Store来存储和管理会话连接信息，确保不同节点之间可以共享同一个浏览器会话。 远程浏览器连接 集成方案使用Playwright客户端通过Chrome DevTools Protocol连接到远程的AgentCore Browser实例。这种设计使得浏览器运行在AWS托管的安全环境中，而Dify只需要通过API进行控制，实现了计算和控制的分离。 操作抽象与封装 Browser Tool插件将复杂的浏览器操作抽象为简单的工具接口，如browse_url、search_web、extract_content、fill_form、execute_script等。这些接口设计遵循Dify的工具规范，可以直接在Workflow和Agent节点中使用。 异步操作处理 由于网页加载和JavaScript执行是异步的，插件内部使用了Python的asyncio框架来处理异步操作，确保每个操作都能在页面完全加载后再进行下一步处理，提高了操作的稳定性和准确性。 错误处理与容错 集成方案实现了完善的错误处理机制，包括连接超时处理、页面加载失败重试、元素查找异常捕获等。当遇到不可恢复的错误时，系统会自动清理浏览器资源，避免资源泄露。 六、总结与展望 Amazon Bedrock AgentCore Browser为Dify生态带来了前所未有的网页交互能力。通过这个集成方案，Dify用户可以： 突破传统限制，轻松处理JavaScript动态渲染的现代网页 实现复杂的多步骤网页交互流程，如自动登录、表单填写、数据提取 在安全隔离的云端环境中运行浏览器，无需担心本地资源和安全问题 利用AI Agent的智能规划能力，实现真正的自动化信息获取和分析 这个集成不仅填补了Dify在复杂网页交互方面的能力空白，更开启了AI应用的新可能。无论是市场研究、竞品分析、内容聚合，还是自动化测试、数据采集，AgentCore Browser都能为Dify用户提供强大的技术支撑。 随着AI技术的不断发展，AI工具生态决定了大模型在具体业务中的整体效果。企业级的组件集成，如Amazon Bedrock Agent Core中的Browser，以及Memory、Code Interpreter会和Dify一起，形成更加强大易用的AI应用开发平台。 其他产品和服务推荐 S-BGP 是我们在由光环新网运营的亚马逊云科技中国（北京）区域和由西云数据运营的亚马逊云科技中国（宁夏）区域推出的一项成本优化型网络服务，旨在帮助我们的客户降低经过互联网传输数据出云（Data Transfer Out）的费用。 如果您想申请亚马逊云科技中国区域的 S-BGP 服务，请联系您的客户经理获取进一步帮助。 *前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。 本篇作者 李元博 亚马逊云科技 AI/ML GenAI 解决方案架构师，专注于 AI/ML 特别是 GenAI 场景落地的端到端架构设计和业务优化。在互联网行业工作多年，在用户画像、精细化运营、推荐系统、大数据处理方面有丰富的实战经验。 彭金冬 亚马逊云科技解决方案架构师，负责电商行业客户的架构设计和技术支持。 AWS 架构师中心： 云端创新的引领者 探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用

## 核心技术
Amazon Bedrock AgentCore、Strands Agent SDK、OpenClaw、MCP Server

## 深度分析
### 云端托管浏览器：AI Agent网页交互范式的根本转变
传统的网页信息获取方案通常需要在本地运行浏览器实例，这带来了资源占用、安全隔离、资源清理等一系列运维负担。AgentCore Browser采用完全托管的云端浏览器设计，将浏览器执行环境从用户本地迁移到AWS托管的基础设施上 。这种设计的核心价值在于实现了**计算与控制的分离**：浏览器运行在安全隔离的云端环境中，而Dify等上层应用只需通过API进行远程控制。这种范式转变对于需要大规模、自动化网页交互的AI应用具有重要意义，因为它消除了本地资源管理的复杂性，同时提供了企业级的安全隔离保证。

### 双组件架构：Session Manager与Browser Tool的职责分离
集成方案采用了清晰的双组件架构设计。Agent Core Browser Session Manager负责启动和管理远程浏览器会话，创建独立的沙盒环境，确保多个任务之间的隔离性；Agent Core Browser Tool则封装了丰富的浏览器操作接口（browse_url、search_web、extract_content、fill_form、execute_script等），以工具的形式暴露给Dify 。这种职责分离的设计带来了几个关键优势：首先，Session Manager屏蔽了底层浏览器生命周期的复杂性；其次，Tool组件遵循Dify的工具规范，可以直接在Workflow和Agent节点中使用；第三，会话与操作的正交设计使得同一个浏览器会话可以被多个Tool操作复用，提高了多步骤场景下的执行效率。

### Dify生态的能力缺口与填补路径
Dify作为一个开源LLM应用开发平台，在复杂网页交互方面长期存在能力缺口。文章指出了四个核心挑战：动态内容渲染困难、复杂交互能力缺失、状态管理问题，以及安全性顾虑 。这些问题在需要深度网页交互的AI应用场景中尤为突出。AgentCore Browser的集成通过云端托管解决了安全性和资源隔离问题，通过完整的Chromium内核支持解决了动态内容渲染问题，通过会话持久化设计解决了状态管理问题，通过丰富的操作接口解决了复杂交互问题。这一集成标志着Dify从纯LLM编排平台向综合性AI应用开发平台的演进。

### GitHub仓库分析：从信息获取到结构化洞察的完整闭环
文章中展示的GitHub仓库分析Workflow代表了AgentCore Browser在Dify中的典型应用模式。该Workflow包含四个阶段：会话初始化（通过Browser Session Manager创建持久化会话）、智能信息获取（Agent节点配合Browser Tool访问仓库页面）、深度内容分析（Agent自主导航到README等子页面）、结构化输出（整理成静态信息、指标信息、PR列表、关键变更和洞察列表） 。这个案例展示了如何将非结构化的网页内容转化为结构化的可操作数据，其输出格式（static_info、metric_info、pr_insight_list等）可以直接用于后续的报告生成、邮件通知或进一步的分析流程，具有很强的可复用性。

### 技术实现：Playwright+CDP与asyncio的协同
在技术实现层面，集成方案使用了Playwright客户端通过Chrome DevTools Protocol（CDP）连接到远程的AgentCore Browser实例 。这种组合的技术选型充分利用了Playwright成熟的浏览器自动化能力和CDP的底层控制能力。同时，由于网页加载和JavaScript执行本质上是异步的，插件内部使用了Python的asyncio框架来处理异步操作，确保每个操作都能在页面完全加载后再进行下一步处理。此外，完善的错误处理机制（连接超时处理、页面加载失败重试、元素查找异常捕获等）和自动资源清理逻辑也是该方案能够在生产环境中稳定运行的重要保障。

## 实践启示
### 优先掌握会话生命周期管理
在生产环境中使用AgentCore Browser与Dify集成时，会话生命周期管理是首要关注点。文章明确指出通过AWS Parameter Store来存储和管理会话连接信息 。实践建议：在Dify Workflow中显式地设计会话启动和关闭节点，确保每个Workflow执行完成后都能正确清理浏览器资源，避免会话泄漏导致的额外成本。对于长时间运行的多步骤Workflow，建议在关键节点设置心跳检查，以便及时发现和处理异常的会话状态。

### 利用Agent节点集成实现智能导航
Browser Tool与Dify Agent节点的集成是利用大模型智能规划能力的关键。通过将浏览器操作封装为可被Agent调用的工具，模型可以根据任务目标自主决定访问哪些页面、点击哪些链接 。实践建议：在设计复杂网页信息获取Workflow时，优先使用Agent节点而非简单的顺序流程节点，让模型能够动态调整信息获取策略。对于需要多轮导航的场景（如登录→访问→提取的流程），应显式设计人机交互checkpoint，以便在模型遇到不确定情况时（如验证码）进行人工介入。

### 复用GitHub分析模式构建可扩展的信息获取流程
GitHub仓库分析Workflow展示了一个高度可复用的信息获取模式：初始化→导航→提取→结构化输出 。实践建议：基于这一模式构建领域专属的提取模板（如竞品分析、价格监控、新闻聚合等），将共性的导航和提取逻辑抽象为可复用的Workflow子图。同时，利用AgentCore Browser的会话持久化能力，在同一个会话中顺序执行多个相关网站的信息获取，提高整体效率并降低认证开销。

### 构建可观测性体系：Browser Viewer的集成价值
AgentCore Browser Viewer提供了实时的浏览器状态查看能力，使得开发者可以直观地看到浏览器的当前页面和执行状态 。这对于调试复杂的多步骤Workflow至关重要。实践建议：在开发和调试阶段，务必启用Browser Viewer进行实时监控，特别是在调试导航策略和提取逻辑时。在生产环境中，可以将Browser Viewer作为运维监控工具，用于快速定位用户反馈的问题是否与浏览器状态异常相关。

### 在Dify插件体系中预留容错与恢复机制
集成方案实现了完善的错误处理机制，包括连接超时处理、页面加载失败重试、元素查找异常捕获等，并在遇到不可恢复错误时自动清理浏览器资源 。实践建议：在基于此集成方案构建生产级应用时，应设计完善的容错与恢复机制，包括：为每个浏览器操作设置合理的超时时间；实现重试逻辑以应对暂时性的网络或页面加载问题；确保错误发生时能够正确释放浏览器资源；考虑实现断点续传能力，使长时间运行的Workflow在中断后能够从最近的检查点恢复而非完全重启。

## 来源
> [AWS China Blog 原文](https://aws.amazon.com/cn/blogs/china/amazon-bedrock-agentcore-browser-information-retrieval-and-analysis-capabilities/)

## 相关实体
- [Introducing OS Level Actions in Amazon Bedrock AgentCore Browser](../ch04/384-introducing-os-level-actions-in-amazon-bedrock-agentcore-bro.html)
- [快时尚电商行业智能体设计思路与应用实践（七）Amazon Bedrock AgentCore Runtime 深度解析和场景分析 | 亚马逊AWS官方博客](../ch04/540-amazon-bedrock-agentcore.html)
- [AgentCore Browser OS级操作：Action-Screenshot-Reaction闭环](ch11/256-aws-bedrock-agentcore.html)
- [当 AI Agent 学会"忘记"：Amazon Bedrock AgentCore Memory 的记忆哲学" | 亚马逊AWS官方博客](../ch04/540-amazon-bedrock-agentcore.html)
- [基于Bedrock Agentcore 实现智能成本分析与告警系统 | 亚马逊AWS官方博客](ch11/050-bedrock-agentcore.html)
- [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第一篇 | 亚马逊AWS官方博客](../ch04/540-amazon-bedrock-agentcore.html)

---

