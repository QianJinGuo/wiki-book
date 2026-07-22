---
title: "腾讯混元Hy3正式发布：Agent能力和产品体验跃升"
source_url: "https://mp.weixin.qq.com/s/h06MS8Ps5VvOxLPV3MZPLw"
source: "腾讯技术工程"
author: "腾讯混元"
ingested: 2026-07-06
sha256: b99bf55707fbe3ec8d22338cab6740ea22d874b9699b25c04cd0d7565992e506
---

**核心信息**：腾讯混元 Hy3 正式发布（从 preview 升级至 full release）。MoE 架构 295B/21B 激活参数/256K 上下文，延续 Apache 2.0 开源。在多个产品线取得显著提升，定价进一步降低。

**架构**：MoE，总参 295B，激活 21B，256K 上下文。快慢思考融合模型。

**关键提升数据**：

| 场景 | 指标 | Hy3 preview | Hy3 | 提升 |
|------|------|-------------|-----|------|
| WorkBuddy 办公 Agent | 任务成功率 | 72% | 90% | +18pp |
| WorkBuddy 办公 Agent | 平均耗时 | 基线 | 缩短 34% | — |
| 元宝 Agent | 常识错误率 | 基线 | 下降一半 | -50% |
| 元宝 Agent | 幻觉率 | 基线 | 下降超一半 | -50%+ |
| ima 知识库问答 | 推理质量 | 基线 | 净提升近 19% | +19% |
| ima Agent | 系统稳定性 | — | 95.1% | — |
| Marvis Agent | 任务完成率 | — | 93.7%，较 preview +12.7pp | — |
| Marvis 6 Agent 协作 | 任务派发正确率 | — | 92%，较 preview +13.5pp | — |
| 微信公众号 AI 分身 | 意图识别准确率 | — | 98.94% | — |
| 微信读书 | 标签标注准确率 | — | 较 preview +14.1% | — |
| WeGame《流放之路》 | 多轮推理+工具调度 | — | 92%，幻觉从 4.5%→2.8% | — |
| 内部 270 专家盲测 | 均分（/4） | Hy3: 2.67 vs GLM 5.1: 2.51 | 优于 GLM5.1 | — |

**核心亮点**：
- 从 preview 上线至今，日均 token 消耗量增加 20 倍
- WorkBuddy 自主选择 Hy3 preview 用户数增长 6 倍
- 幻觉率下降超 50%（通过细粒度数据清洗与训练约束）
- Agent 能力跃迁：元宝上线 Agent 功能，可生成 PPT/Word/Excel/PDF/HTML 交付物

**定价与开源**：
- 输入 1元/百万 tokens，输出 4元/百万 tokens，缓存 0.25元/百万 tokens
- Apache 2.0 开源
- HuggingFace、ModelScope、GitCode 同步上线
- 海外平台将陆续接入：OpenRouter、Hermes、Kilo、Cline、OpenClaw、OpenCode、CherryStudio

**已接入产品**：WorkBuddy、CodeBuddy、元宝、Marvis、ima、微信公众号 AI 分身、微信读书、WeGame 游戏助手等。

**发展时间线**：2026年1月底基础设施重建 → 4月23日 Hy3 preview → 7月6日 Hy3 正式版。
