---
source: rss
source_url: https://aws.amazon.com/cn/blogs/china/sagemaker-ai-deploy-chronos-bolt-implement-prediction
ingested: 2026-07-24
feed_name: AWS China Blog
source_published: 2026-07-24
sha256: 82a4841238009873a6fd174b8247378147ebdec9cac30f1bac170d8841ce1330
---

# 基于 Amazon SageMaker AI 部署 Chronos-Bolt 实现零样本时序预测

摘要：时间序列预测在零售库存管理、能源负荷调度、金融风险评估、运维容量规划等场景中扮演着关键角色。传统方案如 DeepAR 等深度学习模型精度较高，但面临训练周期长、数据需求大、维护成本高等挑战。亚马逊云科技推出了 Chronos 系列时序预测基础模型，包括 Chronos-Bolt 和 Chronos-2。Chronos-Bolt 于 2024 年底推出，是一款基于 T5 Transformer 架构的预训练时序预测基础模型，在近 1000 亿条时序观测数据上完成预训练，支持零样本（zero-shot）预测，无需额外训练即可在新数据集上生成高质量预测结果。Chronos-2 是 2025 年底推出的，进一步支持多变量预测、协变量和更长上下文（8192 步）等。本文基于客户运维场景简化训练推理流程、面向纯单变量、短期预测、追求推理延迟的需求场景，选择 Chronos-Bolt 作为演示，将介绍 Chronos-Bolt 的核心技术原理、适用场景，并通过一个完整 POC 演示如何在 Amazon SageMaker AI JumpStart 上快速完成部署与推理。若业务涉及多变量、协变量融合或长期预测（>64步），建议评估 Chronos-2。  
  
**目录**

01 一、时序预测的背景与挑战

02 二、Chronos-Bolt 技术原理

03 三、预测模式：确定性预测与概率预测

04 四、适用场景与模型选型

05 五、实践：通过 SageMaker AI JumpStart 部署 Chronos-Bolt

06 六、成本分析

07 七、进阶能力

08 八、总结与建议

09 九、参考资源

* * *

## **一、时序预测的背景与挑战**

时间序列预测长期以来依赖两类方法：统计模型（如 ETS、ARIMA）和深度学习模型（如 DeepAR、PatchTST）。统计模型在数据有限时仍是强基线，但无法跨多个序列共享知识；深度学习模型虽然可以在多条时序上联合训练，但存在以下痛点：

  * 训练数据量要求高：DeepAR 通常需要 300 个以上时间点、10 条以上相关时序
  * 训练周期长：ml.c5.2xlarge 上一次训练通常需要 1-4 小时
  * 持续维护成本：数据分布漂移时需要定期重训练，模型版本管理复杂
  * 快速验证困难：从数据准备到模型上线的周期往往以天计



基础模型（Foundation Model）的思路将”跨数据集预训练”推向极致：在海量跨领域时序数据上预训练一个通用模型，使其具备零样本泛化能力，将预测问题从”先训练再推理”简化为”直接推理”。Chronos-Bolt 正是这一思路的高效实现。

## **二、Chronos-Bolt 技术原理**

Chronos-Bolt 是 亚马逊云科技 于 2024 年 11 月发布的时序预测基础模型，是 Chronos 系列的重大升级。

### 2.1 核心架构：从自回归到直接多步预测

Chronos-Bolt 的核心创新在于将时序预测的生成方式从自回归（Autoregressive）改为直接多步预测（Direct Multi-Step Forecasting）：

  * 基于 T5 编码器-解码器（Encoder-Decoder）架构
  * 编码器：将历史时序通过 Patch（分块）机制压缩为向量表示，每个 Patch 包含多个时间步
  * 解码器：直接并行生成未来多步的分位数预测，无需逐步生成
  * 训练数据：近 1000 亿条真实与合成时序观测，覆盖零售、能源、交通、金融等多个领域



