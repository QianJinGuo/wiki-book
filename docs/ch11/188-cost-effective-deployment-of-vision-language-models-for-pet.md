# Cost effective deployment of vision-language models for pet behavior detection on AWS Inferentia2

## Ch11.188 Cost effective deployment of vision-language models for pet behavior detection on AWS Inferentia2

> 📊 Level ⭐⭐ | 6.1KB | `entities/cost-effective-deployment-of-vision-language-models-for-pet-behavior-detection-o.md`

> 来源：[原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/cost-effective-deployment-of-vision-language-models-for-pet-behavior-detection-o.md)

## 核心要点
- Tomofun（Furbo 智能宠物相机）将 VLM 推理从 GPU 实例迁移到 AWS Inferentia2
- 使用 BLIP（Bootstrapping Language-Image Pre-training）模型进行宠物行为检测
- 通过 Neuron SDK 编译 PyTorch 模型，保留原有架构，仅添加轻量 wrapper
- 成本降低 83%，同时维持高吞吐量和低延迟

## 深度分析
### 从 GPU 到专用 AI 芯片的迁移动机
Furbo 的业务场景具有典型 IoT 特征：数十万台设备持续产生视频流，需要 7x24 小时实时推理。这种"始终在线"的推理模式与 GPU 的设计初衷（高吞吐量突发处理）存在错配——GPU 按需付费模式在持续低负载下成本效益极低。
Inferentia2 作为 AWS 专用 AI 芯片，专为推理场景优化，提供更具预测性的 pricing model。对比 GPU on-demand 实例，Inferentia2 的成本结构更适合 Furbo 这类规模的持续推理工作负载。

### 模块化编译策略
Tomofun 的技术方案核心不是"重写模型"，而是"编译适配"。BLIP 由三个组件构成：Image Encoder、Text Encoder、Text Decoder。Neuron SDK 的 `torch_neuronx.trace()` 要求固定形状的输入输出 tensor。
他们的方案是：
1. **Wrapper 层**：创建轻量 wrapper 适配 trace API 的 I/O 要求，同时保持原始模型逻辑不变
2. **独立编译**：每个 BLIP 组件单独编译为 `.pt` TorchScript artifact
3. **组装部署**：在推理时通过 wrapper 加载编译后的组件，组装成完整 pipeline
这种方法的优势：

- 保留预训练模型的全部能力（无需重新训练）
- 组件级编译提供灵活性（可单独更新某个组件）
- 代码改动最小化（只需添加 wrapper，不碰核心逻辑）

### 架构设计：双层 Auto Scaling
Furbo 的系统架构采用双层设计：

- **第一层**：API 服务器（EC2 Auto Scaling）处理来自相机的请求，进行初步验证和路由
- **第二层**：Inf2 实例（EC2 Auto Scaling）运行 BLIP 推理
这种分离设计允许独立扩缩容——API 层和推理层有不同的扩展曲线。CloudWatch 指标驱动 Auto Scaling 决策，基于每实例类型的吞吐量基准测试结果。

### 压测结果的关键洞察
压测揭示了几个重要规律：
1. **并发控制是关键**：随着 client 线程增加，延迟先升后稳。超过服务器处理能力后，增加并发反而降低整体吞吐量。正确的做法是通过压测找到最优 concurrency range，然后在生产环境中限制并发。
2. **吞吐量天花板**：Inf2.xlarge（单芯片，32GB）在测试规模下表现稳定，但每个实例的最大并发请求数有限制。扩展策略应基于延迟 SLO 而非单纯增加实例。
3. **83% 成本降低的代价**：文章没有讨论模型精度损失或重新训练的隐性成本。实际迁移时应验证编译后模型的 accuracy 是否在业务可接受范围内。

## 实践启示
1. **始终在线的推理工作负载应评估专用 AI 芯片**：GPU 适合突发性、高吞吐量场景；Inferentia2/TRAINIUM 等专用芯片适合持续低延迟推理。成本模型差异巨大，建议用实际工作负载进行 TCO 对比。
2. **编译优化前先验证 I/O 接口**：Neuron SDK 的 trace API 对输入形状有严格要求。如果现有模型使用动态 shape，早期介入设计固定 shape 的 wrapper 比后期重构要高效得多。
3. **Auto Scaling 应基于实际压测数据**：每个实例类型的吞吐量上限需要通过压测确定，而非理论计算。盲目增加实例数量而不控制并发，可能导致排队延迟恶化。
4. **组件级编译提供升级灵活性**：Tomofun 的方案允许单独更新某个 BLIP 组件。在实际项目中，这意味着一旦有新的预训练模型发布，可以只编译变更的组件，降低升级风险。
5. **考虑 DLC（Deep Learning Containers）简化依赖管理**：文章提到 Tomofun 计划采用 AWS DLC，这可减少自定义环境配置的维护负担，适合希望减少 MLOps 复杂度的团队。
→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/cost-effective-deployment-of-vision-language-models-for-pet-behavior-detection-o.md)

## 相关实体
- [Amazon Nova Lite Fine-Tuning: 高性价比的视觉检测模型微调案例与实践 | 亚马逊AWS官方博客](https://github.com/QianJinGuo/wiki/blob/main/entities/amazon-nova-lite-fine-tuning-cost-effective-vision-detection-model-tuning-case-and-practice.md)
- [Reinforcing Recursive Language Models | alphaXiv](https://github.com/QianJinGuo/wiki/blob/main/entities/reinforcing-recursive-language-models-alphaxiv.md)
- [Language Models and Meaning](https://github.com/QianJinGuo/wiki/blob/main/entities/stochastic-parrot-language-models-and-meaning.md)

→ [原文存档](https://raw.githubusercontent.com/QianJinGuo/wiki/main/raw/articles/aws-sun-finance-ai-id-extraction-fraud-detection.md)

- [Language Models and Meaning](https://github.com/QianJinGuo/wiki/blob/main/entities/stochastic-parrot-language-models-and-meaning.md)
- [llava-onevision-2：全帧率视频理解](https://github.com/QianJinGuo/wiki/blob/main/entities/llava-onevision-2-full-frame-rate-vlm.md)
- [MOC](https://github.com/QianJinGuo/wiki/blob/main/moc/aws-cloud-ai-infrastructure.md)

---

