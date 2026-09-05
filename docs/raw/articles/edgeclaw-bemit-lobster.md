---
title: EdgeClaw：端云两栖龙虾框架
source_url: https://mp.weixin.qq.com/s/OePG4-a4ebMhElMzCQVizg
publish_date: 2026-04-25
tags: [wechat, article, agent, llm, openclaw]
review_value: 7
review_confidence: 7
review_recommendation: neutral
sha256: f7d1f8b1100ab022f3c8adbd45d6883d23a361e6d32f7eed95c1836021a867ee
---
# EdgeClaw：端云两栖龙虾框架
## 核心定位
面壁智能联合清华大学、OpenBMB社区开源的Agent框架，主打"端云两栖"——兼顾云端模型智商与本地模型忠诚。配套发布EdgeClaw Box硬件产品。
GitHub: https://github.com/Openbmb/edgeclaw
## 市场背景
围绕Claw类产品的两条路线：
- **云端API派**：能力强但数据裸奔 + Token成本无底洞
- **本地模型派**：数据安全但能力受限
第三条路：**端云两栖**，不做二选一。
## 核心架构
### 隐私路由（Privacy Routing）
数据分级处理：
- **S1 公开数据**：直接调用云端最强模型
- **S2 敏感信息**：脱敏处理后上云（如公司名→匿名代号）
- **S3 绝密信息**：强制本地处理，物理隔离
### 本地引擎
内置MiniCPM系列端侧模型：
- 处理S3绝密信息
- 处理文本清洗、信息抽取等高频琐事
- 大量任务零Token消耗
- 断网也能干活
## 商业场景
| 场景 | 云端派痛点 | EdgeClaw方案 | 效果 |
|------|-----------|-------------|------|
| FA投研 | 保密BP数据裸奔 | 本地解析财务+云端行业报告 | 3小时投研备忘录 |
| 冷库盘点 | 信号差变砖头 | 全程离线语音+LLM | 效率提升10倍 |
| 数据质检 | 百万条音频天文账单 | 本地98%+云端2% | 成本降数量级 |
| 财务审计 | 人工查阅海量文档 | 秒级建索引+自然语言关联 | 几天→分钟级 |
## 关键洞察
> 对于OPC群体，他们既需要云端模型的"最强大脑"，也需要本地模型的"绝对忠诚"。在云端与本地之间"二选一"？这本身就是一个伪命题。