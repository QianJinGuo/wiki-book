# AWS re:Invent 2026 Agent 技术要点

## Ch01.949 AWS re:Invent 2026 Agent 技术要点

> 📊 Level ⭐⭐ | 4.1KB | `entities/E9FFy3r5KWA1Ja5pyWBBrg.md`

# E9Ffy3R5Kwa1Ja5Pywbbrg

→ [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/E9FFy3r5KWA1Ja5pyWBBrg.md)

## 深度分析

一、Claude打通Adobe等8大创意软件，三所艺术院校同步试点

Anthropic与Blender、Adobe、Autodesk等合作推出一批MCP连接器，涵盖3D建模、平面设计、音乐制作等创意领域，让Claude直接操作专业创意软件；

Claude可充当创意辅导工具、编写脚本插件、桥接多软件流水线，并推出Claude Design产品用于探索软件设计方向；

Anthropic加入Blender开发基金支持开源，同时与罗德岛设计学院等三所艺术院校合作试点AI创意教育。

### 核心观点

1. com/s/RfuAI1097GHsMyHlEnV9ew

二、英伟达发布全模态Nemotron 3 Nano Omni，吞吐量达同类9倍

英伟达推出多模态推理模型Nemotron 3 Nano Omni，将文本、视觉、语音融合至单一模型，吞吐量达同类开放模型9倍，多项榜单排名前列；

模型采用Mamba与Transformer混合MoE架构，动态激活专家网络，内存和计算效率最高提升4倍，适配边缘部署场景；

模型开源开放商用授权，已被富士康、Palantir等早期采用，英伟达借此完善从硬件到模型的全栈AI布局。
2. com/s/JuYJvpP0Mv5c2OH2XOK-Ag

三、5.
3. 2万星开源Ghostty宣布迁离GitHub，18年老用户含泪告别

HashiCorp联合创始人Mitchell Hashimoto宣布将5.
4. 2万星开源终端项目Ghostty迁离GitHub，核心原因是平台故障频发严重影响日常开发工作；

Mitchell作为GitHub 18年老用户，记录显示近一个月几乎每天都遇到平台故障，写博文时因Actions崩溃已停工两小时；

社区将问题归因于AI自动化泛滥消耗基础设施资源，此事件引发开发者对平台过度追求商业增长而忽视基础体验的广泛反思。
5. com/s/wqMtvFW0qtsGqplnXSfvDA

四、DeepSeek上线识图模式开启灰测，多模态视觉理解正式落地

DeepSeek上线识图模式并开始灰测，网页版和App均可体验，标志着其多模态视觉理解能力正式落地；

实测显示DeepSeek识图时具备深度推理能力，会主动追问背景、联想隐喻并自我纠正，思考过程类似人类认知习惯；

常规图片识别准确率较高，但数手指等极限测试仍有失误，且暂不支持联网搜索和HEIF格式文件。

### 技术要点

- **apple架构**: 本文在apple方向提出的设计理念与实现路径
- **工程挑战**: 实际落地中面临的关键问题与应对策略
- **architecture趋势**: 相关技术演进方向与新兴范式

### 关联实体

- [Hermes Agent V014 Architecture Shugex](../ch03/092-hermes-agent.html)
- [Latest Open Artifacts 20 New Orgs New Types Of Models With N](ch01/1032-latest-open-artifacts-20-new-orgs-new-types-of-models.html)
- [腾讯混元新里程碑Hy3 Preview 发布开源Agent 表现全面提升](ch01/114-hy3-preview.html)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏 V2](../ch11/224-openclaw.html)
- [Deepseek V4 Training 58 Page Paper Deep Dive](ch01/294-deepseek-v4.html)
- [Openclaw 完全指南这可能是全网最新最全的系统化教程了32W字建议收藏](../ch11/224-openclaw.html)

## 实践启示

1. **模型选型**: 根据任务复杂度选择合适规模的模型，避免过度配置
2. **评估体系**: 建立多维度的模型评估框架，覆盖准确性、延迟和成本
3. **持续优化**: 通过 RLHF/DPO 等对齐技术持续提升模型表现
4. **成本控制**: 缓存、批处理和模型蒸馏是降低推理成本的关键手段

## 相关实体

- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/tool-use-mcp-patterns.md)

---

