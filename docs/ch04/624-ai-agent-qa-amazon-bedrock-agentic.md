# 用 AI Agent 加速游戏 QA：基于 Amazon Bedrock 的 Agentic 自动化测试系统

## Ch04.624 用 AI Agent 加速游戏 QA：基于 Amazon Bedrock 的 Agentic 自动化测试系统

> 📊 Level ⭐⭐ | 3.8KB | `entities/ai-agent-game-qa-agentic-testing-bedrock-automation-2026.md`

# 用 AI Agent 加速游戏 QA：基于 Amazon Bedrock 的 Agentic 自动化测试系统

> **Background**：本文基于 AWS China Blog 发布的方案指南，展示如何结合 Amazon Bedrock Claude 和开源设备自动化框架，构建一个 Agentic 自动化测试系统，通过三层架构（智能层 + 辅助模型层 + 执行层）实现自然语言驱动的游戏黑盒测试，大幅缩短游戏版本发布前的测试时间。

## 核心问题：QA 成为游戏开发的瓶颈

游戏测试的核心挑战在于黑盒测试：与传统软件不同，游戏无法利用 API 和埋点进行测试，必须模拟真实用户环境。一个三人 QA 团队手动测试新版本需要长达三天，导致发布周期从每周一次拉长到两周或一个月。随着 AI 加速内容生产，开发速度与 QA 能力之间的差距已成为关键业务问题。

## 解决方案：Agentic 测试编排

核心洞察是 Agentic 测试需要三种不同能力，不应该混在一起：

1. **智能层（Intelligence Layer）**—— Amazon Bedrock Claude，理解要做什么、规划测试步骤、验证结果
2. **辅助模型层（Auxiliary Model Layer）**—— 精确识别和分割 UI 元素，增强视觉感知精度
3. **执行层（Execution Layer）**—— 实际控制设备、执行 UI 操作，通过开源设备自动化框架

通过分离这些关注点，可以为每一层利用最佳的解决方案，而非试图用一个模型解决所有问题。

## 架构与工作流

三层架构形成一个闭环的测试执行循环：

1. Agent 接收自然语言测试描述（如"测试登录流程，使用无效凭证"）
2. 智能层（Claude）理解测试意图，规划测试步骤
3. 辅助模型层（支持多模态的模型）识别当前游戏画面的 UI 元素
4. 执行层（设备自动化框架）执行点击、滑动等操作
5. 执行结果反馈给智能层，Agent 根据反馈决定下一步操作或验证结果

这种循环使系统能够自适应游戏画面的变化，无需为每个版本重新录制测试脚本。

## 与 Bedrock 多模态模型对比测试平台的关系

该方案与 [Bedrock 多模态模型对比测试平台](../ch11/294-amazon-bedrock.html) 互补：前者关注 Agentic 编排架构和端到端自动化测试流程，后者关注模型在 UI 元素定位（bounding box）精度上的量化对比。两者都在 [Amazon Bedrock](../ch11/294-amazon-bedrock.html) 的基础上构建游戏 QA 自动化能力，是同一主题的不同维度。

## 关键优势

- **自然语言驱动**：QA 工程师用自然语言描述测试场景，无需编写复杂测试脚本
- **自适应能力**：系统理解 UI 上下文并适应变化，无需为每个版本重写测试
- **高效扩展**：在云端真实设备上运行测试，无需手动干预
- **智能结果验证**：Claude 可验证测试结果而非仅记录执行日志
- **持续改进**：测试循环中积累的成功/失败案例可用于优化 Agent 行为

→ [原文存档](https://github.com/QianJinGuo/wiki-book/tree/main/docs/raw/articles/ai-agent-game-qa-agentic-testing-bedrock-automation-2026.md)

---

