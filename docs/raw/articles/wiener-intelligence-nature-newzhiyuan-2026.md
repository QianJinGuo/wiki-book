---
source_url: "https://mp.weixin.qq.com/s/AzFzI0Bf7n1yVdMJYGheCg"
source_title: "DeepSeek之后，中国AI「自己出题」杀进Nature通讯！全球仅4家"
source_author: "新智元"
source_publisher: "新智元"
ingested: 2026-07-08
sha256: "aaa9c9e18b0a88b3fe0ad0ccf8074877141a18d43ccdcf09eeb7cb5af2b96320"
type: raw-source
status: ingested
tags: [wiener-intelligence, reasoning-data-generation, nature-communications, cqra, closed-loop-feedback, causal-anchoring]
---

# DeepSeek之后，中国AI「自己出题」杀进Nature通讯！全球仅4家

> 新智元报道维纳智能（Wiener Intelligence）登上 Nature Communications 的技术路线与商业进展。

## 核心定位

维纳智能（Wiener Intelligence）——成立不到两年的香港 AI 公司，专注于 **高精度推理数据生成**，用闭环反馈驱动专业 Agent 自主演化。2026 年 5 月登上 Nature Communications，成为继 DeepSeek、面壁智能之后中国第三个登上 Nature 主要期刊的大模型技术公司。

## 联合发表论文

论文《Multimodal deep learning model for AI-based functional prognostic risk stratification in patients undergoing radical nephrectomy》，发表于 Nature Communications 2026-05-28。

维纳智能负责 AI 方面，中山大学肿瘤医院等机构负责医学方面。

**RDPM（Rapid GFR Decline Prediction Model）**：
- 优化目标：从"短期术后 eGFR 点估计"提升为"长期肾功能快速衰退风险分层"
- 技术：多模态多头交叉注意力机制，3D 影像和临床变量双流异构信息融合
- 对侧肾脏的皮质和髓质由 UNest 模型自动分割 + 医生审查
- 数据：15 家多中心医疗机构，1621 例患者
- 外部多中心测试 AUC：**0.788～0.873**

## 推理数据生成：cQrA 四元组

> 大模型的高质量学习，不能只有"教科书"式的结构化知识，还必须有"习题集"式的问答推理数据。

cQrA = (context, Question, reasoning, Answer)。大模型既生成提问又生成回答，同时给出思维链。

**习题集的本质**：对抗式、强因果的知识组织形式——以问题驱动思考，以答案形成反馈，以推理强化因果。

## 数据→Token→数据 大闭环

| 方向 | 内容 |
|------|------|
| **数据→Token** | 消耗算力用数据训练大模型并输出 Token 做应用（业界主流） |
| **Token→数据** | 用大模型自动生成专业高精度推理数据（维纳专注） |

**数据即参数**。上下文相关的 Few-shot 来自高精度推理数据生成，包含业务知识和对抗式因果。

## 解决 Agent 三重困局

1. **测不准** → 动态多维测试：持续生成新 cQrA 测时效性+防作弊
2. **优化难** → 闭环反馈优化：测试驱动结构和超参数优化
3. **答不准** → 因果锚定推理：离线生成 cQrA 为在线推理注入逻辑先验

## 落地案例与产品准确率

| 领域 | 产品 | 准确率 |
|------|------|--------|
| 价值观安全 | quewi.ai | 一致性 >99%（主流模型 9-21%） |
| 保险 | insurebot | 复杂问答 >95%（Gemini Search ~59%） |
| 赛马预测 | racebot | 统计问答>94%，Top-3预测>59% |
| 香港政务 | writingbot | 改错 >90% |

技术底座：国产 GPU 沐曦。营收预计超 4 千万港币（2026），仅一轮 5 千万港币种子融资（联想创投领投）。

## 团队

**柳崎峰教授**（创始人）：中科院自动化所博士（师从谭铁牛院士），曾任 HKGAI 总经理、平安加马 AI 研究院院长、Yahoo! Lab / Samsung Lab 研究员。参与建设全球首个千卡 H800 集群，训练中国第三家千亿 MoE 大模型。

**封小韵**（CRO/合伙人）：前思科大中华区副总裁。

**招聘概念**：不是 Software Engineer 或 Harness Engineer，而是 **Frameworker**——"有框架思维之人"，才能驾驭 Agent。
