---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/ai-agent-gaming-qa-build-based-on-amazon-bedrock
ingested: 2026-07-29
feed_name: AWS China Blog
source_published: 2026-07-29
sha256: 5e9585b7e6c5d45895c6bc1e2c00d14e07f00b766ca5cf2333c5d91ad65e1433
---

# 用 AI Agent 加速游戏 QA：构建基于 Amazon Bedrock 的 Agentic 自动化测试系统

摘要：本文展示如何结合 Amazon Bedrock Claude 和开源设备自动化框架，构建一个 Agentic 自动化测试系统，大幅缩短游戏版本发布前的黑盒测试时间，加快迭代周期，提升上市速度。  
  
**目录**

01 一、问题：QA 成为游戏开发的瓶颈

02 二、解决方案：用 AI 实现Agentic 测试编排

03 三、架构：三层设计

04 四、工作原理：测试执行循环

05 五、技术实现

06 六、真实场景：测试游戏登录流程

07 七、部署选项

08 八、关键优势

09 九、最佳实践

10 十、克服常见挑战

11 十一、衡量成功

12 十二、快速开始

13 十三、总结

14 十四、了解更多

* * *

## **一、问题：QA 成为游戏开发的瓶颈**

游戏开发团队面临一个关键挑战：黑盒测试。与传统软件测试不同，游戏测试无法利用 API 和埋点进行测试，必须模拟真实用户环境。这种方式虽然能发现只在生产环境才出现的 bug，但代价巨大。

想象一个典型场景：游戏开发团队经过两周的紧张开发，完成了新版本。游戏功能完整，但在发布给数百万玩家之前，必须通过全面的 QA 测试。一个由三名 QA 工程师组成的团队需要手动测试每个功能、每个游戏模式、每个用户流程。他们点击按钮、导航菜单、玩通游戏场景、验证一切是否正常工作。这个过程可能需要 长达三天。

影响是深远的：

  * 发布周期变长：原本可以每周发布一次，现在变成两周或一个月
  * 迭代速度下降：团队无法快速测试 A/B 变体或内容更新
  * 资源受限：QA 成为瓶颈，QA 工程师花费更多时间在重复性手动测试上，而不是寻找创意的边界情况
  * 收入影响：延迟发布意味着延迟变现，无法快速响应市场机会



这是许多游戏工作室的现实，尤其是那些需要频繁更新内容以保持玩家参与度的工作室。随着 AI 加速内容生产，开发速度与 QA 能力之间的差距已成为关键的业务问题。

## **二、解决方案：用 AI 实现Agentic 测试编排**

如果 QA 测试能像人类一样理解游戏会怎样？如果 QA 工程师能用自然语言描述一个测试场景，系统就能自动执行它、智能地决定下一步做什么、并报告结果呢？

这就是Agentic 测试编排的价值所在。通过结合大语言模型的语义理解能力和专业框架的设备自动化能力，我们可以构建一个系统，它能够：

  1. 理解自然语言测试描述- 无需编写复杂的测试脚本
  2. 做出智能决策- 系统能理解 UI 上下文并适应变化
  3. 可靠地执行- 自动化执行消除人为错误和疲劳
  4. 高效扩展- 在云端真实设备上运行测试，无需手动干预



## **三、架构：三层设计**

关键洞察是 Agentic 测试需要三种不同的能力，不应该混在一起：

  * 智能层：理解要做什么、规划测试步骤、验证结果
  * 辅助模型层：精确识别和分割 UI 元素，增强视觉感知精度
  * 执行层：实际控制设备、执行 UI 操作



通过分离这些关注点，我们可以为每一层利用最佳的解决方案：
    
    
    ┌─────────────────────────────────────────────────────────────┐
    │                  用户输入（自然语言）                         │
    │            "测试登录流程，使用无效凭证"                      │
    └────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
    ┌─────────────────────────────────────────────────────────────┐
    │         智能层（Amazon Bedrock Claude）                      │
    │  • 理解测试意图                                              │
    │  • 规划测试步骤                                              │
    │  • 高层推理与决策                                            │
    │  • 验证结果                                                  │
    └────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
    ┌─────────────────────────────────────────────────────────────┐
    │      辅助模型层（AutoGLM、SAM3 等专用小模型）                │
    │  • UI 元素精确分割与定位                                     │
    │  • GUI 交互意图识别                                          │
    │  • 像素级元素边界检测                                        │
    │  • 增强视觉感知精度                                          │
    └────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
    ┌─────────────────────────────────────────────────────────────┐
    │      执行层（开源设备自动化框架）                             │
    │  • 控制设备                                                  │
    │  • 执行 UI 操作                                              │
    │  • 捕获截图                                                 │
    │  • 返回设备状态                                              │
    └────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                      [真实设备 / 模拟器]

