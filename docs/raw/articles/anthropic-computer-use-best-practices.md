---
title: "Anthropic 发布 Computer Use 最佳实践"
sha256: 824205d412892dc01786aadccb3f87de1b69e31799638a1309d1b8e29fe9db81
type: raw
created: 2026-05-14
updated: 2026-05-14
source_url: "https://mp.weixin.qq.com/s/yNRNHiu2s8GAUcrAfZZLPA"
author: "AGI Hunt"
source_name: "AGI Hunt（转发 Anthropic 官方）"
source_published: "2026-05-14"
review_value: 7
review_confidence: 8
review_recommendation: neutral
ingested: 2026-05-16
review_stars: 4
tags: [computer-use, anthropic, claude, agent, best-practices]
---
# Anthropic 发布 Computer Use 最佳实践
> 作者：AGI Hunt | 来源：AGI Hunt（转发 Anthropic 官方） | 2026-05-14
> 原文：https://claude.com/blog/best-practices-for-computer-and-browser-use-with-claude
## 核心结论
Anthropic 最新发布了 Computer Use 开发者最佳实践，核心建议是：**想让 AI agent 点得更准，请先把截图缩小。**
## 01 缩小截图
对点击准确率影响最大的优化，就是在发送给 API 之前先把截图降采样。
Claude API 图片分辨率上限：
- Claude 4.6 系列：长边 1568px、总像素 1.15MP
- Opus 4.7：长边 2576px、总像素 3.75MP
如果超过限制，API 自动缩小图片，但返回坐标基于缩小后尺寸，客户端用原始分辨率执行 → 坐标错位，点击必不准。
**推荐起始分辨率：1280×720**（约 80% 像素预算，训练数据常见尺寸，兼容性最好）；Opus 4.7 可直接上 1080p。
**坐标要缩放回去**：
```python
scale_x = screen_w / display_w
scale_y = screen_h / display_h
screen_x = int(api_returned_x * scale_x)
screen_y = int(api_returned_y * scale_y)
```
**macOS 坑**：macOS 截图默认 2x DPI，1440p 屏幕实际截图是 2880p，远超 API 上限，必须处理。
## 02 先说再看
消息构造时，把文字指令放在图片前面：
```python
# 推荐：先文字后截图
content = [
    {"type": "text", "text": "点击提交按钮"},
    {"type": "image", ...},
]
```
原理：模型先读到「点击提交按钮」再看截图，知道该找什么。如果先图后文字，准确率下降。
## 03 谁点得准
| 模型 | 特长 | 适用场景 |
|------|------|----------|
| Sonnet 4.6 | 点击精度最高，空间定位准，近距离失误少，耐图片压缩 | 大部分机械执行类任务 |
| Opus 4.7 | 推理能力强 + 点击精度追平 Sonnet，分辨率预算更大 | 既需推理又需精准点击 |
| Haiku 4.5 | 延迟最低 | 速度优先场景 |
**高级模式**：推理模型做「指挥官」，Sonnet/Haiku 执行具体点击。
## 04 目标太小怎么办
4K 屏幕（3840×2160）压缩到 720p 后，16 像素复选框只剩 5 像素。
**三个解法**：
- **开 zoom**：`"enable_zoom": True`
- **把目标放大**：降低 DPI、放大浏览器缩放、调整 UI 比例
- **用键盘替代**：Tab 导航或快捷键
## 05 思考强度
| 模型 | 推荐档位 | 说明 |
|------|----------|------|
| Opus 4.7 | high | OSWorld 准确率接近 max，token 消耗只有 max 的一半 |
| Claude 4.6 | medium | 任务成功率已接近峰值，再加就是花大钱听响 |
| max effort | **不推荐** | 比 high 无准确率提升，只增加 token 成本 |
## 06 提示注入防御（三层）
1. **训练层**：强化学习学会识别和拒绝恶意指令
2. **实时分类器**：使用官方 `computer_20251124` 工具类型时自动运行，零额外延迟和成本
3. **human-in-the-loop**：不可逆操作前让 agent 暂停请用户确认
## 07 长对话处理（三层策略）
1. **缓存断点**：最多 4 个，1 个放系统提示，3 个放最新 tool_result
2. **滚动缓冲**：`[Image omitted]` 替换（keep_n=3, interval=25）
3. **LLM 压缩**：保留 8 类信息（用户指令、任务模板、约束规则、已执行操作、出错及修复记录、进度追踪、当前状态、下一步）
**服务端自动压缩**：`context_management` + `compact-2026-01-12` beta。
## 08 教学模式
别告诉 Claude 怎么做，直接「示范」给它看。
1. 用户先手动执行一遍，系统录制每步操作和截图，截图上用蓝色圆圈标注点击位置
2. 回放时 Claude 收到：操作步骤 + 标注了蓝圈的截图
3. 如果 UI 布局变了、按钮移了位置，Claude 会理解「要做什么」并在当前界面找到对应元素
**三种回放模式**：严格模式 / 自适应模式（推荐）/ 目标导向模式。
## 09 顾问模式
让 Sonnet 先自行执行，在需要战略决策时调用 Opus 4.7 做顾问。配置 `advisor_20260301` 工具类型。整个咨询在一次请求内完成，大部分 token 按 Sonnet 价格走。建议每隔 20 轮提醒「记得你还有 advisor 工具可用」。
---
## 原文链接
https://claude.com/blog/best-practices-for-computer-and-browser-use-with-claude