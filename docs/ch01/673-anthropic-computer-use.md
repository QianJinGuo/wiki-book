# Anthropic 发布 Computer Use 最佳实践

## Ch01.673 Anthropic 发布 Computer Use 最佳实践

> 📊 Level ⭐⭐ | 4.8KB | `entities/anthropic-computer-use-best-practices.md`

# Anthropic 发布 Computer Use 最佳实践
> 作者：AGI Hunt | 来源：AGI Hunt（转发 Anthropic 官方） | 2026-05-14
> 原文：https://claude.com/blog/best-practices-for-computer-and-browser-use-with-claude
Anthropic 最新发布了 Computer Use 开发者最佳实践，核心建议是：**想让 AI agent 点得更准，请先把截图缩小。**
对点击准确率影响最大的优化，就是在发送给 API 之前先把截图降采样。

## 深度分析

Anthropic 发布的这份最佳实践揭示了 Computer Use 技术落地的几个关键工程挑战。

**坐标映射是精确点击的核心问题。** 当截图超过 API 上限被自动压缩时，返回的点击坐标基于压缩后尺寸，但执行时需要映射回原始分辨率。这个缩放比例的计算看似简单，却是导致"点击错位"的根本原因。macOS 的 2x DPI 更是加剧了这一问题——看似正常的屏幕截图实际上可能是原分辨率的 2 倍。

**多模型协作的架构思路值得关注。** 文档推荐的"Opus 做指挥官、Sonnet/Haiku 执行"模式，本质上是一种计算资源的梯度分配策略：推理能力强但成本高的 Opus 处理战略决策，执行密集且容错率高的点击操作交给专用模型。这比单纯用最强模型执行所有操作更具工程性价比。

**提示注入防御的三层设计体现了纵深防御思想。** 训练层的强化学习、实时的分类器、以及 human-in-the-loop，三层机制覆盖了从模型内化能力到运行时检测再到人工确认的完整链路。这种设计承认了没有任何单一防护层是完美的，需要多种机制互补。

**教学模式的核心是示范而非指令。** 与其告诉 Claude 怎么操作，不如让它观察人类操作并从标注中学习。这种从"指令驱动"到"示范驱动"的转变，反映了具身 AI 的一种重要认知：理解目标意图比记忆具体步骤更有泛化能力。

## 实践启示

1. **截图分辨率控制是首要工程任务。** 统一使用 1280×720 作为起始分辨率，Opus 4.7 可考虑 1080p。同时必须实现坐标的完整缩放映射，不能依赖 API 的自动处理。

2. **macOS 环境需要特殊处理。** 在 macOS 上执行截图时，必须检测并处理 2x DPI 问题，考虑提前降采样或使用系统设置获取实际像素尺寸。

3. **优先采用"先文字后截图"的消息顺序。** 这个简单的顺序调整能显著提升点击准确率，因为模型能先建立目标认知再处理视觉信息。

4. **根据任务类型选择模型。** 纯执行类任务用 Sonnet 4.6，既需推理又需精准点击用 Opus 4.7，速度优先用 Haiku 4.5。可考虑 advisor 模式让 Opus 做战略决策。

5. **高难度思考档位慎用。** Opus 的 `high` 档位已接近 OSWorld 准确率峰值，`max` 档位没有额外收益但成本翻倍，应避免使用。

6. **大目标操作时启用 zoom。** 在 4K 等高分屏上操作小控件时，开启 `enable_zoom: True` 或放大目标，避免压缩后细节丢失。

7. **实施三层提示注入防护。** 不要依赖单一防护层，确保模型训练、实时分类、人工确认三种机制同时生效。

8. **复杂长任务考虑教学模式。** 当任务涉及多步骤 UI 操作时，让模型观看人类示范比编写详细指令更有效。

## 相关实体
- [Computer Use 45X More Expensive Than Structured Apis](../ch04-241-computer-use-45x-more-expensive-than-structured-apis/)
- [Claude Opus 47](../ch01-363-claude-opus-4-7-并不是一次全面升级-甚至部分能力大幅衰退-n-n大家应该在合适的场景下选择使用/)
- [Claude Managed Agents Self Hosted Sandbox Mcp Tunnels Enterprise](../ch01-234-claude-managed-agents-新更新-专属云-模式-把agent的手放回企业内部/)
- [Anthropic Claude Code Large Codebase Best Practices 50002A089323](../ch01-255-anthropic-博客-claude-code-大型代码库最佳实践/)
- [From Prompt To Harness Claude Official](../ch01-664-从-prompt-到-harness-claude-官方学习资料/)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/anthropic-computer-use-best-practices.md)

---