与原始 Chronos 的关键区别在于：原始版本采用自回归方式逐步生成预测值（类似 GPT 生成文本），每生成一步需等待上一步结果；而 Bolt 版本通过 Patch + 直接多步解码，一次性输出整个预测区间。这解释了其 250 倍的速度优势 —— 原始 Chronos 需要逐步解码 H 次前向传播（H 为预测步数），而 Bolt 通过单次前向传播直接输出整个预测区间，消除了自回归解码的串行依赖。

### 2.2 准确性保障机制

Chronos-Bolt 能够在零样本条件下实现高精度预测，依赖以下技术手段：

大规模多领域预训练：模型在涵盖不同频率（分钟、小时、天、周）、不同领域、不同序列长度的近千亿条观测上训练，学习到了通用的时序模式（趋势、季节性、周期性、突变等）。

分位数损失函数：训练时使用多分位数（quantile）损失函数，使模型不仅学习点预测，还学习预测的不确定性分布，提供更稳健的概率预测。

数据增强：训练过程中采用合成时序数据增强（Synthetic Data Augmentation），扩展了模型对罕见模式的覆盖。

基准验证：在 27 个公开基准数据集上，Chronos-Bolt Base（205M）的预测精度超越了需要训练的传统深度学习模型（如 DeepAR、PatchTST），也超越了原始 Chronos Large（710M）。

### 2.3 关键性能指标

指标 | Chronos (原始) | Chronos-Bolt  
---|---|---  
推理速度 | 基线 | 提升 250 倍  
内存效率 | 基线 | 节省 20 倍  
预测精度 (WQL) | 基线 | 误差降低 5%  
模型尺寸 | Large: 710M | Base: 205M  
是否需要训练 | 否（零样本） | 否（零样本）  
CPU 推理支持 | 仅小模型 | 全部 4 个尺寸均支持  
  
### 2.4 模型规格

版本 | 参数量 | 推荐场景 | 运行环境  
---|---|---|---  
Tiny | 9M | 边缘设备 / 嵌入式 | CPU  
Mini | 21M | 轻量级服务 | CPU  
Small | 48M | 通用预测 / 微调 | CPU / GPU  
Base | 205M | 最高精度 | CPU / GPU  
  
## **三、预测模式：确定性预测与概率预测**

Chronos-Bolt 同时支持确定性预测（点预测）和概率预测（分位数预测）两种模式，可根据业务需求灵活选择。

### 3.1 确定性预测（点预测）

仅返回均值预测结果，适合对响应速度要求高、决策确定性强的场景：
    
    
    payload = {
        "inputs": [{"target": [100, 102, 105, ...]}],
        "parameters": {"prediction_length": 12}
    }
    # 返回：{"predictions": [{"mean": [119.99, 121.96, ...]}]}
    

  * 计算量小，响应速度快
  * 适合实时决策、简单趋势预测



### 3.2 概率预测（分位数预测）

返回多个分位数（如 P10、P50、P90），构成置信区间，适合需要量化不确定性的场景。Chronos-Bolt 通过解码器直接并行输出分位数预测，无需像原始 Chronos 那样多次采样，因此概率预测的计算开销极低。通过 quantile_levels 参数指定所需分位数：
    
    
    payload = {
        "inputs": [{"target": [100, 102, 105, ...]}],
        "parameters": {
            "prediction_length": 12,
            "quantile_levels": [0.1, 0.5, 0.9]
        }
    }
    # 返回：{"predictions": [{"mean": [119.99, ...], "0.1": [115.2, ...], "0.5": [119.8, ...], "0.9": [124.6, ...]}]}
    

  * P10/P90 构成 80% 置信区间，量化预测不确定性
  * 适合库存安全水位计算、容量规划（按悲观/乐观场景决策）
  * 计算量略大但更具业务价值



### 3.3 批量预测

Chronos-Bolt 原生支持批量预测，一次请求中可传入多条时序，适合大规模业务场景（如同时预测数千个 SKU 的销量）：
    
    
    payload = {
        "inputs": [
            {"target": series_1.tolist()},
            {"target": series_2.tolist()},
            {"target": series_3.tolist()}
        ],
        "parameters": {"prediction_length": 24}
    }
    

批量预测充分利用了模型的并行计算能力，相比逐条调用可显著降低整体延迟和 API 调用次数。对于超大规模预测任务（万级时序），还可配合 SageMaker AI Batch Transform 进行离线批量处理。