### 3.1 智能层：Amazon Bedrock Claude

[Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/>) 提供对 Claude 系列多模态模型的托管访问，具有对 Agentic 测试编排至关重要的几个能力：

  * 工具调用：Claude 可以调用外部工具并解释其结果，实现一个反馈循环，它可以看到当前设备状态并决定下一步做什么
  * 视觉理解：Claude 可以分析截图来理解当前 UI 状态
  * 推理能力：Claude 可以将复杂的测试场景分解为逻辑步骤，并在事情不按预期进行时进行调整



### 3.2 辅助模型层：专用小模型增强

在智能层和执行层之间，我们引入专用小模型来增强 UI 元素的识别精度：

  * AutoGLM：针对 GUI 交互优化的小模型，擅长理解 UI 元素语义和操作意图，能够在复杂游戏界面中准确识别可交互元素
  * SAM3：图像分割模型，能够精确分割 UI 元素边界，提供像素级定位能力，尤其适合游戏中非标准 UI 元素的识别



这些小模型与 Claude 形成互补：Claude 负责高层推理和测试决策，小模型负责精确的视觉感知和元素定位。这种组合使得系统在面对复杂游戏 UI（如自定义控件、动态动画元素）时，依然能保持高识别精度。

### 3.3 执行层：设备自动化

对于设备控制，我们利用提供可靠、低级设备自动化的开源框架：

  * Appium：跨平台自动化框架，支持 Android、iOS 和 Web 应用
  * UIAutomator2：Android 原生自动化框架，用于黑盒测试
  * WebDriverAgent：基于 Apple Xcode 测试框架的 iOS 设备控制方案，支持在真机和模拟器上执行 UI 操作



这些框架提供了”手”来执行 Claude 做出的决策。

## **四、工作原理：测试执行循环**

当你提交一个测试时会发生什么：

**第一步：测试规划**

Claude 接收你的自然语言测试描述并将其分解为逻辑步骤。例如：

  * “测试登录流程，使用无效凭证”



Claude 可能会规划：

  1. 截图查看当前状态
  2. 定位并点击登录按钮
  3. 输入无效凭证
  4. 验证错误消息出现
  5. 验证用户未登录



**第二步：迭代执行**

对于每一步，系统会：

  1. 截图获取当前设备状态
  2. 将截图和当前测试步骤发送给 Claude
  3. Claude 分析截图并决定采取什么行动
  4. 执行层执行该操作
  5. 循环回到第 1 步



**第三步：结果验证**

Claude 分析最终状态并确定测试是否通过或失败，提供关于测试内容和结果的详细信息。

## **五、技术实现**

### 5.1 核心组件

TestOrchestrator：主控制器，管理测试执行流程，协调 Claude 和设备自动化层之间的交互，跟踪测试进度。

BedrockClient：处理与 Amazon Bedrock 的通信，管理与 Claude 的对话历史，处理工具调用。

DeviceClient：抽象设备操作（截图、点击、输入、滑动），通过统一接口支持各种设备类型。

工具定义：定义 Claude 可以使用的工具：

  * execute_device_action：在设备上执行操作
  * analyze_screenshot：分析当前屏幕状态
  * assert_condition：验证预期条件



### 5.2 代码示例：系统初始化

