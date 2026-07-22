# End-to-end encrypted ML inference with Amazon SageMaker AI and FHE

## Ch11.045 End-to-end encrypted ML inference with Amazon SageMaker AI and FHE

> 📊 Level ⭐⭐ | 13.4KB | `entities/end-to-end-encrypted-ml-inference-sagemaker-fhe.md`

# End-to-end encrypted ML inference with Amazon SageMaker AI and FHE

> **Source archive**: [原文存档](https://github.com/QianJinGuo/wiki/blob/main/raw/articles/end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-a.md)

# End-to-end encrypted ML inference with Amazon SageMaker AI and FHE

Machine learning (ML) inference often requires processing sensitive data—medical records, proprietary business information, or personal communications. What if you could run ML inference in the cloud while hiding your data from the cloud itself? More specifically, what if you could enforce that your data stayed encrypted throughout the entire ML inference process? This post will show you how to use [Amazon SageMaker AI](<https://aws.amazon.com/sagemaker/ai/>) with fully homomorphic encryption (FHE) to perform ML inference. Using FHE, we present an approach to ML inference that’s designed to keep queries, responses, and intermediate values encrypted and unreadable by observers—including SageMaker AI itself.

FHE is a form of encryption that allows encrypted data to be processed in encrypted form without decryption. In the ML inference setting, you can use it to apply a model to an encrypted query without decryption, producing an encrypted prediction. Consider these scenarios where such a capability would provide value:

  * **Healthcare** : A health insurance company wants to provide doctors with an ML model that predicts medical procedure outcomes based on diagnostic data. Publishing the model in the cloud simplifies deployment, but doctors can’t expose patient medical information to third parties due to privacy regulations.
  * **Energy sector** : An oil and gas corporation uses ML to evaluate satellite photos of potential drill sites and select photos for further expert evaluation. They want to host the model in the cloud for cost savings but can’t expose photographs of politically sensitive locations to third parties.
  * **Telecommunications** : A telecom operator wants to process customer emails to detect spam and phishing. They need cloud-based ML for scalability, but data protection regulations require that customer messages remain encrypted at third parties.

This blog has previously discussed FHE for ML inference in the post [Enable fully homomorphic encryption with Amazon SageMaker endpoints for secure, real-time inferencing](<https://aws.amazon.com/blogs/machine-learning/enable-fully-homomorphic-encryption-with-amazon-sagemaker-endpoints-for-secure-real-time-inferencing/>), but this post goes a little further. That previous post showed how to implement FHE-based inference ‘from scratch’ by hand-crafting a linear-regression algorithm using a low-level library called [SEAL](<https://www.microsoft.com/en-us/research/project/microsoft-seal/>). Instead, this post shows a much more flexible and higher-level approach based on [concrete-ml](<https://docs.zama.org/concrete-ml>), a high-level library built specifically for FHE-based inference. It supports several common types of models ‘out of the box’ and is even API compatible with the well-known ML library scikit-learn.

In this post, you will learn how to:

  * Train a concrete-ml model in SageMaker AI using a custom container
  * Deploy that model to a SageMaker AI inference endpoint
  * Create a custom client for concrete-ml inference
  * Use that client to make queries to your inference endpoint

When finished you will have a system that uses concrete-ml in SageMaker AI designed to perform end-to-end encrypted ML inference.

## Solution overview

Using concrete-ml in SageMaker AI works as follows:

  1. The model owner prepares their data for training. Concrete-ml works well when all features have been normalized to the same scale, such as [-1, 1].
  2. The model owner uses this data to train an FHE-enabled version of their model. This model is designed to perform computations over encrypted data instead of plaintext.
  3. The model owner hosts this model in SageMaker AI.
  4. Clients encrypt their queries using the FHE scheme supported by the model.
  5. Clients send encrypted queries to the FHE-enabled model in the cloud.
  6. The model transforms the encrypted query into an encrypted prediction without decrypting values during the FHE computation.
  7. The model returns the encrypted response to the client, who decrypts it to retrieve the prediction.

This differs from, and complements, confidential computing environments like those provided by the Amazon Web Services (AWS) [Nitro System](<https://aws.amazon.com/ec2/nitro/>) in [Amazon Elastic Compute Cloud (Amazon EC2)](<https://aws.amazon.com/ec2/>). With AWS Nitro Enclaves, queries are decrypted and processed in plaintext within hardened, isolated environments that provide CPU and memory isolation. With FHE, queries remain encrypted throughout; security relies on mathematics rather than hardware or software.

## Prerequisites

To implement this solution, you need:

  * A local development environment with [Python](<https://www.python.org/>) 3.12 installed, the ability to install packages using [pip](<https://pip.pypa.io/en/stable/>), and [Docker](<https://www.docker.com/>) or other container-building software installed locally. In addition, these instructions will recommend that you work in [virtual environments](<https://virtualenv.pypa.io/en/latest/>), but this isn’t strictly necessary.
  * An AWS account, containing: 
    * Repositories in [Amazon Elastic Container Registry (Amazon ECR)](<https://aws.amazon.com/ecr/>) to hold the images for training and inference containers,
    * Locations in [Amazon Simple Storage Service (Amazon S3)](<https://aws.amazon.com/s3/>) to hold: 
      * The model
      * The training code (if you wish it to be stored in a separate bucket from the model)
      * Keys and ciphertexts

We suggest you follow the [security best practices for Amazon S3](<https://docs.aws.amazon.com/AmazonS3/latest/userguide/security-best-practices.html>).

  * Roles in AWS Identity and Access Management (IAM) for 
    * The model creator
    * The inference endpoint creator
    * The inference endpoint itself
    * The clients

Find IAM policies for these roles, along with a worked example for the [MNIST corpus of handwritten digits,](https://www.kaggle.com/datasets/hojjatk/mnist-dataset) in the repository of [sample code.](https://github.com/aws-samples/sample-end-to-end-encrypted-ml-inference-with-amazon-sagemaker-ai-and-fhe/tree/main)

## 深度分析

### 1. 数学安全与硬件安全的根本性差异
FHE 的安全性建立在纯数学基础上，而非依赖硬件隔离。与 AWS Nitro Enclaves 等机密计算环境不同，FHE 下查询在整个推理过程中始终保持密文状态——即使 SageMaker AI 本身也无法访问明文数据。这意味着防御边界不涉及 CPU 或内存隔离，而是密码学本身。两者可互补使用，形成分层防护体系。

### 2. 量化是 FHE 推理从"理论可行"走向"工程落地"的关键杠杆
文章实测数据显示：未经量化时 FHE 推理慢 plaintext 约 100,000 倍；通过量化（quantization）将开销压缩至 2800 倍（67ms → 187s，ml.m5.xlarge）；增加 vCPU 后进一步降至约 500 倍（46s，ml.m5.24xlarge）。量化在普通 ML 中已是常见优化，但在 FHE 场景下对性能提升的效果尤为显著，因为它直接减少了同态运算的数值精度开销——且不影响模型准确率（文章明确指出"no observable loss in accuracy"）。

### 3. Concrete-ML 的 API 兼容性大幅降低了 FHE 的应用门槛
Concrete-ML 与 scikit-learn API 兼容，模型所有者无需学习底层 FHE 密码学细节即可将现有 sklearn 工作流迁移至 FHE 模式。训练阶段仍使用 plaintext 数据，仅在部署时启用 FHE 运算，这使得隐私保护 ML 的端到端路径对数据科学家友好。

### 4. S3 中转架构反映了 FHE 与云服务 API 约束的深层冲突
由于 FHE 密文大小远超 SageMaker AI API 的查询限制，客户端与端点之间的密文交换必须绕道 Amazon S3。这说明 FHE 推理不是简单地替换一个 API 端点，而需要重新设计客户端-服务端通信协议，增加了系统架构复杂度。

### 5. FHE 不保护模型本身——安全边界需重新评估
文章明确指出：Concrete-ML 不加密模型参数，模型对 SageMaker AI 可见，且可能受到"模型窃取"攻击。这一警告常被忽视——企业在评估 FHE 方案时若只关注查询/响应的隐私性，会错误估计模型资产的暴露风险。此外，Concrete-ML 不提供电路隐私（circuit privacy），密文可能泄露模型信息。

---

## 实践启示

### 1. 量化是 FHE 推理的必选项，而非可选项
在生产部署中，必须在训练脚本中应用 quantization 参数。未经量化的 FHE 推理延迟在交互式场景中完全不可接受。建议将量化与 FHE 转换绑定为标准部署流程的一部分，并针对目标实例规格（如 ml.m5.24xlarge）做基准测试。

### 2. 采用异步推理模式并配置足够的等待超时
FHE 推理延迟可达数十秒至分钟量级，必须使用 SageMaker AI 异步推理（AsyncInference）。客户端代码中应配置 `WaiterConfig`，并在异常处理中覆盖 `TimeoutError`。遇到 TimeoutError 时应首先增大 `max_attempts` 或升级至更大实例规格，而非降低 FHE 安全性配置。

### 3. 妥善保管客户端解密后的数据——FHE 安全不覆盖端点侧明文
Concrete-ML 的加密与解密配对若使用不当，可能泄露密钥信息。客户端在获取解密后的预测结果后，须按照敏感数据的安全最佳实践进行处理，不得以明文形式写入日志或非加密存储。同时，S3 上非 FHE 密文的数据（包括模型、评估密钥）应启用 S3 默认加密保护静止数据。

### 4. 训练阶段无需 FHE——直接复用现有 sklearn 流程
Concrete-Ml 在训练阶段仍使用 plaintext 数据，训练流程与标准 sklearn 无异。数据科学家可以在不改变工作流的前提下完成 FHE 模型训练，只需在 `FHEModelDev(model_dir, model).save()` 时指定输出路径。预处理（归一化等）须在训练前完成，这部分与普通 ML 相同。

### 5. 商业使用需确认 Zama 许可模式， prototyp ing / 非商业用途可免付费
文章指出 Concrete-ML 对原型验证和非商业用途免费，但商业部署需要商业许可。企业用户在评估成本时，应将 Zama 商业许可费用纳入 TCO 计算，并与合规团队确认数据处理 jurisdiction 是否对加密方案有特定要求。

## 相关实体
- [Build Real Time Voice Applications With Amazon Sagemaker Ai](../ch05/089-ai.html)
- [Fine Tune Llm With Databricks Unity Catalog And Amazon Sagemaker](../ch01/639-fine-tune-llm-with-databricks-unity-catalog-and-amazon-sagem.html)
- [Real Time Voice Agents With Stream Vision Agents And Amazon Nova 2 Sonic](../ch04/058-real-time-voice-agents-with-stream-vision-agents-and-amazon.html)
- [Amazon Bedrock Cross Region Inference Cris Eu Gdpr](ch11/159-amazon-bedrock.html)
- [Overcoming Reward Signal Challenges Verifiable Rewards Based Reinforcement Learn](https://github.com/QianJinGuo/wiki/blob/main/entities/overcoming-reward-signal-challenges-verifiable-rewards-based-reinforcement-learn.md)

---