## **四、适用场景与模型选型**

### 4.1 Chronos-Bolt 优势场景

  * 快速 POC / 原型验证：无需训练，分钟级获得预测基线
  * 冷启动场景：新业务、新产品上线初期历史数据不足（< 500 个数据点）
  * 多品类批量预测：电商 SKU、IoT 传感器指标、云资源监控
  * 标准时序模式：具有典型趋势 + 季节性特征的序列
  * 成本敏感场景：省去训练费用，仅需推理运行成本
  * 临时性预测需求：一次性分析或探索性预测



### 4.2 与 DeepAR 的选型对比

维度 | DeepAR | Chronos-Bolt  
---|---|---  
模型类型 | RNN（循环神经网络） | Transformer（T5 优化版）  
训练方式 | 需自定义训练（1-4 小时） | 预训练，仅推理  
数据要求 | >300 时间点 + 训练集 | 仅需历史数值序列  
外部特征 | 支持（促销、节假日等） | 纯单变量（可通过 AutoGluon 扩展）  
部署时间 | 训练 + 部署（小时级） | 直接部署（5-10 分钟）  
推理延迟 | ~200ms | ~150ms（文中特定场景测试数据，仅供参考）  
适应性 | 可学习新模式（重训练） | 泛化能力强但模式固定  
推荐策略 | 长期生产、高精度需求 | 快速验证、基线对比、批量预测  
  
建议的最佳实践是”先 Bolt 后 DeepAR”：先使用 Chronos-Bolt 快速建立预测基线，评估业务需求，再决定是否投入 DeepAR 训练以追求更高精度。

此外，若业务涉及多变量预测、协变量融合或长期预测（>64步），也可评估 Chronos-2，其原生支持多变量和跨序列学习。

## **五、实践：通过 SageMaker AI JumpStart 部署 Chronos-Bolt**

