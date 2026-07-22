---
title: "对图像内容进行精确分析 — Bedrock 多模态案例实践"
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/image-analytics-case-study-practice/
ingested: 2026-06-01
feed_name: AWS
source_published: 2026-05-28T01:20:51Z
type: article
sha256: e95deb3fd00c5567b84b5b9f07cf4f828291db2e8017e958a8cc5c1ea6c370ee
tags: ['bedrock', 'multimodal', 'vision', 'image-analysis']
---
# 对图像内容进行精确分析案例实践

## 对图像内容进行精确分析案例实践

摘要：某出行企业的租车业务中，结算环境需要获取准确的剩余油量，从而计算差价，进行计费或者退费。这个过程，长期以来是依靠人工进行。人工进行最大的问题并不在于人工查看剩余油量这个过程的复杂度以及人力成本，人工查看需要将数据进行录入，这个过程会阻碍了整个结算环节的自动化，拉长结算环节时长，降低用户体验。 在该案例下，我们分别尝试使用了多模态大模型和传统CV模型，配合使用Amazon Rekogniton 自定义模型，来实现自动化识别油表油量 。

**目录**

01 [一、场景介绍](#section1)

02 [二、问题分析](#section2)

03 [三、方案概况](#section3)

04 [四、总结](#section4)

* * *

## **一、场景介绍**

某出行企业的租车业务中，结算环境需要获取准确的剩余油量，从而计算差价，进行计费或者退费。这个过程，长期以来是依靠人工进行。人工进行最大的问题并不在于人工查看剩余油量这个过程的复杂度以及人力成本，人工查看需要将数据进行录入，这个过程会阻碍了整个结算环节的自动化，拉长结算环节时长，降低用户体验。

在该案例下，我们分别尝试使用了多模态大模型和传统CV模型，配合使用[Amazon Rekognition](https://aws.amazon.com/cn/rekognition/) 自定义模型，来实现自动化识别油表油量 。

## **二、问题分析**

原始照片类似图一，是位于车后舱的摄像头拍摄的车控制台上的照片，照片会包含很多噪音，例如车速表、里程表、转速表等等，并且你会发现，这种类型的油表和温度表十分相似。直接使用分析带有这么多干扰信息的图片，准确度比较低。客户曾经直接使用Qwen系列的VL 模型对这类图片进行微调，效果并不显著，准确率始终在60%~70% 徘徊。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/image-analytics-case-study-practice-1.jpg)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/image-analytics-case-study-practice-1.jpg)

\[图1\]

油表的种类虽然多，部分车型的的油表也非常规，但是还是很多核心特征。对这些这些核心特征进行描述，撰写提示词，使用VL 大模型进行判断，是最直接的想法。但是经过测试下来，这个方式准确率较低，而且提示词在多个大模型之间无法复用。由于VL 大模型找到油表对象就很困难，再去判断油表的当前油量占比，就更复杂了。我们也尝试包括Nova在内的多个VL 大模型进行微调，效果都不理想。这个结论和客户自己的微调结论一致。

因此我们分析，对原始图片去噪是必要的一步。我们理想的去噪方案是能够在整张图片中，找到油表所在的位置区域。然后再使用视觉模型或者多模态大模型对剩余油量进行定量分析。

油量定量分析，有两种思路：

1.  对多模态大模型进行微调，并根据多对象检测模型获取的油表额外信息（指针类还是表格类）构造提示词来估算剩余油量占比
2.  使用纯视觉模型，训练回归模型，计算剩余油量占比

## **三、方案概况**

### 3.1 油表对象检测

**3.1.1 工具介绍**

[Amazon Rekognition](https://aws.amazon.com/cn/rekognition/) 是亚马逊 AWS 提供的一项基于深度学习的图像和视频分析服务，详细介绍请参考[这里](https://aws.amazon.com/cn/rekognition/)，本文不再赘述。这里简单介绍一下它的自定义标签功能。该功能无需机器学习专业知识即可训练自定义图像识别模型。只需上传几百张（甚至更少）标注图像，系统自动完成数据加载、算法选择和模型训练，数小时内生成可用模型。

它内置可视化标注界面非常好用，支持图像级和对象级检测并提供详细性能指标，支持持续迭代优化。核心优势：低门槛、少样本、快速训练、业务定制化。

下图描述了使用Amazon Rekognition 进行构建自定义模型的一般过程。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/image-analytics-case-study-practice-2.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/image-analytics-case-study-practice-2.png)

\[图2\]

由于油表类型较多，在使用Amazon Rekognition 进行油表检测，定位也有两种方案：

1.  训练多对象检测模型
2.  训练单对象检测模型+分类模型

如下图片是我们最终使用最终训练好的多对象检测模型进行推理后的8个典型样例，让大家直观了解一下各种油表的类型：

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/image-analytics-case-study-practice-table-1.jpg)

格子类（弯曲，刻度不统一）

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/image-analytics-case-study-practice-table-2.jpg)

格子类（弯曲，刻度统一）

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/image-analytics-case-study-practice-table-3.jpg)

