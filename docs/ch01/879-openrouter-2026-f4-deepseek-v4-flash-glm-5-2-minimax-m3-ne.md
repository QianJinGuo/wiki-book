# OpenRouter 2026 开源 F4：DeepSeek V4 Flash、GLM 5.2、MiniMax M3、Nemotron 3 Ultra 全景分析

## Ch01.879 OpenRouter 2026 开源 F4：DeepSeek V4 Flash、GLM 5.2、MiniMax M3、Nemotron 3 Ultra 全景分析

> 📊 Level ⭐⭐ | 4.1KB | `entities/openrouter-f4-open-source-models-analysis-2026.md`

# OpenRouter 2026 开源 F4：DeepSeek V4 Flash、GLM 5.2、MiniMax M3、Nemotron 3 Ultra 全景分析

> 来源：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/openrouter-f4-open-source-models-analysis-2026.md)

OpenRouter 于 2026 年 6 月发布了《The Open-Weight Models That Matter》报告，整理出截至 2026 年 6 月最值得关注的 4 个开源模型（"开源 F4"）——DeepSeek V4 Flash、GLM 5.2、MiniMax M3、NVIDIA Nemotron 3 Ultra。

## DeepSeek V4 Flash：性价比之王

DeepSeek V4 Flash 是第一个被开发团队直接塞进智能体工作流的开源模型。2820 亿总参数 / 130 亿激活的 MoE 架构，SWE-bench Verified 得分 79.0%（Pro 版 80.6%）。采用 MIT 协议，支持百万 token 上下文。

- **智力指数**：40（Artificial Analysis）
- **价格**：输入 $0.054/M token，输出 $0.242/M token（含缓存后低至 $0.029/M 输入）
- **速度**：约 84 tokens/秒
- **适用场景**：极致性价比的智能体与代码生成
- **避坑**：写文章与语气把控一般，提示词需非常具体

## GLM 5.2：开源质量铁王座

GLM 5.2 于 2026 年 6 月中旬发布，在 Artificial Analysis 4.1 智力指数拿下 51 分排名开源第一，距离闭源 Claude Fable 5 仅差 5 分。MIT 协议，真实智能体基准测试中与 GPT-5.5 xhigh 打平。

- **智力指数**：51（开源第一）
- **价格**：输入 $0.447/M token，输出 $3.31/M token
- **速度**：约 78 tokens/秒
- **核心优势**：复杂任务规划与超长上下文代码编写
- **避坑**：思考过程消耗大量输出 token，刚发布不久各家托管平台质量参差不齐

## MiniMax M3：多模态长文本专精

MiniMax M3 是 F4 中唯一原生理解文本、图表和视频的模型。智力指数 44（与 DeepSeek V4 Pro 并列），但在真实智能体测试中与 Claude Sonnet 4.6 持平。社区协议（非 MIT），商业使用需署名。

- **智力指数**：44
- **价格**：输入 $0.098/M token，输出 $1.21/M token（超 51 万 token 上浮）
- **核心优势**：多模态理解——屏幕截图、UI 界面、架构图、视频
- **适用场景**：UI 自动化测试、看图写代码、图文文档解析、视频工作流
- **避坑**：话痨型模型，推理过程很长；社区协议非 MIT

## NVIDIA Nemotron 3 Ultra：企业级开源

Nemotron 3 Ultra 是美国本土最能打的开源模型。5500 亿总参数 / 550 亿激活的 Mamba-2 + Transformer 混合 MoE，采用 NVFP4 精度，支持百万 token 上下文和多 token 预测，OpenMDW 协议。

- **智力指数**：48（开源第二）
- **价格**：输入 $0.423/M token，输出 $2.61/M token（有免费测试通道）
- **核心优势**：NVIDIA 软硬件生态支撑，极高部署效率
- **避坑**：纯文本模型，基础智力不如 GLM 5.2，极限代码略逊中国开源头部

## 总体评估

开源与闭源的差距在过去 18 个月中稳定保持在 3 到 6 个月之间。闭源大厂完全没有甩开开源阵营的迹象。随着企业 AI 用量激增，控制成本成为核心诉求，开源模型迎来了真正的高光时刻。

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/openrouter-f4-open-source-models-analysis-2026.md)

---