### 5.1 前置条件

  * 已开通 [Amazon SageMaker](<https://aws.amazon.com/cn/sagemaker/>) AI 服务的 亚马逊云科技 账号
  * SageMaker AI Studio 或具有 SageMaker AI 权限的 IAM 角色
  * 推荐实例：ml.m5.xlarge（CPU 推理即可满足 Base 模型）



### 5.2 步骤一：通过 JumpStart 部署模型

在 SageMaker AI Console 的 JumpStart 模型库中搜索 “Chronos-Bolt”，选择 AutoGluon Forecasting Chronos-Bolt Base，配置以下参数后点击 Deploy：

  * Instance type：ml.m5.xlarge
  * Instance count：1



部署过程约需 5-10 分钟，状态变为 InService 即完成。也可通过 SDK 方式部署：

# 环境要求：

# – sagemaker Python SDK >= 2.232.0（pip install -U sagemaker）

# – Python >= 3.9

# 注：SageMaker Python SDK v3.x API 有变化，本文示例基于 v2.x
    
    
    from sagemaker.jumpstart.model import JumpStartModel
    model = JumpStartModel(model_id="autogluon-forecasting-chronos-bolt-base")
    predictor = model.deploy(
        initial_instance_count=1,
        instance_type="ml.m5.xlarge"
    )
    

[](<https://d2908q01vomqb2.cloudfront.net/472b07b9fcf2c2451e8781e944bf5f77cd8457c8/2026/07/24/sagemaker-ai-deploy-chronos-bolt-implement-prediction-1.png>) [图 1：SageMaker AI JumpStart 部署 Chronos-Bolt 界面]  
---  
  
### 5.3 步骤二：准备时序数据

Chronos-Bolt 的输入格式极为简洁 —— 仅需一个数值数组作为历史序列，无需时间戳、无需特征工程。模型会自动识别数据中的趋势、季节性和周期性。对于缺失值，使用 NaN 标记即可，模型会自动处理。
    
    
    import pandas as pd, numpy as np
    # 示例：生成带趋势+季节性的测试数据
    timestamps = pd.date_range("2024-01-01", periods=100, freq="h")
    trend = np.linspace(100, 120, 100)
    seasonal = 15 * np.sin(np.linspace(0, 4*np.pi, 100))
    values = trend + seasonal + np.random.normal(0, 3, 100)
    

### 5.4 步骤三：调用端点执行推理
    
    
    import boto3, json
    runtime = boto3.client("sagemaker-runtime", region_name="your-region-name")
    payload = {
        "inputs": [{"target": values.tolist()}],
        "parameters": {"prediction_length": 24}
    }
    response = runtime.invoke_endpoint(
        EndpointName="your-endpoint-name",
        ContentType="application/json",
        Body=json.dumps(payload)
    )
    result = json.loads(response["Body"].read().decode())
    

返回结果中包含 mean（均值预测）和 quantiles（分位数预测），可直接用于业务决策或可视化。

### 5.5 清理资源

测试完成后应及时删除 Endpoint 以避免持续计费：
    
    
    aws sagemaker delete-endpoint --endpoint-name <your-endpoint-name> --region <your-region-name>
    

## **六、成本分析**

费用项 | DeepAR 方案 | Chronos-Bolt 方案  
---|---|---  
训练成本 | ml.c5.2xlarge × 2h ≈ $0.68/次 | $0（无需训练）  
推理端点 | ml.m5.xlarge ≈ $0.23/小时 | ml.m5.xlarge ≈ $0.23/小时  
重训练成本 | 每月 1-2 次 ≈ $1.36/月 | $0  
POC 验证成本 | 训练+推理 ≈ $1-5 | 仅推理 ≈ $0.06（15分钟）  
人力成本 | 数据工程 + 模型调优 | 仅数据接入  
  
对于间歇性预测负载，还可使用 SageMaker AI 的Serverless Inference 实现按调用计费、自动缩容至零，进一步降低成本。

## **七、进阶能力**

除零样本推理外，Chronos-Bolt 通过 AutoGluon-TimeSeries 框架（v1.2+）还支持以下进阶能力，可在 SageMaker AI Notebook 中使用：

模型微调（Fine-Tune）：在特定领域数据上进行轻量微调，通常 10 分钟内即可完成，可显著提升领域内预测精度。

协变量回归（Covariate Regressor）：通过组合表格模型（如 CatBoost）处理外部特征（促销、价格等），再让 Chronos-Bolt 预测残差，实现类似多变量预测的效果。

模型集成（Ensemble）：AutoGluon 可将 Chronos-Bolt 与统计模型、其他深度学习模型进行自动加权集成，兼顾稳健性和精度。

详细用法请参考 亚马逊云科技 官方博客：[Fast and Accurate Zero-Shot Forecasting with Chronos-Bolt and AutoGluon](<https://aws.amazon.com/blogs/machine-learning/fast-and-accurate-zero-shot-forecasting-with-chronos-bolt-and-autogluon/>)

## **八、总结与建议**

Chronos-Bolt 代表了时序预测领域从”训练驱动”向”推理驱动”的范式转变，核心价值总结如下：

  * 零样本预测：基于近千亿条时序数据预训练，开箱即用
  * 极致性能：推理速度提升 250 倍，内存效率提升 20 倍
  * 精度优势：Base 版本在 27 个基准数据集上超越传统需训练的深度学习模型
  * 灵活部署：SageMaker AI JumpStart 一键部署，支持 CPU/GPU，多种模型尺寸可选
  * 概率预测：原生支持分位数输出，量化预测不确定性
  * 批量能力：单请求支持多条时序，适合大规模业务场景



推荐实践路径：

  1. 使用 Chronos-Bolt 快速建立预测基线（分钟级完成）
  2. 评估零样本精度是否满足业务需求
  3. 如需更高精度：通过 AutoGluon 进行微调或协变量回归
  4. 更多需求：引入Chronos-2或 DeepAR 等需训练模型进行对比



**下一步行动：**

**相关产品：**

  * [Amazon SageMaker](<https://aws.amazon.com/cn/sagemaker/?p=bl_pr_sagemaker_l=1>) — 适用于所有数据、分析和 AI 的中心
  * [Amazon IAM](<https://aws.amazon.com/cn/iam/?p=bl_pr_iam_l=2>) — 身份管理和访问权限
  * [Amazon Batch](<https://aws.amazon.com/cn/batch/?p=bl_pr_batch_l=3>) — 完全托管式批处理



**相关文章：**

  * [从自建 Elasticsearch 迁移到 Amazon OpenSearch Service 实践（一）：数据迁移与同步](<https://aws.amazon.com/cn/blogs/china/elasticsearch-migration-amazon-opensearch-service-1/?p=bl_ar_l=1>)
  * [Building an Impregnable Fortress for Digital Assets: How Chaterm Leverages AWS KMS Envelope Encryption to Create a Zero-Trust Security Architecture](<https://aws.amazon.com/cn/blogs/china/chaterm-aws-kms-envelope-encryption-for-zero-trust-security-en/?p=bl_ar_l=2>)
  * [基于 Prowler 与 GenAI 构建金融行业智能合规中枢](<https://aws.amazon.com/cn/blogs/china/based-on-prowler-genai-build-fintech-intelligent-compliance/?p=bl_ar_l=3>)
  * [使用Amazon SageMaker Hyperpod Cluster部署whisper模型](<https://aws.amazon.com/cn/blogs/china/using-amazon-sagemaker-hyperpod-cluster-deploy-whisper-model/?p=bl_ar_l=4>)
  * [基于 Amazon SageMaker HyperPod 的 ComfyUI 部署方案](<https://aws.amazon.com/cn/blogs/china/comfyui-deployment-on-amazon-sagemaker-hyperpod/?p=bl_ar_l=5>)



## **九、参考资源**

  * [Chronos: Learning the Language of Time Series (Paper)](<https://arxiv.org/abs/2403.07815>)
  * [Fast and Accurate Zero-Shot Forecasting with Chronos-Bolt and AutoGluon (亚马逊云科技 Blog)](<https://aws.amazon.com/blogs/machine-learning/fast-and-accurate-zero-shot-forecasting-with-chronos-bolt-and-autogluon/>)
  * [How Deutsche Bahn Redefines Forecasting Using Chronos Models (亚马逊云科技 Blog)](<https://aws.amazon.com/blogs/machine-learning/how-deutsche-bahn-redefines-forecasting-using-chronos-models-now-available-on-amazon-bedrock-marketplace/>)
  * [Chronos-Bolt Models on Hugging Face](<https://huggingface.co/amazon/chronos-bolt-base>)
  * [Amazon SageMaker AI JumpStart](<https://aws.amazon.com/sagemaker/jumpstart/>)
  * [AutoGluon-TimeSeries Documentation](<https://auto.gluon.ai/stable/tutorials/timeseries/>)



*前述特定亚马逊云科技生成式人工智能相关的服务目前在亚马逊云科技海外区域可用。亚马逊云科技中国区域相关云服务由西云数据和光环新网运营，具体信息以中国区域官网为准。

## 本篇作者

### 张瑞焱

亚马逊云科技资深解决方案架构师，具有多年 IT/DevOps/SRE/基础架构等方向从业经历，架构规划设计、团队管理经验丰富。致力于推广高效优雅的云原生体系架构，助力客户业务成功。

### 王文巍

亚马逊云科技资深解决方案架构师，10 多年互联网企业研发、团队管理经验，主要专注于电商、新零售、社交媒体等领域。

### 杨冬冬

亚马逊云科技资深容器解决方案架构师，在云原生领域深耕多年，拥有丰富的行业经验。

### 邢倩

亚马逊云科技资深解决方案架构师，具有丰富的互联网头部企业技术团队管理、产研体系建设实践经验，对于各行业商业、产品、运营、技术架构有综合和深入的理解，擅于将云服务和GenAI能力与客户业务成长深度结合，创造多赢机会。

* * *

## AWS 架构师中心：云端创新的引领者

探索 AWS 架构师中心，获取经实战验证的最佳实践与架构指南，助您高效构建安全、可靠的云上应用 **[](<https://aws.amazon.com/cn/solutions/architect-center/>)**|   
---|---
