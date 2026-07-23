---
source: wechat
source_url: https://mp.weixin.qq.com/s/OkctZudvJkxhBeSH3Ba8Tg
ingested: 2026-07-23
feed_name: 机器之心
wechat_mp_fakeid: MP_WXS_3073282833
source_published: 2026-07-22
sha256: a7148bc86216e98fa97b04bc1c9bffd5841d590910f0eb92317d261b63b68c0d
---

# Gemini 3.5 Pro继续跳票，谷歌端上三款Flash模型强行交作业

机器之心编辑部  


没有给大家带来心心念念的 Gemini 3.5 Pro，谷歌今天一股脑地发了三款 Flash 轻量级模型。

  


  


没有意外，谷歌的这一操作遭到了网友毫不留情地吐槽：

  


  


令人难绷的是，Gemini 3.6 Flash 的智能水平并未超过 Gemini 3.5 Flash。

  


  


在官方博客中，谷歌表示，「面向生产环境构建 AI 智能体的开发者和企业，需要更高的 Token 使用效率、更低的延迟，以及更加稳定可靠的性能。Flash 系列正是围绕效率与质量之间的平衡点打造，帮助智能体工作流实现规模化运行。」因此在 Gemini 3.5 Flash 的基础上，推出了这样三款新模型：

  


  * Gemini 3.6 Flash：面向主力生产任务的通用模型，在编程、知识工作和多模态任务上的表现进一步提升。

  * Gemini 3.5 Flash-Lite：Gemini 3.5 系列中速度最快、成本最低的模型。

  * CodeMender 中的 Gemini 3.5 Flash Cyber：高水平网络安全应用，需要模型与智能体基础设施进行精细协同。

  


目前，Gemini 3.6 Flash 和 Gemini 3.5 Flash-Lite 即日起开放使用。开发者可通过 Google AI Studio 和 Android Studio 调用 Gemini API。Gemini 3.6 Flash 同时已登陆 Google Antigravity。企业用户可通过 Gemini Enterprise Agent Platform 使用。普通用户可通过 Gemini 应用体验，Gemini 3.5 Flash-Lite 也正在逐步接入 Google 搜索。

  


此外，谷歌还透露了 Gemini 3.5 Pro 的进度消息，称其正在与合作伙伴开展测试，待准备充分后将尽快面向更多用户开放。与此同时，谷歌已经开始推进下一代模型 Gemini 4，并启动了迄今规模最大、目标最具挑战性的预训练任务。

  


先不管谷歌「画的大饼」什么时候能吃上，我们先来一一看此次发布的三款模型。

  


Gemini 3.6 Flash

效率和性能全面超过 Gemini 3.5 Flash

  


Gemini 3.6 Flash 直接吸收了开发者和客户在使用 Gemini 3.5 Flash 过程中提出的反馈，在编程和知识工作能力上进一步提升，同时显著改善了 Token 使用效率。

  


例如，在 Artificial Analysis Index 测试中，Gemini 3.6 Flash 的输出 Token 消耗较 Gemini 3.5 Flash 减少 17%。执行多步骤工作流时，它所需的推理步骤和工具调用次数也更少。

  


效率提升的同时，Gemini 3.6 Flash 的价格也低于 Gemini 3.5 Flash。其输入价格为每 100 万 Token 1.50 美元，输出价格为每 100 万 Token 7.50 美元，可以进一步降低单次智能体任务的总体成本，让智能体的开发和运行更具经济性。

  


在提高效率的同时，Gemini 3.6 Flash 在多类任务上的表现也超过 Gemini 3.5 Flash：

  


  * 在 DeepSWE 测试中，Gemini 3.6 Flash 的得分由 37% 提升至 49%，能够以更高精度完成任务，减少非必要的代码修改和重复执行。在衡量机器学习研究能力的 MLE Bench 中，其成绩由 49.7% 提升至 63.9%。 

  * 计算机操作能力进一步增强，在 OSWorld-Verified 上的成绩由 78.4% 提升至 83.0%。目前，计算机操作已作为内置客户端工具接入 Gemini API 和 Gemini Enterprise。 

  * 在知识工作领域，Gemini 3.6 Flash 同样取得提升，GDPval-AA v2 得分由 1349 提高到 1421。Hebbia、Harvey 等客户发现，该模型尤其擅长文档解析、图表与数据分析、报告撰写等多模态任务。

  


  


  