以下是如何设置测试编排系统的方式：
    
    
    from orchestrator import TestOrchestrator
    from bedrock_client import BedrockClient
    from device_client import DeviceClient
    from config import BedrockConfig, DeviceConfig
    
    # 初始化 Bedrock 客户端用于 Claude
    bedrock = BedrockClient(BedrockConfig(
        region="us-west-2",
        model_id="anthropic.claude-sonnet-4-5-20250929-v1:0"
    ))
    
    # 初始化设备客户端用于自动化
    device = DeviceClient(DeviceConfig(
        device_type="android",  # 或 "ios"、"desktop"
        appium_url="http://localhost:4723"
    ))
    
    # 创建编排器
    orchestrator = TestOrchestrator(bedrock, device)
    
    # 运行测试
    result = orchestrator.run_test(
        "测试登录流程，使用无效凭证"
    )
    
    print(f"测试 {'通过' if result.success else '失败'}")
    print(f"耗时：{result.duration:.2f} 秒")
    print(f"执行步骤数：{result.steps_executed}")

### 5.3 代码示例：设备操作工具定义

Claude 需要知道有哪些工具可用。以下是如何定义设备操作工具的方式：
    
    
    DEVICE_ACTION_TOOL = {
        "name": "execute_device_action",
        "description": "在设备上执行操作（点击、输入、滑动等）",
        "input_schema": {
            "type": "object",
            "properties": {
                "action": {
                    "type": "string",
                    "enum": ["tap", "type", "swipe", "back", "home", "screenshot"],
                    "description": "要执行的操作"
                },
                "parameters": {
                    "type": "object",
                    "description": "特定于操作的参数（例如点击的坐标、输入的文本）"
                }
            },
            "required": ["action", "parameters"]
        }
    }

### 5.4 代码示例：处理 Claude 的决策

当 Claude 决定执行一个操作时，系统需要执行它：
    
    
    def handle_tool_call(self, tool_name: str, tool_input: dict) -> str:
        """处理 Claude 的工具调用"""
        
        if tool_name == "execute_device_action":
            action = tool_input.get("action")
            params = tool_input.get("parameters", {})
            
            if action == "tap":
                x, y = params.get("x"), params.get("y")
                self.device.tap(x, y)
                return f"在 ({x}, {y}) 处点击"
                
            elif action == "type":
                text = params.get("text")
                self.device.type_text(text)
                return f"输入文本：{text}"
                
            elif action == "screenshot":
                screenshot = self.device.take_screenshot()
                return f"截图已捕获：{len(screenshot)} 字节"
                
        elif tool_name == "analyze_screenshot":
            question = tool_input.get("question")
            screenshot = self.device.take_screenshot()
            # 将截图发送给 Claude 进行分析
            analysis = self.bedrock.analyze_image(screenshot, question)
            return analysis

## **六、真实场景：测试游戏登录流程**

让我们通过一个具体例子来演示：测试游戏的登录流程，使用无效凭证。

**用户输入**
    
    
    "测试登录流程。首先，尝试使用无效凭证登录
    （用户名：'testuser'，密码：'wrongpass'）。验证错误消息出现。
    然后，使用有效凭证登录（用户名：'testuser'，密码：'correctpass'）
    并验证主游戏屏幕出现。"

**发生的过程**

  1. Claude 分析请求并创建计划： 
     * 截图查看当前状态
     * 定位登录按钮并点击
     * 输入无效凭证
     * 验证错误消息
     * 清除字段并输入有效凭证
     * 验证成功登录
  2. 第一次迭代：Claude 看到游戏主屏幕，决定点击登录按钮
  3. 第二次迭代：Claude 看到登录表单，决定输入用户名
  4. 第三次迭代：Claude 输入密码
  5. 第四次迭代：Claude 点击登录按钮
  6. 第五次迭代：Claude 看到错误消息并验证它符合预期
  7. 第六次迭代：Claude 清除字段并输入有效凭证
  8. 第七次迭代：Claude 再次点击登录
  9. 最后迭代：Claude 看到主游戏屏幕并确认测试通过



结果：整个测试自动完成，包含每个步骤的详细日志、显示 Claude 在每个决策点看到的内容的截图，以及指示成功或失败的最终报告。

## **七、部署选项**

### 7.1 选项 1：本地开发

对于开发和测试，在本地运行所有内容：

  * 通过 Amazon Bedrock 使用 Claude（需要 AWS 凭证）
  * 通过本地 Appium 服务器进行设备自动化
  * 非常适合在部署前测试你的测试场景



