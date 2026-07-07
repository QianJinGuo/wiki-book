# 腾讯混元 Hy3 正式版：Agent 能力跃升与多产品落地

## Ch01.1110 腾讯混元 Hy3 正式版：Agent 能力跃升与多产品落地

> 📊 Level ⭐⭐ | 2.5KB | `entities/tencent-hunyuan-hy3-full-release.md`

# 腾讯混元 Hy3 正式版：Agent 能力跃升与多产品落地

> **来源**：腾讯技术工程。腾讯混元 Hy3 正式发布（较 4 月 preview 版本），MoE 295B/21B/256K，Apache 2.0 开源，多产品线 Agent 能力显著提升。
> → [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/tencent-hunyuan-hy3-full-release-agent-product-腾讯技术工程.md)

## 架构

MoE，总参 295B，激活 21B，256K 上下文。快慢思考融合模型。

## 关键评测数据

| 产品 | 指标 | Hy3 表现 |
|------|------|---------|
| WorkBuddy Agent | 任务成功率 | **90%**（preview 72%，+18pp） |
| WorkBuddy Agent | 平均耗时 | 缩短 34% |
| 元宝 | Agent 综合 | 综合办公与生活服务 > GLM 5.1 |
| 元宝 | 常识错误率 | 较 preview 下降一半 |
| 元宝 | 幻觉率 | 较 preview 下降超一半 |
| ima Agent | 系统稳定性 | 95.1%，工具编排能力突出 |
| ima 知识库问答 | 推理质量 | 净提升近 19% |
| Marvis Agent | 任务完成率 | 93.7%（+12.7pp） |
| Marvis 6 Agent 协作 | 任务派发正确率 | 92%（+13.5pp） |
| 微信公众号 AI 分身 | 意图识别 | 98.94% |
| 微信读书 | 标签标注准确率 | 较 preview +14.1% |
| WeGame 流放之路 | 工具调度成功率 | 92%，幻觉 4.5%→2.8% |
| 内部 270 专家盲测 | 均分（/4） | Hy3 2.67 > GLM 5.1 2.51 |

## 产品接入

- WorkBuddy / CodeBuddy：Hy3 preview 用户数增长 6 倍，日均 token 消耗量增 20 倍
- 元宝：上线 Agent 功能，可生成 PPT/Word/Excel/PDF/HTML 交付物
- Marvis：文件编辑/生成、文件管理、电脑诊断与操作
- ima：知识库问答 + Agent 场景
- 微信公众号 AI 分身与客服
- 微信读书
- WeGame 游戏助手

## 定价与开源

- 输入 1元/百万 tokens，输出 4元/百万 tokens，缓存 0.25元/百万 tokens
- Apache 2.0 开源
- 平台：HuggingFace、ModelScope、GitCode、OpenRouter、Hermes、Kilo、Cline、OpenClaw、OpenCode、CherryStudio

## 与已有 wiki 实体关系

- 补充 [腾讯混元新里程碑Hy3 Preview 发布开源Agent 表现全面提升](ch01/109-hy3-preview.md)：该实体覆盖 4 月 Hy3 preview 发布，本文覆盖 7 月 Hy3 正式版及多产品落地数据。

---