指针类（标准圆盘，刻度统一，原始图片就比较模糊）

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/image-analytics-case-study-practice-table-4.jpg)

格子类（刻度统一）

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/image-analytics-case-study-practice-table-5.jpg)

指针类（标准圆盘，低油量刻度红色预警）

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/image-analytics-case-study-practice-table-6.jpg)

指针类（半圆形，指针朝下）

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/image-analytics-case-study-practice-table-7.jpg)

指针类（半圆形，指针朝上）

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/image-analytics-case-study-practice-table-8.jpg)

指针类，异性

由于后续需要尝试使用多模态大模型对图片进行油量分析，需要更多的油表信息，这些信息，可以通过多对象检测模型的标签获取，也可以使用单对象检测模型检测完对象，再使用分类模型进一步处理。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/image-analytics-case-study-practice-3.png)](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/27/image-analytics-case-study-practice-3.png)

\[图3\]

我们用来少量图片进行实验，发现训练单对象检测模型+分类模型效果不佳，原因是会出现错误累计，造成误差放大。所以最终我们选择了训练多对象检测模型。

**3.1.2 数据标注的一些技巧**

*   严格的数据清洗规则：删除非目标图片、模糊图片、不完整仪表图片。
*   统一标注标准：以油表为例，总油格数标注为整数，当前油格数仅允许整格和半格（如 3、3.5），杜绝模糊值。
*   样本均衡：覆盖不同仪表子类型、不同读数区间，确保样本分布均衡。

### 3.2 油量分析

前面提到，油量定量判断我们有两种方案：

1.  微调多模态大模型+提示词
2.  微调纯视觉模型

**多模态大模型+提示词**

**纯视觉模型方案**

为了提升识别效果，我们引入了纯视觉模型路线，希望通过更聚集、更适配结构化视觉任务的模型，从根源上提升测量识别的精度与稳定性。经过多轮造型与对比实验，我们最终选定 DINO V3 作为核心 backbone，并采用回归模型直接完成剩余测量占比的定量预测。

1\. 为什么选择 DINO V3

在油表识别这一场景中，图片普遍存在背景复杂、光照不均、角度倾斜、分辨率偏低、油表样式差异大等问题，对模型的特征提取能力、小目标感知能力和泛化性能提出了极高要求。

DINO V3 作为当前主流的自监督视觉预训练模型，在本场景中具备显著优势：