Gemini 3.5 Flash-Lite

为智能体工作流规模化运行而生

  


Gemini 3.5 Flash-Lite 同时面向低延迟任务，以及智能体搜索、文档处理等对吞吐量要求较高的开发工作流。

  


Gemini 3.5 Flash-Lite 是 Gemini 3.5 系列中速度最快的模型。根据 Artificial Analysis 的测试，其输出速度达到每秒 350 个 Token。

  


该模型的输入价格为每 100 万 Token 0.30 美元，输出价格为每 100 万 Token 2.50 美元。凭借显著超过 Gemini 3.1 Flash-Lite 的模型质量，Gemini 3.5 Flash-Lite 为运行高吞吐量生产业务的开发者和企业提供了较高的性价比。

  


Gemini 3.5 Flash-Lite 可以帮助智能体系统以更高效率扩展。在不同思考等级下，模型表现均显著超过 Gemini 3.1 Flash-Lite。

  


开发者可以根据具体任务灵活配置模型。面对大规模、高频任务，可以选择 minimal 或 low 思考等级，优先降低延迟和成本；面对多步骤子智能体任务，则可以启用更高的思考等级。计算机操作能力也已作为内置工具加入模型，帮助智能体在不同产品和使用界面中更加稳定地完成任务。

  


在编程和智能体任务方面，Gemini 3.5 Flash-Lite 实现了显著提升：

  


  * Terminal-Bench 2.1：由 31% 提升至 54%； 

  * 长上下文测试 GDM-MRCR v2：由 60.1% 提升至 72.2%； 

  * 真实任务执行测试 GDPval-AA v2：由 642 提升至 1140。 

  


  


在多项智能体和编程评测中，Gemini 3.5 Flash-Lite 甚至超过了 Gemini 3 Flash。例如，其 SWE-Bench Pro 成绩为 54.2%，高于 Gemini 3 Flash 的 49.6%；OSWorld-Verified 成绩为 74.0%，也超过后者的 65.1%。

  


对于此前使用 Gemini 2.5 Flash 和 Gemini 3 Flash 处理相关任务的开发者而言，Gemini 3.5 Flash-Lite 提供了速度更快、能力更强的新选择。

  


  


CodeMender 中的 Gemini 3.5 Flash Cyber

高效发现并修复安全漏洞

  


AI 模型发现安全漏洞的速度正在加快，现有系统修复漏洞的能力却未必能够同步跟上。面对不断扩大的风险，软件安全体系需要同时具备更强的能力和更高的运行效率。

  


Flash 系列兼具性能与效率，适合大规模检测、验证和修复代码安全问题。Gemini 3.5 Flash Cyber 基于 Gemini 3.5 Flash 开发，并针对网络安全漏洞的发现和修复进行了专项微调，每个 Token 的使用成本低于更大规模的模型。

  


在 CodeMender 系统中，多个 Gemini 3.5 Flash Cyber 智能体会协同工作，最终生成一份整合后的报告。通过这一机制，Gemini 3.5 Flash Cyber 在主流基准测试 CyberGym 上取得了接近前沿水平的竞争力表现。

  


  


考虑到这项技术具有明显的双重用途属性，谷歌对 Gemini 3.5 Flash Cyber 采取了审慎的开放策略。

  


该模型近期将通过 CodeMender 面向政府机构和受信任的合作伙伴推出，并采用限量试点的方式提供。这样可以让一线安全防御人员优先获得相关能力，在关键漏洞被利用前完成发现和修复，同时降低技术遭到大范围滥用的风险。

  


更多信息可以查看以下模型卡：

  


  * Gemini 3.6 Flash：https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-6-Flash-Model-Card.pdf

  * Gemini 3.5 Flash-Lite：https://storage.googleapis.com/deepmind-media/Model-Cards/Gemini-3-5-Flash-Lite-Model-Card.pdf

  


参考链接：

https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-3-6-flash-3-5-flash-lite-3-5-flash-cyber/

  


© THE END

转载请联系本公众号获得授权

投稿或寻求报道：liyazhou@jiqizhixin.com