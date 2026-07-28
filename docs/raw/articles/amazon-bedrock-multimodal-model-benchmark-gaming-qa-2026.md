---
source_url: https://aws.amazon.com/cn/blogs/china/how-to-choosing-gaming-ai-model-build-amazon-bedrock
source: rss
feed_name: AWS China Blog
source_published: 2026-07-28
ingested: 2026-07-29
sha256: 84f12f0078ec0e5bef9be22d3be11167e53505e8160c34ac248aa31feb512871
---

# 如何选择最适合游戏场景的 AI 模型？构建 Amazon Bedrock 多模态模型对比测试平台

# 如何选择最适合游戏场景的 AI 模型？构建 Amazon Bedrock 多模态模型对比测试平台

摘要：本文面向正在评估 Amazon Bedrock 多模态模型的 AI 工程师 / 解决方案架构师，以及探索 AI 驱动游戏 QA 自动化的游戏开发团队。我们提供的对比测试方法论和工具，也是改进 AI 基础设施能力的重要一步——通过系统化模型评估积累量化基准数据，为更多业务场景落地 AI 提供可靠依据。

**目录**

01 一、背景

02 二、为什么 UI 元素定位能力是关键

03 三、平台核心功能

04 四、技术实现亮点

05 五、快速开始

06 六、总结

07 七、相关资源

* * *

## **一、背景**

本文面向正在评估 [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) 多模态模型的 AI 工程师 / 解决方案架构师，以及探索 AI 驱动游戏 QA 自动化的游戏开发团队。我们提供的对比测试方法论和工具，也是改进 AI 基础设施能力的重要一步——通过系统化模型评估积累量化基准数据，为更多业务场景落地 AI 提供可靠依据。

Amazon Bedrock 上可用的多模态模型越来越多，涵盖 Anthropic Claude、[Amazon Nova](<https://aws.amazon.com/cn/ai/generative-ai/nova/>)、Meta Llama、Google Gemma、Mistral 等多个厂商的模型。对于需要处理游戏画面的应用——例如游戏 QA 自动化测试、UI 元素识别、画面内容理解——开发团队面临一个实际问题：哪个模型最适合我的场景？

不同模型在元素定位精度、响应速度、token 消耗上各有差异，靠主观感受很难做出有说服力的技术决策。本文介绍我们构建的一个开源工具：[Bedrock Multimodal Model Benchmark Platform](<https://github.com/aws-samples/sample-multimodal-model-analysis>)，它通过标准化测试用例和自动化执行，帮助开发团队用数据来选择合适的模型。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/28/how-to-choosing-gaming-ai-model-build-amazon-bedrock-1.png>) [图1 平台主界面，提供模型配置、测试用例、测试执行和报告四个核心模块]  
---  
  
## **二、为什么 UI 元素定位能力是关键**

多模态模型不只是”看懂图片”，更重要的是能精确输出元素的位置坐标（bounding box）。这个能力是游戏 AI 自动化的基础：

游戏 QA 自动化测试：AI 测试的核心链路是——模型识别游戏画面 → 输出需要点击的 UI 元素坐标 → 执行点击操作。坐标不准，测试就会失败。

游戏画面内容分析：识别游戏中的角色、道具、UI 组件，需要模型不仅能”认出”元素，还能精确标注其位置。

不同模型在这类任务上的表现差异显著——有的能识别出更多元素，有的坐标更精确，有的响应更快。这正是需要对比测试的原因。

### 2.1 一个容易踩的坑：0-1000 归一化坐标

Claude 和 Nova 系列模型都使用 0-1000 归一化坐标系，而不是直接输出像素坐标。例如，对于 1920×1080 的截图，模型输出的坐标范围是 0-1000，需要按比例还原：
    
    
    pixel_x = model_x × (image_width / 1000)
    pixel_y = model_y × (image_height / 1000)

不了解这个约定直接使用模型输出数值，会导致定位偏移。平台的 Bounding Box 解析器统一处理了这个转换，开发者无需关心坐标系差异。

## **三、平台核心功能**

### 3.1 管理和发现模型

平台支持手动添加模型配置，也可以通过 Discover Bedrock Models 功能自动查询当前 AWS 账号下可用的所有多模态模型，一键批量导入。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/28/how-to-choosing-gaming-ai-model-build-amazon-bedrock-2.png>) [图2 模型配置页面，支持 Claude、Nova、Llama、Gemma、Mistral、Qwen 等多个系列]  
---  
[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/28/how-to-choosing-gaming-ai-model-build-amazon-bedrock-3.png>) [图3 自动发现功能，查询指定 Region 下所有支持图片输入的 Amazon Bedrock 模型]  
---  
  
每个模型配置包含模型 ID、调用 Region 和推理参数（max_tokens、temperature 等），支持灵活调整。

### 3.2 创建测试用例

测试用例由游戏截图 + 提示词组成，支持同时上传主图和参考图（例如：主图是游戏界面，参考图是需要识别的目标图标）。平台支持中英文提示词，可以为不同测试目标分别设计提示词。

### 3.3 一键执行对比测试

选择测试用例和目标模型后，点击 Start Test，平台会对每个”测试用例 × 模型”的组合自动执行调用，实时展示执行进度和日志。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/28/how-to-choosing-gaming-ai-model-build-amazon-bedrock-4.png>) [图4 执行界面：左侧选择测试用例，右侧选择模型，下方实时展示执行日志]  
---  
  