*   极强的泛化能力。依托自监督预训练，DINO V3 可在少量标注数据下，仍能稳定捕捉油表刻度、指针位置、格子填充状态等核心特征，对不同车型、不同样式油表的适配性远优于传统 CNN 与部分轻量视觉模型。
*   对复杂干扰与低质图像鲁棒。原始图片包含仪表盘、车速表、里程表等大量干扰信息，且部分图像模糊、反光严重。DINO V3 对噪声、遮挡、低分辨率的鲁棒性更强，能够有效过滤无关区域，聚焦油表本体。
*   适配细粒度回归任务。油量识别本质是连续数值预测，需要模型对刻度比例、指针偏转角度做精细感知。DINO V3 学习到的特征具备强空间感知与细粒度区分能力，非常适合这类高精度回归任务。
*   工程落地友好。模型结构成熟、推理速度稳定，可与前面的 Amazon Rekognition 油表检测流程无缝衔接，便于整体 pipeline 部署与迭代。

综合以上特性，DINO V3 成为本项目纯视觉油量定量分析的最优选择。

2\. 为什么使用回归模型

油表剩余油量本质是一个0～1 之间的连续数值（油量占比），而非简单的分类标签。因此我们没有采用常规的分类思路，而是直接采用回归模型进行端到端预测，主要原因如下：

*   任务天然是连续数值预测。油量不是 “空 / 半满 / 满” 的离散状态，而是精确到百分比的连续值。分类模型只能输出有限档位，会引入量化误差，无法满足租车结算对精度的要求；回归模型可直接输出 0～1 的浮点数，与业务需求完全对齐。
*   便于精准计算油费差价。租车结算需要根据实际油量差值进行退费或计费，回归输出的连续数值可直接用于差价计算，无需后处理映射，减少误差累积。
*   精度指标可直接衡量业务效果。采用 MAE、MSE、RMSE、R² 等回归指标，能够直观、量化地反映模型预测与真实油量的偏差，直接对应到 “误差几升油” 的业务体验，便于迭代优化。
*   避免多分类带来的标签歧义。若强行划分类别（如 0%、25%、50%、75%、100%），边界样本极易误判；回归模型可平滑输出任意中间值，对过渡区间油量更友好。

因此，回归建模是最贴合油量识别业务本质、精度最高的方案设计。

3\. 纯视觉回归模型的训练过程

整个纯视觉模型训练流程，建立在前面 Amazon Rekognition 油表检测输出的精准 ROI 基础之上，形成 “先定位、后精算” 的两阶段 pipeline：

*   数据预处理。利用已训练完成的 Rekognition 多对象检测模型，从原始仪表盘图片中自动抠取油表 ROI 区域，剔除车速表、转速表、里程表等干扰信息，实现精准去噪，统一输入尺寸。
*   数据标注。对数千张油表 ROI 图片，由人工标注真实油量占比（0～1 连续值），构建高质量回归数据集，覆盖格子类、指针类、标准型、异型、弯曲刻度等全类型油表。
*   模型搭建与预训练加载。基于 DINO V3 构建回归网络，以官方自监督预训练权重初始化，保留其强大视觉特征提取能力，在顶层接入回归头，直接输出油量占比预测值。
*   训练策略与优化。使用适合回归任务的损失函数（如 MSE/Smooth L1），结合自适应学习率优化器，在保证收敛稳定的同时，避免过拟合。训练过程中按油量区间（0～0.25、0.25～0.5、0.5～0.75、0.75～1.0）分层监控精度，确保全区间表现均衡。
*   验证与迭代。采用独立测试集评估模型，以 MAE、RMSE、R² 及不同误差阈值下的准确率为核心指标，持续优化数据分布与训练策略，最终收敛至稳定状态。

4\. 方案取得的效果

经过严格数据清洗后，我们使用 6000 张精准标注的油表图片完成训练与测试，模型在独立测试集上取得了远超多模态大模型微调方案的优异结果：

*   路线 A — VLM 微调路线（195 个评估样本）

方法

总油格数准确率

当前油格数准确率

两者均正确

配置

Qwen3-VL-4B LoRA 微调

90.72%

78.35%

76.29%

修正数据，20 epochs

Qwen3-VL-4B SFT+GRPO

90.72%

79.38%

78.35%

