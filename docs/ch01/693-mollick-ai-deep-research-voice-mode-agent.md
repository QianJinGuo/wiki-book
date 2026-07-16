# Mollick 实用 AI 选型指南：模型选择·Deep Research·Voice Mode·Agent 工作流

## Ch01.693 Mollick 实用 AI 选型指南：模型选择·Deep Research·Voice Mode·Agent 工作流

> 📊 Level ⭐⭐ | 6.7KB | `entities/using-ai-right-now-mollick-quick-guide.md`

# Mollick 实用 AI 选型指南：模型选择·Deep Research·Voice Mode·Agent 工作流

> 2026-06-07 引用自 Ethan Mollick《Using AI Right Now: A Quick Guide》，One Useful Thing，2025-06-23。

## 三大系统选哪个

**ChatGPT**（OpenAI）、**Claude**（Anthropic）、**Gemini**（Google）三选一，都提供：高级+快速模型、语音模式、图像/文档处理、代码执行、移动 App、图片/视频生成（Claude 缺）、Deep Research。

免费版获得部分功能，$20/月获得完整功能集。选哪个都不会错，差异在细节。

## 模型分层

每个系统都有三层：
- **快速模型**（Claude Sonnet/GPT-4o/Gemini Flash）：头脑风暴、快速问答
- **强力模型**（Claude Opus/o3/Gemini Pro）：分析/写作/研究/编码等重要任务
- **超强力模型**（o3-pro等）：极难推理，可能需要 20+ 分钟思考

大多数系统默认快速模型节省算力，需手动切换到强力模型做重要工作。

## Deep Research（关键功能）

Deep Research 是被大多数人忽视的核心功能。能生成高质量报告，让律师/会计师/咨询师/市场研究员等专业信息工作者印象深刻。用途：
- 礼品指南（"给一个读过所有哈利波特的 11 岁孩子买什么"）
- 旅行指南（"去威斯康星州旅行，聚焦奶酪和农产品"）
- 法律/医学第二意见（AI 在诊断上表现良好，幻觉率低）

各系统 Deep Research 工具略有不同，Gemini 还能把报告转成信息图/测验/播客。

## Voice Mode

两个最佳实现：Gemini App 和 ChatGPT App/网站。Claude 的语音模式较弱。

Voice Mode 的 killer feature 不是自然对话，而是**共享屏幕/相机**功能。手机指向故障设备、数学问题、食谱、外语标识，AI 实时看到并回应。多模态能力真正未来感，但大多数人只用 Voice Mode 当 Siri。

## 制作输出：图片/视频/代码/文档

- **图片**：ChatGPT（最可控）> Gemini（Imagen + 多模态）
- **视频**：Gemini Veo 3 令人印象深刻，每天有几次免费使用
- **文档/分析/游戏/模拟**：使用 Canvas 选项让 Gemini/ChatGPT 运行代码，Claude 自己就能做

## Prompting 已死？

最新模型通常不需要复杂提示就能理解你的意图。研究表明**对 AI 礼貌对输出质量影响不大**。直接会话式提问即可。

但构建供他人重复使用的 prompt 仍需要真实技能。

## 相关实体
- [Opinionated Guide Ai Right Now Mollick](../ch05/086-ai.html)
- [Three Years Gpt3 Gemini3 Mollick](https://github.com/QianJinGuo/wiki/blob/main/entities/three-years-gpt3-gemini3-mollick.md)
- [Guide Ai Agents Models Apps Harnesses Mollick](../ch04/552-ai-agent.html)
- [Miroflow Deep Research Agent Harness Mirothinker](../ch05/039-agent-harness.html)
- [Meta Muse Spark Voice Mode Meta Glasses](https://github.com/QianJinGuo/wiki/blob/main/entities/meta-muse-spark-voice-mode-meta-glasses.md)

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/using-ai-right-now-a-quick-guide.md)

## 深度分析

### 1. 从「选模型」到「选系统」的范式转移

AI 选择核心从「哪个模型最强」转向「哪个系统生态最完整」。三系统功能集趋同，竞争维度从技术参数转向工作流集成度，选择实质上由用户已有生态偏好决定。

### 2. $20 月费作为专业功能分水岭

免费版是演示而非工具。$20/月解锁完整功能集，但真正的认知门槛是用户未意识到免费版是阉割版——部署免费账号的组织无法真实评估 AI 对业务的影响。

### 3. Deep Research 与 Voice Mode 相机共享的认知摩擦

两者被低估根源相同：用户心智模型（问-答、Siri）阻止其形成尚未体验过的需求意识。Gemini 将报告转为信息图/播客，实质是用消费形态降低认知门槛。

### 4. Prompt Engineering 的适用边界

复杂提示技巧对一次性会话边际效益大幅下降，但可复用 prompt 开发仍是核心技能——Wharton AI Lab 研究区分了临时使用与系统化使用两类需求。

## 实践启示

### 1. 订阅 $20 并默认使用强力模型

将检查模型选择器作为每次任务的第一个动作，固化为工作流标准节点——就像发邮件前检查收件人。

### 2. 用 Deep Research 做一次真实研究任务

选一个用 Google+阅读+整理处理的信息需求，用 Deep Research 完成并用专业知识评估输出质量。

### 3. 用 Voice Mode 相机替代截图流程

拍一道不确定的食谱、陌生工具、外文标识或数学题，将「截图→切换→粘贴」简化为「手机直接指向问题」。

### 4. 用 Canvas 模式完成完整交付物

用 AI 处理合同草稿、数据可视化、报告分析等完整输出任务，而非仅用于快速问答——这才是理解 AI 能力边界的真正方式。

### 5. 为高频重复任务建立标准化 AI 辅助 SOP

识别每周超过 3 次的信息处理任务，为每个任务编写含背景、输出格式、组织约束的标准化 prompt。好的 SOP 可将 2 小时手动工作压缩到 20 分钟。

---