执行日志会记录每次调用的耗时和 token 消耗，单个模型失败不影响其他模型的测试继续执行。

### 3.4 查看和对比结果

测试完成后，可以在结果页面查看每个模型识别出的 bounding box，并将多个模型的结果叠加显示在同一张截图上——不同模型用不同颜色的框区分，直观对比各模型的识别范围和精度。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/28/how-to-choosing-gaming-ai-model-build-amazon-bedrock-5.png>) [图5 多模型 bounding box 叠加效果：不同颜色代表不同模型，可以直观看出各模型的识别差异]  
---  
  
结果列表页面汇总了每个模型识别出的元素数量和坐标系转换信息，方便快速筛选。

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/28/how-to-choosing-gaming-ai-model-build-amazon-bedrock-6.png>) [图6 结果列表：展示各模型识别出的元素数量及坐标系信息]  
---  
  
## **四、技术实现亮点**

### 4.1 Converse API 统一调用

平台使用 Amazon Bedrock [Converse API](<https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html>) 统一调用所有模型，屏蔽了不同模型之间的请求格式差异。无论是 Claude、Nova 还是第三方模型，调用代码完全一致，新模型上线后无需修改任何调用逻辑。

同时支持多图输入——可以在同一次调用中传入多张图片，例如同时传主图和参考图，让模型做跨图识别：
    
    
    def _build_converse_input(self, images: list[tuple[bytes, str]], prompt: str):
        content = []
        for image_bytes, image_format in images:  # 支持多张图片
            content.append({"image": {"format": image_format, "source": {"bytes": image_bytes}}})
        content.append({"text": prompt})
        return [{"role": "user", "content": content}]

### 4.2 双策略 Bounding Box 解析

不同模型对同一个”输出 bounding box”的指令，输出格式不尽相同：有的输出结构化 JSON，有的用自然语言描述坐标位置。解析器同时支持两种格式，确保兼容所有模型的输出风格：

  * JSON 格式：{“x”: 500, “y”: 300, “width”: 200, “height”: 50, “label”: “登录按钮”}
  * 自然语言格式：”左上角 (500, 300) 到右下角 (700, 350)”



解析完成后自动完成 0-1000 坐标系到像素坐标的转换，以及越界坐标的自动裁剪。

### 4.3 健壮的容错设计

  * 限流自动重试：遇到 Amazon Bedrock 限流时，采用指数退避策略（等待时间逐次翻倍）自动重试，避免立即重试持续失败
  * 模型 ID 兼容：自动处理跨区域推理模型 ID 的 us. 前缀问题，降低模型配置门槛
  * 单模型失败隔离：某个模型调用失败不影响其他模型的测试继续执行



## **五、快速开始**
    
    
    git clone https://github.com/aws-samples/sample-multimodal-model-analysis.git
    cd sample-multimodal-model-analysis
    pip install -r requirements.txt
    
    # 配置 AWS 凭证（需要 Amazon Bedrock 访问权限）
    export AWS_REGION=us-east-1
    
    bash start.sh
    # 访问 http://localhost:8000

使用流程：

  1. 在 Model Config 页面添加要对比的模型（或使用 Discover 自动导入）
  2. 在 Test Cases 页面上传游戏截图，编写提示词
  3. 在 Test Suites 页面将测试用例组织为套件
  4. 在 Run Test 页面选择模型，启动测试
  5. 在 Report 页面查看对比结果



## **六、总结**

对于需要处理游戏画面的 AI 应用，模型选型是一个需要用数据说话的决策。本项目提供了一个开箱即用的对比测试平台，帮助开发团队：

  * 用量化数据做选型：通过统一的测试用例客观对比各模型表现
  * 建立可复用的测试基线：有了标准测试套件，新模型发布时可以快速对比
  * 降低接入成本：Converse API 统一调用，新增模型零适配



项目已开源：<https://github.com/aws-samples/sample-multimodal-model-analysis>



  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=1>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon Nova](<https://aws.amazon.com/cn/ai/generative-ai/nova/?p=bl_pr_nova_l=2>) — 提供前沿智能和最高性价比的基础模型