SFT+GRPO 各 20 epochs

*   路线 B — 纯视觉回归路线（6000 张标注数据，独立测试集）：

指标

数值

业务含义

MAE（平均绝对误差）

0.0166

平均偏差约 1.7% 油量

R²（决定系数）

0.9617

预测值与真实值高度拟合

误差 ≤ 0.05 准确率

94.67%

近 95% 样本误差在 5% 以内

误差 ≤ 0.10 准确率

97.87%

超 97% 样本误差在 10% 以内

各油量区间最低准确率

93.62%

全区间（空/低/中/满）均衡稳定

超过 97% 的样本预测误差控制在 10% 以内，完全满足租车行业油量结算的精度标准。

模型在低油量、中油量、高油量全区间均保持高准确率，尤其对中间区间油量识别最为稳定，有效解决了人工录入慢、易出错、无法自动化的痛点。

## **四、总结**

在油表识别这一场景中，图片普遍存在背景复杂、光照不均、角度倾斜、分辨率偏低、油表样式差异大等问题，对模型的特征提取能力、小目标感知能力和泛化性能提出了极高要求。

“Amazon Rekognition 油表检测 + DINO V3 ” 的纯视觉方案，成功将油量识别从人工环节转变为全自动化流程，大幅缩短结算时长、提升用户体验，为租车场景油量结算自动化提供了稳定、可靠、可规模化落地的解决方案。

**➡️ 下一步行动：**

**相关产品：**

*   [Amazon Rekognition](https://aws.amazon.com/cn/rekognition/?p=bl_pr_rekognition_l=1) — 图像和视频分析
*   [Amazon Nova](https://aws.amazon.com/cn/ai/generative-ai/nova/?p=bl_pr_nova_l=2) — 提供前沿智能和最高性价比的基础模型

**相关文章：**

*   [道通与亚马逊云科技联合推动充电运营全面进入智能化时代](https://aws.amazon.com/cn/blogs/china/autel-and-aws-advance-charging-operations-into-the-intelligent-era/?p=bl_ar_l=1)
*   [Multi-Agent 架构在零售供应链运营中的实践：贯穿数据、洞察与行动](https://aws.amazon.com/cn/blogs/china/multi-agent-architecture-retail-practice/?p=bl_ar_l=2)
*   [不只是 Chatbot：如何设计一个真正可执行的 Agentic Commerce 电商系统](https://aws.amazon.com/cn/blogs/china/beyond-chatbot-how-to-design-a-truly-executable-agentic-commerce-ecommerce-system/?p=bl_ar_l=3)
*   [在 AWS 上实现 DolphinScheduler 工作流的自动化跨环境部署](https://aws.amazon.com/cn/blogs/china/implement-automated-cross-environment-deployment-of-dolphinscheduler-workflows-on-aws/?p=bl_ar_l=4)
*   [快时尚电商行业智能体设计思路与应用实践（七）Amazon Bedrock AgentCore Runtime 深度解析和场景分析](https://aws.amazon.com/cn/blogs/china/amazon-bedrock-agentcore-runtime-deep-dive-and-scenario-analysis/?p=bl_ar_l=5)

\*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

* * *

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/15/summit-tag3.png)

## 亚马逊云科技中国峰会

开发者挑战赛现场开启，基于真实业务场景亲手构建 Agent。

[![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/25/yuyuecanhui.png)](https://aws.amazon.com/cn/events/summits/shanghai/?ectrk=jyLXNovBYB51qgzUEipIpZcxlfE5%2Bs7NfDTnZwR7hFYtQmPUSToTuN%2FZO5doh20ZJ%2FloW6Rom0l3P4LLcoyUPA%3D%3D&sc_icampaign=glb-summit-blog-p2&sc_ichannel=ha&sc_iplace=blog&trk=ab30be54-aedd-480a-9364-ab0bf98e982d)

![](https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/05/14/2026_Summits_Commercial_Banner_1440x657.png)