### 7.2 选项 2：使用 AWS Device Farm 进行云端测试

对于生产环境中的真实设备测试：

  * 使用 AWS Device Farm 访问真实的 Android 和 iOS 设备
  * 在 [Amazon ECS](<https://aws.amazon.com/cn/ecs/>) on Fargate 中运行编排系统
  * 自动捕获截图、视频和日志
  * 扩展到多个设备和并行测试执行


    
    
    ┌──────────────────────────────────────────────────────────┐
    │         Amazon ECS 任务（Fargate）                        │
    │  • 运行测试编排逻辑                                       │
    │  • 调用 Amazon Bedrock 获取 Claude                          │
    │  • 通过 Appium 连接到 AWS Device Farm                    │
    │  • 将结果存储到 Amazon S3                                │
    └──────────────────────────────────────────────────────────┘
                             │
                             ▼
    ┌──────────────────────────────────────────────────────────┐
    │         AWS Device Farm                                  │
    │  • 管理真实设备群                                         │
    │  • 提供 Appium 端点                                       │
    │  • 捕获视频和日志                                         │
    │  • 处理设备清理                                           │
    └──────────────────────────────────────────────────────────┘

## **八、关键优势**

### 8.1 缩短 QA 时间

  * 原本需要 3 天的手动测试现在可以在几小时内完成
  * 在多个设备上并行执行
  * 全天候自动化测试，无需人工干预



### 8.2 提高测试覆盖率

  * 测试可以用自然语言编写，更容易创建全面的测试场景
  * 更容易测试边界情况和错误条件
  * 降低非技术团队成员的参与门槛



### 8.3 更好地适应 UI 变化

  * 与传统 UI 自动化不同（选择器改变时会中断），Claude 理解 UI 元素的语义含义
  * 测试对 UI 微小变化的抵抗力更强
  * 减少维护负担



### 8.4 详细的报告

  * 每个测试执行都记录了每个决策点的截图
  * 易于理解测试失败的原因
  * 对调试和改进游戏很有价值



### 8.5 成本效益

  * 减少对专职 QA 人员的需求
  * 利用按需扩展的云资源
  * 只为实际使用的测试付费



## **九、最佳实践**

### 9.1 编写清晰的测试描述

Claude 在清晰、具体的测试描述下效果最好：

好的做法：”测试购买流程：点击商店按钮，选择 4.99 美元的套餐，点击购买，验证购买确认出现”

不好的做法：”测试购物”

### 9.2 分解复杂测试

对于复杂场景，将其分解为多个较小的测试：

不要这样做：”测试整个游戏进度，从第 1 级到第 10 级”

应该这样做

  * “测试第 1 级完成”
  * “测试第 2 级完成”
  * “测试从第 1 级到第 2 级的进度”



### 9.3 包含验证步骤

始终指定成功是什么样的：

好的做法：”点击设置按钮并验证设置屏幕出现，包含’声音’、’图形’和’语言’选项”

不好的做法：”点击设置按钮”

### 9.4 测试错误条件

不仅要测试成功路径：

包含以下测试

  * 无效输入
  * 网络错误
  * 缺少权限
  * 边界情况



## **十、克服常见挑战**

### 10.1 挑战 1：处理动态内容

游戏通常有动态内容（随机奖励、基于时间的事件等）。Claude 可以通过以下方式处理：

  * 验证内容出现，而不是特定值
  * 使用灵活的断言（”验证奖励已授予”而不是”验证获得 100 金币”）



### 10.2 挑战 2：时序问题

某些操作需要时间才能完成。系统通过以下方式处理：

  * 实现智能等待，检查预期状态变化
  * 如果操作失败则重试
  * 为不同操作配置超时



### 10.3 挑战 3：设备状态管理

测试需要从已知状态开始。系统通过以下方式处理：

  * 在测试之间清除应用数据
  * 重置为默认用户账户
  * 使用 AWS Device Farm 的自动清理



## **十一、衡量成功**

跟踪这些指标来了解影响：

  * QA 时间缩短：比较手动测试时间与自动化测试时间
  * 测试覆盖率：覆盖的测试场景数量
  * Bug 检测：自动化测试发现的 bug 与手动测试的对比
  * 发布频率：能多频繁地发布新版本
  * 单位成本：运行自动化测试的成本与手动测试的对比



## **十二、快速开始**

要实现此解决方案：

  * 设置 Amazon Bedrock 访问- 确保你的 AWS 账户已开通 Amazon Bedrock 中的 Claude 模型访问权限
  * 选择设备平台- Android、iOS 或两者
  * 设置设备自动化- 安装 Appium 并为你的设备配置
  * 定义测试场景- 从关键用户流程开始
  * 运行第一个测试- 执行一个简单的测试来验证设置
  * 迭代和扩展- 添加更多测试并完善你的测试描述



## **十三、总结**

AI 驱动的智能与可靠的设备自动化相结合，为游戏 QA 创造了强大的解决方案。通过自动化测试的重复性方面，同时保持处理复杂场景的灵活性，团队可以大幅缩短 QA 时间并加快发布周期。

关键洞察是测试需要两种能力（理解要测试什么和验证结果）和执行（实际控制设备）。通过分离这些关注点并为每一层使用最佳解决方案，我们创建了一个既强大又易于维护的系统。

对于苦于 QA 瓶颈的游戏工作室，这种方法提供了一条通往更快迭代、更高质量和最终为玩家提供更好游戏的道路。

**下一步行动：**

**相关产品：**

  * [Amazon Bedrock](<https://aws.amazon.com/cn/bedrock/?p=bl_pr_bedrock_l=1>) — 用于构建生成式人工智能应用程序和代理的端到端平台
  * [Amazon ECS](<https://aws.amazon.com/cn/ecs/?p=bl_pr_ecs_l=2>) — 完全托管的容器编排服务
  * [Amazon Fargate](<https://aws.amazon.com/cn/fargate/?p=bl_pr_fargate_l=3>) — 适用于容器的无服务器计算



**相关文章：**

  * [Bedrock Claude + LiteLLM WebSearch Interception 配置指南](<https://aws.amazon.com/cn/blogs/china/bedrock-claude-litellm-websearch/?p=bl_ar_l=1>)
  * [AI Agent 的迁移与现代化 — 使用 Amazon Bedrock AgentCore 将 OpenClaw 从单机改造为多租户 Serverless 架构 第二篇](<https://aws.amazon.com/cn/blogs/china/using-amazon-bedrock-agentcore-openclaw-multi-2/?p=bl_ar_l=2>)



## **十四、了解更多**

  * [Amazon Bedrock 文档](<https://docs.aws.amazon.com/bedrock/>)
  * [AWS Device Farm 文档](<https://docs.aws.amazon.com/devicefarm/>)
  * [Amazon ECS on Fargate](<https://docs.aws.amazon.com/AmazonECS/latest/developerguide/launch_types.html>)
  * [Appium 文档](<https://appium.io/>)



[立即咨询 →](<https://aws.amazon.com/cn/contact-us/idp-ai/>)[ 从 AI 规划到落地实施，我们的专家团队为你全程护航。](<https://aws.amazon.com/cn/contact-us/idp-ai/>)

*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 李佳

亚马逊云科技行业解决方案架构师，致力于游戏产业的技术创新与业务成长。拥有 20 年全栈游戏研发经验，就职与联众、人人网、Hungry Studio 等公司，担任技术总监、游戏制作人、研发中心总监。对产业逻辑与技术深度结合有丰富的成功经验。

### 汪允璋

亚马逊云科技解决方案架构师，目前专注于游戏行业云架构设计与优化，致力于帮助游戏客户应对高并发、全球部署及数据分析等技术挑战。

### 于泽沛

亚马逊云科技解决方案架构师，负责游戏行业客户的云计算解决方案咨询与设计，在 AI/ML、DevOps、游戏行业等领域拥有丰富经验。

### 刘硕

亚马逊云科技客户解决方案经理，在亚马逊云科技主要支持游戏和零售等行业的用户。专注于促进亚马逊云科技用户解决方案落地，提升上云体验，帮助用户实现自身的业务价值。

### 付鹏

亚马逊云科技解决方案架构师，负责基于亚马逊云计算方案架构的咨询和设计，在国内推广亚马逊云平台技术和各种解决方案。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
