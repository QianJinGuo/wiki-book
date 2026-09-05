---
source: wechat
source_url: https://mp.weixin.qq.com/s/arj09cGhfDb4rW0IRyon6A
tags: [wechat, article, claude, openai, gpt, agent, harness, openclaw]
feed_name: 机器之心
wechat_mp_fakeid: MP_WXS_3073282833
source_published: 2026-05-08
review_value: 7
review_confidence: 8
review_recommendation: worth-reading
review_stars: 3
ingested: 2026-05-13
sha256: 9d6cdc4479aa463ef497783e31dc2fd1fe0d98e1dbb84889e8f7b117837ab816
---
# OpenAI官方CLI上线，跟复杂的SDK说拜拜
机器之心编辑部
大家总说新科技会淘汰老技术。
但大模型要想深度落地，必须拥抱老技术，拥抱兼容性。
在过去很长一段时间里，开发者想要测试 OpenAI 的模型能力，通常有两种路径：要么在 Playground 进行手动调试，要么编写一段 Python 或 Node.js 脚本来调用 SDK。
来回调用和包装 SDK 是很麻烦的一件事。回到结构化的世界，回到命令行调用工作流，是开发者们喜闻乐见的。
OpenAI 也知道这一点。
就在今天，OpenAI 的 Codex 团队开发者体验工程师 Jason Liu 发推公布了一个「小而有爱」的项目：
OpenAI 官方推出  了命令行界  面工具  **` openai-cli  ` ** ，开发者只需在终端敲下一行命令，即可直接与 OpenAI 的最新模型深度交互，打破了过去SDK的限制。
根据Jason Liu 发布的信息，  **` openai-cli  ` ** 具有如下特性：
1. 通过 CLI 调用 Responses，并支持所有云端工具
2. 提供 Unix 风格的结构化 CLI 输出
3. 支持图像生成/编辑、语音转录、TTS
4. 可以创建项目并配置 API Key
目前，项目已经开源。
* Github 链接：https://github.com/openai/openai-cli
###  CLI 是开发者的「瑞士军刀」？
###
1. ** 极简的「管道（Piping）」自动化流水线  **
**
**
在传统的开发流程中，如果你想让 AI 分析 100 个日志文件的异常，你需要写一个循环读取文件的脚本。使用  ` openai-cli  ` ，利用 Unix 的管道哲学，你只需要一行命令：  ` cat error.log | openai chat --system "分析日志中的潜在风险" > analysis.txt  ` 这种将 AI 能力「原子化」的做法，让 AI 能够像  ` grep  ` 或  ` awk  ` 一样参与到日常的系统运维中。
2. ** 开发者本地调试的「零延迟」体验  **
**
**
当开发者需要测试一个复杂的 Prompt 或调整 Temperature 参数时，在代码里反复修改并重启程序是非常低效的。  ` openai-cli  ` 提供了一个即时的沙盒环境。通过在终端快速尝试不同的参数组合，开发者可以在确认效果后再将参数写入正式代码，极大缩短了调试周期。
3. ** 后端基础设施的敏捷管理  **
**
**
对于需要管理大量 Fine-tuning 任务或向量数据库文件的团队，  ` openai-cli  ` 提供了比 Web 界面更高效的批处理能力。无论是批量删除过期的训练文件，还是实时监控微调任务的收敛情况，命令行提供的交互速度和可编程性都是 Web 页面无法比拟的。
###  AI 基础设施的「原生化」
###
OpenAI 推出官方 CLI，本质上是将其 API 能力向操作系统的底层「下沉」。当 AI 能力变成一个标准的命令行工具时，它就具备了无穷的组合潜力。它可以被封装进 Docker 镜像，可以被写进 Crontab 定时任务，也可以被集成到各种 IDE 的快捷操作中。
随着具备本地 AI 执行能力的「智能硬件」和「Agent PC」逐渐普及，开发者需要更轻量、更直接的方式与云端大模型进行协同。  ` openai-cli  ` 的出现，实际上是为本地自动化脚本（Agents）提供了一个标准的通信口，让本地硬件与云端大脑的耦合变得前所未有的简单。
此前，开源社区存在大量优秀的第三方 CLI 工具。官方工具的介入虽然会带来竞争，但更重要的是它确立了官方的调用规范和标准。对于第三方开发者而言，这更像是一个信号：AI 调用正在走向「标准化」。
` openai-cli  ` 的发布，代表了 OpenAI 对开发者工作流的深度理解——  ** 最好的工具应当是隐形的，原生的。  **
**
**
从  ` brew install openai/tools/openai  ` 开始吧。
© THE END
转载请联系本公众号获得授权
投稿或寻求报道：liyazhou@jiqizhixin.com