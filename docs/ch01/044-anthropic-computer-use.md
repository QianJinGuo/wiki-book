# Anthropic 发布 Computer Use 最佳实践

> 📊 Level ⭐⭐ | 7.2KB

> 作者：AGI Hunt | 来源：AGI Hunt（转发 Anthropic 官方） | 2026-05-14
> 原文：https://claude.com/blog/best-practices-for-computer-and-browser-use-with-claude
Anthropic 最新发布了 Computer Use 开发者最佳实践，核心建议是：**想让 AI agent 点得更准，请先把截图缩小。**
对点击准确率影响最大的优化，就是在发送给 API 之前先把截图降采样。

## 深度分析

### 坐标链路：点击准确率的第一性约束

Computer Use 的准确率问题首先是一条工程链路而非模型能力问题：截图从采集、压缩、API 处理到坐标回映射，任何一环的尺寸失配都会让「点得准」变成「点得偏」。关键事实是，Claude 4.6 系列的图片上限为长边 1568px、总像素约 1.15MP，Opus 4.7 则放宽到长边 2576px、约 3.75MP；超限时 API 自动缩小图片，但返回坐标基于缩小后尺寸，客户端若不按比例映射回原分辨率，点击必然错位。 推荐起始分辨率 1280×720 正是基于此：约占像素预算 80%、属训练数据常见尺寸、兼容性最好，Opus 4.7 则可直接上 1080p。macOS 的 2x DPI 是链路上最隐蔽的一环：1440p 屏幕默认截出 2880p 图像，静默超过全部上限。另一端是「目标太小」：4K 屏压到 720p 后，16 像素的复选框只剩约 5 像素，此时应开启 zoom、放大 UI 比例或改用键盘导航，而不是指望模型在模糊图上猜坐标。

### 分层算力：消息顺序、模型分工与思考档位

文档在「怎么用模型」上给出了三个正交旋钮。其一是消息构造：文字指令放在截图之前，让模型先建立「要找什么」的目标认知再看图，顺序颠倒会直接降低准确率。其二是模型分工：Sonnet 4.6 点击精度最高且耐图片压缩，适合机械执行；Opus 4.7 推理强、像素预算更大；Haiku 4.5 主打低延迟。更进一步是「指挥官+执行者」的梯度分配——推理模型做战略决策，廉价模型做密集点击；advisor 模式（advisor_20260301 工具类型）把协作压缩进单次请求，大部分 token 按 Sonnet 价格计费，只需每隔约 20 轮提醒模型「还有 advisor 可用」。其三是思考档位：Opus 4.7 在 high 档已接近 max 档的 OSWorld 准确率而 token 消耗只有一半，max 档没有任何准确率收益，纯属浪费。背景参见 [Opus 4.7 发布](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-opus-4-7-launch.md)。

### 防御与上下文：纵深防御和渐进记忆压缩

提示注入防御的三层设计——训练层的强化学习、使用官方 computer_20251124 工具类型时零额外开销自动运行的实时分类器、不可逆操作前暂停请示的 human-in-the-loop——体现的是纵深防御思想：承认任何单一层都可能失效，用互补机制覆盖从模型内化、运行时检测到人工兜底的完整链路。长对话处理是同一思想的另一面：渐进的记忆压缩管线。缓存断点最多 4 个（1 个放系统提示、3 个放最新 tool_result）；滚动缓冲用 [Image omitted] 替换旧截图（keep_n=3、每 25 轮）；再由 LLM 压缩历史并强制保留 8 类信息（用户指令、任务模板、约束规则、已执行操作、错误与修复、进度追踪、当前状态、下一步）；服务端还提供 context_management 配合 compact-2026-01-12 beta 的自动压缩兜底。

### 示范优于指令：教学模式的泛化逻辑

教学模式把「教」从指令改写为示范：用户手动执行一遍，系统录制每步操作并在截图上用蓝圈标注点击位置；回放时 Claude 收到步骤加标注截图。其关键性质是对 UI 变化的鲁棒性——按钮移位后，模型理解的是「要做什么」而不是「点哪里」，因此能在新布局中重新定位目标。三种回放模式（严格、自适应、目标导向）中官方推荐自适应。与指令驱动的本质差异是：指令绑定具体界面状态，示范传递的是目标意图，只有后者具备跨界面泛化的能力。Computer Use 方向的竞争与延伸可参见 Gemini 3.5 Flash Computer Use 与 Codex 控制桌面设备。

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
- Computer Use 45X More Expensive Than Structured Apis
- [Claude Opus 47](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-opus-47.md)
- [Claude Managed Agents Self Hosted Sandbox Mcp Tunnels Enterprise](https://github.com/QianJinGuo/wiki-public/blob/main/entities/claude-managed-agents-self-hosted-sandbox-mcp-tunnels-enterprise.md)
- [Anthropic Claude Code Large Codebase Best Practices 50002A089323](https://github.com/QianJinGuo/wiki-public/blob/main/entities/anthropic-claude-code-large-codebase-best-practices-50002a089323.md)
- [From Prompt To Harness Claude Official](https://github.com/QianJinGuo/wiki-public/blob/main/entities/from-prompt-to-harness-claude-official.md)

→ [原文存档](https://mp.weixin.qq.com/s/yNRNHiu2s8GAUcrAfZZLPA)

---

